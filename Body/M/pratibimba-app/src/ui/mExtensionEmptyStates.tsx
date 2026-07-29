/**
 * Coordinate: M' shell (per-Mn empty-state surfaces — Track 32.T32.6,
 *   closes O-WC-OB-2; cross-link 21-26 stage 1)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — the rendered context frame of an empty M-family surface
 * Actualises: the six per-Mn empty states of the 32.6 design-recon and the ONE
 *   shape they share — header + summary + missing-contributors + reasons table
 *   (spec :177) — replacing the carrier's single-`<p>` empty messages.
 *
 *   It CONSUMES the landed `<EmptyState>` primitive (30.T30.6) rather than
 *   forking a second one: the primitive owns the mark, the family tint, the
 *   "Nothing here yet" aria equivalent and the action affordance; this module
 *   owns the per-Mn voice and the readiness reasoning around it. Before this
 *   tranche the primitive had no production call site; these six are it.
 *
 *   Three honesty rules the shape enforces:
 *   - The reasons table renders ONLY for contributors the bridge has not
 *     reported ready, and each row's reason is the bridge's own words when it
 *     gave one, the id's canonical grammar copy when it did not.
 *   - `data-activated` separates "blocked" from "merely empty" — the exact
 *     distinction the `<EmptyState>` primitive is documented to protect. No
 *     table is drawn when no contributor is missing; an empty table would
 *     assert a block that was never reported.
 *   - The recovery deep-link is the readiness taxonomy's own
 *     (`readinessRecovery`), never a locally invented route.
 * Public surface: MExtensionEmptyState, registerMExtensionEmptyStates,
 *   M_EMPTY_STATE_REGISTRATIONS.
 * Does NOT own: the registry contract (ui/emptyStateRegistry), the copy
 *   (ui/emptyStateGrammar), the primitive (ui/primitives.tsx), the taxonomy
 *   (ui/bridgeReadiness), the grammar (ui/readinessGrammar), or the onboarding
 *   ledger law (panes/kairosEnablement + onboarding/pasuOnboarding).
 * Contract: rerun tranche [[32.T32.6]]; registry completeness enforced by
 *   `scripts/lint-empty-state-registry.mjs`.
 */

import { useMemo, type ReactNode } from 'react';
import { commands } from '../commands/registry';
import { browserKairosPreferences } from '../panes/kairosEnablement';
import {
    PASU_IDENTITY_STEPS,
    PASU_SKIPPED_PREFERENCE,
    readPasuSkipped
} from '../onboarding/pasuOnboarding';
import { useReadinessStore } from '../state/readinessStore';
import { useProfileTick } from '../state/useProfileTick';
import { readinessRecovery, type MExtensionReadinessSnapshot } from './bridgeReadiness';
import { M_EMPTY_STATE_GRAMMAR, type MExtensionEmptyStateCopy } from './emptyStateGrammar';
import {
    contributorsActivation,
    emptyStateReasonRows,
    emptyStateRegistry,
    type EmptyStateProps,
    type EmptyStateRegistration
} from './emptyStateRegistry';
import { EmptyState } from './primitives';

/** The live per-binding snapshot, stamped by the profile clock (15.6). */
function useReadinessSnapshot(): MExtensionReadinessSnapshot {
    const bindings = useReadinessStore(s => s.bindings);
    const tick = useProfileTick();
    return useMemo(
        () => ({ bindings, lastTick: tick.tick12 ?? tick.generation ?? -1 }),
        [bindings, tick.tick12, tick.generation]
    );
}

/** The onboarding completion ledger, read from the browser preference store.
 *  Returns an empty ledger where no storage exists rather than guessing. */
function completedOnboardingSteps(): readonly string[] {
    if (typeof window === 'undefined' || !window.localStorage) {
        return [];
    }
    try {
        return browserKairosPreferences(window.localStorage).completedSteps();
    } catch {
        return [];
    }
}

function onboardingPreference(key: string): unknown {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    try {
        return browserKairosPreferences(window.localStorage).get(key);
    } catch {
        return null;
    }
}

interface EmptyStateNotice {
    readonly id: string;
    readonly text: string;
}

interface EmptyStateAction {
    readonly label: string;
    readonly testId: string;
    readonly commandId: string;
}

/**
 * The ONE shape every per-Mn empty state renders through. Per-Mn components
 * differ in copy, notices and affordance — never in structure, because the
 * structure is the contract 32.6 is landing.
 */
