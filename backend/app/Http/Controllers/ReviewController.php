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

    // Get reviews for admin panel — scoped to own hotels for admin, all for super_admin
    public function adminIndex(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'super_admin') {
            $reviews = Review::with(['user', 'hotel'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $admin = \App\Models\Admin::where('user_id', $user->id)->first();
            if (!$admin) {
                return response()->json(['message' => 'Admin record not found'], 403);
            }
            $hotelIds = \App\Models\Hotel::where('admin_id', $admin->id)->pluck('id');
            $reviews = Review::with(['user', 'hotel'])
                ->whereIn('hotel_id', $hotelIds)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($reviews);
    }

    // Update review status (approve/reject)
    public function updateStatus(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => $request->status]);
        return response()->json($review);
    }
}
