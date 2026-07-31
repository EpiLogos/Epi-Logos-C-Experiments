/**
 * Coordinate: M' shell chrome (the per-artifact opt-in surface — 32.T32.8)
 * Residency: Body/M/pratibimba-app/src/ui/PrivacyOptInSurface.tsx
 * Position (#n): #4 — the rendered context frame of a DECISION about a crossing
 * Actualises: the 32.8 opt-in surface (spec :244-253) — artifact handle and
 *   summary, the crossing description, a consent checkbox with the
 *   `pressureFree` / `inspectable` flags from the `evaluateVoiceCorpusAdmission`
 *   shape, "Confirm public crossing", and "Stay protected-local" as the default
 *   action.
 *
 *   RETARGET, recorded rather than taken silently. The spec calls this a
 *   "non-modal opt-in dialog … anchored to triggering widget" at
 *   `m-extension-runtime/src/browser/privacy-opt-in-dialog.tsx`. There is no
 *   dialog here at all: it is an inline surface the owning pane renders where
 *   the decision belongs, exactly as 32.T32.7's `InlineErrorSurface` retargeted
 *   `showInlineError`. Theia widgets have no owning render tree to put the
 *   question in; the carrier does. `scripts/lint-no-modal-discipline.mjs` keeps
 *   that true carrier-wide, and 15.2's "the tab IS the landing surface" is the
 *   law being honoured — a decision about a person's material is not something
 *   to take in a layer that seizes the shell until dismissed.
 *
 *   THE CHROME SAYS TWO DIFFERENT THINGS ON PURPOSE. The surface itself wears
 *   `protected_local_handle_only` (25.T25.18): it renders a handle and a
 *   summary, never a body, so that is what it is truthfully showing. The
 *   crossing PREVIEW wears `shared_archetype_opt_in` — the class the artifact
 *   would become. Those are different facts and wearing one tint for both would
 *   blur the only distinction the surface exists to make.
 *
 *   The confirm affordance stays disabled until consent is ticked, and the
 *   crossing reports `PUBLIC_CROSSING_SEAM` by name when it cannot complete.
 *   A recorded consent with an invented "published" message would be the worst
 *   available outcome: the user would believe material had crossed when nothing
 *   left the machine.
 * Public surface: PrivacyOptInSurface.
 * Does NOT own: the gate or the consent write (`panes/privacyCrossing.ts`), the
 *   ConsentRecord shape (`panes/pratibimbaConsent.ts`), the resting default and
 *   ceiling (`ui/privacyDefault.ts`), the tint vocabulary (`ui/privacyChrome.ts`),
 *   or which artifact is being asked about (the calling pane holds that).
 * Contract: rerun tranche [[32.T32.8]] · [[CHROME-CONTRACT]] §7.
 */

import { useMemo, useState } from 'react';

import { gateway } from '../bridge/gatewayHolder';
import {
    PUBLIC_CROSSING_SEAM,
    confirmPublicCrossing,
    crossingDescription,
    unavailableCrossing,
    type PublicCrossingOutcome,
    type PublicCrossingRequest
} from '../panes/privacyCrossing';
import { privacyChrome } from './privacyChrome';
import { PRIVACY_DEFAULT_CLASS_PREFERENCE, effectivePrivacyClass } from './privacyDefault';

