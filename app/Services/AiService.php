<?php

namespace App\Services;

use App\Services\AiSettingsService;
use App\Services\AiToolService;
use App\Services\OllamaClientService;
use App\Models\AiConfig;
use Illuminate\Support\Facades\Http;

class AiService
{
    protected AiTools $aiTools;
    protected AiSettingsService $settingsService;
    protected AiToolService $toolService;
    protected OllamaClientService $ollamaClient;

    public function __construct(
        AiTools $aiTools,
        AiSettingsService $settingsService,
        AiToolService $toolService,
        OllamaClientService $ollamaClient
    ) {
        $this->aiTools = $aiTools;
        $this->settingsService = $settingsService;
        $this->toolService = $toolService;
        $this->ollamaClient = $ollamaClient;
    }

    public function handleCustomerMessage(string $message, array $context = [], ?int $shopId = null): array
    {
        $context['history'] = $this->getConversationHistory('customer');
        $config = $this->getAiConfig($shopId, 'storefront_agent');

        if (! $config || ! $config->enabled) {
            return [
                'intent' => 'disabled',
                'reply' => 'AI 导购功能当前已关闭。',
            ];
        }

        $response = $this->executeLlmRuntime($message, $context, 'customer', $shopId);
        $this->saveConversationHistory('customer', $message, $response['reply'] ?? '');
        return $response;
    }

    public function handleMerchantMessage(string $message, array $context = [], ?int $shopId = null): array
    {
        $context['history'] = $this->getConversationHistory('merchant');
        $config = $this->getAiConfig($shopId, 'backend_assistant');

        if (! $config || ! $config->enabled) {
            return [
                'intent' => 'disabled',
                'reply' => 'AI 运营助手当前已关闭。',
            ];
        }

        $response = $this->executeLlmRuntime($message, $context, 'merchant', $shopId);
        $this->saveConversationHistory('merchant', $message, $response['reply'] ?? '');
        return $response;
    }

    public function handleDesignMessage(string $message, array $context = [], ?int $shopId = null): array
    {
        $context['history'] = $this->getConversationHistory('merchant');
        $config = $this->getAiConfig($shopId, 'backend_assistant');

        if (! $config || ! $config->enabled) {
            return [
                'intent' => 'disabled',
                'reply' => 'AI 装修设计功能当前未启用。',
            ];
        }

        $settings = new \stdClass();
        $settings->model_config = $config ? $config->getModelConfig() : ['model' => 'gpt-3.5-turbo'];
        $settings->merchant_prompt = $this->buildDesignSystemPrompt($config);
        $source = $config->settings['model_config']['source'] ?? 'gemini';

        return match ($source) {
            'gemini', 'google' => $this->callGemini($message, $context, 'merchant', $settings),
            'ollama' => $this->callOllama($message, $context, 'merchant', $settings),
            'openai' => $this->callOpenAI($message, $context, 'merchant', $settings),
            'claude' => $this->callClaude($message, $context, 'merchant', $settings),
            default => [
                'intent' => 'error',
                'reply' => '未配置有效的模型来源。',
            ],
        };
    }

    protected function buildDesignSystemPrompt(?AiConfig $config): string
    {
        $base = '你是一个本地店铺装修设计智能助手。你的目标是为店铺首页、主题风格、色彩方案、模块布局、Banner 设计和店铺视觉形象提供可落地的装修建议。';

        $lang = $config->language ?? 'zh-CN';
        $tone = $config->tone_of_voice ?? ($config->settings['tone_of_voice'] ?? '专业、简洁');
        $welcome = $config->settings['welcome_message'] ?? '';

        $prompt = sprintf("%s\n语言：%s。\n语气：%s。", $base, $lang, $tone);
        $prompt .= "\n请尽量以结构化 JSON 格式返回装修方案，包含 theme_options、layout、sections、banner 等字段。";
        $prompt .= "\n只返回 JSON 对象，不要包含额外解释性文本或标签。";

        if ($welcome) {
            $prompt .= "\n当前店铺欢迎语：" . $welcome;
        }

        $features = $config->settings['features'] ?? [];
        if (! empty($features) && is_array($features)) {
            $allowed = implode(', ', array_keys(array_filter($features)));
            if ($allowed) {
                $prompt .= "\n当前可用能力：{$allowed}。";
            }
        }

        return $prompt;
    }

