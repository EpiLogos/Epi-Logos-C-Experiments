/**
 * Coordinate: M'
 * Residency: Body/M/pratibimba-app (Position #5 in Body/M — the active carrier)
 * Actualises: the M' Pratibimba surface as one Tauri v2 binary; entry point of
 *   the webview face. Owning spec: [[M'-SYSTEM-SPEC]] (Carrier Decision 2026-07-02);
 *   plan: [[2026-07-02-pratibimba-app-phase-1]].
 * Public surface: none (entry module).
 * Does NOT own: kernel computation (portal-core), gateway (epi-cli S3),
 *   canonical vault law (S1/Hen).
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registerThemeCommands } from './commands/theme';
import { CompositionStateProvider } from './composition/compositionState';
import { WalkthroughOverlay } from './onboarding/WalkthroughOverlay';
import { registerWalkthroughCommand } from './commands/walkthrough';
import { installThemeApplier } from './state/themeStore';
import 'flexlayout-react/style/dark.css';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('pratibimba-app: #root container missing from index.html');
}

async function bootstrap(): Promise<void> {
    // 30.T30.4 — the theme signal, installed before first paint so the root
    // carries `data-theme` on the very first frame (no dark-to-light flash) and
    // the appearance picker is in the palette from boot. Both live for the
    // lifetime of the page; the disposers exist for tests, not for the app.
    registerThemeCommands();
    installThemeApplier();
    // 32.T32.3 — the walkthrough is a sibling of <App/>, not a child: it is a
    // guide OVER the shell and owns no shell state.
    registerWalkthroughCommand();

    // e2e-only seam (Track-00 real-UI gate): in browser mode there is no Tauri
    // host, so the drivable-loop harness installs a mockIPC shim that forwards
    // vault commands to a real-filesystem sidecar. Dynamic import behind the
    // flag — production and Tauri-dev bundles never load the module.
    if (import.meta.env.VITE_E2E_TAURI_SHIM === '1') {
        const { installE2eTauriShim } = await import('./bridge/e2eShim');
        await installE2eTauriShim(import.meta.env.VITE_E2E_SIDECAR_URL ?? 'http://127.0.0.1:18934');
        const { installE2eAuthorities } = await import('./bridge/e2eAuthorities');
        installE2eAuthorities();
    }
    createRoot(container!).render(
        <React.StrictMode>
            <CompositionStateProvider>
                <App />
                <WalkthroughOverlay />
            </CompositionStateProvider>
        </React.StrictMode>
    );
}

void bootstrap();
