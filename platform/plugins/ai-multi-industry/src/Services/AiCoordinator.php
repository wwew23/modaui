<?php

namespace Botble\AiMultiIndustry\Services;

use App\Services\AiService;
use Botble\AiMultiIndustry\Models\Industry;
use Botble\AiMultiIndustry\Models\IndustryEmployee;
use Botble\AiMultiIndustry\Models\AiChatSession;
use Botble\AiMultiIndustry\Models\AiChatMessage;
use Illuminate\Support\Str;

class AiCoordinator
{
    protected AiService $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * 路由用户消息到对应的行业员工
     */
    public function routeMessage(
        string $message,
        Industry $industry,
        IndustryEmployee $employee,
        ?int $shopId = null,
        ?string $merchantId = null
    ): array {
        if (!$industry->enabled || !$employee->enabled) {
            return [
                'success' => false,
                'message' => '该行业或员工已禁用',
            ];
        }

        // 创建或获取聊天会话
        $session = $this->getOrCreateSession($industry, $employee, $merchantId);

        // 构建完整的系统提示词
        $prompt = $this->buildEmployeePrompt($industry, $employee);

        $context = [
            'industry' => $industry->slug,
            'employee' => $employee->role,
            'system_prompt' => $prompt,
            'session_id' => $session->session_token,
        ];

        // 调用 AI 服务
        $response = $this->aiService->handleMerchantMessage($message, $context, $shopId);

        // 保存聊天记录
        $this->saveChatMessage(
            $session,
            $industry,
            $employee,
            $message,
            $response['reply'] ?? '',
            $response['confidence'] ?? 0,
            $merchantId
        );

        return [
            'success' => true,
            'session_id' => $session->id,
            'session_token' => $session->session_token,
            ...$response,
        ];
    }

    /**
     * 获取或创建聊天会话
     */
    protected function getOrCreateSession(
        Industry $industry,
        IndustryEmployee $employee,
        ?string $merchantId = null
    ): AiChatSession {
        // 如果有活跃的会话，继续使用
        if ($merchantId) {
            $active = AiChatSession::byMerchant($merchantId)
                ->active()
                ->where('industry_id', $industry->id)
                ->where('employee_id', $employee->id)
                ->first();

            if ($active) {
                return $active;
            }
        }

        // 创建新会话
        return AiChatSession::create([
            'industry_id' => $industry->id,
            'employee_id' => $employee->id,
            'merchant_id' => $merchantId,
            'session_token' => Str::uuid()->toString(),
            'started_at' => now(),
        ]);
    }

    /**
     * 构建完整的员工系统提示词
     */
    protected function buildEmployeePrompt(Industry $industry, IndustryEmployee $employee): string
    {
        $base = $employee->system_prompt ?? "你是{$industry->name}行业的{$employee->name}";

        // 添加行业背景
        $industryContext = config('plugins.ai-multi-industry.ai-industries') ?? [];
        $industryData = collect($industryContext)->firstWhere('slug', $industry->slug);

        $prompt = "{$base}\n\n";
        $prompt .= "【背景信息】\n";
        $prompt .= "行业：{$industry->name}\n";
        $prompt .= "岗位：{$employee->role}\n";
        if ($industry->description) {
            $prompt .= "行业描述：{$industry->description}\n";
        }

        // 添加行业特定的指引
        $roleGuidelines = $this->getRoleGuidelines($employee->role, $industry->slug);
        if ($roleGuidelines) {
            $prompt .= "\n【职位指引】\n{$roleGuidelines}";
        }

        // 添加通用指引
        $prompt .= "\n【通用指引】\n";
        $prompt .= "- 你的回应应该专业、有条理、基于实际经验\n";
        $prompt .= "- 如果用户询问超出你职责范围的问题，请礼貌地转向相关部门\n";
        $prompt .= "- 始终以数据和事实作为支撑\n";
        $prompt .= "- 提供可执行的建议和行动计划\n";
        $prompt .= "- 如果不确定答案，请说出来而不是编造\n";

        return $prompt;
    }

    /**
     * 获取职位特定的指引
     */
    protected function getRoleGuidelines(string $role, string $industrySlug): string
    {
        $guidelines = [
            'designer' => [
                'fashion' => "作为服装设计师，你负责：\n- 趋势分析和色彩搭配建议\n- 面料和工艺的推荐\n- 款式创新和消费者需求分析\n- 成本控制和可行性评估",
                'retail' => "作为零售设计师，你负责：\n- 店铺视觉展示\n- 商品陈列方案\n- 促销物料设计",
            ],
            'chef' => [
                'food' => "作为菜品开发主管，你负责：\n- 菜单设计和定价策略\n- 成本分析和利润优化\n- 食品安全和质量控制\n- 消费者喜好分析",
            ],
            'operator' => [
                'retail' => "作为零售运营经理，你负责：\n- 门店运营效率\n- 库存管理\n- 团队绩效\n- 客户满意度提升",
                'fashion' => "作为服装运营经理，你负责：\n- 库存周转率\n- 销售预测\n- 供应链优化\n- 成本控制",
            ],
            'marketer' => [
                'fashion' => "作为营销总监，你负责：\n- 品牌定位和推广\n- 社交媒体策略\n- 促销活动规划\n- ROI 分析",
                'food' => "作为营销总监，你负责：\n- 品牌建设和宣传\n- 客户留存策略\n- 口碑管理\n- 营销活动效果评估",
            ],
            'analyst' => [
                'retail' => "作为数据分析师，你负责：\n- 销售数据分析\n- 消费者行为研究\n- 经营指标监测\n- 决策支持",
            ],
        ];

        return $guidelines[$role][$industrySlug] ?? "";
    }

    /**
     * 保存聊天消息
     */
    protected function saveChatMessage(
        AiChatSession $session,
        Industry $industry,
        IndustryEmployee $employee,
        string $userMessage,
        string $aiResponse,
        int $confidence,
        ?string $merchantId
    ): AiChatMessage {
        $message = AiChatMessage::create([
            'session_id' => $session->id,
            'industry_id' => $industry->id,
            'employee_id' => $employee->id,
            'merchant_id' => $merchantId,
            'role' => 'user',
            'user_message' => $userMessage,
            'ai_response' => $aiResponse,
            'confidence' => $confidence,
        ]);

        // 更新会话统计
        $session->increment('total_messages', 2); // 用户消息和 AI 回复

        return $message;
    }

    /**
     * 获取会话历史
     */
    public function getSessionHistory(?string $merchantId = null, ?int $industryId = null): array
    {
        $query = AiChatSession::with(['messages', 'industry', 'employee']);

        if ($merchantId) {
            $query->byMerchant($merchantId);
        }

        if ($industryId) {
            $query->where('industry_id', $industryId);
        }

        return $query->orderBy('created_at', 'desc')->get()->toArray();
    }
}
