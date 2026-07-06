/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite serves the face; Tauri wraps it. Port fixed so tauri.conf.json devUrl stays stable.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 14620,
    strictPort: true
  },
  build: {
    target: 'safari15',
    outDir: 'dist'
  },
  test: {
    environment: 'jsdom',
    globals: false,
    // scripts/ carries the Track-00 harness tests (live-wire replay); they run
    // in node, declared per-file via @vitest-environment.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.mjs']
  }
});
