<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; padding: 36px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 36px 40px; }
    .badge { display: inline-block; background: #fef2f2; color: #dc2626; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .body p { color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 14px; }
    .footer { background: #f9f9fb; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>StayHub — Hotel Manager Portal</h1></div>
    <div class="body">
      <span class="badge">✗ Registration Not Approved</span>
      <p>Hi <strong>{{ $user->name }}</strong>,</p>
      <p>We regret to inform you that your Hotel Manager registration on <strong>StayHub</strong> has <strong>not been approved</strong> at this time.</p>
      <p>This may be due to incomplete information or not meeting our current requirements. If you believe this is an error, please contact our support team.</p>
      <p style="color:#888; font-size:13px;">You can reach us at <a href="mailto:support@stayhub.com">support@stayhub.com</a></p>
    </div>
    <div class="footer">© {{ date('Y') }} StayHub. All rights reserved.</div>
  </div>
</body>
</html>
