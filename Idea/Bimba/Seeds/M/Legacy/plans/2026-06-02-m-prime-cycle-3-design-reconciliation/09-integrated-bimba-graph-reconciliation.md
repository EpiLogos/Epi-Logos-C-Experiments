# Track 09 — Integrated Bimba-Graph Reconciliation

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Reconciles the integrated bimba-graph substrate across the four corpora. The substrate is **stronger than the surface** — S2 already carries Neo4j + n10s + GDS + OWL/SHACL + `RelationshipManager` writes + `PromotionPlan` + the 109-node Anuttara language map; but the m0-anuttara Theia widget is a single inspector with no graph canvas, no per-layer routing, no asset render, no CRUD path. Three live contradictions concentrate here: full-CRUD vs governed-route, two-relation-families discriminator absence, `c_1_*` naming round-trip. One genuine schema-property orphan: image-assets-on-nodes.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md`, `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md`, `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae … Sheet1.csv` (canonical source for the six Ananda vortex matrices — `0X+1 … 11X+1` rows × 0-9 positions compile to `.rodata` at `m1.c:22-114`; inner-sum totals at rows 5X / 6X source `VORTEX_5X_CEILING=24` / `VORTEX_6X_STRUCTURE=8` at `m1.h:425-426`)
- Companions: `Body/S/S2/graph-schema/src/lib.rs` (relation registries), `Body/S/S2/graph-services` (ontology + GDS + sync_coordinator), `Body/S/S3/gateway-contract/src/lib.rs` (current `s2.graph.{query,node,traverse}` registration)
- Full row-level reconciliation: `plan.runs/wave-b-integrated-bimba-matrix.md` + `plan.runs/15-m1-2-ananda-vortex-research.md` (Vortex Modulae CSV citation)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S2/graph-schema/src/lib.rs` 65-relation registry + `anuttara-language` property namespace; `Body/S/S2/graph-services/src/{ontology.rs,gds.rs,sync_coordinator.rs,relationship_manager.rs,dataset_import.rs}` (all landed); single `:Bimba` label + `coordinate` property; `pointers.rs` PointerWeb computation. Cycle 2 Track 11 closed S2 substrate; cycle 3 closes consumer integration.

## Tranches

1. **9.1 — M0' six-layer surface contract — author per-layer routing model** *(doc-ahead-landing; sibling of Tranche 01.1)*

   Extend `m0-inspector.ts` model with discriminated layer enum `{lang, ql, rel, time, pers, pedag}` + six tab routes in widget. Single S2 query path shared across layers. Sibling of M0 Track 01.1 — M0 owns the spec patch; this tranche owns the integrated routing model that propagates across renderings.

   Verification: `cd Body/M/epi-theia/extensions/m0-anuttara && yarn build`; `grep -E "layer:.*'(lang|ql|rel|time|pers|pedag)'" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`.

2. **9.2 — Two-relation-families schema discriminator** *(spec-ahead-integration; DR-IG-1 VALIDATED)*

   Add `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` to `RELATIONSHIP_PROPERTY_SPECS`. Populate via `dataset_import` + `sync_coordinator`. Current schema has structural skeleton in `RELATIONSHIP_TYPE_SPECS`; correspondential relations (`HAS_DECAN`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `VORTEX_SPIRIT_AXIS`, etc.) land via `DatasetImporter::sanitize_rel_type` without a discriminator. CCT-13 owns the canonical naming sweep (`kernel-resonance` → `kernel_core`).

   Verification: DR-IG-1 ratified; `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema relation_family_enum_present`.

