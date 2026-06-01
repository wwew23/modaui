<?php

namespace Botble\AiMultiIndustry\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Industry extends Model
{
    protected $table = 'ai_industries';

    protected $fillable = [
        'name',
        'slug',
        'emoji',
        'color',
        'description',
        'enabled',
        'sort_order',
        'metadata',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'metadata' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(IndustryEmployee::class, 'industry_id');
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(AiChatMessage::class, 'industry_id');
    }

    public function enabledEmployees(): HasMany
    {
        return $this->employees()->where('enabled', true);
    }

    public function scopeActive($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeBySlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }
}
