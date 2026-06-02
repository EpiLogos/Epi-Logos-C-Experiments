---
coordinate: "S3'"
c_4_artifact_role: "traceability-index"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-30T00:00:00Z"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S3-S3i-GATEWAY]]"
  - "[[2026-04-10-s3i-spec-traceability-index]]"
---

# S3' Traceability Index

## #4 Context

This file updates the dated [[2026-04-10-s3i-spec-traceability-index]] for the current S/S' architecture. It exists because [[S3']] is where most old planning can accidentally drift: state-plane, temporal context, Redis, Graphiti, Nara timing, and gateway consequences all meet here.

Primary canon used for [[S3']]:

| Source | Location | Role in conclusion |
|---|---|---|
| [[S3-SPEC]] | `Idea/Bimba/Seeds/S/S3/S3-SPEC.md` | Current consolidated S3/S3' target shape |
| [[S3-S3i-GATEWAY]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md` | Formal gateway/shared-state split |
| [[2026-04-10-s3i-spec-traceability-index]] | `Idea/Bimba/Seeds/S/S3/S3'/2026-04-10-s3i-spec-traceability-index.md` | Earlier S3' traceability ledger |
| [[2026-04-04-graphiti-unified-temporal-context-service]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | Graphiti and temporal context planning, now clarified as S3' architecture plus S5 use |
| [[2026-03-23-nara-clock-canonical-runtime-implementation-plan]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-23-nara-clock-canonical-runtime-implementation-plan.md` | Nara clock runtime source relevant to temporal context |
| [[2026-03-10-nara-runtime-full-plan]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` | Nara runtime source for temporal/shared state interactions |

Implementation and contract anchors:

| Source | Location | Why it mattered |
|---|---|---|
| `.pi/extensions/ta-onta/chronos/CONTRACT.md` | `.pi/extensions/ta-onta/chronos/CONTRACT.md` | Chronos contract grounding for temporal runtime |
| `.pi/extensions/ta-onta/chronos/extension.ts` | `.pi/extensions/ta-onta/chronos/extension.ts` | Current Chronos extension evidence |
| `epi-cli/src/gate/session_store.rs` | `epi-cli/src/gate/session_store.rs` | Session state implementation anchor |
| `epi-cli/src/gate/spacetimedb_bridge.rs` | `epi-cli/src/gate/spacetimedb_bridge.rs` | Gateway-to-state projection anchor |
| `epi-spacetime-module/src/lib.rs` | `epi-spacetime-module/src/lib.rs` | Current live-state schema/reducer evidence |
| `epi-gnostic/epi_gnostic/graphiti_service.py` | `epi-gnostic/epi_gnostic/graphiti_service.py` | Current transitional Graphiti HTTP wrapper evidence, not target ownership |

## #5 Integration

Conclusions drawn for [[S3']]:

- [[S3']] is the temporal/shared-state plane of the [[Universal NOW]].
- [[Chronos]] is the S3' augmentation law: time, Day, NOW, Kairos, arcs, temporal keys, session close, and shared context.
- [[Graphiti]] belongs here as architecture because it is temporal episodic memory. The sidecar/wrapper is transitional and should be replaced by library/runtime integration where possible.
- [[S5]] / [[S5']] uses Graphiti: it owns record/search strategy, meaning, reflection, disclosure, and Epii/Aletheia integration.
- Nara runtime and clock plans are relevant here for timing/state semantics, while M4/M5 meaning remains S5/S5'.

## #0 Ground

Any implementation pass touching Redis temporal keys, NOW state, Graphiti runtime architecture, SpacetimeDB projection, or session/state events should begin here.
