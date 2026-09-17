/**
 * Coordinate: M' shell-0 (theme-mapping contract test — 30.T30.4)
 * Residency: Body/M/pratibimba-app/src/ui/themeMapping.test.ts
 * Actualises: the four checks the 30.4 brief names as its verification —
 *   per-token resolution for all SEVEN themes, Cl(4,2) polarity preservation,
 *   the nara-domain remap, and the legacy theme mapping — plus the two
 *   negative claims that make the remap honest: it does not leak outside
 *   (nara theme, M4 domain), and it never moves a signature token.
 * Does NOT own: the palette values (ui/tokens.ts), the surface CSS
 *   (styles.css), or the live selection (state/themeStore.ts).
 */

import { describe, expect, it } from 'vitest';
import {
    CANONICAL_THEMES,
    THEME_SELECTIONS,
    canonicalTheme,
    domainIdForCoordinate,
    isNaraTheme,
    mixHex,
    naraRemapActive,
    resolveHue,
    resolveSelection,
    resolveThemeForDomain,
    resolveToken,
    themePolarity,
    type CanonicalTheme,
    type DomainId
} from './themeMapping';
import {
    FAMILY_PALETTE,
    NARA_EARTH_ANCHOR,
    NARA_WARM_BIAS,
    SIGNATURE_COLOURS,
    type FamilyLetter
} from './tokens';

const FAMILIES: readonly FamilyLetter[] = ['P', 'S', 'T', 'M', 'L', 'C'];
const DOMAINS: readonly DomainId[] = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'shell'];
const HEX = /^#[0-9a-f]{6}$/;

/** sRGB → HSL hue in degrees (0 = red, 60 = yellow, 240 = blue). */
function hue(hex: string): number {
    const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta === 0) return 0;
    let h: number;
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    return (h * 60 + 360) % 360;
}

/** sRGB chroma (max − min channel, 0..1). Hue is numerically meaningless below
 *  a small chroma — M0 Anuttara is DR-WC-DL-1's ACHROMATIC ground, so its hue
 *  swings wildly under any nudge while the colour barely moves. Tests gate on
 *  this rather than on `hue === 0`, which only catches exact grey. */
function chroma(hex: string): number {
    const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
    return Math.max(r, g, b) - Math.min(r, g, b);
}

const ACHROMATIC = 0.06;

/** Shortest angular distance between two hues, in degrees. */
function hueDistance(a: number, b: number): number {
    const raw = Math.abs(a - b) % 360;
    return raw > 180 ? 360 - raw : raw;
}

/** Warm = the red→yellow arc; cool = the cyan→violet arc. The Cl(4,2)
 *  signature binary, read off the hue circle. */
function isWarmHue(h: number): boolean {
    return h < 75 || h > 330;
}

describe('30.T30.4 — the seven canonical themes each resolve every token', () => {
    it('exposes exactly the seven canonical themes, and eight selections with system last', () => {
        expect([...CANONICAL_THEMES]).toEqual([
            'dark',
            'light',
            'glass',
            'discause',
            'nara-dark',
            'nara-light',
            'nara-glass'
        ]);
        expect(THEME_SELECTIONS).toHaveLength(8);
        expect(THEME_SELECTIONS.at(-1)).toBe('system');
    });

    it('resolves all 36 family tokens + signature + flow to a concrete hex under every theme and domain', () => {
        for (const theme of CANONICAL_THEMES) {
            for (const domain of DOMAINS) {
                for (const family of FAMILIES) {
                    for (let grade = 0; grade <= 5; grade += 1) {
                        const value = resolveToken(`family.${family.toLowerCase()}.${grade}`, theme, domain);
                        expect(value, `family.${family}.${grade} @ ${theme}/${domain}`).toMatch(HEX);
                    }
                }
                expect(resolveToken('signature.cool', theme, domain)).toMatch(HEX);
                expect(resolveToken('signature.warm', theme, domain)).toMatch(HEX);
                expect(resolveToken('flow.mahamayaGold', theme, domain)).toMatch(HEX);
                expect(resolveToken('flow.parashaktiEmerald', theme, domain)).toMatch(HEX);
            }
        }
    });

    it('takes the light resolution for light-polarity themes and the dark one for dark-polarity themes', () => {
        for (const theme of CANONICAL_THEMES) {
            const polarity = themePolarity(theme);
            // a non-M token so the nara bias cannot confound the comparison
            expect(resolveToken('family.s.3', theme, 'shell')).toBe(FAMILY_PALETTE.S[3][polarity]);
        }
        expect(themePolarity('light')).toBe('light');
        expect(themePolarity('nara-light')).toBe('light');
        // glass and discause are dark-polarity surfaces
        expect(themePolarity('glass')).toBe('dark');
        expect(themePolarity('discause')).toBe('dark');
    });

    it('refuses an unknown token id rather than inventing a plausible colour', () => {
        expect(() => resolveToken('family.x.2', 'dark', 'shell')).toThrow(/unknown design token/);
        expect(() => resolveToken('family.m.9', 'dark', 'shell')).toThrow(/unknown design token/);
        expect(() => resolveToken('privacy.opt_in', 'dark', 'shell')).toThrow(/unknown design token/);
    });
});

