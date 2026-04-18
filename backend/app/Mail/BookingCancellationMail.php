<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCancellationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $user;
    public $hotel;

    public function __construct($booking, $user, $hotel)
    {
        $this->booking = $booking;
        $this->user    = $user;
        $this->hotel   = $hotel;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Cancelled – ' . $this->booking->booking_reference . ' | StayHub',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking_cancellation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
