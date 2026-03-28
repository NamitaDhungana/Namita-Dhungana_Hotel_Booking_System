<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // 'non_refundable' = 100% non-refundable, no cancel after payment
            // '24_hours'       = free cancel if > 24h before check-in
            // 'flexible'       = cancel anytime (default)
            $table->enum('cancellation_policy', ['flexible', '24_hours', 'non_refundable'])
                  ->default('flexible')
                  ->after('cancellation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('cancellation_policy');
        });
    }
};
