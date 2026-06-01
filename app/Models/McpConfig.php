<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class McpConfig extends Model
{
    use SoftDeletes;

    protected $table = 'mcp_configs';

    protected $fillable = [
        'namespace',
        'name',
        'description',
        'server_url',
        'server_type',
        'auth_token_encrypted',
        'knowledge_base_id',
        'embedding_model',
        'chunk_size',
        'overlap',
        'search_method',
        'top_k',
        'similarity_threshold',
        'enabled',
        'tags',
        'metadata',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'tags' => 'json',
        'metadata' => 'json',
    ];

    public function getAuthToken(): ?string
    {
        if (!$this->auth_token_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->auth_token_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }
}
