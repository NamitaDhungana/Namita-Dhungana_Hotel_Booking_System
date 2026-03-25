<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@stayhub.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('password123'),
                'role'              => 'super_admin',
                'phone'             => '9841000000',
                'is_approved'       => true,
                'registration_status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}
