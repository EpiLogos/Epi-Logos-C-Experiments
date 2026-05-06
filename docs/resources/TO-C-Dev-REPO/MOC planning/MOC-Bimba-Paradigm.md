---
title: MOC-Bimba Paradigm
type: documentation
ql_position: "#3"
created: 2026-01-11
updated: 2026-01-11
status: FOUNDATIONAL
---

# MOC-Bimba Paradigm

> Unifying [[Maps of Content]] with [[Bimba]]/[[Pratibimba]] through the Platonic distinction of **Form** and **Type**.

---

## Philosophical Foundation

### Form and Type

The system distinguishes two fundamental concepts, both in the Platonic sense:

| Concept | Meaning | What It Represents |
|---------|---------|-------------------|
| **Form** | The Platonic form | An entity, concept, or thing itself |
| **Type** | The form of form | A way of defining entities, concepts, or things |

**Form** answers: *What is this thing?*
**Type** answers: *What kind of thing is this?*

### Examples

| Form | Type |
|------|------|
| [[Idea/Bimba/World/Obsidian]] | [[Idea/Bimba/World/Base Entity]] |
| [[Neo4j]] | [[Person]] |
| [[Claude Code]] | [[PAI/skills/Diagrams/SKILL]] |
| [[Kashmir Shaivism]] | [[Pack]] |

A Form is a *particular* - the crystallized understanding of one concept.
A Type is a *universal* - the pattern by which instances are created.

---

## The Bimba/Pratibimba Pairing

**Both Form and Type have a Bimba/Pratibimba structure.**

This duality reflects the [[implicate]]/[[explicate]] relationship:

| Component | Nature | Function |
|-----------|--------|----------|
| **Bimba** (Canvas) | Implicate | Open, attributive, collecting - the "backend" |
| **Pratibimba** (Markdown) | Explicate | Crystallized, structured, complete - the "frontend" |

```
┌─────────────────────────────────────────────────────────┐
│                   BIMBA/PRATIBIMBA                      │
│                                                         │
│   Bimba (Canvas)              Pratibimba (Markdown)     │
│   ├── Open structure          ├── Crystallized content  │
│   ├── Wiki-link lists         ├── Full QL frontmatter   │
│   ├── Freeform workspace      ├── Position sections     │
│   └── Implicate backend       └── Explicate frontend    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### How the Pairing Differs

The Bimba/Pratibimba structure serves different purposes for Form vs Type:

```
FORM (e.g., "Obsidian")
├── Bimba-Obsidian.canvas    → Attributive hub (related links, notes)
└── Obsidian.md              → Crystallized SYNTHESIS of the concept

    The Pratibimba IS the thing - complete understanding

TYPE (e.g., "Base Entity")
├── Bimba-Base Entity.canvas → Category hub (Position views, Dataview)
└── Pratibimba-Base Entity.md → Instance TEMPLATE for creation

    The Pratibimba CREATES things - pattern for instances
```

---

## Form Structure

A **Form** captures the complete understanding of a concept.

### Location

```
Bimba Library/Forms/{Topic}/
├── Bimba-{Topic}.canvas         # Hub: attributive collection
└── {Topic}.md                   # Pratibimba: crystallized synthesis
```

### Bimba Canvas (Hub)

The canvas serves as the **attributive backend**:
- **Open Space** - Freeform writing area
- **Related Entities** - Wiki-link lists by category
- **Notes & Additions** - Capture area for new connections
- **Embedded Pratibimba** - The synthesis file visible in canvas

### Pratibimba Markdown (Synthesis)

The markdown serves as the **crystallized frontend**:
- **Full QL frontmatter** - All `p0_` through `p5_` position fields
- **Six position sections** - Rich content per QL position
- **Quintessence** - Distilled essence blockquote
- **Hub reference** - Links back to the Bimba canvas

### Form Template

Template bundle: `MOC planning/Bimba Form/`
- `Bimba-Form-Template.canvas` - Canvas template
- `Pratibimba-Form-Template.md` - Synthesis template

---

## Type Structure

A **Type** defines the pattern by which instances are created.

### Location

```
Bimba Library/Types/{Category}/
├── Bimba-{Category}.canvas      # Hub: category workspace
├── Position-0-Ground.md         # Dataview: relational index
├── Position-1-Definition.md     # Dataview: material tracking
├── Position-2-Operation.md      # Dataview: operations log
├── Position-3-Pattern.md        # Dataview: pattern recognition
├── Position-4-Context.md        # Dataview: temporal placement
├── Position-5-Synthesis.md      # Dataview: synthesis status
└── Pratibimba-{Category}.md     # Template: instance authoring
```

### Bimba Canvas (Hub)

The canvas serves as the **category workspace**:
- **Central hub** - Category identity and instance linking info
- **Position Views** - Embedded Dataview files (6 positions)
- **#0 Queue** - Quick capture for unsorted items
- **Open Space** - Freeform working area
- **Embedded Pratibimba** - The template visible for reference

### Position View Files

Each position file contains:
- **Dataview query** - Dynamic aggregation of instances
- **Notes space** - AI or user annotations
- **Position metadata** - QL alignment

These are the **AI-directed views** - showing what exists.

### Pratibimba Markdown (Template)

The template serves as the **instance authoring surface**:
- **QL frontmatter structure** - Empty arrays for population
- **Position sections** - `## #0` through `## #5` with prompts
- **Bimba reference** - `bimba: [[{Category}]]` for linking

