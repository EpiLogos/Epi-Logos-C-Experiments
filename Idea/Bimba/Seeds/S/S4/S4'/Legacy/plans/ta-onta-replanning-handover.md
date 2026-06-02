---
coordinate: "S4'-1"
c_0_source_coordinates: ["/docs/prompts/ta-onta-replanning-handover.md"]
c_4_artifact_role: "prompt"
c_3_created_at: "2026-03-10"
c_5_reflection_complete: true
---

# Ta-Onta Extension Package — Replanning Handover Prompt

**Purpose:** Take this prompt into the Epi-Logos planning repo to generate proper module-by-module specs for the 6 ta-onta extensions, ensuring architectural alignment with the new C Experiments repo structure.

---

## Task

Replan the ta-onta meta-extension package for the Epi-Logos C Experiments architecture. Each of the 6 extension classes needs a proper spec covering its S-level primitives, S'-level QL augmentations, and M-level cross-cutting concerns. The existing agent/subagent definitions need review against the architectural model.

## Architecture Context

### Repo Structure (as of 2026-03-10)

```
Epi-Logos C Experiments/
  epi-lib/                    ← C library (M0-M5, engine, arena, psychoid numbers)
    src/                      ← .c files (m0.c through m5.c, engine.c, etc.)
    include/                  ← .h files (ontology.h, m0.h through m5.h, etc.)
  epi-cli/                    ← Rust CLI (epi command, 15 modules)
    src/
      core/knowing/           ← Coordinate self-knowledge (6-facet KnowingDossier)
      agent/                  ← Agent module (plugins, skills, hooks, subagents)
      graph/                  ← Neo4j/Redis stubs + embeddings
      vault/                  ← Obsidian vault wrapper
      gate/                   ← Gateway stub
      book/                   ← Book reader (bookokrat TUI)
      vimarsa/                ← bkmr wrapper (curiosity-driven exploration)
      techne/                 ← Research tools (gnosis planned here)
  .pi/
    extensions/
      ta-onta/                  ← The meta-extension package
      composite-entry.ts      ← PI runtime entry point
      khora/   {S0/, S0'/, M/}
      hen/     {S1/, S1'/, M/}
      pleroma/ {S2/, S2'/, M/}
      chronos/ {S3/, S3'/, M/}
      anima/   {S4/, S4'/, M/}
      aletheia/{S5/, S5'/, M/}
  epi-lib/test/               ← C tests organized by module (local to epi-lib)
  vendor/blake3/              ← Vendored BLAKE3
  _staging/                   ← Parked skills/hooks/commands awaiting reintegration
  docs/specs/S/S4/            ← Existing specs for this package
```

### The Extension Layer Model

Each extension sits at a position #0-#5 and has exactly 3 folders:

| Extension | Position | S (Primitives) | S' (QL Augmentation) | M (Cross-Cutting) |
|-----------|----------|----------------|---------------------|-------------------|
| **Khora** | #0 | S0 — Terminal bootstrap, process env, shell | S0' — CLI commands (epi agent bootstrap/session) | M0 ground state, M5 Logos FSM |
| **Hen** | #1 | S1 — Obsidian raw CRUD (obsidian-cli) | S1' — Frontmatter schema, CT templates, wikilinks, thought routing | M2 content typing (72-invariant) |
| **Pleroma** | #2 | S2 — Neo4j/Redis raw access, graph CRUD | S2' — Tool registration, primitive lifecycle, extension management | M3 symbolic codec |
| **Chronos** | #3 | S3 — Gateway sessions, cron, heartbeat | S3' — Day/NOW lifecycle, temporal threading, archive scheduling | M1 QL tick, M4 NOW identity |
| **Anima** | #4 | S4 — Agent primitives (team/chain/subagent) | S4' — VAK evaluation, CF dispatch, orchestration topology | M4 Lemniscate, M5 agent rosters |
| **Aletheia** | #5 | S5 — Sync/publication primitives | S5' — Gnosis RAG pipeline, knowledge crystallisation, dis-closure | M5 Logos cycle, M2 GraphRAG |

**Key principle:** S holds raw primitives for the layer. S' holds the Quaternal Logic system's augmentation of those primitives. M holds cross-cutting concerns involving the C library's data structures, vault, and graph.

### Orchestration Model

