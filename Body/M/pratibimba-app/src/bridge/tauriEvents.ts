/**
 * Coordinate: M' (supervisor event intake)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: gateway://status events from the Rust supervisor into the
 *   provenance store. Degrades to a no-op outside the Tauri runtime
 *   (vitest, plain browser) so the face can be driven headlessly.
 * Does NOT own: supervision itself (src-tauri/src/supervisor.rs).
 */

import { SupervisorStatus, useProvenanceStore } from '../state/stores';

interface TauriEventModule {
    listen<T>(event: string, handler: (evt: { payload: T }) => void): Promise<() => void>;
}

function inTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function wireSupervisorEvents(): Promise<() => void> {
    if (!inTauri()) {
        return () => undefined;
    }
    const { listen } = (await import('@tauri-apps/api/event')) as unknown as TauriEventModule;
    const unlisten = await listen<SupervisorStatus>('gateway://status', evt => {
        useProvenanceStore.getState().setSupervisor(evt.payload);
    });
    return unlisten;
}
