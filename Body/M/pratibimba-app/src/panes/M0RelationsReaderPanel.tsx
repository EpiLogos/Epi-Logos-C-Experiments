/**
 * Coordinate: M' M0-2' (relations-layer reader panel, rerun 21.T21.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-2' relation-field two-column read surface
 * Actualises: the M0-2' relation layer as a two-column read of the selected
 *   coordinate's typed edges (s2.graph.node relations), partitioned by the
 *   graph-sourced `c_1_relation_family` discriminator via m0RelationFamily.ts.
 *   Structural and correspondential edges render in distinct columns and NEVER
 *   collapse (Track 01.9). An edge without the discriminator is surfaced as
 *   `unclassified` — never guessed from its relation type.
 * Public surface: M0RelationsReaderPanel.
 * Does NOT own: the family enum authority (graph-schema rel.rs, mirrored in
 *   m0RelationFamily.ts), edge classification (S2 sync), the S2 read transport
 *   (bridge/graphClient.ts), canon mutation (DR-M0-1), or a state store.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.4.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { GraphClient, GraphRelation } from '../bridge/graphClient';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import {
    M0RelationEdge,
    M0RelationFamilyKey,
    buildM0RelationFamilyProjection
} from './m0RelationFamily';
import { inkDim } from '../ui/tokens';

type ReadState =
    | { readonly status: 'idle' }
    | { readonly status: 'pending'; readonly reason: string }
    | { readonly status: 'blocked'; readonly reason: string }
    | { readonly status: 'ready'; readonly relations: readonly GraphRelation[] };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Shape a typed graph relation into a raw edge row the family projection reads.
 *  The `c_1_relation_family` discriminator (when present) rides in the relation's
 *  raw properties; we spread it through — the projection reads it, never guesses. */
function toRawEdge(source: string, relation: GraphRelation): Record<string, unknown> {
    const props = isRecord(relation.properties) ? relation.properties : {};
    return { ...props, source, target: relation.target, type: relation.type };
}

const PRIMARY_COLUMNS: readonly { key: M0RelationFamilyKey; label: string }[] = [
    { key: 'structural', label: 'Structural' },
    { key: 'correspondential', label: 'Correspondential' }
];

const SECONDARY_FAMILIES: readonly M0RelationFamilyKey[] = [
    'kernel_core',
    'inferred',
    'sync',
    'compatibility',
    'unclassified'
];

function RelationList({ edges }: { edges: readonly M0RelationEdge[] }) {
    return (
        <ol className="m0-relations-list">
            {edges.map(edge => (
                <li key={`${edge.relationType}:${edge.target}`} className="m0-relations-row">
                    <span className="m0-relations-type">{edge.relationType || '(untyped)'}</span>
                    <span className="m0-relations-target">{edge.target || '(no target)'}</span>
                    <ProvenanceBadge
                        state={edge.familyProvenance === 'graph' ? 'canonical' : 'canonical_absent'}
                        reason={
                            edge.familyProvenance === 'graph'
                                ? undefined
                                : 'no c_1_relation_family on this edge — unclassified, not inferred'
                        }
                    />
                </li>
            ))}
        </ol>
    );
}

export function M0RelationsReaderPanel() {
    const selected = useCoordinateStore(s => s.selected);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [read, setRead] = useState<ReadState>({ status: 'idle' });

    useEffect(() => {
        if (!selected) {
            setRead({ status: 'idle' });
            return;
        }
        if (!connected) {
            setRead({ status: 'pending', reason: 'gateway not connected — no S2 read yet' });
            return;
        }
        let disposed = false;
        setRead({ status: 'pending', reason: `reading ${selected}` });
        let client: GraphClient;
        try {
            client = new GraphClient(gateway());
        } catch (err) {
            setRead({ status: 'blocked', reason: err instanceof Error ? err.message : String(err) });
            return;
        }
        client
            .node(selected)
            .then(({ relations }) => {
                if (!disposed) {
                    setRead({ status: 'ready', relations });
                }
            })
            .catch(err => {
                if (!disposed) {
                    setRead({
                        status: 'blocked',
                        reason: err instanceof Error ? err.message : String(err)
                    });
                }
            });
        return () => {
            disposed = true;
        };
    }, [selected, connected]);

    const projection = useMemo(
        () =>
            read.status === 'ready' && selected
                ? buildM0RelationFamilyProjection(read.relations.map(r => toRawEdge(selected, r)))
                : buildM0RelationFamilyProjection([]),
        [read, selected]
    );

    const edgesFor = (family: M0RelationFamilyKey): readonly M0RelationEdge[] =>
        projection.groups.find(g => g.family === family)?.edges ?? [];

    if (read.status !== 'ready') {
        const reason = read.status === 'idle' ? undefined : read.reason;
        return (
            <section
                className="m0-relations-reader m0-relations-reader-status"
                data-testid="m0-relations-reader"
                data-state={read.status}
            >
                <header className="m0-relations-reader-header">
                    <span className="m0-relations-reader-kicker">M0-2′</span>
                    <h3>Relation field</h3>
                    {read.status === 'blocked' ? <ProvenanceBadge state="blocked" reason={reason} /> : null}
                </header>
                <p style={{ color: inkDim }}>
                    {read.status === 'idle'
                        ? 'Select a coordinate to read its typed relations.'
                        : read.status === 'blocked'
                          ? `S2 read blocked: ${reason}`
                          : 'Reading the coordinate relations…'}
                </p>
            </section>
        );
    }

    const secondaryGroups = SECONDARY_FAMILIES.map(family => ({
        family,
        edges: edgesFor(family)
    })).filter(g => g.edges.length > 0);

    return (
        <section
            className="m0-relations-reader"
            data-testid="m0-relations-reader"
            data-state="ready"
            data-edges={projection.edges.length}
            data-unclassified={projection.unclassifiedCount}
        >
            <header className="m0-relations-reader-header">
                <span className="m0-relations-reader-kicker">M0-2′</span>
                <h3>Relation field</h3>
            </header>
            <div className="m0-relations-columns">
                {PRIMARY_COLUMNS.map(column => {
                    const edges = edgesFor(column.key);
                    return (
                        <section
                            key={column.key}
                            className="m0-relations-column"
                            data-testid={`m0-relations-column-${column.key}`}
                        >
                            <h4>
                                {column.label} <span style={{ color: inkDim }}>({edges.length})</span>
                            </h4>
                            {edges.length > 0 ? (
                                <RelationList edges={edges} />
                            ) : (
                                <p style={{ color: inkDim }}>No {column.key} edges.</p>
                            )}
                        </section>
                    );
                })}
            </div>
            {secondaryGroups.length > 0 ? (
                <div className="m0-relations-secondary" data-testid="m0-relations-secondary">
                    {secondaryGroups.map(group => (
                        <section
                            key={group.family}
                            className="m0-relations-column"
                            data-testid={`m0-relations-column-${group.family}`}
                        >
                            <h4>
                                {group.family}{' '}
                                <span style={{ color: inkDim }}>({group.edges.length})</span>
                            </h4>
                            <RelationList edges={group.edges} />
                        </section>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
