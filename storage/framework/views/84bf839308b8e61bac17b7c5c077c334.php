<div class="ps-cart__content">
    <?php if(Cart::instance('cart')->count() > 0 && Cart::instance('cart')->products()->count() > 0): ?>
        <div class="ps-cart__items">
            <div class="ps-cart__items__body">
                <?php
                    $products = Cart::instance('cart')->products();
                ?>
                <?php if(count($products)): ?>
                    <?php $__currentLoopData = Cart::instance('cart')->content(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $cartItem): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <?php
                            $product = $products->find($cartItem->id);
                        ?>

                        <?php if(!empty($product)): ?>
                            <div class="ps-product--cart-mobile">
                                <div class="ps-product__thumbnail">
                                    <a href="<?php echo e($product->original_product->url); ?>">
                                        <?php echo RvMedia::image($cartItem->options->image, $product->original_product->name, 'thumb'); ?>

                                    </a>
                                </div>
                                <div class="ps-product__content">
                                    <a class="ps-product__remove remove-cart-item" href="#" data-url="<?php echo e(route('public.cart.remove', $cartItem->rowId)); ?>"><i class="icon-cross"></i></a>
                                    <a href="<?php echo e($product->original_product->url); ?>"> <?php echo e($product->original_product->name); ?>  <?php if($product->isOutOfStock()): ?> <span class="stock-status-label">(<?php echo $product->stock_status_html; ?>)</span> <?php endif; ?></a>
                                    <p class="mb-0">
                                        <small>
                                            <span class="d-inline-block"><?php echo e($cartItem->qty); ?> x</span> <span class="cart-price"><?php echo e(format_price($cartItem->price)); ?> <?php if($product->front_sale_price != $product->price): ?>
                                                    <small><del><?php echo e(format_price($product->price)); ?></del></small>
                                                <?php endif; ?>
                                            </span>
                                        </small>
                                    </p>
                                    <p class="mb-0"><small><small><?php echo e($cartItem->options['attributes'] ?? ''); ?></small></small></p>

                                    <?php if(!empty($cartItem->options['options'])): ?>
                                        <?php echo render_product_options_info($cartItem->options['options'], $product, true); ?>

                                    <?php endif; ?>

                                    <?php if(!empty($cartItem->options['extras']) && is_array($cartItem->options['extras'])): ?>
                                        <?php $__currentLoopData = $cartItem->options['extras']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $option): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <?php if(!empty($option['key']) && !empty($option['value'])): ?>
                                                <p class="mb-0"><small><?php echo e($option['key']); ?>: <strong> <?php echo e($option['value']); ?></strong></small></p>
                                            <?php endif; ?>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    <?php endif; ?>
                                    <?php if(is_plugin_active('marketplace') && $product->original_product->store->id): ?>
                                        <p class="d-block mb-0 sold-by">
                                            <small><?php echo e(__('Sold by')); ?>: <a href="<?php echo e($product->original_product->store->url); ?>"><?php echo e($product->original_product->store->name); ?> <?php echo $product->original_product->store->badge; ?></a>
                                            </small>
                                        </p>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php endif; ?>
            </div>
        </div>
        <div class="ps-cart__footer">
            <?php if(EcommerceHelper::isTaxEnabled()): ?>
                <h5><?php echo e(__('Sub Total')); ?>:<strong><?php echo e(format_price(Cart::instance('cart')->rawSubTotal())); ?></strong></h5>
                <h5><?php echo e(__('Tax')); ?>:<strong><?php echo e(format_price(Cart::instance('cart')->rawTax())); ?></strong></h5>
                <h3><?php echo e(__('Total')); ?>:<strong><?php echo e(format_price(Cart::instance('cart')->rawSubTotal() + Cart::instance('cart')->rawTax())); ?></strong></h3>
            <?php else: ?>
                <h3><?php echo e(__('Sub Total')); ?>:<strong><?php echo e(format_price(Cart::instance('cart')->rawSubTotal())); ?></strong></h3>
            <?php endif; ?>
            <figure>
                <a class="ps-btn" href="<?php echo e(route('public.cart')); ?>"><?php echo e(__('View Cart')); ?></a>
                <?php if(session('tracked_start_checkout')): ?>
                    <a href="<?php echo e(route('public.checkout.information', session('tracked_start_checkout'))); ?>" class="ps-btn"><?php echo e(__('Checkout')); ?></a>
                <?php endif; ?>
            </figure>
        </div>
    <?php else: ?>
        <div class="ps-cart__items ps-cart_no_items">
            <span class="cart-empty-message"><?php echo e(__('No products in the cart.')); ?></span>
        </div>
    <?php endif; ?>
</div>
<?php /**PATH /www/wwwroot/modaui.com/platform/themes/martfury (b/partials/cart.blade.php ENDPATH**/ ?>