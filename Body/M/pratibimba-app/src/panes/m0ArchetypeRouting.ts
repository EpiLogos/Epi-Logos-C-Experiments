/**
 * Coordinate: M' M0-0' (archetype routing projection, 21.T21.8)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0 language-panel routing read boundary
 * Actualises: strict display projection of the selected coordinate's archetype
 *   routing and the kernel-bussed m0_routing_lut_snapshot.
 * Public surface: M0ArchetypeRoutingProjection, readM0ArchetypeRouting,
 *   m0ArchetypeRoutingLutLabel.
 * Does NOT own: kernel LUTs, archetype routing law, profile transport, graph
 *   reads, or local fallback tables.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.8.
 */

import type { KernelBridgeCachedProfile } from '../bridge/types';

export type M0SubTableId = 'ZODIACAL' | 'MONOPOLY' | 'DIVINE_ACT' | 'VIRTUE' | 'NONE';
export type M0SyntaxLayer = 'speech' | 'relationship' | 'action' | 'completion' | null;
export type M0ArchetypeRoutingState = 'canonical' | 'canonical_absent' | 'derived' | 'blocked';
type M0RoutedArchetype = 3 | 5 | 7 | 9;

export interface M0SubTableRow {
    readonly id: number;
    readonly label: string;
    readonly symbol: string | null;
    readonly provenance: string;
}

export interface M0ArchetypeRoutingProjection {
    readonly archetypeIndex: number | null;
    readonly archetypeLabel: string | null;
    readonly routedSubTable: M0SubTableId;
    readonly subTableRows: readonly M0SubTableRow[];
    readonly syntaxLayer: M0SyntaxLayer;
    readonly state: M0ArchetypeRoutingState;
}

const M0_ARCHETYPE_ROUTING_SPECS = Object.freeze({
    3: Object.freeze({
        label: 'Vak',
        subTable: 'ZODIACAL',
        syntaxLayer: 'speech',
        lutLabel: 'ZODIACAL_LUT'
    }),
    5: Object.freeze({
        label: 'Mono-Poly',
        subTable: 'MONOPOLY',
        syntaxLayer: 'relationship',
        lutLabel: 'MONOPOLY_LUT'
    }),
    7: Object.freeze({
        label: 'Acts of Siva',
        subTable: 'DIVINE_ACT',
        syntaxLayer: 'action',
        lutLabel: 'DIVINE_ACT_LUT'
    }),
    9: Object.freeze({
        label: 'Virtue',
        subTable: 'VIRTUE',
        syntaxLayer: 'completion',
        lutLabel: 'VIRTUE_LUT'
    })
} satisfies Readonly<
    Record<
        3 | 5 | 7 | 9,
        {
            readonly label: string;
            readonly subTable: Exclude<M0SubTableId, 'NONE'>;
            readonly syntaxLayer: Exclude<M0SyntaxLayer, null>;
            readonly lutLabel: string;
        }
    >
>);

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function integer(value: unknown): number | null {
    return Number.isInteger(value) ? (value as number) : null;
}

function string(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function isRoutedArchetype(index: number | null): index is M0RoutedArchetype {
    return index === 3 || index === 5 || index === 7 || index === 9;
}

function routingSpec(index: M0RoutedArchetype) {
    return M0_ARCHETYPE_ROUTING_SPECS[index];
}

function profilePayload(cached: KernelBridgeCachedProfile | null): Record<string, unknown> | null {
    const root = record(cached?.profile);
    return record(root?.payload) ?? root;
}

function routingRows(
    cached: KernelBridgeCachedProfile | null,
    archetypeIndex: M0RoutedArchetype
): readonly M0SubTableRow[] {
    const payload = profilePayload(cached);
    const snapshot = record(payload?.m0_routing_lut_snapshot ?? payload?.m0RoutingLutSnapshot);
    const lut = snapshot?.archetype_lut ?? snapshot?.archetypeLut;
    if (!Array.isArray(lut) || !Array.isArray(lut[archetypeIndex])) {
        return Object.freeze([]);
    }
    return Object.freeze(
        lut[archetypeIndex].flatMap(candidate => {
            const row = record(candidate);
            const id = integer(row?.id);
            const label = string(row?.label);
            const symbol = string(row?.symbol);
            const provenance = string(row?.provenance);
            return id === null || label === null || provenance === null
                ? []
                : [Object.freeze({ id, label, symbol, provenance })];
        })
    );
}

export function readM0ArchetypeRouting(
    properties: Record<string, unknown> | null,
    cached: KernelBridgeCachedProfile | null
): M0ArchetypeRoutingProjection {
    const payload = profilePayload(cached);
    const archetypeIndex = integer(
        properties?.c_1_archetype_index ??
            properties?.archetype_index ??
            payload?.c_1_archetype_index ??
            payload?.archetype_index
    );
    if (!isRoutedArchetype(archetypeIndex)) {
        return Object.freeze({
            archetypeIndex,
            archetypeLabel: null,
            routedSubTable: 'NONE',
            subTableRows: Object.freeze([]),
            syntaxLayer: null,
            state: archetypeIndex === null ? 'canonical_absent' : 'derived'
        });
    }

    const spec = routingSpec(archetypeIndex);
    const rows = routingRows(cached, archetypeIndex);
    return Object.freeze({
        archetypeIndex,
        archetypeLabel: spec.label,
        routedSubTable: spec.subTable,
        subTableRows: rows,
        syntaxLayer: spec.syntaxLayer,
        state: rows.length > 0 ? 'canonical' : 'blocked'
    });
}

export function m0ArchetypeRoutingLutLabel(
    projection: Pick<M0ArchetypeRoutingProjection, 'archetypeIndex' | 'routedSubTable'>
): string | null {
    const spec = isRoutedArchetype(projection.archetypeIndex)
        ? routingSpec(projection.archetypeIndex)
        : null;
    return spec && projection.routedSubTable !== 'NONE'
        ? `${spec.lutLabel}[${projection.archetypeIndex}]`
        : null;
}
