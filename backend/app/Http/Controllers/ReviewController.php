<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Booking;

class ReviewController extends Controller
{
    // Submit a review
    public function store(Request $request)
    {
        $request->validate([
            'hotel_id'   => 'required|exists:hotels,id',
            'booking_id' => 'required|exists:bookings,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
            'title'      => 'nullable|string|max:255',
        ]);

        // Ensure the booking belongs to this user and is in a reviewable state
        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Invalid booking or not eligible for review.'], 403);
        }

        // Prevent duplicate review for same booking
        if (Review::where('booking_id', $request->booking_id)->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You have already reviewed this booking.'], 409);
        }

        $review = Review::create([
            'user_id'    => $request->user()->id,
            'hotel_id'   => $request->hotel_id,
            'booking_id' => $request->booking_id,
            'rating'     => $request->rating,
            'title'      => $request->title,
            'comment'    => $request->comment,
            'status'     => 'pending',
        ]);

        return response()->json($review, 201);
    }

    // Get booking info for review page (authenticated, must own booking)
    public function getBookingForReview(Request $request, $bookingId)
    {
        $booking = Booking::with(['hotel', 'room.roomType'])
            ->where('id', $bookingId)
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['confirmed', 'checked_in', 'checked_out'])
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found or not eligible for review.'], 404);
        }

        $alreadyReviewed = Review::where('booking_id', $bookingId)
            ->where('user_id', $request->user()->id)
            ->exists();

        return response()->json([
            'booking'          => $booking,
            'already_reviewed' => $alreadyReviewed,
        ]);
    }

    // Get approved hotel reviews (public)
    public function index($hotelId)
    {
        $reviews = Review::where('hotel_id', $hotelId)
            ->where('status', 'approved')
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    // Get reviews for admin panel
    public function adminIndex(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'super_admin') {
            $reviews = Review::with(['user:id,name', 'hotel:id,name'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $admin = \App\Models\Admin::where('user_id', $user->id)->first();
            if (!$admin) {
                return response()->json(['message' => 'Admin record not found'], 403);
            }
            $hotelIds = \App\Models\Hotel::where('admin_id', $admin->id)->pluck('id');
            $reviews = Review::with(['user:id,name', 'hotel:id,name'])
                ->whereIn('hotel_id', $hotelIds)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($reviews);
    }

    // Approve or reject a review
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);
        $review = Review::findOrFail($id);
        $review->update(['status' => $request->status]);
        return response()->json($review);
    }

    // Delete a review
    public function destroy($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Review deleted.']);
    }
}
