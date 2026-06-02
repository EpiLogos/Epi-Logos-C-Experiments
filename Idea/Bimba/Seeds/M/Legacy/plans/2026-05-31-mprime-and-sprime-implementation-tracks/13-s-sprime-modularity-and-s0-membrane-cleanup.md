# Track 13 - S/S' Modularity And S0 Membrane Cleanup

This track is the post-alpha cleanup phase for the live S/S' substrate after the first M'/S' implementation wave. Its purpose is to preserve S0/S0' as the operator-facing command membrane and pass-through adapter, while moving service law, runtime ownership, and persistence authority back into the appropriate S1/S2/S3/S4/S5 Body-native crates or plugin packages.

## Goal

Turn the current productive-but-transitional S0-centered implementation into a clearer modular stack:

- Keep `Body/S/S0/epi-cli` as the master CLI, local startup surface, profile/kernel entrypoint, and gateway adapter.
- Prevent S0 from becoming a second implementation of S1 vault law, S2 graph law, S3 gateway/session/SpaceTimeDB law, S4 orchestration law, or S5 review/autoresearch law.
- Convert every current `Mirror` or `Compatibility` parity record into one of three explicit states: intentional S0 adapter, Body-native service, or scheduled extraction.
- Add tests that fail when new downstream service logic lands in S0 without an explicit adapter boundary and Body-native authority.
- Preserve all live behavior while making ownership, verification, and future task routing unambiguous.

## Source Specs

- [[S0-S0i-CLI-CORE]] - `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-S0i-CLI-CORE.md`, especially S0/S0' as executable kernel/CLI/lib ground.
- [[S2-S2i-GRAPH]] - `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`, plus `Body/S/S2/graph-services/src/lib.rs` and `Body/S/S2/graph-schema/src/lib.rs` as graph-law authority.
- [[S3-S3i-GATEWAY]] - `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`, plus `Body/S/S3/gateway`, `Body/S/S3/gateway-contract`, `Body/S/S3/epi-spacetime-module`, and `Body/S/S0/epi-cli/src/gate/server.rs` as the current transitional runtime.
- [[S5-S5i-SYNC]] - `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md`, plus `Body/S/S5/epii-review-core`, `Body/S/S5/epii-autoresearch-core`, and `Body/S/S5/epii-agent-core`.
- [[11-open-architectural-decisions]] - especially IOD-01, IOD-08, IOD-09, IOD-17, IOD-18, and IOD-19.
- Current code reality: `Body/S/S0/epi-cli/src/main.rs`, `Body/S/S0/epi-cli/src/lib.rs`, `Body/S/S0/epi-cli/src/gate/parity.rs`, `Body/S/S0/epi-cli/src/gate/server.rs`, `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, `Body/S/S0/epi-cli/src/graph/mod.rs`, `Body/S/S0/epi-cli/src/gate/anima.rs`, and the Body-native service crates they wrap.

## Architectural Keystones

- **S0 Is The Membrane, Not The Service Owner:** S0 may expose commands, parse CLI parameters, launch local services, hold user-facing compatibility aliases, and route gateway frames. It must not own downstream service law once a Body-native home exists.
- **Body-Native Authority Wins:** S1 owns vault/Hen law, S2 owns graph law, S3 owns gateway/session/SpaceTimeDB law, S4 owns agent orchestration/capability law, and S5 owns review/autoresearch/governance law.
- **Adapters Are Allowed If Named:** Some S0 code can remain permanently as an adapter. The adapter must be small, must call Body-native crates or explicit external services, and must be covered by tests proving it does not fork method truth.
- **Extraction Is Behavioral-Preserving:** Cleanup must not break current M-dev lanes. Existing CLI commands and gateway methods stay stable while implementation moves behind them.
- **Real Functionality Tests Only:** Every extraction requires contract tests against the Body-native owner and adapter tests through `epi` or the gateway path. Snapshot-only or mocked ownership claims are not enough.

## Tranches

1. **T0 - S0 Membrane Inventory And Blast-Radius Map.**

   Deliverables:

   - Produce a checked-in inventory of every S0 module that touches S1/S2/S3/S4/S5 behavior: `Body/S/S0/epi-cli/src/{vault,graph,gate,agent,nara,core,techne}` plus `portal-core` profile/kernel exports where relevant.
   - Classify each module as `kernel-owner`, `cli-adapter`, `gateway-adapter`, `temporary-live-host`, `compatibility-shim`, or `duplicated-service-law`.
   - Add a machine-readable report under `Body/S/S0/epi-cli/contract-inventory/` that records owner layer, Body-native authority path, current S0 entrypoint, test evidence, and extraction disposition.
   - Run GitNexus impact/context queries for the major modified symbols before any follow-up extraction work: `dispatch_graph_method`, `dispatch_frame`, `dispatch_temporal_subscribe`, `dispatch_spacetime_subscribe`, `SpacetimeBridge`, `SpacetimeRegistration`, `mediation_route`, `ReviewStore`, `ImprovementStore`, and `EpiiAgentAccess`.

   Dependencies:

   - Track 03 Tranche T3 must not be actively editing the same `gate/server.rs` or `spacetimedb_bridge.rs` symbols unless this cleanup is resumed by the same owner.
   - Track 10 Tranche T9 alpha-gate report should be available or this tranche must mark its findings as pre-alpha provisional.

   Verification:

   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test portal_surfaces_contract`.
   - A new inventory test fails if a module marked `duplicated-service-law` lacks a follow-up extraction tranche in this track.

