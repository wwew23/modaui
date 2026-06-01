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
      script: 'node',
      args: '-r ts-node/register apps/api/src/queue/worker.ts',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'modaui-app',
      script: 'npm',
      args: 'start',
      cwd: 'apps/merchant',
      env: {
        NODE_ENV: 'production',
        PORT: 3112,
      },
    },
    {
      name: 'modaui-admin',
      script: 'npm',
      args: 'start',
      cwd: 'apps/admin',
      env: {
        NODE_ENV: 'production',
        PORT: 3111,
      },
    },
    {
      name: 'modaui-web',
      script: 'npm',
      args: 'start',
      cwd: 'apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
