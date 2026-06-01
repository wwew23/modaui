<?php

namespace Botble\AiMultiIndustry\Http\Controllers\Admin;

use Botble\Base\Http\Controllers\BaseController;
use Botble\AiMultiIndustry\Models\Industry;
use Illuminate\Http\Request;

class IndustryController extends BaseController
{
    public function index()
    {
        return view('plugins.ai-multi-industry::admin.industries');
    }

    public function create()
    {
        return view('plugins.ai-multi-industry::admin.industries');
    }

    public function store(Request $request)
    {
        Industry::create($request->only(['name', 'slug', 'emoji', 'color', 'description', 'enabled']));

        return redirect()->route('ai-multi-industry.industries.index');
    }

    public function edit($id)
    {
        $industry = Industry::findOrFail($id);

        return view('plugins.ai-multi-industry::admin.industries', compact('industry'));
    }

    public function update(Request $request, $id)
    {
        $industry = Industry::findOrFail($id);
        $industry->update($request->only(['name', 'slug', 'emoji', 'color', 'description', 'enabled']));

        return redirect()->route('ai-multi-industry.industries.index');
    }

    public function destroy($id)
    {
        Industry::destroy($id);

        return response()->json(['success' => true]);
    }

    public function getList()
    {
        return response()->json(['data' => Industry::all()]);
    }
}
