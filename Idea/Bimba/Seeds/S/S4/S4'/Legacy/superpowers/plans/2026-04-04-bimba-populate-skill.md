# Bimba Populate Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an executable agent skill that semantically apportions M-branch dataset content into coordinate-forward Neo4j schema properties, generates human-reviewable Cypher files, and executes them after conversation-driven review.

**Architecture:** The agent IS the LLM judge — it reads each node's full source content, understands the coordinate system semantically, and assigns content to `{family}_{n}[_{sub_n}]*_{semantic}` property slots based on what the content actually means, not what key it came from. Sub-numbering (e.g. `c_0_1_essence`, `m_3_2_pairing_matrix`) mirrors the coordinate system itself and gives organisational freedom within each position. Purely computable enrichments (uuid, layer, topo_mode) are delegated to a small Python helper. The agent writes `.cypher` files to `cypher/generated/` — one per branch — which the human reviews in conversation. Fixes are made by amending those files through the same conversation. When approved, the agent executes them via `cypher-shell`. Relations and pointer resolution follow the same generate → review → execute loop.

**Tech Stack:** Claude Code agent (semantic apportionment), Python 3.11+ (computed enrichment only), Neo4j `cypher-shell`, APOC plugin (dynamic relation types).

---

## Why the LLM does the apportionment

The `{family}_{n}_{semantic}` property keys are not aliases — they are coordinate addresses. `c_0_essence` means the content that IS the ground/source nature of the node. `c_1_form` means content about how it structurally manifests. `m_3_quaternionic_signature` means content that specifically articulates M3's quaternionic mathematical structure. These distinctions are semantic judgments. A mechanical lookup table produces arbitrary coordinate labels; an LLM reading the full content can produce coordinate-honest assignments whose topology is implicit and coherent across the entire graph.

When `c_0_*` properties are read across all nodes, they form a coherent semantic layer — the ground stratum. `c_4_*` properties form the typological stratum. This emergent topology only holds if the original apportionment was semantically faithful.

---

## File Map

**Created:**
```
epi-gnostic/cypher/
├── 00-bootstrap.cypher                 # DDL: constraints + indexes (idempotent)
├── 02-relations-upsert.cypher          # APOC dynamic relation MERGE (static template)
├── 03-pointers-resolve.cypher          # 18-fold pointer wiring (static template)
└── generated/                          # LLM-generated, human-reviewed, gitignored until approved
    ├── m0-nodes.cypher
    ├── m1-nodes.cypher
    ├── m2-nodes.cypher
    ├── m3-nodes.cypher
    ├── m4-nodes.cypher
    ├── m5-nodes.cypher
    └── relations.cypher

epi-gnostic/scripts/
└── enrich.py                           # Computed enrichment only (uuid, layer, topo_mode)

epi-gnostic/
└── schema-context.md                   # Agent reads this for apportionment guidance

plugins/pleroma/skills/bimba-populate/
└── SKILL.md                            # Executable agent skill
```

**Modified:**
```
epi-gnostic/.gitignore                  # Add cypher/generated/ (until reviewed + approved)
```

---

## Task 0: Bootstrap and static Cypher files

**Files:**
- Create: `epi-gnostic/cypher/00-bootstrap.cypher`
- Create: `epi-gnostic/cypher/02-relations-upsert.cypher`
- Create: `epi-gnostic/cypher/03-pointers-resolve.cypher`
- Create: `epi-gnostic/cypher/generated/.gitkeep`

- [ ] **Step 1: Write `00-bootstrap.cypher`**

```cypher
// 00-bootstrap.cypher — idempotent DDL. Safe to re-run.

CREATE CONSTRAINT bimba_coordinate_unique IF NOT EXISTS
  FOR (n:BimbaNode) REQUIRE n.coordinate IS UNIQUE;

CREATE INDEX bimba_family IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_family);

CREATE INDEX bimba_ql_position IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_ql_position);

CREATE INDEX bimba_layer IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_layer);

CREATE INDEX bimba_topo_mode IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_topo_mode);

CREATE VECTOR INDEX bimba_embedding IF NOT EXISTS
  FOR (n:BimbaNode) ON n.c_5_embedding
  OPTIONS {
    indexConfig: {
      `vector.dimensions`: 3072,
      `vector.similarity_function`: 'cosine'
    }
  };
```

- [ ] **Step 2: Write `02-relations-upsert.cypher`**

