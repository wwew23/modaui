<?php $__env->startPush('header'); ?>
    <script>
        'use strict';

        window.trans = window.trans || {};

        window.trans.order = <?php echo e(Js::from(trans('plugins/ecommerce::order'))); ?>;
        window.trans.order.status = '<?php echo e(trans('core/base::forms.status')); ?>';
        window.trans.order.published = '<?php echo e(trans('core/base::enums.statuses.published')); ?>';
        window.trans.order.draft = '<?php echo e(trans('core/base::enums.statuses.draft')); ?>';
        window.trans.order.pending = '<?php echo e(trans('core/base::enums.statuses.pending')); ?>';
    </script>
<?php $__env->stopPush(); ?>

<?php $__env->startSection('content'); ?>
    <create-order
        :currency="'<?php echo e(get_application_currency()->symbol); ?>'"
        :zip_code_enabled="<?php echo e((int) EcommerceHelper::isZipCodeEnabled()); ?>"
        :use_location_data="<?php echo e((int) EcommerceHelper::loadCountriesStatesCitiesFromPluginLocation()); ?>"
        :is_tax_enabled=<?php echo e((int) EcommerceHelper::isTaxEnabled()); ?>

        :sub_amount_label="'<?php echo e(format_price(0)); ?>'"
        :tax_amount_label="'<?php echo e(format_price(0)); ?>'"
        :promotion_amount_label="'<?php echo e(format_price(0)); ?>'"
        :discount_amount_label="'<?php echo e(format_price(0)); ?>'"
        :shipping_amount_label="'<?php echo e(format_price(0)); ?>'"
        :total_amount_label="'<?php echo e(format_price(0)); ?>'"
        :payment-methods="<?php echo e(json_encode(is_plugin_active('payment') ? \Botble\Payment\Enums\PaymentMethodEnum::labels() : [])); ?>"
        :payment-statuses="<?php echo e(json_encode(is_plugin_active('payment') ? \Botble\Payment\Enums\PaymentStatusEnum::labels() : [])); ?>"
    ></create-order>
<?php $__env->stopSection(); ?>

<?php echo $__env->make(BaseHelper::getAdminMasterLayoutTemplate(), array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ecommerce/resources/views/orders/create.blade.php ENDPATH**/ ?>