function MExtensionEmptyStateShell({
    registration,
    snapshot,
    notices = [],
    action,
    hint
}: {
    readonly registration: EmptyStateRegistration;
    readonly snapshot: MExtensionReadinessSnapshot | null;
    readonly notices?: readonly EmptyStateNotice[];
    readonly action?: EmptyStateAction;
    /** Interpolated hint where the copy carries a live value; otherwise the
     *  registration's own hint stands. */
    readonly hint?: string;
}) {
    const rows = emptyStateReasonRows(registration, snapshot);
    const activated = registration.activationCondition(snapshot);
    // The "readiness link" the M1/M3 copy asks for: the taxonomy's own recovery
    // route for the first missing contributor, never a locally invented one.
    const recovery = rows.length > 0 ? readinessRecovery(rows[0].readinessId) : null;

    return (
        <section
            className="mext-empty-state"
            data-testid="mext-empty-state"
            data-extension={registration.extensionId}
            data-view={registration.viewId}
            data-activated={activated ? 'true' : 'false'}
        >
            <header className="mext-empty-state-header">
                <h3 className="mext-empty-state-title" data-testid="mext-empty-state-title">
                    {registration.header}
                </h3>
            </header>
            <p className="mext-empty-state-summary" data-testid="mext-empty-state-summary">
                {registration.summary}
            </p>
            {notices.map(notice => (
                <p
                    key={notice.id}
                    className="mext-empty-state-notice"
                    data-testid={`mext-empty-state-notice-${notice.id}`}
                    role="status"
                >
                    {notice.text}
                </p>
            ))}
            {rows.length > 0 ? (
                <>
                    <p
                        className="mext-empty-state-missing"
                        data-testid="mext-empty-state-missing"
                    >
                        Missing contributors: {rows.map(row => row.label).join(' · ')}
                    </p>
                    <table
                        className="mext-empty-state-reasons"
                        data-testid="mext-empty-state-reasons"
                    >
                        <caption>Why this surface is still empty</caption>
                        <thead>
                            <tr>
                                <th scope="col">Contributor</th>
                                <th scope="col">Readiness</th>
                                <th scope="col">Reason</th>
                                <th scope="col">Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr
                                    key={row.bindingKey}
                                    data-testid="mext-empty-state-reason"
                                    data-binding={row.bindingKey}
                                    data-readiness={row.readinessId}
                                >
                                    <th scope="row">{row.label}</th>
                                    <td>{row.readinessId}</td>
                                    <td>{row.reason}</td>
                                    <td>track {row.ownerTrack}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recovery && recovery.commandId ? (
                        <button
                            type="button"
                            className="mext-empty-state-recovery"
                            data-testid="mext-empty-state-recovery"
                            data-command={recovery.commandId}
                            onClick={() => void commands.execute(recovery.commandId as string)}
                        >
                            {recovery.label}
                        </button>
                    ) : null}
                </>
            ) : null}
            <EmptyState
                family={registration.family}
                hint={hint ?? registration.hint}
                actionLabel={action?.label}
                actionTestId={action?.testId}
                onAction={action ? () => void commands.execute(action.commandId) : undefined}
            />
        </section>
    );
}

// ── The six per-Mn components ──────────────────────────────────────────────
// Each is a real distinct component (the frozen contract's
// `component: React.ComponentType<EmptyStateProps>`), differing exactly where
// the spec says the extensions differ.

function M0AnuttaraEmpty(props: EmptyStateProps): ReactNode {
    return <MExtensionEmptyStateShell registration={props.registration} snapshot={props.snapshot} />;
}

function M1ParamasivaEmpty(props: EmptyStateProps): ReactNode {
    // "Cold-start orchestrator is at step <N>" — N is the real onboarding
    // completion ledger's length, not a placeholder.
    const step = completedOnboardingSteps().length;
    return (
        <MExtensionEmptyStateShell
            registration={props.registration}
            snapshot={props.snapshot}
            notices={[
                {
                    id: 'cold-start-step',
                    text: `Cold-start orchestrator is at step ${step}.`
                }
            ]}
        />
    );
}

function M2ParashaktiEmpty(props: EmptyStateProps): ReactNode {
    // The 23-stage-1 pending-dataset chip fires only when the bridge actually
    // reported the dataset binding missing its authoritative payload.
    const datasetRow = emptyStateReasonRows(props.registration, props.snapshot).find(
        row => row.bindingKey === 's2.parashaktiCorrespondences'
    );
    const notices =
        datasetRow?.readinessId === 'authority_payload_missing'
            ? [{ id: 'pending-dataset', text: `pending dataset — ${datasetRow.label}` }]
            : [];
    return (
        <MExtensionEmptyStateShell
            registration={props.registration}
            snapshot={props.snapshot}
            notices={notices}
        />
    );
}