```cypher
// 02-relations-upsert.cypher
// Parameters: $batch — list of relation objects.
// Each item: { source, target, rel_type, props }
// props must include: c_3_created_at, c_4_confidence, c_4_method, c_5_source_ref
// Requires APOC plugin.

UNWIND $batch AS rel
MATCH (a:BimbaNode { coordinate: rel.source })
MATCH (b:BimbaNode { coordinate: rel.target })
CALL apoc.merge.relationship(a, rel.rel_type, {}, rel.props, b)
  YIELD rel AS r
RETURN count(r) AS merged;
```

- [ ] **Step 3: Write `03-pointers-resolve.cypher`**

```cypher
// 03-pointers-resolve.cypher
// Parameters: $batch — list of pointer objects.
// Each item: { coordinate, c_ref, p_ref, l_ref, s_ref, t_ref, m_ref,
//              cpf_ref, ct_ref, cp_ref, cf_ref, cfp_ref, cs_ref,
//              c_inv_ref, p_inv_ref, l_inv_ref, s_inv_ref, t_inv_ref, m_inv_ref }
// All refs are coordinate strings or null.

UNWIND $batch AS ptr
MATCH (n:BimbaNode { coordinate: ptr.coordinate })
SET n.c_ref     = ptr.c_ref,   n.p_ref   = ptr.p_ref,
    n.l_ref     = ptr.l_ref,   n.s_ref   = ptr.s_ref,
    n.t_ref     = ptr.t_ref,   n.m_ref   = ptr.m_ref,
    n.cpf_ref   = ptr.cpf_ref, n.ct_ref  = ptr.ct_ref,
    n.cp_ref    = ptr.cp_ref,  n.cf_ref  = ptr.cf_ref,
    n.cfp_ref   = ptr.cfp_ref, n.cs_ref  = ptr.cs_ref,
    n.c_inv_ref = ptr.c_inv_ref, n.p_inv_ref = ptr.p_inv_ref,
    n.l_inv_ref = ptr.l_inv_ref, n.s_inv_ref = ptr.s_inv_ref,
    n.t_inv_ref = ptr.t_inv_ref, n.m_inv_ref = ptr.m_inv_ref
WITH n, ptr
WHERE ptr.c_inv_ref IS NOT NULL
MATCH (ci:BimbaNode { coordinate: ptr.c_inv_ref })
MERGE (n)-[:POLAR_OPPOSITE { family: 'c' }]->(ci)
WITH n, ptr
WHERE ptr.cf_ref IS NOT NULL
MATCH (cf:BimbaNode { coordinate: ptr.cf_ref })
MERGE (n)-[:CONTEXT_FRAME_REF { coord: 'cf' }]->(cf)
RETURN count(n) AS resolved;
```

- [ ] **Step 4: Add `.gitignore` entry and `.gitkeep`**

```bash
echo "cypher/generated/*.cypher" >> epi-gnostic/.gitignore
touch epi-gnostic/cypher/generated/.gitkeep
```

- [ ] **Step 5: Verify bootstrap syntax**

```bash
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --file epi-gnostic/cypher/00-bootstrap.cypher
```

Expected: no errors, 6 index/constraint operations reported.

- [ ] **Step 6: Commit**

```bash
git add epi-gnostic/cypher/ epi-gnostic/.gitignore
git commit -m "feat(cypher): add static DDL, relation, and pointer Cypher templates"
```

---

## Task 1: Computed enrichment script

**Files:**
- Create: `epi-gnostic/scripts/enrich.py`

Pure computation only — no semantic judgment. The agent calls this to get the fields that are deterministically derivable from the coordinate string alone.

- [ ] **Step 1: Write `enrich.py`**

