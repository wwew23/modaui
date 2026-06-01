@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">新增员工</h2>
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

                            <form method="POST" action="{{ route('ai-multi-industry.employees.store') }}">
                                @csrf

                                <div class="mb-3">
                                    <label class="form-label">行业 *</label>
                                    <select name="industry_id" class="form-control @error('industry_id') is-invalid @enderror" required>
                                        <option value="">-- 请选择 --</option>
                                        @foreach($industries as $industry)
                                            <option value="{{ $industry->id }}" {{ old('industry_id') == $industry->id ? 'selected' : '' }}>
                                                {{ $industry->emoji }} {{ $industry->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('industry_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">名称 *</label>
                                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name') }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">角色 *</label>
                                    <input type="text" name="role" class="form-control @error('role') is-invalid @enderror" value="{{ old('role') }}" placeholder="例如：设计师" required>
                                    @error('role')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">头像 URL</label>
                                    <input type="url" name="avatar_url" class="form-control @error('avatar_url') is-invalid @enderror" value="{{ old('avatar_url') }}">
                                    @error('avatar_url')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">系统提示词</label>
                                    <textarea name="system_prompt" class="form-control @error('system_prompt') is-invalid @enderror" rows="6" placeholder="你是一个专业的...">{{ old('system_prompt') }}</textarea>
                                    @error('system_prompt')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">模型</label>
                                    <input type="text" name="model" class="form-control @error('model') is-invalid @enderror" value="{{ old('model', 'gpt-4') }}" placeholder="gpt-4">
                                    @error('model')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">温度 (0-2)</label>
                                        <input type="number" name="temperature" class="form-control @error('temperature') is-invalid @enderror" value="{{ old('temperature', 0.7) }}" min="0" max="2" step="0.1">
                                        @error('temperature')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                        <small class="form-hint">数值越高，回复越创意</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">最大Token数</label>
                                        <input type="number" name="max_tokens" class="form-control @error('max_tokens') is-invalid @enderror" value="{{ old('max_tokens', 2048) }}" min="100" max="8000">
                                        @error('max_tokens')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">排序</label>
                                    <input type="number" name="sort_order" class="form-control @error('sort_order') is-invalid @enderror" value="{{ old('sort_order', 0) }}" min="0">
                                    @error('sort_order')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-check">
                                        <input type="checkbox" name="enabled" class="form-check-input" value="1" {{ old('enabled', true) ? 'checked' : '' }}>
                                        <span class="form-check-label">启用</span>
                                    </label>
                                </div>

                                <div class="form-footer">
                                    <a href="{{ route('ai-multi-industry.employees.index') }}" class="btn btn-link">取消</a>
                                    <button type="submit" class="btn btn-primary">创建员工</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
