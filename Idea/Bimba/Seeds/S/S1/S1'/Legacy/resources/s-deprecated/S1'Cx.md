---
coordinate: "S1'Cx"
c_4_artifact_role: "category-mapping"
c_1_ct_type: "CT5"
c_0_source_coordinates: ["S1'"]
---

# S1'Cx: C-Level Manifestations at Content API Layer

> **What this is**: How each C-level (C0-C5) manifests when expressed through the S1' Content API - the non-dual data unit for Obsidian

---

## S1.Y' (QL Paradigm) — C# Categories as File System Artifacts

| Y' | Category | QL | Obsidian Manifestation |
|----|----------|-----|------------------------|
| **S1.0'** | C0: Bimba | #0 | `Idea/Bimba/{Domain}/` folder |
| **S1.1'** | C1: Form | #1 | `Name.md` in World/ (synthesis file - complete crystallized concept) |
| **S1.2'** | C2: Entity | #2 | YAML frontmatter with `{family}_{n}_{semantic}` coordinate-driven keys |
| **S1.3'** | C3: Process | #3 | `{Name}.canvas` file (frozen process of entity) |
| **S1.4'** | C4: Type | #4 | World/Types/{Name}/ folder with MOC canvas (type hierarchization) |
| **S1.5'** | C5: Pratibimba | #5 | Ad hoc files in `/thoughts/` + task structure |

---

## Bimba-Pratibimba Structure

```
Idea/Bimba/
├── World/                           # C0 Bimba (canonical source)
│   ├── Base Entity.md               # C1 Form (complete crystallized concept)
│   ├── Obsidian.md
│   ├── [other Forms...]             # All Forms flat in /World (unique names)
│   │
│   └── Types/                       # C4 Type (type hierarchization)
│       ├── Obsidian/
│       │   └── Obsidian.canvas      # MOC canvas (INDEX for Obsidian type)
│       ├── Claude Code/
│       │   └── Claude Code.canvas   # MOC canvas (INDEX for Claude Code type)
│       └── [other Types...]
│           └── {Name}.canvas        # MOC canvas per Type
│
├── Seeds/                           # C0 Bimba (essential type)
└── Map/                             # C0 Bimba (essential type)

/thoughts/                            # C5 Pratibimba (ad hoc files)
├── traces/                          # Position-specific
├── questions/
└── ...

/Empty/Present/{YYYY-MM-DD}/         # Task structure (pratibimba)
├── p0-{id}/                         # Position #0 tasks
│   └── T00x-{name}/                 # Task folders
└── {YYYY-MM-DD}.canvas              # Daily workspace (MOC hub)
```

---

## Key Concepts

### MOC (Map of Content)

**MOC is the canvas file that acts as an INDEX for a given TYPE** - not the folder itself.

- **MOC** = `{Name}.canvas` file in World/Types/{Name}/
- **Purpose**: Visual index showing all entities of that Type
- **Function**: Acts as hub for Type categorization
- **Hierarchization**: The folder organization OF these Types with MOC canvas files allows for type hierarchization

**Example**:
```
World/Types/Obsidian/
└── Obsidian.canvas      # MOC - visual index of all Obsidian-type entities
```

### Type → Neo4j Label Translation

**Folder structure translates to Neo4j labels** for any file created therein.

When a file is created in `World/Types/{Name}/`, it inherits the Type as a Neo4j label, enabling:
- Graph queries by Type
- Label-based filtering
- Type hierarchization in the graph

### Canonical Form Workflow

**Canonical bimba forms are "birthed" in the /Types folder hierarchy, then moved to /World**:

1. **Birth**: Create form in World/Types/{Name}/ (acquires Type label)
2. **Move**: Transfer to World/ (becomes canonical Form)
3. **Forge**: Within /World, all Forms must be uniquely named - this is where relations between Forms are forged

**Within /World**: All Forms must be uniquely named - this is the field where relations between Forms are forged.

---

## C-Level Details

### C0: Bimba (Canonical Source)

**S1.0' Manifestation**: `Idea/Bimba/{Domain}/` folder

- Includes Seeds/ and Map/ as essential types
- Coordinate system is foundational typology
- The canonical reference ground

### C1: Form (The Thing Itself)

**S1.1' Manifestation**: `Name.md` in World/ (synthesis file)

- Complete crystallized concept
- Forms go **directly and flatly in /World** (no subfolders)
- All Forms must be uniquely named
- Relations between Forms are forged in /World

**Note**: /Forms is ERRORNEOUS - Forms are NOT in a subfolder

### C2: Entity (The Atomic Unit)

**S1.2' Manifestation**: YAML frontmatter with `{family}_{n}_{semantic}` coordinate-driven keys

- C-family is default ontological layer: `c_0_source`, `c_1_ct_type`, `c_2_session_id`, `c_3_day_id`, `c_4_artifact_role`, `c_5_reflection_complete`
- Non-C survivors: `t_0_thought_type` (T-domain), `m_4_nara_domain` (M4 subsystem)
- `coordinate` is the ONE special bare key (IS the Bimba ground reference)
- P-family positional arrays: `p0_grounds`, `p1_definitions`, `p2_operations`, `p3_patterns`, `p4_temporals`, `p5_integrations`
- Unknown keys → ERROR (not warn)

### C3: Process (The Flow / Transformation)

**S1.3' Manifestation**: `{Name}.canvas` file

- Entity AS process, frozen in workspace form
- Work here without committing to synthesis
- Template fields IN synthesis file define the processual dimension/directionality

### C4: Type (The Formal Pattern)

**S1.4' Manifestation**: World/Types/{Name}/ folder with MOC canvas

- **MOC canvas** = `{Name}.canvas` acts as INDEX for the Type
- Only Types have subfolders (Forms are flat in /World)
- MOC canvas provides visual index of all entities in that Type
- Enables recontextualization and type hierarchization

**Structure**:
```
World/Types/{Name}/
├── {Name}.canvas        # MOC - canvas acting as INDEX
└── [entities of this type...]
```

### C5: Pratibimba (The Instance / Reflection)

**S1.5' Manifestation**: Ad hoc files in `/thoughts/` + task structure

- Composite of positions per task context
- Represented in/as synthesis file
- Actual form lives in `/thoughts/` and task directories
- Date-time = Anchor for pratibimba
- Links = Ligature to Bimba files

**Bootstrap files** (PASU.md, session state, config.toml) handle runtime context — deprecated CONTEXT.md approach. These operate outside Bimba structure as identity/session bootstraps.

---

## Non-Dual Data Unit

**The Obsidian file** = Content (perception) + Wikilinks (appetite) + Context (situation)

- **Content**: YAML frontmatter + markdown body
- **Links**: `[[wiki-links]]` to related entities
- **Context**: Folder location (Type), position in structure
- **Graph**: Backlinks, unlinked mentions, graph view

This creates a **non-dual data unit** where:
- Entity IS the file
- Process IS the canvas
- Type IS the folder + MOC
- Relation IS the link

---

## Möbius Return: C5 → C0

```
Today's C5 (Pratibimba synthesis)
    ↓
Becomes Tomorrow's C0 (Bimba ground)
    ↓
Which seeds Tomorrow's C1 (Form definition)
```

---

*This file defines how each C-level manifests through the S1' Content API*
*See S1-X' seeds for detailed CT × CT' mappings*
