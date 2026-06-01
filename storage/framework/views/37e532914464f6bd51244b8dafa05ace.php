<?php $__env->startSection('title', trans('packages/theme::theme.errors.500_internal_server_error')); ?>

<?php $__env->startSection('content'); ?>
    <div class="empty">
        <div class="empty-header">500</div>
        <p class="empty-title"><?php echo e(trans('packages/theme::theme.errors.internal_server_error')); ?></p>
        <p class="empty-subtitle text-secondary">
            <?php echo e(trans('packages/theme::theme.errors.internal_server_error_description')); ?>

        </p>

        <p class="empty-subtitle text-secondary"><?php echo BaseHelper::clean(
            trans('packages/theme::theme.errors.page_not_found_back_home', ['link' => BaseHelper::getHomepageUrl()]),
        ); ?></p>

        <div class="empty-action">
            <?php if (isset($component)) { $__componentOriginal922f7d3260a518f4cf606eecf9669dcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['tag' => 'a','href' => ''.e(BaseHelper::getHomepageUrl()).'','color' => 'primary','icon' => 'ti ti-arrow-left']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['tag' => 'a','href' => ''.e(BaseHelper::getHomepageUrl()).'','color' => 'primary','icon' => 'ti ti-arrow-left']); ?>
                <?php echo e(trans('packages/theme::theme.common.take_me_home')); ?>

             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal922f7d3260a518f4cf606eecf9669dcb)): ?>
<?php $attributes = $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb; ?>
<?php unset($__attributesOriginal922f7d3260a518f4cf606eecf9669dcb); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal922f7d3260a518f4cf606eecf9669dcb)): ?>
<?php $component = $__componentOriginal922f7d3260a518f4cf606eecf9669dcb; ?>
<?php unset($__componentOriginal922f7d3260a518f4cf606eecf9669dcb); ?>
<?php endif; ?>
        </div>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('packages/theme::errors.master', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/packages/theme/resources/views/errors/500.blade.php ENDPATH**/ ?>