<?php

namespace Botble\AiMultiIndustry\Http\Controllers\Admin;

use Botble\Base\Http\Controllers\BaseController;
use Botble\AiMultiIndustry\Models\IndustryEmployee;
use Illuminate\Http\Request;

class EmployeeController extends BaseController
{
    public function index()
    {
        return view('plugins.ai-multi-industry::admin.employees');
    }

    public function create()
    {
        return view('plugins.ai-multi-industry::admin.employees');
    }

    public function store(Request $request)
    {
        IndustryEmployee::create($request->only(['industry_id', 'name', 'role', 'system_prompt', 'model', 'enabled']));

        return redirect()->route('ai-multi-industry.employees.index');
    }

    public function edit($id)
    {
        $employee = IndustryEmployee::findOrFail($id);

        return view('plugins.ai-multi-industry::admin.employees', compact('employee'));
    }

    public function update(Request $request, $id)
    {
        $employee = IndustryEmployee::findOrFail($id);
        $employee->update($request->only(['industry_id', 'name', 'role', 'system_prompt', 'model', 'enabled']));

        return redirect()->route('ai-multi-industry.employees.index');
    }

    public function destroy($id)
    {
        IndustryEmployee::destroy($id);

        return response()->json(['success' => true]);
    }

    public function getList()
    {
        return response()->json(['data' => IndustryEmployee::with('industry')->get()]);
    }
}
