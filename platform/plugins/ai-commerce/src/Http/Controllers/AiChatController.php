<?php

namespace Botble\AiCommerce\Http\Controllers;

use App\Services\AiService;
use App\Services\AiTools;
use Botble\AiCommerce\Models\ShopifyShop;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Log;
use Botble\AiCommerce\AiAgents\MartfuryShopkeeperAgent;
use Botble\Base\Http\Controllers\BaseController;

class AiChatController extends BaseController
{
    /**
     * Unified AI Chat Endpoint
     */
    public function handle(HttpRequest $request, AiService $aiService, AiTools $aiTools)
    {
        // 1. Extract parameters
        $message = $request->input('message');
        $mode = $request->input('mode', 'merchant'); 
        $shopId = $request->input('shopId'); 

        if (!$message) {
            return response()->json(['error' => 'Message is required'], 400);
        }

        try {
            // 2. Delegate to LarAgent if mode is merchant
            if ($mode === 'merchant') {
                if (!$shopId) {
                    return response()->json(['error' => 'Shop ID is required for merchant mode'], 400);
                }

                // 验证店铺是否存在
                $shop = ShopifyShop::findOrFail($shopId);

                // Initialize LarAgent with session ID for history
                $sessionId = $request->header('X-Session-ID') ?? "merchant_shop_{$shopId}_" . (auth('customer')->id() ?: 'guest');
                
                $agent = MartfuryShopkeeperAgent::for($sessionId);

                // 将 shopId 注入到智能体上下文，以便工具调用时使用
                $agent->context('shopId', $shopId);

                $reply = $agent->respond($message);

                return response()->json([
                    'success' => true,
                    'reply' => $reply,
                    'session_id' => $sessionId,
                    'raw' => [
                        'role' => 'assistant',
                        'content' => $reply
                    ]
                ]);
            }

            // Fallback for customer/storefront mode
            $shopId = $shopId ?: $request->input('shop.id') ?: $request->input('shopify_shop_id');
            if (! $shopId) {
                $shopId = ShopifyShop::query()->value('id');
            }
            if (! $shopId) {
                return response()->json(['error' => 'Shop ID is required for customer mode'], 400);
            }

            $response = $aiService->handleCustomerMessage($message, [
                'mode' => in_array($mode, ['storefront_agent', 'customer']) ? $mode : 'storefront_agent',
                'shop' => $request->input('shop')
            ], $shopId);
            return response()->json($response);

        } catch (\Throwable $e) {
            Log::error('AI Chat Controller Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'detail' => config('app.debug') ? $e->getMessage() : 'Something went wrong.'
            ], 500);
        }
    }
}
