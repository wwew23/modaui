<?php if(is_plugin_active('ecommerce')): ?>
    <div>
        <p>
            <?php if($config['name']): ?>
                <strong><?php echo e($config['name']); ?>:</strong>
            <?php endif; ?>

            <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <a
                    href="<?php echo e($category->url); ?>"
                    title="<?php echo e($category->name); ?>"
                ><?php echo e($category->name); ?></a>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </p>
    </div>
<?php endif; ?>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury/////widgets/product-categories/templates/frontend.blade.php ENDPATH**/ ?>