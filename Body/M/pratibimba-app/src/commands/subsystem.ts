/**
 * Coordinate: M' shell (subsystem-page open commands — rerun 52.T5)
 * Residency: Body/M/pratibimba-app/src/commands/subsystem.ts
 * Position (#n): the entry gestures of the 4+2 body.
 * Actualises: canon's reachability — "Subsystem pages are reached from the
 *   Home grid, OmniPanel navigation, or keyboard shortcuts"
 *   ([[M'-SYSTEM-SPEC]] :119, an OR-list). DELIVERED routes: the Home grid
 *   tiles and the command palette (the palette runs commands with no
 *   argument, so the six ARE the picker — the `layout.ts` / `theme.ts`
 *   precedent). NOT delivered, named rather than implied: an OmniPanel route
 *   to the pages, and the OmniPanel's which-subsystem-is-open readout the
 *   :176 block asks for — both recorded in [[DR-SUBSYS-3]]. Each run ensures
 *   the deep layout through the shell's ONE transition seam (which mints the
 *   seven-field identity receipt) and then opens/selects the page's workspace
 *   tab in the active face's deep model — idempotent by node id, single
 *   occupancy per model.
 * Public surface: registerSubsystemCommands, SubsystemCommandDependencies.
 * Does NOT own: the transition seam (`App.tsx::switchLayout`), the tab
 *   mechanics (`App.tsx` supplies `openWorkspace`), the workspace body, or
 *   the strata.
 * Contract: [[M'-SYSTEM-SPEC]] :119 / :176 · [[CHROME-CONTRACT]] §11 ·
 *   [[DR-SUBSYS-1]] · rerun tranche [[52.T5]].
 */

import { commands } from './registry';
import type { SubsystemPageId } from '../ui/subsystemPages';

export interface SubsystemCommandDependencies {
    /** Opens (or re-selects) the page's workspace tab in the active face's
     *  deep model, switching to `ide-deep` through the one transition seam
     *  first when needed. Owned by `App.tsx`. */
    readonly openWorkspace: (page: SubsystemPageId) => void;
}

/** Registers the six `subsystem.open.*` commands. Returns one disposer. */
export function registerSubsystemCommands(
    dependencies: SubsystemCommandDependencies
): () => void {
    const disposers = [
        commands.register({
            id: 'subsystem.open.m0',
            title: "Subsystem: Open M0' Bimba Map page",
            run: () => dependencies.openWorkspace('m0')
        }),
        commands.register({
            id: 'subsystem.open.m1',
            title: "Subsystem: Open M1' Traversal page",
            run: () => dependencies.openWorkspace('m1')
        }),
        commands.register({
            id: 'subsystem.open.m2',
            title: "Subsystem: Open M2' Matrix page",
            run: () => dependencies.openWorkspace('m2')
        }),
        commands.register({
            id: 'subsystem.open.m3',
            title: "Subsystem: Open M3' Clock Cosmos page",
            run: () => dependencies.openWorkspace('m3')
        }),
        commands.register({
            id: 'subsystem.open.m4',
            title: "Subsystem: Open M4' Nara page",
            run: () => dependencies.openWorkspace('m4')
        }),
        commands.register({
            id: 'subsystem.open.m5',
            title: "Subsystem: Open M5' Epii IDE page",
            run: () => dependencies.openWorkspace('m5')
        })
    ];
    return () => disposers.forEach(dispose => dispose());
}
