<?php

namespace Botble\AiCommerce\Models;

use Botble\Base\Models\BaseModel;

class ShopifyShop extends BaseModel
{
    protected $table = 'shopify_shops';

    protected $fillable = [
        'vendor_id',
        'shop_domain',
        'access_token',
        'ai_config',
    ];

    protected $casts = [
        'ai_config' => 'array',
    ];
}
