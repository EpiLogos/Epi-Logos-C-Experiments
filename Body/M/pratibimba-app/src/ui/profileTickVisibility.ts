/**
 * Coordinate: M' shell (profile-tick visibility for new users — Track 32.T32.9;
 *   cross-link 15.6, 15.10)
 * Residency: Body/M/pratibimba-app/src/ui/profileTickVisibility.ts
 * Position (#n): #4 — Context/Type: the frame the clock is READ in, as distinct
 *   from the clock itself (state/stores + state/useProfileTick own that).
 * Actualises: tranche 32.9 of the design-recon spec
 *   `32-onboarding-settings-empty-states.md:259` — "Profile-tick is the
 *   foundation principle 2 substrate — every widget re-renders on tick advance.
 *   New users may find this disorienting ('things are changing on their own');
 *   32.9 makes it explicit."
 *
 *   THREE THINGS, ALL DERIVED FROM REAL FIRST-RUN STATE:
 *
 *   1. The READING. `tick:<n> gen:<g>` per spec :265. `gen` is the kernel
 *      generation off the wire. `tick` is `observedTicks` — the advances THIS
 *      shell has seen, counted inside the store's generation gate. The
 *      distinction is the whole tranche: the generation belongs to the gateway
 *      process (it is already in the hundreds when a client attaches to a
 *      long-running `epi gate start`), so it can never tell a new user whether
 *      the clock has started for them. `observedTicks` can, and it cannot be
 *      moved by a re-render — only by a frame that really passed the gate.
 *
 *   2. The BIRTH OF THE CLOCK. Spec :269 asks the cold-start splash to change
 *      from "Awaiting first profile-tick…" (shimmer, flavour `pending_first_tick`)
 *      to "Profile-tick 1 — system alive." (checkmark, `ready_public_current`)
 *      on the first advance. THE SPLASH DOES NOT EXIST IN THIS CARRIER — 32.1
 *      landed as pure branch functions (`onboarding/pasuOnboarding.ts`,
 *      `panes/kairosEnablement.ts`), never a six-stage splash surface, and
 *      `.boot-splash` is a one-line "pratibimba…" placeholder for an unbuilt
 *      model, not a stage readout. So the transition lands on the surface this
 *      tranche does own — the status entry — and the absence is recorded in
 *      `PROFILE_TICK_SEAMS` and held against the real tree by the sibling
 *      suite, which REDS the day a splash lands so the transition gets rehomed
 *      instead of silently existing twice.
 *
 *   3. The pre-tick words are BORROWED, not re-typed. `pending_first_tick`'s
 *      copy is the 32.5 grammar's, read through `flavourEntry`. Before this
 *      tranche every flavour copy was declared and rendered by nothing (the
 *      renderers took the flavour as a CSS class only); this is the first
 *      surface to say one out loud, and it says the grammar's exact string.
 *
 *   VISIBILITY IS LIVE STATE, NOT A STORAGE READ AT RENDER TIME. The Settings
 *   toggle and the status strip are different subtrees; a component reading
 *   `localStorage` during render subscribes to nothing and would keep painting
 *   the old answer after the toggle moved (the same defect `themeStore`'s
 *   header records for `document.dataset.theme`). One store, seeded from
 *   storage, written through one setter.
 * Public surface: PROFILE_TICK_VISIBLE_PREFERENCE, PROFILE_TICK_THREAD,
 *   PROFILE_TICK_VISIBLE_DEFAULT, readProfileTickVisible,
 *   ProfileTickVisibilityState, useProfileTickVisibilityStore,
 *   PROFILE_TICK_HISTORY_ROUTE, ProfileTickReadoutKind, ProfileTickReadout,
 *   FIRST_TICK_ANNOUNCEMENT, profileTickReadout, lastTickFiredIso,
 *   ProfileTickSeam, PROFILE_TICK_SEAMS.
 * Does NOT own: the clock (`state/stores.ts` counts, `state/useProfileTick.ts`
 *   is the one re-render seam), the preference key register
 *   (`ui/preferences.ts`), the six-thread declaration (`ui/shellSlotPolicy.ts`),
 *   the flavour copy (`ui/readinessGrammar.ts`), the Diagnostics tab contents
 *   (15.2 / `panes/omni/DiagnosticsPanel.tsx`), or the render
 *   (`components/StatusStrip.tsx`).
 * Contract: rerun tranche [[32.T32.9]] · [[CHROME-CONTRACT]] §2 · 15.10
 *   status-bar discipline.
 */

