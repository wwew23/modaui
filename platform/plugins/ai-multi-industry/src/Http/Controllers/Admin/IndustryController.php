<?php

namespace Botble\AiMultiIndustry\Http\Controllers\Admin;

use Botble\Base\Http\Controllers\BaseController;
use Botble\AiMultiIndustry\Models\Industry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IndustryController extends BaseController
{
    public function index()
    {
        $industries = Industry::withCount('employees', 'chatMessages')
            ->orderBy('sort_order')
            ->paginate(15);

        return view('plugins.ai-multi-industry::admin.industries.index', compact('industries'));
    }

    public function create()
    {
        return view('plugins.ai-multi-industry::admin.industries.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:ai_industries,name',
            'slug' => 'nullable|string|max:100|unique:ai_industries,slug',
            'emoji' => 'nullable|string|max:10',
            'color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'enabled' => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['enabled'] = $request->boolean('enabled', true);

        Industry::create($validated);

        return redirect()->route('ai-multi-industry.industries.index')
            ->with('success', '行业已成功创建');
    }

    public function edit($id)
    {
        $industry = Industry::with('employees')->findOrFail($id);

        return view('plugins.ai-multi-industry::admin.industries.edit', compact('industry'));
    }

    public function update(Request $request, $id)
    {
        $industry = Industry::findOrFail($id);

        $validated = $request->validate([
            'name' => "required|string|max:100|unique:ai_industries,name,{$id}",
            'slug' => "nullable|string|max:100|unique:ai_industries,slug,{$id}",
            'emoji' => 'nullable|string|max:10',
            'color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'enabled' => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['enabled'] = $request->boolean('enabled', true);

        $industry->update($validated);

        return redirect()->route('ai-multi-industry.industries.index')
            ->with('success', '行业已成功更新');
    }

    public function destroy($id)
    {
        $industry = Industry::with('employees', 'chatMessages')->findOrFail($id);

        if ($industry->employees->count() > 0 || $industry->chatMessages->count() > 0) {
            return response()->json(['success' => false, 'message' => '该行业有员工或聊天记录，无法删除'], 400);
        }

        $industry->delete();

        return response()->json(['success' => true, 'message' => '行业已删除']);
    }

    public function getList()
    {
        $industries = Industry::where('enabled', true)
            ->with('employees')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $industries,
        ]);
    }
}
    {
        return response()->json(['data' => Industry::all()]);
    }
}
