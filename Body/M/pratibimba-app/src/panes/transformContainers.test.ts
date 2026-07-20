/**
 * Coordinate: M' M4' (transform-container projection tests - 25.T25.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): strict gateway receipt verification
 * Actualises: fail-closed canonical stage and contemplative payload parsing.
 * Public surface: Vitest suite for parseTransformReceipt.
 * Does NOT own: gateway persistence or carrier rendering.
 * Contract: [[M4'-SPEC]] / [[S3-SPEC]].
 */

import { describe, expect, it } from 'vitest';
import { parseTransformReceipt } from './transformContainers';

const receipt = {
    container: 'bohm-dialogue',
    stageIndex: 1,
    stageCount: 5,
    stages: [
        {
            id: 'bohm-suspension',
            label: 'Suspension',
            description: 'Assumptions are held.',
            alchemicalOp: 'nigredo',
            l2PrimeRegister: "L2-1' Earth"
        },
        {
            id: 'bohm-proprioception',
            label: 'Proprioception of thought',
            description: 'Thought senses itself.',
            alchemicalOp: 'separatio',
            l2PrimeRegister: "L2' relational operation"
        },
        {
            id: 'bohm-observer-collapse',
            label: 'Observer-observed collapse',
            description: 'The observer enters the observed.',
            alchemicalOp: 'conjunctio',
            l2PrimeRegister: "L2' relational operation"
        },
        {
            id: 'bohm-shared-meaning',
            label: 'Shared meaning',
            description: 'Positions dissolve.',
            alchemicalOp: 'solutio',
            l2PrimeRegister: "L2-2' Water"
        },
        {
            id: 'bohm-generative-field',
            label: 'Generative field',
            description: 'Implications rise.',
            alchemicalOp: 'sublimatio',
            l2PrimeRegister: "L2-3' Air"
        }
    ],
    stage: {
        id: 'bohm-proprioception',
        label: 'Proprioception of thought',
        description: 'Thought senses itself.',
        alchemicalOp: 'separatio',
        l2PrimeRegister: "L2' relational operation"
    },
    transition: {
        kind: 'contemplative',
        payload: {
            container: 'bohm-dialogue',
            fromStage: 'bohm-suspension',
            toStage: 'bohm-proprioception',
            alchemical_op: 'separatio'
        }
    },
    direction: 'advance',
    artifactPath: '/vault/session/transform-transitions/transition.md'
};

describe('parseTransformReceipt', () => {
    it('accepts a coherent canonical receipt and freezes its stage table', () => {
        const parsed = parseTransformReceipt(receipt);
        expect(parsed.stage.id).toBe('bohm-proprioception');
        expect(parsed.stages).toHaveLength(5);
        expect(parsed.transition.payload.alchemical_op).toBe('separatio');
        expect(Object.isFrozen(parsed.stages)).toBe(true);
    });

    it('refuses unknown operations, incoherent current stages, and non-contemplative artifacts', () => {
        expect(() =>
            parseTransformReceipt({
                ...receipt,
                stage: { ...receipt.stage, alchemicalOp: 'fermentation' }
            })
        ).toThrow(/alchemical operation/);
        expect(() => parseTransformReceipt({ ...receipt, stageIndex: 0 })).toThrow(/current stage/);
        expect(() =>
            parseTransformReceipt({
                ...receipt,
                transition: { ...receipt.transition, kind: 'note' }
            })
        ).toThrow(/contemplative/);
    });
});
