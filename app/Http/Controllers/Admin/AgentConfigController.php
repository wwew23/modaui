<?php

namespace App\Http\Controllers\Admin;

use App\Models\AgentConfig;
use App\Models\ModelConfig;
use App\Models\PromptConfig;
use App\Models\ToolConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * Admin API - Agent 管理
 *
 * 用于在后台创建、编辑、删除、测试 Agent
 * 权限：仅超级管理员可访问
 */
class AgentConfigController extends AdminController
{
    /**
     * 列出所有 Agent 配置
     */
    public function index(Request $request): JsonResponse
    {
        $query = AgentConfig::with('model', 'systemPrompt', 'tools.tool');

        // 搜索
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('namespace', 'like', "%{$search}%");
        }

        // 过滤启用状态
        if ($request->has('enabled')) {
            $query->where('enabled', $request->boolean('enabled'));
        }

        // 分页
        $perPage = $request->input('per_page', 15);
        $agents = $query->paginate($perPage);

        return response()->json($agents);
    }

    /**
     * 创建新 Agent 配置
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'namespace' => 'required|string|unique:agent_configs,namespace',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'model_id' => 'required|exists:model_configs,id',
            'system_prompt_id' => 'nullable|exists:prompt_configs,id',
            'max_tokens' => 'integer|min:100|max:32000',
            'temperature' => 'numeric|min:0|max:2',
            'top_p' => 'nullable|numeric|min:0|max:1',
            'timeout_seconds' => 'integer|min:10|max:600',
            'min_role' => 'string|in:admin,merchant,customer',
            'is_public' => 'boolean',
            'tags' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $agent = AgentConfig::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $agent->load('model', 'systemPrompt'),
                'message' => "Agent '{$agent->name}' 创建成功",
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 获取 Agent 详情
     */
    public function show(AgentConfig $agent): JsonResponse
    {
        $agent->load('model', 'systemPrompt', 'tools.tool', 'executionLogs');

        return response()->json([
            'success' => true,
            'data' => $agent,
        ]);
    }

    /**
     * 更新 Agent 配置
     */
    public function update(Request $request, AgentConfig $agent): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'model_id' => 'exists:model_configs,id',
            'system_prompt_id' => 'nullable|exists:prompt_configs,id',
            'max_tokens' => 'integer|min:100|max:32000',
            'temperature' => 'numeric|min:0|max:2',
            'enabled' => 'boolean',
            'tags' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $agent->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $agent,
                'message' => "Agent 已更新",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 删除 Agent 配置
     */
    public function destroy(AgentConfig $agent): JsonResponse
    {
        try {
            $name = $agent->name;
            $agent->delete();

            return response()->json([
                'success' => true,
                'message' => "Agent '{$name}' 已删除",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 启用/禁用 Agent
     */
    public function toggle(AgentConfig $agent): JsonResponse
    {
        try {
            $agent->update(['enabled' => !$agent->enabled]);

            $status = $agent->enabled ? '已启用' : '已禁用';

            return response()->json([
                'success' => true,
                'data' => $agent,
                'message' => "Agent {$status}",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 测试 Agent 配置
     */
    public function test(AgentConfig $agent, Request $request): JsonResponse
    {
        try {
            // 验证 Model 可用
            if (!$agent->model || !$agent->model->enabled) {
                return response()->json([
                    'success' => false,
                    'error' => '关联的 Model 不存在或已禁用',
                ], 400);
            }

            // 验证 System Prompt
            if ($agent->system_prompt_id && !$agent->systemPrompt) {
                return response()->json([
                    'success' => false,
                    'error' => '关联的 System Prompt 不存在',
                ], 400);
            }

            // 验证 Tools
            $tools = $agent->tools;
            foreach ($tools as $binding) {
                if (!$binding->tool->enabled) {
                    return response()->json([
                        'success' => false,
                        'error' => "工具 '{$binding->tool->name}' 已禁用",
                    ], 400);
                }
            }

            // 返回测试结果
            return response()->json([
                'success' => true,
                'data' => [
                    'agent_id' => $agent->id,
                    'name' => $agent->name,
                    'model' => $agent->model->name,
                    'system_prompt' => $agent->systemPrompt?->name,
                    'tools_count' => $tools->count(),
                    'tools' => $tools->map(fn($t) => [
                        'name' => $t->tool->name,
                        'type' => $t->tool->type,
                        'enabled' => $t->tool->enabled,
                    ]),
                    'config_valid' => true,
                ],
                'message' => "Agent 配置有效",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 获取执行统计
     */
    public function stats(AgentConfig $agent, Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 7);

            $logs = $agent->executionLogs()
                ->whereDate('created_at', '>=', now()->subDays($days))
                ->get();

            $stats = [
                'total_executions' => $logs->count(),
                'successful' => $logs->where('status', 'success')->count(),
                'failed' => $logs->where('status', 'failed')->count(),
                'total_cost' => $logs->sum('cost'),
                'avg_duration_ms' => (int) $logs->avg('execution_duration_ms'),
                'success_rate' => $logs->count() > 0 
                    ? round($logs->where('status', 'success')->count() / $logs->count() * 100, 2)
                    : 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
