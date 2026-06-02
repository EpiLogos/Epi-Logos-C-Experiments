---
type: skill
name: epi-knowing
description: "Coordinate system self-knowledge via epi core knowing — USE when inspecting, understanding, or navigating QL coordinates during development"
proactive: true
triggers:
  - coordinate lookup
  - understanding coordinates
  - what is M0
  - what does S3 do
  - system self-knowledge
  - quintessential view
  - navigating the coordinate system
  - before modifying M-branch code
  - architectural context for any coordinate
---

# epi core knowing — Coordinate Self-Knowledge

> The system knows itself. Every coordinate resolves as a lightweight dossier: canonical quintessence plus live graph, KBase, notebook, and snapshot facets. Use this before, during, and after development work to ground actions in the coordinate system.

## Quick Reference

```bash
# Family coordinates (base + inverted)
epi core knowing M0              # Human-readable CT5 5/0 output
epi core knowing M0'             # Inverted phase (also: M0i)
epi core knowing S4'             # S4' routes to branch #5-4 (agent rosters)

# Raw psychoids (Layer 1 .rodata)
epi core knowing '#0'            # Raw archetype — Ground
epi core knowing '#'             # The inversion operator itself

# Context frames (Layer 3 () operator)
epi core knowing 'CF(012)'       # The Trika — User, Agent, Code
epi core knowing 'CF(50)'        # Mobius return — total synthesis

# Weave interleaves
epi core knowing W0.5            # Ground reaching toward Instance

# Sub-branch coordinates (any depth, from datasets)
epi core knowing M2-1            # #2-1 MEF Meta-Logikon (shows children)
epi core knowing '#4.4.3'        # Jungian Depth Psychology (Lemniscate nesting)
epi core knowing '#0-4.0/1'      # Non-dual fusion within Anuttara
epi core knowing '#1-3-4.(0000)' # CF void frame nesting (normalized)

# Discovery — list all coords in a family
epi core knowing --family M      # Lists M0-M5 + M0'-M5' (12 coords)
epi core knowing --family '#'    # Lists #0-#5 + # operator
epi core knowing --family CF     # Lists all 7 context frame roots
epi core knowing --family W      # Lists all 4 weave interleaves

# JSON for agents
epi core knowing S3 --json       # Structured JSON output

# Dossier actions
epi core knowing M4 --project early-epi   # Scope KBase lookup to a project
epi core knowing M4 --refresh             # Refresh live snapshot cache
epi core knowing M4 --glow 1              # Preview first markdown KBase hit
epi core knowing M4 --open 1              # Open first KBase hit
epi core knowing M4 --tui                 # Open ratatui dossier browser
```

## Coordinate Syntax

**Family coordinates:** `<FAMILY><POSITION>[']` — 72 total (36 base + 36 inverted)
- **Family:** C, P, L, S, T, M
- **Position:** 0-5
- **Inversion:** append `'` or `i` for the # phase-shifted complement
- Examples: `M0`, `S3`, `C4'`, `P2i`, `L5'`, `T1`

**Raw psychoids:** `#0`-`#5`, `#` — the 7 Layer 1 immutable archetypes

**Context frames:** `CF(0000)`, `CF(01)`, `CF(012)`, `CF(0123)`, `CF(4x)`, `CF(450)`, `CF(50)`

**Weaves:** `W0.0`, `W0.5`, `W5.0`, `W5.5` — the 10-fold interlaced arena

**Sub-branches:** `#<ROOT>-<path>` or `<FAMILY><ROOT>-<path>` — ~1873 dataset coordinates
- `M2-1` = `#2-1` (family prefix maps to raw psychoid)
- Arbitrary depth: `#2-1-0`, `#0-3-0/1-0`, `#4.4.3-4.0`
- `.` (Lemniscate nesting) valid only after position `4`: `#4.0`, `#4.4.3`, `#1-3-4.0/1`
- `/` = non-dual fusion: `0/1`, `0/1/2`, `5/0`
- `()` CF nesting normalized: `#1-3-4.(0000)` → `#1-3-4.0000`

## Dossier Format

Every `epi core knowing` response now centers the CT5 5/0 essence inside a dossier with six facets:

1. **Essence** — canonical quintessence text and branch identity
2. **Structural Correspondences** — same-position cross-family mirrors, clearly structural not discovered relations
3. **Relational Field** — graph-backed constellation and chain data when S2 is available
4. **KBase Field** — project-scoped file/bookmark connector layer
5. **Notebook Pulse** — one compact NotebookLM extract
6. **Latest Snapshot** — synthesized live summary from graph, KBase, and notebook

Example (family coordinate):
```
C1 — Category
Essence:
  Form -- essential nature, boundary
  Branch: #5-5 (T+C+T'+C' Logos cycle)
Structural Correspondences:
  > C1  Form
    P1  Definition
    L1  Functional
Relational Field:
  Graph connected: 3 constellation hits, 2 chain links.
KBase Field:
  1. /path/to/note.md
Notebook Pulse:
  Tight notebook summary...
Latest Snapshot:
  Graph: ... | KBase: ... | Notebook: ...
Actions:
  refresh  Refresh dossier facets
  glow     Preview selected markdown with glow
```
     C0  Bimba
     P0  Ground
     L0  Literal
     S0  Terminal
     T0  Seed
   > M0  Anuttara
