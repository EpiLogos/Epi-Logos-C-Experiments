/**
 * Coordinate: M' M2' surface continuity
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M2' persisted UI state value object
 * Actualises: the serializable local M2 interaction record across 0/1 and
 *   daily/deep remounts. The kernel-owned profile coordinates remain in the
 *   shared tick store; this record holds only reader choices and future-face
 *   affordance state, never a browser reconstruction of the profile.
 * Public surface: M2SurfaceState, DEFAULT_M2_SURFACE_STATE,
 *   deserializeM2SurfaceState, serializeM2SurfaceState.
 * Does NOT own: M2 profile production, routing law, S2 correspondence data,
 *   a state store, or cross-layout routing.
 * Contract: [[M2'-SPEC]] and rerun tranche [[23.T23.15]].
 */

import { AXIS_ORDER, type Axis72, type SonicOverlay } from '../engine/axisViews';

export type M2CorrespondenceFace = 'decan' | 'sonic' | 'planetary' | 'cymatic' | 'axes';
export type M2CymaticSurfaceVariant = 'plate' | 'torus' | 'spheres';
export type M2PlanetaryViewMode = 'vibrational' | 'psychoid';

export interface M2SurfaceState {
    readonly activeFace: M2CorrespondenceFace;
    readonly layerAActiveCell: { readonly lens: number; readonly position: number } | null;
    readonly layerBCardScroll: number;
    readonly layerCSurfaceVariant: M2CymaticSurfaceVariant;
    readonly layerCZoom: number;
    readonly lastRoutingTrace: string | null;
    readonly correspondenceTreeAxisFilter: Axis72;
    readonly correspondenceTreeSonicOverlay: SonicOverlay | null;
    readonly planetaryViewMode: M2PlanetaryViewMode;
    readonly epogdoonProofMode: boolean;
}

export const DEFAULT_M2_SURFACE_STATE: M2SurfaceState = Object.freeze({
    activeFace: 'decan',
    layerAActiveCell: null,
    layerBCardScroll: 0,
    layerCSurfaceVariant: 'plate',
    layerCZoom: 1,
    lastRoutingTrace: null,
    correspondenceTreeAxisFilter: 'mef',
    correspondenceTreeSonicOverlay: null,
    planetaryViewMode: 'vibrational',
    epogdoonProofMode: false
});

const FACES = new Set<M2CorrespondenceFace>(['decan', 'sonic', 'planetary', 'cymatic', 'axes']);
const SURFACE_VARIANTS = new Set<M2CymaticSurfaceVariant>(['plate', 'torus', 'spheres']);
const PLANETARY_VIEW_MODES = new Set<M2PlanetaryViewMode>(['vibrational', 'psychoid']);
const AXES = new Set<Axis72>(AXIS_ORDER);

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteAtLeast(value: unknown, minimum: number, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= minimum ? value : fallback;
}

function activeCell(value: unknown): M2SurfaceState['layerAActiveCell'] {
    if (!isRecord(value)) {
        return null;
    }
    const { lens, position } = value;
    return typeof lens === 'number' && Number.isInteger(lens) && typeof position === 'number' && Number.isInteger(position)
        ? { lens, position }
        : null;
}

export function deserializeM2SurfaceState(payload: unknown): M2SurfaceState {
    if (!isRecord(payload)) {
        return DEFAULT_M2_SURFACE_STATE;
    }
    return {
        activeFace:
            typeof payload.activeFace === 'string' && FACES.has(payload.activeFace as M2CorrespondenceFace)
                ? payload.activeFace as M2CorrespondenceFace
                : DEFAULT_M2_SURFACE_STATE.activeFace,
        layerAActiveCell: activeCell(payload.layerAActiveCell),
        layerBCardScroll: finiteAtLeast(payload.layerBCardScroll, 0, DEFAULT_M2_SURFACE_STATE.layerBCardScroll),
        layerCSurfaceVariant:
            typeof payload.layerCSurfaceVariant === 'string' && SURFACE_VARIANTS.has(payload.layerCSurfaceVariant as M2CymaticSurfaceVariant)
                ? payload.layerCSurfaceVariant as M2CymaticSurfaceVariant
                : DEFAULT_M2_SURFACE_STATE.layerCSurfaceVariant,
        layerCZoom: finiteAtLeast(payload.layerCZoom, 0.1, DEFAULT_M2_SURFACE_STATE.layerCZoom),
        lastRoutingTrace:
            typeof payload.lastRoutingTrace === 'string' && payload.lastRoutingTrace.length > 0
                ? payload.lastRoutingTrace
                : null,
        correspondenceTreeAxisFilter:
            typeof payload.correspondenceTreeAxisFilter === 'string' && AXES.has(payload.correspondenceTreeAxisFilter as Axis72)
                ? payload.correspondenceTreeAxisFilter as Axis72
                : DEFAULT_M2_SURFACE_STATE.correspondenceTreeAxisFilter,
        correspondenceTreeSonicOverlay:
            payload.correspondenceTreeSonicOverlay === 'mantra' || payload.correspondenceTreeSonicOverlay === 'asma'
                ? payload.correspondenceTreeSonicOverlay
                : null,
        planetaryViewMode:
            typeof payload.planetaryViewMode === 'string' && PLANETARY_VIEW_MODES.has(payload.planetaryViewMode as M2PlanetaryViewMode)
                ? payload.planetaryViewMode as M2PlanetaryViewMode
                : DEFAULT_M2_SURFACE_STATE.planetaryViewMode,
        epogdoonProofMode:
            typeof payload.epogdoonProofMode === 'boolean'
                ? payload.epogdoonProofMode
                : DEFAULT_M2_SURFACE_STATE.epogdoonProofMode
    };
}

export function serializeM2SurfaceState(state: M2SurfaceState): Readonly<Record<string, unknown>> {
    return {
        activeFace: state.activeFace,
        layerAActiveCell: state.layerAActiveCell,
        layerBCardScroll: state.layerBCardScroll,
        layerCSurfaceVariant: state.layerCSurfaceVariant,
        layerCZoom: state.layerCZoom,
        lastRoutingTrace: state.lastRoutingTrace,
        correspondenceTreeAxisFilter: state.correspondenceTreeAxisFilter,
        correspondenceTreeSonicOverlay: state.correspondenceTreeSonicOverlay,
        planetaryViewMode: state.planetaryViewMode,
        epogdoonProofMode: state.epogdoonProofMode
    };
}
