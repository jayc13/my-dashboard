import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add bundle analyzer for analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  // Use .env.test for testing to avoid loading production values
  envDir: mode === 'test' ? false : '.',
  resolve: {
    dedupe: ['@emotion/react', '@emotion/styled'],
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/system',
      '@mui/styled-engine',
    ],
  },
  define: {
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
}));
