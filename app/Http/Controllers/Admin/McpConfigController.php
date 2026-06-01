<?php

namespace App\Http\Controllers\Admin;

use App\Models\McpConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class McpConfigController extends AdminResourceController
{
    protected string $modelClass = McpConfig::class;

    protected array $validationRules = [
        'namespace' => 'required|string|unique:mcp_configs,namespace',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'server_url' => 'required|url',
        'server_type' => 'required|string|max:255',
        'auth_token' => 'nullable|string',
        'knowledge_base_id' => 'nullable|string|max:255',
        'embedding_model' => 'nullable|string|max:255',
        'chunk_size' => 'nullable|integer|min:1',
        'overlap' => 'nullable|integer|min:0',
        'search_method' => 'nullable|string|in:similarity,hybrid,bm25',
        'top_k' => 'nullable|integer|min:1',
        'similarity_threshold' => 'nullable|numeric|min:0|max:1',
        'enabled' => 'boolean',
        'tags' => 'nullable|array',
        'metadata' => 'nullable|array',
    ];

    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        $data = $this->validateRequest($request);
        $authToken = $data['auth_token'] ?? null;
        unset($data['auth_token']);

        $mcp = McpConfig::create($data);
        if ($authToken) {
            $mcp->auth_token_encrypted = app('encrypter')->encryptString($authToken);
            $mcp->save();
        }

        return response()->json([
            'success' => true,
            'data' => $mcp,
            'message' => 'MCP configuration created successfully.',
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $this->authorizeAdmin();

        $mcp = McpConfig::findOrFail($id);
        $data = $this->validateRequest($request, true, $mcp);
        $authToken = $data['auth_token'] ?? null;
        unset($data['auth_token']);

        $mcp->update($data);
        if ($authToken !== null) {
            $mcp->auth_token_encrypted = app('encrypter')->encryptString($authToken);
            $mcp->save();
        }

        return response()->json([
            'success' => true,
            'data' => $mcp,
            'message' => 'MCP configuration updated successfully.',
        ]);
    }

    public function test($id)
    {
        $mcp = McpConfig::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $mcp->id,
                'namespace' => $mcp->namespace,
                'server_url' => $mcp->server_url,
                'enabled' => $mcp->enabled,
                'has_auth_token' => ! empty($mcp->getAuthToken()),
            ],
            'message' => 'MCP configuration is valid.',
        ]);
    }
}
