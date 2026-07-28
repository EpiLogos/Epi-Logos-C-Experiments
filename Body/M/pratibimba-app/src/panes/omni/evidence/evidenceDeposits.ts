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

/** One deposit as `s5'.epii.deposit.list` projects it back out. */
export interface EvidenceDeposit {
    readonly itemId: string;
    readonly depositType: string;
    readonly title: string;
    readonly body: string;
    readonly status: string;
    readonly requiresHuman: boolean;
    readonly createdAt: string;
    readonly sourceAgent: string | null;
    readonly sourceCoordinate: string | null;
    readonly sessionKey: string | null;
    readonly artifactPath: string | null;
}

function str(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
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
        source_agent: context.sourceAgent ?? 'epii',
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
        requires_human: true
    };
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
            createdAt: str(row.createdAt) ?? '',
            sourceAgent: str(row.sourceAgent),
            sourceCoordinate: str(row.sourceCoordinate),
            sessionKey: str(row.sessionKey),
            artifactPath: artifact ? str(artifact.path) : null
        });
    }
    return read;
}
