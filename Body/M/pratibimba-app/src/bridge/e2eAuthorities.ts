/**
 * Coordinate: M' (real-UI verification authority bridge)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Position (#n): #4 — test observation of the running carrier
 * Actualises: an E2E-only, read/dispatch handle to the exact singleton module
 *   instances already used by the rendered app.
 * Public surface: `installE2eAuthorities` inside VITE_E2E_TAURI_SHIM builds.
 * Does NOT own: command semantics, stores, UI grammar, or production IPC.
 */

import * as crossLayout from '../commands/crossLayoutIntent';
import * as registry from '../commands/registry';
import * as omnipanelIntentRouter from '../panes/omni/omnipanelIntentRouter';
import * as omnipanelSessionState from '../panes/omni/omnipanelSessionState';
import * as stores from '../state/stores';
import * as bridgeReadiness from '../ui/bridgeReadiness';
import * as emptyStateGrammar from '../ui/emptyStateGrammar';
import * as errorUxGrammar from '../ui/errorUxGrammar';

const authorities = Object.freeze({
    crossLayout,
    registry,
    omnipanelIntentRouter,
    omnipanelSessionState,
    stores,
    bridgeReadiness,
    emptyStateGrammar,
    errorUxGrammar
});

declare global {
    interface Window {
        __EPI_E2E_AUTHORITIES__?: typeof authorities;
    }
}

export function installE2eAuthorities(): void {
    Object.defineProperty(window, '__EPI_E2E_AUTHORITIES__', {
        value: authorities,
        configurable: false,
        enumerable: false,
        writable: false
    });
}
