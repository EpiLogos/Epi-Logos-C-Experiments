/**
 * Coordinate: M' M5' chrome (Review-item deep projection — rerun 28.T28.9 (a))
 * Residency: Body/M/pratibimba-app/src/panes/omni/review
 * Position (#n): #2 — Operation: the ONE producer both DR-WC-IS-2 foldings of
 *   the review surface consume. Not a second read of the queue; a projection of
 *   the reads each surface already makes onto the shape 26.5 / 28.9 (a) names.
 * Actualises: `ReviewItemDeep`. Before this tranche NO review-item type existed
 *   in the carrier at all — the `/` Review fold projected genealogy records into
 *   generic `Block`s (`panes/omni/reviewBlocks.ts`) carrying run/actor/method
 *   and nothing governance can act on, and the deep ACR queue carried the raw
 *   `AcrReviewItem` off `s5'.review.inbox`. Neither knew a parity readout, a
 *   dispatch-genealogy ref, or an evidence-packet id.
 *
 *   THE BASE IS NOT RESTATED. 28.9 (a) writes `ReviewItemDeep extends
 *   ReviewItem`; the carrier's `ReviewItem` is the strict `s5'.review.inbox`
 *   projection 28.T28.5 landed (`panes/acr/acrReviewInbox.ts::AcrReviewItem`),
 *   so this module aliases that one authority rather than declaring a second
 *   shape over the same wire rows.
 *
 *   THE THREE ADDED FIELDS ARE JOINS OVER REAL DATA, never invention:
 *
 *     · `iod17Parity` — the ACR's live three-face computation
 *       (`acrGovernance.computeIod17Parity`, DR-WC-IS-1 source of truth),
 *       projected onto the 26.10 flat field names by the same
 *       `iod17GateParityFrom` the evidence packet uses, so a review row and an
 *       evidence packet for the SAME item cannot report different parity. It is
 *       `null` — not a red readout — until `s4'.mediation.capabilities.list`
 *       has answered: 28.T28.8's law, because a violation banner rendered from
 *       an unloaded matrix is a spinner wearing an alarm.
 *
 *     · `mediatedRunEvidencePacketId` — the evidence deposit filed AS this
 *       review item. `s5'.epii.deposit` files an evidence deposition as a
 *       `review_item`, and `evidencePacketsFromDeposits` composes the packet
 *       with `id = deposit.itemId`, ONLY when the deposit carries structural
 *       `evidenceAnchors`. So the packet id is the review item's own id exactly
 *       when an anchored deposit backs it — and absent otherwise, rather than a
 *       link to a packet that was never composed.
 *
 *     · `dispatchGenealogyRef` — the root dispatch node of the session that
 *       deposit was filed against, matched by the SAME rule the packet producer
 *       uses (`record.id.startsWith(sessionKey)`, first parentless record). The
 *       sibling suite asserts the two agree on real data; a surface that held no
 *       genealogy gets `null` and says so instead of routing to a node id it
 *       guessed.
 *
 *   Both foldings call THIS function. The deep governance pane passes all four
 *   inputs; the `/` membrane fold passes the inbox, the deposits and — since
 *   26.T26.5 — the live session lineage, but NOT the capability matrix. That is
 *   precisely DR-WC-IS-2: "OmniPanel-Review-tab = inbox + click-through;
 *   ide-shell review-pane = FULL parity readout + governance audit. Same data,
 *   two foldings." What the abbreviated fold is denied is the parity AUDIT, not
 *   the run a row is about — so the genealogy travels and the click-through
 *   26.5 names can actually render there.
 * Public surface: ReviewItem, ReviewItemDeep, ReviewItemDeepInput,
 *   REVIEW_PARITY_DECISION, reviewItemsDeep, reviewItemDeepById.
 * Does NOT own: the wire projection (`panes/acr/acrReviewInbox.ts`), the parity
 *   LAW (`panes/acr/acrGovernance.ts` — DR-WC-IS-1), the packet composition
 *   (`panes/omni/evidence/evidencePacketProducer.ts`), the deposit reader
 *   (`panes/omni/evidence/evidenceDeposits.ts`), or the render
 *   (`ReviewItemDeepView.tsx`).
 * Contract: [[CHROME-CONTRACT]] §5 ([[DR-WC-IS-1]] / [[DR-WC-IS-2]]) · rerun
 *   tranche [[28.T28.9]].
 */

import { computeIod17Parity } from '../../acr/acrGovernance';
import type { AcrReviewItem } from '../../acr/acrReviewInbox';
import type { ReviewDecision } from '../../m5ReviewGate';
import type { DispatchGenealogyRecord } from '../dispatchGenealogy';
import type { GateLandingIod17Parity } from '../evidenceShapes';
import type { EvidenceDeposit } from '../evidence/evidenceDeposits';
import { iod17GateParityFrom } from '../evidence/evidencePacketProducer';
import type { MediationCapabilitySnapshot } from '../omnipanelCapabilities';

