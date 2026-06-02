---
coordinate: "S1.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-03-10-world-types-mirror]]"
---

# S1.2' Shard: Form Birth And Graduation

## Canonical Role

[[S1.2']] is the [[P2]] / [[CT2]] / [[L3']] law surface where [[Hen]] governs CT authority templates, form birth, form listing, and graduation prerequisites. [[S1.2]] renders files; [[S1.2']] decides when a rendered file is a lawful artifact with lineage, residency, and future graduation eligibility.

## Source And Diagram Anchors

Primary seed sources: [[S1'-SPEC]], [[S1-SPEC]], [[S1'-TRACEABILITY-INDEX]], [[S1-S1i-OBSIDIAN]], [[2026-03-10-world-types-mirror]], and [[2026-02-22-bimba-data-foundation-harmonization]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for form/type/canvas residency, [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for S1' law placement, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for agent and [[M']] consumers. World anchors: `Idea/Bimba/World/{Name}.md` form files, `Idea/Bimba/World/Types/{Type}/{Type}.canvas`, and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

The current executable renderer lives in `Body/S/S0/epi-cli/src/vault/templates.rs`, but its precedence rule is already S1' law: `Idea/Bimba/World/*.md` overrides built-ins. `Body/S/S1/hen-compiler-core/src/lib.rs` validates the identities produced by these templates, while `Body/S/S1/hen-compiler-core/src/graph_promotion.rs` classifies `Idea/Bimba/World/**` as `bimba_world_template` and `Idea/Bimba/Seeds/**` as `canonical_bimba_seed`. Tests in `Body/S/S0/epi-cli/tests/vault_paths_templates.rs` and `Body/S/S0/epi-cli/tests/idea_tree_templates.rs` assert the World/Types split and template authority.

## Build Contract

`s1'.form.birth` must choose a canonical form source, render with explicit lineage, validate frontmatter through [[S1.1']], and place the result in the appropriate [[S1]] residency zone. `s1'.form.list` must distinguish flat [[World]] forms from [[World/Types]] canvases/MOCs and [[Seeds]] specs. `s1'.form.graduate` must require source provenance, target class, link integrity, and review state before moving [[Present]] or [[Seeds]] material into [[World]] canon.

## API / Envelope / Implementation Hooks

Target methods: `s1'.form.birth`, `s1'.form.list`, `s1'.form.graduate`, and `s1'.template.resolve`. Current hooks are `render_template`, `render_template_with_vak_and_summary`, `GraphPromotionIntent::from_markdown`, and `promotion_class_for_path`. Envelope fields should include source form, resolved template path, target residency, artifact role, coordinate, wikilink count, frontmatter validation result, and graduation target.

## Test Obligations

Required coverage: World template override precedes built-in template, CT4b templates include all content spaces, canonical Idea tree contains flat World forms and ordered World/Types mirror, graph promotion classifies World/Seeds paths correctly, and graduation rejects artifacts without coordinate/frontmatter evidence. Tests must use real temp files or actual repository fixture paths.

## Open Gaps

There is not yet a complete `s1'.form.*` gateway surface. Graduation law exists as specification plus promotion-intent primitives, not as a fully approved command. The old `/Forms` assumption is obsolete but may still survive in migrated prose and should be treated as compatibility drift.

## Boundaries

[[S1.2']] owns form authority and birth law. [[S1.2]] renders material output. [[S1.5']] owns return/promotion law after the form exists. [[S5']] / [[Epii]] decides reflective approval for meaningful promotion. [[S2']] receives graph-promotable evidence only after S1' validation.
