import { setupQueueWorker } from './index';
import { ShopifyRuntimeFactory } from '../runtime/shopify-runtime-factory';

const themeRuntime = ShopifyRuntimeFactory.create('theme');
const productRuntime = ShopifyRuntimeFactory.create('product');
const campaignRuntime = ShopifyRuntimeFactory.create('campaign');

console.log('[QueueWorker] Starting Shopify Task Worker...');

setupQueueWorker(async (job) => {
  const { type, payload, domain } = job.data;
  console.log(`[QueueWorker] Processing job ${job.id} of type ${type} for domain ${domain}`);

  switch (domain) {
    case 'shopify.theme':
      await themeRuntime.applyTransaction({ id: job.id as string, type, payload, timestamp: new Date().toISOString() });
      break;
    case 'shopify.product':
      await productRuntime.applyTransaction({ id: job.id as string, type, payload, timestamp: new Date().toISOString() });
      break;
    case 'shopify.campaign':
      await campaignRuntime.applyTransaction({ id: job.id as string, type, payload, timestamp: new Date().toISOString() });
      break;
    default:
      console.error(`[QueueWorker] Unknown domain: ${domain}`);
  }
});
