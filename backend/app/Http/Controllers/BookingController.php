<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmationMail;
use App\Mail\BookingCancellationMail;
use App\Mail\CheckInMail;
use App\Mail\CheckOutMail;
use App\Services\KhaltiService;

class BookingController extends Controller
{
    public function __construct(private KhaltiService $khalti) {}

    // Create new booking
    public function store(Request $request)
    {
        // Check if website is shut down
        if (\App\Models\SystemSetting::get('shutdown_website') === '1') {
            return response()->json(['message' => 'Bookings are currently disabled. The website is under maintenance.'], 503);
        }

        $request->validate([
            'hotel_id'             => 'required|exists:hotels,id',
            'room_type_id'         => 'required|exists:room_types,id',
            'check_in_date'        => 'required|date|after_or_equal:today',
            'check_out_date'       => 'required|date|after:check_in_date',
            'num_guests'           => 'required|integer|min:1',
            'total_amount'         => 'required|numeric',
            'payment_method'       => 'nullable|in:khalti,cash,card',
            'is_reservation'       => 'nullable|boolean',
            'cancellation_policy'  => 'nullable|in:flexible,24_hours,non_refundable',
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

                // Block confirmed + reserved + recent pending (within 30 min payment window)
                $availableRoom = \App\Models\Room::where('hotel_id', $request->hotel_id)
                    ->where('room_type_id', $request->room_type_id)
                    ->where('status', 'available')
                    ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                        $query->where(function ($q) {
                                // Always block confirmed/active/reserved bookings
                                $q->whereIn('status', ['confirmed', 'reserved', 'checked_in', 'checked_out'])
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
                    throw new \Exception('No available rooms for the selected dates. All rooms of this type are fully booked.');
                }

                return Booking::create([
                    'user_id'              => $request->user()->id,
                    'hotel_id'             => $request->hotel_id,
                    'room_id'              => $availableRoom->id,
                    'booking_reference'    => 'BK-' . strtoupper(uniqid()),
                    'check_in_date'        => $checkIn,
                    'check_out_date'       => $checkOut,
                    'num_guests'           => $request->num_guests,
                    'num_adults'           => $request->num_adults ?? 1,
                    'total_amount'         => $request->total_amount,
                    'payment_method'       => $request->payment_method ?? null,
                    'status'               => ($request->is_reservation || $request->payment_method === 'cash') ? 'reserved' : 'pending',
                    'cancellation_policy'  => $request->cancellation_policy ?? 'flexible',
                ]);
            });

            // Cash reservation — room is held, pay at hotel
            if ($request->payment_method === 'cash' || $request->is_reservation) {
                // Notify hotel manager of new reservation
                try {
                    $booking->load('hotel.admin.user');
                    $hotelAdmin = $booking->hotel?->admin?->user;
                    if ($hotelAdmin) {
                        \App\Models\Notification::create([
                            'user_id' => $hotelAdmin->id,
                            'type'    => 'new_booking',
                            'title'   => 'New Reservation',
                            'message' => "New cash reservation from {$request->user()->name} for {$booking->hotel->name}. Check-in: {$booking->check_in_date}, Check-out: {$booking->check_out_date}. Ref: {$booking->booking_reference}.",
                            'is_read' => false,
                            'related_booking_id' => $booking->id,
                        ]);
                    }
                } catch (\Exception $e) {}

                return response()->json([
                    'message'        => 'Room reserved successfully. Please pay at the hotel on check-in.',
                    'booking'        => $booking,
                    'payment_method' => 'cash',
                    'is_reservation' => true,
                ], 201);
            }

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

    // Create multiple bookings at once (multi-room booking)
    public function storeMulti(Request $request)
    {
        if (\App\Models\SystemSetting::get('shutdown_website') === '1') {
            return response()->json(['message' => 'Bookings are currently disabled. The website is under maintenance.'], 503);
        }

        $request->validate([
            'rooms'                  => 'required|array|min:1|max:10',
            'rooms.*.hotel_id'       => 'required|exists:hotels,id',
            'rooms.*.room_type_id'   => 'required|exists:room_types,id',
            'rooms.*.num_guests'     => 'required|integer|min:1',
            'rooms.*.total_amount'   => 'required|numeric',
            'check_in_date'          => 'required|date|after_or_equal:today',
            'check_out_date'         => 'required|date|after:check_in_date',
            'payment_method'         => 'nullable|in:khalti,cash,card',
            'is_reservation'         => 'nullable|boolean',
            'cancellation_policy'    => 'nullable|in:flexible,24_hours,non_refundable',
        ]);

        // All rooms must belong to the same hotel
        $hotelIds = collect($request->rooms)->pluck('hotel_id')->unique();
        if ($hotelIds->count() > 1) {
            return response()->json([
                'message' => 'All rooms in a multi-room booking must belong to the same hotel. Please book rooms from different hotels separately.',
            ], 422);
        }

        $checkIn  = $request->check_in_date;
        $checkOut = $request->check_out_date;
        $groupRef = 'GRP-' . strtoupper(uniqid());

        try {
            $bookings = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $checkIn, $checkOut, $groupRef) {
                $created = [];

                foreach ($request->rooms as $roomRequest) {
                    // Expire stale pending bookings for this room type
                    \App\Models\Booking::whereHas('room', function ($q) use ($roomRequest) {
                            $q->where('room_type_id', $roomRequest['room_type_id']);
                        })
                        ->where('status', 'pending')
                        ->where('created_at', '<', now()->subMinutes(30))
                        ->update(['status' => 'cancelled']);

                    // Exclude already-locked rooms in this same transaction
                    $lockedRoomIds = collect($created)->pluck('room_id')->toArray();

                    $availableRoom = \App\Models\Room::where('hotel_id', $roomRequest['hotel_id'])
                        ->where('room_type_id', $roomRequest['room_type_id'])
                        ->where('status', 'available')
                        ->when(!empty($lockedRoomIds), fn($q) => $q->whereNotIn('id', $lockedRoomIds))
                        ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                            $query->where(function ($q) {
                                    $q->whereIn('status', ['confirmed', 'reserved', 'checked_in', 'checked_out'])
                                      ->orWhere(function ($q2) {
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
                        // Give a clear, user-friendly message
                        $typeName = \App\Models\RoomType::find($roomRequest['room_type_id'])?->type_name ?? 'selected type';
                        throw new \Exception("No available rooms of type \"{$typeName}\" for {$checkIn} – {$checkOut}. All rooms of this type are fully booked on those dates.");
                    }

                    $created[] = Booking::create([
                        'user_id'                 => $request->user()->id,
                        'hotel_id'                => $roomRequest['hotel_id'],
                        'room_id'                 => $availableRoom->id,
                        'booking_reference'       => 'BK-' . strtoupper(uniqid()),
                        'group_booking_reference' => $groupRef,
                        'check_in_date'           => $checkIn,
                        'check_out_date'          => $checkOut,
                        'num_guests'              => $roomRequest['num_guests'],
                        'num_adults'              => $roomRequest['num_adults'] ?? 1,
                        'total_amount'            => $roomRequest['total_amount'],
                        'payment_method'          => $request->payment_method ?? null,
                        'status'                  => ($request->is_reservation || $request->payment_method === 'cash') ? 'reserved' : 'pending',
                        'cancellation_policy'     => $request->cancellation_policy ?? 'flexible',
                    ]);
                }

                return $created;
            });

            $totalAmount = collect($bookings)->sum('total_amount');

            // Cash / reservation
            if ($request->payment_method === 'cash' || $request->is_reservation) {
                return response()->json([
                    'message'                 => count($bookings) . ' room(s) reserved. Pay at the hotel on check-in.',
                    'bookings'                => $bookings,
                    'group_booking_reference' => $groupRef,
                    'payment_method'          => 'cash',
                    'is_reservation'          => true,
                ], 201);
            }

            // Khalti — initiate a single payment for the combined total
            if ($request->payment_method === 'khalti') {
                try {
                    // Use the first booking as the anchor for Khalti, override amount with total
                    $anchorBooking = $bookings[0];
                    $anchorBooking->load('hotel');
                    $anchorBooking->total_amount = $totalAmount; // pass combined total to Khalti
                    $khaltiResult = $this->khalti->initiate($anchorBooking, $request->user());

                    return response()->json([
                        'message'                 => 'Bookings created. Complete payment via Khalti.',
                        'bookings'                => $bookings,
                        'group_booking_reference' => $groupRef,
                        'payment_method'          => 'khalti',
                        'payment_url'             => $khaltiResult['payment_url'],
                        'pidx'                    => $khaltiResult['pidx'],
                        'order_id'                => $khaltiResult['order_id'],
                        'total_amount'            => $totalAmount,
                    ], 201);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Khalti multi-booking initiation failed', [
                        'group_ref' => $groupRef,
                        'error'     => $e->getMessage(),
                    ]);
                    return response()->json([
                        'message'                 => 'Bookings created but Khalti initiation failed. Retry payment.',
                        'bookings'                => $bookings,
                        'group_booking_reference' => $groupRef,
                        'payment_method'          => 'khalti',
                        'payment_error'           => $e->getMessage(),
                    ], 201);
                }
            }

            return response()->json([
                'bookings'                => $bookings,
                'group_booking_reference' => $groupRef,
            ], 201);

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

        $query = Booking::with(['user', 'hotel', 'room', 'room.roomType'])
            ->orderBy('created_at', 'desc');

        if ($user->role !== 'super_admin') {
            $admin = \App\Models\Admin::where('user_id', $user->id)->first();
            if (!$admin) {
                return response()->json(['message' => 'Admin record not found'], 403);
            }
            $hotelIds = \App\Models\Hotel::where('admin_id', $admin->id)->pluck('id');
            $query->whereIn('hotel_id', $hotelIds);
        }

        // Search by guest name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by check-in date range
        if ($request->filled('check_in_from')) {
            $query->where('check_in_date', '>=', $request->check_in_from);
        }
        if ($request->filled('check_in_to')) {
            $query->where('check_in_date', '<=', $request->check_in_to);
        }

        $perPage = $request->input('per_page', 15);
        return response()->json($query->paginate($perPage));
    }

    // Get booking details
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'room', 'room.roomType', 'payment', 'user'])->find($id);

