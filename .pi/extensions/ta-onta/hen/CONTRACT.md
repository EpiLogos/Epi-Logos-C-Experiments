# Hen Contract — Content Coordination & Vault

**Extension class:** S4-1' within ta-onta
**S-Layer fold:** S1 (Obsidian/Vault) — content layer, where artifacts live
**Position:** #1 (Paramasiva — definition, form, essential nature)

---

## Responsibility

Hen is the **content authority** for the entire ta-onta system. It owns the vault topology (Bimba/Present/Pratibimba split), the CT template system (archetypes CT0-CT5 and their instantiation), frontmatter schema enforcement (126 canonical keys, `{family}_{n}_{semantic}` format only), wikilink breadcrumbs, the NOW folder structure, and the vault-to-graph sync bridge. All vault mutations are structured by Hen even when the write primitive is Khora's.

`Idea/Bimba/World` is the canonical authority for flat template forms and reusable artifact-library files consumed by Templater and Hen runtime resolution.

`Idea/Bimba/World/Types` is the ordered ontology mirror. Its hierarchy follows the core coordinate sequence:

`# -> #0-#5 -> C..M with nested inversion branches -> reflective language nested through the C-sequence -> type authorities`

The reflective/context-frame language is expressed through the canonical `C` inversion ladder:

- `C0' -> CPF`
- `C1' -> CT`
- `C2' -> CFP`
- `C3' -> CF`
- `C4' -> CP`
- `C5' -> CS`

Hen treats that pairing as derived from the core C library and schema authorities, not as an independently authored vault convention. `CT` therefore lives at `Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT`, and context frames live at `Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF`.

**What Hen does NOT own:** session identity (Khora), temporal scheduling/archival (Chronos), agent dispatch (Anima), thought classification and knowledge crystallisation (Aletheia).

---

## Nesting Protocol

Hen treats the `World/Types` nesting protocol as **canonical but derived**, not hand-authored. In particular:

- VAK and reflective nesting under the `C` branch MUST be derived from the core C library and schema authorities.
- Hen mirrors the canonical `C0'..C5'` pairing into vault paths; it does not invent alternate reflective ladders ad hoc.
- `World/Types` exists to incubate ontology and future Neo4j label structure before sync; `World/*.md` remains the flat reusable form library.
- `Idea/Pratibimba/Self` is the reflective runtime surface for bootstrap and self-facing markdown state; Hen does not create a separate agent root alongside it.

This prevents the vault hierarchy, the Rust CLI, and the graph seed from drifting into subtly different ontologies.

---

## PI Hook Seams

| Hook | Purpose |
|------|---------|
| `before_tool_call` | Validate frontmatter schema on vault writes; check coordinate grammar |
| `after_tool_call` | Emit sync event to Khora queue; update wikilink breadcrumbs |

---

## Registered Tools

| Tool | Purpose |
|------|---------|
| `hen_template_invoke` | Instantiate a CT template type with correct frontmatter and content scaffold |
| `hen_hybrid_retrieve` | Coordinate-aware retrieval: vault search + Neo4j traversal + Redis cache |
| `hen_status` | Template registry state, sync queue depth, pending validations |
| `graph_query` | Neo4j query interface (coordinate-aware Cypher) |
| `hen_frontmatter_validate` | Validate note frontmatter against 126-key schema |

---

## CLI Bridge

```
epi vault frontmatter-validate <note>
epi vault day-init                              — Create today's Day folder + daily-note.md
epi vault now-init --session-id <id>            — Create NOW folder with all subdirectories
epi vault template-invoke <type> [--coordinate COORD] [--session-id ID]
epi vault thought-route --position N            — Write to T{n} bucket in Pratibimba
epi vault archive-day <date>                    — Rotate Day folder to Pratibimba archive
epi vault periodic-init --weekly/--monthly
epi graph                                       — Neo4j query and sync commands
```

---

## NOW Folder Structure (S1'Cx — Hen defines, Khora writes)

```
/Idea/Empty/Present/
  {DD-MM-YYYY}/
    daily-note.md              — CT4b' Day scope (6-position content spaces)
    daily-note.canvas          — MOC with embeds
    {YYYYMMDD-HHmmss-sessionId}/
      now.md                   — CT4b' Session scope (6-position content spaces)
      now.canvas               — CPF-instance visual
      tasks/                   — CT2 operation artifacts
      patterns/                — CT3 pattern outputs
      thinking/                — In-task cognitive scratch (local, ephemeral)
      thoughts/                — Post-task material → Sophia/Aletheia night phase
```

**CRITICAL NAMING RULES:**
- NOW folders MUST be datetime-prefixed: `{YYYYMMDD}-{HHmmss}-{sessionId}`
- FORBIDDEN: sequential counters (`now-1/`), undifferentiated `now/`
- `thinking/` — agent cognitive workspace during task execution; ephemeral, task-local
- `thoughts/` — distilled material surviving task completion; Sophia classifies → T-bucket routing at night phase
- Lifecycle: `thinking/` → (task completion, Sophia classifies) → `thoughts/` → (night phase, Aletheia routes) → `/Pratibimba/Self/Thought/T{n}/`

