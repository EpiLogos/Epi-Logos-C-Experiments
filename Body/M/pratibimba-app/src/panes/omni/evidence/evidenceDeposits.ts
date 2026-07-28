/**
 * Coordinate: M' `/` membrane (Evidence deposition read/write mapping — 26.T26.4)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): the seam between the authored deposit draft and the LANDED
 *   `s5'.epii.deposit` contract, and the strict reader for its sibling
 *   `s5'.epii.deposit.list` (the read method 27:52 names for this fold).
 * Actualises: the two halves of the deposition loop that were broken.
 *
 *   THE WRITE was built against a method shape that does not exist. The form
 *   posted its packet-shaped draft verbatim — `{title, candidateId, coordinate,
 *   sourceAnchor, graphAnchor, reviewId, testAnchor, privacyClass}` — but S0
 *   deserialises the params straight into `DepositRequest` (epii-agent-core:
 *   `source_agent`, `source_coordinate`, `deposit_type`, `title`, `body`,
 *   `artifact{path}`, `requires_human`). Not one required field was supplied, so
 *   every submit the form has ever made was refused by serde before reaching the
 *   review store. `depositRequestFromDraft` is that mapping, made explicit.
 *
 *   THE READ is a projection of the review store, so a deposit comes back as
 *   what it IS — a review item carrying a `deposit_type` — and NOT as a
 *   `MediatedRunEvidencePacket`. The two are different shapes: a deposit has no
 *   `dispatchTrace`, no `toolStream`, no `gateLandings`, no
 *   `axiomTranslationSteps`. Projecting one onto the other would fabricate the
 *   run evidence that the packet exists to carry, so this module does not. The
 *   fold renders deposits as deposits; the packet view still waits on a real
 *   packet producer.
 * Public surface: EvidenceDeposit, DepositDraft, depositRequestFromDraft,
 *   readEvidenceDeposits, DEPOSIT_LIST_METHOD, DEPOSIT_METHOD.
 * Does NOT own: the deposit contract (S5' epii-agent-core `DepositRequest`), the
 *   review store, or the packet schema (evidenceShapes.ts).
 * Contract: [[M5'-SPEC]] + rerun tranches [[26.T26.4]] / [[26.T26.10]].
 */

export const DEPOSIT_METHOD = "s5'.epii.deposit";
export const DEPOSIT_LIST_METHOD = "s5'.epii.deposit.list";

/**
 * `source_agent` is not free text — S5 maps it onto a `ReviewSource`
 * (epii-agent-core `review_source`) and REFUSES anything else. These are the
 * accepted spellings; a deposit naming any other agent is rejected by the
 * domain even though it parses.
 */
export const DEPOSIT_SOURCE_AGENTS = Object.freeze([
    'anima',
    'aletheia',
    'autoresearch',
    'epii-autoresearch',
    'human',
    'human_gate'
] as const);

/**
 * A deposit authored in this fold's form is made BY the person reading it, so
 * it enters as the human gate rather than as an agent that did not act. The
 * first draft of this defaulted to `epii`, which parses fine and is then
 * refused by `review_source` — the e2e caught it, the jsdom mock could not.
 */
const AUTHORED_BY_HUMAN = 'human';

/** The author-supplied draft the inline form collects. */
export interface DepositDraft {
    readonly title: string;
    readonly candidateId: string;
    readonly coordinate: string;
    readonly sourceAnchor: string;
    readonly graphAnchor: string;
    readonly reviewId: string;
    readonly testAnchor: string;
    readonly privacyClass: string;
}

/**
 * The claim half of an evidence packet, as the deposit carried it. Absent when
 * the deposit is not evidence for a run — which is a different state from
 * "present but empty", and the producer treats it as such.
 */
export interface EvidenceAnchors {
    readonly candidateId: string;
    readonly graphAnchor: string;
    readonly reviewId: string;
    readonly testAnchor: string;
    readonly privacyClass: string;
}

/** One deposit as `s5'.epii.deposit.list` projects it back out. */
export interface EvidenceDeposit {
    readonly itemId: string;
    readonly depositType: string;
    readonly title: string;
    readonly body: string;
    readonly status: string;
    readonly requiresHuman: boolean;
    /** Epoch millis. The review store stamps `created_at` as a `u128`
     *  (`now_ms()`), and serde emits that as a JSON NUMBER — reading it as a
     *  string yields empty for every live row while unit fixtures that use an
     *  ISO string pass, because the emitter never produces one. Null only when
     *  the wire genuinely carried no timestamp. */
    readonly createdAtMs: number | null;
    readonly sourceAgent: string | null;
    readonly sourceCoordinate: string | null;
    readonly sessionKey: string | null;
    readonly artifactPath: string | null;
    readonly evidenceAnchors: EvidenceAnchors | null;
}

function str(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** Epoch millis off the wire. The store stamps these as a Rust `u128`, so they
 *  arrive as JSON numbers; a string is accepted too rather than dropped, since
 *  either spelling names the same instant. */
function epochMs(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
        const dated = Date.parse(value);
        return Number.isNaN(dated) ? null : dated;
    }
    return null;
}

