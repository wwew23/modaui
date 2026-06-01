<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$shopId = $argv[1] ?? 1;
$agentType = $argv[2] ?? 'storefront_agent';
$model = $argv[3] ?? 'llama3';

$record = DB::table('ai_configs')->where('shopify_shop_id', $shopId)->where('agent_type', $agentType)->first();
if (! $record) {
    echo "No ai_config found for shop $shopId $agentType\n";
    exit(1);
}
$settings = json_decode($record->settings ?? '{}', true) ?: [];
if (!isset($settings['model_config'])) $settings['model_config'] = [];
$settings['model_config']['model'] = $model;

DB::table('ai_configs')->where('id', $record->id)->update([
    'settings' => json_encode($settings, JSON_UNESCAPED_UNICODE),
    'updated_at' => date('Y-m-d H:i:s'),
]);

echo "ai_config model for shop $shopId ($agentType) set to $model\n";
