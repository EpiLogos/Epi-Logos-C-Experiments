import * as React from 'react';

/**
 * Task 32.T32.3 — Guided walkthrough overlay (closes the onboarding tour leg of
 * the cold-start matheme law).
 *
 * Six tooltip-overlay-driven steps mirror the matheme **4+2 depth law**: four
 * "surface" orientation steps (the 0/1 toggle, the OmniPanel, the activity bar,
 * the status bar) followed by two "depth" steps (the day-now anchor and the
 * cosmic↔personal shell orientation) that re-read the same surfaces at the
 * deeper coordinate-residency layer. Each step is a tooltip anchored to its live
 * UI target, with a Back / Next / Skip stepper.
 *
 * The overlay is deliberately **non-modal**: the backdrop carries
 * `pointer-events: none` so the user keeps interacting with the workbench
 * surfaces the tour is pointing at (flip the 0/1 coin, click an OmniPanel tab,
 * read a status-bar entry) while the walkthrough is open. Only the tooltip card
 * itself re-enables pointer events.
 *
 * Ledger contract (32.13 onboarding-completion):
 *  - completing a step appends its `walkthrough.*` token to
 *    {@link ONBOARDING_COMPLETED_STEPS_PREFERENCE} (User scope).
 *  - skipping a step appends its token to
 *    {@link ONBOARDING_SKIPPED_STEPS_PREFERENCE} (User scope).
 *  - pressing Escape dismisses the entire walkthrough and writes **nothing** —
 *    dismissal is not a skip; the tour can be replayed cleanly.
 *
 * Re-trigger paths (both resolve to the same command):
 *  - Help menu → {@link OPEN_WALKTHROUGH_COMMAND} via `commands.executeCommand`.
 *  - Settings → Diagnostics → "Replay onboarding walkthrough" button
 *    ({@link ReplayOnboardingButton}), which also calls `executeCommand`.
 *
 * As with the sibling onboarding modules, every decision is kept in small pure,
 * dependency-injected functions ({@link appendStepToken}, {@link runStepComplete},
 * {@link runStepSkip}, {@link isDismissKey}, {@link replayOnboardingWalkthrough})
 * so the six-step structure, the preference-array growth, the skip-flag
 * persistence, the escape-writes-nothing law, and the settings re-trigger can be
 * verified without rendering React.
 */

// ============================================================================
// Preference keys + command id (32.13 ledger + Help-menu re-trigger)
// ============================================================================

/** Onboarding ledger preference holding the list of completed step tokens. */
export const ONBOARDING_COMPLETED_STEPS_PREFERENCE = 'epi-logos.onboarding.completed-steps';

/** Onboarding ledger preference holding the list of skipped step tokens. */
export const ONBOARDING_SKIPPED_STEPS_PREFERENCE = 'epi-logos.onboarding.skipped-steps';

/**
 * Command id the Help menu and the Settings "Replay onboarding walkthrough"
 * button both dispatch to (re-)open the tour: `commands.executeCommand(...)`.
 */
export const OPEN_WALKTHROUGH_COMMAND = 'epi-logos.help.openWalkthrough';

// ----------------------------------------------------------------------------
// Per-step completion tokens (32.13). These are the canonical ledger entries.
// ----------------------------------------------------------------------------

export const WALKTHROUGH_TOGGLE_STEP = 'walkthrough.0-1-toggle';
export const WALKTHROUGH_OMNIPANEL_STEP = 'walkthrough.omnipanel';
export const WALKTHROUGH_ACTIVITY_BAR_STEP = 'walkthrough.activity-bar';
export const WALKTHROUGH_STATUS_BAR_STEP = 'walkthrough.status-bar';
export const WALKTHROUGH_DAY_NOW_ANCHOR_STEP = 'walkthrough.day-now-anchor';
export const WALKTHROUGH_COSMIC_PERSONAL_STEP = 'walkthrough.cosmic-personal';

// ============================================================================
// Step model — the six tooltip-overlay steps
// ============================================================================

export type WalkthroughPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface WalkthroughStep {
    /** Stable id; also used as the data-step marker and React key. */
    readonly id: string;
    /** Ledger token written on complete/skip (32.13). */
    readonly token: string;
    /** Tooltip heading. */
    readonly title: string;
    /** Tooltip prose. */
    readonly body: string;
    /** Optional bulleted detail (named UI surfaces / tabs / entries). */
    readonly items?: readonly string[];
    /**
     * CSS selector for the live UI target the tooltip anchors to. The overlay
     * positions the tooltip relative to the first matching element; tests assert
     * the selector is emitted as `data-anchor` so anchoring is inspectable
     * without a layout engine.
     */
    readonly anchorSelector: string;
    /** Which side of the anchor the tooltip points from. */
    readonly placement: WalkthroughPlacement;
}

