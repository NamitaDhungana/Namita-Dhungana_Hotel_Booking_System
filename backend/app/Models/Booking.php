<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Payment;
use Carbon\Carbon;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'hotel_id',
        'room_id',
        'booking_reference',
        'group_booking_reference',
        'check_in_date',
        'check_out_date',
        'num_guests',
        'num_adults',
        'num_children',
        'total_amount',
        'payment_method',
        'status',
        'payment_status',
        'cancelled_at',
        'cancellation_reason',
        'cancellation_policy',
    ];

    /**
     * Check whether this booking can be cancelled by the customer right now.
     * Returns ['allowed' => bool, 'message' => string]
     */
    public function cancellationEligibility(): array
    {
        // Already cancelled or past states — no action needed
        if (in_array($this->status, ['cancelled', 'checked_in', 'checked_out'])) {
            return [
                'allowed' => false,
                'message' => 'This booking cannot be cancelled in its current state (' . $this->status . ').',
            ];
        }

        $policy = $this->cancellation_policy ?? 'flexible';

        // Rule 1: 100% non-refundable — block if confirmed/paid
        if ($policy === 'non_refundable') {
            $paidStatuses = ['confirmed', 'checked_in'];
            if (in_array($this->status, $paidStatuses) || $this->payment_status === 'completed') {
                return [
                    'allowed' => false,
                    'message' => 'This booking is 100% non-refundable and cannot be canceled after confirmation/payment.',
                ];
            }
        }

        // Rule 2: 24-hour policy — only allow if > 24h before check-in
        if ($policy === '24_hours') {
            // Build check-in as start-of-day in Asia/Kathmandu, compare against now() in same tz
            $tz = config('app.timezone', 'Asia/Kathmandu');
            $checkIn = \Carbon\Carbon::createFromFormat('Y-m-d', $this->check_in_date, $tz)->startOfDay();
            $now     = \Carbon\Carbon::now($tz);

            // hoursUntilCheckIn is positive when check-in is in the future
            $hoursUntilCheckIn = $now->diffInHours($checkIn, false); // false = signed

            if ($hoursUntilCheckIn < 24) {
                return [
                    'allowed' => false,
                    'message' => 'This booking can only be canceled at least 24 hours before check-in.',
                ];
            }
        }

        // Rule 3: flexible — always allowed (unless already in a terminal state above)
        return ['allowed' => true, 'message' => 'Cancellation is allowed.'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
