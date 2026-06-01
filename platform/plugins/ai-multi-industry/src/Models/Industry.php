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
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(IndustryEmployee::class, 'industry_id');
    }
}