3. **9.3 — Image-assets-on-nodes schema slot + dataset-import path** *(no-orphan-fill; merges with Tranche 01.6)*

   Add `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String) to `GraphPropertySpec`. Extend `dataset_import.rs` field map to lift asset/seal/sigil/glyph keys. Add inspector render slot. Tranche 01.6 owns the M0 inspector-side; this tranche owns the schema property + dataset-import. Because this is a new load-bearing schema slot not yet ratified by a DR, gate implementation behind candidate DR-M0-4 / explicit user final-validation.

   Verification: `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-services dataset_import::asset_field_mapping`; `grep -n c_1_asset_uri Body/S/S2/graph-schema/src/lib.rs`.

4. **9.4 — Governed-route gateway posture** *(doc-ahead-landing; DR-M0-1 VALIDATED)*

   Do **not** add raw `s2.graph.{create,update,delete}` as M0' chrome affordances. Patch UX/spec prose to governed-route via M5-5 Logos Atelier review / dry-run / governed-promote. Any future write methods must be M5-governed promotion receipts, not M0' CRUD.

   Verification: `grep -nE 's2\.graph\.(create|update|delete)' Body/S/S3/gateway-contract/src/lib.rs` returns no M0' direct CRUD route; M0' inspector exposes governed-route proposal deep-link only.

5. **9.5 — One-substrate / three-rendering integration plugin ownership** *(spec-ahead-integration; cross-link to Tranche 07.3)*

   Author closing-tranche contract for `plugin-integrated-1-2-3` (Track 07.3) to explicitly own B-8, B-9, B-12: solar anchor, planetary placement, cross-surface edit propagation listener via kernel-bridge profile-tick events.

   Verification: `ls Body/M/epi-theia/extensions/plugin-integrated-1-2-3/`; `cd Body/M/epi-theia/extensions/plugin-integrated-1-2-3 && yarn build`; composition contract names B-8/B-9/B-12 explicitly.

6. **9.6 — M0-3' synchronic community + diachronic clock overlay** *(spec-ahead-integration; sibling of Tranche 01.5)*

   Wire `gds_tangent_overlay()` output through kernel-bridge into M0-3' panel distinguishing synchronic (community) vs diachronic (`world_clock` + Graphiti episode handles). Depends on M3 Track 04.3 (clock overlay rendering) + M5 episodic deposit.

   **Landed in the active carrier (09.T9.6):** `M0CommunityClockPanel` mounts from the `time-community` rail and invokes `s2.graph.gds.tangent_overlay` for the shared selected coordinate. Its synchronic half renders the real S2 status, `derivedNodes`, reason, and public-topology privacy boundary; its diachronic half reads `tick12`/`degree360` only from the kernel profile and projects only handle-shaped [[Graphiti]] references. The current S2 runner remains honestly fail-closed when GDS is unavailable or its algorithm runner is gated; the carrier renders that state and never fabricates communities.

   Verification: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml gds`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m0CommunityClockOverlay.test.ts`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/m0-community-clock.spec.ts --reporter=line`; `node .codex/scripts/lint-test-honesty.mjs`.

