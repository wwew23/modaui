<?php

use App\Http\Controllers\AiController;
use Botble\AiCommerce\Http\Controllers\AiChatController;
use Illuminate\Support\Facades\Route;

Route::post('ai/customer', [AiController::class, 'askCustomer']);
Route::post('ai/merchant', [AiController::class, 'askMerchant']);
Route::post('ai/chat', [AiChatController::class, 'handle']);
