<!DOCTYPE html>
<html>
<head>
    <title>Check-In Confirmed – StayHub</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fc; margin: 0; padding: 0; }
        .container { background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #6C5CE7; margin: 0; font-size: 28px; }
        .badge { display: inline-block; background: #1cc88a; color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
        .content p { font-size: 16px; color: #444; line-height: 1.5; }
        .booking-details { background-color: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .booking-details p { margin: 10px 0; font-size: 15px; color: #444; }
        .booking-details strong { color: #2D1B69; display: inline-block; width: 140px; }
        .highlight { background: #f0fdf4; border-left: 4px solid #1cc88a; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 15px; color: #166534; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
        .btn { display: inline-block; background-color: #6C5CE7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>StayHub</h1>
            <div class="badge">✓ Checked In</div>
        </div>
        <div class="content">
            <p>Hi <strong>{{ $user->name }}</strong>,</p>
            <p>Welcome! Your check-in has been confirmed by the hotel. We hope you have a wonderful stay.</p>

            <div class="booking-details">
                <p><strong>Reference:</strong> {{ $booking->booking_reference }}</p>
                <p><strong>Hotel:</strong> {{ $hotel->name }}</p>
                <p><strong>Check-in Date:</strong> {{ \Carbon\Carbon::parse($booking->check_in_date)->format('D, d M Y') }}</p>
                <p><strong>Check-out Date:</strong> {{ \Carbon\Carbon::parse($booking->check_out_date)->format('D, d M Y') }}</p>
                <p><strong>Guests:</strong> {{ $booking->num_guests }}</p>
                <p><strong>Total Amount:</strong> Rs. {{ number_format($booking->total_amount, 2) }}</p>
            </div>

            <div class="highlight">
                🗓️ Your check-out is scheduled for <strong>{{ \Carbon\Carbon::parse($booking->check_out_date)->format('D, d M Y') }}</strong>. Please ensure you vacate by the hotel's check-out time.
            </div>

            <div style="text-align: center;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/my-bookings" class="btn">View My Bookings</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} StayHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
