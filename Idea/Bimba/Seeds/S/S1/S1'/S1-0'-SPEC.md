---
coordinate: "S1.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1'-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S1]]"
  - "[[S1']]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.0' Shard: Residency Law

## Canonical Role

[[S1.0']] is [[Hen]] residency law: the rule that decides where an artifact belongs before a write occurs. In [[P0]] / [[CT0]] terms it is the prime root of vault legality: [[S1.0]] can find the filesystem, but [[S1.0']] decides whether a target is [[World]], [[World/Types]], [[Seeds]], [[Empty]], [[Pratibimba]], or protected personal material.

## Source And Diagram Anchors

| Anchor | Role |
|---|---|
| [[S1'-SPEC]] | Single authoritative Hen seed |
| [[S1-SPEC]] | Umbrella [[S1]] / [[S1']] contract |
| [[S1-SHARD-INDEX]] | Local shard map |
| [[S-SHARD-HARMONIZATION-PROTOCOL]] | Evidence/linking contract |
| [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] | Direct diagram anchor for residency split and MOC/canvas law |
| [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] | Places [[S1']] beside [[S1]] in the S/S' pair lattice |
| [[S1-S1i-OBSIDIAN]] | Migrated S1/S1' formal vault ontology spec |
| [[2026-03-10-world-types-mirror]] | Migrated plan that locks [[World/Types]] as ordered ontology mirror |
| [[2026-05-19-hen-coordinate-graph-promotion]] | Migrated Hen graph-promotion and coordinate-write source |

## Current Body Reality

The landed gateway surface is `Body/S/S0/epi-cli/src/gate/s1_hen.rs`. It implements `s1'.vault.read_file`, `s1'.vault.write_file`, `s1'.vault.rename_file`, `s1'.vault.move_file`, and `s1'.semantic.suggest_links`. The module states the core boundary: Theia and agents do not write directly to the filesystem; writes route through Hen for wikilink integrity and protected-path enforcement.

Current mutation reality:

- `read_file` refuses protected paths without governed capability.
- `write_file` writes atomically enough for the current CLI surface and returns wikilink count parsed through Hen.
- `rename_file` / `move_file` reconciles Obsidian wikilinks across markdown files.
- `suggest_links` wraps Hen Smart Env candidates with protected-path filtering and staleness reporting.

The canonical Hen contract crate is `Body/S/S1/hen-compiler-core`. Its current public substrate includes `CompilerInvocation`, `GraphSyncIntent`, ledger channels, frontmatter validation law, `wikilinks.rs`, `graph_promotion.rs`, `property_intelligence.rs`, and `relation_inference.rs`. A separate `residency.rs` module is not currently present; residency is distributed across invocation planning, vault path law, gateway handlers, and specs.

## Build Contract

- Distinguish `World` as flat ontology from `World/Types` as type mirror.
- Encode ordered `#`, psychoid, and `C..M` mirror expectations.
- Decide residency class before writes.
- Enforce that migrated `/docs` authority now resolves through `Idea/Bimba/Seeds/**/Legacy/**` and [[LEGACY-DOCS-MIGRATION-INDEX]].
- Require diagram/MOC ownership when system shape changes: either update [[ARCHITECTURE-DIAGRAM-PACK]] or record `no diagram delta`.
- Keep [[World/Forms]] obsolete. Any source mentioning it is historical until explicitly rewritten.

## API / Envelope / TS

- Supports `s1'.residency.resolve`.
- Populates `s_1_target_vault_zone` and `s_1_target_residency_class`.
- Consumes and constrains `s1'.vault.write_file`, `rename_file`, `move_file`, and `s1'.semantic.suggest_links`.
- Provides residency inputs for [[S2]] graph-promotion intent and [[S5]] review/promotion output.

## Implementation Hooks

- `Body/S/S0/epi-cli/src/gate/s1_hen.rs`
- `Body/S/S1/hen-compiler-core/src/lib.rs`
- `Body/S/S1/hen-compiler-core/src/wikilinks.rs`
- `Body/S/S1/hen-compiler-core/src/graph_promotion.rs`
- `Body/S/S0/epi-cli/src/vault/mod.rs`
- [[LEGACY-DOCS-MIGRATION-MANIFEST]] and [[LEGACY-DOCS-MIGRATION-INDEX]] for migrated source-path truth.

## Test Obligations

- Resolve each residency class to the correct path.
- Reject stale path conventions.
- Move or rename a real markdown note and prove inbound wikilinks are rewritten.
- Refuse protected paths without governed capability.
- Suggest wikilinks from a real vault index or report staleness rather than hallucinating targets.
- Verify diagram/MOC residency references point to existing Seed pack or [[World/Types]] canvas.

## Boundaries

Residency law decides where artifacts live, not what they mean to [[Epii]]. [[S2]] owns graph semantics; [[S3]] transports gateway calls; [[S4]] / [[Anima]] chooses bounded executors; [[S5]] / [[Aletheia]] owns review and promotion evaluation. [[S1.0']] is the lawful path gate between all of them.

## Open Gaps

- `s1'.residency.resolve` is specified here but not yet visible as a discrete gateway method.
- `append_block`, `update_frontmatter`, `list_dir`, and directory move/watch surfaces are still deferred in `s1_hen.rs`.
- Protected-capability handshake remains partially unresolved.
- The shard layer still needs the same evidence-bearing treatment for [[S1.1']] through [[S1.5']].
