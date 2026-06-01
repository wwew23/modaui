<?php

/**
 * config/services.php - DeepAgents 服务配置
 *
 * 这个配置定义了 DeepAgents 后端服务的连接参数。
 * 在 .env 文件中设置 DEEPAGENTS_URL 环境变量。
 */

return [
    // 其他服务配置...

    'deepagents' => [
        // DeepAgents API 基础 URL
        // 例如：http://localhost:8001 (开发) 或 https://api.deepagents.example.com (生产)
        'url' => env('DEEPAGENTS_URL', 'http://localhost:8001'),

        // 调试模式（生产应设为 false）
        'debug' => env('DEEPAGENTS_DEBUG', false),

        // 请求超时（秒）- DeepAgents 任务可能耗时
        'timeout' => env('DEEPAGENTS_TIMEOUT', 120),

        // API 认证信息（如需要）
        'api_key' => env('DEEPAGENTS_API_KEY', null),
        'api_secret' => env('DEEPAGENTS_API_SECRET', null),
    ],
];
