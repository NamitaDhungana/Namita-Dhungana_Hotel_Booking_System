<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactMail;
use App\Models\ContactQuery;
use App\Models\User;

class ContactController extends Controller
{
    // Public — submit contact form
    public function send(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:2000',
        ]);

        // Save to database
        ContactQuery::create([
            'name'    => $request->name,
            'email'   => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
        ]);

        // Also send email notification to super admin
        try {
            $superAdmin = User::where('role', 'super_admin')->first();
            $toEmail = $superAdmin?->email ?? config('mail.from.address');
            Mail::to($toEmail)->send(new ContactMail(
                $request->name,
                $request->email,
                $request->subject,
                $request->message
            ));
        } catch (\Exception $e) {
            Log::error('Contact form mail failed: ' . $e->getMessage());
            // Don't fail the request — message is already saved to DB
        }

        return response()->json(['message' => 'Your message has been sent successfully!']);
    }

    // Super admin — list all queries
    public function index()
    {
        $queries = ContactQuery::orderBy('created_at', 'desc')->get();
        return response()->json($queries);
    }

    // Super admin — mark as read
    public function markRead($id)
    {
        $query = ContactQuery::findOrFail($id);
        $query->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    // Super admin — delete
    public function destroy($id)
    {
        ContactQuery::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
