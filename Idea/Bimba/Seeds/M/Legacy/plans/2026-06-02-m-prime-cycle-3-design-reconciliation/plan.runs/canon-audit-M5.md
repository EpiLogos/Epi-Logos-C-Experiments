# Canon Audit: M5-epii

**Auditor scope:** Audits Tranche 06 (M5 Epii reconciliation), Tranche 09 (Integrated bimba-graph reconciliation / Klein seam M0'↔M5-0'), and M5-touching rows of Tranche 10 (kernel-bridge profile contract — 10.M5 in particular, plus M5-relevant rows of 10.1–10.10). Cross-references DR-M5-1 (Pi harness / Anima dispatch / 6 Aletheia subagent techne-guardians), DR-M5-2 (+1=M1-5 sweep), DR-M5-3 (library-pane placement), DR-TUI-1 (Bimba graph + Library Klein seam), DR-B-1/2/3, DR-S4-TECHNE, DR-IG-1.
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (full file, both pages)
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` (lines 1–488 and 489–588)
- `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md` (§0–§1 fully; structural read of the loop)
- `Idea/Bimba/Seeds/M/M5'/frontier-confirmations-and-refinements.md` (§0/1–§2)
- `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m5-reconciliation-matrix.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md`
- `Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md` (lines 0–200, including decisions_carried block + six-coord substrate map)

## Per-row audit

### Tranche 06 — M5 Epii Reconciliation

