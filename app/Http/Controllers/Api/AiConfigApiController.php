<?php

namespace App\Http\Controllers\Api;

use App\Models\AiSetting;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AiConfigApiController extends Controller
{
    /**
     * MCP Agent 通过店铺域名拉取 AI 配置
     * 
     * GET /api/ai/config/shop/{shopifyDomain}
     * 
     * 返回格式：
     * {
     *   "backend_assistant": {...},
     *   "storefront_agent": {...},
     *   "tenant_key": "..."
     * }
     */
    public function getByShopifyDomain(Request $request, $shopifyDomain)
    {
        $setting = AiSetting::where('shopify_domain', $shopifyDomain)->firstOrFail();

        // 验证 API key（可选，根据你的安全需求）
        $apiKey = $request->header('X-API-Key');
        if ($apiKey && $apiKey !== $setting->shopify_access_token) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($this->formatConfigResponse($setting));
    }

    /**
     * MCP Agent 通过 shop_id 拉取 AI 配置
     * 
     * GET /api/ai/config/shop-id/{shopId}
     */
    public function getByShopId(Request $request, $shopId)
    {
        $setting = AiSetting::where('shop_id', $shopId)->firstOrFail();

        return response()->json($this->formatConfigResponse($setting));
    }

    /**
     * 通过 tenant_key 拉取配置（用于多租户隔离）
     * 
     * GET /api/ai/config/tenant/{tenantKey}
     */
    public function getByTenantKey(Request $request, $tenantKey)
    {
        $setting = AiSetting::where('tenant_key', $tenantKey)->firstOrFail();

        return response()->json($this->formatConfigResponse($setting));
    }

    /**
     * 获取配置的格式化响应
     */
    private function formatConfigResponse(AiSetting $setting): array
    {
        return [
            'backend_assistant' => [
                'enabled' => $setting->merchant_agent_enabled,
                'tone' => $setting->merchant_tone ?? 'professional',
                'welcome_message' => $setting->merchant_welcome_message,
                'suggested_prompts' => $setting->merchant_example_questions ?? [],
                'features' => $this->extractEnabledFeatures($setting->enabled_features),
                'limits' => [
                    'max_daily_conversations' => $setting->daily_limit,
                ],
            ],
            'storefront_agent' => [
                'enabled' => $setting->customer_agent_enabled,
                'tone' => $setting->customer_tone ?? 'friendly',
                'welcome_message' => $setting->customer_welcome_message,
                'suggested_prompts' => $setting->customer_example_questions ?? [],
                'language' => 'zh-CN',
                'limits' => [
                    'max_daily_conversations' => $setting->daily_limit,
                    'max_messages_per_session' => 50,
                ],
                'mcp_endpoint' => $setting->storefront_mcp_endpoint,
            ],
            'tenant_key' => $setting->tenant_key,
            'shop_id' => $setting->shop_id,
            'shopify_domain' => $setting->shopify_domain,
            'model_config' => $setting->model_config,
        ];
    }

    /**
     * 提取启用的功能列表
     */
    private function extractEnabledFeatures($enabledFeatures): array
    {
        if (!is_array($enabledFeatures)) {
            return [];
        }

        return array_reduce($enabledFeatures, function ($carry, $feature) {
            $carry[$feature] = true;
            return $carry;
        }, []);
    }

    /**
     * 检查日配额是否超限
     * 
     * POST /api/ai/config/{shopId}/check-quota
     */
    public function checkQuota(Request $request, $shopId)
    {
        $setting = AiSetting::where('shop_id', $shopId)->firstOrFail();

        // 检查是否需要重置配额
        if ($setting->usage_reset_date && $setting->usage_reset_date->isNotToday()) {
            $setting->update([
                'current_day_usage' => 0,
                'usage_reset_date' => now()->toDateString(),
            ]);
        }

        $remaining = max(0, $setting->daily_limit - $setting->current_day_usage);
        $isLimited = $remaining <= 0;

        return response()->json([
            'shop_id' => $shopId,
            'daily_limit' => $setting->daily_limit,
            'current_day_usage' => $setting->current_day_usage,
            'remaining' => $remaining,
            'is_limited' => $isLimited,
            'reset_at' => now()->addDay()->toDateTimeString(),
        ]);
    }

    /**
     * 记录 LLM 调用（增加计数器）
     * 
     * POST /api/ai/config/{shopId}/record-usage
     */
    public function recordUsage(Request $request, $shopId)
    {
        $validated = $request->validate([
            'tokens_used' => 'integer|min:1',
        ]);

        $setting = AiSetting::where('shop_id', $shopId)->firstOrFail();

        // 检查配额
        if ($setting->current_day_usage >= $setting->daily_limit) {
            return response()->json([
                'error' => 'Daily quota exceeded',
                'status' => 'limited',
            ], 429);
        }

        // 更新计数
        $setting->increment('current_day_usage', 1);

        return response()->json([
            'status' => 'recorded',
            'current_usage' => $setting->current_day_usage,
            'remaining' => max(0, $setting->daily_limit - $setting->current_day_usage),
        ]);
    }
}
