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
- `q_essence`, `q_correspondence`, `q_vimarsa_field`, `q_relational_field`, `q_notebook_pulse`, `q_latest_snapshot` — quintessence bridge fields linking S1 frontmatter into S2/M5 KnowingDossier assembly

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
