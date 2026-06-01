<?php

namespace App\Http\Controllers\Admin;

use App\Models\PromptConfig;
use Illuminate\Http\Request;

class PromptConfigController extends AdminResourceController
{
    protected string $modelClass = PromptConfig::class;

    protected array $validationRules = [
        'namespace' => 'required|string|unique:prompt_configs,namespace',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'content' => 'required|string',
        'variables' => 'nullable|array',
        'version' => 'nullable|integer|min:1',
        'status' => 'nullable|string|in:draft,testing,production',
        'avg_quality_score' => 'nullable|numeric|min:0|max:100',
        'test_results' => 'nullable|array',
        'variant_type' => 'nullable|string|max:100',
        'parent_id' => 'nullable|exists:prompt_configs,id',
        'enabled' => 'boolean',
        'tags' => 'nullable|array',
        'metadata' => 'nullable|array',
        'created_by' => 'nullable|integer',
    ];

    public function testRender(Request $request, $id)
    {
        $prompt = PromptConfig::findOrFail($id);

        $variables = $request->input('variables', []);
        $rendered = $prompt->renderTemplate($variables);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $prompt->id,
                'rendered' => $rendered,
            ],
            'message' => 'Prompt rendered successfully.',
        ]);
    }
}
