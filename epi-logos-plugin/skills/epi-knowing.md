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

> The system knows itself. Every coordinate has a quintessential view — a pithy self-description plus its full relational context across all 6 families. Use this before, during, and after development work to ground actions in the coordinate system.

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

# Discovery — list all coords in a family
epi core knowing --family M      # Lists M0-M5 + M0'-M5' (12 coords)
epi core knowing --family '#'    # Lists #0-#5 + # operator
epi core knowing --family CF     # Lists all 7 context frame roots
epi core knowing --family W      # Lists all 4 weave interleaves

# JSON for agents
epi core knowing S3 --json       # Structured JSON output
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

## CT5 5/0 Output Format

Every `epi core knowing` response has two layers:

1. **Quintessence (5):** Pithy one-liner — what this coordinate IS
2. **Ground (0):** Relational tree — the same position across all 6 families

Example (family coordinate):
```
M0 — Map/Subsystem
  Quintessence: Anuttara — absolute ground, vimarsa engine
  Branch: #5-0 (M+M' integral identity)
  Relations:
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

### For deeper granularity
The `epi core knowing` command gives S0' (pithy C-level) output. For deeper layers:
- **S1' (Obsidian):** `epi vault read <note>` — markdown knowledge
- **S2' (Neo4j):** `epi graph query <coordinate>` — graph relationships

### Verification after changes
```bash
epi core verify    # Boot-check all 18 BIMBA entities
epi core knowing M0 --json | jq .quintessence  # Confirm self-knowledge intact
```

## JSON Schema (--json)

```json
{
  "coord": "M0",
  "family": "Map/Subsystem",
  "position": 0,
  "quintessence": "Anuttara — absolute ground, vimarsa engine",
  "branch": { "id": "5-0", "name": "M+M' integral identity" },
  "relations": {
    "C": { "coord": "C0", "family": "Category", "pithy": "Bimba" },
    "P": { "coord": "P0", "family": "Position", "pithy": "Ground" },
    "L": { "coord": "L0", "family": "Lens", "pithy": "Literal" },
    "S": { "coord": "S0", "family": "Stack", "pithy": "Terminal" },
    "T": { "coord": "T0", "family": "Thought", "pithy": "Seed" },
    "M": { "coord": "M0", "family": "Subsystem", "pithy": "Anuttara" }
  }
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
