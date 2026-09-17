import type { CoordinateContext } from '@pratibimba/m-extension-runtime';
import type { M0InspectorLayer, M0SurfaceMode } from './m0-inspector';
import type { M0LayerKey } from './m0-layers';

export type M0Phase = 'implicate' | 'explicate';

export interface M0CrossLayoutIntentPayload {
    readonly requestedExtensionId: 'm0-anuttara';
    readonly requestedContributionId: M0LayerKey | 'graph';
    readonly coordinate?: string;
    readonly implicateExplicate?: M0Phase;
    readonly mode?: M0SurfaceMode;
    readonly source?: string;
}

export const M0_CROSS_LAYOUT_INTENT_TARGETS = Object.freeze([
    'graph',
    'language',
    'ql-structure',
    'relations',
    'time-community',
    'personal',
    'pedagogy'
] as const);

export type M0CrossLayoutIntentTarget = (typeof M0_CROSS_LAYOUT_INTENT_TARGETS)[number];

export const M0_LAYER_KEY_TO_INSPECTOR_LAYER: Readonly<Record<M0LayerKey, M0InspectorLayer>> =
    Object.freeze({
        language: 'lang',
        'ql-structure': 'ql',
        relations: 'rel',
        'time-community': 'time',
        personal: 'pers',
        pedagogy: 'pedag'
    });

export interface M0CrossLayoutIntentState {
    readonly activeLayer: M0LayerKey | null;
    readonly inspectorLayer: M0InspectorLayer | null;
    readonly phase: M0Phase | null;
    readonly mode: M0SurfaceMode | null;
    readonly coordinateContext: CoordinateContext | null;
}

export function isM0LayerKey(value: unknown): value is M0LayerKey {
    return (
        value === 'language' ||
        value === 'ql-structure' ||
        value === 'relations' ||
        value === 'time-community' ||
        value === 'personal' ||
        value === 'pedagogy'
    );
}

export function isM0CrossLayoutIntentTarget(
    value: unknown
): value is M0CrossLayoutIntentTarget {
    return value === 'graph' || isM0LayerKey(value);
}

export function m0IntentLayerToInspectorLayer(layer: M0LayerKey): M0InspectorLayer {
    return M0_LAYER_KEY_TO_INSPECTOR_LAYER[layer];
}

export function isM0Phase(value: unknown): value is M0Phase {
    return value === 'implicate' || value === 'explicate';
}

export function isM0SurfaceMode(value: unknown): value is M0SurfaceMode {
    return value === 'reading' || value === 'authoring';
}

export function parseM0CrossLayoutIntentPayload(
    intent: unknown
): M0CrossLayoutIntentPayload | null {
    if (!intent || typeof intent !== 'object') {
        return null;
    }
    const raw = intent as Record<string, unknown>;
    if (
        raw.requestedExtensionId !== 'm0-anuttara' ||
        !isM0CrossLayoutIntentTarget(raw.requestedContributionId)
    ) {
        return null;
    }
    return Object.freeze({
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: raw.requestedContributionId,
        ...(typeof raw.coordinate === 'string' ? { coordinate: raw.coordinate } : {}),
        ...(isM0Phase(raw.implicateExplicate)
            ? { implicateExplicate: raw.implicateExplicate }
            : {}),
        ...(isM0SurfaceMode(raw.mode) ? { mode: raw.mode } : {}),
        ...(typeof raw.source === 'string' ? { source: raw.source } : {})
    });
}

export function projectM0CrossLayoutIntentState(
    payload: M0CrossLayoutIntentPayload,
    currentContext: CoordinateContext
): M0CrossLayoutIntentState {
    const activeLayer = isM0LayerKey(payload.requestedContributionId)
        ? payload.requestedContributionId
        : null;
    return Object.freeze({
        activeLayer,
        inspectorLayer: activeLayer ? m0IntentLayerToInspectorLayer(activeLayer) : null,
        phase: payload.implicateExplicate ?? null,
        mode: payload.mode ?? null,
        coordinateContext: payload.coordinate
            ? coordinateContextFromM0Intent(payload, currentContext)
            : null
    });
}

export function coordinateContextFromM0Intent(
    payload: M0CrossLayoutIntentPayload,
    currentContext: CoordinateContext
): CoordinateContext {
    const coordinate = payload.coordinate ?? currentContext.selectedCoordinate;
    const source = payload.source ?? 'm0-anuttara.cross-layout-intent';
    return Object.freeze({
        ...currentContext,
        selectedCoordinate: coordinate,
        hashInput: coordinate?.startsWith('#') ? coordinate : currentContext.hashInput,
        provenance: Object.freeze({
            source,
            generation: currentContext.profileGeneration,
            notes: Object.freeze([
                ...currentContext.provenance.notes,
                `cross-layout-intent:${payload.requestedContributionId}`
            ])
        })
    });
}
