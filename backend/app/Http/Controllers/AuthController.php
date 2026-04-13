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
            'phone' => 'required|string',
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

            // Notify all super admins about new pending manager
            $superAdmins = User::where('role', 'super_admin')->get();
            foreach ($superAdmins as $sa) {
                \App\Models\Notification::create([
                    'user_id' => $sa->id,
                    'type'    => 'new_manager_registration',
                    'title'   => 'New Hotel Manager Registration',
                    'message' => "{$user->name} ({$user->email}) has registered as a Hotel Manager and is awaiting your approval.",
                    'is_read' => false,
                ]);
            }
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

    // Forgot Password - send reset code
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'email_verification_code' => $code,
            'email_verification_expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new \App\Mail\PasswordResetCodeMail($code, $user->name));

        return response()->json(['message' => 'A password reset code has been sent to your email.']);
    }

    // Reset Password - verify code and set new password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verification_code !== $request->code) {
            return response()->json(['message' => 'Invalid reset code.'], 422);
        }

        if (now()->isAfter($user->email_verification_expires_at)) {
            return response()->json(['message' => 'Reset code has expired. Please request a new one.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'email_verification_code' => null,
            'email_verification_expires_at' => null,
        ]);

        return response()->json(['message' => 'Password reset successfully. You can now login.']);
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
            'name'            => 'sometimes|string|max:255',
            'phone'           => 'nullable|digits:10',
            'address'         => 'nullable|string|max:500',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'current_password'=> 'nullable|string',
            'new_password'    => 'nullable|string|min:8|confirmed',
        ]);

        // Handle password change
        if ($request->filled('new_password')) {
            if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        // Handle profile picture upload — client already compresses, just store it
        if ($request->hasFile('profile_picture')) {
            // Delete old picture
            if ($user->profile_picture) {
                $oldPath = public_path('profile_pictures/' . basename($user->profile_picture));
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file     = $request->file('profile_picture');
            $filename = 'user_' . $user->id . '_' . time() . '.jpg';
            $file->move(public_path('profile_pictures'), $filename);

            $user->profile_picture = '/profile_pictures/' . $filename;
        }

        $user->fill($request->only(['name', 'phone', 'address']));
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user,
        ]);
    }

    // Delete Profile Picture
    public function deleteProfilePicture(Request $request)
    {
        $user = $request->user();
        if ($user->profile_picture) {
            $path = public_path('profile_pictures/' . basename($user->profile_picture));
            if (file_exists($path)) {
                unlink($path);
            }
            $user->profile_picture = null;
            $user->save();
        }
        return response()->json(['message' => 'Profile picture removed.', 'user' => $user]);
    }
}
