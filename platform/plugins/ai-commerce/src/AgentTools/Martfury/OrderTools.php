<?php

namespace Botble\AiCommerce\AgentTools\Martfury;

use LarAgent\Tool;
use Botble\AiCommerce\Services\MartfuryApiClient;
use LarAgent\Attributes\Tool as ToolAttr;

class OrderTools extends Tool
{
    protected string $name = 'order_management';
    protected string $description = 'Tools for managing orders: list, detail, and status updates.';

    private $client;

    public function __construct()
    {
        parent::__construct();
        $this->client = new MartfuryApiClient();
    }

    #[ToolAttr('获取订单列表，支持状态筛选')]
    public function getOrders(string $status = null, int $limit = 10): array
    {
        return $this->client->get('/orders', [
            'status' => $status,
            'limit' => $limit,
        ]);
    }

    #[ToolAttr('获取订单详情')]
    public function getOrderDetail(int $orderId): array
    {
        return $this->client->get("/orders/$orderId");
    }

    #[ToolAttr('更新订单状态 - 需要确认')]
    public function updateOrderStatus(int $orderId, string $status): array
    {
        return [
            'status' => 'pending_approval',
            'action' => 'update_order_status',
            'data' => compact('orderId', 'status'),
            'message' => "准备将订单 #{$orderId} 的状态更新为: {$status}。请确认。"
        ];
    }
}
