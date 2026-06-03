import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'walletManagement',
      filename: 'remoteEntry.js',
      exposes: { './Module': './src/Module.tsx' },
      shared: ['react', 'react-dom', '@tanstack/react-query', '@roundz/admin-shared']
    })
  ],
  build: { target: 'esnext' }
});
