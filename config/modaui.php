<?php

/**
 * ModaUI AI Configuration
 * 
 * 配置 AI 模型、Shopify API 和 AI 功能的设置
 */

return [
    'ai' => [
        /**
         * AI 提供商
         * 支持: 'openai', 'anthropic'
         */
        'provider' => env('AI_PROVIDER', 'openai'),

        /**
         * AI 模型
         * OpenAI: 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'
         * Anthropic: 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'
         */
        'model' => env('AI_MODEL', 'gpt-4-turbo'),

        /**
         * API 密钥
         */
        'api_key' => env('AI_API_KEY', ''),

        /**
         * 温度（0-1）：越高越有创意，越低越保守
         */
        'temperature' => 0.7,

        /**
         * 最大令牌数
         */
        'max_tokens' => 2000,
    ],

    'shopify' => [
        /**
         * Shopify 店铺域名
         * 例如: 'myshop.myshopify.com'
         */
        'shop' => env('SHOPIFY_SHOP', ''),

        /**
         * Shopify Admin API Access Token
         */
        'access_token' => env('SHOPIFY_ACCESS_TOKEN', ''),

        /**
         * Shopify API 版本
         */
        'api_version' => '2024-01',
    ],

    /**
     * ModaUI AI 功能开关
     */
    'features' => [
        'product_description' => true, // 商品文案生成
        'sales_analysis' => true,      // 销量分析
        'auto_tagging' => true,        // 自动打标签
        'pricing_suggestion' => true,  // 定价建议
        'customer_segmentation' => true, // 客户分群
        'natural_language_chat' => true, // 自然语言聊天
    ],

    /**
     * 日志配置
     */
    'logging' => [
        'enabled' => true,
        'channel' => 'stack',
    ],
];
