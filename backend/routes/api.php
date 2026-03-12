<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);
Route::get('/property-types', [HotelController::class, 'getPropertyTypes']);
Route::get('/hotels/{id}/reviews', [ReviewController::class, 'index']);

Route::get('/hotels/{hotelId}/room-types', [RoomController::class, 'getRoomTypes']);
Route::get('/room-types', [RoomController::class, 'getAllRoomTypes']);
Route::get('/room-types/{id}', [RoomController::class, 'showRoomType']);
Route::post('/rooms/availability', [RoomController::class, 'checkAvailability']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/user/bookings', [BookingController::class, 'getUserBookings']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Payments
    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
    Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Admin Routes (Should have 'role:admin' middleware ideally)
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);
        Route::get('/revenue', [AdminController::class, 'getRevenueReport']);
        
        // Hotel Management
        Route::post('/hotels', [HotelController::class, 'store']);
        Route::put('/hotels/{id}', [HotelController::class, 'update']);
        Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);

        // Room Management
        Route::post('/room-types', [RoomController::class, 'storeRoomType']);
        Route::put('/room-types/{id}', [RoomController::class, 'updateRoomType']);
        Route::post('/rooms', [RoomController::class, 'storeRoom']);
        Route::put('/rooms/{id}/status', [RoomController::class, 'updateRoomStatus']);
        
        // Booking Management
        Route::get('/bookings', [BookingController::class, 'getAllBookings']);
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    });

    // Super Admin Routes (Should have 'role:super_admin' middleware)
    Route::prefix('super-admin')->group(function () {
        Route::post('/admins', [SuperAdminController::class, 'createAdmin']);
        Route::get('/settings', [SuperAdminController::class, 'getSettings']);
    });
});
