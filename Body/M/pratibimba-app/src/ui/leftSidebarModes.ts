/**
 * Coordinate: M' shell (left-sidebar activity-bar mode registry — Track 15.T15.3)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position: #4 — Context/Type (the mode inventory IS the type law of the
 *   carrier's left-sidebar activity-bar surface)
 * Actualises: the typed left-sidebar MODE REGISTRY as spine grammar — the
 *   activity-bar mode inventory (id, label, CHROME-CONTRACT §2 surface id,
 *   the layouts each mode appears in, and the honest pending-owner marker for
 *   surfaces whose bodies are 28.x's lane), plus the mode-switch sub-record
 *   (`useLeftSidebarModeStore`) that survives the 0/1 face toggle as a
 *   module-scope zustand singleton — the `mode` field of the 15.7
 *   `BimbaPratibimbaUiState` contract. Exactly three modes for `daily-0-1`
 *   (Coordinate Tree · Bimba Graph Viewer · Canon Studio) and five for
 *   `ide-deep` (+ Backend Studio · Smart Connections). Switching among LIVE
 *   surfaces rides the command spine; PENDING modes register with an honest
 *   marker and never mount a fabricated body.
 * Public surface: LeftSidebarMode, LeftSidebarModeId, LeftSidebarLayoutId,
 *   LEFT_SIDEBAR_MODES, DEFAULT_LEFT_SIDEBAR_MODE, modesForLayout,
 *   isModeAvailableInLayout, resolveModeForLayout, useLeftSidebarModeStore,
 *   registerLeftSidebarModeCommands.
 * Does NOT own: the pane bodies (28.13 backendStudio still owns its own;
 *   `coordinateTree`, `semanticConnections`, `bimbaGraph` and `editor` are live),
 *   the CHROME-CONTRACT §2 surface table (this module must AGREE with it, not
 *   define it), the shell's face state or layout persistence (App.tsx), the
 *   four singleton stores (src/state/stores.ts).
 * Contract: Body/M/pratibimba-app/CHROME-CONTRACT.md §2 (surface ids) + §9.
 */

import { create } from 'zustand';

import type { LayoutId } from './layoutId';

/** The two shell layouts the activity-bar serves. `daily-0-1` is the live 0/1
 *  faces (cosmic 0 / personal 1); `ide-deep` is the 4+2 depth layout that adds
 *  the two developer surfaces. Alias of the one layout-id authority
 *  (`ui/layoutId.ts`, 52.T1). */
export type LeftSidebarLayoutId = LayoutId;

export type LeftSidebarModeId =
    | 'coordinate-tree'
    | 'bimba-graph'
    | 'canon-studio'
    | 'backend-studio'
    | 'smart-connections';

export interface LeftSidebarMode {
    readonly id: LeftSidebarModeId;
    readonly label: string;
    /** The CHROME-CONTRACT §2 surface id this mode activates — the carrier
     *  flexlayout component key. MUST be a §2 row (parity-checked in the test). */
    readonly surfaceId: string;
    /** Layouts this mode appears in. */
    readonly availableInLayouts: readonly LeftSidebarLayoutId[];
    /** Tranche that owns the pending surface body, or `null` when the surface
     *  is already live. A non-null marker is honest: the mode registers in the
     *  activity bar but never mounts a fabricated body — its owner (28.x) lands
     *  the real pane and flips its CHROME-CONTRACT §2 row to `live`. */
    readonly pendingOwner: string | null;
}

/**
 * The activity-bar mode inventory. Three modes belong to BOTH layouts (the
 * navigation backbone, the graph viewer, the canon editor); the two developer
 * surfaces belong to `ide-deep` only. Surface ids are CHROME-CONTRACT §2 keys:
 * `coordinateTree` (live — 28.T28.6 landed it in the daily face-1 border AND
 * both deep left rails, which is what makes this row's `availableInLayouts`
 * true rather than aspirational), `bimbaGraph` (live), `editor` (live — Canon
 * Studio read half), `backendStudio` (pending, 28.13), `semanticConnections`
 * (live).
 */
export const LEFT_SIDEBAR_MODES: readonly LeftSidebarMode[] = Object.freeze([
    {
        id: 'coordinate-tree',
        label: 'Coordinate Tree',
        surfaceId: 'coordinateTree',
        availableInLayouts: ['daily-0-1', 'ide-deep'],
        pendingOwner: null
    },
    {
        id: 'bimba-graph',
        label: 'Bimba Graph Viewer',
        surfaceId: 'bimbaGraph',
        availableInLayouts: ['daily-0-1', 'ide-deep'],
        pendingOwner: null
    },
    {
        id: 'canon-studio',
        label: 'Canon Studio',
        surfaceId: 'editor',
        availableInLayouts: ['daily-0-1', 'ide-deep'],
        pendingOwner: null
    },
    {
        id: 'backend-studio',
        label: 'Backend Studio',
        surfaceId: 'backendStudio',
        availableInLayouts: ['ide-deep'],
        pendingOwner: '28.13'
    },
    {
        id: 'smart-connections',
        label: 'Smart Connections',
        surfaceId: 'semanticConnections',
        availableInLayouts: ['ide-deep'],
        pendingOwner: null
    }
] as const);

