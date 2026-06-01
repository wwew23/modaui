<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * AiConfig - 多租户 AI 配置中心
 * 
 * 设计：支持每个店铺有多个 agent_type（后台助手、前端导购等）
 * 关键：(shopify_shop_id, agent_type) 组合唯一
 * 
 * @property int $id
 * @property int $shopify_shop_id
 * @property string $agent_type (backend_assistant, storefront_agent, ...)
 * @property bool $enabled
 * @property string $language (zh-CN, en, ...)
 * @property string $tone_of_voice
 * @property array $settings
 */
class AiConfig extends Model
{
    use SoftDeletes;

    protected $table = 'ai_configs';

    protected $fillable = [
        'shopify_shop_id',
        'agent_type',
        'enabled',
        'language',
        'tone_of_voice',
        'settings',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'settings' => 'array',
    ];

    // ============= 关系 =============

    /**
     * 关联到 ShopifyShop
     */
    public function shop()
    {
        return $this->belongsTo(ShopifyShop::class, 'shopify_shop_id');
    }

    /**
     * Set a global key/value configuration (compat for legacy key/value ai_configs table)
     *
     * @param string $key
     * @param mixed $value
     * @param string $type
     * @param string $group
     * @return bool
     */
    public static function set(string $key, $value, string $type = 'string', string $group = 'general'): bool
    {
        try {
            $storedValue = $value;
            if (is_array($value) || is_object($value)) {
                $storedValue = json_encode($value, JSON_UNESCAPED_UNICODE);
                $type = 'json';
            } elseif (is_bool($value)) {
                $storedValue = $value ? '1' : '0';
                $type = 'boolean';
            } else {
                $storedValue = (string) $value;
            }

            return (bool) DB::table((new static())->getTable())->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $storedValue,
                    'type' => $type,
                    'group' => $group,
                    'updated_at' => now(),
                ]
            );
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Get a stored key value from ai_configs key/value table
     */
    public static function get(string $key, $default = null)
    {
        try {
            $row = DB::table((new static())->getTable())->where('key', $key)->first();
            if (! $row) {
                return $default;
            }

            $val = $row->value;
            $type = $row->type ?? 'string';

            if ($type === 'json') {
                return json_decode($val, true);
            }

            if ($type === 'boolean') {
                return in_array($val, ['1', 1, true, 'true'], true);
            }

            return $val;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    /**
     * 该配置下的所有会话
     */
    public function conversations()
    {
        return $this->hasMany(AiConversation::class, 'ai_config_id');
    }

    // ============= 作用域 =============

    /**
     * 仅获取启用的配置
     */
    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    /**
     * 按 agent 类型过滤
     */
    public function scopeByAgentType($query, string $agentType)
    {
        return $query->where('agent_type', $agentType);
    }

    /**
     * 按店铺和 agent 类型获取（最常用）
     */
    public function scopeForShop($query, $shopId, string $agentType)
    {
        return $query->where('shopify_shop_id', $shopId)
                     ->where('agent_type', $agentType);
    }

    // ============= 业务方法 =============

    /**
     * 获取该配置的所有设置
     */
    public function getSettings(): array
    {
        return $this->settings ?? $this->getDefaultSettings();
    }

    /**
     * 获取欢迎语
     */
    public function getWelcomeMessage(): string
    {
        return $this->settings['welcome_message'] ?? $this->getDefaultWelcomeMessage();
    }

    /**
     * 获取建议提问列表
     */
    public function getSuggestedPrompts(): array
    {
        return $this->settings['suggested_prompts'] ?? [];
    }

    /**
     * 获取功能开关
     */
    public function getFeatureFlags(): array
    {
        return $this->settings['features'] ?? $this->getDefaultFeatureFlags();
    }

    /**
     * 获取限流配置
     */
    public function getRateLimits(): array
    {
        return $this->settings['limits'] ?? $this->getDefaultRateLimits();
    }

    /**
     * 获取模型配置
     */
    public function getModelConfig(): array
    {
        return $this->settings['model_config'] ?? $this->getDefaultModelConfig();
    }

    /**
     * 检查是否启用某个功能
     */
    public function isFeatureEnabled(string $feature): bool
    {
        return $this->getFeatureFlags()[$feature] ?? false;
    }

    /**
     * 获取每日限制（对话数或 token 数）
     */
    public function getDailyLimit(): int
    {
        return $this->getRateLimits()['daily_limit'] ?? 1000;
    }

    /**
     * 获取每个会话的消息数限制
     */
    public function getMaxMessagesPerSession(): int
    {
        return $this->getRateLimits()['max_messages_per_session'] ?? 50;
    }

    /**
     * 更新设置中的特定字段
     */
    public function updateSetting(string $key, $value): void
    {
        $settings = $this->settings ?? [];
        $settings[$key] = $value;
        $this->update(['settings' => $settings]);
    }

    /**
     * 更新整个 settings JSON
     */
    public function updateSettings(array $newSettings): void
    {
        $this->update(['settings' => $newSettings]);
    }

    // ============= 默认配置 =============

    private function getDefaultSettings(): array
    {
        return match ($this->agent_type) {
            'backend_assistant' => [
                'welcome_message' => '您好，我是该店铺的 AI 运营助手，为您提供销售分析和优化建议。',
                'suggested_prompts' => [
                    '分析这个月的销售趋势',
                    '诊断哪些商品销售不佳',
                    '帮我优化这件商品的文案',
                ],
                'features' => $this->getDefaultFeatureFlags(),
                'limits' => $this->getDefaultRateLimits(),
                'model_config' => $this->getDefaultModelConfig(),
            ],
            'storefront_agent' => [
                'welcome_message' => '嗨！我是你的 AI 导购，有什么问题随时问我～',
                'suggested_prompts' => [
                    '帮我推荐 3 件适合的商品',
                    '我 168cm，推荐我一条裤子',
                    '帮我查看订单状态',
                ],
                'features' => $this->getDefaultFeatureFlags(),
                'limits' => $this->getDefaultRateLimits(),
                'model_config' => $this->getDefaultModelConfig(),
            ],
            default => [],
        };
    }

    private function getDefaultWelcomeMessage(): string
    {
        return match ($this->agent_type) {
            'backend_assistant' => '您好，我是 AI 运营助手。',
            'storefront_agent' => '嗨！我是 AI 导购～',
            default => 'Hello! 👋',
        };
    }

    private function getDefaultFeatureFlags(): array
    {
        return match ($this->agent_type) {
            'backend_assistant' => [
                'sales_analysis' => true,
                'product_diagnosis' => true,
                'copywriting_suggestions' => true,
                'trend_analysis' => true,
            ],
            'storefront_agent' => [
                'product_search' => true,
                'product_recommendation' => true,
                'cart_operations' => true,
                'order_status' => true,
                'faq_search' => true,
            ],
            default => [],
        };
    }

    private function getDefaultRateLimits(): array
    {
        return match ($this->agent_type) {
            'backend_assistant' => [
                'daily_limit' => 100000,  // tokens per day
                'monthly_limit' => 3000000,
                'max_messages_per_session' => 50,
                'max_concurrent_sessions' => 5,
            ],
            'storefront_agent' => [
                'daily_limit' => 50000,
                'monthly_limit' => 1500000,
                'max_messages_per_session' => 30,
                'max_daily_conversations' => 500,
            ],
            default => [],
        };
    }

    private function getDefaultModelConfig(): array
    {
        return match ($this->agent_type) {
            'backend_assistant' => [
                'model' => 'gpt-4-turbo',
                'temperature' => 0.7,
                'max_tokens' => 2000,
            ],
            'storefront_agent' => [
                'model' => 'gpt-4-mini',
                'temperature' => 0.8,
                'max_tokens' => 1000,
            ],
            default => [
                'model' => 'gpt-3.5-turbo',
                'temperature' => 0.7,
                'max_tokens' => 500,
            ],
        };
    }
}
