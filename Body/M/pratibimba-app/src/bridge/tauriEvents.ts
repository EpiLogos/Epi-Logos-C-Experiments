/**
 * Coordinate: M' (supervisor event intake)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: gateway://status events from the Rust supervisor into the
 *   provenance store, installing the listener before hydrating the current
 *   gateway_status receipt so the first supervisor transition cannot be lost.
 *   Degrades to a no-op outside the Tauri runtime (vitest, plain browser) so
 *   the face can be driven headlessly.
 * Public surface: wireSupervisorEvents.
 * Does NOT own: supervision itself (src-tauri/src/supervisor.rs).
 */

import { inTauri, invokeCommand, listenEvent } from './tauri';
import { SupervisorStatus, useProvenanceStore } from '../state/stores';

export async function wireSupervisorEvents(): Promise<() => void> {
    if (!inTauri()) {
        return () => undefined;
    }
    const unlisten = await listenEvent<SupervisorStatus>('gateway://status', status => {
        useProvenanceStore.getState().setSupervisor(status);
    });
    // The first supervisor transition can happen before the renderer installs
    // its event listener. Hydrate after listening so that race cannot strand
    // the UI at `probing`, while a concurrent event still wins normally.
    await invokeCommand<SupervisorStatus>('gateway_status')
        .then(status => useProvenanceStore.getState().setSupervisor(status))
        .catch(() => undefined);
    return unlisten;
}
