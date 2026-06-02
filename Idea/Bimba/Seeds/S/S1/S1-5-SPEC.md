---
coordinate: "S1.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-02-22-bimba-data-foundation-harmonization]]"
  - "[[2026-05-19-hen-coordinate-graph-promotion]]"
---

# S1.5 Shard: Search, Backlinks, Sync, Graduation

## Canonical Role

[[S1.5]] is the [[P5]] / [[CT5]] / [[L5]] integration surface where material vault artifacts return into legibility: search, backlinks, link suggestions, archive receipts, graduation paths, and graph-sync evidence. It is base-side because it deals in concrete files, links, and paths. [[S1.5']] owns the normative return law and approval boundary.

## Source And Diagram Anchors

Primary seed sources: [[S1-SPEC]], [[S1-SHARD-INDEX]], [[S1-TRACEABILITY-INDEX]], [[2026-02-22-bimba-data-foundation-harmonization]], and [[2026-05-19-hen-coordinate-graph-promotion]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for S1 output consumed by [[S2]], [[S5]], and [[M']], [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[Present]] -> [[Seeds]] -> [[World]] movement, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] for the gap between CLI search and canonical sync. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas` and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

`Body/S/S0/epi-cli/src/vault/mod.rs` exposes `search`, `search-content`, `link-suggest`, `move`, `delete`, and `archive-day`. `link-suggest` already calls `epi_s1_hen_compiler_core::suggest_link_candidates`, making wikilink intelligence a real [[Hen]] surface rather than prose. `Body/S/S0/epi-cli/src/gate/s1_hen.rs` implements `s1'.vault.rename_file` / `move_file` with atomic rename plus inbound wikilink reconciliation using `parse_wikilinks`, and `s1'.semantic.suggest_links` with privacy filtering. `Body/S/S1/hen-compiler-core/src/graph_promotion.rs` turns validated markdown/frontmatter/link evidence into `GraphPromotionIntent`.

## Build Contract

Search/backlink behavior must be graph-useful before it is graph-mutating. `s1.search` may use filesystem or `obsidian-cli` search, but result shape must remain stable enough for gateway parity. `s1.backlinks` and rename/move reconciliation must use real wikilink parsing and update inbound links atomically. `s1.sync.flush` must not claim live graph writes unless it can produce or consume a typed `GraphSyncIntent` / `GraphPromotionIntent`; current Hen intent has `touches_live_graph: false`, so S2 owns live graph mutation. Graduation must record source residency, target residency, provenance, and review state.

## API / Envelope / Implementation Hooks

Current hooks: `epi vault search`, `epi vault search-content`, `epi vault link-suggest`, `s1'.vault.rename_file`, `s1'.vault.move_file`, `s1'.semantic.suggest_links`, `GraphPromotionIntent::from_markdown`, and `graph_sync_intent`. Envelope fields should include `s_1_graduation_path`, `s_2_sync_destination`, link evidence count, frontmatter evidence, privacy class, and promotion source (`hen_compiler_core` where applicable).

## Test Obligations

Required tests: `Body/S/S0/epi-cli/tests/gate_s1_vault_surface.rs` for rename/move link reconciliation and protected-path refusal, `vault_hen_boundary_audit.rs` for boundary coverage, `hen-compiler-core/tests/wikilink_parser.rs` for heading/path wikilink parsing, `smart_env_link_candidates.rs` for suggestion behavior, `graph_promotion_intent.rs` for promotion evidence, and `graph_sync_intent.rs` for no-live-graph intent. New tests must create real markdown fixtures with wikilinks/frontmatter and assert actual rewrites/evidence.

## Open Gaps

`s1.sync.flush` is not a complete live graph mutation path; the current honest state is typed intent plus S2 handoff. CLI `move` and `delete` through `obsidian-cli` remain deprecated operator escape hatches and should not be used by agents. There is no complete canonical graduation command yet for [[Present]] -> [[Seeds]] -> [[World]] with review receipts.

## Boundaries

[[S1.5]] prepares return evidence and link integrity. [[S1.5']] decides lawful promotion and approval requirements. [[S2']] owns graph semantics and live sync. [[S5']] / [[Epii]] owns reflective approval. [[M']] and [[Theia]] consume S1 outputs but must not bypass [[Hen]] for writes.
