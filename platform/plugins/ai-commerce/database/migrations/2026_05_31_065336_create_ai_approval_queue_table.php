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
        Schema::create('ai_approval_queue', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id');
            $table->string('action_type'); // e.g., product_update, discount_create
            $table->json('payload');       // 待执行的数据
            $table->string('status')->default('pending'); // pending, approved, rejected, executed
            $table->text('reason')->nullable(); // AI 解释为什么要执行此操作
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_approval_queue');
    }
};
