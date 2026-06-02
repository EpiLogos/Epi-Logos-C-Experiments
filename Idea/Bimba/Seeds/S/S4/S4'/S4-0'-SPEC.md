---
coordinate: "S4.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4'-SPEC]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.0' Shard: Bootstrap Law

## Canonical Role

[[S4.0']] is the [[Khora]] carrier of [[S4']]: [[P0]] / [[CT0]] bootstrap law, [[CPF]] polarity gate, observability visibility, session readiness, lifecycle hooks, and write-edge authority. It is [[S0]] / [[S0']] internalized inside [[S4']] so an agent can begin lawfully, recover from compaction, and know whether it is in dialogical [[CPF]] `(00/00)` or autonomous [[CPF]] `(4.0/1-4.4/5)`.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4'-SPEC]], [[S4-SPEC]], [[S4'-TRACEABILITY-INDEX]], [[S4-0-SPEC]], [[S4-SHARD-INDEX]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]].
- World/MOC anchors: [[S4']], `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md`, `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`, paired [[S4]] canvas at `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`.
- Migrated sources: [[S4-TA-ONTA-EXTENSION-SPEC]], [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]], [[2026-03-10-ta-onta-full-implementation]], [[2026-04-04-vault-autodetect-session-bootstrap]].

## Current Body Reality

Current implementation lives at `Body/S/S4/ta-onta/S4-0p-khora/extension.ts`, `CONTRACT.md`, `modules/z-phase-vak.ts`, `modules/sophia-fire.ts`, `S0/cli/**`, and `S0'/hooks/**`. `khora_session_init` shells to `epi agent session init`; `session_start` autodetects the vault, runs `epi vault day-init`, exports `EPI_SESSION_VAK_ADDRESS`, and initialises the session. `khora_write` is the canonical vault write primitive and enqueues sync events; `khora_sync_queue_flush` remains an honest stub.

Tests: `Body/S/S4/ta-onta/S4-0p-khora/tests/z_phase_vak.test.ts` and `sophia_disclosure_wire.test.ts`.

## Build Contract

Khora must run before other S4' carriers rely on session identity. It must expose session id, day id, NOW path, continuation state, and write authority as typed state/tool output. It may execute writes, but [[Hen]] defines content/folder law and [[S2]] validates graph promotion. Khora must not invent vault topology or bypass [[Hen]] frontmatter and wikilink contracts.

Dialogical tasks are not failures. [[CPF]] `(00/00)` means proceed by clearing/dialogue; autonomous [[CPF]] requires complete VAK and permission context before dispatch.

## API / Envelope / Implementation Hooks

- `khora_session_init`, `khora_session_status`, `khora_write`, `khora_sync_queue_push`, `khora_sync_queue_flush`, `khora_continuation_write`, `khora_session_close`.
- `s_4_bootstrap_context` must include session/day/NOW and runtime visibility.
- `EPI_SESSION_VAK_ADDRESS` carries the initial compose-phase [[VakAddress]] to child processes.
- Lifecycle hooks: `session_start`, `session_shutdown`, and `session_before_compact` via `Body/S/S4/ta-onta/composite-entry.ts`.

## Test Obligations

- Verify compose-phase VAK in `z_phase_vak.test.ts`.
- Verify Sophia disclosure single-writer flow in `sophia_disclosure_wire.test.ts`.
- Verify `khora_write` creates parent dirs and queues graph sync events against real filesystem paths.
- Verify `(00/00)` bootstrap routes to clearing when used by Anima dispatch.

## Open Gaps

- Neo4j sync flush is not wired.
- Secret materialisation via varlock/1Password is specified in legacy sources, but not fully proven in the inspected TypeScript tests.
- Old `.pi/extensions/ta-onta/khora` references remain historical; Body-native paths are canonical for this repo.

## Boundaries

[[S4.0']] prepares lawful orchestration. [[S4.1']] [[Hen]] defines content/folder form, [[S4.4']] [[Anima]] decides dispatch, [[S0]] executes process commands, and [[S2]] / [[S2']] own graph materialisation.
