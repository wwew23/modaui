<?php

namespace Botble\AiCommerce\AgentTools\Martfury;

use LarAgent\Tool;
use Botble\AiCommerce\Services\MartfuryApiClient;
use LarAgent\Attributes\Tool as ToolAttr;

class AnalyticsTools extends Tool
{
    protected string $name = 'analytics';
    protected string $description = 'Tools for sales analysis and shop performance metrics.';

    private $client;

    public function __construct()
    {
        parent::__construct();
        $this->client = new MartfuryApiClient();
    }

    #[ToolAttr('获取核心 KPI 摘要 (GMV, 订单数, 客单价, 退款率等)')]
    public function getKpiSummary(int $days = 7): array
    {
        // 增加字段对齐原型要求
        return $this->client->get('/analytics/kpi-summary', [
            'days' => $days,
            'extended_metrics' => true 
        ]);
    }

    #[ToolAttr('获取热门产品排行 (爆款列表)')]
    public function getTopProducts(int $days = 30, int $limit = 10): array
    {
        return $this->client->get('/analytics/top-products', [
            'days' => $days,
            'limit' => $limit
        ]);
    }

    #[ToolAttr('获取低销量产品列表 (滞销品诊断)')]
    public function getLowSalesProducts(int $days = 30, int $limit = 10): array
    {
        return $this->client->get('/analytics/low-sales-products', [
            'days' => $days,
            'limit' => $limit
        ]);
    }

    #[ToolAttr('获取店铺整体运营概览')]
    public function getShopOverview(): array
    {
        return $this->client->get('/analytics/overview');
    }
}
