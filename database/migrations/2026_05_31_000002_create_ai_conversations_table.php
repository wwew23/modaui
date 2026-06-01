<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 创建 AI 对话表，支持多租户隔离
     * 每条对话都绑定到特定的店铺，记录对话类型（后台/前台）
     */
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ai_setting_id')->index();
            $table->unsignedBigInteger('shop_id')->index();
            $table->string('tenant_key', 255)->index();
            $table->enum('type', ['backend_assistant', 'storefront_agent'])->default('storefront_agent')->comment('对话类型');
            $table->string('session_id', 255)->nullable()->comment('会话 ID');
            $table->string('user_id', 255)->nullable()->comment('用户标识（店铺内部）');
            $table->string('ip_address', 45)->nullable()->comment('IP 地址');
            $table->json('metadata')->nullable()->comment('元数据：浏览器信息、设备类型等');
            $table->integer('total_messages')->default(0)->comment('该对话的消息总数');
            $table->unsignedInteger('tokens_used')->default(0)->comment('该对话消耗的 token 数');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            // 外键
            $table->foreign('ai_setting_id')->references('id')->on('ai_settings')->onDelete('cascade');

            // 索引，便于按时间和租户查询
            $table->index(['tenant_key', 'type', 'created_at']);
            $table->index(['shop_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};
