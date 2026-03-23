<!DOCTYPE html>
<html>
<head>
    <title>New Booking Notification - StayHub</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fc; margin: 0; padding: 0; }
        .container { background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #6C5CE7; margin: 0; font-size: 28px; }
        .badge { display: inline-block; background: #e8f8f5; color: #1cc88a; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; margin-bottom: 16px; }
        .content p { font-size: 16px; color: #444; line-height: 1.5; }
        .booking-details { background-color: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .booking-details p { margin: 10px 0; }
        .booking-details strong { color: #2D1B69; display: inline-block; width: 140px; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>StayHub</h1>
        </div>
        <div class="content">
            <span class="badge">New Booking</span>
            <p>Hello <strong>{{ $hotel->name }}</strong> team,</p>
            <p>You have received a new booking. Here are the details:</p>

            <div class="booking-details">
                <p><strong>Reference:</strong> {{ $booking->booking_reference }}</p>
                <p><strong>Guest Name:</strong> {{ $customer->name }}</p>
                <p><strong>Guest Email:</strong> {{ $customer->email }}</p>
                <p><strong>Guest Phone:</strong> {{ $customer->phone ?? 'N/A' }}</p>
                <p><strong>Check-in:</strong> {{ $booking->check_in_date }}</p>
                <p><strong>Check-out:</strong> {{ $booking->check_out_date }}</p>
                <p><strong>Guests:</strong> {{ $booking->num_guests }}</p>
                <p><strong>Total Amount:</strong> Rs. {{ number_format($booking->total_amount, 2) }}</p>
                <p><strong>Payment Status:</strong> Paid via Khalti</p>
            </div>

            <p>Please ensure the room is ready for the guest's arrival.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} StayHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
