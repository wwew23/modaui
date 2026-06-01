<?php

namespace Botble\\AiMultiIndustry\\Http\\Controllers;

use App\\Services\\AiService;
use Botble\\Base\\Http\\Controllers\\BaseController;
use Botble\\AiMultiIndustry\\Models\\Industry;
use Botble\\AiMultiIndustry\\Models\\IndustryEmployee;
use Botble\\AiMultiIndustry\\Models\\AiChatSession;
use Botble\\AiMultiIndustry\\Services\\AiCoordinator;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Log;

class AiChatController extends BaseController
{
    /**
     * 处理聊天请求
     */
    public function handle(Request $request, AiCoordinator $coordinator)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'industry_id' => 'required|exists:ai_industries,id',
            'employee_id' => 'required|exists:ai_industry_employees,id',
            'shop_id' => 'nullable|integer',
            'merchant_id' => 'nullable|string|max:100',
            'session_token' => 'nullable|string|max:255',
        ]);

        try {
            $industry = Industry::findOrFail($validated['industry_id']);
            $employee = IndustryEmployee::findOrFail($validated['employee_id']);

            if (!$industry->enabled || !$employee->enabled) {
                return response()->json([
                    'success' => false,
                    'message' => '该行业或员工已禁用',
                ], 422);
            }

            $response = $coordinator->routeMessage(
                $validated['message'],
                $industry,
                $employee,
                $validated['shop_id'],
                $validated['merchant_id']
            );

            return response()->json([
                'success' => true,
                'data' => array_merge($response, [
                    'industry' => $industry->slug,
                    'employee' => $employee->role,
                    'industry_name' => $industry->name,
                    'employee_name' => $employee->name,
                ]),
            ]);
        } catch (\\Throwable $e) {
            Log::error('AI Chat Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => '聊天请求处理失败，请稍后重试',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * 获取活跃会话
     */
    public function getSession(Request $request)
    {
        $validated = $request->validate([
            'session_token' => 'required|string|max:255',
        ]);

        $session = AiChatSession::where('session_token', $validated['session_token'])
            ->with(['messages' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(50);
            }, 'industry', 'employee'])
            ->first();

        if (!$session || !$session->isActive()) {
            return response()->json([
                'success' => false,
                'message' => '会话不存在或已过期',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $session->id,
                'token' => $session->session_token,
                'industry' => $session->industry,
                'employee' => $session->employee,
                'messages' => $session->messages->reverse()->values(),
                'total_messages' => $session->total_messages,
            ],
        ]);
    }

    /**
     * 关闭会话
     */
    public function closeSession(Request $request)
    {
        $validated = $request->validate([
            'session_token' => 'required|string|max:255',
        ]);

        $session = AiChatSession::where('session_token', $validated['session_token'])->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => '会话不存在',
            ], 404);
        }

        $session->close();

        return response()->json([
            'success' => true,
            'message' => '会话已关闭',
        ]);
    }
}
