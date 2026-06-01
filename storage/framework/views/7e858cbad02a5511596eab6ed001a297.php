<ul <?php echo $options; ?>>
    <?php $__currentLoopData = $menu_nodes; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <li class="<?php echo \Illuminate\Support\Arr::toCssClasses([
            $row->css_class => $row->css_class,
            'current' => $row->active,
        ]); ?>">
            <a
                href="<?php echo e(url($row->url)); ?>"
                title="<?php echo e($row->title); ?>"
                <?php if($row->target !== '_self'): ?> target="<?php echo e($row->target); ?>" <?php endif; ?>
            >
                <?php echo $row->icon_html; ?>

                <span class="menu-title"><?php echo BaseHelper::clean($row->title); ?></span>
            </a>
            <?php if($row->has_child): ?>
                <?php echo Menu::generateMenu([
                    'menu' => $menu,
                    'menu_nodes' => $row->child,
                ]); ?>

            <?php endif; ?>
        </li>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</ul>
<?php /**PATH /www/wwwroot/modaui.com/platform/packages/menu/resources/views/partials/default.blade.php ENDPATH**/ ?>