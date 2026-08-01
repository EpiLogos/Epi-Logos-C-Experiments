/**
 * Coordinate: M' M5-3' (subsystem-workspace disposition ledger — rerun 52.T5)
 * Residency: Body/M/pratibimba-app/src/ui/subsystemWorkspaceOwnership.ts
 * Position (#n): 4+2 body carrier ownership over the scattered depth tabs.
 * Actualises: an exhaustive disposition for EVERY depth tab the two daily face
 *   models scatter (plus the dynamic editor tab and the deep-only surface):
 *   gathered into its subsystem page's strata, or an explicit stays-* verdict
 *   with the reason. 52.T5's acceptance is total accounting — "an unaccounted
 *   tab is a FAIL, not an omission" — and the sibling test derives the
 *   inventory from the REAL registries (App.tsx component literals via AST +
 *   `DEEP_PANE_SET`), so a new tab cannot quietly go unclassified. The
 *   precedent is `ui/dailySurfaceOwnership.ts`, applied to the 4+2 axis.
 *
 *   NOTHING MOVES (DR-SUBSYS-2). The tranche vocabulary is
 *   moves/mirrored/stays; this ledger records ZERO moves. A gathered surface
 *   is MIRRORED — its component renders inside the workspace while every
 *   original mount stays exactly where it was — because (a) the daily strip is
 *   the lived preview law ([[M'-TAURI-PORT-SPEC]] :65 "do not merge them"
 *   cuts both ways: depth gains a home, the preview does not lose one), (b)
 *   the deep-pane-set e2e pins byte-identical daily return, and (c) removing
 *   daily tabs is a daily-slimming decision no canon line forces on this
 *   tranche. Recorded as declined, not silently skipped.
 * Public surface: WorkspaceDisposition, DepthTabDisposition,
 *   SUBSYSTEM_WORKSPACE_OWNERSHIP, workspaceDispositionFor,
 *   gatheredDispositions.
 * Does NOT own: the strata declarations (`ui/subsystemPages.ts` — the ledger
 *   points INTO them and the test holds both sides equal), the deep overview
 *   pane set or its withdrawals (`ui/deepPaneSet.ts`), pane bodies, or the
 *   daily models.
 * Contract: [[M'-SYSTEM-SPEC]] :130 / :168 · [[M'-TAURI-PORT-SPEC]] :65 ·
 *   [[CHROME-CONTRACT]] §2 · [[DR-SUBSYS-2]] · rerun tranche [[52.T5]].
 */

import type { SubsystemPageId } from './subsystemPages';

/**
 * The verdict vocabulary. `gathered` = mirrored into a subsystem page stratum
 * (the only gathering mode — no surface moves, DR-SUBSYS-2). Every stays-*
 * names the home that keeps the surface instead:
 *   - `stays-shell-preview`  — an integrated parent-shell preview
 *                              ([[M'-SYSTEM-SPEC]] :130); pages gather the
 *                              instruments it previews, never the preview.
 *   - `stays-daily-lived`    — a daily lived-flow reading surface the deep
 *                              layer deliberately does not carry.
 *   - `stays-deep-overview`  — a depth surface whose deep home is the T4
 *                              overview tabset (`ui/deepPaneSet.ts`); the page
 *                              references it rather than re-mounting it.
 *   - `stays-chrome`         — IDE chrome (rails, editor); a workspace is not
 *                              its chrome.
 *   - `stays-config`         — a configuration surface, layout-invariant.
 */
export type WorkspaceDisposition =
    | 'gathered'
    | 'stays-shell-preview'
    | 'stays-daily-lived'
    | 'stays-deep-overview'
    | 'stays-chrome'
    | 'stays-config';

export interface DepthTabDisposition {
    /** [[CHROME-CONTRACT]] §2 surface id (flexlayout component key). */
    readonly surfaceId: string;
    /** The subsystem this surface belongs to, or the shell/config attribution. */
    readonly subsystem: SubsystemPageId | 'shell' | 'chrome' | 'config';
    readonly disposition: WorkspaceDisposition;
    /** The page + inner stratum a `gathered` surface mirrors into; null
     *  otherwise. The test holds this against `SUBSYSTEM_PAGES` exactly. */
    readonly workspace: { readonly page: SubsystemPageId; readonly stratum: number } | null;
    readonly evidence: string;
}

