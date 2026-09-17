/**
 * Coordinate: M' (e2e Tauri IPC shim — Track-00 hardening)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: browser-mode invoke() for the drivable-loop specs. Installs
 *   `@tauri-apps/api/mocks` mockIPC and forwards every command to the
 *   e2e vault sidecar (scripts/e2e-vault-sidecar.mjs), which executes them
 *   against a REAL temp filesystem. Loaded by main.tsx ONLY when
 *   VITE_E2E_TAURI_SHIM=1 (dynamic import) — production bundles and the
 *   Tauri runtime never see this module.
 * Does NOT own: command semantics (src-tauri mirrors), the gateway wire
 *   (gatewayClient.ts speaks to the real spawned gateway directly).
 */

import { mockIPC } from '@tauri-apps/api/mocks';

export async function installE2eTauriShim(sidecarUrl: string): Promise<void> {
    // fail loud at install time if the sidecar is not actually there —
    // a dead sidecar must never masquerade as a booted host
    const health = await fetch(`${sidecarUrl}/health`);
    if (!health.ok) {
        throw new Error(`e2e shim: vault sidecar unhealthy at ${sidecarUrl}`);
    }
    mockIPC(
        async (cmd, args) => {
            const res = await fetch(`${sidecarUrl}/invoke`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ cmd, args: args ?? {} })
            });
            const body = (await res.json()) as { ok: boolean; result?: unknown; error?: string };
            if (!body.ok) {
                throw new Error(body.error ?? `e2e sidecar: ${cmd} failed`);
            }
            return body.result;
        },
        // event plugin calls (listen/unlisten) are mocked in-page; no native
        // emitter exists in browser mode, so supervisor events simply never fire
        { shouldMockEvents: true }
    );
}
