import type { M0SurfaceMode } from '../../common/m0-inspector';
import type { M0LayerKey } from '../../common/m0-layers';
import {
    isM0LayerKey,
    isM0Phase,
    isM0SurfaceMode,
    type M0Phase
} from '../../common/cross-layout-intent';

export interface M0SurfaceState {
    readonly activeLayer: M0LayerKey;
    readonly implicateExplicate: M0Phase;
    readonly mode: M0SurfaceMode;
}

export const M0_SURFACE_STATE_SELECTOR_ID = 'm0-anuttara.activeLayer';

export const DEFAULT_M0_SURFACE_STATE: M0SurfaceState = Object.freeze({
    activeLayer: 'language',
    implicateExplicate: 'implicate',
    mode: 'reading'
});

export function deserializeM0SurfaceState(payload: unknown): M0SurfaceState {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return DEFAULT_M0_SURFACE_STATE;
    }
    const raw = payload as Record<string, unknown>;
    const activeLayer = raw.activeLayer ?? raw.m0_active_layer;
    const implicateExplicate = raw.implicateExplicate ?? raw.m0_implicate_explicate;
    const mode = raw.m0_mode ?? raw.mode;

    return Object.freeze({
        activeLayer: isM0LayerKey(activeLayer)
            ? activeLayer
            : DEFAULT_M0_SURFACE_STATE.activeLayer,
        implicateExplicate: isM0Phase(implicateExplicate)
            ? implicateExplicate
            : DEFAULT_M0_SURFACE_STATE.implicateExplicate,
        mode: isM0SurfaceMode(mode) ? mode : DEFAULT_M0_SURFACE_STATE.mode
    });
}

export function serializeM0SurfaceState(
    state: M0SurfaceState
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        activeLayer: state.activeLayer,
        implicateExplicate: state.implicateExplicate,
        mode: state.mode,
        m0_active_layer: state.activeLayer,
        m0_implicate_explicate: state.implicateExplicate,
        m0_mode: state.mode
    });
}
