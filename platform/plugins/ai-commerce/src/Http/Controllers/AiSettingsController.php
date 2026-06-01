<?php

namespace Botble\AiCommerce\Http\Controllers;

use App\Models\AiConfig;
use Illuminate\Http\Request;
use Botble\Base\Http\Controllers\BaseController;

class AiSettingsController extends BaseController
{
    public function index(Request $request)
    {
        $shopId = $request->query('shop_id');
        $shop = $shopId ? \Botble\AiCommerce\Models\ShopifyShop::find($shopId) : null;
        
        // 如果没有指定 shop_id，则显示全局配置（作为默认模板）
        $configs = $shop ? $shop->ai_config : \App\Models\AiConfig::all()->pluck('value', 'key')->toArray();

        $industries = [
            'fashion' => '服装 / 时尚',
            'internet' => '网络',
            'other' => '其他',
        ];

        $stylePresets = [
            'italian_street' => '意式街头风',
            'milan' => '米兰',
            'light_luxury' => '轻奢',
            'french_elegance' => '法式优雅',
            'minimal_commute' => '极简通勤',
        ];

        return view('admin.ai-settings', [
            'configs' => $configs,
            'industries' => $industries,
            'stylePresets' => $stylePresets,
            'shop' => $shop,
            'allShops' => \Botble\AiCommerce\Models\ShopifyShop::all(),
        ]);
    }

    public function save(Request $request)
    {
        $shopId = $request->input('shop_id');
        
        if ($shopId) {
            // SaaS 模式：保存到特定店铺的 ai_config
            $shop = \Botble\AiCommerce\Models\ShopifyShop::findOrFail($shopId);
            $newConfig = [
                'ai_enabled' => $request->has('enabled'),
                'customer_agent_enabled' => $request->has('customer_agent_enabled'),
                'merchant_agent_enabled' => $request->has('merchant_agent_enabled'),
                'industry' => $request->input('industry'),
                'style_preset' => $request->input('style_preset'),
                'agent_tone' => $request->input('agent_tone'),
                'agent_audience' => $request->input('agent_audience'),
                'agent_goals' => $request->input('agent_goals'),
                'agent_forbidden' => $request->input('agent_forbidden'),
                'merchant_prompt' => $request->input('merchant_prompt'),
                'frontend_primary_color' => $request->input('frontend_primary_color', '#008060'),
                'frontend_welcome_message' => $request->input('frontend_welcome_message'),
                'frontend_floating_text' => $request->input('frontend_floating_text'),
                'frontend_tone' => $request->input('frontend_tone', 'friendly'),
            ];
            $shop->update(['ai_config' => array_merge($shop->ai_config ?? [], $newConfig)]);
        } else {
            // 全局模式：保存到 ai_settings 的共享记录（shop_id = 1）
            $setting = \App\Models\AiSetting::forShop(1);

            $modelConfig = $setting->model_config ?? [];
            $modelSource = $request->input('model_source');
            $modelConfig['source'] = $modelSource;
            if ($modelSource === 'openai') {
                $modelConfig['openai_api_key'] = $request->input('openai_api_key');
                $modelConfig['model'] = $request->input('openai_model');
            } elseif ($modelSource === 'claude') {
                $modelConfig['claude_api_key'] = $request->input('claude_api_key');
                $modelConfig['model'] = $request->input('claude_model');
            }

            $update = [
                'enabled' => $request->has('enabled'),
                'customer_agent_enabled' => $request->has('customer_agent_enabled'),
                'merchant_agent_enabled' => $request->has('merchant_agent_enabled'),
                'industry' => $request->input('industry'),
                'style_preset' => $request->input('style_preset'),
                'merchant_prompt' => $request->input('merchant_prompt'),
                'merchant_tone' => $request->input('agent_tone'),
                'customer_tone' => $request->input('frontend_tone'),
                'customer_welcome_message' => $request->input('frontend_welcome_message'),
                'merchant_example_questions' => $request->input('merchant_example_questions'),
                'model_config' => $modelConfig,
            ];

            // 额外的前端样式字段保存到 settings JSON（如果存在）
            $settings = $setting->settings ?? [];
            $settings['frontend_primary_color'] = $request->input('frontend_primary_color', $settings['frontend_primary_color'] ?? '#008060');
            $settings['frontend_floating_text'] = $request->input('frontend_floating_text', $settings['frontend_floating_text'] ?? '有问题？问 AI 导购');
            $settings['frontend_tone'] = $request->input('frontend_tone', $settings['frontend_tone'] ?? 'friendly');
            $settings['frontend_welcome_message'] = $request->input('frontend_welcome_message', $settings['frontend_welcome_message'] ?? '');

            $update['settings'] = $settings;

            $setting->update($update);
        }

        return redirect()->back()->with('success', 'AI 配置已保存。');
    }
}
