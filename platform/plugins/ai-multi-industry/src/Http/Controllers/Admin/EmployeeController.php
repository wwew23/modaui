<?php

namespace Botble\\AiMultiIndustry\\Http\\Controllers\\Admin;

use Botble\\Base\\Http\\Controllers\\BaseController;
use Botble\\AiMultiIndustry\\Models\\IndustryEmployee;
use Botble\\AiMultiIndustry\\Models\\Industry;
use Illuminate\\Http\\Request;

class EmployeeController extends BaseController
{
    public function index()
    {
        $employees = IndustryEmployee::with('industry')
            ->withCount('chatMessages')
            ->orderBy('sort_order')
            ->paginate(20);

        return view('plugins.ai-multi-industry::admin.employees.index', compact('employees'));
    }

    public function create()
    {
        $industries = Industry::where('enabled', true)->orderBy('sort_order')->get();

        return view('plugins.ai-multi-industry::admin.employees.create', compact('industries'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'industry_id' => 'required|exists:ai_industries,id',
            'name' => 'required|string|max:100',
            'role' => 'required|string|max:100',
            'avatar_url' => 'nullable|url|max:500',
            'system_prompt' => 'nullable|string|max:2000',
            'model' => 'nullable|string|max:100',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:100|max:8000',
            'sort_order' => 'nullable|integer|min:0',
            'enabled' => 'boolean',
        ]);

        $validated['enabled'] = $request->boolean('enabled', true);
        $validated['model'] = $validated['model'] ?? config('plugins.ai-multi-industry.default_model', 'gpt-4');
        $validated['temperature'] = $validated['temperature'] ?? 0.7;
        $validated['max_tokens'] = $validated['max_tokens'] ?? 2048;

        IndustryEmployee::create($validated);

        return redirect()->route('ai-multi-industry.employees.index')
            ->with('success', '员工已成功创建');
    }

    public function edit($id)
    {
        $employee = IndustryEmployee::findOrFail($id);
        $industries = Industry::where('enabled', true)->orderBy('sort_order')->get();

        return view('plugins.ai-multi-industry::admin.employees.edit', compact('employee', 'industries'));
    }

    public function update(Request $request, $id)
    {
        $employee = IndustryEmployee::findOrFail($id);

        $validated = $request->validate([
            'industry_id' => 'required|exists:ai_industries,id',
            'name' => 'required|string|max:100',
            'role' => 'required|string|max:100',
            'avatar_url' => 'nullable|url|max:500',
            'system_prompt' => 'nullable|string|max:2000',
            'model' => 'nullable|string|max:100',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:100|max:8000',
            'sort_order' => 'nullable|integer|min:0',
            'enabled' => 'boolean',
        ]);

        $validated['enabled'] = $request->boolean('enabled', true);

        $employee->update($validated);

        return redirect()->route('ai-multi-industry.employees.index')
            ->with('success', '员工已成功更新');
    }

    public function destroy($id)
    {
        $employee = IndustryEmployee::findOrFail($id);

        // 检查是否有关联的聊天记录
        if ($employee->chatMessages()->exists()) {
            return response()->json(['success' => false, 'message' => '该员工有聊天记录，无法删除'], 400);
        }

        $employee->delete();

        return response()->json(['success' => true, 'message' => '员工已删除']);
    }

    public function getList()
    {
        $employees = IndustryEmployee::where('enabled', true)
            ->with('industry')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }
}
