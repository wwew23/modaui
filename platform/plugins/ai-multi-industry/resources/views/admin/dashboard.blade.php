@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="max-w-7xl mx-auto py-8">
        <h1 class="text-2xl font-semibold mb-4">AI 多行业团队运营中心</h1>
        <p class="text-sm text-muted mb-6">这里展示 AI 多行业团队插件的概览和运营入口。</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card p-6">
                <h2 class="font-semibold mb-2">行业管理</h2>
                <p>管理 6 个行业及其专属 AI 员工。</p>
            </div>
            <div class="card p-6">
                <h2 class="font-semibold mb-2">员工配置</h2>
                <p>创建 AI 员工并定义系统提示词、模型、角色与能力。</p>
            </div>
            <div class="card p-6">
                <h2 class="font-semibold mb-2">聊天配置</h2>
                <p>配置 AI 聊天相关参数并定制用户体验。</p>
            </div>
            <div class="card p-6">
                <h2 class="font-semibold mb-2">接口使用</h2>
                <p>通过 API 调用 AI 聊天和行业员工路由。</p>
            </div>
        </div>
    </div>
@endsection
