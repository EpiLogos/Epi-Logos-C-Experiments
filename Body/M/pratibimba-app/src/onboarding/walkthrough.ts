/**
 * Coordinate: M' shell-0 (post-identity walkthrough model — 32.T32.3)
 * Residency: Body/M/pratibimba-app/src/onboarding/walkthrough.ts
 * Position (#n): #4 — Context/Type; the six-step depth walk (WC-OB-19)
 * Actualises: the walkthrough as DATA — six steps mirroring the matheme 4+2
 *   depth law, each with the copy it shows, the anchor it points at, and the
 *   ledger step id it writes. The six ids are not invented here: they are the
 *   `walkthrough.*` rows the onboarding-completion ledger
 *   (`contracts/onboarding-completion-ledger.json`, 32.T32.13) already declares,
 *   with the skip-preference path it already names.
 *
 *   THE COPY IS GENERATED FROM THE LIVE INVENTORIES, not transcribed. Step 2
 *   names the OmniPanel tabs by reading `OMNIPANEL_TABS`; step 3 names the
 *   left-sidebar modes by reading `LEFT_SIDEBAR_MODES`; step 4 names the status
 *   threads by reading `STATUS_STRIP_THREADS` (32.T32.9 — it used to read only
 *   the COUNT from that module and transcribe the names, and the transcription
 *   had already drifted off the real strip). A walkthrough that hardcodes what
 *   the app contains is a walkthrough that starts lying the first time a tab is
 *   added — these cannot drift, and `walkthrough.test.ts` proves it.
 *
 *   Step 1 opens with the profile-tick, per tranche 32.9 (spec :267): the first
 *   thing a new user is told is that things move on their own, before anything
 *   asks them to move something themselves.
 *
 *   ANCHORS ARE CANDIDATES, resolved against the real DOM in order. Four of the
 *   six point at chrome this carrier really has (`face-toggle`, `status-strip`,
 *   `status-daynow`, `status-coordinate`). Step 2 points at the flexlayout
 *   border that IS the OmniPanel here. Step 3's Theia activity-bar has NO
 *   carrier equivalent — `registerLeftSidebarModeCommands` is proven dead code
 *   by `commands/catalog.test.ts` — so its anchor list ends in a centred
 *   fallback and `anchorsResolvable` reports it honestly rather than pretending.
 *   That gap belongs to whichever tranche lands the activity bar, not here.
 * Public surface: WalkthroughStepId, WALKTHROUGH_STEP_IDS, WalkthroughStep,
 *   walkthroughSteps, COMPLETED_STEPS_PREFERENCE, SKIPPED_STEPS_PREFERENCE,
 *   recordStepComplete, recordStepSkip, readStepArray.
 * Does NOT own: the ledger contract (contracts/onboarding-completion-ledger.json),
 *   the tab inventory (panes/omni/omnipanelRuntime.ts), the mode inventory
 *   (ui/leftSidebarModes.ts), or the overlay rendering (WalkthroughOverlay.tsx).
 * Contract: rerun tranche [[32.T32.3]] (WC-OB-19) over [[32.T32.13]].
 */

import { OMNIPANEL_TABS } from '../panes/omni/omnipanelRuntime';
import { LEFT_SIDEBAR_MODES } from '../ui/leftSidebarModes';
import { PREFERENCE_KEYS } from '../ui/preferences';
import { DEFAULT_PRIVACY_CLASS } from '../ui/privacyDefault';
import { STATE_THREAD_COUNT, STATUS_STRIP_THREADS } from '../ui/shellSlotPolicy';
import { ONBOARDING_COMPLETED_STEPS_PREFERENCE, type KairosPreferenceAccess } from '../panes/kairosEnablement';

/** The six ledger step ids, in walk order. */
export type WalkthroughStepId =
    | 'walkthrough.0-1-toggle'
    | 'walkthrough.omnipanel'
    | 'walkthrough.activity-bar'
    | 'walkthrough.status-bar'
    | 'walkthrough.day-now-anchor'
    | 'walkthrough.cosmic-personal';

export const WALKTHROUGH_STEP_IDS: readonly WalkthroughStepId[] = Object.freeze([
    'walkthrough.0-1-toggle',
    'walkthrough.omnipanel',
    'walkthrough.activity-bar',
    'walkthrough.status-bar',
    'walkthrough.day-now-anchor',
    'walkthrough.cosmic-personal'
] as const);

/** Completion goes to the ledger's own preference key (shared with the other
 *  onboarding domains); skips go to the key the ledger's skipPath names. */
export const COMPLETED_STEPS_PREFERENCE = ONBOARDING_COMPLETED_STEPS_PREFERENCE;
export const SKIPPED_STEPS_PREFERENCE = PREFERENCE_KEYS.onboardingSkippedSteps;

