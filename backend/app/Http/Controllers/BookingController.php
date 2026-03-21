<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmationMail;
use App\Services\KhaltiService;

class BookingController extends Controller
{
    public function __construct(private KhaltiService $khalti) {}

    // Create new booking
    public function store(Request $request)
    {
        $request->validate([
            'hotel_id'       => 'required|exists:hotels,id',
            'room_type_id'   => 'required|exists:room_types,id',
            'check_in_date'  => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'num_guests'     => 'required|integer|min:1',
            'total_amount'   => 'required|numeric',
            'payment_method' => 'nullable|in:khalti,cash,card',
        ]);

        $checkIn  = $request->check_in_date;
        $checkOut = $request->check_out_date;

        try {
            $booking = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $checkIn, $checkOut) {
                // Expire stale pending bookings (>30 min, unpaid) for this room type
                \App\Models\Booking::whereHas('room', function ($q) use ($request) {
                        $q->where('room_type_id', $request->room_type_id);
                    })
                    ->where('status', 'pending')
                    ->where('created_at', '<', now()->subMinutes(30))
                    ->update(['status' => 'cancelled']);

                // Block confirmed + recent pending (within 30 min payment window)
                $availableRoom = \App\Models\Room::where('hotel_id', $request->hotel_id)
                    ->where('room_type_id', $request->room_type_id)
                    ->where('status', 'available')
                    ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                        $query->where(function ($q) {
                                // Always block confirmed/active bookings
                                $q->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
                                  ->orWhere(function ($q2) {
                                      // Also block recent pending (payment in progress)
                                      $q2->where('status', 'pending')
                                         ->where('created_at', '>=', now()->subMinutes(30));
                                  });
                            })
                              ->where('check_in_date', '<', $checkOut)
                              ->where('check_out_date', '>', $checkIn);
                    })
                    ->lockForUpdate()
                    ->first();

                if (!$availableRoom) {
                    throw new \Exception('No available rooms for the selected dates. Another user may have just booked it.');
                }

                return Booking::create([
                    'user_id'           => $request->user()->id,
                    'hotel_id'          => $request->hotel_id,
                    'room_id'           => $availableRoom->id,
                    'booking_reference' => 'BK-' . strtoupper(uniqid()),
                    'check_in_date'     => $checkIn,
                    'check_out_date'    => $checkOut,
                    'num_guests'        => $request->num_guests,
                    'num_adults'        => $request->num_adults ?? 1,
                    'total_amount'      => $request->total_amount,
                    'status'            => 'pending',
                ]);
            });

            // If payment_method is khalti, auto-initiate and return payment_url
            if ($request->payment_method === 'khalti') {
                try {
                    $booking->load('hotel');
                    $khaltiResult = $this->khalti->initiate($booking, $request->user());

                    return response()->json([
                        'message'        => 'Booking created. Complete payment via Khalti.',
                        'booking'        => $booking,
                        'payment_method' => 'khalti',
                        'payment_url'    => $khaltiResult['payment_url'],
                        'pidx'           => $khaltiResult['pidx'],
                        'order_id'       => $khaltiResult['order_id'],
                    ], 201);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Khalti auto-initiate failed after booking', [
                        'booking_id' => $booking->id,
                        'error'      => $e->getMessage(),
                    ]);
                    // Booking is created but payment initiation failed — return booking with error hint
                    return response()->json([
                        'message'        => 'Booking created but Khalti initiation failed. Retry payment.',
                        'booking'        => $booking,
                        'payment_method' => 'khalti',
                        'payment_error'  => $e->getMessage(),
                    ], 201);
                }
            }

            return response()->json($booking, 201);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
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

    // Get all bookings (Admin — scoped to own hotels; Super Admin — all)
    public function getAllBookings(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'super_admin') {
            $bookings = Booking::with(['user', 'hotel', 'room', 'room.roomType'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $admin = \App\Models\Admin::where('user_id', $user->id)->first();
            if (!$admin) {
                return response()->json(['message' => 'Admin record not found'], 403);
            }
            $hotelIds = \App\Models\Hotel::where('admin_id', $admin->id)->pluck('id');
            $bookings = Booking::with(['user', 'hotel', 'room', 'room.roomType'])
                ->whereIn('hotel_id', $hotelIds)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($bookings);
    }

    // Get booking details
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'room', 'payment'])->find($id);

        if (!$booking) return response()->json(['message' => 'Not found'], 404);

        // Check ownership
        if ($request->user()->id !== $booking->user_id && !in_array($request->user()->role, ['admin', 'super_admin'])) {
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
