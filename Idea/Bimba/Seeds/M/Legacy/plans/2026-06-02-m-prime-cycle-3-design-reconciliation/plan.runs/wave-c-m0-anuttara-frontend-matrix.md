# Wave C — M0' Anuttara Frontend (Per-Mn Deep Design) Matrix

**Task id:** `wave-c-m0-anuttara-frontend`
**Domain:** Per-extension widget UX of the `m0-anuttara` Theia extension — the M0' surface as the integrated bimba-map engagement workbench (six M0-X' data layers, ARCHETYPE_LUT routing visualisation, CONTEMPLATION_PROMPT dialog, VIRTUE_LUT witness panel, symbolic-coordinate-string question emitter, governed-route Reading↔Authoring grammar)
**Anti-greenfield posture:** `Body/M/epi-theia/extensions/m0-anuttara/` is landed scaffold (one widget, one inspector, one layer-discriminator). Every tranche below `extends existing` against that scaffold OR `first-builds against an unowned M' product surface` (per-layer viewer, archetype routing panel, contemplation dialog, virtue witness, symbolic-coordinate question console, lazy 96-node browser). M0/M5 chrome operating on M0 data already exists in `ide-shell-m0-m5` (bimba-graph-viewer, canon-studio, coordinate-tree, logos-atelier) — Wave C consumes them as-is and never re-implements them inside `m0-anuttara`.

## Source list (corpora actually consulted)

- **Corpus 1 (UX intent)** — `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` (244 lines, full read).
- **Corpus 2 (Wave-A substrate matrix)** — `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m0-reconciliation-matrix.md` (167 lines, full read; DR-M0-1, DR-M0-2, DR-M0-3, O-M0-01, O-M0-02 consumed).
- **Corpus 3 (Substrate tranche)** — `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/01-m0-anuttara-reconciliation.md` (Tranches 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.10, 1.11 cross-linked).
- **Corpus 4 (Extension state)** —
  - `Body/M/epi-theia/extensions/m0-anuttara/src/browser/frontend-module.ts` (`M0AnuttaraContribution` with `OPEN_COMMAND_ID`, `READ_ONLY_COMMAND_ID`, `DEPOSIT_ONLY_COMMAND_ID`, intent target `'graph'`),
  - `Body/M/epi-theia/extensions/m0-anuttara/src/browser/m0-anuttara-widget.tsx` (single `ReactWidget` with five `<section>` blocks: ReadinessBanner / detail / Anuttara syntax fields / S2 provenance / M5 actions / Profile snapshot),
  - `Body/M/epi-theia/extensions/m0-anuttara/src/common/index.ts` (`EXTENSION_ID = 'm0-anuttara'`, `PRIMARY_VIEW_ID = 'm0.anuttara.languageMap'`, `ALL_VIEW_IDS = ['m0.anuttara.languageMap','m0.anuttara.owlShaclInspector','m0.anuttara.rVirtuePanel']`, `PRIVACY_CLASS = 'public_current_with_graph_provenance'`, `OBSERVABILITY_EVENT_TYPES = ['m0.graph.provenance','m0.review.requested']`, forbidden-imports list, `TRACK_08_CONTRIBUTION` with compactViews / selectionHandlers / currentStateSelectors / evidenceSerializers / route contract `m0.coordinate-to-m1.walk`),
  - `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` (`M0InspectorModel` with `query`, `node`, `layerViews`, `languageFields`, `anchors`, `pointerSummary`, `relationFamilies`, `readinessFacts`, `routeTargets`, `actions`, `pedagogy`, `renderBudgetMs: 100`; `normalizeM0CoordinateInput`, `buildM0InspectorModel`),
  - `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts` (`M0LayerId`, `M0LayerKey`, `M0LayerPlacement`, `M0LayerLocalView`, `M0LayerBridgedView`, `M0LayerView`, `M0_LAYER_VIEWS[6]` already-frozen with M0-0'/M0-1'/M0-2'/M0-3' local and M0-4'/M0-5' bridged to `m4-nara` / `m5-epii`, `bridgedLayerRoute`).
- **Corpus 5 (M0/M5 chrome operating on M0 data — consumed as-is)** —
  - `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bimba-graph-viewer-widget.tsx` (`BimbaGraphViewerWidget.openCoordinate(coordinate)` via `kernel-bridge.invokeCapability` → `s2.graph.node`),
  - `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/canon-studio-widget.tsx`,
  - `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/coordinate-tree-widget.tsx`,
  - `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`.
- **Corpus 6 (Contract preflight)** — `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (`KernelBridgeAPI` capabilities `readCurrentProfile`/`readPointerAnchor`/`readReadiness`/`subscribeObservability`/`invokeGatewayRpc`/`depositKernelObservation`/`requestReviewEvidence`; subscriptions `profile`/`connection_status`/`observability`; `sharedBridgeAdapter.forbiddenDirectImports`; readiness taxonomy nine entries).
- **Corpus 7 (Substrate canonical authorities for content the surface must read)** —
  - `Body/S/S0/epi-lib/include/m0.h` lines 163 (`VIRTUE_LUT[9]`), 185 (`ARCHETYPE_LUT_SIZE = 12`), 208 (`extern const Archetype_Entry ARCHETYPE_LUT[12]`), 526 (`M0_CORE_RELATIONS[65]`), 530 (`m0_bind_m5_logos`),
  - `Body/S/S0/epi-lib/docs/m0-dataset-audit.md` (108 nodes across 7 sub-branches: #0 root / #0-0 4-fold zero / #0-1 emergence / #0-2 8-fold virtues / #0-3 archetypal number language 40 nodes / #0-4 holographic matrix / #0-5 Siva-Sakti; lazy strategy: 12 LUTs in `.rodata`, 96 unlifted nodes resident in Neo4j).
- **Corpus 8 (M' canon)** — `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (Shell layer §); `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`; `Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`.
- **Cross-link corpora (consumed for boundary law, NOT re-authored)** —
  - Track 11 `11-theia-shell-surface-hosting.md` (shell hosts `m0-anuttara`; cross-layout intent envelope; OmniPanel `availableInLayouts` filter);
  - Track 15 `15-ui-design-foundations.md` (coordinate as primary navigation, profile-tick clock, provenance always visible, OmniPanel as `/`, activity-bar discipline, no modal review surfaces);
  - Track 19 `19-contemplation-surface-integration.md` (19.1 ARCHETYPE_LUT routing fix, 19.3 CONTEMPLATION_PROMPT_LUT[12], 19.6 Verifier-Anuttara reading + VIRTUE_LUT[9] 9-bit witness, 19.10 M0_M2_ZODIACAL_BRIDGE[12] / PSYCHOID_PLANETARY_CORRESPONDENCE[7] / ALCHEMICAL_TO_TATTVIC[6]).

---

## Master 4-way matrix

