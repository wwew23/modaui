@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">聊天记录</h2>
                    </div>
                    <div class="col-auto ms-auto d-print-none">
                        <div class="btn-list">
                            <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#exportModal">
                                导出
                            </button>
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
                            <form method="GET" action="{{ route('ai-multi-industry.chat-history.index') }}" class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label">行业</label>
                                    <select name="industry_id" class="form-control">
                                        <option value="">全部</option>
                                        @foreach($industries as $industry)
                                            <option value="{{ $industry->id }}" {{ request('industry_id') == $industry->id ? 'selected' : '' }}>
                                                {{ $industry->emoji }} {{ $industry->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">员工</label>
                                    <select name="employee_id" class="form-control">
                                        <option value="">全部</option>
                                        @foreach($employees as $employee)
                                            <option value="{{ $employee->id }}" {{ request('employee_id') == $employee->id ? 'selected' : '' }}>
                                                {{ $employee->name }} ({{ $employee->industry->name }})
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">开始日期</label>
                                    <input type="date" name="start_date" class="form-control" value="{{ request('start_date') }}">
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">结束日期</label>
                                    <input type="date" name="end_date" class="form-control" value="{{ request('end_date') }}">
                                </div>
                                <div class="col-md-2 d-flex align-items-end">
                                    <button type="submit" class="btn btn-primary w-100">查询</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="table-responsive">
                            <table class="table card-table table-vcenter">
                                <thead>
                                    <tr>
                                        <th>会话ID</th>
                                        <th>行业</th>
                                        <th>员工</th>
                                        <th>商户</th>
                                        <th>消息数</th>
                                        <th>开始时间</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($sessions as $session)
                                        <tr>
                                            <td><code>{{ Str::limit($session->session_token, 10) }}</code></td>
                                            <td>{{ $session->industry->emoji }} {{ $session->industry->name }}</td>
                                            <td>{{ $session->employee->name }} ({{ $session->employee->role }})</td>
                                            <td>{{ $session->merchant_id ?? '-' }}</td>
                                            <td>
                                                <span class="badge bg-blue">{{ $session->total_messages }}</span>
                                            </td>
                                            <td>{{ $session->started_at->format('Y-m-d H:i:s') }}</td>
                                            <td>
                                                @if($session->isActive())
                                                    <span class="badge bg-success">活跃</span>
                                                @else
                                                    <span class="badge bg-secondary">已关闭</span>
                                                @endif
                                            </td>
                                            <td>
                                                <a href="{{ route('ai-multi-industry.chat-history.show', $session->id) }}" class="btn btn-sm btn-icon btn-ghost-primary">
                                                    查看
                                                </a>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="8" class="text-center text-muted py-4">
                                                暂无聊天记录
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    @if($sessions->hasPages())
                        <div class="row mt-4">
                            <div class="col-12">
                                {{ $sessions->links() }}
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- 导出模态框 -->
    <div class="modal modal-blur fade" id="exportModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="modal-header">
                    <h5 class="modal-title">导出聊天记录</h5>
                </div>
                <form method="POST" action="{{ route('ai-multi-industry.chat-history.export') }}">
                    @csrf
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">导出格式</label>
                            <div class="space-y-2">
                                <label class="form-check">
                                    <input type="radio" class="form-check-input" name="format" value="csv" checked>
                                    <span class="form-check-label">CSV 格式</span>
                                </label>
                                <label class="form-check">
                                    <input type="radio" class="form-check-input" name="format" value="json">
                                    <span class="form-check-label">JSON 格式</span>
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">开始日期</label>
                            <input type="date" name="start_date" class="form-control">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">结束日期</label>
                            <input type="date" name="end_date" class="form-control">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-link" data-bs-dismiss="modal">取消</button>
                        <button type="submit" class="btn btn-primary">导出</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
