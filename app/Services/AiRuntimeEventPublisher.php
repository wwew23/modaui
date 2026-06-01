<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiRuntimeEventPublisher
{
    public function publish(string $type, array $payload = []): void
    {
        $baseUrl = env('MODAUI_OS_API_BASE_URL', 'http://localhost:4000');
        $url = rtrim($baseUrl, '/') . '/api/os/events';
        $token = env('MODAUI_INTERNAL_SYSTEM_TOKEN') ?: env('INTERNAL_SYSTEM_TOKEN');

        $headers = [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];

        if ($token) {
            $headers['Authorization'] = 'Bearer ' . $token;
        }

        try {
            $response = Http::withHeaders($headers)
                ->timeout(5)
                ->post($url, array_merge(['type' => $type], $payload));

            if ($response->failed()) {
                Log::warning('[AI Runtime] event publish failed', [
                    'type' => $type,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $exception) {
            Log::warning('[AI Runtime] event publish exception', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
