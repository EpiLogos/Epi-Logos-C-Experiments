---
coordinate: "P1"
c_0_source_coordinates: ["docs/resources/TO-C-Dev-REPO/MOC planning/Pratibimba Types/Position-1-Definition.md"]
c_4_artifact_role: "legacy-archive"
title: "Position 1 - Definition View"
type: moc-position-view
ql_position: "#1"
position_name: Definition
ai_function: QL task tracker, workflow triggers
user_function: Core prose, facts, substance
created: 2026-01-11
status: ARCHIVED
---

# Position 1 - Definition

> **AI**: QL-structured task space, #TODO-X tags for workflow triggers
> **USER**: Clean space for core content, facts, definitions

---

## Task Tracker

```dataview
TASK FROM ""
WHERE bimba = this.file.folder
GROUP BY file.link
```

---

## Material Status

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  p1_definitions as "Definitions",
  p1_materials as "Materials",
  file.mtime as "Modified"
FROM ""
WHERE bimba = this.file.folder AND p1_definitions != null
SORT file.mtime DESC
```

---

## TODO Tags

```dataview
LIST FROM ""
WHERE bimba = this.file.folder AND contains(file.content, "#TODO")
```

---

## Notes

<!--
AI/User notes space - observations about definition completeness,
substance gaps, entities needing material attention, etc.
-->



---

*Position View: #1 Definition*
*See [[MOC-Bimba-Paradigm]] for context*