    protected function executeLlmRuntime(string $message, array $context, string $role, ?int $shopId = null): array
    {
        $aiConfig = $this->getAiConfig($shopId, $role === 'merchant' ? 'backend_assistant' : 'storefront_agent');
        $settings = new \stdClass();
        $settings->model_config = $aiConfig ? $aiConfig->getModelConfig() : ['model' => 'gpt-3.5-turbo'];
        $promptKey = $role . '_prompt';
        $settings->$promptKey = $this->buildSystemPromptFromConfig($aiConfig, $role);
        $source = $aiConfig && ($aiConfig->settings['model_config']['source'] ?? null) ? $aiConfig->settings['model_config']['source'] : (property_exists($settings, 'model_source') ? $settings->model_source : 'gemini');

        if (str_contains($message, '找') || str_contains($message, '推荐') || str_contains($message, '搜')) {
            $products = $this->aiTools->searchProducts($message, $context);
            if (! empty($products)) {
                $message .= "\n\n(系统提示: 你必须调用 searchProducts 工具或参考以下商品数据进行回答，不要编造商品。当前找到的商品: " . json_encode($products, JSON_UNESCAPED_UNICODE) . ")";
            }
        }

        if (str_contains($message, '订单') || str_contains($message, '物流')) {
            $message .= "\n\n(系统提示: 用户在询问订单相关信息。请告知用户可以通过个人中心查看，或提供查询单号。)";
        }

        return match ($source) {
            'gemini', 'google' => $this->callGemini($message, $context, $role, $settings),
            'ollama' => $this->callOllama($message, $context, $role, $settings),
            'openai' => $this->callOpenAI($message, $context, $role, $settings),
            'claude' => $this->callClaude($message, $context, $role, $settings),
            default => [
                'intent' => 'error',
                'reply' => '未配置有效的模型来源。',
            ],
        };
    }

    protected function getAiConfig(?int $shopId, string $agentType)
    {
        if (! $shopId) {
            return null;
        }

        return AiConfig::forShop($shopId, $agentType)->first();
    }

    protected function buildSystemPromptFromConfig(?AiConfig $config, string $role): string
    {
        if (! $config) {
            return '';
        }

        $lang = $config->language ?? 'zh-CN';
        $tone = $config->tone_of_voice ?? ($config->settings['tone_of_voice'] ?? '专业、简洁');
        $welcome = $config->settings['welcome_message'] ?? '';

        $base = $role === 'merchant' ? '你是一个本地店铺后台的运营智能助手。' : '你是这个店铺的前台 AI 导购助手。';

        $prompt = sprintf("%s\n语言：%s。\n语气：%s。", $base, $lang, $tone);
        if ($welcome) {
            $prompt .= "\n欢迎语示例：" . $welcome;
        }

        // 限制能力范围（若有 features）
        $features = $config->settings['features'] ?? [];
        if (! empty($features) && is_array($features)) {
            $allowed = implode(', ', array_keys(array_filter($features)));
            if ($allowed) {
                $prompt .= "\n能力范围：" . $allowed . '。';
            }
        }

        return $prompt;
    }

    protected function getSettings(?int $shopId = null)
    {
        return $this->settingsService->getByShopId($shopId ?: 1);
    }

