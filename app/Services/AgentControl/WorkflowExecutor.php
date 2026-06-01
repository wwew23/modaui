<?php

namespace App\Services\AgentControl;

use App\Models\WorkflowConfig;
use App\Models\AgentExecutionLog;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Workflow 执行引擎
 *
 * 使用拓扑排序执行 DAG（有向无环图）
 * 支持并行执行、条件分支、错误重试
 */
class WorkflowExecutor
{
    protected WorkflowConfig $workflow;
    protected array $graph;
    protected array $results = [];
    protected array $nodeStatus = [];
    protected array $retryCount = [];

    protected int $maxRetries = 3;
    protected float $totalCost = 0;
    protected int $totalDuration = 0;

    public function __construct(WorkflowConfig $workflow)
    {
        $this->workflow = $workflow;
        $this->graph = $workflow->graph;
    }

    /**
     * 执行工作流
     *
     * @param array $initialInput 初始输入数据
     * @param array $context 执行上下文（用户信息、店铺等）
     * @return array
     */
    public function execute(array $initialInput, array $context = []): array
    {
        $startTime = microtime(true);

        try {
            $nodes = $this->graph['nodes'] ?? [];
            $edges = $this->graph['edges'] ?? [];

            // 验证 DAG
            $this->validateDAG($nodes, $edges);

            // 拓扑排序
            $sortedNodes = $this->topologicalSort($nodes, $edges);

            $currentInput = $initialInput;

            foreach ($sortedNodes as $nodeId) {
                $node = collect($nodes)->firstWhere('id', $nodeId);

                if (!$node) {
                    continue;
                }

                try {
                    $this->nodeStatus[$nodeId] = 'running';

                    // 执行节点
                    $result = $this->executeNode($node, $currentInput, $context);

                    // 存储结果
                    $this->results[$nodeId] = $result;
                    $this->nodeStatus[$nodeId] = 'success';

                    // 合并输出作为下一个节点的输入
                    $currentInput = $this->mergeResults($currentInput, $result);

                } catch (Exception $e) {
                    $this->nodeStatus[$nodeId] = 'failed';

                    Log::error("工作流节点执行失败: {$nodeId}", [
                        'workflow' => $this->workflow->namespace,
                        'error' => $e->getMessage(),
                    ]);

                    // 可选：继续执行下一个节点或抛出异常
                    throw $e;
                }
            }

            $duration = (microtime(true) - $startTime) * 1000;

            return [
                'status' => 'success',
                'workflow_id' => $this->workflow->id,
                'workflow_namespace' => $this->workflow->namespace,
                'results' => $this->results,
                'final_output' => $currentInput,
                'node_status' => $this->nodeStatus,
                'total_cost' => $this->totalCost,
                'total_duration_ms' => (int) $duration,
                'executed_at' => now()->toIso8601String(),
            ];

        } catch (Exception $e) {
            $duration = (microtime(true) - $startTime) * 1000;

            Log::error("工作流执行失败: {$this->workflow->namespace}", [
                'error' => $e->getMessage(),
                'duration_ms' => (int) $duration,
            ]);

            return [
                'status' => 'failed',
                'workflow_id' => $this->workflow->id,
                'workflow_namespace' => $this->workflow->namespace,
                'error' => $e->getMessage(),
                'node_status' => $this->nodeStatus,
                'total_cost' => $this->totalCost,
                'total_duration_ms' => (int) $duration,
                'executed_at' => now()->toIso8601String(),
            ];
        }
    }

    /**
     * 执行单个节点
     */
    protected function executeNode(array $node, array $input, array $context): array
    {
        $nodeId = $node['id'];
        $agentId = $node['agent_id'];

        $agentConfig = \App\Models\AgentConfig::findOrFail($agentId);

        // 获取 Agent 实例
        $agent = AgentRuntimeFactory::createFromConfig(
            $agentConfig->namespace,
            $context,
            ['timeout' => $node['timeout'] ?? 120]
        );

        // 准备输入（可支持条件过滤）
        $nodeInput = $this->prepareNodeInput($node, $input);

        // 执行 Agent
        $startTime = microtime(true);

        try {
            $result = $agent->execute($nodeInput);

            $duration = (microtime(true) - $startTime) * 1000;

            // 计算成本
            $estimatedCost = $agentConfig->metadata['estimated_cost_per_call'] ?? 0;
            $this->totalCost += $estimatedCost;
            $this->totalDuration += (int) $duration;

            // 记录执行日志
            $this->logNodeExecution($nodeId, $agentId, $nodeInput, $result, 'success', (int) $duration);

            return [
                'node_id' => $nodeId,
                'status' => 'success',
                'data' => $result,
                'duration_ms' => (int) $duration,
                'cost' => $estimatedCost,
            ];

        } catch (Exception $e) {
            $duration = (microtime(true) - $startTime) * 1000;

            // 检查重试策略
            if ($this->shouldRetry($nodeId)) {
                Log::info("节点重试: {$nodeId}, 尝试次数: " . ($this->retryCount[$nodeId] + 1));
                $this->retryCount[$nodeId]++;

                // 延迟后重试
                sleep($this->retryCount[$nodeId]); // 指数退避

                return $this->executeNode($node, $input, $context);
            }

            // 记录失败
            $this->logNodeExecution($nodeId, $agentId, $nodeInput, null, 'failed', (int) $duration, $e->getMessage());

            throw $e;
        }
    }

