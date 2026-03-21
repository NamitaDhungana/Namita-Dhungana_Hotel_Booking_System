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
        Schema::table('amenities', function (Blueprint $table) {
            $table->dropColumn(['icon', 'category']);
        });

        Schema::table('amenities', function (Blueprint $table) {
            $table->enum('type', ['facility', 'feature'])->default('facility')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->string('icon', 100)->nullable();
            $table->enum('category', ['hotel', 'room', 'both'])->default('both');
        });
    }
};
