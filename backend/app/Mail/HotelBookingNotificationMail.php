<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HotelBookingNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $customer;
    public $hotel;

    public function __construct($booking, $customer, $hotel)
    {
        $this->booking  = $booking;
        $this->customer = $customer;
        $this->hotel    = $hotel;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Booking Received - ' . $this->booking->booking_reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.hotel_booking_notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
