/**
 * Coordinate: M' (tauri IPC seam)
 * Actualises: the single invoke/listen wrapper — every command call and
 *   native event subscription routes through here; degrades explicitly
 *   outside the Tauri runtime so panes stay testable headless.
 */

export function inTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    if (!inTauri()) {
        throw new Error(`not-in-tauri: ${command}`);
    }
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(command, args);
}

export async function listenEvent<T>(
    event: string,
    handler: (payload: T) => void
): Promise<() => void> {
    if (!inTauri()) {
        return () => undefined;
    }
    const { listen } = await import('@tauri-apps/api/event');
    return listen<T>(event, evt => handler(evt.payload));
}