7. **9.7 — One-substrate / no-fork invariant codification** *(aligned-only-note)*

   Codify the **B-8 non-fork invariant** as a cross-referenced note in `M0'-SPEC`, `M2'-SPEC`, `M3'-SPEC`, and the `plugin-integrated-1-2-3` contract. Single `:Bimba` label + `coordinate` property + one schema crate + one rendering composition seam. No code change.

   **Landed (09.T9.7):** the three owning specs and active-carrier composition contract now cross-codify the same four-part B-8 law: one `:Bimba` label, one `coordinate` identity property, one [[Body/S/S2/graph-schema]] authority, and one [[plugin-integrated-1-2-3]] rendering-composition seam. This is a documentation/comment-only alignment; no executable contract shape or runtime behavior changed.

   Verification: `for file in "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md" "Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md" "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md" Body/M/pratibimba-app/src/composition/compositionContract.ts; do rg -q ':Bimba' "$file" && rg -q 'coordinate' "$file" && rg -q 'graph-schema' "$file" && rg -q 'plugin-integrated-1-2-3' "$file" || exit 1; done`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/composition/compositionContract.test.ts`; `node .codex/scripts/lint-test-honesty.mjs`.

8. **9.8 — Anuttara property naming round-trip** *(spec-ahead-integration; DR-M0-2 VALIDATED)*

   Owns DR-M0-2 graph-services side. Canonical source properties are coordinate-prefixed `c_1_*`; unprefixed `symbol` / `formulation_type` are alias-only via `OntologyPropertyMapping` and inspector provenance. No either/or remains open.

   **Landed (09.T9.8):** S2's `OntologyPropertyMapping` maps the three public aliases to `c_1_symbol`, `c_1_formulation_type`, and `c_1_complete_formulation`; the node API reads those source properties and returns aliases only with canonical-property provenance. The active M0-0' carrier field list requests only the canonical names, now pinned by a no-alias regression test.

   Verification: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml anuttara_property_mappings_round_trip`; `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --test ontology_bridge_contract`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m0Layers.test.ts`; `node .codex/scripts/lint-test-honesty.mjs`.

9. **9.9 — M0' graph chrome ↔ M5-0' library chrome Klein seam** *(spec-ahead-integration; DR-TUI-1 VALIDATED)*

   Wire the existing M0' graph chrome and M5-0' Library/Gnostic Namespace as one Klein surface joined by coordinate tagging: direct `bimba_coordinate` plus LLM-classified `bimba_resonances`. No standalone `bimba-graph-viewer` extension and no generic graph/file/agent "view mode" ontology. The user path is map traversal; the library surfaces under the traversed coordinate.

   **Landed (09.T9.9):** `M0M5LibrarySeamPanel` is embedded beneath the existing Bimba map and follows the shared coordinate store. It invokes the production `s5'.gnostic.etymology` method and strictly projects direct `bimba_coordinate` anchors plus relationship-backed `bimba_resonances`; content bodies are discarded. The e2e harness points the real gateway at the repository `epi-gnostic` executable, and the map-walk test traverses to M1 before comparing the mounted Library state with a separate live RPC. No new viewer package or view-mode ontology was added.

   Verification: `Body/S/S5/epi-gnostic/.venv/bin/python -m pytest Body/S/S5/epi-gnostic/tests/test_coordinate_tags.py Body/S/S5/epi-gnostic/tests/test_one_substrate_smoke.py -q`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m0M5LibrarySeam.test.ts`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/m0-m5-library-seam.spec.ts --reporter=line`; `test ! -d Body/M/pratibimba-app/src/bimba-graph-viewer`; `node .codex/scripts/lint-test-honesty.mjs`.

10. **9.10 — S2 gateway exposure of graph methods** *(spec-ahead-integration; S2-ARCHITECTURE §10.2 S2.D)*

   Expose existing S2 graph-services methods through gateway-contract / kernel-bridge so M' surfaces do not bypass the S-stack: `s2.graph.gds.tangent_overlay`, `s2.graph.ontology.reload`, `s2.graph.seed.snapshot`, `s2.graph.core65.audit`, `s2.graph.promotion.dry_run`, `s2.graph.promotion.commit`, and `s2.graph.relation_family.list`. This wraps existing GraphMethodService work; it is not new graph substrate.

   Verification: `grep -n "s2.graph.gds.tangent_overlay\|s2.graph.relation_family.list" Body/S/S3/gateway-contract/src/lib.rs`; gateway tests route each method through S2 graph-services.

