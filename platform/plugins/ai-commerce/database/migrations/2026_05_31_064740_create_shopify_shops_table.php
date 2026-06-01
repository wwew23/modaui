<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shopify_shops', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_id')->index();
            $table->string('shop_domain')->unique(); // e.g. my-shop.myshopify.com
            $table->string('access_token');          // 建议加密存储
            $table->json('ai_config')->nullable();   // 品牌语气、偏好等
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shopify_shops');
    }
};
