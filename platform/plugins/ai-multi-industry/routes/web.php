<?php

use Botble\Base\Facades\AdminHelper;
use Botble\AiMultiIndustry\Http\Controllers\AiMultiIndustryController;
use Botble\AiMultiIndustry\Http\Controllers\AiChatController;
use Botble\AiMultiIndustry\Http\Controllers\Admin\IndustryController;
use Botble\AiMultiIndustry\Http\Controllers\Admin\EmployeeController;
use Botble\AiMultiIndustry\Http\Controllers\Admin\ChatConfigController;
use Illuminate\Support\Facades\Route;

AdminHelper::registerRoutes(function (): void {
    Route::prefix('ai-multi-industry')->group(function (): void {
        Route::get('/', [AiMultiIndustryController::class, 'dashboard'])->name('ai-multi-industry.dashboard');
        Route::get('chat', [AiMultiIndustryController::class, 'chat'])->name('ai-multi-industry.chat');
        Route::post('chat', [AiChatController::class, 'handle'])->name('ai-multi-industry.chat.handle');
    });

    Route::group(['prefix' => 'ai-multi-industry/industries', 'as' => 'ai-multi-industry.industries.'], function (): void {
        Route::resource('', IndustryController::class)->parameters(['' => 'industry']);
        Route::get('list', [IndustryController::class, 'getList'])->name('list');
    });

    Route::group(['prefix' => 'ai-multi-industry/employees', 'as' => 'ai-multi-industry.employees.'], function (): void {
        Route::resource('', EmployeeController::class)->parameters(['' => 'employee']);
        Route::get('list', [EmployeeController::class, 'getList'])->name('list');
    });

    Route::group(['prefix' => 'ai-multi-industry/chat-config', 'as' => 'ai-multi-industry.chat-config.'], function (): void {
        Route::get('/', [ChatConfigController::class, 'index'])->name('index');
        Route::post('/', [ChatConfigController::class, 'update'])->name('update');
    });
});
