/**
 * Coordinate: M' M5' chrome (Review-pane substrate seams — rerun 28.T28.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni/review
 * Position (#n): #1 — Definition: what the 28.9 spec NAMES, held against what
 *   the substrate really registers and what the live intent ledger really
 *   resolves, so neither review folding can claim a seam it does not have.
 * Actualises: the bindings map for tranche 28.9 — the discipline
 *   `panes/acr/acrGovernance.ts` (28.5), `panes/atelier/atelierSeams.ts` (28.7)
 *   and `panes/omni/evidence/evidencePaneSeams.ts` (28.8) established. An
 *   unavailable seam renders its affordance DISABLED with the name and the
 *   reason ON the surface; the sibling suite probes `Body/S` and the live target
 *   ledger, so every claim here goes RED the day the missing arm or row lands.
 *
 *   THE ONE REAL ABSENCE this tranche found is the mirror of 28.T28.8's: 28.9
 *   (c) asks the dispatch-genealogy button to open the AGENTIC CONTROL ROOM with
 *   its RunTree highlighted. `agenticControlRoom` mounts only in `ide-deep`
 *   (52.T4), and `DEPTH_DIFFERENTIATED_COMPONENTS` licenses exactly four
 *   components to promote an intent into that layout — it is not among them
 *   (52.T3). So an intent fired from the `/` fold cannot cross into the deep
 *   pane; the carrier's `agentic-control-room` target resolves to
 *   `omniDispatchTrace`, the `/` membrane's own RunTree, and the live route
 *   `agentic-control-room.select-run` carries the node id there. That is a real
 *   landing of the same node identity (15.11) — it is simply NOT the deep pane,
 *   and this register says so rather than letting the button imply otherwise.
 *   Inside the deep pane the same click needs no hop at all: it selects the
 *   pane's own RunTree.
 *
 *   THE ENVELOPE FIELD NAMES are the frozen tree's, not this carrier's. 28.9
 *   (c)/(d) write `requestedSessionKey` / `requestedEvidenceRecordId`; the
 *   CHROME-CONTRACT §5 envelope this carrier dispatches has nine fields and
 *   those are not among them (`commands/crossLayoutIntent.ts::CrossLayoutIntent`
 *   carries `sessionKey`, `artifactUri`, `reviewId`). The OmniPanel resolvers
 *   read `artifactUri` for both the dispatch node and the evidence packet, so
 *   the carriage happens under the carrier's own field names — recorded here
 *   rather than silently substituted.
 * Public surface: ReviewPaneSeamKind, ReviewPaneSeam, REVIEW_PANE_SEAMS,
 *   reviewPaneSeam, REVIEW_DEEP_RENDER_SURFACE, REVIEW_ABBREVIATED_SURFACE,
 *   REVIEW_DISPATCH_TREE_ROUTE, REVIEW_EVIDENCE_ROUTE.
 * Does NOT own: the intent ledger (`commands/crossLayoutIntent.ts`), the fold
 *   routing table (`panes/omni/omnipanelIntentRouter.ts`), the review store law
 *   (S5' `epii-review-core`), the parity law (`panes/acr/acrGovernance.ts`), or
 *   the ACR's own method register (`ACR_METHOD_BINDINGS` — the `transition`
 *   correction lives there and is referenced, not restated).
 * Contract: [[CHROME-CONTRACT]] §2 (`omniReview`, `agenticControlRoom`) + §5
 *   ([[DR-WC-IS-1]] / [[DR-WC-IS-2]]) · rerun tranche [[28.T28.9]].
 */

/**
 * DR-WC-IS-2's two halves in this carrier. The frozen tree had an ide-shell
 * review-pane widget and an OmniPanel Review tab; the carrier has the `/`
 * membrane's Review fold plus the governance-primary deep pane §5 names, so the
 * FULL parity readout lands inside `agenticControlRoom` (`ide-deep`, personal
 * face) and the always-on fold keeps the abbreviated inbox + click-through.
 */
export const REVIEW_DEEP_RENDER_SURFACE = 'agenticControlRoom';
export const REVIEW_ABBREVIATED_SURFACE = 'omniReview';

