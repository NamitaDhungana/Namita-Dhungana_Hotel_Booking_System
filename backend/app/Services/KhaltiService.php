<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\Booking;

class KhaltiService
{
    private string $secretKey;
    private string $initiateUrl;
    private string $lookupUrl;
    private string $returnUrl;

    public function __construct()
    {
        $this->secretKey   = config('services.khalti.secret_key');
        $this->initiateUrl = config('services.khalti.initiate_url');
        $this->lookupUrl   = config('services.khalti.lookup_url');
        $this->returnUrl   = config('services.khalti.return_url');
    }

    /**
     * Initiate a Khalti ePayment for a booking.
     * Returns ['payment_url' => ..., 'pidx' => ..., 'order_id' => ..., 'payment_id' => ...]
     * or throws an exception on failure.
     */
    public function initiate(Booking $booking, $user): array
    {
        $orderId     = 'BOOKING-' . $booking->id . '-' . time();
        $amountPaisa = (int) round($booking->total_amount * 100);

        $payload = [
            'return_url'          => $this->returnUrl,
            'website_url'         => config('app.url'),
            'amount'              => $amountPaisa,
            'purchase_order_id'   => $orderId,
            'purchase_order_name' => 'Hotel Booking #' . $booking->booking_reference,
            'customer_info'       => [
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '9800000000',
            ],
            'amount_breakdown' => [
                ['label' => 'Room Charge', 'amount' => $amountPaisa],
            ],
            'product_details' => [
                [
                    'identity'    => (string) $booking->id,
                    'name'        => 'Room at ' . ($booking->hotel->name ?? 'Hotel'),
                    'total_price' => $amountPaisa,
                    'quantity'    => 1,
                    'unit_price'  => $amountPaisa,
                ],
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Key ' . $this->secretKey,
            'Content-Type'  => 'application/json',
        ])->post($this->initiateUrl, $payload);

        if ($response->failed()) {
            Log::error('Khalti initiation failed', [
                'booking_id' => $booking->id,
                'status'     => $response->status(),
                'body'       => $response->body(),
            ]);
            throw new \RuntimeException('Khalti initiation failed: ' . $response->body(), $response->status());
        }

        $data = $response->json();

        $payment = Payment::create([
            'booking_id'     => $booking->id,
            'user_id'        => $user->id,
            'amount'         => $booking->total_amount,
            'payment_method' => 'khalti',
            'payment_status' => 'pending',
            'pidx'           => $data['pidx'],
            'order_id'       => $orderId,
            'payment_date'   => now(),
        ]);

        // Store in session for reference
        session([
            'khalti_pidx'       => $data['pidx'],
            'khalti_order_id'   => $orderId,
            'khalti_booking_id' => $booking->id,
            'khalti_payment_id' => $payment->payment_id,
        ]);

        Log::info('Khalti payment initiated', [
            'booking_id' => $booking->id,
            'pidx'       => $data['pidx'],
            'order_id'   => $orderId,
        ]);

        return [
            'payment_url' => $data['payment_url'],
            'pidx'        => $data['pidx'],
            'order_id'    => $orderId,
            'payment_id'  => $payment->payment_id,
        ];
    }

    /**
     * Lookup a payment by pidx and update records accordingly.
     * Returns the lookup response data array.
     */
    public function lookup(string $pidx): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Key ' . $this->secretKey,
            'Content-Type'  => 'application/json',
        ])->post($this->lookupUrl, ['pidx' => $pidx]);

        if ($response->failed()) {
            Log::error('Khalti lookup failed', [
                'pidx'   => $pidx,
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException('Khalti lookup failed: ' . $response->body(), $response->status());
        }

        return $response->json();
    }
}