| # | Claim (UX doc) | Spec authority (M' Seed) | Code/substrate evidence | Theia surface | Status |
|---|---|---|---|---|---|
| WC-M0-01 | M0' is the integrated bimba-map engagement workbench — one entry point, six modes of reading the same graph (Anuttara UX §1, §3 mantra, §12). | M0'-SPEC requires Track 01 enumerate six M0-X' layers; M0-ARCHITECTURE.md §"six data layers". | `m0-layers.ts` lands `M0_LAYER_VIEWS[6]` (4 local + 2 bridged) — the layer-discriminator exists as data. | Widget exposes `model.layerViews` in `M0InspectorModel` but renders **no layer selector** — only the language fields, S2 provenance, M5 actions, profile snapshot are visible. The six-mode navigation grammar is *typed but not rendered*. | **CODE-PENDING (surface)** — surface gap blocks the UX claim from showing up. Wave-C tranche must render the layer selector and route to per-layer panels. |
| WC-M0-02 | M0-0' Language layer = `c_1_symbol` / `c_1_complete_formulation` / `c_1_form` / asset handles, provenance-stated. | M0'-SPEC §"Anuttara As Pre-Math Node Language"; Track 01 Tranches 1.3 + 1.6 (alias canon + asset handle land). | `m0-inspector.ts.languageFields` returns three fields (`symbol`, `formulation_type`, `complete_formulation`) keyed off properties from the `m0_graph_node` payload. | Widget renders `model.languageFields` with `data-provenance-state` — present. Missing: `c_1_form`, `c_1_formulation_breakdown`, `c_1_primary_designation`, `c_1_name`, plus asset-handle preview (Tranche 1.6 lands schema; surface must render). | **ALIGNED (partial) + DOC-AHEAD (needs Language-Layer Reader)** — closing tranche 21.2 lifts the language layer into a dedicated panel with the full seven `c_1_*` fields + asset previews. |
| WC-M0-03 | M0-1' QL-structure layer = coordinate organisation, mod6/4/3/2 variants, branch QL-formations; the topological skeleton. | M0'-SPEC; Track 01 Tranche 1.1 (six-layer surface contract). | Skeleton lives in `m0.h` `QL_STACK[5]`, `MIRROR_CHILDREN[2]`, S2 graph structural relations (`CONTAINS`, `FAMILY_CONTAINS`, `ANCHORED_TO`); no projection in `m0-inspector.ts` beyond `routeTargets: ['M1','M2','M3','M4','M5']`. | No QL-structure panel in widget; cross-link `coordinate-tree-widget` (ide-shell) reads the same skeleton but is not wired as M0-1' layer. | **DOC-AHEAD + ORPHAN (surface owner)** — Wave-C 21.3 lands the QL-structure panel inside `m0-anuttara` as a layer view that consumes `coordinate-tree-widget`'s S2 payload shape (no rebuild of the tree itself). |
| WC-M0-04 | M0-2' Relations layer = structural skeleton + correspondential web; two relation families never collapse (Anuttara UX §3.1). | M0'-SPEC; Track 01 Tranche 1.9 (`c_1_relation_family` discriminator). | `m0-inspector.ts.relationFamilies` already reads `c_1_relation_family` and per-relation `family`. `graph-schema/src/lib.rs` declares 10 structural relations; correspondential family lives in dataset. | Widget renders `model.relationFamilies` as a comma-joined line in the S2 provenance section. **Two families collapse into one line.** | **DOC-AHEAD (renderer)** — closing tranche 21.4 splits the relations layer into a dedicated panel with structural vs correspondential columns + provenance-state per edge family. |
| WC-M0-05 | M0-3' Time/Community layer = GDS community + active-now clock overlay (Anuttara UX §3, §6 solar anchor). | M0'-SPEC §M0'-3 Graph-Inference-GDS Delta; Track 01 Tranche 1.5. | Substrate exists: S2 GDS, S3 Graphiti, M3 `world_clock`. **No code in `m0-anuttara`.** | No M0-3' panel anywhere; `DECLARED_BLOCKERS` includes "Track 02 T7/T8 coordinate-native graph API parity" — community payload not yet plumbed. | **SPEC-AHEAD / CODE-PENDING (cross-link 01.1.5)** — Wave-C 21.5 lands `m0.anuttara.communityClockOverlay` view stub that renders provenance-state `blocked` until S2 GDS payload arrives. |
| WC-M0-06 | M0-4' Personal layer = traversal history, resonances, daimon render (Anuttara UX §3, §10) — protected-local via Nara governance. | M0'-SPEC §"Privacy Boundary"; Track 01 Tranche 1.1 routes to `m4-nara`. | `m0-layers.ts` already bridges M0-4' to `m4-nara` at route `/m4-nara/artifact`. **No deep-link button in widget.** | Widget never renders a bridged-route affordance. The bridged layers are typed but not actionable. | **DOC-AHEAD (surface)** — Wave-C 21.6 lands a Bridged-Layer Launcher that renders both M0-4' and M0-5' as deep-link buttons + describes the protected-local privacy boundary inline. |
| WC-M0-07 | M0-5' Pedagogical layer = map-compass-lens, traversal depth/breadth, next-explorations (Anuttara UX §3, §9). | M0'-SPEC; Track 01 Tranche 1.1 routes to `m5-epii`. | Same as WC-M0-06 — bridge typed in `m0-layers.ts`, no surface affordance. | Same. | **DOC-AHEAD (surface)** — folded into Wave-C 21.6. |
| WC-M0-08 | Implicate ↔ explicate is a UI affordance — M0 is implicate ground; M5 is explicate Pratibimba return; relationship is visualisable inside the M0 surface (Anuttara UX §2, §12). | M0'-SPEC §"Anuttara As Pre-Math Node Language"; M0-ARCHITECTURE.md M0↔M5 Möbius write-back boundary. | Substrate: `m0_bind_m5_logos` callback at `Body/S/S0/epi-lib/include/m0.h:530`; M5 `m5_execute_mobius_return` at `Body/S/S0/epi-lib/src/m5.c:98-114`. No widget surface. | Widget renders `model.pedagogy.priorGroundBoundary` and `parentAttribution` strings — implicit textual disclosure only. | **SPEC-AHEAD + DOC-AHEAD (toggle widget)** — Wave-C 21.7 lands an Implicate / Explicate toggle that re-keys per-layer panels (M0-0' implicate vs M0-5' explicate pratibimba return) without forking the substrate. |
| WC-M0-09 | ARCHETYPE_LUT[12] routes Arch 3 → ZODIACAL, Arch 5 → MONOPOLY, Arch 7 → DIVINE_ACT, Arch 9 → VIRTUE — the 3-5-7-9 syntax-layer reading (Track 19.9). | Track 19.1 lands the ordering fix; Track 19.9 documents 3-5-7-9 syntax-layer reading. | `m0.h:208` `ARCHETYPE_LUT[12]`; sub-tables in `m0.h:163` (VIRTUE_LUT), 185-208 declarations; ordering fix at `epi-lib/docs/m0-archetype-lut-ordering-fix.md`. | **No archetype routing panel in widget.** ARCHETYPE_LUT routing is the substrate-side anchor for everything M0 contemplative, but the surface never visualises it. | **DOC-AHEAD (surface)** — Wave-C 21.8 lands an Archetype Routing Reader: card per archetype index showing the sub-table the routing points to, with provenance-state per row. |
| WC-M0-10 | `CONTEMPLATION_PROMPT_LUT[12]` surfaces a session-close question per archetype index (Track 19.3). | Track 19.3 adds `CONTEMPLATION_PROMPT_LUT[12]` to `m0.c`; Track 19.6 dispatches via `contemplate_session_close`. | Track 19.3 lands the LUT in `.rodata`. **No widget code consumes it.** | No contemplation dialog in widget. | **CODE-PENDING (cross-link 19.3) + DOC-AHEAD (dialog surface)** — Wave-C 21.9 lands a non-modal Contemplation Prompt Panel surfacing the active archetype's question + a free-text response field that emits `m0.review.requested` observability event. |
| WC-M0-11 | `VIRTUE_LUT[9]` carries the nine Parameśvara virtues; Verifier-Anuttara emits a 9-bit `virtue_witness_vector` per state (Track 19.6, Track 01.10 cross-link). | Track 1.10 `m0_verifier_check_state` returns `M0VerifierReport { virtue_witness_vector: u16, unsatisfied_constraints, coherence_score }`; Track 19.6 invokes it. | `m0.h:163` `extern const Virtue_Entry VIRTUE_LUT[9]`; m0.c populates 9 entries. Verifier module pending Track 1.10 landing. | No virtue panel in widget. | **CODE-PENDING (cross-link 1.10) + DOC-AHEAD (surface)** — Wave-C 21.10 lands a Virtue Witness Panel rendering the 9-bit vector as nine indicator dots keyed to the virtue names (Love/Peace, Truth, Openness, Joy, Goodness, Beauty, Life, Wisdom, Reality), with `coherence_score` as a numeric badge + an `unsatisfied_constraints` list. |
| WC-M0-12 | Symbolic-coordinate-string question emission per DR-MP-3 (e.g. `#R0-0/1/A-T7-pending?`) — Verifier raises questions, LLM-Nara parses, round-trip is the training signal (Track 1.11). | Track 1.11 EBNF; Track 5.21 anuttara-symbolic-parse skill round-trip; Track 19.6 dispatches questions back to LLM. | EBNF in `M0'-SPEC` patch (Track 1.11). No widget code. | No surface. | **CODE-PENDING + DOC-AHEAD (Q-emitter surface)** — Wave-C 21.11 lands a Symbolic Coordinate Question Console: lists Verifier-emitted strings, allows user to inspect parse-result, and surfaces the gateway round-trip status (parse→response→re-verify). |
| WC-M0-13 | M0' Reading mode vs Authoring mode — both are present in IDE mode; switching is the live grammar (Anuttara UX §7 CRUD claim). | DR-M0-1 RESOLVED: governed-route via M5 atelier; `mutatesGraphCanon: false` invariant preserved. | `m0-inspector.ts.actions` returns three M5 routed-write actions: `s5'.improve.propose`, `s5.episodic.deposit`, `s5'.review.submit`. All `mutatesGraphCanon: false`. **No mode toggle UI.** | Widget renders the three actions as a static list under "M5 action hooks". The Reading ↔ Authoring grammar that the UX claims is *actions exist but mode isn't named*. | **DOC-AHEAD (mode surface) — DR-M0-1 already decided** — Wave-C 21.12 lands an explicit `M0SurfaceMode = 'reading' | 'authoring'` toggle that re-keys the actions section (Reading: just-read; Authoring: surfaces routed-write affordances + governance disclaimer + deep-link to M5 logos-atelier). NO `requestCanonMutation()` path is added; the toggle is a UI affordance over the existing M5-routed actions. |
| WC-M0-14 | Cross-link to canon-studio widget (ide-shell) for actual canonical writes via M5 atelier governance — M0' surface routes the user there, never mutates canon locally (Anuttara UX §7, §10). | M0'-SPEC §"§M0'-2 Inferential-Language Delta" + Track 11 hosts the chrome. | `ide-shell-m0-m5/src/browser/canon-studio-widget.tsx` exists; `m0-anuttara` widget does NOT cross-link. | Authoring affordance does not deep-link into Canon Studio or Logos Atelier today. | **DOC-AHEAD (cross-link surface)** — Wave-C 21.12 (folded with WC-M0-13) routes the Authoring-mode action set into `canon-studio-widget` + `logos-atelier-widget` via the `cross-layout-intent-dispatcher` (Track 11.2). |
| WC-M0-15 | Per-archetype-syntax-layer (3/5/7/9) reader views — speech/relationship/action/completion as syntax-layers (Track 19.9). | Track 19.9 names the four syntax-layers; ARCHETYPE_LUT routing wires them to the sub-tables. | Substrate: ARCHETYPE_LUT + ZODIACAL_LUT + MONOPOLY_LUT + DIVINE_ACT_LUT + VIRTUE_LUT all in `.rodata`. **No reader.** | No widget surface. | **DOC-AHEAD (surface)** — Wave-C 21.13 lands four Syntax-Layer Reader panels (one per Arch 3/5/7/9) accessible from the Archetype Routing Reader (21.8) — each renders the routed sub-table contents with provenance + a "why this question right now?" tooltip linking the Contemplation Prompt (21.9) for that archetype. |
| WC-M0-16 | 96 unlifted Anuttara nodes browse-able lazily per `m0-dataset-audit.md` strategy. | M0-dataset-audit.md: 108 nodes total; 12 LUTs in `.rodata` cover the load-bearing skeleton; 96 nodes resident in Neo4j only. | Lazy strategy is substrate-side; surface has no browser. | No browser in widget. | **DOC-AHEAD (surface)** — Wave-C 21.14 lands a Lazy Node Browser scoped to the 96-node residual set, paginated, fetched by sub-branch (`#0-0..#0-5`) via `s2.graph.node` + `s2.graph.list` gateway methods (consumed via SharedBridgeAdapter, never direct). |
| WC-M0-17 | 16-fold void-structure / 16-lens-as-divisions (CLAUDE.md M0-4 canon; Anuttara languification spec 12). | M0-ARCHITECTURE.md §"16 lenses = M0-4's void structure"; spec 12. | Substrate: 16 lenses are M0-4 Holographic Matrix bases. No widget. | No surface. | **DOC-AHEAD (surface)** — Wave-C 21.15 lands a 16-Fold Void-Structure ring renderer inside the M0-4 sub-area of the Language Layer Reader (21.2) — visualises the 16 lenses as 16 sacred-circle divisions; click-through to the per-lens definition node. |
| WC-M0-18 | Verifier-state surface: which constraints satisfied vs pending; R-virtue coherence score (Track 19.6). | Track 1.10 + 19.6: `M0VerifierReport.coherence_score` + `unsatisfied_constraints`. | Verifier RPC pending Track 1.10. No surface. | No surface. | **CODE-PENDING + DOC-AHEAD (cross-link 1.10 + 19.6)** — folded into Wave-C 21.10 (Virtue Witness Panel surfaces coherence_score + unsatisfied_constraints alongside the 9-bit vector). |
| WC-M0-19 | M0/M2 parity bridges (Track 19.10): `M0_M2_ZODIACAL_BRIDGE[12]`, `PSYCHOID_PLANETARY_CORRESPONDENCE[7]`, `ALCHEMICAL_TO_TATTVIC[6]` — Archetype-3 traversal reaches M2 decanic expression in one indirection. | Track 19.10 lands the three LUTs in `m0.c`. | LUTs pending Track 19.10 landing. No surface. | No surface. | **CODE-PENDING + DOC-AHEAD (cross-link 19.10)** — Wave-C 21.16 lands a Parity Bridge Reader inside the Archetype Routing panel (21.8): when Arch 3 is selected, the bridge LUT is rendered as a row per sign with decan planets + first decan idx_72; same affordance for Arch 5 (Psychoid Planetary), Arch 7 (Alchemical/Tattvic). |
| WC-M0-20 | OmniPanel parity — M0' Anuttara surface must consume the shell's coordinate-as-primary-navigation, profile-tick clock, provenance-always-visible (Track 15 foundation principles). | Track 15.1 foundation principles; Track 15.6 profile-tick clock + readiness inline rendering. | Widget already subscribes to `onProfile`, `onReadiness`, `onCoordinateContext` from `SharedBridgeAdapter`. | Foundation principle adherence present at the widget root; provenance-state visible per field; profile-tick re-render happens via existing subscriptions. | **ALIGNED** — no Wave-C work; consume Track 15 as-is. |
| WC-M0-21 | Activity-bar discipline — M0' Anuttara must sit inside the left-sidebar activity-bar of `daily-0-1` Bimba Graph Viewer mode + `ide-deep` Coordinate Tree mode (Track 15.3 left-sidebar system). | Track 15.3. | `frontend-module.ts` registers `OPEN_COMMAND_ID = 'm0.openCoordinate'` and `bindViewContribution(M0AnuttaraContribution)` with `defaultWidgetOptions: { area: 'main' }`. **Default area is `main`, not activity-bar slot.** | Widget opens in `main` editor area — correct for IDE-mode (per Track 15 §"`ide-deep`"). But the daily-0-1 lean preview placement is not declared. | **SPEC-AHEAD (cross-link 15.3)** — Wave-C 21.17 lands an activity-bar-aware placement: `defaultWidgetOptions.area` stays `main` for `ide-deep`; for `daily-0-1` cosmic-face, surface a compact-card placement via the existing `TRACK_08_CONTRIBUTION.compactViews` `M0CoordinateSummaryCard` (consume as-is, register the layout binding). |
| WC-M0-22 | Inline provenance — every datum shows ready / pending-* / blocked (Track 15.3 principle 3). | Track 15 foundation principles. | `m0-inspector.ts.languageFields` + `relationFamilies` + `readinessFacts` all carry `state: M0ProvenanceState` (`canonical|canonical_absent|derived|inferred|review_pending|blocked`). Widget renders `data-provenance-state` attribute. | Provenance is visible on language fields and pointer summary; readiness facts rendered as joined string in S2 provenance section. **Layer-level provenance not surfaced** (no per-layer pending badge). | **ALIGNED (partial)** — Wave-C 21.18 adds per-layer provenance pills to the Layer Selector (21.1) so users see which of the six layers are ready / blocked / pending. |
| WC-M0-23 | No modal review surfaces — Reviews land in OmniPanel Review tab; never popups (Track 15 §"OmniPanel" + 15.2). | Track 15 principle 5. | `m0-inspector.ts.actions[2]` already returns `request-anuttara-review` with method `s5'.review.submit`. | Widget renders the action as a list item, not a modal — correct. | **ALIGNED**. |
| WC-M0-24 | Cross-layout intent envelope (Track 11.2) — M0' must consume `CrossLayoutIntent.requestedContributionId` so OmniPanel intents route to specific layer views (e.g. open-M0-2-relations-of-#0-3). | Track 11.2 spec-ahead-integration. | `frontend-module.ts` registers `registerIntentTarget(commands, EXTENSION_ID, 'graph', ...)` — handles the legacy `'graph'` kind only. **No layer-aware intent target.** | Intent target opens the primary view regardless of layer. | **SPEC-AHEAD (cross-link 11.2)** — Wave-C 21.19 extends the intent registration to accept `requestedContributionId` carrying an `M0LayerKey` and routes the activated layer panel. |
| WC-M0-25 | Six-layer engagement system must persist active-layer across `daily-0-1` ↔ `ide-deep` toggle (Track 15.7 BimbaPratibimbaUiState). | Track 15.7. | No persistence today. | No surface. | **SPEC-AHEAD (cross-link 15.7)** — Wave-C 21.20 plumbs the active `M0LayerKey` through the SharedBridgeAdapter `currentStateSelectors` so the layout toggle preserves it. |
| WC-M0-26 | Privacy class on every artifact write — `PRIVACY_CLASS = 'public_current_with_graph_provenance'` (Track 11 + Track 19 privacy boundary). | 07-T0 contract; Track 19 §10 protected-local for M0-4. | `index.ts` declares `PRIVACY_CLASS`; `m0-inspector.ts.actions` flows it through every action's `params.privacyClass`. | Privacy class is on every action; bridged M0-4' route correctly delegates protected-local rendering to `m4-nara`. | **ALIGNED**. |

