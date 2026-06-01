<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title><?php echo $__env->yieldContent('title', '运营后台'); ?></title>
    <style>
        body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; }
        header { background: #111827; color: #fff; padding: 18px 24px; }
        .admin-container { max-width: 1140px; margin: 24px auto; padding: 0 20px; }
    </style>
    <?php echo $__env->yieldContent('head'); ?>
</head>
<body class="<?php echo e(request()->has('embedded') ? 'is-embedded' : ''); ?>">
    <?php if(!request()->has('embedded')): ?>
    <header>
        <h1><?php echo $__env->yieldContent('title', '运营后台'); ?></h1>
    </header>
    <?php endif; ?>
    <div class="admin-container" style="<?php echo e(request()->has('embedded') ? 'margin: 0; padding: 10px; max-width: 100%;' : ''); ?>">
        <?php echo $__env->yieldContent('content'); ?>
    </div>

    <script>
        window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    </script>
    
    <?php echo $__env->yieldContent('scripts'); ?>
</body>
</html>
<?php /**PATH /www/wwwroot/modaui.com/resources/views/layouts/admin.blade.php ENDPATH**/ ?>