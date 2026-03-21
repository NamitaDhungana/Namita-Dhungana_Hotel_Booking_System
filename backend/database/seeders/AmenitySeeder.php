<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Amenity;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            // Facilities
            ['name' => 'Air Conditioner',  'type' => 'facility'],
            ['name' => 'TV',               'type' => 'facility'],
            ['name' => 'Coffee Maker',     'type' => 'facility'],
            ['name' => 'Room Heater',      'type' => 'facility'],
            ['name' => 'Free WiFi',        'type' => 'facility'],
            ['name' => 'Gym',              'type' => 'facility'],
            ['name' => 'Swimming Pool',    'type' => 'facility'],
            ['name' => 'Spa',              'type' => 'facility'],
            ['name' => 'Meeting Room',     'type' => 'facility'],
            ['name' => 'Parking',          'type' => 'facility'],
            ['name' => 'Restaurant',       'type' => 'facility'],
            ['name' => 'Laundry Service',  'type' => 'facility'],
            // Features
            ['name' => 'Kitchen',          'type' => 'feature'],
            ['name' => 'Bedroom',          'type' => 'feature'],
            ['name' => 'Balcony',          'type' => 'feature'],
            ['name' => 'Living Room',      'type' => 'feature'],
            ['name' => 'Private Bathroom', 'type' => 'feature'],
            ['name' => 'Sea View',         'type' => 'feature'],
            ['name' => 'Mountain View',    'type' => 'feature'],
        ];

        // Clear old data and re-seed
        \App\Models\Amenity::truncate();
        foreach ($amenities as $a) {
            \App\Models\Amenity::create($a);
        }
    }
}
