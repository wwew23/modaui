@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">聊天配置</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">
            <div class="row row-cards">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            @if ($errors->any())
                                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                    <div class="d-flex">
                                        <div>
                                            <h4 class="alert-title">错误</h4>
                                            <ul class="mb-0">
                                                @foreach ($errors->all() as $error)
                                                    <li>{{ $error }}</li>
                                                @endforeach
                                            </ul>
                                        </div>
                                    </div>
                                    <a class="btn-close" data-bs-dismiss="alert" aria-label="Close"></a>
                                </div>
                            @endif

                            @if (session('success'))
                                <div class="alert alert-success alert-dismissible fade show" role="alert">
                                    {{ session('success') }}
                                    <a class="btn-close" data-bs-dismiss="alert" aria-label="Close"></a>
                                </div>
                            @endif

                            <form method="POST" action="{{ route('ai-multi-industry.chat-config.update') }}">
                                @csrf

                                <div class="mb-3">
                                    <label class="form-label">默认模型</label>
                                    <input type="text" name="default_model" class="form-control" value="{{ $config['default_model'] ?? 'gpt-4' }}" placeholder="gpt-4">
                                    <small class="form-hint">默认使用的 AI 模型</small>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">温度 (0-2)</label>
                                        <input type="number" name="temperature" class="form-control" value="{{ $config['temperature'] ?? 0.7 }}" min="0" max="2" step="0.1">
                                        <small class="form-hint">数值越高，回复越创意</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">最大Token数</label>
                                        <input type="number" name="max_tokens" class="form-control" value="{{ $config['max_tokens'] ?? 2048 }}" min="100" max="8000">
                                        <small class="form-hint">单次回复的最大长度</small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">欢迎消息</label>
                                    <textarea name="welcome_message" class="form-control" rows="4">{{ $config['welcome_message'] ?? '您好！我是多行业 AI 助手，很高兴为您服务。' }}</textarea>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">会话有效期 (小时)</label>
                                    <input type="number" name="max_session_hours" class="form-control" value="{{ $config['max_session_hours'] ?? 24 }}" min="1" max="720">
                                </div>

                                <div class="mb-3">
                                    <label class="form-check">
                                        <input type="checkbox" name="enable_chat_history" class="form-check-input" value="1" {{ ($config['enable_chat_history'] ?? true) ? 'checked' : '' }}>
                                        <span class="form-check-label">启用聊天历史记录</span>
                                    </label>
                                </div>

                                <div class="mb-3">
                                    <label class="form-check">
                                        <input type="checkbox" name="enable_export" class="form-check-input" value="1" {{ ($config['enable_export'] ?? true) ? 'checked' : '' }}>
                                        <span class="form-check-label">启用聊天记录导出</span>
                                    </label>
                                </div>

                                <div class="form-footer">
                                    <button type="submit" class="btn btn-primary">保存配置</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">配置说明</h3>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong>温度说明：</strong>
                                <ul class="text-sm text-muted mb-0">
                                    <li>0 = 确定性最高，最保守</li>
                                    <li>1 = 平衡</li>
                                    <li>2 = 创意最高，最随机</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Token 说明：</strong>
                                <ul class="text-sm text-muted">
                                    <li>1 Token ≈ 4 个字符</li>
                                    <li>2048 = 约 8192 字符</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
