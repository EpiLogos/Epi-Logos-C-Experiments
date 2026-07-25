/**
 * Coordinate: M' shell-0 (JS-side carrier token source — Track 30)
 * Residency: Body/M/pratibimba-app/src/ui/tokens.ts
 * Actualises: the named-token source for colour values consumed from JS —
 *   canvas 2D (ClockWheel/CodonWheel), Three.js (CosmicEngine), and
 *   force-graph (GraphExplorerPane) — where CSS custom properties cannot
 *   reach. Track-30 law: raw hex / font-size px / ms literals live ONLY in
 *   the token sources (src/styles.css for CSS, this file for JS); every
 *   other src file imports a named token. These tokens NAME the current
 *   values — the palette itself stays an OPEN Architect decision
 *   (DR-WC-DL-1); changing a value here is a design decision, not a refactor.
 * Public surface: inkBright, inkDim, ringLit, accent, accentShadow,
 *   wheelUnlit, FAMILY_HUES, ATELIER_CLUSTER_HUES.
 * Does NOT own: the CSS custom-property vocabulary (src/styles.css); the
 *   kernel element scene colours (numeric ELEMENT_COLOURS in
 *   engine/cosmicMath.ts — kernel M2 identity, not a UI token). Values
 *   marked "duplicates" below also exist in styles.css; cross-language
 *   dedupe is a later Track-30 step, never silent.
 */

// ── Ink — text/glyph tones ──────────────────────────────────────────────────
/** Bright ink: wheel centre numerals. Duplicates styles.css `--ink`. */
export const inkBright = '#e8e2f4';
/** Dim ink: secondary glyphs, unknown-element/unknown-family fallback.
 *  Duplicates styles.css `--ink-dim`. */
export const inkDim = '#9a8fb8';

// ── Accents ─────────────────────────────────────────────────────────────────
/** Ring accent: the lit tick / lit codon / selected graph node.
 *  Duplicates styles.css `--ring`. */
export const ringLit = '#ebdca0';
/** Primary accent: degree720 first-cover arc, torus shell (uShell).
 *  Duplicates styles.css `--accent`. */
export const accent = '#7f6ab8';
/** Shadow-lap accent: ClockWheel inner 360–720° double-cover arc (JS-only). */
export const accentShadow = '#4d3e78';
/** Unlit wheel position; same tone styles.css uses for hairline borders. */
export const wheelUnlit = '#2e2247';

// ── Tritone squares — M5' EBM observatory (26.T26.1, UX §4.2) ───────────────
/** Klein V₄ Square A `[0+5]` Speech-Number — indigo (== CL42 implicate). */
export const tritoneSquareA = '#4b0082';
/** Klein V₄ Square B `[1+4]` Cause-Experience — amber. */
export const tritoneSquareB = '#e0b45f';
/** Klein V₄ Square C `[2+3]` Logic-Process — emerald. */
export const tritoneSquareC = '#3fa66f';

// ── Cymatic plate — M2' Chladni active-cell overlay (23.T23.4) ──────────────
/** Cymatic 72-cell active-address stroke (gold), Klein-normal valence. */
export const cymaticActiveCell = '#f1d06f';
/** Cymatic active-address stroke under Klein flip (white). */
export const cymaticActiveCellFlip = '#ffffff';

// ── Family hues — graph surfaces ────────────────────────────────────────────
/** Coordinate-family hues for graph nodes (THEIA-UI-PATTERNS §1.3 discipline;
 *  the palette is an OPEN Architect decision, DR-WC-DL-1 — named as-is). */
export const FAMILY_HUES: Record<string, string> = {
    P: '#67d4d1', // Position — teal
    S: '#9a7fd4', // Stack — violet
    T: '#5fbf9f', // Thought — green
    M: '#e0b45f', // Subsystem — gold
    L: '#d48a9a', // Lens — rose
    C: '#8fd49a' // Category — mint
};

/** Etymological-cluster hues for the graph atelier overlay. */
export const ATELIER_CLUSTER_HUES = ['#c784ff', '#4dc5c1', '#f0ae55', '#ef7391'] as const;

