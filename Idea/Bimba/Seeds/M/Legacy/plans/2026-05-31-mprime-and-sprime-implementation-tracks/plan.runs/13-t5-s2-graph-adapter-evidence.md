# 13.T5 — S2 Graph Command Adapter Hardening — Evidence

- **Date:** 2026-06-02
- **Owner:** `admin-13t5-s2-graph-adapter` (parallel Thread P)
- **Plan task:** [13-s-sprime-modularity-and-s0-membrane-cleanup.md](../13-s-sprime-modularity-and-s0-membrane-cleanup.md) §134–153

---

## Mission

Close 13.T5: reduce `Body/S/S0/epi-cli/src/graph/mod.rs` to CLI parsing,
service invocation, and rendering only. Move remaining graph-law
helpers into `Body/S/S2/graph-services`. Add a type-name ownership test
proving graph retrieval, semantic cache, dataset import, doctor,
relationship manager, and sync coordinator types resolve to
`epi_s2_graph_services`.

## Inventory (modules audited: 31)

| Pre-state | Count | Action | Notes |
|---|---|---|---|
| 1-line `pub use epi_s2_graph_services::*` re-exports (already canonical) | 22 | Kept S0 as compatibility adapter | api, alignment_validator, bidirectional_sync, coordinate_array_parser, dataset_import, doctor, embeddings, link_enforcement, mapper, meta, redis_cache, relationship_manager, retrieval/{coordinate,graphrag,hybrid,mod}, schema, seed, semantic, semantic_cache, sync, sync_coordinator, sync_orchestrator, types |
| Non-trivial S0-local logic | 7 | See below | analyse, anuttara, constraint, cypher, dev, ingest, retrieval/mod |
| **Plus** `mod.rs` itself | 1 | Reduced (1325 → 1200 LOC) | Removed in-file `live_graph_backed_evidence` and `maybe_refresh_semantic_embeddings` (~130 LOC) |

## Moves S0 → S2 (4)

| Module | LOC moved | New S2 path |
|---|---|---|
| `cypher.rs` (guard + run pipeline) | ~329 | `Body/S/S2/graph-services/src/cypher.rs` |
| `constraint.rs` (YAML registry + Cypher constraint runner) | ~315 | `Body/S/S2/graph-services/src/constraint.rs` |
| `analyse.rs` (DeterministicAnalyser + ResonanceAnalyser trait) | ~335 | `Body/S/S2/graph-services/src/analyse.rs` |
| `anuttara.rs` (parse_strict + build_reflection_prompt) | ~126 | `Body/S/S2/graph-services/src/anuttara.rs` |

Plus a new S2 `lifecycle.rs` module extracted from S0 `mod.rs`:

| Function | Before | After |
|---|---|---|
| `live_graph_backed_evidence(client)` | S0 `mod.rs` private | `epi_s2_graph_services::lifecycle::live_graph_backed_evidence` |
| `LiveGraphBackedEvidence` (struct) | S0 `mod.rs` private | `epi_s2_graph_services::lifecycle::LiveGraphBackedEvidence` (fields `pub`) |
| `maybe_refresh_semantic_embeddings(client)` | S0 `mod.rs` private | `epi_s2_graph_services::lifecycle::maybe_refresh_semantic_embeddings` |

The four S0 modules now become thin named-re-export adapters with a
comment marking them as adapter seams. `mod.rs` consumes the S2
lifecycle helpers via `pub use epi_s2_graph_services::{...}` so CLI
arms remain wire-shape-stable.

## Kept S0 (CLI-only operator surface) (3 of 7 non-trivial)

| Module | LOC | Reason |
|---|---|---|
| `dev.rs` | 178 | Operator-CLI lifecycle (`epi graph bootstrap-dev`): docker compose orchestration + redisvl venv bootstrap + `.env.graph-dev` writer + Neo4j/Redis health poll. Pure process-host substrate (compose-file discovery, shell escaping, child-process invocation). Not graph law. |
| `ingest.rs` | 189 | Operator-side ingestion session JSON store under `~/.epi-logos/ingestion/`. CLI session-file persistence, not graph mutation. (Uses `epi_kernel_contract::IngestionSession` for the typed payload — schema lives in M0 substrate, not S2.) |
| `retrieval/mod.rs` | 7 | Pure submodule façade re-exporting `coordinate`, `graphrag`, `hybrid` sibling shims. No logic. |

