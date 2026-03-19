<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use App\Models\Booking;
use App\Services\KhaltiService;

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
            if ($payment->payment_status === 'completed') {
                $booking = Booking::find($payment->booking_id);
                return response()->json([
                    'message'        => 'Payment already verified. Booking confirmed.',
                    'status'         => 'completed',
                    'transaction_id' => $payment->transaction_id,
                    'booking_id'     => $payment->booking_id,
                    'booking_status' => $booking?->status,
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

                    // Confirm the booking
                    Booking::where('id', $payment->booking_id)
                        ->update(['status' => 'confirmed']);

                    Log::info('Khalti payment confirmed in DB', [
                        'pidx'           => $pidx,
                        'payment_id'     => $payment->payment_id,
                        'transaction_id' => $data['transaction_id'] ?? null,
                        'booking_id'     => $payment->booking_id,
                    ]);
                });

                session()->forget(['khalti_pidx', 'khalti_order_id', 'khalti_booking_id', 'khalti_payment_id']);

                return response()->json([
                    'message'        => 'Payment verified. Booking confirmed.',
                    'status'         => 'completed',
                    'transaction_id' => $data['transaction_id'] ?? null,
                    'booking_id'     => $payment->booking_id,
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
