/**
 * Coordinate: M' shell chrome (application-shell slot policy — 31.T31.7)
 * Residency: Body/M/pratibimba-app/src/ui/shellSlotPolicy.ts
 * Position (#n): #4 — the type law of the shell's six slots
 * Actualises: the per-slot ownership contract for the carrier's application
 *   shell (CC-07, CCT-7 + 15-foundation principles 5, 6, 7). The Theia
 *   `shell-slot-policy.json` + extension-preflight lint are DEAD under the
 *   retarget (no Theia ApplicationShell, no `frontend-module.ts` extensions);
 *   what survives is the CONTENT-LAW — which surface owns each slot and under
 *   what discipline — mapped onto the carrier's real regions:
 *     top → coordinate breadcrumb (31.6)   · main → the FlexLayout faces
 *     right → OmniPanel `/` membrane        · left → activity-bar mode registry
 *     bottom → uninhabited                  · status-bar → six state threads
 *   The sibling validator (shellSlotPolicy.test.tsx) holds the carrier shell in
 *   lockstep with this contract — an over-stacked or mis-owned slot fails it.
 *
 *   52.T4 added `layoutVaried` and reconciled it against the shell the deep
 *   pane set actually builds: `left` and `main` differ between `daily-0-1` and
 *   `ide-deep`; `bottom` — previously the ONLY slot declared per-layout — is
 *   composed by neither layout. Per-layout-ness is a property of the slot's
 *   CONTENT and is therefore declared beside `policy`, not inside it.
 *   32.T32.9 replaced the bare `STATE_THREAD_COUNT = 6` with the six threads
 *   THEMSELVES (`STATUS_STRIP_THREADS`) and derived the count from them. The
 *   count alone could not carry the 15.10 clause that tranche had to honour —
 *   "the preference HIDES the entry but does NOT remove it from the contract;
 *   still exactly 6 entries declared" — because a bare 6 says nothing about
 *   WHICH six, so "declared but not rendered" was unrepresentable. It also let
 *   two other spellings of the list drift: the walkthrough's status-bar step
 *   named "profile generation" as a thread the strip has never had, and omitted
 *   the supervisor thread it does have. Both now read this register.
 * Public surface: ShellSlotId, SlotPolicy, ShellSlot, SHELL_SLOT_POLICY,
 *   shellSlot, StatusStripThreadId, StatusStripThread, STATUS_STRIP_THREADS,
 *   STATE_THREAD_COUNT.
 * Does NOT own: the surfaces themselves (StatusStrip, CoordinateBreadcrumb,
 *   OmniPanel, leftSidebarModes, the FlexLayout faces) — it names their slots;
 *   which thread may be HIDDEN and by which preference (ui/profileTickVisibility,
 *   32.T32.9).
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[31.T31.7]] (CC-07 / CCT-7).
 */

export type ShellSlotId = 'top' | 'main' | 'right' | 'left' | 'bottom' | 'status-bar';

export type SlotPolicy =
    | 'exclusive'
    | 'composition'
    | 'activity-bar-switched'
    | 'per-layout'
    | 'discipline';

export interface ShellSlot {
    readonly id: ShellSlotId;
    readonly policy: SlotPolicy;
    /** The carrier surface(s) that own the slot. Exclusive slots name ONE owner;
     *  a `per-layout` slot names its layouts. */
    readonly owner: string;
    /** The 15-foundation principle / surface contract behind the policy. */
    readonly rationale: string;
    /**
     * 52.T4 — does the slot's CONTENT actually differ between `daily-0-1` and
     * `ide-deep` in the shell as built? Orthogonal to `policy`: a slot can be
     * activity-bar-switched AND per-layout, and a slot whose POLICY says
     * per-layout can still be inhabited by neither layout. Declaring this
     * separately is what stops the two claims from being confused — which is
     * exactly what happened before this tranche, when `bottom` was the only
     * slot marked per-layout and was the one slot no layout composed at all.
     */
    readonly layoutVaried: boolean;
    /** `discipline` slots pin an exact contributor count (status-bar = six). */
    readonly exactCount?: number;
}

export type StatusStripThreadId =
    | 'profile-tick'
    | 'day-now'
    | 'session'
    | 'gateway'
    | 'supervisor'
    | 'coordinate';

export interface StatusStripThread {
    readonly id: StatusStripThreadId;
    /** The thread's name in prose — what the walkthrough calls it. */
    readonly label: string;
    /** The entry's `data-testid` in the rendered strip. DECLARED here even when
     *  a preference hides the entry: 15.10 pins the contract, not the paint. */
    readonly testId: string;
}

