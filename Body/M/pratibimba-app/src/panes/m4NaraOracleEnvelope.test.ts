/**
 * 05.T5.11 — oracle envelope read-law tests.
 * Real Rust-edge (snake_case) and frozen-TS (camelCase) stamps; DR-VAK-1
 * cardinality authority; mutual projectability gated on M3 provenance;
 * protected interpretation body never surfaced; Night' + CP4.4/CP4.5
 * foregrounding preserved; absent stamps pend honestly.
 */

import { describe, expect, it } from 'vitest';
import {
    normalizeOracleEnvelopeStamp,
    projectableSystems,
    readingCardinality
} from './m4NaraOracleEnvelope';

/** Exact shape written by portal-core `write_nara_artifact` (snake_case wire). */
const rustTarotEnvelope = {
    artifact_id: 'oracle-20260712-120000-tarot',
    system: 'tarot',
    day_id: '12-07-2026',
    created_at: '2026-07-12T12:00:00+00:00',
    vak_address: {
        cpf: '(4.0/1-4.4/5)',
        ct: ['CT4a'],
        cp: 'CP4.0,CP4.1,CP4.2,CP4.3,CP4.4,CP4.5',
        cf: '(0/1/2/3)',
        cfp: 'CFP-reading-frame',
        cs: { code: 'CS0', direction: 'Day' }
    },
    cp_position_refs: ['CP4.0', 'CP4.1', 'CP4.2', 'CP4.3', 'CP4.4', 'CP4.5'],
    spread_label: 'sixfold-ql-traverse',
    oracle_frame_ref: 'oracle-frame-sixfold',
    symbolic_protein_ref: 'symbolic-protein-1',
    deck_context: {
        macro_deck_ref: 'protected://nara/deck/macro-inhabited-rws',
        session_deck_ref: 'protected://nara/deck/session-20260712',
        deck_order_hash: 'blake3:deck-order-fixture',
        entropy_mode: 'seeded_replay'
    },
    sequence_mode: 'sixfold_ql',
    packet_refs: ['packet-1', 'packet-2'],
    graph_provenance_handles: ['graph://bimba/M3'],
    review_state: 'live-only',
    scalar_refs: [
        { ref_kind: 'm3-codon', scalar_ref: 'codon://ATG', source_handle: 'm3://bridge' },
        { ref_kind: 'i-ching', scalar_ref: 'iching://hexagram/11', source_handle: 'm3://bridge' },
        { ref_kind: 'line-change', scalar_ref: 'iching://hexagram/11/line/3', source_handle: 'm3://bridge' }
    ],
    interpretation: {
        handle: 'protected-local://nara/interpretation/oracle-20260712-120000-tarot'
    }
};

