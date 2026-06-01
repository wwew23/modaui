<?php

use Botble\AiMultiIndustry\Http\Controllers\AiChatController;
use Botble\AiMultiIndustry\Http\Controllers\AiMultiIndustryController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/ai-multi-industry')->middleware('api')->group(function (): void {
    // 聊天接口
    Route::post('chat', [AiChatController::class, 'handle'])->name('api.ai-multi-industry.chat');
    Route::post('chat/close-session', [AiChatController::class, 'closeSession'])->name('api.ai-multi-industry.chat.close');
    Route::get('chat/session/{sessionToken}', [AiChatController::class, 'getSession'])->name('api.ai-multi-industry.chat.session');

    // 行业和员工数据接口
    Route::get('industries', [AiMultiIndustryController::class, 'industries'])->name('api.ai-multi-industry.industries');
    Route::get('industries/{industry}/employees', [AiMultiIndustryController::class, 'industryEmployees'])->name('api.ai-multi-industry.industry.employees');
});

