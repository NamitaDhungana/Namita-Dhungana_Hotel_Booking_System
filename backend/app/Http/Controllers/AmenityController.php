<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Amenity;

class AmenityController extends Controller
{
    public function index()
    {
        return response()->json(Amenity::orderBy('type')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:amenities,name',
            'type' => 'required|in:facility,feature',
        ]);

        $amenity = Amenity::create($request->only('name', 'type'));
        return response()->json($amenity, 201);
    }

    public function update(Request $request, $id)
    {
        $amenity = Amenity::findOrFail($id);
        $request->validate([
            'name' => 'sometimes|string|unique:amenities,name,' . $id . ',amenity_id',
            'type' => 'sometimes|in:facility,feature',
        ]);
        $amenity->update($request->only('name', 'type'));
        return response()->json($amenity);
    }

    public function destroy($id)
    {
        Amenity::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
