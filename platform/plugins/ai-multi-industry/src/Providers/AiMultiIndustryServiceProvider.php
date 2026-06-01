<?php

namespace Botble\AiMultiIndustry\Providers;

use Botble\Base\Facades\DashboardMenu;
use Botble\Base\Traits\LoadAndPublishDataTrait;
use Illuminate\Support\ServiceProvider;

class AiMultiIndustryServiceProvider extends ServiceProvider
{
    use LoadAndPublishDataTrait;

    public function boot(): void
    {
        $this->setNamespace('plugins/ai-multi-industry')
            ->loadAndPublishConfigurations(['ai-industries'])
            ->loadAndPublishViews()
            ->loadRoutes(['web', 'api']);

        $this->app->booted(function () {
            DashboardMenu::make()
                ->registerItem([
                    'id' => 'cms-plugins-ai-multi-industry-root',
                    'priority' => -998,
                    'name' => 'AI 多行业团队',
                    'icon' => 'ti ti-architecture',
                    'url' => route('ai-multi-industry.dashboard'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-multi-industry-dashboard',
                    'parent_id' => 'cms-plugins-ai-multi-industry-root',
                    'priority' => 1,
                    'name' => '运营中心',
                    'icon' => 'ti ti-device-laptop',
                    'url' => route('ai-multi-industry.dashboard'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-multi-industry-industries',
                    'parent_id' => 'cms-plugins-ai-multi-industry-root',
                    'priority' => 2,
                    'name' => '行业管理',
                    'icon' => 'ti ti-building-store',
                    'url' => route('ai-multi-industry.industries.index'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-multi-industry-employees',
                    'parent_id' => 'cms-plugins-ai-multi-industry-root',
                    'priority' => 3,
                    'name' => '员工管理',
                    'icon' => 'ti ti-user-circle',
                    'url' => route('ai-multi-industry.employees.index'),
                    'permissions' => [],
                ])
                ->registerItem([
                    'id' => 'cms-plugins-ai-multi-industry-settings',
                    'parent_id' => 'cms-plugins-ai-multi-industry-root',
                    'priority' => 4,
                    'name' => '聊天配置',
                    'icon' => 'ti ti-settings',
                    'url' => route('ai-multi-industry.chat-config.index'),
                    'permissions' => [],
                ]);
        });
    }
}
