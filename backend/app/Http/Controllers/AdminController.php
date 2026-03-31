<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Hotel;
use App\Models\Admin;
use Carbon\Carbon;

class AdminController extends Controller
{
    private function getAdminRecord(Request $request): ?Admin
    {
        return Admin::where('user_id', $request->user()->id)->first();
    }

    private function getScopedHotelIds(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'super_admin') {
            return Hotel::pluck('id');
        }
        $admin = $this->getAdminRecord($request);
        if (!$admin) return collect();
        return Hotel::where('admin_id', $admin->id)->pluck('id');
    }

    public function getDashboardStats(Request $request)
    {
        $user     = $request->user();
        $hotelIds = $this->getScopedHotelIds($request);

        if ($user->role !== 'super_admin' && $hotelIds->isEmpty()) {
            return response()->json(['message' => 'Admin record not found'], 403);
        }

        return response()->json([
            'total_bookings'  => Booking::whereIn('hotel_id', $hotelIds)->count(),
            'total_revenue'   => (float) Payment::where('payment_status', 'completed')
                ->whereHas('booking', fn($q) => $q->whereIn('hotel_id', $hotelIds))
                ->sum('amount'),
            'active_bookings' => Booking::whereIn('hotel_id', $hotelIds)
                ->whereIn('status', ['confirmed', 'checked_in', 'reserved'])->count(),
            'total_hotels'    => $hotelIds->count(),
            'total_users'     => \App\Models\User::where('role', 'customer')->count(),
            'role'            => $user->role,
        ]);
    }

    public function getRevenueReport(Request $request)
    {
        $hotelIds = $this->getScopedHotelIds($request);
        $months   = max(1, min(12, (int) $request->query('months', 6)));

        $nowYear  = (int) date('Y');
        $nowMonth = (int) date('n');

        $monthlyRevenue = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $totalMonths = ($nowYear * 12 + $nowMonth - 1) - $i;
            $year  = (int) floor($totalMonths / 12);
            $month = ($totalMonths % 12) + 1;

            $start = Carbon::create($year, $month, 1, 0, 0, 0)->startOfMonth();
            $end   = Carbon::create($year, $month, 1, 0, 0, 0)->endOfMonth();

            $monthlyRevenue[] = [
                'month'    => $start->format('M Y'),
                'revenue'  => (float) Payment::where('payment_status', 'completed')
                    ->whereBetween('created_at', [$start, $end])
                    ->whereHas('booking', fn($q) => $q->whereIn('hotel_id', $hotelIds))
                    ->sum('amount'),
                'bookings' => (int) Booking::whereIn('hotel_id', $hotelIds)
                    ->whereBetween('created_at', [$start, $end])
                    ->count(),
            ];
        }

        $statusDist = Booking::whereIn('hotel_id', $hotelIds)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'name'  => ucfirst(str_replace('_', ' ', $row->status)),
                'value' => (int) $row->count,
            ])
            ->values()
            ->toArray();

        $recentBookings = Booking::with(['user:id,name,email', 'hotel:id,name', 'room:id,room_number'])
            ->whereIn('hotel_id', $hotelIds)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'id'          => $b->id,
                'guest'       => $b->user?->name ?? 'N/A',
                'hotel'       => $b->hotel?->name ?? 'N/A',
                'room'        => $b->room?->room_number ?? 'N/A',
                'check_in'    => $b->check_in_date,
                'check_out'   => $b->check_out_date,
                'status'      => $b->status,
                'total_price' => $b->total_amount,
            ]);

        return response()->json([
            'monthly_revenue' => $monthlyRevenue,
            'status_dist'     => $statusDist,
            'recent_bookings' => $recentBookings,
        ]);
    }
}