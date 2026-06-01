/**
 * PM2 process map for devutsav.
 *
 * Run from the repo root on the VPS:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup    # follow the printed command to enable on boot
 */
module.exports = {
  apps: [
    {
      name: 'devutsav-api',
      cwd: './backend',
      script: 'src/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/var/log/devutsav/api.out.log',
      error_file: '/var/log/devutsav/api.err.log',
      merge_logs: true,
      time: true,
    },
    {
      name: 'devutsav-web',
      cwd: './sattva-qwik',
      script: 'server/entry.express.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        INTERNAL_API_URL: 'http://127.0.0.1:5001',
      },
      out_file: '/var/log/devutsav/web.out.log',
      error_file: '/var/log/devutsav/web.err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
