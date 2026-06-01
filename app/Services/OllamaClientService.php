<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class OllamaClientService
{
    public function __construct()
    {
    }

    public function chat(array $payload): array
    {
        $endpoint = $this->getEndpoint();
        $response = Http::timeout($this->getTimeout())
            ->post($endpoint, $payload);

        if ($response->failed()) {
            throw new \RuntimeException(sprintf(
                'Ollama request failed: %s %s',
                $response->status(),
                $response->body()
            ));
        }

        $json = $response->json();

        if (! is_array($json)) {
            throw new \RuntimeException('Ollama response is not valid JSON.');
        }

        return $json;
    }

    public function getEndpoint(): string
    {
        return config('services.ollama.endpoint', env('OLLAMA_API_URL', 'http://127.0.0.1:11434/api/chat'));
    }

    public function getTimeout(): int
    {
        return config('services.ollama.timeout', env('OLLAMA_TIMEOUT', 120));
    }

    public function makePayload(array $modelConfig, array $messages, array $tools = []): array
    {
        $payload = [
            'model' => $modelConfig['model'] ?? 'llama3',
            'messages' => $messages,
            'stream' => false,
        ];

        if (! empty($tools)) {
            $payload['tools'] = $tools;
        }

        if (isset($modelConfig['temperature'])) {
            $payload['temperature'] = $modelConfig['temperature'];
        }

        if (isset($modelConfig['max_tokens'])) {
            $payload['max_tokens'] = $modelConfig['max_tokens'];
        }

        return $payload;
    }
}