function M3MahamayaEmpty(props: EmptyStateProps): ReactNode {
    return <MExtensionEmptyStateShell registration={props.registration} snapshot={props.snapshot} />;
}

function M4NaraEmpty(props: EmptyStateProps): ReactNode {
    // 32.7 cross-link: the PASU-incomplete warning, and only "if applicable" —
    // a skipped wizard is a decision, not an incompletion.
    const completed = completedOnboardingSteps();
    const skipped = readPasuSkipped(onboardingPreference(PASU_SKIPPED_PREFERENCE));
    const pasuIncomplete =
        !skipped && PASU_IDENTITY_STEPS.some(step => !completed.includes(step));
    return (
        <MExtensionEmptyStateShell
            registration={props.registration}
            snapshot={props.snapshot}
            notices={
                pasuIncomplete
                    ? [
                          {
                              id: 'pasu-incomplete',
                              text: 'PASU identity is incomplete — the day opens, but the personal field stays thin.'
                          }
                      ]
                    : []
            }
            action={{
                label: 'Start session',
                testId: 'start-first-session',
                commandId: 'journal.startFirstSession'
            }}
        />
    );
}

function M5EpiiEmpty(props: EmptyStateProps): ReactNode {
    return (
        <MExtensionEmptyStateShell
            registration={props.registration}
            snapshot={props.snapshot}
            notices={[
                { id: 'review-queue-empty', text: 'Review queue empty — nothing awaits a verdict.' },
                {
                    id: 'dispatch-history-empty',
                    text: 'Dispatch history empty — no mediated run has landed yet.'
                }
            ]}
        />
    );
}

const COMPONENTS: Readonly<Record<string, (props: EmptyStateProps) => ReactNode>> = Object.freeze({
    'm0-anuttara': M0AnuttaraEmpty,
    'm1-paramasiva': M1ParamasivaEmpty,
    'm2-parashakti': M2ParashaktiEmpty,
    'm3-mahamaya': M3MahamayaEmpty,
    'm4-nara': M4NaraEmpty,
    'm5-epii': M5EpiiEmpty
});

function toRegistration(copy: MExtensionEmptyStateCopy): EmptyStateRegistration {
    const component = COMPONENTS[copy.extensionId];
    if (!component) {
        // A copy block with no component is a registration nothing could render.
        throw new Error(`no empty-state component for extension ${copy.extensionId}`);
    }
    return Object.freeze({
        extensionId: copy.extensionId,
        viewId: copy.viewId,
        header: copy.header,
        summary: copy.summary,
        hint: copy.hint,
        family: copy.family,
        contributors: copy.contributors,
        activationCondition: contributorsActivation(copy.contributors),
        component
    });
}

/** The six, built from the pure copy blocks. */
export const M_EMPTY_STATE_REGISTRATIONS: readonly EmptyStateRegistration[] = Object.freeze(
    M_EMPTY_STATE_GRAMMAR.map(toRegistration)
);

let registered = false;

/**
 * Enrol the six into the shared registry. Idempotent: the mount component calls
 * it, so the registry is populated wherever an empty state is first rendered —
 * the carrier's replacement for each extension's `frontend-module.ts` doing it
 * at module load.
 */
export function registerMExtensionEmptyStates(): void {
    if (registered) {
        return;
    }
    registered = true;
    for (const registration of M_EMPTY_STATE_REGISTRATIONS) {
        emptyStateRegistry.register(registration);
    }
}

/**
 * The mount point a carrier surface renders where it has nothing to show.
 *
 * Resolution goes through the registry, never a direct component import: that
 * is what makes the registry the authority rather than a parallel record, and
 * what lets `scripts/lint-empty-state-registry.mjs` hold every mount to a
 * registration and every registration to a mount.
 */
export function MExtensionEmptyState({
    extensionId,
    viewId
}: {
    readonly extensionId: string;
    readonly viewId: string;
}): ReactNode {
    registerMExtensionEmptyStates();
    const snapshot = useReadinessSnapshot();
    const registration = emptyStateRegistry.resolve(extensionId, viewId);
    if (!registration) {
        // Silence would hide the gap; the lint makes this unreachable in a
        // green tree, and if it ever renders it names what is missing.
        return (
            <p className="mext-widget-empty" data-testid="mext-empty-state-unregistered">
                No empty state is registered for {extensionId}/{viewId}.
            </p>
        );
    }
    const Component = registration.component;
    return <Component registration={registration} snapshot={snapshot} />;
}
