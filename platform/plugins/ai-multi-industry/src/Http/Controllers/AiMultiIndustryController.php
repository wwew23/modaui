<?php

namespace Botble\AiMultiIndustry\Http\Controllers;

use Botble\Base\Http\Controllers\BaseController;
use Botble\AiMultiIndustry\Models\Industry;
use Botble\AiMultiIndustry\Models\IndustryEmployee;

class AiMultiIndustryController extends BaseController
{
    public function dashboard()
    {
        return view('plugins.ai-multi-industry::admin.dashboard');
    }

    public function chat()
    {
        return view('plugins.ai-multi-industry::admin.chat');
    }

    public function industries()
    {
        return response()->json([
            'success' => true,
            'data' => Industry::with('employees')->get(),
        ]);
    }

    public function industryEmployees(Industry $industry)
    {
        return response()->json([
            'success' => true,
            'data' => $industry->employees,
        ]);
    }
}
