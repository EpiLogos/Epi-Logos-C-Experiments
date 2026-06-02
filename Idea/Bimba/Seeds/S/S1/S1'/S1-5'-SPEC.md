---
coordinate: "S1.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-05-19-hen-coordinate-graph-promotion]]"
---

# S1.5' Shard: Vault Return Law

## Canonical Role

[[S1.5']] is the [[P5]] / [[CT5]] / [[L0']] return law by which vault artifacts become durable synthesis, promotion candidates, graph-sync intent, or archived history. It governs promotion destinations, backlink/sync output, review requirements, and return-to-ground effects. [[S1.5]] handles concrete evidence; [[S1.5']] decides whether the return is lawful.

## Source And Diagram Anchors

Primary seed sources: [[S1'-SPEC]], [[S1-SPEC]], [[S1'-TRACEABILITY-INDEX]], [[S1-S1i-OBSIDIAN]], [[2026-05-19-hen-coordinate-graph-promotion]], and [[2026-02-22-bimba-data-foundation-harmonization]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for S1' output into [[S2]], [[S5]], [[M']], and [[Theia]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[Present]] -> [[Seeds]] -> [[World]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] for sync/current-state honesty. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

`Body/S/S0/epi-cli/src/gate/s1_hen.rs` implements the strongest current return-law behavior: `s1'.vault.rename_file` and `move_file` atomically reconcile inbound wikilinks, while `s1'.semantic.suggest_links` uses Hen link candidates with privacy filtering. `Body/S/S1/hen-compiler-core/src/graph_promotion.rs` builds `GraphPromotionIntent` from markdown/frontmatter/body wikilink evidence and labels Seeds as `canonical_bimba_seed`, World files as `bimba_world_template`, and Present files as `episodic_temporal_trace`. `Body/S/S1/hen-compiler-core/src/lib.rs` provides `graph_sync_intent` with `touches_live_graph: false`, preserving S2 ownership of live graph writes.

## Build Contract

Promotion must be explicit about source class and target class. [[Present]] artifacts can become [[Seeds]] evidence; [[Seeds]] specs can crystallise into flat [[World]] definitions; deeper MOCs/canvases live under [[World/Types]]. Every return must preserve provenance, frontmatter evidence, wikilink evidence, privacy class, review status, and graph-sync destination. `s1.sync.flush` must emit typed intent or call S2; it must not directly mutate Neo4j while pretending S1' owns graph semantics.

## API / Envelope / Implementation Hooks

Target methods: `s1'.form.graduate`, `s1'.return.promote`, `s1'.sync.intent`, `s1'.semantic.suggest_links`, `s1'.vault.rename_file`, and `s1'.vault.move_file`. Current hooks include `GraphPromotionIntent::from_markdown`, `graph_sync_intent`, `suggest_links`, and rename/move receipts. Envelope fields should include promotion source, source/target residency, `content_hash`, `markdown_body_hash`, frontmatter evidence, relation evidence, candidate relation list, and review/approval handle.

## Test Obligations

Required tests: `gate_s1_vault_surface.rs` for atomic rename/move receipts, `vault_hen_boundary_audit.rs` for route discipline, `graph_promotion_intent.rs` for source classification and evidence, `graph_sync_intent.rs` for canonical vs legacy migration intent, `artifact_evidence.rs` for frontmatter/body wikilink evidence, and `relation_inference_contract.rs` for relation candidate evidence. Tests must assert real file/link/evidence transformations.

## Open Gaps

There is not yet a full `s1'.return.promote` command with Epii approval receipts. `s1.sync.flush` remains target language unless backed by graph-sync intent plus S2 execution. The system has a strong rename/move law but weaker delete/archive backlink safeguards, especially directory archive movement.

## Boundaries

[[S1.5']] owns lawful return and promotion constraints. [[S1.5]] gathers material evidence. [[S2']] owns graph semantics and live writes. [[S5']] / [[Epii]] owns reflective approval. [[M']] and [[Theia]] consume return outputs but must route writes through [[Hen]].