describe('30.T30.4 — Cl(4,2) polarity preservation (theme maps WITHIN polarity)', () => {
    it('signature.cool stays cool and signature.warm stays warm under every theme and domain', () => {
        for (const theme of CANONICAL_THEMES) {
            for (const domain of DOMAINS) {
                const cool = hue(resolveToken('signature.cool', theme, domain));
                const warm = hue(resolveToken('signature.warm', theme, domain));
                expect(isWarmHue(cool), `signature.cool went warm at ${theme}/${domain}`).toBe(false);
                expect(isWarmHue(warm), `signature.warm went cool at ${theme}/${domain}`).toBe(true);
            }
        }
    });

    it('holds each token to its own hue family across the light↔dark inversion', () => {
        for (const family of FAMILIES) {
            for (let grade = 0; grade <= 5; grade += 1) {
                const id = `family.${family.toLowerCase()}.${grade}`;
                const light = resolveToken(id, 'light', 'shell');
                const dark = resolveToken(id, 'dark', 'shell');
                // Achromatic ramps (the P foundation-neutral tier, M0) have no
                // meaningful hue; only compare where both ends carry chroma.
                if (chroma(light) < ACHROMATIC || chroma(dark) < ACHROMATIC) continue;
                expect(hueDistance(hue(light), hue(dark)), `${id} changed hue family on inversion`).toBeLessThan(45);
            }
        }
    });

    it('resolveHue offers only the token’s own two resolutions — polarity cannot be crossed', () => {
        const s3 = FAMILY_PALETTE.S[3];
        expect(resolveHue(s3, 'light')).toBe(s3.light);
        expect(resolveHue(s3, 'glass')).toBe(s3.dark);
    });
});

describe('30.T30.4 — nara-domain remap', () => {
    it('fires only for a nara theme ON the m4 domain', () => {
        expect(naraRemapActive('nara-dark', 'm4')).toBe(true);
        expect(naraRemapActive('nara-light', 'm4')).toBe(true);
        expect(naraRemapActive('nara-glass', 'm4')).toBe(true);
        expect(naraRemapActive('nara-dark', 'm3')).toBe(false); // nara theme, wrong domain
        expect(naraRemapActive('dark', 'm4')).toBe(false); // right domain, plain theme
        expect(isNaraTheme('discause')).toBe(false);
    });

    it('leans M-tier tokens toward the earth anchor on m4, by exactly the named bias', () => {
        for (let grade = 0; grade <= 5; grade += 1) {
            const base = FAMILY_PALETTE.M[grade].dark;
            const remapped = resolveToken(`family.m.${grade}`, 'nara-dark', 'm4');
            expect(remapped).toBe(mixHex(base, NARA_EARTH_ANCHOR, NARA_WARM_BIAS));
            expect(remapped).not.toBe(base);
        }
    });

    it('does NOT leak: same theme off m4, and same domain off a nara theme, both stay canonical', () => {
        for (let grade = 0; grade <= 5; grade += 1) {
            const id = `family.m.${grade}`;
            const base = FAMILY_PALETTE.M[grade].dark;
            expect(resolveToken(id, 'nara-dark', 'm2')).toBe(base);
            expect(resolveToken(id, 'dark', 'm4')).toBe(base);
        }
    });

    it('touches ONLY the M tier — the other five families are untouched on m4', () => {
        for (const family of FAMILIES.filter(f => f !== 'M')) {
            for (let grade = 0; grade <= 5; grade += 1) {
                const id = `family.${family.toLowerCase()}.${grade}`;
                expect(resolveToken(id, 'nara-dark', 'm4')).toBe(FAMILY_PALETTE[family][grade].dark);
            }
        }
        // and never the signature axis — that is what protects polarity
        expect(resolveToken('signature.cool', 'nara-dark', 'm4')).toBe(SIGNATURE_COLOURS.cool.dark);
        expect(resolveToken('signature.warm', 'nara-dark', 'm4')).toBe(SIGNATURE_COLOURS.warm.dark);
    });

    it('keeps every M subsystem recognisably itself — the bias is a lean, not a repaint', () => {
        for (let grade = 0; grade <= 5; grade += 1) {
            const base = FAMILY_PALETTE.M[grade].dark;
            const remapped = resolveToken(`family.m.${grade}`, 'nara-dark', 'm4');
            if (chroma(base) < ACHROMATIC) {
                // M0 Anuttara is the achromatic ground: hue says nothing there,
                // so the claim that must hold instead is that it STAYS
                // essentially achromatic — the bias may not tint it into a
                // colour-world it does not have.
                expect(chroma(remapped), `M${grade} gained chroma it should not have`).toBeLessThan(
                    ACHROMATIC * 2
                );
                continue;
            }
            expect(hueDistance(hue(base), hue(remapped)), `M${grade} drifted too far under the nara bias`)
                .toBeLessThan(30);
        }
    });

    it('reads the domain off the live coordinate — that is what makes the remap fire', () => {
        expect(domainIdForCoordinate('M4-3')).toBe('m4');
        expect(domainIdForCoordinate('m4')).toBe('m4');
        expect(domainIdForCoordinate('M0-1-2')).toBe('m0');
        expect(domainIdForCoordinate('S3')).toBe('shell');
        expect(domainIdForCoordinate('cpf')).toBe('shell');
        expect(domainIdForCoordinate(null)).toBe('shell');
    });
});

