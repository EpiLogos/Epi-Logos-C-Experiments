---
coordinate: "S/S'"
c_4_artifact_role: "harmonization-protocol"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-02"
c_0_source_coordinates:
  - "[[World-Ontology]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[LEGACY-DOCS-MIGRATION-INDEX]]"
---

# S/S' Shard Harmonization Protocol

## Purpose

The shard specs under [[S0]]-[[S5]] and [[S0']]-[[S5']] must be real coordinate contracts, not pallid fragments of their umbrella specs. Each shard exists to bind four things:

- [[World-Ontology]], [[World]] ontology, and the matching `Idea/Bimba/World/Types/Coordinates/S/**` definition/canvas.
- Migrated legacy source material recorded in [[LEGACY-DOCS-MIGRATION-INDEX]].
- Current [[Body]] substrate and tests.
- Architecture diagram consumption from [[ARCHITECTURE-DIAGRAM-PACK]] and any coordinate-local [[World/Types]] MOC canvas.

## Minimum Shard Contract

Every shard spec must include these sections:

| Section | Required content |
|---|---|
| `Canonical Role` | One paragraph naming the coordinate, its [[P]] / [[CT]] / [[L]] posture, and the boundary it owns. |
| `Source And Diagram Anchors` | Wikilinks to umbrella spec, shard index, traceability index, architecture diagram anchor, matching World definition/canvas, and migrated legacy sources. |
| `Current Body Reality` | Concrete code paths, commands, methods, crates, or tests that currently implement or constrain the shard. |
| `Build Contract` | Required behavior, data/envelope shape, APIs, and ownership rules. |
| `Test Obligations` | Real tests or verification commands; no mock-only tests. |
| `Open Gaps` | Honest deltas between seed law, migrated specs, and code. |
| `Boundaries` | What adjacent coordinates own, with wikilinks. |

## Wikilink Density Rule

A shard is graph-useful only if it links the terms an agent will navigate by. At minimum, each shard should link:

- Its own coordinate, umbrella coordinate, and prime/base partner.
- Relevant [[P0]]-[[P5]], [[CT0]]-[[CT5]], and [[L0]]-[[L5]] / prime lens terms when used semantically.
- Named carriers, agents, substrates, and product consumers such as [[Hen]], [[Khora]], [[Chronos]], [[Anima]], [[Epii]], [[Nara]], [[Graphiti]], [[KernelBridge]], and [[Capability Matrix]].
- Matching specs and migrated legacy sources using actual wikilinks, not only literal paths.

## Diagram Contract

Architecture diagrams apply to specs through explicit consumption links:

- Whole-system and cross-system diagrams live in [[ARCHITECTURE-DIAGRAM-PACK]] as Seed-level [[CT1]] architecture docs.
- Type/MOC canvases live under `Idea/Bimba/World/Types/**` and should link or be referenced by the owning seed spec.
- Mermaid diagrams do not create reliable backlinks, so every diagram used by a shard must be listed in that shard's `Source And Diagram Anchors` section as an explicit wikilink to the heading anchor.
- If a shard changes ownership, API flow, residency, lifecycle, or product consumption, the shard must either update the relevant diagram or record `no diagram delta` with a reason.

## Harmonization Pass Order

1. Start with [[S1]] / [[S1']] because they govern residency, wikilinks, and diagram/MOC materialisation.
2. Harmonise [[S0]] / [[S0']] next so executable command surfaces point to the corrected Seed graph.
3. Harmonise [[S2]] / [[S2']] so graph/search/retrieval consumes the richer wikilinks.
4. Harmonise [[S3]] / [[S3']] so gateway and temporal runtime ownership is reflected in diagrams.
5. Harmonise [[S4]] / [[S4']] so [[ta-onta]], [[VAK]], and constitutional agents are no longer ambient.
6. Harmonise [[S5]] / [[S5']] so review, autoresearch, [[Gnosis]], and [[Epii]] return law consume the same graph.

## Verification

For each harmonised coordinate pair:

- `rg -o "\[\[[^]]+\]\]" <shard> | wc -l` should show materially more than placeholder density.
- The shard should cite at least one current [[Body]] substrate path.
- The shard should cite at least one migrated legacy source where such source exists.
- The shard should cite at least one diagram anchor or explicitly record why no diagram applies.
- The umbrella spec and shard index should include a backlink to the harmonised shard.
