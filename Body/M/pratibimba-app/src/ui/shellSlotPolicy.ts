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
 *     top → coordinate breadcrumb (31.6)   · main → the 0/1 FlexLayout faces
 *     right → OmniPanel `/` membrane        · left → activity-bar mode registry
 *     bottom → per-layout composition        · status-bar → six state threads
 *   The sibling validator (shellSlotPolicy.test.tsx) holds the carrier shell in
 *   lockstep with this contract — an over-stacked or mis-owned slot fails it.
 * Public surface: ShellSlotId, SlotPolicy, ShellSlot, SHELL_SLOT_POLICY,
 *   shellSlot, STATE_THREAD_COUNT.
 * Does NOT own: the surfaces themselves (StatusStrip, CoordinateBreadcrumb,
 *   OmniPanel, leftSidebarModes, the FlexLayout faces) — it names their slots.
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
    /** `discipline` slots pin an exact contributor count (status-bar = six). */
    readonly exactCount?: number;
}

/** The six state-thread entries the status bar admits (15.10 discipline). */
export const STATE_THREAD_COUNT = 6;

export const SHELL_SLOT_POLICY: readonly ShellSlot[] = Object.freeze([
    {
        id: 'top',
        policy: 'exclusive',
        owner: 'coordinate-breadcrumb',
        rationale: 'CCT-11: the coordinate breadcrumb (31.6) owns the top of the editor area; nothing else stacks there.'
    },
    {
        id: 'main',
        policy: 'composition',
        owner: 'flexlayout-faces',
        rationale: '15.4 composition-over-juxtaposition: the 0/1 faces compose ONE editor area, never side-by-side panes.'
    },
    {
        id: 'right',
        policy: 'exclusive',
        owner: 'omnipanel',
        rationale: '15-foundation principle 5: the OmniPanel IS the right membrane (the `/` operator overlay).'
    },
    {
        id: 'left',
        policy: 'activity-bar-switched',
        owner: 'left-sidebar-modes',
        rationale: '15-foundation principle 7: activity-bar discipline — modes switch within the slot; widgets are NOT stacked.'
    },
    {
        id: 'bottom',
        policy: 'per-layout',
        owner: 'daily-0-1 | ide-deep',
        rationale: '15 Surface Contracts: bottom-area composition differs per layout.'
    },
    {
        id: 'status-bar',
        policy: 'discipline',
        owner: 'status-strip',
        rationale: '15.10 status-bar discipline: exactly six state-thread entries; navigation chips only on the right.',
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
