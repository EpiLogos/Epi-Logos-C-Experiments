/**
 * Coordinate: M' shell (iconography system — Track 30.T30.9)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — Context/Type (the icon inventory IS the type law of the
 *   carrier's glyph surface: which glyphs exist, what each one means, and which
 *   surface is licensed to wear it)
 * Actualises: the ONE icon authority for the carrier — nineteen monoline glyphs
 *   in five categories (five left-sidebar modes · the 0/1 coin-flip chrome
 *   toggle · the lemniscate transition glyph · six Mn subsystem glyphs · six
 *   family-letter glyphs), each backed by a real SVG asset under
 *   `src/assets/icons/` resolved through Vite so a missing file fails the build
 *   rather than rendering an empty box. Every glyph is authored `currentColor`
 *   monoline on a 32×32 viewBox, so one asset serves 16 / 24 / 32 and inherits
 *   whatever colour its consumer already computed (family hue, ink, accent) —
 *   the "derivable to single-colour at any size" law of tranche 30.9.
 *
 *   The sidebar-mode bindings are DERIVED from `LEFT_SIDEBAR_MODES`, not
 *   hand-copied beside it, so a mode added or renamed there cannot silently
 *   drift out of the icon set — the `Record<LeftSidebarModeId, …>` map fails
 *   typecheck until the new mode names its glyph.
 *
 *   FALLBACK — Codicons is retired genealogy here. The frozen epi-theia contract
 *   named a Theia icon font for every non-custom surface; this carrier ships no
 *   icon font at all (zero `codicon` references in the tree), so declaring one
 *   would fabricate a dead dependency. Per DR-FACE-7 the honest carrier fallback
 *   is the one the shell already uses everywhere: the TEXT LABEL. Each icon
 *   carries the label that stands in when the glyph cannot paint, and each
 *   sidebar binding's fallback is its mode's own label — one string, not two.
 * Public surface: UiIconName, UiIconCategory, UiIconSize, UiIconDefinition,
 *   SidebarModeIconBinding, FamilyLetter, MnSubsystemId, UI_ICON_SET,
 *   UI_ICON_BY_NAME, UI_ICON_SIZES, UI_ICON_ASSET_DIR, SIDEBAR_MODE_ICON_BINDINGS,
 *   FAMILY_LETTER_ICON, MN_FAMILY_ICON, iconAssetUrl, familyLetterIcon,
 *   iconMaskStyle.
 * Does NOT own: the mode inventory (ui/leftSidebarModes.ts — this module reads
 *   it and must AGREE with it), the layout-id authority (ui/layoutId.ts, 52.T1),
 *   the family hues (ui/tokens.ts FAMILY_HUES), the personal 4-5-0 pole's
 *   reachables (commands/crossLayoutIntent — the other pole per DR-FACE-7, which
 *   30.9 does not glyph), the rendering of any activity rail (52.T6 wires it),
 *   or `src/assets/lemniscate-mask.svg` — that is the DR-UI-4 shader mask law
 *   (r² = a²·cos 2θ), a different asset from the `lemniscate` transition glyph.
 * Contract: rerun tranche [[30.T30.9]] + [[30-design-language-layer]] · carrier
 *   translation per [[DR-FACE-7]] (dead Theia nouns: "activity bar", Codicons).
 */

import type { CSSProperties } from 'react';

import { LEFT_SIDEBAR_MODES, type LeftSidebarModeId } from './leftSidebarModes';
import type { LayoutId } from './layoutId';

/** Where the glyph assets live, relative to `src/`. Named so tests and docs
 *  cite one string instead of re-spelling the path. */
export const UI_ICON_ASSET_DIR = 'assets/icons' as const;

export type UiIconCategory =
    | 'sidebar-mode'
    | 'chrome-toggle'
    | 'transition-primitive'
    | 'mn-family'
    | 'family-letter';

/** One asset serves all three: the glyphs are monoline on a 32×32 viewBox, so
 *  they stay legible when scaled down rather than needing per-size artwork. */
export type UiIconSize = 16 | 24 | 32;
export const UI_ICON_SIZES: readonly UiIconSize[] = Object.freeze([16, 24, 32]);

export type SidebarModeIconName =
    | 'coordinate-tree'
    | 'bimba-graph-viewer'
    | 'canon-studio'
    | 'backend-studio'
    | 'smart-connections';

export type MnFamilyIconName =
    | 'family-m0-anuttara'
    | 'family-m1-paramasiva'
    | 'family-m2-parashakti'
    | 'family-m3-mahamaya'
    | 'family-m4-nara'
    | 'family-m5-epii';