```python
#!/usr/bin/env python3
# epi-gnostic/scripts/enrich.py
"""
Computed enrichment for BimbaNode records.
Accepts a coordinate string, returns a dict of purely computable fields.
No LLM involvement — these are deterministic.

Usage (from agent via Bash tool):
    python enrich.py "#3-1-0-0"
    → prints JSON: {"c_2_uuid": "...", "c_4_family": "M", "c_4_ql_position": 3,
                    "c_4_layer": "COORDINATE", "c_4_topo_mode": "LEMNISCATE"}
"""
from __future__ import annotations
import json
import re
import sys
import uuid

_UUID_NS = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

_TOPO_MODE = {0: 'ZERO_SPHERE', 1: 'TORUS', 2: 'TORUS',
              3: 'LEMNISCATE', 4: 'LEMNISCATE', 5: 'KLEIN'}

_LAYER_BY_DEPTH = {0: 'PSYCHOID', 1: 'PSYCHOID', 2: 'COORDINATE',
                   3: 'COORDINATE', 4: 'COORDINATE', 5: 'COORDINATE'}


def enrich(coordinate: str) -> dict:
    stripped = coordinate.lstrip('#')
    parts = [p for p in stripped.split('-') if p] if stripped else []
    depth = len(parts)

    ql_pos = None
    if parts and re.match(r'^\d+$', parts[0]):
        ql_pos = int(parts[0])

    is_cf  = '/' in stripped or stripped.startswith('CF_')
    is_vak = stripped in ('cpf', 'ct', 'cp', 'cf', 'cfp', 'cs')

    if is_cf:
        layer = 'CONTEXT_FRAME'
    elif is_vak:
        layer = 'VAK'
    else:
        layer = _LAYER_BY_DEPTH.get(depth, 'COORDINATE')

    topo = _TOPO_MODE.get(ql_pos, 'ZERO_SPHERE') if ql_pos is not None else 'ZERO_SPHERE'

    return {
        'c_2_uuid':        str(uuid.uuid5(_UUID_NS, coordinate)),
        'c_4_family':      'M',
        'c_4_ql_position': ql_pos,
        'c_4_layer':       layer,
        'c_4_topo_mode':   topo,
    }


if __name__ == '__main__':
    coord = sys.argv[1] if len(sys.argv) > 1 else '#'
    print(json.dumps(enrich(coord)))
```

- [ ] **Step 2: Test it directly**

```bash
python epi-gnostic/scripts/enrich.py "#3-1-0-0"
```

Expected:
```json
{"c_2_uuid": "<deterministic-uuid>", "c_4_family": "M", "c_4_ql_position": 3, "c_4_layer": "COORDINATE", "c_4_topo_mode": "LEMNISCATE"}
```

```bash
python epi-gnostic/scripts/enrich.py "#0"
```

Expected: `c_4_layer: PSYCHOID`, `c_4_topo_mode: ZERO_SPHERE`, `c_4_ql_position: 0`

```bash
python epi-gnostic/scripts/enrich.py "#5"
```

Expected: `c_4_topo_mode: KLEIN`

- [ ] **Step 3: Commit**

```bash
git add epi-gnostic/scripts/enrich.py
git commit -m "feat(scripts): add deterministic coordinate enrichment helper"
```

---

## Task 2: Schema context document

**Files:**
- Create: `epi-gnostic/schema-context.md`

The agent reads this at the start of every apportionment session. It defines what each coordinate slot means semantically — so the apportionment judgment is grounded in the ontology, not guessed.

- [ ] **Step 1: Write `epi-gnostic/schema-context.md`**

