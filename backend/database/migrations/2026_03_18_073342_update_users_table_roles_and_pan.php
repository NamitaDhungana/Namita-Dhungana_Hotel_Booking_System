<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('users', 'pan_number')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('pan_number')->nullable()->after('address');
            });
        }

        // 1. Temporarily allow both 'user' and 'customer'
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'customer', 'admin', 'super_admin') DEFAULT 'customer'");

        // 2. Update existing 'user' roles to 'customer'
        \Illuminate\Support\Facades\DB::table('users')->where('role', 'user')->update(['role' => 'customer']);

        // 3. Finally remove 'user' from enum
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'super_admin') DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'customer', 'admin', 'super_admin') DEFAULT 'user'");

        \Illuminate\Support\Facades\DB::table('users')->where('role', 'customer')->update(['role' => 'user']);

        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'super_admin') DEFAULT 'user'");

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pan_number');
        });
    }
};
