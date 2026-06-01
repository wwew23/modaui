<?php

namespace Botble\AiMultiIndustry\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiChatMessage extends Model
{
    protected $table = 'ai_chat_messages';

    protected $fillable = [
        'session_id',
        'industry_id',
        'employee_id',
        'merchant_id',
        'role',
        'user_message',
        'ai_response',
        'confidence',
        'tokens_used',
        'metadata',
    ];

    protected $casts = [
        'confidence' => 'integer',
        'tokens_used' => 'integer',
        'metadata' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiChatSession::class);
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(IndustryEmployee::class);
    }

    public function scopeByMerchant($query, string $merchantId)
    {
        return $query->where('merchant_id', $merchantId);
    }

    public function scopeByIndustry($query, int $industryId)
    {
        return $query->where('industry_id', $industryId);
    }

    public function scopeByEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
