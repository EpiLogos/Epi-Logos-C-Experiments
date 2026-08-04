/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const E2E_SOURCE_FACADES = new Map<string, { authority: string; exports: readonly string[] }>([
  ['/src/commands/crossLayoutIntent.ts', {
    authority: 'crossLayout',
    exports: ['CROSS_LAYOUT_INTENT_COMMAND', 'CROSS_LAYOUT_INTENT_TARGETS']
  }],
  ['/src/commands/registry.ts', { authority: 'registry', exports: ['commands'] }],
  ['/src/panes/omni/omnipanelIntentRouter.ts', {
    authority: 'omnipanelIntentRouter',
    exports: ['OMNIPANEL_INTENT_ROUTE_COMMAND']
  }],
  ['/src/panes/omni/omnipanelSessionState.ts', {
    authority: 'omnipanelSessionState',
    exports: ['readOmniPanelSessionState']
  }],
  ['/src/state/stores.ts', {
    authority: 'stores',
    exports: ['useCoordinateStore', 'useSessionStore', 'useTickStore']
  }],
  ['/src/ui/bridgeReadiness.ts', {
    authority: 'bridgeReadiness',
    exports: ['BRIDGE_READINESS_IDS']
  }],
  ['/src/ui/emptyStateGrammar.ts', {
    authority: 'emptyStateGrammar',
    exports: ['M_EMPTY_STATE_GRAMMAR']
  }],
  ['/src/ui/errorUxGrammar.ts', {
    authority: 'errorUxGrammar',
    exports: ['ERROR_UX_PATHS']
  }]
]);

/**
 * The browser tests exercise the running app's singleton command and state
 * authorities. In an E2E build, serve closed facades for the eight explicit
 * source URLs the tests import. Each facade reads the authority object installed
 * by the app itself, so tests cannot accidentally operate on a second store or
 * command registry. No dev server, HMR client, or arbitrary source tree exists.
 */
function e2eProductionSourceBridge(enabled: boolean): Plugin {
  return {
    name: 'epi-e2e-production-source-bridge',
    configurePreviewServer(server) {
      if (!enabled) return;
      server.middlewares.use((request, response, next) => {
        if (!request.url) return next();
        const queryAt = request.url.indexOf('?');
        const pathname = queryAt === -1 ? request.url : request.url.slice(0, queryAt);
        const facade = E2E_SOURCE_FACADES.get(pathname);
        if (!facade) return next();
        const bindings = facade.exports
          .map(name => `export const ${name} = authority.${name};`)
          .join('\n');
        const body = [
          `const authority = globalThis.__EPI_E2E_AUTHORITIES__?.${facade.authority};`,
          `if (!authority) throw new Error(${JSON.stringify(`E2E authority unavailable: ${facade.authority}`)});`,
          bindings
        ].join('\n');
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.end(request.method === 'HEAD' ? undefined : body);
      });
    }
  };
}

function tauriBootReceipt(enabled: boolean): Plugin {
  return {
    name: 'epi-tauri-boot-receipt',
    configureServer(server) {
      if (!enabled) return;
      server.ws.on('pratibimba:tauri-shell-ready', payload => {
        console.log(`[tauri-boot-smoke] READY ${JSON.stringify(payload)}`);
      });
    }
  };
}

// Vite serves the face; Tauri wraps it. Port fixed so tauri.conf.json devUrl stays stable.
export default defineConfig({
  plugins: [
    react(),
    e2eProductionSourceBridge(process.env.VITE_E2E_TAURI_SHIM === '1'),
    tauriBootReceipt(process.env.VITE_TAURI_BOOT_SMOKE === '1')
  ],
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