        if (!$booking) return response()->json(['message' => 'Not found'], 404);

        // Check ownership
        if ($request->user()->id !== $booking->user_id && !in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    // Cancel booking (customer-initiated, policy-enforced)
    // Pass ?check_only=1 or body {check_only: true} to just check eligibility without cancelling
    public function cancel(Request $request, $id)
    {
        $booking = Booking::with('payment')->find($id);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        if ($request->user()->id !== $booking->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $eligibility = $booking->cancellationEligibility();

        // Check-only mode — return eligibility without mutating anything
        if ($request->boolean('check_only') || $request->input('check_only')) {
            return response()->json([
                'eligible'            => $eligibility['allowed'],
                'message'             => $eligibility['message'],
                'cancellation_policy' => $booking->cancellation_policy,
                'check_in_date'       => $booking->check_in_date,
                'status'              => $booking->status,
            ]);
        }

        if (!$eligibility['allowed']) {
            return response()->json([
                'message'             => $eligibility['message'],
                'cancellation_policy' => $booking->cancellation_policy,
                'eligible'            => false,
            ], 422);
        }

        $booking->update([
            'status'              => 'cancelled',
            'cancelled_at'        => now(),
            'cancellation_reason' => $request->input('reason'),
        ]);

        // Send cancellation confirmation email to the customer
        try {
            $booking->load('hotel');
            $user = $request->user();
            if ($booking->hotel) {
                Mail::to($user->email)->send(
                    new BookingCancellationMail($booking->fresh(), $user, $booking->hotel)
                );
            }
        } catch (\Exception $mailEx) {
            \Illuminate\Support\Facades\Log::error('Booking cancellation mail failed: ' . $mailEx->getMessage());
        }

        return response()->json([
            'message'  => 'Your booking has been successfully canceled.',
            'eligible' => true,
            'booking'  => $booking->fresh(),
        ]);
    }

    // Update booking status (Admin)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,reserved,confirmed,checked_in,checked_out,cancelled',
        ]);

