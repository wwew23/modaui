<?php

use Botble\Theme\Theme;

return [
    'inherit' => null,

    'events' => [
        'beforeRenderTheme' => function (Theme $theme): void {
            $version = get_cms_version();

            // CSS
            $theme->asset()->usePath()->add('bootstrap-css', 'css/bootstrap.min.css');
            $theme->asset()->usePath()->add('all-css', 'css/all.min.css');
            $theme->asset()->usePath()->add('animate-css', 'css/animate.css');
            $theme->asset()->usePath()->add('magnific-popup-css', 'css/magnific-popup.css');
            $theme->asset()->usePath()->add('meanmenu-css', 'css/meanmenu.css');
            $theme->asset()->usePath()->add('swiper-bundle-css', 'css/swiper-bundle.min.css');
            $theme->asset()->usePath()->add('nice-select-css', 'css/nice-select.css');
            $theme->asset()->usePath()->add('main-css', 'css/main.css', [], [], $version);

            // JS
            $theme->asset()->container('footer')->usePath()->add('jquery', 'js/jquery-3.7.1.min.js');
            $theme->asset()->container('footer')->usePath()->add('bootstrap-js', 'js/bootstrap.bundle.min.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('gsap-js', 'js/gsap.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('tween-max-js', 'js/tween-max.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('three-js', 'js/three.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('webgl-js', 'js/webgl.js', ['jquery', 'three-js', 'tween-max-js']);
            $theme->asset()->container('footer')->usePath()->add('swiper-bundle-js', 'js/swiper-bundle.min.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('magnific-popup-js', 'js/jquery.magnific-popup.min.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('nice-select-js', 'js/jquery.nice-select.min.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('meanmenu-js', 'js/jquery.meanmenu.min.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('wow-js', 'js/wow.min.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('viewport-js', 'js/viewport.jquery.js', ['jquery']);
            $theme->asset()->container('footer')->usePath()->add('main-js', 'js/main.js', ['jquery', 'bootstrap-js', 'meanmenu-js', 'swiper-bundle-js', 'gsap-js', 'webgl-js'], [], $version);
        },
    ],
];