```

Example (inverted coordinate):
```
M0' — Subsystem (inverted phase)
  Branch: #5-3 (M' UI — Electron app, WebMCP hooks)
  Phase: ' (result of # inversion applied to M0)
```

Example (raw psychoid):
```
#4 — Raw Archetype (Layer 1 .rodata)
  Quintessence: Context — Lemniscate anchor, type/frame
  Manifests as: C4 Type, P4 Context, L4 Paradigmatic, S4 Claude/PI, T4 Pattern, M4 Nara
  Invariant: #4.cf == &Psychoid_4 (Lemniscate self-fold)
```

The `>` marker shows which family you queried. All 6 relation lines share the same position — this IS the holographic structure: every coordinate contains the whole, viewed through its family's lens.

## Admin Commands (write-gated)

```bash
# Update a coordinate's pithy (prompts for passphrase on first write)
epi core knowing M0 --update "Anuttara -- absolute ground, vimarsa engine"

# Check what coordinates have QV data populated
epi core knowing --coverage

# Bake overlay data into C source for binary distribution
epi core knowing --bake

# Export all QV data as JSON
epi core knowing --export
```

The write gate prompts once per CLI session for write operations (--update, --bake).
Read operations (knowing, --coverage, --export) are always ungated.

## When to Use

### Before modifying code
```bash
# Understand the coordinate you're touching
epi core knowing M4   # Before editing m4.c or m4.h
epi core knowing S2   # Before editing graph/ module
```

### During design work
```bash
# Understand relationships
epi core knowing C0   # What is Bimba in each family?
epi core knowing --family L  # What lens modes are available?
```

### Before architecture/spec planning
```bash
# Start with coordinate and vault intelligence before raw filesystem search
epi core knowing S1' --json
epi vault search "M'-SYSTEM-SPEC"
epi vault search-content "World/Types"
epi vault read Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md
epi vault link-suggest Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md --source-coordinate "S1'"
```

Use `Idea/Bimba/World/**` for crystallised definitions and stable architecture details. Use `Idea/Bimba/Seeds/**` for specs, plans, traceability, and legacy `/docs` migration mirrors. Treat `/docs/specs`, `/docs/plans`, and `/docs/resources` as source strata until they are linked or mirrored into Seeds.

### For deeper granularity
The `epi core knowing` command gives S0' (pithy C-level) output. For deeper layers:
- **S1' (Obsidian):** `epi vault read <note>` — markdown knowledge
- **S2' (Neo4j):** `epi graph query <coordinate>` — graph relationships

### Verification after changes
```bash
epi core verify    # Boot-check all 18 BIMBA entities
epi core knowing M0 --json | jq .essence.text  # Confirm self-knowledge intact
```

## JSON Schema (--json)

```json
{
  "coordinate": "M0",
  "title": "Map/Subsystem",
  "essence": {
    "text": "Anuttara -- absolute ground, vimarsa engine",
    "branch_id": "5-0",
    "branch_name": "M+M' integral identity"
  },
  "structural_correspondences": [],
  "relational_field": {
    "source": "graph",
    "summary": "Graph connected: 3 constellation hits, 2 chain links."
  },
  "kbase_field": {
    "source": "kbase",
    "project_scope": "early-epi",
    "items": []
  },
  "notebook_pulse": {
    "source": "notebook",
    "text": "Tight notebook summary"
  },
  "latest_snapshot": {
    "source": "synthesized",
    "text": "Graph: ... | KBase: ... | Notebook: ..."
  },
  "actions": []
}
```

## M5 Sub-Branch Map

Each family is holographically contained in an M5 sub-branch:

| Branch | Families | Domain |
|--------|----------|--------|
| #5-0 | M+M' | Integral identity — M0-M5 mirror |
| #5-1 | L+P+L'+P' | Theory topology — understanding |
| #5-2 | S+S' | Full stack — objective + project |
| #5-3 | M' UI | Electron app — WebMCP hooks |
| #5-4 | S4/S4' | Agent rosters — Anima + Aletheia |
| #5-5 | T+C+T'+C' | Logos cycle — cadence of immanence |

## Integration Patterns

### In Claude Code sessions
Use `epi core knowing` to orient before any architectural decision. The coordinate system IS the codebase map.

### In CI/CD or scripts
```bash
# Verify the coordinate system is intact
epi core verify --json | jq '.all_ok'

# Query specific coordinates programmatically
PITHY=$(epi core knowing M5 --json | jq -r '.quintessence')
```

### Chaining with other epi commands
```bash
epi core knowing S1                  # What is S1?
epi vault status                     # Check S1' implementation
epi core knowing S4                  # What is S4?
epi agent doctor                     # Check S4' implementation
```
