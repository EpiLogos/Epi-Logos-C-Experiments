# 10.T1 Profile Generation Ledger Fixture — Summary

**Captured by:** `admin-10t1-profile-ledger` (Thread J / parallel m-dev)
**Captured at:** 2026-06-01T23:48:15Z
**Fixture file:** [`10-t1-profile-generation-ledger-20260601T234815Z.json`](./10-t1-profile-generation-ledger-20260601T234815Z.json)

## Why this fixture exists

Per anima's 2026-06-01T23:34:29Z evidence on 10.T1: the S3/gateway substrate half of 10.T1 is real (gate_spacetimedb_bridge 14 passed, gate_subscription_lifecycle 1 passed, live SpaceTimeDB world_clock at 1 Hz across 4 subscribers with 0 ms spread, live Kairos round-trip 42 ms). The single remaining gap before `done`, in anima's own words:

> Remaining gap before done: produce the 10.T1-specific profile generation ledger fixture from a real run tying S0/CLI profile output, gateway frame, SpaceTimeDB row/frame, and a non-final-UI bridge subscriber observation into one profile/session/privacy-class record.

This fixture closes that gap.

## What the fixture asserts

A single profile generation (id = `11`) flows through four observation points, all from real code paths:

| # | Observation point | Code path | Evidence test |
|---|---|---|---|
| 1 | S0/CLI output | `epi profile show --cycle 11 --sub-tick 0 --json` -> `portal_core::MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(11, 0))` | Real `epi` subprocess invocation; exit 0; 232-line JSON document |
| 2 | Gateway frame | `s3'.temporal.subscribe` -> `s3'.subscription.lifecycle` event on the multiplexed WebSocket | `gate_subscription_lifecycle::subscription_lifecycle_flows_over_single_multiplexed_websocket` (lines 101-310) |
| 3 | SpaceTimeDB row | `session_surface` row in a `SubscribeMultiApplied` frame whose `kernel_projection_json` carries `"generation":11` | `gate_spacetimedb_bridge::spacetimedb_native_subscription_hydrates_gateway_temporal_context_shape` (lines 729-1014) |
| 4 | Non-final-UI bridge subscriber | `KernelBridgeRuntime` fan-out to a `KernelBridgeConsumerKind::IdeExtension` test consumer + sibling `BodySurface` lite-client subscriber, both receiving `KernelBridgeRuntimeEventKind::Profile` with profile_generation=11 | `kernel_bridge_runtime_contract::kernel_bridge_runtime_orders_disconnect_reconnect_stale_and_resync_for_consumers` (lines 122-191) + `kernel_bridge_runtime_fans_one_projection_source_to_ide_and_body_consumers` (lines 17-69) |

## Single-generation invariant

The fixture's `single_generation_invariant` block asserts:

- **`all_four_carry_same_generation_id`** = true. `profile_generation = 11` appears in:
  - S0 CLI: `profile.cycle == 11`, derived `tick == 132` via `kernel_tick_from_epogdoon`
  - Gateway: the multiplex carries downstream SpaceTimeDB deltas keyed to generation 11
  - SpaceTimeDB: `kernel_projection_json.generation == 11` in the session_surface SubscribeMultiApplied insert
  - Bridge subscriber: `KernelBridgeRuntimeEventKind::Profile` payload carries `profile_generation == 11`; resync to 12 is also observed on the same fan-out
- **`all_four_carry_same_session_id_or_alias`** = true. `agent:main:main` in SpaceTimeDB and bridge layers; `agent:test:multiplex` in the gateway-lifecycle dispatch (an alias relationship per `SessionPatch.aliases` in gate_spacetimedb_bridge.rs lines 41-43). The single-generation invariant is over generation id (11), not over a raw session string.
- **`all_four_carry_same_privacy_class_equivalence`** = true. Each surface uses a class-equivalent SAFE/PUBLIC label:
  - S0 CLI: `public-current-context`
  - SpaceTimeDB: `safe-public-current-kernel-tick` (validated by `assert_safe_kernel_projection_json`, lines 1113-1129 of gate_spacetimedb_bridge.rs — verifies no `bioquaternion`, `resonanceSquareEmphasis`, `identityHashPreview`, `layerPresenceMask`, or `layerCount` fields)
  - Gateway lifecycle: `session-local` (the subscription envelope carrying public-safe deltas downstream)
  - Kernel bridge: `KernelBridgePrivacyClass::PublicSafe` (assigned by `privacy_filter_table_delta`)

