# Track 16 — Cross-Cutting Closures (CCT-1..8)

The Phase-B cross-boundary verifier surfaced eight cross-cutting work items that no single per-domain tranche owns. They emerged from comparing the eight M' total-shape architecture documents against each other and against cycle-3 invariants. Each item is binding closure work for cycle-3 and must complete before cycle-3 release gates pass.

## Source

- Phase-B verification report: [`plan.runs/phase-b-verification-report.md`](plan.runs/phase-b-verification-report.md)
- The eight Phase-A architecture docs:
  - `Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md`
  - `Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`
- Pattern exemplar: `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`

## Tranches

1. **CCT-1 — Synchronised Klein-flip propagation at personal scale** *(spec-ahead-integration; depends on DR-IG-2, DR-IG-3)*

   When the kernel-bridge fires `KleinFlipEvent` at tick 5→6, three downstream surfaces must retune within one render frame: (a) M3 codon-rotation axis flips at personal scale (per DR-IG-3); (b) M4 personal-pole `q_composed` re-reads through the Vāma classifier (per Tranche 05.7 clause 4); (c) integrated 4-5-0 lemniscate sweep re-anchors. No surface lags. Acceptance: a single profile-tick replay produces deterministic same-frame state at all three.

   Verification: `cargo test -p portal-core --test klein_flip_personal_scale_propagation`; visual-regression baseline asserts identical-frame retune across the three surfaces.

2. **CCT-2 — Cymatic-surface pin to torus inside cosmic composition** *(contradiction-decision-execution; depends on DR-IG-5)*

   On DR-IG-5 ratification: enforce `plugin-integrated-1-2-3` composition contract that M2 cymatic surface renders as K² texture parameterisation, not as standalone plate/sphere. Standalone `m2-parashakti` extension retains toggle. Composition contract test rejects non-torus M2 contribution at composition load.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test`; composition load-time test confirms M2 contribution surface === 'torus'.

3. **CCT-3 — Geometric-scaffold terminology unification + dipyramid topology correction** *(doc-ahead-landing; DR-IG-6 VALIDATED 2026-06-03 with corrected geometry)*

   Corpus-wide sweep adopting **"dipyramid + Hopf-linked tori"** as canonical for the M4-5' psychoid cymatic field renderer. "Psychoid torus" downgrades to colloquial UX prose only.

   **Corrected dipyramid topology (per DR-IG-6):** the dipyramid maps the **full 6+6 = 12 positions** of P and P' series simultaneously — **NOT 6 vertices** as earlier docs implied:
   - **2 apex poles** = P5 (top) + P5' (bottom)
   - **4 top-square base vertices** = P1, P2, P3, P4
   - **4 bottom-square base vertices** (interleaved per `x + y' = 5` mirror law) = P1', P2', P3', P4'
   - **1 central axis-point** (NOT a vertex) = P0 / P0' — projected through the dipyramid axis from base-square centre to both poles
   - **Total: 10 vertices + 1 axis-point** carrying 12 P/P' labels

   Sweep paths: `M4-ARCHITECTURE.md §388` (corrected 2026-06-03), `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` (corrected 2026-06-03), `M4'-SPEC`, paramasiva-ux contexts mentioning M4, Tranches 05.5 + 08.4.

   Verification: `grep -rn 'dipyramid.*6 vertices\|dipyramid.*six vertices' Idea/Bimba/Seeds/M/ Idea/Pratibimba/System/` returns no live wrong-count attributions; `grep -rn 'psychoid torus' Idea/Bimba/Seeds/M/ Idea/Pratibimba/System/Subsystems/Nara/` returns only colloquial-marked instances; `grep -rn 'dipyramid.*P5/P5\\|dipyramid.*axis-point\\|central axis-point' Idea/Bimba/Seeds/M/` returns the corrected framing.

   Verification: `grep -rn "psychoid torus" Idea/Bimba/Seeds/M/ Idea/Pratibimba/System/Subsystems/Nara/` returns only colloquial-marked instances.

