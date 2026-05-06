import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'main/main.ts',
        vite: {
          build: {
            outDir: 'dist/main',
            lib: {
              entry: 'main/main.ts',
              fileName: () => 'main.cjs',
              formats: ['cjs'],
            },
            rollupOptions: {
              external: ['electron', 'electron-store', 'gray-matter', 'neo4j-driver'],
            },
          },
        },
      },
      {
        entry: 'main/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist/main',
            lib: {
              entry: 'main/preload.ts',
              fileName: () => 'preload.cjs',
              formats: ['cjs'],
            },
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/renderer',
  },
  optimizeDeps: {
    include: ['react-resizable-panels'],
  },
});
