<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class HotelManagerSeeder extends Seeder
{
    public function run(): void
    {
        $managers = [
            ['name' => 'Nitu Baral',      'email' => 'nitubaral5@gmail.com'],
            ['name' => 'Nisha Dhungana',  'email' => 'nishadhungana10@gmail.com'],
            ['name' => 'Arushi Dhungana', 'email' => 'arushidhungana9@gmail.com'],
        ];

        foreach ($managers as $manager) {
            User::updateOrCreate(
                ['email' => $manager['email']],
                [
                    'name'                => $manager['name'],
                    'password'            => Hash::make('password'),
                    'role'                => 'admin',
                    'is_approved'         => true,
                    'registration_status' => 'active',
                    'email_verified_at'   => now(),
                ]
            );
        }
    }
}
