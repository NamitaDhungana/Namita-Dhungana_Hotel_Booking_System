<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationApprovedMail;
use App\Mail\RegistrationRejectedMail;

class SuperAdminController extends Controller
{
    // Create admin account
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'hotel_id' => 'required|exists:hotels,id' // Assign to hotel
        ]);
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin'
        ]);
        
        // Create Admin record logic if separate table exists (we have 'admins' table)
        // Admin::create(['user_id' => $user->id, ...]);
        
        return response()->json($user, 201);
    }

    // Get all users
    public function getUsers(Request $request)
    {
        $query = User::whereIn('role', ['customer', 'admin'])
            ->orderBy('created_at', 'desc');

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $perPage = $request->input('per_page', 15);
        return response()->json($query->paginate($perPage));
    }

    // Get pending managers
    public function getPendingManagers()
    {
        $pending = User::where('role', 'admin')
            ->where('is_approved', false)
            ->where('registration_status', 'pending')
            ->get();
        return response()->json($pending);
    }

    // Approve user
    public function approveUser($id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'is_approved' => true,
            'registration_status' => 'active'
        ]);

        if ($user->role === 'admin' && !\App\Models\Admin::where('user_id', $user->id)->exists()) {
            \App\Models\Admin::create([
                'user_id' => $user->id,
                'permissions' => json_encode(['all']),
                'status' => 'active'
            ]);
        }

        // Send in-app notification
        if ($user->role === 'admin') {
            Notification::create([
                'user_id' => $user->id,
                'type'    => 'registration_approved',
                'title'   => 'Registration Approved',
                'message' => 'Congratulations! Your Hotel Manager registration has been approved. You can now access your dashboard.',
                'is_read' => false,
            ]);

            // Send email
            try {
                Mail::to($user->email)->send(new RegistrationApprovedMail($user));
            } catch (\Exception $e) {
                \Log::error('Approval email failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'User approved successfully',
            'user' => $user
        ]);
    }

    // Reject user
    public function rejectUser($id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'is_approved' => false,
            'registration_status' => 'rejected'
        ]);

        // Send in-app notification
        if ($user->role === 'admin') {
            Notification::create([
                'user_id' => $user->id,
                'type'    => 'registration_rejected',
                'title'   => 'Registration Not Approved',
                'message' => 'Unfortunately, your Hotel Manager registration has not been approved. Please contact support for more information.',
                'is_read' => false,
            ]);

            // Send email
            try {
                Mail::to($user->email)->send(new RegistrationRejectedMail($user));
            } catch (\Exception $e) {
                \Log::error('Rejection email failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'User registration rejected',
            'user' => $user
        ]);
    }

    // Activate user
    public function activateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'is_active' => true,
            'deactivation_note' => null,
        ]);

        return response()->json([
            'message' => 'User activated successfully',
            'user' => $user
        ]);
    }

    // Deactivate user
    public function deactivateUser(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|max:500',
        ]);

        $user = User::findOrFail($id);

        if ($user->role === 'super_admin') {
            return response()->json(['message' => 'Cannot deactivate a super admin'], 403);
        }

        $user->update([
            'is_active' => false,
            'deactivation_note' => $request->note,
        ]);

        return response()->json([
            'message' => 'User deactivated successfully',
            'user' => $user
        ]);
    }

    // Public settings (no auth — for frontend site title, contact info etc.)
    public function getPublicSettings()
    {
        $keys = ['site_title', 'about_us', 'address', 'phone_numbers',
                 'facebook_url', 'instagram_url', 'twitter_url',
                 'google_map', 'map_iframe', 'shutdown_website'];
        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = \App\Models\SystemSetting::get($key, '');
        }
        return response()->json($settings);
    }

    // Get all system settings
    public function getSettings()
    {
        $keys = [
            'site_title', 'about_us', 'shutdown_website',
            'address', 'google_map', 'phone_numbers',
            'facebook_url', 'instagram_url', 'twitter_url', 'map_iframe',
        ];

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = \App\Models\SystemSetting::get($key, '');
        }

        return response()->json($settings);
    }

    // Update system settings
    public function updateSettings(Request $request)
    {
        $allowed = [
            'site_title', 'about_us', 'shutdown_website',
            'address', 'google_map', 'phone_numbers',
            'facebook_url', 'instagram_url', 'twitter_url', 'map_iframe',
        ];

        foreach ($allowed as $key) {
            if ($request->has($key)) {
                \App\Models\SystemSetting::set($key, $request->input($key));
            }
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
