<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\RoomType;

class RoomController extends Controller
{
    // Get room types for a hotel
    public function getRoomTypes($hotelId)
    {
        $roomTypes = RoomType::where('hotel_id', $hotelId)->get();
        // Calculate availability count - simplified for now
        return response()->json($roomTypes);
    }

    // Get all room types
    public function getAllRoomTypes()
    {
        $roomTypes = RoomType::with(['hotel'])->get();
        return response()->json($roomTypes);
    }

    // Get specific room type details
    public function showRoomType($id)
    {
        $roomType = RoomType::find($id);
        if (!$roomType) return response()->json(['message' => 'Room Type not found'], 404);
        return response()->json($roomType);
    }

    // Create room type (Admin only)
    public function storeRoomType(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'type_name' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'max_occupancy' => 'required|integer',
        ]);

        $roomType = RoomType::create($request->all());
        return response()->json($roomType, 201);
    }

    // Update room type
    public function updateRoomType(Request $request, $id)
    {
        $roomType = RoomType::find($id);
        if (!$roomType) return response()->json(['message' => 'Not found'], 404);
        $roomType->update($request->all());
        return response()->json($roomType);
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

        // Logic to find rooms NOT in bookings for this range
        $checkIn = $request->check_in;
        $checkOut = $request->check_out;

        $availableRooms = Room::where('hotel_id', $request->hotel_id)
            ->where('status', 'available')
            ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                $query->where('status', '!=', 'cancelled')
                      ->where('check_in_date', '<', $checkOut)
                      ->where('check_out_date', '>', $checkIn);
            })
            ->count();

        return response()->json(['available_rooms' => $availableRooms]);
    }

    public function getUnavailableDates($id)
    {
        $roomType = \App\Models\RoomType::findOrFail($id);
        $totalRooms = \App\Models\Room::where('room_type_id', $id)->where('status', 'available')->count();
        
        $unavailableDates = [];
        $startDate = date('Y-m-d'); // Today
        
        // Scan a full year ahead to universally sync the UI calendar
        for ($i = 0; $i < 365; $i++) {
            $checkDate = date('Y-m-d', strtotime("+$i days", strtotime($startDate)));
            
            $bookedCount = \App\Models\Booking::whereHas('room', function($q) use ($id) {
                $q->where('room_type_id', $id);
            })
            ->where('status', '!=', 'cancelled')
            ->where('check_in_date', '<=', $checkDate)
            ->where('check_out_date', '>', $checkDate)
            ->count();
            
            if ($totalRooms == 0 || $bookedCount >= $totalRooms) {
                $unavailableDates[] = $checkDate;
            }
        }
        
        return response()->json($unavailableDates);
    }
}