    protected function callGemini(string $message, array $context, string $role, $settings): array
    {
        $apiKey = $settings->model_config['apiKey'] ?? env('GOOGLE_API_KEY', env('GEMINI_API_KEY'));
        $model = $settings->model_config['model'] ?? 'gemini-1.5-flash';
        $systemPrompt = is_array($settings->{$role . '_prompt'}) ? implode("\n", $settings->{$role . '_prompt'}) : ($settings->{$role . '_prompt'} ?? '');

        if (! $apiKey) {
            return ['intent' => 'error', 'reply' => 'Gemini API Key 未配置。'];
        }

        try {
            $response = Http::timeout(60)
                ->post("https://generativelanguage.googleapis.com/v1/models/{$model}:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => "System Instruction: " . $systemPrompt . "\n\nUser Message: " . $message]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => $settings->model_config['temperature'] ?? 0.7,
                        'maxOutputTokens' => $settings->model_config['max_tokens'] ?? 2048,
                    ]
                ]);

            if ($response->successful()) {
                $content = $response->json('candidates.0.content.parts.0.text');
                return ['intent' => 'chat', 'reply' => $content];
            }

            if ($response->status() === 404) {
                $response = Http::timeout(60)
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                        'contents' => [['parts' => [['text' => $message]]]]
                    ]);
                if ($response->successful()) {
                    return ['intent' => 'chat', 'reply' => $response->json('candidates.0.content.parts.0.text')];
                }
            }

            return ['intent' => 'error', 'reply' => 'Gemini 请求失败: ' . $response->body()];
        } catch (\Exception $e) {
            return ['intent' => 'error', 'reply' => '连接 Gemini 失败: ' . $e->getMessage()];
        }
    }

    protected function callOllama(string $message, array $context, string $role, $settings): array
    {
        $modelConfig = array_merge([
            'model' => $settings->model_config['model'] ?? 'llama3',
            'temperature' => $settings->model_config['temperature'] ?? 0.7,
            'max_tokens' => $settings->model_config['max_tokens'] ?? 2048,
        ], $settings->model_config ?? []);

        $promptKey = $role . '_prompt';
        $systemPrompt = is_array($settings->$promptKey) ? implode("\n", $settings->$promptKey) : ($settings->$promptKey ?? '');
        $messages = $this->buildMessagesForOllama($systemPrompt, $message, $context);
        $tools = $this->toolService->getToolsDefinition($role);
        $payload = $this->ollamaClient->makePayload($modelConfig, $messages, $tools);

        try {
            $response = $this->ollamaClient->chat($payload);
            $toolCall = $this->toolService->parseOllamaToolCall($response);

            if ($toolCall) {
                $toolResult = $this->toolService->dispatchTool($toolCall['tool'], $toolCall['args'], array_merge($context, ['role' => $role]));
                $assistantText = $this->callOllamaFollowup($toolCall['tool'], $toolCall['args'], $toolResult, $role, $settings, $context);

                return [
                    'intent' => $toolCall['tool'],
                    'reply' => $assistantText,
                    'tool_calls' => [$toolCall],
                    'tool_result' => $toolResult,
                ];
            }

            return ['intent' => 'chat', 'reply' => $this->toolService->extractAssistantText($response) ?? '', 'raw' => $response];
        } catch (\Exception $e) {
            return ['intent' => 'error', 'reply' => '连接 Ollama 失败: ' . $e->getMessage()];
        }
    }

    protected function buildMessagesForOllama(string $systemPrompt, string $message, array $context): array
    {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'system', 'content' => '当你需要访问本地系统真实数据时，请严格返回 JSON 格式，不要输出其他文字：{ "tool": "工具名", "args": { ... } }。只有在不需要调用工具时，才直接以自然语言回答。'],
            ['role' => 'user', 'content' => $message],
        ];

        if (! empty($context['history']) && is_array($context['history'])) {
            foreach ($context['history'] as $item) {
                if (! empty($item['role']) && ! empty($item['message'])) {
                    $messages[] = ['role' => $item['role'], 'content' => $item['message']];
                }
            }
        }

        return $messages;
    }

    protected function callOllamaFollowup(string $toolName, array $toolArgs, array $toolResult, string $role, $settings, array $context): string
    {
        $promptKey = $role . '_prompt';
        $systemPrompt = is_array($settings->$promptKey) ? implode("\n", $settings->$promptKey) : ($settings->$promptKey ?? '');
        $followupMessages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => sprintf(
                '你是一个本地店铺的后台运营助手。以下是工具 %s 的返回数据：%s，请用自然语言给出分析和建议。',
                $toolName,
                json_encode($toolResult, JSON_UNESCAPED_UNICODE)
            )],
        ];

        try {
            $followupPayload = $this->ollamaClient->makePayload($settings->model_config ?? [], $followupMessages, []);
            $followupResponse = $this->ollamaClient->chat($followupPayload);
            return $this->toolService->extractAssistantText($followupResponse) ?? '';
        } catch (\Exception $e) {
            return '工具调用已执行，但未能生成最终自然语言回复：' . $e->getMessage();
        }
    }

    protected function callOpenAI(string $message, array $context, string $role, $settings): array
    {
        $apiKey = $settings->model_config['apiKey'] ?? env('OPENAI_API_KEY');
        $model = $settings->model_config['model'] ?? 'gpt-4o';
        $promptKey = $role . '_prompt';
        $systemPrompt = is_array($settings->$promptKey) ? implode("\n", $settings->$promptKey) : ($settings->$promptKey ?? '');

        if (! $apiKey) {
            return ['intent' => 'error', 'reply' => 'OpenAI API Key 未配置。'];
        }

        try {
            $response = Http::withToken($apiKey)
                ->timeout(60)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $message]
                    ],
                    'temperature' => $settings->model_config['temperature'] ?? 0.7,
                    'max_tokens' => $settings->model_config['max_tokens'] ?? 1024,
                ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                return ['intent' => 'chat', 'reply' => $content];
            }

            return ['intent' => 'error', 'reply' => 'OpenAI 请求失败: ' . $response->body()];
        } catch (\Exception $e) {
            return ['intent' => 'error', 'reply' => '连接 OpenAI 失败: ' . $e->getMessage()];
        }
    }

    protected function callClaude(string $message, array $context, string $role, $settings = null): array
    {
        $apiKey = $settings->model_config['apiKey'] ?? env('CLAUDE_API_KEY');
        $model = $settings->model_config['model'] ?? 'claude-3-5-sonnet-20240620';
        $promptKey = $role . '_prompt';
        $systemPrompt = is_array($settings->$promptKey) ? implode("\n", $settings->$promptKey) : ($settings->$promptKey ?? '');

        if (! $apiKey) {
            return ['intent' => 'error', 'reply' => 'Claude API Key 未配置。'];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->timeout(60)
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $message]
                ],
                'max_tokens' => 1024,
            ]);

            if ($response->successful()) {
                $content = $response->json('content.0.text');
                return [
                    'intent' => 'chat',
                    'reply' => $content,
                ];
            }

            return ['intent' => 'error', 'reply' => 'Claude 请求失败: ' . $response->body()];
        } catch (\Exception $e) {
            return ['intent' => 'error', 'reply' => '连接 Claude 失败: ' . $e->getMessage()];
        }
    }

    protected function getConversationHistory(string $role): array
    {
        if (app()->runningInConsole()) {
            return [];
        }

        $sessionKey = 'ai_conversation_history_' . $role;
        return session()->get($sessionKey, []);
    }

    protected function saveConversationHistory(string $role, string $message, string $reply): void
    {
        if (app()->runningInConsole()) {
            return;
        }

        $sessionKey = 'ai_conversation_history_' . $role;
        $history = session()->get($sessionKey, []);
        
        $history[] = [
            'role' => 'user',
            'message' => $message,
            'timestamp' => now()->toIso8601String(),
        ];
        
        $history[] = [
            'role' => 'assistant',
            'message' => $reply,
            'timestamp' => now()->toIso8601String(),
        ];

        // 只保留最近 10 条对话
        if (count($history) > 20) {
            $history = array_slice($history, -20);
        }

        session()->put($sessionKey, $history);
    }

    

}
