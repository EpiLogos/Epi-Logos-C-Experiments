/**
 * Coordinate: M' shell-0 (light/dark theme mapping — 30.T30.4)
 * Residency: Body/M/pratibimba-app/src/ui/themeMapping.ts
 * Position (#n): #4 — Context/Type (the frame a token is resolved WITHIN)
 * Actualises: the seven-canonical-theme resolution layer over the 30.T30.2
 *   coordinate-derived palette. A token carries two resolutions ({light,dark},
 *   ui/tokens.ts); a THEME says which one a surface takes, and the M4 nara
 *   domain leans the M-tier warm on top. Three laws, all from the 30.4 brief:
 *     1. Legacy aliases collapse to canon (`nara-forest → nara-dark`, …) and
 *        `system` reads `prefers-color-scheme` — the frozen Theia
 *        `omnipanel-shell/src/browser/theme/resolveTheme.ts` contract, carried
 *        verbatim (that contract is LAW; its Inversify plumbing is dead).
 *     2. Cl(4,2) POLARITY PRESERVATION — theme switch maps WITHIN polarity,
 *        never across. Cool tokens stay cool, warm stay warm, because a theme
 *        only ever picks between a token's own two same-polarity resolutions.
 *     3. The nara-domain remap touches ONLY the two namespaces the brief names
 *        — `family.m.*` and `privacy.*` (the latter landed with 25.T25.18) —
 *        and is a bounded lean toward the earth anchor, not a second palette.
 * Public surface: CanonicalTheme, ThemeSelection, ThemePolarity, DomainId,
 *   CANONICAL_THEMES, THEME_SELECTIONS, THEME_POLARITY, NARA_REMAPPED_NAMESPACES,
 *   canonicalTheme, resolveThemeForDomain, resolveSelection, themePolarity,
 *   isNaraTheme, domainIdForCoordinate, naraRemapActive, mixHex, resolveHue,
 *   resolveToken.
 * Does NOT own: the palette values (ui/tokens.ts is the token source — every
 *   hex lives there), the CSS surface vocabulary (styles.css `[data-theme]`
 *   blocks), the live selection (state/themeStore.ts), or which coordinate is
 *   active (state/stores.ts).
 * Contract: rerun tranche [[30.T30.4]] over [[30.T30.2]]; [[DR-WC-DL-1]]
 *   (the M-tier colour-worlds this remap leans, never replaces).
 */

import {
    FAMILY_PALETTE,
    FLOW_COLOURS,
    NARA_EARTH_ANCHOR,
    NARA_WARM_BIAS,
    PRIVACY_COLOURS,
    READINESS_ID_COLOURS,
    SIGNATURE_COLOURS,
    type ArchetypeGrade,
    type FamilyLetter,
    type ThemedHue
} from './tokens';
import type { BridgeReadinessId } from './bridgeReadiness';

/** The seven canonical themes a surface can actually resolve at. */
export type CanonicalTheme =
    | 'dark'
    | 'light'
    | 'glass'
    | 'discause'
    | 'nara-dark'
    | 'nara-light'
    | 'nara-glass';

/** What a user may SELECT: the seven canon, the three legacy aliases still
 *  honoured, and `system` (deferred to `prefers-color-scheme`). */
export type ThemeSelection =
    | CanonicalTheme
    | 'nara-forest'
    | 'nara-mist'
    | 'nara-grove'
    | 'system';

/** Which of a token's two resolutions a theme takes. */
export type ThemePolarity = 'light' | 'dark';

/** The surface a theme is resolved FOR. `m0`–`m5` are the subsystem domains
 *  (the nara remap keys off `m4`); `shell` is chrome owned by no subsystem. */
export type DomainId = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'shell';

export const CANONICAL_THEMES: readonly CanonicalTheme[] = Object.freeze([
    'dark',
    'light',
    'glass',
    'discause',
    'nara-dark',
    'nara-light',
    'nara-glass'
] as const);

/** Every selection the picker offers and the persisted preference accepts: the
 *  seven canon, plus `system`. The legacy aliases are honoured on READ
 *  (canonicalTheme) but are not offered as choices. */
export const THEME_SELECTIONS: readonly ThemeSelection[] = Object.freeze([
    ...CANONICAL_THEMES,
    'system'
] as const);

