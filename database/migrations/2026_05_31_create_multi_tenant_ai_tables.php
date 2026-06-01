<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Shopify 店铺映射表
        Schema::create('shopify_shops', function (Blueprint $table) {
            $table->id();
            $table->string('shop_domain')->unique();
            $table->string('shopify_shop_id')->nullable()->index();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->text('access_token'); // 加密存储
            $table->string('scope')->nullable();
            $table->string('currency')->default('EUR');
            $table->string('timezone')->default('UTC');
            $table->boolean('is_active')->default(true)->index();
            $table->dateTime('installed_at')->useCurrent();
            $table->dateTime('uninstalled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['vendor_id', 'is_active']);
            $table->index('shop_domain');
        });

        // 2. AI 租户配置表（核心）
        Schema::create('ai_tenant_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shopify_shop_id');
            $table->string('tenant_key')->unique(); // shop_domain
            
            // 后台 AI 助手配置
            $table->json('backend_assistant')->nullable();
            
            // 前端 AI 导购配置
            $table->json('storefront_agent')->nullable();
            
            // Storefront MCP 连接信息
            $table->string('storefront_mcp_endpoint')->nullable();
            $table->text('storefront_mcp_api_key')->nullable(); // 加密
            
            // 配额管理
            $table->json('quota')->nullable();
            
            // 监控
            $table->boolean('enable_logging')->default(true);
            $table->string('logging_level')->default('info');
            $table->json('webhook_config')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops')->onDelete('cascade');
            $table->index('tenant_key');
        });

        // 3. AI 会话表（按店隔离）
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shopify_shop_id');
            $table->string('tenant_key');
            $table->enum('agent_type', ['backend_assistant', 'storefront_agent']);
            $table->string('session_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('customer_id')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('message_count')->default(0);
            $table->integer('token_used')->default(0);
            $table->dateTime('started_at');
            $table->dateTime('ended_at')->nullable();
            $table->timestamps();

            $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops')->onDelete('cascade');
            $table->index(['shopify_shop_id', 'agent_type', 'created_at']);
            $table->index(['tenant_key', 'created_at']);
        });

        // 4. AI 消息表
        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->string('tenant_key');
            $table->enum('role', ['user', 'assistant', 'tool', 'system']);
            $table->longText('content');
            $table->string('tool_name')->nullable();
            $table->json('tool_args')->nullable();
            $table->json('tool_output')->nullable();
            $table->integer('tokens_used')->default(0);
            $table->string('model')->nullable();
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('ai_conversations')->onDelete('cascade');
            $table->index(['tenant_key', 'created_at']);
        });

        // 5. 使用计量表（便于计费）
        Schema::create('ai_usage_metrics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shopify_shop_id');
            $table->string('tenant_key');
            $table->date('metric_date');
            $table->enum('agent_type', ['backend_assistant', 'storefront_agent']);
            $table->integer('conversation_count')->default(0);
            $table->integer('message_count')->default(0);
            $table->integer('token_used')->default(0);
            $table->integer('tokens_cost_cents')->nullable(); // 成本（美分）
            $table->integer('tool_call_count')->default(0);
            $table->json('feature_usage')->nullable();
            $table->timestamps();

            $table->unique(['shopify_shop_id', 'metric_date', 'agent_type']);
            $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops')->onDelete('cascade');
            $table->index(['tenant_key', 'metric_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_metrics');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('ai_tenant_configs');
        Schema::dropIfExists('shopify_shops');
    }
};
