<?php

namespace App\Http\Controllers;

use App\Models\AiSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MerchantAiConfigController extends Controller
{
    /**
     * 显示商家 AI 配置管理页面
     */
    public function show(Request $request, $shopId)
    {
        $setting = AiSetting::firstOrCreate([
            'shop_id' => $shopId,
        ], $this->getDefaultConfig($shopId));

        $features = [
            'product_suggestion' => '商品推荐',
            'sales_analysis' => '销售分析',
            'copywriting' => '文案建议',
            'customer_service' => '客服助手',
            'inventory_management' => '库存管理',
            'trend_analysis' => '趋势分析',
        ];

        $tones = [
            'friendly' => '友好（亲切、平易近人）',
            'professional' => '专业（正式、权威）',
            'casual' => '休闲（活泼、不正式）',
            'luxurious' => '奢华（高端、精致）',
            'minimalist' => '极简（简洁、直白）',
        ];

        return view('merchant.ai-config', [
            'setting' => $setting,
            'shopId' => $shopId,
            'features' => $features,
            'tones' => $tones,
        ]);
    }

    /**
     * 保存商家 AI 配置
     */
    public function store(Request $request, $shopId)
    {
        $validated = $request->validate([
            'enabled' => 'boolean',
            'customer_agent_enabled' => 'boolean',
            'merchant_agent_enabled' => 'boolean',
            'daily_limit' => 'required|integer|min:1|max:100000',
            'customer_tone' => 'required|string|in:friendly,professional,casual,luxurious,minimalist',
            'customer_welcome_message' => 'required|string|max:500',
            'customer_example_questions' => 'required|array|min:1|max:5',
            'customer_example_questions.*' => 'required|string|max:200',
            'merchant_tone' => 'required|string|in:friendly,professional,casual,luxurious,minimalist',
            'merchant_welcome_message' => 'required|string|max:500',
            'merchant_example_questions' => 'required|array|min:1|max:5',
            'merchant_example_questions.*' => 'required|string|max:200',
            'enabled_features' => 'required|array',
            'enabled_features.*' => 'string',
            'shopify_domain' => 'nullable|string|max:255|unique:ai_settings,shopify_domain,' . AiSetting::where('shop_id', $shopId)->first()?->id,
            'shopify_access_token' => 'nullable|string|max:500',
            'storefront_mcp_endpoint' => 'nullable|url|max:500',
        ]);

        $setting = AiSetting::findOrFail(
            AiSetting::where('shop_id', $shopId)->first()?->id
        );

        // 如果 tenant_key 不存在，生成一个
        if (!$setting->tenant_key) {
            $setting->tenant_key = Str::uuid()->toString();
        }

        $setting->update([
            'enabled' => $validated['enabled'] ?? false,
            'customer_agent_enabled' => $validated['customer_agent_enabled'] ?? false,
            'merchant_agent_enabled' => $validated['merchant_agent_enabled'] ?? false,
            'daily_limit' => $validated['daily_limit'],
            'customer_tone' => $validated['customer_tone'],
            'customer_welcome_message' => $validated['customer_welcome_message'],
            'customer_example_questions' => $validated['customer_example_questions'],
            'merchant_tone' => $validated['merchant_tone'],
            'merchant_welcome_message' => $validated['merchant_welcome_message'],
            'merchant_example_questions' => $validated['merchant_example_questions'],
            'enabled_features' => $validated['enabled_features'],
            'shopify_domain' => $validated['shopify_domain'],
            'shopify_access_token' => $validated['shopify_access_token'],
            'storefront_mcp_endpoint' => $validated['storefront_mcp_endpoint'],
        ]);

        return redirect()->back()->with('success', 'AI 配置已保存。');
    }

    /**
     * 获取默认配置
     */
    private function getDefaultConfig($shopId): array
    {
        return [
            'enabled' => false,
            'customer_agent_enabled' => false,
            'merchant_agent_enabled' => false,
            'daily_limit' => 1000,
            'customer_tone' => 'friendly',
            'customer_welcome_message' => '欢迎来到我们的店铺！有什么需要帮助的吗？',
            'customer_example_questions' => [
                '推荐一些适合我的商品',
                '这件商品的尺码怎么选？',
                '有什么新品上市吗？',
            ],
            'merchant_tone' => 'professional',
            'merchant_welcome_message' => '你好，我是你的 AI 运营助手。',
            'merchant_example_questions' => [
                '最近的销售趋势如何？',
                '哪些商品表现最好？',
                '我应该如何优化库存？',
            ],
            'enabled_features' => ['product_suggestion', 'sales_analysis'],
            'tenant_key' => Str::uuid()->toString(),
        ];
    }
}
