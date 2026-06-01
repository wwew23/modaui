<!DOCTYPE html>
<html <?php echo Theme::htmlAttributes(); ?>>

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
    >
    <meta
        http-equiv="X-UA-Compatible"
        content="ie=edge"
    >
    <title><?php echo $__env->yieldContent('title'); ?></title>

    <?php echo BaseHelper::googleFonts(
        'https://fonts.googleapis.com/' .
            sprintf(
                'css2?family=%s:wght@300;400;500;600;700&display=swap',
                urlencode(setting('admin_primary_font', 'Inter')),
            ),
    ); ?>


    <style>
        :root {
            --primary-font: "<?php echo e(setting('admin_primary_font', 'Inter')); ?>";
            --primary-color: <?php echo e($primaryColor = setting('admin_primary_color', '#206bc4')); ?>;
            --primary-color-rgb: <?php echo e(implode(', ', BaseHelper::hexToRgb($primaryColor))); ?>;
            --secondary-color: <?php echo e($secondaryColor = setting('admin_secondary_color', '#6c7a91')); ?>;
            --secondary-color-rgb: <?php echo e(implode(', ', BaseHelper::hexToRgb($secondaryColor))); ?>;
            --heading-color: <?php echo e(setting('admin_heading_color', 'inherit')); ?>;
            --text-color: <?php echo e($textColor = setting('admin_text_color', '#182433')); ?>;
            --text-color-rgb: <?php echo e(implode(', ', BaseHelper::hexToRgb($textColor))); ?>;
            --link-color: <?php echo e($linkColor = setting('admin_link_color', '#206bc4')); ?>;
            --link-color-rgb: <?php echo e(implode(', ', BaseHelper::hexToRgb($linkColor))); ?>;
            --link-hover-color: <?php echo e($linkHoverColor = setting('admin_link_hover_color', '#206bc4')); ?>;
            --link-hover-color-rgb: <?php echo e(implode(', ', BaseHelper::hexToRgb($linkHoverColor))); ?>;
        }
    </style>

    <?php echo Assets::styleToHtml('core'); ?>

</head>

<body class="border-top-wide border-primary d-flex flex-column">
<div class="page page-center">
    <div class="container py-4 container-tight">
        <?php echo $__env->yieldContent('content'); ?>
    </div>
</div>
</body>

</html>
<?php /**PATH /www/wwwroot/modaui.com/platform/packages/theme/resources/views/errors/master.blade.php ENDPATH**/ ?>