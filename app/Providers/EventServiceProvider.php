<?php

namespace App\Providers;

use App\Listeners\SendCommerceEventToAiRuntime;
use Botble\Base\Events\CreatedContentEvent;
use Botble\Base\Events\UpdatedContentEvent;
use Botble\Ecommerce\Events\OrderCancelledEvent;
use Botble\Ecommerce\Events\OrderCompletedEvent;
use Botble\Ecommerce\Events\OrderCreated;
use Botble\Ecommerce\Events\OrderPlacedEvent;
use Botble\Ecommerce\Events\ProductQuantityUpdatedEvent;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        CreatedContentEvent::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        UpdatedContentEvent::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        ProductQuantityUpdatedEvent::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        OrderCreated::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        OrderPlacedEvent::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        OrderCompletedEvent::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        OrderCancelledEvent::class => [
            SendCommerceEventToAiRuntime::class,
        ],
        Registered::class => [
            SendCommerceEventToAiRuntime::class,
        ],
    ];
}
