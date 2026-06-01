<?php

namespace App\Services;

use App\Models\AiConversation;
use App\Models\AiMessage;

class AiConversationService
{
    public static function start(
        string $agentType = 'backend_assistant',
        ?int $userId = null,
        ?string $customerId = null,
        ?string $sessionId = null,
        array $metadata = []
    ): AiConversation {
        $shop = TenantManager::getCurrentShop();
        $config = TenantManager::getConfig($agentType);

        if (!$config) {
            throw new \Exception("No {$agentType} config for shop {$shop->id}");
        }

        $metadata['ip'] = $metadata['ip'] ?? request()?->ip();
        $metadata['user_agent'] = $metadata['user_agent'] ?? request()?->userAgent();

        $conversation = AiConversation::create([
            'shopify_shop_id' => $shop->id,
            'ai_config_id' => $config->id,
            'tenant_key' => $shop->getTenantKey(),
            'agent_type' => $agentType,
            'session_id' => $sessionId,
            'user_id' => $userId,
            'customer_id' => $customerId,
            'metadata' => $metadata,
            'started_at' => now(),
        ]);

        TenantManager::logInfo('Conversation started', [
            'conversation_id' => $conversation->id,
            'agent_type' => $agentType,
        ]);

        return $conversation;
    }

    public static function addUserMessage(AiConversation $conversation, string $content): AiMessage
    {
        return $conversation->addMessage('user', $content);
    }

    public static function addAssistantMessage(
        AiConversation $conversation,
        string $content,
        int $tokensUsed = 0,
        ?string $model = null
    ): AiMessage {
        $message = $conversation->addMessage('assistant', $content);
        $message->update([
            'tokens_used' => $tokensUsed,
            'model' => $model,
        ]);

        return $message;
    }

    public static function recordToolCall(
        AiConversation $conversation,
        string $toolName,
        array $input,
        array $output,
        int $tokensUsed = 0
    ): AiMessage {
        return AiMessage::recordToolCall(
            $conversation,
            $conversation->tenant_key,
            $toolName,
            $input,
            $output,
            $tokensUsed
        );
    }

    public static function end(AiConversation $conversation): void
    {
        $conversation->update([
            'message_count' => $conversation->messages()->count(),
            'token_used' => $conversation->messages()->sum('tokens_used'),
            'ended_at' => now(),
        ]);

        TenantManager::logInfo('Conversation ended', [
            'conversation_id' => $conversation->id,
            'duration_seconds' => $conversation->getDurationInSeconds(),
            'message_count' => $conversation->message_count,
            'token_used' => $conversation->token_used,
        ]);
    }
}
