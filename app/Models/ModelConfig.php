<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class ModelConfig extends Model
{
    use SoftDeletes;

    protected $table = 'model_configs';

    protected $fillable = [
        'namespace',
        'name',
        'provider',
        'model_name',
        'api_endpoint',
        'api_key_encrypted',
        'api_key_backup',
        'max_tokens',
        'context_window',
        'supports_function_calling',
        'supports_vision',
        'supports_json_mode',
        'input_cost_per_1k',
        'output_cost_per_1k',
        'avg_latency_ms',
        'availability_percentage',
        'enabled',
        'rate_limit_per_minute',
        'monthly_quota_budget',
        'priority',
        'fallback_model_id',
        'tags',
        'metadata',
        'version',
    ];

    protected $casts = [
        'supports_function_calling' => 'boolean',
        'supports_vision' => 'boolean',
        'supports_json_mode' => 'boolean',
        'enabled' => 'boolean',
        'tags' => 'json',
        'metadata' => 'json',
    ];

    public function fallbackModel(): BelongsTo
    {
        return $this->belongsTo(ModelConfig::class, 'fallback_model_id');
    }

    /**
     * 获取解密后的 API key
     */
    public function getApiKey(): ?string
    {
        if (!$this->api_key_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->api_key_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * 设置加密的 API key
     */
    public function setApiKey(string $key): void
    {
        $this->api_key_encrypted = Crypt::encryptString($key);
        $this->save();
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeOrderByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }
}
