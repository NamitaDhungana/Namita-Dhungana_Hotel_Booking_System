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

    // Get all system settings
    public function getSettings()
    {
        // return SystemSetting::all();
        return response()->json(['message' => 'Settings']);
    }
}
