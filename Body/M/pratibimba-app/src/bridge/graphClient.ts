/**
 * Coordinate: M' M0'/M1' (S2 graph client, Phase-2)
 * Actualises: typed access to the canonical Bimba topology through the REAL
 *   gateway methods (`s2.graph.node`, `s2.graph.traverse` — recon'd from
 *   gate/graph.rs 2026-07-02; Neo4j live). Read-only: canon mutation routes
 *   via Hen/M5 Atelier only (DR-M0-1).
 * Does NOT own: graph schema (S2), pointer-web law, relation semantics.
 */

import { GatewayClient } from './gatewayClient';

export interface GraphNode {
    coordinate: string;
    label: string | null;
    properties: Record<string, unknown>;
}

export interface GraphRelation {
    target: string;
    type: string;
    direction: 'out' | 'in' | 'both';
    properties: Record<string, unknown>;
}

function str(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

export function coerceNode(raw: unknown): GraphNode | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const v = raw as Record<string, unknown>;
    const coordinate =
        str(v.coordinate) ?? str(v.bimbaCoordinate) ?? str((v.properties as Record<string, unknown>)?.coordinate);
    if (!coordinate) {
        return null;
    }
    return {
        coordinate,
        label: str(v.label) ?? str(v.name) ?? str((v.properties as Record<string, unknown>)?.label),
        properties: (v.properties as Record<string, unknown>) ?? v
    };
}

/** Real contract (verifier live probe 2026-07-02, graph_api.rs): typed
 *  relations live under `s2.graph.node.relations` as
 *  `{type, direction: 'outbound'|'inbound', coordinate}`; `s2.graph.traverse`
 *  returns untyped neighbor rows under `nodes`. */
export function coerceRelations(raw: unknown): GraphRelation[] {
    const shell = raw as
        | { relations?: unknown[]; nodes?: unknown[]; edges?: unknown[]; items?: unknown[] }
        | null;
    const items = Array.isArray(raw)
        ? raw
        : (shell?.relations ?? shell?.nodes ?? shell?.edges ?? shell?.items ?? []);
    const out: GraphRelation[] = [];
    for (const item of items as Record<string, unknown>[]) {
        if (!item || typeof item !== 'object') {
            continue;
        }
        const target =
            str(item.coordinate) ??
            str(item.target) ??
            str(item.to) ??
            str((item.node as Record<string, unknown>)?.coordinate);
        if (!target) {
            continue;
        }
        const direction = item.direction === 'inbound' || item.direction === 'in' ? 'in' : 'out';
        out.push({
            target,
            type: str(item.type) ?? str(item.relationType) ?? str(item.relation) ?? 'NEIGHBOR',
            direction,
            properties: item
        });
    }
    return out;
}

export interface GraphNodeWithRelations {
    node: GraphNode | null;
    relations: GraphRelation[];
}

export class GraphClient {
    constructor(private readonly gatewayClient: Pick<GatewayClient, 'invoke'>) {}

    /** `s2.graph.node` is the typed-relation authority — node + relations in one read. */
    async node(coordinate: string): Promise<GraphNodeWithRelations> {
        const receipt = await this.gatewayClient.invoke('s2.graph.node', { coordinate });
        const artifact = receipt.artifact as { node?: unknown; relations?: unknown } | null;
        return {
            node: coerceNode(artifact?.node) ?? coerceNode(artifact),
            relations: coerceRelations(artifact?.relations ?? [])
        };
    }

    /** Untyped neighborhood sweep (rows under `nodes`). */
    async traverse(from: string, edgeTypes?: string[]): Promise<GraphRelation[]> {
        const receipt = await this.gatewayClient.invoke('s2.graph.traverse', {
            from,
            ...(edgeTypes ? { edgeTypes } : {})
        });
        return coerceRelations(receipt.artifact);
    }
}
