<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Botble\Base\Facades\DashboardMenu;
use Botble\Base\Supports\DashboardMenuItem;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::addNamespace('ai-commerce', resource_path('views/vendor/ai-commerce'));

        DashboardMenu::default()->beforeRetrieving(function (): void {
            DashboardMenu::make()
                ->registerItem(
                    DashboardMenuItem::make()
                        ->id('cms-ai-agent-control')
                        ->priority(95)
                        ->name('AI Agent 控制中心')
                        ->icon('ti ti-rocket')
                        ->route('admin.agent-control.dashboard')
                        ->permissions('ai.agent.manage')
                );
        });
    }
}
