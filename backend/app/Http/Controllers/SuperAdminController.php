<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
    public function getUsers()
    {
        $users = User::whereIn('role', ['customer', 'admin'])->get();
        return response()->json($users);
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

        return response()->json([
            'message' => 'User registration rejected',
            'user' => $user
        ]);
    }

    // Get all system settings
    public function getSettings()
    {
        return response()->json(['message' => 'Settings']);
    }
}
