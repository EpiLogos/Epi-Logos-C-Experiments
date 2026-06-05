---
coordinate: "S1'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]"
  - "[[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]]"
  - "[[World Types Mirror]]"
  - "[[TYPE-REGISTRY]]"
  - "[[C]]"
---

# Flow 2026 06 03 C Layer Typology And MOC Workflow

## Decision

The primary semantic typology inside [[World/Types]] is [[C]]. Other coordinate families qualify the thing; C says what kind of thing it is.

Semantic categories therefore belong under `Idea/Bimba/World/Types/Coordinates/C/**`, not as top-level sibling roots such as `Templates`, `Entities`, `Properties`, `Diagrams`, or `Artifacts`.

## Base Structure

| C coordinate | Semantic authority | Primary folders |
| --- | --- | --- |
| [[C0]] | Source / Ground | `Source-Ground/Coordinate-Roots`, `Ontology-Roots`, `Source-Namespaces` |
| [[C1]] | Forms / Templates | `Forms-And-Templates/Forms`, `Definitions`, `Ideal-Markdown-Forms`, `C1'/CT/**` |
| [[C2]] | Entities / Properties / Tags | `Entities-Properties-Tags/Entity-Candidates`, `Entities`, `Properties`, `Tags`, `Aliases`, `Relation-Fields` |
| [[C3]] | Processes / Canvases / Diagrams | `Processes-Canvases-Diagrams/MOC-Canvas-Forms`, `Architecture-Diagram-Forms`, `Workflow-Patterns`, `Process-Canvases`, `Ideal-Canvas-Templates`, `Ideal-Diagram-Templates` |
| [[C4]] | Types / Contexts / MOCs | `Types-Contexts-MOCs/Type-Authorities`, `Context-Frames`, `Folder-MOC-Patterns`, `Dataview-Indexes`, `Residency-Classes` |
| [[C5]] | Crystallisations / Pratibimba | `Crystallisations-Pratibimba/World-Forms`, `Integration-Forms`, `Graduation-Receipts`, `Reflection-Archives` |

## Hen Classification Workflow

1. Resolve artifact residency: [[Seeds]], [[Empty]], [[World/Types]], flat [[World]], or [[Pratibimba]].
2. Classify the artifact against the C layer first.
3. Apply reflective subgrammar where relevant: [[CT]] for C1 template law, [[CF]] for C3 context-frame/process law, and the remaining C-prime branches after audit.
4. Use other coordinate families to qualify the artifact after C classification.
5. Maintain same-name `.md` / `.canvas` MOCs for C folders that function as type authorities.
6. Emit graph-promotion evidence with `type_family`, `type_path`, `type_coordinate`, `semantic_authority`, and `crystallisation_state`.

## Workflow Routing

| Artifact or event | C route | Follow-up |
| --- | --- | --- |
| New template or prompt form | [[C1]] / [[CT]] | Hen validates CT-specific frontmatter and body sections. |
| Dangling wikilink or loose root note | [[C2]] after Empty capture | Hen proposes aliases, properties, links, relation candidates, and coordinate home. |
| Stable canvas pattern | [[C3]] | Hen stores canvas-form evidence and links Seed diagram/spec sources. |
| Type folder or MOC authority | [[C4]] | Hen ensures same-name `.md` / `.canvas` and registry entry. |
| Flat World graduation | [[C5]] | Hen creates graduation receipt and leaves type-local MOC pointer. |

## C Prime Audit

The current tree contains reflective C-prime branches (`CPF`, `CT`, `CFP`, `CF`, `CP`, `CS`) but their ancestry must be audited against the VAK order [[CPF]] -> [[CT]] -> [[CP]] -> [[CF]] -> [[CFP]] -> [[CS]] before graph-label promotion treats folder ancestry as authoritative.

Until that audit closes, C-prime folders are usable as local MOC/type anchors but not as final graph-label law.

## Cycle 3 Closure

This flow is the source anchor for CCT-15 in Cycle 3. CCT-14 handles entity capture; CCT-15 handles the wider C-layer semantic typology and MOC maintenance workflow that makes entity capture, template law, canvas/diagram forms, and World graduation cohere.
