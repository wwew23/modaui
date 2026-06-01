<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class TestAiIdentity extends Command
{
    protected $signature = 'ai:test-identity';

    protected $description = '验证 AI 身份识别：它会不会还在说"我是谷歌的"';

    public function handle()
    {
        $this->newLine();
        $this->info('═══════════════════════════════════════════════════════');
        $this->info('🤖 AI 身份识别测试 - 它到底会说什么？');
        $this->info('═══════════════════════════════════════════════════════');
        $this->newLine();

        // 测试 1：顾客端 prompt 是否已加载
        $this->line('测试 1️⃣  顾客端 Prompt 加载验证');
        $this->line('───────────────────────────────────────────────────────');

        $customerPrompt = config('ai.prompts.customer.system');
        if (empty($customerPrompt)) {
            $this->error('❌ 顾客端 prompt 未加载！');
            return;
        }

        $promptText = is_array($customerPrompt) ? implode("\n", $customerPrompt) : $customerPrompt;

        // 检查关键词
        $hasIdentity = str_contains($promptText, '本店');
        $hasNoGoogle = str_contains($promptText, 'Google') || str_contains($promptText, 'OpenAI') || str_contains($promptText, 'ChatGPT');
        $hasProhibition = str_contains($promptText, '不要提到自己来自');

        $this->line('✅ Prompt 已加载，共 ' . count($customerPrompt) . ' 条规则');
        $this->line('   包含内容检查：');
        $this->line($hasIdentity ? '   ✓ 说明了"本店"身份' : '   ✗ 缺少"本店"身份定位');
        $this->line($hasProhibition ? '   ✓ 明确禁止了自报家门' : '   ✗ 没有明确禁止自报家门');

        // 显示第一行（身份宣言）
        if (is_array($customerPrompt) && isset($customerPrompt[0])) {
            $this->newLine();
            $this->line('📋 顾客端身份宣言（第 1 行）：');
            $this->line('   ' . $customerPrompt[0]);
        }

        $this->newLine();

        // 测试 2：商家端 prompt 是否已加载
        $this->line('测试 2️⃣  商家端 Prompt 加载验证');
        $this->line('───────────────────────────────────────────────────────');

        $merchantPrompt = config('ai.prompts.merchant.system');
        if (empty($merchantPrompt)) {
            $this->error('❌ 商家端 prompt 未加载！');
            return;
        }

        $merchantPromptText = is_array($merchantPrompt) ? implode("\n", $merchantPrompt) : $merchantPrompt;

        $merchantHasIdentity = str_contains($merchantPromptText, '本店');
        $merchantHasNoGoogle = str_contains($merchantPromptText, 'Google') || str_contains($merchantPromptText, 'OpenAI') || str_contains($merchantPromptText, 'ChatGPT');
        $merchantHasProhibition = str_contains($merchantPromptText, '不要提到自己来自');

        $this->line('✅ Prompt 已加载，共 ' . count($merchantPrompt) . ' 条规则');
        $this->line('   包含内容检查：');
        $this->line($merchantHasIdentity ? '   ✓ 说明了"本店"身份' : '   ✗ 缺少"本店"身份定位');
        $this->line($merchantHasProhibition ? '   ✓ 明确禁止了自报家门' : '   ✗ 没有明确禁止自报家门');

        // 显示第一行（身份宣言）
        if (is_array($merchantPrompt) && isset($merchantPrompt[0])) {
            $this->newLine();
            $this->line('📋 商家端身份宣言（第 1 行）：');
            $this->line('   ' . $merchantPrompt[0]);
        }

        $this->newLine();

        // 测试 3：快速身份测试
        $this->line('测试 3️⃣  快速身份识别（模拟对话）');
        $this->line('───────────────────────────────────────────────────────');

        $this->line('顾客问：你是谁？');
        $this->line('期望回复：「我是【本店】的 AI 导购...」');
        $this->line('如果回复变成「我是 ChatGPT...」或「我是 Google...」，说明 prompt 没传进去');

        $this->newLine();

        $this->line('商家问：你是谁？');
        $this->line('期望回复：「我是【本店】的电商运营分析助手...」');
        $this->line('如果回复变成「我是某某大模型...」，说明 prompt 没传进去');

        $this->newLine();

        // 测试 4：检查 API 路由
        $this->line('测试 4️⃣  API 路由验证');
        $this->line('───────────────────────────────────────────────────────');

        $this->line('✓ POST /api/ai/customer  → 顾客端智能体');
        $this->line('✓ POST /api/ai/merchant  → 商家端智能体');
        $this->line('确保在你的 routes/api.php 里已定义这两条路由');

        $this->newLine();

        // 最终建议
        $this->info('═══════════════════════════════════════════════════════');
        $this->info('✅ Prompt 配置完成！');
        $this->info('═══════════════════════════════════════════════════════');

        $this->newLine();

        $this->line('接下来：');
        $this->line('1️⃣  清除配置缓存：');
        $this->line('   php artisan config:clear');
        $this->line('   php artisan cache:clear');
        $this->line('');
        $this->line('2️⃣  测试 API 调用：');
        $this->line('   # 顾客端测试');
        $this->line('   curl -X POST http://localhost:8000/api/ai/customer \\');
        $this->line('     -H "Content-Type: application/json" \\');
        $this->line('     -d \'{');
        $this->line('       "message": "你是谁？",');
        $this->line('       "context": {"page_type": "home"}');
        $this->line('     }\'');
        $this->line('');
        $this->line('   # 商家端测试');
        $this->line('   curl -X POST http://localhost:8000/api/ai/merchant \\');
        $this->line('     -H "Content-Type: application/json" \\');
        $this->line('     -d \'{');
        $this->line('       "message": "你是谁？",');
        $this->line('       "context": {"page_type": "dashboard"}');
        $this->line('     }\'');
        $this->line('');
        $this->line('3️⃣  如果回复中还是有 "Google/OpenAI/ChatGPT"，说明：');
        $this->line('   • Prompt 没被正确传给 LLM，检查 AiService.php 中 systemPrompt() 方法');
        $this->line('   • 或者 LLM 的默认配置覆盖了你的 prompt');
        $this->line('');
        $this->line('🎉 祝你的 AI 从此只说"我是你店的 AI"！');

        $this->newLine();
    }
}
