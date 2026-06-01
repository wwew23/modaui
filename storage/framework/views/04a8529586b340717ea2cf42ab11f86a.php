<?php $__env->startPush('header'); ?>
    <?php echo RvMedia::renderHeader(); ?>

<?php $__env->stopPush(); ?>

<?php $__env->startSection('content'); ?>
    <?php echo RvMedia::renderContent(); ?>

<?php $__env->stopSection(); ?>

<?php $__env->startPush('footer'); ?>
    <?php echo RvMedia::renderFooter(); ?>

<?php $__env->stopPush(); ?>

<?php echo $__env->make(BaseHelper::getAdminMasterLayoutTemplate(), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/core/media/resources/views/index.blade.php ENDPATH**/ ?>