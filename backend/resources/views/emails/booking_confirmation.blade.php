<!DOCTYPE html>
<html>
<head>
    <title>Booking Confirmation - StayHub</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fc; margin: 0; padding: 0; }
        .container { background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #6C5CE7; margin: 0; font-size: 28px; }
        .content p { font-size: 16px; color: #444; line-height: 1.5; }
        .booking-details { background-color: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .booking-details p { margin: 10px 0; }
        .booking-details strong { color: #2D1B69; display: inline-block; width: 120px; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
        .btn { display: inline-block; background-color: #6C5CE7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>StayHub</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{{ $user->name }}</strong>,</p>
            <p>Thank you for choosing StayHub! Your booking has been successfully confirmed. Below are your reservation details:</p>
            
            <div class="booking-details">
                <p><strong>Reference:</strong> {{ $booking->booking_reference }}</p>
                <p><strong>Hotel:</strong> {{ $hotel->name }}</p>
                <p><strong>Check-in:</strong> {{ $booking->check_in_date }}</p>
                <p><strong>Check-out:</strong> {{ $booking->check_out_date }}</p>
                <p><strong>Guests:</strong> {{ $booking->num_guests }}</p>
                <p><strong>Total Amount:</strong> Rs. {{ number_format($booking->total_amount, 2) }}</p>
            </div>
            
            <p>We look forward to hosting you!</p>
            
            <div style="text-align: center;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/userProfile" class="btn">View My Bookings</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} StayHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
