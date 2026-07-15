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
import { CompositionStateProvider } from './composition/compositionState';
import 'flexlayout-react/style/dark.css';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('pratibimba-app: #root container missing from index.html');
}

async function bootstrap(): Promise<void> {
    // e2e-only seam (Track-00 real-UI gate): in browser mode there is no Tauri
    // host, so the drivable-loop harness installs a mockIPC shim that forwards
    // vault commands to a real-filesystem sidecar. Dynamic import behind the
    // flag — production and Tauri-dev bundles never load the module.
    if (import.meta.env.VITE_E2E_TAURI_SHIM === '1') {
        const { installE2eTauriShim } = await import('./bridge/e2eShim');
        await installE2eTauriShim(import.meta.env.VITE_E2E_SIDECAR_URL ?? 'http://127.0.0.1:18934');
    }
    createRoot(container!).render(
        <React.StrictMode>
            <CompositionStateProvider>
                <App />
            </CompositionStateProvider>
        </React.StrictMode>
    );
}

void bootstrap();