/** The stored preference, read through the one key constant (31.T31.9). */
function storedDefaultClass(): unknown {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(PRIVACY_DEFAULT_CLASS_PREFERENCE);
    if (raw === null) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

function noticeFor(outcome: PublicCrossingOutcome): string {
    switch (outcome.outcome) {
        case 'declined':
            return 'Stayed protected-local. Nothing was recorded and nothing crossed.';
        case 'invalid':
            return `That consent could not be recorded: ${outcome.reason}`;
        case 'consent-required':
            return outcome.decision.permitted ? '' : outcome.decision.reason;
        case 'unavailable':
            return (
                `Consent recorded. The crossing itself cannot run: ${PUBLIC_CROSSING_SEAM.name} — `
                + PUBLIC_CROSSING_SEAM.reason
            );
        case 'crossed':
            return 'Consent recorded and the artifact crossed to the public bridge.';
    }
}

export function PrivacyOptInSurface({
    request,
    invokeGatewayRpc,
    onClose,
    testId = 'privacy-opt-in-surface'
}: {
    readonly request: PublicCrossingRequest;
    /** Injected in tests; the live gateway otherwise. */
    readonly invokeGatewayRpc?: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<unknown>;
    /** Called on "Stay protected-local" and after a completed decision. */
    readonly onClose: () => void;
    readonly testId?: string;
}) {
    const [consented, setConsented] = useState(false);
    const [pressureFree, setPressureFree] = useState(true);
    const [inspectable, setInspectable] = useState(true);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const invoke = useMemo(
        () =>
            invokeGatewayRpc
            ?? (async (method: string, params: Record<string, unknown>) =>
                (await gateway().invoke(method, params)).artifact),
        [invokeGatewayRpc]
    );

    const currentClass = effectivePrivacyClass(request.extensionId, storedDefaultClass());
    const selfChrome = privacyChrome('protected_local_handle_only');
    const targetChrome = privacyChrome('shared_archetype_opt_in');

    const confirm = () => {
        setBusy(true);
        setNotice(null);
        void confirmPublicCrossing(
            request,
            { consented, pressureFree, inspectable },
            { invokeGatewayRpc: invoke, performCrossing: (req, consent) => unavailableCrossing(req, consent, { invokeGatewayRpc: invoke }) }
        )
            .then(outcome => setNotice(noticeFor(outcome)))
            .catch(error =>
                setNotice(
                    `That consent could not be recorded: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                )
            )
            .finally(() => setBusy(false));
    };

    const decline = () => {
        setNotice(null);
        onClose();
    };

    return (
        <section
            className={`privacy-opt-in-surface ${selfChrome.className}`}
            title={selfChrome.title}
            data-testid={testId}
            data-extension={request.extensionId}
            aria-labelledby={`${testId}-heading`}
        >
            <h3 id={`${testId}-heading`}>Publish across the public bridge?</h3>

            <dl className="privacy-opt-in-artifact">
                <dt>Artifact</dt>
                <dd>
                    <code data-testid="privacy-opt-in-handle">{request.artifactHandle}</code>
                </dd>
                <dt>What it is</dt>
                <dd data-testid="privacy-opt-in-summary">{request.artifactSummary}</dd>
            </dl>

            <p className="privacy-opt-in-crossing" data-testid="privacy-opt-in-crossing">
                {crossingDescription(request)}
            </p>

            <p className="privacy-opt-in-classes">
                <span data-testid="privacy-opt-in-current-class">Currently {currentClass}</span>
                {' → '}
                <span
                    className={targetChrome.className}
                    title={targetChrome.title}
                    data-testid="privacy-opt-in-target-class"
                >
                    shared_archetype_opt_in
                </span>
            </p>

            <div className="privacy-opt-in-flags">
                <label>
                    <input
                        type="checkbox"
                        data-testid="privacy-opt-in-consented"
                        checked={consented}
                        onChange={event => setConsented(event.target.checked)}
                    />
                    I consent to this artifact crossing to the public bridge
                </label>
                <label>
                    <input
                        type="checkbox"
                        data-testid="privacy-opt-in-pressure-free"
                        checked={pressureFree}
                        onChange={event => setPressureFree(event.target.checked)}
                    />
                    pressure-free — nothing and no one pushed me to do this
                </label>
                <label>
                    <input
                        type="checkbox"
                        data-testid="privacy-opt-in-inspectable"
                        checked={inspectable}
                        onChange={event => setInspectable(event.target.checked)}
                    />
                    inspectable — I can review what crossed afterwards
                </label>
            </div>

            <div className="privacy-opt-in-actions">
                <button
                    type="button"
                    className="privacy-opt-in-decline"
                    data-testid="privacy-opt-in-decline"
                    onClick={decline}
                >
                    Stay protected-local
                </button>
                <button
                    type="button"
                    className="privacy-opt-in-confirm"
                    data-testid="privacy-opt-in-confirm"
                    disabled={!consented || busy}
                    onClick={confirm}
                >
                    Confirm public crossing
                </button>
            </div>

            {notice ? (
                <p className="privacy-opt-in-notice" data-testid="privacy-opt-in-notice" role="status">
                    {notice}
                </p>
            ) : null}

            <p className="privacy-opt-in-seam" data-testid="privacy-opt-in-seam">
                <strong>{PUBLIC_CROSSING_SEAM.name}</strong> — {PUBLIC_CROSSING_SEAM.reason}
            </p>
        </section>
    );
}
