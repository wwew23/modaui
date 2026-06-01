<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ToolConfig extends Model
{
    use SoftDeletes;

    protected $table = 'tool_configs';

    protected $fillable = [
        'namespace',
        'name',
        'description',
        'type',
        'handler_class',
        'icon',
        'documentation',
        'config',
        'required_params',
        'enabled',
        'tags',
        'rate_limit',
        'cost_per_call',
        'metadata',
        'version',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'config' => 'json',
        'required_params' => 'json',
        'tags' => 'json',
        'metadata' => 'json',
    ];

    public function bindings(): HasMany
    {
        return $this->hasMany(AgentToolBinding::class, 'tool_id');
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }
}
