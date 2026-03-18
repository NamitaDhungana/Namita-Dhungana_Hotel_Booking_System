<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Hotel;

class AdminController extends Controller
{
    // Get dashboard statistics
    public function getDashboardStats(Request $request)
    {
        $hotelId = $request->hotel_id;

        $queryBookings = Booking::query();
        $queryPayments = Payment::where('payment_status', 'completed');

        if ($hotelId) {
            $queryBookings->where('hotel_id', $hotelId);
            $queryPayments->whereHas('booking', function ($q) use ($hotelId) {
                $q->where('hotel_id', $hotelId);
            });
        }

        $totalBookings = $queryBookings->count();
        $totalRevenue = $queryPayments->sum('amount');

        $activeBookings = (clone $queryBookings)->whereIn('status', ['confirmed', 'checked_in'])->count();

        $totalHotels = Hotel::count();
        $totalUsers = \App\Models\User::where('role', 'user')->count();

        return response()->json([
            'total_bookings' => $totalBookings,
            'total_revenue' => $totalRevenue,
            'active_bookings' => $activeBookings,
            'total_hotels' => $totalHotels,
            'total_users' => $totalUsers
        ]);
    }

    // Get revenue report
    public function getRevenueReport(Request $request)
    {
        // ... (Simplified for now)
        return response()->json(['message' => 'Revenue report data']);
    }

    // Get occupancy report
    public function getOccupancyReport(Request $request)
    {
        // ... (Simplified for now)
        return response()->json(['message' => 'Occupancy report data']);
    }
}
