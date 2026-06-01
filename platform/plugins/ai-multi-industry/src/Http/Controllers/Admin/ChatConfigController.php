<?php

namespace Botble\AiMultiIndustry\Http\Controllers\Admin;

use Botble\Base\Http\Controllers\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ChatConfigController extends BaseController
{
    private const CONFIG_CACHE_KEY = 'ai_multi_industry_chat_config';

    public function index()
    {
        $config = Cache::get(self::CONFIG_CACHE_KEY, [
            'default_model' => 'gpt-4',
            'temperature' => 0.7,
            'max_tokens' => 2048,
            'welcome_message' => '您好！我是多行业 AI 助手，很高兴为您服务。',
            'enable_chat_history' => true,
            'enable_export' => true,
            'max_session_hours' => 24,
        ]);

        return view('plugins.ai-multi-industry::admin.chat-config.index', compact('config'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_model' => 'required|string|max:100',
            'temperature' => 'required|numeric|min:0|max:2',
            'max_tokens' => 'required|integer|min:100|max:8000',
            'welcome_message' => 'nullable|string|max:500',
            'enable_chat_history' => 'boolean',
            'enable_export' => 'boolean',
            'max_session_hours' => 'required|integer|min:1|max:720',
        ]);

        $config = [
            'default_model' => $validated['default_model'],
            'temperature' => (float) $validated['temperature'],
            'max_tokens' => (int) $validated['max_tokens'],
            'welcome_message' => $validated['welcome_message'] ?? '',
            'enable_chat_history' => $request->boolean('enable_chat_history', true),
            'enable_export' => $request->boolean('enable_export', true),
            'max_session_hours' => (int) $validated['max_session_hours'],
        ];

        Cache::put(self::CONFIG_CACHE_KEY, $config, now()->addDays(365));

        return redirect()->route('ai-multi-industry.chat-config.index')
            ->with('success', '聊天配置已保存');
    }

    /**
     * 获取配置 API
     */
    public function getConfig()
    {
        $config = Cache::get(self::CONFIG_CACHE_KEY, [
            'default_model' => 'gpt-4',
            'temperature' => 0.7,
            'max_tokens' => 2048,
        ]);

        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }
}
