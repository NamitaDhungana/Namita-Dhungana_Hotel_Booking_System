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

        $roomTypes = $query->get();

        // Attach first available room image to each room type
        $roomTypes->each(function ($rt) {
            $rt->room_image_url = \App\Models\Room::where('room_type_id', $rt->id)
                ->whereNotNull('image_url')
                ->value('image_url');
        });

        return response()->json($roomTypes);
    }

    // Get all individual rooms (admin-scoped)
    public function getRooms(Request $request)
    {
        $query = Room::with(['hotel', 'roomType']);

        if ($request->user() && $request->user()->role === 'admin') {
            $admin = \App\Models\Admin::where('user_id', $request->user()->id)->first();
            if ($admin) {
                $query->whereHas('hotel', fn($q) => $q->where('admin_id', $admin->id));
            }
        }

        return response()->json($query->orderBy('hotel_id')->orderBy('room_number')->get());
    }

    // Delete individual room
    public function destroyRoom(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) return response()->json(['message' => 'Room not found'], 404);

        // Prevent deletion if room has active bookings
        $hasActive = $room->bookings()
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->exists();

        if ($hasActive) {
            return response()->json(['message' => 'Cannot delete a room with active bookings'], 422);
        }

        $room->delete();
        return response()->json(['message' => 'Room deleted']);
    }

    // Get specific room type details
    public function showRoomType($id)
    {
        $roomType = RoomType::with(['hotel:id,name,city,featured_image'])->find($id);
        if (!$roomType) return response()->json(['message' => 'Room Type not found'], 404);

        // Attach first available room image
        $firstRoom = \App\Models\Room::where('room_type_id', $id)
            ->whereNotNull('image_url')
            ->value('image_url');
        $roomType->room_image_url = $firstRoom;

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

        $data = $request->except('quantity');
        $data['max_children'] = $request->input('max_children') ?? 0;
        $data['max_adults']   = $request->input('max_adults') ?? 1;

        $roomType = RoomType::create($data);

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

        $data = $request->except('quantity');
        if (array_key_exists('max_children', $data) && $data['max_children'] === null) {
            $data['max_children'] = 0;
        }
        $roomType->update($data);
        return response()->json($roomType->loadCount('rooms'));
    }

    // Add individual room
    public function storeRoom(Request $request)
    {
        $request->validate([
            'hotel_id'     => 'required|exists:hotels,id',
            'room_type_id' => 'required|exists:room_types,id',
            'room_number'  => [
                'required',
                'string',
                \Illuminate\Validation\Rule::unique('rooms')->where('hotel_id', $request->hotel_id),
            ],
            'floor'        => 'nullable|integer',
            'image_url'    => 'nullable|string',
            'notes'        => 'nullable|string',
        ], [
            'room_number.unique' => 'Room number already exists in this hotel.',
        ]);

        $room = Room::create($request->only(['hotel_id', 'room_type_id', 'room_number', 'floor', 'image_url', 'notes']));
        return response()->json($room->load('roomType'), 201);
    }

    // Update individual room (status, image, notes)
    public function updateRoom(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) return response()->json(['message' => 'Not found'], 404);

        $request->validate([
            'room_number'  => [
                'sometimes',
                'string',
                \Illuminate\Validation\Rule::unique('rooms')->where('hotel_id', $room->hotel_id)->ignore($id),
            ],
            'room_type_id' => 'sometimes|exists:room_types,id',
            'floor'        => 'nullable|integer',
            'status'       => 'sometimes|in:available,occupied,maintenance',
            'image_url'    => 'nullable|string',
            'notes'        => 'nullable|string',
        ], [
            'room_number.unique' => 'Room number already exists in this hotel.',
        ]);

        $room->update($request->only(['room_type_id', 'room_number', 'floor', 'status', 'image_url', 'notes']));
        return response()->json($room->load('roomType'));
    }

    // Get single room details (for customer room detail page)
    public function showRoom($id)
    {
        $room = Room::with(['roomType.hotel', 'hotel'])->find($id);
        if (!$room) return response()->json(['message' => 'Room not found'], 404);
        return response()->json($room);
    }

    // Check room availability (per hotel)
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

    // Global room search across all hotels
    public function searchAvailableRooms(Request $request)
    {
        $request->validate([
            'check_in'  => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'guests'    => 'nullable|integer|min:1',
        ]);

        $checkIn  = $request->check_in;
        $checkOut = $request->check_out;
        $guests   = $request->guests ?? 1;

        $rooms = Room::with(['roomType.hotel', 'hotel'])
            ->where('status', 'available')
            ->whereHas('roomType', function ($q) use ($guests) {
                $q->where('max_occupancy', '>=', $guests);
            })
            ->whereDoesntHave('bookings', function ($q) use ($checkIn, $checkOut) {
                $q->whereIn('status', ['confirmed', 'reserved', 'checked_in'])
                  ->where('check_in_date', '<', $checkOut)
                  ->where('check_out_date', '>', $checkIn);
            })
            ->get();

        return response()->json($rooms);
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
            ->whereIn('status', ['confirmed', 'reserved', 'checked_in', 'checked_out'])
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
