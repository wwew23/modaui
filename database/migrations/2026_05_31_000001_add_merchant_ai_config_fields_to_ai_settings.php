<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 为 ai_settings 添加多商家 SaaS 化所需的配置字段
     * 
     * 字段说明:
     * - enabled_features: JSON 格式，标记该商家开放的功能列表
     * - customer_agent_enabled: 顾客 AI 导购是否开放
     * - merchant_agent_enabled: 商家后台 AI 运营助手是否开放
     * - daily_limit: 每日调用 LLM 的次数限制（防滥用/控成本）
     * - customer_tone: 对顾客的语气风格
     * - customer_welcome_message: 对顾客的欢迎语
     * - customer_example_questions: 给顾客的示例提问
     * - merchant_tone: 对商家的语气风格
     * - merchant_welcome_message: 对商家的欢迎语
     * - merchant_example_questions: 给商家的示例提问
     */
    public function up(): void
    {
        Schema::table('ai_settings', function (Blueprint $table) {
            // 功能开关（JSON）
            $table->json('enabled_features')->nullable()->after('runtime_enabled')->comment('开放的功能列表: ["product_suggestion", "sales_analysis", "copywriting", ...]');

            // 配额限制
            $table->unsignedInteger('daily_limit')->default(1000)->after('enabled_features')->comment('每日 LLM 调用次数限制');
            $table->unsignedBigInteger('current_day_usage')->default(0)->after('daily_limit')->comment('当天已使用次数');
            $table->date('usage_reset_date')->nullable()->after('current_day_usage')->comment('配额重置日期');

            // 顾客端配置
            $table->string('customer_tone', 100)->nullable()->after('usage_reset_date')->comment('对顾客的语气风格: friendly, professional, casual, luxurious');
            $table->text('customer_welcome_message')->nullable()->after('customer_tone')->comment('对顾客的欢迎语');
            $table->json('customer_example_questions')->nullable()->after('customer_welcome_message')->comment('给顾客的示例提问');

            // 商家端配置
            $table->string('merchant_tone', 100)->nullable()->after('customer_example_questions')->comment('对商家的语气风格');
            $table->text('merchant_welcome_message')->nullable()->after('merchant_tone')->comment('对商家的欢迎语');
            $table->json('merchant_example_questions')->nullable()->after('merchant_welcome_message')->comment('给商家的示例提问');

            // Shopify 集成信息
            $table->string('shopify_domain', 255)->nullable()->unique()->after('merchant_example_questions')->comment('Shopify 店铺域名');
            $table->text('shopify_access_token')->nullable()->after('shopify_domain')->comment('Shopify Admin API access token');
            $table->string('storefront_mcp_endpoint', 255)->nullable()->after('shopify_access_token')->comment('Storefront MCP server endpoint');

            // 数据隔离标记
            $table->string('tenant_key', 255)->nullable()->unique()->after('storefront_mcp_endpoint')->comment('多租户隔离 key');
        });
    }

    public function down(): void
    {
        Schema::table('ai_settings', function (Blueprint $table) {
            $table->dropUnique(['shopify_domain']);
            $table->dropUnique(['tenant_key']);
            $table->dropColumn([
                'enabled_features',
                'daily_limit',
                'current_day_usage',
                'usage_reset_date',
                'customer_tone',
                'customer_welcome_message',
                'customer_example_questions',
                'merchant_tone',
                'merchant_welcome_message',
                'merchant_example_questions',
                'shopify_domain',
                'shopify_access_token',
                'storefront_mcp_endpoint',
                'tenant_key',
            ]);
        });
    }
};
