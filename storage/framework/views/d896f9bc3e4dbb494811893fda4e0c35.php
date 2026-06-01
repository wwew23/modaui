<!DOCTYPE html>
<html <?php echo Theme::htmlAttributes(); ?>>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <?php echo BaseHelper::googleFonts('https://fonts.googleapis.com/css2?family=' . urlencode(theme_option('primary_font', 'Work Sans')) . ':wght@300;400;500;600;700&display=swap'); ?>


    <style>
        :root {
            --color-1st: <?php echo e(theme_option('primary_color', '#fcb800')); ?>;
            --primary-color: <?php echo e(theme_option('primary_color', '#fcb800')); ?>;
            --color-2nd: <?php echo e(theme_option('secondary_color', '#222222')); ?>;
            --secondary-color: <?php echo e(theme_option('secondary_color', '#222222')); ?>;
            --primary-font: '<?php echo e(theme_option('primary_font', 'Work Sans')); ?>', sans-serif;
            --button-text-color: <?php echo e(theme_option('button_text_color', '#000')); ?>;
            --header-text-color: <?php echo e(theme_option('header_text_color', '#000')); ?>;
            --header-button-background-color: <?php echo e(theme_option('header_button_background_color', '#000')); ?>;
            --header-button-text-color: <?php echo e(theme_option('header_button_text_color', '#fff')); ?>;
            --header-text-hover-color: <?php echo e(theme_option('header_text_hover_color', '#fff')); ?>;
            --header-text-accent-color: <?php echo e(theme_option('header_text_accent_color', '#222222')); ?>;
            --header-diliver-border-color: <?php echo e(BaseHelper::hexToRgba(theme_option('header_text_color', '#000'), 0.15)); ?>;
        }
    </style>

    <?php
        Theme::asset()->remove('language-css');
        Theme::asset()->container('footer')->remove('language-public-js');
        Theme::asset()->container('footer')->remove('simple-slider-owl-carousel-css');
        Theme::asset()->container('footer')->remove('simple-slider-owl-carousel-js');
        Theme::asset()->container('footer')->remove('simple-slider-css');
        Theme::asset()->container('footer')->remove('simple-slider-js');
    ?>

    <?php echo Theme::header(); ?>

</head>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury (b/partials/header-meta.blade.php ENDPATH**/ ?>