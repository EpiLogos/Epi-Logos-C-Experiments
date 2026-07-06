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
 *   wheelUnlit, FAMILY_HUES.
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
