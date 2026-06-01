<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * AiUsageMetric - AI 使用计量表
 * 
 * 按天汇总每个店铺的使用数据
 * 用于计费、报表和分析
 * 
 * @property int $id
 * @property int $shopify_shop_id
 * @property string $tenant_key
 * @property \DateTime $metric_date
 * @property string $agent_type
 * @property int $conversation_count
 * @property int $message_count
 * @property int $token_used
 * @property int $tokens_cost_cents
 * @property int $tool_call_count
 * @property array $feature_usage
 */
class AiUsageMetric extends Model
{
    use SoftDeletes;

    protected $table = 'ai_usage_metrics';

    protected $fillable = [
        'shopify_shop_id',
        'tenant_key',
        'metric_date',
        'agent_type',
        'conversation_count',
        'message_count',
        'token_used',
        'tokens_cost_cents',
        'tool_call_count',
        'feature_usage',
    ];

    protected $casts = [
        'metric_date' => 'date',
        'feature_usage' => 'array',
    ];

    // ============= 关系 =============

    /**
     * 关联的 Shopify 店铺
     */
    public function shop()
    {
        return $this->belongsTo(ShopifyShop::class, 'shopify_shop_id');
    }

    // ============= 作用域 =============

    /**
     * 按店铺过滤
     */
    public function scopeForShop($query, $shopId)
    {
        return $query->where('shopify_shop_id', $shopId);
    }

    /**
     * 按租户过滤
     */
    public function scopeByTenant($query, string $tenantKey)
    {
        return $query->where('tenant_key', $tenantKey);
    }

    /**
     * 按 agent 类型过滤
     */
    public function scopeByAgentType($query, string $agentType)
    {
        return $query->where('agent_type', $agentType);
    }

    /**
     * 按日期范围过滤
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }

    /**
     * 获取今天的指标
     */
    public function scopeToday($query)
    {
        return $query->whereDate('metric_date', today());
    }

    /**
     * 获取本月的指标
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('metric_date', now()->month)
                     ->whereYear('metric_date', now()->year);
    }

    // ============= 业务方法 =============

    /**
     * 获取该指标的成本（美元）
     */
    public function getCostInDollars(): float
    {
        return $this->tokens_cost_cents / 100;
    }

    /**
     * 获取该指标的平均成本（每对话）
     */
    public function getAverageCostPerConversation(): float
    {
        if ($this->conversation_count === 0) {
            return 0;
        }

        return $this->getCostInDollars() / $this->conversation_count;
    }

    /**
     * 获取该指标的平均成本（每消息）
     */
    public function getAverageCostPerMessage(): float
    {
        if ($this->message_count === 0) {
            return 0;
        }

        return $this->getCostInDollars() / $this->message_count;
    }

    /**
     * 获取该指标的平均 tokens per 对话
     */
    public function getAverageTokensPerConversation(): float
    {
        if ($this->conversation_count === 0) {
            return 0;
        }

        return $this->token_used / $this->conversation_count;
    }

    /**
     * 获取特定功能的使用次数
     */
    public function getFeatureUsage(string $feature): int
    {
        return $this->feature_usage[$feature] ?? 0;
    }

    /**
     * 记录功能使用
     */
    public function recordFeatureUsage(string $feature, int $count = 1): void
    {
        $usage = $this->feature_usage ?? [];
        $usage[$feature] = ($usage[$feature] ?? 0) + $count;
        $this->update(['feature_usage' => $usage]);
    }

    /**
     * 更新对话计数
     */
    public function incrementConversationCount(int $count = 1): void
    {
        $this->increment('conversation_count', $count);
    }

    /**
     * 更新消息计数
     */
    public function incrementMessageCount(int $count = 1): void
    {
        $this->increment('message_count', $count);
    }

    /**
     * 更新 token 使用量
     */
    public function incrementTokenUsed(int $tokens, ?float $costUsd = null): void
    {
        $costCents = $costUsd ? (int)round($costUsd * 100) : (int)round($tokens * 0.00004 * 100);
        $this->increment('token_used', $tokens);
        $this->increment('tokens_cost_cents', $costCents);
    }

    /**
     * 更新工具调用计数
     */
    public function incrementToolCallCount(int $count = 1): void
    {
        $this->increment('tool_call_count', $count);
    }

    /**
     * 静态方法：获取或创建今天的指标
     */
    public static function recordForToday(
        int $shopId,
        string $tenantKey,
        string $agentType
    ): self {
        return static::firstOrCreate(
            [
                'shopify_shop_id' => $shopId,
                'metric_date' => today(),
                'agent_type' => $agentType,
            ],
            [
                'tenant_key' => $tenantKey,
            ]
        );
    }

    /**
     * 统计一个日期范围内的总成本
     */
    public static function getTotalCostForRange(
        int $shopId,
        \DateTime $startDate,
        \DateTime $endDate
    ): float {
        return (int)static::forShop($shopId)
            ->dateRange($startDate, $endDate)
            ->sum('tokens_cost_cents') / 100;
    }

    /**
     * 统计一个日期范围内的总对话数
     */
    public static function getTotalConversationsForRange(
        int $shopId,
        \DateTime $startDate,
        \DateTime $endDate
    ): int {
        return (int)static::forShop($shopId)
            ->dateRange($startDate, $endDate)
            ->sum('conversation_count');
    }

    /**
     * 统计一个日期范围内的总 token 消耗
     */
    public static function getTotalTokensForRange(
        int $shopId,
        \DateTime $startDate,
        \DateTime $endDate
    ): int {
        return (int)static::forShop($shopId)
            ->dateRange($startDate, $endDate)
            ->sum('token_used');
    }
}
