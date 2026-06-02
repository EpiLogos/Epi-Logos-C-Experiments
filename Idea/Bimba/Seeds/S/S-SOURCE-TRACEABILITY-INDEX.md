---
coordinate: "S/S'"
c_4_artifact_role: "traceability-index"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-30T00:00:00Z"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-CODE-RESIDENCY-PLAN]]"
  - "[[S-CODE-RESIDENCY-AUDIT]]"
  - "[[S0-SOURCE-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[S2-TRACEABILITY-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S4-TRACEABILITY-INDEX]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[S5-TRACEABILITY-INDEX]]"
---

# S/S' Source Traceability Index

## #4 Context

This file is the cross-level provenance map for the consolidated [[S0-SPEC]] through [[S5-SPEC]] family. It does not replace the level specs or the local traceability indexes. It gives future agents a single source-routing layer so they can tell which older plans, resources, and formal specs are canonical for deeper detail before making implementation decisions.

Use this order when researching any S/S' implementation pass:

1. Read the current level spec and shard specs under `Idea/Bimba/Seeds/S/Sx/`.
2. Read the local traceability/source index for that level.
3. Follow the canonical `/docs` sources below for deeper implementation and planning detail.
4. Treat live code as reality evidence and move target, not as source authority where it conflicts with the settled coordinate law.

## Global Canon

