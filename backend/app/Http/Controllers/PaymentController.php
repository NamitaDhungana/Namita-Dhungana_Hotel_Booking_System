<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Booking;

class PaymentController extends Controller
{
    // Initiate payment
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric',
            'payment_method' => 'required|in:esewa,khalti,card,cash'
        ]);

        $booking = Booking::find($request->booking_id);
        
        // Ensure booking belongs to user
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Logic to integrate with Esewa/Khalti API would go here
        // For now, we simulate a pending payment record
        
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'transaction_id' => 'TXN-' . uniqid(),
            'payment_date' => now()
        ]);

        return response()->json([
            'message' => 'Payment initiated',
            'payment' => $payment,
            'payment_url' => 'https://sandbox.esewa.com.np/...' // Mock URL
        ]);
    }

    // Verify Payment (e.g. return from gateway)
    public function verifyPayment(Request $request)
    {
        // specific logic to verify signature/token from gateway
        return response()->json(['message' => 'Payment verified']);
    }
}
