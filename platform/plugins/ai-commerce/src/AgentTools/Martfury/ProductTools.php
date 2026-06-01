<?php

namespace Botble\AiCommerce\AgentTools\Martfury;

use LarAgent\Tool;
use Botble\AiCommerce\Services\MartfuryApiClient;
use LarAgent\Attributes\Tool as ToolAttr;

class ProductTools extends Tool
{
    protected string $name = 'product_management';
    protected string $description = 'Tools for managing products: list, search, content and performance analysis.';

    private $client;

    public function __construct()
    {
        parent::__construct();
        $this->client = new MartfuryApiClient();
    }

    #[ToolAttr('获取产品列表 - 支持搜索、分类、排序')]
    public function getProducts($search = null, $category = null, $limit = 10)
    {
        return $this->client->get('/products', [
            'search' => $search,
            'category' => $category,
            'limit' => $limit,
        ]);
    }

    #[ToolAttr('分析单品表现 (销量、金额、退款率、库存诊断)')]
    public function getProductPerformance(int $productId, int $days = 30): array
    {
        return $this->client->get("/products/$productId/performance", ['days' => $days]);
    }

    #[ToolAttr('获取商品当前文案内容 (标题、描述、SEO等)')]
    public function getProductContent(int $productId): array
    {
        return $this->client->get("/products/$productId/content");
    }

    #[ToolAttr('申请更新产品内容 - 仅在商家明确确认后调用，操作将进入审批队列')]
    public function applyProductUpdate(string $productId, array $updates, string $reason): array
    {
        // 从全局变量或通过 Service 容器获取当前 shopId
        // 在 AiChatController 中我们已经将 shopId 注入到了 Agent 的 context 中
        // 这里的逻辑需要确保能访问到那个上下文
        $shopId = request()->input('shopId'); 

        $approval = \Botble\AiCommerce\Models\AiApprovalQueue::create([
            'shop_id' => $shopId,
            'action_type' => 'product_update',
            'payload' => [
                'productId' => $productId,
                'updates' => $updates
            ],
            'status' => 'pending',
            'reason' => $reason
        ]);

        return [
            'status' => 'pending_approval',
            'approval_id' => $approval->id,
            'message' => "已为您生成更新申请。您可以前往「审批队列」查看详情并确认，或者让我为您解释改动原因：{$reason}"
        ];
    }

    #[ToolAttr('申请发布折扣规则 - 操作将进入审批队列')]
    public function applyDiscountCreate(array $rule, string $reason): array
    {
        $shopId = request()->input('shopId');
        
        $approval = \Botble\AiCommerce\Models\AiApprovalQueue::create([
            'shop_id' => $shopId,
            'action_type' => 'discount_create',
            'payload' => $rule,
            'status' => 'pending',
            'reason' => $reason
        ]);

        return [
            'status' => 'pending_approval',
            'approval_id' => $approval->id,
            'message' => "折扣规则「{$rule['title']}」已提交审批。商家确认后将自动同步至 Shopify。"
        ];
    }
}
