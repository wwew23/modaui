<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentToolBinding extends Model
{
    protected $table = 'agent_tool_bindings';

    protected $fillable = [
        'agent_id',
        'tool_id',
        'tool_params',
        'priority',
        'condition',
        'next_tool_id',
    ];

    protected $casts = [
        'tool_params' => 'json',
        'condition' => 'json',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AgentConfig::class);
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(ToolConfig::class);
    }

    public function nextTool(): BelongsTo
    {
        return $this->belongsTo(ToolConfig::class, 'next_tool_id');
    }
}