`graph/mod.rs` is now CLI parsing (`GraphCmd`/`ConstraintCmd`/`ConstraintSeverityArg` enums), service invocation (every arm calls into either S2 graph-services or the S0 operator-CLI subset above), and rendering (JSON/human format dispatch). The only non-trivial private fn that remains is `compose_file_path` — operator file-system discovery for `docker-compose.epi-s2.yml`. That is S0 process-host substrate per the keystone ("S0 may expose commands, parse CLI parameters, launch local services, hold user-facing compatibility aliases, and route gateway frames").

## Type-name ownership tests added

**Test 1: `t5_graph_law_types_resolve_to_epi_s2_graph_services`**
- Location: `Body/S/S2/graph-services/tests/graph_runtime_extraction_contract.rs`
- Asserts via `std::any::type_name` that the named six (graph retrieval, semantic cache, dataset import, doctor, relationship manager, sync coordinator) + T5 moves (cypher guard, constraint registry, analyser, Anuttara reflection) + lifecycle evidence shape all resolve to `epi_s2_graph_services`.

**Test 2: `t5_s0_graph_facade_re_exports_resolve_to_epi_s2_graph_services`**
- Location: `Body/S/S0/epi-cli/tests/graph_commands.rs`
- Mirror test asserting the S0 compatibility re-export facade (`epi_logos::graph::{cypher,constraint,analyse,anuttara,doctor,dataset_import,relationship_manager,sync_coordinator,semantic_cache,retrieval::{coordinate,graphrag,hybrid}}`) all resolve back to `epi_s2_graph_services` types — proves the membrane doesn't accrete S0-local types behind the façade.

## Test runs (all four required)

| Command | Result |
|---|---|
| `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml` | **177 passed / 0 failed / 11 ignored** (lib 91 + retrieval_vak_bias 3 + schema_creation_contract 5 + seed_contract 3 + semantic_cache_contract 6 + graph_runtime_extraction_contract 7 + many more) |
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_commands` | **6 passed / 0 failed / 3 ignored** (includes new `t5_s0_graph_facade_re_exports_resolve_to_epi_s2_graph_services`) |
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test semantic_cache_contract` | **4 passed / 0 failed / 2 ignored** (assertion updated: `q_schema_version` literal aligned to current `q-prefix-v2` schema constant) |
| Type-name ownership test (`--test graph_runtime_extraction_contract`) | **7 passed / 0 failed / 0 ignored** (existing 6 + new `t5_graph_law_types_resolve_to_epi_s2_graph_services`) |

## Net effect

- S0 `graph/mod.rs` reduced from 1325 → 1200 LOC; the 125-LOC drop is exactly the two extracted helpers (`live_graph_backed_evidence` and `maybe_refresh_semantic_embeddings`).
- 4 non-trivial S0 modules (cypher, constraint, analyse, anuttara) converted to 5–8 LOC named-re-export adapters with explicit "S0 adapter" doc comments.
- S2 graph-services gains 5 new modules (cypher, constraint, analyse, anuttara, lifecycle) totaling ~1,470 LOC of relocated graph law + ~140 LOC of new lifecycle extraction.
- `epi-kernel-contract` added to S2 graph-services `[dependencies]` (needed by the moved `constraint`, `analyse`, `anuttara` modules for `TrajectoryDeposit`, `ConstraintRegistryEntry`, `ResonanceAnalysis`, `AnuttaraDiagnostic`).
- Public-API stability: every existing S0 call site (`graph::cypher::CypherMode`, `graph::constraint::run_all`, `graph::analyse::DeterministicAnalyser`, `graph::anuttara::parse_strict`, etc.) continues to work via the compatibility re-exports.

## Lane discipline observed

- Touched only `Body/S/S0/epi-cli/src/graph/**`, `Body/S/S2/graph-services/src/**`, `Body/S/S2/graph-services/tests/**`, `Body/S/S2/graph-services/Cargo.toml`, `Body/S/S0/epi-cli/tests/{graph_commands,semantic_cache_contract}.rs`, and this evidence file.
- No writes to `Body/S/S0/epi-cli/src/gate/**`, `Body/S/S0/epi-cli/src/vault/**`, `Body/S/S2/graph-schema/**`, or any S3/S4/S5 substrate.
- Wire shapes preserved: all CLI commands (`epi graph bootstrap`/`init`/`update`/`reconcile`/`doctor`/`cypher`/`analyse-resonance`/`ask-anuttara`/`constraint`/etc.) keep identical input/output formats — verified by the existing offline JSON-shape assertions in `graph_commands.rs` continuing to pass.
