<?php if(count($groups) > 1): ?>
    <div class="mb-3 text-end d-flex gap-2 justify-content-start justify-content-lg-end align-items-center">
        <h4 class="mb-0"><?php echo e(trans('plugins/translation::translation.translations')); ?>:</h4>
        <?php if(count($groups) <= 3): ?>
            <div class="d-flex gap-3 align-items-center">
                <?php $__currentLoopData = $groups; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $language): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <?php if($language['locale'] === $group['locale']) continue; ?>
                    <a
                        href="<?php echo e(route($route, $language['locale'] == app()->getLocale() ? [] : ['ref_lang' => $language['locale']])); ?>"
                        class="text-decoration-none small"
                    >
                        <?php echo language_flag($language['flag'], $language['name']); ?>

                        <?php echo e($language['name']); ?>

                    </a>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </div>
        <?php else: ?>
            <?php if (isset($component)) { $__componentOriginalf8303636a16ac3e808e27fabe59149a5 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf8303636a16ac3e808e27fabe59149a5 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::dropdown.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::dropdown'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                 <?php $__env->slot('trigger', null, []); ?> 
                    <a
                        class="d-flex align-items-center gap-2 dropdown-toggle text-muted text-decoration-none"
                        href="#"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <?php echo language_flag($group['flag'], $group['name']); ?>

                        <?php echo e($group['name']); ?>

                    </a>
                 <?php $__env->endSlot(); ?>

                <?php $__currentLoopData = $groups; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $language): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <?php if($language['locale'] === $group['locale']) continue; ?>

                    <?php if (isset($component)) { $__componentOriginal7681c9e8cd9d4250104639dd6412633f = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal7681c9e8cd9d4250104639dd6412633f = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::dropdown.item','data' => ['href' => ''.e(route($route, $language['locale'] == app()->getLocale() ? [] : ['ref_lang' => $language['locale']])).'','class' => 'd-flex gap-2 align-items-center']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::dropdown.item'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['href' => ''.e(route($route, $language['locale'] == app()->getLocale() ? [] : ['ref_lang' => $language['locale']])).'','class' => 'd-flex gap-2 align-items-center']); ?>
                        <?php if($language['flag']): ?>
                            <?php echo language_flag($language['flag'], $language['name']); ?>

                        <?php endif; ?>
                        <?php echo e($language['name']); ?>

                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal7681c9e8cd9d4250104639dd6412633f)): ?>
<?php $attributes = $__attributesOriginal7681c9e8cd9d4250104639dd6412633f; ?>
<?php unset($__attributesOriginal7681c9e8cd9d4250104639dd6412633f); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal7681c9e8cd9d4250104639dd6412633f)): ?>
<?php $component = $__componentOriginal7681c9e8cd9d4250104639dd6412633f; ?>
<?php unset($__componentOriginal7681c9e8cd9d4250104639dd6412633f); ?>
<?php endif; ?>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf8303636a16ac3e808e27fabe59149a5)): ?>
<?php $attributes = $__attributesOriginalf8303636a16ac3e808e27fabe59149a5; ?>
<?php unset($__attributesOriginalf8303636a16ac3e808e27fabe59149a5); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf8303636a16ac3e808e27fabe59149a5)): ?>
<?php $component = $__componentOriginalf8303636a16ac3e808e27fabe59149a5; ?>
<?php unset($__componentOriginalf8303636a16ac3e808e27fabe59149a5); ?>
<?php endif; ?>
        <?php endif; ?>

        <input
            name="ref_lang"
            type="hidden"
            value="<?php echo e(BaseHelper::stringify(request()->input('ref_lang'))); ?>"
        >
    </div>
<?php endif; ?>
<?php /**PATH /www/wwwroot/modaui.com/platform/plugins/translation/resources/views/partials/list-theme-languages-to-translate.blade.php ENDPATH**/ ?>