---

## Anomalies

### CONTRADICTIONS (Wave-C decision-register candidates — surface-scoped)

- **DR-WC-M0-1** — Layer-selector placement vs Theia "no parallel widget shell" principle. The six-mode navigation could either (a) live as a stacked left sub-toolbar inside the `m0-anuttara` widget body (one widget hosting six panels via internal mode-switch), or (b) live as six widget IDs registered against `ALL_VIEW_IDS` (one widget per layer). Foundation principle §7 "Activity-bar discipline" warns against parallel widget shells; but `ALL_VIEW_IDS` already declares three views (`languageMap`, `owlShaclInspector`, `rVirtuePanel`). Wave-C deliverable: choose (a) — internal stacked tab strip — and downgrade the three `ALL_VIEW_IDS` entries to canonical layer panels INSIDE one widget. Decision required.
- **DR-WC-M0-2** — Authoring-mode UI affordance vs DR-M0-1 (RESOLVED: governed-route via M5 atelier; `mutatesGraphCanon: false`). The Authoring-mode toggle (21.12) must not introduce an in-extension write path. Wave-C surface contract: Authoring mode shows routed-write affordances and deep-links INTO `canon-studio-widget` / `logos-atelier-widget` (already landed in ide-shell-m0-m5) — never a write button within `m0-anuttara`. Decision: this is a UI affordance, not a contract change. Note in DR ledger.
- **DR-WC-M0-3** — Contemplation Prompt Panel (21.9) is non-modal (per Track 15 principle "no modal review surfaces"), but must be persistent: should it live (a) inline at the bottom of the active layer panel, or (b) as a permanent footer of the widget regardless of active layer? Wave-C deliverable: choose (b) — permanent footer keyed off the active archetype derived from the selected coordinate — so the contemplative question travels with the surface, not the panel.

