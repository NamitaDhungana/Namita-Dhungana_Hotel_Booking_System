<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->text('manager_response')->nullable()->after('comment');
            $table->unsignedBigInteger('responded_by')->nullable()->after('manager_response');
            $table->timestamp('responded_at')->nullable()->after('responded_by');
            $table->unsignedBigInteger('moderated_by')->nullable()->after('responded_at');
            $table->timestamp('moderated_at')->nullable()->after('moderated_by');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['manager_response', 'responded_by', 'responded_at', 'moderated_by', 'moderated_at']);
        });
    }
};
