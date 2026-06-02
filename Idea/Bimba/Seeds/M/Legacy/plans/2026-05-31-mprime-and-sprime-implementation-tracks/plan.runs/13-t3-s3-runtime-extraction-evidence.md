# 13.T3 — S3 Runtime Host Extraction: Sessions, Chat, Channels, and Gateway State

**Closed:** 2026-06-02
**Thread:** U (admin-13t3-s3-runtime-extraction)
**Plan section:** `13-s-sprime-modularity-and-s0-membrane-cleanup.md` lines 93–111
**Depends on:** 13.T1 (parity recast, Thread O), 13.T2 (S3 dispatch contract, Thread T)
**Status:** done

---

## Deliverable Summary

Per the 13.T3 spec:

> Move session/chat/channel runtime ownership from `Body/S/S0/epi-cli/src/gate/server.rs` and sibling modules into `Body/S/S3/gateway` where Body-native equivalents already exist or should exist. Leave S0 with CLI commands (`epi gate start/status/stop`) and process/bootstrap wiring only. Preserve state-root compatibility for existing `~/.epi/gate` / `EPI_GATE_STATE_ROOT` layouts. Add migration notes for any JSON state files that remain under the gate root.

This was discharged as follows:

- **Sessions runtime (envelope law):** moved S0 → S3.
- **Chat runtime (transcript law):** moved S0 → S3.
- **Channels runtime:** kept in S0 as `CompatibilityAdapter` with explicit justification (see "Handlers kept in S0" below).
- **State-root layout:** preserved unchanged.
- **Live-gateway smoke test:** added, passing — proves handler owner is S3 through the live WebSocket dispatch.

---

## Handlers Moved S0 → S3

The runtime law for the following functions moved from
`Body/S/S0/epi-cli/src/gate/{sessions,chat}.rs` into
`Body/S/S3/gateway/src/{sessions,chat}.rs`. The S0 wrappers became thin
re-exports (`pub use epi_s3_gateway::sessions::*;` and
`pub use epi_s3_gateway::chat::*;`).

### Sessions (3 envelope constructors)

| Function | New home | S0 caller(s) untouched |
| --- | --- | --- |
| `sessions::record_to_value` | `Body/S/S3/gateway/src/sessions.rs` | server.rs lines 404, 631, 705, 772, 783, 843, 2545 |
| `sessions::session_row` | `Body/S/S3/gateway/src/sessions.rs` | server.rs lines 630, 702, 773, 784, 844, 2518 |
| `sessions::list_result` | `Body/S/S3/gateway/src/sessions.rs` | server.rs line 406 |

Added: `sessions::HANDLER_OWNER = "S3.gateway.sessions"` — emitted as
`handlerOwner` on the `sessions.list` envelope. Used as load-bearing evidence
in the live-gateway smoke test that ownership lives in S3.

### Chat (10 surfaces — entry type + 9 functions)

| Function | New home | S0 caller(s) untouched |
| --- | --- | --- |
| `chat::ChatEntry` | `Body/S/S3/gateway/src/chat.rs` | server.rs `chat.history` arm |
| `chat::transcript_path` | `Body/S/S3/gateway/src/chat.rs` | server.rs lines 656, 669 |
| `chat::send_message` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 1771 (chat.send) |
| `chat::inject_message` | `Body/S/S3/gateway/src/chat.rs` | server.rs lines 882, 1877, 2183 (chat.inject + autonomous reply paths) |
| `chat::abort_run` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 2251 (chat.abort) |
| `chat::history` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 671 (sessions.compact) |
| `chat::history_response` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 916 (chat.history) |
| `chat::preview` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 420 (sessions.preview) |
| `chat::reset` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 637 (sessions.reset) |
| `chat::compact` | `Body/S/S3/gateway/src/chat.rs` | server.rs line 668 (sessions.compact) |

Added: `chat::HANDLER_OWNER = "S3.gateway.chat"` — emitted as `handlerOwner`
on the `chat.history` envelope.

**Total moved S0 → S3: 13 surfaces (3 session + 10 chat).**

---

## Handlers Kept in S0 (with `CompatibilityAdapter` Parity Record)

### `channels` (390 LOC, 6 public functions)

`Body/S/S0/epi-cli/src/gate/channels.rs` stays in S0 with classification
`CompatibilityAdapter`, matching the existing
`contract-inventory/s0-membrane-inventory.json` record for `gate.channels`
(line 211: `parity_status: "CompatibilityAdapter"`).

