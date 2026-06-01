<tr data-id="<?php echo e($item->lang_id); ?>">
    <td>
        <a
            href="javascript:void(0);"
            class="gap-2 edit-language-button d-flex align-items-center text-decoration-none"
            data-id="<?php echo e($item->lang_id); ?>"
            data-url="<?php echo e(route('languages.get', ['lang_id' => $item->lang_id])); ?>"
            data-bs-original-title="<?php echo e(trans('plugins/language::language.edit_tooltip')); ?>"
            data-bs-toggle="tooltip"
        >
            <?php echo language_flag($item->lang_flag, $item->lang_name); ?>

            <?php echo e($item->lang_name); ?>

        </a>
    </td>
    <td><?php echo e($item->lang_locale); ?></td>
    <td><?php echo e($item->lang_code); ?></td>
    <td>
        <?php if($item->lang_is_default): ?>
            <?php if (isset($component)) { $__componentOriginal73995948b3bd877b76251b40caf28170 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal73995948b3bd877b76251b40caf28170 = $attributes; } ?>
<?php $component = Botble\Icon\View\Components\Icon::resolve(['name' => 'ti ti-star-filled'] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Botble\Icon\View\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-yellow','data-id' => ''.e($item->lang_id).'','data-name' => ''.e($item->lang_name).'']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal73995948b3bd877b76251b40caf28170)): ?>
<?php $attributes = $__attributesOriginal73995948b3bd877b76251b40caf28170; ?>
<?php unset($__attributesOriginal73995948b3bd877b76251b40caf28170); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal73995948b3bd877b76251b40caf28170)): ?>
<?php $component = $__componentOriginal73995948b3bd877b76251b40caf28170; ?>
<?php unset($__componentOriginal73995948b3bd877b76251b40caf28170); ?>
<?php endif; ?>
        <?php else: ?>
            <a
                href="javascript:void(0);"
                data-section="<?php echo e(route('languages.set.default')); ?>?lang_id=<?php echo e($item->lang_id); ?>"
                class="text-decoration-none set-language-default"
                data-bs-toggle="tooltip"
                data-bs-original-title="<?php echo e(trans('plugins/language::language.choose_default_language', ['language' => $item->lang_name])); ?>"
            >
                <?php if (isset($component)) { $__componentOriginal73995948b3bd877b76251b40caf28170 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal73995948b3bd877b76251b40caf28170 = $attributes; } ?>
<?php $component = Botble\Icon\View\Components\Icon::resolve(['name' => 'ti ti-star-filled'] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Botble\Icon\View\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['data-id' => ''.e($item->lang_id).'','data-name' => ''.e($item->lang_name).'']); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal73995948b3bd877b76251b40caf28170)): ?>
<?php $attributes = $__attributesOriginal73995948b3bd877b76251b40caf28170; ?>
<?php unset($__attributesOriginal73995948b3bd877b76251b40caf28170); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal73995948b3bd877b76251b40caf28170)): ?>
<?php $component = $__componentOriginal73995948b3bd877b76251b40caf28170; ?>
<?php unset($__componentOriginal73995948b3bd877b76251b40caf28170); ?>
<?php endif; ?>
            </a>
        <?php endif; ?>
    </td>
    <td><?php echo e($item->lang_order); ?></td>
    <td>
        <?php if (isset($component)) { $__componentOriginal922f7d3260a518f4cf606eecf9669dcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['color' => 'primary','icon' => 'ti ti-edit','iconOnly' => true,'dataId' => $item->lang_id,'dataUrl' => route('languages.get', ['lang_id' => $item->lang_id]),'tooltip' => trans('plugins/language::language.edit_tooltip'),'size' => 'sm','class' => 'edit-language-button']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['color' => 'primary','icon' => 'ti ti-edit','icon-only' => true,'data-id' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($item->lang_id),'data-url' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(route('languages.get', ['lang_id' => $item->lang_id])),'tooltip' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/language::language.edit_tooltip')),'size' => 'sm','class' => 'edit-language-button']); ?>
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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['color' => 'danger','icon' => 'ti ti-trash','iconOnly' => true,'tooltip' => trans('plugins/language::language.delete_tooltip'),'size' => 'sm','class' => 'deleteDialog','dataSection' => ''.e(route('languages.destroy', $item->lang_id)).'']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['color' => 'danger','icon' => 'ti ti-trash','icon-only' => true,'tooltip' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/language::language.delete_tooltip')),'size' => 'sm','class' => 'deleteDialog','data-section' => ''.e(route('languages.destroy', $item->lang_id)).'']); ?>
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
    </td>
</tr>
<?php /**PATH /www/wwwroot/modaui.com/platform/plugins/language/resources/views/partials/language-item.blade.php ENDPATH**/ ?>