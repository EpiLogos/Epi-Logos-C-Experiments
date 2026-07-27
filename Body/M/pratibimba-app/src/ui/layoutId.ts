/**
 * Coordinate: M' shell (layout-id authority — Track 52.T1)
 * Residency: Body/M/pratibimba-app/src/ui/layoutId.ts
 * Position (#n): #4 — Context/Type: the type law of "which layout is active".
 * Actualises: the ONE declaration of the shell's layout domain. Canon fixes
 *   exactly two layouts inside one process — the `daily-0-1` lived preview and
 *   the `ide-deep` 4+2 depth layout ([[M5'-SPEC]] :91, :159; "the omni panel
 *   switches layouts inside one process; there is no second app"). Before this
 *   module the union was declared four times independently
 *   (`OmniPanelLayoutId`, `ActiveLayoutId`, `LeftSidebarLayoutId`,
 *   `CrossLayoutId`) and inlined at four more sites, with nothing keeping the
 *   seven-plus declarations equal. Track 52 adds a real deep layout on top of
 *   this domain; a builder who edits some-but-not-all sites ships a layout half
 *   the app does not believe in. So: one tuple, one type, one guard, and a
 *   sibling AST guard (`layoutId.test.ts`) that fails when the union is
 *   re-declared anywhere outside this module.
 * Public surface: LAYOUT_IDS, LayoutId, DEFAULT_LAYOUT_ID, isLayoutId,
 *   parseLayoutId.
 * Does NOT own: layout SELECTION or persistence (App.tsx holds `activeLayout`
 *   and the `epi-logos.layout.active` preference), the pane models, or any
 *   per-layout availability law — which modes (leftSidebarModes.ts), tabs
 *   (omnipanelRuntime.ts), claims (layoutClaims.ts) and slots
 *   (shellSlotPolicy.ts) appear in which layout stays with those modules. This
 *   module names the domain; it does not rule on what inhabits it.
 * Contract: [[M5'-SPEC]] :91 / :107 (DCC-07) / :159 · [[M'-SYSTEM-SPEC]] :168 ·
 *   rerun tranche [[52.T1]].
 */

/** The layout domain, in canon order: lived preview first, depth second. */
export const LAYOUT_IDS = ['daily-0-1', 'ide-deep'] as const;

/** The one layout-id type. Every other layout-id alias in the carrier resolves
 *  here — see the sibling guard test for the enforcement. */
export type LayoutId = (typeof LAYOUT_IDS)[number];

/** The 0/1 daily surface is the shell's ground state: an unset or unreadable
 *  persisted preference lands the user in the lived preview, never in depth. */
export const DEFAULT_LAYOUT_ID: LayoutId = 'daily-0-1';

export function isLayoutId(value: unknown): value is LayoutId {
    return typeof value === 'string' && (LAYOUT_IDS as readonly string[]).includes(value);
}

/**
 * Total parse of an untrusted layout value (a persisted preference, an intent
 * field, a bridge payload). Anything that is not a known layout id resolves to
 * `DEFAULT_LAYOUT_ID` — the daily fallback law this carrier has always had.
 */
export function parseLayoutId(value: unknown): LayoutId {
    return isLayoutId(value) ? value : DEFAULT_LAYOUT_ID;
}