2. **T1 - Parity Ledger Recast: Mirror Means Adapter, Not Authority.**

   Deliverables:

   - Refactor `Body/S/S0/epi-cli/src/gate/parity.rs` terminology so `Mirror` is split into explicit statuses such as `Adapter`, `CompatibilityAdapter`, `TemporaryLiveHost`, and `Missing`.
   - For each parity record, add `authority_path`, `adapter_path`, `extraction_task`, and `allowed_s0_responsibilities`.
   - Update portal surface rendering so `/` and portal readiness reports show whether S0 is serving as adapter, compatibility shim, or temporary live host.
   - Preserve all existing method mappings from `epi_s3_gateway_contract::METHOD_NAMES`.

   Dependencies:

   - T0 inventory.

   Verification:

   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test portal_surfaces_contract`.
   - Add a test proving every non-S0 method with an S0 adapter has a Body-native `authority_path`.

3. **T2 - S3 Gateway Dispatch Extraction Plan And Contract Lock.**

   Deliverables:

   - Move method classification and route ownership checks fully into `Body/S/S3/gateway/src/dispatch.rs` and `Body/S/S3/gateway-contract/src/lib.rs`; S0 may import and invoke them but must not maintain a parallel route table.
   - Add an S3-owned executable dispatch-plan contract that maps every gateway method to one of: S3 native handler, S2 graph service adapter, S4 orchestration adapter, S5 governance adapter, S0 product adapter, or missing.
   - Add an S0 adapter test proving `Body/S/S0/epi-cli/src/gate/server.rs` dispatches only through S3-owned route metadata.
   - Document the staged extraction boundary: S0 currently hosts the process, S3 owns route law.

   Dependencies:

   - T1 parity recast.
   - Active Track 03 gateway work must be merged or this tranche must be isolated in a worktree.

   Verification:

   - `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test dispatch_contract`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_full_parity_contract`.
   - A new test fails if a method appears in S0 dispatch but is absent from S3 dispatch classification.

4. **T3 - S3 Runtime Host Extraction: Sessions, Chat, Channels, And Gateway State.**

   Deliverables:

   - Move session/chat/channel runtime ownership from `Body/S/S0/epi-cli/src/gate/server.rs` and sibling modules into `Body/S/S3/gateway` where Body-native equivalents already exist or should exist.
   - Leave S0 with CLI commands (`epi gate start`, `epi gate status`, `epi gate stop`) and process/bootstrap wiring only.
   - Preserve state-root compatibility for existing `~/.epi/gate` / `EPI_GATE_STATE_ROOT` layouts.
   - Add migration notes for any JSON state files that remain under the gate root.

   Dependencies:

   - T2 dispatch contract lock.

   Verification:

   - `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_chat`.
   - Live gateway smoke test starts `epi gate start`, sends `connect`, `sessions.resolve`, `chat.history`, and `channels.status`, and proves the handler owner is S3.