// ── Coordinate-derived chromatic system (30.T30.2) ──────────────────────────
// Every hue below derives from a coordinate-system concept, never decoration:
//   family-letter (P/S/T/M/L/C) → palette TIER; #0–#5 raw archetype → GRADE.
// Per-token {light,dark} are the two theme resolutions (full 7-theme mapping is
// Tranche 30.4; the derivation prose is Tranche 30.8). DR-WC-DL-1 RATIFIED
// 2026-07-23 (the Architect): the M-tier grades ARE the canonical subsystem
// colour-worlds (M0 achromatic/rainbow-ground · M1 deep-blue+gold · M2 red+pink
// · M3 yellow/brown/orange · M4 deep-green+teal · M5 purple+pink); the non-M
// tiers keep the spec-derivation tier scheme (P foundation-neutral, S
// substrate-slate, T thought-parchment, L epistemic-mist, C ontological-violet
// with C0/C5 at the cool Cl(4,2)-signature −1 endpoints per Möbius return).

export type FamilyLetter = 'P' | 'S' | 'T' | 'M' | 'L' | 'C';
export type ArchetypeGrade = 0 | 1 | 2 | 3 | 4 | 5;
export interface ThemedHue {
    readonly light: string;
    readonly dark: string;
}

/** 36-token family-tier × archetype-grade matrix (DR-WC-DL-1). */
export const FAMILY_PALETTE: Record<FamilyLetter, readonly ThemedHue[]> = {
    // P — Position (functional semantics): foundation-neutral grey; grade 5
    // takes a subtle warmth per the Möbius-return polarity (#5 → #0).
    P: [
        { light: '#aaa6b6', dark: '#363543' },
        { light: '#948fa3', dark: '#474555' },
        { light: '#7e7990', dark: '#59566a' },
        { light: '#67637c', dark: '#6d6a82' },
        { light: '#524e66', dark: '#837f99' },
        { light: '#453f54', dark: '#9c96b2' }
    ],
    // S — Stack (technology layers): substrate-slate, a cool grey-blue ramp.
    S: [
        { light: '#9aa4b8', dark: '#333b4a' },
        { light: '#838fa8', dark: '#434d60' },
        { light: '#6d7a96', dark: '#556076' },
        { light: '#586686', dark: '#6b788f' },
        { light: '#45536f', dark: '#8593ab' },
        { light: '#384663', dark: '#9fadc6' }
    ],
    // T — Thought (artifacts/cognition): thought-parchment, a warm cream ramp.
    T: [
        { light: '#b3a889', dark: '#47412f' },
        { light: '#a2966f', dark: '#574f38' },
        { light: '#8f8257', dark: '#6a6045' },
        { light: '#786a44', dark: '#8a7d5a' },
        { light: '#635735', dark: '#c0b085' },
        { light: '#4f4526', dark: '#dccaa0' }
    ],
    // M — Subsystem (consciousness domains): the canonical M0–M5 colour-worlds
    // (DR-WC-DL-1, the Architect). The GRADE is the subsystem identity, not a
    // saturation ramp — each M-archetype is its own world.
    M: [
        { light: '#33313d', dark: '#cfccda' }, // M0 Anuttara — achromatic ground (black/white/rainbow)
        { light: '#2e4680', dark: '#7f99d6' }, // M1 Paramasiva — deep blue (+gold accent)
        { light: '#bb3a52', dark: '#e88198' }, // M2 Parashakti — red/pink
        { light: '#a9761f', dark: '#e0b062' }, // M3 Mahamaya — yellow/brown/orange (gold-mid)
        { light: '#1f7a63', dark: '#5cc0a2' }, // M4 Nara — deep green/teal
        { light: '#7a44a8', dark: '#b98ad9' } // M5 Epii — purple (+pink accent)
    ],
    // L — Lens (epistemic modes): epistemic-mist, a cool faded-blue ramp
    // (lower saturation than S — the lens is a veil, not the substrate).
    L: [
        { light: '#a3adbd', dark: '#3d4552' },
        { light: '#8f9bad', dark: '#4d5766' },
        { light: '#7b889d', dark: '#616c7e' },
        { light: '#67748c', dark: '#7d8799' },
        { light: '#54617a', dark: '#949fb4' },
        { light: '#45526b', dark: '#aab4c8' }
    ],
    // C — Category (ontological foundation): ontological-deep-violet. C0 (Bimba)
    // and C5 (Pratibimba) sit at the cool violet endpoints sharing Cl(4,2)
    // signature −1 polarity; C1–C4 grade through warmer magenta-ward violet.
    C: [
        { light: '#5a3a8c', dark: '#b89ae2' },
        { light: '#6a3a8a', dark: '#c39ae0' },
        { light: '#7a3785', dark: '#cd97dd' },
        { light: '#85357e', dark: '#d492d6' },
        { light: '#7c3480', dark: '#cd8fd8' },
        { light: '#5f2e80', dark: '#c188dd' }
    ]
};

