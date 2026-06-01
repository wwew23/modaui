<?php

namespace App\Services\AgentControl;

use App\Models\AgentConfig;
use App\Models\ModelConfig;
use App\Models\PromptConfig;
use Botble\AiCommerce\AiAgents\MartfuryShopkeeperAgent;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * Agent 运行时工厂
 *
 * 根据数据库配置动态创建和配置 Agent 实例
 * 支持多模型策略、工具绑定、System Prompt 管理
 */
class AgentRuntimeFactory
{
    /**
     * 根据命名空间创建 Agent
     *
     * @param string $agentNamespace  例如 'ai_center.market_research'
     * @param array $context         上下文变量，用于渲染 Prompt
     * @param array $overrides       运行时参数覆盖
     * @return MartfuryShopkeeperAgent
     */
    public static function createFromConfig(
        string $agentNamespace,
        array $context = [],
        array $overrides = []
    ): MartfuryShopkeeperAgent {
        // 1. 从数据库读取 Agent 配置
        $agentConfig = AgentConfig::where('namespace', $agentNamespace)
            ->firstOrFail();

        if (!$agentConfig->enabled) {
            throw new Exception("Agent {$agentNamespace} 已禁用");
        }

        // 2. 读取关联的 Tools
        $tools = $agentConfig->tools()
            ->with('tool')
            ->orderBy('priority')
            ->get();

        // 3. 读取 System Prompt（支持变量替换）
        $systemPrompt = null;
        if ($agentConfig->system_prompt_id) {
            $promptConfig = PromptConfig::findOrFail($agentConfig->system_prompt_id);
            $systemPrompt = $promptConfig->renderTemplate($context);
        }

        // 4. 读取 Model 配置
        $modelConfig = $agentConfig->model ?? $this->getDefaultModel();

        if (!$modelConfig->enabled) {
            throw new Exception("模型 {$modelConfig->namespace} 已禁用，且无可用的故障转移模型");
        }

        // 5. 构建 LarAgent 实例
        $sessionId = $overrides['session_id'] ?? uniqid('session_');
        $agent = new MartfuryShopkeeperAgent($sessionId);

        // 6. 注册 Tools（动态加载）
        foreach ($tools as $toolBinding) {
            try {
                $toolClass = $toolBinding->tool->handler_class;

                if (!class_exists($toolClass)) {
                    Log::warning("Tool 类不存在: {$toolClass}");
                    continue;
                }

                $toolInstance = new $toolClass($toolBinding->tool_params ?? []);
                $agent->registerTool($toolInstance);
            } catch (Exception $e) {
                Log::error("工具注册失败: {$toolBinding->tool->name}", [
                    'error' => $e->getMessage(),
                ]);
                // 继续处理其他工具
            }
        }

        // 7. 设置 System Prompt
        if ($systemPrompt) {
            $agent->setSystemPrompt($systemPrompt);
        }

        // 8. 设置 Model 配置
        $modelConfig = $this->selectBestModel($modelConfig, $context);

        $agent->setModelConfig([
            'provider' => $modelConfig->provider,
            'model' => $modelConfig->model_name,
            'api_key' => $modelConfig->getApiKey(),
            'api_endpoint' => $modelConfig->api_endpoint,
            'max_tokens' => $overrides['max_tokens'] ?? $agentConfig->max_tokens,
            'temperature' => $overrides['temperature'] ?? $agentConfig->temperature,
            'top_p' => $agentConfig->top_p,
            'timeout' => $agentConfig->timeout_seconds,
        ]);

        // 9. 记录 Agent 实例化
        Log::info("Agent 创建成功: {$agentNamespace}", [
            'model' => $modelConfig->model_name,
            'tools_count' => $tools->count(),
        ]);

        return $agent;
    }

    /**
     * 选择最佳的 Model（考虑优先级、可用性、成本等）
     */
    protected static function selectBestModel(
        ModelConfig $primaryModel,
        array $context = []
    ): ModelConfig {
        if ($primaryModel->enabled && $primaryModel->availability_percentage >= 95) {
            return $primaryModel;
        }

        // 尝试使用故障转移模型
        if ($primaryModel->fallback_model_id) {
            $fallback = ModelConfig::findOrFail($primaryModel->fallback_model_id);

            if ($fallback->enabled) {
                Log::warning("使用故障转移模型: {$fallback->namespace}", [
                    'primary_model' => $primaryModel->namespace,
                    'reason' => $primaryModel->enabled ? '可用性低' : '已禁用',
                ]);

                return $fallback;
            }
        }

        // 最后的手段：查找任何可用的模型
        $available = ModelConfig::enabled()
            ->orderByPriority()
            ->first();

        if ($available) {
            Log::warning("使用备选模型: {$available->namespace}");
            return $available;
        }

        throw new Exception('没有可用的 Model 配置');
    }

    /**
     * 获取默认 Model
     */
    protected static function getDefaultModel(): ModelConfig
    {
        return ModelConfig::enabled()
            ->orderByPriority()
            ->firstOrFail();
    }
}
