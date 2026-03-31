<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\AdvertisementController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/verify-code', [AuthController::class, 'verifyEmailCode']);
Route::post('/email/resend-code', [AuthController::class, 'resendVerificationCode']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware(['signed'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware(['auth:sanctum', 'throttle:6,1'])->name('verification.resend');
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);
Route::get('/property-types', [HotelController::class, 'getPropertyTypes']);
Route::get('/hotels/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/hotels/{hotelId}/room-types', [RoomController::class, 'getRoomTypes']);
Route::get('/room-types', [RoomController::class, 'getAllRoomTypes'])->middleware('auth:sanctum');
Route::get('/room-types/{id}', [RoomController::class, 'showRoomType']);
Route::get('/room-types/{id}/unavailable-dates', [RoomController::class, 'getUnavailableDates']);
Route::get('/rooms/search', [RoomController::class, 'searchAvailableRooms']);
Route::get('/rooms/{id}', [RoomController::class, 'showRoom']);
Route::post('/rooms/availability', [RoomController::class, 'checkAvailability']);
Route::get('/amenities', [AmenityController::class, 'index']);
Route::get('/payments/khalti/verify', [PaymentController::class, 'verifyPayment'])->name('khalti.verify');
Route::post('/contact', [App\Http\Controllers\ContactController::class, 'send']);
Route::get('/site-settings', [SuperAdminController::class, 'getPublicSettings']);
Route::get('/advertisements', [AdvertisementController::class, 'publicIndex']);
Route::get('/advertisements/packages', [AdvertisementController::class, 'packages']);
Route::get('/advertisements/verify', [AdvertisementController::class, 'verifyPayment']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'getProfile']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile/picture', [AuthController::class, 'deleteProfilePicture']);

    Route::post('/bookings', [BookingController::class, 'store'])->middleware('role:customer');
    Route::post('/bookings/multi', [BookingController::class, 'storeMulti'])->middleware('role:customer');
    Route::get('/user/bookings', [BookingController::class, 'getUserBookings']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel'])->middleware('role:customer');

    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment'])->middleware('role:customer');
    Route::get('/payments/verify', [PaymentController::class, 'verifyPayment'])->middleware('role:customer');
    Route::post('/reviews', [ReviewController::class, 'store'])->middleware('role:customer');
    Route::get('/review-booking/{bookingId}', [ReviewController::class, 'getBookingForReview'])->middleware('role:customer');
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::middleware('role:admin,super_admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);
        Route::get('/revenue', [AdminController::class, 'getRevenueReport']);
        Route::get('/my-hotels', [HotelController::class, 'myHotels']);
        Route::post('/hotels', [HotelController::class, 'store']);
        Route::put('/hotels/{id}', [HotelController::class, 'update']);
        Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
        Route::post('/amenities', [AmenityController::class, 'store']);
        Route::put('/amenities/{id}', [AmenityController::class, 'update']);
        Route::delete('/amenities/{id}', [AmenityController::class, 'destroy']);
        Route::post('/room-types', [RoomController::class, 'storeRoomType']);
        Route::put('/room-types/{id}', [RoomController::class, 'updateRoomType']);
        Route::get('/rooms', [RoomController::class, 'getRooms']);
        Route::post('/rooms', [RoomController::class, 'storeRoom']);
        Route::put('/rooms/{id}', [RoomController::class, 'updateRoom']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroyRoom']);
        Route::get('/bookings', [BookingController::class, 'getAllBookings']);
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
        Route::get('/reviews', [ReviewController::class, 'adminIndex']);
        Route::put('/reviews/{id}/status', [ReviewController::class, 'updateStatus']);
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
        Route::get('/advertisements', [AdvertisementController::class, 'adminIndex']);
        Route::post('/advertisements/initiate-payment', [AdvertisementController::class, 'initiatePayment']);
        Route::delete('/advertisements/{id}', [AdvertisementController::class, 'destroy']);
    });

    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::get('/users', [SuperAdminController::class, 'getUsers']);
        Route::get('/pending-managers', [SuperAdminController::class, 'getPendingManagers']);
        Route::post('/users/{id}/approve', [SuperAdminController::class, 'approveUser']);
        Route::post('/users/{id}/reject', [SuperAdminController::class, 'rejectUser']);
        Route::post('/users/{id}/activate', [SuperAdminController::class, 'activateUser']);
        Route::post('/users/{id}/deactivate', [SuperAdminController::class, 'deactivateUser']);
        Route::post('/admins', [SuperAdminController::class, 'createAdmin']);
        Route::get('/settings', [SuperAdminController::class, 'getSettings']);
        Route::put('/settings', [SuperAdminController::class, 'updateSettings']);
        Route::get('/contact-queries', [App\Http\Controllers\ContactController::class, 'index']);
        Route::put('/contact-queries/{id}/read', [App\Http\Controllers\ContactController::class, 'markRead']);
        Route::delete('/contact-queries/{id}', [App\Http\Controllers\ContactController::class, 'destroy']);
        Route::get('/advertisements', [AdvertisementController::class, 'superAdminIndex']);
        Route::post('/advertisements/{id}/approve', [AdvertisementController::class, 'approve']);
        Route::post('/advertisements/{id}/reject', [AdvertisementController::class, 'reject']);
    });
});