/** The frozen-Theia alias table, carried verbatim as contract. */
const LEGACY_TO_CANONICAL: Readonly<Record<string, CanonicalTheme>> = Object.freeze({
    dark: 'dark',
    light: 'light',
    glass: 'glass',
    discause: 'discause',
    'nara-dark': 'nara-dark',
    'nara-light': 'nara-light',
    'nara-glass': 'nara-glass',
    'nara-forest': 'nara-dark',
    'nara-mist': 'nara-light',
    'nara-grove': 'nara-glass'
});

/** The nara themes' non-nara fallbacks, for a domain that is not M4. */
const NARA_TO_BASE: Readonly<Record<'nara-dark' | 'nara-light' | 'nara-glass', CanonicalTheme>> =
    Object.freeze({
        'nara-dark': 'dark',
        'nara-light': 'light',
        'nara-glass': 'glass'
    });

/** Which resolution each canonical theme takes from a {@link ThemedHue}. The
 *  three glass/discause themes are DARK-polarity surfaces (translucency and
 *  the discause accent ride a dark ground) — this table is the single place
 *  that fact is stated, so no consumer re-guesses it. */
export const THEME_POLARITY: Readonly<Record<CanonicalTheme, ThemePolarity>> = Object.freeze({
    dark: 'dark',
    light: 'light',
    glass: 'dark',
    discause: 'dark',
    'nara-dark': 'dark',
    'nara-light': 'light',
    'nara-glass': 'dark'
});

/** The token namespaces the nara-domain remap tunes — exactly the two the 30.4
 *  brief names: "M-tier tokens (`family.m.*`) and privacy-class tokens
 *  (`privacy.*`) tune slightly warmer". `privacy` joined when 25.T25.18 landed
 *  the privacy tokens. Kept as data so the remap has ONE path, never two. */
export const NARA_REMAPPED_NAMESPACES: readonly string[] = Object.freeze(['family.m', 'privacy']);

/** Collapse any selection string to canon. Unknown input falls back to `dark`
 *  (the frozen contract's behaviour). `system` is NOT resolved here — it has
 *  no canonical form without an environment; use {@link resolveSelection}. */
export function canonicalTheme(theme: string): CanonicalTheme {
    return LEGACY_TO_CANONICAL[theme] ?? 'dark';
}

/** The contract entry point, carried from the frozen Theia surface: a nara
 *  theme outside the M4 domain degrades to its non-nara base. */
export function resolveThemeForDomain(theme: string, domainId: string): CanonicalTheme {
    const canonical = canonicalTheme(theme);
    if (domainId === 'm4') {
        return canonical;
    }
    if (canonical === 'nara-dark' || canonical === 'nara-light' || canonical === 'nara-glass') {
        return NARA_TO_BASE[canonical];
    }
    return canonical;
}

/** Resolve a user selection — including `system` — for a domain. `system`
 *  defers to `prefers-color-scheme` exactly as the frozen shell did: the media
 *  answer becomes `dark`/`light`, then goes through the domain rule. */
export function resolveSelection(
    selection: ThemeSelection,
    domainId: DomainId,
    prefersDark: boolean
): CanonicalTheme {
    if (selection === 'system') {
        return resolveThemeForDomain(prefersDark ? 'dark' : 'light', domainId);
    }
    return resolveThemeForDomain(selection, domainId);
}

export function themePolarity(theme: CanonicalTheme): ThemePolarity {
    return THEME_POLARITY[theme];
}

export function isNaraTheme(theme: CanonicalTheme): boolean {
    return theme === 'nara-dark' || theme === 'nara-light' || theme === 'nara-glass';
}

/** The domain a Bimba coordinate belongs to. The M-family IS the subsystem
 *  domain axis (M0 Anuttara … M5 Epii), so `M4-3` is the nara domain and every
 *  non-M coordinate is shell chrome. This is what makes the nara remap FIRE:
 *  the live coordinate store supplies the domain, no separate signal. */
export function domainIdForCoordinate(coordinate: string | null | undefined): DomainId {
    if (!coordinate) {
        return 'shell';
    }
    const match = /^m([0-5])/i.exec(coordinate.trim());
    return match ? (`m${match[1]}` as DomainId) : 'shell';
}

/** Does the nara warm bias apply to this (theme, domain) pair? Both halves are
 *  required — a nara theme on M0 does not warm, and a plain dark theme on M4
 *  does not either. */
export function naraRemapActive(theme: CanonicalTheme, domainId: DomainId): boolean {
    return isNaraTheme(theme) && domainId === 'm4';
}

