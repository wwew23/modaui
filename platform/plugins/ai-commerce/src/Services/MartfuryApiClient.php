<?php

namespace Botble\AiCommerce\Services;

use App\Models\AiConfig;
use Illuminate\Support\Facades\Http;

class MartfuryApiClient
{
    private $baseUrl;
    private $apiKey;

    public function __construct()
    {
        $this->baseUrl = AiConfig::get('martfury_api_url', 'https://modaui.com/api');
        $this->apiKey = AiConfig::get('martfury_api_key');
    }

    public function get($endpoint, $params = [])
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->get($this->baseUrl . $endpoint, $params)->json();
    }

    public function post($endpoint, $data = [])
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->post($this->baseUrl . $endpoint, $data)->json();
    }

    public function put($endpoint, $data = [])
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->put($this->baseUrl . $endpoint, $data)->json();
    }

    public function delete($endpoint, $params = [])
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->delete($this->baseUrl . $endpoint, $params)->json();
    }
}
