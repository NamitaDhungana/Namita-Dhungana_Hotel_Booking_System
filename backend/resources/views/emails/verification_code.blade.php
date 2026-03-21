<!DOCTYPE html>
<html>
<head>
    <title>Email Verification - StayHub</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fc; margin: 0; padding: 0; }
        .container { background-color: #ffffff; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #6C5CE7; margin: 0; font-size: 28px; }
        .content p { font-size: 16px; color: #444; line-height: 1.5; }
        .code-box { background-color: #f3f0ff; border: 2px dashed #6C5CE7; border-radius: 8px; text-align: center; padding: 20px; margin: 24px 0; }
        .code-box span { font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #2D1B69; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>StayHub</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{{ $name }}</strong>,</p>
            <p>Use the 6-digit code below to verify your email address. This code expires in <strong>10 minutes</strong>.</p>
            <div class="code-box">
                <span>{{ $code }}</span>
            </div>
            <p>If you did not create a StayHub account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} StayHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
