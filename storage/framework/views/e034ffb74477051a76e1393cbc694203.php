<?php $__env->startSection('content'); ?>
    <?php if (isset($component)) { $__componentOriginalc5e06ddc74706a8a30b3529d286e11fa = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc5e06ddc74706a8a30b3529d286e11fa = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '766be9a31b02d85b4410065d426a1ede::intro','data' => ['title' => trans('plugins/ecommerce::order.manage_orders'),'subtitle' => trans('plugins/ecommerce::order.order_intro_description'),'actionUrl' => route('orders.create'),'actionLabel' => trans('plugins/ecommerce::order.create_new_order')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('plugins-ecommerce::intro'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/ecommerce::order.manage_orders')),'subtitle' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/ecommerce::order.order_intro_description')),'action-url' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('orders.create')),'action-label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/ecommerce::order.create_new_order'))]); ?>
         <?php $__env->slot('icon', null, []); ?> 
            <?php if (isset($component)) { $__componentOriginala9983255947c858702b4b71234b2f274 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginala9983255947c858702b4b71234b2f274 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '766be9a31b02d85b4410065d426a1ede::empty-state','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('plugins-ecommerce::empty-state'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginala9983255947c858702b4b71234b2f274)): ?>
<?php $attributes = $__attributesOriginala9983255947c858702b4b71234b2f274; ?>
<?php unset($__attributesOriginala9983255947c858702b4b71234b2f274); ?>
<?php endif; ?>
<?php if (isset($__componentOriginala9983255947c858702b4b71234b2f274)): ?>
<?php $component = $__componentOriginala9983255947c858702b4b71234b2f274; ?>
<?php unset($__componentOriginala9983255947c858702b4b71234b2f274); ?>
<?php endif; ?>
         <?php $__env->endSlot(); ?>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc5e06ddc74706a8a30b3529d286e11fa)): ?>
<?php $attributes = $__attributesOriginalc5e06ddc74706a8a30b3529d286e11fa; ?>
<?php unset($__attributesOriginalc5e06ddc74706a8a30b3529d286e11fa); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc5e06ddc74706a8a30b3529d286e11fa)): ?>
<?php $component = $__componentOriginalc5e06ddc74706a8a30b3529d286e11fa; ?>
<?php unset($__componentOriginalc5e06ddc74706a8a30b3529d286e11fa); ?>
<?php endif; ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make(BaseHelper::getAdminMasterLayoutTemplate(), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ecommerce/resources/views/orders/intro.blade.php ENDPATH**/ ?>