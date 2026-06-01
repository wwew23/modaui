@extends(BaseHelper::getAdminMasterLayoutTemplate())

@section('content')
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            {{ isset($industry) ? '编辑行业' : '创建行业' }}
                        </h2>
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

                            <form method="POST" action="{{ isset($industry) ? route('ai-multi-industry.industries.update', $industry->id) : route('ai-multi-industry.industries.store') }}" enctype="multipart/form-data">
                                @csrf
                                @if(isset($industry))
                                    @method('PUT')
                                @endif

                                <div class="mb-3">
                                    <label class="form-label">行业名称 *</label>
                                    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $industry->name ?? '') }}" required>
                                    @error('name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Slug *</label>
                                    <input type="text" name="slug" class="form-control @error('slug') is-invalid @enderror" value="{{ old('slug', $industry->slug ?? '') }}" placeholder="auto-generated">
                                    @error('slug')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <small class="form-hint">用于 URL 中的唯一标识符</small>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">表情符号</label>
                                        <input type="text" name="emoji" class="form-control @error('emoji') is-invalid @enderror" value="{{ old('emoji', $industry->emoji ?? '') }}" maxlength="10" placeholder="例如：👗">
                                        @error('emoji')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">颜色</label>
                                        <div class="input-group">
                                            <input type="color" name="color" class="form-control form-control-color @error('color') is-invalid @enderror" value="{{ old('color', $industry->color ?? '#E91E63') }}" style="max-width: 60px;">
                                            <input type="text" class="form-control @error('color') is-invalid @enderror" value="{{ old('color', $industry->color ?? '#E91E63') }}" readonly>
                                        </div>
                                        @error('color')
                                            <div class="invalid-feedback">{{ $message }}</div>
                                        @enderror
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">描述</label>
                                    <textarea name="description" class="form-control @error('description') is-invalid @enderror" rows="4">{{ old('description', $industry->description ?? '') }}</textarea>
                                    @error('description')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">排序</label>
                                    <input type="number" name="sort_order" class="form-control @error('sort_order') is-invalid @enderror" value="{{ old('sort_order', $industry->sort_order ?? 0) }}" min="0">
                                    @error('sort_order')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="mb-3">
                                    <label class="form-check">
                                        <input type="checkbox" name="enabled" class="form-check-input" value="1" {{ old('enabled', $industry->enabled ?? true) ? 'checked' : '' }}>
                                        <span class="form-check-label">启用</span>
                                    </label>
                                </div>

                                <div class="form-footer">
                                    <a href="{{ route('ai-multi-industry.industries.index') }}" class="btn btn-link">取消</a>
                                    <button type="submit" class="btn btn-primary">{{ isset($industry) ? '更新行业' : '创建行业' }}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">预设行业</h3>
                        </div>
                        <div class="list-group list-group-flush">
                            <div class="list-group-item">
                                <div class="row align-items-center">
                                    <div class="col-auto"><span style="font-size: 2rem;">👗</span></div>
                                    <div class="col"><strong>服装</strong></div>
                                </div>
                            </div>
                            <div class="list-group-item">
                                <div class="row align-items-center">
                                    <div class="col-auto"><span style="font-size: 2rem;">🍜</span></div>
                                    <div class="col"><strong>餐饮</strong></div>
                                </div>
                            </div>
                            <div class="list-group-item">
                                <div class="row align-items-center">
                                    <div class="col-auto"><span style="font-size: 2rem;">🏪</span></div>
                                    <div class="col"><strong>零售</strong></div>
                                </div>
                            </div>
                            <div class="list-group-item">
                                <div class="row align-items-center">
                                    <div class="col-auto"><span style="font-size: 2rem;">💄</span></div>
                                    <div class="col"><strong>美业</strong></div>
                                </div>
                            </div>
                            <div class="list-group-item">
                                <div class="row align-items-center">
                                    <div class="col-auto"><span style="font-size: 2rem;">🏨</span></div>
                                    <div class="col"><strong>酒店</strong></div>
                                </div>
                            </div>
                            <div class="list-group-item">
                                <div class="row align-items-center">
                                    <div class="col-auto"><span style="font-size: 2rem;">🚗</span></div>
                                    <div class="col"><strong>汽车</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
