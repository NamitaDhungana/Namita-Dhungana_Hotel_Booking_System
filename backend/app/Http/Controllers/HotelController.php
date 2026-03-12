<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hotel;

class HotelController extends Controller
{
    // Get all hotels with filters
    public function index(Request $request)
    {
        $query = Hotel::query();

        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        if ($request->has('type')) {
            $query->where('property_type', $request->type);
        }

        if ($request->has('min_price')) {
            $query->where('base_price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('base_price', '<=', $request->max_price);
        }

        if ($request->has('rating')) {
            $query->where('rating', '>=', $request->rating);
        }

        if ($request->has('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        $hotels = $query->paginate(10);
        return response()->json($hotels);
    }

    // Search hotels (simplified for now)
    public function search(Request $request)
    {
        return $this->index($request);
    }

    // Get single hotel details
    public function show($id)
    {
        $hotel = Hotel::with(['roomTypes', 'reviews', 'images'])->find($id);
        
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }

        return response()->json($hotel);
    }

    // Create new hotel
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'property_type' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $admin = \App\Models\Admin::where('user_id', $request->user()->id)->first();
        
        if (!$admin) {
            return response()->json(['message' => 'User is not an admin'], 403);
        }

        $data = $request->all();
        $data['admin_id'] = $admin->id;
        $data['status'] = 'active'; // Set default status

        $hotel = Hotel::create($data);

        return response()->json($hotel, 201);
    }

    // Update hotel
    public function update(Request $request, $id)
    {
        $hotel = Hotel::find($id);
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }
        $hotel->update($request->all());
        return response()->json($hotel);
    }

    // Delete hotel
    public function destroy($id)
    {
        $hotel = Hotel::find($id);
        if (!$hotel) {
            return response()->json(['message' => 'Hotel not found'], 404);
        }
        $hotel->delete();
        return response()->json(['message' => 'Hotel deleted successfully']);
    }

    public function getPropertyTypes()
    {
        return response()->json(['hotel', 'villa']);
    }
}
