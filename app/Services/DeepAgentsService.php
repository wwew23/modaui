<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * DeepAgentsService: 与 DeepAgents 后端服务通信的驱动。
 *
 * 职责：
 * - 管理 DeepAgents 服务连接
 * - 构建请求 payload（product, market, shop 等）
 * - 执行 HTTP 请求到 DeepAgents API
 * - 处理响应与错误
 *
 * 架构：
 * LarAgent (前台接待 + 调度) → DeepBallTool (调用入口) → DeepAgentsService (HTTP 驱动) → DeepAgents API
 */
class DeepAgentsService
{
    protected string $baseUrl;
    protected int $timeout = 120; // 长任务可能耗时
    protected bool $debug = false;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.deepagents.url', env('DEEPAGENTS_URL', 'http://localhost:8001')), '/');
        $this->debug = config('services.deepagents.debug', false);
    }

    /**
     * 执行 DeepAgents 任务
     *
     * @param string $task 任务描述 (例如："分析这款银河底板在德国市场的机会")
     * @param array $context 上下文数据 (product, market, shop 等)
     * @return array 任务执行结果
     */
    public function executeTask(string $task, array $context = []): array
    {
        try {
            $payload = [
                'task' => $task,
                'context' => $context,
            ];

            $this->log('Sending task to DeepAgents', $payload);

            $response = Http::timeout($this->timeout)
                ->post($this->baseUrl . '/api/run', $payload);

            if (!$response->successful()) {
                throw new Exception("DeepAgents API error: {$response->status()} - {$response->body()}");
            }

            $result = $response->json();
            $this->log('DeepAgents response received', $result);

            return [
                'success' => true,
                'data' => $result,
            ];
        } catch (Exception $e) {
            $this->log('DeepAgents error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * 执行市场研究任务
     *
     * @param object|array $product 商品对象或数组
     * @param string $market 目标市场 (例如："Germany")
     * @param object|array $shop 店铺对象或数组
     * @return array 研究结果
     */
    public function runMarketResearch($product, string $market, $shop): array
    {
        $context = [
            'product' => $this->normalizeData($product),
            'market' => $market,
            'shop' => $this->normalizeData($shop),
        ];

        return $this->executeTask(
            "分析商品在 {$market} 市场的机会与竞争情况",
            $context
        );
    }

    /**
     * 执行竞品分析任务
     *
     * @param object|array $product 商品对象或数组
     * @param string $market 目标市场
     * @return array 竞品分析结果
     */
    public function runCompetitorAnalysis($product, string $market): array
    {
        $context = [
            'product' => $this->normalizeData($product),
            'market' => $market,
        ];

        return $this->executeTask(
            "分析竞品策略与市场定位",
            $context
        );
    }

    /**
     * 执行 SEO 优化建议任务
     *
     * @param object|array $product 商品对象或数组
     * @param string $market 目标市场
     * @return array SEO 优化建议
     */
    public function runSeoOptimization($product, string $market): array
    {
        $context = [
            'product' => $this->normalizeData($product),
            'market' => $market,
        ];

        return $this->executeTask(
            "生成 SEO 优化建议与关键词策略",
            $context
        );
    }

    /**
     * 执行广告策略生成任务
     *
     * @param object|array $product 商品对象或数组
     * @param string $market 目标市场
     * @param float|null $budget 可选预算
     * @return array 广告策略建议
     */
    public function runAdStrategy($product, string $market, ?float $budget = null): array
    {
        $context = [
            'product' => $this->normalizeData($product),
            'market' => $market,
        ];

        if ($budget !== null) {
            $context['budget'] = $budget;
        }

        return $this->executeTask(
            "生成广告投放策略与预算分配",
            $context
        );
    }

    /**
     * 执行供应链分析任务
     *
     * @param object|array $product 商品对象或数组
     * @param string $targetMarket 目标市场
     * @return array 供应链分析结果
     */
    public function runSupplyChainAnalysis($product, string $targetMarket): array
    {
        $context = [
            'product' => $this->normalizeData($product),
            'target_market' => $targetMarket,
        ];

        return $this->executeTask(
            "分析供应链风险与优化方案",
            $context
        );
    }

    /**
     * 规范化数据（Eloquent 模型 / 数组）为可序列化格式
     *
     * @param mixed $data 数据对象或数组
     * @return array 规范化的数据
     */
    protected function normalizeData($data): array
    {
        if (is_object($data) && method_exists($data, 'toArray')) {
            return $data->toArray();
        }

        return (array) $data;
    }

    /**
     * 日志记录（调试用）
     *
     * @param string $message 日志消息
     * @param mixed $context 上下文数据
     * @return void
     */
    protected function log(string $message, $context = null): void
    {
        if ($this->debug) {
            Log::debug("[DeepAgentsService] {$message}", (array) $context);
        }
    }

    /**
     * 健康检查 - 验证 DeepAgents 服务可用性
     *
     * @return bool
     */
    public function isHealthy(): bool
    {
        try {
            $response = Http::timeout(10)
                ->get($this->baseUrl . '/health');

            return $response->successful();
        } catch (Exception $e) {
            $this->log('Health check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
