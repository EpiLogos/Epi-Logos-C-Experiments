/**
 * Coordinate: M5-3' Frontend Studio — the pane registry (rerun 51.T51.2)
 * Residency: Body/M/pratibimba-app/src/panes/frontendStudio/paneRegistry.ts
 * Position (#n): #4 — Context/Type: the type law of what "a registered pane"
 *   IS, and the live ledger of what the shell actually mounted and rendered.
 * Actualises: the missing data-driven registry [[51.T51.2]] names in its own
 *   words — "there is no data-driven pane registry today; the pane 'registry'
 *   is the hand-written `switch` in `App.tsx`". The tranche's acceptance is
 *   that the studio "must read the real registries the app boots from, so it
 *   cannot drift from what actually rendered". This module supplies exactly
 *   that, in three readings, and it deliberately holds NO hand-written pane
 *   list of its own — a second list would be the drift the tranche forbids:
 *
 *   1. MOUNTED (`publishRegisteredPanes`) — walked off the live flexlayout
 *      `Model` objects by the shell, one row per (face × layout × node). This
 *      is "which panes are registered": not a declaration ABOUT the models,
 *      the models themselves. The precedent is `App.tsx`'s own `activePaneSet`
 *      walk (52.T4), widened from the active cell to all four cells.
 *   2. RENDERED (`recordPaneRender`) — the factory calls this on every render
 *      it performs. A pane that is mounted in a model but never rendered is
 *      visible AS that, and a pane rendered from a component key no model
 *      carries (a dynamic tab, a legacy saved layout) is visible too. This is
 *      the "cannot drift from what actually rendered" half, literally.
 *   3. DECLARED (`paneDeclarations`) — attribution, derived by re-reading the
 *      declaration modules that already exist (`ui/deepPaneSet.ts`,
 *      `panes/omni/omnipanelRuntime.ts`, `ui/subsystemPages.ts`,
 *      `commands/crossLayoutIntent.ts`). No row is transcribed here; each is
 *      projected from its owner, so a surface added there appears here.
 *
 *   Composition (`compositionSlotOccupancy`, `integratedPluginRecords`) is
 *   read the same way: the two integrated compositions are run through the
 *   REAL `loadComposition` law (the same call the engines make), never a
 *   restatement of who owns what.
 *
 *   WHY THE SWITCH STAYS. `App.tsx::factory` keeps its `case` arms because
 *   three existing validators AST-walk that function as the live chrome
 *   registry (`chromeContract.test.ts`, `ui/deepPaneSet.test.ts`,
 *   `composition/waveCContributions.test.ts`). Moving the arms into a table
 *   here would blind all three. So the factory stays the RENDER dispatch and
 *   this module is the OBSERVATION surface over it — one instrumentation call
 *   at the top of the factory, and the ledger is exact by construction rather
 *   than by a list somebody has to remember to update.
 * Public surface: PaneSlotKind, RegisteredPaneMount, PaneRenderRecord,
 *   PaneRegistrySnapshot, PaneDeclarationKind, PaneDeclaration,
 *   CompositionSlotOccupancy, IntegratedPluginRecord, recordPaneRender,
 *   publishRegisteredPanes, paneRegistrySnapshot, subscribePaneRegistry,
 *   usePaneRegistry, resetPaneRegistry, paneDeclarations, declarationsFor,
 *   compositionSlotOccupancy, integratedPluginRecords, paneInventory,
 *   PaneInventoryRow.
 * Does NOT own: the factory (`App.tsx`), any pane body, the deep pane set,
 *   the omni manifest, the subsystem pages, the composition law, or the
 *   CHROME-CONTRACT §2 table. This module observes and attributes; it
 *   declares no surface and mounts nothing.
 * Contract: rerun tranche [[51.T51.2]] · [[M5'-SPEC]] "Sixfold IDE Surface"
 *   (M5-3' Frontend Studio) · [[CHROME-CONTRACT]] §2.
 */

import { useSyncExternalStore } from 'react';
import {
    DEEP_PANE_RESERVATIONS,
    DEEP_PANE_SET,
    DEEP_PANE_WITHDRAWALS
} from '../../ui/deepPaneSet';
import { OMNIPANEL_TABS } from '../omni/omnipanelRuntime';
import { SUBSYSTEM_PAGES } from '../../ui/subsystemPages';
import { CROSS_LAYOUT_INTENT_TARGETS } from '../../commands/crossLayoutIntent';
import { GEOMETRIC_SLOTS, type IntegratedGeometricSlot } from '../../composition/geometricSlotEnforcement';
import {
    COSMIC_COMPOSITION_CONTRIBUTORS,
    loadCosmicComposition
} from '../../composition/cosmicComposition';
import {
    PERSONAL_COMPOSITION_CONTRIBUTORS,
    PERSONAL_SLOT_BLOCKERS,
    loadPersonalComposition
} from '../../composition/personalComposition';
import { describeCompositionLoad, type LoadCompositionResult } from '../../composition/compositionLoad';
import { COMPOSITION_IDS, type IntegratedCompositionId } from '../../composition/compositionState';
import type { LayoutId } from '../../ui/layoutId';

