@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">聊天记录详情</h2>
                    </div>
                    <div class="col-auto ms-auto d-print-none">
                        <div class="btn-list">
                            <a href="{{ route('ai-multi-industry.chat-history.index') }}" class="btn btn-secondary">
                                返回列表
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">
            <div class="row row-cards mb-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div>
                                        <strong class="text-muted">行业</strong>
                                        <div class="mt-2">
                                            {{ $session->industry->emoji }} {{ $session->industry->name }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div>
                                        <strong class="text-muted">员工</strong>
                                        <div class="mt-2">
                                            {{ $session->employee->name }} ({{ $session->employee->role }})
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div>
                                        <strong class="text-muted">商户</strong>
                                        <div class="mt-2">
                                            {{ $session->merchant_id ?? '-' }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div>
                                        <strong class="text-muted">状态</strong>
                                        <div class="mt-2">
                                            @if($session->isActive())
                                                <span class="badge bg-success">活跃</span>
                                            @else
                                                <span class="badge bg-secondary">已关闭</span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row row-cards">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">消息记录 ({{ $messages->count() }})</h3>
                        </div>
                        <div class="card-body" style="max-height: 600px; overflow-y: auto;">
                            <div class="space-y-4">
                                @forelse($messages as $message)
                                    <div class="d-flex gap-2 {{ $message->role === 'user' ? 'justify-content-end' : '' }}">
                                        <div class="p-3 rounded {{ $message->role === 'user' ? 'bg-blue text-white' : 'bg-light' }}" style="max-width: 80%;">
                                            <div class="small text-uppercase mb-1">
                                                @if($message->role === 'user')
                                                    <strong>用户</strong>
                                                @else
                                                    <strong>{{ $message->employee?->name ?? 'AI' }}</strong>
                                                @endif
                                            </div>
                                            <div class="text-break">
                                                {{ $message->role === 'user' ? $message->user_message : $message->ai_response }}
                                            </div>
                                            <div class="small mt-2 {{ $message->role === 'user' ? 'text-white-50' : 'text-muted' }}">
                                                {{ $message->created_at->format('H:i:s') }}
                                            </div>
                                        </div>
                                    </div>
                                @empty
                                    <div class="text-center text-muted py-8">
                                        暂无消息记录
                                    </div>
                                @endforelse
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">统计信息</h3>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label text-muted">总消息数</label>
                                <p class="h3">{{ $session->total_messages }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted">使用 Token 数</label>
                                <p class="h3">{{ $session->total_tokens }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted">开始时间</label>
                                <p>{{ $session->started_at->format('Y-m-d H:i:s') }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted">结束时间</label>
                                <p>
                                    @if($session->ended_at)
                                        {{ $session->ended_at->format('Y-m-d H:i:s') }}
                                    @else
                                        <span class="badge bg-success">进行中</span>
                                    @endif
                                </p>
                            </div>
                            <div>
                                <label class="form-label text-muted">会话 Token</label>
                                <p><code class="text-break">{{ $session->session_token }}</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
