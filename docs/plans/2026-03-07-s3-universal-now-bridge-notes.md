# S3 Universal NOW Bridge Notes

## Scope Landed

- The first SpaceTimeDB bridge remains one-way.
- The bridge publishes deterministic local payloads from the Rust gateway into a persisted sink under the gateway state root.
- No networked SpaceTimeDB client is introduced in this tranche.

## Local Sink

- Path: `<gate-root>/spacetimedb-bridge/test-events.json`
- Producer: `epi-cli/src/gate/spacetimedb_bridge.rs`
- Trigger paths:
  - gateway startup emits `m_clock_state`
  - `set-heartbeats` emits `presence`
  - `chat.send`, `chat.inject`, and `sessions.patch` emit `session_surface`
  - `system-event` emits `activity_event`

## Initial Table Targets

| Event kind | Table target | Current source |
| --- | --- | --- |
| `presence` | `now_presence` | `system.json` heartbeat snapshot |
| `session_surface` | `now_sessions` | `sessions/*.json` canonical-plus-alias session state |
| `activity_event` | `now_activity` | `system-event` payloads |
| `m_clock_state` | `now_m_clock` | startup placeholder emitted by the gateway runtime |

## Reducer Boundary

- Gateway remains the imperative owner of commands, auth, session mutation, and channel/runtime control.
- The bridge only republishes already-committed gateway state.
- No reducer in the future Universal NOW is allowed to mutate gateway control state in this tranche.
- PI/VAK dynamics stay open through the published session metadata:
  - canonical key
  - aliases
  - active agent id
  - subagent lineage
  - workspace root
  - bootstrap scope

## PI Agent Integration Points

- PI agent activation is surfaced through `sessions.patch.activeAgentId`.
- Subagent naming and lineage are surfaced through `sessions.patch.subagentLineage`.
- Session aliases provide the stable NOW-facing handoff for future PI-visible naming.
- Channel-facing invocation can join the bridge later through:
  - `channels.status`
  - `skills.status`
  - `skills.bins`
  - `cron.*`
  - `web.login.*`

## Next Bridge Steps

- Replace the local sink with a real SpaceTimeDB client once the target tables and reducers are ready.
- Add channel/account surfaces and skill invocation metadata as first-class replicated projections.
- Add explicit PI-agent presence rows once the runtime emits stable PI identity/state frames.
