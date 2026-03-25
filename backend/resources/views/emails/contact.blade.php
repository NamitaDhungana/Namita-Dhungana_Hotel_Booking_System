<!DOCTYPE html>
<html>
<head>
    <title>Contact Form Message</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8f9fc; margin: 0; padding: 0; }
        .container { background: #fff; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); }
        .header h1 { color: #6C5CE7; margin: 0 0 24px; font-size: 26px; text-align: center; }
        .badge { display: inline-block; background: #f0eeff; color: #6C5CE7; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
        .detail { background: #fdfdfd; border: 1px solid #eee; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
        .detail p { margin: 8px 0; font-size: 15px; color: #444; }
        .detail strong { color: #2D1B69; display: inline-block; width: 100px; }
        .message-body { background: #f8f9fc; border-left: 4px solid #6C5CE7; padding: 16px 20px; border-radius: 0 6px 6px 0; font-size: 15px; color: #333; line-height: 1.7; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 28px; font-size: 13px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>StayHub</h1></div>
        <span class="badge">New Contact Message</span>

        <div class="detail">
            <p><strong>From:</strong> {{ $senderName }}</p>
            <p><strong>Email:</strong> {{ $senderEmail }}</p>
            <p><strong>Subject:</strong> {{ $msgSubject }}</p>
        </div>

        <p style="font-size:14px;color:#888;margin-bottom:8px;">Message:</p>
        <div class="message-body">{{ $msgBody }}</div>

        <div class="footer">
            <p>This message was sent via the StayHub contact form.</p>
            <p>&copy; {{ date('Y') }} StayHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
