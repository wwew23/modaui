<?php

namespace Botble\AiMultiIndustry\Http\Controllers\Admin;

use Botble\Base\Http\Controllers\BaseController;
use Illuminate\Http\Request;

class ChatConfigController extends BaseController
{
    public function index()
    {
        return view('plugins.ai-multi-industry::admin.chat-config');
    }

    public function update(Request $request)
    {
        $data = $request->only(['welcome_message', 'default_model', 'temperature', 'max_tokens']);

        // 这里可以扩展为保存到插件设置或共享配置存储。
        return redirect()->route('ai-multi-industry.chat-config.index');
    }
}