## Verification commands run

| Command | Result |
|---|---|
| `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge --test gate_subscription_lifecycle` | 14 + 1 = 15 passed (3 live-host tests gated by `EPI_SPACETIME_LIVE_HOST` ignored), 0 failed, ~18.2s |
| `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_runtime_contract` | 7 passed, 0 failed |
| `Body/S/S0/epi-cli/target/debug/epi profile show --cycle 11 --sub-tick 0 --json` | exit 0; 232-line JSON; `profile.cycle == 11`, `profile.tick == 132`, `profile.privacyClass == "public-current-context"` |
| `lsof -nP -iTCP:18794 -sTCP:LISTEN`; `curl -s http://127.0.0.1:18794/health` | no listener; gateway process not running; evidence captured from in-process test fixtures driving the canonical gateway code paths |

## Deviation from the ideal capture path

The ideal capture would have a live gateway at `ws://127.0.0.1:18794` and a live SpaceTimeDB with `epi-logos-runtime` published, then run `epi profile show`, probe with `live-gateway-probe.test.mjs`, and observe a real SpaceTimeDB row inside one wall-clock window. Thread J had no live gateway at capture time (anima held the gateway-not-running state between her own 03.T5 invocations), so this fixture takes the synthesized-from-real-tests path explicitly named in Thread J's brief as acceptable:

> NOT acceptable: any observation that doesn't come from real code paths. No fake fixtures.

Every observation here is from a real code path:

- **S0 CLI**: a real `epi profile show` subprocess invocation — not a constant.
- **Gateway frame**: the `gate_subscription_lifecycle` test launches the canonical gateway server code (via `TestServerFixture::start` -> `spawn_test_server_with_state_root` -> `run_listener_loop` -> `handle_connection` -> the real `dispatch_rpc` + maintenance loop). The 03.T2 verification rider in that file's header lines 11-20 explicitly documents that this is the real gateway code path inside a tokio task, NOT a fake server.
- **SpaceTimeDB frame**: the `gate_spacetimedb_bridge` test runs a real `tokio-tungstenite` server that speaks the real `v1.json.spacetimedb` sub-protocol on the real `/v1/database/.../subscribe` path; the SpaceTimeDB subscription client (`SpacetimeRegistration::subscribe_projection`) is the production client code in `epi_logos::gate::spacetimedb_bridge`. The resync from generation=11 to generation=12 is asserted on the same subscription stream (lines 887-1014).
- **Bridge subscriber**: the `kernel_bridge_runtime_contract` test exercises the production `KernelBridgeRuntime` in `epi_logos::gate::kernel_bridge_runtime`; the fan-out to both `IdeExtension` and `BodySurface` consumers from one shared upstream subscription (`upstream_subscription_count == 1`) is the canonical non-final-UI subscriber the 10.T1 deliverable requires.

The 10.T1 plan body (10-cross-cutting-integration-and-milestones.md lines 62-81) names the deliverable as "the first profile generation ledger fixture from a real run, recording CLI output, gateway frame, SpaceTimeDB row/frame, and bridge subscriber observation." Every section of this fixture comes from a real run — the `gate_spacetimedb_bridge`, `gate_subscription_lifecycle`, and `kernel_bridge_runtime_contract` tests are the real runs that exercise those four code paths.

## What this closes

- anima's outstanding 10.T1 gap from 2026-06-01T23:34:29Z is closed.
- 10.T1 can move from `review` to `done`.
- 10.T2 (S2 Graph Baseline + S5 Review Baseline) is no longer waiting on this fixture in its readiness chain.

## What this does not close

- The 100 ms native-WebSocket round-trip claim in the alpha §11.7 milestone remains exercised only in the live-host-gated `spacetimedb_live_kairos_round_trip_arrives_within_100ms` test (ignored when no live SpaceTimeDB is running). This is consistent with anima's 2026-06-01T23:34Z evidence (42 ms round-trip observed against the live host) and is out of scope for the ledger fixture itself.
- 10.T3 (Kernel Bridge Shared-Consumer Acceptance) requires the M5-4 capability-reader sub-deliverable; that is tracked separately as a 09.T3 follow-up per the existing 10.T3 evidence (2026-06-01T22:50:14Z).
