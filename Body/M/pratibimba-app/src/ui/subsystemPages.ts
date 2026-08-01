/**
 * Coordinate: M' shell (the six M0'-M5' subsystem pages — Track 52.T5)
 * Residency: Body/M/pratibimba-app/src/ui/subsystemPages.ts
 * Position (#n): #4 — Context/Type: the type law of what a subsystem page IS.
 * Actualises: the 4+2 body as a DECLARATION. [[M'-SYSTEM-SPEC]] :168 —
 *   "Subsystem pages M0-M5 are the 4+2 explicate development of the (0/1) —
 *   the six positions of the matheme made into full-depth workspaces. They are
 *   not 'below' the shells and not duplicates of the shells." Each page is a
 *   full-page workspace with room for inner 0-5 strata (:119); the strata each
 *   page gathers are declared HERE, one row per stratum, referencing the REAL
 *   depth-surface components the carrier already has. What is deliberately NOT
 *   gathered is the sibling ledger's law (`ui/subsystemWorkspaceOwnership.ts`).
 *
 *   MECHANISM (DR-SUBSYS-1): a subsystem page is a DYNAMIC deep-layout
 *   workspace tab — component id `m{n}SubsystemPage`, flexlayout node id
 *   `subsystem-page-m{n}` — opened by its `subsystem.open.m{n}` command into
 *   the active face's deep main tabset, never mounted by a default model. The
 *   default models therefore do not change (LAYOUT_VERSION untouched) and a
 *   page mounts only on an explicit user gesture, which is also what keeps THE
 *   OPENING-TAB LAW (`ui/deepPaneSet.ts`) satisfied: no page can seize shared
 *   state on a mount nobody asked for. SINGLE OCCUPANCY: at most ONE page tab
 *   lives in a face's deep model at a time — opening another page REPLACES it
 *   ("full-page experience", and the strip stays under the carrier's measured
 *   11-tab click-death limit; a page is one gesture away via Home/palette, so
 *   nothing is lost). MIRROR CAVEAT: a gathered stratum renders the SAME
 *   component its overview/daily mount renders, so a surface can be mounted
 *   twice at once (its overview tab + an open page stratum) — admissible
 *   because every gathered surface is a read-only observer of shared stores /
 *   gateway reads; a surface that WRITES on mount is not gatherable (`walk`
 *   is the bounded exception below).
 *
 *   INNER STRATA open on stratum 0 (Ground) — the page's identity, its strata
 *   index, and its honest list of named-unbuilt seams — and mount exactly one
 *   depth surface at a time on an explicit stratum choice. Position 0 opening
 *   is the QL reading (the ground opens the explication), and it is also the
 *   perf/hazard law: a page never mounts five instruments at once, and a
 *   surface with a mount-publication hazard (`walk`) mounts only from a click.
 * Public surface: SubsystemPageId, SubsystemStratum, SubsystemPageDefinition,
 *   SUBSYSTEM_PAGES, SUBSYSTEM_PAGE_IDS, subsystemPageNodeId,
 *   subsystemPageForSurfaceId, subsystemOpenCommandId.
 * Does NOT own: the workspace pane body (`panes/SubsystemWorkspacePane.tsx`),
 *   the per-scattered-tab disposition (`ui/subsystemWorkspaceOwnership.ts`),
 *   the open commands' registration (`commands/subsystem.ts` + `App.tsx`), the
 *   Home affordance (`panes/HomePane.tsx`), the deep overview pane set
 *   (`ui/deepPaneSet.ts`), or any gathered surface's body.
 * Contract: [[M'-SYSTEM-SPEC]] :105-140 / :168 / :176 · [[M'-PORTAL-SPEC]]
 *   :46-51 / :57 / :159 · [[M'-TAURI-PORT-SPEC]] :52 / :56-65 ("do not merge
 *   them") · [[M5'-SPEC]] :43-48 / :155-161 · [[CHROME-CONTRACT]] §2 ·
 *   [[DR-SUBSYS-1]] · rerun tranche [[52.T5]].
 */

/** The six subsystem pages, in matheme order. */
export type SubsystemPageId = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

export const SUBSYSTEM_PAGE_IDS: readonly SubsystemPageId[] = Object.freeze([
    'm0',
    'm1',
    'm2',
    'm3',
    'm4',
    'm5'
]);

