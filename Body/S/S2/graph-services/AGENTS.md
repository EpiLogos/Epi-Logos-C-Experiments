# AGENTS.md — graph-services

## Purpose
Crate `epi-s2-graph-services`: "S2 graph service contracts for Neo4j and Redis-backed semantic cache" (Cargo.toml `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `Cargo.toml` — crate manifest (`epi-s2-graph-services`, lib `epi_s2_graph_services`); deps on `epi-s2-graph-schema`, `epi-kernel-contract`, `gemini-embedding`, `portal-core`, `neo4rs`, `redis`, `reqwest`. **Track 53 T53.06** removed the last two S2→S3 edges (`epi-s3-gateway-contract`, `epi-s3-redis-context`) — the final entries in `lint-boundaries.mjs`'s `legacyForbiddenImportAllowlist`. They were carried only to quote declarations *about* the S2/S3 boundary (the Redis residency role, tier vocabulary, connection descriptor, RedisVL bridge path, Graphiti authority); those live at `epi-kernel-contract` now, below both layers. This crate must acquire no S3/S4/S5 dependency again — if a tranche seems to need one, the shared fact belongs at S-root or the caller belongs at its own coordinate.
- `src/lib.rs` — crate root / public surface (no `//!` header; re-exports the module API).
- `src/` modules — service surface: `sync/` (graph-promotion intent types, policy, property proposals, frontmatter rules, code provenance, Graphiti episode planning, promotion plans, coordinator executor, and reports) with `sync_coordinator.rs` as a compatibility re-export shim; `bidirectional_sync.rs`; `retrieval_query.rs` + `retrieval/` (coordinate/graphrag/hybrid); `doctor.rs` (which since Track 53 T53.06 probes Redis with its OWN two-command connection — `PING` + `FT._LIST` — because per canon raw Neo4j and Redis are S2's shared infrastructure; the server address still comes from the one `RedisConfig` at S-root, so an S2 probe and an S3′ write can never disagree about which server they mean); `ontology.rs`; `dataset_import/` (node/edge/validation); `graph_api.rs`; `curation_snapshot.rs` (read-only embedding-complete Bimba projection for higher-layer curation); `q_articulation.rs` (read-only canonical-target/revision preflight plus Anuttara diagnostic for an accepted Q amendment); `coordinate.rs`; `semantic.rs`; `embeddings.rs`; `seed.rs`; `pointers.rs`; `relationship_manager.rs`; `gds.rs`; `constraint.rs`; `schema.rs`; plus others.
- `tests/` — contract test suite (graph_api, coordinate_query, promotion_policy, graph_promotion_contract, semantic_cache, semantic_doc_includes_locality_signature, q_5_fallback_bucket_law, neo4j, dataset_import_live, etc.).
- `src/graph_api.rs` — owns the typed `s2.graph.list` [[M0]] residual plan: six canonical branches, fixed 20-row pages, exact live 108-count invariant, compiled twelve-slot exclusion through [[portal-core]], and an explicit root row. It is not generic caller-supplied Cypher.
- Does NOT own the schema registries (sibling `graph-schema/`), the Turtle ontology source (sibling `ontology/epi.ttl`, consumed by `src/ontology.rs`), or coordinate semantics (route through S2' carriers). Domain law lives in this layer's owning spec, not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

- CCT-16 substrate integrity (16.T16.16): `src/sync/frontmatter_rules.rs` owns the `{family}_{n}_{i?}_{semantic}` shape law (`resolve_frontmatter_key`: codified families q/qm/c/p/s/t/m/l survive verbatim, vault prime form `q_5'_x` canonicalises to `q_5_i_x` with both forms DISTINCT per DR-S1-6, the DR-M4-4 private q-partition is rejected, unknown families are lint ERRORS never silent drops; per CCT-20 textual `prime`/`inverted`/`inversion` tokens inside coordinate keys are ALSO lint errors — the `_i_`/prime shape is the only phase encoding, and `coordinate_phase_preservation_hermetic` (renamed from the misleading `_e2e`; it is hermetic slices, the live path is the CCT-16 test) pins that direct + inverted survive distinct with no generic mirror relation in the registry); `src/bidirectional_sync.rs` carries the `MostRecent` floor (`most_recent_winner` — ISO timestamps lexicographic, timestamped side beats bare side, both-bare refuses; Merge/Manual remain stubs by design); `src/meta.rs::bump_graph_revision` flips the Redis cold-tier namespace atomically and is wired into the sync coordinator + the `epi graph cypher --write/--admin` arms.

- CCT-17b (16.T16.17): `src/retrieval/wikilink_index.rs` promotes wikilinks from presentation to retrieval primitive (`suggest_world_links_by_coordinate` over World/Types entity files — coordinate-literal targets resolve directly, named targets resolve through sibling entities, spans carry the `c_1_source_artifact_span` pointer shape, unresolvable targets are never invented); `src/retrieval/tri_layer.rs` is the MemoryGraphRAG three-layer composition (ontology-filter → fact-traverse → cosine-rank; ranking never resurrects a filtered passage, facts need span anchors) — the `s5'.gnostic.query_with_layers` endpoint registration is Track 12's landing.

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
- [[M0]] residual query planning: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --test graph_api_contract m0_residual_list_plan`.

## Child DOX Index
- (leaf)