```markdown
# BimbaNode Apportionment Schema Context

Read this before apportioning any node content.
This defines what each coordinate-forward property key MEANS.
Apportionment is a semantic judgment — assign content to the slot
whose meaning most faithfully matches what that content IS.

---

## The Naming Convention

All property keys follow `{family}_{n}[_{sub_n}]*_{semantic}` where:
- `family` ∈ {c, p, l, s, t, m} — coordinate family
- `n` ∈ {0, 1, 2, 3, 4, 5} — QL position
- `sub_n` ∈ {0, 1, 2, 3, 4, 5} — optional sub-position (repeatable), mirrors the coordinate system's own nesting depth
- `semantic` — snake_case descriptor of what this specific property holds

**Sub-numbering** gives organisational freedom within a coordinate position without inventing new families. Use it when a position genuinely contains distinct sub-domains that deserve their own address:

| Example | Meaning |
|---------|---------|
| `c_0_essence` | C0 ground — flat (no sub-position needed) |
| `c_0_0_void_ground` | C0·0 — the most foundational aspect of ground |
| `c_0_1_languification` | C0·1 — the Anuttara-language encoding of ground |
| `m_3_2_pairing_matrix` | M3·2 — the pairing-matrix sub-domain of M3 |
| `m_0_2_3_ananda_row` | M0·2·3 — deep nesting when the dataset structure warrants it |

Sub-numbers follow the same QL semantics as their parent position. `c_0_0_*` is more ground-ward than `c_0_5_*` within the C0 family. Use this coherently — sub-numbers are not just sequence indices.

`coordinate` is the single exempt key (the Bimba address itself, not a property).
Computed fields (c_2_uuid, c_4_family, c_4_ql_position, c_4_layer, c_4_topo_mode)
are filled by enrich.py — do NOT assign these from content.

---

## C-Family Positions (ontological default — universal across all nodes)

| Key prefix | Position meaning | Apportion content that IS... |
|------------|-----------------|------------------------------|
| `c_0_*`    | Ground / Source / Bimba | The essential nature; what this coordinate IS at its most fundamental; ground-state descriptions; void/origin content |
| `c_1_*`    | Form / Definition / Manifestation | How it structurally presents; its essential form; how it manifests; what it IS as a defined thing |
| `c_2_*`    | Entity / Instance / Atomic | Specific identifiers, unique properties, instance-level facts; what makes THIS node THIS node |
| `c_3_*`    | Process / Temporal / Operational | How it functions; its operations; temporal aspects; sequences; developmental stages; what it DOES |
| `c_4_*`    | Type / Context / Category | How it is categorized; typological information; what context it operates in; classifications |
| `c_5_*`    | Integration / Reflection / Resonance | Cross-system connections; resonances with other traditions; how it integrates with the whole; what it reflects |

---

## Canonical Core Property Slots (every BimbaNode must have these)

```
c_0_essence              The distilled ground nature (1-3 sentences max)
c_1_name                 Human-readable label
c_1_description          Extended descriptive prose
c_1_form                 How it structurally manifests (internalStructure content)
c_3_updated_at           ISO 8601 timestamp (take latest of all timestamp variants)
c_3_context_frame        Canonical context frame string e.g. "(0/1/2/3)"
c_4_access_level         Who/what can access this coordinate
c_4_ql_category          "implicate" | "explicate" | "both"
c_4_ql_operator_types    list[string] — always a list
c_5_resonances           list[string] — cross-tradition resonances, always a list
```

---

## Harmonizable Slots (appear across multiple subsystems — assign when content is present)

```
c_0_consciousness_structure    How consciousness operates at this coordinate
c_0_anuttara_languification    The Anuttara void-grammar encoding of this coordinate
c_1_key_principles             list[string] — core principles, always a list
c_1_architectural_function     Role/function in the system architecture
c_1_operational_symbolics      Symbolic representations and their operational meaning
c_1_void_grammar_structure     The void-grammar (QL operator) structure
c_3_practical_applications     list[string] — use cases, always a list
c_3_related_coordinates        Which other coordinates this interfaces with
c_3_developmental_stages       list[string] — evolutionary/developmental stages, always a list
c_3_void_relationship          How this coordinate relates to the void/Anuttara
```

---

## Subsystem-Specific Slots (M-family, assign only when content genuinely belongs here)

### M0 (Anuttara — Void ground)
```
m_0_lacanian_mapping       Lacanian-Vedantic triadic synthesis for this node
m_0_resonance_traditions   Specific traditions beyond c_5_resonances
```

### M1 (Paramasiva — Logical structure)
```
m_1_clifford_signature     Clifford Cl(4,2) algebraic encoding
m_1_spanda_tick            tick12 value (0-11)
m_1_trigram_basis          Spinor/trigram correspondence
m_1_ananda_matrix_row      Which Ananda matrix row governs this node
```

### M2 (Parashakti — Vibrational dynamics)
```
m_2_decan_signature        Degree/decan structural signature
m_2_tattva_mapping         Tattva descent/ascent map
m_2_vibrational_ratio      Core vibrational ratio (e.g. "36×2=72")
m_2_trinity_operations     The three operative relations (+, ×, /)
m_2_absent_operation       The operation structurally absent at this position
m_2_name_matrix            Divine name matrix reference
m_2_void_query             The specific void-question this node holds
```

### M3 (Mahamaya — Symbolic transcription)
```
m_3_quaternionic_signature  Quaternionic formula (q = a + bi + cj + dk form)
m_3_matrix_symmetry         SU(3)/gauge symmetry description
m_3_rotational_dynamics     SU(2)/spinorial rotational structure
m_3_non_dual_anchors        Integer count of palindromic/invariant codons
m_3_seed_ratio              Prime seed ratio (e.g. "41:43")
m_3_core_ratio              Structural ratio (e.g. "64:8:40")
m_3_harmonic_ratio          Harmonic ratio (e.g. "360:40:9")
m_3_universal_grammar       Quaternionic mathematical grammar description
m_3_prime_stabilization     How Euler primes prevent rotational drift
m_3_axiological_framework   Embedded value/ethical systems in symbolic relations
m_3_environmental_conducting Epigenetic/environmental input structure
```

### M4 (Nara — Personal interface)
```
m_4_eve_numbers_path        Eve numbers (3-5-7) cosmic pathway description
m_4_eve_numbers_dynamic     Eve number dynamic operation
m_4_archetypal_family       Father/Mother/Son/Daughter/Family structure
m_4_oceanic_metaphor        Siva-Shakti-Nara oceanic dynamics
m_4_siva_shakti_dynamics    list[string] — hardware-software unity dynamics
m_4_two_stroke_doctrine     Outer stroke → Inner stroke pattern description
m_4_dialogical_containers   Bohmian / TalkingCircle / Diamond container description
m_4_temporal_layer          Temporal intelligence layer description
m_4_epistemic_separation    Operations vs. interpretation boundary description
m_4_nara_coordinate_system  Nested coordinate addressing description
m_4_transformational_tech   list[string] — transformation technology categories
m_4_personal_pratibimba     Personal Pratibimba three-layer architecture
m_4_spanda_coordinate_entry Spanda coordinate notation entry description
```

### M5 (Epii — Synthetic integration)
```
m_5_logos_cycle             6-stage logos cycle structure
m_5_logos_grounding         Philosophical grounding of logos cycle
m_5_archaeology_method      Etymological archaeology method description
m_5_archaeology_namespaces  list[string] — required knowledge namespaces
m_5_contemplative_modes     list[string] — contemplative synthesis modes
m_5_geometric_epistemology  Geometric epistemology paradigm shift description
m_5_conscire_structure      CON-SCIRE dialogical restoration description
m_5_lacanian_interface      Lacanian public interface description
m_5_whitehead_lacanian      Whitehead-Lacanian synthesis
m_5_next_evolution          list[string] — next evolutionary phases
m_5_namespaces              list[string] — active knowledge namespace references
```

---

## Apportionment Rules

1. **Read all content first** before assigning any slot. The full picture matters.
2. **Assign to the most semantically honest slot** — not the most convenient.
3. **Split prose when needed** — if one source property contains content for two slots, split it. Do not force-fit both into one slot.
4. **Use sub-numbers for organisational freedom** — when a position has distinct sub-domains, use `{family}_{n}_{sub_n}_{semantic}`. Sub-numbers follow QL semantics: `_0_` is more ground-ward, `_5_` is more integrative. Never use sub-numbers as arbitrary sequence indices.
5. **Lists are always lists** — any slot ending in a documented list type must be a JSON array even if the source is a string.
6. **Propose new slots cautiously** — only if content genuinely has no existing slot. Use `{family}_{n}[_{sub_n}]*_{semantic}` convention. Mark with `// PROPOSED` comment in Cypher for human review.
7. **Do not fabricate** — if content is absent for a slot, omit it. Empty strings and empty lists are noise.
8. **Computed fields are off-limits** — do not assign c_2_uuid, c_4_family, c_4_ql_position, c_4_layer, c_4_topo_mode. enrich.py handles these.
9. **Drop**: notionPageId, subsystem (int), id (int) — Notion artifacts, not semantic.

