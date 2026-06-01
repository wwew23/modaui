<?php

namespace Botble\AiCommerce\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ApprovalQueue
{
    protected string $cacheKey = 'martfury_ai_approvals';

    /**
     * Push a new action to the approval queue.
     */
    public function push(string $action, array $data, string $message): string
    {
        $id = Str::uuid()->toString();
        $approvals = $this->all();
        
        $approvals[$id] = [
            'id' => $id,
            'action' => $action,
            'data' => $data,
            'message' => $message,
            'status' => 'pending',
            'created_at' => now()->toDateTimeString(),
        ];

        Cache::put($this->cacheKey, $approvals);
        return $id;
    }

    /**
     * Get all pending approvals.
     */
    public function all(): array
    {
        return Cache::get($this->cacheKey, []);
    }

    /**
     * Approve and execute an action.
     */
    public function approve(string $id): bool
    {
        $approvals = $this->all();
        if (!isset($approvals[$id])) return false;

        $approval = $approvals[$id];
        // Here we would actually call the relevant tool or service to execute the action
        // For now, we just mark as approved
        
        $approvals[$id]['status'] = 'approved';
        $approvals[$id]['executed_at'] = now()->toDateTimeString();
        
        Cache::put($this->cacheKey, $approvals);
        return true;
    }

    /**
     * Reject an action.
     */
    public function reject(string $id): bool
    {
        $approvals = $this->all();
        if (!isset($approvals[$id])) return false;

        $approvals[$id]['status'] = 'rejected';
        Cache::put($this->cacheKey, $approvals);
        return true;
    }
}
