/**
 * Coordinate: M' M0' (per-layer provenance projection, rerun 21.T21.18)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0 layer-selector evidence classification
 * Actualises: the eight-state provenance reading for each M0-X' layer from
 *   one S2 node-with-relations read and the two fixed bridge dispositions.
 * Public surface: M0ProvenanceState, M0LayerReadiness,
 *   buildM0LayerReadiness, blockedM0LayerReadiness.
 * Does NOT own: S2 transport, graph schema, M4/M5 bridge payloads, or canon
 *   mutation.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.18.
 */

import type { GraphNode, GraphRelation } from '../bridge/graphClient';
import type { M0LayerKey } from './m0Layers';

export type M0ProvenanceState =
    | 'canonical'
    | 'canonical_absent'
    | 'derived'
    | 'inferred'
    | 'review_pending'
    | 'blocked'
    | 'bridged_local'
    | 'bridged_public';

export type M0LayerReadiness = Readonly<Record<M0LayerKey, M0ProvenanceState>>;

function isPresent(value: unknown): boolean {
    if (typeof value === 'string') {
        return value.length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value !== null && value !== undefined;
}

function fixedBridgeReadiness(): Pick<M0LayerReadiness, 'personal' | 'pedagogy'> {
    return Object.freeze({
        personal: 'bridged_local' as const,
        pedagogy: 'bridged_public' as const
    });
}

export function buildM0LayerReadiness(input: {
    readonly node: GraphNode | null;
    readonly relations: readonly GraphRelation[];
}): M0LayerReadiness {
    const properties = input.node?.properties ?? {};
    return Object.freeze({
        language: isPresent(properties.c_1_symbol) ? 'canonical' : 'canonical_absent',
        'ql-structure': isPresent(properties.c_1_ql_variant) ? 'canonical' : 'canonical_absent',
        relations: input.relations.length > 0 ? 'canonical' : 'canonical_absent',
        'time-community': isPresent(properties.gds_community) ? 'derived' : 'blocked',
        ...fixedBridgeReadiness()
    });
}

export function blockedM0LayerReadiness(): M0LayerReadiness {
    return Object.freeze({
        language: 'blocked',
        'ql-structure': 'blocked',
        relations: 'blocked',
        'time-community': 'blocked',
        ...fixedBridgeReadiness()
    });
}