---

## Cypher Output Format

For each node, generate a block in this format:

```cypher
// {coordinate} | {c_1_name} | {subsystem description}
MERGE (n:BimbaNode { coordinate: '{coordinate}' })
// --- Canonical core ---
SET n.c_0_essence           = '{value}'
SET n.c_1_name              = '{value}'
SET n.c_1_description       = '{value}'
SET n.c_1_form              = '{value}'
SET n.c_2_uuid              = '{from enrich.py}'
SET n.c_3_updated_at        = '{value}'
SET n.c_3_context_frame     = '{value}'
SET n.c_4_family            = 'M'
SET n.c_4_ql_position       = {int}
SET n.c_4_layer             = '{from enrich.py}'
SET n.c_4_topo_mode         = '{from enrich.py}'
SET n.c_4_access_level      = '{value}'
SET n.c_4_ql_category       = '{value}'
SET n.c_4_ql_operator_types = {json array}
SET n.c_5_resonances        = {json array}
// --- Extended (harmonizable + subsystem-specific) ---
SET n += {
  key: value,
  key: value
  // PROPOSED: m_3_new_concept: '...'  ← flag for human review
}
ON CREATE SET n.c_3_created_at = datetime()
;
```

Blank line between nodes. One file per M-branch.
```

- [ ] **Step 2: Commit**

```bash
git add epi-gnostic/schema-context.md
git commit -m "feat: add apportionment schema context document for agent use"
```

---

## Task 3: SKILL.md — the full executable agent skill

**Files:**
- Create: `plugins/pleroma/skills/bimba-populate/SKILL.md`

This defines everything the agent does when the skill is invoked — apportionment loop, Cypher generation, review conversation, execution.

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p plugins/pleroma/skills/bimba-populate
```

