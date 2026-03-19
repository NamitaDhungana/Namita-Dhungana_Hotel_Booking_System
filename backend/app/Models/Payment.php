<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'booking_id',
        'user_id',
        'amount',
        'payment_method',
        'payment_status',
        'transaction_id',
        'pidx',
        'order_id',
        'payment_date',
        'payment_gateway_response',
    ];

    protected $casts = [
        'payment_gateway_response' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
