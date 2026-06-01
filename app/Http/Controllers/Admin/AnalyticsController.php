<?php

namespace App\Http\Controllers\Admin;

use App\Models\AgentExecutionLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends AdminController
{
    public function agentUsage(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $days = $request->input('days', 7);
        $agentId = $request->input('agent_id');

        $query = AgentExecutionLog::query();
        if ($agentId) {
            $query->where('agent_id', $agentId);
        }

        $period = now()->subDays($days);
        $logs = $query->where('created_at', '>=', $period)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_executions' => $logs->count(),
                'success' => $logs->where('status', 'success')->count(),
                'failed' => $logs->where('status', 'failed')->count(),
                'average_cost' => $logs->avg('cost'),
                'average_duration_ms' => $logs->avg('execution_duration_ms'),
            ],
        ]);
    }

    public function costBreakdown(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $agentId = $request->input('agent_id');
        $query = AgentExecutionLog::query();
        if ($agentId) {
            $query->where('agent_id', $agentId);
        }

        $totals = $query->selectRaw('agent_id, SUM(cost) as total_cost, COUNT(*) as runs')
            ->groupBy('agent_id')
            ->get();

        return response()->json(['success' => true, 'data' => $totals]);
    }

    public function performance(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $agentId = $request->input('agent_id');
        $query = AgentExecutionLog::query();
        if ($agentId) {
            $query->where('agent_id', $agentId);
        }

        $logs = $query->get();

        return response()->json([
            'success' => true,
            'data' => [
                'success_rate' => $logs->count() > 0 ? round($logs->where('status', 'success')->count() / $logs->count() * 100, 2) : 0,
                'average_duration_ms' => $logs->avg('execution_duration_ms'),
                'average_cost' => $logs->avg('cost'),
            ],
        ]);
    }
}
