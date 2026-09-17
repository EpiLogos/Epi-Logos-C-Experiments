# AGENTS.md — epi-kernel-contract

## Purpose
"Parent-role kernel-aligned contract layer for Epi-Logos: KernelTickEnvelope, TrajectoryDeposit, AnuttaraDiagnostic, PhysicalPoleState, MentalPoleState" (Cargo.toml `description`). This crate is the **parent crate and parent-role envelope of the S-stack** at `Body/S/`; it is not an S0 member (per DR-S0-1).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]]

## Ownership
- `src/lib.rs` — crate root / public surface; re-exports `portal-core` primitives, declares the 7 contract modules
- `src/envelope.rs` — `KernelTickEnvelope` (braids tick/energy/resonance/poles), `ENVELOPE_COORDINATE_OWNER`, `ENVELOPE_PRIVACY_CLASS`
- `src/deposit.rs` — `TrajectoryDeposit` / `TrajectoryDepositRef` / `TrajectoryElement` (graphiti episodic shape at `#4.4.4.4-{anchor}`)
- `src/diagnostic.rs` — `AnuttaraDiagnostic`, `AnuttaraExpression`, `AnuttaraParseError`
- `src/poles.rs` — `PhysicalPoleState` (1-2-3 engine), `MentalPoleState` (4-5-0 intelligence), activation/clock/weights types
- `src/analysis.rs`, `src/constraint.rs`, `src/ingestion.rs` — resonance analysis, verifier/constraint registry, ingestion session shapes
- `src/method_handler.rs` — the S-root method-handler port (Track 53 T53.01): `MethodHandler<C>`, `MethodRegistry<C>`, `MethodRequest`/`MethodOutcome`/`MethodError` (the frozen wire error vocabulary), `FollowUp`, `DuplicateMethod`
- `src/redis_residency.rs` — **Track 53 T53.06**: the S2↔S3 Redis substrate declaration, resident here because it is a statement *about* the boundary and neither side owns it. `RedisRuntimeRole`, `CacheTier`, `RedisConfig`, the `s2:graph:semantic` / `s3:gateway:temporal` namespace constants, and the RedisVL bridge script path (`REDISVL_*` + `redisvl_service_script`/`redisvl_setup_script`). It holds **no client**: connecting, `PING`, `SETEX` are runtime and this crate stays runtime-free (`tokio` is a dev-dependency only). `epi-s3-redis-context` keeps `RedisCache` and `RedisKey` and re-exports all of the above, so no S3 import path changed.
- `src/graphiti_residency.rs` — **Track 53 T53.06**: the Graphiti adapter authority declaration (`GRAPHITI_RUNTIME_AUTHORITY`, `GRAPHITI_INVOCATION_OWNER`, `GraphitiAdapterMode`, `GraphitiAdapterContract`). "S3 runs the runtime, S5 owns invocation" is a sentence about three layers, and [[S2-SPEC]]'s promotion planner has to quote it; `epi-s3-gateway-contract` re-exports it unchanged.
- `Cargo.toml`, `Cargo.lock` — crate manifest; depends on `portal-core` (S0). It must acquire no runtime dependency: `tokio` is deliberately dev-only, and `redis`/`neo4rs`/`reqwest` belong to the layers that run them.
- Does NOT own algorithms: math lives in `portal-core`; kernel evaluation/deposit/verification live in the per-S subsystem crates (lib.rs doc-header). This crate holds **shapes plus invariant constructors** only.

## Local Contracts
- Coordinate Header: `src/lib.rs` `//!` doc-comment (the binding description of every exported shape)
- Owning spec: [[S-SYSTEM-INDEX]] (S-stack root); [[S0-SPEC]] / [[S0-ARCHITECTURE]] for the `portal-core` primitives it re-exports
- No local `CONTRACT.md` (none yet — see Canon)

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any exported symbol — this is the cross-stack contract surface; many S-layer crates consume these types.
- [[wikilink]] all entity/coordinate/spec refs in any artifact you author.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
`cargo test -p epi-kernel-contract`

## Child DOX Index
- (leaf)
