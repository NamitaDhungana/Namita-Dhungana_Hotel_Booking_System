<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'name',
        'property_type',
        'description',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'phone',
        'email',
        'rating',
        'total_reviews',
        'status',
        'featured_image',
        'latitude',
        'longitude',
        'amenities',
        'policies',
        'is_featured'
    ];

    protected $casts = [
        'amenities' => 'array',
        'rating' => 'float',
        'is_featured' => 'boolean',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function roomTypes()
    {
        return $this->hasMany(RoomType::class);
    }

    public function images()
    {
        return $this->hasMany(HotelImage::class);
    }
}
