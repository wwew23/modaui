<footer class="footer-section section-padding pb-0 fix">
    <div class="container">
        <div class="footer-head wow fadeInUp" data-wow-delay=".3s">
            <a href="{{ BaseHelper::getHomepageUrl() }}" class="footer-logo">
                <img src="{{ Theme::asset()->url('img/logo/black-logo.svg') }}" alt="logo">
            </a>
            <span class="line"></span>
            <div class="social-icon d-flex align-items-center">
                <a href="{{ theme_option('facebook') }}"><i class="fab fa-facebook-f"></i></a>
                <a href="{{ theme_option('twitter') }}"><i class="fab fa-twitter"></i></a>
                <a href="{{ theme_option('youtube') }}"><i class="fab fa-youtube"></i></a>
                <a href="{{ theme_option('linkedin') }}"><i class="fab fa-linkedin-in"></i></a>
            </div>
        </div>
        <div class="footer-widget-wrapper">
            <div class="row justify-content-between">
                <div class="col-lg-3 col-md-4 col-sm-6 wow fadeInUp">
                    <div class="single-widget-items">
                        <div class="widget-head">
                            <h3>{{ theme_option('site_title') }}</h3>
                        </div>
                        <div class="footer-content">
                            <p>{{ theme_option('address') }}</p>
                            <p class="mt-4">{{ theme_option('contact_email') }}</p>
                            <p>{{ theme_option('hotline') }}</p>
                        </div>
                    </div>
                </div>
                {!! dynamic_sidebar('footer_sidebar') !!}
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="container">
            <div class="footer-bottom-wrapper wow fadeInUp" data-wow-delay=".3s">
                <p>{{ theme_option('copyright') }}</p>
                <img src="{{ Theme::asset()->url('img/home-1/bank.png') }}" alt="payments">
            </div>
        </div>
    </div>
</footer>

{!! Theme::footer() !!}
</body>
</html>
