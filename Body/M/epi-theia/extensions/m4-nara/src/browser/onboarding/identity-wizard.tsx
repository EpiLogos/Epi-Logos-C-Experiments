import * as React from 'react';
import type { Stage6ResumeMode } from '@pratibimba/m-extension-runtime';

/**
 * Task 32.2 — PASU-absence detection orchestration.
 *
 * This module is the orchestration seam that connects the ColdStartOrchestrator
 * (32.1) to the PASU identity wizard. It owns ONLY the orchestration: detecting
 * whether a PASU profile exists, suspending/resuming the orchestrator's optional
 * kairos stage (stage 6), and dispatching the `m4.openPasuWizard` command. The
 * wizard widget itself — its steps, fields, and skip affordances — is owned by
 * Tranche 25.4.
 *
 * Flow (driven from {@link createPasuIdentityGate}, registered as a pre-stage-6
 * gate on the orchestrator):
 *
 *   stage 4 (readiness) clears → gate fires → suspend stage 6
 *      ├─ fire `nara.pasu.show`
 *      ├─ 'present'             → resume stage 6 ('pasu-present'); wizard never opens
 *      ├─ 'natal-chart-missing' → open wizard in natal-chart-only mode; stay suspended
 *      ├─ 'not-found'           → open wizard (full); stay suspended
 *      └─ 'unavailable' (RPC err)→ resume stage 6 ('fr3-stub'); never trap cold-start
 *
 *   wizard skip (records `epi-logos.onboarding.pasu-skipped: ['wizard']`)
 *      → resume stage 6 ('fr3-stub')   — FR-3 graceful stub, no live identity
 *   wizard complete
 *      → resume stage 6 ('fresh-pasu')  — freshly written PASU data
 *
 * The decision logic lives in small pure functions so the not-found branch, the
 * skip/complete resume semantics, and the natal-chart-only sub-case can be
 * verified without a DI container or React.
 *
 * Cross-links:
 *  - 32.1  — ColdStartOrchestrator (`registerStage6Gate` / `suspendStage6` /
 *            `resumeStage6`).
 *  - 25.4  — PASU identity wizard widget + skippable steps.
 *  - 32.10 — kairos enablement step (the stage 6 this gate guards).
 *  - FR-3  — graceful stub when identity/kairos signals are unavailable.
 */

// ============================================================================
// Commands, RPC methods, preference keys
// ============================================================================

/** Gateway RPC that reports the current PASU profile (or its absence). */
export const PASU_SHOW_RPC = 'nara.pasu.show';

/** Theia command that opens the PASU identity wizard (widget owned by 25.4). */
export const OPEN_PASU_WIZARD_COMMAND = 'm4.openPasuWizard';

/** Onboarding ledger preference holding the list of skipped onboarding steps. */
export const PASU_SKIPPED_PREFERENCE = 'epi-logos.onboarding.pasu-skipped';

/** Skip token recorded when the user skips the entire PASU wizard. */
export const PASU_WIZARD_SKIP_TOKEN = 'wizard';

// ============================================================================
// PASU presence interpretation (pure)
// ============================================================================

/**
 * The four PASU presence outcomes the orchestration distinguishes:
 *  - `present`             — a PASU profile exists with a natal chart; no wizard.
 *  - `not-found`           — no PASU profile; open the full wizard.
 *  - `natal-chart-missing` — PASU exists but lacks a natal chart; open the
 *                            wizard showing only the natal-chart prompt.
 *  - `unavailable`         — the probe itself failed; advance on the FR-3 stub.
 */
export type PasuPresence = 'present' | 'not-found' | 'natal-chart-missing' | 'unavailable';

/** The mode the wizard opens in, derived from {@link PasuPresence}. */
export type PasuWizardMode = 'full' | 'natal-chart-only';

const NOT_FOUND_TOKENS = new Set(['not_found', 'not-found', 'notfound', 'absent', 'missing']);

function looksNotFound(value: unknown): boolean {
    return typeof value === 'string' && NOT_FOUND_TOKENS.has(value.toLowerCase());
}

function hasNatalChart(record: Record<string, unknown>): boolean {
    const path =
        record.c_0_natal_chart_path ??
        record.natal_chart_path ??
        record.natalChartPath;
    return typeof path === 'string' && path.trim().length > 0;
}

