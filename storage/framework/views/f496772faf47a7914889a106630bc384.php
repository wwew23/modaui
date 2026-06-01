<?php $__env->startPush('header-action'); ?>
    <div class="d-flex gap-2">
        <?php if (isset($component)) { $__componentOriginal922f7d3260a518f4cf606eecf9669dcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['type' => 'button','color' => 'secondary','outlined' => true,'dataBsToggle' => 'modal','dataBsTarget' => '#widget-config-modal','icon' => 'ti ti-settings']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'button','color' => 'secondary','outlined' => true,'data-bs-toggle' => 'modal','data-bs-target' => '#widget-config-modal','icon' => 'ti ti-settings']); ?>
            <?php echo e(trans('plugins/ecommerce::reports.configure_widgets')); ?>

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

        <?php if (isset($component)) { $__componentOriginal922f7d3260a518f4cf606eecf9669dcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['type' => 'button','color' => 'primary','outlined' => true,'class' => 'date-range-picker','dataFormatValue' => ''.e(trans('plugins/ecommerce::reports.date_range_format_value', ['from' => '__from__', 'to' => '__to__'])).'','dataFormat' => ''.e(Str::upper(config('core.base.general.date_format.js.date'))).'','dataHref' => ''.e(route('ecommerce.report.index')).'','dataStartDate' => ''.e($startDate).'','dataEndDate' => ''.e($endDate).'','icon' => 'ti ti-calendar']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'button','color' => 'primary','outlined' => true,'class' => 'date-range-picker','data-format-value' => ''.e(trans('plugins/ecommerce::reports.date_range_format_value', ['from' => '__from__', 'to' => '__to__'])).'','data-format' => ''.e(Str::upper(config('core.base.general.date_format.js.date'))).'','data-href' => ''.e(route('ecommerce.report.index')).'','data-start-date' => ''.e($startDate).'','data-end-date' => ''.e($endDate).'','icon' => 'ti ti-calendar']); ?>
            <?php echo e(trans('plugins/ecommerce::reports.date_range_format_value', [
                'from' => BaseHelper::formatDate($startDate),
                'to' => BaseHelper::formatDate($endDate),
            ])); ?>

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
<?php $__env->stopPush(); ?>

<?php $__env->startSection('content'); ?>
    <div id="report-stats-content">
        <?php echo $__env->make('plugins/ecommerce::reports.ajax', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    </div>
    <?php echo $__env->make('plugins/ecommerce::reports.partials.widget-config-modal', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('footer'); ?>
    <script>
        var BotbleVariables = BotbleVariables || {};
        BotbleVariables.languages = BotbleVariables.languages || {};
        BotbleVariables.languages.reports = <?php echo json_encode(trans('plugins/ecommerce::reports.ranges'), JSON_HEX_APOS); ?>

    </script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make(BaseHelper::getAdminMasterLayoutTemplate(), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ecommerce/resources/views/reports/index.blade.php ENDPATH**/ ?>