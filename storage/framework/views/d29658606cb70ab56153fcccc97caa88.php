<header class="header header--mobile" data-sticky="<?php echo e(theme_option('sticky_header_mobile_enabled', 'yes') == 'yes' ? 'true' : 'false'); ?>">
    <div class="navigation--mobile">
        <div class="navigation__left">
            <a class="ps-logo" href="<?php echo e(BaseHelper::getHomepageUrl()); ?>">
                <?php echo Theme::getLogoImage(['style' => 'max-height: 40px']); ?>

            </a>
        </div>
        <?php if(is_plugin_active('ecommerce')): ?>
            <div class="navigation__right">
                <div class="header__actions">
                    <?php echo apply_filters('before_theme_header_mobile_actions', null); ?>

                    <div class="ps-cart--mini">
                        <a class="header__extra btn-shopping-cart" href="<?php echo e(route('public.cart')); ?>">
                            <i class="icon-bag2"></i><span><i><?php echo e(Cart::instance('cart')->count()); ?></i></span>
                        </a>
                        <div class="ps-cart--mobile">
                            <?php echo Theme::partial('cart'); ?>

                        </div>
                    </div>
                    <?php echo apply_filters('after_theme_header_mobile_actions', null); ?>

                    <div class="ps-block--user-header">
                        <div class="ps-block__left"><a href="<?php echo e(route('customer.overview')); ?>"><i class="icon-user"></i></a></div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>
    <?php if(is_plugin_active('ecommerce')): ?>
        <div class="ps-search--mobile">
            <form class="ps-form--search-mobile" action="<?php echo e(route('public.products')); ?>" data-ajax-url="<?php echo e(route('public.ajax.search-products')); ?>" method="get">
                <div class="form-group--nest position-relative">
                    <input class="form-control input-search-product" name="q" value="<?php echo e(BaseHelper::stringify(request()->query('q'))); ?>" type="text" autocomplete="off" placeholder="<?php echo e(__('Search something...')); ?>">
                    <div class="spinner-icon">
                        <i class="fa fa-spin fa-spinner"></i>
                    </div>
                    <button type="submit" title="<?php echo e(__('Search')); ?>"><i class="icon-magnifier"></i></button>
                    <div class="ps-panel--search-result"></div>
                </div>
            </form>
        </div>
    <?php endif; ?>
</header>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury (b/partials/header-mobile.blade.php ENDPATH**/ ?>