/**
 * Interpret a `nara.pasu.show` response into a {@link PasuPresence}. Tolerant of
 * the common gateway shapes:
 *
 *   - `'not_found'` (bare string), `{ status: 'not_found' }`, `{ found: false }`,
 *     `null`/`undefined`                         → `'not-found'`
 *   - a PASU object lacking a natal-chart path   → `'natal-chart-missing'`
 *   - a PASU object carrying a natal-chart path  → `'present'`
 */
export function interpretPasuShowResponse(raw: unknown): PasuPresence {
    if (raw === null || raw === undefined) {
        return 'not-found';
    }
    if (looksNotFound(raw)) {
        return 'not-found';
    }
    if (typeof raw !== 'object') {
        // A non-object, non-sentinel scalar tells us nothing usable.
        return 'not-found';
    }

    const record = raw as Record<string, unknown>;
    if (record.found === false || looksNotFound(record.status)) {
        return 'not-found';
    }

    // A `pasu`/`profile` envelope is unwrapped before the natal-chart check.
    const profile =
        (record.pasu as Record<string, unknown> | undefined) ??
        (record.profile as Record<string, unknown> | undefined) ??
        record;

    return hasNatalChart(profile) ? 'present' : 'natal-chart-missing';
}

/** Map a non-present PASU presence to the wizard mode it should open in. */
export function wizardModeForPresence(presence: PasuPresence): PasuWizardMode {
    return presence === 'natal-chart-missing' ? 'natal-chart-only' : 'full';
}

// ============================================================================
// PASU-absence probe (pure, dependency-injected)
// ============================================================================

