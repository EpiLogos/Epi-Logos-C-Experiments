---
coordinate: "P3"
c_0_source_coordinates: ["docs/resources/TO-C-Dev-REPO/MOC planning/Pratibimba Types/Position-3-Pattern.md"]
c_4_artifact_role: "legacy-archive"
title: "Position 3 - Pattern View"
type: moc-position-view
ql_position: "#3"
position_name: Pattern
ai_function: QL diagrams, identity/flow mapping
user_function: Visual structure, graph views, galleries
created: 2026-01-11
status: ARCHIVED
---

# Position 3 - Pattern

> **AI**: QL-aligned diagrams mapping identity, flows, networks
> **USER**: Local graph, command library, canvas prompts, galleries

---

## Pattern Index

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  p3_patterns as "Patterns",
  p3_archetypes as "Archetypes",
  p3_symbols as "Symbols"
FROM ""
WHERE bimba = this.file.folder AND (p3_patterns != null OR p3_archetypes != null)
```

---

## Archetype Groupings

```dataview
LIST FROM ""
WHERE bimba = this.file.folder AND p3_archetypes != null
FLATTEN p3_archetypes as archetype
GROUP BY archetype
```

---

## Category Network

```mermaid
%%{init: {'theme': 'dark'}}%%
graph TD
    subgraph "Category: {Category}"
        B[["Bimba"]] --> P0["#0 Ground"]
        B --> P1["#1 Definition"]
        B --> P2["#2 Operation"]
        B --> P3["#3 Pattern"]
        B --> P4["#4 Context"]
        B --> P5["#5 Synthesis"]
        B --> T["Pratibimba Template"]
    end

    T --> I1["Instance 1"]
    T --> I2["Instance 2"]
    T --> I3["..."]

    I1 -.->|bimba:| B
    I2 -.->|bimba:| B
```

---

## Notes

<!--
AI/User notes space - pattern observations, archetype discoveries,
symbolic encapsulations, contextual instantiation galleries, etc.
-->



---

*Position View: #3 Pattern*
*See [[MOC-Bimba-Paradigm]] for context*
