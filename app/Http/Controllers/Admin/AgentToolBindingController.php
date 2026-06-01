<?php

namespace App\Http\Controllers\Admin;

use App\Models\AgentConfig;
use App\Models\ToolConfig;
use App\Models\AgentToolBinding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AgentToolBindingController extends AdminController
{
    public function store(Request $request, AgentConfig $agent): JsonResponse
    {
        $this->authorizeAdmin();

        $data = Validator::make($request->all(), [
            'tool_id' => 'required|exists:tool_configs,id',
            'tool_params' => 'nullable|array',
            'priority' => 'nullable|integer|min:0',
            'condition' => 'nullable|array',
            'next_tool_id' => 'nullable|exists:tool_configs,id',
        ])->validate();

        $binding = AgentToolBinding::create(array_merge($data, ['agent_id' => $agent->id]));

        return response()->json([
            'success' => true,
            'data' => $binding->load('tool', 'nextTool'),
            'message' => 'Tool bound to agent successfully.',
        ], 201);
    }

    public function update(Request $request, AgentConfig $agent, ToolConfig $tool): JsonResponse
    {
        $this->authorizeAdmin();

        $binding = AgentToolBinding::where('agent_id', $agent->id)
            ->where('tool_id', $tool->id)
            ->firstOrFail();

        $data = Validator::make($request->all(), [
            'tool_params' => 'nullable|array',
            'priority' => 'nullable|integer|min:0',
            'condition' => 'nullable|array',
            'next_tool_id' => 'nullable|exists:tool_configs,id',
        ])->validate();

        $binding->update($data);

        return response()->json([
            'success' => true,
            'data' => $binding->load('tool', 'nextTool'),
            'message' => 'Tool binding updated successfully.',
        ]);
    }

    public function destroy(AgentConfig $agent, ToolConfig $tool): JsonResponse
    {
        $this->authorizeAdmin();

        $binding = AgentToolBinding::where('agent_id', $agent->id)
            ->where('tool_id', $tool->id)
            ->firstOrFail();

        $binding->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tool unbound from agent successfully.',
        ]);
    }
}
