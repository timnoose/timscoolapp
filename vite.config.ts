import { defineConfig } from 'vite';

// base './' makes the build hostable from any sub-path (GitHub Pages, Vercel, a folder on any static host).
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
