<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Hotel;
use App\Models\Admin;

class AdminController extends Controller
{
    /**
     * Get the admin record for the authenticated user.
     * Returns null for super_admin (they don't need scoping).
     */
    private function getAdminRecord(Request $request): ?Admin
    {
        return Admin::where('user_id', $request->user()->id)->first();
    }

    // Get dashboard statistics — scoped to admin's own hotels
    public function getDashboardStats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'super_admin') {
            // Super admin sees everything
            $hotelIds = Hotel::pluck('id');
        } else {
            $admin = $this->getAdminRecord($request);
            if (!$admin) {
                return response()->json(['message' => 'Admin record not found'], 403);
            }
            $hotelIds = Hotel::where('admin_id', $admin->id)->pluck('id');
        }

        $totalHotels   = $hotelIds->count(); 
        $totalBookings = Booking::whereIn('hotel_id', $hotelIds)->count();
        $activeBookings = Booking::whereIn('hotel_id', $hotelIds)
            ->whereIn('status', ['confirmed', 'checked_in'])->count();
        $totalRevenue  = Payment::where('payment_status', 'completed')
            ->whereHas('booking', fn($q) => $q->whereIn('hotel_id', $hotelIds))
            ->sum('amount');
        $totalUsers    = \App\Models\User::where('role', 'customer')->count();

        return response()->json([
            'total_bookings'  => $totalBookings,
            'total_revenue'   => $totalRevenue,
            'active_bookings' => $activeBookings,
            'total_hotels'    => $totalHotels,
            'total_users'     => $totalUsers,
            'role'            => $user->role,
        ]);
    }

    // Get revenue report
    public function getRevenueReport(Request $request)
    {
        return response()->json(['message' => 'Revenue report data']);
    }
}
