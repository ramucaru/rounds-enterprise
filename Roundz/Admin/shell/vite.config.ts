import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'roundz-admin-shell',
      remotes: {
        userManagement: process.env.VITE_USER_MANAGEMENT_URL ?? 'http://localhost:5101/assets/remoteEntry.js',
        riderManagement: process.env.VITE_RIDER_MANAGEMENT_URL ?? 'http://localhost:5102/assets/remoteEntry.js',
        tripMonitoring: process.env.VITE_TRIP_MONITORING_URL ?? 'http://localhost:5103/assets/remoteEntry.js',
        walletManagement: process.env.VITE_WALLET_MANAGEMENT_URL ?? 'http://localhost:5104/assets/remoteEntry.js',
        analyticsDashboard: process.env.VITE_ANALYTICS_DASHBOARD_URL ?? 'http://localhost:5105/assets/remoteEntry.js',
        notificationCenter: process.env.VITE_NOTIFICATION_CENTER_URL ?? 'http://localhost:5106/assets/remoteEntry.js',
        supportSystem: process.env.VITE_SUPPORT_SYSTEM_URL ?? 'http://localhost:5107/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', '@roundz/admin-shared']
    })
  ],
  build: { target: 'esnext' }
});
