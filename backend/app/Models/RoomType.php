<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'type_name',
        'description',
        'base_price',
        'max_occupancy',
        'amenities',
    ];

    protected $casts = [
        'amenities' => 'array',
        'base_price' => 'float',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
