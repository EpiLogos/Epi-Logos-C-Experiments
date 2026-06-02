---
coordinate: "S3.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.2 Shard: Session Authority

## Canonical Role

[[S3.2]] is the [[P2]] / [[CT2]] operation layer of [[S3]] session authority. It owns durable session records, canonical keys, aliases, labels, transcript paths, active-agent binding, subagent lineage, workspace/bootstrap scope derivation, patch/reset/delete/compact/fork/resume/import/tree semantics, and the runtime identity handed to [[M']] clients.

## Source And Diagram Anchors

Read [[S3-SPEC]], [[S3'-SPEC]], [[S3-SHARD-INDEX]], [[S3-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3]], and the S3 World/MOC files. Diagram anchors are [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Migrated sources include [[2026-03-07-s3-gateway-full-implementation]], [[2026-03-10-gateway-verification-matrix]], and [[2026-03-07-s3-universal-now-bridge-notes]].

## Current Body Reality

`Body/S/S3/gateway/src/session_store.rs` implements `SessionStore`, `CreateSessionContext`, `create_with_context`, `resolve`, `ensure_with_context`, `list`, `patch`, `session_path`, and `transcript_path`. It persists records under a gate root, stores transcripts, normalises legacy [[OmniPanel]] rows, preserves `session_id`, `day_id`, `vault_now_path`, `runtime_cwd`, `vault_root`, `active_agent_id`, `subagent_lineage`, and `vak_address`, and derives workspace/bootstrap paths. `Body/S/S3/gateway/src/transcripts.rs`, `workspace.rs`, `bootstrap.rs`, and `subagents.rs` supply the adjacent mechanics.

## Build Contract

Session identity must remain compatible with product clients while allowing [[NOW]]-native aliases. The canonical session key is the wire-safe key; aliases and metadata carry richer [[Day]] / [[NOW]] / [[VAK]] identity. Patch semantics must be explicit: absent fields do not clear state, optional nested fields carry intentional clears where implemented, and subagent lineage must refresh derived paths. Session authority may reference [[Psyche]] continuity but must not claim to own lived agent state.

## API / Envelope / Implementation Hooks

Methods include `sessions.list`, `sessions.preview`, `sessions.resolve`, `sessions.run-state`, `sessions.patch`, `sessions.reset`, `sessions.delete`, `sessions.compact`, `sessions.fork`, `sessions.resume`, `sessions.import`, and `sessions.tree`. Envelope fields include `canonicalKey`, `aliases`, `label`, `sessionId`, `dayId`, `vaultNowPath`, `runtimeCwd`, `vaultRoot`, `activeAgentId`, `subagentLineage`, and `vakAddress`.

## Test Obligations

`Body/S/S3/gateway/tests/session_store_contract.rs` is mandatory coverage. It verifies Pi-injected runtime context, legacy OmniPanel row resolution, subagent patch authority, transcript path law, and VAK address round-trip. App parity coverage lives in `Body/S/S3/epi-app/tests/main/gateway-parity.test.ts`.

## Open Gaps

The live S0 gateway still supplies cwd, vault root, session id, day id, and NOW path. Extraction is incomplete until S3-native server code owns the same behavior without reverse dependency.

## Boundaries

[[S3.2]] owns session authority. [[S3.4]] and [[S3']] own temporal context projection; [[S1]] / [[S1']] own vault artifact form; [[S4']] owns agent inhabitation; [[S5']] owns reflective meaning over stored history.
