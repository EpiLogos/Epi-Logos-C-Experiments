/**
 * Coordinate: M' `/` membrane + M5' chrome (Review item view — 28.T28.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni/review
 * Position (#n): #3 — Process: ONE component that IS both DR-WC-IS-2 foldings
 *   of a review row, exactly as 28.T28.8 made `EvidencePacketView` one component
 *   with a declared `fold` prop rather than two components over one dataset.
 * Actualises: 28.9 (b)/(c)/(d)/(e) over the 28.9 (a) type.
 *
 *   `fold="abbreviated"` is the always-on `/` membrane render: the inbox row,
 *   its human-required gate, and the click-throughs — plus, on that side only,
 *   the honest note that the FULL parity readout is the governance fold's, and
 *   the disabled seam for crossing into it (no target promotes
 *   `agenticControlRoom` into `ide-deep`; 52.T3 / 28.T28.14).
 *
 *   `fold="deep"` is the GOVERNANCE AUDIT render that lives only in the
 *   `agenticControlRoom` pane of `ide-deep` (§5 DR-WC-IS-1) and adds the IOD-17
 *   three-cell parity matrix the item CARRIES — never one this component
 *   computes. A cell agrees when it reads `human-required`, which is what a
 *   governed review surface must report; anything else means an agent has
 *   acquired a commit path and the aggregate raises the spec's verbatim banner
 *   (imported from the ACR, the DR-WC-IS-1 source of truth, never restated).
 *
 *   ONE RECORD IDENTITY across both: the host folds read and write the shared
 *   `perTabState.review.selectedReviewId`, so a row selected in either surface
 *   is the row the other renders — the bidirectional highlight, on the seam
 *   this carrier actually has.
 *
 *   15.2: this is a LANDING SURFACE. Every affordance renders in place; nothing
 *   here opens a modal.
 * Public surface: ReviewFold, ReviewItemDeepView.
 * Does NOT own: the projection (`reviewItemDeep.ts`), the parity LAW
 *   (`panes/acr/acrGovernance.ts`), the seam register (`reviewPaneSeams.ts`),
 *   intent routing (`panes/omni/omnipanelIntentRouter.ts`), or the decision
 *   write (`panes/acr/ReviewDecisionControls.tsx`).
 * Contract: [[CHROME-CONTRACT]] §5 ([[DR-WC-IS-1]] / [[DR-WC-IS-2]]) · rerun
 *   tranche [[28.T28.9]].
 */

import { IOD17_PARITY_VIOLATION_MESSAGE } from '../../acr/acrGovernance';
import type { GateLandingIod17Parity } from '../evidenceShapes';
import type { ReviewItemDeep } from './reviewItemDeep';
import { REVIEW_DEEP_RENDER_SURFACE, reviewPaneSeam } from './reviewPaneSeams';

/** DR-WC-IS-2: the abbreviated `/` render vs the `ide-deep` governance audit. */
export type ReviewFold = 'abbreviated' | 'deep';

const PARITY_CELLS = Object.freeze([
    { id: 'capability-matrix', field: 'capabilityMatrixState', label: 'capability matrix' },
    { id: 'agent-contract', field: 'agentContractState', label: 'agent contract' },
    { id: 'widget', field: 'widgetState', label: 'widget' }
] as const);

/**
 * 28.9 (b). The expectation each cell is marked against: a governed review
 * surface must report that a HUMAN is required. `agent-allowed` means an agent
 * has acquired a commit path; `unset` means that face was never read. Either is
 * a red mark, because either makes the aggregate unsafe to act on.
 */
const AGREEING_FACE_STATE = 'human-required';

