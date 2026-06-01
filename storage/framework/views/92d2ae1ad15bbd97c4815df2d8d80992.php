<ul class="breadcrumb">
    <?php $__currentLoopData = $crumbs = Theme::breadcrumb()->getCrumbs(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $crumb): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <?php if(! $loop->last): ?>
            <li>
                <a href="<?php echo e($crumb['url']); ?>" itemprop="item"><?php echo BaseHelper::clean($crumb['label']); ?></a>
                <span class="extra-breadcrumb-name"></span>
            </li>
        <?php else: ?>
            <li aria-current="page">
                <span><?php echo BaseHelper::clean($crumb['label']); ?></span>
            </li>
        <?php endif; ?>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</ul>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury (b/partials/breadcrumbs.blade.php ENDPATH**/ ?>