### CODE-PENDING (cross-link only — Wave-C does not own these)

- **CP-WC-M0-1 (cross-link 19.1)** — ARCHETYPE_LUT ordering fix lands in `m0.c`; Archetype Routing Reader (21.8) depends on it.
- **CP-WC-M0-2 (cross-link 19.3)** — `CONTEMPLATION_PROMPT_LUT[12]` lands in `m0.c`; Contemplation Prompt Panel (21.9) depends on it.
- **CP-WC-M0-3 (cross-link 1.10 + 19.6)** — `m0_verifier_check_state` + `contemplate_session_close` RPC land; Virtue Witness Panel (21.10) + Symbolic Coordinate Question Console (21.11) depend on them.
- **CP-WC-M0-4 (cross-link 1.11)** — Anuttara symbolic-coordinate-string EBNF + `anuttara-symbolic-parse` skill (Track 5.21); Q-Console (21.11) depends on round-trip.
- **CP-WC-M0-5 (cross-link 19.10)** — M0/M2 parity LUTs land in `m0.c`; Parity Bridge Reader (21.16) depends on them.
- **CP-WC-M0-6 (cross-link 1.5)** — GDS + Graphiti payload via S2/S3; M0-3' Community-Clock Overlay panel (21.5) renders provenance-state `blocked` until landing.

### ORPHANS

- **O-WC-M0-1** — Implicate↔Explicate toggle (WC-M0-08) has no surface owner before Wave-C; substrate carries `m0_bind_m5_logos` callback at `m0.h:530` but no UI affordance.
- **O-WC-M0-2** — 16-fold void-structure ring renderer (WC-M0-17) has no surface owner anywhere; M0-4 Holographic Matrix substrate exists in `.rodata` and Neo4j but is never visualised. (NOT a duplicate of Track 02 graph viewer — that surfaces the canonical graph; this is the M0-4 void-grammar itself rendered as a 16-fold lens-ring.)
- **O-WC-M0-3** — Lazy 96-node browser (WC-M0-16) — `m0-dataset-audit.md` defines the lazy strategy but no consumer ever paginated through the residual 96.

---

## Proposed Cycle-3 Closing Tranches (Wave-C M0-anuttara frontend domain — id space `21.x`)

> All tranches obey the anti-greenfield rule: every one is `consume as-is` (Track 11/15/19 contracts; ide-shell-m0-m5 chrome; SharedBridgeAdapter), `audit-verify` (forbidden-imports list; readiness taxonomy), `extend existing` (`m0-anuttara-widget.tsx`, `m0-inspector.ts`, `m0-layers.ts`, `index.ts`, `frontend-module.ts`), or `first-build against unowned M' product surface` (per-layer reader panels, archetype routing reader, contemplation prompt, virtue witness, symbolic-coordinate question console, parity bridge reader, lazy node browser, void-structure ring). No tranche re-implements a landed `ide-shell-m0-m5` widget or a kernel-bridge primitive.

### 21.1 — Layer Selector tab-strip (the six-mode navigation grammar) *(no-orphan-fill; resolves DR-WC-M0-1)*

**Source rows:** WC-M0-01, WC-M0-22, WC-M0-25.
**Deliverable:** Render `M0_LAYER_VIEWS[6]` as a horizontal tab-strip across the top of `m0-anuttara-widget.tsx` (below `ReadinessBanner`, above existing detail sections). New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/layer-selector.tsx` typed `LayerSelectorProps { layers: readonly M0LayerView[]; activeLayer: M0LayerKey; onSelect(key: M0LayerKey): void; layerReadiness: Record<M0LayerKey, M0ProvenanceState>; }`. Each tab renders the layer label, a provenance-state pill (`canonical|review_pending|blocked|...`), and (for bridged layers) an outbound-link glyph. Active-layer state held in `M0AnuttaraWidget.activeLayer: M0LayerKey` (default `'language'`); `setActiveLayer` triggers `this.update()`. Three downgraded `ALL_VIEW_IDS` (`languageMap`, `owlShaclInspector`, `rVirtuePanel`) collapse into one widget hosting tabbed panels (per DR-WC-M0-1).

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/layer-selector.tsx`
- `pnpm --filter @pratibimba/m0-anuttara test`
- `pnpm -C Body/M/epi-theia/extensions/m0-anuttara build`
- `grep -n "M0_LAYER_VIEWS\|LayerSelector\|activeLayer" Body/M/epi-theia/extensions/m0-anuttara/src/browser/m0-anuttara-widget.tsx`

