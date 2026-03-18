<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Hotel;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── SUPER ADMIN ───────────────────────────────────────
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@stayhub.com'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('password123'),
                'role'     => 'super_admin',
                'phone'    => '9841000000',
            ]
        );

        // ── HOTEL MANAGER (ADMIN) ─────────────────────────────
        $hotelManager = User::firstOrCreate(
            ['email' => 'manager@stayhub.com'],
            [
                'name'       => 'Hotel Manager',
                'password'   => Hash::make('password123'),
                'role'       => 'admin',
                'phone'      => '9841000001',
                'pan_number' => 'PAN123456789',
            ]
        );

        $admin = Admin::firstOrCreate(
            ['user_id' => $hotelManager->id],
            ['status' => 'active']
        );

        User::firstOrCreate(
            ['email' => 'namita@example.com'],
            [
                'name'     => 'Namita Dhungana',
                'password' => Hash::make('password'),
                'role'     => 'customer',
                'phone'    => '9841111111',
            ]
        );

        // ── HOTELS ─────────────────────────────────────────────
        $hotels = [
            // 1. Hotel Yak & Yeti
            [
                'name'           => 'Hotel Yak & Yeti',
                'property_type'  => 'hotel',
                'description'    => 'One of Nepal\'s most iconic luxury hotels, blending Rana-era architecture with modern comforts. Located in Durbar Marg, close to royal palaces and the bustling city center.',
                'address'        => 'Durbar Marg, Kathmandu',
                'city'           => 'Kathmandu',
                'phone'          => '01-4248999',
                'email'          => 'info@yakandyeti.com',
                'rating'         => 4.7,
                'total_reviews'  => 120,
                'featured_image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['WiFi', 'Pool', 'Spa', 'Casino', 'Restaurant', 'Gym'],
                'policies'       => 'Check-in: 2 PM. Check-out: 12 PM. No smoking in rooms.',
                'is_featured'    => true,
                'rooms' => [
                    ['type' => 'Deluxe Room',       'price' => 8500,  'capacity' => 2, 'desc' => 'Elegant room with Rana-era decor, king bed, and city views.'],
                    ['type' => 'Premium Suite',     'price' => 15000, 'capacity' => 3, 'desc' => 'Spacious suite with separate living area, premium amenities, and garden views.'],
                    ['type' => 'Heritage Room',     'price' => 12000, 'capacity' => 2, 'desc' => 'Restored heritage wing room with traditional Nepali artwork and modern bath.'],
                ],
            ],
            // 2. Hyatt Regency Kathmandu
            [
                'name'           => 'Hyatt Regency Kathmandu',
                'property_type'  => 'hotel',
                'description'    => 'A 5-star luxury hotel situated near the sacred Boudhanath Stupa, offering world-class hospitality with stunning views of the Himalayan foothills.',
                'address'        => 'Taragaon, Boudha, Kathmandu',
                'city'           => 'Kathmandu',
                'phone'          => '01-5171234',
                'email'          => 'kathmandu.regency@hyatt.com',
                'rating'         => 4.8,
                'total_reviews'  => 200,
                'featured_image' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['WiFi', 'Pool', 'Spa', 'Fitness Center', 'Multiple Restaurants', 'Conference Hall'],
                'policies'       => 'Check-in: 3 PM. Check-out: 12 PM. Child-friendly property.',
                'is_featured'    => true,
                'rooms' => [
                    ['type' => 'Standard King Room', 'price' => 11000, 'capacity' => 2, 'desc' => 'Modern room with king bed, work desk, and mountain or garden views.'],
                    ['type' => 'Regency Suite',      'price' => 22000, 'capacity' => 4, 'desc' => 'Luxurious suite with lounge access, separate living room, and premium bath.'],
                    ['type' => 'Club Twin Room',     'price' => 13000, 'capacity' => 2, 'desc' => 'Twin room with club lounge access, complimentary breakfast and evening cocktails.'],
                ],
            ],
            // 3. Dwarika's Hotel
            [
                'name'           => 'Dwarika\'s Hotel Kathmandu',
                'property_type'  => 'hotel',
                'description'    => 'A heritage boutique hotel showcasing centuries of Newar art and architecture. Every room is a museum piece with hand-carved wooden windows and traditional courtyards.',
                'address'        => 'Battisputali, Kathmandu',
                'city'           => 'Kathmandu',
                'phone'          => '01-4479488',
                'email'          => 'info@dwarikas.com',
                'rating'         => 4.9,
                'total_reviews'  => 180,
                'featured_image' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Heritage Architecture', 'Spa', 'Restaurant', 'WiFi', 'Garden', 'Cultural Programs'],
                'policies'       => 'Check-in: 2 PM. Photography welcome. Respect heritage artifacts.',
                'is_featured'    => true,
                'rooms' => [
                    ['type' => 'Heritage Deluxe',      'price' => 18000, 'capacity' => 2, 'desc' => 'Hand-carved Newari woodwork, traditional brick walls, and premium bedding.'],
                    ['type' => 'Royal Suite',           'price' => 35000, 'capacity' => 4, 'desc' => 'Grand suite with private courtyard, antique furnishings, and panoramic views.'],
                    ['type' => 'Traditional Room',      'price' => 14000, 'capacity' => 2, 'desc' => 'Warm traditional decor with modern comforts and courtyard access.'],
                ],
            ],
            // 4. Temple Tree Resort, Pokhara
            [
                'name'           => 'Temple Tree Resort & Spa',
                'property_type'  => 'hotel',
                'description'    => 'A luxury boutique resort in the heart of Pokhara Lakeside, surrounded by lush gardens with views of the Annapurna range and Phewa Lake.',
                'address'        => 'Lakeside, Pokhara',
                'city'           => 'Pokhara',
                'phone'          => '061-465819',
                'email'          => 'info@templetreenepal.com',
                'rating'         => 4.6,
                'total_reviews'  => 95,
                'featured_image' => 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Lake View', 'WiFi', 'Spa', 'Garden', 'Pool', 'Restaurant'],
                'policies'       => 'Check-in: 1 PM. Free cancellation up to 48hrs. Breakfast included.',
                'rooms' => [
                    ['type' => 'Garden View Room',   'price' => 7500,  'capacity' => 2, 'desc' => 'Cozy room overlooking the tropical gardens with modern amenities.'],
                    ['type' => 'Lake View Suite',    'price' => 14000, 'capacity' => 3, 'desc' => 'Premium suite with private balcony facing Phewa Lake and Annapurna views.'],
                    ['type' => 'Honeymoon Cottage',  'price' => 18000, 'capacity' => 2, 'desc' => 'Romantic private cottage with jacuzzi, canopy bed, and garden terrace.'],
                ],
            ],
            // 5. Tiger Mountain Pokhara Lodge
            [
                'name'           => 'Tiger Mountain Pokhara Lodge',
                'property_type'  => 'hotel',
                'description'    => 'Perched on a ridge above Pokhara with 180-degree panoramic views of the Annapurna Himalayas. An eco-luxury lodge experience like no other.',
                'address'        => 'Lekhnath, Pokhara',
                'city'           => 'Pokhara',
                'phone'          => '061-462343',
                'email'          => 'lodge@tigermountain.com',
                'rating'         => 4.8,
                'total_reviews'  => 65,
                'featured_image' => 'https://images.unsplash.com/photo-1551882547-ff43c63faf76?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Mountain View', 'Organic Food', 'Hiking Trails', 'Bird Watching', 'WiFi'],
                'policies'       => 'Eco-lodge. All meals included. No plastic allowed.',
                'rooms' => [
                    ['type' => 'Mountain View Bungalow', 'price' => 16000, 'capacity' => 2, 'desc' => 'Private stone-walled bungalow with stunning Himalayan panorama.'],
                    ['type' => 'Premium Lodge Room',     'price' => 12000, 'capacity' => 2, 'desc' => 'Cozy lodge room with fireplace, local stone construction, and valley views.'],
                ],
            ],
            // 6. Barahi Jungle Lodge, Chitwan
            [
                'name'           => 'Barahi Jungle Lodge',
                'property_type'  => 'hotel',
                'description'    => 'A luxury jungle lodge at the edge of Chitwan National Park, offering thrilling safari experiences, elephant encounters, and canoe rides through the wild.',
                'address'        => 'Meghauli, Chitwan',
                'city'           => 'Chitwan',
                'phone'          => '056-580112',
                'email'          => 'info@barahijunglelodge.com',
                'rating'         => 4.7,
                'total_reviews'  => 78,
                'featured_image' => 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Jungle Safari', 'Pool', 'Canoe Rides', 'Bird Watching', 'Campfire'],
                'policies'       => 'All meals included. Safari timings fixed by park authority.',
                'rooms' => [
                    ['type' => 'Jungle Deluxe Room',   'price' => 9000,  'capacity' => 2, 'desc' => 'Spacious room with jungle-themed decor, private patio facing the forest.'],
                    ['type' => 'Safari Suite',          'price' => 18000, 'capacity' => 4, 'desc' => 'Premium suite with outdoor shower, private deck, and river views.'],
                    ['type' => 'Standard Cottage',      'price' => 6500,  'capacity' => 2, 'desc' => 'Comfortable cottage surrounded by greenery, ideal for nature lovers.'],
                ],
            ],
            // 7. Nagarkot Farmhouse Resort (Villa)
            [
                'name'           => 'Nagarkot Farmhouse Resort',
                'property_type'  => 'villa',
                'description'    => 'A charming farmhouse villa perched in Nagarkot with unobstructed sunrise views over the Himalayas, including Mt. Everest on clear days.',
                'address'        => 'Nagarkot Hill, Bhaktapur',
                'city'           => 'Nagarkot',
                'phone'          => '01-6680088',
                'email'          => 'stay@nagarkotfarmhouse.com',
                'rating'         => 4.5,
                'total_reviews'  => 55,
                'featured_image' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Sunrise View', 'Organic Farm', 'Fireplace', 'Terrace', 'WiFi'],
                'policies'       => 'Ideal for families. Early morning sunrise viewing. No loud music.',
                'is_featured'    => true,
                'rooms' => [
                    ['type' => 'Sunrise View Room',    'price' => 5500,  'capacity' => 2, 'desc' => 'East-facing room with floor-to-ceiling windows capturing the golden sunrise.'],
                    ['type' => 'Family Farmhouse',     'price' => 8500,  'capacity' => 5, 'desc' => 'Spacious family room with traditional furnishings, fireplace, and mountain view.'],
                    ['type' => 'Honeymoon Suite',      'price' => 10000, 'capacity' => 2, 'desc' => 'Private suite with jacuzzi, panoramic views, and romantic ambiance.'],
                ],
            ],
            // 8. Pavilions Himalayas, Pokhara (Villa)
            [
                'name'           => 'Pavilions Himalayas Pokhara',
                'property_type'  => 'villa',
                'description'    => 'An eco-luxury boutique villa resort overlooking the Annapurna mountains. Each villa is sustainably built with local materials and offers total privacy.',
                'address'        => 'Pumdi Bhumdi, Pokhara',
                'city'           => 'Pokhara',
                'phone'          => '061-463777',
                'email'          => 'hello@pavilionshimalayas.com',
                'rating'         => 4.9,
                'total_reviews'  => 42,
                'featured_image' => 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Private Pool', 'Yoga', 'Organic Farm', 'Himalayan View', 'Spa'],
                'policies'       => 'Eco-friendly property. Solar powered. All organic meals.',
                'is_featured'    => true,
                'rooms' => [
                    ['type' => 'Eco Village Villa',    'price' => 22000, 'capacity' => 4, 'desc' => 'Private eco-villa with plunge pool, organic garden, and 360° mountain views.'],
                    ['type' => 'Himalayan View Room',  'price' => 12000, 'capacity' => 2, 'desc' => 'Hand-built room with stone walls, bamboo ceiling, and Annapurna panorama.'],
                ],
            ],
            // 9. Lumbini Buddha Garden Resort
            [
                'name'           => 'Lumbini Buddha Garden Resort',
                'property_type'  => 'hotel',
                'description'    => 'A peaceful resort near the sacred birthplace of Lord Buddha. Surrounded by monasteries and meditation gardens, perfect for spiritual seekers.',
                'address'        => 'Sacred Garden Area, Lumbini',
                'city'           => 'Lumbini',
                'phone'          => '071-580234',
                'email'          => 'peace@buddhagardenresort.com',
                'rating'         => 4.5,
                'total_reviews'  => 38,
                'featured_image' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Meditation Hall', 'Garden', 'Vegetarian Restaurant', 'WiFi', 'Bicycle Rental'],
                'policies'       => 'Quiet zone. Respect the sacred surroundings. Vegetarian meals only.',
                'rooms' => [
                    ['type' => 'Meditation Room',      'price' => 3500,  'capacity' => 1, 'desc' => 'Simple, serene room designed for mindfulness with natural light and garden view.'],
                    ['type' => 'Zen Comfort Suite',    'price' => 6000,  'capacity' => 2, 'desc' => 'A peaceful suite with Buddhist art, tea station, and monastery views.'],
                    ['type' => 'Garden Family Room',   'price' => 7500,  'capacity' => 4, 'desc' => 'Spacious family room overlooking the Buddhist gardens with two queen beds.'],
                ],
            ],
            // 10. Mustang Adventure Lodge (Villa)
            [
                'name'           => 'Mustang Adventure Lodge',
                'property_type'  => 'villa',
                'description'    => 'A remote luxury lodge in the mysterious Upper Mustang region, featuring traditional Tibetan architecture, stargazing decks, and horse riding adventures.',
                'address'        => 'Lo Manthang, Mustang',
                'city'           => 'Upper Mustang',
                'phone'          => '069-440111',
                'email'          => 'adventure@mustanglodge.com',
                'rating'         => 4.8,
                'total_reviews'  => 22,
                'featured_image' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=80',
                'amenities'      => ['Stargazing Deck', 'Horse Riding', 'Traditional Cuisine', 'Heated Rooms'],
                'policies'       => 'Restricted area permit required. All meals included.',
                'rooms' => [
                    ['type' => 'Royal Tibetan Suite',  'price' => 14000, 'capacity' => 3, 'desc' => 'Luxurious suite with antique Tibetan furniture, hand-woven carpets, and private balcony.'],
                    ['type' => 'Explorer Room',        'price' => 7000,  'capacity' => 2, 'desc' => 'Cozy heated room with traditional decor and views of the desert landscape.'],
                ],
            ],
        ];

        // ── CREATE HOTELS, ROOM TYPES & ROOMS ─────────────────
        foreach ($hotels as $hotelData) {
            $roomsData = $hotelData['rooms'];
            unset($hotelData['rooms']);

            $hotelData['admin_id'] = $admin->id;
            $hotelData['status']   = 'active';
            $hotelData['latitude']  = $hotelData['latitude'] ?? 27.7172;
            $hotelData['longitude'] = $hotelData['longitude'] ?? 85.3240;

            $hotel = Hotel::create($hotelData);

            $roomNumber = 101;
            foreach ($roomsData as $rt) {
                $roomType = RoomType::create([
                    'hotel_id'      => $hotel->id,
                    'type_name'     => $rt['type'],
                    'description'   => $rt['desc'],
                    'base_price'    => $rt['price'],
                    'max_occupancy' => $rt['capacity'],
                    'amenities'     => [],
                ]);

                // Create 3 rooms for each room type
                for ($i = 0; $i < 3; $i++) {
                    Room::create([
                        'hotel_id'     => $hotel->id,
                        'room_type_id' => $roomType->id,
                        'room_number'  => (string) $roomNumber++,
                        'status'       => 'available',
                    ]);
                }
            }
        }
    }
}
