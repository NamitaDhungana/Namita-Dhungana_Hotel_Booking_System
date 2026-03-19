<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     */
    public function verifyPayment(Request $request)
    {
        $pidx = $request->query('pidx') ?? $request->input('pidx');

        if (!$pidx) {
            return response()->json(['message' => 'Missing pidx parameter'], 400);
        }

        try {
            $data = $this->khalti->lookup($pidx);

            Log::info('Khalti lookup response', ['pidx' => $pidx, 'data' => $data]);

            $payment = Payment::where('pidx', $pidx)->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment record not found for pidx'], 404);
            }

            $khaltiStatus = $data['status'] ?? 'Unknown';

            if ($khaltiStatus === 'Completed') {
                $updated = $payment->update([
                    'payment_status'           => 'completed',
                    'transaction_id'           => $data['transaction_id'] ?? null,
                    'payment_gateway_response' => $data,
                    'payment_date'             => now(),
                ]);

                Log::info('Khalti payment DB update result', [
                    'pidx'           => $pidx,
                    'updated'        => $updated,
                    'payment_id'     => $payment->payment_id,
                    'transaction_id' => $data['transaction_id'] ?? null,
                ]);

                Booking::where('id', $payment->booking_id)->update(['status' => 'confirmed']);

                session()->forget(['khalti_pidx', 'khalti_order_id', 'khalti_booking_id', 'khalti_payment_id']);

                Log::info('Khalti payment completed', [
                    'pidx'           => $pidx,
                    'transaction_id' => $data['transaction_id'] ?? null,
                    'booking_id'     => $payment->booking_id,
                ]);

                return response()->json([
                    'message'        => 'Payment verified. Booking confirmed.',
                    'status'         => 'completed',
                    'transaction_id' => $data['transaction_id'] ?? null,
                    'booking_id'     => $payment->booking_id,
                ]);
            }

            if (in_array($khaltiStatus, ['Failed', 'Expired', 'Refunded', 'User canceled'])) {
                $payment->update([
                    'payment_status'           => 'failed',
                    'payment_gateway_response' => $data,
                ]);

                Log::warning('Khalti payment not completed', ['pidx' => $pidx, 'status' => $khaltiStatus]);

                return response()->json([
                    'message' => 'Payment was not completed.',
                    'status'  => strtolower($khaltiStatus),
                ], 400);
            }

            // Pending / Initiated
            return response()->json([
                'message' => 'Payment is still pending.',
                'status'  => strtolower($khaltiStatus),
            ], 202);

        } catch (\RuntimeException $e) {
            return response()->json(['message' => 'Payment verification failed', 'error' => $e->getMessage()], 502);
        } catch (\Exception $e) {
            Log::error('Khalti verification exception', ['pidx' => $pidx, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Unexpected error', 'error' => $e->getMessage()], 500);
        }
    }
}
