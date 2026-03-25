<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $senderName;
    public string $senderEmail;
    public string $msgSubject;
    public string $msgBody;

    public function __construct(string $senderName, string $senderEmail, string $msgSubject, string $msgBody)
    {
        $this->senderName  = $senderName;
        $this->senderEmail = $senderEmail;
        $this->msgSubject  = $msgSubject;
        $this->msgBody     = $msgBody;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Contact Form: ' . $this->msgSubject,
            replyTo: [$this->senderEmail],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.contact');
    }

    public function attachments(): array
    {
        return [];
    }
}