4. **CCT-4 — `torus_knot_phase` single-source audit** *(code-pending-closure; depends on DR-IG-4)*

   On DR-IG-4 ratification: enforce `MathemeHarmonicProfile.m1_topology.torus_knot_phase` as the single source. Audit removes any parallel definition in INTEGRATED-1-2-3 plugin types. Bridge JSON emit reads from struct.

   Verification: `grep -rn "torus_knot_phase" Body/S/S0/portal-core/src Body/M/epi-theia/extensions/` returns exactly one definition site.

5. **CCT-5 — Klein-flip event variant unification** *(code-pending-closure; depends on DR-IG-2)*

   On DR-IG-2 ratification: land the three-variant `KleinFlipEvent` enum at `Body/S/S0/portal-core/src/events.rs`. Variants: `M1TritoneCrossing`, `M2CymaticValenceInvert`, `M3CodonRotationCross`. Bridge subscribers (M1/M2/M3 + integrated 1-2-3) match exhaustively.

   Verification: `cargo check -p portal-core && cargo test -p portal-core --test klein_flip_event_variants_exhaustive`; bridge JSON edge emits all three variant kinds.

6. **CCT-6 — `bedrock_link` ownership and computation** *(no-orphan-fill)*

   Verifier surfaced `bedrock_link` (the kernel-substrate provenance chain that proves a profile-field value derives deterministically from `.rodata`) as a load-bearing concept without an owner. Owner: Tranche 10 kernel-bridge readiness contract. Implementation: extend `MathemeHarmonicProfileReadinessFact` with a `bedrock_link: BedrockProvenanceHandle` enum naming the substrate `.rodata` chain.

   Verification: `grep -n "bedrock_link\|BedrockProvenanceHandle" Body/S/S0/portal-core/src/kernel.rs`; readiness ledger renders bedrock_link inline per Tranche 15.6 provenance discipline.

7. **CCT-7 — `PatternPacket` multi-tranche dependency chain** *(spec-ahead-integration)*

   `PatternPacket` (M4-3' day-episode evidence aggregator) is referenced across at least four tranches (05.M4 producer, 10.M4 bus contract, 10.M5 review consumer, 08.X integrated 4-5-0 composition). Verifier flagged that no single tranche owns the chain. Owner: this tranche, which sequences the chain — M4 produces; bus surfaces; M5 review consumes; 4-5-0 plugin composes. Single dependency graph from substrate to composition.

   Verification: `grep -rn "PatternPacket\|pattern_packet_handle" Body/S/S0/portal-core/src/nara_journal.rs Body/M/epi-theia/extensions/m4-nara/src Body/M/epi-theia/extensions/m5-epii/src Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src` returns consistent type usage across all four sites.

8. **CCT-8 — One-Cl(4,2)-type audit across four scales** *(spec-ahead-integration; extends Tranches 02.7, 04.7, 10.7)*

   Verifier consolidated the existing M1 Tranche 02.7 + M3 Tranche 04.7 + kernel-bridge Tranche 10.7 into a single executable closure: produce an audit memo at `plan.runs/cct-8-cl42-four-scale-audit.md` confirming `Body/S/S0/portal-core/src/quaternion.rs` is the single Cl(4,2) primitive consumed by all four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal). Audit lists each consumer's call-site with file:line.

   Verification: `grep -rn "Quaternion\|cl_4_2\|cl42" Body/S/S0/portal-core/src/` returns one canonical type; `test -f plan.runs/cct-8-cl42-four-scale-audit.md`.

## Phase-C Additions (CCT-9..15)

The Phase-C verifier surfaced five additional cross-cutting closures emerging from the S-stack + Theia design fan-out. Follow-up Hen/vault passes add CCT-14 to unify the older Empty node-resolution canon with the landed Smart Env candidate-pool substrate and CCT-15 to materialise the C-layer semantic typology that underwrites World/Types.

