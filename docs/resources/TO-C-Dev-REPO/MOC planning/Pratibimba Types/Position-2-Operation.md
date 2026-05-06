---
title: Position 2 - Operation View
type: moc-position-view
ql_position: "#2"
position_name: Operation
ai_function: Operations log, change tracking
user_function: Methods, contrasts, workflow contemplation
created: 2026-01-11
---

# Position 2 - Operation

> **AI**: Full tracking of operations (entry→task→workflow→change→context)
> **USER**: Methods roundup, contrast tables, tool/workflow improvements

---

## Operations Log

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  p2_operations as "Operations",
  p2_skills as "Skills"
FROM ""
WHERE bimba = this.file.folder AND (p2_operations != null OR p2_skills != null)
SORT file.mtime DESC
```

---

## Recent Changes

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  file.mtime as "Modified",
  file.ctime as "Created"
FROM ""
WHERE bimba = this.file.folder
SORT file.mtime DESC
LIMIT 10
```

---

## Skill References

```dataview
LIST FROM ""
WHERE bimba = this.file.folder AND p2_skills != null
FLATTEN p2_skills as skill
GROUP BY skill
```

---

## Notes

<!--
AI/User notes space - workflow observations, process improvements,
operations that worked/failed, tool contemplation, etc.
-->



---

## Methods & Contrasts

| This | vs | That | Observation |
|------|-----|------|-------------|
| | | | |

---

*Position View: #2 Operation*
*See [[MOC-Bimba-Paradigm]] for context*