/**
 * One inner stratum of a page. `surfaceId` names a [[CHROME-CONTRACT]] §2
 * surface whose component the workspace re-renders (a MIRROR — the surface's
 * original mounts are untouched; see the ownership ledger). Stratum 0 is
 * always the Ground panel and carries no surface.
 */
export interface SubsystemStratum {
    /** Inner QL position 0-5. Unique per page; gaps are honest room. The
     *  numbering is the PAGE'S OWN QL reading of its gathered set — it is NOT
     *  a claim about M{n}-{k}' sub-coordinate identity (the M5' sixfold IDE
     *  surface, for instance, lands as its own surfaces under its own
     *  tranches; see the m5 page's namedUnbuilt). */
    readonly stratum: 0 | 1 | 2 | 3 | 4 | 5;
    /** §2 surface id of the gathered depth surface; null for Ground. */
    readonly surfaceId: string | null;
    readonly label: string;
    /** Why this surface sits at this inner position. */
    readonly why: string;
    /** Declared when the surface publishes shared state from its MOUNT
     *  effect: the workspace restores to Ground instead of re-mounting this
     *  stratum after a shell remount, so the publish only ever happens on the
     *  user's own click. */
    readonly remountHazard?: boolean;
}

export interface SubsystemPageDefinition {
    readonly id: SubsystemPageId;
    /** The M' coordinate this page IS (display form). */
    readonly coordinate: string;
    /** §2 surface id = the flexlayout component key of the page itself. */
    readonly surfaceId: string;
    /** Tab label in the deep main tabset. */
    readonly tabLabel: string;
    readonly title: string;
    /** The portal-role essence, [[M'-PORTAL-SPEC]] :46-51 verbatim spirit. */
    readonly essence: string;
    /** Inner strata, ascending; stratum 0 (Ground) is always first. */
    readonly strata: readonly SubsystemStratum[];
    /** Canon-named parts of this page that have no built surface yet — named
     *  honestly on the Ground panel rather than faked. */
    readonly namedUnbuilt: readonly string[];
}

function ground(why: string): SubsystemStratum {
    return Object.freeze({ stratum: 0, surfaceId: null, label: 'Ground', why });
}

/**
 * The six pages. Strata reference surfaces by their §2 ids; the sibling test
 * holds every referenced id against the live registry, and the ownership
 * ledger holds the reverse direction (every scattered tab dispositioned).
 */