---

## Frontmatter Schema Authority

**Canonical key format:** `{family}_{n}_{semantic}` only (e.g., `t_3_pattern`, `m_0_ground`).

**BANNED — reject on write, warn on read:**
- `pos_*` prefix forms: `pos0_question`, `pos_1_material`, `pos_t_extracted` — ALL banned
- `ql_position` standalone field
- `bimbaCoordinate` — superseded by `coordinate`
- `ctx_*` standalone except `ctx_type`

**Special identifier fields (outside `{family}_{n}_{semantic}` scheme):**
- `coordinate` — the node's coordinate address (e.g., `#M2`, `S3`, `C4'`). Canonical in both frontmatter YAML and Neo4j. **No translation. No conversion.** `bimbaCoordinate` is the deprecated form.
- `artifact_role`, `ctx_type`, `ctx_frame` — template metadata
- `uuid`, `created_at`, `updated_at`, `session_id`, `day_id` — system identity

**Schema source of truth:** `hen/S1'/frontmatter_schema.ts` — 126 canonical keys. All modules that write vault content use this schema.

---

## CT Template System

### Archetype Table

| CT Level | CF Frame | Content Spaces | Template Types |
|----------|----------|----------------|----------------|
| CT0 | (00/00) | #0 pure receptive void | seed |
| CT1 | (0/1) | #0 question, #1 material | prompt |
| CT2 | (0/1/2) | #0-#2 + analysis | task-spec |
| CT3 | (0/1/2/3) | #0-#3 + pattern | pattern-note |
| CT4b' | (4.0/1-4.4/5) | #0-#5 fractal doubling | daily-note, now |
| CT5 | (5/0) | #0-#5 + Möbius return | thought |

### Template Resolution Order

1. Custom: `~/.epi-logos/templates/{type}.md`
2. Plugin: `hen/S1'/templates/{type}.md`
3. Canonical form: `Idea/Bimba/World/{Form}.md`
4. Built-in Rust scaffold (minimal fallback)

### Triggers

Templates are invoked by: Chronos (temporal lifecycle — Day/NOW creation), Anima (task dispatch — task-spec, pattern-note), Aletheia (crystallisation — thought). Hen instantiates on all three triggers via `hen_template_invoke`.

---

## Wikilink Breadcrumb System

Every artifact contains breadcrumbs in 5 categories:

1. **Temporal:** `[[09-03-2026/daily-note]]`, `[[09-03-2026/20260309-143000-abc123/now]]`
2. **Coordinate:** `[[Bimba/Seeds/M/M2]]`
3. **Session:** `[[session:20260309-143000-abc123]]`
4. **Source/Context:** `[[Gnosis:Tantraloka-Ch1]]`, `[[vimarsa:M.db]]`
5. **Conceptual:** `[[coordinate-system]]`, `[[gnosis-pipeline]]`

---

## Vault-to-Graph Sync Bridge (S2')

- Every vault mutation enqueues to `.khora-sync-queue.jsonl`
- Frontmatter `{family}_{n}_{semantic}` wikilinks → Neo4j relationship edges
- `coordinate` = join key between vault notes and Neo4j nodes — no translation
- Hash-based change detection for incremental sync

---

## L-Coordinate Frontmatter Alignment

Hen's frontmatter schema accepts **L-alignment fields** — agent-populated blocks recording the epistemic lens stance of a document. Aletheia is the primary populator; any agent processing a document MAY add entries.

### Full alignment block (`l_alignments`)

```yaml
l_alignments:
  - lens: "L2"                          # canonical m2.c MEF lens name
    lens_index: 2                       # 0-11 (0-5 = day, 6-11 = night)
    sub_position: 3                     # 0-5, OR "BOTH" for dialetheic L2
    sub_name: "BOTH"                    # human-readable sub-position label
    mode: "day"                         # "day" | "night"
    weight: 0.8                         # 0.0–1.0 agent-assessed emphasis
    element: "air"                      # primary element from LENS_PRIMARY_ELEMENT
    klein_square: ["L2", "L3", "L2'", "L3'"]   # 4-element Klein V4 integration unit
    complement: "L3"                    # day complement (X + Y = 5) or night complement
    night_partner: "L2'"               # day-night doubling partner
    populated_by: "aletheia"
    populated_at: "2026-03-12T10:00:00Z"
```

Multiple entries may be present simultaneously — a document may carry more than one active lens. The `klein_square` context tells downstream consumers which 4-way integration unit the lens belongs to, enabling full Klein V4 resonance computation.

### Per-lens shorthand fields

Agents may also write sparse shorthand keys using the standard `{family}_{n}_{semantic}` pattern. For L-alignments, the position segment encodes the lens index (0-5 for day lenses); the semantic encodes the lens name:

```yaml
l_2_logical:
  sub: 3
  weight: 0.8
  element: "air"
```

These keys satisfy the existing `{family}_{n}_{semantic}` format and pass validation without special handling. `l_0_*` through `l_5_*` address the day lens range.

### L-coordinate system reference

The canonical 12 lenses (from m2.c `M2_MEF_LENS_NAMES`):

| Index | Lens | Mode | Klein complement |
|-------|------|------|-----------------|
| 0 | Quaternal (L0) | day | L5 (0+5=5) |
| 1 | Causal (L1) | day | L4 (1+4=5) |
| 2 | Logical (L2) | day | L3 (2+3=5) |
| 3 | Processual (L3) | day | L2 |
| 4 | Phenomenological (L4) | day | L1 |
| 5 | Para Vak (L5) | day | L0 |
| 6 | Archetypal-Numerical (L0') | night | L5' |
| 7 | Phenomenal (L1') | night | L4' |
| 8 | Alchemical-Elemental (L2') | night | L3' |
| 9 | Chronological (L3') | night | L2' |
| 10 | Scientific (L4') | night | L1' |
| 11 | Divine Logos (L5') | night | L0' |

**L2' (Alchemical-Elemental) sub-positions:** Aether / Earth / Water / Air / Fire / Mineral. When `sub_name: "BOTH"` is used (dialetheism), the entry asserts two sub-positions hold simultaneously.

**Klein V4 relational laws:**
- Day complement: X + Y = 5
- Night complement: X' + Y' = 5
- Day-Night doubling: L(n) ↔ L(n') — same structural position across phase

### Validation rules for `l_alignments`

1. `l_alignments` is a YAML sequence; missing or non-sequence value → WARNING (tolerated)
2. Each entry MUST have: `lens` (string), `lens_index` (integer 0-11), `mode` ("day" | "night")
3. Consistency: `lens_index` 0-5 requires `mode: "day"`; 6-11 requires `mode: "night"`
4. `weight` if present must be a float in [0.0, 1.0]
5. `klein_square` if present must be a 4-element sequence of valid lens name strings
6. Agents ADD entries freely; validator does NOT reject unknown optional sub-fields — only validates the invariants above
7. The `coordinate` key remains THE ONE exempt key from `{family}_{n}_{semantic}` format

### Agent population protocol

When Aletheia (or any agent) processes a document, it MAY add `l_alignments` entries reflecting the epistemic stance of the content. The agent sets `populated_by` to its own name and `populated_at` to the ISO8601 timestamp. Hen's `before_tool_call` hook validates existing entries for internal consistency before accepting a vault write containing `l_alignments`.

---

## M-Level Integration

- **M2 (Parashakti):** The 72-invariant vibrational matrix maps to content typing. Parashakti's structural field provides the typing schema for content element relationships.

---

## Key Invariants

1. `{family}_{n}_{semantic}` is the only content property key format — no exceptions
2. `coordinate` is the node identifier — same in frontmatter and Neo4j, no translation
3. `bimbaCoordinate` is deprecated — reject on write, normalise on read
4. Every system-created artifact has all 5 wikilink breadcrumb categories
5. No vault write bypasses Khora's `khora_write` primitive
6. Every vault write enqueues a graph event to `.khora-sync-queue.jsonl`
7. CT archetypes are read from `Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/` — Hen reads, does not redefine
8. `thinking/` is task-local scratch; `thoughts/` is session-survivable Sophia-classified material

---

## Dependencies

**Receives from:**
- Khora: session ID, `khora_write` primitive, sync queue
- Chronos: temporal triggers (6 AM day-init, session-start now-init, evening archive)
- Anima: task context for template invocation (coordinate, CF code)

**Provides to:**
- All extensions: frontmatter validation, breadcrumbs, template instantiation
- Chronos: daily-note.md + now.md structure for temporal lifecycle
- Aletheia: `thoughts/` folder content + vault-graph sync for T-bucket archival
- Pleroma: `graph_query` tool

---

## Phase Priorities

| Phase | Deliverable |
|-------|------------|
| P0 | obsidian-cli Rust wrapper (all 14 commands confirmed working) |
| P0 | Frontmatter schema: 126-key validation, `pos_*` rejection, `coordinate` field |
| P0 | NOW folder creation: `epi vault now-init` + `thinking/` + `thoughts/` subdirs |
| P0 | `khora_write` integration (all vault writes routed through) |
| P1 | CT template registry + `hen_template_invoke` |
| P1 | Wikilink breadcrumb generation (all 5 categories) |
| P1 | Vault-to-graph sync bridge (emit to Khora sync queue) |
| P1 | `hen_hybrid_retrieve` tool |
| P2 | Legacy `bimbaCoordinate` → `coordinate` migration pass on existing vault |
| P2 | Coordinate-native vault queries |
| P2 | Redis-cached retrieval (HOT/WARM/COLD tiers) |
