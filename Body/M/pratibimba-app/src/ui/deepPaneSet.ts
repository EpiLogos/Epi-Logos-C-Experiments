/**
 * Coordinate: M' shell (the deep 4+2 pane set — Track 52.T4)
 * Residency: Body/M/pratibimba-app/src/ui/deepPaneSet.ts
 * Position (#n): #4 — Context/Type: the type law of what the deep layout IS.
 * Actualises: the composition of the `ide-deep` layout as a DECLARATION rather
 *   than as layout JSON buried in the shell. [[M5'-SPEC]] :91 names the deep
 *   layout "the full 4+2 surface with M0/M5 IDE chrome, six M-extensions, two
 *   integrated plugins, agentic control room"; before 52.T4 selecting it had
 *   exactly one runtime effect — three face-0 daily widgets were withdrawn.
 *
 *   THREE LISTS, AND THE PARTITION IS TOTAL. `DEEP_PANE_SET` is what the deep
 *   layout mounts, `DEEP_PANE_WITHDRAWALS` is every daily surface it
 *   deliberately does NOT carry (with the reason), and `DEEP_PANE_RESERVATIONS`
 *   is the named seam each doc-ahead `pending` surface lands in. The sibling
 *   validator (`deepPaneSet.test.ts`) holds all three against
 *   [[CHROME-CONTRACT]] §2 and against the real `App.tsx` registry: a mount
 *   whose row is not `live` fails, a reservation that appears in the model
 *   fails, and a daily surface that is neither carried nor withdrawn fails. The
 *   precedent is `ui/dailySurfaceOwnership.ts` — an exhaustive disposition, not
 *   a hand-wave.
 *
 *   THE WITHDRAWAL LAW is canon's, not convenience: [[M'-TAURI-PORT-SPEC]] :65
 *   — "The parent shell is the minimal 0/1 surface... Shell surfaces preview;
 *   subsystem pages deliver depth. **Do not merge them.**" So the two
 *   integrated shell PREVIEWS (`cosmic` on 0, `personalHome` on 1) and the
 *   daily lived-flow reading surfaces stay in the daily layout; the deep layout
 *   carries depth and gains the IDE explorer rail canon calls M0/M5 chrome.
 *
 *   PER-FACE, per [[DR-DEEP-LAYOUT-1]]: there are TWO deep models, one per
 *   face, because face (`#` inversion) and layout (`.` nesting) are orthogonal
 *   axes at every explication level.
 * Public surface: DeepPaneModelId, DeepPaneScope, DeepPaneSlot, DeepPaneMount,
 *   DeepPaneReservation, DeepPaneWithdrawal, DEEP_PANE_SET,
 *   DEEP_PANE_RESERVATIONS, DEEP_PANE_WITHDRAWALS, deepPaneMounts,
 *   deepMainTabsetId, deepLayoutJson.
 * Does NOT own: the pane bodies (their tranches), the daily models or the
 *   factory (`App.tsx`), the `/` membrane's tab manifest
 *   (`panes/omni/omnipanelRuntime.ts` — the omni border is passed in, never
 *   rebuilt here), the activity-bar mode registry (`ui/leftSidebarModes.ts`,
 *   52.T6 wires it), or the six subsystem pages (52.T5).
 * Contract: [[CHROME-CONTRACT]] §2 + §5 + §9 · [[M5'-SPEC]] :91 / :107
 *   (DCC-07) / :161 · [[M'-SYSTEM-SPEC]] :168 · [[DR-DEEP-LAYOUT-1]] ·
 *   rerun tranche [[52.T4]].
 */

/** The two deep models — one per face. Face 0 is cosmic, face 1 is personal. */
export type DeepPaneModelId = 'cosmic' | 'personal';

/** Which deep model(s) a declaration belongs to. */
export type DeepPaneScope = DeepPaneModelId | 'both';

/**
 * The deep layout's inhabited slots. `right` is the `/` membrane (owned by the
 * OmniPanel and layout-invariant — all ten folds inhabit both layouts), `top`
 * and `status-bar` are shell chrome, and no carrier layout composes `bottom`.
 * So the deep layout's own composition is exactly these two — see
 * `ui/shellSlotPolicy.ts`, which 52.T4 reconciled against this fact.
 */
