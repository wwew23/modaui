@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">员工管理</h2>
                    </div>
                    <div class="col-auto ms-auto d-print-none">
                        <div class="btn-list">
                            <a href="{{ route('ai-multi-industry.employees.create') }}" class="btn btn-primary d-none d-sm-inline-block">
                                + 新增员工
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="page-body">
        <div class="container-xl">
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

            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="table-responsive">
                            <table class="table card-table table-vcenter">
                                <thead>
                                    <tr>
                                        <th>名称</th>
                                        <th>行业</th>
                                        <th>角色</th>
                                        <th>模型</th>
                                        <th>温度</th>
                                        <th>Token</th>
                                        <th>聊天数</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($employees as $employee)
                                        <tr>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    @if($employee->avatar_url)
                                                        <img src="{{ $employee->avatar_url }}" alt="{{ $employee->name }}" class="avatar me-2" style="width: 30px; height: 30px; border-radius: 50%;">
                                                    @endif
                                                    {{ $employee->name }}
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge" style="background-color: {{ $employee->industry->color ?? '#999' }}">
                                                    {{ $employee->industry->emoji ?? '' }} {{ $employee->industry->name }}
                                                </span>
                                            </td>
                                            <td>{{ $employee->role }}</td>
                                            <td><code>{{ $employee->model }}</code></td>
                                            <td>{{ $employee->temperature }}</td>
                                            <td><code>{{ $employee->max_tokens }}</code></td>
                                            <td>
                                                <span class="badge bg-purple">{{ $employee->chat_messages_count }}</span>
                                            </td>
                                            <td>
                                                @if($employee->enabled)
                                                    <span class="badge bg-success">启用</span>
                                                @else
                                                    <span class="badge bg-danger">禁用</span>
                                                @endif
                                            </td>
                                            <td>
                                                <div class="btn-list">
                                                    <a href="{{ route('ai-multi-industry.employees.edit', $employee->id) }}" class="btn btn-sm btn-icon btn-ghost-primary">
                                                        编辑
                                                    </a>
                                                    <form action="{{ route('ai-multi-industry.employees.destroy', $employee->id) }}" method="POST" style="display: inline;">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" class="btn btn-sm btn-icon btn-ghost-danger" onclick="return confirm('确实要删除吗？')">
                                                            删除
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="9" class="text-center text-muted py-4">
                                                暂无员工数据，<a href="{{ route('ai-multi-industry.employees.create') }}">创建第一个员工</a>
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    @if($employees->hasPages())
                        <div class="row mt-4">
                            <div class="col-12">
                                {{ $employees->links() }}
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection
