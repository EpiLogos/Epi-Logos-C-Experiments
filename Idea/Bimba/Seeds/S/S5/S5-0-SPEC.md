---
coordinate: "S5.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-0]]"
---

# S5.0 Shard: Boundary Ground And Source-Return Intake

## Canonical Role

[[S5.0]] is the [[P0]] / [[CT0]] ground of [[S5]]: the addressable world-boundary before a return becomes a view, query, episode, review item, or [[Seed]]. It owns source identity, intake readiness, coordinate context, and the first distinction between world-return evidence, protected [[Nara]] material, publication candidates, and [[Epii]] review deposits.

## Source And Diagram Anchors

Read [[S5-SPEC]], [[S5-SHARD-INDEX]], [[S5-TRACEABILITY-INDEX]], [[S-SHARD-HARMONIZATION-PROTOCOL]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[S5]], `Idea/Bimba/World/Types/Coordinates/S/S5/S5.canvas`, and legacy [[S5-0]]. The legacy S5.0 aggregation file is genealogy only; the current ground is plugin/Epii/world-return intake.

## Current Body Reality

Current intake is implemented across `Body/S/S5/epii-agent/agent-contract.json`, `Body/S/S5/epii-agent-core/src/lib.rs`, `Body/S/S5/plugins/epi-logos/README.md`, `Body/S/S5/epi-gnostic/epi_gnostic/cli.py`, and `Body/S/S5/epi-kbase/src/index.ts`. `agent-contract.json` fixes `agent_id=epii`, accepted deposits from [[Anima]], gateway methods, and the DAY-scoped inbox rule. `EpiiAgentAccess` exposes snapshots, deposits, review counts, improvement vectors, and gateway method lists.

## Build Contract

Every S5 intake envelope must carry source, coordinate context, artifact reference, privacy/sensitivity class, review requirement, and DAY/NOW/session lineage when it enters [[Epii]]. Source-return evidence may be visible to [[M5']] or the [[Agentic Control Room]], but mutation or public release must pass [[S5.1']] review and [[S5.5']] promotion law.

## Test Obligations

Run `cargo test --manifest-path Body/S/S5/epii-agent-core/Cargo.toml`, `Body/S/S5/tests/test_epii_agent_contract.py` through the project Python runner, and plugin scaffold checks when `Body/S/S5/plugins/epi-logos` manifests change.

## Open Gaps

Some designed `s5.*` families are still missing, and provider-backed [[Epii]] to [[Anima]] invocation remains incomplete. No diagram delta beyond explicit consumption links.

## Boundaries

[[S1]] owns vault writes; [[S2]] owns graph/vector stores; [[S3']] owns temporal sessions and [[Graphiti]] runtime; [[S4']] owns [[Anima]] dispatch; [[S5']] owns review and return judgment.