export interface PasuShowServices {
    /** Bridge into {@link SharedBridgeAdapter.invokeGatewayRpc}. */
    readonly invokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Fire `nara.pasu.show` and interpret the result. A rejected RPC resolves to
 * `'unavailable'` rather than throwing — the gate must never trap cold-start.
 */
export async function runPasuAbsenceCheck(services: PasuShowServices): Promise<PasuPresence> {
    try {
        const raw = await services.invokeGatewayRpc(PASU_SHOW_RPC, { reason: 'cold-start-stage-5' });
        return interpretPasuShowResponse(raw);
    } catch {
        return 'unavailable';
    }
}

// ============================================================================
// The pre-stage-6 identity gate
// ============================================================================

export interface PasuIdentityGateDeps extends PasuShowServices {
    /** Hold stage 6 while identity resolves (orchestrator.suspendStage6). */
    readonly suspendStage6: () => void;
    /** Lift the stage-6 hold (orchestrator.resumeStage6). */
    readonly resumeStage6: (mode: Stage6ResumeMode) => void;
    /** Dispatch `m4.openPasuWizard` for the given mode. */
    readonly openWizard: (mode: PasuWizardMode) => void;
}

/**
 * Build the pre-stage-6 gate the orchestrator fires when readiness clears. The
 * gate suspends stage 6 synchronously, then resolves PASU presence and either
 * resumes (present / unavailable) or opens the wizard and stays suspended.
 */
export function createPasuIdentityGate(deps: PasuIdentityGateDeps): () => void {
    return () => {
        // Suspend synchronously so the orchestrator holds at 'pasu-identity'
        // before the async probe resolves — no race into stage 6.
        deps.suspendStage6();
        void runPasuAbsenceCheck(deps).then(presence => {
            switch (presence) {
                case 'present':
                    deps.resumeStage6('pasu-present');
                    break;
                case 'not-found':
                case 'natal-chart-missing':
                    // Stay suspended; the wizard's skip/complete resumes stage 6.
                    deps.openWizard(wizardModeForPresence(presence));
                    break;
                case 'unavailable':
                default:
                    // Probe failed — FR-3 graceful stub, never trap cold-start.
                    deps.resumeStage6('fr3-stub');
                    break;
            }
        });
    };
}

// ============================================================================
// Wizard skip / complete resume semantics (pure, dependency-injected)
// ============================================================================

/** Append a skip token to the skipped-steps ledger, de-duplicating. */
export function appendSkippedStep(
    existing: readonly string[] | undefined,
    step: string
): string[] {
    const base = Array.isArray(existing) ? existing : [];
    return base.includes(step) ? [...base] : [...base, step];
}

export interface PasuResolveServices {
    /** Persist a preference value (Theia PreferenceService at the call site). */
    readonly setPreference: (key: string, value: unknown) => void | Promise<void>;
    /** Lift the stage-6 hold (orchestrator.resumeStage6). */
    readonly resumeStage6: (mode: Stage6ResumeMode) => void;
    /** Read the current skipped-steps ledger for de-duplication. */
    readonly getSkippedSteps?: () => readonly string[];
}

export interface PasuSkipResult {
    readonly outcome: 'skipped';
    readonly skippedSteps: readonly string[];
}

export interface PasuCompleteResult {
    readonly outcome: 'completed';
}

/**
 * Full-wizard skip (25.4 skip-all): record `epi-logos.onboarding.pasu-skipped:
 * ['wizard']` and resume stage 6 on the FR-3 graceful stub.
 */
export async function runPasuWizardSkip(services: PasuResolveServices): Promise<PasuSkipResult> {
    const existing = services.getSkippedSteps?.() ?? [];
    const skippedSteps = appendSkippedStep(existing, PASU_WIZARD_SKIP_TOKEN);
    await services.setPreference(PASU_SKIPPED_PREFERENCE, skippedSteps);
    services.resumeStage6('fr3-stub');
    return { outcome: 'skipped', skippedSteps };
}

/**
 * Wizard completion: PASU has just been written, so resume stage 6 with the
 * `fresh-pasu` mode — downstream kairos refresh now has natal-chart data.
 */
export async function runPasuWizardComplete(services: PasuResolveServices): Promise<PasuCompleteResult> {
    services.resumeStage6('fresh-pasu');
    return { outcome: 'completed' };
}

// ============================================================================
// Wizard launcher seam (the widget itself is registered by Tranche 25.4)
// ============================================================================

/**
 * The context 32.2 hands to the 25.4 wizard when it opens: the mode plus the
 * pre-wired skip/complete actions that resume stage 6. 25.4 binds its skip-all
 * affordance to {@link skip} and its final step to {@link complete}; it never
 * needs to know about the orchestrator directly.
 */
export interface PasuWizardLaunchContext {
    readonly mode: PasuWizardMode;
    skip(): Promise<PasuSkipResult>;
    complete(): Promise<PasuCompleteResult>;
}

export type PasuWizardLauncher = (context: PasuWizardLaunchContext) => void;

let registeredLauncher: PasuWizardLauncher | undefined;

/**
 * Register the 25.4 wizard launcher. Called once by the wizard extension at
 * startup so `m4.openPasuWizard` can mount the real widget. Returns a disposer.
 */
export function setPasuWizardLauncher(launcher: PasuWizardLauncher): { dispose(): void } {
    registeredLauncher = launcher;
    return {
        dispose: () => {
            if (registeredLauncher === launcher) {
                registeredLauncher = undefined;
            }
        }
    };
}

/** Test/inspection hook — whether a 25.4 launcher is currently registered. */
export function hasPasuWizardLauncher(): boolean {
    return registeredLauncher !== undefined;
}

/**
 * Hand the launch context to the registered 25.4 launcher. Returns `true` when a
 * launcher consumed it, `false` when none is registered (25.4 not present) — the
 * caller then advances on the FR-3 stub rather than trapping cold-start.
 */
export function launchPasuWizard(context: PasuWizardLaunchContext): boolean {
    if (!registeredLauncher) {
        return false;
    }
    registeredLauncher(context);
    return true;
}

// ============================================================================
// React — minimal launch notice (the wizard UI itself is owned by 25.4)
// ============================================================================

export interface PasuWizardLaunchNoticeProps {
    /** Mode the wizard is opening in; drives the explanatory copy. */
    readonly mode: PasuWizardMode;
}

/**
 * A small status affordance the splash can render while the orchestrator holds
 * at `'pasu-identity'` and the 25.4 wizard mounts. Deliberately NOT the wizard —
 * it only narrates the suspension so the cold-start overlay never looks frozen.
 */
export const PasuWizardLaunchNotice: React.FC<PasuWizardLaunchNoticeProps> = ({ mode }) => (
    <div className="m4-pasu-launch-notice" role="status" aria-live="polite" data-mode={mode}>
        <span className="m4-pasu-launch-glyph" aria-hidden="true">
            ☉
        </span>
        <p className="m4-pasu-launch-copy">
            {mode === 'natal-chart-only'
                ? 'Your PASU identity is set — opening the natal-chart step.'
                : 'Setting up your PASU identity profile…'}
        </p>
    </div>
);
