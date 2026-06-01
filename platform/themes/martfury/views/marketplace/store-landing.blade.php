<div class="ps-page--single ps-page--vendor">
    <section class="ps-store-hero py-6" style="background: linear-gradient(180deg, rgba(0,0,0,.6), rgba(0,0,0,.35)), url('{{ $store->getMetaData('cover_image', true) ? RvMedia::getImageUrl($store->getMetaData('cover_image', true)) : RvMedia::getImageUrl($store->logo) }}') center/cover no-repeat;">
        <div class="container text-white">
            <div class="row align-items-center">
                <div class="col-lg-7">
                    <div class="ps-store-hero__content py-5">
                        <span class="badge bg-primary mb-3">品牌落地页</span>
                        <h1 class="display-4 text-white mb-3">{{ $store->name }} — 营养高蛋白解决方案</h1>
                        <p class="lead mb-4">{{ $store->description ?: 'Tyson 为家庭提供高品质、易烹饪的蛋白食品，让每一餐都更加美味健康。' }}</p>
                        <div class="d-flex flex-wrap gap-3">
                            <a href="#products" class="ps-btn ps-btn--lg ps-btn--white">查看精选产品</a>
                            <a href="#contact" class="ps-btn ps-btn--lg ps-btn--outline-light">联系我们合作</a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-5 text-center">
                    <div class="ps-store-hero__badge p-4 bg-white bg-opacity-10 rounded-4">
                        <img src="{{ RvMedia::getImageUrl($store->logo) }}" alt="{{ $store->name }}" class="mb-3" style="max-width:120px; max-height:120px; object-fit:contain;">
                        <h4 class="text-white mb-2">{{ $store->name }}</h4>
                        <p class="text-white-50">优选蛋白 · 家庭首选</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ps-section ps-section--features py-5">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="mb-3">为什么选择 Tyson</h2>
                <p class="text-muted">我们为家庭打造安全可靠的高蛋白产品，兼顾味道与营养。</p>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="ps-block--icon-box text-center p-4 h-100 bg-light rounded-3">
                        <i class="icon-energy"></i>
                        <h5 class="mt-3">高蛋白配方</h5>
                        <p class="mb-0 text-muted">优选肉类原料，提供稳定蛋白与饱腹感。</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="ps-block--icon-box text-center p-4 h-100 bg-light rounded-3">
                        <i class="icon-clock"></i>
                        <h5 class="mt-3">快速烹饪</h5>
                        <p class="mb-0 text-muted">简单料理即可上桌，适合繁忙家庭和快节奏生活。</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="ps-block--icon-box text-center p-4 h-100 bg-light rounded-3">
                        <i class="icon-shield"></i>
                        <h5 class="mt-3">可靠品牌</h5>
                        <p class="mb-0 text-muted">全球知名食品厂商，严格质检与稳定供应。</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="products" class="ps-section ps-section--products py-5">
        <div class="container">
            <div class="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 class="mb-2">精选推荐</h2>
                    <p class="text-muted mb-0">从 Tyson 经典产品中挑选最受欢迎的选项。</p>
                </div>
                <a href="{{ $store->url }}" class="text-link">进入完整商品页</a>
            </div>
            <div class="row g-4">
                @php
                    $featuredProducts = collect($products->items())->take(4);
                @endphp
                @if ($featuredProducts->isNotEmpty())
                    @foreach($featuredProducts as $product)
                        <div class="col-lg-3 col-md-6">
                            <div class="ps-product p-3 bg-white rounded-4 h-100">
                                {!! Theme::partial('product-item', ['product' => $product, 'lazy' => false]) !!}
                            </div>
                        </div>
                    @endforeach
                @else
                    <div class="col-12">
                        <div class="alert alert-secondary">当前没有可展示的产品，欢迎联系我们获取最新供应方案。</div>
                    </div>
                @endif
            </div>
        </div>
    </section>

    <section class="ps-section ps-section--cta py-5 bg-primary text-white">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h3 class="mb-3">让 Tyson 成为您下一个爆款供应伙伴</h3>
                    <p class="mb-0 text-white-75">我们已将这家店改造成高转化的落地页，帮助您快速展示产品亮点与品牌价值。</p>
                </div>
                <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
                    <a id="contact" href="mailto:hello@modaui.com" class="ps-btn ps-btn--white">立即合作咨询</a>
                </div>
            </div>
        </div>
    </section>
</div>