| Source | Location | Role |
|---|---|---|
| [[S-SYSTEM-INDEX]] | `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md` | Current whole-system image, API/envelope/TypeScript harmonisation, command reconciliation |
| [[S-CODE-RESIDENCY-PLAN]] | `Idea/Bimba/Seeds/S/S-CODE-RESIDENCY-PLAN.md` | Target residency law for `Idea/`, `Body/`, runtime/tool planes, and Sx/Sx' code homes |
| [[S-CODE-RESIDENCY-AUDIT]] | `Idea/Bimba/Seeds/S/S-CODE-RESIDENCY-AUDIT.md` | Current code-foundation evidence and move-readiness |
| [[FLOW 2026 04 24 PI AGENT API v0.1]] | `Idea/Empty/Present/FLOW 2026 04 24 PI AGENT API v0.1.md` | Coordinate-native API method contract |
| [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] | `Idea/Empty/Present/FLOW 2026 04 22 ENVELOPE FIELD SCHEMA.md` | Field residency and data-envelope authority |
| [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] | `Idea/Empty/Present/FLOW 2026 04 25 TS INTERFACE DEFINITIONS.md` | Shared typed API/envelope interface target |
| [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] | `Idea/Empty/Present/FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING.md` | Lattice naming and residency frame used by the S-family |
| [[2026-02-26-epi-logos-canonical-system-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` | Older stack-wide canonical plan; genealogical where superseded, still useful for intent |
| [[2026-02-28-coordinate-type-system-and-reflection-families]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-28-coordinate-type-system-and-reflection-families.md` | Coordinate type-system and reflection-family background |

## S0 / S0' Sources

| Source | Location | Role |
|---|---|---|
| [[S0-SOURCE-INDEX]] / [[S0'-SOURCE-INDEX]] | `Idea/Bimba/Seeds/S/S0/` | Local S0/S0' provenance ledger |
| [[S0-S0i-CLI-CORE]] | `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-S0i-CLI-CORE.md` | Formal old/current CLI core authority |
| [[S0-QV-PIPELINE-AND-PLUGIN]] | `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md` | QV/plugin pipeline and CLI plugin genealogy |
| [[2026-03-05-epi-cli-design]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-05-epi-cli-design.md` | Main CLI design source |
| [[2026-03-05-epi-cli-expansion]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-05-epi-cli-expansion.md` | CLI expansion and command-surface planning |
| [[2026-03-07-epi-core-knowing]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-epi-core-knowing.md` | `epi core knowing` and coordinate-kernel planning |
| [[2026-03-07-epi-logos-lib-packaging]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-epi-logos-lib-packaging.md` | Shared library/package planning tied to CLI executable shape |
| [[2026-02-28-epi-claw-cli-harmonization-daily-commands]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-28-epi-claw-cli-harmonization-daily-commands.md` | Older CLI/daily-command harmonisation source |

## S1 / S1' Sources

| Source | Location | Role |
|---|---|---|
| [[S1-TRACEABILITY-INDEX]] / [[S1'-TRACEABILITY-INDEX]] | `Idea/Bimba/Seeds/S/S1/` | Local S1/S1' provenance ledgers |
| [[S1-S1i-OBSIDIAN]] | `Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md` | Formal vault and Obsidian layer authority |
| [[2026-03-10-idea-tree-and-ct-templates]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-idea-tree-and-ct-templates.md` | Idea tree, CT template, and residency planning |
| [[2026-03-10-world-types-mirror]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-world-types-mirror.md` | World/Types mirror law |
| [[2026-02-22-bimba-data-foundation-harmonization]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` | Filesystem ontology, promotion flow, and data-foundation harmonisation |
| `epi-dev-vault/` | `epi-dev-vault/` | Current compiler-vendor basis for Hen/S1' development |

## S2 / S2' Sources

| Source | Location | Role |
|---|---|---|
| [[S2-TRACEABILITY-INDEX]] / [[S2'-TRACEABILITY-INDEX]] | `Idea/Bimba/Seeds/S/S2/` | Local S2/S2' provenance ledgers |
| [[S2-S2i-GRAPH]] | `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md` | Formal graph/cache substrate and graph-law authority |
| [[2026-03-08-knowing-graph-convergence-plan]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-08-knowing-graph-convergence-plan.md` | Coordinate knowing and graph convergence |
| [[2026-03-09-graphrag-port-completion]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-09-graphrag-port-completion.md` | GraphRAG port completion source |
| [[2026-03-10-graph-bootstrap-health]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-graph-bootstrap-health.md` | Neo4j/graph bootstrap and health planning |
| [[2026-03-10-semantic-graph-lifecycle]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-semantic-graph-lifecycle.md` | Semantic graph ingestion, lifecycle, and retrieval state |

## S3 / S3' Sources

| Source | Location | Role |
|---|---|---|
| [[S3-TRACEABILITY-INDEX]] / [[S3'-TRACEABILITY-INDEX]] | `Idea/Bimba/Seeds/S/S3/` | Local S3/S3' provenance ledgers |
| [[S3-S3i-GATEWAY]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md` | Formal gateway and shared-state split authority |
| [[2026-02-11-omnipanel-gateway-gap-analysis-elevation-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-11-omnipanel-gateway-gap-analysis-elevation-plan.md` | Older OmniPanel/gateway gap genealogy |
| [[2026-02-11-omnipanel-gateway-parity-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-11-omnipanel-gateway-parity-plan.md` | Gateway parity genealogy |
| [[2026-02-17-omnipanel-gateway-state-architecture-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-17-omnipanel-gateway-state-architecture-plan.md` | Gateway/state split predecessor source |
| [[2026-03-07-s3-gateway-full-implementation]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-gateway-full-implementation.md` | Main gateway implementation plan |
| [[2026-03-07-s3-gateway-parity-discharge]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-gateway-parity-discharge.md` | Parity discharge plan |
| [[2026-03-09-s3-gateway-merge-cleanup]] | `Idea/Bimba/Seeds/S/S3/Legacy/plans/2026-03-09-s3-gateway-merge-cleanup.md` | Gateway merge/cleanup plan |
| [[2026-03-10-full-gateway-functionality-plan]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-full-gateway-functionality-plan.md` | Full gateway command/API function plan |
| [[2026-03-10-gateway-verification-matrix]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-gateway-verification-matrix.md` | Gateway verification matrix |
| [[2026-04-04-graphiti-unified-temporal-context-service]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | Graphiti/temporal context source; S3' architecture, S5/S5' usage governance |

## S4 / S4' Sources

| Source | Location | Role |
|---|---|---|
| [[S4-TRACEABILITY-INDEX]] / [[S4'-TRACEABILITY-INDEX]] | `Idea/Bimba/Seeds/S/S4/` | Local S4 runtime and S4' ta-onta/VAK provenance ledgers |
| [[S4-S4i-PI-AGENT]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md` | Formal PI agent runtime authority |
| [[S4-EXTENSION-ARCHITECTURE]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-EXTENSION-ARCHITECTURE.md` | Extension package/runtime architecture |
| [[S4-TA-ONTA-EXTENSION-SPEC]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-TA-ONTA-EXTENSION-SPEC.md` | ta-onta extension authority |
| [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-NOW-INTEGRATION-AND-ENVIRONMENT.md` | NOW/environment integration |
| [[S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` | PI skills/plugin system |
| [[S4i-PLEROMA-PORT-MATRIX]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md` | Pleroma port matrix and module detail |
| [[ta-onta-anima-superpowers-vak-integration-spec]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/ta-onta-anima-superpowers-vak-integration-spec.md` | Canonical Anima/VAK execution grammar; required for S4' agentic work |
| [[VAK-SUPERPOWERS-INTEGRATION-SPEC]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` | Full VAK/superpowers integration map, including S4-0' through S4-5' detail |
| [[VAK-HANDOVER]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/VAK-HANDOVER.md` | Handover source for VAK integration assumptions |
| [[2026-03-10-ta-onta-full-implementation]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-ta-onta-full-implementation.md` | Full ta-onta implementation plan |
| [[2026-03-15-vak-dot-slash-agentic-nesting-m5-integration]] | `Idea/Bimba/Seeds/M/M5'/Legacy/plans/2026-03-15-vak-dot-slash-agentic-nesting-m5-integration.md` | VAK nesting and M5/Epii integration planning |
| [[2026-04-04-omx-vak-skill-fork-plan]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-omx-vak-skill-fork-plan.md` | OMX/VAK skill fork plan |

## S5 / S5' Sources

| Source | Location | Role |
|---|---|---|
| [[S5-TRACEABILITY-INDEX]] / [[S5'-TRACEABILITY-INDEX]] | `Idea/Bimba/Seeds/S/S5/` | Local S5/S5' provenance ledgers |
| [[S5-S5i-SYNC]] | `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md` | Older sync/Notion genealogy; not sufficient as current target |
| [[M4-nara-personal-interface]] | `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-personal-interface.md` | Nara/M4 personal interface authority used by S5 |
| [[M4-nara-subtle-body-map]] | `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-subtle-body-map.md` | Nara/M4 subtle-body map authority |
| [[M5-epii-holographic-integration]] | `Idea/Bimba/Seeds/M/M5'/Legacy/specs/M/M5-epii-holographic-integration.md` | Epii/M5 integration authority used by S5' |
| [[2026-02-21-epii-corpus-ingestion-design]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-21-epii-corpus-ingestion-design.md` | Epii corpus ingestion design |
| [[2026-02-21-epii-corpus-ingestion-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-21-epii-corpus-ingestion-plan.md` | Epii corpus ingestion plan |
| [[2026-03-06-m4-nara-design]] | `Idea/Bimba/Seeds/M/M4'/Legacy/plans/2026-03-06-m4-nara-design.md` | M4/Nara design source |
| [[2026-03-06-m4-nara-implementation]] | `Idea/Bimba/Seeds/M/M4'/Legacy/plans/2026-03-06-m4-nara-implementation.md` | M4/Nara implementation source |
| [[2026-03-07-m5-epii-design]] | `Idea/Bimba/Seeds/M/M5'/Legacy/plans/2026-03-07-m5-epii-design.md` | M5/Epii design source |
| [[2026-03-07-m5-epii-implementation]] | `Idea/Bimba/Seeds/M/M5'/Legacy/plans/2026-03-07-m5-epii-implementation.md` | M5/Epii implementation source |
| [[2026-03-10-nara-runtime-full-plan]] | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` | Full Nara runtime plan |
| [[2026-03-23-nara-clock-canonical-runtime-implementation-plan]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-23-nara-clock-canonical-runtime-implementation-plan.md` | Nara clock canonical runtime source |
| [[2026-04-23-vendor-spine-pi-port]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-23-vendor-spine-pi-port.md` | Vendor spine / PI port planning relevant to epi-logos plugin and autoresearch |
| [[CLOCK-AND-NARA-SPECS]] | `docs/plans/CLOCK-AND-NARA-SPECS/` | Nara clock, QL, VAK C-substrate, and golden-thread corpus |

## #5 Integration

The main traceability decisions are:

- [[S4']] work must follow the VAK/ta-onta canon, not merely the current `.pi/extensions/ta-onta/anima` code surface.
- [[S4.0']] through [[S4.5']] are the internal ta-onta carriers: [[Khora]], [[Hen]], [[Pleroma]], [[Chronos]], [[Anima]], [[Aletheia]].
- [[S3']] owns [[Graphiti]] as temporal episodic architecture; [[S5]] / [[S5']] owns invocation, search, governance, and reflective use.
- [[S5']] is [[Epii]], and its deep details must be read through M5/Epii, M4/Nara, CLOCK-AND-NARA, corpus-ingestion, and autoresearch/vendor-spine sources.
- Old `/docs` material is not dead. It is canonical where not superseded, genealogical where the newer S/S' specs explicitly re-home responsibilities.

## #0 Ground

When a future implementation agent needs deeper detail, this index should be treated as the lookup table, not as an excuse to skip the actual linked plans. The current S/S' specs define the target coordinate homes; the `/docs` sources explain why those homes exist and how earlier planning expected them to be built.
