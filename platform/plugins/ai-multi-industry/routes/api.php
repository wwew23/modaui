<?php

use Botble\AiMultiIndustry\Http\Controllers\AiChatController;
use Botble\AiMultiIndustry\Http\Controllers\AiMultiIndustryController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/ai-multi-industry')->middleware('api')->group(function (): void {
    Route::post('chat', [AiChatController::class, 'handle'])->name('api.ai-multi-industry.chat');
    Route::get('industries', [AiMultiIndustryController::class, 'industries'])->name('api.ai-multi-industry.industries');
    Route::get('industries/{industry}/employees', [AiMultiIndustryController::class, 'industryEmployees'])->name('api.ai-multi-industry.industry.employees');
});
