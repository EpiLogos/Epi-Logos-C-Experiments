# AGENTS.md — redis-context

## Purpose
`epi-s3-redis-context`: "S3 Redis runtime context and RedisVL bridge residency contract" — the Rust crate that defines the Redis runtime substrate role, cache tiers/keys, RedisVL bridge residency law, and Aeon eval-ledger Redis/episode payloads for the gateway control plane.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `Cargo.toml` — crate manifest (`epi-s3-redis-context`, lib name `epi_s3_redis_context`).
- `src/lib.rs` — crate root / public surface: `RedisRuntimeRole`, namespace + relative-path constants (`S2_GRAPH_SEMANTIC_NAMESPACE`, `S3_TEMPORAL_NAMESPACE`, `REDISVL_*`), re-exports of `redis_cache` and `aeon_eval`.
- `src/redis_cache.rs` — `CacheTier` (Live/Active/Hot/Warm/Cold TTLs), `RedisCache`, `RedisConfig`, `RedisKey`, and CCT-21 BeingPattern temporal handle key families.
- `src/aeon_eval.rs` — transcript-to-metrics reader for landed `HarnessTurnEvent` JSONL, S5' hot-tier `eval:*` Redis records, and `aeon-eval` Graphiti episode payloads for Aletheia promotion. Since **50.T50.14** it reads a SECOND unit from the same transcript: the deterministic `orchestration_trace` record. Every behavioural metric here is derived by counting `toolCallObserved`, and Track 50 collapses N JSON tool calls into ONE generated script — so a code-mode run that did fifty reads and ten edits read as ZERO of each, the measurement going blind exactly when the orchestration works as designed. Trace ops are classified by the SAME `classify_tool` (a tool NAME, or the `command` text for a shell exec) and share the `saw_edit` ordering with the staircase path, so a transcript carrying both units accumulates one coherent tally rather than two. `usage.turns` is the turns the run ACTUALLY took — the number the staircase inflated — which is what makes the two units comparable. Note the residency correction recorded on the tranche: the plan's Build line names `Body/S/S5/epii-autoresearch-core`, which has no such file; `aeon_eval` lives HERE.
- `tests/redis_runtime_contract.rs` — contract tests asserting the runtime owner, namespaces, and RedisVL bridge residency.
- `tests/aeon_eval_ledger.rs` — real JSONL fixture tests for Aeon metric computation, Redis eval key shape, and Graphiti episode payloads. 50.T50.14 adds both halves of the code-mode claim: `a_code_mode_run_is_invisible_without_its_trace` PINS the defect (six real operations, zero observed, no ratio denominator) so it cannot silently return, and `the_orchestration_trace_restores_the_behavioural_metrics` proves the cure. Plus `replaying_the_same_score_reproduces_the_metrics` (the tranche's own acceptance) and `a_mixed_transcript_accumulates_one_coherent_ordering`.
- `scripts/redisvl_cache_service/` — Python `redisvl_cache_service.py` + `setup.sh` (the RedisVL bridge referenced by the constants).
- Does NOT own coordinate semantics for other layers: S2 graph semantics route through their own namespace ([[S2-SPEC]]); temporal/gateway authority lives with sibling `gateway/` and `gateway-contract/` ([[S3-SPEC]]). The S-coordinate is the conceptual law; this crate is the Redis-substrate convenience residency.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` (`//!`), the `Cargo.toml` `description` above, and the residency invariants encoded as constants in `src/lib.rs` and asserted in `tests/redis_runtime_contract.rs`.
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- No CONTRACT.md / README.md exists here — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Aeon eval work reads the existing transcript-of-record only; do not create a second transcript format in this crate.

## Verification
- `cargo test --manifest-path Body/S/S3/redis-context/Cargo.toml` for the full crate; `cargo test --manifest-path Body/S/S3/redis-context/Cargo.toml --test being_pattern_keys` for CCT-21 only; `cargo test -p epi-s3-redis-context` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
