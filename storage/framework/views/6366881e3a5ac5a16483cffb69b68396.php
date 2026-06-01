 <footer class="ps-footer">
        <div class="ps-container">
            <div class="ps-footer__widgets">
                <?php if(theme_option('hotline') || theme_option('address') || theme_option('email') || theme_option('social-name-1')): ?>
                    <aside class="widget widget_footer widget_contact-us">
                        <h4 class="widget-title"><?php echo e(__('Contact us')); ?></h4>
                        <div class="widget_content">
                            <?php if(theme_option('hotline')): ?>
                                <p><?php echo e(__('Call us 24/7')); ?></p>
                                <h3><?php echo e(theme_option('hotline')); ?></h3>
                            <?php endif; ?>
                            <p><?php echo e(theme_option('address')); ?> <br><a href="mailto:<?php echo e(theme_option('email')); ?>"><?php echo e(theme_option('email')); ?></a></p>
                            <?php echo Theme::partial('social-links'); ?>

                        </div>
                    </aside>
                <?php endif; ?>
                <?php echo dynamic_sidebar('footer_sidebar'); ?>

            </div>
            <?php if(Widget::group('bottom_footer_sidebar')->getWidgets()): ?>
                <div class="ps-footer__links" id="footer-links">
                    <?php echo dynamic_sidebar('bottom_footer_sidebar'); ?>

                </div>
            <?php endif; ?>
            <div class="ps-footer__copyright">
                <p class="site-copyright"><?php echo Theme::getSiteCopyright(); ?></p>
                <?php $paymentMethods = array_filter(json_decode(theme_option('payment_methods', []), true)); ?>
                <?php if($paymentMethods): ?>
                    <div class="footer-payments">
                        <span class="payment-method-title"><?php echo e(__('We Using Safe Payment For')); ?>:</span>
                        <p class="d-sm-inline-block d-block">
                            <?php if(theme_option('payment_methods_link')): ?>
                                <a href="<?php echo e(url(theme_option('payment_methods_link'))); ?>" target="_blank">
                            <?php endif; ?>
                            <?php $__currentLoopData = $paymentMethods; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $method): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <?php if(!empty($method)): ?>
                                    <span>
                                        <?php echo RvMedia::image($method, __('Payment methods')); ?>

                                    </span>
                                <?php endif; ?>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            <?php if(theme_option('payment_methods_link')): ?>
                                </a>
                            <?php endif; ?>
                        </p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </footer>

    <?php if(is_plugin_active('newsletter') && theme_option('enable_newsletter_popup', 'yes') === 'yes'): ?>
        <div data-session-domain="<?php echo e(config('session.domain') ?? request()->getHost()); ?>"></div>
        <div class="ps-popup" id="subscribe" data-time="<?php echo e((int)theme_option('newsletter_show_after_seconds', 10) * 1000); ?>">
            <div class="ps-popup__content bg--cover" data-background="<?php echo e(RvMedia::getImageUrl(theme_option('newsletter_image'))); ?>" style="background-size: cover!important;"><a class="ps-popup__close" title="<?php echo e(__('Close')); ?>" href="#"><i class="icon-cross"></i></a>
                <form method="post" action="<?php echo e(route('public.newsletter.subscribe')); ?>" class="ps-form--subscribe-popup newsletter-form">
                    <?php echo csrf_field(); ?>
                    <div class="ps-form__content">
                        <h4><?php echo e(theme_option('newsletter_popup_title') ?: __('Get 25% Discount')); ?></h4>
                        <p><?php echo e(theme_option('newsletter_popup_description') ?: __('Subscribe to the mailing list to receive updates on new arrivals, special offers and our promotions.')); ?></p>
                        <div class="mb-3">
                            <input class="form-control" name="email" type="email" placeholder="<?php echo e(__('Email Address')); ?>" required>
                        </div>

                        <?php echo apply_filters('form_extra_fields_render', null, \Botble\Newsletter\Forms\Fronts\NewsletterForm::class); ?>


                        <div class="mb-3">
                            <button class="ps-btn" type="submit" ><?php echo e(__('Subscribe')); ?></button>
                        </div>
                        <div class="ps-checkbox">
                            <input class="form-control" type="checkbox" id="dont_show_again" name="dont_show_again">
                            <label for="dont_show_again"><?php echo e(__("Don't show this popup again")); ?></label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

    <?php echo Theme::get('bottomFooter'); ?>


    <div id="back2top"><i class="icon icon-arrow-up" title="Scroll Up"></i></div>
    <div class="ps-site-overlay"></div>

    <!-- ModaUI AI Assistant Floating Button -->
    <div id="modaui-ai-trigger" style="position: fixed; bottom: 90px; right: 25px; z-index: 9999; cursor: pointer;">
        <div style="width: 56px; height: 56px; background: #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="#111827"/></svg>
        </div>
    </div>

    <!-- AI Chat Modal -->
    <div id="modaui-ai-modal" style="display: none; position: fixed; bottom: 160px; right: 25px; width: 350px; height: 500px; z-index: 10000; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #374151;">
        <iframe src="/moda-ai-terminal?mode=chat" style="width: 100%; height: 100%; border: none;"></iframe>
    </div>

    <script>
        document.getElementById('modaui-ai-trigger').onclick = function() {
            var modal = document.getElementById('modaui-ai-modal');
            modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        };
    </script>

    <!-- ModaUI AI Assistant for Customers -->
    <script src="/vendor/modaui/ai-widget.js?role=customer" async></script>
</body>

    <?php if(is_plugin_active('ecommerce')): ?>
        <div class="ps-search" id="site-search"><a class="ps-btn--close" href="#"></a>
            <div class="ps-search__content">
                <form class="ps-form--primary-search" action="<?php echo e(route('public.products')); ?>" data-ajax-url="<?php echo e(route('public.ajax.search-products')); ?>" method="get">
                    <input class="form-control input-search-product" name="q" value="<?php echo e(BaseHelper::stringify(request()->query('q'))); ?>" type="text" autocomplete="off" placeholder="<?php echo e(__('Search for...')); ?>">
                    <div class="spinner-icon">
                        <i class="fa fa-spin fa-spinner"></i>
                    </div>
                    <button title="<?php echo e(__('Search')); ?>"><i class="aroma-magnifying-glass"></i></button>
                    <div class="ps-panel--search-result"></div>
                </form>
            </div>
        </div>
    <?php endif; ?>
    <div class="modal fade" id="product-quickview" tabindex="-1" role="dialog" aria-labelledby="product-quickview" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content"><span class="modal-close" data-bs-dismiss="modal"><i class="icon-cross2"></i></span>
                <article class="ps-product--detail ps-product--fullwidth ps-product--quickview">
                </article>
            </div>
        </div>
    </div>

    <?php echo $__env->make(Theme::getThemeNamespace('views.ecommerce.includes.quick-shop-modal'), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <script>
        window.trans = {
            "View All": "<?php echo e(__('View All')); ?>",
            "No reviews!": "<?php echo e(__('No reviews!')); ?>",
        };
    </script>

    <?php echo Theme::footer(); ?>


    </body>
</html>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury/partials/footer.blade.php ENDPATH**/ ?>