export interface WalkthroughStep {
    readonly id: WalkthroughStepId;
    readonly title: string;
    readonly body: string;
    /** CSS selectors tried in order; the first present element anchors the
     *  tooltip. An empty resolution centres the tooltip in the shell. */
    readonly anchors: readonly string[];
}

/**
 * 32.T32.9: READ from the six-thread declaration, not transcribed. The
 * hand-written list this replaced named "profile generation" as a thread of its
 * own — the strip has never had one — and omitted the gateway SUPERVISOR thread
 * it does have, so the status-bar step was teaching a strip that does not exist.
 */
const STATUS_THREADS = STATUS_STRIP_THREADS.map(thread => thread.label);

/** Build the six steps against the LIVE inventories. */
export function walkthroughSteps(): readonly WalkthroughStep[] {
    const tabs = OMNIPANEL_TABS.map(tab => tab.label).join(' · ');
    const modes = LEFT_SIDEBAR_MODES.map(mode => mode.label).join(' · ');
    return Object.freeze([
        {
            id: 'walkthrough.0-1-toggle',
            title: 'The 0/1 toggle',
            body:
                'Everything advances on its own — that is the profile-tick. The system is alive whether ' +
                'you touch it or not, and the status bar counts the ticks so you can see it. ' +
                'One shell, two faces. 0 is the cosmic side, 1 the personal side, and ⌘. flips between ' +
                'them — the # inversion made a keystroke. Nothing is lost in the flip: both faces read the ' +
                'same state.',
            anchors: ['[data-testid="face-toggle"]']
        },
        {
            id: 'walkthrough.omnipanel',
            title: 'The OmniPanel',
            body: `The right border is the / membrane — ${OMNIPANEL_TABS.length} folds: ${tabs}. ⌘1–⌘8 jump straight to one.`,
            anchors: ['.flexlayout__border_right', '.flexlayout__border', '[data-testid="shell"]']
        },
        {
            id: 'walkthrough.activity-bar',
            title: 'Left-side modes',
            body: `The left side switches between modes rather than stacking them: ${modes}. Which are available depends on the active layout.`,
            anchors: ['[data-testid="left-sidebar-modes"]', '.flexlayout__tabset']
        },
        {
            id: 'walkthrough.status-bar',
            title: 'The status bar',
            body: `Exactly ${STATE_THREAD_COUNT} state threads, never a seventh: ${STATUS_THREADS.join(', ')}. It is a state readout, not a notification area.`,
            anchors: ['[data-testid="status-strip"]']
        },
        {
            id: 'walkthrough.day-now-anchor',
            title: 'The day-now anchor',
            body:
                'Your work is anchored to a day and a NOW inside it. The day-now entry names the day the ' +
                'session is writing into — the ambient thread every artifact hangs from.',
            anchors: ['[data-testid="status-daynow"]']
        },
        {
            id: 'walkthrough.cosmic-personal',
            title: 'Cosmic and personal',
            body:
                'The active coordinate is where you are standing. Flipping 0/1 changes the face, never the ' +
                'coordinate — you see the same place from the cosmic side or the personal one. ' +
                `By default everything you create rests at ${DEFAULT_PRIVACY_CLASS} and stays on this ` +
                'machine. Crossing to the public bridge is per-artifact opt-in — there is no switch that ' +
                'shares everything. You can change the default in Settings → Privacy.',
            anchors: ['[data-testid="status-coordinate"]', '[data-testid="active-coordinate"]']
        }
    ] as const);
}

function readArray(preferences: KairosPreferenceAccess, key: string): string[] {
    const raw = preferences.get(key);
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.filter((entry): entry is string => typeof entry === 'string');
}

/** The current entries under a walkthrough preference key. */
export function readStepArray(preferences: KairosPreferenceAccess, key: string): readonly string[] {
    return readArray(preferences, key);
}

function append(preferences: KairosPreferenceAccess, key: string, stepId: string): void {
    const current = readArray(preferences, key);
    if (current.includes(stepId)) {
        return;
    }
    preferences.set(key, [...current, stepId]);
}

/** Mark a step accepted. Idempotent — walking back and forward does not
 *  double-write, because completion is a fact, not a counter. */
export function recordStepComplete(preferences: KairosPreferenceAccess, stepId: WalkthroughStepId): void {
    append(preferences, COMPLETED_STEPS_PREFERENCE, stepId);
}

/** Mark a step skipped. Escape-dismissal must NOT call this: dismissing the
 *  walkthrough is not a decision about any step (the brief is explicit), and
 *  the user can reopen it from the palette. */
export function recordStepSkip(preferences: KairosPreferenceAccess, stepId: WalkthroughStepId): void {
    append(preferences, SKIPPED_STEPS_PREFERENCE, stepId);
}