function gathered(
    surfaceId: string,
    page: SubsystemPageId,
    stratum: number,
    evidence: string
): DepthTabDisposition {
    return Object.freeze({
        surfaceId,
        subsystem: page,
        disposition: 'gathered' as const,
        workspace: Object.freeze({ page, stratum }),
        evidence
    });
}

function stays(
    surfaceId: string,
    subsystem: DepthTabDisposition['subsystem'],
    disposition: Exclude<WorkspaceDisposition, 'gathered'>,
    evidence: string
): DepthTabDisposition {
    return Object.freeze({ surfaceId, subsystem, disposition, workspace: null, evidence });
}

/**
 * The ledger. One row per scattered tab; sorted by verdict, then page.
 */
export const SUBSYSTEM_WORKSPACE_OWNERSHIP: readonly DepthTabDisposition[] = Object.freeze([
    // ── gathered: mirrored into a subsystem page stratum ───────────────────
    gathered('bimbaGraph', 'm0', 1, "The full-lattice explorer IS the M0' page's primary instrument (28.T28.3 deep mode); its daily solar-anchor preview and deep-overview mounts stay."),
    gathered('mocBases', 'm0', 2, 'Canon-index Bases read of the same coordinate ground (48.T48.4); cosmic-main and deep-overview mounts stay.'),
    gathered('m1SurfaceComposed', 'm1', 1, 'The composed 1-2-3 instrument (DR-WC-M1-1) as the M1 definition stratum; composed mode is layout-invariant per §2.'),
    gathered('spandaNavigator', 'm1', 2, "Spanda navigator (22.T22.1) — M1' operation stratum."),
    gathered('walk', 'm1', 3, 'Walk-as-melody — mount-publication hazard admissible only behind an explicit stratum click (see `ui/subsystemPages.ts`).'),
    gathered('kleinTopology', 'm1', 4, "Klein topology instrument (02.T2.3) — M1' context stratum."),
    gathered('m1PlayedTorus', 'm1', 5, "The played-torus instrument — traversal integrated as performance, the M1' synthesis stratum."),
    gathered('m2Correspondence', 'm2', 1, "The 72-fold correspondence tree — the one landed M2' depth instrument."),
    gathered('m3PentadicInspector', 'm3', 1, 'The full pentadic wheel (the daily mini-view previews it).'),
    gathered('m3Inspectors', 'm3', 2, 'The M3 inspectors area (24.T24.1) — cast, hexagrams, third spanda, wheel service.'),
    gathered('journalTimeline', 'm4', 1, "Canon names Journal in the M4' dashboard ([[M'-TAURI-PORT-SPEC]] :62). Mirrored; the daily-rail mount stays the lived home, and the deep-OVERVIEW withdrawal (`ui/deepPaneSet.ts`) governs the overview tabsets, not this page."),
    gathered('dayCalendar', 'm4', 2, 'The Daily Note half of the dashboard — same mirror law as the journal.'),
    gathered('oracle', 'm4', 3, 'Canon names Oracle in the dashboard; the cast itself remains a day gesture on the daily rail.'),
    gathered('pratibimbaCoordinate', 'm4', 4, "Assigned by name: `ui/deepPaneSet.ts` :405 — '52.T5 owns the M4' subsystem page that gives the recognition path its deep home.'"),
    gathered('canonUpdateLedger', 'm5', 1, "Canon governance (40.T40.5) at the M5-1' canon-studio position; deep-overview opening tab stays."),
    gathered('m5Ebm', 'm5', 2, 'The EBM observatory (26.T26.1) — M5 READ role.'),
    gathered('autoresearch', 'm5', 3, 'The improvement-loop disclosure (28.T28.10).'),
    gathered('agenticControlRoom', 'm5', 4, "Canon's M5-4' position (28.T28.5, DR-WC-IS-1); its deep-overview mount stays the governance primary."),
    gathered('piAxiomTranslation', 'm5', 5, 'The DR-B-2 axiom-translation chain (26.T26.14) as canon-engineering synthesis.'),

    // ── stays: integrated shell previews ([[M'-SYSTEM-SPEC]] :130) ─────────
    stays('cosmic', 'shell', 'stays-shell-preview', "Shell 0 is the integrated M1'-M3' cymatic-clock PREVIEW — the M3' page gathers the instruments it previews, never the preview itself."),
    stays('personalHome', 'shell', 'stays-shell-preview', "Shell 1 is the integrated lived-return preview — and 52.T5 makes it the HOME affordance: the 0/1 view with the #0-#5 subsystems-grid toggle (`panes/HomePane.tsx`)."),

    // ── stays: daily lived-flow reading surfaces ───────────────────────────
    stays('sessionCloseCeremony', 'm4', 'stays-daily-lived', 'A read-only Möbius-turn ceremony over the day just closed (25.T25.19) — lived flow; canon does not name it in the M4-dashboard list.'),
    stays('psycheAnchorCoherence', 'm4', 'stays-daily-lived', 'The tarot psyche-anchor read of the same close (25.T25.20) — same law as the ceremony it sits beside.'),

    // ── stays: depth surfaces whose deep home is the T4 overview ───────────
    stays('m1SurfaceDeep', 'm1', 'stays-deep-overview', "The standalone eight-slot workbench opens only where DR-M1-FACE-LAYOUT-1's two gates put it (`personal-deep-main`); re-mounting it here would bypass the face gate and re-trip the mount-publication hazard."),
    stays('m4DialogicalArena', 'm4', 'stays-deep-overview', "The CPF-gated arena (41.T41.7) keeps its deep-overview home; the M4' page gathers the canon-named dashboard surfaces instead."),
    stays('medicineView', 'm4', 'stays-deep-overview', 'The medicine instrument (25.T25.10) keeps its deep-overview home.'),
    stays('transformContainers', 'm4', 'stays-deep-overview', 'The governed transform lifecycle (25.T25.11) keeps its deep-overview home.'),
    stays('logosCycle', 'm4', 'stays-deep-overview', 'The six-stage Logos cycle (25.T25.13) keeps its deep-overview home.'),

    // ── stays: IDE chrome and config ───────────────────────────────────────
    stays('fileTree', 'chrome', 'stays-chrome', 'The explorer rail — workspace chrome in both layouts, never a page stratum.'),
    stays('semanticConnections', 'chrome', 'stays-chrome', "The connections rail (28.T28.12); 52.T6 owns its mode-registry contradiction."),
    stays('coordinateTree', 'chrome', 'stays-chrome', "The M0' navigation backbone rides the daily face-1 rail AND both deep left rails (28.T28.6) — chrome by declaration, deliberately not duplicated as an M0' stratum."),
    stays('editor', 'chrome', 'stays-chrome', 'Canon Studio editor tabs are dynamic (`vault.open`) and dock into whichever layout the user is in (52.T4) — a chrome mechanism, not a subsystem stratum.'),
    stays('kairosEnablement', 'config', 'stays-config', 'FR-3 configuration surface (32.T32.10), deliberately reachable in both layouts; configuration is not depth.')
]);

/** The row for a surface id, or null (the test forbids null for real tabs). */
export function workspaceDispositionFor(surfaceId: string): DepthTabDisposition | null {
    return SUBSYSTEM_WORKSPACE_OWNERSHIP.find(row => row.surfaceId === surfaceId) ?? null;
}

/** All gathered rows for one page, in stratum order. */
export function gatheredDispositions(page: SubsystemPageId): readonly DepthTabDisposition[] {
    return SUBSYSTEM_WORKSPACE_OWNERSHIP.filter(
        row => row.disposition === 'gathered' && row.workspace?.page === page
    ).sort((a, b) => (a.workspace?.stratum ?? 0) - (b.workspace?.stratum ?? 0));
}
