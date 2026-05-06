---
name: world
description: >
  Manage Forms, Types, MOC canvases, and entity placement in
  /Idea/Bimba/World/. Create and edit crystallised Forms (flat .md),
  Type folders with MOC canvas indexes, and entities within the
  Types/ coordinate hierarchy and Entities/ concept space.
---

# Bimba Vault: World Management

## Scope

All operations within:
```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/World/
```

## The Architecture

### Two zones in /World

**Zone 1: `/World/*.md` — Canonical Forms (flat)**
Crystallised synthesis files. One concept = one uniquely-named `.md` file.
NO subfolders for Forms. `/Forms/` is ERRONEOUS.

**Zone 2: `/World/Types/` — The working hierarchy**
Where entities are born, worked on, and organised before graduation.
Contains both the coordinate system AND concept-level entities.

### Full Types/ Hierarchy

```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/World/Types/
├── Types.canvas                          # MASTER MOC — entry point for entire system
│
├── Coordinates/                          # The coordinate system in filesystem form
│   ├── Root/
│   │   └── #/                            # The Inversion Act
│   ├── Psychoids/
│   │   ├── #0/ #1/ #2/ #3/ #4/ #5/      # Raw archetypes
│   │
│   ├── C/                                # Category family
│   │   ├── C.canvas                      # Family-level MOC
│   │   ├── C0/                           # Ground/Source
│   │   │   └── C0.canvas                 # Coordinate MOC (indexes entities AT this coord)
│   │   ├── C1/ C2/ C3/ C4/ C5/
│   │   └── C'/                           # Inverted C layer
│   │       ├── C'.canvas
│   │       ├── C0'/ C1'/ C2'/ C3'/ C4'/ C5'/
│   │       ├── CPF/                      # Category-Position-Frame
│   │       │   └── CPF.canvas
│   │       ├── CT/                       # Content Types
│   │       │   ├── CT.canvas
│   │       │   ├── CT0/                  # Seed template type
│   │       │   │   ├── CT0.canvas
│   │       │   │   └── Seed/             # Nested type WITHIN CT0
│   │       │   ├── CT1/
│   │       │   │   └── Prompt/
│   │       │   ├── CT2/
│   │       │   │   └── Task-Spec/
│   │       │   ├── CT3/
│   │       │   │   └── Pattern-Note/
│   │       │   ├── CT4a/
│   │       │   │   └── Integration-Preview/
│   │       │   ├── CT4b/
│   │       │   │   ├── Daily-Note/
│   │       │   │   └── NOW/
│   │       │   └── CT5/
│   │       │       └── Thought/
│   │       ├── CP/                       # Context-Position
│   │       ├── CF/                       # Context-Frame
│   │       │   ├── CF_VOID/ CF_BINARY/ CF_TRIKA/ CF_QUATERNAL/
│   │       │   ├── CF_FRACTAL/ CF_SYNTHESIS/ CF_MOBIUS/
│   │       ├── CFP/                      # Context-Frame-Position
│   │       └── CS/                       # Context-Sequence
│   │
│   ├── P/                                # Position family
│   │   ├── P.canvas
│   │   ├── P0/ P1/ P2/ P3/ P4/ P5/
│   │   └── P'/
│   │       └── P0'/ P1'/ P2'/ P3'/ P4'/ P5'/
│   │
│   ├── S/                                # Stack family
│   │   ├── S.canvas
│   │   ├── S0/ S1/ S2/ S3/ S4/ S5/      # Each has sub-coordinates
│   │   │   ├── S0/
│   │   │   │   ├── S0.canvas
│   │   │   │   ├── S0-0/ S0-1/ S0-2/ S0-3/ S0-4/ S0-5/  # Sub-coordinates
│   │   │   └── ...
│   │   └── S'/
│   │       ├── S0'/ S1'/ S2'/ S3'/ S4'/ S5'/
│   │       │   ├── S3'/                  # Infrastructure plugins
│   │       │   │   ├── S3-0'/            # Khora
│   │       │   │   ├── S3-1'/            # Hen
│   │       │   │   ├── S3-2'/            # Pleroma
│   │       │   │   ├── S3-3'/            # Chronos
│   │       │   │   ├── S3-4'/            # Anima
│   │       │   │   └── S3-5'/            # Aletheia
│   │       │   └── ...
│   │       └── S'Cx/                     # C-level manifestations per layer
│   │
│   ├── T/                                # Thought family
│   │   ├── T.canvas
│   │   ├── T0/ T1/ T2/ T3/ T4/ T5/
│   │   └── T'/
│   │       └── T0'/ T1'/ T2'/ T3'/ T4'/ T5'/
│   │
│   ├── L/                                # Lens family
│   │   ├── L.canvas
│   │   ├── L0/ L1/ L2/ L3/ L4/ L5/      # Each has sub-lenses
│   │   │   ├── L0/
│   │   │   │   ├── L0.canvas
│   │   │   │   ├── L0-0/ L0-1/ L0-2/ L0-3/ L0-4/ L0-5/
│   │   │   └── ...
│   │   └── L'/
│   │       └── L0'/ L1'/ L2'/ L3'/ L4'/ L5'/
│   │           ├── L0'/
│   │           │   ├── L0-0'/ L0-1'/ L0-2'/ L0-3'/ L0-4'/ L0-5'/
│   │           └── ...
│   │
│   └── M/                                # Subsystem family
│       ├── M.canvas
│       ├── M0/ M1/ M2/ M3/ M4/ M5/
│       └── M'/
│           └── M0'/ M1'/ M2'/ M3'/ M4'/ M5'/
│
└── Entities/                             # Concept-level entities (natural language)
    ├── Entities.canvas                   # MOC for all entities
    ├── PI Agent/
    │   ├── PI Agent.canvas               # MOC for this concept
    │   └── [working .md files]
    ├── Oracle System/
    ├── Cosmic Clock/
    ├── Vault Architecture/
    └── [other concepts...]
```