- [ ] **Step 2: Write `SKILL.md`**

````markdown
---
name: bimba-populate
description: >
  Populate the Neo4j S2' M-branch coordinate tree from JSON datasets.
  Reads full node content, semantically apportions to coordinate-forward
  properties, generates Cypher files for human review, then executes
  approved Cypher against Neo4j.
triggers:
  - populate bimba
  - populate m-branch
  - load coordinates to neo4j
  - bimba populate
  - generate bimba cypher
---

# Bimba Populate Skill

## What this skill does

Loads M-branch coordinate data from JSON datasets into Neo4j using the
coordinate-forward `{family}_{n}_{semantic}` property schema. The core work
is semantic: you (the agent) read each node's full content and judge which
coordinate slot each piece of content belongs in. You then generate Cypher
files that the user reviews. Review happens in conversation — the user reads
the Cypher and tells you what to fix. Once approved, you execute.

---

## Prerequisites — check these before starting

- [ ] Neo4j is running: `cypher-shell -u neo4j -p $NEO4J_PASSWORD "RETURN 1"`
- [ ] APOC is installed: `cypher-shell -u neo4j -p $NEO4J_PASSWORD "RETURN apoc.version()"`
- [ ] Dataset files exist: `ls docs/datasets/`
- [ ] Bootstrap DDL has been run (or run it now):
  ```bash
  cypher-shell -u neo4j -p $NEO4J_PASSWORD --file epi-gnostic/cypher/00-bootstrap.cypher
  ```
- [ ] `enrich.py` is available: `python epi-gnostic/scripts/enrich.py "#3"`

---

## Invocation

The user specifies scope:

```
populate bimba                        → all branches, full pipeline
populate bimba --branch M3            → M3 only
populate bimba --stage nodes          → node apportionment only
populate bimba --stage relations      → relations only
populate bimba --stage execute        → execute already-generated Cypher
```

If no scope given, ask: **"Which branch(es)? (M0–M5 or ALL). Start with nodes, relations, or full pipeline?"**

---

## Stage A: Node Apportionment + Cypher Generation

### A1. Load context

Read these files before starting apportionment:
- `epi-gnostic/schema-context.md` — the apportionment guide (coordinate slot semantics)
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-04-neo4j-m-branch-coordinate-schema-population-design.md` — full schema spec

### A2. Branch loop

For each branch being processed:

**A2.1 — Load the dataset**

Find and read the node file for this branch:
```
docs/datasets/anuttara-deep/    → M0
docs/datasets/paramasiva-deep/  → M1
docs/datasets/parashakti-deep/  → M2
docs/datasets/mahamaya-deep/    → M3
docs/datasets/nara-deep/        → M4
docs/datasets/epii-deep/        → M5
```

Node file candidates (try in order): `nodes-full-detail.json`, `nodes-full-details.json`, `nodes-full-data.json`

**A2.2 — Process nodes in batches**

Large branches (M2: ~1100 nodes, M3: ~996 nodes) cannot be held in context at once.
Process in batches of **20–30 nodes**. Append to the branch Cypher file after each batch.

For each node in the batch:

1. **Read all source properties** — `filteredProps` or root-level dict. Take everything.

2. **Get computed enrichment** — call `enrich.py` via Bash:
   ```bash
   python epi-gnostic/scripts/enrich.py "{coordinate}"
   ```
   Use the returned `c_2_uuid`, `c_4_family`, `c_4_ql_position`, `c_4_layer`, `c_4_topo_mode` verbatim.

3. **Apportion semantically** — using `schema-context.md` as your guide:
   - Read the full content of every source property
   - Assign each piece of content to the most semantically honest `{family}_{n}[_{sub_n}]*_{semantic}` slot
   - Use sub-numbers (`c_0_1_*`, `m_3_2_*`) when a position contains distinct sub-domains that warrant their own address — sub-numbers follow QL semantics, not arbitrary sequence
   - Split prose where one source property spans multiple semantic slots
   - Always produce lists for list-type slots (wrap strings in `[]`)
   - Flag proposed new slots with `// PROPOSED` in the Cypher comment
   - Omit slots for which no content exists — do not fabricate