/**
 * The six state-thread entries the status bar admits (15.10 discipline,
 * re-grounded as threads-not-widgets by DR-FACE-7 §3).
 *
 * `profile-tick` carries BOTH threads 15.10 names separately — "profile-tick
 * state" and "profile generation" — because in this carrier they are one
 * reading of one clock; 32.T32.9 made the entry say so out loud (`tick:n
 * gen:g`) rather than printing the generation under the word "tick". The
 * carrier's sixth thread is the gateway SUPERVISOR, which is carrier-truth
 * (boot = supervise, DR-FACE-2) and has no Theia equivalent.
 */
export const STATUS_STRIP_THREADS: readonly StatusStripThread[] = Object.freeze([
    { id: 'profile-tick', label: 'profile-tick and generation', testId: 'status-tick' },
    { id: 'day-now', label: 'day-now anchor', testId: 'status-daynow' },
    { id: 'session', label: 'session id', testId: 'status-session' },
    { id: 'gateway', label: 'gateway readiness', testId: 'status-gateway' },
    { id: 'supervisor', label: 'gateway supervisor', testId: 'status-supervisor' },
    { id: 'coordinate', label: 'active coordinate', testId: 'status-coordinate' }
] as const);

/** The 15.10 count, DERIVED from the declaration so the two cannot disagree. */
export const STATE_THREAD_COUNT = STATUS_STRIP_THREADS.length;

export const SHELL_SLOT_POLICY: readonly ShellSlot[] = Object.freeze([
    {
        id: 'top',
        policy: 'exclusive',
        owner: 'coordinate-breadcrumb',
        rationale: 'CCT-11: the coordinate breadcrumb (31.6) owns the top of the editor area; nothing else stacks there.',
        layoutVaried: false
    },
    {
        id: 'main',
        policy: 'composition',
        owner: 'flexlayout-faces',
        rationale: '15.4 composition-over-juxtaposition: the 0/1 faces compose ONE editor area, never side-by-side panes. 52.T4: the editor area is still ONE tabset per face — the deep layout does NOT split it — but WHICH tabset differs per layout (`cosmic-main`/`personal-main` vs `cosmic-deep-main`/`personal-deep-main`, `ui/deepPaneSet.ts`).',
        layoutVaried: true
    },
    {
        id: 'right',
        policy: 'exclusive',
        owner: 'omnipanel',
        rationale: '15-foundation principle 5: the OmniPanel IS the right membrane (the `/` operator overlay). All ten folds declare `availableInLayouts` for BOTH layouts, so the membrane is layout-invariant by manifest (`panes/omni/omnipanelRuntime.ts`).',
        layoutVaried: false
    },
    {
        id: 'left',
        policy: 'activity-bar-switched',
        owner: 'left-sidebar-modes',
        rationale: '15-foundation principle 7: activity-bar discipline — modes switch within the slot; widgets are NOT stacked. 52.T4 made the slot per-layout for the first time: `daily-0-1` carries the face-1 lived-reading rail and gives face 0 no left border at all, while `ide-deep` carries the IDE explorer rail (Vault + Connections) on BOTH faces. The POLICY stays activity-bar-switched — 52.T6 is what makes the switching itself real, and `LEFT_SIDEBAR_MODES` already declares two `ide-deep`-only modes that this rail is the home for.',
        layoutVaried: true
    },
    {
        id: 'bottom',
        policy: 'per-layout',
        owner: 'unclaimed',
        rationale: '15 Surface Contracts: IF a bottom area is composed it is composed per layout. 52.T4 reconciliation: NEITHER carrier layout composes one, so this row states the law for an uninhabited slot — it was the only slot flagged per-layout while being the one slot no layout inhabits, which read as a per-layout shell that did not exist. What actually varies per layout is `left` and `main`.',
        layoutVaried: false
    },
    {
        id: 'status-bar',
        policy: 'discipline',
        owner: 'status-strip',
        rationale: '15.10 status-bar discipline: exactly six state-thread entries; navigation chips only on the right.',
        layoutVaried: false,
        exactCount: STATE_THREAD_COUNT
    }
]);

export function shellSlot(id: ShellSlotId): ShellSlot {
    const slot = SHELL_SLOT_POLICY.find(entry => entry.id === id);
    if (!slot) {
        throw new Error(`unknown shell slot: ${id}`);
    }
    return slot;
}
