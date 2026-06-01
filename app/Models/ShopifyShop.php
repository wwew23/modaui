<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

/**
 * ShopifyShop - Shopify 店铺与 ModaUI 的映射
 * 
 * 多租户架构的关键：每个 Shopify 店铺在这里都有唯一记录
 */
class ShopifyShop extends Model
{
    use SoftDeletes;

    protected $table = 'shopify_shops';

    protected $fillable = [
        'shop_domain',
        'shopify_shop_id',
        'vendor_id',
        'access_token',
        'scope',
        'currency',
        'timezone',
        'is_active',
        'installed_at',
        'uninstalled_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'installed_at' => 'datetime',
        'uninstalled_at' => 'datetime',
    ];

    protected $hidden = [
        'access_token',
    ];

    // ============= 关系 =============

    /**
     * 获取该店铺的所有 AI 配置（可能有多个 agent 类型）
     */
    public function aiConfigs()
    {
        return $this->hasMany(AiConfig::class, 'shopify_shop_id');
    }

    /**
     * 获取该店铺的特定 agent 配置
     */
    public function aiConfig($agentType = 'backend_assistant')
    {
        return $this->aiConfigs()
                    ->where('agent_type', $agentType)
                    ->first();
    }

    /**
     * 获取该店铺的所有对话
     */
    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class, 'shopify_shop_id');
    }

    /**
     * 获取该店铺的所有消息
     */
    public function aiMessages()
    {
        return $this->hasManyThrough(
            AiMessage::class,
            AiConversation::class,
            'shopify_shop_id',
            'conversation_id'
        );
    }

    /**
     * 获取该店铺的使用指标
     */
    public function aiUsageMetrics()
    {
        return $this->hasMany(AiUsageMetric::class, 'shopify_shop_id');
    }

    /**
     * 获取后台 AI 助手的配置
     */
    public function backendAssistantConfig()
    {
        return $this->aiConfig('backend_assistant');
    }

    /**
     * 获取前端 AI 导购的配置
     */
    public function storefrontAgentConfig()
    {
        return $this->aiConfig('storefront_agent');
    }

    // ============= 业务方法 =============

    /**
     * 通过域名查找店铺
     */
    public static function findByDomain(string $domain): ?self
    {
        return static::where('shop_domain', $domain)->first();
    }

    /**
     * 检查店铺是否活跃
     */
    public function isActive(): bool
    {
        return $this->is_active && $this->uninstalled_at === null;
    }

    /**
     * 获取租户键（用于日志和隔离）
     */
    public function getTenantKey(): string
    {
        return $this->shop_domain;
    }

    /**
     * 获取 Admin API 的 access token
     */
    public function getDecryptedAccessToken(): string
    {
        return Crypt::decryptString($this->access_token);
    }

    /**
     * 设置并加密 access token
     */
    public function setAccessTokenAttribute(string $value)
    {
        $this->attributes['access_token'] = Crypt::encryptString($value);
    }

    /**
     * 获取该店铺今日的消息数
     */
    public function getTodayMessageCount(string $agentType = 'backend_assistant'): int
    {
        return $this->aiConversations()
            ->where('agent_type', $agentType)
            ->whereDate('created_at', today())
            ->sum('message_count');
    }

    /**
     * 获取该店铺本月的 token 消耗
     */
    public function getMonthlyTokenUsage(): int
    {
        return $this->aiUsageMetrics()
            ->whereMonth('metric_date', now()->month)
            ->whereYear('metric_date', now()->year)
            ->sum('token_used');
    }

    /**
     * 获取该店铺本月的成本（美分）
     */
    public function getMonthlyCostCents(): int
    {
        return $this->aiUsageMetrics()
            ->whereMonth('metric_date', now()->month)
            ->whereYear('metric_date', now()->year)
            ->sum('tokens_cost_cents');
    }

    /**
     * 获取最后一次 AI 使用时间
     */
    public function getLastAiUsageTime()
    {
        return $this->aiConversations()
            ->latest('ended_at')
            ->value('ended_at');
    }
}
