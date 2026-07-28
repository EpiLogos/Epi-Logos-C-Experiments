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
        createdAt: '2026-07-28T10:00:00Z',
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
            createdAt: '2026-07-28T10:00:00Z',
            sourceAgent: 'anima',
            sourceCoordinate: 'M5-4',
            sessionKey: 'session-a',
            artifactPath: 'Idea/Empty/Present/note.md'
        });
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
