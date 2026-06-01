<!-- Preloader Start -->
<div id="preloader" class="preloader">
    <div class="animation-preloader">
        <div class="spinner"></div>
        <div class="txt-loading">
            <span data-text-preloader="P" class="letters-loading">P</span>
            <span data-text-preloader="O" class="letters-loading">O</span>
            <span data-text-preloader="S" class="letters-loading">S</span>
            <span data-text-preloader="H" class="letters-loading">H</span>
        </div>
        <p class="text-center">Loading</p>
    </div>
</div>

<!-- Back To Top Start -->
<button id="back-top" class="back-to-top">
    <i class="fa-regular fa-arrow-up"></i>
</button>

<!-- GT MouseCursor Start -->
<div class="mouseCursor cursor-outer"></div>
<div class="mouseCursor cursor-inner"></div>

<!-- Offcanvas Area Start -->
<div class="fix-area">
    <div class="offcanvas__info">
        <div class="offcanvas__wrapper">
            <div class="offcanvas__content">
                <div class="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                    <div class="offcanvas__logo">
                        <a href="{{ BaseHelper::getHomepageUrl() }}">
                            <img src="{{ Theme::asset()->url('img/logo/black-logo.svg') }}" alt="logo">
                        </a>
                    </div>
                    <div class="offcanvas__close">
                        <button><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="mobile-menu fix mb-3"></div>
            </div>
        </div>
    </div>
</div>
<div class="offcanvas__overlay"></div>

<!-- Header Section Start -->
<header id="header-sticky" class="header-1">
    <div class="container-fluid">
        <div class="mega-menu-wrapper">
            <div class="header-main">
                <div class="header-left">
                    <div class="logo">
                        <a href="{{ BaseHelper::getHomepageUrl() }}" class="header-logo">
                            <img src="{{ Theme::asset()->url('img/logo/logo-1.svg') }}" alt="logo">
                        </a>
                        <a href="{{ BaseHelper::getHomepageUrl() }}" class="header-logo-2">
                            <img src="{{ Theme::asset()->url('img/logo/black-logo.svg') }}" alt="logo">
                        </a>
                    </div>
                    <div class="mean__menu-wrapper">
                        <div class="main-menu">
                            <nav id="mobile-menu">
                                {!! Menu::renderMenuLocation('main-menu', [
                                    'options' => ['class' => ''],
                                    'view' => 'menu',
                                ]) !!}
                            </nav>
                        </div>
                    </div>
                </div>
                <div class="header-right d-flex justify-content-end align-items-center">
                    <ul class="header-icon">
                        <li><a href="{{ route('customer.login') }}"><i class="fa-regular fa-user"></i></a></li>
                        <li><a href="{{ route('public.wishlist') }}"><i class="fa-regular fa-heart"></i></a></li>
                        <li><a href="{{ route('public.cart') }}"><i class="fa-regular fa-cart-shopping"></i></a></li>
                    </ul>
                    <div class="header__hamburger my-auto">
                        <div class="sidebar__toggle">
                            <i class="fa-solid fa-align-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