**Reason for keeping in S0:** `channels.rs` has a deep dependency surface on
S0-private modules that carry *S0 process-level concerns* (subprocess
invocation, environment provider resolution, on-disk app-config schema), all
of which violate the S3 substrate boundary:

| S0 dependency | LOC | Reason it can't move with channels |
| --- | --- | --- |
| `gate::config` | 587 | Owns the on-disk gateway config schema, JSON-Patch apply law, hash-stamp validation. The plan classifies this independently (covered by Track 13.T6/T9). |
| `gate::secrets` | 119 | Calls `op` (1Password CLI) / `varlock` subprocesses to resolve secret refs. That's an S0 binary I/O concern. |
| `gate::channel_adapters` | 164 | Builds outbound HTTP request structures specific to product-side messaging APIs (telegram/whatsapp/slack/discord/google-drive). |
| `gate::skills` | 209 | Reads the local skills invocation surface from the S0 binary layout. |

Dragging all four into S3 (>1000 LOC of S0-process logic) would invert the
substrate hierarchy. The compatibility-adapter escape hatch is exactly what
the 13.T3 spec explicitly anticipates:

> If a handler turns out to have an S0-only concern that can't move (e.g. requires fs access mode that's CLI-only), keep it in S0 with an explicit `kind = "CompatibilityAdapter"` parity record and document in evidence.

The `s0-membrane-inventory.json` record for `gate.channels` already carries
this classification; the live-gateway smoke test asserts the route still
dispatches end-to-end through S0 without applying the `handlerOwner` sentinel.

**Channels-runtime removal trigger:** Track 04/05 M5 chat lands (cross-ref:
inventory line 217's `extraction_task: "13.T3 (channels law audit + extract)"`
should be re-evaluated when M5 chat brings a clean abstraction over secret
providers).

**Total kept in S0: 1 surface (channels, with explicit `CompatibilityAdapter`
parity record).**

---

## State-Root Compatibility — Preserved (Yes)

The S3 runtime operates on the same `~/.epi/gate` layout the alpha S0 server
produced. No JSON field shapes changed since the alpha. The live-gateway
smoke test asserts both halves of the layout contract:

- **`~/.epi/gate/sessions/<slug>.json`** — `SessionRecord` written by
  `Body/S/S3/gateway/src/session_store.rs::SessionStore::save`. Identical
  serde shape and slug law (`a-zA-Z0-9` preserved, all else mapped to `_`).
- **`~/.epi/gate/transcripts/<slug>.jsonl`** — `TranscriptEntry` written by
  `Body/S/S3/gateway/src/transcripts.rs::append_message` / `append_abort`.
  Identical `kind/role/message/timestamp_ms/run_id` shape.
- **`~/.epi/gate/channels.json`** — unchanged; still written by the
  S0-resident `gate::channels` CompatibilityAdapter.

Sample path layouts asserted by
`Body/S/S3/gateway/tests/live_gateway_smoke.rs`:

```text
<gate_root>/sessions/agent_main_main.json
<gate_root>/transcripts/agent_main_main.jsonl
```

### Migration notes for JSON state files

| File | Owner pre-13.T3 | Owner post-13.T3 | Wire-format delta |
| --- | --- | --- | --- |
| `sessions/<slug>.json` | S0 (`gate::sessions`) | S3 (`epi_s3_gateway::session_store`) | None — `SessionRecord` serde shape unchanged. |
| `transcripts/<slug>.jsonl` | S0 (`gate::transcripts`, already a re-export shim from alpha) | S3 (`epi_s3_gateway::transcripts`) | None. |
| `channels.json` | S0 (`gate::channels`) | S0 (unchanged) | None. |

**`sessions.list` envelope:** added one new field, `handlerOwner:
"S3.gateway.sessions"`. Legacy clients tolerate extra JSON keys (JSON-RPC
additionalProperties); no migration is needed for read-only consumers.
Likewise for `chat.history` (added `handlerOwner: "S3.gateway.chat"`).

`EPI_GATE_STATE_ROOT` env-var override path (used by tests via
`TestEnv::with_fake_pi`) preserved unchanged — the S3 `SessionStore::new`
accepts any `impl AsRef<Path>` for `gate_root` and never assumes
`~/.epi/gate`.

---

## Live-Gateway Smoke Test

Two complementary smoke tests, per the plan's requirement that the live
gateway proves S3 owns the runtime:

### S3-side (Body/S/S3/gateway/tests/live_gateway_smoke.rs)