4. **Write the Cypher block** in the format defined in `schema-context.md`:
   - Comment header: `// {coordinate} | {name} | {brief description}`
   - Explicit `SET` for each canonical core property
   - `SET n += { ... }` for extended properties
   - `ON CREATE SET n.c_3_created_at = datetime()`
   - Terminate with `;`
   - Blank line before next node

5. **Append to file**: `epi-gnostic/cypher/generated/m{n}-nodes.cypher`

**A2.3 — Batch progress report**

After each batch of 20–30 nodes, output a brief status:
```
[M3 batch 1/34] Processed #3 through #3-1-0-5 — 22 nodes written.
  Notable decisions:
  - #3: Split 'description' across c_1_description and c_1_form
  - #3-1-0-0 (Qian): rotationalDynamics → m_3_rotational_dynamics; primeStabilization → m_3_prime_stabilization
  - #3-2: PROPOSED m_3_pairing_matrix_type (no existing slot matches 'matrix role' content)
  Continue? (or say 'stop here' to review what's been generated so far)
```

This gives the user natural breakpoints to say "stop, let me review" without waiting for the full branch.

**A2.4 — Branch completion**

When all nodes for a branch are written:
```
[M3 complete] 996 nodes → epi-gnostic/cypher/generated/m3-nodes.cypher
PROPOSED slots flagged: 3 (search '// PROPOSED' in the file)
Ready for review. Say 'review M3' to go through it, or 'continue to M4'.
```

---

## Stage B: Human Review Conversation

The user reads `cypher/generated/m{n}-nodes.cypher`. The conversation IS the review mechanism.

### What the user might say

**"Move the dragon metaphor in #3-1-0-0 to c_1_form instead of c_0_essence"**
→ Find that node in the file, amend the property assignment. Confirm the change.

**"The PROPOSED slot m_3_pairing_matrix_type — approve it"**
→ Remove the `// PROPOSED` comment. It's now a schema slot.

**"#3-2 is missing its trinity operations content"**
→ Re-read the source node, find the content, add it to the Cypher block.

**"All M3 nodes look good"**
→ Confirm and proceed to relations, or to execution if relations already done.

**"Re-do #3-1-0 through #3-1-5, the c_0_essence values are too thin"**
→ Re-read those source nodes, re-apportion, overwrite those blocks in the file.

### What to never do during review

- Do not re-run the full apportionment batch without being asked
- Do not modify nodes that weren't mentioned
- Do not add properties that don't follow `{family}_{n}_{semantic}`
- Do not fabricate content that wasn't in the source

---

## Stage C: Relations Cypher Generation

After all node branches are reviewed and approved:

**C1. Load relation files**

For each branch: `docs/datasets/{branch-dir}/relations.json`
Also: `docs/datasets/relations_hash.json` (root-level relations)

**C2. Generate relation Cypher**

For each relation in the source:
```json
{ "source": "#3", "target": "#3-1", "relType": "HAS_INTERNAL_COMPONENT", "relProperties": {} }
```

Generate:
```cypher
// #3 -[HAS_INTERNAL_COMPONENT]-> #3-1
MATCH (a:BimbaNode { coordinate: '#3' })
MATCH (b:BimbaNode { coordinate: '#3-1' })
MERGE (a)-[r:HAS_INTERNAL_COMPONENT {
  c_3_created_at: datetime(),
  c_4_confidence: 1.0,
  c_4_method: 'structural',
  c_5_source_ref: 'datasets/mahamaya-deep/relations.json'
}]->(b)
;
```

For relations with `relProperties` content, apportion those properties using the same `{family}_{n}_{semantic}` convention. Subsystem-contextual relation properties (e.g. `m_3_decan_context`) follow the same rules.

**C3. Write to** `epi-gnostic/cypher/generated/relations.cypher`

**C4. Present for review** — same conversation-driven process as Stage B.

---

## Stage D: Execution

Once a Cypher file is approved by the user:

```bash
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --file epi-gnostic/cypher/generated/m3-nodes.cypher
```

Execute one file at a time. Report back:
```
[M3 nodes] Executed. Confirm by running:
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --query "MATCH (n:BimbaNode) WHERE n.c_4_ql_position = 3 RETURN count(n)"
```

Expected count should match the node count in the Cypher file.

