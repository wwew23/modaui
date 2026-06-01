<?php

namespace Botble\AiMultiIndustry\Services;

use App\Services\AiService;
use Botble\AiMultiIndustry\Models\Industry;
use Botble\AiMultiIndustry\Models\IndustryEmployee;

class AiCoordinator
{
    protected AiService $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function routeMessage(string $message, Industry $industry, IndustryEmployee $employee, ?int $shopId = null): array
    {
        $prompt = $this->buildEmployeePrompt($industry, $employee);

        $context = [
            'industry' => $industry->slug,
            'employee' => $employee->role,
            'system_prompt' => $prompt,
        ];

        return $this->aiService->handleMerchantMessage($message, $context, $shopId);
    }

    protected function buildEmployeePrompt(Industry $industry, IndustryEmployee $employee): string
    {
        return sprintf(
            "你是%s行业的%s。你的任务是：%s\n行业描述：%s",
            $industry->name,
            $employee->name,
            $employee->system_prompt ?: '为用户提供专业建议',
            $industry->description ?: '暂无行业描述'
        );
    }
}