        $booking = Booking::with(['user', 'hotel'])->find($id);
        if (!$booking) return response()->json(['message' => 'Not found'], 404);

        $booking->update(['status' => $request->status]);

        // Send email notifications for check-in / check-out
        if ($request->status === 'checked_in') {
            Mail::to($booking->user->email)->send(
                new CheckInMail($booking, $booking->user, $booking->hotel)
            );
            // Notify hotel manager
            try {
                $hotelAdmin = $booking->hotel?->admin?->user;
                if ($hotelAdmin) {
                    \App\Models\Notification::create([
                        'user_id' => $hotelAdmin->id,
                        'type'    => 'booking_status',
                        'title'   => 'Guest Checked In',
                        'message' => "{$booking->user->name} has checked in at {$booking->hotel->name}. Ref: {$booking->booking_reference}.",
                        'is_read' => false,
                        'related_booking_id' => $booking->id,
                    ]);
                }
            } catch (\Exception $e) {}
        } elseif ($request->status === 'checked_out') {
            Mail::to($booking->user->email)->send(
                new CheckOutMail($booking, $booking->user, $booking->hotel)
            );
            // Notify hotel manager
            try {
                $hotelAdmin = $booking->hotel?->admin?->user;
                if ($hotelAdmin) {
                    \App\Models\Notification::create([
                        'user_id' => $hotelAdmin->id,
                        'type'    => 'booking_status',
                        'title'   => 'Guest Checked Out',
                        'message' => "{$booking->user->name} has checked out from {$booking->hotel->name}. Ref: {$booking->booking_reference}.",
                        'is_read' => false,
                        'related_booking_id' => $booking->id,
                    ]);
                }
            } catch (\Exception $e) {}
        }

        return response()->json($booking);
    }
}
