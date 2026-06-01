<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * AiMessage - 会话中的单条消息
 * 
 * 记录对话中的每一条消息：用户输入、AI 回复、工具调用等
 * 支持详细的成本追踪和工具元数据
 * 
 * @property int $id
 * @property int $conversation_id
 * @property string $tenant_key
 * @property string $role (user, assistant, tool, system)
 * @property string $content
 * @property string $tool_name
 * @property array $tool_args
 * @property array $tool_output
 * @property int $tokens_used
 * @property string $model
 */
class AiMessage extends Model
{
    use SoftDeletes;

    protected $table = 'ai_messages';

    protected $fillable = [
        'conversation_id',
        'tenant_key',
        'role',
        'content',
        'tool_name',
        'tool_args',
        'tool_output',
        'tokens_used',
        'model',
    ];

    protected $casts = [
        'tool_args' => 'array',
        'tool_output' => 'array',
    ];

    // ============= 关系 =============

    /**
     * 关联到对话
     */
    public function conversation()
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    // ============= 作用域 =============

    /**
     * 仅获取用户消息
     */
    public function scopeUserMessages($query)
    {
        return $query->where('role', 'user');
    }

    /**
     * 仅获取助手消息
     */
    public function scopeAssistantMessages($query)
    {
        return $query->where('role', 'assistant');
    }

    /**
     * 仅获取工具消息
     */
    public function scopeToolMessages($query)
    {
        return $query->where('role', 'tool');
    }

    /**
     * 按租户过滤
     */
    public function scopeByTenant($query, string $tenantKey)
    {
        return $query->where('tenant_key', $tenantKey);
    }

    /**
     * 按工具名过滤
     */
    public function scopeByToolName($query, string $toolName)
    {
        return $query->where('tool_name', $toolName);
    }

    /**
     * 按日期范围过滤
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // ============= 业务方法 =============

    /**
     * 检查是否是工具调用消息
     */
    public function isToolCall(): bool
    {
        return $this->role === 'tool';
    }

    /**
     * 检查是否是用户消息
     */
    public function isUserMessage(): bool
    {
        return $this->role === 'user';
    }

    /**
     * 检查是否是助手消息
     */
    public function isAssistantMessage(): bool
    {
        return $this->role === 'assistant';
    }

    /**
     * 获取该消息的成本（美分）
     */
    public function getCostInCents(): int
    {
        // 成本计算：tokens * 每1000个tokens的成本
        // 例如 gpt-4-turbo: $0.03/1K input, $0.06/1K output
        // 这里简化为平均 $0.04/1K = 0.04 美分/token
        return (int)round($this->tokens_used * 0.00004 * 100);
    }

    /**
     * 获取工具的输入参数
     */
    public function getToolArgs(?string $key = null)
    {
        if (!$this->tool_args) {
            return null;
        }

        if ($key) {
            return $this->tool_args[$key] ?? null;
        }

        return $this->tool_args;
    }

    /**
     * 获取工具的输出结果
     */
    public function getToolOutput(?string $key = null)
    {
        if (!$this->tool_output) {
            return null;
        }

        if ($key) {
            return $this->tool_output[$key] ?? null;
        }

        return $this->tool_output;
    }

    /**
     * 记录工具调用
     */
    public static function recordToolCall(
        $conversation,
        string $tenantKey,
        string $toolName,
        array $toolArgs,
        array $output,
        int $tokensUsed = 0,
        string $model = null
    ): self {
        return static::create([
            'conversation_id' => $conversation->id,
            'tenant_key' => $tenantKey,
            'role' => 'tool',
            'tool_name' => $toolName,
            'tool_args' => $toolArgs,
            'tool_output' => $output,
            'tokens_used' => $tokensUsed,
            'model' => $model,
            'content' => json_encode(['tool' => $toolName, 'status' => 'executed']),
        ]);
    }
}
