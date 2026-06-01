<?php
    $icon = Arr::get($formOptions, 'icon');
    $heading = Arr::get($formOptions, 'heading');
    $description = Arr::get($formOptions, 'description');
    $bannerDirection = Arr::get($formOptions, 'bannerDirection', 'vertical');

    $banner = Arr::get($formOptions, 'banner');

    if (! $banner) {
        $bannerDirection = 'vertical';
    }
?>

<?php if(Arr::get($formOptions, 'has_wrapper', 'yes') === 'yes'): ?>
    <div class="container">
        <div class="<?php echo \Illuminate\Support\Arr::toCssClasses(['row justify-content-center py-5']); ?>">
            <div class="<?php echo \Illuminate\Support\Arr::toCssClasses(['col-xl-6 col-lg-8' => $bannerDirection === 'vertical', 'col-lg-10' => $bannerDirection === 'horizontal']); ?>">
                <?php endif; ?>
                <div class="<?php echo \Illuminate\Support\Arr::toCssClasses(['auth-card', 'card' => $bannerDirection === 'vertical', 'auth-card__horizontal row' => $bannerDirection === 'horizontal']); ?>">
                    <?php if($banner): ?>
                        <?php if($bannerDirection === 'horizontal'): ?>
                            <div class="col-md-6 auth-card__left">
                        <?php endif; ?>
                            <?php echo e(RvMedia::image($banner, $heading ?: '', attributes: ['class' => 'auth-card__banner'])); ?>

                        <?php if($bannerDirection === 'horizontal'): ?>
                        </div>
                        <?php endif; ?>
                    <?php endif; ?>

                    <?php if($bannerDirection === 'horizontal'): ?>
                    <div class="col-md-6 auth-card__right">
                    <?php endif; ?>
                        <?php if($icon || $heading || $description): ?>
                            <div class="auth-card__header">
                                <div class="<?php echo \Illuminate\Support\Arr::toCssClasses(['d-flex flex-column flex-md-row align-items-start gap-3' => $icon, 'text-center' => ! $icon]); ?>">
                                    <?php if($icon): ?>
                                        <div class="auth-card__header-icon bg-white p-3 rounded">
                                            <?php if (isset($component)) { $__componentOriginal73995948b3bd877b76251b40caf28170 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal73995948b3bd877b76251b40caf28170 = $attributes; } ?>
<?php $component = Botble\Icon\View\Components\Icon::resolve(['name' => $icon] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Botble\Icon\View\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'text-primary']); ?>
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
                                        </div>
                                    <?php endif; ?>
                                    <div>
                                        <?php if($heading): ?>
                                            <h3 class="auth-card__header-title fs-4 mb-1"><?php echo e($heading); ?></h3>
                                        <?php endif; ?>
                                        <?php if($description): ?>
                                            <p class="auth-card__header-description text-muted"><?php echo e($description); ?></p>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                        <div class="auth-card__body">
                            <?php if($showStart): ?>
                                <?php echo Form::open(Arr::except($formOptions, ['template'])); ?>

                            <?php endif; ?>

                            <?php if(session()->has('status')): ?>
                                <div role="alert" class="alert alert-success">
                                    <?php echo e(session('status')); ?>

                                </div>
                            <?php elseif(session()->has('auth_error_message')): ?>
                                <div role="alert" class="alert alert-danger">
                                    <?php echo e(session('auth_error_message')); ?>

                                </div>
                            <?php elseif(session()->has('auth_success_message')): ?>
                                <div role="alert" class="alert alert-success">
                                    <?php echo e(session('auth_success_message')); ?>

                                </div>
                            <?php elseif(session()->has('auth_warning_message')): ?>
                                <div role="alert" class="alert alert-warning">
                                    <?php echo e(session('auth_warning_message')); ?>

                                </div>
                            <?php endif; ?>

                            <?php if($showFields): ?>
                                <?php echo e($form->getOpenWrapperFormColumns()); ?>


                                <?php $__currentLoopData = $fields; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $field): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <?php if(in_array($field->getName(), $exclude)) continue; ?>

                                    <?php echo $field->render(); ?>

                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                                <?php echo e($form->getCloseWrapperFormColumns()); ?>

                            <?php endif; ?>

                            <?php if($showEnd): ?>
                                <?php echo Form::close(); ?>

                            <?php endif; ?>

                            <?php if($form->getValidatorClass()): ?>
                                <?php $__env->startPush('footer'); ?>
                                    <?php echo $form->renderValidatorJs(); ?>

                                <?php $__env->stopPush(); ?>
                            <?php endif; ?>
                        </div>

                    <?php if($bannerDirection === 'horizontal'): ?>
                    </div>
                    <?php endif; ?>
                </div>
                <?php if(Arr::get($formOptions, 'has_wrapper', 'yes') === 'yes'): ?>
            </div>
        </div>
    </div>
<?php endif; ?>
<?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ecommerce/resources/views/customers/forms/auth.blade.php ENDPATH**/ ?>