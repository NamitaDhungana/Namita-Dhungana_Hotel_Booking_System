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
        Schema::table('room_types', function (Blueprint $table) {
            $table->decimal('area_sqft', 8, 2)->nullable()->after('max_occupancy');
            $table->integer('max_adults')->default(1)->after('area_sqft');
            $table->integer('max_children')->default(0)->after('max_adults');
        });
    }

    public function down(): void
    {
        Schema::table('room_types', function (Blueprint $table) {
            $table->dropColumn(['area_sqft', 'max_adults', 'max_children']);
        });
    }
};