import { create } from 'zustand';

import { PREFERENCE_KEYS } from './preferences';
import { flavourEntry } from './readinessGrammar';
import { STATUS_STRIP_THREADS, type StatusStripThread } from './shellSlotPolicy';

/** Aliases the one preference-key authority (`ui/preferences.ts`, 31.T31.9). */
export const PROFILE_TICK_VISIBLE_PREFERENCE = PREFERENCE_KEYS.profileTickVisible;

/**
 * The one hideable thread, RESOLVED from the six-thread declaration rather than
 * spelled here. 15.10's clause is that hiding does not shrink the contract, so
 * the hideable entry has to be a row IN the contract — resolving it is what
 * makes that structurally true instead of merely asserted.
 */
export const PROFILE_TICK_THREAD: StatusStripThread = (() => {
    const thread = STATUS_STRIP_THREADS.find(entry => entry.id === 'profile-tick');
    if (!thread) {
        throw new Error('the status-bar contract declares no profile-tick thread');
    }
    return thread;
})();

/** Spec :263 — default `true`. */
export const PROFILE_TICK_VISIBLE_DEFAULT = true;

/**
 * Read the stored value. Only an explicit `false` hides the entry: an absent
 * key is a person who has never touched the setting, and the shipped answer for
 * them is ON. A stale or malformed value reads as the default rather than as
 * "hidden", because a storage accident must never silently remove a status
 * thread.
 */
export function readProfileTickVisible(raw: unknown): boolean {
    if (raw === false || raw === 'false') {
        return false;
    }
    return PROFILE_TICK_VISIBLE_DEFAULT;
}

function readStoredVisibility(storage?: Pick<Storage, 'getItem'>): boolean {
    const store = storage ?? (typeof localStorage === 'undefined' ? undefined : localStorage);
    if (!store) {
        return PROFILE_TICK_VISIBLE_DEFAULT;
    }
    try {
        const raw = store.getItem(PROFILE_TICK_VISIBLE_PREFERENCE);
        if (raw === null) {
            return PROFILE_TICK_VISIBLE_DEFAULT;
        }
        try {
            return readProfileTickVisible(JSON.parse(raw));
        } catch {
            return readProfileTickVisible(raw);
        }
    } catch {
        return PROFILE_TICK_VISIBLE_DEFAULT;
    }
}

export interface ProfileTickVisibilityState {
    /** Whether the status-bar entry is painted. The thread stays declared. */
    visible: boolean;
    setVisible(visible: boolean): void;
}

export const useProfileTickVisibilityStore = create<ProfileTickVisibilityState>(set => ({
    visible: readStoredVisibility(),
    setVisible: visible => {
        try {
            localStorage?.setItem(PROFILE_TICK_VISIBLE_PREFERENCE, JSON.stringify(visible));
        } catch {
            // a blocked or absent storage must never break the toggle
        }
        set({ visible });
    }
}));

/**
 * Spec :265 — "Click opens OmniPanel Diagnostics tab focused on profile-tick
 * history."
 *
 * The frozen spec's `omnipanel.openTab` does not exist in this carrier; the
 * catalogued route to Diagnostics is the CCT-4 chord command (⌘8), which is
 * also what the 28.11 readiness taxonomy already routes `bridge_unavailable`
 * to. "Focused on profile-tick history" is the Diagnostics fold's own `profile`
 * sub-section — the one that mounts `MathemeProfileGenerationDisplay` (the
 * observed-generation history buffer) and `ProfileTickSubscriptionState`. Both
 * halves are needed: the command alone opens the fold on whatever sub-section
 * the session last persisted.
 */
export const PROFILE_TICK_HISTORY_ROUTE = Object.freeze({
    label: 'Open profile-tick history',
    commandId: 'omnipanel.tab.activate.7',
    tab: 'diagnostics',
    subSection: 'profile'
} as const);