/**
 * The authored draft as a real `DepositRequest`.
 *
 * The anchors are not dropped on the floor: `sourceAnchor` is the artifact the
 * deposit is ABOUT, so it becomes `artifact.path`; `coordinate` addresses it in
 * both the artifact and the deposit's own source coordinate; and the remaining
 * authored anchors (candidate, graph, review, test, privacy) are the detail of
 * the review item, so they go in the `body` where a human reviewer reads them.
 * Losing them would make the deposit unreviewable, which is the point of it.
 */
export function depositRequestFromDraft(
    draft: DepositDraft,
    context: { readonly sessionKey?: string | null; readonly sourceAgent?: string } = {}
): Record<string, unknown> {
    const body = [
        `candidate: ${draft.candidateId}`,
        `graph anchor: ${draft.graphAnchor}`,
        `review: ${draft.reviewId}`,
        `test anchor: ${draft.testAnchor}`,
        `privacy class: ${draft.privacyClass}`
    ].join('\n');
    return {
        source_agent: context.sourceAgent ?? AUTHORED_BY_HUMAN,
        source_coordinate: draft.coordinate,
        // The one DepositType this fold deposits: an evidence deposition is a
        // review item, which is exactly what the review store holds.
        deposit_type: 'review_item',
        title: draft.title,
        body,
        artifact: {
            path: draft.sourceAnchor,
            coordinate: draft.coordinate,
            kind: 'mediated_run_evidence'
        },
        ...(context.sessionKey ? { session_key: context.sessionKey } : {}),
        // The claim half, carried STRUCTURALLY so the Evidence fold can compose
        // a packet from it on the way back. The body copy above stays for a
        // human reader; a producer must not have to parse prose.
        evidence_anchors: {
            candidate_id: draft.candidateId,
            graph_anchor: draft.graphAnchor,
            review_id: draft.reviewId,
            test_anchor: draft.testAnchor,
            privacy_class: draft.privacyClass
        },
        requires_human: true
    };
}

/**
 * The review-item id out of a `DepositReceipt`, or null.
 *
 * The id is NESTED: `DepositReceipt { review_item: Option<ReviewItemReceipt>,
 * improvement_run, inbox_surface }` and `ReviewItemReceipt.item_id`
 * (epii-agent-core/src/deposits.rs). Neither struct carries a serde rename, so
 * those are the literal wire keys and there is no top-level `item_id` to read.
 * A probe at the top level silently returns undefined on every real response,
 * which is how a caller ends up reporting the author's own draft value back as
 * the store's id.
 */
export function depositReceiptItemId(artifact: unknown): string | null {
    if (typeof artifact !== 'object' || artifact === null) {
        return null;
    }
    const receipt = (artifact as Record<string, unknown>).review_item;
    if (typeof receipt !== 'object' || receipt === null) {
        return null; // a deposit that created no review item has no id to report
    }
    return str((receipt as Record<string, unknown>).item_id);
}

/**
 * The anchors, or null. PARTIAL anchors read as ABSENT rather than as anchors
 * with blank fields: the packet validator requires every one of them to be a
 * non-empty string, so a half-filled set would compose a packet that fails
 * validation downstream instead of simply not being evidence here. S5 carries
 * these snake_case (they are its own `EvidenceAnchors`), unlike the camelCase
 * projection around them.
 */
function readAnchors(raw: unknown): EvidenceAnchors | null {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return null;
    }
    const row = raw as Record<string, unknown>;
    const candidateId = str(row.candidate_id);
    const graphAnchor = str(row.graph_anchor);
    const reviewId = str(row.review_id);
    const testAnchor = str(row.test_anchor);
    const privacyClass = str(row.privacy_class);
    if (!candidateId || !graphAnchor || !reviewId || !testAnchor || !privacyClass) {
        return null;
    }
    return { candidateId, graphAnchor, reviewId, testAnchor, privacyClass };
}

/**
 * Strict reader for the `s5'.epii.deposit.list` artifact. A row missing its
 * identity is DROPPED rather than rendered as a blank — an evidence fold that
 * shows a deposit it cannot name is worse than one that shows fewer.
 */
export function readEvidenceDeposits(raw: unknown): readonly EvidenceDeposit[] {
    if (typeof raw !== 'object' || raw === null) {
        return [];
    }
    const deposits = (raw as Record<string, unknown>).deposits;
    if (!Array.isArray(deposits)) {
        return [];
    }
    const read: EvidenceDeposit[] = [];
    for (const entry of deposits) {
        if (typeof entry !== 'object' || entry === null) {
            continue;
        }
        const row = entry as Record<string, unknown>;
        const itemId = str(row.itemId);
        const depositType = str(row.depositType);
        if (!itemId || !depositType) {
            continue;
        }
        const artifact =
            typeof row.artifact === 'object' && row.artifact !== null
                ? (row.artifact as Record<string, unknown>)
                : null;
        read.push({
            itemId,
            depositType,
            title: str(row.title) ?? '(untitled deposit)',
            body: str(row.body) ?? '',
            status: str(row.status) ?? 'open',
            requiresHuman: row.requiresHuman === true,
            createdAtMs: epochMs(row.createdAt),
            sourceAgent: str(row.sourceAgent),
            sourceCoordinate: str(row.sourceCoordinate),
            sessionKey: str(row.sessionKey),
            artifactPath: artifact ? str(artifact.path) : null,
            evidenceAnchors: readAnchors(row.evidenceAnchors)
        });
    }
    return read;
}
