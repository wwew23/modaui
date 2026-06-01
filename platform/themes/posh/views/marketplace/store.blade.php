@php
    Theme::layout('default');
@endphp

<!-- Breadcrumb Section Start -->
<div class="breadcrumb-wrapper bg-cover" style="background-image: url('{{ $store->getMetadata('background_image', true) ?: Theme::asset()->url('img/breadcrumb-bg.jpg') }}');">
    <div class="container">
        <div class="page-heading">
            <div class="breadcrumb-sub-title">
                <h1 class="wow fadeInUp" data-wow-delay=".3s">{{ $store->name }}</h1>
            </div>
            <ul class="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                <li><a href="{{ BaseHelper::getHomepageUrl() }}"><i class="fa-solid fa-house"></i> {{ __('Home') }}</a></li>
                <li>/</li>
                <li>{{ $store->name }}</li>
            </ul>
        </div>
    </div>
</div>

<!-- Store Info Section -->
<section class="store-info-section pt-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-2">
                <img src="{{ RvMedia::getImageUrl($store->logo, 'thumb', false, RvMedia::getDefaultImage()) }}" alt="{{ $store->name }}" class="img-fluid rounded-circle shadow">
            </div>
            <div class="col-md-10">
                <h2>{{ $store->name }}</h2>
                <p class="text-muted">{{ $store->description }}</p>
                <div class="d-flex gap-3">
                    @if ($store->phone)
                        <span><i class="fa fa-phone me-1"></i> {{ $store->phone }}</span>
                    @endif
                    @if ($store->email)
                        <span><i class="fa fa-envelope me-1"></i> {{ $store->email }}</span>
                    @endif
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Shop Section Start -->
<section class="shop-section fix section-padding section-bg">
    <div class="container">
        <div class="gt-shop-notices-wrapper">
            <div class="gt-shop-showing">
                <h2>{{ __('Showing :count results', ['count' => $products->total()]) }}</h2>
            </div>
        </div>
        <div class="row">
            @foreach($products as $product)
                <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".2s">
                    <div class="shop-card-items">
                        <div class="thumb">
                            <img class="font-image" src="{{ RvMedia::getImageUrl($product->image, 'medium') }}" alt="{{ $product->name }}">
                            @if ($product->images[1] ?? null)
                                <img class="back-image" src="{{ RvMedia::getImageUrl($product->images[1], 'medium') }}" alt="{{ $product->name }}">
                            @endif
                            @if ($product->is_out_of_stock)
                                <span class="discount-text">{{ __('Sold Out') }}</span>
                            @elseif ($product->front_sale_price !== $product->price)
                                <span class="discount-text">-{{ number_format(100 - ($product->front_sale_price / $product->price) * 100) }}%</span>
                            @endif
                            <a href="#" class="theme-btn add-to-cart-button" data-id="{{ $product->id }}"><i class="fa-regular fa-basket-shopping"></i> {{ __('Add to Cart') }}</a>
                        </div>
                        <div class="shop-content">
                            <div class="content">
                                <span>{{ $product->categories->first()?->name }}</span>
                                <h3><a href="{{ $product->url }}">{{ $product->name }}</a></h3>
                                <h4>{{ format_price($product->front_sale_price_with_taxes) }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="pagination-area text-center pt-5">
            {!! $products->withQueryString()->links() !!}
        </div>
    </div>
</section>
