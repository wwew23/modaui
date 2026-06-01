<?php

use App\Http\Controllers\AiController;
use App\Http\Controllers\AiRuntimeProxyController;
use App\Http\Controllers\AiSettingsController;
use Botble\AiCommerce\Http\Controllers\AiChatController;
use Illuminate\Support\Facades\Route;

// 1. 放在最顶部，最优先匹配，且不加任何前缀，用于外部/前端直接访问
Route::get('/moda-ai-terminal', function () {
    // 强制不缓存，确保每次加载都是最新的
    return response()->view('ai-chat')
        ->header('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
        ->header('Pragma', 'no-cache');
})->name('ai.terminal.isolated');

Route::get('/', function () {
    return view('home');
})->name('home');

Route::group(['middleware' => ['web', 'core', 'auth'], 'prefix' => config('core.base.general.admin_dir', 'admin')], function () {
    Route::get('dashboard', function () {
        return view('admin.dashboard');
    })->name('admin.dashboard');

    Route::get('ai-os', [AiController::class, 'osDashboard'])
        ->name('ai.os');
    Route::get('ai-assistant', [AiController::class, 'adminAssistant'])
        ->name('ai.assistant');
    
    // 2. 在 admin 组内也定义一个，防止权限拦截重定向
    Route::get('ai-terminal', function () {
        return response()->view('ai-chat')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
            ->header('Pragma', 'no-cache');
    })->name('admin.ai.terminal');

    Route::get('agent-control', [\App\Http\Controllers\Admin\AgentControlUiController::class, 'index'])
        ->name('admin.agent-control.dashboard');
});

Route::post('ai/customer', [AiController::class, 'askCustomer'])
    ->name('ai.customer');

Route::post('api/ai/chat', [AiChatController::class, 'handle'])
    ->name('api.ai.chat');

Route::post('ai/merchant', [AiController::class, 'askMerchant'])
    ->middleware(['web', 'core', 'auth'])
    ->name('ai.merchant');

// Per-shop AI settings (admin)
Route::group(['prefix' => config('core.base.general.admin_dir', 'admin'), 'middleware' => ['web', 'auth']], function () {
    Route::get('shops/{shopId}/ai-settings', [\App\Http\Controllers\AiSettingsController::class, 'edit'])
        ->name('shops.ai-settings.edit');

    Route::post('shops/{shopId}/ai-settings', [\App\Http\Controllers\AiSettingsController::class, 'update'])
        ->name('shops.ai-settings.update');
});

require __DIR__.'/admin-agent-control.php';
