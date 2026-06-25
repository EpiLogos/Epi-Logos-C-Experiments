# AGENTS.md — graph-services

## Purpose
Crate `epi-s2-graph-services`: "S2 graph service contracts for Neo4j and Redis-backed semantic cache" (Cargo.toml `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `Cargo.toml` — crate manifest (`epi-s2-graph-services`, lib `epi_s2_graph_services`); deps on `epi-s2-graph-schema`, `epi-s3-gateway-contract`, `epi-s3-redis-context`, `epi-kernel-contract`, `gemini-embedding`, `portal-core`, `neo4rs`.
- `src/lib.rs` — crate root / public surface (no `//!` header; re-exports the module API).
- `src/` modules — service surface: `sync_coordinator.rs` (S1 Hen graph-promotion validation, including C-first `type_coordinate`/`World/Types` evidence requirements, `:World`/`:Archetypal` label hints, `c_1_source_artifact_span`, and `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF` root links before Neo4j writes), `bidirectional_sync.rs`, `retrieval_query.rs` + `retrieval/` (coordinate/graphrag/hybrid), `doctor.rs`, `ontology.rs`, `dataset_import/` (node/edge/validation), `graph_api.rs`, `coordinate.rs`, `semantic.rs`, `embeddings.rs`, `seed.rs`, `pointers.rs`, `relationship_manager.rs`, `gds.rs`, `constraint.rs`, `schema.rs`, plus others.
- `tests/` — contract test suite (graph_api, coordinate_query, promotion_policy, graph_promotion_contract, semantic_cache, semantic_doc_includes_locality_signature, q_5_fallback_bucket_law, neo4j, dataset_import_live, etc.).
- Does NOT own the schema registries (sibling `graph-schema/`), the Turtle ontology source (sibling `ontology/epi.ttl`, consumed by `src/ontology.rs`), or coordinate semantics (route through S2' carriers). Domain law lives in this layer's owning spec, not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` (public module + re-export surface; no `//!` — description per Cargo.toml).
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]].
- No CONTRACT.md at this level — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s2-graph-services` (or `make rust-test`).
- VAK emission phase lint: `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test vak_envelope_required_on_emissions` when the root workspace does not expose this crate via `-p`.

## Child DOX Index
- (leaf)
