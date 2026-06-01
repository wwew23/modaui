<?php $__env->startSection('content'); ?>
    <?php if (isset($component)) { $__componentOriginalecda78b9fe8916cbd83b85e55a8b7a1c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalecda78b9fe8916cbd83b85e55a8b7a1c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::alert','data' => ['type' => 'warning']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::alert'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'warning']); ?>
        <?php echo e(trans('plugins/translation::translation.theme_translations_instruction')); ?>


        <p class="mt-3 mb-0">
            <?php echo BaseHelper::clean(trans('plugins/translation::translation.re_import_alert', [
                'here' => Html::link('#', trans('plugins/translation::translation.here'), [
                    'data-bs-toggle' => 'modal',
                    'data-bs-target' => '#confirm-re-import-modal',
                ]),
            ])); ?>

        </p>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalecda78b9fe8916cbd83b85e55a8b7a1c)): ?>
<?php $attributes = $__attributesOriginalecda78b9fe8916cbd83b85e55a8b7a1c; ?>
<?php unset($__attributesOriginalecda78b9fe8916cbd83b85e55a8b7a1c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalecda78b9fe8916cbd83b85e55a8b7a1c)): ?>
<?php $component = $__componentOriginalecda78b9fe8916cbd83b85e55a8b7a1c; ?>
<?php unset($__componentOriginalecda78b9fe8916cbd83b85e55a8b7a1c); ?>
<?php endif; ?>

    <div class="theme-translation">
        <div class="row">
            <div class="col-md-6">
                <p><?php echo e(trans('plugins/translation::translation.translate_from')); ?>

                    <strong class="text-info"><?php echo e($defaultLanguage ? $defaultLanguage['name'] : 'en'); ?></strong>
                    <?php echo e(trans('plugins/translation::translation.to')); ?>

                    <strong class="text-info"><?php echo e($group['name']); ?></strong>
                </p>
            </div>
            <div class="col-md-6">
                <div class="text-end">
                    <?php echo $__env->make('plugins/translation::partials.list-theme-languages-to-translate', [
                        'groups' => $groups,
                        'group' => $group,
                        'route' => 'translations.theme-translations',
                    ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                </div>
            </div>
        </div>

        <?php if(count($groups) < 1): ?>
            <p class="text-warning"><?php echo e(trans('plugins/translation::translation.no_other_languages')); ?></p>
        <?php endif; ?>

        <?php if(count($groups) > 0 && $group): ?>
            <?php echo apply_filters('translation_theme_translation_header', null, $groups, $group); ?>


            <?php echo $translationTable->renderTable(); ?>

        <?php endif; ?>
    </div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('footer'); ?>
    <?php if (isset($component)) { $__componentOriginal9376784f974ff66f3ff18195ab0a89c5 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9376784f974ff66f3ff18195ab0a89c5 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::modal.action','data' => ['id' => 'confirm-re-import-modal','title' => trans('plugins/translation::translation.import_translations'),'description' => trans('plugins/translation::translation.import_translations_description'),'type' => 'warning','submitButtonAttrs' => ['class' => 'button-re-import', 'data-url' => route('translations.theme-translations.re-import')],'submitButtonLabel' => trans('core/base::base.yes')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::modal.action'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['id' => 'confirm-re-import-modal','title' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/translation::translation.import_translations')),'description' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('plugins/translation::translation.import_translations_description')),'type' => 'warning','submit-button-attrs' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(['class' => 'button-re-import', 'data-url' => route('translations.theme-translations.re-import')]),'submit-button-label' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('core/base::base.yes'))]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9376784f974ff66f3ff18195ab0a89c5)): ?>
<?php $attributes = $__attributesOriginal9376784f974ff66f3ff18195ab0a89c5; ?>
<?php unset($__attributesOriginal9376784f974ff66f3ff18195ab0a89c5); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9376784f974ff66f3ff18195ab0a89c5)): ?>
<?php $component = $__componentOriginal9376784f974ff66f3ff18195ab0a89c5; ?>
<?php unset($__componentOriginal9376784f974ff66f3ff18195ab0a89c5); ?>
<?php endif; ?>
<?php $__env->stopPush(); ?>

<?php echo $__env->make(BaseHelper::getAdminMasterLayoutTemplate(), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/plugins/translation/resources/views/theme-translations.blade.php ENDPATH**/ ?>