describe('30.T30.4 — legacy theme mapping and system resolution', () => {
    it('collapses the three legacy aliases to canon', () => {
        expect(canonicalTheme('nara-forest')).toBe('nara-dark');
        expect(canonicalTheme('nara-mist')).toBe('nara-light');
        expect(canonicalTheme('nara-grove')).toBe('nara-glass');
    });

    it('passes the seven canonical names through unchanged', () => {
        for (const theme of CANONICAL_THEMES) {
            expect(canonicalTheme(theme)).toBe(theme);
        }
    });

    it('falls back to dark on an unknown name', () => {
        expect(canonicalTheme('solarized-flamingo')).toBe('dark');
        expect(canonicalTheme('')).toBe('dark');
    });

    it('degrades a nara theme to its base outside the m4 domain, and keeps it on m4', () => {
        const cases: readonly [string, CanonicalTheme][] = [
            ['nara-dark', 'dark'],
            ['nara-light', 'light'],
            ['nara-glass', 'glass'],
            ['nara-forest', 'dark'],
            ['nara-mist', 'light'],
            ['nara-grove', 'glass']
        ];
        for (const [selection, base] of cases) {
            expect(resolveThemeForDomain(selection, 'm2')).toBe(base);
            expect(resolveThemeForDomain(selection, 'shell')).toBe(base);
            expect(resolveThemeForDomain(selection, 'm4')).toBe(canonicalTheme(selection));
        }
    });

    it('leaves non-nara themes alone in every domain, m4 included', () => {
        for (const theme of ['dark', 'light', 'glass', 'discause'] as const) {
            for (const domain of DOMAINS) {
                expect(resolveThemeForDomain(theme, domain)).toBe(theme);
            }
        }
    });

    it('resolves `system` through prefers-color-scheme, then through the domain rule', () => {
        expect(resolveSelection('system', 'shell', true)).toBe('dark');
        expect(resolveSelection('system', 'shell', false)).toBe('light');
        expect(resolveSelection('system', 'm4', false)).toBe('light');
    });
});

describe('30.T30.4 — mixHex derivation primitive', () => {
    it('returns the endpoints at t=0 and t=1 and stays in gamut between', () => {
        const from = FAMILY_PALETTE.M[4].dark;
        expect(mixHex(from, NARA_EARTH_ANCHOR, 0)).toBe(from.toLowerCase());
        expect(mixHex(from, NARA_EARTH_ANCHOR, 1)).toBe(NARA_EARTH_ANCHOR.toLowerCase());
        expect(mixHex(from, NARA_EARTH_ANCHOR, 0.5)).toMatch(HEX);
    });

    it('clamps out-of-range mix fractions rather than producing an out-of-gamut hex', () => {
        expect(mixHex(FAMILY_PALETTE.M[1].dark, NARA_EARTH_ANCHOR, -1)).toMatch(HEX);
        expect(mixHex(FAMILY_PALETTE.M[1].dark, NARA_EARTH_ANCHOR, 5)).toBe(NARA_EARTH_ANCHOR.toLowerCase());
    });
});
