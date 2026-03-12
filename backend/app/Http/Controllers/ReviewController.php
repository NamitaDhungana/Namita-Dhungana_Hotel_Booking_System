<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
    // Submit a review
    public function store(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'hotel_id' => $request->hotel_id,
            'booking_id' => $request->booking_id,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'status' => 'pending' // Moderation
        ]);

        return response()->json($review, 201);
    }

    // Get hotel reviews
    public function index($hotelId)
    {
        $reviews = Review::where('hotel_id', $hotelId)
            ->where('status', 'approved')
            ->with('user')
            ->paginate(10);
        return response()->json($reviews);
    }
}
