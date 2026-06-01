<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 创建 AI 消息表
     * 记录每条对话中的消息，支持工具调用的追踪
     */
    public function up(): void
    {
        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id')->index();
            $table->unsignedBigInteger('shop_id')->index();
            $table->enum('role', ['user', 'assistant', 'tool', 'system'])->comment('消息角色');
            $table->longText('content')->comment('消息内容');
            $table->string('tool_name', 255)->nullable()->comment('工具名称（仅当 role=tool 时）');
            $table->json('tool_args')->nullable()->comment('工具输入参数');
            $table->json('tool_output')->nullable()->comment('工具输出');
            $table->unsignedInteger('tokens_used')->default(0)->comment('该消息消耗的 token 数');
            $table->json('metadata')->nullable()->comment('额外元数据');
            $table->timestamps();

            // 外键
            $table->foreign('conversation_id')->references('id')->on('ai_conversations')->onDelete('cascade');

            // 索引
            $table->index(['shop_id', 'created_at']);
            $table->index(['conversation_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
    }
};
