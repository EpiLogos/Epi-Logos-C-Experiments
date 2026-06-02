---
coordinate: "S3.5'"
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

# S3.5' Shard: Return Integration Law

## Canonical Role

[[S3.5']] is the [[P5']] / [[CT5]] return law of [[S3']]. It owns app projection readiness, activity/history close surfaces, cross-system broadcast readiness, and the [[Graphiti]] runtime boundary that makes episodic memory technically available while leaving invocation, disclosure, review, and meaning to [[S5]] / [[S5']].

## Source And Diagram Anchors

Use [[S3'-SPEC]], [[S3-SPEC]], [[S3'-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3']], and `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.canvas`. Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. Legacy anchors include [[2026-04-04-graphiti-unified-temporal-context-service]], [[2026-03-10-nara-runtime-full-plan]], and historical [[S3-5']] Aletheia learning material now rehomed to [[S5']] / [[Aletheia]].

## Current Body Reality

`Body/S/S3/graphiti-runtime/src/lib.rs` defines `GraphitiRuntimeConfig`, `GraphitiStatus`, `EpisodeAttrs`, `EpisodeInsert`, provenance helpers, session-memory envelopes, kernel-resonance deposit payloads, and kernel-profile observation payloads. It marks `runtimeOwner = "S3'"`, `invocationOwner = "S5/S5'"`, `graph_owner = "S2"`, and `privacyBoundary = "protected-local-episodic-memory"`. `Body/S/S3/gateway/tests/graphiti_runtime_contract.rs` and `Body/S/S3/graphiti-runtime/tests/episode_vak.rs` verify this split.

## Build Contract

Graphiti is a temporal episodic runtime adapter here, not the reflective authority. Deposits must reject identity mutation, preserve session/day/namespace arc ids, carry VAK coordinates when present, and avoid protected kernel state leakage. App projection must surface readiness/status/history handles without claiming that [[Epii]], [[Aletheia]], [[Nara]], or [[Gnosis]] have already interpreted the event.

## API / Envelope / Implementation Hooks

APIs include `s5.episodic.search`, `s5.episodic.deposit`, `s5.episodic.kernel_resonance.deposit`, `s5.episodic.kernel_profile_observation.deposit`, `session_memory_envelope`, `session_memory_deposit_payload`, `kernel_resonance_deposit_payload`, `kernel_profile_observation_deposit_payload`, `EpisodeAttrs::with_vak`, and `provenance_from_record`.

## Test Obligations

Graphiti runtime tests must assert S3 runtime/S5 invocation split, identity-mutation rejection, arc id construction, protected kernel-state rejection, VAK field serialisation, and absence of private fields. App/runtime smoke should verify the compatibility HTTP adapter is explicit and optional, not canonicalised as target architecture.

## Open Gaps

The current Graphiti compatibility layer still points at a FastAPI wrapper on port `37778`. This proves integration but remains transitional until native/library runtime integration is complete.

## Boundaries

[[S3.5']] owns runtime return boundary. [[S2]] owns graph anchors, [[S5]] / [[S5']] own invocation, review, disclosure, and reflection, [[Aletheia]] owns learning return through S5', and [[S3.3']] owns shared projection envelopes.
