<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmailVerificationCodeMail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // User registration
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'required|in:customer,admin',
            'pan_number' => 'required_if:role,admin|string|nullable'
        ]);

        $isAdmin = $request->role === 'admin';
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => $request->role,
            'pan_number' => $request->pan_number,
            'is_approved' => $isAdmin ? false : true,
            'registration_status' => $isAdmin ? 'pending' : 'active',
            'email_verification_code' => $code,
            'email_verification_expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new EmailVerificationCodeMail($code, $user->name));

        // Create admins table record for hotel managers
        if ($isAdmin) {
            \App\Models\Admin::create(['user_id' => $user->id]);
        }

        return response()->json([
            'message' => 'Registration successful. A 6-digit verification code has been sent to your email.',
            'user_id' => $user->id,
        ], 201);
    }

    // Verify email with 6-digit code
    public function verifyEmailCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if ($user->email_verification_code !== $request->code) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        if (now()->isAfter($user->email_verification_expires_at)) {
            return response()->json(['message' => 'Verification code has expired. Please request a new one.'], 422);
        }

        $user->markEmailAsVerified();
        $user->update([
            'email_verification_code' => null,
            'email_verification_expires_at' => null,
        ]);

        event(new \Illuminate\Auth\Events\Verified($user));

        return response()->json(['message' => 'Email verified successfully. You can now login.']);
    }

    // Resend verification code
    public function resendVerificationCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'email_verification_code' => $code,
            'email_verification_expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new EmailVerificationCodeMail($code, $user->name));

        return response()->json(['message' => 'A new verification code has been sent to your email.']);
    }

    // User login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check email verification
        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your email address is not verified.',
                'needs_verification' => true
            ], 403);
        }

        // Check manager approval
        if ($user->role === 'admin' && ! $user->is_approved) {
            return response()->json([
                'message' => 'Your account is pending approval by the Super Admin.',
                'is_pending' => true
            ], 403);
        }

        if ($user->registration_status === 'rejected') {
            return response()->json(['message' => 'Your registration has been rejected.'], 403);
        }

        // Check if account is deactivated
        if (! $user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Reason: ' . ($user->deactivation_note ?? 'No reason provided.'),
                'is_deactivated' => true,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    // Email Verification (legacy link-based — kept for backward compat)
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect('http://localhost:5173/login?message=Email already verified.');
        }

        if ($user->markEmailAsVerified()) {
            event(new \Illuminate\Auth\Events\Verified($user));
        }

        return redirect('http://localhost:5173/login?message=Email verified successfully. You can now login.');
    }

    // Resend Verification Email
    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.']);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // Get Profile
    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $user->update($request->only(['name', 'phone', 'address']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
