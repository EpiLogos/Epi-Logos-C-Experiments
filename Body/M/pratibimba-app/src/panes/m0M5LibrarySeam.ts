/**
 * Coordinate: M' M0' ↔ M5-0' (graph / Library Klein seam, 09.T9.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): shared coordinate-tagging projection boundary
 * Actualises: a privacy-minimal projection of direct `bimba_coordinate` tags
 *   and relationship-backed `bimba_resonances` returned by S5 Gnostic for the
 *   coordinate traversed on the M0' map.
 * Public surface: M0_M5_LIBRARY_METHOD, M0M5LibraryProjection,
 *   buildM0M5LibrarySeam.
 * Does NOT own: Gnostic storage, coordinate classification, file bodies,
 *   graph mutation, or a standalone graph/library viewer.
 * Contract: [[M0'-SPEC]] + [[M5'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] 09.T9.9.
 */

import type { ProvenanceState } from '../ui/ProvenanceBadge';

export const M0_M5_LIBRARY_METHOD = "s5'.gnostic.etymology" as const;

export interface M0M5LibraryEntry {
    readonly kind: 'bimba_coordinate' | 'bimba_resonances';
    readonly entityId: string;
    readonly entityName: string | null;
    readonly assignmentMethod: string | null;
    readonly homeCoordinate: string;
    readonly confidence: number | null;
}

export interface M0M5LibraryProjection {
    readonly coordinate: string | null;
    readonly entries: readonly M0M5LibraryEntry[];
    readonly reason: string | null;
    readonly state: ProvenanceState;
}

const EMPTY: Record<string, unknown> = Object.freeze({});

function record(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : EMPTY;
}

function rows(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function confidence(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
        ? value
        : null;
}

export function buildM0M5LibrarySeam(value: unknown): M0M5LibraryProjection {
    const payload = record(value);
    const coordinate = text(payload.coordinate);
    const status = text(payload.status);
    if (status !== 'ok' || !coordinate) {
        return Object.freeze({
            coordinate: null,
            entries: Object.freeze([]),
            reason: text(payload.message) ?? 'Gnostic coordinate cluster unavailable',
            state: 'blocked' as ProvenanceState
        });
    }

    const cluster = record(payload.cluster);
    const direct = rows(cluster.anchors).flatMap(item => {
        const row = record(item);
        const entityId = text(row.entity_id ?? row.entityId);
        if (!entityId) return [];
        return [
            Object.freeze({
                kind: 'bimba_coordinate' as const,
                entityId,
                entityName: text(row.entity_name ?? row.entityName),
                assignmentMethod: text(row.assignment_method ?? row.assignmentMethod),
                homeCoordinate: coordinate,
                confidence: null
            })
        ];
    });
    const resonant = rows(cluster.resonant).flatMap(item => {
        const row = record(item);
        const entityId = text(row.entity_id ?? row.entityId);
        const homeCoordinate = text(row.home_coordinate ?? row.homeCoordinate);
        if (!entityId || !homeCoordinate) return [];
        return [
            Object.freeze({
                kind: 'bimba_resonances' as const,
                entityId,
                entityName: text(row.entity_name ?? row.entityName),
                assignmentMethod: null,
                homeCoordinate,
                confidence: confidence(row.confidence)
            })
        ];
    });
    const entries = Object.freeze([...direct, ...resonant]);

    return Object.freeze({
        coordinate,
        entries,
        reason: null,
        state: (entries.length > 0 ? 'derived' : 'canonical_absent') as ProvenanceState
    });
}
