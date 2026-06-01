<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentExecutionLog extends Model
{
    protected $table = 'agent_execution_logs';

    protected $fillable = [
        'store_id',
        'user_id',
        'agent_id',
        'model_id',
        'input_text',
        'input_tokens',
        'output_tokens',
        'result',
        'status',
        'error_message',
        'execution_duration_ms',
        'cost',
        'user_rating',
        'user_feedback',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'json',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AgentConfig::class);
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(ModelConfig::class);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
