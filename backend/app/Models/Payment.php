<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'transaction_id',
        'amount',
        'payment_method',
        'payment_status',
        'paid_at',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
