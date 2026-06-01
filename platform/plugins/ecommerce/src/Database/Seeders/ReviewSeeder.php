<?php

namespace Botble\Ecommerce\Database\Seeders;

use Botble\Base\Supports\BaseSeeder;
use Botble\Ecommerce\Models\Customer;
use Botble\Ecommerce\Models\Product;
use Botble\Ecommerce\Models\Review;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends BaseSeeder
{
    public function run(): void
    {
        Review::query()->truncate();

        $reviews = [
            'This eCommerce platform is excellent: modern, clean code, a lot of great features. The customer support is great too: I always get an answer within hours!',
            'This web app is really good in design, code quality & features. The customer support was really fast & helpful. You guys are awesome!',
            'Excellent code quality. The support responds very quickly. I buy a lot of templates elsewhere, and ModaUI support is by far the most responsive. Thanks to tech support. I highly recommend it.',
            'This script is well coded and is super fast. The support is pretty quick. Very patient and helpful team. I strongly recommend it and they deserve more than 5 stars.',
            'Great product with excellent support. The code is well structured and maintainable.',
            'The platform is the best of its class, fast, easy to implement and work with , and the most important thing is the great support team. Recommend with no doubt.',
            'Good product. I had some customization questions. The developer team was very helpful and supportive. The product is good. Great luck for your business.',
            'These guys are amazing! Responses immediately, amazing support and help... I immediately feel at ease after purchasing.',
            'I love this platform. Feature rich and well designed. Looking forward to more features. Great multi-language support and marketplace functionality.',
            'The best ecommerce platform! Excellent coding! Best support service! Thank you so much. I really like your hard work.',
            'Happy with the platform and support. You guys do a good job!',
            'The best store platform! Excellent coding! Very good support! Thank you so much for all the help, I really appreciated it.',
            'Very responsive support! Excellent code is written. It\'s a true pleasure working with.',
            'Perfect! I love it. I also get very fast responses to support tickets. Thanks to the support team.',
            'The code is good and clean. Highly recommended.',
            'Great platform, great support, good work. I\'m looking forward to more great functional features.',
            'Good app, reliable backup service and support. Good documentation.',
            'Clean & perfect source code',
            'Best ecommerce platform online!',
            'Amazing code, amazing support. Overall, I\'m really confident in this platform and I\'m happy I made the right choice! Thank you so much for coding this masterpiece.',
            'We have received brilliant service support and will be expanding the features with the development team. Nice product!',
            'As a developer I reviewed this platform. This is really awesome ecommerce solution. I was impressed with the code quality and architecture.',
            'Great e-commerce system with wonderful customer support.',
            'The team knows what they are doing. They release such a good product that it\'s a pleasure to work with! Even when I had questions, I created a support ticket and the next day it was replied by the team. Good job! I love working with them!',
            'Botble has put a lot of effort into creating this platform. They answer support requests so fast and are very helpful. Excellent experience. Highly recommend.',
            'Solution is feature-rich and well designed. Customer support during configuration was excellent and responsive.',
        ];

        $faker = $this->fake();
        $now = $this->now();

        $productIds = Product::query()
            ->where('is_variation', false)
            ->pluck('id');

        $customerIds = Customer::query()->pluck('id');

        if ($productIds->isEmpty() || $customerIds->isEmpty()) {
            return;
        }

        $productImages = $this->getFilesFromPath('products');

        $usedCombinations = [];
        $maxAttempts = 2000; // Allow some retries for duplicates
        $created = 0;
        $target = 1000;

        for ($attempt = 0; $attempt < $maxAttempts && $created < $target; $attempt++) {
            $productId = $productIds->random();
            $customerId = $customerIds->random();
            $combination = $productId . '-' . $customerId;

            if (isset($usedCombinations[$combination])) {
                continue;
            }

            Review::query()->create([
                'product_id' => $productId,
                'customer_id' => $customerId,
                'star' => rand(1, 5),
                'comment' => $faker->randomElement($reviews),
                'images' => json_encode($productImages->random(rand(1, 4))->toArray()),
            ]);

            $usedCombinations[$combination] = true;
            $created++;
        }

        $this->updateProductReviewStats();
    }

    protected function updateProductReviewStats(): void
    {
        DB::statement('
            UPDATE ec_products p
            LEFT JOIN (
                SELECT
                    product_id,
                    COUNT(*) as review_count,
                    AVG(star) as review_avg
                FROM ec_reviews
                WHERE status = "published"
                GROUP BY product_id
            ) r ON p.id = r.product_id
            SET
                p.reviews_count = COALESCE(r.review_count, 0),
                p.reviews_avg = COALESCE(r.review_avg, 0)
        ');
    }
}