/** 28.9 (c) — the live OmniPanel route the dispatch click-through rides. */
export const REVIEW_DISPATCH_TREE_ROUTE = Object.freeze({
    requestedExtensionId: 'ide-shell-m0-m5',
    requestedContributionId: 'agentic-control-room.select-run'
});

/** 28.9 (d) — the live OmniPanel route the evidence click-through rides. */
export const REVIEW_EVIDENCE_ROUTE = Object.freeze({
    requestedExtensionId: 'ide-shell-m0-m5',
    requestedContributionId: 'evidence-pane.select-packet'
});

export type ReviewPaneSeamKind =
    | 'gateway-method'
    | 'intent-route'
    | 'intent-target'
    | 'intent-field';

export interface ReviewPaneSeam {
    /** Which 28.9 deliverable named it. */
    readonly deliverable: string;
    readonly kind: ReviewPaneSeamKind;
    /** The name the spec used — method, route key, target pair, or field. */
    readonly name: string;
    /** The name the CARRIER really registers, when it differs. */
    readonly carrierName: string | null;
    /** True only when the substrate really dispatches/resolves the close-path. */
    readonly available: boolean;
    /** What the spec expected it to do. */
    readonly expected: string;
    /** What it really is, and why a gap is disclosed rather than filled here. */
    readonly reason: string;
}

