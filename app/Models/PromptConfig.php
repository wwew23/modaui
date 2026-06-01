<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromptConfig extends Model
{
    use SoftDeletes;

    protected $table = 'prompt_configs';

    protected $fillable = [
        'namespace',
        'name',
        'description',
        'content',
        'variables',
        'version',
        'status',
        'avg_quality_score',
        'test_results',
        'variant_type',
        'parent_id',
        'enabled',
        'tags',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'variables' => 'json',
        'test_results' => 'json',
        'enabled' => 'boolean',
        'tags' => 'json',
        'metadata' => 'json',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PromptConfig::class, 'parent_id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(PromptConfig::class, 'parent_id');
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeProduction($query)
    {
        return $query->where('status', 'production');
    }

    /**
     * 使用变量渲染 Prompt
     */
    public function renderTemplate(array $variables = []): string
    {
        $content = $this->content;

        foreach ($variables as $key => $value) {
            $content = str_replace("{{ {$key} }}", $value, $content);
        }

        return $content;
    }
}