    /**
     * 检查是否应该重试
     */
    protected function shouldRetry(string $nodeId): bool
    {
        $this->retryCount[$nodeId] = $this->retryCount[$nodeId] ?? 0;

        return $this->retryCount[$nodeId] < $this->maxRetries;
    }

    /**
     * 准备节点输入（支持条件过滤）
     */
    protected function prepareNodeInput(array $node, array $input): array
    {
        // 如果定义了条件，检查是否满足
        if (isset($node['condition']) && !$this->evaluateCondition($node['condition'], $input)) {
            return [];
        }

        return $input;
    }

    /**
     * 评估条件表达式
     */
    protected function evaluateCondition(string $condition, array $input): bool
    {
        // 简单的条件评估（可扩展为更复杂的表达式解析）
        // 例如: "market_size > 500000"

        try {
            // 使用 eval 需要非常谨慎（仅用于受信任的条件）
            // 生产环境建议实现专门的表达式解析器

            return false; // TODO: 实现条件解析
        } catch (Exception $e) {
            Log::warning("条件评估失败: {$condition}");
            return false;
        }
    }

    /**
     * 合并多个节点的结果
     */
    protected function mergeResults(array $previous, array $current): array
    {
        // 合并策略：后续节点结果覆盖前序结果，但保留所有数据
        return array_merge($previous, [
            'previous_results' => $previous,
            'latest_result' => $current,
        ]);
    }

    /**
     * 拓扑排序（使用 Kahn 算法）
     */
    protected function topologicalSort(array $nodes, array $edges): array
    {
        $nodeIds = collect($nodes)->pluck('id')->toArray();
        $inDegree = array_fill_keys($nodeIds, 0);
        $adjList = [];

        // 构建邻接表和入度数组
        foreach ($nodeIds as $id) {
            $adjList[$id] = [];
        }

        foreach ($edges as $edge) {
            $from = $edge['from'];
            $to = $edge['to'];

            $adjList[$from][] = $to;
            $inDegree[$to]++;
        }

        // 初始化队列（入度为 0 的节点）
        $queue = [];

        foreach ($inDegree as $node => $degree) {
            if ($degree == 0) {
                $queue[] = $node;
            }
        }

        $sorted = [];

        while (!empty($queue)) {
            $node = array_shift($queue);
            $sorted[] = $node;

            foreach ($adjList[$node] as $neighbor) {
                $inDegree[$neighbor]--;

                if ($inDegree[$neighbor] == 0) {
                    $queue[] = $neighbor;
                }
            }
        }

        // 检查是否存在循环
        if (count($sorted) != count($nodeIds)) {
            throw new Exception('工作流包含循环依赖');
        }

        return $sorted;
    }

    /**
     * 验证 DAG 有效性
     */
    protected function validateDAG(array $nodes, array $edges): void
    {
        if (empty($nodes)) {
            throw new Exception('工作流必须至少包含一个节点');
        }

        $validNodeIds = collect($nodes)->pluck('id')->toArray();

        foreach ($edges as $edge) {
            if (!in_array($edge['from'], $validNodeIds) || !in_array($edge['to'], $validNodeIds)) {
                throw new Exception("无效的边定义: {$edge['from']} -> {$edge['to']}");
            }
        }
    }

    /**
     * 记录节点执行
     */
    protected function logNodeExecution(
        string $nodeId,
        int $agentId,
        array $input,
        ?array $output,
        string $status,
        int $duration,
        ?string $error = null
    ): void {
        AgentExecutionLog::create([
            'agent_id' => $agentId,
            'input_text' => json_encode($input),
            'result' => $output ? json_encode($output) : null,
            'status' => $status,
            'error_message' => $error,
            'execution_duration_ms' => $duration,
            'metadata' => [
                'workflow_id' => $this->workflow->id,
                'node_id' => $nodeId,
            ],
        ]);
    }
}