9. **CCT-9 — Typed kernel-bridge JSON edge** *(code-pending-closure; foundational consolidation)*

   The single most leveraged cleanup. Consolidates eight separate profile-bus / kernel-bridge additions into one typed-JSON-edge landing. Full execution detail in [`18-typed-kernel-bridge-json-edge.md`](18-typed-kernel-bridge-json-edge.md). Closes Tranches 10.2 + 10.10 + 10.M0..10.IG + CCT-5 + CCT-6 + DR-KB-2 as one coherent PR sequence.

   Verification: see Tranche 18 acceptance gate.

10. **CCT-10 — `@pratibimba/epi-ui-primitives` shared package** *(no-orphan-fill; depends on DR-UI-3, DR-UI-4)*

    Land the shared UI primitives package containing `<ProvenanceBadge>` (per DR-UI-3 / 7-member taxonomy), lemniscate transition shader (per DR-UI-4), `<BedrockLinkTooltip>` (per CCT-6), and the Cl(4,2) colour-binary palette canonicalising the M1-2 played-torus colours for cross-widget consistency. Lives in `Body/M/epi-theia/extensions/epi-ui-primitives/`.

    Verification: `test -d Body/M/epi-theia/extensions/epi-ui-primitives`; Tranche 11.5 lint extends to ban local provenance / transition / palette implementations; every data-rendering M-extension imports from this package.

11. **CCT-11 — `@pratibimba/integrated-composition-contract` shared package** *(no-orphan-fill; depends on DR-UI-5)*

    Land typed `CompositionMountPoint` registry consumed by both integrated plugins (1-2-3 cosmic + 4-5-0 personal). M-extensions declare contributions via `package.json contributes.compositionMountPoints`. Composition resolver validates: no juxtaposition · no missing mount-points · no out-of-domain contributions. Makes Tranche 15.4 verification executable. Lives in `Body/M/epi-theia/extensions/integrated-composition-contract/`.

    Verification: `test -d Body/M/epi-theia/extensions/integrated-composition-contract`; resolver test rejects synthetic side-by-side contribution; both integrated plugins resolve cleanly at load.

12. **CCT-12 — S1 coordinate-residency-on-move enforcement** *(no-orphan-fill; depends on DR-S1-3, DR-M1-4)*

    Land `S1VaultRenameRefusalReason::CoordinateResidencyMismatch` in `hen-compiler-core` with default-REFUSE policy. Files cannot move S1→S2 folders without `coordinate:` frontmatter updating; rename-through-Hen is the only mutation path (per DR-S1-2). Closes the silent-corruption hole that load-bearing DR-M1-4 (Hen vault-instance contract) depends on.

    Verification: `cargo test -p hen-compiler-core --test residency_on_move`; rename test asserts CoordinateResidencyMismatch refusal; default-REFUSE policy active without override flag.

13. **CCT-13 — `c_1_relation_family` typed enum + canonical naming** *(spec-ahead-integration; depends on DR-IG-1)*

    Per S2-ARCHITECTURE.md §5 + new orphan surfaced by Phase-C verifier: `graph_api.rs:323` currently writes `'kernel-resonance'` (hyphen); DR-IG-1 specifies `kernel_core` (underscore). Verify canonical form against existing graph data before landing. Land as typed Rust constant `RELATION_FAMILY_VALUES: &[&str]` + serde-validated enum surface; sweep existing data to canonical form.

    Verification: `grep -rn 'kernel-resonance' Body/S/S2/` returns no live hits after sweep; `cargo test -p epi-s2-graph-schema --test c_1_relation_family_canonical`.

