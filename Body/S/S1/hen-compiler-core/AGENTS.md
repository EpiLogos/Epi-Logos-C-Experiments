# AGENTS.md — hen-compiler-core

## Purpose
Rust contract crate `epi-s1-hen-compiler-core` — "S1 Hen compiler contract for Epi-Logos residency and agent invocation law" (Cargo.toml `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S1-SPEC]]

## Ownership
- `src/lib.rs` — crate root / public surface (`//!` "S1 Hen compiler contract."); re-exports compile_plan, coordinate, frontmatter, graph_sync, ledger, residency, smart_env.
- `src/residency.rs` — compiler residency resolution (`resolve_compiler_residency`, `HenTimestamp`).
- `src/frontmatter.rs` — frontmatter validation (`validate_frontmatter`, `validate_compile_artifact_frontmatter`).
- `src/compile_plan.rs` — compile-plan + compiler-invocation contract (`plan_compile`, `TargetAgent`, `ExecutorKind`).
- `src/coordinate.rs` — coordinate validity (`is_valid_coordinate`).
- `src/wikilinks.rs` — wikilink parsing (`WikilinkTarget`).
- `src/graph_promotion.rs`, `src/graph_sync.rs` — graph promotion + sync intent; graph promotion emits C-first `World/Types` evidence (`type_family`, `type_path`, `type_coordinate`, `semantic_authority`, `crystallisation_state`, `c_layer_path`) before other coordinate-family qualifiers, requests `:World`/`:Archetypal` labels for `Idea/Bimba/World/**`, carries `c_1_source_artifact_span` wikilink pointers for `World/Types`, and emits deterministic `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF` root-link relation candidates.
- `src/ledger.rs` — envelope ledger channels.
- `src/l_alignments.rs`, `src/property_intelligence.rs`, `src/relation_inference.rs`, `src/artifact_evidence.rs` — alignment, property, relation-inference, evidence law; artifact evidence collects C2 entity-candidate, C3 diagram/canvas, C4 type/MOC, and C5 World-graduation evidence from frontmatter plus `World/Types` ancestry.
- `src/smart_env.rs` (private mod) — link-candidate suggestion (`suggest_link_candidates`).
- `tests/` — contract tests (module_surface, frontmatter, q_vocabulary_unknown_key_rejection, compile_plan, graph_promotion_intent, c_layer_typology_classification, entity_candidate_lifecycle, wikilink_parser, etc.); `entity_candidate_lifecycle` covers `:World` label/root-link/span-pointer promotion and graduation preservation. `tests/fixtures/` holds test data.
- Does NOT own coordinate semantics or canon-write authority beyond Hen's mandate; domain law for other layers lives in those layers' owning modules/specs. Canon (`Idea/Bimba|Pratibimba|Empty`) is written only through Hen with explicit review — never directly.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` (`//!` — "S1 Hen compiler contract.").
- Owning specs: [[S1-SPEC]] and [[S1-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- No CONTRACT.md here — see parent `Body/S/S1/AGENTS.md` + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter; residency + frontmatter law is enforced here (`residency.rs`, `frontmatter.rs`) — keep changes contract-faithful and update `tests/`.

## Verification
- `cargo test -p epi-s1-hen-compiler-core` (or `make rust-test` from repo root).

## Child DOX Index
- (leaf)
