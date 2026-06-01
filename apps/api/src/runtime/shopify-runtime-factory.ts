import { ShopifyThemeRuntime } from './shopify-theme-runtime';
import { ShopifyProductRuntime } from './shopify-product-runtime';
import { ShopifyCampaignRuntime } from './shopify-campaign-runtime';
import { RuntimeAdapter } from './types';

export class ShopifyRuntimeFactory {
  static create(domain: 'theme' | 'product' | 'campaign'): RuntimeAdapter {
    switch (domain) {
      case 'theme':
        return new ShopifyThemeRuntime();
      case 'product':
        return new ShopifyProductRuntime();
      case 'campaign':
        return new ShopifyCampaignRuntime();
      default:
        throw new Error(`Unknown shopify domain: ${domain}`);
    }
  }
}
