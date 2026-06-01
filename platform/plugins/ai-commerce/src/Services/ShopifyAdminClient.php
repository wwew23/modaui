<?php

namespace Botble\AiCommerce\Services;

use Botble\AiCommerce\Models\ShopifyShop;
use GuzzleHttp\Client;

class ShopifyAdminClient
{
    protected Client $http;

    public function __construct()
    {
        $this->http = new Client([
            'timeout' => 15,
        ]);
    }

    /**
     * 发送 GraphQL 请求到指定 Shopify 店铺
     */
    public function query(ShopifyShop $shop, string $query, array $variables = []): array
    {
        $url = "https://{$shop->shop_domain}/admin/api/2024-04/graphql.json";

        $response = $this->http->post($url, [
            'headers' => [
                'X-Shopify-Access-Token' => $shop->access_token,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'query' => $query,
                'variables' => $variables,
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }
}
