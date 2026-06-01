<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_settings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('shop_id')->index();
            $table->boolean('enabled')->default(false);
            $table->boolean('customer_agent_enabled')->default(false);
            $table->boolean('merchant_agent_enabled')->default(false);
            $table->string('industry', 50)->nullable();
            $table->string('style_preset', 50)->nullable();
            $table->json('tools')->nullable();
            $table->string('model_source', 50)->default('os');
            $table->json('model_config')->nullable();
            $table->timestamps();

            // 如果项目有 shops 表，可启用以下外键约束
            // $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_settings');
    }
};
