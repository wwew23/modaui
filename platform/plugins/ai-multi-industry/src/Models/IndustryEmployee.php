<?php

namespace Botble\AiMultiIndustry\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndustryEmployee extends Model
{
    protected $table = 'ai_industry_employees';

    protected $fillable = [
        'industry_id',
        'name',
        'role',
        'avatar_url',
        'system_prompt',
        'model',
        'temperature',
        'max_tokens',
        'enabled',
        'sort_order',
        'metadata',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'temperature' => 'float',
        'max_tokens' => 'integer',
        'metadata' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'temperature' => 0.7,
        'max_tokens' => 2048,
    ];

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(AiChatMessage::class, 'employee_id');
    }

    public function chatSessions(): HasMany
    {
        return $this->hasMany(AiChatSession::class, 'employee_id');
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->industry->emoji} {$this->name} ({$this->role})";
    }
}