The hierarchy is **fractal** — coordinates can nest arbitrarily deep
(L0 → L0-0 → L0-0' etc.). Each level CAN have its own `.canvas` MOC
and `.md` entity files within it.

### C-Level → Artifact Rules

| C-Level | Artifact | What it IS |
|---------|----------|-----------|
| **C0 Bimba** | Folder | `Idea/Bimba/{Domain}/` — the folder IS the ground |
| **C1 Form** | `.md` flat in `/World` | Crystallised synthesis. One concept = one file. Unique names. |
| **C2 Entity** | YAML frontmatter | `{family}_{n}_{semantic}` or `{family}_{n}_{i}_{semantic}` keys |
| **C3 Process** | `.canvas` file | Entity-as-process, frozen workspace |
| **C4 Type** | Folder + `.canvas` MOC | `Types/{Name}/` with `{Name}.canvas` inside as INDEX |
| **C5 Pratibimba** | Ad hoc files in Pratibimba dirs | Date-anchored, wikilinked back to Bimba |

---

## The Workflow: Types/ → /World

Work happens in Types/. Graduation to /World is the final step.

### Step 1: Place in Types/

Determine where the entity belongs:
- **Is it a coordinate concept?** → `Types/Coordinates/{Family}/{Coord}/`
  - e.g., PI Agent architecture → `Types/Coordinates/S/S4/`
  - e.g., Monadological mapping → `Types/Coordinates/S/S'/S1'/`
- **Is it a natural-language concept?** → `Types/Entities/{ConceptName}/`
  - e.g., "PI Agent" as a concept → `Types/Entities/PI Agent/`

### Step 2: Create folder + canvas + .md together

In the chosen Types/ location, create:
1. **Folder** (if needed): `Types/Entities/PI Agent/`
2. **MOC canvas**: `Types/Entities/PI Agent/PI Agent.canvas`
3. **Working .md**: `Types/Entities/PI Agent/PI Agent.md` (or coordinate-named)

The .md and .canvas live TOGETHER in the Type folder during development.
The canvas is the process workspace. The .md is the emerging synthesis.

### Step 3: Work in Types/

Edit, refine, link. The .md accumulates content. The .canvas maps relationships.
Wikilinks connect to coordinates (`[[S4]]`, `[[S4']]`, `[[Anima]]`).

### Step 4: Graduate .md to /World

When the .md is crystallised (complete synthesis, all positions covered):
1. Move the `.md` from `Types/{path}/` to `/World/` flat
2. Validate unique name in `/World`
3. The `.canvas` STAYS in Types/ (it's the MOC index)
4. Update any wikilinks in other files that referenced the old path

---

## MOC System

### What is a MOC?

**MOC = `{Name}.canvas` file INSIDE a folder.** It is the INDEX for that folder's contents. NOT the folder itself.

### MOC Hierarchy

```
Types/Types.canvas                    → Master index (links to all below)
  ├── Coordinates/C/C.canvas          → C-family index
  │     ├── C0/C0.canvas              → C0 coordinate index
  │     └── C'/CT/CT.canvas           → Content Types index
  ├── Coordinates/S/S.canvas          → S-family index
  │     └── S'/S3'/S3'.canvas         → Infrastructure plugins index
  ├── Coordinates/L/L.canvas          → L-family index
  │     └── L0/L0.canvas              → L0 sub-lenses index
  ├── Coordinates/M/M.canvas          → M-family index
  └── Entities/Entities.canvas        → All concept entities index
        ├── PI Agent/PI Agent.canvas
        └── Oracle System/Oracle System.canvas
```

### Canvas File Format

```json
{
  "nodes": [
    {
      "id": "title",
      "type": "text",
      "text": "# {Name}\n\nMOC Index for [[{Name}]]",
      "x": 0, "y": 0, "width": 400, "height": 200
    },
    {
      "id": "entity1",
      "type": "file",
      "file": "Bimba/World/{Entity1}.md",
      "x": 0, "y": 250, "width": 400, "height": 100
    }
  ],
  "edges": []
}
```

---

## Frontmatter Key Law

### Format

```
{family}_{n}_{semantic}             # base coordinate key
{family}_{n}_{i}_{semantic}         # inverted coordinate key
{family}_{n}_{sub_n}_{semantic}     # sub-coordinate key
```

### Bare special key

- `coordinate:` — the ONE key without family prefix. IS the Bimba ground reference.

### All six families can appear

| Family | Prefix | Example keys |
|--------|--------|-------------|
| **Category** | `c_` | `c_0_source_coordinates`, `c_1_ct_type`, `c_2_session_id`, `c_3_day_id`, `c_3_created_at`, `c_3_ctx_frame`, `c_4_artifact_role`, `c_5_reflection_complete` |
| **Position** | `p{n}_` | `p0_grounds`, `p0_adjacencies`, `p1_definitions`, `p1_materials`, `p2_operations`, `p2_skills`, `p3_patterns`, `p3_archetypes`, `p3_symbols`, `p4_temporals`, `p4_spatials`, `p4_culturals`, `p5_integrations`, `p5_crystallizations` |
| **Stack** | `s_` | `s_0_data_layer`, `s_1_vault_path`, `s_2_graph_node`, `s_3_plugin`, `s_4_session`, `s_4_i_infrastructure` |
| **Thought** | `t_` | `t_0_thought_type`, `t_0_thought_mode`, `t_3_patterns`, `t_5_insight` |
| **Subsystem** | `m_` | `m_0_anuttara`, `m_3_subsystem`, `m_4_nara_domain` |
| **Lens** | `l_` | `l_0_lens`, `l_2_epistemic_operator`, `l_5_holistic` |

### Inversion in frontmatter

`{family}_{n}_{i}_{semantic}` — the `i` marks inversion:

```yaml
s_4_stack_layer: "claude-code"          # S4 base
s_4_i_infrastructure: "[[S3']]"         # S4' inverted (operational instance)
```

### Sub-coordinates

```yaml
c_0_1_languification: "..."             # sub-number within position
m_3_2_pairing_matrix: "..."
```

### Unknown keys → ERROR. Not warn.

---

## Frontmatter Examples

```yaml
---
# Entity describing PI Agent system (lives in Types/Entities/PI Agent/)
coordinate: "S4"
c_4_artifact_role: "definition"
c_1_ct_type: "CT5"
c_3_created_at: "2026-04-10T14:30:00Z"
c_0_source_coordinates: ["[[S4']]", "[[S4'Cx]]"]
s_4_stack_layer: "claude-code"
s_4_i_infrastructure: "[[S3']]"
m_4_nara_domain: "agent"
p0_grounds:
  - "[[S3']]"
  - "[[Khora]]"
p1_definitions:
  - "Agentic context layer"
p3_patterns:
  - "[[Constitutional Agents]]"
  - "[[VAK Language]]"
p5_integrations:
  - "[[S5]]"
---
```

```yaml
---
# Lens definition (lives in Types/Coordinates/L/L2/)
coordinate: "L2"
c_4_artifact_role: "definition"
c_1_ct_type: "CT5"
l_2_lens_mode: "structural"
l_2_epistemic_operator: "decomposition"
p0_grounds:
  - "[[L1]]"
  - "[[L3]]"
p1_definitions:
  - "Breaking down, examining parts"
---
```

---

## Operations

### 1. Navigate Hierarchy

Before placing ANY new content, the agent MUST:
1. Check if a relevant Type folder already exists in the hierarchy
2. Check if the concept has existing coordinate links
3. Determine: coordinate-level (→ Coordinates/) or concept-level (→ Entities/)
4. Consult the fractal depth — S3' has S3-0' through S3-5' within it, etc.
5. Create the Type folder + MOC canvas if needed

### 2. Create Entity in Types/

Create folder + canvas + .md together in the correct Types/ location.

### 3. Graduate to Form

Move crystallised .md from Types/ to /World flat. Canvas stays.

### 4. Update Form

Edit existing Form in `/World/`. Must preserve coordinate, must validate frontmatter.

### 5. Manage MOCs

Create/update canvas files at any level of the hierarchy.
Master MOC (`Types/Types.canvas`) must link to all family-level MOCs.

---

## Wikilink Law

- ALL entity references MUST use `[[wikilink]]` syntax
- Forms in /World link to source: `c_0_source_coordinates: ["[[S4]]", "[[S4']]"]`
- Entities in Types/ link to parent concept and relevant coordinates
- Structural breadcrumbs where applicable

---

## CTx Template Selection

| Template | Context Frame | Positions | Use For |
|----------|--------------|-----------|---------|
| **CT0** | CF(00/00) | #0 only | Seed, FLOW — receptive ground |
| **CT1** | CF(0/1) | #0, #1 | Prompt — question + material |
| **CT2** | CF(0/1/2) | #0, #1, #2 | Task-Spec — + analysis |
| **CT3** | CF(0/1/2/3) | #0, #1, #2, #3 | Pattern-Note — + pattern |
| **CT4a** | CF(4.5/0) | #4, #5, #0 | Integration-Preview — Mobius triadic |
| **CT4b** | CF(4.0/1-4.4/5) | #4.0-#4.5 fractal | Daily-Note, NOW — fractal parent |
| **CT5** | CF(5/0) | #5, #0 | Thought, full synthesis — Mobius return |

Most Forms and definitions use **CT5** (full synthesis with Mobius return).
Seeds use **CT4a** (integration preview).