#### 06.intro — "Aletheia is correctly modeled as Anima-dispatched tool-guardian, not a peer Pi agent"
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:240-249 (DR-B-3 cleanup); Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md:17-19 (decisions_carried)`
- **Current framing in tranche:** Memory invariant honored; do not flag missing `aletheia-agent/agent-contract.json` as blocker.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Honors the user-memory invariant and DR-B-3 cleanup. Tranche correctly refuses the inflation of Aletheia into a peer Pi agent.

#### 06.intro2 — "ACR" framing retained as such in tranche header
- **Status:** WRONG-FRAMING
- **Cited:** `13-decision-register.md:200-212 (DR-M5-1: ACR repurpose to Pi-runtime monitoring); Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md:46 (M5-4' = Pi-runtime monitoring OmniPanel)`
- **Current framing in tranche:** Tranche text refers to ACR as a working unit — header says "Pi-runtime monitoring replacing ACR per DR-M5-1" yet sub-rows (06.3, 06.5) still operate inside `agentic-control-room/`.
- **Canon framing:** Per DR-M5-1 ratified cleanup, the ACR extension is REPURPOSED as Pi-runtime monitoring surface (`13-decision-register.md:204-206`). M5-ARCHITECTURE §1 row M5-4' makes OmniPanel the canonical chrome housing the repurposed substrate.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Each 06.x sub-tranche referring to `agentic-control-room/` should additionally name the OmniPanel reframe target per Tranche 15.2; sub-rows should state "ACR substrate repurposed into omnipanel-shell per DR-M5-1 / DR-TS-4 / DR-TUI-1".

#### 06.1 — Register `s5'.gnostic.*` over production epi-gnostic
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:40 ("RAG-anything substrate (which IS Body/S/S5/epi-gnostic)"); M5'-SPEC.md:110 ("Reached by agents through s5'.gnostic.* gateway methods"); M5-ARCHITECTURE.md:100 (the single load-bearing gateway gap)`
- **Current framing in tranche:** Add `s5'.gnostic.{ingest,query,notebook,status}` over existing epi-gnostic + Aletheia CLI bridge; anti-greenfield.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Spec-named methods + anti-greenfield phrasing match canon. The 4 method names match Aletheia CONTRACT tool surface per M5-ARCHITECTURE.md:67.

#### 06.2 — Author logos-atelier Theia extension
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:45 (M5-5' row — Logos Atelier as 6th surface); M5'-SPEC.md:60 (M5-5 generates etymology graph layer); M5-ARCHITECTURE.md:66 (M5-5' = NEW logos-atelier extension Tranche 06.2)`
- **Current framing in tranche:** New Theia extension consuming Aletheia tools (`aletheia_gnosis_query`, `aletheia_crystallise`, `aletheia_thought_route`) over the etymology namespace via 06.1's `s5'.gnostic.*`. Scent-following: root → cognate → drift → psychoid charge → pros-hen → Möbius write-back.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit anti-greenfield note that Anima dispatches Aletheia tools per DR-B-3 (the tranche should route Aletheia calls through `s4'.mediation.route` Anima dispatch, not as a direct Aletheia invocation from the extension). Cite epii-ux §316-319 Klein seam: the Atelier IS the surface where you traverse the etymology layer of the Klein-joined map↔library.

#### 06.3 — Six operational-capacity panes over `capacity_workflows.rs`
- **Status:** WRONG-FRAMING
- **Cited:** `13-decision-register.md:628-636 (DR-TS-4 downgrade: NO new operational-capacity OmniPanel tabs); 13-decision-register.md:632 ("Tranche 12.5 (six per-capacity panes over capacity_workflows.rs) remains valid as M5-4 agentic-control-room surface work, NOT as OmniPanel tabs")`
- **Current framing in tranche:** "Six per-capacity panes in `agentic-control-room/`" driven by `capacity_workflows.rs`.
- **Canon framing:** DR-TS-4 explicitly retains the six per-capacity panes as ACR / agentic-control-room (now OmniPanel-housed) surface work, NOT as OmniPanel tabs. The tranche framing is structurally correct — but it must reflect the housing reframe: the six panes live in the repurposed `omnipanel-shell` substrate, not as standalone ACR panes.
- **Recommendation:** REWRITE
- **Recommendation detail:** Reword as "Six per-capacity panes within the omnipanel-shell-housed M5-4 agentic membrane (the ACR substrate reframe per Tranche 15.2 + DR-TS-4)". Substrate citation to `capacity_workflows.rs` stays solid; framing must name the chrome correctly.

#### 06.4 — Canon Studio + Backend Studio Theia extensions
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:41 (M5-1' = Theia markdown editor + QL/bimba decoration + wikilink autocomplete via s1'.semantic.*); M5'-SPEC.md:42 (M5-2' = LSP + S' kernel + S-stack surfaces); m5-prime-system-shape-and-tauri-ide-canon.md:55 (Smart Connections semantic-input via s1'.semantic.*); m5-prime-system-shape-and-tauri-ide-canon.md:235 (markdown canon-studio = primary editor in IDE chrome)`
- **Current framing in tranche:** Two named extensions canon-studio + backend-studio with LSP contributions (rust-analyzer/clangd/pylsp).
- **Recommendation:** AUGMENT
- **Recommendation detail:** Cite system-shape §233-235 explicitly. Note that canon-studio is M0/M5 IDE chrome integration per `m5-prime-system-shape-and-tauri-ide-canon.md:235` — the markdown editor IS canon-studio integrated into the IDE shell, not a side panel. Add anti-inflation note matching DR-TUI-1's discipline: canon-studio is chrome, not a standalone third-party extension.

#### 06.5 — DR-M5-1 + DR-M5-2 register entries (cycle-3 framing of DR-M5-1 to extend constitutional_agents vs document as distinct ontologies)
- **Status:** CONTRADICTS-RATIFIED-DR
- **Cited:** `13-decision-register.md:200-212 (DR-M5-1 ratified 2026-06-02 + cleanup 2026-06-03); 13-decision-register.md:240-249 (DR-B-3); 13-decision-register.md:458-487 (DR-S4-TECHNE)`
- **Current framing in tranche:** Tranche text says DR-M5-1 will "Either extend constitutional_agents to include `pi` (and add `agent_capability_gates.pi`), or explicitly document ACR-governance-roles vs constitutional-roster as **distinct ontologies**."
- **Canon framing:** DR-M5-1 is already RATIFIED (2026-06-02 + cleanup 2026-06-03). The resolution is NOT one of the two options the tranche names. Canonical resolution: Pi is the SINGLE underlying agent harness; Anima is the main dispatcher; SIX Aletheia subagent techne-guardians are Anima-dispatched specialists DURING the Aletheia-crystallisation-mode; the `constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]` array is either deprecated or documented as psyche-aspect rendering material per DR-M5-1 `13-decision-register.md:204-206`. The `AgenticActor` union must collapse to `pi + anima + the 6 Aletheia subagent techne-guardians` per `13-decision-register.md:210`. The Techne entry in the S4 §14 Agent Roster is REMOVED (6 not 7) per `13-decision-register.md:473-474`.
- **Recommendation:** REWRITE
- **Recommendation detail:** Tranche 06.5 must be rewritten to land DR-M5-1's ratified resolution: ACR substrate repurpose, `AgenticActor` collapse to 8 entries (Pi + Anima + 6 Aletheia techne-guardians), Pleroma CONTRACT §Techne addition, S4-SPEC §14 roster correction. DR-M5-2 (+1=M1-5 sweep) is fine as written.

#### 06.6 — `anuttara_trace` orphan-fill referral to Tranche 14
- **Status:** MISSING-CITATION
- **Cited:** `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md:99 (M5-2 exposes anuttara_trace as contemplative offering); Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md:130 (anuttara_trace claim — no gateway-method route; M0-substrate-owner territory)`
- **Current framing in tranche:** Defer to Wave-A M0 owner; record as M5-claim with M0-substrate-owner requirement; read-only, contemplative-offering only.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** No canon binding exists yet; defer correctly identifies the M0-substrate-owner question. Open question for user routed correctly.

### Tranche 09 — Integrated Bimba-Graph Reconciliation

#### 09.intro — "Three live contradictions concentrate here"
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:6-14 (DR-M0-1: governed-route, not full CRUD); 13-decision-register.md:18-26 (DR-M0-2: c_1_* canonical naming); 13-decision-register.md:288-296 (DR-IG-1: c_1_relation_family)`
- **Current framing in tranche:** Names CRUD-vs-governed-route, two-relation-families discriminator, `c_1_*` naming round-trip as the three concentrations.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** All three DRs are now ratified; tranche framing matches.

#### 09.1 — M0' six-layer surface routing model
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:30-38 (DR-M0-3: M0' has six M0-X' data layers); Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:53 (graph viewer is M5' affordance over distinct graph namespaces); Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md:218-227 (four namespaces)`
- **Current framing in tranche:** Six-layer enum + tab routes shared S2 query path; M0 owns spec patch, this tranche owns integrated routing model.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate-grounded and correctly cross-referenced to M0 Track 01.1.

#### 09.2 — Two-relation-families schema discriminator → DR-IG-1
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:288-296 (DR-IG-1 VALIDATED: c_1_relation_family enum)`
- **Current framing in tranche:** Extend schema with `c_1_relation_family` enum {structural, correspondential, kernel_core, inferred, sync, compatibility}.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Ratified DR-IG-1 matches tranche exactly.

#### 09.3 — Image-assets-on-nodes schema slot
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md:34 (B-10 ORPHAN: image-assets-on-nodes UX-asserted, no spec slot)`
- **Current framing in tranche:** Add `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String) to schema + dataset-import lift. Inspector render slot.
- **Recommendation:** AUGMENT
- **Recommendation detail:** The asset-handle gap is genuine and canon-silent. Recommend adding open-question flag for user-validation since this is a NEW schema property without prior DR ratification — substrate findings are real, but the spec slot creation should be DR-tracked.

#### 09.4 — CRUD-vs-governed-route gateway extension → DR-M0-1
- **Status:** WRONG-FRAMING
- **Cited:** `13-decision-register.md:6-14 (DR-M0-1 VALIDATED: downgrade to governed routed-write via M5 atelier; M0' inspector retains mutatesGraphCanon: false)`
- **Current framing in tranche:** Presents (a) extend `s2.graph.{create,update,delete}` and (b) downgrade as if both options were still live.
- **Canon framing:** DR-M0-1 is RATIFIED — option (b) is the resolution: governed routed-write via M5 atelier; option (a) `s2.graph.{create,update,delete}` registration is explicitly REJECTED per `13-decision-register.md:14`.
- **Recommendation:** REWRITE
- **Recommendation detail:** Rewrite 09.4 as governed-routed-write doc-patch implementation, NOT as a contradiction-decision with two options. Cite DR-M0-1 ratification. The tranche becomes a downgrade-to-doc-patch on the UX file plus a no-op on gateway (which retains its current read-only s2.graph methods).

#### 09.5 — One-substrate / three-rendering integration plugin ownership
- **Status:** ALIGNED
- **Cited:** `wave-b-integrated-bimba-matrix.md:30-32 (B-8/B-9/B-12 ALIGNED at substrate / SPEC-AHEAD at composition); Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:53-62 (Graph Namespace Model)`
- **Current framing in tranche:** Author closing contract for `plugin-integrated-1-2-3` for B-8/B-9/B-12.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Cross-link to Track 07.3 is correct.

#### 09.6 — M0-3' synchronic community + diachronic clock overlay
- **Status:** ALIGNED
- **Cited:** `wave-b-integrated-bimba-matrix.md:29 (B-5 SPEC-AHEAD); Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:53-58 (gnosis + bimba namespace, world_clock)`
- **Current framing in tranche:** Wire `gds_tangent_overlay()` through kernel-bridge into M0-3' panel distinguishing community vs world_clock + Graphiti episode handles.
- **Recommendation:** KEEP-AS-IS

#### 09.7 — One-substrate / no-fork invariant codification
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:53 ("The graph viewer is a shared M5' affordance over distinct graph namespaces, not a single flattened graph"); M5'-SPEC.md:60-62 (namespace boundaries are load-bearing)`
- **Current framing in tranche:** Codify B-8 non-fork invariant; cross-reference in M0'/M2'/M3' SPECs and plugin contract.
- **Recommendation:** KEEP-AS-IS

#### 09.8 — Anuttara property naming round-trip → DR-M0-2
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:18-26 (DR-M0-2 VALIDATED: c_1_* canonical, symbol/formulation_type alias-only)`
- **Current framing in tranche:** Either rename inspector keys to `c_1_*` raw, or formalize normalization in `OntologyPropertyMapping`.
- **Recommendation:** AUGMENT
- **Recommendation detail:** DR-M0-2 ratified the resolution: `c_1_*` canonical, alias-mapped via `OntologyPropertyMapping`. Rewrite the "either/or" framing — there is no live choice; the path is formalize the normalization mapping with inspector reading `c_1_*` canonical form and displaying alias-label for human readability.

#### 09.x — MISSING: explicit Klein-seam M0'↔M5-0' wiring (per DR-TUI-1)
- **Status:** MISSING-CITATION
- **Cited:** `13-decision-register.md:586-616 (DR-TUI-1 VALIDATED with CANON ALIGNMENT); Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md:316-330 (Klein seam via bimba_coordinate + bimba_resonances coordinate-tagging; "you do not search the library; you traverse the map")`
- **Current framing in tranche:** Tranche 09 does NOT contain a row wiring the M0' chrome ↔ M5-0' library chrome Klein seam — even though Tranche 09 is titled "Integrated Bimba-Graph Reconciliation" and Tranche 06 doesn't pick up the seam either.
- **Canon framing:** Per DR-TUI-1, the M0' graph (chrome) and M5-0' library (chrome) are ONE Klein surface joined by `bimba_coordinate` direct + `bimba_resonances` LLM-classified per epii-ux §316-319. The seam is the cycle-3 wiring work that this tranche should own.
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add Tranche 9.x "Klein-seam M0' graph ↔ M5-0' library coordinate-tagging" — wire `bimba_coordinate` + `bimba_resonances` on every gnostic chunk; surface map-walk-resonates-corpus + corpus-read-lights-coordinates affordance. Verification per DR-TUI-1: `grep -rn "bimba_coordinate\|bimba_resonances" Body/S/S5/epi-gnostic/` returns the coordinate-tagging schema.

### Tranche 10 — Kernel-Bridge / Profile-Contract Readiness Ledger (M5-touching rows only)

#### 10.M5 — M5' Profile Projections (`epii_review_workbench` + `canon_recognition_anchor`)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:150-154 ("M5' is where the system can review and teach the fact that its M-stack embodies 137 = 64 + 72 + 1"); Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:42 (M5-4' governance reads from capability-matrix + epii-agent contract); 13-decision-register.md:200-212 (DR-M5-1: six operational-capacity governance lanes)`
- **Current framing in tranche:** `epii_review_workbench: EpiiReviewWorkbenchProjection` (six operational-capacity governance lanes + recursive-self-review gate state) and `canon_recognition_anchor: CanonRecognitionAnchor` (137 = 64+72+1 attribution chain through to Logos Atelier).
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit cross-reference: the "six operational-capacity governance lanes" must be the same six Aletheia techne-guardian classes per DR-S4-TECHNE (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven), NOT a separate set of capacity lanes that map cleanly to the six M-subsystems. The recursive-self-review gate state must enforce DR-M5-1 (agent-cannot-approve-recursive-self-modification — per `epii-surface.ts:393-396` cited in M5-ARCHITECTURE.md:180). Also note `canon_recognition_anchor` is the substrate carrier for the Klein-seam coordinate-tagging streaming up the profile bus.

#### 10.4 — DR-KB-2 `depositionAnchor` typed-field
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:264-272 (DR-KB-2 VALIDATED: typed MathemeHarmonicProfile field; bridge DTO follows)`
- **Current framing in tranche:** Decide typed field vs bridge DTO.
- **Recommendation:** REWRITE
- **Recommendation detail:** DR-KB-2 is RATIFIED — typed field is the resolution. Rewrite from "decide" to "land typed `pub deposition_anchor` on `MathemeHarmonicProfile` at kernel.rs:346-387; bridge JSON emit reads the struct field instead of synthesizing".

#### 10.6 — Bridge contract test: six-axes-of-72 carrier round-trip
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:118 ("resonance72" required field); 13-decision-register.md:80-86 (DR-M2-2 six axes of 72)`
- **Current framing in tranche:** Verify resonance72 transport; M2 owns decoder.
- **Recommendation:** KEEP-AS-IS

#### 10.IG — Integrated Plugin Profile Projections (4-5-0 row touching M5)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:152 (Möbius-return from M5 back to M0 is the canon's self-cleaning loop); Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md:265-273 (4/5/0 recognition seam)`
- **Current framing in tranche:** `canon_recognition_stream` Möbius write-back from Logos Atelier back to M0-5' pedagogy.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Note that "M0-5' pedagogy" is ambiguous — the canon path is M5-5' Atelier crystallisations Möbius-back through M5-1' Canon Studio review → M0' canonical bimba ground per epii-ux §279-289. Tighten the projection name and target citation.

### Tranche 10 carry-over M5 fields (not direct tranche rows but profile-ledger digest)

#### 10.digest:pointerAnchor (M5'-SPEC owner)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:119 ("pointerAnchor: coordinate, relation descriptors, qvdata/source/spec/code/test anchors, graph-law provenance")`
- **Current framing in tranche:** Already ALIGNED in the digest.
- **Recommendation:** KEEP-AS-IS

#### 10.digest:depositionAnchor (M5'-SPEC owner)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md:120 ("depositionAnchor: DAY/NOW/session, episode handle, privacy class, source file/test/spec anchors"); 13-decision-register.md:264-272 (DR-KB-2 ratified)`
- **Current framing in tranche:** SPEC-AHEAD → DR-KB-2 (10.4).
- **Recommendation:** KEEP-AS-IS (resolution path correct; see 10.4 rewrite)

## Drift patterns observed

The cycle-3 M5 tranches show three drift patterns. First, **stale "either/or" framings** in rows that reference now-ratified DRs — Tranches 06.5, 09.4, 09.8, and 10.4 each present a decision-still-pending posture against DRs that are already validated (DR-M5-1, DR-M0-1, DR-M0-2, DR-KB-2). The substrate citations are accurate but the framing pretends the user has not yet decided. Second, **collapsed register / inflated ontology in DR-M5-1**: Tranche 06.5 names DR-M5-1 as choosing between "extend constitutional_agents to include `pi`" and "document ACR-governance-roles vs constitutional-roster as distinct ontologies" — both options contradict the ratified DR (Pi is the SINGLE agent harness; Anima dispatches; SIX Aletheia subagent techne-guardians; constitutional_agents array deprecated or reframed as psyche-aspect rendering material). This is a direct CONTRADICTS-RATIFIED-DR drift. Third, **stale chrome attribution**: Tranche 06 retains "ACR" framing in sub-rows even though the header acknowledges the DR-M5-1 repurpose to Pi-runtime monitoring / OmniPanel, and Tranche 09 misses the canon-mandated Klein seam (DR-TUI-1) between M0' graph chrome and M5-0' library chrome — both are IDE chrome per `m5-prime-system-shape-and-tauri-ide-canon.md:234, 553`, joined by `bimba_coordinate` + `bimba_resonances` coordinate-tagging per epii-ux §316-319. The seam wiring is the cycle-3 work and it has no tranche row.

## Tranche augmentation / removal / addition recommendations

- **ADD:** New Tranche 9.x — Klein-seam M0' graph chrome ↔ M5-0' library chrome coordinate-tagging wiring. Cited: `13-decision-register.md:586-616 (DR-TUI-1); epii-ux §316-319`. Verification: `grep -rn "bimba_coordinate\|bimba_resonances" Body/S/S5/epi-gnostic/` returns coordinate-tagging schema; map-walk → library-surface tests pass.
- **REMOVE:** Nothing wholesale; downgrade Tranche 09.4 from contradiction-decision to doc-ahead-landing per DR-M0-1.
- **REWRITE:** Tranche 06.5 DR-M5-1 entry to land ratified resolution (Pi single harness + Anima dispatch + 6 Aletheia subagent techne-guardians; AgenticActor union collapse to 8; constitutional_agents deprecation or psyche-aspect reframe; S4-SPEC §14 roster correction). Tranche 06.3 to name the omnipanel-shell housing per DR-TS-4. Tranche 10.4 to land typed `deposition_anchor` directly (DR-KB-2 ratified).
- **AUGMENT:** Tranche 06.intro2 to thread the ACR-repurpose-to-Pi-runtime framing into every 06.x sub-row that touches `agentic-control-room/`. Tranche 06.4 to cite system-shape §233-235 explicitly. Tranche 06.2 to add Anima-dispatch routing per DR-B-3. Tranche 09.3 to flag the new schema property as DR-needing-validation. Tranche 09.8 to drop the "either/or" framing and land DR-M0-2's resolution directly. Tranche 10.M5 to align the six operational-capacity lanes with the six Aletheia techne-guardian classes per DR-S4-TECHNE.
- **NEW TRANCHE PROPOSAL:** Tranche 06.7 — DR-M5-1 ratified implementation landing tranche: `AgenticActor` union collapse + Pleroma CONTRACT §Techne addition + S4-SPEC §14 roster correction + capability-matrix.json `constitutional_agents` array audit (deprecate or document as psyche-aspect rendering material). Anti-greenfield: all four are doc/contract edits over ratified DR.

## Open questions for user

- **anuttara_trace owner and shape.** `epii-ux-full-m5-branch.md:99` names `anuttara_trace(output, sensitivity, depth)` as a read-only contemplative-offering API at M5-2. M5-ARCHITECTURE.md:130 confirms it is M0-substrate-owner territory but has no gateway-method route and no implementing carrier. Canon-silent on ownership. Wave-A M5 anomaly `O-M5-1` defers to Wave-A M0; if M0 does not claim, user final-validation needed.
- **constitutional_agents disposition.** DR-M5-1 `13-decision-register.md:204-206` offers two paths for the `constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]` array: (1) document as psyche-aspect rendering material, or (2) deprecate outright if audit finds no canonical use. The ratified DR text leaves this final disposition to the audit. User-validation needed once the audit completes.
- **Schema slot DR for image-assets-on-nodes.** `c_1_asset_uri` + `c_1_asset_kind` (Tranche 09.3) are NEW schema properties without a ratified DR-IG-* row. The substrate gap is real (only true schema-property gap in wave-b-integrated-bimba; per `wave-b-integrated-bimba-matrix.md:34` B-10 ORPHAN), but a DR row would be canon-proper given the load-bearing schema impact.
