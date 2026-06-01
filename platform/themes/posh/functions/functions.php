<?php

use Botble\Base\Forms\FormAbstract;
use Botble\Theme\Typography\TypographyItem;

register_sidebar([
    'id' => 'footer_sidebar',
    'name' => 'Footer sidebar',
    'description' => 'Sidebar at the bottom of the page',
]);

Theme::typography()
    ->registerFontFamily(
        new TypographyItem('primary', 'Primary Font', 'Plus Jakarta Sans')
    );

add_action(BASE_ACTION_META_BOXES, function ($context, $object) {
    if ($object instanceof \Botble\Marketplace\Models\Store && $context == 'advanced') {
        MetaBox::addMetaBox('store_background_image', 'Store Background Image', function () use ($object) {
            return RvMedia::image('background_image', $object->getMetadata('background_image', true));
        }, get_class($object), $context);
    }
}, 10, 2);

add_action(BASE_ACTION_AFTER_CREATE_CONTENT, 'save_store_background_image', 10, 3);
add_action(BASE_ACTION_AFTER_UPDATE_CONTENT, 'save_store_background_image', 10, 3);

function save_store_background_image($type, $request, $object)
{
    if ($object instanceof \Botble\Marketplace\Models\Store && $request->has('background_image')) {
        $object->setMeta('background_image', $request->input('background_image'));
        $object->save();
    }
}