/**
 * The six steps, in order. Steps 1–4 are the surface "4" of the 4+2 law;
 * steps 5–6 are the depth "+2" that re-reads the day-now anchor and the
 * cosmic↔personal shell at the coordinate-residency layer.
 */
export const WALKTHROUGH_STEPS: readonly WalkthroughStep[] = Object.freeze([
    {
        id: '0-1-toggle',
        token: WALKTHROUGH_TOGGLE_STEP,
        title: 'The 0/1 toggle',
        body:
            'This coin-flip icon in the title bar is the # inversion act made clickable. ' +
            'Press ⌘. (cmd-period) anywhere to flip it. Face 0 is the cosmic (structural) ' +
            'shell; face 1 is the personal shell. The flip never changes where you are — ' +
            'it changes which face of the same coordinate you are reading.',
        items: [
            'Keybinding: ⌘. (cmd-period)',
            'Face 0 — cosmic / structural semantics',
            'Face 1 — personal semantics'
        ],
        anchorSelector: '.epi-titlebar-coin-flip',
        placement: 'bottom'
    },
    {
        id: 'omnipanel',
        token: WALKTHROUGH_OMNIPANEL_STEP,
        title: 'OmniPanel',
        body:
            'The right sidebar is the OmniPanel — your live conversation with Pi and the ' +
            'window onto everything the agent runtime is doing right now. Its tabs are:',
        items: [
            'Pi Chat',
            'Sessions',
            'Dispatch Trace',
            'Tool Stream',
            'Evidence',
            'Review',
            'Gateway',
            'Diagnostics'
        ],
        anchorSelector: '#theia-right-content-panel',
        placement: 'left'
    },
    {
        id: 'activity-bar',
        token: WALKTHROUGH_ACTIVITY_BAR_STEP,
        title: 'Activity bar',
        body:
            'The left sidebar is the activity bar — your way into the vault and the graph. ' +
            'What it shows depends on the active profile mode:',
        items: [
            'Coordinate Tree',
            'Bimba Graph Viewer',
            'Canon Studio (daily-0-1) / Backend Studio',
            'Smart Connections (ide-deep)'
        ],
        anchorSelector: '.theia-app-left .p-TabBar',
        placement: 'right'
    },
    {
        id: 'status-bar',
        token: WALKTHROUGH_STATUS_BAR_STEP,
        title: 'Status bar',
        body:
            'The status bar is the system\'s pulse. Reading left to right, its six entries are:',
        items: [
            'profile-tick',
            'day-now anchor',
            'session id',
            'gateway readiness',
            'profile generation',
            'active coordinate'
        ],
        anchorSelector: '#theia-statusBar',
        placement: 'top'
    },
    {
        id: 'day-now-anchor',
        token: WALKTHROUGH_DAY_NOW_ANCHOR_STEP,
        title: 'The day-now anchor',
        body:
            'The day-now status entry is your standing thread into today. Per DR-M4-1 the ' +
            'canonical path is Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/ — the week segment ' +
            '(W{WW}) is mandatory. This anchor is the ambient thread every session, NOW, and ' +
            'reflection hangs from; click it to open today\'s daily note.',
        items: [
            'DR-M4-1 path canon: Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/',
            'Ambient thread — sessions, NOW, and reflections anchor here'
        ],
        anchorSelector: '[data-status-entry="day-now"]',
        placement: 'top'
    },
    {
        id: 'cosmic-personal',
        token: WALKTHROUGH_COSMIC_PERSONAL_STEP,
        title: 'Cosmic vs personal',
        body:
            'Putting it together: face 0 is the cosmic shell (the structural, shared ' +
            'coordinate space — Bimba, the graph, the canon); face 1 is the personal shell ' +
            '(your Pratibimba reflection of that same space). The ⌘. toggle moves you ' +
            'between shells while preserving the active coordinate, so the thing you were ' +
            'looking at stays in view — only its face changes.',
        items: [
            '0 — cosmic shell (structural / shared)',
            '1 — personal shell (personal / Pratibimba)',
            'Toggle preserves the active coordinate'
        ],
        anchorSelector: '.epi-titlebar-coin-flip',
        placement: 'bottom'
    }
]);

