---
title: Position 4 - Context View
type: moc-position-view
ql_position: "#4"
position_name: Context
ai_function: Learning history, what-broke-fixed-how-when
user_function: Activity space, timeline, research prompts
created: 2026-01-11
---

# Position 4 - Context

> **AI**: Learning history OF files (what broke, fixed, how, when, why)
> **USER**: Activity space (research, read, write), dialogical engagement

---

## Timeline

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  file.ctime as "Created",
  file.mtime as "Modified",
  round((date(now) - file.mtime).days) as "Days Since Edit"
FROM ""
WHERE bimba = this.file.folder
SORT file.mtime DESC
```

---

## Context Fields

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  p4_temporals as "Timeline",
  p4_spatials as "Location",
  p4_culturals as "Cultural"
FROM ""
WHERE bimba = this.file.folder AND (p4_temporals != null OR p4_spatials != null OR p4_culturals != null)
```

---

## Stale Entities

```dataview
LIST FROM ""
WHERE bimba = this.file.folder AND (date(now) - file.mtime).days > 30
SORT file.mtime ASC
```

---

## Learning History

<!--
AI space for recording what went wrong, what was fixed, how, by who/what,
when and where, and why+what-next. The identity and developmental narrative.
-->

| Date | Event | Resolution | Learning |
|------|-------|------------|----------|
| | | | |

---

## Notes

<!--
AI/User notes space - activity suggestions, research prompts,
dialogical engagement points, validation requirements, etc.
-->



---

*Position View: #4 Context*
*See [[MOC-Bimba-Paradigm]] for context*
