import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/congress': {
        target: 'https://api.congress.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/congress/, ''),
      },
      '/api/legiscan': {
        target: 'https://api.legiscan.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/legiscan/, ''),
      },
    },
  },
});