Four tests:

- `handler_owner_field_propagates_through_s3_session_envelopes` — drives
  `sessions::list_result` directly, asserts
  `handlerOwner == "S3.gateway.sessions"`.
- `handler_owner_field_propagates_through_s3_chat_envelopes` — drives
  `chat::send_message → inject_message → abort_run → history_response`,
  asserts `handlerOwner == "S3.gateway.chat"`.
- `s3_runtime_preserves_alpha_state_root_layout` — pins the
  `<gate_root>/sessions/<slug>.json` and
  `<gate_root>/transcripts/<slug>.jsonl` layout.
- `s3_chat_history_reads_alpha_transcript_files_unchanged` — writes a
  pre-13.T3-format transcript line by hand, asserts the S3 runtime reads it.

### S0-side (Body/S/S0/epi-cli/tests/gate_runtime_handler_owner.rs)

One test running the actual WebSocket dispatch through the
`TestGatewayClient` harness (same harness used by `gate_chat.rs`):

- `handler_owner_sentinel_propagates_through_live_gateway` — starts
  `epi gate start` (in-process via `spawn_test_server_with_state_root`),
  sends `connect`, `chat.send`, `sessions.list`, `sessions.resolve`,
  `chat.history`, `channels.status`. Asserts the sentinel
  `handlerOwner: "S3.gateway.sessions"` is in the `sessions.list` response
  and `handlerOwner: "S3.gateway.chat"` is in the `chat.history` response —
  proof that the live S0 dispatch loop is routing through the S3 runtime
  modules. `channels.status` is asserted only to dispatch end-to-end (no
  handler-owner check — channels stays in S0 as documented).

---

## Verification

```text
$ cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml
    anima_invoke_contract        — 3/3
    dispatch_contract            — 12/12
    graphiti_runtime_contract    — 6/6
    live_gateway_smoke (NEW)     — 4/4
    protocol_contract            — 2/2
    runtime_state_contract       — 4/4
    session_store_contract       — 4/4
                                   ─────
    TOTAL                          35/35

$ cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions
    test result: ok. 4 passed; 0 failed

$ cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_chat
    test result: ok. 5 passed; 0 failed

$ cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_runtime_handler_owner
    test result: ok. 1 passed; 0 failed
```

All four verification gates listed in the plan pass.

---

## Files Touched

### Created
- `Body/S/S3/gateway/src/sessions.rs` — S3-owned session envelope constructors.
- `Body/S/S3/gateway/src/chat.rs` — S3-owned chat runtime (history/preview/compact/send/inject/abort).
- `Body/S/S3/gateway/tests/live_gateway_smoke.rs` — S3-side smoke test (4 tests).
- `Body/S/S0/epi-cli/tests/gate_runtime_handler_owner.rs` — S0-side live WebSocket smoke test (1 test).
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/13-t3-s3-runtime-extraction-evidence.md` — this file.

### Modified
- `Body/S/S3/gateway/Cargo.toml` — added `uuid = { version = "1", features = ["v4"] }` (now needed by `chat::send_message`).
- `Body/S/S3/gateway/src/lib.rs` — declared `pub mod chat;` and `pub mod sessions;`.
- `Body/S/S0/epi-cli/src/gate/sessions.rs` — became a thin re-export shim over `epi_s3_gateway::sessions::*` (was 121 LOC of envelope code, now 16 LOC of re-exports + the S0-local `SessionStore` re-export from `super::session_store`).
- `Body/S/S0/epi-cli/src/gate/chat.rs` — became a thin re-export shim over `epi_s3_gateway::chat::*` (was 113 LOC, now 11 LOC).

### Not touched (lane discipline)
- `Body/S/S3/gateway/src/dispatch.rs` — locked by Thread T in 13.T2.
- `Body/S/S3/gateway-contract/src/lib.rs` — locked by Thread T.
- `Body/S/S3/gateway/src/spacetime*.rs` or any SpaceTimeDB module — Thread V owns 13.T4.
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` — Thread V (13.T4).
- `Body/S/S0/epi-cli/src/gate/channels.rs` — kept as-is, classification documented above.
- `Body/S/S0/epi-cli/src/gate/server.rs` — no surgical edit required because the
  S0 `sessions`/`chat` modules are now re-export shims; all server.rs imports
  (`use super::chat;` etc.) and call-sites (`chat::history_response(...)`,
  `sessions::session_row(&record)`, etc.) keep working unchanged.
