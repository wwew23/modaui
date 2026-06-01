import { ThemeRuntimeAdapter } from './theme-runtime-adapter';
import { ProductRuntimeAdapter } from './product-runtime-adapter';
import { CampaignRuntimeAdapter } from './campaign-runtime-adapter';
import { MarketingRuntimeAdapter } from './marketing-runtime-adapter';
import { RuntimeAdapter } from './types';

export class ShopifyRuntimeFactory {
  static create(domain: 'theme' | 'product' | 'campaign' | 'marketing'): RuntimeAdapter {
    switch (domain) {
      case 'theme':
        return new ThemeRuntimeAdapter();
      case 'product':
        return new ProductRuntimeAdapter();
      case 'campaign':
        return new CampaignRuntimeAdapter();
      case 'marketing':
        return new MarketingRuntimeAdapter();
      default:
        throw new Error(`Unknown shopify domain: ${domain}`);
    }
  }
}
