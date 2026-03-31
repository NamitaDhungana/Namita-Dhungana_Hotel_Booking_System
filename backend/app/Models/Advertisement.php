<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $fillable = [
        'hotel_id',
        'title',
        'banner_image',
        'amount_paid',
        'pidx',
        'transaction_id',
        'payment_status',
        'status',
        'start_date',
        'end_date',
        'rejection_reason',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }
}