describe('m4NaraOracleEnvelope (05.T5.11)', () => {
    it('preserves every §5.11 field from a Rust-edge (snake_case) stamp', () => {
        const stamp = normalizeOracleEnvelopeStamp(rustTarotEnvelope);
        expect(stamp.state).toBe('resolved');
        if (stamp.state !== 'resolved') {
            return;
        }
        expect(stamp.oracleFrameRef).toBe('oracle-frame-sixfold');
        expect(stamp.symbolicProteinRef).toBe('symbolic-protein-1');
        expect(stamp.cpPositionRefs).toEqual(['CP4.0', 'CP4.1', 'CP4.2', 'CP4.3', 'CP4.4', 'CP4.5']);
        expect(stamp.deckContext).toEqual({
            macroDeckRef: 'protected://nara/deck/macro-inhabited-rws',
            sessionDeckRef: 'protected://nara/deck/session-20260712',
            deckOrderHash: 'blake3:deck-order-fixture',
            entropyMode: 'seeded_replay'
        });
        expect(stamp.sequenceMode).toBe('sixfold_ql');
        expect(stamp.packetRefs).toEqual(['packet-1', 'packet-2']);
        expect(stamp.graphProvenanceHandles).toEqual(['graph://bimba/M3']);
        expect(stamp.reviewState).toBe('live-only');
        expect(stamp.scalarRefKinds).toEqual(['m3-codon', 'i-ching', 'line-change']);
        expect(stamp.interpretationHandle).toBe(
            'protected-local://nara/interpretation/oracle-20260712-120000-tarot'
        );
    });

    it('normalizes the frozen-TS (camelCase, cp[] array) vocabulary equally', () => {
        const stamp = normalizeOracleEnvelopeStamp({
            system: 'i-ching',
            vakAddress: {
                cpf: '(00/00)',
                ct: 'CT4a',
                cp: ['CP4.1', 'CP4.2', 'CP4.4'],
                cf: '(0/1/2/3)',
                cfp: 'CFP-reading-frame',
                cs: "Night'"
            },
            oracleFrameRef: 'oracle-frame-triad',
            deckContext: {
                sessionDeckRef: 'protected://nara/deck/session-coin-cast',
                deckOrderHash: 'blake3:hexagram-canon-order',
                entropyMode: 'coin_cast_live'
            },
            packetRefs: ['packet-7'],
            reviewState: 'review-pending',
            scalarRefs: [
                { refKind: 'm3-codon', scalarRef: 'codon://TAG', sourceHandle: 'm3://bridge' },
                { refKind: 'tarot', scalarRef: 'tarot://card/star', sourceHandle: 'm3://bridge' },
                { refKind: 'decan', scalarRef: 'm2://decan/earth-sign-2', sourceHandle: 'm3://bridge' }
            ]
        });
        expect(stamp.state).toBe('resolved');
        if (stamp.state !== 'resolved') {
            return;
        }
        expect(stamp.cpPositionRefs).toEqual(['CP4.1', 'CP4.2', 'CP4.4']);
        expect(stamp.csDirection).toBe("Night'");
        expect(stamp.deckContext?.macroDeckRef).toBeNull();
        expect(stamp.deckContext?.entropyMode).toBe('coin_cast_live');
        expect(stamp.reviewState).toBe('review-pending');
        // §5.11: an I-Ching artifact may carry tarot/decan/codon refs.
        expect(stamp.scalarRefKinds).toEqual(['m3-codon', 'tarot', 'decan']);
    });

    it('reads cardinality from the positions authority, never the spread label (DR-VAK-1)', () => {
        const stamp = normalizeOracleEnvelopeStamp({
            vak_address: { cp: 'CP4.4,CP4.5', cs: { code: 'CS0', direction: "Night'" } },
            spread_label: 'sixfold-ql-traverse'
        });
        expect(stamp.state).toBe('resolved');
        if (stamp.state !== 'resolved') {
            return;
        }
        // The label claims six; the authority says two. Two wins.
        expect(readingCardinality(stamp)).toBe(2);
        expect(stamp.spreadLabel).toBe('sixfold-ql-traverse');
    });

    it('preserves Night\' direction and CP4.4/CP4.5 foregrounding on depth fixtures', () => {
        const stamp = normalizeOracleEnvelopeStamp({
            cp_position_refs: ['CP4.4', 'CP4.5'],
            vak_address: { cp: 'CP4.4,CP4.5', cs: { code: 'CS0', direction: "Night'" } },
            spread_label: 'depth-4-5-pass'
        });
        expect(stamp.state).toBe('resolved');
        if (stamp.state !== 'resolved') {
            return;
        }
        expect(stamp.csDirection).toBe("Night'");
        expect(stamp.cpPositionRefs).toEqual(['CP4.4', 'CP4.5']);
    });

    it('projects tarot ↔ i-ching only where M3 provenance exists (§5.11)', () => {
        const withProvenance = normalizeOracleEnvelopeStamp(rustTarotEnvelope);
        expect(withProvenance.state).toBe('resolved');
        if (withProvenance.state === 'resolved') {
            expect(projectableSystems(withProvenance)).toEqual(['tarot', 'i-ching']);
        }

        const without = normalizeOracleEnvelopeStamp({
            ...rustTarotEnvelope,
            scalar_refs: [
                { ref_kind: 'tarot', scalar_ref: 'tarot://card/magician', source_handle: 'm3://bridge' }
            ]
        });
        expect(without.state).toBe('resolved');
        if (without.state === 'resolved') {
            expect(projectableSystems(without)).toEqual([]);
        }
    });

    it('never surfaces a protected interpretation body — handle only', () => {
        const stamp = normalizeOracleEnvelopeStamp({
            ...rustTarotEnvelope,
            interpretation: {
                handle: 'protected-local://nara/interpretation/x',
                local_body: 'PRIVATE READING BODY',
                body: 'PRIVATE READING BODY'
            }
        });
        expect(stamp.state).toBe('resolved');
        expect(JSON.stringify(stamp)).not.toContain('PRIVATE READING BODY');
        if (stamp.state === 'resolved') {
            expect(stamp.interpretationHandle).toBe('protected-local://nara/interpretation/x');
        }
    });

    it('pends honestly on absent or positions-less stamps — never fabricates', () => {
        expect(normalizeOracleEnvelopeStamp(undefined).state).toBe('pending-envelope');
        expect(normalizeOracleEnvelopeStamp(null).state).toBe('pending-envelope');
        expect(normalizeOracleEnvelopeStamp('not-an-envelope').state).toBe('pending-envelope');
        // No positions authority → unreadable → pending (DR-VAK-1).
        expect(
            normalizeOracleEnvelopeStamp({ spread_label: 'sixfold-ql-traverse' }).state
        ).toBe('pending-envelope');
    });

    it('resolves partial deck contexts to null rather than fabricating scalars', () => {
        const stamp = normalizeOracleEnvelopeStamp({
            cp_position_refs: ['CP4.3'],
            deck_context: { macro_deck_ref: 'protected://nara/deck/macro-only' }
        });
        expect(stamp.state).toBe('resolved');
        if (stamp.state === 'resolved') {
            expect(stamp.deckContext).toBeNull();
        }
    });
});
