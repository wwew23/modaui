@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            行业管理
                        </h2>
                    </div>
                    <div class="col-auto ms-auto d-print-none">
                        <div class="btn-list">
                            <a href="{{ route('ai-multi-industry.industries.create') }}" class="btn btn-primary d-none d-sm-inline-block">
                                + 新增行业
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class=\"page-body\">
        <div class=\"container-xl\">
            @if ($errors->any())
                <div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">
                    <div class=\"d-flex\">
                        <div>
                            <h4 class=\"alert-title\">错误</h4>
                            <ul class=\"mb-0\">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                    <a class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></a>
                </div>
            @endif

            @if (session('success'))
                <div class=\"alert alert-success alert-dismissible fade show\" role=\"alert\">
                    {{ session('success') }}
                    <a class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></a>
                </div>
            @endif

            <div class=\"row row-cards\">
                <div class=\"col-12\">
                    <div class=\"card\">
                        <div class=\"table-responsive\">
                            <table class=\"table card-table table-vcenter\">
                                <thead>
                                    <tr>
                                        <th>名称</th>
                                        <th>Slug</th>
                                        <th>表情</th>
                                        <th>描述</th>
                                        <th>员工数</th>
                                        <th>聊天数</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($industries as $industry)
                                        <tr>
                                            <td>{{ $industry->name }}</td>
                                            <td><code>{{ $industry->slug }}</code></td>
                                            <td class=\"text-lg\">{{ $industry->emoji }}</td>
                                            <td>{{ Str::limit($industry->description, 50) }}</td>
                                            <td>
                                                <span class=\"badge bg-blue\">{{ $industry->employees_count }}</span>
                                            </td>
                                            <td>
                                                <span class=\"badge bg-purple\">{{ $industry->chat_messages_count }}</span>
                                            </td>
                                            <td>
                                                @if($industry->enabled)
                                                    <span class=\"badge bg-success\">启用</span>
                                                @else
                                                    <span class=\"badge bg-danger\">禁用</span>
                                                @endif
                                            </td>
                                            <td>
                                                <div class=\"btn-list\">
                                                    <a href=\"{{ route('ai-multi-industry.industries.edit', $industry->id) }}\" class=\"btn btn-sm btn-icon btn-ghost-primary\">
                                                        编辑
                                                    </a>
                                                    <form action=\"{{ route('ai-multi-industry.industries.destroy', $industry->id) }}\" method=\"POST\" style=\"display: inline;\">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type=\"submit\" class=\"btn btn-sm btn-icon btn-ghost-danger\" onclick=\"return confirm('确实要删除吗？')\">
                                                            删除
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan=\"8\" class=\"text-center text-muted py-4\">
                                                暂无行业数据，<a href=\"{{ route('ai-multi-industry.industries.create') }}\">创建第一个行业</a>
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    @if($industries->hasPages())
                        <div class=\"row mt-4\">
                            <div class=\"col-12\">
                                {{ $industries->links() }}
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection
