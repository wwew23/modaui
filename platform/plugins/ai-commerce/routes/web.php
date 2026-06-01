<?php

use Botble\Base\Facades\AdminHelper;
use Illuminate\Support\Facades\Route;
use Botble\AiCommerce\Http\Controllers\AiRuntimeProxyController;
use Botble\AiCommerce\Http\Controllers\AiSettingsController;

use Botble\AiCommerce\Http\Controllers\AiChatController;
use Botble\AiCommerce\Http\Controllers\ShopifyAnalyticsController;

AdminHelper::registerRoutes(function (): void {
    Route::post('ai/chat', [AiChatController::class, 'handle'])->name('ai.chat.v2');

    // Shopify Gateway API
    Route::prefix('shopify/{shopId}')->group(function () {
        Route::get('kpi/summary', [ShopifyAnalyticsController::class, 'kpiSummary']);
        Route::get('product/{productId}/performance', [ShopifyAnalyticsController::class, 'productPerformance']);
        Route::get('product/{productId}/content', [ShopifyAnalyticsController::class, 'productContent']);
        Route::post('product/{productId}/update-content', [ShopifyAnalyticsController::class, 'updateProductContent']);
    });

    Route::get('ai-intelligence-center', [
        'as' => 'ai-commerce.dashboard',
        'uses' => AiRuntimeProxyController::class . '@dashboard',
        'permission' => false,
    ]);

    Route::get('ai', function () {
        return redirect()->route('ai-commerce.dashboard');
    })->name('ai');

    Route::get('os', function () {
        return redirect()->route('ai-commerce.dashboard');
    })->name('os');

    Route::get('ai-settings', [
        'as' => 'ai.settings',
        'uses' => AiSettingsController::class . '@index',
        'permission' => false,
    ]);

    Route::get('ai-assistant', [
        'as' => 'ai.assistant',
        'uses' => AiRuntimeProxyController::class . '@assistant',
        'permission' => false,
    ]);

    Route::get('ai-approvals', [
        'as' => 'ai.approvals',
        'uses' => AiRuntimeProxyController::class . '@approvalQueue',
        'permission' => false,
    ]);

    Route::post('ai-approvals/{id}/approve', [
        'as' => 'ai.approvals.approve',
        'uses' => AiRuntimeProxyController::class . '@approveAction',
        'permission' => false,
    ]);

    Route::post('ai-approvals/{id}/reject', [
        'as' => 'ai.approvals.reject',
        'uses' => AiRuntimeProxyController::class . '@rejectAction',
        'permission' => false,
    ]);

    Route::post('ai-settings', [
        'as' => 'ai.settings.save',
        'uses' => AiSettingsController::class . '@save',
        'permission' => false,
    ]);

    Route::any('runtime/{path?}', [
        'as' => 'ai-commerce.runtime.proxy',
        'uses' => AiRuntimeProxyController::class . '@proxy',
        'permission' => false,
    ])->where('path', '.*');
});

Route::prefix('api/os')->group(function (): void {
    Route::any('/{path?}', [
        'as' => 'api.os.proxy',
        'uses' => AiRuntimeProxyController::class . '@proxy',
    ])->where('path', '.*');
});
