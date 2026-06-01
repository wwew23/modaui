<?php

namespace App\Services;

use App\Models\AiUsageMetric;
use App\Models\AiConversation;

class AiMetricsService
{
    public static function recordConversation(
        AiConversation $conversation,
        ?float $costUsd = null
    ): void {
        $metric = AiUsageMetric::recordForToday(
            $conversation->shopify_shop_id,
            $conversation->tenant_key,
            $conversation->agent_type
        );

        $totalTokens = $conversation->token_used;
        $cost = $costUsd ?? ($totalTokens * 0.00004);

        $metric->incrementConversationCount();
        $metric->incrementMessageCount($conversation->message_count);
        $metric->incrementTokenUsed($totalTokens, $cost);

        $toolCalls = $conversation->messages()
            ->where('role', 'tool')
            ->count();
        if ($toolCalls > 0) {
            $metric->incrementToolCallCount($toolCalls);
        }

        TenantManager::logInfo('Metrics recorded', [
            'conversation_id' => $conversation->id,
            'tokens' => $totalTokens,
            'cost_usd' => $cost,
        ]);
    }

    public static function checkDailyLimit(string $agentType = 'backend_assistant'): bool
    {
        $config = TenantManager::getConfig($agentType);
        if (!$config) {
            return true;
        }

        $limit = $config->getDailyLimit();
        $metric = AiUsageMetric::today()
            ->forShop(TenantManager::getCurrentShopId())
            ->byAgentType($agentType)
            ->first();

        if (!$metric) {
            return false;
        }

        return $metric->token_used >= $limit;
    }

    public static function checkMonthlyLimit(): bool
    {
        $config = TenantManager::getConfig();
        if (!$config) {
            return false;
        }

        $quota = $config->getQuota();
        if (!isset($quota['monthly_limit'])) {
            return false;
        }

        $used = AiUsageMetric::thisMonth()
            ->forShop(TenantManager::getCurrentShopId())
            ->sum('token_used');

        return $used >= $quota['monthly_limit'];
    }

    public static function getMonthlyStats(): array
    {
        $metrics = AiUsageMetric::thisMonth()
            ->forShop(TenantManager::getCurrentShopId())
            ->get();

        return [
            'total_conversations' => $metrics->sum('conversation_count'),
            'total_messages' => $metrics->sum('message_count'),
            'total_tokens' => $metrics->sum('token_used'),
            'total_cost_usd' => $metrics->sum(fn($m) => $m->getCostInDollars()),
            'by_agent_type' => $metrics->groupBy('agent_type')->map(fn($group) => [
                'conversations' => $group->sum('conversation_count'),
                'tokens' => $group->sum('token_used'),
                'cost_usd' => $group->sum(fn($m) => $m->getCostInDollars()),
            ]),
        ];
    }

    public static function getTodayStats(string $agentType = null): array
    {
        $query = AiUsageMetric::today()
            ->forShop(TenantManager::getCurrentShopId());

        if ($agentType) {
            $query->byAgentType($agentType);
        }

        $metrics = $query->get();

        return [
            'total_conversations' => $metrics->sum('conversation_count'),
            'total_messages' => $metrics->sum('message_count'),
            'total_tokens' => $metrics->sum('token_used'),
            'total_cost_usd' => $metrics->sum(fn($m) => $m->getCostInDollars()),
        ];
    }
}
