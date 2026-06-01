<?php

namespace Botble\AiMultiIndustry\Http\Controllers;

use App\Services\AiService;
use Botble\Base\Http\Controllers\BaseController;
use Botble\AiMultiIndustry\Models\Industry;
use Botble\AiMultiIndustry\Models\IndustryEmployee;
use Botble\AiMultiIndustry\Services\AiCoordinator;
use Illuminate\Http\Request;

class AiChatController extends BaseController
{
    public function handle(Request $request, AiCoordinator $coordinator, AiService $aiService)
    {
        $message = $request->input('message');
        $industryId = $request->input('industry_id');
        $employeeId = $request->input('employee_id');
        $shopId = $request->input('shop_id');

        if (! $message) {
            return response()->json(['success' => false, 'message' => 'message 参数为必填项'], 400);
        }

        $industry = Industry::find($industryId);
        $employee = IndustryEmployee::find($employeeId);

        if (! $industry || ! $employee) {
            return response()->json(['success' => false, 'message' => 'invalid industry or employee'], 404);
        }

        $response = $coordinator->routeMessage($message, $industry, $employee, $shopId);

        return response()->json([
            'success' => true,
            'data' => array_merge($response, [
                'industry' => $industry->slug,
                'employee' => $employee->role,
            ]),
        ]);
    }
}
