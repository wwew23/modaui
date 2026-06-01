<?php

namespace App\Listeners;

use App\Services\AiRuntimeEventPublisher;
use Botble\Base\Events\CreatedContentEvent;
use Botble\Base\Events\UpdatedContentEvent;
use Botble\Ecommerce\Events\OrderCancelledEvent;
use Botble\Ecommerce\Events\OrderCompletedEvent;
use Botble\Ecommerce\Events\OrderCreated;
use Botble\Ecommerce\Events\OrderPlacedEvent;
use Botble\Ecommerce\Events\ProductQuantityUpdatedEvent;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class SendCommerceEventToAiRuntime
{
    public function __construct(protected AiRuntimeEventPublisher $publisher)
    {
    }

    public function handle(object $event): void
    {
        if ($event instanceof CreatedContentEvent) {
            $this->handleContentChange($event, 'created');
            return;
        }

        if ($event instanceof UpdatedContentEvent) {
            $this->handleContentChange($event, 'updated');
            return;
        }

        if ($event instanceof ProductQuantityUpdatedEvent) {
            $this->publish('product.quantity_updated', [
                'product_id' => $this->extractId($event->product ?? $event->data ?? null),
                'quantity' => $this->extractQuantity($event->product ?? $event->data ?? null),
            ]);
            return;
        }

        if ($event instanceof OrderCreated) {
            $this->publish('order.created', [
                'order_id' => $this->extractId($event->order),
            ]);
            return;
        }

        if ($event instanceof OrderPlacedEvent) {
            $this->publish('order.placed', [
                'order_id' => $this->extractId($event->order),
            ]);
            return;
        }

        if ($event instanceof OrderCompletedEvent) {
            $this->publish('order.completed', [
                'order_id' => $this->extractId($event->order),
            ]);
            return;
        }

        if ($event instanceof OrderCancelledEvent) {
            $this->publish('order.cancelled', [
                'order_id' => $this->extractId($event->order),
            ]);
            return;
        }

        if ($event instanceof Registered) {
            $user = $event->user;
            $type = $this->isVendor($user) ? 'vendor.registered' : 'customer.registered';
            $this->publish($type, [
                $this->idFieldFor($type) => $this->extractId($user),
            ]);
        }
    }

    protected function handleContentChange(CreatedContentEvent|UpdatedContentEvent $event, string $mode): void
    {
        $entity = $this->mapScreenToResource($event->screen, $event->data);
        if (! $entity) {
            return;
        }

        $type = "$entity.$mode";

        if ($entity === 'vendor' && $mode === 'updated' && $this->isVendorApproval($event->data, $event->request)) {
            $type = 'vendor.approved';
        }

        $payload = [
            $this->idFieldFor($entity) => $this->extractId($event->data),
            'screen' => $event->screen,
        ];

        if ($event->request instanceof Request && $event->request->route()) {
            $payload['route'] = $event->request->route()->getName();
        }

        $this->publish($type, $payload);
    }

    protected function publish(string $type, array $payload = []): void
    {
        $this->publisher->publish($type, $payload);
    }

    protected function mapScreenToResource(string $screen, mixed $data): ?string
    {
        return match ($screen) {
            'product' => 'product',
            'plugin-order' => 'order',
            'customer' => $this->isVendor($data) ? 'vendor' : 'customer',
            'store' => 'vendor',
            default => null,
        };
    }

    protected function idFieldFor(string $entity): string
    {
        return match ($entity) {
            'product' => 'product_id',
            'order' => 'order_id',
            'customer' => 'customer_id',
            'vendor' => 'vendor_id',
            default => 'id',
        };
    }

    protected function extractId(mixed $data): ?int
    {
        if ($data instanceof Model) {
            return $data->getKey();
        }

        if (is_array($data) && isset($data['id'])) {
            return (int) $data['id'];
        }

        return null;
    }

    protected function extractQuantity(mixed $data): ?int
    {
        if ($data instanceof Model && property_exists($data, 'quantity')) {
            return (int) $data->quantity;
        }

        if (is_array($data) && isset($data['quantity'])) {
            return (int) $data['quantity'];
        }

        return null;
    }

    protected function isVendor(mixed $data): bool
    {
        if (! is_object($data)) {
            return false;
        }

        if (class_exists('Botble\\Marketplace\\Models\\Vendor') && $data instanceof \Botble\Marketplace\Models\Vendor) {
            return true;
        }

        return property_exists($data, 'is_vendor') && $data->is_vendor;
    }

    protected function isVendorApproval(mixed $data, Request $request): bool
    {
        if (! $this->isVendor($data)) {
            return false;
        }

        if (! property_exists($data, 'vendor_verified_at') || ! $data->vendor_verified_at) {
            return false;
        }

        $routeName = $request->route()?->getName();
        return $routeName === 'marketplace.unverified-vendors.approve-vendor';
    }
}