/** Cl(4,2) signature polarity binary (15.8): the chromatic axis of the matheme
 *  `0/1`. −1 (P0/P5, sin/cos) = cool-indigo; +1 (P1–P4) = warm-amber. Light and
 *  dark preserve polarity (cool stays cool, warm stays warm across inversion). */
export const SIGNATURE_COLOURS: Record<'cool' | 'warm', ThemedHue> = {
    cool: { light: '#5a73a8', dark: '#8a9bbd' },
    warm: { light: '#d4a14a', dark: '#e0b366' }
};

/** DR-ring flow streamlines (m1.c:122): DR_RING_MAHAMAYA ascending = gold;
 *  DR_RING_PARASHAKTI descending = emerald. The `4+2` motion-grammar carrier. */
export const FLOW_COLOURS: Record<'mahamayaGold' | 'parashaktiEmerald', ThemedHue> = {
    mahamayaGold: { light: '#d4a574', dark: '#e0b67e' },
    parashaktiEmerald: { light: '#4a8b6f', dark: '#5fa886' }
};

// ── Nara-domain warm bias (30.T30.4) ────────────────────────────────────────
// The 30.4 nara-domain remap: under a `nara-*` theme on the M4 domain, M-tier
// and privacy-class tokens "tune slightly warmer (earth-toned bias) per UX
// intent". That is a BOUNDED LEAN toward the earth anchor, never a second
// palette — DR-WC-DL-1's ratified M0–M5 colour-worlds stay the base, and the
// remap is a derivation off them (see ui/themeMapping.ts `mixHex`).

/** Earth anchor for the nara warm bias. The same hue the 30.2 derivation gives
 *  `colour.element.earth` / `psyche-facet.psyche` / `privacy.protected_local` —
 *  the nara domain leans toward its own earth tone, not an invented one. */
export const NARA_EARTH_ANCHOR = '#8a7355';

/** How far a remapped hue leans toward {@link NARA_EARTH_ANCHOR}: "slightly"
 *  named as a value (Track-30 law — the magnitude is a design decision, so it
 *  lives in the token source where a change to it is visible as such). Small
 *  enough that every M-tier subsystem stays recognisably itself. */
export const NARA_WARM_BIAS = 0.18;

/** Resolve one family-tier × archetype-grade token. */
export function familyGrade(family: FamilyLetter, grade: ArchetypeGrade): ThemedHue {
    return FAMILY_PALETTE[family][grade];
}

/** Derive the family-tier × archetype-grade tint for a Bimba coordinate string
 *  (e.g. `M3-2` → M-tier, archetype-3 = Mahamaya gold/orange). The family letter
 *  is the tier; the first #0–#5 after it is the grade; deeper branches do not
 *  change the tier tint. Returns null for a coordinate outside the six families
 *  (e.g. a bare `#4` raw archetype or a reflective `cpf`). */
export function coordinateFamilyGrade(
    coordinate: string
): { readonly family: FamilyLetter; readonly grade: ArchetypeGrade; readonly hue: ThemedHue } | null {
    const match = /^([PSTMLC])([0-5])/i.exec(coordinate.trim());
    if (!match) {
        return null;
    }
    const family = match[1].toUpperCase() as FamilyLetter;
    const grade = Number(match[2]) as ArchetypeGrade;
    return { family, grade, hue: FAMILY_PALETTE[family][grade] };
}
