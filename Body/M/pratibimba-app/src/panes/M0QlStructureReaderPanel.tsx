/**
 * Coordinate: M' M0-1' (QL-structure reader panel, rerun 21.T21.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-1' structural-pointer read surface
 * Actualises: the selected coordinate's QL position and variant plus its
 *   graph-declared structural family, mirror, and anchor pointers from one
 *   `s2.graph.node` read. The coordinate tree remains an adjacent M0' shell
 *   surface reached by its declared deep link; this panel never recreates it.
 * Public surface: M0QlStructureReaderPanel.
 * Does NOT own: QL topology, relation-family classification, S2 transport,
 *   coordinate-tree rendering, or canon mutation.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.3.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { GraphClient, GraphRelation } from '../bridge/graphClient';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { ProvenanceBadge, ProvenanceState } from '../ui/ProvenanceBadge';
import { inkDim } from '../ui/tokens';

type ReadState =
    | { readonly status: 'idle' }
    | { readonly status: 'pending'; readonly reason: string }
    | { readonly status: 'blocked'; readonly reason: string }
    | {
          readonly status: 'ready';
          readonly properties: Record<string, unknown>;
          readonly relations: readonly GraphRelation[];
      };

interface QlField {
    readonly value: string | null;
    readonly state: ProvenanceState;
}

interface QlStructureProjection {
    readonly position: QlField;
    readonly variant: QlField;
    readonly familyParent: QlField;
    readonly mirrorChild: QlField;
    readonly mirrorInverse: QlField;
    readonly anchors: readonly string[];
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function qlPosition(value: unknown): string | null {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5
        ? String(value)
        : null;
}

function canonicalField(value: string | null): QlField {
    return value === null
        ? { value: null, state: 'canonical_absent' }
        : { value, state: 'canonical' };
}

function structuralRelations(relations: readonly GraphRelation[], type: string): readonly GraphRelation[] {
    return relations.filter(
        relation =>
            relation.type === type && relation.properties.c_1_relation_family === 'structural'
    );
}

function buildQlStructureProjection(
    properties: Record<string, unknown>,
    relations: readonly GraphRelation[]
): QlStructureProjection {
    const familyParent = structuralRelations(relations, 'FAMILY_CONTAINS')[0]?.target ?? null;
    const mirrorChild = structuralRelations(relations, 'MIRROR_CHILDREN')[0]?.target ?? null;
    const mirrorInverse = structuralRelations(relations, 'INVERTS_TO')[0]?.target ?? null;
    const anchors = structuralRelations(relations, 'ANCHORED_TO').map(relation => relation.target);
    return Object.freeze({
        position: canonicalField(qlPosition(properties.c_1_ql_position)),
        variant: canonicalField(stringValue(properties.c_1_ql_variant)),
        familyParent: canonicalField(familyParent),
        mirrorChild: canonicalField(mirrorChild),
        mirrorInverse: canonicalField(mirrorInverse),
        anchors: Object.freeze(anchors)
    });
}

function FieldRow({ id, label, field }: { readonly id: string; readonly label: string; readonly field: QlField }) {
    return (
        <div className="m0-ql-field" data-testid={id} data-provenance={field.state}>
            <dt>
                {label}
                <ProvenanceBadge
                    state={field.state}
                    reason={field.state === 'canonical_absent' ? 'no graph-declared structural value' : undefined}
                />
            </dt>
            <dd>{field.value ?? 'not emitted'}</dd>
        </div>
    );
}

export function M0QlStructureReaderPanel() {
    const selected = useCoordinateStore(state => state.selected);
    const connected = useProvenanceStore(state => state.connection.connected);
    const [read, setRead] = useState<ReadState>({ status: 'idle' });

    useEffect(() => {
        if (!selected) {
            setRead({ status: 'idle' });
            return;
        }
        if (!connected) {
            setRead({ status: 'pending', reason: 'gateway not connected - no S2 read yet' });
            return;
        }
        let disposed = false;
        setRead({ status: 'pending', reason: `reading ${selected}` });
        let client: GraphClient;
        try {
            client = new GraphClient(gateway());
        } catch (error) {
            setRead({ status: 'blocked', reason: error instanceof Error ? error.message : String(error) });
            return;
        }
        client
            .node(selected)
            .then(({ node, relations }) => {
                if (!disposed) {
                    setRead({ status: 'ready', properties: node?.properties ?? {}, relations });
                }
            })
            .catch(error => {
                if (!disposed) {
                    setRead({
                        status: 'blocked',
                        reason: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        return () => {
            disposed = true;
        };
    }, [selected, connected]);

    const projection = useMemo(
        () =>
            read.status === 'ready'
                ? buildQlStructureProjection(read.properties, read.relations)
                : null,
        [read]
    );

    if (!projection) {
        const reason =
            read.status === 'pending' || read.status === 'blocked' ? read.reason : undefined;
        return (
            <section
                className="m0-ql-structure-reader m0-ql-structure-reader-status"
                data-testid="m0-ql-structure-reader"
                data-state={read.status}
            >
                <header className="m0-ql-structure-reader-header">
                    <span>M0-1'</span>
                    <h3>QL structure</h3>
                    {read.status === 'blocked' ? <ProvenanceBadge state="blocked" reason={reason} /> : null}
                </header>
                <p style={{ color: inkDim }}>
                    {read.status === 'idle'
                        ? 'Select a coordinate to read its QL structure.'
                        : read.status === 'blocked'
                          ? `S2 read blocked: ${reason}`
                          : 'Reading graph-declared structural pointers...'}
                </p>
            </section>
        );
    }

    const coordinateTreeHref = selected
        ? `epi-logos://ide/ide-shell-m0-m5/coordinateTree?coordinate=${encodeURIComponent(selected)}&source=m0-anuttara`
        : undefined;

    return (
        <section
            className="m0-ql-structure-reader"
            data-testid="m0-ql-structure-reader"
            data-state="ready"
        >
            <header className="m0-ql-structure-reader-header">
                <div>
                    <span>M0-1'</span>
                    <h3>QL structure</h3>
                </div>
                <a
                    className="m0-ql-coordinate-tree-link"
                    data-testid="m0-open-coordinate-tree"
                    href={coordinateTreeHref}
                    title="Open the selected coordinate in the shell coordinate tree"
                >
                    Coordinate tree
                </a>
            </header>
            <dl className="m0-ql-fields">
                <FieldRow id="m0-ql-position" label="QL position" field={projection.position} />
                <FieldRow id="m0-ql-variant" label="QL variant" field={projection.variant} />
                <FieldRow id="m0-ql-family-parent" label="Family parent" field={projection.familyParent} />
                <FieldRow id="m0-ql-mirror-child" label="Mirror child" field={projection.mirrorChild} />
                <FieldRow id="m0-ql-mirror-inverse" label="Mirror inverse" field={projection.mirrorInverse} />
                <div className="m0-ql-field" data-testid="m0-ql-anchors" data-provenance={projection.anchors.length ? 'canonical' : 'canonical_absent'}>
                    <dt>Anchored to</dt>
                    <dd>{projection.anchors.length ? projection.anchors.join(', ') : 'not emitted'}</dd>
                </div>
            </dl>
        </section>
    );
}
