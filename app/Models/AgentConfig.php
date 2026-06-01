<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentConfig extends Model
{
    use SoftDeletes;

    protected $table = 'agent_configs';

    protected $fillable = [
        'namespace',
        'name',
        'description',
        'icon',
        'enabled',
        'model_id',
        'system_prompt_id',
        'max_tokens',
        'temperature',
        'top_p',
        'timeout_seconds',
        'min_role',
        'is_public',
        'tags',
        'metadata',
        'version',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'is_public' => 'boolean',
        'tags' => 'json',
        'metadata' => 'json',
    ];

    // Relations
    public function model(): BelongsTo
    {
        return $this->belongsTo(ModelConfig::class);
    }

    public function systemPrompt(): BelongsTo
    {
        return $this->belongsTo(PromptConfig::class, 'system_prompt_id');
    }

    public function tools(): HasMany
    {
        return $this->hasMany(AgentToolBinding::class, 'agent_id');
    }

    public function executionLogs(): HasMany
    {
        return $this->hasMany(AgentExecutionLog::class, 'agent_id');
    }

    // Scopes
    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
}