export const REVIEW_PANE_SEAMS: readonly ReviewPaneSeam[] = Object.freeze([
    Object.freeze({
        deliverable: '28.9 (a) — the review-item feed',
        kind: 'gateway-method' as const,
        name: "s5'.review.inbox",
        carrierName: null,
        available: true,
        expected: 'the open governance queue both foldings project into ReviewItemDeep',
        reason:
            'registered at S5 (`Body/S/S5/epii-review-core/src/s5_handlers.rs::S5_REVIEW_METHODS`) '
            + 'and composed into the gateway registry by '
            + '`Body/S/S0/epi-cli/src/gate/server/dispatch.rs::register_s5_review_handlers`. Read '
            + 'live by BOTH foldings as of this tranche — the deep pane since 28.T28.5, the `/` '
            + 'Review fold from here, so the abbreviated half stops being a genealogy fixture '
            + 'wearing the word "review".'
    }),
    Object.freeze({
        deliverable: '28.9 (a) — the evidence-packet identity',
        kind: 'gateway-method' as const,
        name: "s5'.epii.deposit.list",
        carrierName: null,
        available: true,
        expected: '`mediatedRunEvidencePacketId` for a row whose deposit carries anchors',
        reason:
            "registered at S5' (`Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs`). An evidence "
            + 'deposition is filed AS a review item, and `evidencePacketsFromDeposits` composes its '
            + 'packet with `id = deposit.itemId` only when structural `evidenceAnchors` are present '
            + '— so the packet id IS the review item id exactly when a packet exists, and is absent '
            + 'otherwise rather than linking to one that was never composed.'
    }),
    Object.freeze({
        deliverable: '28.9 (b) — the capability-matrix face of the parity readout',
        kind: 'gateway-method' as const,
        name: "s4'.mediation.capabilities.list",
        carrierName: null,
        available: true,
        expected: 'the first of the three IOD-17 faces',
        reason:
            'the live S4 projection. DR-WC-IS-1 makes the ACR the IOD-17 source of truth, so the '
            + 'producer CONSUMES `acrGovernance.computeIod17Parity` rather than restating the law. '
            + 'Until the matrix answers NO readout is emitted at all — a violation banner built '
            + 'from an unloaded matrix is a spinner wearing an alarm (28.T28.8). DR-WC-IS-2 gives '
            + 'that readout to the deep fold, so the abbreviated fold does not read this method.'
    }),
    Object.freeze({
        deliverable: '28.9 (e) — the decision the human-required banner gates',
        kind: 'gateway-method' as const,
        name: "s5'.review.transition",
        carrierName: "s5'.review.resolve",
        available: true,
        expected: 'commit a decision on an open review item',
        reason:
            '`transition` is registered nowhere in Body/S; the S5 review surface is `submit` / '
            + '`inbox` / `resolve` / `history`, and the transition on an OPEN item is `resolve`. '
            + '28.T28.5 landed that correction in `panes/acr/acrGovernance.ts::ACR_METHOD_BINDINGS` '
            + 'and it is referenced here, never restated, so there is one place to fix if S5 ever '
            + 'grows the arm.'
    }),
    Object.freeze({
        deliverable: '28.9 (c) — dispatch-genealogy click-through',
        kind: 'intent-route' as const,
        name: 'ide-shell-m0-m5/agentic-control-room.select-run',
        carrierName: null,
        available: true,
        expected: 'carry `dispatchGenealogyRef` into a RunTree highlighted on the matching dispatch',
        reason:
            'the 27.9 routing table resolves this key to the Dispatch Trace fold with '
            + '`selectedNodeId = artifactUri`, which is the same node identity the genealogy fold '
            + 'and the evidence packet use (15.11). It is the INBOUND seam only: 26.T26.7 '
            + 'established that the deep pane does not fire it — its own RunTree IS the structural '
            + 'fold, so it fires `agentic-control-room.open-tool-stream` for the TEMPORAL one '
            + 'instead (`panes/acr/acrGovernance.ts::ACR_FOLD_ROUTES`).'
    }),
    Object.freeze({
        deliverable: '28.9 (c) — the surface the spec wanted that click to land on',
        kind: 'intent-target' as const,
        name: `ide-shell-m0-m5/agentic-control-room → ${REVIEW_DEEP_RENDER_SURFACE}`,
        carrierName: 'ide-shell-m0-m5/agentic-control-room → omniDispatchTrace',
        available: false,
        expected: 'open the deep Agentic Control Room with its RunTree highlighted',
        reason:
            'the target row exists but resolves to `omniDispatchTrace` with `preferredLayout: '
            + 'null`, and `DEPTH_DIFFERENTIATED_COMPONENTS` licenses only four components to '
            + 'promote an intent into `ide-deep` — `agenticControlRoom` is not among them (52.T3). '
            + 'Promoting it is a public-surface change owned by 28.T28.14, the identical gap '
            + '28.T28.8 recorded from the evidence side. So the `/` fold routes the node into the '
            + "membrane's own RunTree and SAYS that is where it lands; inside the deep pane the "
            + 'same click needs no hop and selects that pane’s RunTree directly.'
    }),
    Object.freeze({
        deliverable: '28.9 (d) — evidence-packet click-through',
        kind: 'intent-route' as const,
        name: 'ide-shell-m0-m5/evidence-pane.select-packet',
        carrierName: null,
        available: true,
        expected: 'open the Evidence surface highlighted on `mediatedRunEvidencePacketId`',
        reason:
            'the 27.9 routing table resolves this key to the Evidence fold with `selectedPacketId '
            + '= artifactUri`, and BOTH evidence foldings read that one '
            + '`perTabState.evidence.selectedPacketId` (28.T28.8). So this click-through lands the '
            + 'record in the abbreviated fold AND in the deep governance audit at once. The '
            + 'reverse direction is live too — `omnipanel-shell/evidence.open-review` carries a '
            + 'record back into the Review fold — so the pair is bidirectional (DR-WC-IS-2).'
    }),
    Object.freeze({
        deliverable: '28.9 (c)/(d) — the envelope field names',
        kind: 'intent-field' as const,
        name: 'requestedSessionKey / requestedEvidenceRecordId / requestedReviewId',
        carrierName: 'sessionKey / artifactUri / reviewId',
        available: true,
        expected: 'carry the genealogy ref and the packet id on the CrossLayoutIntent',
        reason:
            'the CHROME-CONTRACT §5 envelope this carrier dispatches has nine fields and none of '
            + 'the spec spellings is among them; the OmniPanel resolvers read `artifactUri` for '
            + 'both the dispatch node and the evidence packet, and `reviewId` for a review target. '
            + 'The carriage is real under the carrier’s own names — renaming the envelope is a '
            + 'public-surface change nobody licensed, so the correction is recorded instead.'
    })
]);

/** The seam covering a spec name, if the register discloses one. */
export function reviewPaneSeam(name: string): ReviewPaneSeam | null {
    return REVIEW_PANE_SEAMS.find(seam => seam.name === name || seam.carrierName === name) ?? null;
}
