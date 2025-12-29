import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // Use process.env.API_KEY directly as per guidelines. 
  // This avoids the 'process.cwd()' typing error in vite.config.ts environments where node types are not loaded.
  const apiKey = process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1600,
    }
  };
});
