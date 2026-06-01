<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * AiConversation - 一次对话会话
 * 
 * 代表从开始到结束的一整段对话交互
 * 可以包含多条消息（AiMessage）
 * 支持多租户隔离
 * 
 * @property int $id
 * @property int $shopify_shop_id
 * @property int $ai_config_id
 * @property string $tenant_key (shop_domain)
 * @property string $agent_type (backend_assistant, storefront_agent)
 * @property string $session_id
 * @property int $user_id
 * @property string $customer_id
 * @property array $metadata
 * @property int $message_count
 * @property int $token_used
 * @property \DateTime $started_at
 * @property \DateTime $ended_at
 */
class AiConversation extends Model
{
    use SoftDeletes;

    protected $table = 'ai_conversations';

    protected $fillable = [
        'shopify_shop_id',
        'ai_config_id',
        'tenant_key',
        'agent_type',
        'session_id',
        'user_id',
        'customer_id',
        'metadata',
        'message_count',
        'token_used',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    // ============= 关系 =============

    /**
     * 关联的 Shopify 店铺
     */
    public function shop()
    {
        return $this->belongsTo(ShopifyShop::class, 'shopify_shop_id');
    }

    /**
     * 关联的 AI 配置
     */
    public function aiConfig()
    {
        return $this->belongsTo(AiConfig::class, 'ai_config_id');
    }

    /**
     * 该会话的所有消息
     */
    public function messages()
    {
        return $this->hasMany(AiMessage::class, 'conversation_id')->orderBy('created_at');
    }

    // ============= 作用域 =============

    /**
     * 仅获取已结束的会话
     */
    public function scopeEnded($query)
    {
        return $query->whereNotNull('ended_at');
    }

    /**
     * 仅获取进行中的会话
     */
    public function scopeActive($query)
    {
        return $query->whereNull('ended_at');
    }

    /**
     * 按 agent 类型过滤
     */
    public function scopeByAgentType($query, string $agentType)
    {
        return $query->where('agent_type', $agentType);
    }

    /**
     * 按店铺过滤
     */
    public function scopeForShop($query, $shopId)
    {
        return $query->where('shopify_shop_id', $shopId);
    }

    /**
     * 按租户键过滤（多租户隔离）
     */
    public function scopeByTenant($query, string $tenantKey)
    {
        return $query->where('tenant_key', $tenantKey);
    }

    /**
     * 按日期范围过滤
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * 后台助手的对话
     */
    public function scopeBackendAssistant($query)
    {
        return $query->where('agent_type', 'backend_assistant');
    }

    /**
     * 前端导购的对话
     */
    public function scopeStorefrontAgent($query)
    {
        return $query->where('agent_type', 'storefront_agent');
    }

    // ============= 业务方法 =============

    /**
     * 结束这个会话
     */
    public function end(): void
    {
        $this->update(['ended_at' => now()]);
    }

    /**
     * 检查会话是否仍在进行中
     */
    public function isActive(): bool
    {
        return $this->ended_at === null;
    }

    /**
     * 获取会话的持续时间（秒）
     */
    public function getDurationInSeconds(): ?int
    {
        if (!$this->ended_at) {
            return null;
        }

        return (int)$this->ended_at->diffInSeconds($this->started_at);
    }

    /**
     * 获取该会话的用户标识（兼容后台和前端）
     */
    public function getUserIdentifier(): ?string
    {
        return $this->user_id ?? $this->customer_id;
    }

    /**
     * 统计用户消息数
     */
    public function getUserMessageCount(): int
    {
        return $this->messages()->where('role', 'user')->count();
    }

    /**
     * 统计助手消息数
     */
    public function getAssistantMessageCount(): int
    {
        return $this->messages()->where('role', 'assistant')->count();
    }

    /**
     * 统计工具调用次数
     */
    public function getToolCallCount(): int
    {
        return $this->messages()->where('role', 'tool')->count();
    }

    /**
     * 获取最后一条消息
     */
    public function getLastMessage()
    {
        return $this->messages()->latest('created_at')->first();
    }

    /**
     * 添加消息到该会话
     */
    public function addMessage(
        string $role,
        string $content,
        ?string $toolName = null,
        ?array $toolArgs = null,
        ?array $toolOutput = null
    ): AiMessage {
        return $this->messages()->create([
            'tenant_key' => $this->tenant_key,
            'role' => $role,
            'content' => $content,
            'tool_name' => $toolName,
            'tool_args' => $toolArgs,
            'tool_output' => $toolOutput,
        ]);
    }

    /**
     * 更新消息计数
     */
    public function updateMessageCount(): void
    {
        $this->update([
            'message_count' => $this->messages()->count(),
        ]);
    }

    /**
     * 更新 token 用量
     */
    public function updateTokenUsage(): void
    {
        $totalTokens = $this->messages()->sum('tokens_used');
        $this->update(['token_used' => $totalTokens]);
    }

    /**
     * 获取会话的元数据
     */
    public function getMetadata(?string $key = null)
    {
        if ($key) {
            return $this->metadata[$key] ?? null;
        }

        return $this->metadata ?? [];
    }

    /**
     * 记录 IP 地址
     */
    public function recordIp(string $ip): void
    {
        $metadata = $this->metadata ?? [];
        $metadata['ip'] = $ip;
        $this->update(['metadata' => $metadata]);
    }

    /**
     * 记录 User-Agent
     */
    public function recordUserAgent(string $userAgent): void
    {
        $metadata = $this->metadata ?? [];
        $metadata['user_agent'] = $userAgent;
        $this->update(['metadata' => $metadata]);
    }
}