export type DeepPaneSlot = 'left' | 'main';

/**
 * One link of a MOUNT-PUBLICATION chain, anchored by content rather than by
 * line. A surface that writes a shared singleton from a mount effect is a fact
 * about a body, not an opinion, so the declaration names the substrings the
 * validator reads back out of the real source. If the body is fixed, the anchor
 * stops matching and the validator tells you to drop the flag — the declaration
 * cannot outlive the behaviour it describes.
 */
export interface MountPublicationStep {
    /** Path relative to `src/`. */
    readonly file: string;
    /** A substring that must appear in that file. */
    readonly anchor: string;
}

export interface DeepPaneMount {
    /** The [[CHROME-CONTRACT]] §2 surface id = the flexlayout component key. */
    readonly surfaceId: string;
    /** The tab label. Carried-over surfaces keep their daily label: the deep
     *  layout changes the COMPOSITION, not the name of a surface. */
    readonly label: string;
    readonly slot: DeepPaneSlot;
    readonly model: DeepPaneScope;
    /** Why this surface is depth rather than preview. */
    readonly why: string;
    /**
     * Declared when this surface writes SHARED SINGLETON state from a mount
     * effect — see THE OPENING-TAB LAW below. The chain is the route from the
     * factory-rendered body to the write. A mount carrying this may not be the
     * first entry of its (model, slot): the validator fails closed on it.
     */
    readonly mountPublishes?: {
        readonly store: string;
        readonly chain: readonly MountPublicationStep[];
    };
}

export interface DeepPaneReservation {
    readonly surfaceId: string;
    readonly slot: DeepPaneSlot;
    readonly model: DeepPaneScope;
    /** The rerun tranche that lands the body AND flips the §2 row. */
    readonly owner: string;
    /** The §2 status the row must still carry while the seam is reserved. */
    readonly contractStatus: 'pending' | 'code-pending';
    readonly why: string;
}

export interface DeepPaneWithdrawal {
    readonly surfaceId: string;
    readonly why: string;
}

/**
 * What the deep layout mounts. Declaration order IS tab order, and the first
 * entry of each (model, slot) is the tab the layout opens on.
 *
 * Face 0 (`cosmic`) carries the structural/instrument depth — [[M5'-SPEC]] :161
 * "Shell 0 previews the integrated structural instrument from M1' through M3'…
 * The 4+2 subsystem pages deliver the depth: M0' through M3' for
 * structural/instrument work". Face 1 (`personal`) carries the lived and
 * governance depth — ":161 …M4' for Nara, and M5' for the Epii IDE".
 *
 * THE OPENING-TAB LAW (found the hard way, 52.T4). BOTH faces' models render on
 * entry — one `face-active`, one `face-hidden` — and FlexLayout's
 * `tabEnableRenderOnDemand` (default true) mounts exactly the SELECTED tab of
 * each tabset. So the first entry of each (model, slot) mounts the instant the
 * user switches layout, on the hidden face too, with no gesture asking for it.
 * An opening tab must therefore not seize shared singleton state on mount.
 * `m1SurfaceDeep` violates that: its `m1-slot-walk` embeds `WalkPane`, whose
 * mount effect auto-arrives at seed `M1` and publishes it into the ONE shared
 * coordinate store — so opening the deep layout on it silently re-pointed every
 * M0'/M1' subscriber at M1. It is second; `canonUpdateLedger` opens instead.
 * The law is machine-enforced two ways. `mountPublishes` DECLARES the hazard on
 * the mount that carries it, anchored to the real source, and
 * `deepPaneSet.test.ts` fails closed if such a mount is ever first — so a
 * reorder cannot reintroduce this silently. The e2e adds the behavioural half:
 * entering the deep layout must leave the seeded coordinate exactly where it
 * was. (The unit gate is the deterministic one; the behavioural check only wins
 * when the substrate answers fast enough, which is how the bug first showed.)
 */
