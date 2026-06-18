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

14b. **CCT-14b — Universal entity birth-codon at Hen promotion (codon space as global symbolic substrate)** *(spec-ahead-integration; sub-tranche of CCT-14; depends on 4.16, CCT-14, DR-S1-4; routes to DR-ENTITY-CODON-1; cross-link Tranche 5.27 voice law)*

    Lifts the M3 codon language from "session-internal symbolic register" to **universal symbolic-essence identifier across the system**. Every Hen-promoted canonical entity (Form, Type, MOC canvas, flat /World entity, Pratibimba reflection) receives a `c_5_birth_codon` frontmatter key at promotion time, derived deterministically from its content + creation kairos + creator identity + coordinate ancestry. The codon resolves through the M3 kernel to its chromosomal-territory archetype (Major Arcana), expressional pathway (Minor Arcana rotational class), transcript class, governance role, and inner charges. Same codon language as PASU and sessions — making "what kind of thing is this?" answerable universally via the same symbolic apparatus.

    The protocol is foundational + manipulable by intent: the *seed composition*, *codon-derivation policy*, and *visualisation density* are explicit tunable surfaces. The user, the system's self-awareness loop, or downstream ML training can tune these knobs over time (per the forthcoming M5-2'–M5-4' tunability brainstorm). This tranche lands the minimum foundational structure so that tuning is *possible* without committing to specific tuning values.

    Scope to land:
    - **Frontmatter schema extension**: add `c_5_birth_codon: u8` (range 0..63) as a canonical schema-extending key recognised by [`bimba-vault-validate`](.claude/skills/bimba-vault-validate/SKILL.md), the Hen frontmatter parser ([`Body/S/S1/hen-compiler-core/src/frontmatter.rs`](../../../../../Body/S/S1/hen-compiler-core/src/frontmatter.rs)), and the S2 graph schema regex (CCT-16's regex matcher).
    - **Derived fields** (all computed at promotion, written as plain frontmatter so they're vault-readable without Hen):
      - `c_5_birth_chromosome: <Major Arcana name>` — via [`m3_major_arcana_from_codon`](../../../../../Body/S/S0/epi-lib/src/m3.c:338) (correctly named per closed T19.5).
      - `c_5_birth_rotational_class: dual | non-dual-perfect | non-dual-imperfect | non-dual-non-palindromic` — via `m3_classify_codon`.
      - `c_5_birth_transcript_class: shared | transcribable` — via 4.16.
      - `c_5_birth_governance_role: none | start | stop` — via 4.16. Most entities GOV_NONE; founding Forms / chapter-opener MOCs may carry START; deprecated entities may carry STOP. The choice is *intentional* (entity-author or Hen-policy driven), not arbitrary.
      - `c_5_birth_pp / c_5_birth_nn / c_5_birth_np / c_5_birth_pn: int8` — via `m3_compute_charges`.
    - **Hen integration**: extend [`graph_promotion.rs`](../../../../../Body/S/S1/hen-compiler-core/src/graph_promotion.rs) `GraphPromotionIntent` with `birth_codon_computed`, `birth_codon_provisional → ratified` transition event, and writes the `c_5_birth_*` family at promotion time. Candidates in `Idea/Empty/` carry codons as `birth_codon_state: provisional`; promotion to `World/Types/` flips to `ratified`. Graduation to flat `World/{Name}.md` carries the codon forward unchanged — the territory archetype is invariant across type → flat lifecycle.
    - **CCT-14b sub-tranche — Visualisation hook (build now):** Extend the [`m3-mahamaya`](../../../../../Body/M/epi-theia/extensions/m3-mahamaya/) chromosomal-wheel inspector to render entity-birth-codon density per chromosome — every canonical /World entity becomes a dot on the Major Arcana wheel; the wheel becomes the *map of the system's own symbolic ontogeny*. Consume `c_5_birth_codon` frontmatter via graph query. ~200 LOC.

    **Tunability surface (designed for ongoing dev / system-self-awareness / ML tuning per the foundational-and-manipulable principle):**
    - `hen.birth_codon.seed_composition: ["content_hash", "kairos", "creator_identity", "coordinate_path"]` — array of seed components in priority order. The current default IS the recommended composition; reordering changes determinism behavior. ML-trainable subset: weights per component (future extension).
    - `hen.birth_codon.derivation_policy: "blake3_first_6_bits" | "blake3_modulo_64" | "blake3_xor_fold"` (default `blake3_first_6_bits`) — bit-extraction policy from the BLAKE3 seed. Each is deterministic; they distribute entropy differently across codon space. `blake3_modulo_64` is theoretically more uniform for non-uniform seed-byte distributions.
    - `hen.birth_codon.provisional_recompute_on_edit: bool` (default true) — when true, edits to candidate Form bodies in `Idea/Empty/` trigger recomputation of the provisional codon (since content_hash changes). Setting false freezes the codon at first capture (useful for stability during long candidate-review windows).
    - `hen.birth_codon.governance_role_assignment: "auto" | "manual" | "policy-driven"` (default `auto`) — `auto` always assigns NONE; `manual` reads `c_5_birth_governance_intent: start|stop` from candidate frontmatter (entity-author chooses); `policy-driven` uses Hen heuristics over coordinate ancestry (e.g., MOC canvases at /World/Types/Coordinates/*0/ get START intent by default).
    - `hen.birth_codon.candidate_codon_visible_in_orphan_review: bool` (default true) — show provisional codons in SwarmVault `candidate review` UI so reviewers can spot codon collisions and clustering issues before ratification.
    - `hen.birth_codon.visualisation_density_normalisation: "raw" | "log" | "sqrt"` (default `log`) — how the chromosomal-wheel inspector renders entity density per chromosome.
    - `hen.birth_codon.collision_policy: "first-wins" | "salted-retry" | "warn-and-allow"` (default `warn-and-allow`) — what happens when two entities deterministically hash to the same codon. Collisions ARE expected in a 6-bit space across many entities; the default is `warn-and-allow` because chromosomal-territory clustering IS meaningful (multiple entities sharing an archetype is a legitimate ontological signal, not a bug).

    Defaults are conservative-first and chosen to make the protocol *observable* before it becomes *tuned*: log-normalised visualisation surfaces clustering signals; `warn-and-allow` collision policy doesn't fight ontological reality; provisional recompute keeps candidates honest.

    **CCT-14c sub-tranche — Agent/Tool/DR/Tranche birth-codon extension:** Extend the birth-codon protocol to agents (`Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*.md` — each constitutional agent's `.md` profile becomes its content_hash), tools (each MCP tool's archetypal essence), DR rows (`13-decision-register.md` entries — each decision's symbolic-DNA), and tranches (each Cycle 3 tranche's codon-arc). Same BLAKE3 derivation, same frontmatter keys, different targets. The Hen promotion code already handles the entity case; this sub-tranche generalises the target set. The tunability surfaces under M5-2'–M5-4' refine the per-target seed composition.

    **CCT-14d sub-tranche — Canon-leaf micro-expert terminus (per DR-PARAM-1; depends on DR-ARENA-1, DR-MP-2, Tranche 12.24):** For the **stable-canonical-leaf class** of entity (a /World entity whose facts are stable, finite, and frequently referenced — coordinate definitions, LUT-backed tables, the 72/64/36 reference sets), the entity-candidate lifecycle gains an *optional additional terminal materialization*: alongside the `:World` graph node, the entity's stable leaf-facts are manufactured into a low-rank final-FFN LoRA micro-expert keyed by the entity's `c_5_birth_codon`, written to the coordinate-indexed expert store. The graph node remains the canonical record; the micro-expert is a *derived fast-path artifact* — a Shakti perturbation on the frozen Siva base (DR-ARENA-1) for the local Nara (4') slot. The terminus is **gated, not default**: an entity opts in via `c_4_expert_eligible: bool` (default false; or Hen policy over coordinate ancestry), and only the canon-leaf class qualifies — relational / multi-hop / provenance entities never materialize as experts (they stay graph-only, served by GraphRAG). Stale or edited entities invalidate their expert **by birth-codon** (delete-by-codon = forget — the DMOA hot-swap discipline), consistent with `birth_codon.provisional_recompute_on_edit`. Manufacturing rides Tranche 12.24 (`epii-distillation` `expert` mode + `mlx-lora`); loading/routing rides the `s5'.gnostic.query_with_layers` 4th layer (Track 39), EBM-energy-gated (`E = ‖q_b − q_p‖²`, DR-MP-2). Scope to land here: the `c_4_expert_eligible` schema key (CCT-16 regex), the `birth_codon → expert_store` index write in [`graph_promotion.rs`](../../../../../Body/S/S1/hen-compiler-core/src/graph_promotion.rs), and the delete-by-codon invalidation hook. **Verification:** `cargo test -p hen-compiler-core --test canon_leaf_expert_terminus_gated` — an `c_4_expert_eligible: true` canon-leaf entity emits both a `:World` node and an expert-store index entry keyed by its codon; a relational entity emits graph-only; an edit invalidates the prior-codon expert.

    **Verification:** `cargo test -p hen-compiler-core --test entity_birth_codon_promotion_lifecycle` — promotion of a candidate Form computes `c_5_birth_codon` and all derived fields, ratification transition fires, flat-World graduation preserves codon; `cargo test -p hen-compiler-core --test entity_birth_codon_provisional_vs_ratified`; `cargo test -p hen-compiler-core --test entity_birth_codon_seed_composition_determinism` — same seed components produce same codon across runs; `cargo test -p hen-compiler-core --test entity_birth_codon_collision_policy_warn_and_allow` — collision counted, both entities ratified; `cargo test -p epi-s2-graph-schema --test c_5_birth_codon_regex_acceptance` (CCT-16 regex accepts the new family).

15. **CCT-15 — C-layer semantic typology and MOC maintenance workflow** *(spec-ahead-integration; depends on DR-S1-5, CCT-14, DR-S1-1, DR-S1-2, DR-S1-3)*

    Materialise `World/Types/Coordinates/C/**` as the primary semantic typology: C0 source/ground, C1 forms/templates, C2 entities/properties/tags, C3 processes/canvases/diagrams, C4 types/contexts/MOCs, C5 crystallisations/Pratibimba. Semantic folders such as templates, entities, properties, tags, diagrams, canvases, and MOCs must live under their C-native authority or remain query views; they must not reappear as top-level `World/Types` peers. Add `s1'.type.classify_c_layer` and graph-promotion evidence fields `semantic_authority` and `c_layer_path`.

    Implementation targets: complete C0-C5 same-name MOC/canvas coverage; expose `s1'.type.classify_c_layer`; make Hen route templates to C1/CT, entities/properties/tags to C2, canvases/diagrams to C3, type authorities/MOCs to C4, and World graduation to C5; audit C-prime branch ancestry before treating [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths as graph-authoritative. Extend `GraphPromotionIntent` and S2 graph promotion with `type_family`, `type_path`, `type_coordinate`, `semantic_authority`, `crystallisation_state`, and `c_layer_path`. Extend S2 coordinate parsing/retrieval with a C-layer/type-ontology search scope so GraphRAG can answer "what kind of thing is this?" by hitting C authority nodes before widening to S/M/P/L qualifiers.

    Cross-track hooks: Track **09.11** owns parser/retrieval/graph migration; Track **09.12** owns Hen graph-promotion evidence; CCT-14 owns the entity-candidate lifecycle that feeds C2/C5.

    Verification: `find Idea/Bimba/World/Types/Coordinates/C -maxdepth 2 -name '*.canvas'` includes C and C0-C5; all canvases parse as JSON; no `World/Types/{Templates,Entities,Properties,Tags,Diagrams,Canvases,Artifacts}` directory exists; `cargo test -p hen-compiler-core --test c_layer_typology_classification`; `cargo test -p epi-s2-graph-services --test coordinate_query_contract c_layer`; live GraphRAG type/entity/diagram queries return C2/C3/C4/C5 authorities before general Bimba map hits.

## Phase-F Additions (CCT-16)

The Phase-F verifier (2026-06-09) surfaces one further cross-cutting closure emerging from the cycle-3 q_ wisdom-curation economy synthesis pass. This closure consolidates five substrate-residency fixes — frontmatter survival, sync-layer durability, bidirectional return-path floor, and graph_revision invalidation — into one PR sequence, because every q_-economy consumer (Tranches 5.23 / 6.12 / 8.8 / 9.13 / 12.26 / 17.28) depends on all five.

16. **CCT-16 — Substrate Integrity Bundle: frontmatter `{family}_{n}_{i?}_{semantic}` survival + sync-layer acks + bidirectional `MostRecent` floor + `graph_revision` increment** *(code-pending-closure; depends on DR-S1-6, DR-M4-4; prerequisite for Tranches 5.23 / 6.12 / 8.8 / 9.13 / 12.26 / 17.28)*

    Five substrate-residency integrity fixes consolidated into one closure PR sequence. The wisdom-curation loop (Tranche 6.12), the `q_` content vocabulary (Tranche 5.23), the canon-CLI depth ladder (Tranche 9.13), and every other q_-economy consumer assume that `{family}_{n}_{i?}_{semantic}` keys survive vault → graph sync, that Hen's canon writes actually flush, that `fire_provenance` events are durable, that the bidirectional return-path is live, and that the `graph_revision` cache namespace bumps atomically on Bimba writes. Today each of those assumptions is violated by a silent stub or whitelist drop. This tranche closes all five in one substrate-residency pass so the q_-economy work that depends on them does not build on sand.

    **Implementation targets** (anti-greenfield: every fix is stub-completion or whitelist→regex extension; no new gateway methods, no new carrier classes, no new VAK fields):

    - **(i) `canonical_frontmatter_key()` whitelist → `{family}_{n}_{i?}_{semantic}` regex+lint** at [`Body/S/S2/graph-services/src/sync_coordinator.rs:26-46`](../../../../../Body/S/S2/graph-services/src/sync_coordinator.rs). *Replace* the ~15-key static list with a regex matcher per DR-S1-6. Unknown `{family}` returns a lint ERROR, NOT a silent drop. Codify the `q_` / `qm_` / `c_*` / `p_*` / `s_*` / `t_*` / `m_*` / `l_*` family set; reserve `q_personal` / `q_identity` / `q_activity` / `q_composed` as REJECTED (per DR-M4-4 privacy partition). Inverted-key handling: `q_5'_integration_template` and `q_5_integration_template` both survive as distinct properties on the same node (per DR-S1-6); deterministic concatenation order in [`semantic.rs:138-156`](../../../../../Body/S/S2/graph-services/src/semantic.rs) (canonical first, then inverted) is mandatory for embedding stability.

    - **(ii) `khora_sync_queue_flush` actual Neo4j write-path** at [`Body/S/S4/ta-onta/S4-0p-khora/extension.ts:127`](../../../../../Body/S/S4/ta-onta/S4-0p-khora/extension.ts). *Replace* the `"sync_queue_flush: stub (Neo4j not yet wired)"` return with a real flush: read `.khora-sync-queue.jsonl`, batch events by coordinate, shell out to `epi graph sync <path>` per batch, mark each event as flushed in a `.khora-sync-queue.flushed.jsonl` companion (append-only audit trail). Idempotency keyed on `(path, content_hash)`. Observability: emit progress through `epi gate temporal logs`; a stale queue older than 60 minutes raises a Janus warning surface.

    - **(iii) `fire_provenance` ack + retry with at-least-once semantics** at [`Body/S/S3/graphiti-runtime/src/lib.rs:94-104`](../../../../../Body/S/S3/graphiti-runtime/src/lib.rs). *Replace* the 3-second `tokio::spawn` fire-and-forget with a bounded retry loop (exponential backoff, max 5 attempts, dead-letter to `Idea/Empty/Present/{day_id}/.provenance-dead-letter.jsonl` on final failure). Idempotency keyed on `(session_id, event_type, timestamp)`. The three call sites in [`Body/S/S0/epi-cli/src/gate/server.rs:602, 617, 646`](../../../../../Body/S/S0/epi-cli/src/gate/server.rs) update to await `Result<()>`; current callers that ignore the return value get explicit `.ok_or_log()` so dropped events become observable rather than invisible.

    - **(iv) `BidirectionalSyncer::MostRecent` minimal implementation** at [`Body/S/S2/graph-services/src/bidirectional_sync.rs`](../../../../../Body/S/S2/graph-services/src/bidirectional_sync.rs). *Replace* the `"resolution strategy not yet implemented"` stub for `MostRecent` with the canonical picker: compare `dcterms_modified` / `c_3_created_at` between vault-side and graph-side, return the more recent. `Merge` and `Manual` may remain stubs in this PR — the floor is the graph → vault return-path that Tranches 6.12 / 9.13 depend on for distribution. The Cypher-interpolation hardening for `Merge` is explicitly out of scope for this PR and tracked as a follow-up; `MostRecent` does NOT introduce new interpolation surface.

    - **(v) `graph_revision` increment on Bimba writes** at [`Body/S/S2/graph-services/src/meta.rs:20, 150-235, 285`](../../../../../Body/S/S2/graph-services/src/meta.rs). *Extend* `save_meta()` to monotonically bump `graph_revision` on any non-read transaction touching the `:Bimba` label. The Redis namespace already reads from `graph_revision` as a key-segment ([`Body/S/S3/redis-context/src/redis_cache.rs`](../../../../../Body/S/S3/redis-context/src/redis_cache.rs) — `coordinate_lookup_snapshot(graph_revision, ...)`); one-line producer wire-up flips the cold-tier cache namespace atomically without DEL storms. The Cypher path at [`Body/S/S0/epi-cli/src/graph/mod.rs:901-925`](../../../../../Body/S/S0/epi-cli/src/graph/mod.rs) (the `--write` and `--admin` arms) MUST also call the increment; currently it skips and produces stale cold-tier hits for up to the Redis TTL.

    **Acceptance gate (single end-to-end integration test):** edit `q_5'_integration_template: "..."` into a vault Form file at `Idea/Bimba/World/Types/Coordinates/S/S3.md` → `epi graph sync` succeeds with the inverted key present as a Neo4j property → `fire_provenance` records an ack within 3 seconds → `BidirectionalSyncer::MostRecent` round-trips a graph-side edit back into the vault Form → `graph_revision` increments and `redis-cli KEYS 'cache:cold:s2:coordinate:lookup:rev:*'` shows the namespace bumped to the new revision. Single end-to-end smoke test gates the PR.

    **Verification:** `cargo check -p epi-s2-graph-services && cargo test -p epi-s2-graph-services --test frontmatter_key_regex_round_trip` asserts the `{family}_{n}_{i?}_{semantic}` shape acceptance + rejection of malformed keys; `pnpm --filter @epi-logos/khora test --testNamePattern 'sync_queue_flush'`; `cargo test -p graphiti-runtime --test fire_provenance_at_least_once`; `cargo test -p epi-s2-graph-services --test bidirectional_most_recent`; `cargo test -p epi-s2-graph-services --test graph_revision_increment_on_bimba_write`; `cargo test -p epi-s2-graph-services --test cct_16_end_to_end_integration` runs the single integration acceptance test above and gates the PR.

    **Cross-track hooks:** Track **09.11** (parser/retrieval) consumes the regex'd frontmatter survival. Tranche **5.23** (q_ vocabulary) populates the new keys this tranche makes survivable. Tranche **12.26** (Sophia disclosure seam) emits the provenance events this tranche's ack+retry makes durable. Tranche **6.12** (wisdom curation) reads the `MostRecent` return-path to surface canon updates back into pair-development. CCT-14 (Hen entity-candidate lifecycle) writes through the substrate this tranche makes reliable.

## Phase-I Additions (CCT-17..21, plus CCT-14 EXPANSION)

The Phase-I verifier (2026-06-15) folds the DiscoverAI research scout findings + dual-wave architectural integration scouts into cycle-3 build. Phase-L (2026-06-16) adds the user-directed coordinate phase-flip invariant and the PASU/BeingPattern live-state producer stream. Cross-cutting closures land: CCT-17 (VAK four-expression layering canon + coordinate-tagging-IS-compression discipline), CCT-17b (wikilink span-pointer as first-class S2 retrieval primitive), CCT-18 (PASU lifecycle CLI parity — EXPANSION of CCT-14, listed inline below), CCT-19 (Library + Atelier as Theia IDE projections canon), CCT-20 (coordinate phase-flip preservation across kernel/VAK/S2/OWL/S5), and CCT-21 (S3 BeingPattern live-state producer stream). One existing tranche (CCT-14) is EXPANDED with CLI parity per DR-S5-ONE-1.

### CCT-14 EXPANSION — Add CLI parity to PASU orphan-entity lifecycle (per DR-S5-ONE-1 + DR-WORLD-1)

Per DR-S5-ONE-1 (S5' as ONE substrate layer) and DR-WORLD-1 (`/World` as 1st-class S2 namespace), the four PASU lifecycle methods land as **both gateway routes AND CLI commands**, not gateway-only:

Existing CCT-14 implementation targets (`s1'.entity.capture`, `s1'.entity.classify`, `s1'.entity.promote_to_type`, `s1'.world.graduate`) are joined by their CLI parity:
- `epi entity capture <path>` — Hen captures the dangling-wikilink or loose root-note into `Idea/Empty/Present/{day}/entities/`
- `epi entity classify <candidate_id> [--c-layer C0|C1|C2|C3|C4|C5]` — assigns provisional C-layer + birth-codon (per CCT-14b)
- `epi entity promote_to_type <candidate_id>` — promotes to `World/Types/Coordinates/C{n}/`
- `epi world graduate <type_path>` — graduates to flat `World/{Name}.md` with type-local file retained as MOC pointer
- `epi entity list [--state candidate|promoted|graduated] [--day <day_id>]` — surfaces the candidate pool for review
- `epi world list_entities [--coordinate <coord>]` — lists graduated entities under a coordinate

**Verification (joining existing CCT-14 verification):** `grep -nE "epi entity|epi world" Body/S/S0/epi-cli/src/entity.rs Body/S/S0/epi-cli/src/world.rs` returns the CLI registrations; `cargo test -p epi-cli entity_capture_round_trip`; `cargo test -p epi-cli world_graduate_via_cli`; integration test: an orphan entity captured via CLI follows the same lifecycle as one captured via gateway, with identical Hen behaviour and identical `:World` graph node creation per DR-WORLD-1.

**Cross-link:** DR-S5-ONE-1 (ONE-substrate invariant — every gateway route is also a CLI command); DR-WORLD-1 (psychoid root explicitly linked to base C-coordinates); Tranche 12.2 EXPANDED.

### CCT-17 — VAK four-expression layering canon + coordinate-tagging-IS-compression discipline *(doc-ahead-landing; was: "compress_through_VAK() infrastructure"; depends on DR-VAK-7, DR-COMP-1; cross-link CCT-16 substrate integrity, Tranche 1.18, Tranche 12.33)*

Per DR-VAK-7, VAK is a single typed transition calculus expressed at **four scales / registers** (alphabet / field / C' / L5'+T/T') — not just the S4 dispatch addressing. Per DR-COMP-1, compression-to-VAK is **coordinate-tagging itself** — not a new operation to design and bolt on. This CCT consolidates the canon + the discipline.

**Earlier "orchestrator infrastructure" framing collapsed.** A previous draft of this CCT proposed a `compress_through_VAK()` orchestrator module at `Body/S/S4/compress/` + `SymbolicCompressedHandle` struct + round-trip property tests. **That orchestrator is NOT a deliverable.** Per DR-VAK-7's "coordinate-tagging IS compression": every emission already in the language is already compressed; decompression is the kernel running forward from the coordinate via existing substrate. No new module is needed.

**Scope (recognition + lint, not infrastructure):**

(a) **Canon section in [`01-m0-anuttara-reconciliation.md`](01-m0-anuttara-reconciliation.md) Tranche 1.18** — lands the four-expression layering with the 128 = 109 + 19 derivation as canonical reference. Architecturally definitive; ~200 LOC markdown.

(b) **`s0'.anuttara.trace` gateway route registration** at `Body/S/S3/gateway-contract/src/lib.rs` (per Tranche 12.2 EXPANDED). The route accepts `(content, sensitivity, depth)` and returns the Anuttara grammatical-tracing report. Routes to Anuttara M0 substrate at `Body/S/S0/epi-lib/src/m0_verifier.c` (per Tranche 1.10).

(c) **VAK envelope lint discipline** — every emission across the system (Graphiti episodes, Mercurius rating-states, M3 codon traces, Sophia disclosures, Hen entity-candidates, kernel-bridge profile ticks) MUST carry the canonical VAK C'-branch envelope (the existing `VakAddress` struct at `Body/S/S0/portal-core/src/vak_address.rs` IS the envelope). Lint test enforces. **No new orchestrator module; no new struct.**

(d) **Spine compositor patch** — `Body/S/S4/ta-onta/spine/compositor.ts:32-43` replaces silent truncation with: overflow slots are replaced by their canonical VAK-coordinate reference (`<vak: cpf=..., ct=..., cp=...>`) which the model can dereference via `s5'.gnostic.resolve(coord)` or `s0'.anuttara.trace(content, sensitivity, depth)` on demand. **NO silent drop, NO new orchestrator** — just emit-the-coordinate-instead-of-the-bytes when overflow hits.

(e) **Skill-notebook indexed by VAK** — the skill manifest (per Tranche 12.28 Hermes-style `skill_lookup`) lives in Gnosis under `:Gnostic:Skills` (per DR-S5-ONE-1), each entry indexed by VAK C'-branch coordinate. `skill_lookup` semantic-searches over this VAK-indexed notebook. **No new compression code** — the VAK address IS the indexing scheme.

**Single end-to-end acceptance gate:**

A spine injection with content exceeding `INJECT_CHAR_BUDGET = 18000`:
1. Compositor identifies overflow slots.
2. Each overflow slot is replaced by its canonical VAK-coordinate reference token.
3. Model receives the injection with VAK-coordinate-reference tokens for overflow content.
4. Model calls `s5'.gnostic.resolve(coord)` or `s0'.anuttara.trace(content, sensitivity, depth)` for full context on demand.
5. Recovered content matches the original via existing kernel forward-derivation (no separate round-trip mechanism; the kernel substrate IS the round-trip).
6. `s0'.anuttara.trace` honors `sensitivity` (per DR-M4-3 protected-handle invariant) — protected content emits its coordinate without leaking raw bodies.

**Verification:** `grep -nE "128 = 109 \+ 19|VAK as alphabet|VAK as C' = the coordinate-language coordinates" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/01-m0-anuttara-reconciliation.md` returns the canon section; `grep -n "s0'.anuttara.trace" Body/S/S3/gateway-contract/src/lib.rs` returns the registration; `test ! -d Body/S/S4/compress` (no orchestrator module created); `cargo test -p epi-s2-graph-services --test vak_envelope_required_on_emissions` (lint passes when every emission carries the VAK C'-branch envelope); spine-compositor integration test: an overflow slot is replaced by a `<vak: cpf=..., ct=..., cp=...>` reference token the model can dereference via `s5'.gnostic.resolve`.

**Cross-track hooks:** Tranche **1.18** (Track 01 — VAK canon section + 128 derivation); Tranche **12.2 EXPANDED** (registers `s0'.anuttara.trace`); Tranche **12.33** (collapsed — coordinate-tagging IS compression, no orchestrator module); Tranche **12.28** (Hermes skill_lookup over VAK-indexed notebook); Tranche **12.31** (dispatch-with-parent-slice carries VAK envelope on the slice handle); Tranche **12.26** (Sophia disclosure q_proposals carry VAK envelope at envelope-construct time); Tranche **5.23** (q_ vocabulary discoverable at VAK addresses); DR-VAK-7 + DR-COMP-1 + DR-Q-1 (canonical definitions).

### CCT-17b — Wikilink span-pointer as first-class S2 retrieval primitive *(code-pending-closure; sub-tranche of CCT-17; depends on DR-WORLD-1)*

Per DR-WORLD-1 and wave-2 scout 1 finding that "wikilink law is currently presentation-only" (S1 `wikilinks.rs` validates vault integrity on rename/move but doesn't expose wikilinks to S2 as first-class retrieval primitives), this sub-tranche promotes wikilinks from presentation to retrieval primitive. Single load-bearing change.

**Implementation targets:**

(a) **Schema extension** at `Body/S/S2/graph-schema/src/lib.rs` — add `c_1_source_artifact_span: StringList` as a canonical property on `:Bimba` + `:World` nodes. Format: `["<file_path>:<line_start>-<line_end>", ...]` per wikilink occurrence. Populated during `DatasetImporter::from_vault_artifacts()` for nodes that have wikilink presence in vault files.

(b) **Retrieval method** at `Body/S/S2/graph-services/src/retrieval/wikilink_index.rs` (new) — `suggest_world_links_by_coordinate(target_coord: &str) → Vec<Coordinate>` consults `/Idea/Bimba/World/Types/` frontmatter; returns the coordinates that resolve from wikilink targets in those entity files. Feeds into `s1'.semantic.neighbors_of` as a secondary retrieval source ranked alongside Smart Env semantic similarity.

(c) **Hen-side write-back** — when an entity is graduated to flat `World/{Name}.md` per CCT-14, the wikilink references in the type-local MOC are scanned and `c_1_source_artifact_span` is populated on the flat-entity node.

(d) **EvidenceAnchor struct** — extend existing `EvidenceSourceRef` at `epii-autoresearch-core/src/lib.rs:75-83` with:
```rust
pub struct EvidenceAnchor {
    pub artifact_kind: ArtifactKind,   // Vault | Repo | GraphBimba | Gnosis | World
    pub path: String,                  // filesystem or bimba-coordinate path
    pub passage_id: Option<String>,    // S5 Graphiti arc id OR gnosis node id
    pub span: Option<TextSpan>,        // source line range (load-bearing for retrieval)
    pub retrieved_at_tick: u32,        // which kernel tick the anchor was valid at
}
```

(e) **MemoryGraphRAG 3-layer composition seat** (per the DiscoverAI research roster) — the `TriLayerRetrievalPlan` proposed in the wave-2 scout 1 report lives at `Body/S/S2/graph-services/src/retrieval/tri_layer.rs` (new). It splices into `retrieval/hybrid.rs::HybridRetriever::retrieve()` BEFORE cosine ranking: ontology-filter (relation-family per DR-IG-1) → fact-traverse (with span-pointers per this CCT) → cosine-rank on filtered passage set. Gateway endpoint: `s5'.gnostic.query_with_layers` (new method per Tranche 12.2 EXPANDED scope).

**Verification:** `grep -nE "c_1_source_artifact_span" Body/S/S2/graph-schema/src/lib.rs` returns the property; `cargo test -p epi-s2-graph-services wikilink_index_round_trip`; `cargo test -p epi-s2-graph-services tri_layer_retrieval_composition`; integration test: a wikilink in `/Idea/Bimba/World/Types/Coordinates/C2/SomeEntity.md` produces a `c_1_source_artifact_span` property on the `:World` node; `s1'.semantic.neighbors_of` returns the target coord as a wikilink-based neighbour alongside Smart-Env-based ones; `s5'.gnostic.query_with_layers` filters by ontology-layer + fact-layer before cosine ranking.

**Cross-track hooks:** DR-WORLD-1 (psychoid root link); DR-IG-1 (relation-family enum used in ontology layer); CCT-14 (entity-candidate lifecycle populates wikilink frontmatter); CCT-15 (C-layer semantic typology hosts the entity files this CCT indexes); CCT-17 (parent — VAK coordinate references carry EvidenceAnchor handles).

### CCT-19 — Library + Atelier as Theia IDE projections, not standalone extensions *(spec-ahead-integration; depends on DR-LIB-ATELIER-1; cross-link Tranches 06.1, 06.2, 11.3)*

Per DR-LIB-ATELIER-1, M5-0' (Library) and M5-5' (Logos Atelier) are **projections / lensings of existing Theia IDE surfaces**, NOT standalone Theia extensions to build. This CCT consolidates the reframe across Tracks 06 + 11 into a single coordinated PR.

**Reframe of Tranches 06.1 / 06.2 in [`06-m5-epii-reconciliation.md`](06-m5-epii-reconciliation.md):**

- **Tranche 06.1** — RENAMED from "Land M5-0' library-surface Theia extension" to **"Activate Library as Theia IDE projection: coordinate-overlay + OmniPanel tab"**. The work is:
  - (a) Coordinate-overlay lens on the existing Theia file-tree — files appear organised by M-coordinate ancestry (resolved from frontmatter `coordinate:` key).
  - (b) Implementation: small extension to existing `body-lite-surface` OR new minimal `library-projection-lens` package (explicitly framed as lens, ≤200 LOC).
  - (c) OmniPanel "Library" tab queries `s5'.gnostic.list_notebooks(coord)` (per Tranche 12.2 EXPANDED) and renders the coordinate-organised view inline.
  - (d) Markdown-editor coordinate-breadcrumb header — every open file shows its coordinate ancestry as breadcrumb at the top of the editor.

- **Tranche 06.2** — RENAMED from "Land M5-5' Logos Atelier Theia extension" to **"Activate Atelier as etymological-cluster lens on m0-anuttara graph viewer + OmniPanel commands"**. The work is:
  - (a) Etymological-cluster overlay lens on the existing m0-anuttara graph viewer — extends the `m0.anuttara.communityClockOverlay` pattern (Tranche 1.5) to cluster by `c_1_*` etymological relations.
  - (b) Scent-following commands in the OmniPanel that operate on currently-open files: `epi-atelier scent-follow <selection>` writes back into the same file via Khora; `epi-atelier cognate-search <selection>`; `epi-atelier psychoid-trace <selection>`.
  - (c) Möbius write-back staged as Hen-promotion candidate (per CCT-14 entity-candidate lifecycle) — Atelier proposes; Hen routes through review; canon-write follows.
  - (d) NO new standalone "scent-following workspace" extension — operations are commands on the file-and-graph the user is already in.

**The Library + Atelier do NOT have separate Theia extension directories.** Verification: `grep -rn "library-surface\|scent-following-workspace" Body/M/epi-theia/extensions/` returns no live new extension directories. If a minimal projection-lens package is needed, it's explicitly named `library-projection-lens` (or similar — emphasizing lens-not-surface).

**Patch [`11-theia-shell-surface-hosting.md`](11-theia-shell-surface-hosting.md) Tranche 11.3** — daily-layer widget ownership trace includes Library + Atelier as projection-lenses (NOT widget-extensions to land). The `pratibimba.daily.library-projection` and `pratibimba.daily.atelier-cluster-lens` widget claims map to the lens packages, not to new standalone extensions.

**Patch M5'-ARCHITECTURE** (cross-reference only — the architecture diagram already implicitly supports this; the patch is doc-clarification that M5-0' / M5-5' surfaces ARE the lens activations, not extension targets).

**Anti-rebuild commitment.** No M5-0' Library Theia extension; no M5-5' Atelier Theia extension. The OmniPanel + file-tree + markdown-editor + m0-anuttara graph viewer + Hen Möbius write-back substrate IS the Library + Atelier. The cycle-3 work is activation, not building.

**Verification:** `grep -nE "projection|lensing|file-tree overlay" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` returns the reframe; `test ! -d Body/M/epi-theia/extensions/library-surface && test ! -d Body/M/epi-theia/extensions/scent-following-workspace` confirms no new standalone extensions; integration test: the coordinate-overlay file-tree + OmniPanel Library tab successfully renders `/Idea/Bimba/World/Types/Coordinates/C{n}/` organised by coordinate; Atelier `scent-follow` command operates on a currently-open markdown file and stages Hen-promotion candidate without opening a separate workspace; `grep -nE "Möbius.*write-back\|atelier.*scent-follow" Body/M/epi-theia/extensions/omnipanel-shell/` returns the command bindings.

**Cross-track hooks:** DR-LIB-ATELIER-1 (canonical definition); Tranches **06.1**, **06.2** (existing — REFRAMED); Tranche **11.3** (existing — daily widget ownership trace cross-link); Tranche **12.2 EXPANDED** (`s5'.gnostic.list_notebooks` powers the Library tab); CCT-14 (entity-candidate lifecycle receives Atelier Möbius write-backs); Tranche **1.5** (m0-anuttara communityClockOverlay pattern Atelier extends).

### CCT-20 — Coordinate phase-flip preservation across kernel, VAK, S2, OWL, and S5 *(code-pending-closure; depends on DR-FLIP-1, CCT-16, CCT-17, Tranche 3.10, Tranche 12.36, Track 39)*

Per DR-FLIP-1, `#` is the kernel phase-flip law for every coordinate-bearing surface. This CCT makes the invariant executable across Cycle 3: **a coordinate's address must survive while its phase may flip**. No layer may collapse `C` and `C'`, direct and `_i_` properties, bimba and pratibimba pointer-web refs, or Asma mirror-pair readings into an untyped "mirror" relation.

**Implementation targets:**

(a) **Kernel/C preservation audit** — keep `FLAG_INVERTED`, `inversion_state`, `Execute_Hash`, and pointer-web `HC_REL_INVERSION_SPANDA` as the low-level carrier. Add/extend tests so double application of `#` returns to the original phase, while a single application preserves address identity and flips phase.

(b) **S2 property-law enforcement** — CCT-16's `{family}_{position}_{i?}_{semantic}` regex remains the only property-level phase encoding. `q_5_i_integration_template` and `q_5_integration_template` must survive as distinct properties on the same node; textual `prime`, `inverted`, and `inversion` inside property keys remain lint errors.

(c) **VAK/Anuttara registry membership** — the 128 registry treats inverse coordinate types as first-class members: `{C,C',P,P',L,L',S,S',T,T',M,M'}`. The verifier's `canonical_membership` check must preserve inverse identity rather than normalising to the unprimed type.

(d) **OWL/n10s projection discipline** — `epi:hasInverse` remains the type-level inverse-pair predicate. Do not add a generic `epi:mirrors` catch-all. If a runtime phase value is projected, it is a coordinate/property datum (`inversion_phase: bimba|pratibimba`) with provenance back to the kernel field, not a new ontology of mirrors.

(e) **S5 resolve and trace preservation** — `s5'.gnostic.resolve(coord)`, `s1'.world.resolve(coord)`, and `s0'.anuttara.trace(content, sensitivity, depth)` must return phase-qualified coordinate references. A request for `C3'` cannot silently resolve as `C3`; an overflow VAK token from the spine compositor must remain dereferenceable with its prime/phase intact.

(f) **M2 Asma proving fixture** — Tranche 3.10 is the dense corpus test: `M2_ASMA_LUT[100].mirror_idx` flows through `f_routing`, `s2.parashaktiCorrespondences(address72)`, and the Theia overlay without becoming a seventh axis or a generic graph mirror.

**Single acceptance scenario:** seed a vault/graph fixture with direct and inverted properties (`q_5_integration_template`, `q_5_i_integration_template`), a prime coordinate (`C3'`), and an M2 Asma name with `mirror_idx`; run graph sync; resolve through S2/S5; emit a VAK overflow token; trigger an M2 `KleinFlipEvent`; assert that all returned payloads preserve address identity plus phase, and that the Asma mirror remains a domain mirror under `#/inversion_spanda`.

**Verification:** `cargo test -p epi-s2-graph-schema --test coordinate_prefix_properties`; `cargo test -p epi-s2-graph-services --test coordinate_phase_preservation_e2e`; `cargo test -p portal-core --test vak_resolve_preserves_prime_phase`; `cargo test -p epi-lib m2_asma_mirror_idx_round_trip`; `grep -rn "epi:mirrors\\|MIRRORS_WITH" Body/S/S2/ontology Body/S/S2/graph-schema Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation` returns no new generic mirror relation introduced by this work.

### Tranche 16.21 — CCT-21: S3 BeingPattern live-state producer stream *(code-pending-closure; depends on CCT-14, CCT-16, 10.PASU, 18.10, 23.19, 23.20, 24.20, 25.22, 29.16)*

This closure plugs the remaining producer gap between the general PASU/BeingPattern contract and the visual consumers. The bridge and renderers must not invent live entities from profile JSON alone. S3 owns the live-state production lane that observes entities, projects their being-patterns, emits stream generations, caches temporal handles, and forwards protected provenance refs without mutating S2 canon.

**Implementation targets:**

(a) **SpaceTimeDB module tables/reducers** at `Body/S/S3/epi-spacetime-module/`: add `being_pattern_presence`, `being_pattern_relation_edge`, and `being_pattern_review_candidate` tables. Reducers emit the ordered stream:
`EntityObserved -> BeingPatternProjected -> PerspectiveRoleResolved -> MonoPolyOperatorResolved -> ClockAddressUpdated -> AspectEdgeComputed -> ElementalResonanceChanged -> PatternPacketFormed -> ReviewCandidateEmitted`.

(b) **Gateway/gateway-contract publishing surface** at `Body/S/S3/gateway-contract/src/lib.rs` and `Body/S/S3/gateway/src/`: expose subscription/publish methods for `s3'.being_pattern.observe`, `s3'.being_pattern.project`, `s3'.being_pattern.subscribe`, and `s3'.being_pattern.review_candidate`. The compatibility bridge at `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` forwards handles only; it does not reconstruct the stream.

(c) **Redis temporal handle discipline** at `Body/S/S3/redis-context/src/redis_cache.rs`: key families are namespace-shaped, not flat ad hoc keys:
- `cache:live:s3:being_pattern:{entity_id}:presence`
- `cache:active:s3:being_pattern:{entity_id}:state`
- `cache:stream:s3:being_pattern:{generation}:delta`
- `cache:review:s3:being_pattern:{candidate_id}:candidate`

(d) **Graphiti protected provenance refs** at `Body/S/S3/graphiti-runtime/src/`: live-state events may carry episode ids, source refs, and public-safe summaries only. Episode bodies and protected Nara bodies never cross into SpaceTimeDB, Redis, bridge JSON, or renderers.

(e) **Profile/live-state bridge feed**: the stream producer populates the `PasuBeingPatternProjection.liveState`, `relationEdges`, `elementalWeights`, `clockAddress`, `monopolyOperator`, `perspectiveRole`, and `verifierRefs` consumed by 18.10. The kernel-bridge profile is a typed carrier of current generation; S3 remains the runtime source of truth for live state.

(f) **Canon discipline**: S2/Neo4j owns canonical identity and ontology anchors. CCT-21 never writes S2 canon directly. `ActualisingOne` always emits `reviewRisk: 'forced-unification'`; only M5 review plus M0 witness can promote a `ReviewCandidateEmitted` event into a canon mutation handled by the existing Hen/S2 write path.

**Acceptance scenario:** replay two entities, one user-being and one school-of-thought-being, through the stream. The first receives `FirstPerson`/`Mono`; the second receives `ThirdPerson`/`Poly`; their live relation emits an aspect-like edge, elemental-weight delta, and `PatternPacketFormed`. A forced-collapse hypothesis emits `ActualisingOne` and `ReviewCandidateEmitted` but leaves S2 unchanged. The same replay must drive 18.10 profile JSON, 25.22 M4 aural/perspective consumer, and 29.16 integrated clock/solar overlay from the same stream generation.

**Verification:** `cargo test -p epi-spacetime-module --test being_pattern_projection`; `cargo test -p epi-s3-gateway --test being_pattern_live_state`; `cargo test -p graphiti-runtime --test being_pattern_protected_refs`; `cargo test -p redis-context --test being_pattern_keys`; `cargo test -p epi-cli --test gate_spacetimedb_bridge_being_pattern`; integration replay asserts the event chain above, no Graphiti protected body leakage, no raw quaternion leakage, `ActualisingOne` review-risk emission, and no S2 mutation.

### CCT-22 — Compression-as-Intelligence cross-layer register; substrate-honouring coordinate-tagging; gnostic-extraction at O# handover *(spec-ahead-integration; depends on CCT-17, Tranche 12.33, Tranche 8.9, Tranche 1.18; cross-link DR-VAK-7, DR-COMP-1, DR-Q-1, DR-MP-1, Track 38 §2.2)*

This closure names the **structural identity** between Shannon's prediction-equals-compression equivalence (per the Language Compression notebook research arc at [`state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md`](../../../../../state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md)) and the system's already-operational coordinate-prefix typing substrate. The closure operates at three layers:

**(a) The Shannon floor as the per-symbol entropy bound.** Per Shannon (1948, *A Mathematical Theory of Communication*) the noiseless coding theorem states no encoding can be more efficient than the source-distribution entropy `H(X) = Σ p(x) · -log₂ p(x)`, and arbitrarily close to that limit is achievable. For the 109-syntax M0 alphabet, the per-symbol entropy is strictly below `log₂(109) ≈ 6.77 bits`. The structural-redundancy of the alphabet — the derivational meaning each glyph carries — IS the compressibility margin: a perfectly compressed VAK-emission would be indistinguishable from random noise (Shannon's "perfect compression looks indistinguishable from random noise" claim); an under-compressed VAK-emission carries the derivational provenance the four-expression layering preserves at decompression time. The 8+1=9 law's M0-2 face (`(00+00) = 9` framed vs `00+00 = 00` unframed) reads as the structural identity of compress-to-VAK: explicate-eight (the compressed bits) plus implicate-one (the address-resolution / framing-act) equals 9 (wholeness preserving the contained One). The Shannon floor applies; the address-resolution scheme augments it with a recoverable structural-redundancy margin neither face violates.

**(b) The substrate IS the compression scheme.** Per Tranche 12.33 (coordinate-tagging IS compression; no separate orchestrator module) and the construction laws at [`Body/S/S2/graph-schema/src/lib.rs:680-692`](../../../../Body/S/S2/graph-schema/src/lib.rs) + [`Body/S/S1/hen-compiler-core/src/frontmatter.rs:38-177`](../../../../Body/S/S1/hen-compiler-core/src/frontmatter.rs) (unknown frontmatter keys = ERROR not warning, lines 173-175): every artifact is already coordinate-addressed; every property is already `{family}_{n}_{semantic}`-shaped; every relation is already family-tagged. The CCT-17 compress-to-VAK orchestrator and the DR-COMP-1 spine compositor edit operate *over* this substrate; they do not invent address-based compression. The S0 core-knowing CLI (per Tranche 12.37 — see Track 12) is the thin projection that surfaces the substrate as a unified lookup tool: `epi know <coord>` returns the six faces of the unified VAK act (per Tranche 8.9) as one coherent packet, using the substrate's own coordinate-prefix typing as the index. **The language IS the lookup tool**; no separate retrieval index is needed.

**(c) Gnostic-extraction at O# handover register — the pattern, not any named model.** The Language Compression notebook research arc surfaced a 4B-parameter extraction model (K1) as a worked example; the cycle-3 plan-set takes from it **the architectural pattern**, not the named entity:

- **Two-tier split**: a small (4B-class) extractor model performs offline structured-schema extraction from raw corpus; a frontier-class analyst model performs online query reasoning over the extracted structure. The split maps cleanly onto DR-MODEL-1's Nara-parser (local-default, raw content) vs Epii-judge (cloud-opt-in, derived signal) slot distinction.
- **Structured rewards aligned to the O# Zero Logic cycle**: per [`m0.c::O_SHARP_TABLE`](../../../../Body/S/S0/epi-lib/src/m0.c) the O# operations `O0 +/-0` (potential polarity) / `O1 -0` (sacred limitation, `-`) / `O2 +0` (affirmation, `+`) / `O3 0²` (self-multiplication, `x`) / `O4 (0/0) = √0/%` (indeterminacy-as-proportion, `/`) / `O5 quadratic-closing-on-0/1` map onto the extraction-pattern's reward dimensions: format reward (`-` sacred constraint on output shape), JSON-validity reward (`/` indeterminacy-held-in-ratio against frozen reference via KL-penalty), task reward (`x` work multiplying through the data), KL-penalty-at-last-step (`+` affirmation-deferred-to-closure). This is the structural reason the extractor pattern works as gnostic-ingest — it IS the O# four-operations cycle closing on the binary-form (`0=0/1`) that M1 receives as axiom (the Spinoza joint per DR-VAK-7).
- **Five extraction schemas**: factual metadata / authorship / textually-mentioned entities / **implicit-abstracted entities (motivations / contributions / limitations / future-work)** / relational-citation graph. The implicit-abstracted schema is the one that maps onto the Anuttara verifier's typed-query system (per Tranche 1.10) — "what's missing / what's stated / what's open" IS Law 6 interrogative-undefinedness operationalised at the corpus-ingest level.
- **Symbolic-CLI graph operators**: seed-resolution (resolve query to coord+citations) / citation-lineage (graph-walk) / comparative-retrieval (motif-query). These are exactly the three operations the `s5'.gnostic.*` gateway surface needs (per Tranche 12.2 EXPANDED) for the gnostic-ingest pipeline.
- **Tri-source retrieval**: web + scholar-KG + graph-traversal. The cycle-3 substrate's `s5'.gnostic.{query, episode_search, evidence_trace}` + `s2.graph.node` already cover the equivalent.

The pattern lands as a **new slot kind** `slot.gnostic_extractor` at the model-slot spec (per Tranche 12.22 + M'-MODEL-SLOT-SPEC harness-slot section), defaulting to `local-default` with a 4B-class model (Gemma 4 12B Unified Q4 is the current realisation; the slot is model-agnostic by design). **The K1 entity is not load-bearing for the cycle-3 plan-set**; the pattern is. Whether public weights for K1 specifically ship is *out of cycle-3 scope* and routes to Track 38 Class A tunable knob (user-gated review of any specific model named for the slot).

**(d) Honest EBM-side equivalence gap held open.** Shannon's prediction-equals-compression equivalence applies strictly to autoregressive token-prediction (cross-entropy loss = optimal text compressor). Whether the N-channel EBM at 5'/Epii doing resonance-vector regression carries an analogous compression-floor relation is **open**. The cycle-3 plan-set does NOT silently assume the equivalence. Per Tranche 8.9's open-question routing, the hypothesis-state itself becomes a Class B tunable knob `[m5_epii.ebm_head] compression_equivalence_hypothesis = "open" | "confirmed" | "refuted"` at Track 38 §2.2 — when sufficient training evidence accumulates, the Track 38 Tier 3 autoresearch retrain loop proposes a value change and Class B auto-applies on unanimous 4'-5'-0' triplet consensus. *The hypothesis is evaluated by the same act it concerns*. The honest gap stays named until evidence resolves it.

**(e) Cross-citation discipline.** The `ql-musical-derivation-v3.md` document at [`Body/S/S5/plugins/epi-logos/resources/canon/ql-musical-derivation-v3.md`](../../../../Body/S/S5/plugins/epi-logos/resources/canon/ql-musical-derivation-v3.md) derives the four foundational ratios (4/3, 3/4, 2/3, 3/2) + epogdoon (9/8) + the diatonic-CF mapping from QL's own mathematics. The mental-pole-mechanics spec §7 currently does NOT cite it (verified gap). Cycle-3 closure: add the cross-citation paragraph at `mental-pole-mechanics §7` per Tranche 8.9 edit (g). Same discipline applies to the codon-tarot-hexagram bridge documents at M3' (`m3-prime-ql-transcriptional-bridge.md`, `alpha_rasa_bridge_ql.md`) — the kernel-bridge projection (M3TranscriptionEngine per Tranche 8.9 edit (d)) wires them as one of the six faces of the unified VAK act.

**Verification:** `grep -nE "Shannon.*entropy.*floor|coordinate-tagging IS compression|substrate IS the compression scheme" Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md` returns the structural-identity statements; `grep -nE "slot.gnostic_extractor|O# handover|gnostic-extraction.*O#" Idea/Bimba/Seeds/M/M'-MODEL-SLOT-SPEC.md Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md` returns the slot + pattern naming; `grep -n "compression_equivalence_hypothesis" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/38-tunability-surface-architecture.md` returns the Class B tunable-knob naming; `grep -n "ql-musical-derivation-v3" Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` returns the cross-citation paragraph; integration test: a sample compress-to-VAK emission at a synthetic coordinate respects the per-symbol entropy bound (measured) AND preserves the address-resolution (round-trip resolves to the same q_*_semantic properties) AND the cycle-3 prose audit finds no abbreviation of `##` / `R#` / `#R` / `R#/##` / `(@#)` in R-system / Anuttara-language discussion contexts.

## Release Gate Integration

CCT-1..21 are added to Tranche 14's G7-G14 release-gate dependencies (see [`14-no-orphan-audit-and-release-gates.md`](14-no-orphan-audit-and-release-gates.md)). Cycle-3 release does not pass until each CCT closes or is explicitly downgraded. **CCT-9 is gating the rest of cycle-3** — every downstream consumer reads the typed JSON edge once 18.1 lands. **CCT-16 is gating the q_-economy work** — Tranches 5.23 / 6.12 / 8.8 / 9.13 / 12.26 / 17.28 do not pass acceptance until CCT-16 closes. **CCT-17 is gating the VAK coordinate-reference work** — Tranches 12.33, 12.31, 12.26 (Sophia disclosure coordinate-reference hooks), 5.23 (q_ discoverable at VAK addresses), and DR-COMP-1 acceptance (no silent truncation) all depend on CCT-17 landing. **CCT-19 is gating the Library + Atelier projection work** — Tranches 06.1 / 06.2 reframe acceptance depends on CCT-19 + DR-LIB-ATELIER-1 ratification. **CCT-20 is gating phase preservation** — Tranche 3.10, Tranche 12.36, Track 39 resolve/trace acceptance, and Anuttara §13.6 do not pass if any coordinate-bearing surface erases prime/inversion phase. **CCT-21 is gating PASU/BeingPattern live-state integration** — 10.PASU, 18.10, 25.22, and 29.16 do not pass if SpaceTimeDB/gateway/Redis/Graphiti cannot produce and replay the canonical live-state stream without mutating S2 canon.