/** Where in a flexlayout model a mounted tab sits. `right-membrane` is the
 *  `/` OmniPanel border; `left` is the activity-bar rail; `main` is a main
 *  tabset. Anything else stays honestly `other` rather than being guessed. */
export type PaneSlotKind = 'main' | 'left' | 'right-membrane' | 'other';

/** One mounted tab, as read off a live flexlayout model. */
export interface RegisteredPaneMount {
    /** flexlayout component key — the factory's `case` label. */
    readonly component: string;
    readonly nodeId: string;
    readonly name: string;
    readonly face: 0 | 1;
    readonly layout: LayoutId;
    readonly slot: PaneSlotKind;
    readonly selected: boolean;
}

/** What the factory actually rendered, per component key. */
export interface PaneRenderRecord {
    readonly component: string;
    readonly renders: number;
    readonly firstAtMs: number;
    readonly lastAtMs: number;
}

export interface PaneRegistrySnapshot {
    /** Bumped on every observed change; the `useSyncExternalStore` identity. */
    readonly revision: number;
    readonly mounts: readonly RegisteredPaneMount[];
    readonly renders: readonly PaneRenderRecord[];
}

const EMPTY_SNAPSHOT: PaneRegistrySnapshot = Object.freeze({
    revision: 0,
    mounts: Object.freeze([]) as readonly RegisteredPaneMount[],
    renders: Object.freeze([]) as readonly PaneRenderRecord[]
});

let snapshot: PaneRegistrySnapshot = EMPTY_SNAPSHOT;
const renderLedger = new Map<string, { renders: number; firstAtMs: number; lastAtMs: number }>();
const listeners = new Set<() => void>();
let notifyQueued = false;

/** Notification is deferred to a microtask ON PURPOSE: `recordPaneRender` is
 *  called from inside the flexlayout factory, i.e. during another component's
 *  render. Waking subscribers synchronously there is the classic
 *  "cannot update a component while rendering a different component" fault. */
function notify(): void {
    if (notifyQueued || listeners.size === 0) {
        return;
    }
    notifyQueued = true;
    queueMicrotask(() => {
        notifyQueued = false;
        for (const listener of [...listeners]) {
            listener();
        }
    });
}

function renderRows(): readonly PaneRenderRecord[] {
    return Object.freeze(
        [...renderLedger.entries()]
            .map(([component, row]) => Object.freeze({ component, ...row }))
            .sort((a, b) => a.component.localeCompare(b.component))
    );
}

/**
 * Record one factory render. Called by `App.tsx::factory` for every pane it
 * renders — including the `unknown pane` fallback, because a component key
 * with no arm is exactly the kind of drift this ledger exists to expose.
 */
export function recordPaneRender(component: string): void {
    const now = Date.now();
    const existing = renderLedger.get(component);
    renderLedger.set(
        component,
        existing
            ? { renders: existing.renders + 1, firstAtMs: existing.firstAtMs, lastAtMs: now }
            : { renders: 1, firstAtMs: now, lastAtMs: now }
    );
    snapshot = Object.freeze({
        revision: snapshot.revision + 1,
        mounts: snapshot.mounts,
        renders: renderRows()
    });
    notify();
}

/**
 * Publish the shell's live model inventory. The shell owns the walk (it holds
 * the four `Model` objects); this module owns the ledger. Republishing an
 * identical inventory is a no-op, so the shell may call it on every render.
 */
export function publishRegisteredPanes(mounts: readonly RegisteredPaneMount[]): void {
    const frozen = Object.freeze(mounts.map(mount => Object.freeze({ ...mount })));
    if (
        frozen.length === snapshot.mounts.length
        && frozen.every((mount, index) => {
            const previous = snapshot.mounts[index];
            return (
                previous.component === mount.component
                && previous.nodeId === mount.nodeId
                && previous.name === mount.name
                && previous.face === mount.face
                && previous.layout === mount.layout
                && previous.slot === mount.slot
                && previous.selected === mount.selected
            );
        })
    ) {
        return;
    }
    snapshot = Object.freeze({
        revision: snapshot.revision + 1,
        mounts: frozen,
        renders: snapshot.renders
    });
    notify();
}

