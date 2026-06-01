<?php

namespace Botble\AiCommerce\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\QueryException;
use Botble\Base\Http\Controllers\BaseController;

class AiRuntimeProxyController extends BaseController
{
    public function proxy(Request $request, string $path = '')
    {
        $baseUrl = env('MODAUI_OS_API_BASE_URL', 'http://localhost:4000');
        $url = rtrim($baseUrl, '/') . '/api/os' . ($path !== '' ? '/' . $path : '');

        $method = strtoupper($request->method());

        $headers = [
            'Accept' => $request->header('Accept', 'application/json'),
        ];

        if ($contentType = $request->header('Content-Type')) {
            $headers['Content-Type'] = $contentType;
        }

        if ($token = env('MODAUI_INTERNAL_SYSTEM_TOKEN')) {
            $headers['Authorization'] = 'Bearer ' . $token;
        }

        $options = [
            'query' => $request->query(),
        ];

        if (! in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            $options['body'] = $request->getContent();
        }

        $response = Http::withHeaders($headers)->send($method, $url, $options);

        $responseHeaders = collect($response->headers())
            ->except(['transfer-encoding', 'content-length', 'connection'])
            ->map(fn ($value) => is_array($value) ? implode(', ', $value) : $value)
            ->toArray();

        return response($response->body(), $response->status())
            ->withHeaders($responseHeaders);
    }

    public function dashboard(Request $request)
    {
        $tab = $request->query('tab', 'admin');

        return view('plugins/ai-commerce::dashboard', compact('tab'));
    }

    public function assistant(Request $request)
    {
        // 默认取第一个店铺，实际场景应从 session 或 request 中获取
        $shop = \Botble\AiCommerce\Models\ShopifyShop::first();
        
        return view('plugins/ai-commerce::sidekick', compact('shop'));
    }

    public function approvalQueue(Request $request)
    {
        if (! Schema::hasTable('ai_approval_queue')) {
            $page = Paginator::resolveCurrentPage('page');
            $approvals = new LengthAwarePaginator([], 0, 10, $page, [
                'path' => Paginator::resolveCurrentPath(),
            ]);

            return view('plugins/ai-commerce::approval-queue', compact('approvals'))
                ->with('error', 'AI 审批队列表尚未创建。请运行插件数据库迁移。');
        }

        try {
            $approvals = \Botble\AiCommerce\Models\AiApprovalQueue::orderBy('created_at', 'desc')->paginate(10);
        } catch (QueryException $exception) {
            $page = Paginator::resolveCurrentPage('page');
            $approvals = new LengthAwarePaginator([], 0, 10, $page, [
                'path' => Paginator::resolveCurrentPath(),
            ]);

            return view('plugins/ai-commerce::approval-queue', compact('approvals'))
                ->with('error', 'AI 审批队查询失败，请检查数据库。');
        }

        return view('plugins/ai-commerce::approval-queue', compact('approvals'));
    }

    public function approveAction(int $id)
    {
        if (! Schema::hasTable('ai_approval_queue')) {
            return response()->json(['success' => false, 'error' => 'Approval queue table missing.'], 500);
        }

        $approval = \Botble\AiCommerce\Models\AiApprovalQueue::findOrFail($id);
        
        // 实际执行逻辑：根据 action_type 调用 Shopify API
        // 这里仅更新状态
        $approval->update(['status' => 'approved']);
        
        return response()->json(['success' => true]);
    }

    public function rejectAction(int $id)
    {
        if (! Schema::hasTable('ai_approval_queue')) {
            return response()->json(['success' => false, 'error' => 'Approval queue table missing.'], 500);
        }

        $approval = \Botble\AiCommerce\Models\AiApprovalQueue::findOrFail($id);
        $approval->update(['status' => 'rejected']);
        
        return response()->json(['success' => true]);
    }
}
