# AGENTS.md — gateway

## Purpose
`epi-s3-gateway` crate: "S3 gateway runtime primitives for sessions, transcripts, workspace scope, and product gateway parity".
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `src/lib.rs` — crate root; declares modules + re-exports `SessionStore`, `GatewayRuntimeState`, transcript + subagent helpers.
- `src/dispatch.rs` — RPC method dispatch (largest module), including [[M4]]/[[S4]] Nara extension routes. `nara.session_open` mints the canonical protected session-protein handle; `nara.session_close` accepts only a handle whose embedded session exactly matches the requested session. The S0 host composes this S3 route with active-[[PASU]] protected-local aggregate persistence and exposes registered `nara.session_close.read` plus `nara.session_close.contemplation.read`; the latter returns only the strict opaque-reference aggregate projection, never the raw [[ContemplationObject]]. `nara.contemplate_session_close` accepts the caller's complete [[ContemplationObject]] evidence and returns the S3-owned 4'-5'-0' contemplation envelope (wisdom delta, triplet readings, and Anuttara round trips) through the S0 gateway adapter; it never fabricates a contemplation object. Also owns the 05.T5.10 connectivity-vs-bounded-access discriminator (`nara_bounded_access` + `ConnectivityReport`/`BoundedAccessGrant`): a connectivity_check ping of Graphiti/Neo4j/Redis/SpaceTimeDB is never a grant of bounded access to the personal `nara.*` domains (jiva/jagrat/flow); pinned by `tests/dispatch_contract.rs::t5_10_connectivity_vs_bounded_access` against live pings.
- `src/dispatch.rs` also declares `NARA_TRANSFORM_RPC_METHODS` for Track 25.T25.11's additive `nara.transform.start` / `nara.transform.advance` [[M4']] extension family; `tests/dispatch_contract.rs` pins both routes to the existing `S4S5DomainAdapter` classification. Runtime behavior remains in the S0 Nara adapter. Contract-surface flag: [[S3-SPEC]], [[S0-SPEC]], and [[M4'-SPEC]].
- `src/session_store.rs` / `src/sessions.rs` — session authority + lifecycle.
- `src/runtime.rs` — `GatewayRuntimeState` + event subscriptions, including the bounded latest-16-generation verifier-question cache used to prove `respond_question` targets a question the live profile bus actually emitted, and 36.T36.8's process-current typed [[VAK]] correlate. A successful `sessions.patch` installs the real `VakAddress` plus the [[S2]] retriever's observed empty-bias state; absence means no VAK evaluation has crossed this gateway process. The [[S0]] heartbeat samples this state without moving VAK law into [[S3]]. Canon update flag: [[S3-SPEC]], [[S0-SPEC]], and [[M0'-SPEC]].
- `src/m4_arena.rs` — [[M4]] arena warm [[Vama Shakti]] runtime wrapper over `portal-core` state.
- `src/spacetime/` — SpaceTimeDB subscription / reducer client + fallback façade split across `mod`, `fallback`, `resync`, `registration`, `presence`, `retry`, `projection`, `identity`, and `lifecycle`, plus CCT-21 BeingPattern replay and handle-forward payload helpers. `presence` also carries the 05.T5.17 [[M4]] Nara `OracleSpreadPosition` per-position aliveness table (generating→muting→mute + reopen-on-aspect-proximity state machine, `TargetAspect`/`CardKind`/`LiveState`/`KleinFace`) and its substrate reducer methods `record_oracle_spread`/`update_position_state` — host-side `pub fn` publishing `nara.oracle_spread`/`nara.oracle_position_state` temporal events (NOT `nara.*` RPC dispatch methods; they ride `publish_temporal_event` exactly as `record_oracle_draw` does), foundation for Janus live-vs-mute (12.18) + the daily briefing (05.18).
- `src/temporal_context.rs` — temporal/kairos context plumbing.
- `src/transcripts.rs`, `src/chat.rs` — transcript append/read + chat surface, including harness-neutral `HarnessTurnEvent` records for [[S3]] session transcript-of-record writes.
- `src/protocol.rs`, `src/verifier.rs`, `src/bootstrap.rs`, `src/subagents.rs`, `src/workspace.rs` — protocol, verifier, bootstrap, subagent launch, workspace scope. The verifier runtime mirrors the [[anuttara-symbolic-parse]] grammar for `s0'.verifier.respond_question`, including the compiled verifier's live `S`/`R`/`A` domain tags, bounds `A-Tn` to `0..11`, and maps parser entry states onto the [[M0']] console state vocabulary without claiming a re-verification.
- `tests/` — contract + smoke tests (`dispatch_contract`, `session_store_contract`, `oracle_spread_contract`, `s3_runtime_inproc_contract` (in-process S3 runtime; the live-server counterpart is S0 `gate_runtime_handler_owner`), `elo_runtime_contract`, `contemplation_rpc_dispatches`, etc.).
- `tests/dispatch_contract.rs` — includes parity proof that every S2 gateway-exposed method, including `s2.graph.list`, routes to graph services.
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
- `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml nara_session` for the Nara canonical protected-handle session routes; pair it with `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_nara_session_close_live` for real persisted/read-back [[M1']] close aggregates. `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test contemplation_rpc_dispatches` covers the pure 4'-5'-0' composition contract, paired with `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_contemplation_live` for the real WebSocket adapter; `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test being_pattern_live_state` for CCT-21; `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml mercurius_elo_round_trip` / `moirai_refuses_uncalibrated_update` for the Aletheia Elo shim; `cargo test -p epi-s3-gateway` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