export function paneRegistrySnapshot(): PaneRegistrySnapshot {
    return snapshot;
}

export function subscribePaneRegistry(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function usePaneRegistry(): PaneRegistrySnapshot {
    return useSyncExternalStore(subscribePaneRegistry, paneRegistrySnapshot, paneRegistrySnapshot);
}

/** Tests only — the ledger is process-global by design (the shell is one). */
export function resetPaneRegistry(): void {
    renderLedger.clear();
    snapshot = EMPTY_SNAPSHOT;
    notify();
}

/** How a component key came to be declarable. */
export type PaneDeclarationKind =
    | 'deep-mount'
    | 'deep-reservation'
    | 'deep-withdrawal'
    | 'omni-fold'
    | 'subsystem-page'
    | 'subsystem-stratum'
    | 'intent-target';

export interface PaneDeclaration {
    readonly component: string;
    readonly label: string;
    readonly kind: PaneDeclarationKind;
    /** The module this row was projected FROM — never a transcription. */
    readonly declaredBy: string;
    readonly note: string;
}

/**
 * Every declaration the app's own registries make about a component key,
 * projected from those modules at call time. Deliberately NOT memoised into a
 * frozen constant: a caller that mutates a registry in a test sees the truth.
 */
export function paneDeclarations(): readonly PaneDeclaration[] {
    const rows: PaneDeclaration[] = [];
    for (const mount of DEEP_PANE_SET) {
        rows.push({
            component: mount.surfaceId,
            label: mount.label,
            kind: 'deep-mount',
            declaredBy: 'ui/deepPaneSet.ts',
            note: mount.why
        });
    }
    for (const reservation of DEEP_PANE_RESERVATIONS) {
        rows.push({
            component: reservation.surfaceId,
            label: reservation.surfaceId,
            kind: 'deep-reservation',
            declaredBy: 'ui/deepPaneSet.ts',
            note: `reserved for ${reservation.owner}; must stay out of the factory until its tranche lands`
        });
    }
    for (const withdrawal of DEEP_PANE_WITHDRAWALS) {
        rows.push({
            component: withdrawal.surfaceId,
            label: withdrawal.surfaceId,
            kind: 'deep-withdrawal',
            declaredBy: 'ui/deepPaneSet.ts',
            note: withdrawal.why
        });
    }
    for (const tab of OMNIPANEL_TABS) {
        rows.push({
            component: tab.component,
            label: tab.label,
            kind: 'omni-fold',
            declaredBy: 'panes/omni/omnipanelRuntime.ts',
            note: `\`/\` membrane fold \`${tab.id}\` (${tab.owningTranche}); landed: ${tab.landed}`
        });
    }
    for (const page of SUBSYSTEM_PAGES) {
        rows.push({
            component: page.surfaceId,
            label: page.tabLabel,
            kind: 'subsystem-page',
            declaredBy: 'ui/subsystemPages.ts',
            note: page.essence
        });
        for (const stratum of page.strata) {
            if (stratum.surfaceId) {
                rows.push({
                    component: stratum.surfaceId,
                    label: stratum.label,
                    kind: 'subsystem-stratum',
                    declaredBy: 'ui/subsystemPages.ts',
                    note: `${page.coordinate} stratum ${stratum.stratum} — ${stratum.why}`
                });
            }
        }
    }
    for (const target of CROSS_LAYOUT_INTENT_TARGETS) {
        rows.push({
            component: target.component,
            label: target.label,
            kind: 'intent-target',
            declaredBy: 'commands/crossLayoutIntent.ts',
            note: `cross-layout intent receiver for ${target.extensionId}/${target.contributionId}`
        });
    }
    return Object.freeze(rows.map(row => Object.freeze(row)));
}

export function declarationsFor(component: string): readonly PaneDeclaration[] {
    return paneDeclarations().filter(row => row.component === component);
}

/** One inventory row: a component key with everything known about it. */
export interface PaneInventoryRow {
    readonly component: string;
    readonly mounts: readonly RegisteredPaneMount[];
    readonly declarations: readonly PaneDeclaration[];
    readonly renders: number;
    readonly lastRenderAtMs: number | null;
    /** Mounted in a live model but the factory has never rendered it. */
    readonly mountedNeverRendered: boolean;
    /** Rendered by the factory but present in no live model — a dynamic tab
     *  that has since closed, or a saved-layout key. Honest, not an error. */
    readonly renderedUnmounted: boolean;
    /** Declared somewhere but neither mounted nor rendered — a reserved seam. */
    readonly declaredOnly: boolean;
}

/**
 * The joined inventory: every component key any of the three readings knows
 * about, in one sorted table. This is what the studio renders, and what the
 * UF e2e asserts against the app's real models.
 */
export function paneInventory(
    state: PaneRegistrySnapshot = paneRegistrySnapshot()
): readonly PaneInventoryRow[] {
    const declarations = paneDeclarations();
    const keys = new Set<string>();
    for (const mount of state.mounts) keys.add(mount.component);
    for (const record of state.renders) keys.add(record.component);
    for (const declaration of declarations) keys.add(declaration.component);
    return Object.freeze(
        [...keys]
            .sort((a, b) => a.localeCompare(b))
            .map(component => {
                const mounts = state.mounts.filter(mount => mount.component === component);
                const record = state.renders.find(row => row.component === component);
                const rows = declarations.filter(row => row.component === component);
                return Object.freeze({
                    component,
                    mounts: Object.freeze(mounts),
                    declarations: Object.freeze(rows),
                    renders: record?.renders ?? 0,
                    lastRenderAtMs: record?.lastAtMs ?? null,
                    mountedNeverRendered: mounts.length > 0 && !record,
                    renderedUnmounted: mounts.length === 0 && record !== undefined,
                    declaredOnly: mounts.length === 0 && !record && rows.length > 0
                });
            })
    );
}

/** One geometric composition slot and who actually holds it after the load. */
export interface CompositionSlotOccupancy {
    readonly slot: IntegratedGeometricSlot;
    readonly compositionId: IntegratedCompositionId | null;
    readonly owner: string | null;
    readonly handleClass: string | null;
    /** A registered blocker id when the slot is owned but cannot render. */
    readonly blockedBy: string | null;
}

/**
 * The composition-slot occupancy, computed by running BOTH integrated
 * compositions through the real `loadComposition` law — the same call the two
 * engines make at mount. A slot with no granted claim reads as unfilled, and
 * a slot with a registered blocker names it.
 */
export function compositionSlotOccupancy(): readonly CompositionSlotOccupancy[] {
    const results: ReadonlyArray<readonly [IntegratedCompositionId, LoadCompositionResult]> = [
        ['cosmic-engine.integrated', loadCosmicComposition()],
        ['jiva-siva.integrated', loadPersonalComposition()]
    ];
    const blockers = PERSONAL_SLOT_BLOCKERS as Readonly<Record<string, string | undefined>>;
    return Object.freeze(
        GEOMETRIC_SLOTS.map(slot => {
            for (const [compositionId, result] of results) {
                if (!result.ok) {
                    continue;
                }
                const granted = result.mounted.grantedGeometricClaims.find(
                    claim => claim.geometricSlot === slot
                );
                if (granted) {
                    return Object.freeze({
                        slot,
                        compositionId,
                        owner: granted.extensionId,
                        handleClass: granted.handleClass,
                        blockedBy: blockers[slot] ?? null
                    });
                }
            }
            return Object.freeze({
                slot,
                compositionId: null,
                owner: null,
                handleClass: null,
                blockedBy: blockers[slot] ?? null
            });
        })
    );
}

/** One integrated plugin composition, as the load law actually resolved it. */
export interface IntegratedPluginRecord {
    readonly compositionId: IntegratedCompositionId;
    readonly contributors: readonly string[];
    readonly mounted: boolean;
    readonly grantedSlots: readonly string[];
    /** The load's own one-line statement — refusal NAMES the contributor. */
    readonly description: string;
}

/** The two integrated plugin compositions (`composition/compositionState.ts`
 *  `COMPOSITION_IDS`), each run through the real load. */
export function integratedPluginRecords(): readonly IntegratedPluginRecord[] {
    const byId: Readonly<Record<IntegratedCompositionId, () => LoadCompositionResult>> = {
        'cosmic-engine.integrated': loadCosmicComposition,
        'jiva-siva.integrated': loadPersonalComposition
    };
    const contributorsById: Readonly<Record<IntegratedCompositionId, readonly string[]>> = {
        'cosmic-engine.integrated': COSMIC_COMPOSITION_CONTRIBUTORS.map(c => c.extensionId),
        'jiva-siva.integrated': PERSONAL_COMPOSITION_CONTRIBUTORS.map(c => c.extensionId)
    };
    return Object.freeze(
        COMPOSITION_IDS.map(compositionId => {
            const result = byId[compositionId]();
            return Object.freeze({
                compositionId,
                contributors: Object.freeze([...contributorsById[compositionId]]),
                mounted: result.ok,
                grantedSlots: Object.freeze(
                    result.ok
                        ? result.mounted.grantedGeometricClaims.map(claim => claim.geometricSlot)
                        : []
                ),
                description: describeCompositionLoad(result)
            });
        })
    );
}
