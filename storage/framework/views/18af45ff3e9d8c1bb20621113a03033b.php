<?php $__env->startSection('title', '运营仪表盘'); ?>

<?php $__env->startSection('content'); ?>
    <h2>运营总览</h2>
    <p>这是一个示例后台运营面板。右下角是 AI 运营助手，可以询问销售、商品表现、客户分析等问题。</p>
    <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px;">
        <a href="<?php echo e(route('ai-commerce.dashboard', ['tab' => 'runtime'])); ?>" style="display: inline-block; padding: 12px 20px; background: #111827; color: #fff; border-radius: 12px; text-decoration: none;">Runtime</a>
        <a href="<?php echo e(route('ai-commerce.dashboard', ['tab' => 'agents'])); ?>" style="display: inline-block; padding: 12px 20px; background: #047857; color: #fff; border-radius: 12px; text-decoration: none;">Agents</a>
        <a href="<?php echo e(route('ai-commerce.dashboard', ['tab' => 'traces'])); ?>" style="display: inline-block; padding: 12px 20px; background: #0c4a6e; color: #fff; border-radius: 12px; text-decoration: none;">Traces</a>
        <a href="<?php echo e(route('ai-commerce.dashboard', ['tab' => 'execute'])); ?>" style="display: inline-block; padding: 12px 20px; background: #7c2d12; color: #fff; border-radius: 12px; text-decoration: none;">Execute</a>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/resources/views/admin/dashboard.blade.php ENDPATH**/ ?>