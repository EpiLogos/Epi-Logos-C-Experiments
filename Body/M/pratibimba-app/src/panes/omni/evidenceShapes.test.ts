/**
 * Coordinate: M' M5' (evidence shapes tests — Tranche 26.T26.10)
 * Actualises: the schema verification — a full packet round-trips through
 *   serialization exactly; the validator refuses missing fields, unknown
 *   mediators, and non-canonical aletheia subagents; the 15.11 one-trace-
 *   two-foldings law holds (depth-first flatten preserves every node once).
 */

import { describe, expect, it } from 'vitest';
import {
    flattenDispatchTrace,
    parseEvidencePacket,
    serializeEvidencePacket,
    validateEvidencePacket,
    type DispatchTraceNode,
    type MediatedRunEvidencePacket
} from './evidenceShapes';

const TRACE: DispatchTraceNode = {
    id: 'root',
    parentId: null,
    actor: { kind: 'pi' },
    methodOrSkill: 'chat.send',
    invokedAt: 1000,
    tickAtInvoke: 3,
    children: [
        {
            id: 'anima-1',
            parentId: 'root',
            actor: { kind: 'anima' },
            methodOrSkill: 'anima_orchestrate',
            invokedAt: 1100,
            tickAtInvoke: 3,
            psycheFacet: 'sophia',
            children: [
                {
                    id: 'moirai-1',
                    parentId: 'anima-1',
                    actor: { kind: 'aletheia', subagent: 'moirai' },
                    methodOrSkill: 'moirai_arena_distill',
                    invokedAt: 1200,
                    tickAtInvoke: 4,
                    children: []
                }
            ]
        }
    ]
};

const PACKET: MediatedRunEvidencePacket = {
    id: 'evidence-1',
    title: 'arena distillation run',
    mediatedBy: { kind: 'anima' },
    coordinate: 'M5-4',
    privacyClass: 'protected',
    dispatchTrace: TRACE,
    toolStream: [
        {
            id: 'tool-1',
            dispatchNodeId: 'moirai-1',
            toolName: 'moirai_arena_distill',
            gatewayMethod: "s5'.gnostic.ingest",
            inputDigest: 'blake3:in',
            outputDigest: 'blake3:out'
        }
    ],
    gateLandings: [
        {
            gateId: 'gate-1',
            gateType: 'human-required',
            state: 'transitioned',
            transitionedBy: 'human'
        }
    ],
    axiomTranslationSteps: [
        {
            id: 'ax-1',
            fromForm: 'philosophical-english',
            toForm: 'owl',
            inputText: 'the One precedes number',
            outputText: '<owl:Class .../>',
            reasoningTrace: 'DR-B-2 translation arc',
            verifiedBy: 'human'
        }
    ],
    sessionKey: 'sess-1',
    dayNowContext: '[[14-07-2026]]',
    profileGeneration: 42,
    bridgeReadinessHandle: 'readiness:ok'
};

describe('26.10 MediatedRunEvidencePacket schema', () => {
    it('round-trips a full packet through serialization exactly', () => {
        expect(parseEvidencePacket(serializeEvidencePacket(PACKET))).toEqual(PACKET);
    });

    it('validator refuses missing fields, unknown mediators, and non-canonical subagents', () => {
        expect(validateEvidencePacket({})).toContain('id is required');
        expect(
            validateEvidencePacket({ ...PACKET, mediatedBy: { kind: 'ghost' } }).join(' ')
        ).toMatch(/mediatedBy.kind/);
        expect(
            validateEvidencePacket({ ...PACKET, mediatedBy: { kind: 'aletheia', subagent: 'techne' } }).join(' ')
        ).toMatch(/canonical subagent/);
        expect(() => parseEvidencePacket('{"id":"x"}')).toThrow(/invalid/);
    });

    it('one trace, two foldings: depth-first flatten preserves every node exactly once (15.11)', () => {
        const flat = flattenDispatchTrace(TRACE);
        expect(flat.map(node => node.id)).toEqual(['root', 'anima-1', 'moirai-1']);
        expect(new Set(flat.map(node => node.id)).size).toBe(flat.length);
    });
});
