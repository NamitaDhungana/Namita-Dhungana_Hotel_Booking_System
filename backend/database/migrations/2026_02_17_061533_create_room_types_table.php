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
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('type_name', 50); // Single, Double, Suite
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2);
            $table->integer('max_occupancy');
            $table->string('bed_type', 50)->nullable(); // Single, Double, Queen
            $table->json('amenities')->nullable(); // AC, TV, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};
