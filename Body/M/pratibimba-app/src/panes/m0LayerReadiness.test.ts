import { describe, expect, it } from 'vitest';
import { buildM0LayerReadiness } from './m0LayerReadiness';

describe('buildM0LayerReadiness', () => {
    it('classifies each M0 layer from its own evidence channel and keeps bridges explicit', () => {
        const readiness = buildM0LayerReadiness({
            node: {
                coordinate: 'M0-2',
                label: 'Relations',
                properties: {
                    c_1_symbol: 'R',
                    c_1_ql_variant: 'binary',
                    gds_community: 'canonical-cluster'
                }
            },
            relations: [{ target: 'M0-1', type: 'RELATES', direction: 'out', properties: {} }]
        });

        expect(readiness).toEqual({
            language: 'canonical',
            'ql-structure': 'canonical',
            relations: 'canonical',
            'time-community': 'derived',
            personal: 'bridged_local',
            pedagogy: 'bridged_public'
        });
    });

    it('keeps absent local evidence distinct from the two bridged routes', () => {
        const readiness = buildM0LayerReadiness({ node: null, relations: [] });

        expect(readiness).toMatchObject({
            language: 'canonical_absent',
            'ql-structure': 'canonical_absent',
            relations: 'canonical_absent',
            'time-community': 'blocked',
            personal: 'bridged_local',
            pedagogy: 'bridged_public'
        });
    });
});