export const DEEP_PANE_SET: readonly DeepPaneMount[] = Object.freeze([
    // ── left: the IDE explorer rail (M0/M5 IDE chrome, :161) ───────────────
    // The first per-layout LEFT slot the carrier has ever had: face 0 has no
    // left border at all in `daily-0-1`, and face 1's daily rail is the lived
    // reading surfaces. Both deep faces get the same explorer, because an IDE
    // explorer is not a face-conjugate surface — it is the workspace's root.
    Object.freeze({
        surfaceId: 'fileTree',
        label: 'Vault',
        slot: 'left',
        model: 'both',
        why: 'The explorer root of an IDE workspace; the canonical read surface every deep edit starts from.'
    }),
    Object.freeze({
        surfaceId: 'semanticConnections',
        label: 'Connections',
        slot: 'left',
        model: 'both',
        why: "`ui/leftSidebarModes.ts` declares `smart-connections` as `availableInLayouts: ['ide-deep']`, and 52.T6 settled the contradiction in the registry's favour: the daily face-1 Connections tab is withdrawn, so these deep rails are the surface's ONLY home — which is exactly what the `pratibimba.smart-connections-sidebar` layout claim (now `landed`, `ui/layoutClaims.ts`) always named."
    }),
    Object.freeze({
        surfaceId: 'coordinateTree',
        label: 'Coordinates',
        slot: 'left',
        model: 'both',
        why: "M0' chrome and the navigation backbone: `LEFT_SIDEBAR_MODES` makes `coordinate-tree` the DEFAULT mode and the cross-layout fallback, available in BOTH layouts — so 28.T28.6 mounts it in the daily face-1 rail AND here, and that declaration is now true rather than aspirational. Deliberately THIRD: an opening rail tab mounts on the hidden face too, and a coordinate tree is precisely the surface that must not seize the shared coordinate on mount (it publishes only from a click — hence no `mountPublishes`, and the sibling suite proves the absence)."
    }),

    // ── main / cosmic: M0'-M3' structural depth ────────────────────────────
    Object.freeze({
        surfaceId: 'bimbaGraph',
        label: 'Bimba',
        slot: 'main',
        model: 'cosmic',
        why: "M0 IDE chrome — the Bimba graph viewer :161 names. Renders the FULL LATTICE in `ide-deep` against the daily solar-anchor preview (28.T28.3 a/b), so the deep layout is where it is itself."
    }),
    Object.freeze({
        surfaceId: 'm1SurfaceComposed',
        label: 'M1 Surface',
        slot: 'main',
        model: 'cosmic',
        why: 'The integrated 1-2-3 cosmic-engine contribution (:161) in its composed mode — a composition role, never the standalone workbench (DR-M1-FACE-LAYOUT-1).'
    }),
    Object.freeze({
        surfaceId: 'spandaNavigator',
        label: 'Spanda',
        slot: 'main',
        model: 'cosmic',
        why: "M1' depth: the spanda walk navigator (22.T22.1, DR-M1-5)."
    }),
    Object.freeze({
        surfaceId: 'walk',
        label: 'Walk',
        slot: 'main',
        model: 'cosmic',
        why: "M1' depth: walk-as-melody traversal over the coordinate store."
    }),
    Object.freeze({
        surfaceId: 'kleinTopology',
        label: 'Klein',
        slot: 'main',
        model: 'cosmic',
        why: "M1' depth: the Klein-bottle topology instrument (02.T2.3)."
    }),
    Object.freeze({
        surfaceId: 'm1PlayedTorus',
        label: 'Played Torus',
        slot: 'main',
        model: 'cosmic',
        why: "M1' depth: the played-torus instrument."
    }),
    Object.freeze({
        surfaceId: 'm2Correspondence',
        label: 'Correspondence',
        slot: 'main',
        model: 'cosmic',
        why: "M2' depth: the 72-fold correspondence tree over `s2.parashaktiCorrespondences`."
    }),
    Object.freeze({
        surfaceId: 'm3PentadicInspector',
        label: 'Pentadic',
        slot: 'main',
        model: 'cosmic',
        why: "M3' depth: the pentadic inspector — a depth-differentiated receiver (the deep layout withdraws the daily wheel mini-view so the full instrument is the one wheel)."
    }),
    Object.freeze({
        surfaceId: 'm3Inspectors',
        label: 'M3 Inspectors',
        slot: 'main',
        model: 'cosmic',
        why: "M3' depth: the inspectors area hosting M3CosmicWheelRenderService (24.T24.1) — also depth-differentiated."
    }),
    Object.freeze({
        surfaceId: 'mocBases',
        label: 'Bases',
        slot: 'main',
        model: 'cosmic',
        why: 'Evaluated MOC membership + canvas-linked Base views (48.T48.4): a canon-index surface, which is deep work rather than daily flow.'
    }),
    Object.freeze({
        surfaceId: 'm5Ebm',
        label: 'M5 EBM',
        slot: 'main',
        model: 'cosmic',
        why: "M5' EBM observatory (26.T26.1) — M5-domain content in its READ role, structural side."
    }),
    Object.freeze({
        surfaceId: 'piAxiomTranslation',
        label: 'Axiom',
        slot: 'main',
        model: 'cosmic',
        why: 'The DR-B-2 English→Formal→OWL→SHACL inspector (26.T26.14): a canon-engineering surface.'
    }),

    // ── main / personal: M4'/M5' lived + governance depth ──────────────────
    Object.freeze({
        surfaceId: 'canonUpdateLedger',
        label: 'CU Ledger',
        slot: 'main',
        model: 'personal',
        why: "M5' GOVERNANCE: the canon-update review ledger (40.T40.5). FIRST on purpose — see THE OPENING-TAB LAW above; :161 names M5' the Epii IDE, so governance is the right thing for the lived/governance half to open on, and this surface publishes nothing on mount."
    }),
    Object.freeze({
        surfaceId: 'm1SurfaceDeep',
        label: 'M1 Deep',
        slot: 'main',
        model: 'personal',
        why: "The eight-slot M1' workbench — `standalone-ide-deep` opens only when BOTH gates open (DR-M1-FACE-LAYOUT-1). This tranche is what makes its layout gate reachable as a real pane set. Deliberately NOT the opening tab — see `mountPublishes` and THE OPENING-TAB LAW above.",
        mountPublishes: {
            store: 'useCoordinateStore',
            chain: [
                {
                    file: 'panes/m1SurfaceDispatch.tsx',
                    anchor: '<WalkPane />'
                },
                {
                    file: 'panes/WalkPane.tsx',
                    anchor: "useState(isWalkableCoordinate(selected) ? selected : 'M1')"
                },
                {
                    file: 'panes/WalkPane.tsx',
                    anchor: 'useCoordinateStore.getState().setSelected(coordinate)'
                }
            ]
        }
    }),
    Object.freeze({
        surfaceId: 'm4DialogicalArena',
        label: 'Arena',
        slot: 'main',
        model: 'personal',
        why: "M4' depth: the dia-logical arena (41.T41.7), a CPF-gated working surface."
    }),
    Object.freeze({
        surfaceId: 'autoresearch',
        label: 'Autoresearch',
        slot: 'main',
        model: 'personal',
        why: "M5' GOVERNANCE: the S5 improvement-loop disclosure (28.T28.10)."
    }),
    Object.freeze({
        surfaceId: 'agenticControlRoom',
        label: 'Pi Monitor (ACR)',
        slot: 'main',
        model: 'personal',
        why: "M5' GOVERNANCE, and the first DEEP-ONLY surface this carrier has: [[CHROME-CONTRACT]] §5 DR-WC-IS-1 makes the ACR governance primary — IOD-17 parity, RunTree audit, review decisions, full evidence deposit — while the OmniPanel folds keep the always-on abbreviated render (DR-WC-IS-2). It has no daily residency at all, so it is carried here and nowhere else (28.T28.5). Deliberately NOT the opening tab: it reads the capability matrix, the session lineage and the review inbox on mount, and an opening tab mounts on the hidden face too."
    }),
    Object.freeze({
        surfaceId: 'medicineView',
        label: 'Medicine',
        slot: 'main',
        model: 'personal',
        why: "M4' depth: the full eight-chakra medicine instrument over `nara.medicine.snapshot` (25.T25.10)."
    }),
    Object.freeze({
        surfaceId: 'transformContainers',
        label: 'Transform',
        slot: 'main',
        model: 'personal',
        why: "M4' depth: the governed `nara.transform.*` lifecycle (25.T25.11)."
    }),
    Object.freeze({
        surfaceId: 'logosCycle',
        label: 'Logos',
        slot: 'main',
        model: 'personal',
        why: "M4' depth: the governed six-stage A-Logos↔An-a-Logos cycle (25.T25.13) — :159 names Logos-cycle work as deep-layout work."
    }),
    Object.freeze({
        surfaceId: 'kairosEnablement',
        label: 'Kairos setup',
        slot: 'main',
        model: 'personal',
        why: 'A configuration surface whose cross-layout target preserves the current layout (32.T32.10), so it must be reachable in both.'
    })
]);