### 21.2 — Language-Layer Reader panel (M0-0') *(extend existing; consumes Track 01.3 alias canon, Track 01.6 asset handles)*

**Source rows:** WC-M0-02.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/language-layer-panel.tsx`. Consumes `M0InspectorModel.languageFields` extended in `m0-inspector.ts` to seven entries: `c_1_symbol`, `c_1_complete_formulation`, `c_1_form` (currently absent — add field projection), `c_1_formulation_type`, `c_1_formulation_breakdown`, `c_1_primary_designation`, `c_1_name`. Asset previews via new `assetHandles: readonly M0AssetHandle[]` selector reading `c_1_asset_uri[]` + `c_1_asset_kind` per Track 01.6; renders a thumbnail row when `c_1_asset_kind` is `image|sigil|glyph|seal|tarot` else a typed asset-handle row. Naming canon enforced per Track 01.3 (DR-M0-2): `c_1_*` are canonical; unprefixed (`symbol`, `formulation_type`) accepted as alias fallback with provenance-state `derived`.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/language-layer-panel.tsx`
- `grep -n "c_1_form\b\|c_1_formulation_breakdown\|c_1_primary_designation\|c_1_name\|c_1_asset_uri\|c_1_asset_kind" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- inspector test renders all seven `c_1_*` fields + handles missing asset fields gracefully with `canonical_absent`
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.3 — QL-Structure Layer Reader panel (M0-1') *(first-build against unowned surface)*

**Source rows:** WC-M0-03.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/ql-structure-layer-panel.tsx`. Reads `M0InspectorModel.qlStructure: QlStructureProjection` — new selector to be added to `m0-inspector.ts`:

```ts
export interface QlStructureProjection {
  readonly position: 0 | 1 | 2 | 3 | 4 | 5 | null;        // QL_STACK position from S2 c_1_* properties
  readonly qlVariant: string | null;                       // c_1_ql_variant e.g. "mod6", "mod4", "mod3", "7/8/9/10 - mod10"
  readonly familyContainsParent: string | null;            // FAMILY_CONTAINS parent coordinate
  readonly mirror: { readonly child: string | null; readonly inverse: string | null }; // MIRROR_CHILDREN row
  readonly anchoredTo: readonly string[];                  // ANCHORED_TO coordinates
  readonly state: M0ProvenanceState;
}
```

