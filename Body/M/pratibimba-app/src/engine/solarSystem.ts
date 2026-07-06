/**
 * Coordinate: Integrated 1-2-3 / M2' (solar-system presentation law)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: Sprint-8 E5 — the DESIGNED solar-system reading of the kernel's
 *   live sky. Pure presentation helpers: glyphs, sign/decan naming, label and
 *   tooltip text. Everything here is choreography over KERNEL data
 *   (planetId/degree/decan36/decanRuler/elementId/keplerianVel/isResonance
 *   from `livePlanets`, canonical mod-10 order Mercury=2/Venus=3) — the sign
 *   and decan names are the standard zodiac presentation of the arithmetic
 *   of 360, never a correspondence table of our own.
 * Does NOT own: planetary positions, resonance law (§5.2 kernel flag),
 *   element identity, Keplerian data — all profile-only inputs.
 */

import { ELEMENT_COLOURS, LivePlanet, PLANET_ORDER } from './cosmicMath';
import { inkDim } from '../ui/tokens';

/** Positional over the kernel PLANET_ORDER (Sun..Pluto, Mercury=2/Venus=3). */
export const PLANET_GLYPHS: readonly string[] = [
    '☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇'
];

export const ZODIAC_GLYPHS: readonly string[] = [
    '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'
];

export const ZODIAC_NAMES: readonly string[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/** M2 element-id → name (kernel M2_PLANET_LUT colour-binary identity). */
export const ELEMENT_NAMES: readonly string[] = ['Akasha', 'Vayu', 'Agni', 'Apas', 'Prithvi'];

const DECAN_ROMAN = ['I', 'II', 'III'] as const;

/** decan36 → "Aries II" — the kernel decan index read as sign + face. */
export function decanLabel(decan36: number): string {
    const sign = ZODIAC_NAMES[Math.floor((((decan36 % 36) + 36) % 36) / 3)];
    return `${sign} ${DECAN_ROMAN[(((decan36 % 36) + 36) % 36) % 3]}`;
}

/** The chip text beside each body: glyph, name, live fractional degree. */
export function planetLabelText(planetId: number, degree: number): string {
    return `${PLANET_GLYPHS[planetId] ?? '·'} ${PLANET_ORDER[planetId] ?? `#${planetId}`} · ${degree.toFixed(1)}°`;
}

/** §5.2 resonance made legible: WHY this body breathes. */
export function resonanceMeaning(live: LivePlanet): string {
    const name = PLANET_ORDER[live.planetId ?? -1] ?? 'body';
    const decan = typeof live.decan36 === 'number' ? decanLabel(live.decan36) : '—';
    return `${name} at home — Chaldean ruler of ${decan} (decan ${live.decan36}); the kernel flags resonance and the body breathes`;
}

/** Hover title for a body chip: the full kernel identity in one line. */
export function planetTooltip(live: LivePlanet): string {
    const name = PLANET_ORDER[live.planetId ?? -1] ?? 'body';
    const element = ELEMENT_NAMES[live.elementId ?? -1] ?? '—';
    const decan = typeof live.decan36 === 'number' ? decanLabel(live.decan36) : '—';
    const ruler = PLANET_ORDER[live.decanRuler ?? -1] ?? '—';
    const parts = [
        `${name} · ${(live.degree ?? 0).toFixed(3)}°`,
        `${decan}, ruler ${ruler}`,
        `element ${element}`,
        `Keplerian ${live.keplerianVel ?? '—'}`
    ];
    if (live.retrograde) {
        parts.push('retrograde ℞');
    }
    if (live.isResonance) {
        parts.push(resonanceMeaning(live));
    }
    return parts.join(' — ');
}

/** CSS colour for a kernel element id (mirrors the scene's ELEMENT_COLOURS). */
export function elementCssColour(elementId: number | undefined): string {
    const hex = ELEMENT_COLOURS[elementId ?? -1];
    return typeof hex === 'number' ? `#${hex.toString(16).padStart(6, '0')}` : inkDim;
}

/** Provisional selection address published to the shared coordinate store on
 *  planet click. `planet:` is a self-describing namespace, NOT canon — the
 *  canonical Bimba address for planetary bodies is an OPEN for the Architect
 *  (no kernel-declared coordinate exists on the profile yet). Graph surfaces
 *  must never walk it (WalkPane's isWalkableCoordinate guard). */
export function planetSelectionAddress(planetId: number): string {
    return `planet:${PLANET_ORDER[planetId] ?? planetId}`;
}

/** Selection toggle law: clicking the selected body deselects it; clicking
 *  any other selects that one. */
export function nextPlanetSelection(
    current: LivePlanet | null,
    clicked: LivePlanet
): LivePlanet | null {
    return current?.planetId === clicked.planetId ? null : clicked;
}

// ── E6: quintessence ground presentation (handle-only identity) ────────────

/** The kernel quaternion axis labels [w=Earth, x=Fire, y=Water, z=Air] —
 *  clock_state law, NOT a local correspondence table. */
const QUATERNION_AXIS_ELEMENTS = ['Earth', 'Fire', 'Water', 'Air'] as const;

export function dominantQuaternionElement(quaternion: readonly number[]): string {
    let best = 0;
    for (let i = 1; i < 4; i++) {
        if ((quaternion[i] ?? 0) > (quaternion[best] ?? 0)) {
            best = i;
        }
    }
    return QUATERNION_AXIS_ELEMENTS[best];
}

export interface QuintessenceReading {
    identity: {
        natalDegree: number;
        quintessenceWeight: number;
        layerCount: number;
        partial: boolean;
        hashPreview: string;
        quintessenceQuaternion: readonly number[];
    };
    qCosmic: number[] | null;
    resonance: number | null;
}

/** The engraved ground chip beside the natal marker. */
export function quintessenceChipText(identity: QuintessenceReading['identity']): string {
    return `⊛ ${identity.hashPreview} · natal ${identity.natalDegree}°`;
}

/** The full ground reading on hover: weight, enrichment arc, elemental
 *  ground vs the cosmos. The resonance SCALAR is the kernel's — the renderer
 *  never computes |q_personal·q_cosmic| itself. */
export function quintessenceTooltip(reading: QuintessenceReading): string {
    const { identity, resonance } = reading;
    const parts = [
        `natal ground ${identity.natalDegree}° — the entity's Bimba address on the clock`,
        `quintessence ${identity.quintessenceWeight.toFixed(2)} · ${identity.layerCount}/5 layers${identity.partial ? ' — enriching' : ''}`,
        `ground element ${dominantQuaternionElement(identity.quintessenceQuaternion)}`
    ];
    parts.push(
        typeof resonance === 'number'
            ? `personal↔cosmic resonance ${resonance.toFixed(3)} (kernel scalar)`
            : 'personal↔cosmic resonance pending (kernel scalar absent)'
    );
    return parts.join(' — ');
}