11. **9.11 — C-layer graph parser + retrieval intelligence** *(spec-ahead-integration; depends on CCT-15 + DR-S1-5)*

   Make C coordinates operational as the graph's semantic typology layer, not just a valid coordinate prefix. `CoordinateArrayParser` / query extraction must surface C-family metadata (`c_layer_role`, `semantic_authority`, `world_type_path`, `crystallisation_state`) for C0-C5 and must treat C-prime as non-authoritative until the C-prime VAK ancestry audit closes. `CoordinateSearchScope` gains a C-layer/type-ontology scope triggered by terms such as `type`, `kind`, `entity`, `property`, `tag`, `alias`, `relation field`, `template`, `form`, `canvas`, `diagram`, `MOC`, `context`, `World graduation`, and explicit C-coordinate mentions. Hybrid GraphRAG must use coordinate-property prefix filters and C-layer boosts before widening to S/M/P/L qualifiers.

   Implementation targets: `Body/S/S2/graph-services/src/coordinate.rs`, `retrieval_query.rs`, `retrieval/hybrid.rs`, `Body/S/S2/graph-schema/src/lib.rs`, and a new live graph migration linking `C0`-`C5` to `Idea/Bimba/World/Types/Coordinates/C/**` authority paths. The migration must not introduce top-level semantic peer roots under `World/Types`; it should attach same-name `.md` and `.canvas` MOC evidence to C authority nodes.

   Verification: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --test coordinate_query_contract c_layer`; `cargo test --offline --manifest-path Body/S/S2/graph-schema/Cargo.toml --test coordinate_prefix_properties`; live GraphRAG query `"entity property alias relation field"` returns C2 authority nodes before general Bimba results; live GraphRAG query `"architecture diagram canvas MOC"` returns C3/C4 authority nodes before S/M qualifiers.

12. **9.12 — Hen graph-promotion C-first evidence contract** *(spec-ahead-integration; depends on CCT-14 + CCT-15)*

   Graph promotion must classify artifacts C-first before applying other coordinate-family qualifiers. Hen emits `type_family`, `type_path`, `type_coordinate`, `semantic_authority`, `crystallisation_state`, and `c_layer_path` from World/Types ancestry and frontmatter. These fields become node properties and relation evidence in S2 graph promotion. C2 entity candidates, C3 diagram/canvas forms, C4 type/MOC authorities, and C5 World graduation receipts must produce distinct graph evidence, so agents can track notes/nodes/entities through the Empty -> World/Types -> flat World lifecycle.

   Implementation targets: `Body/S/S1/hen-compiler-core/src/graph_promotion.rs`, Hen artifact evidence collection, S2 `sync_coordinator` property proposal guidance, and S3 gateway receipts for `s1'.type.classify_c_layer`, `s1'.entity.promote_to_type`, and `s1'.world.graduate`. Smart Env remains read-only evidence; it must not mutate graph canon directly.

   Verification: `cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test c_layer_typology_classification`; `cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test entity_candidate_lifecycle`; graph-promotion fixture for a C2 entity candidate includes `type_coordinate = C2`, aliases, candidate state, and accepted wikilinks; fixture for a C5 graduation receipt includes source C authority path and flat World target.

