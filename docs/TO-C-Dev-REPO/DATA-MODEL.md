# Quaternal Logic - Data Ecosystem Architecture

> The 6-layer data model grounded in [[Quaternal Logic]] - the true seed from which all [[Epi-Logos]] subsystem development emerges

## Core Principle

**Each level (0-5) represents both a storage system AND an access pattern/portal** to the system. This is the ground truth from which all subsystem architectures emerge.

---

## The 6-Layer Model

### Level 0: Terminal / System Environment
**Symbol:** Ground Potential

**What it is:**
- The terminal shell and system environment itself
- Infinite potential for what the system can become, do, and know
- The thrown condition - the starting point before differentiation

**Access Pattern:**
- Direct terminal access
- System commands and scripts
- Environment variables and configuration
- The ground from which all other levels emerge

**Related:** `[[Anuttara]]` - The ground from which all potential arises

---

### Level 1: Obsidian (Storage/Property System)
**Symbol:** Material Container

**What it is:**
- Flat file markdown storage
- YAML frontmatter as property system
- Wiki-link based relationships
- Human-readable, version-controllable content

**Access Pattern:**
- Obsidian UI (portal)
- File system access
- Template-driven note creation
- The material repository of all knowledge

**Related:** `[[Paramasiva]]` - Definition/Material - the form-giver

---

### Level 2: Neo4j (Storage/Property System)
**Symbol:** Relational Container

**What it is:**
- Graph database with bolt:// protocol
- **Folder→label namespacing** (Pratibimba instances, Bimba canonical)
- Node properties as storage (frontmatter-driven)
- Typed relationships (POS0_LINKS_TO, POS1_DEFINES, etc.)
- **Bimba Library as canonical resolution source** for empty nodes
- Queryable via Cypher

**Data Sourcing Strategy:**
- **Primary:** Frontmatter YAML (node properties, position arrays)
- **Secondary:** Content body (`content` property for full-text search)
- **Tertiary:** Inline `[[wiki-links]]` (relationship extraction)
- **Resolution:** Bimba Library canonical specs for unresolved references

**Frontmatter vs Content:**
- **Frontmatter:** Structured graph metadata (kanban-level)
  - QL position arrays (`p0_grounds`, `p1_definitions`, etc.)
  - Node properties (`uuid`, `title`, `created`, `type`, `categories`)
  - Categories and types become Neo4j labels
