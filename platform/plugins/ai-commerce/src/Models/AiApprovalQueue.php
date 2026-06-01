<?php

namespace Botble\AiCommerce\Models;

use Botble\Base\Models\BaseModel;

class AiApprovalQueue extends BaseModel
{
    protected $table = 'ai_approval_queue';

    protected $fillable = [
        'shop_id',
        'action_type',
        'payload',
        'status',
        'reason',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
