/**
 * Coordinate: M' M1'+M2'+M3' (coupling-flow overlay — Track 07.T7.6)
 * Residency: Body/M/pratibimba-app/src/engine
 * Position: #3 — Pattern (a source-warranted pattern reading on the composition)
 * Actualises: the compact 137 coupling-flow disclosure over the existing
 *   cosmic composition, reading only the kernel-produced profile boundary.
 * Public surface: CouplingFlowOverlayState, CouplingFlowOverlay,
 *   buildCouplingFlowOverlay.
 * Does NOT own: coupling-flow derivation, physics calculations, profile I/O,
 *   or a fourth rendered composition pole.
 * Contract: Body/S/S0/portal-core/src/profile_projections.rs::CouplingFlowAlignment.
 */

export type CouplingFlowOverlayState = 'ready' | 'pending-coupling-flow-alignment';

export interface CouplingFlowOverlay {
    readonly state: CouplingFlowOverlayState;
    readonly symbolicSkeletons: readonly string[];
    readonly physicsDescent: readonly string[];
    readonly measurementFaces: readonly string[];
    readonly recognitionWarrant: string | null;
    readonly caveats: readonly string[];
}

const PENDING: CouplingFlowOverlay = Object.freeze({
    state: 'pending-coupling-flow-alignment',
    symbolicSkeletons: Object.freeze([]),
    physicsDescent: Object.freeze([]),
    measurementFaces: Object.freeze([]),
    recognitionWarrant: null,
    caveats: Object.freeze([])
});

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function nonEmptyStrings(value: unknown): readonly string[] | null {
    if (!Array.isArray(value) || value.length === 0 || !value.every(item => typeof item === 'string' && item.length > 0)) {
        return null;
    }
    return Object.freeze([...value] as string[]);
}

function profileRoot(payload: Readonly<Record<string, unknown>>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? (payload as Record<string, unknown>);
}

/** Read the complete kernel alignment as one unit. Partial alignment data is
 *  not useful evidence: it remains pending rather than inviting the renderer
 *  to fill a missing physics or caveat lane locally. */
export function buildCouplingFlowOverlay(
    payload: Readonly<Record<string, unknown>>
): CouplingFlowOverlay {
    const alignment = objectValue(profileRoot(payload).couplingFlowAlignment);
    if (!alignment) {
        return PENDING;
    }
    const symbolicSkeletons = nonEmptyStrings(alignment.symbolicSkeletons);
    const physicsDescent = nonEmptyStrings(alignment.physicsDescent);
    const measurementFaces = nonEmptyStrings(alignment.measurementFaces);
    const caveats = nonEmptyStrings(alignment.caveats);
    const recognitionContext = objectValue(alignment.recognitionContext);
    const recognitionWarrant = recognitionContext?.warrant;
    if (
        !symbolicSkeletons ||
        !physicsDescent ||
        !measurementFaces ||
        !caveats ||
        typeof recognitionWarrant !== 'string' ||
        recognitionWarrant.length === 0
    ) {
        return PENDING;
    }
    return Object.freeze({
        state: 'ready' as const,
        symbolicSkeletons,
        physicsDescent,
        measurementFaces,
        recognitionWarrant,
        caveats
    });
}
