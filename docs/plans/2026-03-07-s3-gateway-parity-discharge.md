# S3 Gateway Parity Discharge

## Method Ledger

| Method | Rust Handler | Rust Test | Electron Coverage | Status |
| --- | --- | --- | --- | --- |
| `connect` | `src/gate/server.rs` | `tests/gate_auth.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `chat.send` | `src/gate/server.rs`, `src/gate/chat.rs` | `tests/gate_chat.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `chat.history` | `src/gate/server.rs`, `src/gate/chat.rs` | `tests/gate_chat.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `sessions.list` | `src/gate/server.rs`, `src/gate/sessions.rs` | `tests/gate_sessions.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `sessions.resolve` | `src/gate/server.rs`, `src/gate/sessions.rs` | `tests/gate_sessions.rs`, `tests/gate_omnipanel_contract.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `sessions.patch` | `src/gate/server.rs`, `src/gate/sessions.rs` | `tests/gate_chat.rs`, `tests/gate_spacetimedb_bridge.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `config.get` / `config.schema` / `config.set` / `config.patch` / `config.apply` | `src/gate/server.rs`, `src/gate/config.rs`, `src/gate/config_tui.rs` | `tests/gate_config_system.rs`, `tests/gate_config_tui.rs` | `tests/omni/parity-matrix.test.ts` | pass |
| `channels.status` / `channels.logout` | `src/gate/server.rs`, `src/gate/channels.rs` | `tests/gate_channels_cron_voice.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `skills.status` / `skills.bins` / `skills.install` / `skills.update` | `src/gate/server.rs`, `src/gate/skills.rs` | `tests/gate_channels_cron_voice.rs` | `tests/e2e/omnipanel-gateway.spec.ts` harness blocked | pass / harness-blocked |
| `cron.*` | `src/gate/server.rs`, `src/gate/cron.rs` | `tests/gate_channels_cron_voice.rs` | no Electron coverage yet | pass / Rust-only |
| `node.*` / `device.*` / `browser.request` / `web.login.*` / `exec.*` | `src/gate/server.rs`, supporting modules in `src/gate/` | `tests/gate_nodes_devices_browser.rs` | no Electron coverage yet | pass / Rust-only |
| `talk.mode` / `tts.*` / `voicewake.*` | `src/gate/server.rs`, `src/gate/system.rs` | `tests/gate_channels_cron_voice.rs` | no Electron coverage yet | pass / Rust-only |
| `last-heartbeat` / `set-heartbeats` / `system-presence` / `system-event` | `src/gate/server.rs`, `src/gate/system.rs` | `tests/gate_config_system.rs`, `tests/gate_spacetimedb_bridge.rs` | no Electron coverage yet | pass / Rust-only |
| `update.run` / `wizard.*` / `logs.tail` / `models.list` / `usage.*` | `src/gate/server.rs`, supporting modules in `src/gate/` | `tests/gate_config_system.rs` | no Electron coverage yet | pass / Rust-only |

## Electron OmniPanel Gap Analysis

- The Rust gateway contract aligns with the current panel parity matrix and Rust-owned OmniPanel contract tests.
- Real Electron E2E parity is blocked by the app harness, not by a reproduced gateway mismatch:
  - `tests/e2e/app.spec.ts` and `tests/e2e/omnipanel-gateway.spec.ts` launch Electron with `args: ['src']`
  - that resolves to `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src`
  - that directory is not an Electron application root
- `tests/e2e/omnipanel-boundary.spec.ts` launches with `args: ['.']` and successfully boots the app, which confirms the harness defect is path-specific.
- Electron-visible panel contract still has extra client-side expectations not yet implemented in the Rust manifest:
  - `status.summary`
  - `health.snapshot`
  - `presence.list`

## PI Agent And Channel Integration Points

- PI agent takeover path:
  - `sessions.patch.activeAgentId`
  - `sessions.patch.subagentLineage`
  - `sessions.resolve`
  - `sessions.list`
- Channel-facing skill propagation path:
  - `skills.status`
  - `skills.bins`
  - `channels.status.invocationSurface`
  - `web.login.start`
  - `web.login.wait`
- CLI/operator path:
  - `epi gate config show`
  - `epi gate config schema`
  - `epi gate config set`
  - `epi gate config patch`
  - `epi gate config apply`
  - `epi gate config tui`
- Universal NOW handoff path:
  - `src/gate/spacetimedb_bridge.rs`
  - startup placeholder `m_clock_state`
  - live `presence`, `session_surface`, and `activity_event` publication

## Verification Ledger

- Pending command results to append from Task 13 verification runs.