export type FamilyLetterIconName =
    | 'family-p'
    | 'family-s'
    | 'family-t'
    | 'family-m'
    | 'family-l'
    | 'family-c';

export type UiIconName =
    | SidebarModeIconName
    | 'coin-flip'
    | 'lemniscate'
    | MnFamilyIconName
    | FamilyLetterIconName;

export type UiIconId = `pratibimba.icon.${UiIconName}`;

export interface UiIconDefinition {
    readonly name: UiIconName;
    readonly id: UiIconId;
    readonly category: UiIconCategory;
    /** The text that stands in when the glyph cannot paint. This carrier ships
     *  no icon font, so the label IS the fallback (see header). */
    readonly label: string;
    readonly description: string;
    /** Path relative to `src/` — the real file, resolved through Vite by
     *  `iconAssetUrl`. */
    readonly assetPath: `${typeof UI_ICON_ASSET_DIR}/${UiIconName}.svg`;
}

function icon(
    name: UiIconName,
    category: UiIconCategory,
    label: string,
    description: string
): UiIconDefinition {
    return Object.freeze({
        name,
        id: `pratibimba.icon.${name}`,
        category,
        label,
        description,
        assetPath: `${UI_ICON_ASSET_DIR}/${name}.svg`
    });
}

/** The nineteen. Order is category order: the five modes, the two chrome
 *  glyphs, the six Mn subsystems, the six family letters. */
export const UI_ICON_SET: readonly UiIconDefinition[] = Object.freeze([
    icon(
        'coordinate-tree',
        'sidebar-mode',
        'Coordinate Tree',
        'Branching coordinate tree with marker nodes — the navigation backbone.'
    ),
    icon(
        'bimba-graph-viewer',
        'sidebar-mode',
        'Bimba Graph Viewer',
        'Graph, solar and tree renderings converging into one mode glyph.'
    ),
    icon(
        'canon-studio',
        'sidebar-mode',
        'Canon Studio',
        'Markdown text with a structured-marker glyph for canon editing.'
    ),
    icon(
        'backend-studio',
        'sidebar-mode',
        'Backend Studio',
        'Code brackets converging with a cog for substrate work.'
    ),
    icon(
        'smart-connections',
        'sidebar-mode',
        'Smart Connections',
        'Semantic links with a haloed relationship node.'
    ),
    icon(
        'coin-flip',
        'chrome-toggle',
        '0/1 Coin Flip',
        'Mid-flip toggle coin showing the 0 face and the 1 face in one fold.'
    ),
    icon(
        'lemniscate',
        'transition-primitive',
        'Lemniscate Transition',
        'Figure-eight transition glyph with the #4 cross-binding anchor visible.'
    ),
    icon('family-m0-anuttara', 'mn-family', 'M0 Anuttara', 'Void/recognition monoline glyph.'),
    icon('family-m1-paramasiva', 'mn-family', 'M1 Paramasiva', 'Spanda pulse monoline glyph.'),
    icon('family-m2-parashakti', 'mn-family', 'M2 Parashakti', 'Cymatic vibration monoline glyph.'),
    icon('family-m3-mahamaya', 'mn-family', 'M3 Mahamaya', 'Wheel/codon monoline glyph.'),
    icon('family-m4-nara', 'mn-family', 'M4 Nara', 'Vessel/personal monoline glyph.'),
    icon('family-m5-epii', 'mn-family', 'M5 Epii', 'Recursive atelier monoline glyph.'),
    icon('family-p', 'family-letter', 'P Family', 'Inline Position-family marker.'),
    icon('family-s', 'family-letter', 'S Family', 'Inline Stack-family marker.'),
    icon('family-t', 'family-letter', 'T Family', 'Inline Thought-family marker.'),
    icon('family-m', 'family-letter', 'M Family', 'Inline Subsystem-family marker.'),
    icon('family-l', 'family-letter', 'L Family', 'Inline Lens-family marker.'),
    icon('family-c', 'family-letter', 'C Family', 'Inline Category-family marker.')
]);

export const UI_ICON_BY_NAME: Readonly<Record<UiIconName, UiIconDefinition>> = Object.freeze(
    Object.fromEntries(UI_ICON_SET.map(entry => [entry.name, entry])) as Record<
        UiIconName,
        UiIconDefinition
    >
);

// ── Asset resolution ────────────────────────────────────────────────────────

/**
 * Vite resolves every glyph at build time. Eager + `?url` means the assets are
 * emitted into the bundle and the map is complete before first render — so a
 * deleted or misnamed SVG is a resolution failure the test catches, never a
 * silently empty box on a user's screen.
 */
