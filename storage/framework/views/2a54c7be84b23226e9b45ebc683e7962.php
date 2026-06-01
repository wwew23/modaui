<?php if(Auth::user()->hasPermission('products.edit')): ?>
    <a
        class="editable"
        data-type="text"
        data-pk="<?php echo e($item->id); ?>"
        data-url="<?php echo e(route('products.update-order-by')); ?>"
        data-value="<?php echo e($item->order ?? 0); ?>"
        data-title="<?php echo e(trans('plugins/ecommerce::ecommerce.sort_order')); ?>"
        href="#"
    ><?php echo e($item->order ?? 0); ?></a>
<?php else: ?>
    <?php echo e($item->order); ?>

<?php endif; ?>
<?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ecommerce/resources/views/products/partials/sort-order.blade.php ENDPATH**/ ?>