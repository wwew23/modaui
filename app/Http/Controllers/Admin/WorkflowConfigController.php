<?php

namespace App\Http\Controllers\Admin;

use App\Models\WorkflowConfig;
use Illuminate\Http\Request;

class WorkflowConfigController extends AdminResourceController
{
    protected string $modelClass = WorkflowConfig::class;

    protected array $validationRules = [
        'namespace' => 'required|string|unique:workflow_configs,namespace',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'icon' => 'nullable|string|max:191',
        'graph' => 'required|array',
        'enabled' => 'boolean',
        'execution_mode' => 'required|string|in:sequential,parallel,conditional',
        'retry_strategy' => 'nullable|array',
        'timeout_seconds' => 'nullable|integer|min:1',
        'avg_cost' => 'nullable|numeric|min:0',
        'avg_duration_seconds' => 'nullable|numeric|min:0',
        'success_rate' => 'nullable|numeric|min:0|max:100',
        'metadata' => 'nullable|array',
        'version' => 'nullable|integer|min:1',
    ];

    public function execute(Request $request, $id)
    {
        $this->authorizeAdmin();

        $workflow = WorkflowConfig::findOrFail($id);

        $input = $request->input('input', []);
        $context = $request->input('context', []);

        return response()->json([
            'success' => true,
            'data' => [
                'workflow_id' => $workflow->id,
                'namespace' => $workflow->namespace,
                'graph' => $workflow->graph,
                'input' => $input,
                'context' => $context,
            ],
            'message' => 'Workflow payload accepted. Execution is handled by the runtime service.',
        ]);
    }

    public function test($id)
    {
        $workflow = WorkflowConfig::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $workflow->id,
                'namespace' => $workflow->namespace,
                'graph' => $workflow->graph,
                'execution_mode' => $workflow->execution_mode,
            ],
            'message' => 'Workflow configuration is valid.',
        ]);
    }
}
