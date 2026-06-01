<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agent 配置表
        Schema::create('agent_configs', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('enabled')->default(true);
            
            // 核心配置
            $table->foreignId('model_id')->nullable()->constrained('model_configs');
            $table->foreignId('system_prompt_id')->nullable()->constrained('prompt_configs');
            
            // 运行时限制
            $table->integer('max_tokens')->default(4000);
            $table->decimal('temperature', 3, 2)->default(0.70);
            $table->decimal('top_p', 3, 2)->nullable();
            $table->integer('timeout_seconds')->default(120);
            
            // 权限与可见性
            $table->string('min_role')->default('merchant');
            $table->boolean('is_public')->default(false);
            $table->json('tags')->nullable();
            
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['enabled', 'created_at']);
        });
        
        // Tool 配置表
        Schema::create('tool_configs', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // http, db_query, mcp_service, custom_function
            
            // 实现细节
            $table->string('handler_class');
            $table->string('icon')->nullable();
            $table->text('documentation')->nullable();
            
            // 配置参数
            $table->json('config')->nullable();
            $table->json('required_params')->nullable();
            
            $table->boolean('enabled')->default(true);
            $table->json('tags')->nullable();
            
            // 限流
            $table->integer('rate_limit')->nullable();
            $table->decimal('cost_per_call', 10, 4)->default(0);
            
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['enabled', 'created_at']);
        });
        
        // Agent ↔ Tool 关联表
        Schema::create('agent_tool_bindings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agent_configs')->onDelete('cascade');
            $table->foreignId('tool_id')->constrained('tool_configs')->onDelete('cascade');
            
            // 工具参数映射
            $table->json('tool_params')->nullable();
            
            // 使用优先级
            $table->integer('priority')->default(0);
            
            // 条件执行
            $table->json('condition')->nullable();
            
            // 链式调用
            $table->foreignId('next_tool_id')->nullable()->constrained('tool_configs');
            
            $table->timestamps();
            
            $table->unique(['agent_id', 'tool_id']);
            $table->index(['agent_id', 'priority']);
        });
        
        // Workflow 配置表
        Schema::create('workflow_configs', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            
            // 工作流定义（DAG）
            $table->json('graph');
            
            $table->boolean('enabled')->default(true);
            
            // 运行策略
            $table->string('execution_mode')->default('sequential'); // sequential, parallel, conditional
            $table->json('retry_strategy')->nullable();
            $table->integer('timeout_seconds')->default(300);
            
            // 成本与性能
            $table->decimal('avg_cost', 10, 4)->nullable();
            $table->integer('avg_duration_seconds')->nullable();
            $table->decimal('success_rate', 5, 4)->nullable();
            
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['enabled', 'created_at']);
        });
        
        // Prompt 配置表
        Schema::create('prompt_configs', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->index();
            $table->string('name');
            $table->text('description')->nullable();
            
            // Prompt 内容
            $table->longText('content');
            $table->json('variables')->nullable();
            
            // 版本管理
            $table->string('version')->default('1.0');
            $table->string('status')->default('draft'); // draft, testing, production, archived
            
            // 性能指标
            $table->decimal('avg_quality_score', 3, 2)->nullable();
            $table->json('test_results')->nullable();
            
            // 变体/AB测试
            $table->string('variant_type')->nullable(); // control, variant_a, variant_b
            $table->foreignId('parent_id')->nullable()->constrained('prompt_configs');
            
            $table->boolean('enabled')->default(true);
            $table->json('tags')->nullable();
            
            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['namespace', 'version']);
            $table->index(['status', 'enabled']);
        });
        
        // Model 配置表
        Schema::create('model_configs', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->unique()->index();
            $table->string('name');
            $table->string('provider'); // openai, anthropic, google, local, etc
            $table->string('model_name');
            
            // API 配置
            $table->string('api_endpoint')->nullable();
            $table->text('api_key_encrypted')->nullable();
            $table->text('api_key_backup')->nullable();
            
            // 模型能力
            $table->integer('max_tokens')->default(4096);
            $table->integer('context_window')->default(8192);
            $table->boolean('supports_function_calling')->default(false);
            $table->boolean('supports_vision')->default(false);
            $table->boolean('supports_json_mode')->default(false);
            
            // 成本
            $table->decimal('input_cost_per_1k', 10, 6)->default(0);
            $table->decimal('output_cost_per_1k', 10, 6)->default(0);
            
            // 性能指标
            $table->integer('avg_latency_ms')->nullable();
            $table->decimal('availability_percentage', 5, 2)->default(100);
            
            // 使用限制
            $table->boolean('enabled')->default(true);
            $table->integer('rate_limit_per_minute')->nullable();
            $table->decimal('monthly_quota_budget', 10, 2)->nullable();
            
            $table->integer('priority')->default(0);
            $table->foreignId('fallback_model_id')->nullable()->constrained('model_configs');
            
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['enabled', 'priority']);
        });
        
        // Model ↔ Agent 映射表
        Schema::create('model_agent_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agent_configs')->onDelete('cascade');
            $table->foreignId('model_id')->constrained('model_configs')->onDelete('cascade');
            
            // 优先级与条件
            $table->integer('priority')->default(0);
            $table->json('condition')->nullable();
            
            // 参数覆盖
            $table->decimal('temperature_override', 3, 2)->nullable();
            $table->integer('max_tokens_override')->nullable();
            
            $table->timestamps();
            
            $table->unique(['agent_id', 'model_id']);
            $table->index(['agent_id', 'priority']);
        });
        
        // MCP 配置表
        Schema::create('mcp_configs', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            
            // MCP 服务
            $table->string('server_url');
            $table->string('server_type'); // qdrant, langchain_hub, custom
            $table->text('auth_token_encrypted')->nullable();
            
            // 知识库连接
            $table->string('knowledge_base_id')->nullable();
            $table->string('embedding_model')->nullable();
            $table->integer('chunk_size')->default(1024);
            $table->integer('overlap')->default(100);
            
            // 搜索策略
            $table->string('search_method')->default('similarity');
            $table->integer('top_k')->default(5);
            $table->decimal('similarity_threshold', 3, 2)->default(0.7);
            
            $table->boolean('enabled')->default(true);
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['enabled', 'created_at']);
        });
        
        // Agent 执行日志表
        Schema::create('agent_execution_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->nullable()->constrained('stores');
            $table->foreignId('user_id')->nullable()->constrained('users');
            
            $table->foreignId('agent_id')->constrained('agent_configs');
            $table->foreignId('model_id')->nullable()->constrained('model_configs');
            
            // 输入输出
            $table->longText('input_text')->nullable();
            $table->integer('input_tokens')->nullable();
            $table->integer('output_tokens')->nullable();
            
            $table->longText('result')->nullable();
            $table->string('status'); // success, partial, failed, timeout
            $table->text('error_message')->nullable();
            
            // 性能
            $table->integer('execution_duration_ms')->nullable();
            $table->decimal('cost', 10, 6)->default(0);
            
            // 用户反馈
            $table->integer('user_rating')->nullable(); // 1-5
            $table->text('user_feedback')->nullable();
            
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            $table->index(['store_id', 'created_at']);
            $table->index(['agent_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_execution_logs');
        Schema::dropIfExists('mcp_configs');
        Schema::dropIfExists('model_agent_mappings');
        Schema::dropIfExists('model_configs');
        Schema::dropIfExists('prompt_configs');
        Schema::dropIfExists('workflow_configs');
        Schema::dropIfExists('agent_tool_bindings');
        Schema::dropIfExists('tool_configs');
        Schema::dropIfExists('agent_configs');
    }
};
