/**
 * Coordinate: M' shell chrome (inline error surface — Track 32.T32.7, CCT-8)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — the rendered context frame of a FAILED call
 * Actualises: the 32.7 `inline-error-surface` (spec :215-224) — message, retry,
 *   Diagnostics deep-link, dismiss — as an INLINE surface, per principle 5 and
 *   CCT-8: the tab IS the landing surface. There is no portal, no overlay and
 *   no focus trap; the rest of the shell stays live while the error is up, and
 *   `scripts/lint-no-modal-discipline.mjs` is what keeps that true carrier-wide.
 *
 *   ONE deliberate retarget, recorded rather than silently taken: the frozen
 *   spec mounts this imperatively —
 *   `showInlineError({ extensionId, error, retry })` from a catch block —
 *   because Theia widgets have no owning render tree to put the error in. The
 *   carrier does. Every failing site here ALREADY holds its failure in local
 *   state (`setError(...)` in the catch), so the carrier shape is declarative:
 *   the pane renders `<InlineErrorSurface>` where its own error lives, and
 *   retry is the pane's own reload closure rather than a callback smuggled
 *   through a global. A module-level error bus would add a second source of
 *   truth for a state the panes already own.
 *
 *   The Diagnostics affordance is NOT a locally invented route: it is
 *   `errorUxGrammar.DIAGNOSTICS_DEEP_LINK`, which is the readiness taxonomy's
 *   own recovery for `bridge_unavailable`. A null command renders NO button —
 *   the same law `BlockedOverlay` already holds: a button that routes nowhere
 *   is worse than no button.
 * Public surface: InlineErrorSurface, DiagnosticsDeepLink.
 * Does NOT own: what failed (the calling pane holds the error and the retry),
 *   the four-path table (ui/errorUxGrammar), the Diagnostics tab contents
 *   (15.2 / panes/omni/DiagnosticsPanel), or the command registry.
 * Contract: rerun tranche [[32.T32.7]] spec lines 209-236; [[CHROME-CONTRACT]]
 *   sections 3 and 11.
 */

import { commands } from '../commands/registry';
import {
    DIAGNOSTICS_DEEP_LINK,
    type ErrorUxPathId
} from './errorUxGrammar';

/**
 * The routing affordance itself, on its own, for the surfaces that need ONLY
 * the deep-link and not a whole error card — the 32.7 contribution to the
 * integrated-readiness-blocked path (spec :229), where the blocked state is
 * already rendered by 11.8 substrate and what is missing is the route out.
 */
export function DiagnosticsDeepLink({
    testId = 'open-diagnostics',
    pathId,
    className = 'diagnostics-deep-link'
}: {
    readonly testId?: string;
    /** Which of the four paths this affordance is serving. */
    readonly pathId: ErrorUxPathId;
    readonly className?: string;
}) {
    const commandId = DIAGNOSTICS_DEEP_LINK.commandId;
    if (commandId === null) {
        return null;
    }
    return (
        <button
            type="button"
            className={className}
            data-testid={testId}
            data-command={commandId}
            data-error-path={pathId}
            onClick={() => void commands.execute(commandId)}
        >
            {DIAGNOSTICS_DEEP_LINK.label}
        </button>
    );
}

export function InlineErrorSurface({
    message,
    surfaceId,
    pathId = 'runtime-bridge-call',
    testId = 'inline-error-surface',
    diagnostics = true,
    onRetry,
    onDismiss
}: {
    /** The failure in its own words — the substrate's message, never invented. */
    readonly message: string;
    /** Which surface failed; carried so a reader (and a spec) can tell which
     *  call this is about when two are on screen. */
    readonly surfaceId: string;
    readonly pathId?: ErrorUxPathId;
    readonly testId?: string;
    /** Suppress the Diagnostics route where it would not help — a client-side
     *  validation refusal never reached the bridge, so the WS state and the
     *  readiness ledger have nothing to say about it. */
    readonly diagnostics?: boolean;
    /** Present ⇒ a "Retry" button. Absent ⇒ none: offering a retry for a call
     *  the surface cannot re-issue would be a button that does nothing. */
    readonly onRetry?: () => void;
    readonly onDismiss?: () => void;
}) {
    return (
        <div
            className="inline-error-surface"
            data-testid={testId}
            data-error-path={pathId}
            data-surface={surfaceId}
            role="alert"
        >
            <p className="inline-error-message" data-testid={`${testId}-message`}>
                {message}
            </p>
            <div className="inline-error-actions">
                {onRetry ? (
                    <button
                        type="button"
                        className="inline-error-retry"
                        data-testid={`${testId}-retry`}
                        onClick={onRetry}
                    >
                        Retry
                    </button>
                ) : null}
                {diagnostics ? (
                    <DiagnosticsDeepLink
                        testId={`${testId}-diagnostics`}
                        pathId={pathId}
                        className="inline-error-diagnostics"
                    />
                ) : null}
                {onDismiss ? (
                    <button
                        type="button"
                        className="inline-error-dismiss"
                        data-testid={`${testId}-dismiss`}
                        onClick={onDismiss}
                    >
                        Dismiss
                    </button>
                ) : null}
            </div>
        </div>
    );
}
