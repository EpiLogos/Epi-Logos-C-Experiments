/**
 * Coordinate: M' shell — the Track 51 specced-surface entries
 * Residency: Body/M/pratibimba-app/src/panes/track51Surfaces.ts
 * Position (#n): #4 — Context/Type: the type law of what a Track-51 depth
 *   surface IS and how it is reached.
 * Actualises: Track 51 ("Specced-Surface Gap Closure") lands five M′ surfaces
 *   that were specced in canon and scheduled nowhere. Each is DEPTH — an
 *   inspector, a timeline, a depth mode, a protected-local journal — so each
 *   rides the same mechanism the 4+2 subsystem pages ride ([[DR-SUBSYS-1]]):
 *   a DYNAMIC deep-layout tab opened by an explicit command, never mounted by
 *   a default model. Declaring the five in ONE table is what lets `App.tsx`
 *   register their commands from a loop instead of five hand-copied blocks,
 *   and what lets the sibling test hold every row against the real factory.
 * Public surface: Track51Surface, TRACK_51_SURFACES, track51SurfaceFor.
 * Does NOT own: the pane bodies (each tranche's own directory), the factory
 *   (`App.tsx`), the open mechanics (`App.tsx::openDepthSurface`), or the
 *   CHROME-CONTRACT §2 rows.
 * Contract: rerun track [[51]] tranches [[51.T51.2]] · [[51.T51.3]] ·
 *   [[51.T51.4]] · [[51.T51.5]] · [[51.T51.6]] · [[CHROME-CONTRACT]] §2 ·
 *   [[DR-SUBSYS-1]] (the dynamic-tab mechanism).
 */

export interface Track51Surface {
    /** flexlayout component key = [[CHROME-CONTRACT]] §2 surface id. */
    readonly surfaceId: string;
    /** Deep main-tabset tab label. */
    readonly tabLabel: string;
    /** The command that opens it (palette-reachable, no argument). */
    readonly commandId: string;
    readonly commandTitle: string;
    /** The M′ coordinate the surface serves. */
    readonly coordinate: string;
    /** The rerun tranche that owns the body. */
    readonly tranche: string;
}

export const TRACK_51_SURFACES: readonly Track51Surface[] = Object.freeze([
    Object.freeze({
        surfaceId: 'frontendStudio',
        tabLabel: 'Frontend Studio',
        commandId: 'studio.open.frontend',
        commandTitle: "Studio: Open M5-3' Frontend Studio",
        coordinate: "M5-3'",
        tranche: '51.T51.2'
    }),
    Object.freeze({
        surfaceId: 'm1TraversalTimeline',
        tabLabel: 'Traversal Timeline',
        commandId: 'm1.open.traversalTimeline',
        commandTitle: 'M1: Open the traversal timeline',
        coordinate: "M1'",
        tranche: '51.T51.3'
    }),
    Object.freeze({
        surfaceId: 'm2MeaningPacket',
        tabLabel: 'Meaning Packet',
        commandId: 'm2.open.meaningPacket',
        commandTitle: 'M2: Open the meaning-packet inspector',
        coordinate: "M2'",
        tranche: '51.T51.4'
    })
]);

export function track51SurfaceFor(surfaceId: string): Track51Surface | null {
    return TRACK_51_SURFACES.find(surface => surface.surfaceId === surfaceId) ?? null;
}