export const SUBSYSTEM_PAGES: readonly SubsystemPageDefinition[] = Object.freeze([
    Object.freeze({
        id: 'm0' as const,
        coordinate: "M0'",
        surfaceId: 'm0SubsystemPage',
        tabLabel: "M0' Map",
        title: 'Bimba Map',
        essence:
            'Structural Bimba map — coordinate ground, graph explorer, source traceability, map-to-action routing.',
        strata: Object.freeze([
            ground('The coordinate ground opens its own explication.'),
            Object.freeze({
                stratum: 1 as const,
                surfaceId: 'bimbaGraph',
                label: 'Graph Explorer',
                why: "The full-lattice Bimba explorer (28.T28.3 deep mode) — [[M'-SYSTEM-SPEC]] :119 'M0' is the full Bimba map explorer.'"
            }),
            Object.freeze({
                stratum: 2 as const,
                surfaceId: 'mocBases',
                label: 'MOC Bases',
                why: 'Evaluated MOC membership + canvas-linked Base views (48.T48.4): the canon-index read of the same ground.'
            })
        ]),
        namedUnbuilt: Object.freeze([
            "Source-traceability beyond the graph explorer's provenance panels has no dedicated surface; the coordinate tree rides the deep LEFT RAIL as chrome (28.T28.6), deliberately not duplicated here."
        ])
    }),
    Object.freeze({
        id: 'm1' as const,
        coordinate: "M1'",
        surfaceId: 'm1SubsystemPage',
        tabLabel: "M1' Traversal",
        title: 'Traversal & Topology',
        essence:
            'Relational/topological movement — pathing, torus/walk logic, relation inspection, coordinate traversal.',
        strata: Object.freeze([
            ground('The traversal ground: which instrument, which topology, which seed.'),
            Object.freeze({
                stratum: 1 as const,
                surfaceId: 'm1SurfaceComposed',
                label: 'M1 Surface',
                why: 'The composed 1-2-3 instrument (DR-WC-M1-1) — definition of the M1 surface itself.'
            }),
            Object.freeze({
                stratum: 2 as const,
                surfaceId: 'spandaNavigator',
                label: 'Spanda',
                why: 'The spanda walk navigator (22.T22.1) — traversal as operation.'
            }),
            Object.freeze({
                stratum: 3 as const,
                surfaceId: 'walk',
                label: 'Walk',
                why: 'Walk-as-melody over the coordinate store — the processual pattern. Mount-publication hazard (`WalkPane` seeds M1 on mount) is admissible ONLY here: a stratum mounts from an explicit click, never from layout entry or a shell remount.',
                remountHazard: true
            }),
            Object.freeze({
                stratum: 4 as const,
                surfaceId: 'kleinTopology',
                label: 'Klein',
                why: 'The Klein-bottle topology instrument (02.T2.3) — the context that folds inside and outside.'
            }),
            Object.freeze({
                stratum: 5 as const,
                surfaceId: 'm1PlayedTorus',
                label: 'Played Torus',
                why: 'The played-torus instrument — traversal integrated as performance.'
            })
        ]),
        namedUnbuilt: Object.freeze([
            "The standalone eight-slot M1' workbench stays where its gates put it — `m1SurfaceDeep` in `personal-deep-main` under DR-M1-FACE-LAYOUT-1 — and is deliberately not re-mounted here."
        ])
    }),
    Object.freeze({
        id: 'm2' as const,
        coordinate: "M2'",
        surfaceId: 'm2SubsystemPage',
        tabLabel: "M2' Matrix",
        title: 'Semantic Matrix',
        essence:
            'Symbolic/semantic matrix — MEF lenses, harmonic correspondences, semantic/astrological field relations.',
        strata: Object.freeze([
            ground('The matrix ground: what a correspondence IS before any lens.'),
            Object.freeze({
                stratum: 1 as const,
                surfaceId: 'm2Correspondence',
                label: 'Correspondence',
                why: 'The 72-fold correspondence tree over `s2.parashaktiCorrespondences` — the one M2 depth instrument the carrier has.'
            })
        ]),
        namedUnbuilt: Object.freeze([
            "The full-depth MEF lens inspection [[M'-PORTAL-SPEC]] :48 names has one landed instrument; the meaning-packet inspector is 51.T51.4's tranche."
        ])
    }),
    Object.freeze({
        id: 'm3' as const,
        coordinate: "M3'",
        surfaceId: 'm3SubsystemPage',
        tabLabel: "M3' Clock",
        title: 'Clock Cosmos',
        essence:
            'Integrated clock platform — solar-system/kairos clock, temporal visualisation, DNA/I-Ching transcription, cymatic rendering.',
        strata: Object.freeze([
            ground('The temporal ground: the tick, the wheel, the walkabout.'),
            Object.freeze({
                stratum: 1 as const,
                surfaceId: 'm3PentadicInspector',
                label: 'Pentadic',
                why: 'The pentadic inspector — the full wheel instrument (the daily mini-view previews it).'
            }),
            Object.freeze({
                stratum: 2 as const,
                surfaceId: 'm3Inspectors',
                label: 'Inspectors',
                why: 'The M3 inspectors area — I-Ching cast, walk navigator, third-spanda, hexagram browser, cosmic wheel render service (24.T24.1).'
            })
        ]),
        namedUnbuilt: Object.freeze([
            "The Cosmic Engine stays the SHELL-0 integrated preview per [[M'-SYSTEM-SPEC]] :130 — the page gathers the instruments it previews, not the preview. The co-foliated double-torus world-clock is 51.T51.5's tranche."
        ])
    }),
    Object.freeze({
        id: 'm4' as const,
        coordinate: "M4'",
        surfaceId: 'm4SubsystemPage',
        tabLabel: "M4' Nara",
        title: 'Nara Dashboard',
        essence:
            'Nara lived interface — journal/flow, daily note, dream journal, oracle, highlights, personal Pratibimba continuity.',
        strata: Object.freeze([
            ground('The lived ground: the day, the person, the return.'),
            Object.freeze({
                stratum: 1 as const,
                surfaceId: 'journalTimeline',
                label: 'Journal',
                why: "[[M'-TAURI-PORT-SPEC]] :62 'full Nara dashboard: Journal…' — mirrored here from the daily rail; the daily mount stays the lived home (the deep-OVERVIEW withdrawal in `ui/deepPaneSet.ts` governs the overview tabsets, not this page)."
            }),
            Object.freeze({
                stratum: 2 as const,
                surfaceId: 'dayCalendar',
                label: 'Days',
                why: 'The day-container calendar — the Daily Note half of the dashboard, mirrored from the daily rail.'
            }),
            Object.freeze({
                stratum: 3 as const,
                surfaceId: 'oracle',
                label: 'Oracle',
                why: 'The oracle cast surface, mirrored from the daily rail — the dashboard names it; the cast itself stays a day gesture.'
            }),
            Object.freeze({
                stratum: 4 as const,
                surfaceId: 'pratibimbaCoordinate',
                label: 'Personal Field',
                why: "Personal Pratibimba continuity — `ui/deepPaneSet.ts` :405 assigns exactly this: '52.T5 owns the M4' subsystem page that gives the recognition path its deep home.'"
            })
        ]),
        namedUnbuilt: Object.freeze([
            "Dream Journal is 51.T51.6's tranche; highlight management has no built surface.",
            'Medicine, Transform, Logos-cycle and the Arena keep their deep-overview homes in `personal-deep-main` — gathered by reference, not re-mounted.'
        ])
    }),
    Object.freeze({
        id: 'm5' as const,
        coordinate: "M5'",
        surfaceId: 'm5SubsystemPage',
        tabLabel: "M5' Epii",
        title: 'Epii IDE',
        essence:
            'Epii integrative interface — AI-agent-led developer/pedagogical IDE across canon, graph, code, agents, review, and Logos-cycle archaeology.',
        strata: Object.freeze([
            ground('The integral ground: what the carrier has landed of the Epii governance surface, and where the sixfold IDE studios live instead.'),
            Object.freeze({
                stratum: 1 as const,
                surfaceId: 'canonUpdateLedger',
                label: 'CU Ledger',
                why: 'Canon governance (40.T40.5) — the definitional stratum of the gathered governance set: what canon currently claims.'
            }),
            Object.freeze({
                stratum: 2 as const,
                surfaceId: 'm5Ebm',
                label: 'EBM',
                why: "The EBM observatory (26.T26.1) — M5 in its READ role: 'M5 does not talk. It scores.'"
            }),
            Object.freeze({
                stratum: 3 as const,
                surfaceId: 'autoresearch',
                label: 'Autoresearch',
                why: 'The S5 improvement-loop disclosure (28.T28.10) — the self-development process.'
            }),
            Object.freeze({
                stratum: 4 as const,
                surfaceId: 'agenticControlRoom',
                label: 'Control Room',
                why: 'The Agentic Control Room (28.T28.5) — the governance-primary deep surface, gathered in its contextual reading (its deep-overview mount stays the governance primary).'
            }),
            Object.freeze({
                stratum: 5 as const,
                surfaceId: 'piAxiomTranslation',
                label: 'Axiom',
                why: 'The DR-B-2 English→Formal→OWL→SHACL chain (26.T26.14) — canon-engineering as the synthesis position.'
            })
        ]),
        namedUnbuilt: Object.freeze([
            "The M5-n' sixfold IDE surface ([[M5'-SPEC]] :43-48) is NOT this page's strata numbering — these strata are the QL positions of the gathered governance set. The sixfold lands as its own surfaces under its own tranches: Backend Studio (M5-2') has its decided home in the deep LEFT RAIL (28.T28.13's reserved seam, `ui/deepPaneSet.ts`), Frontend Studio (M5-3') is 51.T51.2's decision, Library/Bimba-pedagogy (M5-0') and the Logos Atelier (M5-5') ride `bimbaGraph` as a lens (28.T28.7)."
        ])
    })
]);

/** The stable flexlayout NODE id of a page's tab (idempotent open). */
export function subsystemPageNodeId(id: SubsystemPageId): string {
    return `subsystem-page-${id}`;
}

/** The page whose own §2 surface id this is, or null. */
export function subsystemPageForSurfaceId(surfaceId: string): SubsystemPageDefinition | null {
    return SUBSYSTEM_PAGES.find(page => page.surfaceId === surfaceId) ?? null;
}

/** The registered command id that opens a page (`commands/subsystem.ts`). */
export function subsystemOpenCommandId(id: SubsystemPageId): string {
    return `subsystem.open.${id}`;
}
