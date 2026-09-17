import type { M3ProjectionSurface } from '../../common/codon-wheel';

export interface K2LensRingCellDescriptor {
    readonly ringIndex: number;
    readonly cellIndex: number;
    readonly positionLabel: string;
    readonly codonTriple?: string;
    readonly aminoAcid?: string;
    readonly colourHsla: string;
}

export interface M3CodonRotationProjectionForLensRing {
    readonly cells: readonly K2LensRingCellDescriptor[];
    readonly activeRingIndex: number;
    readonly rotationPhase: number;
}

export const M3CodonRotationProjectionForLensRing = 'M3CodonRotationProjectionForLensRing';

const K2_LENS_RING_COUNT = 9;

const K2_RING_POSITION_LABELS: readonly string[] = Object.freeze([
    'dipyramid-north',
    'upper-aperture-east',
    'upper-aperture-south',
    'equator-east',
    'equator-south',
    'equator-west',
    'lower-aperture-east',
    'lower-aperture-south',
    'dipyramid-south'
]);

const M3_CODON_FAMILY_COLOURS_HSLA: Readonly<Record<string, string>> = Object.freeze({
    'non-dual': 'hsla(210, 72%, 52%, 0.92)',
    dual: 'hsla(335, 68%, 54%, 0.92)',
    unresolved: 'hsla(48, 64%, 50%, 0.88)'
});

export function buildM3CodonRotationProjectionForLensRing(
    surface: M3ProjectionSurface
): M3CodonRotationProjectionForLensRing {
    if (!surface.readiness.surfaceReady) {
        throw new Error(
            `M3CodonRotationProjectionForLensRing requires a ready M3 projection surface: ${surface.readiness.blockers.join('; ')}`
        );
    }

    const active = surface.activeProjection;
    const ringIndex = ringIndexForLens(requiredNumber(active.lens, 'surface.activeProjection.lens'));
    const cellIndex = requiredInteger(active.surfaceIndex, 'surface.activeProjection.surfaceIndex');
    const descriptor: K2LensRingCellDescriptor = Object.freeze({
        ringIndex,
        cellIndex,
        positionLabel: `P${ringIndex}/${K2_RING_POSITION_LABELS[ringIndex]}`,
        codonTriple: optionalString(active.codon),
        aminoAcid: optionalString(active.aminoAcid ?? active.aminoAcidCode),
        colourHsla: colourForCodonFamily(optionalString(active.codonClass))
    });

    return Object.freeze({
        cells: Object.freeze([descriptor]) as readonly K2LensRingCellDescriptor[],
        activeRingIndex: ringIndex,
        rotationPhase: rotationPhase(
            requiredNumber(active.rotation, 'surface.activeProjection.rotation'),
            optionalNumber(active.rotationalStateCount)
        )
    });
}

function ringIndexForLens(lens: number): number {
    if (!Number.isInteger(lens) || lens < 0) {
        throw new Error(`surface.activeProjection.lens must be a non-negative integer; received ${lens}`);
    }
    return lens % K2_LENS_RING_COUNT;
}

function rotationPhase(rotation: number, rotationalStateCount: number | undefined): number {
    const fullTurn = Math.PI * 2;
    if (rotationalStateCount !== undefined) {
        if (!Number.isInteger(rotationalStateCount) || rotationalStateCount <= 0) {
            throw new Error(`surface.activeProjection.rotationalStateCount must be a positive integer; received ${rotationalStateCount}`);
        }
        const wrapped = ((rotation % rotationalStateCount) + rotationalStateCount) % rotationalStateCount;
        return wrapped / rotationalStateCount * fullTurn;
    }
    const wrapped = ((rotation % fullTurn) + fullTurn) % fullTurn;
    return wrapped;
}

function colourForCodonFamily(codonClass: string | undefined): string {
    return M3_CODON_FAMILY_COLOURS_HSLA[codonClass ?? 'unresolved'] ?? M3_CODON_FAMILY_COLOURS_HSLA.unresolved;
}

function requiredInteger(value: unknown, fieldName: string): number {
    const number = requiredNumber(value, fieldName);
    if (!Number.isInteger(number)) {
        throw new Error(`${fieldName} must be an integer`);
    }
    return number;
}

function requiredNumber(value: unknown, fieldName: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${fieldName} must be a finite number`);
    }
    return value;
}

function optionalNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
