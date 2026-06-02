---
coordinate: "S3.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3'-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.2' Shard: Session Lineage Law

## Canonical Role

[[S3.2']] is the [[P2']] / [[CT2]] operational law for temporalised session lineage. It extends [[S3.2]] by making canonical keys, aliases, transcript windows, workspace/bootstrap derivation, subagent ancestry, and NOW-bearing session state projectable without confusing runtime lineage with [[Psyche]] continuity.

## Source And Diagram Anchors

Read [[S3'-SPEC]], [[S3-SPEC]], [[S3-SHARD-INDEX]], [[S3'-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3']], and `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.canvas`. Diagrams: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Source genealogy includes [[2026-03-07-s3-gateway-full-implementation]], [[2026-03-07-s3-universal-now-bridge-notes]], and historical [[S3-2']] Pleroma/skills material now rehomed to [[S4.2']] / [[Pleroma]].

## Current Body Reality

`Body/S/S3/gateway/src/session_store.rs` persists `SessionRecord` fields for canonical key, aliases, labels, `session_id`, `day_id`, `spawned_by`, parent/source keys, `vault_now_path`, runtime cwd, vault root, delivery context, channel/thread/group data, team/orchestration metadata, model/provider overrides, CLI session ids, and `vak_address`. `Body/S/S3/gateway/tests/session_store_contract.rs` proves context injection, legacy normalisation, transcript path law, subagent patching, and VAK round-trip.

## Build Contract

Lineage must be explicit enough for [[Anima]], [[Epii]], subagents, and clients to know which session they inhabit. Aliases may point to [[NOW]] forms, but canonical keys must remain safe for wire/storage compatibility. Transcript windows and history limits must be queryable; lineage mutation must preserve auditability. Session lineage may be projected into [[SpaceTimeDB]] surfaces but not treated as the full historical graph.

## API / Envelope / Implementation Hooks

Primary APIs are `sessions.resolve`, `sessions.patch`, `sessions.preview`, `sessions.tree`, `sessions.fork`, `sessions.resume`, and `s3'.temporal.context`. Fields include `canonicalKey`, `aliases`, `sessionId`, `dayId`, `parentSessionKey`, `sourceSessionKey`, `vaultNowPath`, `workspaceRoot`, `bootstrapScope`, `subagentLineage`, and `vakAddress`.

## Test Obligations

Use real `SessionStore` filesystem tests, not mocked DTOs. Required cases: alias resolution, patch persistence, restart-safe records where required, transcript path stability, nested subagent rejection, and VAK metadata preservation.

## Open Gaps

Compaction/reset/fork/resume/import/tree behavior is partly parity-specified and partly hosted in S0 live gateway paths. S3' lineage law should force extraction rather than claim it is complete.

## Boundaries

[[S3.2']] owns session lineage as runtime/projection fact. [[S1']] owns vault file law, [[S3.3']] broadcasts projected changes, [[S4']] owns lived agent state, and [[S5']] owns review/meaning of session history.
