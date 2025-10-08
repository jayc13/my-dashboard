import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add bundle analyzer for analyze mode
    mode === 'analyze' &&
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  // Load environment variables from .env.test for testing
  envDir: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@sections': path.resolve(__dirname, './src/sections'),
    },
    dedupe: ['@emotion/react', '@emotion/styled'],
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@my-dashboard/sdk',
      '@my-dashboard/types',
    ],
  },
  define: {
    global: 'globalThis',
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      exclude: [/@my-dashboard\/(sdk|types)/],
    },
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Vendor chunks for large libraries
          if (id.includes('node_modules')) {
            // MUI and related packages
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // React and related
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Other vendor code
            return 'vendor-other';
          }

          // Split each section into its own chunk
          if (id.includes('/src/sections/apps-page')) {
            return 'section-apps';
          }
          if (id.includes('/src/sections/e2e-page')) {
            return 'section-e2e';
          }
          if (id.includes('/src/sections/pull-requests-page')) {
            return 'section-pull-requests';
          }
          if (id.includes('/src/sections/tasks-page')) {
            return 'section-tasks';
          }
        },
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './.coverage-report',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/sections/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/components/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.d.ts', '**/*.config.*', '**/mockData', '**/*.test.*', '**/*.spec.*'],
    },
  },
}));
