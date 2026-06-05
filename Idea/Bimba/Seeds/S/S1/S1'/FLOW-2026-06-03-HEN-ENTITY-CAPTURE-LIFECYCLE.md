---
coordinate: "S1'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]"
  - "[[FLOW-2026-05-06-SMART-ENV-HEN-LINK-CANDIDATE-POOL]]"
  - "[[World-Ontology]]"
  - "[[COORDINATE-MAP]]"
  - "[[coordinate-semantics]]"
---

# Flow 2026 06 03 Hen Entity Capture Lifecycle

## Decision

[[Hen]] should treat loose Obsidian notes, dangling `[[wikilinks]]`, and unresolved entity names as coordinate-governed `entity_candidate` artifacts before they can become [[World/Types]] incubations or flat [[World]] crystallisations.

The compiler intelligence remains Hen-native:

- [[Smart Env]] / Smart Connections is a read-only suggestion pool.
- mdbase-style collection shape is represented through coordinate-lawful frontmatter.
- Entity Notes-style aliases are represented as canonical alias frontmatter plus ordinary wikilinks.
- [[S2]] graph state is materialised only from Hen-accepted vault state, never directly from embedding suggestions.

The separate SwarmVault install remains a Codex/Claude development-ledger sidecar. It is not the canonical Pi/Hen compiler for vault entities.

## Lifecycle

1. **Capture.** Hen detects a dangling wikilink, an unresolved link suggestion, or an Obsidian-created loose root note.
2. **Move to Empty.** Hen creates or moves the note into `Idea/Empty/` or `Idea/Empty/Present/{DD-MM-YYYY}/entities/` with `c_4_artifact_role: "entity-candidate"`.
3. **Annotate.** Hen adds coordinate-lawful metadata: `coordinate`, `c_1_ct_type`, `c_0_source_coordinates`, `c_1_aliases`, `c_5_crystallisation_state`, `s_1_vault_path`, and temporal provenance where available.
4. **Suggest.** Hen reads Smart Env candidates from `Idea/.smart-env/multi/*.ajson` and merges explicit outlinks, source neighbors, block neighbors, aliases, and existing-note matches.
5. **Classify.** Hen proposes coordinate home, CT type, related World links, source evidence, and relation candidates.
6. **Promote to Types.** Review-approved candidates move into coordinate-native `Idea/Bimba/World/Types/Coordinates/**` incubation with same-name `.md` / `.canvas` MOC structure when type-local topology is needed.
7. **Graduate to World.** Stable definitions graduate into flat `Idea/Bimba/World/{Name}.md`; the type-local file becomes a `type_moc_pointer`.
8. **Sync to Graph.** Hen emits graph-promotion intent after accepted wikilinks/frontmatter are written. S2 validates labels and relationships before materialisation.

## Required Surfaces

| Surface | Role | Status |
| --- | --- | --- |
| `s1'.entity.capture` | Create or move loose/dangling notes into Empty candidate residency | target-state |
| `s1'.entity.classify` | Propose coordinate, CT type, aliases, links, and relation evidence | target-state |
| `s1'.entity.promote_to_type` | Promote reviewed candidates from Empty into World/Types incubation | target-state |
| `s1'.world.graduate` | Graduate stable crystallisations into flat World | already named target-state in crystallisation protocol |
| `s1'.semantic.neighbors_of` / `by_block` / `search` | Expose deeper Smart Env evidence beyond `suggest_links` | target-state over landed Smart Env substrate |

## Frontmatter Policy

Entity candidate frontmatter must obey the existing coordinate model. Do not add generic provenance keys or tag-led identity fields where a coordinate-family key exists.

Recommended initial keys:

- `coordinate`
- `c_4_artifact_role: "entity-candidate"`
- `c_1_ct_type`
- `c_0_source_coordinates`
- `c_1_aliases`
- `c_5_crystallisation_state: "entity_candidate"`
- `s_1_vault_path`
- `s_1_type_source_path` once promoted
- `s_2_graph_candidate_id` only after graph-promotion review exists

Tags may provide facets, but entities are pages and wikilinks. Typed relations are review-gated relation candidates until accepted by Hen/S2.

## Guardrails

- Do not resurrect top-level semantic roots such as `World/Types/Entities` unless a Seed protocol explicitly ratifies that root.
- Do not let Smart Env create graph nodes, edges, relation types, or canonical frontmatter directly.
- Do not leave Obsidian-created loose root notes as permanent root artifacts.
- Do not duplicate stable definitions between type-local files and flat World files; after graduation, type-local files are pointers/MOCs.
- Do not use SwarmVault as the Pi/Hen canonical entity compiler. Use SwarmVault for the development ledger sidecar only.

## Cycle 3 Closure

This flow adds the missing S1' intelligence behind DR-S1-4 and CCT-14 in the Cycle 3 design-reconciliation plan. It extends the already-landed `s1'.semantic.suggest_links` seam without changing the authority boundary: Smart Env suggests, Hen writes, S2 syncs.
