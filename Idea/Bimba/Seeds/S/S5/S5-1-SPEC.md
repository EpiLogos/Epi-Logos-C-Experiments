---
coordinate: "S5.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-1]]"
---

# S5.1 Shard: Connector Form And Return Rendering

## Canonical Role

[[S5.1]] is the [[P1]] / [[CT1]] form layer of [[S5]]. It defines how world-return becomes renderable: review cards, Epii workbench panes, Gnosis JSON answers, kbase search results, plugin skills/commands, [[Nara]] outputs, and future publication connectors. Its job is form fidelity, not final judgment.

## Source And Diagram Anchors

Read [[S5-SPEC]], [[S5-SHARD-INDEX]], [[S5-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S5]], `Idea/Bimba/World/Types/Coordinates/S/S5/S5.canvas`, and legacy [[S5-1]]. The old dashboard/view language survives as genealogy, not as a [[Notion]] monopoly.

## Current Body Reality

Concrete form carriers live in `Body/S/S5/epii-agent-core/src/lib.rs` (`M5WorkbenchSnapshot`, `M5ReviewPaneDto`, `M5CandidateDetailDto`, `M5ArtifactRefDto`), `Body/S/S5/epii-review-core/src/lib.rs` (`ReviewInboxItem`, `ReviewSubmission`, `GovernanceProfile`), `Body/S/S5/epi-gnostic/epi_gnostic/cli.py` JSON output, `Body/S/S5/epi-kbase/src/index.ts`, and `Body/S/S5/plugins/epi-logos/README.md`.

## Build Contract

Every renderable S5 form must preserve source refs, coordinate, privacy/readiness, review requirement, and promotion destination when present. [[M']] consumers may display summarized forms, but must not erase the underlying artifact URI, review status, or [[Epii]] gate. Publication-shaped outputs remain candidates until [[S5.5']] promotion resolves them.

## Test Obligations

Exercise real DTO/state behavior through `Body/S/S5/epii-agent-core/tests/full_spine_acceptance.rs`, review tests in `Body/S/S5/epii-review-core/tests/review_inbox.rs`, kbase package tests when added, and plugin scaffold validation when plugin resources change.

## Open Gaps

There is not yet a full Notion/n8n publication renderer, and `s5'.explain` / `s5'.teach` method families are still missing. Implemented form is strongest for Epii workbench/review and weakest for public publication.

## Boundaries

[[S5.0]] owns intake; [[S5.2]] owns retrieval operations; [[S5.1']] owns synthesis review reception; [[M4']] / [[Nara]] owns personal dialogical presentation; [[S1']] owns canonical vault rendering.
