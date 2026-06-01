<?php

namespace Botble\AiMultiIndustry\Http\Controllers\Admin\Reports;

use Botble\Base\Http\Controllers\BaseController;
use Botble\AiMultiIndustry\Models\AiChatMessage;
use Botble\AiMultiIndustry\Models\AiChatSession;
use Botble\AiMultiIndustry\Models\Industry;
use Botble\AiMultiIndustry\Models\IndustryEmployee;
use Illuminate\Http\Request;

class ChatHistoryController extends BaseController
{
    public function index(Request $request)
    {
        $query = AiChatSession::with(['industry', 'employee', 'messages']);

        // 按行业筛选
        if ($request->filled('industry_id')) {
            $query->where('industry_id', $request->get('industry_id'));
        }

        // 按员工筛选
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->get('employee_id'));
        }

        // 按商户筛选
        if ($request->filled('merchant_id')) {
            $query->where('merchant_id', $request->get('merchant_id'));
        }

        // 按日期筛选
        if ($request->filled('start_date')) {
            $query->where('started_at', '>=', $request->get('start_date') . ' 00:00:00');
        }

        if ($request->filled('end_date')) {
            $query->where('started_at', '<=', $request->get('end_date') . ' 23:59:59');
        }

        $sessions = $query->orderBy('created_at', 'desc')->paginate(15);

        $industries = Industry::where('enabled', true)->orderBy('sort_order')->get();
        $employees = IndustryEmployee::where('enabled', true)->with('industry')->orderBy('sort_order')->get();

        return view('plugins.ai-multi-industry::admin.chat-history.index', compact(
            'sessions',
            'industries',
            'employees'
        ));
    }

    public function show($sessionId)
    {
        $session = AiChatSession::with(['industry', 'employee', 'messages'])->findOrFail($sessionId);
        $messages = $session->messages()->orderBy('created_at', 'asc')->get();

        return view('plugins.ai-multi-industry::admin.chat-history.show', compact('session', 'messages'));
    }

    /**
     * 获取统计数据
     */
    public function statistics(Request $request)
    {
        $query = AiChatSession::query();

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->get('start_date') . ' 00:00:00');
        }

        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->get('end_date') . ' 23:59:59');
        }

        $stats = [
            'total_sessions' => (clone $query)->count(),
            'active_sessions' => (clone $query)->whereNull('ended_at')->count(),
            'total_messages' => (clone $query)->sum('total_messages'),
            'total_merchants' => (clone $query)->distinct('merchant_id')->count('merchant_id'),
        ];

        // 按行业统计
        $byIndustry = (clone $query)->with('industry')
            ->selectRaw('industry_id, count(*) as count, sum(total_messages) as total_messages')
            ->groupBy('industry_id')
            ->get();

        // 按员工统计
        $byEmployee = (clone $query)->with('employee')
            ->selectRaw('employee_id, count(*) as count, sum(total_messages) as total_messages')
            ->groupBy('employee_id')
            ->get();

        return response()->json([
            'success' => true,
            'statistics' => $stats,
            'by_industry' => $byIndustry,
            'by_employee' => $byEmployee,
        ]);
    }

    /**
     * 导出聊天记录
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'format' => 'required|in:csv,json',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = AiChatMessage::with(['session', 'industry', 'employee']);

        if ($validated['start_date'] ?? null) {
            $query->where('created_at', '>=', $validated['start_date'] . ' 00:00:00');
        }

        if ($validated['end_date'] ?? null) {
            $query->where('created_at', '<=', $validated['end_date'] . ' 23:59:59');
        }

        $messages = $query->orderBy('created_at', 'desc')->get();

        if ($validated['format'] === 'json') {
            return response()->json([
                'success' => true,
                'data' => $messages,
            ]);
        }

        // CSV 导出
        $csv = "会话ID,行业,员工,角色,用户消息,AI回复,置信度,创建时间\n";
        foreach ($messages as $msg) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%d","%s"' . "\n",
                $msg->session_id,
                $msg->industry?->name ?? '未知',
                $msg->employee?->name ?? '未知',
                $msg->role,
                str_replace('"', '""', $msg->user_message),
                str_replace('"', '""', $msg->ai_response),
                $msg->confidence,
                $msg->created_at
            );
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="chat-history-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}
