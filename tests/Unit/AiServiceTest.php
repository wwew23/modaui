<?php

namespace Tests\Unit;

use App\Services\AiService;
use App\Services\AiTools;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

use App\Services\AiSettingsService;
use App\Models\AiSetting;

class AiServiceTest extends TestCase
{
    protected function getService()
    {
        $settingsService = \Mockery::mock(AiSettingsService::class);
        $settings = new AiSetting([
            'enabled' => true,
            'runtime_enabled' => false,
            'customer_prompt' => 'customer prompt',
            'merchant_prompt' => 'merchant prompt',
            'tools' => [
                'search_products' => ['enabled' => true],
                'search_faq' => ['enabled' => true],
            ]
        ]);
        $settingsService->shouldReceive('getByShopId')->andReturn($settings);
        
        return new AiService(new AiTools(), $settingsService);
    }

    public function test_handle_customer_message_falls_back_without_llm_api_key(): void
    {
        Config::set('services.llm.api_key', null);

        $service = $this->getService();
        $result = $service->handleCustomerMessage('我想找跑鞋');

        $this->assertSame('search_products', $result['intent']);
        $this->assertArrayHasKey('tool_result', $result);
        $this->assertArrayHasKey('products', $result['tool_result']);
        $this->assertIsString($result['reply']);
    }

    public function test_handle_merchant_message_returns_summary_tool_result(): void
    {
        Config::set('services.llm.api_key', null);

        $service = $this->getService();
        $result = $service->handleMerchantMessage('最近销售情况怎么样？');

        $this->assertSame('sales_summary', $result['intent']);
        $this->assertArrayHasKey('tool_result', $result);
        $this->assertArrayHasKey('summary', $result['tool_result']);
        $this->assertIsString($result['reply']);
    }

    public function test_handle_customer_message_returns_faq_matches(): void
    {
        Config::set('services.llm.api_key', null);

        $service = $this->getService();
        $result = $service->handleCustomerMessage('请问退货政策是什么？');

        $this->assertSame('search_faq', $result['intent']);
        $this->assertArrayHasKey('tool_result', $result);
        $this->assertArrayHasKey('faq', $result['tool_result']);
        $this->assertArrayHasKey('matches', $result['tool_result']['faq']);
        $this->assertIsArray($result['tool_result']['faq']['matches']);
        $this->assertNotEmpty($result['tool_result']['faq']['matches']);
        $this->assertArrayHasKey('faq_matches', $result);
        $this->assertSame($result['tool_result']['faq']['matches'], $result['faq_matches']);
        $this->assertIsString($result['reply']);
    }
}