This is the **user-directed space** - where instances are created.

### Type Template

Template bundle: `MOC planning/Bimba Type/`
- `Bimba-Type-Template.canvas` - Canvas template
- `Pratibimba-Type-Template.md` - Instance template
- `Position-{0-5}-*.md` - Dataview view templates

---

## Instance Linking

Instances created from a Type's Pratibimba template link back via frontmatter:

```yaml
---
bimba: "[[Base Entity]]"
---
```

Dataview queries in Position files aggregate all instances:

```dataview
TABLE file.link, p1_definitions
FROM ""
WHERE contains(bimba, "{Category}")
```

### Unsorted Inbox Pattern

Position #0 includes auto-populating inbox:

```dataview
LIST FROM [[]]
WHERE !contains(this.file.outlinks, file.link)
SORT file.mtime DESC
```

Notes linking TO the Bimba but not yet organized appear here. Manual linking removes them from the inbox.

---

## QL Position Mappings

| Position | Form Content | Type Dataview Focus |
|----------|--------------|---------------------|
| **#0 Ground** | Relational field, ecosystem | Linked entities, frontmatter |
| **#1 Definition** | Core description, substance | Tasks, material status |
| **#2 Operation** | Capabilities, methods | Workflow runs, operations |
| **#3 Pattern** | Architecture diagram | Patterns, archetypes |
| **#4 Context** | Historical, cultural | Timeline, modifications |
| **#5 Synthesis** | Quintessence, integration | Completion status |

---

## Creating New Forms and Types

### New Form

1. Create folder: `Bimba Library/Forms/{Topic}/`
2. Copy from `MOC planning/Bimba Form/` templates
3. Rename: `Bimba-{Topic}.canvas`, `{Topic}.md`
4. Populate synthesis content through QL positions
5. Build out attributive hub with related links

### New Type

1. Create folder: `Bimba Library/Types/{Category}/`
2. Copy from `MOC planning/Bimba Type/` templates
3. Rename all files with `{Category}`
4. Update Dataview queries to reference category name
5. Update Pratibimba template `bimba:` field

---

## The Relationship Between Form and Type

Forms and Types interrelate:

- A **Form** may instantiate a **Type** (e.g., [[Idea/Bimba/World/Obsidian]] is a [[Idea/Bimba/World/Base Entity]])
- A **Type** may have many **Form** instances (e.g., many tools are [[Idea/Bimba/World/Base Entity]])
- The `bimba:` field creates this relationship

```
Type: Base Entity
    ↑ bimba:
    ├── Form: Obsidian
    ├── Form: Neo4j
    ├── Form: Claude Code
    └── Form: Kashmir Shaivism
```

**Type provides structure. Form provides substance.**

---

## Summary

| Aspect | Form | Type |
|--------|------|------|
| **Meaning** | Platonic form (the thing) | Form of form (way of defining) |
| **Bimba** | Attributive hub | Category workspace |
| **Pratibimba** | Crystallized synthesis | Instance template |
| **Purpose** | Capture understanding | Enable creation |
| **QL Position** | #5 (Synthesis) | #3 (Pattern) |
| **Location** | `Bimba Library/Forms/` | `Bimba Library/Types/` |

---

## Related

- [[Bimba]] - Original concept
- [[Pratibimba]] - Reflection/instance concept
- [[QL]] - Quaternal Logic framework
- [[epi-hook-system]] - Neo4j synchronization
- [[Dataview]] - Dynamic aggregation

---

*MOC Planning: Paradigm Documentation*
*QL Coordinate: #3*
*Status: FOUNDATIONAL*
