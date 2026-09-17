import * as React from 'react';
import type { M0GraphNodePayload, M0ProvenanceState } from '../../common/m0-inspector';

/**
 * The ten structural M0 relation types the M0-2' reader keeps in the
 * structural column. Used as the legacy fallback when an edge carries no
 * Track 01.9 `c_1_relation_family` discriminator.
 */
export const M0_STRUCTURAL_RELATIONS = [
    'CONTAINS',
    'FAMILY_CONTAINS',
    'ANCHORED_TO',
    'BEDROCK',
    'MANIFESTS',
    'INVERTS_TO',
    'REFLECTS_AS',
    'DERIVES_FROM',
    'HAS_LENS',
    'HAS_KERNEL_RESONANCE'
] as const;

/** Track 01.9 `c_1_relation_family` discriminator vocabulary. */
export type M0RelationFamily =
    | 'structural'
    | 'correspondential'
    | 'kernel_core'
    | 'inferred'
    | 'sync'
    | 'compatibility';

export interface M0RelationRow {
    readonly targetCoordinate: string;
    readonly relationType: string;
    readonly relationFamily: M0RelationFamily;
    readonly state: M0ProvenanceState;
}

export interface M0RelationsProjection {
    readonly structural: readonly M0RelationRow[];
    readonly correspondential: readonly M0RelationRow[];
}

export interface RelationsLayerPanelProps {
    readonly projection: M0RelationsProjection;
    readonly coordinate: string | null;
}

/**
 * Relations Layer (M0-2') projection selector.
 *
 * Partitions the captured `s2.graph.node` payload's `relations` field by the
 * Track 01.9 `c_1_relation_family` discriminator. Edges with a known family go
 * to their canonical column; legacy edges with no discriminator fall back to
 * `M0_STRUCTURAL_RELATIONS.includes(relation.type)`. Structural and
 * correspondential edges land in distinct columns and are never collapsed.
 */
export function selectM0RelationsProjection(
    node: M0GraphNodePayload | null | undefined
): M0RelationsProjection {
    const properties = objectValue(node?.properties);
    const structural: M0RelationRow[] = [];
    const correspondential: M0RelationRow[] = [];

    for (const item of arrayValue(node?.relations ?? properties?.relations)) {
        const relation = objectValue(item);
        if (!relation) {
            continue;
        }
        const type = relationType(relation);
        const target = relationTargetCoordinate(relation);
        if (!type || !target) {
            continue;
        }
        const { family, legacy } = classifyRelationFamily(
            relationFamilyDiscriminator(relation),
            type
        );
        const row = Object.freeze({
            targetCoordinate: target,
            relationType: type,
            relationFamily: family,
            state: rowState(family, legacy)
        });
        if (family === 'structural') {
            structural.push(row);
        } else {
            correspondential.push(row);
        }
    }

    return Object.freeze({
        structural: Object.freeze(structural),
        correspondential: Object.freeze(correspondential)
    });
}

function classifyRelationFamily(
    rawFamily: string | null,
    type: string
): { readonly family: M0RelationFamily; readonly legacy: boolean } {
    const normalized = rawFamily?.toLowerCase().replace(/-/g, '_') ?? null;
    switch (normalized) {
        case 'structural':
        case 'correspondential':
        case 'kernel_core':
        case 'inferred':
        case 'sync':
        case 'compatibility':
            return { family: normalized, legacy: false };
        default:
            // Legacy edge: no Track 01.9 discriminator. Fall back to the
            // structural relation-type list; anything else is correspondential.
            return {
                family: (M0_STRUCTURAL_RELATIONS as readonly string[]).includes(type)
                    ? 'structural'
                    : 'correspondential',
                legacy: true
            };
    }
}

function rowState(family: M0RelationFamily, legacy: boolean): M0ProvenanceState {
    if (family === 'inferred') {
        return 'inferred';
    }
    return legacy ? 'derived' : 'canonical';
}

