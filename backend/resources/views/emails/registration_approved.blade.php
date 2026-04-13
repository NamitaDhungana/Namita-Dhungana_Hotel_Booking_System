<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #6C5CE7; padding: 36px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 36px 40px; }
    .badge { display: inline-block; background: #e8f5e9; color: #16a34a; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .body p { color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 14px; }
    .btn { display: inline-block; margin-top: 10px; padding: 13px 30px; background: #6C5CE7; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .footer { background: #f9f9fb; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>StayHub — Hotel Manager Portal</h1></div>
    <div class="body">
      <span class="badge">✓ Registration Approved</span>
      <p>Hi <strong>{{ $user->name }}</strong>,</p>
      <p>Great news! Your Hotel Manager registration on <strong>StayHub</strong> has been <strong>approved</strong> by our team.</p>
      <p>You can now log in to your dashboard and start managing your hotel listings, rooms, bookings, and more.</p>
      <a href="http://localhost:5173/login" class="btn">Login to Dashboard</a>
    </div>
    <div class="footer">© {{ date('Y') }} StayHub. All rights reserved.</div>
  </div>
</body>
</html>
