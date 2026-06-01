<?php

namespace Modaui\Customer\Providers;

use Botble\Base\Facades\Assets;
use Botble\Setting\Facades\Setting;
use Illuminate\Support\ServiceProvider;

class HookServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->booted(function () {
            if (Setting::get('modaui.customer_enabled', true)) {
                Assets::addScriptsDirectly('vendor/modaui/ai-widget.js?role=customer');
            }
        });
    }
}