export type ProfileTickReadoutKind = 'pre-tick' | 'first-tick' | 'steady';

export interface ProfileTickReadout {
    readonly kind: ProfileTickReadoutKind;
    /** The primary reading in the entry. */
    readonly text: string;
    /** The one-tick birth announcement, or null. */
    readonly announcement: string | null;
    /** Shimmer before the clock starts, checkmark on the birth tick (spec :269). */
    readonly glyph: string;
}

/** Spec :269 — the words the birth of the clock is announced in. */
export const FIRST_TICK_ANNOUNCEMENT = 'Profile-tick 1 — system alive.';

/**
 * The entry's reading for a clock view. Pure: the same view always produces the
 * same words, so the transition can be driven and asserted without a shell.
 *
 * `generation === null` is treated as pre-tick regardless of the counter: the
 * two move together inside the store's gate, and a reading that printed
 * `gen:null` would be claiming a frame that never arrived.
 */
export function profileTickReadout(view: {
    readonly observedTicks: number;
    readonly generation: number | null;
}): ProfileTickReadout {
    if (view.observedTicks <= 0 || view.generation === null) {
        return Object.freeze({
            kind: 'pre-tick' as const,
            // the 32.5 grammar's own string, not a copy of it
            text: flavourEntry('pending_first_tick').copy,
            announcement: null,
            glyph: '⟳'
        });
    }
    const text = `tick:${view.observedTicks} gen:${view.generation}`;
    if (view.observedTicks === 1) {
        return Object.freeze({
            kind: 'first-tick' as const,
            text,
            announcement: FIRST_TICK_ANNOUNCEMENT,
            glyph: '✓'
        });
    }
    return Object.freeze({
        kind: 'steady' as const,
        text,
        announcement: null,
        glyph: '⟳'
    });
}

/**
 * Spec :265 — "Hover shows last-tick-fired ISO timestamp." Null when no frame
 * has been cached, so the caller can say "no tick yet" instead of showing the
 * epoch.
 */
export function lastTickFiredIso(lastTickAtMs: number | null): string | null {
    if (lastTickAtMs === null || !Number.isFinite(lastTickAtMs) || lastTickAtMs <= 0) {
        return null;
    }
    return new Date(lastTickAtMs).toISOString();
}

export interface ProfileTickSeam {
    /** The spec line that named it. */
    readonly deliverable: string;
    /** What the spec expected to carry it. */
    readonly name: string;
    /** True only when the carrier really has it. */
    readonly available: boolean;
    readonly expected: string;
    readonly reason: string;
    /** Where the law landed instead, while the named surface is absent. */
    readonly carriedBy: string;
}

/**
 * What tranche 32.9 names that this carrier does not have. Held against the
 * real `src` tree by `profileTickVisibility.test.tsx`, in BOTH directions: a
 * seam recorded as absent that has since landed fails the suite, so the
 * disclosure cannot outlive the gap.
 */
export const PROFILE_TICK_SEAMS: readonly ProfileTickSeam[] = Object.freeze([
    Object.freeze({
        deliverable: '32.9 spec :269 — cold-start first-tick differentiation',
        name: 'cold-start-splash',
        available: false,
        expected:
            "The 32.1 orchestrator's stage-4 splash row changes from 'Awaiting first profile-tick…' (shimmer, bridge_unavailable/pending_first_tick) to 'Profile-tick 1 — system alive.' (checkmark, ready_public_current) on the first tick advance.",
        reason:
            '32.1 landed on this carrier as branch FUNCTIONS (coldStartPasuBranch, coldStartKairosBranch) with no six-stage splash surface anywhere in src; the only `.boot-splash` is App.tsx’s one-line "pratibimba…" placeholder shown while the layout models are still being built, which has no stages, no readiness rows and no first-tick transition to change.',
        carriedBy:
            'components/StatusStrip.tsx — the profile-tick entry itself carries the transition (pre-tick flavour copy + shimmer → the birth announcement + checkmark → the steady tick:n gen:g reading), which is the surface 32.9 owns.'
    })
]);