function ReviewItemParityMatrix({
    itemId,
    parity
}: {
    readonly itemId: string;
    readonly parity: GateLandingIod17Parity;
}) {
    return (
        <section
            className="review-iod17"
            data-testid={`review-iod17-${itemId}`}
            data-in-parity={parity.inParity ? 'true' : 'false'}
        >
            <span className="review-iod17-label">IOD-17 parity</span>
            <ul className="review-iod17-cells" role="list">
                {PARITY_CELLS.map(cell => {
                    const state = parity[cell.field];
                    const agrees = state === AGREEING_FACE_STATE;
                    return (
                        <li
                            key={cell.id}
                            role="listitem"
                            className={`review-iod17-cell ${agrees ? 'review-iod17-agrees' : 'review-iod17-disagrees'}`}
                            data-testid={`review-iod17-cell-${cell.id}`}
                            data-state={state}
                            data-agrees={agrees ? 'true' : 'false'}
                        >
                            <span className="review-iod17-mark" aria-hidden="true">
                                {agrees ? '✓' : '✗'}
                            </span>
                            <span className="review-iod17-face">{cell.label}</span>
                            <span className="review-iod17-state">{state}</span>
                        </li>
                    );
                })}
            </ul>
            <p
                className={`review-iod17-aggregate ${parity.inParity ? 'review-iod17-agrees' : 'review-iod17-disagrees'}`}
                data-testid={`review-iod17-aggregate-${itemId}`}
            >
                {parity.inParity ? 'in parity' : 'out of parity'}
            </p>
            {parity.inParity ? null : (
                <p
                    className="review-iod17-violation"
                    role="alert"
                    data-testid={`review-iod17-violation-${itemId}`}
                >
                    {IOD17_PARITY_VIOLATION_MESSAGE}
                </p>
            )}
        </section>
    );
}

/** A seam the 28.9 spec named that the substrate does not resolve: disabled,
 *  and saying which name is missing and why (the 28.5 / 28.7 / 28.8 discipline). */
function DisabledSeam({
    testId,
    label,
    seamName
}: {
    readonly testId: string;
    readonly label: string;
    readonly seamName: string;
}) {
    const seam = reviewPaneSeam(seamName);
    return (
        <div className="review-unwired-seam" data-testid={testId} data-wire-state="unwired">
            <button type="button" disabled data-testid={`${testId}-button`}>
                {label}
            </button>
            <span className="review-unwired-target">{seamName}</span>
            <span className="review-unwired-reason">{seam?.reason ?? 'no seam declared'}</span>
        </div>
    );
}

/** 28.9 (e) — the parity status LINE the human-required banner carries. Nothing
 *  is asserted from an unread matrix: the abbreviated fold says whose readout it
 *  is, the deep fold says which method has not answered. */
function parityStatusLine(item: ReviewItemDeep, fold: ReviewFold): string {
    if (item.iod17Parity === null) {
        return fold === 'deep'
            ? "IOD-17 parity unread — `s4'.mediation.capabilities.list` has not answered, and nothing is asserted from an unloaded matrix."
            : 'IOD-17 parity readout is the governance fold’s (DR-WC-IS-2) — this fold carries the inbox and the click-throughs.';
    }
    const aggregate = item.iod17Parity.inParity
        ? 'IOD-17 parity: all three faces agree that a human is required — the gateway will accept a human resolution.'
        : `IOD-17 parity: ${IOD17_PARITY_VIOLATION_MESSAGE}`;
    // A VIOLATION is never withheld from the abbreviated fold — DR-WC-IS-2
    // withholds the three-cell audit, not the fact that the substrate would
    // refuse. So the aggregate travels, and the pointer to the full readout
    // travels with it.
    return fold === 'deep'
        ? aggregate
        : `${aggregate} The full three-cell readout is the governance fold’s (DR-WC-IS-2).`;
}

