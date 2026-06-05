import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  return {
    plugins: [
      react(),
      federation({
        name: 'roundz-admin-shell',
        remotes: {
          userManagement: env.VITE_USER_MANAGEMENT_URL ?? 'http://localhost:5101/assets/remoteEntry.js',
          riderManagement: env.VITE_RIDER_MANAGEMENT_URL ?? 'http://localhost:5102/assets/remoteEntry.js',
          tripMonitoring: env.VITE_TRIP_MONITORING_URL ?? 'http://localhost:5103/assets/remoteEntry.js',
          walletManagement: env.VITE_WALLET_MANAGEMENT_URL ?? 'http://localhost:5104/assets/remoteEntry.js',
          analyticsDashboard: env.VITE_ANALYTICS_DASHBOARD_URL ?? 'http://localhost:5105/assets/remoteEntry.js',
          notificationCenter: env.VITE_NOTIFICATION_CENTER_URL ?? 'http://localhost:5106/assets/remoteEntry.js',
          supportSystem: env.VITE_SUPPORT_SYSTEM_URL ?? 'http://localhost:5107/assets/remoteEntry.js'
        },
        shared: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@roundz/admin-shared']
      })
    ],
    build: { target: 'esnext' }
  };
});
