---
coordinate: "P0"
c_0_source_coordinates: ["docs/resources/TO-C-Dev-REPO/MOC planning/Pratibimba Types/Position-0-Ground.md"]
c_4_artifact_role: "legacy-archive"
title: "Position 0 - Ground View"
type: moc-position-view
ql_position: "#0"
position_name: Ground
ai_function: Full metadata scoping, entity index, unsorted inbox
user_function: Capture space, raw connections, queue for processing
created: 2026-01-11
status: ARCHIVED
---

# Position 0 - Ground

> **AI**: Dataview index of all linked entities, full scoping at metadata level
> **USER**: Open space for fragments, connections, queue for processing

---

## Unsorted Inbox

Notes linking TO this category but not yet organized (kepano/MOC pattern):

```dataview
LIST FROM [[]]
WHERE !contains(this.file.outlinks, file.link)
SORT file.mtime DESC
```

---

## Entity Index

All instances of this category:

```dataview
TABLE
  file.link as "Entity",
  length(p0_grounds) as "Grounds",
  length(file.inlinks) as "Inlinks",
  length(file.outlinks) as "Outlinks"
FROM ""
WHERE bimba = this.file.folder
SORT file.mtime DESC
```

---

## Frontmatter Completeness

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  choice(p0_grounds, "✓", "✗") as "#0",
  choice(p1_definitions, "✓", "✗") as "#1",
  choice(p2_operations, "✓", "✗") as "#2",
  choice(p3_patterns, "✓", "✗") as "#3",
  choice(p4_temporals, "✓", "✗") as "#4",
  choice(p5_integrations, "✓", "✗") as "#5"
FROM ""
WHERE bimba = this.file.folder
```

---

## Notes

<!--
AI/User notes space - add observations about ground-level patterns,
missing connections, entities to investigate, etc.
-->



---

*Position View: #0 Ground*
*See [[MOC-Bimba-Paradigm]] for context*