Renders a vertical descriptor list with provenance-state badges. Reads from the same `s2.graph.node` payload (no new gateway method). Cross-references `coordinate-tree-widget` (ide-shell-m0-m5) for the canonical tree — the panel renders a "Open in Coordinate Tree" deep-link (via `cross-layout-intent-dispatcher` with `requestedExtensionId: 'ide-shell-m0-m5'`, `requestedContributionId: 'coordinateTree'`); never duplicates the tree widget.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/ql-structure-layer-panel.tsx`
- `grep -n "QlStructureProjection\|qlStructure\|FAMILY_CONTAINS\|MIRROR_CHILDREN\|ANCHORED_TO" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- panel test asserts all four S2 fields render with provenance-state when payload present; render falls back to `canonical_absent` when payload missing
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.4 — Relations Layer Reader panel (M0-2') *(extend existing; consumes Track 01.9 `c_1_relation_family` discriminator)*

**Source rows:** WC-M0-04.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/relations-layer-panel.tsx`. Replaces the comma-joined `relationFamilies` line in `m0-anuttara-widget.tsx` with a two-column table: **Structural** family (one column per relation in `M0_STRUCTURAL_RELATIONS = ['CONTAINS','FAMILY_CONTAINS','ANCHORED_TO','BEDROCK','MANIFESTS','INVERTS_TO','REFLECTS_AS','DERIVES_FROM','HAS_LENS','HAS_KERNEL_RESONANCE']`) + **Correspondential** family (one column per relation from `c_1_relation_family = 'correspondential'`). Each row = one outbound edge with `target_coordinate`, `relation_type`, `c_1_relation_family` provenance pill. Extends `m0-inspector.ts.relationFamilies` shape into `M0RelationsProjection { structural: readonly M0RelationRow[]; correspondential: readonly M0RelationRow[]; }`. Renderer never collapses the two families into one list (per Track 01.9).

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/relations-layer-panel.tsx`
- `grep -n "M0_STRUCTURAL_RELATIONS\|M0RelationsProjection\|structural\|correspondential" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- panel test asserts a payload carrying both structural CONTAINS edge + correspondential decan-rulership edge renders them in distinct columns
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.5 — Community + Clock Overlay panel stub (M0-3') *(spec-ahead-integration; cross-link 01.5)*

**Source rows:** WC-M0-05, CP-WC-M0-6.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/community-clock-panel.tsx` and downgrade of the third declared view ID `m0.anuttara.owlShaclInspector` from a separate widget into a sub-tab inside this panel (per DR-WC-M0-1 collapse). Panel selectors:

```ts
export interface M0CommunityClockProjection {
  readonly communityIds: readonly { readonly id: string; readonly size: number; readonly state: M0ProvenanceState }[];
  readonly activeNowClock: { readonly tick12: number | null; readonly degreeNode360: number | null; readonly state: M0ProvenanceState };
  readonly graphitiEpisodeRefs: readonly string[];
}
```

Reads `payload.gds_community` (S2 GDS) + `payload.active_now` (S3 Graphiti tick) from `MathemeHarmonicProfileBoundary.payload`. NO local clock — readiness pill renders `blocked` with the Track 02 T7/T8 blocker label until S2 GDS payload arrives (consume the existing `DECLARED_BLOCKERS` constant).

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/community-clock-panel.tsx`
- `grep -n "M0CommunityClockProjection\|gds_community\|active_now" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- panel test asserts `state === 'blocked'` rendering when no payload; renders `derived` when synthetic payload supplied
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.6 — Bridged-Layer Launcher (M0-4' / M0-5' deep-link buttons) *(extend existing; consume `m0-layers.ts` as-is)*

**Source rows:** WC-M0-06, WC-M0-07.
**Deliverable:** New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/bridged-layer-launcher.tsx`. Renders M0-4' (`m4-nara`) and M0-5' (`m5-epii`) as two card-buttons inside the Layer Selector (21.1) when the user picks a bridged layer tab. Each card shows: bridge target label, summary text, privacy-class disclosure (`protected_local` for M0-4'; `public_pedagogy` for M0-5'), and a "Open in `m4-nara` / `m5-epii`" button that calls `bridgedLayerRoute(layer, currentCoordinate)` (already-exported helper) and dispatches via Theia's `commands.executeCommand('omnipanel.intent.dispatch', { requestedExtensionId: layer.bridgeExtensionId, requestedContributionId: 'artifact', coordinate })`. NEVER renders the bridged payload locally.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/bridged-layer-launcher.tsx`
- `grep -n "bridgedLayerRoute\|BridgedLayerLauncher\|omnipanel.intent.dispatch" Body/M/epi-theia/extensions/m0-anuttara/src/browser/`
- launcher test asserts click on M0-4' card dispatches with `requestedExtensionId: 'm4-nara'` and current coordinate; never reads protected-local payload directly
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.7 — Implicate / Explicate toggle *(no-orphan-fill; resolves O-WC-M0-1)*

**Source rows:** WC-M0-08.
**Deliverable:** New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/implicate-explicate-toggle.tsx`. Two-state toggle (`'implicate' | 'explicate'`) rendered to the right of the Layer Selector (21.1). When `implicate`: per-layer panels render with the M0-side reading (e.g. M0-0' shows `c_1_form` ground-state; M0-5' bridges to pedagogy as forward-projection). When `explicate`: panels render with the Pratibimba-return reading (e.g. M0-0' shows `c_1_complete_formulation` as articulated explicate; M0-5' shows M5 atelier route as completed reading). Implements as a `mode: 'implicate' | 'explicate'` field in `M0InspectorModel`; selectors keyed off mode. NO new gateway calls. State preserved via `currentStateSelectors` (cross-link 15.7 BimbaPratibimbaUiState). Implicit Möbius hint inline: small lemniscate glyph visible during transition (CSS only, no animation library).

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/implicate-explicate-toggle.tsx`
- `grep -n "ImplicateExplicateToggle\|implicate\|explicate\|M0SurfaceMode\b" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- inspector test asserts implicate mode emits `c_1_form` priority + explicate mode emits `c_1_complete_formulation` priority for the same payload
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.8 — Archetype Routing Reader panel *(first-build; cross-link 19.1 ARCHETYPE_LUT ordering fix)*

**Source rows:** WC-M0-09, WC-M0-15.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/archetype-routing-panel.tsx`. Mounts inside the M0-0' Language Layer panel as a "Routing" sub-tab AND as a standalone affordance when the selected coordinate's payload carries `c_1_archetype_index` ∈ {3, 5, 7, 9}. New inspector selector:

```ts
export interface M0ArchetypeRoutingProjection {
  readonly archetypeIndex: number | null;             // ARCHETYPE_LUT[index]
  readonly routedSubTable: 'ZODIACAL' | 'MONOPOLY' | 'DIVINE_ACT' | 'VIRTUE' | 'NONE';
  readonly subTableRows: readonly M0SubTableRow[];    // ZODIACAL_LUT[12] | MONOPOLY_LUT[7] | DIVINE_ACT_LUT[7] | VIRTUE_LUT[9]
  readonly syntaxLayer: 'speech' | 'relationship' | 'action' | 'completion' | null;
  readonly state: M0ProvenanceState;
}
```

`M0SubTableRow` carries `{ id: number; label: string; symbol: string | null; provenance: string }`. Renderer shows: archetype name + index (e.g. "Archetype 7 — Acts of Śiva / DIVINE_ACT"), syntax-layer label (per Track 19.9: "syntax-of-action"), and the routed sub-table rows as a scrollable list with provenance per row. Sub-table content comes from the kernel-bridge profile payload `payload.m0_routing_lut_snapshot` (consumed read-only; the LUTs themselves live in `.rodata` and are projected through the bridge — no direct `m0.h` import). Cross-link 19.10 Parity Bridge Reader (21.16) for the Arch 3 / 5 / 7 sub-cases.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/archetype-routing-panel.tsx`
- `grep -n "M0ArchetypeRoutingProjection\|routedSubTable\|syntaxLayer" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- panel test asserts Arch 7 input renders DIVINE_ACT rows + syntax-layer `'action'`; Arch 9 renders VIRTUE rows + syntax-layer `'completion'`
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.9 — Contemplation Prompt Panel *(spec-ahead-integration; cross-link 19.3; resolves DR-WC-M0-3)*

**Source rows:** WC-M0-10.
**Deliverable:** New permanent footer at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/contemplation-prompt-footer.tsx`. Permanent across all six layers (per DR-WC-M0-3). Selectors:

```ts
export interface M0ContemplationProjection {
  readonly archetypeIndex: number | null;          // derived from selected coordinate's c_1_archetype_index
  readonly prompt: string | null;                   // CONTEMPLATION_PROMPT_LUT[archetypeIndex] from profile payload
  readonly responseDraft: string;                   // local UI state
  readonly state: M0ProvenanceState;
}
```

UI: a single-line prompt area at the bottom of the widget rendering `prompt`; below it a multi-line `<textarea>` for response. On submit, fires observability event `m0.review.requested` (already-declared `OBSERVABILITY_EVENT_TYPES[1]`) via `M0AnuttaraPublisher.publish` with payload `{ archetypeIndex, prompt, responseText, coordinate, profileGeneration, privacyClass }`. NEVER persists locally — the gateway handles routing to `contemplate_session_close` (Track 19.6). Renders `state === 'blocked'` with a `pending: Track 19.3 — CONTEMPLATION_PROMPT_LUT[12]` label until the LUT is in the profile payload.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/contemplation-prompt-footer.tsx`
- `grep -n "M0ContemplationProjection\|CONTEMPLATION_PROMPT_LUT\|m0.review.requested" Body/M/epi-theia/extensions/m0-anuttara/src/`
- footer test asserts submission with synthetic prompt + draft text emits the observability event with all required payload fields
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.10 — Virtue Witness Panel (the 9-bit witness vector) *(spec-ahead-integration; cross-link 1.10 + 19.6)*

**Source rows:** WC-M0-11, WC-M0-18.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/virtue-witness-panel.tsx`. Replaces the existing third declared view `m0.anuttara.rVirtuePanel` (downgrade to in-widget panel per DR-WC-M0-1). Reads:

```ts
export interface M0VirtueWitnessProjection {
  readonly witnessBits: readonly [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]; // bit per VIRTUE_LUT[9]
  readonly virtueLabels: readonly [
    'Love/Peace', 'Truth', 'Openness/Creativity', 'Joy/Play',
    'Goodness', 'Beauty', 'Life/Nature', 'Wisdom', 'Reality'
  ];
  readonly coherenceScore: number | null;
  readonly unsatisfiedConstraints: readonly string[]; // symbolic-coordinate-strings from Verifier
  readonly state: M0ProvenanceState;
}
```

Reads from `profile.payload.m0_verifier_report` (kernel-bridge projection of `M0VerifierReport` from Track 1.10). UI: nine indicator dots arranged in a 3×3 grid (one per virtue), filled / empty by bit; coherence score as a numeric badge with colour-band (`>= 0.85` green, `>= 0.6` amber, `< 0.6` red); unsatisfied-constraints rendered as a scrollable string list cross-linked to the Symbolic-Coordinate Question Console (21.11) — clicking a constraint opens it in 21.11.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/virtue-witness-panel.tsx`
- `grep -n "M0VirtueWitnessProjection\|witnessBits\|virtueLabels\|coherenceScore" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- panel test asserts a `witnessBits` of `[true,true,false,true,true,false,true,true,false]` renders six filled + three empty in correct positions; coherence score `0.72` renders amber
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.11 — Symbolic-Coordinate Question Console *(spec-ahead-integration; cross-link 1.10, 1.11, 5.21)*

**Source rows:** WC-M0-12.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/symbolic-coordinate-question-console.tsx`. Lists Verifier-emitted symbolic-coordinate-strings (e.g. `#R0-0/1/A-T7-pending?`) read from `profile.payload.m0_verifier_questions: readonly string[]`. New selectors:

```ts
export interface M0SymbolicQuestionRow {
  readonly raw: string;                                       // raw EBNF coordinate-string
  readonly parsed: M0SymbolicCoordinateParse | null;          // parse result via SharedBridgeAdapter
  readonly responseStatus: 'awaiting' | 'parsed' | 'responded' | 'reverified';
  readonly responseText: string | null;
  readonly state: M0ProvenanceState;
}
export interface M0SymbolicCoordinateParse {
  readonly namespace: 'R' | 'L' | 'M' | 'C';                  // R-virtue | L-lens | M-branch | C-family
  readonly coordinate: readonly string[];                     // QL coordinate fragments
  readonly archetypeIndex: number | null;                     // T7 → 7, T9 → 9
  readonly stateMarker: 'pending' | 'unwitnessed' | 'drift' | 'incoherent' | 'violated' | null;
}
```

UI: vertically-scrollable list of question rows; each row shows `raw` string, parse-result summary (namespace+coordinate+archetype+marker), a free-text response box, and a status pill. Submit dispatches via `SharedBridgeAdapter.invokeCapability({ method: 'invokeGatewayRpc', params: { gatewayMethod: "s0'.verifier.respond_question", coordinateString: raw, responseText } })` — Track 5.21 anuttara-symbolic-parse skill handles the round-trip. Status pill flips: `awaiting → parsed → responded → reverified`. NEVER parses the EBNF locally — parse is bridge-mediated (Track 5.21 owns the canonical parser).

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/symbolic-coordinate-question-console.tsx`
- `grep -n "M0SymbolicQuestionRow\|m0_verifier_questions\|s0'.verifier.respond_question" Body/M/epi-theia/extensions/m0-anuttara/src/`
- console test asserts a synthetic `#R0-0/1/A-T7-pending?` row renders with `archetypeIndex: 7`, `stateMarker: 'pending'`; submit dispatches gateway RPC with correct method + params
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.12 — Reading / Authoring mode toggle *(extend existing; consumes DR-M0-1 RESOLVED)*

**Source rows:** WC-M0-13, WC-M0-14, DR-WC-M0-2.
**Deliverable:** Replace the static "M5 action hooks" section in `m0-anuttara-widget.tsx` with a mode-keyed actions panel. New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/mode-toggle.tsx` — two-state `M0SurfaceMode = 'reading' | 'authoring'` toggle. Mode state held in widget; default `'reading'`. In `'reading'` mode the panel renders only the `deposit-graph-readiness-evidence` action and a "Switch to Authoring" affordance. In `'authoring'` mode the panel renders all three M5-routed actions (`open-language-development-route`, `deposit-graph-readiness-evidence`, `request-anuttara-review`) **plus** two deep-link buttons:

- `Open in Canon Studio` → `cross-layout-intent-dispatcher` dispatch `{ requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'canonStudio', coordinate }`
- `Open in Logos Atelier` → `{ requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'logosAtelier', coordinate }`

Authoring-mode banner: `Per DR-M0-1: M0' never mutates canon. Routed-write via M5 atelier governance.` rendered with provenance-state `derived`. Invariant: `m0-inspector.ts.actions[*].mutatesGraphCanon === false` must remain `false as const` — verify by grep.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/mode-toggle.tsx`
- `grep -n "M0SurfaceMode\|mode-toggle\|canonStudio\|logosAtelier\|Per DR-M0-1" Body/M/epi-theia/extensions/m0-anuttara/src/`
- `grep -nE "mutatesGraphCanon: false as const|mutatesGraphCanon: false," Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts | wc -l` returns ≥ 4 hits (one per action + interface)
- mode-toggle test asserts authoring-mode renders both deep-link buttons and the DR-M0-1 banner; reading-mode hides routed-write affordances
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.13 — Syntax-Layer Reader sub-panels (Arch 3 speech / 5 relationship / 7 action / 9 completion) *(no-orphan-fill; cross-link 19.9)*

**Source rows:** WC-M0-15.
**Deliverable:** Four small sub-panels mounted inside the Archetype Routing Reader (21.8), one per odd archetype index, in `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/`:

- `arch3-speech-panel.tsx` (Vāk / ZODIACAL — 12 rows)
- `arch5-relationship-panel.tsx` (Mono-Poly / MONOPOLY — 7 rows)
- `arch7-action-panel.tsx` (Acts of Śiva / DIVINE_ACT — 7 rows)
- `arch9-completion-panel.tsx` (Parameśvara / VIRTUE — 9 rows; cross-link 21.10 Virtue Witness)

Each panel renders the routed sub-table row-by-row + a "Why this question right now?" tooltip linking the Contemplation Prompt footer (21.9) keyed to the archetype. Selector: `M0SyntaxLayerProjection = M0ArchetypeRoutingProjection['routedSubTable']` (sub-table already projected by 21.8). Panels mount lazily — only when the active archetype matches.

**Verification:**
- `test -d Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers`
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/arch9-completion-panel.tsx` (and the other three)
- panel test asserts Arch 9 panel renders 9 VIRTUE rows in canonical order (Love/Peace at index 0 through Reality at index 8) and cross-links the 21.10 witness panel
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.14 — Lazy 96-Node Browser panel *(first-build; resolves O-WC-M0-3)*

**Source rows:** WC-M0-16.
**Deliverable:** New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/lazy-node-browser-panel.tsx`. Mounts as a sub-tab of the M0-0' Language Layer (per DR-WC-M0-1 stacked tab). Provides paginated browsing of the 96-node residual set (108 total − 12 LUT-lifted) per `Body/S/S0/epi-lib/docs/m0-dataset-audit.md`. UI: sub-branch selector (`#0-0 4-Fold Zero / #0-1 Emergence / #0-2 8-Fold Virtues / #0-3 Archetypal Number / #0-4 Holographic Matrix / #0-5 Śiva-Śakti`), node list within sub-branch (paginated 20-at-a-time), node-detail card on click. Fetches via `SharedBridgeAdapter.invokeCapability({ method: 'invokeGatewayRpc', params: { gatewayMethod: 's2.graph.list', coordinatePrefix: '#0-N', limit: 20, offset } })` (consume — no new gateway method). Each node card shows: coordinate, name, symbol, `c_1_form`, an "Open in panel" button that updates the parent widget's selected coordinate (re-routes the active layer panel). Pagination state held locally; selected coordinate dispatched up via existing `CoordinateContext` bridge update.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/lazy-node-browser-panel.tsx`
- `grep -n "LazyNodeBrowser\|s2.graph.list\|coordinatePrefix" Body/M/epi-theia/extensions/m0-anuttara/src/browser/`
- browser test asserts pagination request for `#0-3` sends `offset: 0, limit: 20`; second page sends `offset: 20`; node-card click updates `selectedCoordinate` context
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.15 — 16-Fold Void-Structure ring renderer *(first-build; resolves O-WC-M0-2)*

**Source rows:** WC-M0-17.
**Deliverable:** New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/void-structure-ring.tsx`. Mounts inside the Language Layer panel (21.2) when the active sub-branch is `#0-4` Holographic Matrix. Renders 16 sacred-circle divisions as an SVG ring (CSS-driven; no canvas library) at fixed 240×240 px. Each division is a clickable arc carrying `{ lensIndex: 0-15, lensCoordinate: string, label: string }` projected from `profile.payload.m0_void_structure_ring: readonly M0VoidLens[]`. Selector:

```ts
export interface M0VoidLens {
  readonly lensIndex: number;                // 0..15
  readonly coordinate: string;               // e.g. "#0-4-{n}"
  readonly label: string;
  readonly state: M0ProvenanceState;
}
```

Click on an arc updates `selectedCoordinate` in the widget's `CoordinateContext`. Ring renders provenance-state per arc (filled = canonical, dotted = canonical_absent, red = blocked). Visual contract: arcs equal, 22.5° each, paired faces (lens 0/8, 1/9, 2/10... — bimba ↔ pratibimba conjugation) lightly shaded as belonging to the same axis.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/void-structure-ring.tsx`
- `grep -n "VoidStructureRing\|M0VoidLens\|m0_void_structure_ring\|lensIndex" Body/M/epi-theia/extensions/m0-anuttara/src/`
- ring test asserts 16 arcs render with `aria-label` containing the lens coordinate; click on arc 7 sets selected coordinate
- `pnpm --filter @pratibimba/m0-anuttara build`

### 21.16 — M0/M2 Parity Bridge Reader *(spec-ahead-integration; cross-link 19.10)*

**Source rows:** WC-M0-19.
**Deliverable:** New sub-panel inside the Archetype Routing Reader (21.8) at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/parity-bridge-reader.tsx`. Activates conditionally on the active archetype:

- Arch 3 active → renders `M0_M2_ZODIACAL_BRIDGE[12]` (one row per sign, columns `{ vak_symbol, m0_resonance_idx, m0_successor, element, mode, m2_sign_idx, decan_planets[3], first_decan_idx_72 }`)
- Arch 5 active → renders `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` (one row per lens, columns `{ lens_coordinate, lens_name, planet_name, planet_id }`; 6 + Saturn-as-7th-boundary)
- Arch 7 active → renders `ALCHEMICAL_TO_TATTVIC[6]` (one row per element, columns `{ alchemical_name, tattvic_name, m_elem_id, cycle_point }`; Salt-not-Mineral naming per Track 19.10 + 05.16)

Selectors:

```ts
export interface M0ParityBridgeProjection {
  readonly zodiacalBridge: readonly M0M2ZodiacalRow[] | null;
  readonly psychoidPlanetary: readonly M0PsychoidRow[] | null;
  readonly alchemicalToTattvic: readonly M0AlchemicalRow[] | null;
  readonly state: M0ProvenanceState;
}
```

All payloads come from `profile.payload.m0_m2_parity_bridges` (projection landed by Track 19.10). Render `state === 'blocked'` with `pending: Track 19.10 — M0/M2 parity bridges` until landing.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/parity-bridge-reader.tsx`
- `grep -n "M0_M2_ZODIACAL_BRIDGE\|PSYCHOID_PLANETARY_CORRESPONDENCE\|ALCHEMICAL_TO_TATTVIC\|m0_m2_parity_bridges" Body/M/epi-theia/extensions/m0-anuttara/src/`
- panel test asserts Arch 5 input renders 7 rows with the Saturn-as-parent-7th case at index 6; Arch 7 input renders 6 rows with `M_ELEM_SALT` at index 5 (NOT `MINERAL`)
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.17 — Layout-aware widget placement (compact card in `daily-0-1`, main editor in `ide-deep`) *(extend existing; cross-link 15.3)*

**Source rows:** WC-M0-21.
**Deliverable:** Extend `frontend-module.ts` to register a layout-conditional placement. Default `defaultWidgetOptions: { area: 'main' }` retained for `ide-deep`. For `daily-0-1`, register the existing `M0CoordinateSummaryCard` from `TRACK_08_CONTRIBUTION.compactViews` against the cosmic-side activity-bar slot (per Track 15 §"Cosmic-side of daily-0-1: Bimba Graph Viewer"). New file `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/m0-coordinate-summary-card.tsx` (the named export referenced but currently absent). Card renders: coordinate, label, active layer label, provenance-state pill, "Open full view" button → dispatches `omnipanel.intent.dispatch` with `requestedLayout: 'ide-deep'` + `requestedExtensionId: 'm0-anuttara'`.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/m0-coordinate-summary-card.tsx`
- `grep -n "M0CoordinateSummaryCard\|compact-card\|requestedLayout: 'ide-deep'" Body/M/epi-theia/extensions/m0-anuttara/src/`
- card test asserts compact-card renders all required selectors (`currentProfile`, `readiness`, `coordinateContext` per `TRACK_08_CONTRIBUTION.compactViews[0].requiredSelectors`)
- `pnpm --filter @pratibimba/m0-anuttara build`
- `pnpm --filter @pratibimba/pratibimba-layouts test` confirms `daily-0-1` layout descriptor accepts the compact card

### 21.18 — Per-layer provenance pills on the Layer Selector *(extend existing; cross-link 15.3 principle 3)*

**Source rows:** WC-M0-22.
**Deliverable:** Extend the Layer Selector (21.1) to render a provenance-state pill per layer tab. New selector `M0InspectorModel.layerReadiness: Record<M0LayerKey, M0ProvenanceState>` populated by `buildM0InspectorModel` based on per-layer payload presence: `language` reads `properties?.c_1_symbol` presence; `ql-structure` reads `properties?.c_1_ql_variant` presence; `relations` reads `node?.relations?.length`; `time-community` reads `payload.gds_community` presence; `personal` always `bridged_local`; `pedagogy` always `bridged_public`. Pill states: `canonical` (green), `canonical_absent` (gray), `derived` (amber), `review_pending` (amber-pulse), `blocked` (red), `bridged_local` (purple), `bridged_public` (blue). Introduce two new states in `M0ProvenanceState` union: `'bridged_local' | 'bridged_public'`.

**Verification:**
- `grep -n "layerReadiness\|bridged_local\|bridged_public" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
- inspector test asserts layer-readiness map is computed for all six keys + bridged layers carry their bridged-state
- `pnpm --filter @pratibimba/m0-anuttara test`

### 21.19 — Layer-aware cross-layout intent target *(spec-ahead-integration; cross-link 11.2)*

**Source rows:** WC-M0-24.
**Deliverable:** Extend `frontend-module.ts` `registerIntentTarget` to accept a `requestedContributionId` carrying an `M0LayerKey`. New intent payload contract:

```ts
export interface M0CrossLayoutIntentPayload {
  readonly requestedExtensionId: 'm0-anuttara';
  readonly requestedContributionId: M0LayerKey | 'graph';   // 'graph' = legacy fallback
  readonly coordinate?: string;
  readonly implicateExplicate?: 'implicate' | 'explicate';
  readonly mode?: M0SurfaceMode;
}
```

On dispatch: opens the widget, sets `activeLayer = payload.requestedContributionId` (when it's an `M0LayerKey`), sets `implicateExplicate` + `mode` if provided. Legacy `'graph'` continues to open the primary view without layer activation. Cross-link Track 11.2 cross-layout intent T5 promotion — this is the m0-anuttara consumer side.

**Verification:**
- `grep -n "M0CrossLayoutIntentPayload\|requestedContributionId\|M0LayerKey" Body/M/epi-theia/extensions/m0-anuttara/src/browser/frontend-module.ts`
- intent test asserts dispatch with `requestedContributionId: 'relations'` opens widget and sets active layer
- `pnpm --filter @pratibimba/m0-anuttara test`
- `pnpm --filter @pratibimba/omnipanel-shell test` (cross-link confirms envelope shape)

### 21.20 — Active-layer state persistence across `daily-0-1` ↔ `ide-deep` toggle *(spec-ahead-integration; cross-link 15.7 BimbaPratibimbaUiState)*

**Source rows:** WC-M0-25.
**Deliverable:** Extend `TRACK_08_CONTRIBUTION.currentStateSelectors` in `index.ts` with a new selector:

```ts
{
  id: 'm0-anuttara.activeLayer',
  source: 'shared-bridge',
  reads: ['activeLayer', 'implicateExplicate', 'mode']
}
```

Plumb the three fields through `SharedBridgeAdapter` state. On layout toggle (Track 15.7), the bridge DI singleton preserves these fields just like `coordinate`, `lens`, `mode`, `profileGeneration`. New file `Body/M/epi-theia/extensions/m0-anuttara/src/browser/state/m0-surface-state.ts` exporting `M0SurfaceState { activeLayer: M0LayerKey; implicateExplicate: 'implicate' | 'explicate'; mode: M0SurfaceMode }` + a deserialiser from bridge payload. Widget reads on `postConstruct` + writes on every state change.

**Verification:**
- `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/state/m0-surface-state.ts`
- `grep -n "M0SurfaceState\|m0-anuttara.activeLayer\|implicateExplicate" Body/M/epi-theia/extensions/m0-anuttara/src/`
- state test asserts toggle from `daily-0-1` to `ide-deep` preserves `activeLayer: 'relations'` and `mode: 'authoring'`
- `pnpm --filter @pratibimba/m0-anuttara build`
- acceptance-harness assertion (cross-link Track 11.6 + 15.7) extended to cover `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow, m0_active_layer, m0_implicate_explicate, m0_mode)` survives both toggles

---

**End of matrix.**

Wave-C closes the per-extension widget UX of the `m0-anuttara` Theia surface. The substrate scaffold (one widget + inspector + layer-discriminator + contribution contract) is consumed as-is; the six-mode navigation grammar (typed but unrendered in the scaffold) is lifted into a tab-strip; per-layer panels first-build against unowned product-surface ground; the contemplative-axis surfaces (Archetype Routing, Contemplation Prompt, Virtue Witness, Symbolic-Coordinate Question Console, Parity Bridge Reader) consume Track 01.10/01.11 + 19.1/19.3/19.6/19.10 substrate by cross-link only — never duplicating their kernel-side authority. M0/M5 chrome in `ide-shell-m0-m5` (bimba-graph-viewer, canon-studio, coordinate-tree, logos-atelier) is consumed via cross-layout intent dispatch; the m0-anuttara surface never re-implements them. The Reading/Authoring mode toggle ratifies DR-M0-1 at UI level without re-opening the contract decision; `mutatesGraphCanon: false` remains invariant.
