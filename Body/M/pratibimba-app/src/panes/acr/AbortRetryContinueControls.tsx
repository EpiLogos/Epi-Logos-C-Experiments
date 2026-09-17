/**
 * Coordinate: M' M5' chrome (run-lifecycle controls — 28.T28.5 (a), UNWIRED)
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): the one T8 content with no substrate behind it.
 * Actualises: an HONEST PENDING-WIRE SURFACE, not a control. 28.5 (a) asks for
 *   `<AbortRetryContinueControls run={Run} disabled={humanRequired}>` with
 *   "abort/retry/continue commands wrapped via `s5'.epii.runtime_control`".
 *   That method is registered NOWHERE in `Body/S` — the `s5'.epii.*` family
 *   (`Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs`) has no run-lifecycle
 *   arm, and no other coordinate declares one. A button that cannot act is
 *   worse than an absence, so the three affordances render permanently
 *   disabled beside the reason, taking the 32.T32.7 precedent: an `unwired`
 *   path states why rather than deep-linking to something nothing produces.
 *
 *   The `humanRequired` gate is STILL rendered, because it is the half of the
 *   spec that is real: even once the method lands, a human-gated run must not
 *   be abortable by the surface. Disclosing both reasons separately keeps the
 *   two facts distinguishable — one is a missing wire, the other is a policy.
 * Public surface: ABORT_RETRY_CONTINUE_ACTIONS, AbortRetryContinueControls.
 * Does NOT own: the method register (`acrGovernance.ts`), run lifecycle law.
 */

import { acrMethodBinding } from './acrGovernance';

export const ABORT_RETRY_CONTINUE_ACTIONS = Object.freeze([
    'abort',
    'retry',
    'continue'
] as const);

export function AbortRetryContinueControls({
    humanRequired
}: {
    /** 28.5 (a): the controls are gated on `humanRequired === false`. */
    readonly humanRequired: boolean;
}) {
    const binding = acrMethodBinding('runtime-control');
    return (
        <section
            className="acr-runtime-controls"
            data-testid="abort-retry-continue-controls"
            data-wire-state="unwired"
            data-human-required={humanRequired ? 'true' : 'false'}
        >
            <h4>Run lifecycle</h4>
            <div className="acr-runtime-buttons" role="group" aria-label="run lifecycle">
                {ABORT_RETRY_CONTINUE_ACTIONS.map(action => (
                    <button
                        key={action}
                        type="button"
                        data-testid={`acr-runtime-${action}`}
                        disabled
                        aria-disabled="true"
                    >
                        {action}
                    </button>
                ))}
            </div>
            <p className="pane-message acr-runtime-pending" data-testid="acr-runtime-pending-wire">
                {`\`${binding.method}\` is unwired — ${binding.unwiredReason}`}
            </p>
            {humanRequired ? (
                <p className="acr-runtime-human-gate" data-testid="acr-runtime-human-gate">
                    Human-gated run: even once the method lands, 28.5 (a) gates these on
                    {' '}
                    <code>humanRequired === false</code>.
                </p>
            ) : null}
        </section>
    );
}
