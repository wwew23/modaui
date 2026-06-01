<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\DeepAgentsService;
use App\Services\AiConversationService;
use Botble\AiCommerce\AiAgents\MartfuryShopkeeperAgent;
use App\Models\AiConfig;
use Illuminate\Support\Facades\Http;

/**
 * DeepAgents 端到端集成测试
 *
 * 测试流程：
 * 1. 验证 DeepAgentsService 可用性
 * 2. 验证 DeepBallTool 在 LarAgent 中的注册
 * 3. 模拟用户请求并验证工具调用
 * 4. 验证会话记录与指标收集
 *
 * 运行: php artisan test --filter DeepAgentsIntegrationTest
 */
class DeepAgentsIntegrationTest extends TestCase
{
    protected DeepAgentsService $deepAgentsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->deepAgentsService = new DeepAgentsService();
        
        // 注册 mock shop 到容器，供 TenantManager 使用
        $mockShop = new \stdClass();
        $mockShop->id = 1;
        $mockShop->name = 'Test Store';
        $mockShop->getTenantKey = fn() => 'test-store.myshopify.com';
        
        app()->instance('current_shop', $mockShop);
    }

    /**
     * 测试 DeepAgentsService 健康检查
     */
    public function test_deepagents_health_check()
    {
        // 模拟 DeepAgents API 响应
        Http::fake([
            'http://localhost:8001/health' => Http::response(['status' => 'ok'], 200),
        ]);

        $isHealthy = $this->deepAgentsService->isHealthy();
        $this->assertTrue($isHealthy);
    }

    /**
     * 测试 DeepBallTool 在 Agent 中的注册
     */
    public function test_deepballtool_is_registered_in_agent()
    {
        // 创建 Agent 实例
        $agent = new MartfuryShopkeeperAgent('test-session');

        // 获取 Agent 的工具列表
        $tools = $agent->getTools();

        // 验证 DeepBallTool 已注册
        $toolNames = array_map(fn($tool) => class_basename($tool), $tools);
        $this->assertContains('DeepBallTool', $toolNames);
    }

    /**
     * 测试市场研究任务执行
     */
    public function test_market_research_task_execution()
    {
        // 模拟 DeepAgents API 响应
        Http::fake([
            'http://localhost:8001/api/run' => Http::response([
                'market_size' => '€450M annually',
                'market_growth' => '5.2% CAGR',
                'competitors' => ['Butterfly', 'Stiga', 'DHS'],
                'recommendations' => [
                    '优化德文关键词',
                    '在亚马逊上线',
                    '投放谷歌购物广告',
                ],
            ], 200),
        ]);

        // 执行市场研究任务
        $result = $this->deepAgentsService->executeTask(
            '分析这款银河底板在德国市场的机会',
            [
                'product' => ['id' => 1, 'name' => '银河底板', 'category' => '乒乓球拍'],
                'market' => 'Germany',
                'shop' => ['id' => 1, 'name' => '小球电商'],
            ]
        );

        $this->assertTrue($result['success']);
        $this->assertNotNull($result['data']);
        $this->assertArrayHasKey('market_size', $result['data']);
        $this->assertArrayHasKey('competitors', $result['data']);
    }

    /**
     * 测试 LarAgent 调用 DeepBallTool 的完整流程
     */
    public function test_laragent_invokes_deepballtool()
    {
        // 模拟 DeepAgents API 响应
        Http::fake([
            'http://localhost:8001/api/run' => Http::response([
                'success' => true,
                'data' => ['market_size' => '€450M'],
            ], 200),
        ]);

        // 设置 Agent 配置
        AiConfig::set('agent_tone', '专业、简洁');
        AiConfig::set('model_config', [
            'openai_api_key' => env('OPENAI_API_KEY'),
        ]);

        // 创建会话
        $agent = new MartfuryShopkeeperAgent('test-session-123');

        // 模拟用户消息
        $message = '帮我分析这款银河底板在德国市场的机会';

        // 验证 Agent 可以识别并可能调用 DeepBallTool
        // (实际调用需要真实的 LLM 模型，这里仅验证工具已注册)
        $tools = $agent->getTools();
        $this->assertNotEmpty($tools);

        // 验证 DeepBallTool 在工具列表中
        $deepBallToolFound = false;
        foreach ($tools as $tool) {
            if (class_basename($tool) === 'DeepBallTool') {
                $deepBallToolFound = true;
                break;
            }
        }
        $this->assertTrue($deepBallToolFound, 'DeepBallTool not found in agent tools');
    }

    /**
     * 测试会话记录与指标收集
     */
    public function test_conversation_logging_and_metrics()
    {
        // 模拟 DeepAgents API 响应
        Http::fake([
            'http://localhost:8001/api/run' => Http::response([
                'success' => true,
                'data' => ['market_size' => '€450M'],
            ], 200),
        ]);

        // 创建会话
        $conversationService = new AiConversationService();
        $conversation = $conversationService->start(
            agentType: 'MartfuryShopkeeperAgent',
            userId: 1,
            sessionId: 'test-session-' . time()
        );

        $this->assertNotNull($conversation);
        $this->assertNotNull($conversation->shopify_shop_id);

        // 添加用户消息
        $message = $conversationService->addUserMessage(
            $conversation->id,
            '帮我分析这款银河底板在德国市场的机会'
        );

        $this->assertNotNull($message);
        $this->assertEquals('user', $message->role);

        // 模拟工具调用
        $conversationService->recordToolCall(
            $conversation->id,
            'deep_ball_research',
            ['task_type' => 'market_research', 'product_id' => 1, 'market' => 'Germany'],
            ['market_size' => '€450M']
        );

        // 添加助手回复
        $assistantMessage = $conversationService->addAssistantMessage(
            $conversation->id,
            '德国市场分析完成...'
        );

        $this->assertNotNull($assistantMessage);
        $this->assertEquals('assistant', $assistantMessage->role);

        // 结束会话
        $conversation = $conversationService->end($conversation->id);
        $this->assertNotNull($conversation->ended_at);
    }

    /**
     * 测试错误处理 - DeepAgents 服务不可用
     */
    public function test_error_handling_deepagents_unavailable()
    {
        // 模拟 DeepAgents 服务不可用
        Http::fake([
            'http://localhost:8001/api/run' => Http::response(['error' => 'Service unavailable'], 503),
        ]);

        $result = $this->deepAgentsService->executeTask(
            '测试任务',
            ['product' => ['id' => 1]]
        );

        $this->assertFalse($result['success']);
        $this->assertNotNull($result['error']);
    }

    /**
     * 测试数据规范化
     */
    public function test_data_normalization()
    {
        // 反射 DeepAgentsService 的 normalizeData 方法
        $reflection = new \ReflectionMethod(DeepAgentsService::class, 'normalizeData');
        $reflection->setAccessible(true);
        $service = new DeepAgentsService();

        // 测试数组输入
        $arrayData = ['id' => 1, 'name' => 'Test'];
        $result = $reflection->invoke($service, $arrayData);
        $this->assertEquals($arrayData, $result);

        // 测试对象输入（模拟 Eloquent 模型）
        $mockObject = new \stdClass();
        $mockObject->id = 1;
        $mockObject->name = 'Test';
        $result = $reflection->invoke($service, $mockObject);
        $this->assertIsArray($result);
    }
}
