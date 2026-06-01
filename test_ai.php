<?php

use Botble\AiCommerce\AiAgents\MartfuryShopkeeperAgent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Force logging to stderr to avoid permission issues
Log::setDefaultDriver('stderr');

// Mock the API responses
Http::fake([
    '*/analytics/kpi-summary*' => Http::response([
        'totalSales' => 12500.50,
        'orderCount' => 150,
        'averageOrderValue' => 83.34,
        'refundAmount' => 1200.00,
        'refundRate' => 0.096,
        'period' => '2026-05-24 to 2026-05-30'
    ], 200),
]);

$agent = MartfuryShopkeeperAgent::for('test_session_final');

echo "\n--- AI Sidekick Test ---\n";
echo "User: 帮我看看最近 7 天的表现，顺便给点运营建议。\n";

try {
    $response = $agent->respond('帮我看看最近 7 天的表现，顺便给点运营建议。');
    echo "\nSidekick: \n" . $response . "\n";
    echo "--- End Test ---\n";
} catch (\Exception $e) {
    echo "\nError: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
