<?php

namespace Botble\AiCommerce\Providers;

use Botble\Base\Facades\DashboardMenu;
use Botble\Base\Traits\LoadAndPublishDataTrait;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Botble\AiCommerce\Http\Controllers\AiChatController;
use Botble\AiCommerce\Http\Controllers\AiSettingsController;

class AiCommerceServiceProvider extends ServiceProvider
{
    use LoadAndPublishDataTrait;

    public function register(): void
    {
        if (class_exists(\LarAgent\LarAgentServiceProvider::class)) {
            $this->app->register(\LarAgent\LarAgentServiceProvider::class);
        }
    }

    public function boot(): void
    {
        $this->setNamespace('plugins/ai-commerce')
            ->loadAndPublishViews();

        $this->loadRoutes(['web']);

        $this->app->booted(function () {
            DashboardMenu::make()
                ->registerItem([
                    'id' => 'cms-plugins-ai-commerce-root',
                    'priority' => -999,
                    'name' => 'AI Commerce OS',
                    'icon' => 'ti ti-cpu',
                    'url' => route('ai-commerce.dashboard'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-commerce-admin',
                    'parent_id' => 'cms-plugins-ai-commerce-root',
                    'priority' => 1,
                    'name' => 'OS 控制台',
                    'icon' => 'ti ti-device-laptop',
                    'url' => route('ai-commerce.dashboard', ['tab' => 'admin']),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-commerce-merchant',
                    'parent_id' => 'cms-plugins-ai-commerce-root',
                    'priority' => 2,
                    'name' => '商家工作台',
                    'icon' => 'ti ti-building-store',
                    'url' => route('ai-commerce.dashboard', ['tab' => 'merchant']),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-commerce-settings',
                    'parent_id' => 'cms-plugins-ai-commerce-root',
                    'priority' => 3,
                    'name' => '助手设置',
                    'icon' => 'ti ti-settings',
                    'url' => route('ai.settings'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-sidekick',
                    'parent_id' => 'cms-plugins-ai-commerce-root',
                    'priority' => 5,
                    'name' => 'Sidekick 助手',
                    'icon' => 'ti ti-messages',
                    'url' => route('ai.assistant'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-approvals',
                    'parent_id' => 'cms-plugins-ai-commerce-root',
                    'priority' => 6,
                    'name' => '审批队列',
                    'icon' => 'ti ti-checkbox',
                    'url' => route('ai.approvals'),
                    'permissions' => [],
                ]);
        });
    }
}