/**
 * 28.9 (a)'s base. ONE authority: the strict `s5'.review.inbox` projection
 * 28.T28.5 landed. Aliased rather than re-declared so a wire field added there
 * appears here, and the two can never disagree about what a review item is.
 */
export type ReviewItem = AcrReviewItem;

/**
 * 28.9 (a), against the carrier's real substrate.
 *
 * Two departures from the spec's literal declaration, both because the
 * alternative is fabrication:
 *   · `iod17Parity` is NULLABLE. The spec types it present with an `'unset'`
 *     face state available; but a readout whose faces are all `'unset'` still
 *     computes `inParity: false`, which is the red banner 28.9 (b) attaches to
 *     "the gateway will reject any transition" — a claim nobody measured. Null
 *     means UNREAD, and the surface says which method has not answered.
 *   · `dispatchGenealogyRef` is NULLABLE. `ReviewInboxItem`
 *     (`Body/S/S5/epii-review-core/src/lib.rs`) carries no genealogy field on
 *     the wire, so the ref is a join; a surface holding no genealogy has no ref
 *     and must not route to an invented node id.
 */
export interface ReviewItemDeep extends ReviewItem {
    readonly iod17Parity: GateLandingIod17Parity | null;
    readonly dispatchGenealogyRef: string | null;
    readonly mediatedRunEvidencePacketId?: string;
}

/**
 * The decision the parity readout asks about. `approve` is the committal one —
 * the strictest form of IOD-17's single question ("may an AGENT commit this?").
 * `defer` commits nothing, so asking the gate about it would answer an easier
 * question than the governance reader needs. Same constant, same reasoning as
 * the evidence packet's `iod17-parity` landing (28.T28.8).
 */
export const REVIEW_PARITY_DECISION: ReviewDecision = 'approve';

export interface ReviewItemDeepInput {
    /** The live `s5'.review.inbox` rows. */
    readonly items: readonly ReviewItem[];
    /** The live `s5'.epii.deposit.list` rows, or [] for a fold that reads none. */
    readonly deposits: readonly EvidenceDeposit[];
    /** The genealogy this surface holds, or [] for a fold that folds none. */
    readonly genealogy: readonly DispatchGenealogyRecord[];
    /** The live S4 projection; null until it answers, or for a fold that does
     *  not read it (DR-WC-IS-2 gives the parity readout to the deep fold). */
    readonly snapshot: MediationCapabilitySnapshot | null;
    /** The shell's bound session — the deposit's own fallback, exactly as
     *  `evidencePacketsFromDeposits` treats it. */
    readonly sessionKey?: string | null;
}

/**
 * The genealogy root for a session, by the packet producer's own matching rule.
 * Kept verbatim so a review row's `dispatchGenealogyRef` and the packet's
 * `dispatchTrace.id` name the SAME node for the same deposit.
 */
function genealogyRootFor(
    genealogy: readonly DispatchGenealogyRecord[],
    sessionKey: string | null
): string | null {
    if (sessionKey === null || sessionKey.length === 0) {
        return null;
    }
    const root = genealogy.find(
        record => record.id.startsWith(sessionKey) && record.parentId === null
    );
    return root ? root.id : null;
}

/** Project the live inbox into the shape both foldings render. */
export function reviewItemsDeep(input: ReviewItemDeepInput): readonly ReviewItemDeep[] {
    const depositsById = new Map(input.deposits.map(deposit => [deposit.itemId, deposit]));
    const shellSession = input.sessionKey ?? null;

    return Object.freeze(
        input.items.map(item => {
            const deposit = depositsById.get(item.itemId) ?? null;
            // A packet is composed ONLY from a deposit carrying structural
            // anchors, with `id = deposit.itemId`. No anchors, no packet, no id.
            const packetId =
                deposit && deposit.evidenceAnchors !== null ? deposit.itemId : undefined;
            const session = deposit ? (deposit.sessionKey ?? shellSession) : shellSession;
            const parity =
                input.snapshot === null
                    ? null
                    : iod17GateParityFrom(
                          computeIod17Parity({
                              humanRequired: item.requiresHuman,
                              decision: REVIEW_PARITY_DECISION,
                              snapshot: input.snapshot
                          })
                      );
            return Object.freeze({
                ...item,
                iod17Parity: parity,
                dispatchGenealogyRef: genealogyRootFor(input.genealogy, session),
                ...(packetId ? { mediatedRunEvidencePacketId: packetId } : {})
            });
        })
    );
}

/** The row a shared `selectedReviewId` names, or null. */
export function reviewItemDeepById(
    items: readonly ReviewItemDeep[],
    itemId: string | null
): ReviewItemDeep | null {
    if (itemId === null) {
        return null;
    }
    return items.find(item => item.itemId === itemId) ?? null;
}
