/**
 * Coordinate: M' M5' (Evidence deposition mapping + reader — 26.T26.4)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Actualises: the two laws the fold's live loop rests on — that the authored
 *   draft becomes a DepositRequest the METHOD can actually parse (the form's
 *   old payload could not), and that the list reader drops a row it cannot
 *   name rather than rendering a blank one.
 * Does NOT own: the form's submit behaviour (evidenceTails.test.tsx) or the
 *   live loop (tests/e2e/evidence-deposition-loop.spec.ts).
 */

import { describe, expect, it } from 'vitest';
import {
    DEPOSIT_SOURCE_AGENTS,
    depositReceiptItemId,
    depositRequestFromDraft,
    readEvidenceDeposits
} from './evidenceDeposits';

const DRAFT = {
    title: 'a deposition',
    candidateId: 'cand-1',
    coordinate: 'M5-4',
    sourceAnchor: 'Idea/Empty/Present/note.md',
    graphAnchor: 'bimba://M5-4/evidence',
    reviewId: 'rev-1',
    testAnchor: 'tests/e2e/x.spec.ts',
    privacyClass: 'safe-public-current-kernel-tick'
};

/** Verbatim from epii-agent-core's `DepositRequest`. */
const REQUIRED = [
    'source_agent',
    'source_coordinate',
    'deposit_type',
    'title',
    'body',
    'artifact',
    'requires_human'
];

describe('26.T26.4 — the authored draft as a real DepositRequest', () => {
    it('supplies every field the method requires', () => {
        const request = depositRequestFromDraft(DRAFT);
        for (const field of REQUIRED) {
            expect(request, `DepositRequest requires ${field}`).toHaveProperty(field);
        }
        expect(request.artifact).toEqual({
            path: DRAFT.sourceAnchor,
            coordinate: DRAFT.coordinate,
            kind: 'mediated_run_evidence'
        });
    });

    it('carries every authored anchor rather than dropping the ones that do not map', () => {
        // A deposit whose anchors were silently discarded is unreviewable, which
        // defeats the point of depositing it.
        const body = String(depositRequestFromDraft(DRAFT).body);
        for (const anchor of [DRAFT.candidateId, DRAFT.graphAnchor, DRAFT.reviewId, DRAFT.testAnchor, DRAFT.privacyClass]) {
            expect(body).toContain(anchor);
        }
    });

    it('names a source_agent S5 will actually accept', () => {
        // `source_agent` is mapped onto a ReviewSource and REFUSED otherwise
        // (epii-agent-core `review_source`). A request can parse cleanly and
        // still be rejected by the domain — the first draft defaulted to
        // 'epii' and was refused live with "unsupported Epii deposit
        // source_agent: epii". A deposit authored in the fold IS the human gate.
        expect(DEPOSIT_SOURCE_AGENTS).toContain(depositRequestFromDraft(DRAFT).source_agent);
        expect(depositRequestFromDraft(DRAFT).source_agent).toBe('human');
    });

    it('omits session_key entirely rather than sending a null the contract has no field for', () => {
        expect(depositRequestFromDraft(DRAFT, { sessionKey: null })).not.toHaveProperty('session_key');
        expect(depositRequestFromDraft(DRAFT, { sessionKey: 'session-a' }).session_key).toBe('session-a');
    });
});