/**
 * The seams. Each doc-ahead `pending` surface of [[CHROME-CONTRACT]] §2 that
 * belongs in the deep layout is declared here with the slot and model it lands
 * in, so its owning tranche mounts it into an ALREADY-DECIDED position instead
 * of re-deciding the layout. 52.T4 deliberately did not mount any of them: a
 * `pending` id found in the shell fails `chromeContract.test.ts` and would
 * steal another tranche's deliverable.
 *
 * The mechanism has now been exercised twice end to end. 28.T28.5 landed
 * `agenticControlRoom` and 28.T28.6 landed `coordinateTree` into exactly the
 * positions reserved for them — each flipping its §2 row to `live`, adding the
 * factory case, and moving its entry into `DEEP_PANE_SET` — so both
 * reservations were consumed rather than re-litigated. `backendStudio` (28.13)
 * remains.
 *
 * `readiness-gate` (28.11) is NOT here on purpose — it is a per-binding inline
 * wrapper, not a slot occupant, so it has no pane-set position to reserve.
 */
export const DEEP_PANE_RESERVATIONS: readonly DeepPaneReservation[] = Object.freeze([
    Object.freeze({
        surfaceId: 'backendStudio',
        slot: 'left',
        model: 'both',
        owner: '28.T28.13',
        contractStatus: 'pending',
        why: "`LEFT_SIDEBAR_MODES` declares `backend-studio` an activity-bar mode with `availableInLayouts: ['ide-deep']` — a left-slot surface that exists only in depth, which is exactly this rail."
    })
]);

