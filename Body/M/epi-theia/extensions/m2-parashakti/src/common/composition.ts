import type {
    CoordinateContext,
    MathemeHarmonicProfileBoundary
} from '@pratibimba/m-extension-runtime';
import type { M2ProvenanceHandle } from './meaning-packet';
import { renderM2CymaticFrame } from './meaning-packet';

export type M2SurfaceVariant = 'torus' | 'plate' | 'spheres';
export type M2KleinFlipPhase = 'primary' | 'inverted' | 'transitioning';

export interface ColourBinaryPalette {
    readonly elementColours: Readonly<Record<string, string>>;
    readonly nodalWhite: string;
    readonly activeElement: string;
    readonly binaryPolarity: 'light' | 'dark' | 'mixed';
}

export interface M2CymaticTextureContribution {
    readonly chladniField: readonly number[];
    readonly colourBinary: ColourBinaryPalette;
    readonly heatmap72: readonly number[];
    readonly surfaceVariant: M2SurfaceVariant;
    readonly activeCellIndex: number;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    readonly provenance: M2ProvenanceHandle;
}

const ELEMENT_COLOURS: Readonly<Record<string, string>> = Object.freeze({
    aether: '#7d4f9e',
    earth: '#8a7355',
    water: '#5fa9b8',
    air: '#6ec1c8',
    fire: '#c5564b',
    salt: '#f8fafc'
});

export function buildM2CymaticTextureContribution(
    profile: MathemeHarmonicProfileBoundary,
    context: CoordinateContext,
    variant: M2SurfaceVariant
): M2CymaticTextureContribution {
    const activeCellIndex = activeCellIndexFromProfile(profile, context);
    const frame = renderM2CymaticFrame({
        profile,
        address72: activeCellIndex,
        scope: variant === 'plate' ? 'protected-m4' : 'cosmic-public'
    });
    const chladniField = Object.freeze([...frame.wavePoints]);

    return Object.freeze({
        chladniField,
        colourBinary: colourBinaryPalette(profile.payload, activeCellIndex),
        heatmap72: Object.freeze(heatmapFromChladniField(chladniField, activeCellIndex)),
        surfaceVariant: variant,
        activeCellIndex,
        kleinFlipPhase: kleinFlipPhase(profile.payload),
        provenance: Object.freeze({
            source: 'profile',
            handle: `profile:generation:${profile.generation}:m2-cymatic-texture:${variant}:${activeCellIndex}`,
            bodyAllowed: variant !== 'plate',
            note: `M2 cymatic texture contribution for ${variant}; context=${context.canonicalMCoordinate ?? context.selectedCoordinate ?? 'unselected'}`
        })
    });
}

function heatmapFromChladniField(
    field: readonly number[],
    activeCellIndex: number
): number[] {
    const max = field.reduce((acc, value) => Math.max(acc, Math.abs(value)), 0) || 1;
    return Array.from({ length: 72 }, (_unused, index) => {
        const base = Math.abs(field[index % field.length]) / max;
        const activeBoost = index === activeCellIndex ? 0.18 : 0;
        return Number(Math.min(1, base + activeBoost).toFixed(6));
    });
}

function activeCellIndexFromProfile(
    profile: MathemeHarmonicProfileBoundary,
    context: CoordinateContext
): number {
    const payload = profile.payload;
    const resonance72 = objectValue(payload.resonance72);
    const direct = numberValue(resonance72?.lensAnchorIndex ?? resonance72?.activeCellIndex);
    if (direct !== null) {
        return normalize72(direct);
    }

    const lensMode = objectValue(payload.lensMode);
    const lens = numberValue(lensMode?.lens ?? payload.lens ?? contextIndex(context.selectedCoordinate));
    const position = numberValue(
        lensMode?.position ??
        payload.position6 ??
        payload.position ??
        contextIndex(context.hashInput)
    );
    if (lens !== null && position !== null) {
        return normalize72(Math.trunc(lens) * 6 + Math.trunc(position));
    }

    const det = numberValue(objectValue(payload.mahamaya ?? payload.binary)?.m2VibrationIndex);
    return normalize72(det ?? profile.generation);
}

function colourBinaryPalette(
    payload: Readonly<Record<string, unknown>>,
    activeCellIndex: number
): ColourBinaryPalette {
    const elements = objectValue(payload.elements ?? payload.elementalFrame);
    const activeElement = stringValue(elements?.activeElement ?? elements?.dominantElement) ??
        activeElementFromIndex(activeCellIndex);
    return Object.freeze({
        elementColours: ELEMENT_COLOURS,
        nodalWhite: '#f8fafc',
        activeElement,
        binaryPolarity: binaryPolarity(payload)
    });
}

function binaryPolarity(payload: Readonly<Record<string, unknown>>): ColourBinaryPalette['binaryPolarity'] {
    const binary = objectValue(payload.binary ?? payload.mahamaya);
    const raw = stringValue(binary?.polarity ?? binary?.binaryPolarity ?? binary?.state);
    if (raw === 'light' || raw === 'dark' || raw === 'mixed') {
        return raw;
    }
    return 'mixed';
}

function kleinFlipPhase(payload: Readonly<Record<string, unknown>>): M2KleinFlipPhase {
    const raw = objectValue(payload.kleinFlip ?? payload.klein_flip);
    const state = stringValue(raw?.phase ?? raw?.state ?? raw?.kind);
    if (state === 'transitioning' || raw?.transitioning === true) {
        return 'transitioning';
    }
    if (state === 'inverted' || state === 'm2CymaticValenceInvert') {
        return 'inverted';
    }
    return 'primary';
}

function activeElementFromIndex(index: number): string {
    const elements = ['aether', 'earth', 'water', 'air', 'fire', 'salt'];
    return elements[index % elements.length];
}

function contextIndex(value: string | null): number | null {
    const match = value?.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) : null;
}

function normalize72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % 72) + 72) % 72;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