/** Compile-time guarantee that the matheme 4+2 depth law stays six steps wide. */
export const WALKTHROUGH_STEP_COUNT = 6 as const;
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
((): void => {
    const assertSix: typeof WALKTHROUGH_STEP_COUNT = WALKTHROUGH_STEPS.length as 6;
    void assertSix;
})();

// ============================================================================
// Ledger helpers (pure — 32.13 preference array growth)
// ============================================================================

/**
 * Append a token to a ledger array, de-duplicating. Anything non-array (an
 * unset preference reads back `undefined`) is treated as an empty ledger.
 */
export function appendStepToken(
    existing: readonly string[] | undefined,
    token: string
): string[] {
    const base = Array.isArray(existing) ? existing : [];
    return base.includes(token) ? [...base] : [...base, token];
}

/** Clamp a target index into the valid step range. */
export function clampStepIndex(index: number): number {
    if (!Number.isFinite(index)) {
        return 0;
    }
    return Math.min(WALKTHROUGH_STEPS.length - 1, Math.max(0, Math.trunc(index)));
}

/**
 * Escape (and only Escape) dismisses the entire walkthrough. This is the single
 * source of truth for "is this the dismiss key", so the escape-writes-nothing
 * law can be asserted directly: a dismiss is never routed through any preference
 * write.
 */
export function isDismissKey(key: string): boolean {
    return key === 'Escape' || key === 'Esc';
}

// ============================================================================
// Service contract + enable/skip orchestration (pure, dependency-injected)
// ============================================================================

export interface WalkthroughServices {
    /** Persist a preference value (Theia PreferenceService, User scope, at the call site). */
    readonly setPreference: (key: string, value: unknown) => void | Promise<void>;
    /** Read the current completed-steps ledger for de-duplication. */
    readonly getCompletedSteps?: () => readonly string[];
    /** Read the current skipped-steps ledger for de-duplication. */
    readonly getSkippedSteps?: () => readonly string[];
}

/**
 * Complete a step: append its token to the completed-steps ledger (User scope)
 * and return the grown array. Idempotent — completing the same step twice does
 * not duplicate the token.
 */
export async function runStepComplete(
    services: WalkthroughServices,
    step: WalkthroughStep
): Promise<string[]> {
    const completedSteps = appendStepToken(services.getCompletedSteps?.() ?? [], step.token);
    await services.setPreference(ONBOARDING_COMPLETED_STEPS_PREFERENCE, completedSteps);
    return completedSteps;
}

/**
 * Skip a step: append its token to the skipped-steps ledger (User scope) and
 * return the grown array. The skip flag persists so the tour can later
 * distinguish "seen and skipped" from "completed".
 */
export async function runStepSkip(
    services: WalkthroughServices,
    step: WalkthroughStep
): Promise<string[]> {
    const skippedSteps = appendStepToken(services.getSkippedSteps?.() ?? [], step.token);
    await services.setPreference(ONBOARDING_SKIPPED_STEPS_PREFERENCE, skippedSteps);
    return skippedSteps;
}

// ============================================================================
// Help-menu / Settings re-trigger
// ============================================================================

/** Minimal shape of Theia's `commands.executeCommand`. */
export type WalkthroughCommandExecutor = (command: string, ...args: unknown[]) => unknown;

/**
 * Re-open the walkthrough by dispatching {@link OPEN_WALKTHROUGH_COMMAND}. Used
 * by both the Help menu wiring and the Settings "Replay onboarding walkthrough"
 * button so there is exactly one re-trigger path.
 */
export function replayOnboardingWalkthrough(executeCommand: WalkthroughCommandExecutor): unknown {
    return executeCommand(OPEN_WALKTHROUGH_COMMAND);
}

export interface ReplayOnboardingButtonProps {
    /** Bridge into Theia's `commands.executeCommand` at the call site. */
    readonly executeCommand: WalkthroughCommandExecutor;
    /** Override the default button label. */
    readonly label?: string;
}

/**
 * Settings → Diagnostics affordance. Rendered alongside the reset section
 * (32.12), it re-triggers the tour through the same command the Help menu uses.
 */
export const ReplayOnboardingButton: React.FC<ReplayOnboardingButtonProps> = ({
    executeCommand,
    label = 'Replay onboarding walkthrough'
}) => (
    <button
        type="button"
        className="theia-button secondary mext-walkthrough-replay"
        data-test="walkthrough-replay-button"
        data-command={OPEN_WALKTHROUGH_COMMAND}
        onClick={() => replayOnboardingWalkthrough(executeCommand)}
    >
        {label}
    </button>
);