13. **9.13 — `epi canon coord` depth ladder + canon-CLI surface family** *(spec-ahead-integration; depends on Tranche 5.23, DR-M4-4, CCT-16, CCT-15; cross-link Tranche 17.28, Track 11)*

    Land the token-lean canon distribution surface that makes the q_ wisdom-curation economy (per Tranche 6.12) usable: a single CLI primitive that reads concatenated `q_*_{i?}_*` content properties + `qm_*_{i?}_*` provenance from Bimba and returns canonical packets at four depth rungs. This is the "pithy foundation" the cycle-3 synthesis identified as load-bearing for every agent dispatch — currently the canon delivery path is `CLAUDE.md` auto-injection (~9k tokens unconditionally), `bimba-mcp.spec_retrieve` (MCP-only), and `epi core knowing` (the live exemplar, but framed as an inspector not a canon portal). This tranche unifies them under a canonical CLI surface family.

    **CLI surface family** (lives at [`Body/S/S0/epi-cli/src/canon/`](../../../../../Body/S/S0/epi-cli/src/canon/) — new module *extending* the existing `core knowing` engine, NOT greenfield):

    ```
    epi canon coord <COORD> --depth <pithy|qv-detail|relational|seed> [--json]
    epi canon kernel [--json]
    epi canon agent <path> --section <sattva|frame|capability|rupa|ontology|temporal> [--json]
    epi canon residency [--target idea|hen]
    epi canon kit <role> [--json]
    ```

    **Depth ladder semantics** (consume the Tranche 5.23 vocabulary; render via locality-aware concatenation per CCT-16 semantic.rs update):

    - **`pithy`** — concatenation of `q_5_*_*` + `q_5'_*_*` + `q_1_*_*` + `q_1'_*_*` (the kernel essence — definition + integration archetypes, both phases). Target: ~80 tokens. Used by agent dispatch envelopes (per Tranche 12.26 two-call pattern).
    - **`qv-detail`** — all `q_*_*` and `q_*'_*` content properties for the node, ordered per Tranche 5.23 concatenation contract. Target: ~250-500 tokens depending on density.
    - **`relational`** — `pithy` + the node's `q_4_{i?}_locality_signature` expanded with one-hop adjacent-node pithy excerpts (the locality layer per Tranche 5.23). Target: ~400-800 tokens. Used for context-rich agent dispatch where neighbourhood matters.
    - **`seed`** — raw seed file from [`Idea/Bimba/Seeds/`](../../) for the coordinate. Target: variable, can be 2k-15k tokens. Used for canon-development pair-work.

    **Additional canon surfaces:**

    - `epi canon kernel` — emits the ~1.5k-token universal canon kernel: the `#` operator definition, the 6×6 family matrix (P/S/T/M/L/C × #0..#5) with pithy per cell, the 7 CF roots, the residency law summary. Built by concatenating `pithy` of the kernel coordinates (per the `bimba-vault-map` canonical seed). Designed to REPLACE roughly half of `CLAUDE.md`'s unconditional auto-injection (M-branch status, planet model, 72-fold bridge, anuttara languification become on-demand).
    - `epi canon agent <path> --section <s>` — the per-agent ANIMA.md 6-section slicer. Sections per [`anima/S4'/agents/`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/) convention: `rupa`, `ontology`, `frame`, `temporal`, `capability`, `sattva`. Used by Anima subagent dispatch for the per-agent canon delivery contract (per the cycle-3 synthesis: `epi canon kernel` + `epi canon agent X --section sattva` is the two-call dispatch pattern).
    - `epi canon residency` — prints the 3-bullet canon-boundary contract per [`bimba-vault-validate/SKILL.md`](../../../../../.claude/skills/bimba-vault-validate/SKILL.md) residency law: canon = `Idea/Bimba/`, `Idea/Pratibimba/`, `Idea/Empty/`; Hen is the only authority that writes canonical Forms; agents NEVER write directly. Cheap, prevents per-agent re-derivation.
    - `epi canon kit <role>` — composite surface for one agent role (`hen`, `chronos`, `aletheia`, `epii`, `anima`, `sophia`, `psyche`, `nous`, `logos`, `eros`, `mythos`): kernel + relevant family pithy + the role's ANIMA.md `sattva` section + residency. The context-pack delivery contract for any subagent spawn.

    **Implementation targets** (anti-greenfield: extend existing engines):
    - `Body/S/S0/epi-cli/src/canon/mod.rs` — new module wrapping the existing `knowing::build_family_dossier_with_mode` engine; routes by subcommand to per-depth renderers.
    - `Body/S/S0/epi-cli/src/canon/coord.rs` — the depth-ladder renderer; reads from Bimba via the gateway's `s2'.coordinate.resolve` method (per Track 11 / Theia parity) with fallback to direct Neo4j on gateway absence.
    - `Body/S/S0/epi-cli/src/canon/kernel.rs` — kernel composition; pre-rendered cache at `~/.epi-logos/canon/kernel.cache.json` invalidated on `graph_revision` bump (per CCT-16(v)).
    - `Body/S/S0/epi-cli/src/canon/agent.rs` — per-agent ANIMA.md slicer; reads from [`anima/S4'/agents/`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/) directly (vault read, no graph hit).
    - `Body/S/S0/epi-cli/src/canon/residency.rs` + `kit.rs` — composite/literal surfaces.
    - Clap subcommand wiring in `epi-cli/src/main.rs` adding `Canon` arm peer to `Vault`, `Graph`, `Gate`, `Nara`.

    **Decoupling from CLAUDE.md auto-injection** (downstream benefit, NOT this tranche's scope but enabled): once `epi canon` is live, [`CLAUDE.md`](../../../../../CLAUDE.md) can be reorganised so the unconditional auto-load is ~1.5k tokens (kernel-equivalent) and the rest becomes on-demand. That repackaging is a separate cycle-3-or-cycle-4 follow-up tranche; this tranche's acceptance does NOT depend on it.

    **Acceptance gate:** `epi canon coord S3 --depth pithy` returns concatenated `q_5_*` + `q_5'_*` + `q_1_*` + `q_1'_*` content from the S3 Bimba node in under 100 tokens; `epi canon coord S3 --depth relational` includes the `q_4_{i?}_locality_signature` and one-hop adjacent pithy; `epi canon kernel` returns under 2k tokens; `epi canon agent anima/sophia --section sattva` returns Sophia's Sattva section from her ANIMA.md; `epi canon residency` prints the 3-bullet contract; `epi canon kit hen` returns the composite kit. Output for the same query is byte-identical to `bimba-mcp.spec_retrieve` (per Tranche 17.28 parity contract).

    Verification: `cargo test -p epi-cli --test canon_coord_depth_ladder` asserts each rung's token budget within tolerance and content shape; `cargo test -p epi-cli --test canon_kernel_under_2k_tokens`; `cargo test -p epi-cli --test canon_agent_section_slice` against fixture ANIMA.md; `cargo test -p epi-cli --test canon_residency_literal_output`; `cargo test -p epi-cli --test canon_kit_composite` returns expected kit shape for `hen` and `aletheia` roles; integration test `cargo test -p epi-cli --test canon_matches_bimba_mcp` confirms byte-identity with the MCP surface (gates against Tranche 17.28).

    Cross-track hooks: Tranche **5.23** defines the vocabulary this CLI reads; Tranche **17.28** mirrors this CLI as the MCP wire format; CCT-16(v) provides the `graph_revision` invalidation signal for the kernel cache; Tranche **6.12** is the upstream wisdom loop whose accepted proposals appear in this CLI's output; Track **11** (Theia shell) should consume this CLI rather than duplicate the rendering.

    **LANDING NOTE (rerun close, 2026-07-13, uc-0913) — depth-ladder + parity surface graph-live.** The `epi canon coord <COORD> --depth <pithy|qv-detail|relational> [--json]` depth ladder is landed at `Body/S/S0/epi-cli/src/canon/coord.rs` and reads the **LIVE Neo4j `:Bimba` graph** through the same S2 seam as `core/quintessential_view.rs::load_graph_subbranch` (`Neo4jConfig::from_env` / `Neo4jClient::connect`) — **no static-dataset fallback**: an unreachable graph makes the command exit non-zero (verified: connection-refused → `canon error … exit 1`), so a run can never pass while falsely claiming live coverage. The stale synthetic `{token,frame,square,resolve,identity,surface}` enum is **retired**; its structural framestore engine (used by `canon diff` / `canon search`) moved to `Body/S/S0/epi-cli/src/canon/framestore.rs`. **Depth vocabulary narrowed to the three MCP-parity rungs** (`seed`, `kernel`, `agent`, `residency`, `kit` remain future surfaces, NOT landed here) so the CLI accepts exactly `bimba-mcp`'s `CanonCoordDepthSchema = ['pithy','qv-detail','relational']`; parity holds because `spec_retrieve` shells this same command (acceptance: `Body/S/S2/external/bimba-mcp/tests/canon_parity.test.ts` **19/19 green**, 18 matrix + 1 backward-compat).

    **Reconciliation vs. the token targets above.** The doc's rung budgets (`pithy` ~80 / "under 100" tokens; `qv-detail` ~250–500; `kernel` <2k) assumed *short pithy* q_ registers. The live graph instead stores **full-prose** q_ registers (S3's `q_5_consequence_to_shared_state` alone is ~300 tokens; S3 `pithy` ≈ 856 est. tokens). Per the standing law (live Bimba graph = baseline ontology) the surface renders **graph-truth**: it reports `token_estimate` per packet but does **not** gate on a budget the real data cannot meet. Register phase-marker: `q_5'` is stored as `q_5_i_*` (the `_i_` segment marks the prime phase); `pithy` = `q_5`+`q_5'`+`q_1`+`q_1'`, `qv-detail` = all positions 0–5 ascending (base before prime), `relational` = `pithy` + the `q_4` locality register + one-hop `:Bimba` neighbour excerpts with their edge types. Verification runner is `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test cli_canon_coord_depth_ladder` (epi-cli is workspace-excluded → `--manifest-path`, never `-p`).

14. **9.14 — `/World` as 1st-class S2 namespace + `:Gnostic` label promotion** *(spec-ahead-integration; depends on DR-WORLD-1, DR-S5-ONE-1; CCT-17b cross-link; canonical landing point for the namespace map)*

    Per DR-WORLD-1 (Phase-I 2026-06-15), mint `/World` as a 1st-class S2 namespace with `:World` (+ `:Archetypal` alias) graph label, and explicitly link `:World` entity nodes to the base C-coordinates via `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF` typed relations. Per DR-S5-ONE-1, promote `:Gnostic` to a graph label alongside `:World` (currently implicit; no label enforced).

    **Schema additions** at [`Body/S/S2/graph-schema/src/lib.rs`](../../../../../Body/S/S2/graph-schema/src/lib.rs):

    ```rust
    pub const WORLD_LABEL: &str = "World";
    pub const ARCHETYPAL_LABEL: &str = "Archetypal"; // alias for :World

    pub const GNOSTIC_LABEL: &str = "Gnostic";
    pub const GNOSTIC_CORPUS_LABEL: &str = "Gnostic:Corpus";
    pub const GNOSTIC_NOTEBOOK_LABEL: &str = "Gnostic:Notebook";
    pub const GNOSTIC_ETYMOLOGY_LABEL: &str = "Gnostic:Etymology";
    pub const GNOSTIC_SKILLS_LABEL: &str = "Gnostic:Skills";

    pub const WORLD_FORM_OF_RELATION: &str = "WORLD_FORM_OF";
    pub const WORLD_ONTOLOGY_OF_RELATION: &str = "WORLD_ONTOLOGY_OF";
    ```

    Add to `RELATIONSHIP_TYPE_SPECS`:
    ```rust
    GraphRelationshipTypeSpec {
        rel_type: "WORLD_FORM_OF",
        coordinate_home: "C0..C5",  // any C-layer
        source_family: "world-entity",
        compatibility: false,
    }
    GraphRelationshipTypeSpec {
        rel_type: "WORLD_ONTOLOGY_OF",
        coordinate_home: "C4",  // Types / MOC authority
        source_family: "world-entity",
        compatibility: false,
    }
    ```

    **The four-namespace map.** Per DR-S5-ONE-1 + DR-WORLD-1, the S2 namespace map after this tranche lands:

    | Graph label | Vault dir | Sub-namespaces | Role |
    |---|---|---|---|
    | `:Bimba` | `/Idea/Bimba/Seeds/M/` | (no sub) | canonical M0-M5 + S0-S5 + 17 relations |
    | **`:World`** (+ `:Archetypal` alias) | `/Idea/Bimba/World/Types/` | (no sub for now) | entity forms, types, C-layer typology; psychoid root linked to base C-coords via `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF` |
    | **`:Gnostic`** | (Python wrapper; no vault dir) | `:Gnostic:Corpus`, `:Gnostic:Notebook`, `:Gnostic:Etymology`, `:Gnostic:Skills` | RAG corpus, per-session notebooks, etymological clusters, skill manifest |
    | (`:Pratibimba`, S0-protected) | `/Idea/Pratibimba/System/` | (no sub; never on public graph) | personal episodic, protected-local |

    **The psychoid-root link.** Every entity in `:World` carries a typed `WORLD_FORM_OF` relation back to its primary C-coordinate (C0-C5) in `:Bimba`. **`/World` IS NOT parallel-structure; it IS the C-axis psychoid expression of the canonical M/S/L/P/T/C field.** C0-C5 ARE the psychoid root; `:World` makes them queryable as entity-forms.

    **Hen graph-promotion** at [`Body/S/S1/hen-compiler-core/src/graph_promotion.rs`](../../../../../Body/S/S1/hen-compiler-core/src/graph_promotion.rs) — when entities promote from `/Idea/Empty/Present/{day}/entities/` to `/Idea/Bimba/World/Types/Coordinates/C{n}/`, Hen creates the corresponding `:World` node with a `WORLD_FORM_OF` edge to the parent C-coord. When entities graduate to flat `/Idea/Bimba/World/{Name}.md`, the `:World` node updates; psychoid root link is preserved across the promote→graduate lifecycle.

    **Wikilink span-pointer** (per CCT-17b) — wikilinks in `/Idea/Bimba/World/Types/` files populate `c_1_source_artifact_span: StringList` on the `:World` node. This promotes wikilinks from presentation-only to first-class retrieval primitive.

    **Unified memory API layered** (per DR-WORLD-1 + DR-S5-ONE-1):
    - **`s0'.anuttara.compress_entity(coord)`** → archetypal essence (VAK-distilled `c_1_*`) — M0 alphabet expression of VAK
    - **`s1'.world.resolve(coord)`** → entity-ontology (forms, types, wikilinks, resonances, birth-codon) — NEW route per Tranche 6.1 EXPANDED
    - **`s2.graph.node(coord)`** → canonical bimba graph node (all relations + metadata) — already live

    Three optional reads in parallel. The unified memory API is the **namespace boundary itself**, not a single endpoint.

    **Verification:** `grep -nE "WORLD_LABEL|WORLD_FORM_OF|WORLD_ONTOLOGY_OF|ARCHETYPAL_LABEL|GNOSTIC_LABEL|GNOSTIC_CORPUS_LABEL" Body/S/S2/graph-schema/src/lib.rs` returns the schema additions; `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema world_namespace_round_trip`; `cargo test -p epi-s2-graph-schema gnostic_label_promotion`; integration test: promoting an entity to `/Idea/Bimba/World/Types/Coordinates/C2/SomeEntity.md` creates a `:World` node with `WORLD_FORM_OF` edge to the parent C2 `:Bimba` node and populates `c_1_source_artifact_span` from the entity's wikilinks; graduating to flat `/Idea/Bimba/World/SomeEntity.md` preserves the `WORLD_FORM_OF` link.

    **Cross-track hooks:** DR-WORLD-1, DR-S5-ONE-1, DR-IG-1 (relation-family enum the new relations participate in); CCT-14 (entity-candidate lifecycle that feeds `:World` nodes); CCT-15 (C-layer semantic typology hosts the entity files); CCT-17b (wikilink span-pointer); Tranche 6.1 EXPANDED (gateway routes `s1'.world.resolve`); Track 39 (comprehensive substrate plan).