const M0_RELATION_COLUMNS: readonly Readonly<{
    readonly key: keyof M0RelationsProjection;
    readonly label: string;
    readonly empty: string;
}>[] = Object.freeze([
    Object.freeze({
        key: 'structural',
        label: 'Structural',
        empty: 'No structural relation edges in S2 payload'
    }),
    Object.freeze({
        key: 'correspondential',
        label: 'Correspondential',
        empty: 'No correspondential relation edges in S2 payload'
    })
]);

function columnState(rows: readonly M0RelationRow[]): M0ProvenanceState {
    return rows.length ? 'canonical' : 'canonical_absent';
}

function RelationColumn(props: {
    readonly column: keyof M0RelationsProjection;
    readonly label: string;
    readonly empty: string;
    readonly rows: readonly M0RelationRow[];
}): React.ReactElement {
    const { column, label, empty, rows } = props;
    return (
        <div
            className="m0-relations-layer-column"
            data-relation-column={column}
            data-provenance-state={columnState(rows)}
        >
            <h4>{label}</h4>
            {rows.length ? (
                <table className="m0-relations-layer-table">
                    <thead>
                        <tr>
                            <th scope="col">Target</th>
                            <th scope="col">Relation</th>
                            <th scope="col">Provenance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                key={`${row.relationType}:${row.targetCoordinate}:${index}`}
                                data-relation-column={column}
                                data-relation-type={row.relationType}
                                data-relation-family={row.relationFamily}
                            >
                                <td className="m0-relations-layer-target">{row.targetCoordinate}</td>
                                <td className="m0-relations-layer-type">{row.relationType}</td>
                                <td>
                                    <span
                                        className="m0-relations-layer-provenance-pill"
                                        data-provenance-state={row.state}
                                        aria-label={`${row.relationType} provenance ${row.state}`}
                                    >
                                        {row.state.replace(/_/g, ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="m0-relations-layer-empty" data-provenance-state="canonical_absent">
                    {empty}
                </p>
            )}
        </div>
    );
}

/**
 * Relations Layer Reader panel (M0-2', WC-M0-04).
 *
 * Replaces the comma-joined relation-family line with a two-column table:
 * structural edges on the left, correspondential edges on the right. The
 * columns render side-by-side and are never collapsed, per Track 01.9. Each
 * row carries its own provenance pill.
 */
export function RelationsLayerPanel(props: RelationsLayerPanelProps): React.ReactElement {
    const { projection, coordinate } = props;
    return (
        <section
            className="mext-widget-detail m0-relations-layer-panel"
            data-widget-id="pratibimba.m0-anuttara:relations-layer-panel"
            data-coordinate={coordinate ?? ''}
            aria-label="Relations layer reader"
        >
            <h3>Relations (M0-2')</h3>
            <div className="m0-relations-layer-columns">
                {M0_RELATION_COLUMNS.map(column => (
                    <RelationColumn
                        key={column.key}
                        column={column.key}
                        label={column.label}
                        empty={column.empty}
                        rows={projection[column.key]}
                    />
                ))}
            </div>
        </section>
    );
}

export default RelationsLayerPanel;

function objectValue(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function arrayValue(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

function relationType(relation: Record<string, unknown> | undefined): string | null {
    return (
        stringValue(relation?.type) ??
        stringValue(relation?.relationType) ??
        stringValue(relation?.rel_type)
    );
}

function relationTargetCoordinate(relation: Record<string, unknown> | undefined): string | null {
    const relationProperties = objectValue(relation?.properties);
    return (
        stringValue(relation?.target) ??
        stringValue(relation?.targetCoordinate) ??
        stringValue(relation?.target_coordinate) ??
        stringValue(relation?.coordinate) ??
        stringValue(relationProperties?.target_coordinate) ??
        stringValue(relationProperties?.coordinate)
    );
}

function relationFamilyDiscriminator(relation: Record<string, unknown> | undefined): string | null {
    const relationProperties = objectValue(relation?.properties);
    return (
        stringValue(relationProperties?.c_1_relation_family) ??
        stringValue(relation?.c_1_relation_family) ??
        stringValue(relationProperties?.relation_family) ??
        stringValue(relation?.relation_family)
    );
}
