<?php

namespace App\Services;

use App\Models\AiSetting;

class AiSettingsService
{
    public function getByShopId(int $shopId): AiSetting
    {
        return AiSetting::firstOrCreate(
            ['shop_id' => $shopId],
            [
                'enabled' => false,
                'customer_agent_enabled' => false,
                'merchant_agent_enabled' => false,
                'runtime_enabled' => true,
                'industry' => 'fashion',
                'style_preset' => 'italian_street',
                'customer_prompt' => config('ai.prompts.customer.system'),
                'merchant_prompt' => config('ai.prompts.merchant.system'),
                'tools' => [
                    'getStylingSuggestions' => [
                        'enabled' => false,
                        'maxLength' => 300,
                        'includeReason' => true,
                    ],
                ],
                'model_source' => 'os',
                'model_config' => [
                    'endpoint' => env('MODAUI_OS_API_BASE_URL', rtrim(config('app.url'), '/') . '/api/os'),
                    'apiKey' => env('MODAUI_INTERNAL_SYSTEM_TOKEN', ''),
                ],
            ]
        );
    }

    public function updateForShop(int $shopId, array $data): AiSetting
    {
        $setting = $this->getByShopId($shopId);

        $setting->fill([
            'enabled' => (bool)($data['enabled'] ?? false),
            'customer_agent_enabled' => (bool)($data['customer_agent_enabled'] ?? false),
            'merchant_agent_enabled' => (bool)($data['merchant_agent_enabled'] ?? false),
            'runtime_enabled' => (bool)($data['runtime_enabled'] ?? true),
            'industry' => $data['industry'] ?? null,
            'style_preset' => $data['style_preset'] ?? null,
            'customer_prompt' => $data['customer_prompt'] ?? null,
            'merchant_prompt' => $data['merchant_prompt'] ?? null,
            'model_source' => $data['model_source'] ?? 'os',
        ]);

        if (isset($data['tools']) && is_array($data['tools'])) {
            $setting->tools = $data['tools'];
        }

        if (isset($data['model_config']) && is_array($data['model_config'])) {
            $setting->model_config = $data['model_config'];
        }

        $setting->save();

        return $setting;
    }
}
