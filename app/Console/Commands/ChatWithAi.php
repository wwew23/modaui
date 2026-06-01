<?php

namespace App\Console\Commands;

use App\Services\AiService;
use Illuminate\Console\Command;

class ChatWithAi extends Command
{
    protected $signature = 'ai:chat {role : customer|merchant} {message? : 要说的话}';

    protected $description = '直接在命令行里和 AI 对话（顾客端或商家端）';

    public function handle(AiService $aiService)
    {
        $role = $this->argument('role');
        
        if (!in_array($role, ['customer', 'merchant'])) {
            $this->error("角色只能是 customer 或 merchant");
            return;
        }

        $message = $this->argument('message');

        if (!$message) {
            $this->line('进入 ' . ($role === 'customer' ? '顾客端' : '商家端') . ' AI 对话');
            $this->line('输入 "quit" 或 "exit" 退出');
            $this->newLine();

            while (true) {
                $prompt = $role === 'customer' ? '你：' : '店主：';
                $message = $this->ask($prompt);

                if (in_array(strtolower($message), ['quit', 'exit', 'q'])) {
                    $this->info('再见！');
                    break;
                }

                if (empty(trim($message))) {
                    continue;
                }

                $this->chat($aiService, $role, $message);
                $this->newLine();
            }
        } else {
            $this->chat($aiService, $role, $message);
        }
    }

    protected function chat(AiService $aiService, string $role, string $message): void
    {
        $context = ['page_type' => $role === 'customer' ? 'home' : 'dashboard'];

        if ($role === 'customer') {
            $response = $aiService->handleCustomerMessage($message, $context);
        } else {
            $response = $aiService->handleMerchantMessage($message, $context);
        }

        $intent = $response['intent'] ?? 'unknown';
        $reply = $response['reply'] ?? '无法获取回复';

        $this->newLine();
        $this->line('<fg=cyan>AI（意图：' . $intent . '）：</>');
        $this->line($reply);
        $this->newLine();

        // 如果有工具数据，也展示一下
        if (!empty($response['recommended_products'])) {
            $this->line('<fg=yellow>📦 推荐商品：</>');
            foreach ($response['recommended_products'] as $product) {
                $this->line('  • ' . $product['name'] . ' ￥' . $product['sale_price']);
            }
            $this->newLine();
        }

        if (!empty($response['sales_summary'])) {
            $summary = $response['sales_summary'];
            $this->line('<fg=yellow>📊 销售数据：</>');
            $this->line('  • 订单数：' . $summary['orders']);
            $this->line('  • 收入：￥' . $summary['revenue']);
            $this->line('  • 平均客单价：￥' . $summary['average_order']);
            $this->newLine();
        }
    }
}
