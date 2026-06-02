---
coordinate: "S1.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-03-10-world-types-mirror]]"
  - "[[2026-02-22-bimba-data-foundation-harmonization]]"
---

# S1.2 Shard: Template And Form

## Canonical Role

[[S1.2]] is the [[P2]] / [[CT2]] / [[L2]] operation surface where material vault files are born from templates and named [[World]] forms. Its base-side ownership is concrete rendering and file shape: [[Daily Note]], [[NOW]], [[Thought]], [[FLOW]], [[Prompt]], [[Task-Spec]], [[Pattern-Note]], and CT frozen-process templates. It does not decide the full [[Hen]] registry or graduation law; those are [[S1.2']] and [[S1.5']].

## Source And Diagram Anchors

Primary seed sources: [[S1-SPEC]], [[S1-SHARD-INDEX]], [[S1-TRACEABILITY-INDEX]], [[2026-03-10-world-types-mirror]], and [[2026-02-22-bimba-data-foundation-harmonization]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for `World` flat forms vs `World/Types` MOCs, [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for S/S' layering, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]] for current-vs-target template authority. World anchors: `Idea/Bimba/World/Types/Coordinates/S/S1/S1.md`, `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas`, [[Daily-Note]], [[NOW]], [[Thought]], [[Task-Spec]], [[Pattern-Note]], [[Prompt]], [[Seed]], [[FLOW]], and [[Integration-Preview]].

## Current Body Reality

`Body/S/S0/epi-cli/src/vault/templates.rs` is the current executable renderer. It checks `Idea/Bimba/World/{Form}.md` first, then `$HOME/.epi-logos/templates/{Form}.md`, then built-ins. This directly implements the migrated `World` flat form-library rule rather than a nested `/Forms` folder. Built-ins emit a single YAML frontmatter block with `coordinate`, `family`, `artifact_role`, `ctx_type`, `day_id`, `session_id`, `thought_type`, optional `summary`, and optional [[VAK]] keys. `Body/S/S0/epi-cli/src/vault/paths.rs` provides the concrete [[Day]], [[NOW]], archive, and [[Thought]] paths.

## Build Contract

`s1.template.render` / `epi vault template-invoke` must render from a real authority path, not a placeholder string. The order is: canonical [[World]] form override, user `.epi-logos/templates` override, built-in fallback. World overrides must not be silently rewritten with extra VAK/summary fields; they are already the authority for their frontmatter shape. Built-ins must preserve exactly one frontmatter block and must emit parseable YAML. Template output must include enough provenance for [[S1.1]] validation and enough residency for [[S1.4]] / [[S1.5]] handoff.

## API / Envelope / Implementation Hooks

Current hooks are `epi vault template-invoke`, `day-init`, `now-init`, `flow-init`, and `thought-route` in `Body/S/S0/epi-cli/src/vault/mod.rs`. `render_template_with_vak_and_summary` is the important implementation seam because it prevents double-frontmatter drift while allowing agent-produced summaries and VAK addresses to enter the artifact. `Body/S/S0/epi-cli/tests/vault_paths_templates.rs` locks World-template precedence and CT4b coverage.

## Test Obligations

Required tests must use real template files or built-in renderers: `world_template_authority_precedes_built_in_template`, `ct4b_templates_include_all_content_spaces`, `builtin_template_emits_coordinate_not_bimba_coordinate`, and the `vault_commands.rs` single-frontmatter tests for VAK/summary. Add coverage when new forms are introduced so every canonical [[World]] form used by [[Hen]] can be rendered or explicitly rejected.

## Open Gaps

The current base renderer has strong file-level behavior but not a complete [[Hen]] registry API for all CT/CT' families. Historical references to `docs/resources/CT4b-MASTER-TEMPLATE.md` are now legacy provenance, not the canonical runtime path; this shard should point future work toward `Idea/Bimba/World/*.md` plus [[S1.2']] form law.

## Boundaries

[[S1.2]] renders material forms. [[S1.2']] owns the authority registry, form birth, and graduation prerequisites. [[S1.1]] validates the frontmatter that rendering produces. [[S1.4]] places temporal forms under [[Day]] / [[NOW]]. [[S5']] decides reflective promotion meaning after a form graduates.
