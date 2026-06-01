<?php

namespace Botble\AiCommerce\Services;

use LarAgent\Agent;
use LarAgent\Core\Contracts\Tool;
use LarAgent\Core\Contracts\ToolCall;
use Illuminate\Support\Facades\Log;

class PermissionGate
{
    /**
     * Actions that require explicit merchant confirmation.
     */
    protected array $requiresConfirmation = [
        'update_product',
        'create_discount',
        'delete_product',
        'update_order_status',
    ];

    /**
     * Actions that can be performed automatically.
     */
    protected array $autoApprove = [
        'get_products',
        'get_orders',
        'get_customers',
        'get_analytics',
    ];

    /**
     * Check if a tool call requires confirmation.
     */
    public function check(Agent $agent, Tool $tool, ToolCall $toolCall): bool
    {
        $toolName = $tool->getName();
        $argumentsStr = $toolCall->getArguments();
        $arguments = json_decode($argumentsStr, true) ?? [];
        
        // Specific check for MartfuryTools which uses an 'action' parameter
        if ($toolName === 'martfury_tools' && isset($arguments['action'])) {
            $action = $arguments['action'];
            
            if (in_array($action, $this->requiresConfirmation)) {
                Log::warning("Action '{$action}' requires merchant confirmation.");
                // In LarAgent, returning false from beforeToolExecution stops the execution.
                // We can use this to inject a message instead or throw an exception.
                return false; 
            }
        }

        return true;
    }
}
