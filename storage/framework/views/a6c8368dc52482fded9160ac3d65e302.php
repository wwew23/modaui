<?php if($socialLinks = Theme::getSocialLinks()): ?>
    <ul class="ps-list--social">
        <?php $__currentLoopData = $socialLinks; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $socialLink): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php if(! $socialLink->getUrl() || ! $socialLink->getIconHtml()) continue; ?>

            <li>
                <a <?php echo $socialLink->getAttributes(); ?>><?php echo e($socialLink->getIconHtml()); ?></a>
            </li>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </ul>
<?php endif; ?>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury/partials/social-links.blade.php ENDPATH**/ ?>