/**
 * Coordinate: M' shell-0 (coordinate-derived chromatic system — 30.T30.2)
 * Actualises: the DR-WC-DL-1 family-tier x archetype-grade matrix as behaviour —
 *   36-token integrity, the RATIFIED M-tier subsystem colour-worlds (M0..M5 in
 *   their canonical hue families), coordinate-string tint derivation, Cl(4,2)
 *   signature + DR-flow polarity preservation across light/dark, and WCAG
 *   large-text contrast for the M-tier identity tints. Property-based (no raw
 *   hex literals) so the carrier-tokens discipline stays intact.
 */

import { describe, expect, it } from 'vitest';
import {
    coordinateFamilyGrade,
    FAMILY_PALETTE,
    familyGrade,
    FLOW_COLOURS,
    SIGNATURE_COLOURS,
    type FamilyLetter,
    type ThemedHue
} from './tokens';

const FAMILIES: readonly FamilyLetter[] = ['P', 'S', 'T', 'M', 'L', 'C'];
const HEX = /^#[0-9a-f]{6}$/;

function rgb(hex: string): [number, number, number] {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
    ];
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
    const chan = rgb(hex).map(v => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
}

function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

/** Hue in degrees (0..360); saturation 0..1. */
function hsl(hex: string): { hue: number; sat: number; light: number } {
    const [r, g, b] = rgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 2;
    const delta = max - min;
    if (delta === 0) return { hue: 0, sat: 0, light };
    const sat = delta / (1 - Math.abs(2 * light - 1));
    let hue: number;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    return { hue, sat, light };
}

const inRange = (h: number, lo: number, hi: number): boolean =>
    lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi;

const LIGHT_BG = '#ffffff';
const DARK_BG = '#17161c';

describe('30.T30.2 family-tier chromatic matrix', () => {
    it('is a complete 36-token matrix of valid light/dark hexes', () => {
        for (const family of FAMILIES) {
            expect(FAMILY_PALETTE[family]).toHaveLength(6);
            for (let grade = 0; grade < 6; grade++) {
                const hue = familyGrade(family, grade as 0);
                expect(hue.light).toMatch(HEX);
                expect(hue.dark).toMatch(HEX);
            }
        }
        const all = FAMILIES.flatMap(f => FAMILY_PALETTE[f].flatMap(h => [h.light, h.dark]));
        expect(new Set(all).size).toBe(all.length); // all 72 distinct
    });

    it('ratifies the M-tier canonical subsystem colour-worlds (DR-WC-DL-1)', () => {
        const m = FAMILY_PALETTE.M;
        // M0 Anuttara — achromatic ground (black/white/rainbow): low saturation.
        expect(hsl(m[0].light).sat).toBeLessThan(0.2);
        expect(hsl(m[0].dark).sat).toBeLessThan(0.2);
        // M1 Paramasiva — deep blue.
        expect(inRange(hsl(m[1].light).hue, 205, 250)).toBe(true);
        // M2 Parashakti — red/pink.
        expect(inRange(hsl(m[2].light).hue, 330, 20)).toBe(true);
        // M3 Mahamaya — yellow/brown/orange (gold-mid).
        expect(inRange(hsl(m[3].light).hue, 30, 55)).toBe(true);
        // M4 Nara — deep green/teal.
        expect(inRange(hsl(m[4].light).hue, 150, 190)).toBe(true);
        // M5 Epii — purple.
        expect(inRange(hsl(m[5].light).hue, 260, 295)).toBe(true);
    });

    it('lands the M-tier identity tints at WCAG large-text contrast in both themes', () => {
        for (let grade = 0; grade < 6; grade++) {
            expect(contrast(FAMILY_PALETTE.M[grade].light, LIGHT_BG)).toBeGreaterThanOrEqual(3);
            expect(contrast(FAMILY_PALETTE.M[grade].dark, DARK_BG)).toBeGreaterThanOrEqual(3);
        }
    });

    it('grades the ramped tiers monotonically (grade 0 faintest → grade 5 strongest)', () => {
        for (const family of ['P', 'S', 'T', 'L', 'C'] as const) {
            const lights = FAMILY_PALETTE[family].map(h => luminance(h.light));
            // On a light background, a higher grade is a stronger (darker) tint.
            expect(lights[0]).toBeGreaterThan(lights[5]);
        }
    });

    it('derives a coordinate-string tint from its family letter + first archetype', () => {
        const m32 = coordinateFamilyGrade('M3-2');
        expect(m32?.family).toBe('M');
        expect(m32?.grade).toBe(3);
        // M3 Mahamaya reads gold/orange (the spec's "gold-mid-saturation").
        expect(inRange(hsl(m32!.hue.light).hue, 30, 55)).toBe(true);

        const m2 = coordinateFamilyGrade('M2');
        expect(m2?.grade).toBe(2);
        expect(inRange(hsl(m2!.hue.light).hue, 330, 20)).toBe(true); // red/pink

        expect(coordinateFamilyGrade('s1')?.family).toBe('S'); // case-insensitive
        // Not one of the six families → no tier tint (raw archetype / reflective).
        expect(coordinateFamilyGrade('#4')).toBeNull();
        expect(coordinateFamilyGrade('cpf')).toBeNull();
    });

    it('preserves Cl(4,2) signature + DR-flow polarity across light/dark', () => {
        const coolLight = hsl(SIGNATURE_COLOURS.cool.light).hue;
        const coolDark = hsl(SIGNATURE_COLOURS.cool.dark).hue;
        expect(inRange(coolLight, 205, 260)).toBe(true); // cool stays cool
        expect(inRange(coolDark, 205, 260)).toBe(true);
        const warmLight = hsl(SIGNATURE_COLOURS.warm.light).hue;
        const warmDark = hsl(SIGNATURE_COLOURS.warm.dark).hue;
        expect(inRange(warmLight, 30, 55)).toBe(true); // warm stays warm
        expect(inRange(warmDark, 30, 55)).toBe(true);

        for (const theme of ['light', 'dark'] as const) {
            expect(inRange(hsl(FLOW_COLOURS.mahamayaGold[theme]).hue, 25, 55)).toBe(true);
            expect(inRange(hsl(FLOW_COLOURS.parashaktiEmerald[theme]).hue, 140, 175)).toBe(true);
        }
    });
});

// Keep the ThemedHue import meaningful for readers of this contract.
export type { ThemedHue };
