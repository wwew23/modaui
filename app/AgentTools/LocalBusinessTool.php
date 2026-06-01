<?php

namespace App\AgentTools;

use App\Services\AiTools;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use LarAgent\Tool;

class LocalBusinessTool extends Tool
{
    protected AiTools $aiTools;
    protected array $toolConfig;

    protected string $name = 'business_tool';
    protected string $description = '执行本地业务操作，包括商品、集合、折扣、订单和主题建议。';

    public function __construct(array $config = [])
    {
        parent::__construct();

        $this->aiTools = app(AiTools::class);
        $this->toolConfig = $config;

        if (! empty($config['name'])) {
            $this->name = $config['name'];
        }

        if (! empty($config['description'])) {
            $this->description = $config['description'];
        }
    }

    public function execute(array $arguments = []): string
    {
        try {
            $action = Arr::get($this->toolConfig, 'action', Arr::get($arguments, 'action'));
            $payload = Arr::get($arguments, 'input', Arr::get($arguments, 'payload', []));

            $result = match ($action) {
                'update_product' => $this->aiTools->updateProduct(Arr::get($arguments, 'product_id', Arr::get($arguments, 'productId')), $payload),
                'create_product' => $this->aiTools->createProduct($payload),
                'create_collection' => $this->aiTools->createCollection($payload),
                'update_collection' => $this->aiTools->updateCollection(Arr::get($arguments, 'collection_id', Arr::get($arguments, 'collectionId')), $payload),
                'create_discount' => $this->aiTools->createDiscountCode($payload),
                'segment_customers' => $this->aiTools->customerSegment(Arr::get($arguments, 'criteria', [])),
                'get_order' => $this->aiTools->orderDetail(Arr::get($arguments, 'order_id', Arr::get($arguments, 'orderId'))),
                'get_draft_order' => $this->aiTools->draftOrderDetail(Arr::get($arguments, 'draft_order_id', Arr::get($arguments, 'draftOrderId'))),
                'adjust_theme' => $this->aiTools->adjustTheme(Arr::get($arguments, 'theme_id', Arr::get($arguments, 'themeId')), Arr::get($arguments, 'settings', [])),
                'theme_design_suggestion' => $this->aiTools->themeDesignSuggestion(Arr::get($arguments, 'theme_options', Arr::get($arguments, 'input', []))),
                'theme_options' => $this->aiTools->getThemeOptions(Arr::get($arguments, 'keys', [])),
                'theme_option_update' => $this->aiTools->updateThemeOptions(Arr::get($arguments, 'options', Arr::get($arguments, 'theme_options', Arr::get($arguments, 'input', [])))),
                'theme_layout_apply' => $this->aiTools->applyThemeDesign(Arr::get($arguments, 'layout', []) + ['theme_options' => Arr::get($arguments, 'theme_options', Arr::get($arguments, 'input', []))]),
                'recommend_app' => $this->aiTools->appRecommendations(Arr::get($arguments, 'need', '')),
                'check_domain' => $this->aiTools->checkDomainAvailability(Arr::get($arguments, 'domain', '')),
                default => [
                    'success' => false,
                    'error' => "未知本地操作: {$action}",
                ],
            };

            return is_string($result) ? $result : json_encode($result, JSON_UNESCAPED_UNICODE);
        } catch (\Throwable $e) {
            Log::error('[LocalBusinessTool] 执行失败: ' . $e->getMessage(), [
                'arguments' => $arguments,
                'toolConfig' => $this->toolConfig,
            ]);

            return json_encode([
                'success' => false,
                'error' => '本地业务工具执行失败: ' . $e->getMessage(),
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
