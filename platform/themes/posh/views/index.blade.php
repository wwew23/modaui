{!! Theme::partial('header') !!}

@php
    $sliders = app(\Botble\Slider\Repositories\Interfaces\SliderInterface::class)->allBy(['status' => \Botble\Base\Enums\BaseStatusEnum::PUBLISHED]);
    $featuredProducts = get_featured_products(['limit' => 8]);
    $categories = get_featured_product_categories(['limit' => 6]);
@endphp

<!-- Hero Area Start -->
@if ($sliders->count() > 0)
    <div id="showcase-slider-wrappper" class="showcase-slider-wrappper p-relative">
        <div class="port-showcase-slider-spaces">
            <div class="port-showcase-slider-wrap tp-slider-parallax fix" id="showcase-slider">
                <div class="swiper-container parallax-slider-active" id="showcase-slider">
                    <div class="swiper-wrapper" id="trigger-slides">
                        @foreach($sliders as $slider)
                            @foreach($slider->sliderItems as $index => $item)
                                <div class="swiper-slide">
                                    <div class="slide-wrap @if($loop->first && $index == 0) active @endif overlay" data-slide="{{ $loop->parent->index * $slider->sliderItems->count() + $index }}"></div>
                                    <div class="hero-1">
                                        <div class="container">
                                            <div class="hero-content">
                                                <span>{{ $item->getMetadata('sub_title', true) ?: __('NEW ARRIVALS') }}</span>
                                                <h1>{!! BaseHelper::clean($item->title) !!}</h1>
                                                <p class="offter-text">{{ $item->description }}</p>
                                                <div class="hero-button">
                                                    <a href="{{ $item->link }}" class="theme-btn hover-white">{{ __('Explore Now') }}</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        @endforeach
                    </div>
                    <div class="tp-hero-7-slider-arrow">
                        <button class="tp-hero-prev"><i class="fa-light fa-angle-left"></i></button>
                        <button class="tp-hero-next"><i class="fa-light fa-angle-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <div id="canvas-slider" class="canvas-slider">
            @foreach($sliders as $slider)
                @foreach($slider->sliderItems as $index => $item)
                    <div class="slider-img" data-slide="{{ $loop->parent->index * $slider->sliderItems->count() + $index }}">
                        <img class="slide-img" src="{{ RvMedia::getImageUrl($item->image) }}" alt="{{ $item->title }}">
                    </div>
                @endforeach
            @endforeach
        </div>
    </div>
@endif

<!-- Shop Category Section Start -->
<section class="shop-category-section fix section-padding">
    <div class="container">
        <div class="section-title text-center">
            <span class="sub-title">{{ __('Our Collections') }}</span>
            <h2 class="wow fadeInUp" data-wow-delay=".3s">{{ __('Explore Top Categories') }}</h2>
        </div>
        <div class="categorie-wrapper">
            <div class="row">
                @foreach($categories as $category)
                    <div class="col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".{{ $loop->index * 2 + 3 }}s">
                        <div class="categorie-right-image">
                            <img class="font-image" src="{{ RvMedia::getImageUrl($category->image, 'medium') }}" alt="{{ $category->name }}">
                            <h4 class="title">
                                <a href="{{ $category->url }}">{{ $category->name }} <span>({{ $category->products_count }})</span></a>
                            </h4>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>

<!-- Featured Products Section -->
<section class="shop-section fix section-padding section-bg">
    <div class="container">
        <div class="section-title-area">
            <div class="section-title mb-0">
                <span class="sub-title">{{ __('Most Popular Picks') }}</span>
                <h2 class="wow fadeInUp" data-wow-delay=".3s">{{ __('Customer Favorites') }}</h2>
            </div>
            <a href="{{ route('public.products') }}" class="theme-btn wow fadeInUp" data-wow-delay=".3s">{{ __('View More') }}</a>
        </div>
        <div class="row">
            @foreach($featuredProducts as $product)
                <div class="col-xl-3 col-lg-4 col-md-6 wow fadeInUp" data-wow-delay=".{{ $loop->index * 2 }}s">
                    <div class="shop-card-items">
                        <div class="thumb">
                            <img class="font-image" src="{{ RvMedia::getImageUrl($product->image, 'medium') }}" alt="{{ $product->name }}">
                            @if ($product->images[1] ?? null)
                                <img class="back-image" src="{{ RvMedia::getImageUrl($product->images[1], 'medium') }}" alt="{{ $product->name }}">
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
    </div>
</section>

{!! Theme::partial('footer') !!}
