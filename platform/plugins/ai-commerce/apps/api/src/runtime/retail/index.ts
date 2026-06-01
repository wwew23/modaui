export * from './types';
export * from './store-runtime';
export * from './shopify-sync';
export * from './map-service';

import { storeRuntime } from './store-runtime';
import { shopifyRetailSync } from './shopify-sync';
import { mapService } from './map-service';

/**
 * RetailRuntime Facade
 */
export const retailRuntime = {
  store: storeRuntime,
  shopify: shopifyRetailSync,
  map: mapService,
};
