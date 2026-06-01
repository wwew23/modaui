<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

$now = date('Y-m-d H:i:s');

if (!Schema::hasTable('ai_configs')) {
    Schema::create('ai_configs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('shopify_shop_id')->index();
        $table->string('agent_type', 50);
        $table->boolean('enabled')->default(true)->index();
        $table->string('language', 10)->default('zh-CN');
        $table->text('tone_of_voice')->nullable();
        $table->json('settings')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
    echo "ai_configs table created\n";
} else {
    echo "ai_configs table already exists\n";
}

// Insert a test config for shop 1 storefront_agent if not exists
$exists = DB::table('ai_configs')->where('shopify_shop_id', 1)->where('agent_type', 'storefront_agent')->exists();
if (! $exists) {
    $settings = [
        'welcome_message' => '嗨！我是你的 AI 导购，能帮你推荐商品。',
        'suggested_prompts' => ['推荐几款夏季连衣裙','我想看男士运动鞋'],
        'features' => [
            'product_search' => true,
            'product_recommendation' => true,
            'order_status' => true,
        ],
        'model_config' => [
            'source' => 'openai',
            'model' => 'gpt-3.5-turbo',
            'temperature' => 0.7,
            'max_tokens' => 500,
        ],
    ];

    DB::table('ai_configs')->insert([
        'shopify_shop_id' => 1,
        'agent_type' => 'storefront_agent',
        'enabled' => 1,
        'language' => 'zh-CN',
        'tone_of_voice' => '友好、口语化',
        'settings' => json_encode($settings, JSON_UNESCAPED_UNICODE),
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    echo "Inserted test ai_config for shop 1 storefront_agent\n";
} else {
    echo "Test ai_config already exists for shop 1 storefront_agent\n";
}
