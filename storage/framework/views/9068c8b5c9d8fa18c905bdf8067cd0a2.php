<?php $__env->startSection('title', 'AI 运营助手'); ?>

<?php $__env->startSection('content'); ?>
    <?php if(request()->has('embedded')): ?>
        <div id="ai-embedded-chat" style="height: calc(100vh - 40px); display: flex; flex-direction: column; background: #fff; border-radius: 12px; overflow: hidden;">
            <div id="ai-merchant-messages" style="flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc;"></div>
            <div id="ai-merchant-input" style="display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 20px; border-top: 1px solid #e5e7eb;">
                <input type="text" id="ai-merchant-input-field" placeholder="请输入运营问题..." style="width: 100%; border: 1px solid #d1d5db; border-radius: 12px; padding: 12px;" />
                <button id="ai-merchant-send" style="border: none; border-radius: 12px; background: #111827; color: #fff; padding: 0 24px; cursor: pointer; font-weight: 600;">发送</button>
            </div>
        </div>
    <?php else: ?>
        <div style="padding: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
            <h2>AI 运营助手</h2>
            <p>右下角是本地 AI 运营助手。你可以直接问：“最近30天销售情况如何？”、“现在最热的热销商品有哪些？”等。</p>
            <div style="margin-top: 20px;">
                <a href="<?php echo e(route('ai-commerce.dashboard')); ?>" style="display: inline-block; padding: 12px 20px; background: #111827; color: #fff; border-radius: 12px; text-decoration: none;">前往 AI 智能中心</a>
            </div>
        </div>
    <?php endif; ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/resources/views/admin/ai-assistant.blade.php ENDPATH**/ ?>