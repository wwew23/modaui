<?php

namespace App\Http\Controllers;

use App\Services\AiService;
use App\Services\AiSettingsService;
use Illuminate\Http\Request;

class AiController extends Controller
{
    protected AiSettingsService $settingsService;

    public function __construct(AiSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }
    public function askCustomer(Request $request, AiService $aiService)
    {
        $message = trim($request->input('message', ''));

        if ($message === '') {
            return response()->json(['error' => 'Message is required.'], 400);
        }

        return response()->json($aiService->handleCustomerMessage($message, $request->input('context', [])));
    }

    public function askMerchant(Request $request, AiService $aiService)
    {
        $message = trim($request->input('message', ''));

        if ($message === '') {
            return response()->json(['error' => 'Message is required.'], 400);
        }

        return response()->json($aiService->handleMerchantMessage($message, $request->input('context', [])));
    }

    public function adminAssistant()
    {
        return view('admin.ai-assistant');
    }

    public function osDashboard()
    {
        $settings = $this->settingsService->getByShopId(1);

        return view('admin.ai-os', [
            'aiEnabled' => $settings->enabled,
            'customerAgentEnabled' => $settings->customer_agent_enabled,
            'merchantAgentEnabled' => $settings->merchant_agent_enabled,
            'industry' => $settings->industry,
            'stylePreset' => $settings->style_preset,
            'styleDescription' => null,
            'stylingSuggestionsEnabled' => data_get($settings->tools, 'getStylingSuggestions.enabled', true),
            'stylingSuggestionsMaxLength' => data_get($settings->tools, 'getStylingSuggestions.maxLength', 300),
            'stylingSuggestionsIncludeReason' => data_get($settings->tools, 'getStylingSuggestions.includeReason', true),
            'modelSource' => $settings->model_source,
            'modelEndpoint' => data_get($settings->model_config, 'endpoint', env('MODAUI_OS_API_BASE_URL')),
            'modelApiKey' => data_get($settings->model_config, 'apiKey', env('MODAUI_INTERNAL_SYSTEM_TOKEN')),
            'modelName' => data_get($settings->model_config, 'model', 'llama3.1:8b'),
            'modelTemperature' => data_get($settings->model_config, 'temperature', 0.7),
            'modelMaxTokens' => data_get($settings->model_config, 'maxTokens', 512),
        ]);
    }
}