Two hemispheres:
- **Anima (left, execution):** VAK evaluation → agent dispatch → team/chain/subagent management
- **Nous (right, dis-closure):** Governs Aletheia subagents to prepare per-agent knowledge packages

Flow: Anima → Nous → Aletheia subagents → Gnosis/S0'/S1'/S2' methods

Key agents:
- **Constitutional (Anima's):** Eros (#0), Logos (#1), Techne (#2), Mythos (#3), Psyche (#4), Sophia (#5)
- **Aletheia subagents (Nous's instruments):** Anansi (gap analysis), Mercurius (cross-domain), Janus (temporal), Moirai (evidence), Agora (consensus), Zeithoven (cadence)
- **Psyche** = contextual centre, the "subject" who undergoes the task
- **Sophia** = post-execution reviewer with Aletheia access, bakes learnings

### Gnosis RAG Pipeline (in Aletheia/S5')

- Docling Serve (Docker) for PDF/document parsing
- docling-rs (Rust HTTP client) for integration
- Neo4j Gnosis: namespace (Notebook, Document, Chunk nodes)
- 3072-dim embeddings, unified with Bimba coordinate space
- Vimarsa aperture ↔ Gnosis notebook alignment
- Books (~/Documents/books) as first-class ingestion source
- Darshana REPL skill for structural pre-processing
- Model picker integration (gnosis.contextualise, gnosis.embed, gnosis.rewrite)

### CT Template System (in Hen/S1')

CTx = template archetypes defining positional content spaces per context frame:
- CT0 (00/00): pure void
- CT1 (0/1): #0 question + #1 material
- CT2 (0/1/2): + #2 analysis
- CT3 (0/1/2/3): + #3 pattern
- CT4 (4.0/1-4.4/5): all + #4 context (daily-note + now.md are both CT4b')
- CT5 (5/0): all + #5 integration/Mobius return

Hierarchy: CTx archetype → template type (daily-note, now, task-spec) → instantiation (DD-MM-YYYY.md)

### NOW Thread

Session-scoped bounded execution identity threading through all layers. Each NOW has session ID, Day parent, coordinate context, context frame, agent lineage. Session-scoped Gnosis notebooks for ad-hoc RAG.

### Environment Management

1Password + varlock for secrets. Per-runtime isolated venvs. `epi agent doctor` health checks.

## What Needs Replanning

1. **Each extension needs a proper CONTRACT.md** defining: what it owns, what it delegates, what primitives it provides (S), what QL augmentations it adds (S'), what M-branch data it touches (M).

2. **Agent definitions need review** — the existing .md files in anima/S4'/agents/ and aletheia/S5'/agents/ were written for the old pleroma plugin system. They need rewriting against the two-hemisphere orchestration model and the S/S'/M layer principle.

3. **Extension.ts files need planning** — each extension needs a PI runtime entry point. What tools, hooks, and commands does each register?

4. **The _staging/ folder** contains 21 skills and 6 orchestration skills that need classification: which extension do they belong to? Which are PI skills vs Claude Code skills? Which are obsolete?

5. **Inter-extension dependencies** need mapping — e.g., Anima calls Nous which uses Aletheia's Gnosis; Chronos uses Hen's template system; Khora bootstraps everything.

## Deliverable

For each of the 6 extensions, produce:
- **CONTRACT.md** — boundaries, ownership, delegates
- **Agent specs** (if applicable) — rewritten against orchestration model
- **S-level inventory** — what raw primitives exist or need building
- **S'-level inventory** — what QL augmentations are planned
- **M-level mapping** — which M-branch subsystems are touched, how
- **Staging disposition** — which _staging/ items belong here

## Reference Documents

These should be in the planning repo or accessible:
- `S4-TA-ONTA-EXTENSION-SPEC.md` — full ta-onta spec (Gnosis, orchestration, pipeline)
- `S4-NOW-INTEGRATION-AND-ENVIRONMENT.md` — NOW thread, Khora/Hen/Chronos inner layers, env management
- `S4-EXTENSION-ARCHITECTURE.md` — original 6-layer extension architecture
- `S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` — PI agent skill/plugin system
- `S4i-PLEROMA-PORT-MATRIX.md` — master classification of all ported skills/agents
- Existing agent .md files in `.pi/extensions/ta-onta/anima/S4'/agents/` and `.pi/extensions/ta-onta/aletheia/S5'/agents/`
- `_staging/README.md` — inventory of parked items with dispositions
