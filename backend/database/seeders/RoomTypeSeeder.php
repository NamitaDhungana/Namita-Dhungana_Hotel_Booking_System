<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hotel;
use App\Models\RoomType;

class RoomTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Define standard room types
        $standardTypes = [
            ['type_name' => 'Single Room', 'base_price' => 1500, 'max_occupancy' => 1, 'description' => 'A cozy room for a single person.'],
            ['type_name' => 'Double Room', 'base_price' => 2500, 'max_occupancy' => 2, 'description' => 'A comfortable room for two people.'],
            ['type_name' => 'Suite', 'base_price' => 5000, 'max_occupancy' => 2, 'description' => 'A luxurious suite with modern amenities.'],
            ['type_name' => 'Deluxe Room', 'base_price' => 4000, 'max_occupancy' => 4, 'description' => 'A spacious room perfect for relaxation.'],
            ['type_name' => 'Family Room', 'base_price' => 6000, 'max_occupancy' => 5, 'description' => 'A highly spacious room suitable for a whole family.'],
            ['type_name' => 'Presidential Suite', 'base_price' => 15000, 'max_occupancy' => 4, 'description' => 'The ultimate luxury experience.'],
        ];

        // Seed room types for each active hotel
        $hotels = Hotel::all();

        foreach ($hotels as $hotel) {
            foreach ($standardTypes as $type) {
                // Prevent duplicate room types for the same hotel
                RoomType::firstOrCreate(
                    [
                        'hotel_id' => $hotel->id,
                        'type_name' => $type['type_name'],
                    ],
                    [
                        'base_price' => $type['base_price'],
                        'max_occupancy' => $type['max_occupancy'],
                        'description' => $type['description'],
                    ]
                );
            }
        }
    }
}
