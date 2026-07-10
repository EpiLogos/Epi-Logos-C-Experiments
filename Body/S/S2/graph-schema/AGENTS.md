# AGENTS.md — graph-schema

## Purpose
Crate `epi-s2-graph-schema`: "S2 graph schema contract for Epi-Logos Bimba graph services" — the shared label/property/relationship registries that define the Neo4j graph contract.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `Cargo.toml` — package `epi-s2-graph-schema`, lib `epi_s2_graph_schema`; deps: `serde`.
- `src/lib.rs` — crate root / public barrel for schema modules and crate-level tests.
- `src/constants.rs` — schema/version/index constants (`SCHEMA_VERSION`, `GRAPH_ID`, `EMBEDDING_VERSION`, `Q_SCHEMA_VERSION`, vector index definitions).
- `src/coordinate_home.rs` — typed `CoordinateHome` enum preserving legacy string display for schema table homes.
- `src/coordinate_law.rs` — coordinate prefix/semantic family registries and coordinate property construction law.
- `src/labels.rs` — label constants and `GraphLabelSpec` registry (`BIMBA_LABEL`, `WORLD_LABEL`, `ARCHETYPAL_LABEL`, `GNOSTIC_LABEL`, Gnostic labels, compatibility labels).
- `src/properties.rs` — node/relationship property constants and typed `GraphPropertySpec` registries (`COORDINATE_PROPERTY`, `c_*`, `s_*`, `m_*`, relationship evidence, relation family, C-first `World/Types` evidence properties, and the CCT-14b `c_5_birth_*` birth-codon family + `birth_codon_state` written by Hen at promotion).
- `src/relationships/` — relationship constants and registries: `mod.rs` public surface, `node.rs` node/relation constants, `rel.rs` typed `GraphRelationshipTypeSpec` registry, `deep_bimba.rs` deep-dataset relation classifier.
- `src/validation.rs` / `src/constraints.rs` — property validation helpers and Neo4j constraint/index DDL.
- `tests/` — schema contract tests: `label_registry.rs`, `property_registry.rs`, `relationship_registry.rs`, `code_provenance_properties.rs`, `coordinate_prefix_properties.rs`, `q_vocabulary_canon_loaded.rs`, `track_02_t1_convergence.rs`, `world_namespace.rs`, `gnostic_label_promotion.rs`, `c_5_birth_codon_regex_acceptance.rs`.
- `contract-inventory/` — `track-02-authority-drift.json`: pinned contract inventory snapshot.
- Does NOT own: Neo4j/Redis service logic or the Turtle ontology (sibling `graph-services/`, `ontology/`); coordinate semantics route through S2' carriers. Domain law lives in this layer's owning spec, not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` (public barrel for split schema constants/registries; no `//!` doc-header — crate description per `Cargo.toml`).
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]].
- No CONTRACT.md at this level — see parent [[AGENTS.md]] + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings (these constants are consumed cross-crate by `graph-services`).
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo check -p epi-s2-graph-schema` and `cargo test -p epi-s2-graph-schema` (or `make rust-test`).

## Child DOX Index
- (leaf)
