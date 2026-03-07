---
title: Position 5 - Synthesis View
type: moc-position-view
ql_position: "#5"
position_name: Synthesis
ai_function: Aggregated status, handoffs, trends
user_function: Summary reception, quintessence, reflections
created: 2026-01-11
---

# Position 5 - Synthesis

> **AI**: Aggregated data on accomplished vs not done, handoffs, trends
> **USER**: Receiving space for summaries, reflections, the 5→0 twist

---

## Completion Status

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  choice(p5_integrations, "✓ Integrated", "○ Pending") as "Integration",
  p5_crystallizations as "Crystallizations"
FROM ""
WHERE bimba = this.file.folder
```

---

## Crystallized Entities

```dataview
LIST FROM ""
WHERE bimba = this.file.folder AND p5_crystallizations != null
```

---

## Integration Network

```dataview
TABLE WITHOUT ID
  file.link as "Entity",
  p5_integrations as "Integrates Into"
FROM ""
WHERE bimba = this.file.folder AND p5_integrations != null
```

---

## Category Summary

**Total Entities:** `$= dv.pages().where(p => p.bimba && p.bimba.path && p.bimba.path.includes(dv.current().file.folder)).length`

**Fully Integrated:** `$= dv.pages().where(p => p.bimba && p.bimba.path && p.bimba.path.includes(dv.current().file.folder) && p.p5_integrations).length`

---

## Handoffs

<!--
AI space for handoff data - what needs to move to other categories,
related learnings, improvement possibilities, insights for action.
-->

| From | To | Nature | Status |
|------|-----|--------|--------|
| | | | |

---

## Notes

<!--
AI/User notes space - synthesis observations, quintessence drafts,
teleological reflections, the 5→0 return planning.
-->



---

## Quintessence

> **Category Essence:**
> [To be crystallized through use]

---

*Position View: #5 Synthesis*
*See [[MOC-Bimba-Paradigm]] for context*
