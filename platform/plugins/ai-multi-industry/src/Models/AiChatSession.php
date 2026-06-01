<?php

namespace Botble\AiMultiIndustry\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiChatSession extends Model
{
    protected $table = 'ai_chat_sessions';

    protected $fillable = [
        'industry_id',
        'employee_id',
        'merchant_id',
        'session_token',
        'total_messages',
        'total_tokens',
        'started_at',
        'ended_at',
        'metadata',
    ];

    protected $casts = [
        'total_messages' => 'integer',
        'total_tokens' => 'integer',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'metadata' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(IndustryEmployee::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiChatMessage::class, 'session_id');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('ended_at');
    }

    public function scopeByMerchant($query, string $merchantId)
    {
        return $query->where('merchant_id', $merchantId);
    }

    public function isActive(): bool
    {
        return $this->ended_at === null;
    }

    public function close(): void
    {
        $this->update(['ended_at' => now()]);
    }
}