export function ReviewItemDeepView({
    item,
    fold = 'abbreviated',
    selected = false,
    onSelect,
    onOpenDispatchTree,
    onOpenEvidence
}: {
    readonly item: ReviewItemDeep;
    /** DR-WC-IS-2. Defaults to the always-on `/` render. */
    readonly fold?: ReviewFold;
    readonly selected?: boolean;
    readonly onSelect?: (itemId: string) => void;
    /** 28.9 (c) — carries `dispatchGenealogyRef`. */
    readonly onOpenDispatchTree?: (dispatchGenealogyRef: string) => void;
    /** 28.9 (d) — carries `mediatedRunEvidencePacketId`. */
    readonly onOpenEvidence?: (mediatedRunEvidencePacketId: string) => void;
}) {
    const deep = fold === 'deep';
    return (
        <article
            className={`review-item-deep fold-${fold}`}
            data-testid={`review-item-${item.itemId}`}
            data-fold={fold}
            data-human-required={item.requiresHuman ? 'true' : 'false'}
            data-selected={selected ? 'true' : 'false'}
        >
            <button
                type="button"
                className="review-item-select"
                data-testid={`review-item-select-${item.itemId}`}
                aria-pressed={selected}
                onClick={() => onSelect?.(item.itemId)}
            >
                <span className="review-item-title">{item.title}</span>
                <span className="review-item-priority">{item.priority}</span>
                <span className="review-item-source">{item.source}</span>
                {item.coordinate ? (
                    <span className="review-item-coordinate">{item.coordinate}</span>
                ) : null}
            </button>

            {/* 28.9 (e) — the human-required banner, extended with the parity
                status line. Unchanged in what it gates; only what it says. */}
            {item.requiresHuman ? (
                <p
                    className="review-item-human-gate"
                    data-testid={`review-item-human-gate-${item.itemId}`}
                >
                    <span className="review-item-human-gate-headline">
                        Human ratification required — agent transitions blocked at gateway
                    </span>
                    <span
                        className="review-item-parity-status"
                        data-testid={`review-item-parity-status-${item.itemId}`}
                    >
                        {parityStatusLine(item, fold)}
                    </span>
                </p>
            ) : null}

            {/* ── the GOVERNANCE AUDIT half (DR-WC-IS-1 / DR-WC-IS-2) ───────── */}
            {deep && item.iod17Parity ? (
                <ReviewItemParityMatrix itemId={item.itemId} parity={item.iod17Parity} />
            ) : null}
            {deep && !item.iod17Parity ? (
                <p
                    className="pane-message"
                    data-testid={`review-iod17-pending-${item.itemId}`}
                >
                    {"IOD-17 parity unread — the row carries no three-face readout, which means "
                        + "`s4'.mediation.capabilities.list` had not answered when it was projected. "
                        + 'Nothing is asserted from an unloaded matrix.'}
                </p>
            ) : null}

            <div className="review-item-cross-fold">
                {/* 28.9 (c). Enabled only on a REAL genealogy root; a fold that
                    holds no genealogy has no node id to carry and says so
                    instead of routing to one it guessed. */}
                {item.dispatchGenealogyRef ? (
                    <button
                        type="button"
                        className="review-open-dispatch"
                        data-testid={`review-open-dispatch-${item.itemId}`}
                        data-cross-link="ide-shell-m0-m5.agentic-control-room.select-run"
                        data-dispatch-ref={item.dispatchGenealogyRef}
                        onClick={() => onOpenDispatchTree?.(item.dispatchGenealogyRef!)}
                    >
                        View dispatch tree →
                    </button>
                ) : (
                    <p
                        className="review-item-no-genealogy"
                        data-testid={`review-no-dispatch-${item.itemId}`}
                    >
                        {'No dispatch genealogy for this row — `ReviewInboxItem` carries no genealogy '
                            + 'field on the wire, so the ref is a join against the session its evidence '
                            + 'deposit was filed under, and this row has none.'}
                    </p>
                )}

                {/* 28.9 (d). Rendered only when a packet was really composed. */}
                {item.mediatedRunEvidencePacketId ? (
                    <button
                        type="button"
                        className="review-open-evidence"
                        data-testid={`review-open-evidence-${item.itemId}`}
                        data-cross-link="ide-shell-m0-m5.evidence-pane.select-packet"
                        data-evidence-id={item.mediatedRunEvidencePacketId}
                        onClick={() => onOpenEvidence?.(item.mediatedRunEvidencePacketId!)}
                    >
                        View evidence →
                    </button>
                ) : null}

                {/* DR-WC-IS-2's click-through, in the direction the carrier
                    cannot yet route: crossing INTO `ide-deep` needs a target
                    that promotes `agenticControlRoom`, and the licensed set does
                    not carry it (52.T3 / 28.T28.14). The ROW IDENTITY still
                    crosses — both folds read `perTabState.review.selectedReviewId`
                    — so the row selected here is the row the deep audit renders. */}
                {deep ? null : (
                    <DisabledSeam
                        testId={`review-open-governance-audit-${item.itemId}`}
                        label="Open the full parity readout →"
                        seamName={`ide-shell-m0-m5/agentic-control-room → ${REVIEW_DEEP_RENDER_SURFACE}`}
                    />
                )}
            </div>
        </article>
    );
}