describe('26.T26.4 — reading the deposit list back', () => {
    const row = {
        itemId: 'item-1',
        depositType: 'review_item',
        title: 'a deposition',
        body: 'detail',
        status: 'open',
        requiresHuman: true,
        createdAt: 1785321600000,
        sourceAgent: 'anima',
        sourceCoordinate: 'M5-4',
        artifact: { path: 'Idea/Empty/Present/note.md' },
        sessionKey: 'session-a'
    };

    it('reads a projected deposit row', () => {
        const [deposit] = readEvidenceDeposits({ deposits: [row], matched: 1, returned: 1 });
        expect(deposit).toEqual({
            itemId: 'item-1',
            depositType: 'review_item',
            title: 'a deposition',
            body: 'detail',
            status: 'open',
            requiresHuman: true,
            createdAtMs: 1785321600000,
            sourceAgent: 'anima',
            sourceCoordinate: 'M5-4',
            sessionKey: 'session-a',
            artifactPath: 'Idea/Empty/Present/note.md',
            evidenceAnchors: null
        });
    });

    it('reads the timestamp the emitter actually sends, not the one a fixture imagines', () => {
        // `ReviewInboxItem.created_at` is a Rust u128 stamped by now_ms(), so it
        // arrives as a JSON NUMBER. Reading it as a string yielded '' for every
        // live row while an ISO-string fixture passed — the emitter never
        // produces one, so the fixture certified a shape the wire cannot send.
        const [live] = readEvidenceDeposits({ deposits: [{ ...row, createdAt: 1785321600000 }] });
        expect(live.createdAtMs).toBe(1785321600000);
        const [absent] = readEvidenceDeposits({ deposits: [{ ...row, createdAt: undefined }] });
        expect(absent.createdAtMs).toBeNull();
    });

    it('drops a row it cannot name instead of rendering a blank deposit', () => {
        const read = readEvidenceDeposits({
            deposits: [row, { ...row, itemId: '' }, { ...row, depositType: undefined }, null, 'nope']
        });
        expect(read).toHaveLength(1);
        expect(read[0].itemId).toBe('item-1');
    });

    it('reads an absent or malformed payload as no deposits, never as a throw', () => {
        expect(readEvidenceDeposits(null)).toEqual([]);
        expect(readEvidenceDeposits({})).toEqual([]);
        expect(readEvidenceDeposits({ deposits: 'not-an-array' })).toEqual([]);
    });

    it('reports a deposit whose optional context is absent without inventing it', () => {
        const [deposit] = readEvidenceDeposits({
            deposits: [{ itemId: 'i', depositType: 'review_item' }]
        });
        expect(deposit.sourceCoordinate).toBeNull();
        expect(deposit.artifactPath).toBeNull();
        expect(deposit.requiresHuman).toBe(false);
        expect(deposit.title).toBe('(untitled deposit)');
    });
});

describe('26.T26.4 — the deposit receipt', () => {
    /** The REAL DepositReceipt shape (epii-agent-core/src/deposits.rs:82-104):
     *  no serde rename anywhere, so these are the literal wire keys and the id
     *  lives one level down under `review_item`. */
    const RECEIPT = {
        review_item: {
            item_id: 'itm-9f3',
            source: 'human_gate',
            status: 'open',
            requires_human: true
        },
        improvement_run: null,
        inbox_surface: { coordinate: 'S5/S5\'', inbox_path: null, day_id: null, now_path: null, session_key: null }
    };

    it('reads the item id from where the receipt actually carries it', () => {
        expect(depositReceiptItemId(RECEIPT)).toBe('itm-9f3');
    });

    it('refuses the top-level spellings that never appear on the wire', () => {
        // The first fix probed item_id/itemId/id/ref at the TOP level. All four
        // miss on every real response, so a caller fell through to its own
        // draft value and reported the author's input as the store's id.
        for (const impossible of [
            { item_id: 'itm-9f3' },
            { itemId: 'itm-9f3' },
            { id: 'itm-9f3' },
            { ref: 'itm-9f3' }
        ]) {
            expect(depositReceiptItemId(impossible)).toBeNull();
        }
    });

    it('reports no id when the deposit created no review item', () => {
        expect(depositReceiptItemId({ ...RECEIPT, review_item: null })).toBeNull();
        expect(depositReceiptItemId(null)).toBeNull();
    });
});

describe('26.T26.4 — the claim half', () => {
    const ANCHORED = {
        itemId: 'item-1',
        depositType: 'review_item',
        evidenceAnchors: {
            candidate_id: 'cand-1',
            graph_anchor: 'bimba://M5-4/evidence',
            review_id: 'rev-1',
            test_anchor: 'tests/e2e/x.spec.ts',
            privacy_class: 'safe-public-current-kernel-tick'
        }
    };

    it('reads anchors that S5 carries snake_case inside a camelCase projection', () => {
        const [deposit] = readEvidenceDeposits({ deposits: [ANCHORED] });
        expect(deposit.evidenceAnchors).toEqual({
            candidateId: 'cand-1',
            graphAnchor: 'bimba://M5-4/evidence',
            reviewId: 'rev-1',
            testAnchor: 'tests/e2e/x.spec.ts',
            privacyClass: 'safe-public-current-kernel-tick'
        });
    });

    it('treats a PARTIAL anchor set as absent rather than as blank anchors', () => {
        // The packet validator requires every anchor to be a non-empty string,
        // so half a set would compose a packet that fails validation downstream
        // instead of simply not being evidence here.
        const partial = { ...ANCHORED.evidenceAnchors, review_id: '' };
        const [deposit] = readEvidenceDeposits({
            deposits: [{ ...ANCHORED, evidenceAnchors: partial }]
        });
        expect(deposit.evidenceAnchors).toBeNull();
    });
});
