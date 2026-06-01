<?php

namespace Botble\AiMultiIndustry;

use Botble\PluginManagement\Abstracts\PluginOperationAbstract;
use Illuminate\Support\Facades\Schema;

class Plugin extends PluginOperationAbstract
{
    public static function remove(): void
    {
        Schema::dropIfExists('ai_chat_messages');
        Schema::dropIfExists('ai_industry_employees');
        Schema::dropIfExists('ai_industries');
    }
}
