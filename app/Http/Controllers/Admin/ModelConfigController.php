<?php

namespace App\Http\Controllers\Admin;

use App\Models\ModelConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ModelConfigController extends AdminResourceController
{
    protected string $modelClass = ModelConfig::class;

    protected array $validationRules = [
        'namespace' => 'required|string|unique:model_configs,namespace',
        'name' => 'required|string|max:255',
        'provider' => 'required|string|in:openai,anthropic,google,local',
        'model_name' => 'required|string|max:255',
        'api_endpoint' => 'nullable|url',
        'api_key' => 'nullable|string',
        'api_key_backup' => 'nullable|string',
        'max_tokens' => 'nullable|integer|min:1',
        'context_window' => 'nullable|integer|min:1',
        'supports_function_calling' => 'boolean',
        'supports_vision' => 'boolean',
        'supports_json_mode' => 'boolean',
        'input_cost_per_1k' => 'nullable|numeric|min:0',
        'output_cost_per_1k' => 'nullable|numeric|min:0',
        'avg_latency_ms' => 'nullable|numeric|min:0',
        'availability_percentage' => 'nullable|numeric|min:0|max:100',
        'enabled' => 'boolean',
        'rate_limit_per_minute' => 'nullable|integer|min:0',
        'monthly_quota_budget' => 'nullable|numeric|min:0',
        'priority' => 'nullable|integer|min:0',
        'fallback_model_id' => 'nullable|exists:model_configs,id',
        'tags' => 'nullable|array',
        'metadata' => 'nullable|array',
        'version' => 'nullable|integer|min:1',
    ];

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $data = $this->validateRequest($request);
        $apiKey = $data['api_key'] ?? null;
        unset($data['api_key']);

        $model = ModelConfig::create($data);
        if ($apiKey) {
            $model->setApiKey($apiKey);
        }

        return response()->json([
            'success' => true,
            'data' => $model,
            'message' => 'Model configuration created successfully.',
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $this->authorizeAdmin();

        $model = ModelConfig::findOrFail($id);
        $data = $this->validateRequest($request, true, $model);
        $apiKey = $data['api_key'] ?? null;
        unset($data['api_key']);
        $model->update($data);

        if ($apiKey !== null) {
            $model->setApiKey($apiKey);
        }

        return response()->json([
            'success' => true,
            'data' => $model,
            'message' => 'Model configuration updated successfully.',
        ]);
    }

    public function test($id)
    {
        $model = ModelConfig::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $model->id,
                'namespace' => $model->namespace,
                'provider' => $model->provider,
                'model_name' => $model->model_name,
                'enabled' => $model->enabled,
                'has_api_key' => ! empty($model->getApiKey()),
            ],
            'message' => 'Model configuration is valid.',
        ]);
    }
}