/** Coordinate Tree is the navigation backbone — every surface roots here, so it
 *  is the default and the cross-layout fallback (it exists in both layouts). */
export const DEFAULT_LEFT_SIDEBAR_MODE: LeftSidebarModeId = 'coordinate-tree';

export function leftSidebarMode(id: LeftSidebarModeId): LeftSidebarMode {
    const mode = LEFT_SIDEBAR_MODES.find(m => m.id === id);
    if (!mode) {
        throw new Error(`unknown left-sidebar mode: ${id}`);
    }
    return mode;
}

/** The modes the activity bar shows for a layout, in declared order. */
export function modesForLayout(layout: LeftSidebarLayoutId): readonly LeftSidebarMode[] {
    return LEFT_SIDEBAR_MODES.filter(mode => mode.availableInLayouts.includes(layout));
}

export function isModeAvailableInLayout(
    modeId: LeftSidebarModeId,
    layout: LeftSidebarLayoutId
): boolean {
    const mode = LEFT_SIDEBAR_MODES.find(m => m.id === modeId);
    return !!mode && mode.availableInLayouts.includes(layout);
}

/**
 * Resolve the active mode across a layout change: keep it where it exists in
 * the target layout (cross-layout identity), else fall back to the default
 * backbone. A mode that only lives in `ide-deep` (Backend Studio, Smart
 * Connections) cannot survive into `daily-0-1` — it honestly falls back.
 */
export function resolveModeForLayout(
    modeId: LeftSidebarModeId,
    layout: LeftSidebarLayoutId
): LeftSidebarModeId {
    return isModeAvailableInLayout(modeId, layout) ? modeId : DEFAULT_LEFT_SIDEBAR_MODE;
}

export interface LeftSidebarModeState {
    /** The active activity-bar mode — the `mode` field of 15.7's
     *  BimbaPratibimbaUiState. A module-scope singleton: the ⌘. 0/1 face
     *  toggle re-renders the shell but never dispatches here, so the active
     *  mode is invariant across the toggle exactly as the coordinate/session
     *  singletons are. */
    activeModeId: LeftSidebarModeId;
    /** The layout the sidebar is currently rendering. */
    layout: LeftSidebarLayoutId;
    /** Activate a mode. No-op when the mode is not available in the current
     *  layout (you cannot open Backend Studio from `daily-0-1`). */
    setActiveMode(modeId: LeftSidebarModeId): void;
    /** Switch layout, preserving the active mode where it exists in the target
     *  layout, else falling back to the backbone. Returns the resolved mode. */
    switchLayout(layout: LeftSidebarLayoutId): LeftSidebarModeId;
}

export const useLeftSidebarModeStore = create<LeftSidebarModeState>((set, get) => ({
    activeModeId: DEFAULT_LEFT_SIDEBAR_MODE,
    layout: 'daily-0-1',
    setActiveMode: modeId => {
        if (isModeAvailableInLayout(modeId, get().layout)) {
            set({ activeModeId: modeId });
        }
    },
    switchLayout: layout => {
        const resolved = resolveModeForLayout(get().activeModeId, layout);
        set({ layout, activeModeId: resolved });
        return resolved;
    }
}));

interface CommandRegistryLike {
    register(command: {
        id: string;
        title: string;
        run: () => void;
        enabled?: () => boolean;
    }): () => void;
}

/**
 * Register one `leftSidebar.mode.<id>` command per mode on the command spine —
 * the "switching among live surfaces rides commands/registry" path. Each
 * command sets the active mode; a command is only enabled while its mode is
 * available in the current layout (Backend Studio / Smart Connections grey out
 * in `daily-0-1`). Pending modes register too — activating one records its id;
 * the honest pending pane (owned by 28.x) is what mounts, never a fabricated
 * body. Returns disposers, mirroring `registerEngineCommands`.
 *
 * NOT wired into App.tsx here (App.tsx is out of this tranche's write scope);
 * the controller wires it beside the other `register*Commands` calls.
 */
export function registerLeftSidebarModeCommands(
    commands: CommandRegistryLike,
    store: { getState(): LeftSidebarModeState } = useLeftSidebarModeStore
): (() => void)[] {
    return LEFT_SIDEBAR_MODES.map(mode =>
        commands.register({
            id: `leftSidebar.mode.${mode.id}`,
            title: `Left Sidebar: ${mode.label}`,
            enabled: () => isModeAvailableInLayout(mode.id, store.getState().layout),
            run: () => store.getState().setActiveMode(mode.id)
        })
    );
}
