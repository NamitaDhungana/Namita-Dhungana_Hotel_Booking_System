<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class BookingController extends Controller
{
    // Create new booking
    public function store(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'room_id' => 'required|exists:rooms,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'num_guests' => 'required|integer',
            'total_amount' => 'required|numeric'
        ]);

        // Check availability
        $checkIn = $request->check_in_date;
        $checkOut = $request->check_out_date;

        $exists = Booking::where('room_id', $request->room_id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where('check_in_date', '<', $checkOut)
                      ->where('check_out_date', '>', $checkIn);
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Room is already booked for these dates'], 422);
        }
        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'hotel_id' => $request->hotel_id,
            'room_id' => $request->room_id,
            'booking_reference' => 'BK-' . strtoupper(uniqid()),
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'num_guests' => $request->num_guests,
            'num_adults' => $request->num_adults ?? 1,
            'total_amount' => $request->total_amount,
            'status' => 'pending'
        ]);

        // Create notification
        // ...

        return response()->json($booking, 201);
    }

    // Get user bookings
    public function getUserBookings(Request $request)
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->with(['hotel', 'room', 'room.roomType'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json($bookings);
    }

    // Get all bookings (Admin)
    public function getAllBookings(Request $request)
    {
        $bookings = Booking::with(['user', 'hotel', 'room', 'room.roomType'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings);
    }

    // Get booking details
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'room', 'payment'])->find($id);

        if (!$booking) return response()->json(['message' => 'Not found'], 404);

        // Check ownership
        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    // Cancel booking
    public function cancel(Request $request, $id)
    {
        $booking = Booking::find($id);
        if (!$booking) return response()->json(['message' => 'Not found'], 404);

        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason
        ]);

        return response()->json(['message' => 'Booking cancelled']);
    }

    // Update booking status (Admin)
    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::find($id);
        if (!$booking) return response()->json(['message' => 'Not found'], 404);

        $booking->update(['status' => $request->status]);
        return response()->json($booking);
    }
}
