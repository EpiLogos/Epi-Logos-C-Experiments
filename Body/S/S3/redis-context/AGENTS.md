# AGENTS.md — redis-context

## Purpose
`epi-s3-redis-context`: "S3 Redis runtime context and RedisVL bridge residency contract" — the Rust crate that defines the Redis runtime substrate role, cache tiers/keys, and the RedisVL bridge residency law for the gateway control plane.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `Cargo.toml` — crate manifest (`epi-s3-redis-context`, lib name `epi_s3_redis_context`).
- `src/lib.rs` — crate root / public surface: `RedisRuntimeRole`, namespace + relative-path constants (`S2_GRAPH_SEMANTIC_NAMESPACE`, `S3_TEMPORAL_NAMESPACE`, `REDISVL_*`), re-exports of `redis_cache`.
- `src/redis_cache.rs` — `CacheTier` (Live/Active/Hot/Warm/Cold TTLs), `RedisCache`, `RedisConfig`, `RedisKey`, and CCT-21 BeingPattern temporal handle key families.
- `tests/redis_runtime_contract.rs` — contract tests asserting the runtime owner, namespaces, and RedisVL bridge residency.
- `scripts/redisvl_cache_service/` — Python `redisvl_cache_service.py` + `setup.sh` (the RedisVL bridge referenced by the constants).
- Does NOT own coordinate semantics for other layers: S2 graph semantics route through their own namespace ([[S2-SPEC]]); temporal/gateway authority lives with sibling `gateway/` and `gateway-contract/` ([[S3-SPEC]]). The S-coordinate is the conceptual law; this crate is the Redis-substrate convenience residency.

## Local Contracts
- Code Coordinate Header: the `Cargo.toml` `description` above; the residency invariants encoded as constants in `src/lib.rs` and asserted in `tests/redis_runtime_contract.rs`.
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- No CONTRACT.md / README.md exists here — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test --manifest-path Body/S/S3/redis-context/Cargo.toml --test being_pattern_keys` for CCT-21; `cargo test -p epi-s3-redis-context` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
