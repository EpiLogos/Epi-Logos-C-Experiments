/**
 * Coordinate: M' M5' chrome (review decision controls — 28.T28.5 (a)/(d))
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): the governance WRITE of the deep control room.
 * Actualises: the decision half of the S5 review lifecycle, over the LIVE
 *   method. 28.5 asked for `s5'.review.transition`; that name is registered
 *   nowhere (see `acrGovernance.ts::ACR_METHOD_BINDINGS`), and the transition on
 *   an OPEN item is `s5'.review.resolve` — so that is what this dispatches,
 *   with the correction stated on the surface rather than buried in a comment.
 *
 *   THE HUMAN GATE IS AN AFFORDANCE, not a disabled button with no way through.
 *   `panes/m5ReviewGate.ts::enforceHumanGate` is asked before every committal;
 *   for a human-required item it refuses until the operator declares themself
 *   the human of record, and its own refusal `reason` is what the surface
 *   prints. That matches BOTH sides of the contract: 28.5 (a) wants a
 *   human-required item to disable the decision, and S5's `resolve` genuinely
 *   accepts a human resolution of one (`requires_human_resolution` refuses only
 *   a non-human `resolved_by`). A permanently dead control would misreport the
 *   substrate; an ungated one would bypass the gate. `defer` is non-committal
 *   on both sides and needs no acknowledgement.
 *
 *   The IOD-17 readout rides alongside as the 26.5 parity check — surfaced,
 *   never used to fake a refusal the substrate would not make.
 * Public surface: ReviewDecisionControls.
 * Does NOT own: the gate law (`panes/m5ReviewGate.ts`), the wire shapes
 *   (`acrReviewInbox.ts`), the parity computation (`acrGovernance.ts`), or the
 *   review store (S5 `epii-review-core`).
 */

import { useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { enforceHumanGate } from '../m5ReviewGate';
import { acrMethodBinding, computeIod17Parity } from './acrGovernance';
import { Iod17ParityMatrix } from './Iod17ParityMatrix';
import {
    ACR_REVIEW_DECISIONS,
    REVIEW_RESOLVE_METHOD,
    reviewResolveRequest,
    type AcrReviewDecision,
    type AcrReviewItem
} from './acrReviewInbox';
import type { MediationCapabilitySnapshot } from '../omni/omnipanelCapabilities';

type ResolveState =
    | { readonly kind: 'idle' }
    | { readonly kind: 'submitting' }
    | { readonly kind: 'resolved'; readonly decision: AcrReviewDecision }
    | { readonly kind: 'refused'; readonly reason: string };

export function ReviewDecisionControls({
    item,
    snapshot,
    connected,
    onResolved
}: {
    readonly item: AcrReviewItem;
    readonly snapshot: MediationCapabilitySnapshot | null;
    readonly connected: boolean;
    readonly onResolved?: (itemId: string) => void;
}) {
    const [decision, setDecision] = useState<AcrReviewDecision>('approve');
    const [rationale, setRationale] = useState('');
    const [humanOfRecord, setHumanOfRecord] = useState(false);
    const [resolve, setResolve] = useState<ResolveState>({ kind: 'idle' });

    const parity = computeIod17Parity({
        humanRequired: item.requiresHuman,
        decision,
        snapshot
    });
    const gate = enforceHumanGate({
        decision,
        humanRequired: item.requiresHuman,
        actorIsHuman: humanOfRecord
    });
    const binding = acrMethodBinding('review-decision');
    const canCommit =
        connected && gate.ok && rationale.trim().length > 0 && resolve.kind !== 'submitting';

    const onCommit = () => {
        if (!canCommit) {
            return;
        }
        setResolve({ kind: 'submitting' });
        gateway()
            .invoke(
                REVIEW_RESOLVE_METHOD,
                reviewResolveRequest({ itemId: item.itemId, decision, rationale: rationale.trim() })
            )
            .then(() => {
                setResolve({ kind: 'resolved', decision });
                onResolved?.(item.itemId);
            })
            .catch(err =>
                setResolve({
                    kind: 'refused',
                    reason: err instanceof Error ? err.message : String(err)
                })
            );
    };

    return (
        <section
            className="acr-review-decision"
            data-testid="review-decision-controls"
            data-review-id={item.itemId}
            data-human-required={item.requiresHuman ? 'true' : 'false'}
            data-gate-ok={gate.ok ? 'true' : 'false'}
        >
            <h4>Review decision</h4>
            <p className="acr-review-item-title" data-testid="acr-review-item-title">
                {item.title}
            </p>

            <Iod17ParityMatrix readout={parity} />

            <label className="acr-review-field">
                <span>decision</span>
                <select
                    data-testid="acr-decision-select"
                    value={decision}
                    onChange={event => setDecision(event.currentTarget.value as AcrReviewDecision)}
                >
                    {ACR_REVIEW_DECISIONS.map(entry => (
                        <option key={entry} value={entry}>
                            {entry}
                        </option>
                    ))}
                </select>
            </label>

            <label className="acr-review-field">
                <span>rationale</span>
                <textarea
                    data-testid="acr-decision-rationale"
                    value={rationale}
                    onChange={event => setRationale(event.currentTarget.value)}
                />
            </label>

            {item.requiresHuman ? (
                <label className="acr-review-human-of-record">
                    <input
                        type="checkbox"
                        data-testid="acr-human-of-record"
                        checked={humanOfRecord}
                        onChange={event => setHumanOfRecord(event.currentTarget.checked)}
                    />
                    <span>
                        I am committing this human-gated item as the human of record
                    </span>
                </label>
            ) : null}

            {!gate.ok ? (
                <p className="acr-review-gate-refusal" data-testid="acr-gate-refusal">
                    {gate.reason}
                    {/* 28.9 (e) — the human-required banner extended with the
                        PARITY STATUS LINE. The refusal says why this operator
                        cannot commit; the line says whether the substrate would
                        accept the transition at all once they could. Two
                        different failures that a single sentence used to blur. */}
                    <span
                        className="acr-review-parity-status"
                        data-testid="acr-gate-parity-status"
                        data-in-parity={parity.inParity ? 'true' : 'false'}
                    >
                        {parity.inParity
                            ? 'IOD-17 parity holds — the gateway will accept a human resolution.'
                            : parity.violation}
                    </span>
                </p>
            ) : null}

            <button
                type="button"
                data-testid="acr-decision-commit"
                disabled={!canCommit}
                onClick={onCommit}
            >
                {resolve.kind === 'submitting' ? 'resolving…' : `${decision} via ${binding.method}`}
            </button>

            <p className="acr-review-method-note" data-testid="acr-decision-method-note">
                {`spec named \`${binding.specNamed}\` — ${binding.correction}`}
            </p>

            {!connected ? (
                <p className="pane-message" data-testid="acr-decision-disconnected">
                    gateway not connected — no decision can be committed
                </p>
            ) : null}

            {resolve.kind === 'resolved' ? (
                <p className="acr-review-ok" data-testid="acr-decision-ok">
                    {`resolved: ${resolve.decision}`}
                </p>
            ) : resolve.kind === 'refused' ? (
                <p className="acr-review-refused" data-testid="acr-decision-refused">
                    {`gateway refused: ${resolve.reason}`}
                </p>
            ) : null}
        </section>
    );
}