/**
 * Every daily-model surface the deep layout deliberately does NOT carry.
 * [[M'-TAURI-PORT-SPEC]] :65 — "Shell surfaces preview; subsystem pages deliver
 * depth. Do not merge them." The validator holds this list total against the
 * real daily registry, so a future daily surface cannot quietly go unclassified.
 *
 * SCOPE (52.T5): a withdrawal governs the deep OVERVIEW tabsets this module
 * declares. The six subsystem pages are a different surface class — a page may
 * GATHER a withdrawn surface as an inner stratum (the M4' page mirrors the
 * journal/day/oracle/recognition surfaces), and that per-surface law lives in
 * `ui/subsystemWorkspaceOwnership.ts`, not here.
 */
export const DEEP_PANE_WITHDRAWALS: readonly DeepPaneWithdrawal[] = Object.freeze([
    Object.freeze({
        surfaceId: 'cosmic',
        why: "[[M'-SYSTEM-SPEC]] :130 — 'Shell 0 is not M1\\', M2\\', or M3\\'; it is their integrated parent-level cymatic clock PREVIEW.' The preview belongs to the preview layout; the deep layout carries the instruments it previews."
    }),
    Object.freeze({
        surfaceId: 'personalHome',
        why: "[[M'-SYSTEM-SPEC]] :130 — 'Shell 1 is not M4\\', M5\\', or M0\\'; it is their integrated parent-level lived-return preview.' Same law, conjugate face. Its cross-layout target already declares `preferredLayout: 'daily-0-1'`."
    }),
    Object.freeze({
        surfaceId: 'journalTimeline',
        why: "DCC-07: 'shell 1 may carry lived daily-flow'. The journal IS the daily flow; its cross-layout target pulls back to `daily-0-1`."
    }),
    Object.freeze({
        surfaceId: 'dayCalendar',
        why: 'Daily lived-flow (the day container). Its cross-layout target pulls back to `daily-0-1`.'
    }),
    Object.freeze({
        surfaceId: 'oracle',
        why: 'Daily lived-flow (the oracle cast is a day gesture). Its cross-layout target pulls back to `daily-0-1`.'
    }),
    Object.freeze({
        surfaceId: 'sessionCloseCeremony',
        why: 'A read-only Möbius-turn ceremony over the day just closed (25.T25.19) — lived flow, not depth work.'
    }),
    Object.freeze({
        surfaceId: 'psycheAnchorCoherence',
        why: 'The tarot psyche-anchor read of the same close (25.T25.20) — lived flow, same law as the ceremony it sits beside.'
    }),
    Object.freeze({
        surfaceId: 'rfactorFretboard',
        why: 'The R-factor fretboard replays the SESSION traversal (25.T25.23) — a personal lived-flow record read beside the ceremony that asks whether it returned, not depth work.'
    }),
    Object.freeze({
        surfaceId: 'pratibimbaCoordinate',
        why: "The protected personal-field surface (25.T25.14). :161 names the integrated 4/5/0 Jiva-is-Śiva path as deep material, but the landed 52.T3 layout audit declares this receiver `preferredLayout: 'daily-0-1'` — an intent to it pulls the user back to the daily shell, so mounting it in depth would contradict the ledger. 52.T5 owns the M4' subsystem page that gives the recognition path its deep home."
    })
]);

