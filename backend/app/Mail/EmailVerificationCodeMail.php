<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $code, public string $name) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'StayHub - Your Email Verification Code');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.verification_code');
    }
}
