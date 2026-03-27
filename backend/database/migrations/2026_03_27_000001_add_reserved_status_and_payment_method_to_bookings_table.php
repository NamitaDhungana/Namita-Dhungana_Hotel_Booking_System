<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL: modify enum to add 'reserved'
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','reserved','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending'");

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('total_amount'); // khalti | cash
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending'");
    }
};
