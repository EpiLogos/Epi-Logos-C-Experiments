import type {
    CoordinateContext,
    MathemeHarmonicProfileBoundary
} from '@pratibimba/m-extension-runtime';
import type { M2ProvenanceHandle } from './meaning-packet';
import { renderM2CymaticFrame } from './meaning-packet';

export type M2SurfaceVariant = 'torus' | 'plate' | 'spheres';
export type M2KleinFlipPhase = 'primary' | 'inverted' | 'transitioning';

/**
 * Layer C surface-variant build status. `'built'` variants render a live surface;
 * `'deferred-23.9'` is the named-but-unbuilt 'spheres' carrier (the daily-0-1
 * cosmic-side solar-system anchor view), reserved for a follow-on tranche so the
 * variant switcher can mount a "pending — solar anchor variant" tile without
 * crashing. See `CymaticSpheresSurface` and 23.9.
 */
export type M2SurfaceVariantStatus = 'built' | 'deferred-23.9';

/** The deferral token registered against the deferred 'spheres' variant. */
export const M2_SPHERES_DEFERRAL: M2SurfaceVariantStatus = 'deferred-23.9';

/**
 * The Layer C variant registry — the single source of truth the variant switcher
 * reads to decide whether a variant renders a built surface or a deferred pending
 * tile. `'plate'` is the deep-widget default; `'torus'` is the composition variant
 * (rendered inside plugin-integrated-1-2-3); `'spheres'` is deferred (23.9).
 */
export const M2_SURFACE_VARIANT_REGISTRY: Readonly<Record<M2SurfaceVariant, M2SurfaceVariantStatus>> =
    Object.freeze({
        plate: 'built',
        torus: 'built',
        spheres: M2_SPHERES_DEFERRAL
    });

/** True when a variant is named but its renderer is deferred (currently only 'spheres'). */
export function m2SurfaceVariantIsDeferred(variant: M2SurfaceVariant): boolean {
    return M2_SURFACE_VARIANT_REGISTRY[variant] !== 'built';
}

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

// ── Planetary elemental-weight feed (23.19) ──────────────────────────────────

/** The four elements the planetary bar stacks, in render order. */
export type M2BarElement = 'fire' | 'water' | 'air' | 'earth';

/** The full four-element weight vector — fractions summing to ~1.0 when live. */
export interface M2ElementalWeightVector {
    readonly earth: number;
    readonly fire: number;
    readonly water: number;
    readonly air: number;
}

/**
 * One planetary orbiter's contribution to the elemental-weight feed, mirroring
 * the kernel-side `PlanetaryElementContribution` surfaced through
 * `kernelBridge.m2.planetaryElementalWeights()`. Folds into the PASU
 * bioquaternion `elemental_weights` vector (#4.4.4.4). `couEnergy` carries the
 * kernel's Keplerian velocity weight (`M2_PLANET_LUT[id].keplerian_vel`) for
 * bridge compatibility with the 23.19 frontend contract. `element` may be
 * `aether` (AKASHA / quintessence) — that energy informs balance but never
 * stacks into the four-element bar. The Sun (planet 0) is the excluded identity
 * root and never appears here (the 9:8 epogdoon asymmetry).
 */
export interface M2ElementalWeightContribution {
    /** Planet_Id (1..9 — Moon..Pluto; Sun excluded). */
    readonly planetId: number;
    /** Lowercase Mahabhuta element name (`fire`/`water`/`air`/`earth`/`aether`). */
    readonly element: string;
    /** Keplerian velocity weight this orbiter projects (arcsec/day x 10). */
    readonly couEnergy: number;
}

/** The four bar elements in stack order — fire, water, air, earth. */
export const M2_BAR_ELEMENTS: readonly M2BarElement[] = Object.freeze([
    'fire',
    'water',
    'air',
    'earth'
]);

/** True when a contribution lands in the four-element bar (i.e. is not aether). */
export function m2ContributionIsBarElement(
    contribution: M2ElementalWeightContribution
): contribution is M2ElementalWeightContribution & { element: M2BarElement } {
    return (M2_BAR_ELEMENTS as readonly string[]).includes(contribution.element);
}

/**
 * Fold per-planet contributions into the normalised four-element vector. Pure
 * mirror of the kernel fold (`planetary_elemental_weights`) used to derive each
 * planet's stacked-segment fraction widget-side — aether contributions are
 * reported but excluded from the bar total.
 */
export function foldM2ElementalWeightContributions(
    contributions: readonly M2ElementalWeightContribution[]
): M2ElementalWeightVector {
    const buckets: Record<M2BarElement, number> = { fire: 0, water: 0, air: 0, earth: 0 };
    for (const contribution of contributions) {
        if (m2ContributionIsBarElement(contribution)) {
            buckets[contribution.element] += Math.max(0, contribution.couEnergy);
        }
    }
    const total = buckets.fire + buckets.water + buckets.air + buckets.earth;
    if (total <= 0) {
        return Object.freeze({ earth: 0, fire: 0, water: 0, air: 0 });
    }
    return Object.freeze({
        earth: buckets.earth / total,
        fire: buckets.fire / total,
        water: buckets.water / total,
        air: buckets.air / total
    });
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
