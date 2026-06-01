<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_settings', function (Blueprint $table) {
            $table->boolean('runtime_enabled')->default(true)->after('merchant_agent_enabled');
            $table->json('customer_prompt')->nullable()->after('style_preset');
            $table->json('merchant_prompt')->nullable()->after('customer_prompt');
        });
    }

    public function down(): void
    {
        Schema::table('ai_settings', function (Blueprint $table) {
            $table->dropColumn(['runtime_enabled', 'customer_prompt', 'merchant_prompt']);
        });
    }
};
