/**
 * Coordinate: M' M5' chrome (ACR governance queue reader — 28.T28.5)
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): #2 — Operation: the strict projection of the live S5 review
 *   surface into the shape the deep governance render consumes.
 * Actualises: `s5'.review.inbox` → `AcrReviewItem[]` and the
 *   `s5'.review.resolve` REQUEST body, both against the real S5 DTOs
 *   (`Body/S/S5/epii-review-core/src/lib.rs::ReviewInboxItem` /
 *   `ReviewResolveRequest`). Snake-case on the wire, camel-case in the carrier;
 *   an unparsable row is DROPPED rather than defaulted, because a governance
 *   queue that silently invents `requires_human: false` is worse than a short
 *   one.
 *
 *   `s5'.review.transition` — the method 28.5 asked for — does not exist. See
 *   `acrGovernance.ts::ACR_METHOD_BINDINGS` for the correction; the decision
 *   half of the spec's `ReviewDecisionControls` is `resolve`, reached from
 *   `inbox`.
 * Public surface: REVIEW_INBOX_METHOD, REVIEW_RESOLVE_METHOD, AcrReviewItem,
 *   AcrReviewDecision, ACR_REVIEW_DECISIONS, parseReviewInbox,
 *   reviewResolveRequest.
 * Does NOT own: the review store law (S5 `epii-review-core`), the human gate
 *   (`panes/m5ReviewGate.ts`), or the transport (`bridge/gatewayHolder.ts`).
 * Contract: [[S5-SPEC]] review governance · rerun tranche [[28.T28.5]].
 */

/** The two live S5 methods this surface rides. Held in one place so the
 *  register in `acrGovernance.ts` and the caller cannot drift. */
export const REVIEW_INBOX_METHOD = "s5'.review.inbox";
export const REVIEW_RESOLVE_METHOD = "s5'.review.resolve";

/** `ReviewDecision` as S5 serialises it (snake_case, four variants). Note that
 *  S5 has no `summarize`; the carrier's wider `m5ReviewGate` vocabulary is the
 *  gate's, not the wire's. */
export const ACR_REVIEW_DECISIONS = Object.freeze([
    'approve',
    'reject',
    'revise',
    'defer'
] as const);

export type AcrReviewDecision = (typeof ACR_REVIEW_DECISIONS)[number];

export interface AcrReviewItem {
    readonly itemId: string;
    readonly title: string;
    readonly source: string;
    readonly priority: string;
    readonly status: string;
    readonly requiresHuman: boolean;
    readonly coordinate: string | null;
    readonly createdAtMs: number;
}

function record(value: unknown): Readonly<Record<string, unknown>> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function nonBlank(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function parseItem(value: unknown): AcrReviewItem | null {
    const source = record(value);
    if (!source) {
        return null;
    }
    const itemId = nonBlank(source.item_id);
    const title = nonBlank(source.title);
    // `requires_human` is the gate; a row that does not state it is unusable.
    if (itemId === null || title === null || typeof source.requires_human !== 'boolean') {
        return null;
    }
    const context = record(source.coordinate_context);
    return Object.freeze({
        itemId,
        title,
        source: nonBlank(source.source) ?? 'unknown',
        priority: nonBlank(source.priority) ?? 'normal',
        status: nonBlank(source.status) ?? 'open',
        requiresHuman: source.requires_human,
        coordinate: context ? nonBlank(context.coordinate) : null,
        createdAtMs: typeof source.created_at === 'number' ? source.created_at : 0
    });
}

/** `{ items: [...] }` — the `ReviewInbox` DTO. Anything else yields []. */
export function parseReviewInbox(artifact: unknown): readonly AcrReviewItem[] {
    const envelope = record(artifact);
    const items = envelope?.items;
    if (!Array.isArray(items)) {
        return Object.freeze([]);
    }
    return Object.freeze(
        items
            .map(parseItem)
            .filter((item): item is AcrReviewItem => item !== null)
    );
}

/**
 * The `ReviewResolveRequest` body. `resolved_by` is always `'human'` here: the
 * ACR is GOVERNANCE PRIMARY and the human gate has already refused any agent
 * committal before this is built — there is no code path that composes an
 * agent resolution from this surface.
 */
export function reviewResolveRequest(input: {
    readonly itemId: string;
    readonly decision: AcrReviewDecision;
    readonly rationale: string;
}): Readonly<Record<string, unknown>> {
    return Object.freeze({
        item_id: input.itemId,
        decision: input.decision,
        rationale: input.rationale,
        resolved_by: 'human',
        promotion_destination: null,
        promoted_artifact: null
    });
}