- **Content:** Human-readable substance (#1 material)
  - Main body text stored as `content` property (searchable)
  - Inline `[[wiki-links]]` extracted for relationships
  - Section headers (## #0 through ## #5) NOT mapped to properties
  - Only #5 Quintessence extracted as `description` summary

**Access Pattern:**
- Cypher shell
- Neo4j Browser UI
- Bolt protocol connections
- **Folder→label queries** (Idea/Bimba/Bimba Library/ for canonical, Idea/Pratibimba/ for instances)
- The structural repository of all relationships

**Related:** `[[Parashakti]]` - Operation/Process - the relational engine

**See Also:** `[[NEO4J-CLARIFICATION.md]]` - Complete frontmatter/content relationship guide

---

### Level 3: PAI (Personal AI Infrastructure)
**Symbol:** Structural Integration / Nervous System

**What it is:**
- The **pack system architecture** - skills, hooks, commands, agents
- Engineering approach and fundamental patterns
- Working in Claude Code environment
- The **foundational infrastructure** from which Epi-Logos emerges
- **Link integration**: Obsidian `[[wiki-style]]` ↔ Neo4j relationships
- Bidirectional sync via `[[epi-hook-system]]`
- Multi-system parity maintained

**Access Pattern:**
- Pack installation and management
- Skill composition and invocation
- Hook automation (sync changes)
- The **nervous system** connecting all layers

**What PAI Contains:**
- Skills (ground composables, crystallized capabilities)
- Hooks (event-driven automation)
- Commands (slash command invocations)
- Agents (subagent definitions)
- Templates (canonical structure patterns)
- The engineering approach to agent-human collaboration

**Related:** `[[Mahamaya]]` - Pattern/Form - the symbolic weaver

**Note:** PAI is the **basis** from which Epi-Logos emerges. It provides the structural patterns and infrastructure that enable the entire system.

---

### Level 4: Claude Code (Event System + Runtime Context)
**Symbol:** Agentic Integration

**What it is:**
- Event-driven automation via hooks
- Runtime agentic context (Position #4)
- Token stream and action chaining
- Plugin system that nests full 0-5
- **The nesting point** where Claude instantiates itself across all other layers

**Access Pattern:**
- Claude Code CLI (primary portal)
- Agent spawning and orchestration
- Plugin invocation
- The active intelligence layer

**Related:** `[[Nara]]` - Context/Dialog - the interface layer

---

#### Level 4 Deep Structure: Three Nested Models

Position #4 (Claude Code) contains **three distinct nested structures**, each at a different level of abstraction:

##### A. The Plugin Equation (Claude's Foundational Anatomy)

The material structure of what Claude Code IS - its QL-aligned anatomy:

```
plugin = models + prompts + hooks + commands + resources + agents/subagents + skills
```

| Element | QL Position | Description |
|---------|-------------|-------------|
| **models** | #0 | Ground potential - which model responds |
| **prompts** | #1 | Material/definition - the content substance |
| **hooks** | #2 | Operational triggers - event-driven automation |
| **commands** | #3 | Structural patterns - slash command invocations |
| **resources** | #3 | Resource bundle (code, templates, mcp) - pattern tooling |
| **agents/subagents** | #4 | Context spawning - nesting point instantiation |
| **skills** | #5 | Ground composables - crystallized capabilities (5→0 return) |

**Note:** Resources (commands, code, templates, mcp) nest at #3 as pattern/form tooling. Agents/subagents at #4 and skills at #5 complete the recursive structure. Skills as #5 represent crystallized capabilities that return to ground (#0) for the next cycle.

See `[[Epi-Plugin-Template]]` for complete plugin specification.

##### B. Environmental Instantiation (4.0/1-4.4/5)

Claude Code **instantiates itself across the data ecosystem** at each sub-position. This is the holographic principle in action - Claude at #4 mirrors the full 0-5 system by existing at each layer:

| Sub-Position | Environment                         | Access Pattern                                 | Description                                                                                 |
| ------------ | ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **4.0**      | Terminal                            | Direct shell                                   | Claude in terminal (ground access)                                                          |
| **4.1**      | Obsidian                            | Terminal plugin                                | Claude operating within Obsidian vault                                                      |
| **4.2**      | Neo4j -> GraphRAG                   | Semantic access                                | Claude via graph-based retrieval augmentation                                               |
| **4.3**      | PAI System                          | Nervous system                                 | The algorithm and core bundles opening Claude into general system infrastructure            |
| **4.4**      | Nesting Point (Nesting within Task) | Subagent spawning or External Agent invocation | Claude spawning instances of itself (subagents, external commands, Obsidian Shell Commands) |
| **4.5**      | Notion                              | Crystallization flows                          | Claude integrating for synthesis and self-improvement (5→0 return)                          |

**Critical insight:** 4.3 ([[PAI System]]) is the **nervous system** - the algorithm and core bundles (skills, hooks, commands, agents) that open Claude Code out into the general system infrastructure. Everything else is built atop this foundation. 4.4 is the **nesting point** - where Claude spawns instances of itself. This enables recursive self-instantiation across the entire stack.

##### C. The Cognitive Loop (Algorithm at 4.4)

The processing algorithm that operates at the nesting point (4.4) and recurses across all instantiations:

```
OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY/LEARN
   ↑                                            │
   └────────────────────────────────────────────┘
                    (5→0 return)
```

| Step | Maps To | Verb | Description |
|------|---------|------|-------------|
| **4.4.0** | #0 | OBSERVE | Accept thrown condition (in quantum) |
| **4.4.1** | #1 | THINK | Identify the What (material focus) |
| **4.4.2** | #2 | PLAN | Select How (tools, methods) |
| **4.4.3** | #3 | BUILD | Structure Which/Who (pattern, form) |
| **4.4.4** | #4 | EXECUTE | Generate in context (where/when) |
| **4.4.5** | #5 | VERIFY/LEARN | Confirm (.) or Transform (?) - synthesis returns to ground |

**The 5→0 Return:** VERIFY/LEARN is not terminal - the synthesis becomes new ground for the next cycle. This Möbius return is what aligns PAI algorithms with QL's recursive flexibility. See `[[ql-5-to-0-return]]`.

[[12-Fold Klein Traversal]] applies here! 

See `[[frame-4.0-4.4-5]]` for complete context frame specification.

---

### Level 5: Notion (Database + Database Viewer)
**Symbol:** Synthetic View / Crystallization

**What it is:**
- Database properties and structured data
- **Database Viewer** - peak tool for taking views upon data
- Multiple perspective dashboards
- **Crystallization point** for synthesized outputs and self-improvement flows
- Not just content creation but **productive synthesis toward self-improvement**

**Critical Interaction (5 ↔ 0):**
- **Notion (5) triggers deterministic flows in System Environment (0)**
- Logos cycle invocation
- Know-thyself protocol (self-learning)
- System-wide orchestration triggers
- **5→0 Return:** Crystallized outputs become new ground for next cycle

**Access Pattern:**
- Notion UI (database views)
- API integration
- Dashboard interactions
- The synthesis and crystallization layer

**Crystallization Flows:**
- Synthesis of research and insights into actionable outputs
- Self-improvement loop: outputs inform next cycle's ground
- Production of shareable artifacts (content, documentation, plans)
- Integration point where scattered work becomes unified knowledge

**Related:** `[[Epii]]` - Integration/Synthesis - the crystallizer

---

### Top Layer (∞): Quaternal Logic
**Symbol:** The Nested Formalism

**What it is:**
- The **meta-pattern** that runs through ALL levels (0-5)
- Not a peer layer but the **nesting formalism** itself
- Every level implements its own 0-5 cycle internally
- The holographic principle made structural

**Key Insight:**
- QL is not "Level 6" - it is **the pattern itself**
- Each of Levels 0-5 internally recapitulates the full 0-5 structure
- This creates fractal, holographic coherence across the system
- QL is BOTH the static positions (data models) AND dynamic flow (agents)

**What QL Provides:**
- 6-position framework (#0-#5) for organizing everything
- Static mode: Positions as containers (templates, data models)
- Dynamic mode: Positions as phases with Möbius return (5→0)
- Holographic principle: Every component implements full cycle
- Recursive nesting: Meta → Meso → Micro scales

**Access Pattern:**
- Not accessed directly but **expressed through** all other levels
- Every layer, every file, every process embodies QL
- The water in which all fish swim

**Related:** `[[Quaternal Logic]]` - The foundational paradigm

**Critical:** QL as top layer means:
- Don't create a "QL folder" as peer to Terminal/Obsidian/etc.
- Instead, each layer folder contains its own 0-5 structure
- QL documentation lives at Bimba Seed root (this file) as the seed from which all emerges

---

## Access Patterns as Portals

**Key Insight:** Each level represents not just storage, but **portals to experience, engagement, or invocation**.

| Level | Portal | Touch Point | Experience |
|-------|--------|-------------|------------|
| **0** | Terminal | Shell commands | Direct system control |
| **1** | Obsidian UI | File editor | Material creation |
| **2** | Cypher Shell | Graph queries | Relational insight |
| **3** | PAI System | Pack commands | Structural infrastructure |
| **4** | Claude Code | Agent interaction | Intelligent orchestration |
| **5** | Notion Views | Dashboard panels | Synthetic overview |
| **∞** | QL | Embedded everywhere | The pattern itself |

### Compound Access Patterns

**0/1 Portal:** Terminal and Obsidian as dual access points to Claude
- Direct file editing
- Template invocation
- System + Material integration

**4/5 Integration:** Claude Code + Notion as the operating pair
- 4 (Claude) processes and orchestrates
- 5 (Notion) views and synthesizes
- Together they trigger 0 (System) flows

---

## Context Frame Pattern

**Each level has associated context frames** that denote access patterns:

| Frame | Pattern | Meaning |
|-------|---------|---------|
| `0000` | Terminal access | System-level invocation |
| `0/1` | Terminal + Obsidian | Material creation portal |
| `4.0-4.4-5` | Nested 0-5 in #4 | Plugin integration |
| `5-0` | Notion → System | Logos cycle trigger |

See `[[Context-Frames]]` for complete mapping.

---

## Implications for Subsystem Development

**Each subsystem (#0-#5) maps to its level:**

| Subsystem | Level | Primary Domain | Access Pattern |
|-----------|-------|----------------|----------------|
| **#0 Anuttara** | 0 | System/Environment | Terminal invocation |
| **#1 Paramasiva** | 1 | Definition/Material | Obsidian storage |
| **#2 Parashakti** | 2 | Operation/Process | Neo4j relationships |
| **#3 Mahamaya** | 3 | Pattern/Form | PAI infrastructure |
| **#4 Nara** | 4 | Context/Dialog | Claude Code orchestration |
| **#5 Epii** | 5 | Integration/Synthesis | Notion views + System triggers |
| **∞ QL** | ∞ | Meta-pattern | Expressed through all levels |

**Subsystem specialization:** Each subsystem gets subagents designed for its level's storage, access patterns, and portal experiences.

---

## Graph Namespace Strategy

### Folder→Label Namespacing

The Neo4j graph uses **folder-based label namespacing** to organize nodes:

| Namespace | Folder Path | Purpose | Data Type | Access Pattern |
|-----------|-------------|---------|-----------|----------------|
| **Bimba** | `Idea/Bimba/` | Universal archetypes | Canonical, timeless | Read-heavy, reference |
| **Pratibimba** | `Idea/Pratibimba/` | User instances | Personal, dynamic | Write-heavy, instances |

### Bimba Library as Canonical Source

`[[Bimba Library]]/` serves as the **canonical catalog** for the Bimba namespace:

- Every kanban = ONE canonical archetype node
- Defines universal properties for that entity type
- Provides resolution target for empty nodes
- Cross-archetype relationships (entity type patterns)

### Instance-Canonical Pattern

```
Bimba Namespace (Canonical)
├── (Claude Code:Bimba:Canonical)
│   └─ source: Bimba Library/Claude Code.md
│       └─ [:DEFINES_POSITION] → #0, #1, #2, #3, #4, #5
│
└── Pratibimba Namespace (Instances)
    ├── (CC-Hooks:Note:Instance)
    │   └─ [:INSTANTIATES] → (Claude Code:Bimba:Canonical)
    ├── (CC-Agents:Note:Instance)
    │   └─ [:INSTANTIATES] → (Claude Code:Bimba:Canonical)
    └── (CC-Workflows:Note:Instance)
        └─ [:INSTANTIATES] → (Claude Code:Bimba:Canonical)
```

### Empty Node Resolution Pathway

When `[[wiki-links]]` reference non-existent files:

1. Query Pratibimba namespace (local instances)
2. If not found, query Bimba namespace (canonical specs)
3. Create `[:REFERENCES_CANONICAL]` relationship if found
4. Create placeholder node if not found
5. Enable gradual graph completion through usage

**See `[[NEO4J-CLARIFICATION.md]]`** for complete resolution algorithm.

---

---

## Seeds-as-Architecture Principle

**The Bimba Seed folder structure IS the architectural specification** for the entire Epi-Logos data ecosystem. Each layer folder encodes both:

1. **Storage system** - Where data lives (Terminal, Obsidian, Neo4j, Links, ClaudeCode, Notion)
2. **QL position framework** - How that layer processes information (0-ground through 5-integration)

### Folder Structure as Architecture

```
Bimba Seed/
├── Terminal/          # Level 0: System Environment
│   └── legacy/        # QL subfolders deprecated here
├── Obsidian/          # Level 1: Material Storage
│   └── legacy/
├── Neo4j/             # Level 2: Graph Database
│   └── legacy/
├── PAI/               # Level 3: Personal AI Infrastructure
│   └── legacy/
├── Claude Code/       # Level 4: Event System
│   ├── legacy/
│   └── templates/     # Canonical templates live here
├── Notion/            # Level 5: Synthetic Views
│   └── legacy/
├── Quaternal Logic/   # Top Layer (∞): The Nested Formalism
│   ├── DATA-MODEL.md  # This file - the true seed
│   └── legacy/
└── INDEX.md           # Layer navigation
```

**Note on legacy/ folders:** Previous QL subfolders (0-ground/ through 5-integration/) within each Seed have been deprecated to legacy/. The QL structure is now expressed through each layer's content, not nested subfolders.

**Key insight:** The folder structure itself provides:
- **Ground truth** - What lives at each layer (by folder contents)
- **Position alignment** - How each layer processes (by subfolder structure)
- **Cross-reference** - Links between layers (via wiki-links and INDEX.md files)
- **Extensibility** - Clear locations for future specifications (empty subfolders await content)

### Architectural Implications

When developing subsystems or packs:
1. **Check the layer** - Which storage system does this component affect?
2. **Check the position** - What type of processing does this involve?
3. **Follow the structure** - Place specifications in the corresponding layer/position folder
4. **Reference the seed** - Each layer's INDEX.md provides overview and navigation

This structure ensures **holographic coherence** - the local folder structure mirrors the global system architecture.

---

## Empty Workspace Architecture

The `[[Idea/Empty/]]` folder serves as the **active development workspace** with temporal grounding:

### Structure

```
Idea/Empty/
└── Daily/                    # ONLY permanent folder - temporal boundary
    ├── 2026-01-12.md         # Active daily note
    └── ...                   # Temporal chain

{Forms and working files live flat in Empty/}
{Types/ can be ingressed temporarily for context}
```

### Key Principles

1. **Daily/ as Temporal Boundary**: The only permanent folder provides bounded freedom
2. **Time as Primary Tracker**: Files get UUID+datetime, linked to daily context
3. **Inbox Landing Zone**: Files created without formatting pressure appear in MOC/Bimba Dataview inboxes
4. **Whitehead Ingress**: Types/Forms can be temporarily pulled in as folders to construct context
5. **Empty → Structure Flow**: Files tend toward categorization organically

### File Approach

Every file in Empty/ gets temporal grounding:

```yaml
---
uuid: "{{date}}-{{time}}-{{random}}"
created: {{date}}
daily_context: "[[Daily/{{date}}]]"
---
```

### Neo4j Label Implications

- Files in Empty/ (flat) get `Form` label by default
- Files within ingressed Types/{TypeName}/ get that type as label
- Nested types create compound labels: `DataModel:ClaudeCode`
- `bimba:` frontmatter field provides explicit type relationship regardless of location

See `[[PLANNING-SYNTHESIS.md]]` Part 14 and Part 16 for complete Empty workspace specification.

---

## Form/Type Paradigm

### Philosophical Foundation

| Concept | Meaning | What It Represents |
|---------|---------|-------------------|
| **Form** | The Platonic form | An entity, concept, or thing itself (particular) |
| **Type** | The form of form | A way of defining entities (universal pattern) |

### Bimba/Pratibimba Pairing

**Both Form and Type have Bimba/Pratibimba structure:**

| Component | Nature | Function |
|-----------|--------|----------|
| **Bimba** (Canvas) | Implicate | Open, attributive, collecting - the "backend" |
| **Pratibimba** (Markdown) | Explicate | Crystallized, structured - the "frontend" |

### File Structure

```
FORM (e.g., "Obsidian")
├── Bimba-Obsidian.canvas    → Attributive hub (related links, notes)
└── Obsidian.md              → Crystallized SYNTHESIS of the concept

TYPE (e.g., "Base Entity")
├── Bimba-Base Entity.canvas → Category hub (Position views, Dataview)
└── Pratibimba-Base Entity.md → Instance TEMPLATE for creation
```

### Key Distinction

- **Form Pratibimba IS the thing** - complete understanding crystallized
- **Type Pratibimba CREATES things** - pattern for instances

See `[[MOC-Bimba-Paradigm]]` for complete Form/Type specification.

---

## Canvas Template Specifications (Locked)

### Bimba Form Canvas Template

**Purpose:** Attributive hub for a particular entity (Form = the thing itself)

**Required Nodes:**

| Node ID | Type | Content | Color |
|---------|------|---------|-------|
| `title` | text | `# Bimba-{Topic}` header with description | - |
| `open-space` | text | Freeform workspace | 5 (yellow) |
| `notes` | text | Notes & Additions, To Add checklist | - |
| `links` | text | Related Entities (Primary/Secondary/Resources) | - |
| `pratibimba` | file | Embedded `Pratibimba-{Topic}.md` | - |

**Required Edges:**
- `pratibimba → links` labeled "Synthesizes"

**Template Location:** `MOC planning/Bimba Form/Bimba-Form-Template.canvas`

### Bimba Type Canvas Template

**Purpose:** Category hub for an entity type (Type = pattern for instances)

**Required Nodes:**

| Node ID | Type | Content | Color |
|---------|------|---------|-------|
| `hub-center` | text | `# Bimba-{Category}` with bimba link instruction | - |
| `open-space` | text | Freeform workspace | 5 (yellow) |
| `p0-queue` | text | Quick capture queue | 5 (yellow) |
| `pos0-ground` | file | Position #0 Dataview | - |
| `pos1-definition` | file | Position #1 Dataview | - |
| `pos2-operation` | file | Position #2 Dataview | - |
| `pos3-pattern` | file | Position #3 Dataview | - |
| `pos4-context` | file | Position #4 Dataview | - |
| `pos5-synthesis` | file | Position #5 Dataview | - |
| `pratibimba-template` | file | Embedded instance template | - |

**Required Edges (color-coded):**
- `hub-center → pos0-ground` (#ffffff) labeled "#0"
- `hub-center → pos1-definition` (#248bf9) labeled "#1"
- `hub-center → pos2-operation` (1 = red) labeled "#2"
- `hub-center → pos3-pattern` (4 = green) labeled "#3"
- `hub-center → pos4-context` (3 = yellow) labeled "#4"
- `hub-center → pos5-synthesis` (#7d25ad) labeled "#5"
- `open-space → pratibimba-template` labeled "Template"

**Template Location:** `MOC planning/Bimba Type/Bimba-Type-Template.canvas`

### Canvas Creation Rules

1. **Forms**: Copy `Bimba-Form-Template.canvas`, replace `{Topic}` with entity name
2. **Types**: Copy `Bimba-Type-Template.canvas`, replace `{Category}` with type name
3. **Open Space**: Always present, color 5 (yellow), for freeform notes
4. **Pratibimba Embed**: The markdown file is embedded in the canvas for unified view
5. **Position Dataviews**: For Types, embed markdown files with Dataview queries per position

---

## Related

- `[[INDEX]]` - Complete layer navigation and file listings
- `[[Bimba-Seed-INDEX]]` - All seed files (legacy reference)
- `[[Context-Frames]]` - Access pattern notation
- `[[epi-quaternal-logic]]` - Context frame system
- `[[Subsystem-Data-Model]]` - Subsystem-specific mapping
- `[[NEO4J-CLARIFICATION.md]]` - Frontmatter vs content relationship guide
- `[[MOC-Bimba-Paradigm]]` - Form/Type paradigm documentation
- `[[PLANNING-SYNTHESIS.md]]` - epi-dev-skill planning synthesis
- `[[epi-daily-flow]]` - Temporal infrastructure pack
- `[[Idea/Empty]]` - Active development workspace

---

*Quaternal Logic: Data Model*
*QL Coordinate: #*
*Status: FOUNDATIONAL*
*Location: Bimba Seed/Quaternal Logic/ (the true seed)*
*Updated: 2026-01-12*
