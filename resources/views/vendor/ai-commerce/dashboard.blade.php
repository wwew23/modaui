@extends('core/base::layouts.master')

@section('content')
    <div class="ai-intelligence-center" style="padding: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
            <a href="{{ route('ai-commerce.dashboard', ['tab' => 'admin']) }}" style="padding: 10px 16px; border-radius: 12px; background: {{ $tab === 'admin' ? '#111827' : '#f3f4f6' }}; color: {{ $tab === 'admin' ? '#fff' : '#111827' }}; text-decoration: none;">Admin</a>
            <a href="{{ route('ai-commerce.dashboard', ['tab' => 'merchant']) }}" style="padding: 10px 16px; border-radius: 12px; background: {{ $tab === 'merchant' ? '#111827' : '#f3f4f6' }}; color: {{ $tab === 'merchant' ? '#fff' : '#111827' }}; text-decoration: none;">Merchant</a>
            <a href="{{ route('ai-commerce.dashboard', ['tab' => 'traces']) }}" style="padding: 10px 16px; border-radius: 12px; background: {{ $tab === 'traces' ? '#111827' : '#f3f4f6' }}; color: {{ $tab === 'traces' ? '#fff' : '#111827' }}; text-decoration: none;">Traces</a>
            <a href="{{ route('ai-commerce.dashboard', ['tab' => 'execute']) }}" style="padding: 10px 16px; border-radius: 12px; background: {{ $tab === 'execute' ? '#111827' : '#f3f4f6' }}; color: {{ $tab === 'execute' ? '#fff' : '#111827' }}; text-decoration: none;">Execute</a>
        </div>

        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
            <h1 style="margin-bottom: 12px; font-size: 1.5rem; color: #111827;">AI Commerce OS 本地后台页面</h1>
            <p style="margin-bottom: 16px; color: #4b5563;">已移除外部运行时外壳，当前页面直接由本地后端渲染，无需依赖外部域名。</p>

            @if ($tab === 'admin')
                <div style="display: grid; gap: 16px;">
                    <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                        <strong>Admin 选项卡</strong>
                        <p style="margin-top: 8px; color: #475569;">在这里你可以直接查看 AI 运行时管理入口、AI 设置和运营助手链接。</p>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <a href="{{ route('ai.settings') }}" style="padding: 18px; border-radius: 14px; background: #111827; color: #fff; text-decoration: none;">AI 设置</a>
                        <a href="{{ route('ai.assistant') }}" style="padding: 18px; border-radius: 14px; background: #047857; color: #fff; text-decoration: none;">运营助手</a>
                        <a href="{{ route('ai') }}" style="padding: 18px; border-radius: 14px; background: #0c4a6e; color: #fff; text-decoration: none;">跳转到 AI 主页</a>
                    </div>
                </div>
            @elseif ($tab === 'merchant')
                <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                    <strong>Merchant 选项卡</strong>
                    <p style="margin-top: 8px; color: #475569;">商家工作台页面已切换为本地后端显示，后续可以在此处扩展商家视图。</p>
                </div>
            @elseif ($tab === 'traces')
                <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                    <strong>Traces 选项卡</strong>
                    <p style="margin-top: 8px; color: #475569;">此处可用于展示 AI 运行时追踪信息，当前由本地后端页面承载。</p>
                </div>
            @elseif ($tab === 'execute')
                <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                    <strong>Execute 选项卡</strong>
                    <p style="margin-top: 8px; color: #475569;">执行面板已显示为本地页面，后续可填充操作和执行结果。</p>
                </div>
            @else
                <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                    <p style="color: #475569;">请选择一个选项卡以查看详细内容。</p>
                </div>
            @endif
        </div>
    </div>
@stop
