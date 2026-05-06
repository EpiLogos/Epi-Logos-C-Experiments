---
coordinate: "S3"
c_4_artifact_role: "traceability-index"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-30T00:00:00Z"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-S3i-GATEWAY]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[2026-04-10-s3-spec-traceability-index]]"
---

# S3 Traceability Index

## #4 Context

This file updates the dated [[2026-04-10-s3-spec-traceability-index]] into the current S/S' spec pass. It records the source corpus used to clarify [[S3]] as gateway control plane and [[S3']] as temporal/shared-state law.

Primary canon used for [[S3]]:

| Source | Location | Role in conclusion |
|---|---|---|
| [[S3-SPEC]] | `Idea/Bimba/Seeds/S/S3/S3-SPEC.md` | Current consolidated gateway/temporal-state build reference |
| [[S3-S3i-GATEWAY]] | `docs/specs/S/S3-S3i-GATEWAY.md` | Formal S3/S3' gateway and state-plane split |
| [[S-SOURCE-TRACEABILITY-INDEX]] | `Idea/Bimba/Seeds/S/S-SOURCE-TRACEABILITY-INDEX.md` | Cross-level canonical source routing |
| [[2026-04-10-s3-spec-traceability-index]] | `Idea/Bimba/Seeds/S/S3/2026-04-10-s3-spec-traceability-index.md` | Earlier traceability ledger; retained as genealogy |
| [[2026-03-07-s3-gateway-full-implementation]] | `docs/plans/2026-03-07-s3-gateway-full-implementation.md` | Main gateway implementation-intent plan |
| [[2026-03-10-full-gateway-functionality-plan]] | `docs/plans/2026-03-10-full-gateway-functionality-plan.md` | Expanded target command/API surface |
| [[2026-03-10-gateway-verification-matrix]] | `docs/plans/2026-03-10-gateway-verification-matrix.md` | Gateway verification source |
| [[2026-04-04-graphiti-unified-temporal-context-service]] | `docs/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | Graphiti temporal-context planning, re-read through the current S3'/S5 split |

Contextual/supporting sources:

| Source | Location | Why it mattered |
|---|---|---|
| [[2026-02-11-omnipanel-gateway-gap-analysis-elevation-plan]] | `docs/resources/S/2026-02-11-omnipanel-gateway-gap-analysis-elevation-plan.md` | Older OmniPanel/gateway gap pressure |
| [[2026-02-11-omnipanel-gateway-parity-plan]] | `docs/resources/S/2026-02-11-omnipanel-gateway-parity-plan.md` | Gateway parity genealogy |
| [[2026-02-17-omnipanel-gateway-state-architecture-plan]] | `docs/resources/S/2026-02-17-omnipanel-gateway-state-architecture-plan.md` | Prior gateway/state split source |
| [[2026-03-07-s3-gateway-parity-discharge]] | `docs/plans/2026-03-07-s3-gateway-parity-discharge.md` | Parity discharge planning |
| [[2026-03-09-s3-gateway-merge-cleanup]] | `docs/plans/2026-03-09-s3-gateway-merge-cleanup.md` | Gateway merge/cleanup planning |
| `epi-cli/src/gate/*` | `epi-cli/src/gate/` | Live gateway implementation evidence |
| `epi-spacetime-module/src/lib.rs` | `epi-spacetime-module/src/lib.rs` | Current shared-state projection evidence |

## #5 Integration

Conclusions drawn for [[S3]]:

- [[S3]] owns imperative gateway transport, protocol, sessions, channels, routing, parity, and event fanout.
- [[S3']] owns temporal/shared-state grounding: [[Chronos]], [[Day]], [[NOW]], [[Kairos]], Redis-backed live context, presence, and state projection.
- [[Redis]] is allowed here because S3' owns temporal contextual grounding, while S2 owns graph/cache substrate use.
- [[Graphiti]] is architecturally S3' temporal episodic runtime/library, not a required sidecar. S5/S5' owns invocation, search, arc governance, and reflective meaning.
- Older OmniPanel and state-architecture plans remain important genealogy, but the current coordinate law is the build target.

## #0 Ground

Future S3 implementation passes should read this file together with [[S3'-TRACEABILITY-INDEX]] before changing gateway, Redis session/context, Graphiti runtime, SpacetimeDB, or route-parity code.
