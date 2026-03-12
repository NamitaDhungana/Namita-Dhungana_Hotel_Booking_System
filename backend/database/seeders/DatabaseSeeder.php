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
        // Create Admin User
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@stayhub.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '1234567890',
        ]);

        $admin = Admin::create([
            'user_id' => $adminUser->id,
            'status' => 'active',
        ]);

        // Create Regular User
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'phone' => '0987654321',
        ]);

        // Create Hotels
        $hotel1 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Kathmandu Luxury Hotel',
            'property_type' => 'hotel',
            'description' => 'Experience luxury in the heart of Kathmandu.',
            'address' => 'Thamel, Kathmandu',
            'city' => 'Kathmandu',
            'phone' => '01-4444444',
            'email' => 'info@ktmluxury.com',
            'rating' => 4.5,
            'total_reviews' => 10,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 27.7172,
            'longitude' => 85.3240,
            'amenities' => ['WiFi', 'Pool', 'Spa', 'Restaurant'],
            'policies' => 'No smoking. Check-in after 2PM.',
            'is_featured' => true,
        ]);

        $hotel2 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Pokhara Lakeside Resort',
            'property_type' => 'hotel',
            'description' => 'Beautiful resort by the Phewa Lake.',
            'address' => 'Lakeside, Pokhara',
            'city' => 'Pokhara',
            'phone' => '061-555555',
            'email' => 'stay@pokhararesort.com',
            'rating' => 4.8,
            'total_reviews' => 25,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 28.2096,
            'longitude' => 83.9856,
            'amenities' => ['Lake View', 'WiFi', 'Bar', 'Hiking'],
            'policies' => 'Pets allowed. Breakfast included.',
        ]);

        // Create Villas
        $villa1 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Everest View Private Villa',
            'property_type' => 'villa',
            'description' => 'A stunning private villa with an unobstructed view of Mt. Everest.',
            'address' => 'Nagarkot Hill',
            'city' => 'Nagarkot',
            'phone' => '01-6666666',
            'email' => 'contact@everestvilla.com',
            'rating' => 4.9,
            'total_reviews' => 15,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 27.7170,
            'longitude' => 85.5200,
            'amenities' => ['Private Pool', 'Kitchen', 'Fireplace', 'Everest View'],
            'policies' => 'Perfect for families. No loud music after 10PM.',
            'is_featured' => true,
        ]);

        $villa2 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Tropical Jungle Villa',
            'property_type' => 'villa',
            'description' => 'Secluded villa surrounded by the lush greenery of Chitwan.',
            'address' => 'Sauraha',
            'city' => 'Chitwan',
            'phone' => '056-222222',
            'email' => 'raw@jungle-villa.com',
            'rating' => 4.7,
            'total_reviews' => 8,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 27.5833,
            'longitude' => 84.4833,
            'amenities' => ['Safari Tours', 'WiFi', 'Private Garden', 'Hammock'],
            'policies' => 'Eco-friendly property. Respect the wildlife.',
        ]);

        // Create more Hotels
        $hotel3 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Everest Base Camp Lodge',
            'property_type' => 'hotel',
            'description' => 'A cozy lodge at the foot of the world\'s highest mountain.',
            'address' => 'Base Camp Road, Solu-Khumbu',
            'city' => 'Namche Bazaar',
            'phone' => '01-9999999',
            'email' => 'booking@everestlodge.uk',
            'rating' => 4.6,
            'total_reviews' => 45,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1551882547-ff43c63faf76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 27.8069,
            'longitude' => 86.7133,
            'amenities' => ['Heated Rooms', 'Oxygen Supply', 'Restaurant', 'Guide Service'],
            'policies' => 'Acclimatization recommended. Respect local traditions.',
        ]);

        $hotel4 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Lumbini Sacred Garden Hotel',
            'property_type' => 'hotel',
            'description' => 'Find peace and tranquility near the birthplace of Lord Buddha.',
            'address' => 'Sacred Garden Area, Lumbini',
            'city' => 'Lumbini',
            'phone' => '071-888888',
            'email' => 'peace@lumbinihotel.com',
            'rating' => 4.7,
            'total_reviews' => 32,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 27.4789,
            'longitude' => 83.2753,
            'amenities' => ['Meditation Hall', 'Vegetarian Restaurant', 'WiFi', 'Garden'],
            'policies' => 'Respect the sacred surroundings. Quiet hours after 9PM.',
        ]);

        // Create more Villas
        $villa3 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Mustang Desert Breeze Villa',
            'property_type' => 'villa',
            'description' => 'A unique luxury villa in the mystical landscape of Upper Mustang.',
            'address' => 'Lo Manthang',
            'city' => 'Upper Mustang',
            'phone' => '067-111111',
            'email' => 'adventure@mustangvilla.com',
            'rating' => 4.9,
            'total_reviews' => 12,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 29.1833,
            'longitude' => 83.9500,
            'amenities' => ['Earthy Architecture', 'Stargazing Deck', 'Traditional Cuisine', 'Horse Riding'],
            'policies' => 'Restricted area permit required. Eco-friendly stay.',
            'is_featured' => true,
        ]);

        $villa4 = Hotel::create([
            'admin_id' => $admin->id,
            'name' => 'Ghandruk Heritage Villa',
            'property_type' => 'villa',
            'description' => 'Experience the rich Gurung culture in this beautifully restored heritage villa.',
            'address' => 'Gurung Hill, Ghandruk',
            'city' => 'Ghandruk',
            'phone' => '061-777777',
            'email' => 'culture@ghandrukvilla.com',
            'rating' => 4.8,
            'total_reviews' => 28,
            'status' => 'active',
            'featured_image' => 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            'latitude' => 28.3758,
            'longitude' => 83.8064,
            'amenities' => ['Traditional Decor', 'Mountain View', 'Cultural Shows', 'Organic Farm'],
            'policies' => 'Ideal for trekkers. Local hospitality at its best.',
        ]);

        // Room Types for new properties
        $mountainViewRoom = RoomType::create([
            'hotel_id' => $hotel3->id,
            'type_name' => 'Everest Panorama Room',
            'description' => 'Wake up to the spectacular view of Mt. Everest.',
            'base_price' => 4500,
            'max_occupancy' => 2,
            'amenities' => ['Heated Blanket', 'En-suite bath', 'Large Window'],
        ]);

        RoomType::create([
            'hotel_id' => $hotel4->id,
            'type_name' => 'Zen Comfort Suite',
            'description' => 'A peaceful suite designed for relaxation and mindfulness.',
            'base_price' => 3500,
            'max_occupancy' => 2,
            'amenities' => ['Yoga Mat', 'Tea Station', 'Air Purifier'],
        ]);

        RoomType::create([
            'hotel_id' => $villa3->id,
            'type_name' => 'Royal Tibetan Suite',
            'description' => 'Live like Lo Kings in this luxuriously appointed traditional suite.',
            'base_price' => 12000,
            'max_occupancy' => 4,
            'amenities' => ['Antique Furniture', 'Hand-woven Carpets', 'Private Balcony'],
        ]);

        RoomType::create([
            'hotel_id' => $villa4->id,
            'type_name' => 'Heritage Gurung Room',
            'description' => 'Authentic Gurung living experience with modern comforts.',
            'base_price' => 2500,
            'max_occupancy' => 2,
            'amenities' => ['Wooden Panels', 'Himalayan View', 'Shared Balcony'],
        ]);

        // Add some rooms for the new room types
        Room::create([
            'hotel_id' => $hotel3->id,
            'room_type_id' => $mountainViewRoom->id,
            'room_number' => '301',
            'status' => 'available',
        ]);
    }
}
