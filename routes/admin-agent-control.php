<?php

// admin/routes.php - Agent Control Center Admin Routes

Route::middleware(['api', 'auth:sanctum'])
    ->prefix('api/admin/agent-control')
    ->name('admin.agent-control.')
    ->group(function () {
        
        // Agent 管理
        Route::apiResource('agents', 'App\Http\Controllers\Admin\AgentConfigController');
        Route::patch('agents/{agent}/toggle', 'App\Http\Controllers\Admin\AgentConfigController@toggle')
            ->name('agents.toggle');
        Route::post('agents/{agent}/test', 'App\Http\Controllers\Admin\AgentConfigController@test')
            ->name('agents.test');
        Route::get('agents/{agent}/stats', 'App\Http\Controllers\Admin\AgentConfigController@stats')
            ->name('agents.stats');
        
        // Tool 管理
        Route::apiResource('tools', 'App\Http\Controllers\Admin\ToolConfigController');
        Route::patch('tools/{tool}/toggle', 'App\Http\Controllers\Admin\ToolConfigController@toggle')
            ->name('tools.toggle');
        Route::post('tools/{tool}/test', 'App\Http\Controllers\Admin\ToolConfigController@test')
            ->name('tools.test');
        
        // Workflow 管理
        Route::apiResource('workflows', 'App\Http\Controllers\Admin\WorkflowConfigController');
        Route::patch('workflows/{workflow}/toggle', 'App\Http\Controllers\Admin\WorkflowConfigController@toggle')
            ->name('workflows.toggle');
        Route::post('workflows/{workflow}/test', 'App\Http\Controllers\Admin\WorkflowConfigController@test')
            ->name('workflows.test');
        Route::post('workflows/{workflow}/execute', 'App\Http\Controllers\Admin\WorkflowConfigController@execute')
            ->name('workflows.execute');
        
        // Prompt 管理
        Route::apiResource('prompts', 'App\Http\Controllers\Admin\PromptConfigController');
        Route::post('prompts/{prompt}/test-render', 'App\Http\Controllers\Admin\PromptConfigController@testRender')
            ->name('prompts.test-render');
        
        // Model 管理
        Route::apiResource('models', 'App\Http\Controllers\Admin\ModelConfigController');
        Route::patch('models/{model}/toggle', 'App\Http\Controllers\Admin\ModelConfigController@toggle')
            ->name('models.toggle');
        Route::post('models/{model}/test', 'App\Http\Controllers\Admin\ModelConfigController@test')
            ->name('models.test');
        
        // MCP 管理
        Route::apiResource('mcps', 'App\Http\Controllers\Admin\McpConfigController');
        Route::patch('mcps/{mcp}/toggle', 'App\Http\Controllers\Admin\McpConfigController@toggle')
            ->name('mcps.toggle');
        Route::post('mcps/{mcp}/test', 'App\Http\Controllers\Admin\McpConfigController@test')
            ->name('mcps.test');
        
        // Agent ↔ Tool 绑定
        Route::post('agents/{agent}/tools', 'App\Http\Controllers\Admin\AgentToolBindingController@store')
            ->name('agent-tools.store');
        Route::delete('agents/{agent}/tools/{tool}', 'App\Http\Controllers\Admin\AgentToolBindingController@destroy')
            ->name('agent-tools.destroy');
        Route::patch('agents/{agent}/tools/{tool}', 'App\Http\Controllers\Admin\AgentToolBindingController@update')
            ->name('agent-tools.update');

        // AI 装修编辑器
        Route::get('ai-editor/theme-options', 'App\Http\Controllers\Admin\AiEditorController@themeOptions')
            ->name('ai-editor.theme-options');
        Route::post('ai-editor/describe', 'App\Http\Controllers\Admin\AiEditorController@describe')
            ->name('ai-editor.describe');
        Route::post('ai-editor/preview', 'App\Http\Controllers\Admin\AiEditorController@preview')
            ->name('ai-editor.preview');
        Route::post('ai-editor/apply', 'App\Http\Controllers\Admin\AiEditorController@apply')
            ->name('ai-editor.apply');
        
        // 分析与监控
        Route::get('analytics/agent-usage', 'App\Http\Controllers\Admin\AnalyticsController@agentUsage')
            ->name('analytics.agent-usage');
        Route::get('analytics/cost-breakdown', 'App\Http\Controllers\Admin\AnalyticsController@costBreakdown')
            ->name('analytics.cost-breakdown');
        Route::get('analytics/performance', 'App\Http\Controllers\Admin\AnalyticsController@performance')
            ->name('analytics.performance');
    });
