<?php

namespace App\Services;

use App\Models\ShopifyShop;
use App\Models\AiConfig;
use Illuminate\Support\Facades\Log;

class TenantManager
{
    private static ?ShopifyShop $currentShop = null;

    public static function setCurrentShop(ShopifyShop $shop): void
    {
        if (!$shop->isActive()) {
            throw new \Exception("Shop {$shop->id} is not active");
        }

        static::$currentShop = $shop;
        app()->instance('current_shop', $shop);
        app()->instance('current_tenant_key', $shop->getTenantKey());
    }

    public static function getCurrentShop(): ShopifyShop
    {
        return static::$currentShop ?? app('current_shop');
    }

    public static function getCurrentTenantKey(): string
    {
        return static::getCurrentShop()->getTenantKey();
    }

    public static function getCurrentShopId(): int
    {
        return static::getCurrentShop()->id;
    }

    public static function getAccessToken(): string
    {
        return static::getCurrentShop()->getDecryptedAccessToken();
    }

    public static function getConfig(string $agentType = 'backend_assistant'): ?AiConfig
    {
        return AiConfig::where('shopify_shop_id', static::getCurrentShopId())
                       ->where('agent_type', $agentType)
                       ->first();
    }

    public static function authorize(ShopifyShop $shop, $user = null): bool
    {
        return $shop->isActive();
    }

    public static function logInfo(string $message, array $context = []): void
    {
        $context['tenant_key'] = static::getCurrentTenantKey();
        $context['shop_id'] = static::getCurrentShopId();

        Log::info($message, $context);
    }

    public static function logError(string $message, array $context = []): void
    {
        $context['tenant_key'] = static::getCurrentTenantKey();
        $context['shop_id'] = static::getCurrentShopId();

        Log::error($message, $context);
    }
}
