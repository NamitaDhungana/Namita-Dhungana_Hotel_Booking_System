<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\RoomType;

class RoomController extends Controller
{
    // Get room types for a hotel — with optional filters
    public function getRoomTypes(Request $request, $hotelId)
    {
        $query = RoomType::where('hotel_id', $hotelId)->with(['hotel']);

        // Price filter
        if ($request->has('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Capacity filter
        if ($request->has('min_guests')) {
            $query->where('max_occupancy', '>=', $request->min_guests);
        }

        // Amenity/feature filter (JSON column contains value)
        if ($request->has('amenity')) {
            $query->whereJsonContains('amenities', $request->amenity);
        }

        return response()->json($query->get());
    }

    // Get all room types (admin sees only their hotels' rooms)
    public function getAllRoomTypes(Request $request)
    {
        $query = \App\Models\RoomType::with(['hotel'])->withCount('rooms');

        // If authenticated admin, filter to their hotels only
        if ($request->user() && in_array($request->user()->role, ['admin'])) {
            $admin = \App\Models\Admin::where('user_id', $request->user()->id)->first();
            if ($admin) {
                $query->whereHas('hotel', fn($q) => $q->where('admin_id', $admin->id));
            }
        }

        return response()->json($query->get());
    }

    // Get specific room type details
    public function showRoomType($id)
    {
        $roomType = RoomType::with(['hotel'])->find($id);
        if (!$roomType) return response()->json(['message' => 'Room Type not found'], 404);
        return response()->json($roomType);
    }

    // Create room type (Admin only)
    public function storeRoomType(Request $request)
    {
        $request->validate([
            'hotel_id'      => 'required|exists:hotels,id',
            'type_name'     => 'required|string',
            'base_price'    => 'required|numeric|min:0',
            'max_occupancy' => 'required|integer|min:1',
            'area_sqft'     => 'nullable|numeric|min:0',
            'max_adults'    => 'nullable|integer|min:1',
            'max_children'  => 'nullable|integer|min:0',
            'description'   => 'nullable|string',
            'quantity'      => 'nullable|integer|min:1',
        ]);

        $roomType = RoomType::create($request->except('quantity'));

        // Auto-create individual room records based on quantity
        $quantity = $request->quantity ?? 1;
        for ($i = 1; $i <= $quantity; $i++) {
            Room::create([
                'hotel_id'     => $request->hotel_id,
                'room_type_id' => $roomType->id,
                'room_number'  => strtoupper(substr(preg_replace('/\s+/', '', $request->type_name), 0, 3)) . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status'       => 'available',
            ]);
        }

        return response()->json($roomType->loadCount('rooms'), 201);
    }

    // Update room type
    public function updateRoomType(Request $request, $id)
    {
        $roomType = RoomType::find($id);
        if (!$roomType) return response()->json(['message' => 'Not found'], 404);

        $request->validate([
            'base_price'    => 'sometimes|numeric|min:0',
            'max_occupancy' => 'sometimes|integer|min:1',
            'area_sqft'     => 'nullable|numeric|min:0',
            'max_adults'    => 'nullable|integer|min:1',
            'max_children'  => 'nullable|integer|min:0',
        ]);

        $roomType->update($request->except('quantity'));
        return response()->json($roomType->loadCount('rooms'));
    }

    // Add individual room
    public function storeRoom(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'room_type_id' => 'required|exists:room_types,id',
            'room_number' => 'required|string',
        ]);

        $room = Room::create($request->all());
        return response()->json($room, 201);
    }

    // Update room status
    public function updateRoomStatus(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) return response()->json(['message' => 'Not found'], 404);
        
        $request->validate(['status' => 'required|in:available,occupied,maintenance']);
        $room->update(['status' => $request->status]);
        return response()->json($room);
    }

    // Check room availability
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $checkIn  = $request->check_in;
        $checkOut = $request->check_out;

        $availableRooms = Room::where('hotel_id', $request->hotel_id)
            ->where('status', 'available')
            ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                $query->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
                      ->where('check_in_date', '<', $checkOut)
                      ->where('check_out_date', '>', $checkIn);
            })
            ->count();

        return response()->json(['available_rooms' => $availableRooms]);
    }

    public function getUnavailableDates($id)
    {
        $totalRooms = \App\Models\Room::where('room_type_id', $id)
            ->where('status', 'available')
            ->count();

        // If no rooms exist at all, block everything
        if ($totalRooms === 0) {
            $unavailableDates = [];
            for ($i = 0; $i < 365; $i++) {
                $unavailableDates[] = date('Y-m-d', strtotime("+$i days"));
            }
            return response()->json($unavailableDates);
        }

        // Fetch all confirmed/active bookings for this room type in the next year
        $rangeStart = date('Y-m-d');
        $rangeEnd   = date('Y-m-d', strtotime('+365 days'));

        $bookings = \App\Models\Booking::whereHas('room', function ($q) use ($id) {
                $q->where('room_type_id', $id);
            })
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->where('check_out_date', '>', $rangeStart)
            ->where('check_in_date', '<', $rangeEnd)
            ->get(['check_in_date', 'check_out_date', 'room_id']);

        // Count how many rooms are booked per date
        $bookedPerDate = [];
        foreach ($bookings as $booking) {
            $cursor = strtotime($booking->check_in_date);
            $end    = strtotime($booking->check_out_date);
            while ($cursor < $end) {
                $d = date('Y-m-d', $cursor);
                $bookedPerDate[$d] = ($bookedPerDate[$d] ?? 0) + 1;
                $cursor = strtotime('+1 day', $cursor);
            }
        }

        // A date is unavailable only when ALL rooms are booked
        $unavailableDates = [];
        for ($i = 0; $i < 365; $i++) {
            $d = date('Y-m-d', strtotime("+$i days"));
            if (($bookedPerDate[$d] ?? 0) >= $totalRooms) {
                $unavailableDates[] = $d;
            }
        }

        return response()->json($unavailableDates);
    }
}
