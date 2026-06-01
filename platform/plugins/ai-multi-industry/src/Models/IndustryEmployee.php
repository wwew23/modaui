<?php

namespace Botble\AiMultiIndustry\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndustryEmployee extends Model
{
    protected $table = 'ai_industry_employees';

    protected $fillable = [
        'industry_id',
        'name',
        'role',
        'system_prompt',
        'model',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }
}
