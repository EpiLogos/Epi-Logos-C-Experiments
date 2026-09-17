/**
 * Coordinate: M' M0' surface continuity
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0' persisted UI state value object
 * Actualises: the active local layer, implicate/explicate phase, and
 *   reading/authoring mode as one serializable M0 surface record.
 * Public surface: M0Phase, M0SurfaceState, DEFAULT_M0_SURFACE_STATE,
 *   deserializeM0SurfaceState, serializeM0SurfaceState.
 * Does NOT own: a state store, cross-layout routing, canonical graph data, or
 *   canon mutation.
 * Contract: [[M0'-SPEC]] and rerun tranche [[21.T21.20]].
 */

import type { M0InspectorLayer } from './m0Layers';
import type { M0SurfaceMode } from './m0ModeActions';

export type M0Phase = 'implicate' | 'explicate';

export interface M0SurfaceState {
    readonly activeLayer: M0InspectorLayer;
    readonly implicateExplicate: M0Phase;
    readonly mode: M0SurfaceMode;
}

export const DEFAULT_M0_SURFACE_STATE: M0SurfaceState = Object.freeze({
    activeLayer: 'lang',
    implicateExplicate: 'implicate',
    mode: 'reading'
});

const LOCAL_LAYERS = new Set<M0InspectorLayer>(['lang', 'ql', 'rel', 'time']);

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function deserializeM0SurfaceState(payload: unknown): M0SurfaceState {
    if (!isRecord(payload)) {
        return DEFAULT_M0_SURFACE_STATE;
    }
    return {
        activeLayer:
            typeof payload.activeLayer === 'string' && LOCAL_LAYERS.has(payload.activeLayer as M0InspectorLayer)
                ? payload.activeLayer as M0InspectorLayer
                : DEFAULT_M0_SURFACE_STATE.activeLayer,
        implicateExplicate:
            payload.implicateExplicate === 'explicate' || payload.implicateExplicate === 'implicate'
                ? payload.implicateExplicate
                : DEFAULT_M0_SURFACE_STATE.implicateExplicate,
        mode:
            payload.mode === 'authoring' || payload.mode === 'reading'
                ? payload.mode
                : DEFAULT_M0_SURFACE_STATE.mode
    };
}

export function serializeM0SurfaceState(state: M0SurfaceState): Readonly<Record<string, unknown>> {
    return {
        activeLayer: state.activeLayer,
        implicateExplicate: state.implicateExplicate,
        mode: state.mode
    };
}
