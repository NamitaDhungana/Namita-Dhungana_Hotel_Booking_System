<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->string('pidx')->nullable()->after('amount_paid');
            $table->string('transaction_id')->nullable()->after('pidx');
            $table->enum('payment_status', ['unpaid', 'pending', 'completed', 'failed'])
                  ->default('unpaid')->after('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn(['pidx', 'transaction_id', 'payment_status']);
        });
    }
};