5. **T4 - S3' SpaceTimeDB Bridge Extraction And Fallback Discipline.**

   Deliverables:

   - Move SpaceTimeDB subscription plan, native WebSocket decoding, lifecycle envelope construction, fallback policy, and readiness schema out of `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` into `Body/S/S3/gateway-contract`, `Body/S/S3/gateway`, or `Body/S/S3/epi-spacetime-module` as appropriate.
   - Leave S0 with only env/config discovery and CLI/runtime startup integration.
   - Ensure `s3'.temporal.subscribe` and `s3'.spacetime.subscribe` share one S3-owned subscription registry and lifecycle event type.
   - Preserve explicit `fallback-active` behavior; no silent HTTP SQL fallback may be introduced.

   Dependencies:

   - T2 dispatch contract lock.
   - Track 03 Tranche T3 native WebSocket completion should be done or this tranche must split into decoder-contract first and live-subscription later.

   Verification:

   - `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test runtime_state_contract`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge`.
   - Live or captured-real SpaceTimeDB test proves native subscription, fallback-active, reconnect, and resync lifecycle events use the same S3-owned envelope type.

6. **T5 - S2 Graph Command Adapter Hardening.**

   Deliverables:

   - Reduce `Body/S/S0/epi-cli/src/graph/mod.rs` to CLI parsing, service invocation, and rendering; move any remaining graph-law helpers into `Body/S/S2/graph-services`.
   - Keep local S0 modules that are already pure `pub use epi_s2_graph_services::*` as compatibility exports or replace them with direct imports where safe.
   - Move durable graph ingestion/resonance/session logic that is not CLI-only into S2 or a clearly named S2 adapter module.
   - Add comments only where needed to mark intentional S0 adapter seams.

   Dependencies:

   - T0 inventory.
   - Track 02 graph-law recast should be applied or this tranche must preserve current graph behavior and only move obvious duplicated law.

   Verification:

   - `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_commands`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test semantic_cache_contract`.
   - A type-name ownership test proves graph retrieval, semantic cache, dataset import, doctor, relationship manager, and sync coordinator types resolve to `epi_s2_graph_services`.

7. **T6 - S4/S4' Orchestration Adapter Cleanup.**

   Deliverables:

   - Audit `Body/S/S0/epi-cli/src/gate/anima.rs` against `Body/S/S4/ta-onta`, `Body/S/S4/plugins/pleroma/capability-matrix.json`, and `Body/S/S4/pi-agent/agents/anima.md`.
   - Move or wrap mediation-route law so S4 remains the authority for VAK evaluation, Anima orchestration, dispatch-tool gating, and capability-matrix enforcement.
   - Leave S0 with gateway adapter functions that call S4-owned capability surfaces and persist only S3 session/gateway records where necessary.
   - Ensure local JSONL event persistence under the gate root is either S3 session telemetry or S4-owned orchestration evidence, not an ambiguous second S4 store.

   Dependencies:

   - T1 parity recast.
   - IOD-17 runtime parity follow-up should be considered when exposing `s4'.mediation.capabilities.list`.

   Verification:

   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_anima_pleroma_access`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vak_constitutional_architecture`.
   - S4 plugin tests for `dispatch_vak_required`, `dispatch_gate_block`, and `dispatch_fusion_validate` pass from the S4 package test runner.
   - A gateway test proves S0 rejects dispatch tools lacking upstream `vak-evaluate` evidence while S4 owns the rule source.

8. **T7 - S5 Adapter Boundary And Governance Store Consolidation.**

   Deliverables:

   - Confirm `Body/S/S0/epi-cli/src/gate/review.rs`, `improve.rs`, `epii.rs`, and Graphiti deposit/search routes are thin adapters over S5/S3 Body-native cores.
   - Move any S5 DTO construction or governance policy that currently lives only in S0 into `epii-agent-core`, `epii-review-core`, or `epii-autoresearch-core`.
   - Clarify the boundary for Gnosis/kbase access: S0 may expose `epi techne` / compatibility commands, but S5 owns governance and S2 owns storage substrate.
   - Add review/autoresearch store-location tests so the gate root layout remains stable while ownership is explicit.

   Dependencies:

   - T1 parity recast.
   - Track 04 S5 spine acceptance must be done or partial gaps must remain review-marked.

   Verification:

   - `cargo test --manifest-path Body/S/S5/epii-review-core/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S5/epii-agent-core/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_review`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_improve`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_agent_access`.