14. **CCT-14 — Hen entity-candidate lifecycle and wikilink intelligence** *(spec-ahead-integration; depends on DR-S1-4, DR-S1-1, DR-S1-2, DR-S1-3, DR-M1-4)*

    Land the missing S1' entity lifecycle over existing substrate. Dangling wikilinks and Obsidian-created loose root notes route through Hen into `Idea/Empty/` or `Idea/Empty/Present/{day}/entities/` as `entity_candidate` artifacts; Smart Env remains a read-only suggestion pool; mdbase/entity-note intelligence is expressed as coordinate-lawful frontmatter and aliases; reviewed candidates promote into coordinate-native `World/Types/Coordinates/**`; stable definitions graduate flat into `World/{Name}.md` with the type-local file retained as a MOC/source pointer. This is not SwarmVault work: SwarmVault remains the Codex/Claude development-ledger sidecar.

    Implementation targets: add `s1'.entity.capture`, `s1'.entity.classify`, `s1'.entity.promote_to_type`, and `s1'.world.graduate` contract/request/receipt types; expose deeper `s1'.semantic.neighbors_of`, `by_block`, and `search` over the existing Smart Env index; extend graph-promotion evidence with `entity_candidate`, `type_source_path`, aliases, candidate state, and World/Types ancestry.

    Verification: `cargo test -p hen-compiler-core --test entity_candidate_lifecycle`; gateway contract tests cover root-note capture, dangling-link capture, Smart Env read-only suggestions, Empty -> World/Types promotion, World/Types -> flat World graduation, and refusal of direct graph mutation from Smart Env.

15. **CCT-15 — C-layer semantic typology and MOC maintenance workflow** *(spec-ahead-integration; depends on DR-S1-5, CCT-14, DR-S1-1, DR-S1-2, DR-S1-3)*

    Materialise `World/Types/Coordinates/C/**` as the primary semantic typology: C0 source/ground, C1 forms/templates, C2 entities/properties/tags, C3 processes/canvases/diagrams, C4 types/contexts/MOCs, C5 crystallisations/Pratibimba. Semantic folders such as templates, entities, properties, tags, diagrams, canvases, and MOCs must live under their C-native authority or remain query views; they must not reappear as top-level `World/Types` peers. Add `s1'.type.classify_c_layer` and graph-promotion evidence fields `semantic_authority` and `c_layer_path`.

    Implementation targets: complete C0-C5 same-name MOC/canvas coverage; expose `s1'.type.classify_c_layer`; make Hen route templates to C1/CT, entities/properties/tags to C2, canvases/diagrams to C3, type authorities/MOCs to C4, and World graduation to C5; audit C-prime branch ancestry before treating [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths as graph-authoritative. Extend `GraphPromotionIntent` and S2 graph promotion with `type_family`, `type_path`, `type_coordinate`, `semantic_authority`, `crystallisation_state`, and `c_layer_path`. Extend S2 coordinate parsing/retrieval with a C-layer/type-ontology search scope so GraphRAG can answer "what kind of thing is this?" by hitting C authority nodes before widening to S/M/P/L qualifiers.

    Cross-track hooks: Track **09.11** owns parser/retrieval/graph migration; Track **09.12** owns Hen graph-promotion evidence; CCT-14 owns the entity-candidate lifecycle that feeds C2/C5.

    Verification: `find Idea/Bimba/World/Types/Coordinates/C -maxdepth 2 -name '*.canvas'` includes C and C0-C5; all canvases parse as JSON; no `World/Types/{Templates,Entities,Properties,Tags,Diagrams,Canvases,Artifacts}` directory exists; `cargo test -p hen-compiler-core --test c_layer_typology_classification`; `cargo test -p epi-s2-graph-services --test coordinate_query_contract c_layer`; live GraphRAG type/entity/diagram queries return C2/C3/C4/C5 authorities before general Bimba map hits.

## Release Gate Integration

CCT-1..15 are added to Tranche 14's G7-G14 release-gate dependencies (see [`14-no-orphan-audit-and-release-gates.md`](14-no-orphan-audit-and-release-gates.md)). Cycle-3 release does not pass until each CCT closes or is explicitly downgraded. **CCT-9 is gating the rest of cycle-3** — every downstream consumer reads the typed JSON edge once 18.1 lands.
