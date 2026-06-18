# AGENTS.md — gateway

## Purpose
`epi-s3-gateway` crate: "S3 gateway runtime primitives for sessions, transcripts, workspace scope, and product gateway parity".
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `src/lib.rs` — crate root; declares modules + re-exports `SessionStore`, `GatewayRuntimeState`, transcript + subagent helpers.
- `src/dispatch.rs` — RPC method dispatch (largest module, ~19k).
- `src/session_store.rs` / `src/sessions.rs` — session authority + lifecycle.
- `src/runtime.rs` — `GatewayRuntimeState` + event subscriptions.
- `src/spacetime.rs` — SpaceTimeDB subscription / reducer client + fallback (~78k), plus CCT-21 BeingPattern replay and handle-forward payload helpers.
- `src/temporal_context.rs` — temporal/kairos context plumbing.
- `src/transcripts.rs`, `src/chat.rs` — transcript append/read + chat surface.
- `src/protocol.rs`, `src/verifier.rs`, `src/bootstrap.rs`, `src/subagents.rs`, `src/workspace.rs` — protocol, verifier, bootstrap, subagent launch, workspace scope.
- `tests/` — contract + smoke tests (`dispatch_contract`, `session_store_contract`, `oracle_spread_contract`, `live_gateway_smoke`, `elo_runtime_contract`, etc.).
- Does NOT own the protocol/method contract (delegated to sibling `gateway-contract` = [[S3-SPEC]]), Redis residency (`redis-context`), nor world-return canon ([[S5-SPEC]]). Domain law lives in its owning coordinate, not duplicated here.

## Local Contracts
- Code Coordinate Header: `Cargo.toml` `description` (no `src/lib.rs //!` header present).
- Binding interface deps: `epi-s3-gateway-contract`, `epi-s3-redis-context`, `portal-core`.
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- No CONTRACT.md at this level — see parent [[S-SYSTEM-INDEX]] + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test being_pattern_live_state` for CCT-21; `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml mercurius_elo_round_trip` / `moirai_refuses_uncalibrated_update` for the Aletheia Elo shim; `cargo test -p epi-s3-gateway` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