If errors occur, read the error, identify the offending node block, fix in the Cypher file, re-execute that block only (not the whole file — extract the failing MERGE and run it standalone).

For relations, use `02-relations-upsert.cypher` via the Python driver (APOC required), or generate inline MATCH/MERGE Cypher per relation type if APOC is unavailable.

---

## Stage E: Embeddings (after all nodes executed)

```bash
# Check how many nodes still need embeddings
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --query "MATCH (n:BimbaNode) WHERE n.c_5_embedding IS NULL RETURN count(n)"

# Generate embeddings
# (requires GOOGLE_API_KEY)
python epi-gnostic/scripts/embed.py
```

`embed.py` fetches nodes without `c_5_embedding`, calls Gemini `gemini-embedding-2-preview` (3072-dim), stores result. Re-run safely — only targets nodes missing embeddings.

Input text per node: `"{coordinate}: {c_1_name}. {c_0_essence}. {c_1_description}"`

---

## Stage F: Pointer Resolution (after embeddings)

Pointer resolution is a graph traversal question — once all nodes are in Neo4j, derive the 18-fold pointer refs by coordinate arithmetic and known M-branch structure. Use `03-pointers-resolve.cypher` with a batch parameter built by querying the live graph.

Run:
```cypher
// First inspect the graph to derive pointer targets
MATCH (n:BimbaNode { c_4_family: 'M' })
RETURN n.coordinate, n.c_4_ql_position, n.c_4_topo_mode
ORDER BY n.coordinate
```

Use this to construct the `$batch` for `03-pointers-resolve.cypher`. The pointer targets are determined by the coordinate system rules (CLAUDE.md §III.D).

---

## Pipeline Summary

| Stage | What | When |
|-------|------|------|
| A | Apportion content → generate Cypher files (one per branch) | First run |
| B | Human reviews Cypher ↔ agent conversation | After each branch |
| C | Generate relations Cypher | After all node branches approved |
| D | Execute approved Cypher files | After each approval |
| E | Generate embeddings | After all nodes executed |
| F | Resolve 18-fold pointers | After embeddings |

---

## Flexibility: Adding New Properties

The `{family}_{n}_{semantic}` convention is open. To add a new property:
- For nodes that already exist in Neo4j: generate a targeted `SET` Cypher block and execute it
- For future runs: the apportionment step naturally discovers and assigns it if the content is present
- New subsystem-specific slots found during apportionment should be noted in `schema-context.md`
  under the appropriate subsystem section after approval

The Cypher files themselves never need to be templated — they're generated fresh from content each time.
````

- [ ] **Step 3: Commit**

```bash
git add plugins/pleroma/skills/bimba-populate/SKILL.md
git commit -m "feat(skills): add bimba-populate agent skill with LLM apportionment loop"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered |
|---|---|
| LLM reads full content, apportions to `{family}_{n}_{semantic}` | Stage A2.3 — explicit per-node apportionment loop |
| Semantic judgment, not key renaming | `schema-context.md` defines slot meanings; SKILL.md §A2.3 step 3 |
| Canonical core + extended property split | Cypher output format in `schema-context.md` |
| Computed fields from enrich.py | Stage A2.3 step 2 — enrich.py called per node |
| Human-in-loop via conversation | Stage B — full conversation review protocol |
| Proposed new slots flagged | `// PROPOSED` comment in Cypher, review clears them |
| Batch processing for large branches | A2.2 — 20-30 nodes per batch, progress reports |
| Relations with coordinate-forward properties | Stage C — same apportionment rules applied |
| Relations Cypher via APOC template | `02-relations-upsert.cypher` + Stage C |
| 18-fold pointer resolution | `03-pointers-resolve.cypher` + Stage F |
| Embedding generation | Stage E + `embed.py` |
| No MX labels | Cypher output format: `:BimbaNode` only |
| Idempotent MERGE | `MERGE` in all generated Cypher |
| Flexibility for new properties | Skill §Flexibility section; `schema-context.md` update protocol |
| One Cypher file per branch | A2.5 — named `m{n}-nodes.cypher` |
| Execute with verification query | Stage D — count verification after each execution |

**Placeholder scan:** None found.

**Type consistency:** `enrich.py` output keys match the Cypher output format in `schema-context.md` exactly. `SET n += { ... }` accepts any dict, consistent with extended_props design in spec.

---

**Plan complete and saved to `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-04-04-bimba-populate-skill.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks

**2. Inline Execution** — execute tasks in this session with checkpoints

Which approach?
