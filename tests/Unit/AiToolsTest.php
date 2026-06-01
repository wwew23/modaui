<?php

namespace Tests\Unit;

use App\Services\AiTools;
use Tests\TestCase;

class AiToolsTest extends TestCase
{
    public function test_search_products_returns_matching_products(): void
    {
        $tools = new AiTools();
        $results = $tools->searchProducts('跑鞋');

        $this->assertIsArray($results);
        $this->assertNotEmpty($results);
        $this->assertArrayHasKey('name', $results[0]);
    }

    public function test_sales_summary_contains_expected_keys(): void
    {
        $tools = new AiTools();
        $summary = $tools->getSalesSummary('30d');

        $this->assertArrayHasKey('orders', $summary);
        $this->assertArrayHasKey('revenue', $summary);
        $this->assertArrayHasKey('average_order_value', $summary);
    }

    public function test_search_faq_returns_ranked_matches(): void
    {
        $tools = new AiTools();
        $result = $tools->searchFaq('退货政策是什么');

        $this->assertArrayHasKey('question', $result);
        $this->assertArrayHasKey('answer', $result);
        $this->assertArrayHasKey('matches', $result);
        $this->assertIsArray($result['matches']);
        $this->assertNotEmpty($result['matches']);
        $this->assertArrayHasKey('title', $result['matches'][0]);
        $this->assertArrayHasKey('score', $result['matches'][0]);
    }
}
