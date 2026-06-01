@extends('layouts.admin')

@section('title', '运营仪表盘')

@section('content')
    <h2>运营总览</h2>
    <p>这是一个示例后台运营面板。右下角是 AI 运营助手，可以询问销售、商品表现、客户分析等问题。</p>
    <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px;">
        <a href="{{ route('ai-commerce.dashboard', ['tab' => 'runtime']) }}" style="display: inline-block; padding: 12px 20px; background: #111827; color: #fff; border-radius: 12px; text-decoration: none;">Runtime</a>
        <a href="{{ route('ai-commerce.dashboard', ['tab' => 'agents']) }}" style="display: inline-block; padding: 12px 20px; background: #047857; color: #fff; border-radius: 12px; text-decoration: none;">Agents</a>
        <a href="{{ route('ai-commerce.dashboard', ['tab' => 'traces']) }}" style="display: inline-block; padding: 12px 20px; background: #0c4a6e; color: #fff; border-radius: 12px; text-decoration: none;">Traces</a>
        <a href="{{ route('ai-commerce.dashboard', ['tab' => 'execute']) }}" style="display: inline-block; padding: 12px 20px; background: #7c2d12; color: #fff; border-radius: 12px; text-decoration: none;">Execute</a>
    </div>
@endsection
