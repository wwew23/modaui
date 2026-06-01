<?php

namespace App\Http\Controllers\Admin;

use App\Models\ToolConfig;

class ToolConfigController extends AdminResourceController
{
    protected string $modelClass = ToolConfig::class;

    protected array $validationRules = [
        'namespace' => 'required|string|unique:tool_configs,namespace',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'type' => 'required|string|max:255',
        'handler_class' => 'required|string|max:255',
        'icon' => 'nullable|string|max:191',
        'documentation' => 'nullable|string',
        'config' => 'nullable|array',
        'required_params' => 'nullable|array',
        'enabled' => 'boolean',
        'tags' => 'nullable|array',
        'rate_limit' => 'nullable|integer|min:0',
        'cost_per_call' => 'nullable|numeric|min:0',
        'metadata' => 'nullable|array',
        'version' => 'nullable|integer|min:1',
    ];

    public function test($id)
    {
        $tool = ToolConfig::findOrFail($id);

        if (! $tool->enabled) {
            return response()->json(['success' => false, 'error' => 'Tool is disabled.'], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tool->id,
                'namespace' => $tool->namespace,
                'handler_class' => $tool->handler_class,
                'enabled' => $tool->enabled,
            ],
            'message' => 'Tool definition is valid.',
        ]);
    }
}
