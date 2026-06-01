@extends('layouts.admin')

@section('title', 'AI 设置')

@section('content')
    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px;">
            <div>
                <h2 style="margin: 0; font-size: 1.5rem; color: #111827;">AI 设置中心 (SaaS 多租户版)</h2>
                <p style="margin: 8px 0 0; color: #6b7280;">为店铺 <strong>{{ $shop->shop_domain }}</strong> 配置智能体行为与策略。</p>
            </div>
        </div>

        @if(session('status'))
            <div style="margin-bottom: 20px; padding: 14px 16px; background: #ecfdf5; color: #166534; border: 1px solid #d1fae5; border-radius: 12px; display: flex; align-items: center; gap: 8px;">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                {{ session('status') }}
            </div>
        @endif

        <form action="{{ route('shops.ai-settings.update', $shop->id) }}" method="POST">
            @csrf
            <div style="display: grid; gap: 32px;">
                <!-- 后台助手 -->
                <section>
                    <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: #374151; display: flex; align-items: center; gap: 8px;">后台 AI 运营助手</h3>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 14px;">
                        <div class="form-group mb-3">
                            <label>
                                <input type="checkbox" name="backend[enabled]" value="1" {{ $backendConfig->enabled ? 'checked' : '' }}>
                                启用后台 AI 运营助手
                            </label>
                        </div>

                        <div class="form-group mb-3">
                            <label>语言</label>
                            <select name="backend[language]" class="form-control">
                                <option value="zh-CN" {{ $backendConfig->language === 'zh-CN' ? 'selected' : '' }}>简体中文</option>
                                <option value="en" {{ $backendConfig->language === 'en' ? 'selected' : '' }}>English</option>
                            </select>
                        </div>

                        <div class="form-group mb-3">
                            <label>语气</label>
                            <input type="text" name="backend[tone_of_voice]" class="form-control" value="{{ $backendConfig->tone_of_voice ?? '专业、简洁，有运营思维' }}">
                        </div>

                        <div class="form-group mb-3">
                            <label>欢迎语</label>
                            <textarea name="backend[welcome_message]" class="form-control" rows="2">{{ $backendConfig->settings['welcome_message'] ?? '' }}</textarea>
                        </div>

                        <div class="form-group mb-3">
                            <label>建议提问（每行一个）</label>
                            <textarea name="backend[suggested_prompts]" class="form-control" rows="4">@foreach(($backendConfig->settings['suggested_prompts'] ?? []) as $prompt){{ $prompt . "\n" }}@endforeach</textarea>
                            <small class="text-muted">多行文本会在保存时解析为数组。</small>
                        </div>
                    </div>
                </section>

                <!-- 前端导购 -->
                <section>
                    <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: #374151; display: flex; align-items: center; gap: 8px;">前端 AI 导购</h3>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 14px;">
                        <div class="form-group mb-3">
                            <label>
                                <input type="checkbox" name="storefront[enabled]" value="1" {{ $storefrontConfig->enabled ? 'checked' : '' }}>
                                启用前端 AI 导购
                            </label>
                        </div>

                        <div class="form-group mb-3">
                            <label>语言</label>
                            <select name="storefront[language]" class="form-control">
                                <option value="zh-CN" {{ $storefrontConfig->language === 'zh-CN' ? 'selected' : '' }}>简体中文</option>
                                <option value="en" {{ $storefrontConfig->language === 'en' ? 'selected' : '' }}>English</option>
                            </select>
                        </div>

                        <div class="form-group mb-3">
                            <label>语气</label>
                            <input type="text" name="storefront[tone_of_voice]" class="form-control" value="{{ $storefrontConfig->tone_of_voice ?? '友好、口语化、适度幽默' }}">
                        </div>

                        <div class="form-group mb-3">
                            <label>欢迎语</label>
                            <textarea name="storefront[welcome_message]" class="form-control" rows="2">{{ $storefrontConfig->settings['welcome_message'] ?? '' }}</textarea>
                        </div>

                        <div class="form-group mb-3">
                            <label>建议提问（每行一个）</label>
                            <textarea name="storefront[suggested_prompts]" class="form-control" rows="4">@foreach(($storefrontConfig->settings['suggested_prompts'] ?? []) as $prompt){{ $prompt . "\n" }}@endforeach</textarea>
                            <small class="text-muted">多行文本会在保存时解析为数组。</small>
                        </div>
                    </div>
                </section>

                <div style="padding-top: 20px; border-top: 1px solid #f3f4f6;">
                    <button type="submit" class="btn btn-primary">保存设置</button>
                </div>
            </div>
        </form>
    </div>
@endsection
