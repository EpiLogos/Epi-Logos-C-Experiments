# AGENTS.md — graph-schema

## Purpose
Crate `epi-s2-graph-schema`: "S2 graph schema contract for Epi-Logos Bimba graph services" — the shared label/property/relationship registries that define the Neo4j graph contract.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `Cargo.toml` — package `epi-s2-graph-schema`, lib `epi_s2_graph_schema`; deps: `serde`.
- `src/lib.rs` — crate root / public surface: schema constants (`SCHEMA_VERSION`, `GRAPH_ID`, `EMBEDDING_VERSION`, `Q_SCHEMA_VERSION`), label/property names (`BIMBA_LABEL`, `COORDINATE_PROPERTY`, `c_*` prefixed property constants), and the registries consumed by sibling `graph-services`.
- `tests/` — schema contract tests: `label_registry.rs`, `property_registry.rs`, `relationship_registry.rs`, `code_provenance_properties.rs`, `coordinate_prefix_properties.rs`, `q_vocabulary_canon_loaded.rs`, `track_02_t1_convergence.rs`.
- `contract-inventory/` — `track-02-authority-drift.json`: pinned contract inventory snapshot.
- Does NOT own: Neo4j/Redis service logic or the Turtle ontology (sibling `graph-services/`, `ontology/`); coordinate semantics route through S2' carriers. Domain law lives in this layer's owning spec, not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` (schema constants/registries; no `//!` doc-header — crate description per `Cargo.toml`).
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]].
- No CONTRACT.md at this level — see parent [[AGENTS.md]] + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings (these constants are consumed cross-crate by `graph-services`).
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s2-graph-schema` (or `make rust-test`).

## Child DOX Index
- (leaf)
