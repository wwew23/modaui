<?php

namespace App\Http\Controllers;

use App\Models\AiConfig;
use App\Models\ShopifyShop;
use Illuminate\Http\Request;

class AiSettingsController extends Controller
{
    public function index()
    {
        $configs = AiConfig::all()->pluck('value', 'key');
        
        $industries = [
            'fashion' => '服装 / 时尚',
            'internet' => '网络',
            'other' => '其他',
        ];

        $stylePresets = [
            'italian_street' => '意式街头风',
            'milan' => '米兰风',
            'light_luxury' => '轻奢',
            'french_elegance' => '法式优雅',
            'minimal_commute' => '极简通勤',
        ];

        return view('admin.ai-settings', [
            'configs' => $configs,
            'industries' => $industries,
            'stylePresets' => $stylePresets,
        ]);
    }

    public function edit(int $shopId)
    {
        $shop = ShopifyShop::findOrFail($shopId);

        $backendConfig = AiConfig::firstOrNew([
            'shopify_shop_id' => $shop->id,
            'agent_type'      => 'backend_assistant',
        ]);

        $storefrontConfig = AiConfig::firstOrNew([
            'shopify_shop_id' => $shop->id,
            'agent_type'      => 'storefront_agent',
        ]);

        return view('ai.settings.edit', compact('shop', 'backendConfig', 'storefrontConfig'));
    }

    public function update(Request $request, int $shopId)
    {
        $shop = ShopifyShop::findOrFail($shopId);

        $data = $request->validate([
            // 后台助手
            'backend.enabled' => 'nullable|boolean',
            'backend.language' => 'nullable|string|max:10',
            'backend.tone_of_voice' => 'nullable|string|max:255',
            'backend.welcome_message' => 'nullable|string|max:500',
            'backend.suggested_prompts' => 'nullable|string',
            'backend.features' => 'nullable|array',
            'backend.limits.max_conversations_per_day' => 'nullable|integer|min:0',
            'backend.limits.max_messages_per_conversation' => 'nullable|integer|min:0',

            // 前端导购
            'storefront.enabled' => 'nullable|boolean',
            'storefront.language' => 'nullable|string|max:10',
            'storefront.tone_of_voice' => 'nullable|string|max:255',
            'storefront.welcome_message' => 'nullable|string|max:500',
            'storefront.suggested_prompts' => 'nullable|string',
            'storefront.features' => 'nullable|array',
            'storefront.limits.max_conversations_per_day' => 'nullable|integer|min:0',
            'storefront.limits.max_messages_per_conversation' => 'nullable|integer|min:0',
        ]);

        // 解析多行提示为数组
        $backendSuggested = [];
        if (! empty($request->input('backend.suggested_prompts'))) {
            $raw = (string)$request->input('backend.suggested_prompts');
            $backendSuggested = array_values(array_filter(array_map('trim', preg_split('/\r?\n/', $raw))));
        }

        $storefrontSuggested = [];
        if (! empty($request->input('storefront.suggested_prompts'))) {
            $raw = (string)$request->input('storefront.suggested_prompts');
            $storefrontSuggested = array_values(array_filter(array_map('trim', preg_split('/\r?\n/', $raw))));
        }

        // 保存 backend_assistant 配置
        $backendConfig = AiConfig::firstOrNew([
            'shopify_shop_id' => $shop->id,
            'agent_type'      => 'backend_assistant',
        ]);
        $backendConfig->enabled = (bool)($request->input('backend.enabled', false));
        $backendConfig->language = $request->input('backend.language', 'zh-CN');
        $backendConfig->tone_of_voice = $request->input('backend.tone_of_voice');
        $backendConfig->settings = [
            'welcome_message' => $request->input('backend.welcome_message'),
            'suggested_prompts' => $backendSuggested,
            'features' => $request->input('backend.features', []),
            'limits' => [
                'max_conversations_per_day' => $request->input('backend.limits.max_conversations_per_day'),
                'max_messages_per_conversation' => $request->input('backend.limits.max_messages_per_conversation'),
            ],
        ];
        $backendConfig->save();

        // 保存 storefront_agent 配置
        $storefrontConfig = AiConfig::firstOrNew([
            'shopify_shop_id' => $shop->id,
            'agent_type'      => 'storefront_agent',
        ]);
        $storefrontConfig->enabled = (bool)($request->input('storefront.enabled', false));
        $storefrontConfig->language = $request->input('storefront.language', 'zh-CN');
        $storefrontConfig->tone_of_voice = $request->input('storefront.tone_of_voice');
        $storefrontConfig->settings = [
            'welcome_message' => $request->input('storefront.welcome_message'),
            'suggested_prompts' => $storefrontSuggested,
            'features' => $request->input('storefront.features', []),
            'limits' => [
                'max_conversations_per_day' => $request->input('storefront.limits.max_conversations_per_day'),
                'max_messages_per_conversation' => $request->input('storefront.limits.max_messages_per_conversation'),
            ],
        ];
        $storefrontConfig->save();

        return redirect()
            ->route('shops.ai-settings.edit', $shopId)
            ->with('status', 'AI 设置已保存');
    }

    public function save(Request $request)
    {
        $data = $request->all();
        
        // 基础开关
        AiConfig::set('ai_enabled', $request->has('enabled'), 'boolean');
        AiConfig::set('customer_agent_enabled', $request->has('customer_agent_enabled'), 'boolean');
        AiConfig::set('merchant_agent_enabled', $request->has('merchant_agent_enabled'), 'boolean');
        
        // 行业与风格
        AiConfig::set('industry', $request->input('industry'), 'string');
        AiConfig::set('style_preset', $request->input('style_preset'), 'string');
        
        // 模型配置
        AiConfig::set('model_source', $request->input('model_source', 'openai'), 'string');
        AiConfig::set('openai_api_key', $request->input('openai_api_key'), 'string');
        AiConfig::set('openai_model', $request->input('openai_model', 'gpt-4o'), 'string');
        AiConfig::set('claude_api_key', $request->input('claude_api_key'), 'string');
        AiConfig::set('claude_model', $request->input('claude_model', 'claude-3-5-sonnet-20240620'), 'string');
        
        // Prompt 配置
        AiConfig::set('customer_prompt', $request->input('customer_prompt'), 'string');
        AiConfig::set('merchant_prompt', $request->input('merchant_prompt'), 'string');

        // Martfury Sidekick API 配置
        AiConfig::set('martfury_api_url', $request->input('martfury_api_url', 'https://modaui.com/api'), 'string');
        AiConfig::set('martfury_api_key', $request->input('martfury_api_key'), 'string');

        // Agent Memory 配置
        AiConfig::set('agent_tone', $request->input('agent_tone'), 'string');
        AiConfig::set('agent_audience', $request->input('agent_audience'), 'string');
        AiConfig::set('agent_goals', $request->input('agent_goals'), 'string');
        AiConfig::set('agent_forbidden', $request->input('agent_forbidden'), 'string');

        return redirect()->back()->with('success', 'AI 配置已保存。');
    }
}