const ICON_ASSET_URLS = import.meta.glob('../assets/icons/*.svg', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, string>;

/** The served URL for a glyph. Throws rather than returning a broken path: an
 *  icon that cannot resolve is a build defect, not a runtime degrade. */
export function iconAssetUrl(name: UiIconName): string {
    const url = ICON_ASSET_URLS[`../${UI_ICON_ASSET_DIR}/${name}.svg`];
    if (!url) {
        throw new Error(`icon asset missing: ${UI_ICON_ASSET_DIR}/${name}.svg`);
    }
    return url;
}

/**
 * The carrier paints glyphs as CSS masks over `currentColor` (the convention
 * `.face-toggle-icon` already uses), so a glyph inherits the colour its
 * consumer computed — the family hue on a coordinate string, ink in chrome —
 * instead of carrying a second, drifting palette of its own.
 */
export function iconMaskStyle(name: UiIconName, size?: UiIconSize): CSSProperties {
    const url = `url(${JSON.stringify(iconAssetUrl(name))})`;
    return {
        maskImage: url,
        WebkitMaskImage: url,
        ...(size === undefined ? {} : { width: `${size}px`, height: `${size}px` })
    } as CSSProperties;
}

// ── Bindings ────────────────────────────────────────────────────────────────

/**
 * Which glyph each left-sidebar mode wears. A `Record` over `LeftSidebarModeId`
 * rather than a parallel list: add a mode in `leftSidebarModes.ts` and this
 * fails typecheck until it names its glyph. Note `bimba-graph` (the mode) wears
 * `bimba-graph-viewer` (the glyph) — the frozen icon set and the carrier
 * registry disagree on that one name, and the map is where they reconcile.
 */
const SIDEBAR_MODE_ICON_NAMES: Readonly<Record<LeftSidebarModeId, SidebarModeIconName>> =
    Object.freeze({
        'coordinate-tree': 'coordinate-tree',
        'bimba-graph': 'bimba-graph-viewer',
        'canon-studio': 'canon-studio',
        'backend-studio': 'backend-studio',
        'smart-connections': 'smart-connections'
    });

export interface SidebarModeIconBinding {
    readonly modeId: LeftSidebarModeId;
    readonly iconName: SidebarModeIconName;
    readonly iconId: UiIconId;
    /** The mode's own label — the text fallback, carried once. */
    readonly fallbackLabel: string;
    /** Mirrors the mode's availability so a rail can render icons per layout
     *  without re-deriving it. */
    readonly availableInLayouts: readonly LayoutId[];
}

/** Derived from the mode registry, in its declared order. */
export const SIDEBAR_MODE_ICON_BINDINGS: readonly SidebarModeIconBinding[] = Object.freeze(
    LEFT_SIDEBAR_MODES.map(mode => {
        const iconName = SIDEBAR_MODE_ICON_NAMES[mode.id];
        return Object.freeze({
            modeId: mode.id,
            iconName,
            iconId: UI_ICON_BY_NAME[iconName].id,
            fallbackLabel: mode.label,
            availableInLayouts: mode.availableInLayouts
        });
    })
);

// ── Family glyphs ───────────────────────────────────────────────────────────

/** Upper-case, matching `FAMILY_HUES` in ui/tokens so a consumer keys both maps
 *  with one value. */
export type FamilyLetter = 'P' | 'S' | 'T' | 'M' | 'L' | 'C';

export const FAMILY_LETTER_ICON: Readonly<Record<FamilyLetter, FamilyLetterIconName>> =
    Object.freeze({
        P: 'family-p',
        S: 'family-s',
        T: 'family-t',
        M: 'family-m',
        L: 'family-l',
        C: 'family-c'
    });

/** The glyph for a coordinate's family letter, or null when the letter is not
 *  one of the six — an unknown family renders its text without a glyph rather
 *  than borrowing someone else's. */
export function familyLetterIcon(letter: string): FamilyLetterIconName | null {
    const upper = letter.toUpperCase();
    return isFamilyLetter(upper) ? FAMILY_LETTER_ICON[upper] : null;
}

export function isFamilyLetter(value: string): value is FamilyLetter {
    return Object.prototype.hasOwnProperty.call(FAMILY_LETTER_ICON, value);
}

export type MnSubsystemId = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export const MN_FAMILY_ICON: Readonly<Record<MnSubsystemId, MnFamilyIconName>> = Object.freeze({
    M0: 'family-m0-anuttara',
    M1: 'family-m1-paramasiva',
    M2: 'family-m2-parashakti',
    M3: 'family-m3-mahamaya',
    M4: 'family-m4-nara',
    M5: 'family-m5-epii'
});
