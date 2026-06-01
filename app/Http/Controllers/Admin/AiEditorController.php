<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AiService;
use App\Services\AiTools;
use Illuminate\Http\Request;

class AiEditorController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function themeOptions(Request $request, AiTools $aiTools)
    {
        $keys = $request->query('keys', []);
        $result = $aiTools->getThemeOptions(is_array($keys) ? $keys : explode(',', (string) $keys));

        return response()->json($result);
    }

    public function preview(Request $request, AiService $aiService)
    {
        $message = $request->input('message', '请帮我优化店铺首页装修。');
        $context = $request->input('context', []);

        $response = $aiService->handleDesignMessage($message, $context, auth()->id());

        return response()->json($response);
    }

    public function describe(Request $request, AiService $aiService, AiTools $aiTools)
    {
        $message = $request->input('message', '请帮我生成一份店铺首页装修方案，包含主题配色、Banner、板块布局和模块顺序。');
        $context = $request->input('context', []);

        $themeOptions = $aiTools->getThemeOptions([
            'primary_color',
            'secondary_color',
            'accent_color',
            'font_family',
            'homepage_banner',
            'homepage_sections',
            'homepage_layout',
        ]);

        $context['current_theme_options'] = $themeOptions['theme_options'] ?? [];

        $response = $aiService->handleDesignMessage($message, $context, auth()->id());
        $reply = $response['reply'] ?? '';
        $parsed = $this->parseDesignReply($reply);

        if (! $parsed['success']) {
            $parsed = $aiTools->themeDesignSuggestion([
                'style' => $context['style'] ?? '现代简约',
                'page' => $context['page'] ?? '首页',
                'audience' => $context['audience'] ?? '年轻消费者',
                'focus' => $context['focus'] ?? '新品与促销',
                'theme_options' => $context['current_theme_options'] ?? [],
            ]);
            $parsed['source'] = 'fallback';
            $parsed['reply'] = $reply;
        }

        return response()->json(array_merge($response, ['parsed' => $parsed, 'current_theme_options' => $context['current_theme_options']]));
    }

    protected function parseDesignReply(string $reply): array
    {
        $trim = trim($reply);
        if ($trim === '') {
            return ['success' => false, 'message' => 'AI 响应为空'];
        }

        $json = json_decode($trim, true);
        if (! is_array($json)) {
            $json = $this->extractJsonFromText($trim);
        }

        if (is_array($json) && ! empty($json)) {
            if (isset($json['theme_options']) || isset($json['layout']) || isset($json['sections']) || isset($json['recommendation'])) {
                return ['success' => true, 'data' => $json];
            }

            if (isset($json['recommendation']) && is_array($json['recommendation'])) {
                return ['success' => true, 'data' => $json['recommendation']];
            }
        }

        return ['success' => false, 'message' => '无法解析为结构化装修方案 JSON', 'reply' => $reply];
    }

    protected function extractJsonFromText(string $text): ?array
    {
        if (preg_match('/(\{(?:[^{}]|(?R))*\})/s', $text, $matches)) {
            $payload = json_decode($matches[1], true);
            return is_array($payload) ? $payload : null;
        }

        return null;
    }

    public function apply(Request $request, AiTools $aiTools)
    {
        $payload = $request->input('payload', []);
        $result = $aiTools->applyThemeDesign(is_array($payload) ? $payload : []);

        return response()->json($result);
    }
}
