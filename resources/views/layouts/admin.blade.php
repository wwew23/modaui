<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', '运营后台')</title>
    <style>
        body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; }
        header { background: #111827; color: #fff; padding: 18px 24px; }
        .admin-container { max-width: 1140px; margin: 24px auto; padding: 0 20px; }
    </style>
    @yield('head')
</head>
<body class="{{ request()->has('embedded') ? 'is-embedded' : '' }}">
    @if(!request()->has('embedded'))
    <header>
        <h1>@yield('title', '运营后台')</h1>
    </header>
    @endif
    <div class="admin-container" style="{{ request()->has('embedded') ? 'margin: 0; padding: 10px; max-width: 100%;' : '' }}">
        @yield('content')
    </div>

    <script>
        window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    </script>
    
    @yield('scripts')
</body>
</html>
