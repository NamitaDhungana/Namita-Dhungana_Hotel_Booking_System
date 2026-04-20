<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\Room;
use Illuminate\Support\Facades\Hash;

class HotelRoomSeeder extends Seeder
{
    public function run(): void
    {
        // Create or get a hotel manager user for seeded hotels
        $managerUser = User::updateOrCreate(
            ['email' => 'seedmanager@stayhub.com'],
            [
                'name'                => 'Seed Manager',
                'password'            => Hash::make('password'),
                'role'                => 'admin',
                'is_approved'         => true,
                'registration_status' => 'active',
                'email_verified_at'   => now(),
                'is_active'           => true,
            ]
        );

        $admin = Admin::firstOrCreate(['user_id' => $managerUser->id]);

        $hotels = [
            [
                'name'           => 'Hotel Yak & Yeti',
                'description'    => 'A landmark luxury hotel in the heart of Kathmandu offering world-class amenities and elegant rooms.',
                'address'        => 'Durbar Marg, Kathmandu',
                'city'           => 'Kathmandu',
                'phone'          => '9801234567',
                'email'          => 'info@yakyeti.com',
                'rating'         => 4.8,
                'total_reviews'  => 320,
                'status'         => 'active',
                'is_featured'    => true,
                'featured_image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Gym'],
                'policies'       => 'Check-in: 2:00 PM, Check-out: 12:00 PM. Free cancellation up to 24 hours before arrival.',
                'room_types'     => [
                    [
                        'type_name'     => 'Deluxe Room',
                        'description'   => 'Spacious deluxe room with city view and modern furnishings.',
                        'base_price'    => 5500,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Queen',
                        'amenities'     => ['AC', 'TV', 'WiFi', 'Mini Bar'],
                        'rooms'         => ['101', '102', '103'],
                    ],
                    [
                        'type_name'     => 'Suite',
                        'description'   => 'Luxurious suite with separate living area and panoramic city views.',
                        'base_price'    => 12000,
                        'max_occupancy' => 3,
                        'bed_type'      => 'King',
                        'amenities'     => ['AC', 'TV', 'WiFi', 'Jacuzzi', 'Mini Bar', 'Balcony'],
                        'rooms'         => ['201'],
                    ],
                ],
            ],
            [
                'name'           => 'Pokhara Grande Hotel',
                'description'    => 'Stunning lakeside hotel in Pokhara with breathtaking views of the Annapurna range.',
                'address'        => 'Lakeside, Pokhara',
                'city'           => 'Pokhara',
                'phone'          => '9812345678',
                'email'          => 'info@pokharagrande.com',
                'rating'         => 4.6,
                'total_reviews'  => 215,
                'status'         => 'active',
                'is_featured'    => true,
                'featured_image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Pool', 'Restaurant', 'Parking', 'Lake View'],
                'policies'       => 'Check-in: 1:00 PM, Check-out: 11:00 AM. 24-hour cancellation policy.',
                'room_types'     => [
                    [
                        'type_name'     => 'Lake View Room',
                        'description'   => 'Beautiful room with direct view of Phewa Lake and mountains.',
                        'base_price'    => 4500,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Double',
                        'amenities'     => ['AC', 'TV', 'WiFi', 'Balcony'],
                        'rooms'         => ['301', '302'],
                    ],
                    [
                        'type_name'     => 'Family Room',
                        'description'   => 'Spacious family room accommodating up to 4 guests comfortably.',
                        'base_price'    => 7000,
                        'max_occupancy' => 4,
                        'bed_type'      => 'Twin + Double',
                        'amenities'     => ['AC', 'TV', 'WiFi', 'Extra Beds'],
                        'rooms'         => ['401'],
                    ],
                ],
            ],
            [
                'name'           => 'Chitwan Jungle Lodge',
                'description'    => 'Eco-friendly jungle lodge near Chitwan National Park, perfect for wildlife enthusiasts.',
                'address'        => 'Sauraha, Chitwan',
                'city'           => 'Chitwan',
                'phone'          => '9823456789',
                'email'          => 'info@chitwanlodge.com',
                'rating'         => 4.5,
                'total_reviews'  => 180,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Safari Tours', 'Garden'],
                'policies'       => 'Check-in: 2:00 PM, Check-out: 10:00 AM. Non-refundable after booking.',
                'room_types'     => [
                    [
                        'type_name'     => 'Jungle Cottage',
                        'description'   => 'Cozy cottage surrounded by nature with jungle views.',
                        'base_price'    => 3500,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Double',
                        'amenities'     => ['Fan', 'Mosquito Net', 'Hot Water'],
                        'rooms'         => ['C01', 'C02'],
                    ],
                ],
            ],
            [
                'name'           => 'Lumbini Buddha Hotel',
                'description'    => 'Peaceful hotel near the birthplace of Lord Buddha, ideal for spiritual travellers.',
                'address'        => 'Lumbini Development Zone, Lumbini',
                'city'           => 'Lumbini',
                'phone'          => '9834567890',
                'email'          => 'info@lumbinihotel.com',
                'rating'         => 4.3,
                'total_reviews'  => 140,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Garden', 'Meditation Hall'],
                'policies'       => 'Check-in: 12:00 PM, Check-out: 11:00 AM. Flexible cancellation.',
                'room_types'     => [
                    [
                        'type_name'     => 'Standard Room',
                        'description'   => 'Clean and comfortable standard room with garden view.',
                        'base_price'    => 2500,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Single',
                        'amenities'     => ['Fan', 'TV', 'WiFi'],
                        'rooms'         => ['S01', 'S02'],
                    ],
                ],
            ],
            [
                'name'           => 'Nagarkot Mountain Resort',
                'description'    => 'Hilltop resort in Nagarkot offering stunning sunrise views over the Himalayas.',
                'address'        => 'Nagarkot Hill, Bhaktapur',
                'city'           => 'Bhaktapur',
                'phone'          => '9845678901',
                'email'          => 'info@nagarkotresort.com',
                'rating'         => 4.7,
                'total_reviews'  => 260,
                'status'         => 'active',
                'is_featured'    => true,
                'featured_image' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Mountain View', 'Bonfire', 'Parking'],
                'policies'       => 'Check-in: 2:00 PM, Check-out: 12:00 PM. 24-hour cancellation policy.',
                'room_types'     => [
                    [
                        'type_name'     => 'Mountain View Room',
                        'description'   => 'Wake up to breathtaking Himalayan views every morning.',
                        'base_price'    => 6000,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Queen',
                        'amenities'     => ['Heater', 'TV', 'WiFi', 'Balcony'],
                        'rooms'         => ['M01', 'M02'],
                    ],
                ],
            ],
            [
                'name'           => 'Bandipur Heritage Inn',
                'description'    => 'Charming heritage inn in the medieval hilltop town of Bandipur with traditional architecture.',
                'address'        => 'Bandipur Bazaar, Tanahun',
                'city'           => 'Tanahun',
                'phone'          => '9856789012',
                'email'          => 'info@bandipurinn.com',
                'rating'         => 4.4,
                'total_reviews'  => 95,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Heritage Architecture', 'Rooftop'],
                'policies'       => 'Check-in: 1:00 PM, Check-out: 11:00 AM. Flexible cancellation.',
                'room_types'     => [
                    [
                        'type_name'     => 'Heritage Room',
                        'description'   => 'Traditional Newari-style room with wooden carvings and antique decor.',
                        'base_price'    => 3800,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Double',
                        'amenities'     => ['Fan', 'WiFi', 'Hot Water'],
                        'rooms'         => ['H01', 'H02'],
                    ],
                ],
            ],
            [
                'name'           => 'Mustang Eco Hotel',
                'description'    => 'Unique eco hotel in the mystical Mustang region with Tibetan-influenced architecture.',
                'address'        => 'Lo-Manthang, Mustang',
                'city'           => 'Mustang',
                'phone'          => '9867890123',
                'email'          => 'info@mustangeco.com',
                'rating'         => 4.2,
                'total_reviews'  => 75,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Trekking Guide', 'Cultural Tours'],
                'policies'       => 'Check-in: 2:00 PM, Check-out: 10:00 AM. Non-refundable.',
                'room_types'     => [
                    [
                        'type_name'     => 'Tibetan Style Room',
                        'description'   => 'Authentic Tibetan-style room with traditional furnishings and desert views.',
                        'base_price'    => 4000,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Double',
                        'amenities'     => ['Heater', 'WiFi', 'Hot Water'],
                        'rooms'         => ['T01', 'T02'],
                    ],
                ],
            ],
            [
                'name'           => 'Ilam Tea Garden Resort',
                'description'    => 'Serene resort nestled among lush tea gardens in the hills of eastern Nepal.',
                'address'        => 'Ilam Bazaar, Ilam',
                'city'           => 'Ilam',
                'phone'          => '9878901234',
                'email'          => 'info@ilamresort.com',
                'rating'         => 4.1,
                'total_reviews'  => 60,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Tea Garden Walk', 'Parking'],
                'policies'       => 'Check-in: 1:00 PM, Check-out: 11:00 AM. Flexible cancellation.',
                'room_types'     => [
                    [
                        'type_name'     => 'Garden View Room',
                        'description'   => 'Peaceful room overlooking the green tea gardens.',
                        'base_price'    => 2800,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Double',
                        'amenities'     => ['Fan', 'TV', 'WiFi', 'Balcony'],
                        'rooms'         => ['G01', 'G02'],
                    ],
                ],
            ],
            [
                'name'           => 'Janakpur Palace Hotel',
                'description'    => 'Grand hotel in the religious city of Janakpur, close to the famous Janaki Temple.',
                'address'        => 'Ram Mandir Road, Janakpur',
                'city'           => 'Janakpur',
                'phone'          => '9889012345',
                'email'          => 'info@janakpurpalace.com',
                'rating'         => 4.0,
                'total_reviews'  => 88,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Parking', 'Temple View'],
                'policies'       => 'Check-in: 12:00 PM, Check-out: 11:00 AM. Flexible cancellation.',
                'room_types'     => [
                    [
                        'type_name'     => 'Premium Room',
                        'description'   => 'Well-furnished premium room with temple view and modern amenities.',
                        'base_price'    => 3200,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Queen',
                        'amenities'     => ['AC', 'TV', 'WiFi'],
                        'rooms'         => ['P01', 'P02'],
                    ],
                ],
            ],
            [
                'name'           => 'Tansen Hilltop Hotel',
                'description'    => 'Boutique hotel in the ancient town of Tansen with panoramic valley views.',
                'address'        => 'Tansen Durbar, Palpa',
                'city'           => 'Palpa',
                'phone'          => '9890123456',
                'email'          => 'info@tansenhilltop.com',
                'rating'         => 4.3,
                'total_reviews'  => 110,
                'status'         => 'active',
                'is_featured'    => false,
                'featured_image' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
                'amenities'      => ['WiFi', 'Restaurant', 'Valley View', 'Rooftop Terrace'],
                'policies'       => 'Check-in: 2:00 PM, Check-out: 12:00 PM. 24-hour cancellation policy.',
                'room_types'     => [
                    [
                        'type_name'     => 'Valley View Room',
                        'description'   => 'Charming room with stunning views of the Palpa valley.',
                        'base_price'    => 3000,
                        'max_occupancy' => 2,
                        'bed_type'      => 'Double',
                        'amenities'     => ['Fan', 'TV', 'WiFi', 'Balcony'],
                        'rooms'         => ['V01', 'V02'],
                    ],
                ],
            ],
        ];

        foreach ($hotels as $hotelData) {
            $roomTypesData = $hotelData['room_types'];
            unset($hotelData['room_types']);

            $hotel = Hotel::create(array_merge($hotelData, ['admin_id' => $admin->id]));

            foreach ($roomTypesData as $rtData) {
                $roomNumbers = $rtData['rooms'];
                unset($rtData['rooms']);

                $roomType = RoomType::create(array_merge($rtData, ['hotel_id' => $hotel->id]));

                foreach ($roomNumbers as $number) {
                    Room::create([
                        'hotel_id'     => $hotel->id,
                        'room_type_id' => $roomType->id,
                        'room_number'  => $number,
                        'floor'        => 1,
                        'status'       => 'available',
                    ]);
                }
            }
        }

        $this->command->info('10 hotels with room types and rooms seeded successfully.');
    }
}