9. **T8 - S1 Vault/Hen Boundary And Write-Gate Audit.**

   Deliverables:

   - Audit `Body/S/S0/epi-cli/src/vault`, `Body/S/S1/hen-compiler-core`, Theia vault-bridge decisions, and `s1'.vault.*` / `s1'.semantic.*` gateway method plans.
   - Ensure ordinary reads can remain filesystem/Theia-provider reads, while writes, renames, moves, frontmatter updates, and semantic-neighbour writes route through Hen or an explicitly governed S1' gateway adapter.
   - Add tests proving S0 vault helpers do not bypass Hen wikilink integrity for governed writes once `s1'.vault.*` lands.
   - Record any remaining direct-write compatibility commands as local-only or deprecated with a replacement path.

   Dependencies:

   - IOD-18 and IOD-19 are binding inputs.
   - Track 03 Tranche T6.5 or its replacement S1 gateway method work should exist before final enforcement.

   Verification:

   - `cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_frontmatter`.
   - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_paths_templates`.
   - A fixture-vault test renames a file with inbound wikilinks through the governed path and proves no orphaned wikilink remains.

10. **T9 - Cross-Layer Enforcement Tests And CI Guardrails.**

    Deliverables:

    - Add a test suite that scans S0 for new downstream service-law modules and requires an explicit adapter annotation plus Body-native authority path.
    - Add a route-ownership test that compares `epi_s3_gateway_contract::METHOD_NAMES`, `Body/S/S3/gateway/src/dispatch.rs`, and S0 executable dispatch coverage.
    - Add graph ownership tests that fail if S2-owned types resolve to `epi_logos::graph::*` implementations instead of `epi_s2_graph_services::*`.
    - Add S4/S5 ownership tests that fail if S0 introduces new governance policy or review/autoresearch schemas outside Body-native cores.

    Dependencies:

    - T1 through T8.

    Verification:

    - `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test s0_membrane_guardrails`.
    - `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test dispatch_contract`.
    - `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graph_runtime_extraction_contract`.
    - The guardrail suite fails against an intentionally added fake S0 downstream-law module in a local negative fixture.

11. **T10 - Cleanup Release Gate, Runbook, And Ledger Recast.**

    Deliverables:

    - Produce a final S/S' modularity report showing each method family, current S0 responsibility, Body-native authority, remaining compatibility shims, and removal timetable.
    - Update Track 10 alpha/replan output so future work routes to Body-native owners first and S0 only when adapter/process work is required.
    - Update `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` with any decisions resolved by the cleanup.
    - Mark remaining extraction work as concrete follow-up tranches rather than broad "cleanup" notes.

    Dependencies:

    - T9 guardrails.

    Verification:

    - `node .codex/scripts/m-dev-plan-assess.mjs --write --json` shows all Track 13 tasks indexed with correct dependencies and write scopes.
    - `gitnexus detect_changes` or the local GitNexus equivalent confirms only expected S0/S1/S2/S3/S4/S5 ownership and plan files changed.
    - Full release-gate command set from T9 plus the active Track 10 alpha-gate verification passes or records explicit review blockers.

## Dependencies

- **Critical path:** T0 inventory -> T1 parity recast -> T2 S3 dispatch contract -> T3/T4 S3 runtime extraction -> T9 guardrails -> T10 cleanup release gate.
- **Parallel path:** T5 S2 adapter hardening, T6 S4 orchestration cleanup, T7 S5 adapter consolidation, and T8 S1/Hen write-gate audit can proceed after T1 if they do not touch the same files.
- **Live-development caution:** Track 03 native SpaceTimeDB work is active in the current ledger. Do not edit `Body/S/S0/epi-cli/src/gate/server.rs`, `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, or `Body/S/S3/**` without first confirming the active owner/lease or isolating in a worktree.
- **Substrate-truth rule:** Every tranche must read the Body-native substrate before implementation and must treat already-landed functionality as inherited, not as work to rebuild.

## Open Decisions

- Whether the final gateway process binary remains `epi gate start` from S0 while all route/runtime law lives in S3, or whether a Body-native S3 binary becomes the long-term runtime and S0 shells out to it.
- Whether S4 mediation state should persist under the S3 gate root as session telemetry, under S4 plugin state as orchestration evidence, or under S5 as review/autoresearch evidence once human-review gates are involved.
- Whether S2 graph CLI commands remain under `epi graph` permanently as an S0 operator UX, or whether a future `s2 graph` service CLI is introduced and S0 becomes a wrapper.

## Success Criteria

- S0 remains the one operator-facing CLI and pass-through membrane.
- S1/S2/S3/S4/S5 Body-native crates or plugin packages own their own service law.
- The gateway method table has exactly one authority for route ownership.
- The plan ledger no longer uses ambiguous `Mirror` status without saying whether it means adapter, compatibility, or temporary host.
- Future agents can choose the correct work scope from the ledger without mistaking S0 adapter code for service ownership.
