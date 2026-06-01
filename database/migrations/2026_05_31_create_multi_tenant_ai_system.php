<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 多租户 AI 系统核心表
 * 
 * 设计思路：
 * - shopify_shops: 每个 Shopify 店铺（多租户基础）
 * - ai_configs: 每个店 + 每种 agent 的配置（规范化）
 * - ai_conversations: 每次对话会话
 * - ai_messages: 对话中的每条消息
 * - ai_usage_metrics: 计量和计费
 */
return new class extends Migration
{
    public function up(): void
    {
        // ===== 1. Shopify 店铺映射表 =====
        if (!Schema::hasTable('shopify_shops')) {
            Schema::create('shopify_shops', function (Blueprint $table) {
                $table->id();
                $table->string('shop_domain')->unique();           // xxx.myshopify.com
                $table->string('shopify_shop_id')->nullable()->index();
                $table->unsignedBigInteger('vendor_id')->nullable(); // 关联到 ModaUI 商家（可选）
                $table->text('access_token');                      // Admin API Token（加密）
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
        }

        // ===== 2. AI 配置表（核心：多租户 + 多 agent 类型） =====
        if (!Schema::hasTable('ai_configs')) {
            Schema::create('ai_configs', function (Blueprint $table) {
                $table->id();

                // 关键外键
                $table->unsignedBigInteger('shopify_shop_id')->index();
                
                // Agent 类型：backend_assistant / storefront_agent / ...
                $table->string('agent_type', 50);

                // 常用字段（单列，便于查询/筛选）
                $table->boolean('enabled')->default(true)->index();
                $table->string('language', 10)->default('zh-CN');
                $table->text('tone_of_voice')->nullable();         // "友好、简洁、专业"

                // 详细配置 JSON
                // 包含：welcome_message, suggested_prompts, features (开关), 
                //       limits (限流), model_config (模型参数), 等
                $table->json('settings')->nullable();

                $table->timestamps();
                $table->softDeletes();

                // 每个店 + agent 类型组合唯一
                $table->unique(['shopify_shop_id', 'agent_type']);
                
                $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops')->onDelete('cascade');
            });
        }

        // ===== 3. AI 会话表 =====
        if (!Schema::hasTable('ai_conversations')) {
            Schema::create('ai_conversations', function (Blueprint $table) {
                $table->id();

                // 关键外键
                $table->unsignedBigInteger('shopify_shop_id')->index();
                $table->unsignedBigInteger('ai_config_id')->index();
                
                // 识别
                $table->string('tenant_key');                      // shop_domain（冗余，便于快速查询）
                $table->string('agent_type', 50);                  // backend_assistant / storefront_agent
                $table->string('session_id')->nullable()->index(); // 前端导购的 session ID
                
                // 用户识别
                $table->unsignedBigInteger('user_id')->nullable(); // 后台助手：商家用户 ID
                $table->string('customer_id')->nullable();         // 前端导购：顾客标识
                
                // 会话信息
                $table->json('metadata')->nullable();              // IP、User-Agent、来源等
                $table->integer('message_count')->default(0);
                $table->integer('token_used')->default(0);
                $table->dateTime('started_at');
                $table->dateTime('ended_at')->nullable();
                
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops')->onDelete('cascade');
                $table->foreign('ai_config_id')->references('id')->on('ai_configs')->onDelete('cascade');
                $table->index(['shopify_shop_id', 'agent_type', 'created_at']);
                $table->index(['tenant_key', 'created_at']);
            });
        }

        // ===== 4. AI 消息表 =====
        if (!Schema::hasTable('ai_messages')) {
            Schema::create('ai_messages', function (Blueprint $table) {
                $table->id();

                // 关键外键
                $table->unsignedBigInteger('conversation_id')->index();
                
                // 租户标识（冗余，便于跨表查询）
                $table->string('tenant_key');
                
                // 消息角色
                $table->enum('role', ['user', 'assistant', 'tool', 'system']);
                
                // 内容
                $table->longText('content');
                
                // 工具调用信息（如果这是工具调用）
                $table->string('tool_name')->nullable();
                $table->json('tool_args')->nullable();
                $table->json('tool_output')->nullable();
                
                // 成本记录
                $table->integer('tokens_used')->default(0);
                $table->string('model')->nullable();               // 使用的模型版本
                
                $table->timestamps();

                $table->foreign('conversation_id')->references('id')->on('ai_conversations')->onDelete('cascade');
                $table->index(['tenant_key', 'created_at']);
                $table->index(['conversation_id', 'created_at']);
            });
        }

        // ===== 5. 使用指标表（计费和分析） =====
        if (!Schema::hasTable('ai_usage_metrics')) {
            Schema::create('ai_usage_metrics', function (Blueprint $table) {
                $table->id();

                // 关键字段
                $table->unsignedBigInteger('shopify_shop_id')->index();
                $table->string('tenant_key');
                $table->date('metric_date')->index();
                $table->string('agent_type', 50);
                
                // 使用统计
                $table->integer('conversation_count')->default(0);
                $table->integer('message_count')->default(0);
                $table->integer('token_used')->default(0);
                $table->integer('tokens_cost_cents')->nullable();  // 成本（美分）
                $table->integer('tool_call_count')->default(0);
                
                // 按功能细分
                $table->json('feature_usage')->nullable();
                
                $table->timestamps();

                // 每天每个店每个 agent 类型一条
                $table->unique(['shopify_shop_id', 'metric_date', 'agent_type']);
                $table->foreign('shopify_shop_id')->references('id')->on('shopify_shops')->onDelete('cascade');
                $table->index(['tenant_key', 'metric_date']);
            });
        }

        // ===== 6. 全局 AI 配置表（可选：用于平台级别的设置） =====
        // 保留原来的 ai_configs 用于全局设置，改名为 ai_global_settings
        if (Schema::hasTable('ai_configs') && !Schema::hasColumn('ai_configs', 'shopify_shop_id')) {
            Schema::rename('ai_configs', 'ai_global_settings');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_metrics');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('ai_configs');
        Schema::dropIfExists('shopify_shops');
        
        // 恢复全局设置表
        if (Schema::hasTable('ai_global_settings')) {
            Schema::rename('ai_global_settings', 'ai_configs');
        }
    }
};