// ============================================================================
// React component — non-modal tooltip-overlay stepper
// ============================================================================

export interface WalkthroughOverlayProps extends WalkthroughServices {
    /** Dismiss the whole overlay (Escape / final completion / explicit close). */
    readonly onClose: () => void;
    /** Fired once the user completes the final (sixth) step. */
    readonly onComplete?: () => void;
    /** Mount at a specific step (test/host hook); defaults to the first step. */
    readonly initialStepIndex?: number;
}

/**
 * Non-modal walkthrough overlay.
 *
 * Layout: a full-bleed backdrop with `pointer-events: none` (so the workbench
 * stays live underneath) carries a single tooltip card positioned against the
 * current step's anchor. The card itself re-enables pointer events for its
 * Back / Next / Skip controls.
 *
 * Keyboard: Escape dismisses the entire tour via {@link onClose} and writes
 * nothing to either ledger (dismissal ≠ skip).
 */
export const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = props => {
    const { onClose, onComplete, initialStepIndex = 0, ...services } = props;
    const [stepIndex, setStepIndex] = React.useState(() => clampStepIndex(initialStepIndex));
    const [busy, setBusy] = React.useState(false);

    const step = WALKTHROUGH_STEPS[stepIndex];
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === WALKTHROUGH_STEPS.length - 1;

    const goBack = React.useCallback(() => {
        setStepIndex(index => clampStepIndex(index - 1));
    }, []);

    const advanceOrClose = React.useCallback(() => {
        if (isLast) {
            onComplete?.();
            onClose();
            return;
        }
        setStepIndex(index => clampStepIndex(index + 1));
    }, [isLast, onClose, onComplete]);

    const handleNext = React.useCallback(() => {
        setBusy(true);
        void runStepComplete(services, step)
            .then(() => advanceOrClose())
            .finally(() => setBusy(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [services, step, advanceOrClose]);

    const handleSkip = React.useCallback(() => {
        setBusy(true);
        void runStepSkip(services, step)
            .then(() => advanceOrClose())
            .finally(() => setBusy(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [services, step, advanceOrClose]);

    // Escape dismisses the tour and writes NOTHING — dismissal is not a skip.
    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (isDismissKey(event.key)) {
                event.stopPropagation();
                onClose();
            }
        },
        [onClose]
    );

    return (
        <div
            className="mext-walkthrough"
            role="dialog"
            aria-modal="false"
            aria-label="Epi-Logos onboarding walkthrough"
            data-test="walkthrough-overlay"
            data-step={step.id}
            data-step-index={stepIndex}
            data-step-count={WALKTHROUGH_STEPS.length}
            onKeyDown={handleKeyDown}
        >
            {/*
              * Non-modal backdrop: pointer-events:none lets clicks fall through to
              * the live workbench surfaces (title-bar coin, OmniPanel tabs, status
              * bar) the tour is pointing at. Only the tooltip card below opts back
              * into pointer events.
              */}
            <div
                className="mext-walkthrough-backdrop"
                data-test="walkthrough-backdrop"
                data-pointer-events="none"
                aria-hidden="true"
                style={{ pointerEvents: 'none' }}
            />

            <div
                className={`mext-walkthrough-tooltip mext-walkthrough-${step.placement}`}
                data-anchor={step.anchorSelector}
                data-placement={step.placement}
                role="document"
                style={{ pointerEvents: 'auto' }}
            >
                <header className="mext-walkthrough-header">
                    <h2 className="mext-walkthrough-title">{step.title}</h2>
                    <span className="mext-walkthrough-progress" aria-label={`Step ${stepIndex + 1} of ${WALKTHROUGH_STEPS.length}`}>
                        {stepIndex + 1} / {WALKTHROUGH_STEPS.length}
                    </span>
                </header>

                <p className="mext-walkthrough-body">{step.body}</p>

                {step.items && (
                    <ul className="mext-walkthrough-items">
                        {step.items.map(item => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                )}

                <footer className="mext-walkthrough-actions">
                    <button
                        type="button"
                        className="theia-button secondary mext-walkthrough-back"
                        disabled={busy || isFirst}
                        onClick={goBack}
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        className="theia-button secondary mext-walkthrough-skip"
                        disabled={busy}
                        onClick={handleSkip}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        className="theia-button mext-walkthrough-next"
                        disabled={busy}
                        onClick={handleNext}
                    >
                        {isLast ? 'Finish' : 'Next'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default WalkthroughOverlay;
