<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiSetting extends Model
{
    protected $table = 'ai_settings';

    protected $fillable = [
        'shop_id',
        'enabled',
        'customer_agent_enabled',
        'merchant_agent_enabled',
        'runtime_enabled',
        'industry',
        'style_preset',
        'customer_prompt',
        'merchant_prompt',
        'tools',
        'model_source',
        'model_config',
        // 新增：多商家 SaaS 配置字段
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
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'customer_agent_enabled' => 'boolean',
        'merchant_agent_enabled' => 'boolean',
        'runtime_enabled' => 'boolean',
        'customer_prompt' => 'array',
        'merchant_prompt' => 'array',
        'tools' => 'array',
        'model_config' => 'array',
        'enabled_features' => 'array',
        'customer_example_questions' => 'array',
        'merchant_example_questions' => 'array',
        'usage_reset_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function forShop(int $shopId = 1): self
    {
        return static::firstOrCreate([
            'shop_id' => $shopId,
        ], [
            'enabled' => false,
            'customer_agent_enabled' => false,
            'merchant_agent_enabled' => false,
            'runtime_enabled' => true,
            'industry' => 'fashion',
            'style_preset' => 'italian_street',
            'customer_prompt' => config('ai.prompts.customer.system'),
            'merchant_prompt' => config('ai.prompts.merchant.system'),
            'tools' => [
                'getStylingSuggestions' => [
                    'enabled' => false,
                    'maxLength' => 300,
                    'includeReason' => true,
                ],
            ],
            'model_source' => 'os',
            'model_config' => [
                'endpoint' => env('MODAUI_OS_API_BASE_URL', rtrim(config('app.url'), '/') . '/api/os'),
                'apiKey' => env('MODAUI_INTERNAL_SYSTEM_TOKEN', ''),
            ],
        ]);
    }
}