function channels(hex: string): [number, number, number] {
    const body = hex.replace('#', '');
    const full =
        body.length === 3
            ? body
                  .split('')
                  .map(c => c + c)
                  .join('')
            : body;
    return [
        Number.parseInt(full.slice(0, 2), 16),
        Number.parseInt(full.slice(2, 4), 16),
        Number.parseInt(full.slice(4, 6), 16)
    ];
}

/** Blend `from` toward `to` by `t` (0 = from, 1 = to), in sRGB. The one
 *  derivation primitive the nara remap needs; it takes both endpoints as
 *  arguments so no colour value is ever authored outside the token source. */
export function mixHex(from: string, to: string, t: number): string {
    const clamped = Math.min(1, Math.max(0, t));
    const a = channels(from);
    const b = channels(to);
    const out = a.map((channel, i) => Math.round(channel + (b[i] - channel) * clamped));
    return '#' + out.map(channel => channel.toString(16).padStart(2, '0')).join('');
}

/** Pick a token's resolution for a theme. THIS is where polarity preservation
 *  is structural rather than asserted: the only choice available is between
 *  the token's own two resolutions, which 30.2 authored at the same polarity. */
export function resolveHue(hue: ThemedHue, theme: CanonicalTheme): string {
    return hue[themePolarity(theme)];
}

function applyNaraBias(value: string, namespace: string, theme: CanonicalTheme, domainId: DomainId): string {
    if (!naraRemapActive(theme, domainId) || !NARA_REMAPPED_NAMESPACES.includes(namespace)) {
        return value;
    }
    return mixHex(value, NARA_EARTH_ANCHOR, NARA_WARM_BIAS);
}

/**
 * Resolve one token id to a concrete colour for a (theme, domain).
 *
 * Token ids are the 30.2 namespaces, dotted:
 *   - `family.{p|s|t|m|l|c}.{0..5}` — family tier × archetype grade
 *   - `signature.{cool|warm}`       — the Cl(4,2) polarity axis
 *   - `flow.{mahamayaGold|parashaktiEmerald}` — the DR ring streamlines
 *   - `privacy.{protected_local|protected_local_handle_only|shared_archetype_opt_in}`
 *     — the 25.18 privacy-class register (nara-remapped, per the 30.4 brief)
 *   - `readiness.id.{nine-id}` — the 30.6 per-id state-grammar colour
 *
 * Throws on an unknown id: a token that does not exist must not resolve to a
 * plausible colour, because a silently-wrong hue is invisible in review.
 */
export function resolveToken(tokenId: string, theme: CanonicalTheme, domainId: DomainId): string {
    const parts = tokenId.split('.');

    if (parts[0] === 'family' && parts.length === 3) {
        const letter = parts[1].toUpperCase() as FamilyLetter;
        const grade = Number(parts[2]) as ArchetypeGrade;
        const tier = FAMILY_PALETTE[letter];
        if (tier && Number.isInteger(grade) && grade >= 0 && grade <= 5) {
            return applyNaraBias(resolveHue(tier[grade], theme), `family.${parts[1].toLowerCase()}`, theme, domainId);
        }
    }

    if (parts[0] === 'signature' && parts.length === 2) {
        const hue = SIGNATURE_COLOURS[parts[1] as 'cool' | 'warm'];
        if (hue) {
            return resolveHue(hue, theme);
        }
    }

    if (parts[0] === 'flow' && parts.length === 2) {
        const hue = FLOW_COLOURS[parts[1] as 'mahamayaGold' | 'parashaktiEmerald'];
        if (hue) {
            return resolveHue(hue, theme);
        }
    }

    if (parts[0] === 'privacy' && parts.length === 2) {
        const hue = PRIVACY_COLOURS[parts[1] as keyof typeof PRIVACY_COLOURS];
        if (hue) {
            return applyNaraBias(resolveHue(hue, theme), 'privacy', theme, domainId);
        }
    }

    // `readiness.id.<nine-id>` (30.6). NOT nara-remapped: readiness is a
    // truth signal about the bridge, and a domain must not tint how broken
    // it looks.
    if (parts[0] === 'readiness' && parts[1] === 'id' && parts.length === 3) {
        const hue = READINESS_ID_COLOURS[parts[2] as BridgeReadinessId];
        if (hue) {
            return resolveHue(hue, theme);
        }
    }

    throw new Error(`unknown design token: ${tokenId}`);
}
