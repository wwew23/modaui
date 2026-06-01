module.exports = {
  apps: [
    {
      name: 'modaui-api',
      script: 'apps/api/src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'modaui-worker',
      script: 'apps/api/src/queue/worker.ts',
      interpreter: 'ts-node',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'modaui-merchant',
      script: 'npm',
      args: 'start',
      cwd: 'apps/merchant',
      env: {
        NODE_ENV: 'production',
        PORT: 3112,
      },
    },
  ],
};
