<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Get user notifications
    public function index(Request $request)
    {
        // Assuming Notification model exists
        // $notifications = $request->user()->notifications; // or Notification::where...
        return response()->json([]);
    }

    // Mark notification as read
    public function markAsRead($id)
    {
        // Notification::find($id)->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }
}
