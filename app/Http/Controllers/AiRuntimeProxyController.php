<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiRuntimeProxyController extends Controller
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

    /**
     * AI Intelligence Center UI
     */
    public function dashboard(Request $request)
    {
        $runtimeBaseUrl = config('ai.runtime.base_url') ?: env('MODAUI_OS_API_BASE_URL', 'http://localhost:4000');
        $tab = $request->query('tab', 'dashboard');

        // AI 运行时控制台应指向 ModaUI OS 运行时地址，而不是后台 /admin/
        $iframeUrl = rtrim($runtimeBaseUrl, '/') . '/?embedded=true&tab=' . $tab . '&host=' . urlencode(config('app.url'));

        return view('plugins/ai-commerce::dashboard', compact('iframeUrl'));
    }
}
