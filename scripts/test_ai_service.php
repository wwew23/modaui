<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
// Bootstrap the application
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $ai = $app->make(\App\Services\AiService::class);
    $result = $ai->handleCustomerMessage('测试：请用简短中文回复，标注来源', [], 1);
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (\Throwable $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
