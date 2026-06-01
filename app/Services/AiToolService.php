<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class AiToolService
{
    public function __construct(protected AiTools $aiTools)
    {
    }

    public function getToolsDefinition(string $role = 'merchant'): array
    {
        $tools = [];

        if ($role === 'merchant') {
            $tools = [
                $this->makeFunctionDefinition('sales_summary', '获取指定店铺最近 N 天的销售概览指标。', [
                    'range' => ['type' => 'string', 'description' => '时间范围，例如 7d、30d、90d、last_7_days、last_30_days。'],
                ], []),
                $this->makeFunctionDefinition('product_performance', '获取单个商品的本地表现数据。', [
                    'product_id' => ['type' => 'string', 'description' => '商品 ID。'],
                ], ['product_id']),
                $this->makeFunctionDefinition('top_customers', '获取店铺的高价值客户排名。', [
                    'limit' => ['type' => 'integer', 'description' => '返回前多少个客户，默认 3。'],
                ], []),
                $this->makeFunctionDefinition('product_update', '更新商品信息，包括标题、描述、价格、图片、库存、SKU 等。', [
                    'product_id' => ['type' => 'string', 'description' => '商品 ID。'],
                    'input' => ['type' => 'object', 'description' => '商品更新数据，可包含 name、description、price、sku、quantity、image 等字段。', 'additionalProperties' => true],
                ], ['product_id', 'input']),
                $this->makeFunctionDefinition('product_create', '创建新的本地商品。', [
                    'input' => ['type' => 'object', 'description' => '商品数据，可包含 name、description、price、sku、quantity、image 等字段。', 'additionalProperties' => true],
                ], ['input']),
                $this->makeFunctionDefinition('collection_create', '创建新的商品集合。', [
                    'input' => ['type' => 'object', 'description' => '集合数据，可包含 name、description、image 等字段。', 'additionalProperties' => true],
                ], ['input']),
                $this->makeFunctionDefinition('collection_update', '更新现有商品集合。', [
                    'collection_id' => ['type' => 'string', 'description' => '集合 ID。'],
                    'input' => ['type' => 'object', 'description' => '集合更新数据，可包含 name、description、image 等字段。', 'additionalProperties' => true],
                ], ['collection_id', 'input']),
                $this->makeFunctionDefinition('discount_create', '创建本地折扣码或促销活动。', [
                    'input' => ['type' => 'object', 'description' => '折扣参数，可包含 title、code、type、value、start_date、end_date、min_order_price 等字段。', 'additionalProperties' => true],
                ], ['input']),
                $this->makeFunctionDefinition('customer_segment', '创建或分析本地客户细分，找出未购买或高价值客户。', [
                    'criteria' => ['type' => 'object', 'description' => '细分条件，如 last_purchase_days、min_spent、tag 等。', 'additionalProperties' => true],
                ], []),
                $this->makeFunctionDefinition('order_detail', '查询本地订单详情。', [
                    'order_id' => ['type' => 'string', 'description' => '订单 ID 或订单号。'],
                ], ['order_id']),
                $this->makeFunctionDefinition('draft_order_detail', '查询草稿订单详情。', [
                    'draft_order_id' => ['type' => 'string', 'description' => '草稿订单 ID。'],
                ], ['draft_order_id']),
                $this->makeFunctionDefinition('theme_adjust', '建议主题设置调整，例如颜色、字体、区块显示规则。', [
                    'theme_id' => ['type' => 'string', 'description' => '主题 ID。'],
                    'settings' => ['type' => 'object', 'description' => '主题设置字段，例如 colors、typography、sections 等。', 'additionalProperties' => true],
                ], ['theme_id', 'settings']),
                $this->makeFunctionDefinition('theme_design_suggestion', '生成店铺装修和页面布局建议，输出可落地的主题配置方案。', [
                    'style' => ['type' => 'string', 'description' => '装修风格，例如简约、科技、轻奢。'],
                    'page' => ['type' => 'string', 'description' => '目标页面，例如首页、商品页、专题页。'],
                    'audience' => ['type' => 'string', 'description' => '目标人群，例如年轻女性、数码爱好者。'],
                    'focus' => ['type' => 'string', 'description' => '设计重点，例如新品、促销、品牌形象。'],
                    'theme_options' => ['type' => 'object', 'description' => '可选的主题配置建议，例如主色、字体、Banner 文案、模块布局。', 'additionalProperties' => true],
                ], []),
                $this->makeFunctionDefinition('homepage_layout_suggestion', '生成首页布局建议，输出 sections、layout 和布局顺序。', [
                    'page' => ['type' => 'string', 'description' => '目标页面，例如首页、商品页。'],
                    'audience' => ['type' => 'string', 'description' => '目标人群，例如年轻女性、数码用户。'],
                    'focus' => ['type' => 'string', 'description' => '布局侧重，例如新品、促销、品牌形象。'],
                ], []),
                $this->makeFunctionDefinition('theme_section_update', '更新指定页面的某个区块或模块，输出可直接落地的 section 配置。', [
                    'page' => ['type' => 'string', 'description' => '目标页面，例如首页。'],
                    'section' => ['type' => 'object', 'description' => '要更新的模块配置，包含 type、title、content、style 等字段。', 'additionalProperties' => true],
                    'theme_options' => ['type' => 'object', 'description' => '可选的主题配置更新项。', 'additionalProperties' => true],
                ], []),
                $this->makeFunctionDefinition('theme_options', '读取当前店铺主题配置项。', [
                    'keys' => ['type' => 'array', 'description' => '希望读取的主题配置键列表。', 'items' => ['type' => 'string']],
                ], []),
                $this->makeFunctionDefinition('theme_option_update', '更新主题配置项。', [
                    'options' => ['type' => 'object', 'description' => '要更新的主题配置项对象。', 'additionalProperties' => true],
                ], ['options']),
                $this->makeFunctionDefinition('theme_layout_apply', '应用推荐的页面布局和主题方案。', [
                    'layout' => ['type' => 'object', 'description' => '页面布局配置，例如 section 顺序、模块大小、展示逻辑。', 'additionalProperties' => true],
                    'theme_options' => ['type' => 'object', 'description' => '主题配置项，例如 colors、typography、banner、images。', 'additionalProperties' => true],
                ], []),
                $this->makeFunctionDefinition('app_recommendation', '根据业务需求推荐平台功能或扩展方案。', [
                    'need' => ['type' => 'string', 'description' => '需要解决的业务场景，例如优惠、库存、客户服务。'],
                ], []),
                $this->makeFunctionDefinition('domain_availability', '检查域名是否可注册。', [
                    'domain' => ['type' => 'string', 'description' => '待检查的域名，例如 example-store.com。'],
                ], ['domain']),
            ];
        } else {
            $tools = [
                $this->makeFunctionDefinition('search_products', '搜索当前店铺或平台中的商品。', [
                    'query' => ['type' => 'string', 'description' => '搜索关键词或用户描述。'],
                    'page_type' => ['type' => 'string', 'description' => '当前页面类型，例如 product_detail。'],
                    'resource_id' => ['type' => 'string', 'description' => '当前页面对应商品 ID。'],
                ], ['query']),
                $this->makeFunctionDefinition('add_to_cart', '尝试将指定商品加入购物车。', [
                    'product_id' => ['type' => 'string', 'description' => '商品 ID。'],
                    'quantity' => ['type' => 'integer', 'description' => '加入购物车的数量。'],
                ], ['product_id']),
                $this->makeFunctionDefinition('order_status', '查询订单状态。', [
                    'order_identifier' => ['type' => 'string', 'description' => '订单号、邮箱或手机号。'],
                ], ['order_identifier']),
                $this->makeFunctionDefinition('search_faq', '查询平台或店铺的 FAQ 答案。', [
                    'question' => ['type' => 'string', 'description' => '顾客的问题文本。'],
                ], ['question']),
            ];
        }

        return $tools;
    }

    protected function makeFunctionDefinition(string $name, string $description, array $properties, array $required = []): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => $name,
                'description' => $description,
                'parameters' => [
                    'type' => 'object',
                    'properties' => $properties,
                    'required' => $required,
                    'additionalProperties' => false,
                ],
            ],
        ];
    }

    public function dispatchTool(string $toolName, array $args = [], array $context = []): array
    {
        $toolName = Str::lower($toolName);
        $args = Arr::dot($args);

        return match ($toolName) {
            'sales_summary' => $this->aiTools->getSalesSummary($args['range'] ?? '30d', $context['shop_domain'] ?? null),
            'product_performance' => $this->aiTools->getProductPerformance($args['product_id'] ?? $args['productId'] ?? ''),
            'top_customers' => $this->aiTools->getTopCustomers((int)($args['limit'] ?? 3)),
            'product_update' => $this->aiTools->updateProduct($args['product_id'] ?? $args['productId'] ?? null, $args['input'] ?? []),
            'product_create' => $this->aiTools->createProduct($args['input'] ?? []),
            'collection_create' => $this->aiTools->createCollection($args['input'] ?? []),
            'collection_update' => $this->aiTools->updateCollection($args['collection_id'] ?? $args['collectionId'] ?? null, $args['input'] ?? []),
            'discount_create' => $this->aiTools->createDiscountCode($args['input'] ?? []),
            'customer_segment' => $this->aiTools->customerSegment($args['criteria'] ?? []),
            'order_detail' => $this->aiTools->orderDetail($args['order_id'] ?? $args['orderId'] ?? null),
            'draft_order_detail' => $this->aiTools->draftOrderDetail($args['draft_order_id'] ?? $args['draftOrderId'] ?? null),
            'theme_adjust' => $this->aiTools->adjustTheme($args['theme_id'] ?? $args['themeId'] ?? null, $args['settings'] ?? []),
            'theme_design_suggestion' => $this->aiTools->themeDesignSuggestion($args),
            'homepage_layout_suggestion' => $this->aiTools->homepageLayoutSuggestion($args),
            'theme_section_update' => $this->aiTools->updateThemeSection($args),
            'theme_options' => $this->aiTools->getThemeOptions($args['keys'] ?? []),
            'theme_option_update' => $this->aiTools->updateThemeOptions($args['options'] ?? $args['theme_options'] ?? []),
            'theme_layout_apply' => $this->aiTools->applyThemeDesign($args),
            'app_recommendation' => $this->aiTools->appRecommendations($args['need'] ?? ''),
            'domain_availability' => $this->aiTools->checkDomainAvailability($args['domain'] ?? ''),
            'search_products' => $this->aiTools->searchProducts($args['query'] ?? '', $context, $context['shop_domain'] ?? null),
            'add_to_cart' => $this->aiTools->addToCart($args['product_id'] ?? $args['productId'] ?? 0, (int)($args['quantity'] ?? 1)),
            'order_status' => $this->aiTools->orderStatus($args['order_identifier'] ?? $args['orderId'] ?? null),
            'search_faq' => $this->aiTools->searchFaq($args['question'] ?? $args['query'] ?? ''),
            default => [
                'error' => "未知工具 {$toolName}，无法调用。",
            ],
        };
    }

    public function parseOllamaToolCall(array $response): ?array
    {
        if (isset($response['message']['tool_calls']) && is_array($response['message']['tool_calls'])) {
            return $this->normalizeToolCall($response['message']['tool_calls'][0] ?? []);
        }

        if (isset($response['tool_calls']) && is_array($response['tool_calls'])) {
            return $this->normalizeToolCall($response['tool_calls'][0] ?? []);
        }

        $content = $this->extractAssistantText($response);
        if ($content && $this->looksLikeJsonToolCall($content)) {
            $payload = json_decode($content, true);
            if (is_array($payload) && isset($payload['tool'])) {
                return [
                    'tool' => $payload['tool'],
                    'args' => $payload['args'] ?? [],
                    'raw' => $payload,
                ];
            }
        }

        return null;
    }

    public function extractAssistantText(array $response): ?string
    {
        if (isset($response['message']['content'])) {
            return $this->normalizeContent($response['message']['content']);
        }

        if (isset($response['response']) && is_string($response['response'])) {
            return $response['response'];
        }

        if (isset($response['text']) && is_string($response['text'])) {
            return $response['text'];
        }

        if (isset($response['output']) && is_string($response['output'])) {
            return $response['output'];
        }

        if (isset($response['choices'][0]['message']['content'])) {
            return $this->normalizeContent($response['choices'][0]['message']['content']);
        }

        return null;
    }

    protected function normalizeContent(mixed $content): string
    {
        if (is_array($content)) {
            return collect($content)->flatten()->implode('');
        }

        return (string) $content;
    }

    protected function normalizeToolCall(array $toolCall): ?array
    {
        if (isset($toolCall['function'])) {
            $function = $toolCall['function'];
            $name = $function['name'] ?? null;
            $arguments = $function['arguments'] ?? null;

            if ($name && $arguments !== null) {
                $args = is_string($arguments) ? json_decode($arguments, true) ?? [] : $arguments;
                return [
                    'tool' => $name,
                    'args' => is_array($args) ? $args : [],
                    'raw' => $toolCall,
                ];
            }
        }

        return null;
    }

    protected function looksLikeJsonToolCall(string $content): bool
    {
        $trimmed = trim($content);
        return str_starts_with($trimmed, '{') && str_contains($trimmed, '"tool"');
    }
}
