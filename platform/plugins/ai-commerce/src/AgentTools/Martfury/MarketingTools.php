<?php

namespace Botble\AiCommerce\AgentTools\Martfury;

use LarAgent\Tool;
use Botble\AiCommerce\Services\MartfuryApiClient;
use LarAgent\Attributes\Tool as ToolAttr;

class MarketingTools extends Tool
{
    protected string $name = 'marketing';
    protected string $description = 'Tools for managing discounts and marketing campaigns.';

    private $client;

    public function __construct()
    {
        parent::__construct();
        $this->client = new MartfuryApiClient();
    }

    #[ToolAttr('创建折扣码 - 需要确认')]
    public function createDiscount(string $code, float $value, string $type = 'percentage'): array
    {
        return [
            'status' => 'pending_approval',
            'action' => 'create_discount',
            'data' => compact('code', 'value', 'type'),
            'message' => "准备创建折扣码: {$code}，优惠额度: {$value}" . ($type === 'percentage' ? '%' : '') . "。请确认。"
        ];
    }

    #[ToolAttr('获取活跃折扣列表')]
    public function getActiveDiscounts(): array
    {
        return $this->client->get('/discounts', ['status' => 'published']);
    }
}
