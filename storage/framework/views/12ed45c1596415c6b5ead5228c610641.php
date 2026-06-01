<?php $__env->startSection('content'); ?>
    <?php if (isset($component)) { $__componentOriginalecda78b9fe8916cbd83b85e55a8b7a1c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalecda78b9fe8916cbd83b85e55a8b7a1c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::alert','data' => ['type' => 'primary','title' => trans('core/base::system.report_description')]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::alert'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'primary','title' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute(trans('core/base::system.report_description'))]); ?>
        <?php if (isset($component)) { $__componentOriginal922f7d3260a518f4cf606eecf9669dcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['type' => 'button','id' => 'btn-report','color' => 'info','size' => 'sm','class' => 'mt-2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'button','id' => 'btn-report','color' => 'info','size' => 'sm','class' => 'mt-2']); ?>
            <?php echo e(trans('core/base::system.get_system_report')); ?>

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

        <div
            class="mt-3"
            id="report-wrapper"
            style="display: none;"
        >
            <textarea
                name="txt-report"
                id="txt-report"
                class="form-control"
                rows="10"
                spellcheck="false"
                onfocus="this.select()"
            >
                ### <?php echo e(trans('core/base::system.system_environment')); ?>


                - <?php echo e(trans('core/base::system.cms_version')); ?>: <?php echo e(get_cms_version()); ?>

                - <?php echo e(trans('core/base::system.framework_version')); ?>: <?php echo e($systemEnv['version']); ?>

                - <?php echo e(trans('core/base::system.timezone')); ?>: <?php echo e($systemEnv['timezone']); ?>

                - <?php echo e(trans('core/base::system.server_ip')); ?>: <?php echo e($serverIp); ?>

                - <?php echo e(trans('core/base::system.debug_mode_off')); ?>: <?php echo !$systemEnv['debug_mode'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.storage_dir_writable')); ?>: <?php echo $systemEnv['storage_dir_writable'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.cache_dir_writable')); ?>: <?php echo $systemEnv['cache_dir_writable'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.app_size')); ?>: <?php echo e($systemEnv['app_size']); ?>


                ### <?php echo e(trans('core/base::system.server_environment')); ?>


                - <?php echo e(trans('core/base::system.php_version')); ?>: <?php echo e($serverEnv['version'] . (!$matchPHPRequirement ? '(' . trans('core/base::system.php_version_error', ['version' => $requiredPhpVersion]) . ')' : '')); ?>

                - <?php echo e(trans('core/base::system.opcache_enabled')); ?>: <?php echo $serverEnv['opcache_enabled'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.memory_limit')); ?>: <?php echo $serverEnv['memory_limit'] ?: '&mdash;'; ?>

                - <?php echo e(trans('core/base::system.max_execution_time')); ?>: <?php echo $serverEnv['max_execution_time'] ?: '&mdash;'; ?>

                - <?php echo e(trans('core/base::system.server_software')); ?>: <?php echo e($serverEnv['server_software']); ?>

                - <?php echo e(trans('core/base::system.server_os')); ?>: <?php echo e($serverEnv['server_os']); ?>

                - <?php echo e(trans('core/base::system.database')); ?>: <?php echo e($serverEnv['database_connection_name']); ?>

                - <?php echo e(trans('core/base::system.ssl_installed')); ?>: <?php echo $serverEnv['ssl_installed'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.cache_driver')); ?>: <?php echo e($serverEnv['cache_driver']); ?>

                - <?php echo e(trans('core/base::system.queue_connection')); ?>: <?php echo e($serverEnv['queue_connection']); ?>

                - <?php echo e(trans('core/base::system.session_driver')); ?>: <?php echo e($serverEnv['session_driver']); ?>

                - <?php echo e(trans('core/base::system.allow_url_fopen_enabled')); ?>: <?php echo $serverEnv['allow_url_fopen_enabled'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.mbstring_ext')); ?>: <?php echo $serverEnv['mbstring'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.openssl_ext')); ?>: <?php echo $serverEnv['openssl'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.pdo_ext')); ?>: <?php echo $serverEnv['pdo'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.curl_ext')); ?>: <?php echo $serverEnv['curl'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.exif_ext')); ?>: <?php echo $serverEnv['exif'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.file_info_ext')); ?>: <?php echo $serverEnv['fileinfo'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.tokenizer_ext')); ?>: <?php echo $serverEnv['tokenizer'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.imagick_or_gd_ext')); ?>: <?php echo $serverEnv['imagick_or_gd'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.zip')); ?>: <?php echo $serverEnv['zip'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.iconv')); ?>: <?php echo $serverEnv['iconv'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.json_ext')); ?>: <?php echo $serverEnv['json'] ? '&#10004;' : '&#10008;'; ?>


                ### <?php echo e(trans('core/base::system.php_configs')); ?>


                - <?php echo e(trans('core/base::system.post_max_size')); ?>: <?php echo e($serverEnv['post_max_size'] ?? 'N/A'); ?>

                - <?php echo e(trans('core/base::system.upload_max_filesize')); ?>: <?php echo e($serverEnv['upload_max_filesize'] ?? 'N/A'); ?>

                - <?php echo e(trans('core/base::system.max_file_uploads')); ?>: <?php echo e($serverEnv['max_file_uploads'] ?? 'N/A'); ?>

                - <?php echo e(trans('core/base::system.max_input_time')); ?>: <?php echo e($serverEnv['max_input_time'] ?? 'N/A'); ?> seconds
                - <?php echo e(trans('core/base::system.max_input_vars')); ?>: <?php echo e($serverEnv['max_input_vars'] ?? 'N/A'); ?>

                - <?php echo e(trans('core/base::system.display_errors')); ?>: <?php echo $serverEnv['display_errors'] ? '&#10004;' : '&#10008;'; ?>

                - <?php echo e(trans('core/base::system.error_reporting')); ?>: <?php echo e($serverEnv['error_reporting'] ?? 'N/A'); ?>

                - <?php echo e(trans('core/base::system.date_timezone')); ?>: <?php echo e($serverEnv['date_timezone'] ?? 'N/A'); ?>


                ### <?php echo e(trans('core/base::system.installed_packages')); ?>


                <?php $__currentLoopData = $packages; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $package): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
