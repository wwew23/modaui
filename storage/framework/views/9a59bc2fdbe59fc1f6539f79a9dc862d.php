<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title><?php echo $__env->yieldContent('title', '我的商城'); ?></title>
    <style>
        body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 1140px; margin: 40px auto; padding: 0 20px; }
        #ai-customer-widget { position: fixed; right: 20px; bottom: 20px; width: 340px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08); overflow: hidden; display: flex; flex-direction: column; z-index: 9999; }
        #ai-customer-header { background: #111827; color: #fff; padding: 14px 16px; font-weight: 700; }
        #ai-customer-messages { padding: 14px; min-height: 220px; max-height: 260px; overflow-y: auto; background: #f8fafc; }
        .ai-msg-user { text-align: right; margin-bottom: 10px; }
        .ai-msg-user span { display: inline-block; background: #111827; color: #fff; padding: 10px 12px; border-radius: 16px; max-width: 100%; }
        .ai-msg-bot { text-align: left; margin-bottom: 10px; }
        .ai-msg-bot span { display: inline-block; background: #fff; border: 1px solid #e5e7eb; color: #111827; padding: 10px 12px; border-radius: 16px; max-width: 100%; }
        #ai-customer-input { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 14px; background: #fff; }
        #ai-customer-input input { width: 100%; border: 1px solid #d1d5db; border-radius: 12px; padding: 10px 12px; }
        #ai-customer-input button { border: none; border-radius: 12px; background: #111827; color: #fff; padding: 0 18px; cursor: pointer; }
    </style>
    <?php echo $__env->yieldContent('head'); ?>
</head>
<body>
    <div class="container">
        <?php echo $__env->yieldContent('content'); ?>
    </div>

    <div id="ai-customer-widget">
        <div id="ai-customer-header">AI 导购助手</div>
        <div id="ai-customer-messages"></div>
        <div id="ai-customer-input">
            <input type="text" id="ai-customer-input-field" placeholder="请输入您的问题，例如：推荐一双跑步鞋" />
            <button id="ai-customer-send">发送</button>
        </div>
    </div>

    <script>
        window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    </script>
    <script src="<?php echo e(asset('js/ai-customer.js')); ?>"></script>
    <?php echo $__env->yieldContent('scripts'); ?>
</body>
</html>
<?php /**PATH /www/wwwroot/modaui.com/resources/views/layouts/app.blade.php ENDPATH**/ ?>