/** The mounts for one deep model and slot, in declared (tab) order. */
export function deepPaneMounts(
    model: DeepPaneModelId,
    slot: DeepPaneSlot
): readonly DeepPaneMount[] {
    return DEEP_PANE_SET.filter(
        mount => mount.slot === slot && (mount.model === model || mount.model === 'both')
    );
}

/** The deep main tabset ids. Distinct from `cosmic-main`/`personal-main` so a
 *  saved layout, an `addNode` target, and a test selector can never confuse a
 *  deep tabset with its daily counterpart. */
export function deepMainTabsetId(model: DeepPaneModelId): string {
    return model === 'cosmic' ? 'cosmic-deep-main' : 'personal-deep-main';
}

function tabNode(mount: DeepPaneMount) {
    return {
        type: 'tab',
        name: mount.label,
        component: mount.surfaceId,
        enableClose: false
    };
}

/**
 * The flexlayout JSON for one deep model. The `/` membrane is handed IN rather
 * than rebuilt: `right` is the OmniPanel's exclusive slot (`ui/shellSlotPolicy`)
 * and its tab manifest has one owner (`panes/omni/omnipanelRuntime.ts`).
 *
 * Shape: left explorer rail + ONE main tabset. The `main` slot's policy is
 * `composition` — "the 0/1 faces compose ONE editor area, never side-by-side
 * panes" — so the deep workspace does not split its editor area, and no carrier
 * layout composes a `bottom`.
 *
 * THE RAIL OPENS CLOSED, and that is THE OPENING-TAB LAW applied to the left
 * slot rather than an oversight. `selected` is omitted, so flexlayout's own
 * default (-1, collapsed) holds: the rail's tab BUTTONS are the affordance and a
 * pane mounts when the user picks one. Opening it would mount `fileTree` on BOTH
 * faces the instant the layout is entered — two unprompted vault reads for a
 * surface nobody asked for, on top of the main tabsets already mounting. It also
 * happens to be the honest pre-52.T6 state of an `activity-bar-switched` slot:
 * until the mode registry actually runs, no mode IS the current one.
 */
export function deepLayoutJson(model: DeepPaneModelId, omniBorder: unknown) {
    return {
        global: { tabEnableRename: false },
        borders: [
            {
                type: 'border',
                location: 'left',
                size: 260,
                children: deepPaneMounts(model, 'left').map(tabNode)
            },
            omniBorder
        ],
        layout: {
            type: 'row',
            children: [
                {
                    type: 'tabset',
                    id: deepMainTabsetId(model),
                    children: deepPaneMounts(model, 'main').map(tabNode)
                }
            ]
        }
    };
}
