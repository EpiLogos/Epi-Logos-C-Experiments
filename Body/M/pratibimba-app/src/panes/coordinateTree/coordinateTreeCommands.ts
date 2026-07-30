/**
 * Coordinate: M' M0' chrome (the tree's six bulk-expand commands — 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree/coordinateTreeCommands.ts
 * Position (#n): #2 — Operation.
 * Actualises: tranche 28.6 (d)'s per-family bulk-expand commands
 *   (`pratibimba.coordinate-tree.expand-family.{P|S|T|M|L|C}`) on the ONE
 *   command registry. DATA-DRIVEN over the same frozen tables the pane renders
 *   from — `COORDINATE_TREE_FAMILY_ROOTS` for the ids and `FAMILY_NAMES` for
 *   the titles — so `catalog.test.ts` reconstructs the six rows from the source
 *   of truth rather than re-typing them, exactly as it does for the four M0
 *   layer-rail commands. Retyping six ids in two places is how a catalog drifts.
 *
 *   Expand-only, deliberately: the spec names bulk EXPAND, and a family root's
 *   own arrow already collapses its whole subtree in one gesture. A command
 *   that toggled would do different things on different runs.
 * Public surface: COORDINATE_TREE_EXPAND_COMMAND_PREFIX,
 *   coordinateTreeExpandCommandId, coordinateTreeExpandCommandTitle,
 *   registerCoordinateTreeCommands.
 * Does NOT own: the expand set (`coordinateTreeModel.ts`), the registry
 *   (`commands/registry.ts`), the catalog (`commands/catalog.ts` — which must
 *   AGREE with this, and is gated both directions).
 * Contract: [[CHROME-CONTRACT]] §3 + §10 · rerun tranche [[28.T28.6]].
 */

import { FAMILY_NAMES } from '../../ui/coordinateNames';
import type { FamilyLetter } from '../../ui/tokens';
import { COORDINATE_TREE_FAMILY_ROOTS, useCoordinateTreeStore } from './coordinateTreeModel';

export const COORDINATE_TREE_EXPAND_COMMAND_PREFIX = 'pratibimba.coordinate-tree.expand-family.';

export function coordinateTreeExpandCommandId(family: FamilyLetter): string {
    return `${COORDINATE_TREE_EXPAND_COMMAND_PREFIX}${family}`;
}

export function coordinateTreeExpandCommandTitle(family: FamilyLetter): string {
    return `Coordinate Tree: Expand ${FAMILY_NAMES[family]} family (${family})`;
}

interface CommandRegistryLike {
    register(command: { id: string; title: string; run: () => void }): () => void;
}

/** Returns disposers, mirroring `registerEngineCommands` / `registerThemeCommands`. */
export function registerCoordinateTreeCommands(registry: CommandRegistryLike): (() => void)[] {
    return COORDINATE_TREE_FAMILY_ROOTS.map(family =>
        registry.register({
            id: coordinateTreeExpandCommandId(family),
            title: coordinateTreeExpandCommandTitle(family),
            run: () => useCoordinateTreeStore.getState().expandFamily(family)
        })
    );
}
