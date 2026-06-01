<?php if (isset($component)) { $__componentOriginal5ee5f78769862fd20bf1abe3e4744d51 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5ee5f78769862fd20bf1abe3e4744d51 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::form.field','data' => ['showLabel' => $showLabel,'showField' => $showField,'options' => $options,'name' => $name,'prepend' => $prepend ?? null,'append' => $append ?? null,'showError' => $showError,'nameKey' => $nameKey]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::form.field'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['showLabel' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($showLabel),'showField' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($showField),'options' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($options),'name' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($name),'prepend' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($prepend ?? null),'append' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($append ?? null),'showError' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($showError),'nameKey' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($nameKey)]); ?>
     <?php $__env->slot('label', null, []); ?> 
        <?php if($showLabel && $options['label'] !== false && $options['label_show']): ?>
            <?php echo Form::customLabel($name, $options['label'], $options['label_attr']); ?>

        <?php endif; ?>
     <?php $__env->endSlot(); ?>

    <?php
        $countryCodeEnabled = setting('phone_number_enable_country_code', true);
        $withCountryCodeSelection =
            $countryCodeEnabled &&
            isset($options['with_country_code_selection']) &&
            $options['with_country_code_selection'];
        $inputName = $withCountryCodeSelection ? $name . '_display' : $name;
        $fieldId = $options['attr']['id'] ?? 'phone-field-' . Str::random(8);
        $inputAttributes = $options['attr'];
        $inputAttributes['class'] = trim(($options['attr']['class'] ?? '') . ' js-phone-number-mask form-control');
        $inputAttributes['id'] = $fieldId;

        if ($withCountryCodeSelection) {
            $inputAttributes['data-country-code-selection'] = 'true';
        }
    ?>

    <?php echo Form::text($inputName, $options['value'], $inputAttributes); ?>


    <?php if($withCountryCodeSelection): ?>
        <?php echo Form::hidden($name, $options['value'], [
            'class' => 'js-phone-number-full',
            'data-phone-field' => $inputName,
            'id' => $fieldId . '-full',
        ]); ?>

    <?php endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5ee5f78769862fd20bf1abe3e4744d51)): ?>
<?php $attributes = $__attributesOriginal5ee5f78769862fd20bf1abe3e4744d51; ?>
<?php unset($__attributesOriginal5ee5f78769862fd20bf1abe3e4744d51); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5ee5f78769862fd20bf1abe3e4744d51)): ?>
<?php $component = $__componentOriginal5ee5f78769862fd20bf1abe3e4744d51; ?>
<?php unset($__componentOriginal5ee5f78769862fd20bf1abe3e4744d51); ?>
<?php endif; ?>

<?php if($withCountryCodeSelection): ?>
    <?php if (! $__env->hasRenderedOnce('60893a86-55d0-426c-b6e7-61b829865e7d')): $__env->markAsRenderedOnce('60893a86-55d0-426c-b6e7-61b829865e7d'); ?>
        <?php echo $__env->make('core/base::forms.fields.phone-number-script', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <?php endif; ?>
<?php endif; ?>
<?php /**PATH /www/wwwroot/modaui.com/platform/core/base/resources/views/forms/fields/phone-number.blade.php ENDPATH**/ ?>