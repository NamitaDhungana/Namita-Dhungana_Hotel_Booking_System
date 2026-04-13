<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\User;
use App\Services\KhaltiService;
use App\Mail\BookingConfirmationMail;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    public function __construct(private KhaltiService $khalti) {}

    /**
     * Initiate Khalti ePayment for an existing booking.
     */
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with(['hotel'])->findOrFail($request->booking_id);

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status === 'confirmed') {
            return response()->json(['message' => 'Booking is already confirmed'], 400);
        }

        try {
            $result = $this->khalti->initiate($booking, $request->user());

            return response()->json([
                'message'     => 'Payment initiated. Redirect user to payment_url.',
                'payment_url' => $result['payment_url'],
                'pidx'        => $result['pidx'],
                'order_id'    => $result['order_id'],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => 'Payment initiation failed', 'error' => $e->getMessage()], 502);
        } catch (\Exception $e) {
            Log::error('Khalti initiation exception', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Unexpected error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Verify payment via Khalti lookup API.
     * Called from Khalti return_url (?pidx=...) or by the frontend.
     * Wrapped in a DB transaction — payment update + booking confirm are atomic.
     * Idempotent: safe to call multiple times for the same pidx.
     */
    public function verifyPayment(Request $request)
    {
        $pidx = $request->query('pidx') ?? $request->input('pidx');

        if (!$pidx) {
            return response()->json(['message' => 'Missing pidx parameter'], 400);
        }

        try {
            // 1. Find the payment record first — fail fast if not found
            $payment = Payment::where('pidx', $pidx)->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment record not found for this pidx'], 404);
            }

            // 2. If already completed, return success immediately (idempotent)
            // Also ensure any sibling bookings in the group are confirmed (handles past stuck cases)
            if ($payment->payment_status === 'completed') {
                $booking = Booking::find($payment->booking_id);
                if ($booking?->group_booking_reference) {
                    Booking::where('group_booking_reference', $booking->group_booking_reference)
                        ->where('id', '!=', $booking->id)
                        ->whereIn('status', ['pending', 'reserved'])
                        ->update(['status' => 'confirmed']);
                }
                return response()->json([
                    'message'                 => 'Payment already verified. Booking confirmed.',
                    'status'                  => 'completed',
                    'transaction_id'          => $payment->transaction_id,
                    'booking_id'              => $payment->booking_id,
                    'booking_status'          => $booking?->status,
                    'group_booking_reference' => $booking?->group_booking_reference,
                ]);
            }

            // 3. Call Khalti lookup API
            $data = $this->khalti->lookup($pidx);

            Log::info('Khalti lookup response', ['pidx' => $pidx, 'data' => $data]);

            $khaltiStatus = $data['status'] ?? 'Unknown';

            // 4. Handle Completed — wrap in transaction
            if ($khaltiStatus === 'Completed') {
                DB::transaction(function () use ($payment, $data, $pidx) {
                    // Update payment record
                    $payment->payment_status           = 'completed';
                    $payment->transaction_id           = $data['transaction_id'] ?? null;
                    $payment->payment_gateway_response = $data;
                    $payment->payment_date             = now();
                    $payment->save();

                    // Confirm the anchor booking
                    $anchorBooking = Booking::find($payment->booking_id);
                    $anchorBooking->update(['status' => 'confirmed']);

                    // Also confirm all sibling bookings in the same group (multi-room booking)
                    if ($anchorBooking->group_booking_reference) {
                        Booking::where('group_booking_reference', $anchorBooking->group_booking_reference)
                            ->where('id', '!=', $anchorBooking->id)
                            ->whereIn('status', ['pending', 'reserved'])
                            ->update(['status' => 'confirmed']);
                    }

                    Log::info('Khalti payment confirmed in DB', [
                        'pidx'                    => $pidx,
                        'payment_id'              => $payment->payment_id,
                        'transaction_id'          => $data['transaction_id'] ?? null,
                        'booking_id'              => $payment->booking_id,
                        'group_booking_reference' => $anchorBooking->group_booking_reference,
                    ]);
                });

                session()->forget(['khalti_pidx', 'khalti_order_id', 'khalti_booking_id', 'khalti_payment_id']);

                // Send booking confirmation email after successful payment
                try {
                    $confirmedBooking = Booking::with(['hotel.admin.user', 'payment'])->find($payment->booking_id);
                    $bookingUser = User::find($confirmedBooking->user_id);
                    if ($confirmedBooking && $bookingUser) {
                        // Email to customer
                        Mail::to($bookingUser->email)->send(
                            new BookingConfirmationMail($confirmedBooking, $bookingUser, $confirmedBooking->hotel)
                        );
                        // Email to hotel admin
                        $hotelAdmin = $confirmedBooking->hotel?->admin?->user;
                        if ($hotelAdmin && $hotelAdmin->email) {
                            Mail::to($hotelAdmin->email)->send(
                                new \App\Mail\HotelBookingNotificationMail($confirmedBooking, $bookingUser, $confirmedBooking->hotel)
                            );
                            // In-app notification to hotel manager
                            \App\Models\Notification::create([
                                'user_id' => $hotelAdmin->id,
                                'type'    => 'new_booking',
                                'title'   => 'New Booking Confirmed',
                                'message' => "New booking from {$bookingUser->name} for {$confirmedBooking->hotel->name}. Check-in: {$confirmedBooking->check_in_date}, Check-out: {$confirmedBooking->check_out_date}. Ref: {$confirmedBooking->booking_reference}.",
                                'is_read' => false,
                                'related_booking_id' => $confirmedBooking->id,
                            ]);
                        }
                    }
                } catch (\Exception $mailEx) {
                    Log::error('Booking confirmation mail failed after payment: ' . $mailEx->getMessage());
                }

                $confirmedAnchor = Booking::find($payment->booking_id);
                return response()->json([
                    'message'                 => 'Payment verified. Booking confirmed.',
                    'status'                  => 'completed',
                    'transaction_id'          => $data['transaction_id'] ?? null,
                    'booking_id'              => $payment->booking_id,
                    'group_booking_reference' => $confirmedAnchor?->group_booking_reference,
                ]);
            }

            // 5. Handle failed/expired/cancelled
            if (in_array($khaltiStatus, ['Failed', 'Expired', 'Refunded', 'User canceled'])) {
                $payment->payment_status           = 'failed';
                $payment->payment_gateway_response = $data;
                $payment->save();

                Log::warning('Khalti payment not completed', ['pidx' => $pidx, 'status' => $khaltiStatus]);

                return response()->json([
                    'message' => 'Payment was not completed.',
                    'status'  => strtolower(str_replace(' ', '_', $khaltiStatus)),
                ], 400);
            }

            // 6. Still pending
            return response()->json([
                'message' => 'Payment is still pending.',
                'status'  => strtolower($khaltiStatus),
            ], 202);

        } catch (\RuntimeException $e) {
            return response()->json(['message' => 'Payment verification failed', 'error' => $e->getMessage()], 502);
        } catch (\Exception $e) {
            Log::error('Khalti verification exception', ['pidx' => $pidx ?? 'unknown', 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Unexpected error', 'error' => $e->getMessage()], 500);
        }
    }
}
