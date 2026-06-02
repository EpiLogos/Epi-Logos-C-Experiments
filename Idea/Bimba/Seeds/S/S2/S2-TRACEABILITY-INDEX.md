---
coordinate: "S2"
c_4_artifact_role: "seed"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-10T16:10:00Z"
c_0_source_coordinates: ["[[S2]]", "[[S2-S2i-GRAPH]]", "[[S-STACK-INTEGRATION]]", "[[2026-02-26-epi-logos-canonical-system-plan]]", "[[2026-02-22-bimba-data-foundation-harmonization]]", "[[2026-03-07-s1-s2-implementation-plan]]", "[[2026-03-08-knowing-graph-convergence-plan]]", "[[2026-03-10-semantic-graph-lifecycle]]"]
---

# [[S2]] Traceability Index

## #4 Context

This file records the source corpus used to crystallise [[S2]] as a specification-level authority in [S2.md](/Users/admin/Documents/Epi-Logos%20C%20Experiments/Idea/Bimba/World/Types/Coordinates/S/S2/S2.md).

Primary canon used for [[S2]]:

| Source | Location | Role in conclusion |
|---|---|---|
| [[S2]] | `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S2.md` | Old world-level articulation of [[S2]] as graph/database substrate; used as genealogical baseline |
| [[S2-S2i-GRAPH]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md` | Main formal spec for the graph layer and the strongest direct authority for the S2/S2' split |
| [[S-STACK-INTEGRATION]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/Legacy/specs/S/S-STACK-INTEGRATION.md` | Stack-wide placement of [[S2]] inside the broader S-layer order |
| [[2026-02-26-epi-logos-canonical-system-plan]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` | Canonical system-plan layer used to recover the intended graph substrate telos |
| [[2026-02-22-bimba-data-foundation-harmonization]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` | Shared system-law for residency, promotion, and cross-layer data ontology |
| [[2026-03-07-s1-s2-implementation-plan]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S1/S1'/Legacy/plans/2026-03-07-s1-s2-implementation-plan.md` | Main planning source for how vault material should meet graph substrate |
| [[2026-03-08-knowing-graph-convergence-plan]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-08-knowing-graph-convergence-plan.md` | Clarified the intended convergence of coordinate knowing with graph storage and retrieval |
| [[2026-03-10-semantic-graph-lifecycle]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-semantic-graph-lifecycle.md` | Lifecycle source for ingestion, storage, retrieval, and graph-state transitions |

Contextual/supporting reads consulted while resolving [[S2]]:

| Source | Location | Why it mattered |
|---|---|---|
| [[2026-04-03-gnostic-rag-anything-migration-design]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-03-gnostic-rag-anything-migration-design.md` | Showed the intended migration path into a graph-native retrieval substrate |
| [[2026-04-04-neo4j-m-branch-coordinate-schema-population-design]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-04-neo4j-m-branch-coordinate-schema-population-design.md` | Clarified coordinate-bearing schema expectations on the graph side |
| [[2026-04-04-graphiti-unified-temporal-context-service]] | `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | Helped separate temporal/context services from the raw substrate itself |
| `epi-cli/src/graph/mod.rs` plus adjacent `client.rs`, `redis_cache.rs`, `semantic_cache.rs`, `seed.rs`, `retrieval/graphrag.rs`, `retrieval/hybrid.rs`, `doctor.rs` | `/Users/admin/Documents/Epi-Logos C Experiments/epi-cli/src/graph/` | Runtime-facing anchors used only as sanity checks for naming and substrate composition, not as spec authority |
| `epi-gnostic/epi_gnostic/config.py`, `wrapper.py`, `graphiti_service.py`, `cypher/00-bootstrap.cypher` | `/Users/admin/Documents/Epi-Logos C Experiments/epi-gnostic/` | Live graph-service surfaces consulted to confirm the target substrate was not being invented from nowhere |
| `.pi/extensions/ta-onta/pleroma/CONTRACT.md` and `extension.ts` | `/Users/admin/Documents/Epi-Logos C Experiments/.pi/extensions/ta-onta/pleroma/` | Important for not collapsing substrate concerns into higher orchestration law |
| `epi core knowing S2 --json` and `epi graph doctor --json` | Runtime CLI reads | Consulted initially, then explicitly demoted after user correction because they describe current-state drift rather than normative target shape |

## #5 Integration

Conclusions drawn for [[S2]]:

- [[S2]] is the raw [[Neo4j]] + [[Redis]] graph substrate, not the coordinate-aware law surface.
- [[S2]] must remain schema-capable and namespace-capable without itself becoming the semantic contract.
- [[S2']] is the lawful graph grammar above [[S2]], not a synonym for the substrate.
- The target specification must be written teleologically: what the graph foundation ought to be, not what current tooling drift happens to expose.
- Live runtime/code reads were used only to avoid fantasy, not to govern the final doctrinal shape.

This index is the provenance ledger for those conclusions.

## #0 Ground

Follow-up traceability that may still be worth formalising into deeper seeds:

- an explicit [[S2.0]] through [[S2.5]] sub-coordinate source map
- a dedicated seed for [[Neo4j]] / [[Redis]] division of responsibility inside the shared substrate
- a separate seed clarifying how [[Graphiti]], [[Gnostic]], and [[Bimba]] lawfully inhabit the same substrate without collapsing into one another