- <?php echo e($package['name']); ?> : <?php echo e($package['version']); ?>

<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </textarea>
            <?php if (isset($component)) { $__componentOriginal922f7d3260a518f4cf606eecf9669dcb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal922f7d3260a518f4cf606eecf9669dcb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::button','data' => ['type' => 'button','id' => 'copy-report','size' => 'sm','class' => 'mt-2','dataBbToggle' => 'clipboard','dataClipboardAction' => 'copy','dataClipboardMessage' => 'Copied','dataClipboardTarget' => '#txt-report']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::button'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['type' => 'button','id' => 'copy-report','size' => 'sm','class' => 'mt-2','data-bb-toggle' => 'clipboard','data-clipboard-action' => 'copy','data-clipboard-message' => 'Copied','data-clipboard-target' => '#txt-report']); ?>
                <?php if (isset($component)) { $__componentOriginal73995948b3bd877b76251b40caf28170 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal73995948b3bd877b76251b40caf28170 = $attributes; } ?>
<?php $component = Botble\Icon\View\Components\Icon::resolve(['name' => 'ti ti-clipboard'] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Botble\Icon\View\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['data-clipboard-icon' => 'true']); ?>
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
                <?php if (isset($component)) { $__componentOriginal73995948b3bd877b76251b40caf28170 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal73995948b3bd877b76251b40caf28170 = $attributes; } ?>
<?php $component = Botble\Icon\View\Components\Icon::resolve(['name' => 'ti ti-check'] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::icon'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Botble\Icon\View\Components\Icon::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['data-clipboard-success-icon' => 'true','class' => 'text-success d-none']); ?>
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

                <?php echo e(trans('core/base::system.copy_report')); ?>

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

    <div class="row">
        <div class="col-sm-8">
            <?php if (isset($component)) { $__componentOriginalc107e2f90dff5eb05519f33918d2c807 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc107e2f90dff5eb05519f33918d2c807 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                <?php if (isset($component)) { $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.header.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                    <?php if (isset($component)) { $__componentOriginal61297c2b6766060b621d6f9a17b28154 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61297c2b6766060b621d6f9a17b28154 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.title','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.title'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?><?php echo e(trans('core/base::system.installed_packages')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $attributes = $__attributesOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__attributesOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $component = $__componentOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__componentOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $attributes = $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $component = $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
                <?php echo $infoTable->renderTable(); ?>

             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $attributes = $__attributesOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $component = $__componentOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__componentOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
        </div>

        <div class="col-sm-4">
            <?php if (isset($component)) { $__componentOriginalc107e2f90dff5eb05519f33918d2c807 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc107e2f90dff5eb05519f33918d2c807 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.index','data' => ['class' => 'mb-3','dataGetAdditionDataUrl' => ''.e(route('system.info.get-addition-data')).'']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'mb-3','data-get-addition-data-url' => ''.e(route('system.info.get-addition-data')).'']); ?>
                <?php if (isset($component)) { $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.header.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                    <?php if (isset($component)) { $__componentOriginal61297c2b6766060b621d6f9a17b28154 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61297c2b6766060b621d6f9a17b28154 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.title','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.title'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?><?php echo e(trans('core/base::system.system_environment')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $attributes = $__attributesOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__attributesOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $component = $__componentOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__componentOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $attributes = $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $component = $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>

                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.cms_version')); ?>: <?php echo e(get_cms_version()); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.framework_version')); ?>: <?php echo e($systemEnv['version']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.timezone')); ?>: <?php echo e($systemEnv['timezone']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.server_ip')); ?>: <span class="me-1"><?php echo e($serverIp); ?></span>
                        <?php if (isset($component)) { $__componentOriginalbebf22e2ca96656cef629606ef6bb458 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalbebf22e2ca96656cef629606ef6bb458 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::copy','data' => ['copyableState' => $serverIp]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::copy'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['copyableState' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($serverIp)]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalbebf22e2ca96656cef629606ef6bb458)): ?>
<?php $attributes = $__attributesOriginalbebf22e2ca96656cef629606ef6bb458; ?>
<?php unset($__attributesOriginalbebf22e2ca96656cef629606ef6bb458); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalbebf22e2ca96656cef629606ef6bb458)): ?>
<?php $component = $__componentOriginalbebf22e2ca96656cef629606ef6bb458; ?>
<?php unset($__componentOriginalbebf22e2ca96656cef629606ef6bb458); ?>
<?php endif; ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.debug_mode_off')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => !$systemEnv['debug_mode'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.storage_dir_writable')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $systemEnv['storage_dir_writable'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.cache_dir_writable')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $systemEnv['cache_dir_writable'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.app_size')); ?>: <span id="system-app-size"><span
                                class="spinner-border spinner-border-sm text-secondary"
                                role="status"
                            ></span></span>
                    </li>
                </ul>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $attributes = $__attributesOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $component = $__componentOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__componentOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>

            <?php if (isset($component)) { $__componentOriginalc107e2f90dff5eb05519f33918d2c807 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc107e2f90dff5eb05519f33918d2c807 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                <?php if (isset($component)) { $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.header.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                    <?php if (isset($component)) { $__componentOriginal61297c2b6766060b621d6f9a17b28154 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61297c2b6766060b621d6f9a17b28154 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.title','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.title'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?><?php echo e(trans('core/base::system.server_environment')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $attributes = $__attributesOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__attributesOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $component = $__componentOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__componentOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $attributes = $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $component = $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>

                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.php_version')); ?>: <?php echo e($serverEnv['version']); ?>

                        <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $matchPHPRequirement,
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                        <?php if(!$matchPHPRequirement): ?>
                            (<?php echo e(trans('core/base::system.php_version_error', ['version' => $requiredPhpVersion])); ?>)
                        <?php endif; ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.opcache_enabled')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['opcache_enabled'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.memory_limit')); ?>: <?php echo $serverEnv['memory_limit'] ?: '&mdash;'; ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.max_execution_time')); ?>:
                        <?php echo $serverEnv['max_execution_time'] ?: '&mdash;'; ?></li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.server_software')); ?>:
                        <?php echo e($serverEnv['server_software']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.server_os')); ?>: <?php echo e($serverEnv['server_os']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.database')); ?>:
                        <?php echo e($serverEnv['database_connection_name']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.ssl_installed')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['ssl_installed'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.cache_driver')); ?>:
                        <?php echo e($serverEnv['cache_driver']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.session_driver')); ?>:
                        <?php echo e($serverEnv['session_driver']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.queue_connection')); ?>:
                        <?php echo e($serverEnv['queue_connection']); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.allow_url_fopen_enabled')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['allow_url_fopen_enabled'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.openssl_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['openssl'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.mbstring_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['mbstring'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.pdo_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', ['status' => $serverEnv['pdo']], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.curl_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['curl'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.exif_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['exif'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.file_info_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['fileinfo'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.tokenizer_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['tokenizer'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.imagick_or_gd_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['imagick_or_gd'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.zip')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['zip'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.iconv')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['iconv'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.json_ext')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['json'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                </ul>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $attributes = $__attributesOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $component = $__componentOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__componentOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>

            <?php if(!empty($databaseInfo)): ?>
                <?php if (isset($component)) { $__componentOriginalc107e2f90dff5eb05519f33918d2c807 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc107e2f90dff5eb05519f33918d2c807 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.index','data' => ['class' => 'mt-3 mb-3']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['class' => 'mt-3 mb-3']); ?>
                    <?php if (isset($component)) { $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.header.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                        <?php if (isset($component)) { $__componentOriginal61297c2b6766060b621d6f9a17b28154 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61297c2b6766060b621d6f9a17b28154 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.title','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.title'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?><?php echo e(trans('core/base::system.database_info')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $attributes = $__attributesOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__attributesOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $component = $__componentOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__componentOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
                     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $attributes = $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $component = $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                            <?php echo e(trans('core/base::system.database_driver')); ?>: <?php echo e($databaseInfo['driver'] ?? 'N/A'); ?>

                        </li>
                        <li class="list-group-item">
                            <?php echo e(trans('core/base::system.database_name')); ?>: <?php echo e($databaseInfo['database'] ?? 'N/A'); ?>

                        </li>
                        <?php if(isset($databaseInfo['version'])): ?>
                            <li class="list-group-item">
                                <?php echo e(trans('core/base::system.database_version')); ?>: <?php echo e($databaseInfo['version']); ?>

                            </li>
                        <?php endif; ?>
                        <?php if(isset($databaseInfo['max_connections'])): ?>
                            <li class="list-group-item">
                                <?php echo e(trans('core/base::system.database_max_connections')); ?>:
                                <?php echo e($databaseInfo['max_connections']); ?>

                            </li>
                        <?php endif; ?>
                        <?php if(isset($databaseInfo['charset'])): ?>
                            <li class="list-group-item">
                                <?php echo e(trans('core/base::system.database_charset')); ?>: <?php echo e($databaseInfo['charset']); ?>

                            </li>
                        <?php endif; ?>
                        <?php if(isset($databaseInfo['collation'])): ?>
                            <li class="list-group-item">
                                <?php echo e(trans('core/base::system.database_collation')); ?>: <?php echo e($databaseInfo['collation']); ?>

                            </li>
                        <?php endif; ?>
                    </ul>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $attributes = $__attributesOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $component = $__componentOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__componentOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
            <?php endif; ?>

            <?php if (isset($component)) { $__componentOriginalc107e2f90dff5eb05519f33918d2c807 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalc107e2f90dff5eb05519f33918d2c807 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                <?php if (isset($component)) { $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.header.index','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
                    <?php if (isset($component)) { $__componentOriginal61297c2b6766060b621d6f9a17b28154 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal61297c2b6766060b621d6f9a17b28154 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => '8def1252668913628243c4d363bee1ef::card.title','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('core::card.title'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?><?php echo e(trans('core/base::system.php_configs')); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $attributes = $__attributesOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__attributesOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal61297c2b6766060b621d6f9a17b28154)): ?>
<?php $component = $__componentOriginal61297c2b6766060b621d6f9a17b28154; ?>
<?php unset($__componentOriginal61297c2b6766060b621d6f9a17b28154); ?>
<?php endif; ?>
                 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $attributes = $__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__attributesOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4)): ?>
<?php $component = $__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4; ?>
<?php unset($__componentOriginalf7ec4b8ef3fc6db54b9665bd653222c4); ?>
<?php endif; ?>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.post_max_size')); ?>: <?php echo e($serverEnv['post_max_size'] ?? 'N/A'); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.upload_max_filesize')); ?>:
                        <?php echo e($serverEnv['upload_max_filesize'] ?? 'N/A'); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.max_file_uploads')); ?>: <?php echo e($serverEnv['max_file_uploads'] ?? 'N/A'); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.max_input_time')); ?>: <?php echo e($serverEnv['max_input_time'] ?? 'N/A'); ?>

                        seconds
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.max_input_vars')); ?>: <?php echo e($serverEnv['max_input_vars'] ?? 'N/A'); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.display_errors')); ?>: <?php echo $__env->make('core/base::system.partials.status-icon', [
                            'status' => $serverEnv['display_errors'],
                        ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.error_reporting')); ?>: <?php echo e($serverEnv['error_reporting'] ?? 'N/A'); ?>

                    </li>
                    <li class="list-group-item">
                        <?php echo e(trans('core/base::system.date_timezone')); ?>: <?php echo e($serverEnv['date_timezone'] ?? 'N/A'); ?>

                    </li>
                </ul>
             <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $attributes = $__attributesOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__attributesOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalc107e2f90dff5eb05519f33918d2c807)): ?>
<?php $component = $__componentOriginalc107e2f90dff5eb05519f33918d2c807; ?>
<?php unset($__componentOriginalc107e2f90dff5eb05519f33918d2c807); ?>
<?php endif; ?>
        </div>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make(BaseHelper::getAdminMasterLayoutTemplate(), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/core/base/resources/views/system/info.blade.php ENDPATH**/ ?>