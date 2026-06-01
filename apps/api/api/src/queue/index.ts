import { Queue, Worker } from 'bullmq';

const connectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

export const shopifyTaskQueue = new Queue('shopify-tasks', {
  connection: connectionOptions,
});

export function setupQueueWorker(processor: (job: any) => Promise<void>) {
  const worker = new Worker('shopify-tasks', processor, {
    connection: connectionOptions,
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
  });

  return worker;
}
