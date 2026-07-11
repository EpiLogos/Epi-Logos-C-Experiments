/**
 * Coordinate: M' M5-5' (Atelier scent-following commands — Track 16.T16.19)
 * Residency: Body/M/pratibimba-app/src/commands
 * Actualises: CCT-19's Atelier ACTIVATION — three commands operating on the
 *   file the user is already in (no scent-following workspace, no
 *   standalone extension): scent-follow stages the open note as a
 *   Hen-promotion CANDIDATE via `s1'.entity.capture` (Atelier proposes;
 *   Hen routes through review; canon-write follows the CCT-14 lifecycle —
 *   never a direct canon write), cognate-search rides
 *   `s1'.semantic.suggest_links`, psychoid-trace rides
 *   `s0'.anuttara.trace`. Dependencies are injected so the bindings are
 *   pure and testable.
 * Does NOT own: the entity lifecycle law (Hen), the gateway socket (App
 *   owns it; the holder carries it), canon writes (never).
 */

import { AppCommand, commands } from './registry';

export interface AtelierDeps {
    /** Vault-relative path of the currently-open markdown editor, if any. */
    readonly activeMarkdownPath: () => string | null;
    /** The bound day (DD-MM-YYYY) the candidate pool lives under. */
    readonly dayId: () => string | null;
    readonly invoke: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    readonly ready: () => boolean;
}

export function atelierCommands(deps: AtelierDeps): AppCommand[] {
    const withActiveFile = (run: (path: string) => Promise<void>): AppCommand['run'] => {
        return async () => {
            const path = deps.activeMarkdownPath();
            if (!path) {
                return;
            }
            await run(path);
        };
    };

    return [
        {
            id: 'atelier.scentFollow',
            title: 'Atelier: Scent-follow — stage this note as a Hen candidate',
            enabled: () =>
                deps.ready() && deps.activeMarkdownPath() !== null && deps.dayId() !== null,
            run: withActiveFile(async path => {
                const dayId = deps.dayId();
                if (!dayId) {
                    return;
                }
                // Möbius write-back stages a CANDIDATE (CCT-14 lifecycle);
                // Hen reviews before anything touches canon.
                await deps.invoke("s1'.entity.capture", { source: path, dayId });
            })
        },
        {
            id: 'atelier.cognateSearch',
            title: 'Atelier: Cognate search — semantic neighbours of this note',
            enabled: () => deps.ready() && deps.activeMarkdownPath() !== null,
            run: withActiveFile(async path => {
                await deps.invoke("s1'.semantic.suggest_links", { notePath: path });
            })
        },
        {
            id: 'atelier.psychoidTrace',
            title: 'Atelier: Psychoid trace — Anuttara grammatical tracing',
            enabled: () => deps.ready() && deps.activeMarkdownPath() !== null,
            run: withActiveFile(async path => {
                await deps.invoke("s0'.anuttara.trace", {
                    content: path,
                    sensitivity: 'public',
                    depth: 1
                });
            })
        }
    ];
}

/** Register the three Atelier bindings; returns their disposers. */
export function registerAtelierCommands(deps: AtelierDeps): Array<() => void> {
    return atelierCommands(deps).map(command => commands.register(command));
}
