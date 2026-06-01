<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowConfig extends Model
{
    use SoftDeletes;

    protected $table = 'workflow_configs';

    protected $fillable = [
        'namespace',
        'name',
        'description',
        'icon',
        'graph',
        'enabled',
        'execution_mode',
        'retry_strategy',
        'timeout_seconds',
        'avg_cost',
        'avg_duration_seconds',
        'success_rate',
        'metadata',
        'version',
    ];

    protected $casts = [
        'graph' => 'json',
        'retry_strategy' => 'json',
        'enabled' => 'boolean',
        'metadata' => 'json',
    ];

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }
}
