# AGENTS.md — S2

## Purpose
The GraphDB Substrate layer: raw Neo4j + Redis as shared infrastructure plus the Rust contracts and ontology that drive coordinate-aware graph access ("S2 graph service contracts for Neo4j and Redis-backed semantic cache").
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `graph-schema/` — crate `epi-s2-graph-schema`: "S2 graph schema contract for Epi-Logos Bimba graph services" (label/property/relationship registries, contract-inventory, schema tests).
- `graph-services/` — crate `epi-s2-graph-services`: Neo4j (`neo4rs`) + Redis semantic-cache service surface — sync, retrieval, doctor, ontology bridge, dataset import (`src/*.rs` modules, `tests/` contract suite).
- `ontology/` — `epi.ttl`: the Turtle ontology (`epi:` namespace, OWL2_RL profile) consumed by `graph-services/src/ontology.rs`.
- `external/` — vendored `bimba-mcp` Node MCP server ("MCP server for Bimba coordinate system and Neo4j knowledge graph access").
- `RUNBOOK.md` — local graph topology / service runbook.
- Does NOT own coordinate semantics: raw Neo4j/Redis carry no coordinate law here — that routes through S2' carriers. Domain law lives in this layer's owning spec, not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

## Local Contracts
- Code Coordinate Header: `graph-services/src/lib.rs` (module surface) and `graph-schema/src/lib.rs` (schema constants — `SCHEMA_VERSION`, registries; no `//!` header — description per Cargo.toml).
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]].
- No CONTRACT.md at this level — see children + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s2-graph-schema` and `cargo test -p epi-s2-graph-services` (or `make rust-test`).
- `bimba-mcp`: `npm test` (vitest) in `external/bimba-mcp/`.

## Child DOX Index
- `graph-schema/AGENTS.md` — `epi-s2-graph-schema` crate: S2 graph schema contract (label/property/relationship registries).
- `graph-services/AGENTS.md` — `epi-s2-graph-services` crate: Neo4j + Redis semantic-cache service contracts (sync, retrieval, doctor, ontology bridge).
- `ontology/AGENTS.md` — `epi.ttl` Turtle ontology (`epi:` namespace) for the S2 coordinate bridge.
- `external/AGENTS.md` — vendored `bimba-mcp` Node MCP server for Bimba coordinate + Neo4j graph access.
