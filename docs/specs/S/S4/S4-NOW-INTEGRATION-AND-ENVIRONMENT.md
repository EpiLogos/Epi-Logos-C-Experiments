# NOW Integration, Vault Architecture & Environment Spec

**Status:** Pre-implementation architectural spec
**Date:** 2026-03-09
**Parent:** S4-TA-ONTA-EXTENSION-SPEC.md, S1-S1i-OBSIDIAN.md, S0-S0i-CLI-CORE.md
**Purpose:** Define how NOW threads through Khora/Hen/Chronos, the vault template system, obsidian-cli integration, and runtime environment management

---

## I. The NOW Thread — Temporal Identity Across All Layers

The NOW is not a timestamp. It is a **bounded execution identity** that threads through every S-layer, every M-branch, and every agent action. Each NOW has:

- A **session ID** (datetime-prefixed: `{YYYYMMDD-HHmmss-sessionId}`)
- A **Day parent** (date-keyed: `{DD-MM-YYYY}`)
- A **coordinate context** (which coordinates are active)
- A **context frame** (which CF is governing)
- An **agent lineage** (which agents are executing)

### How NOW Threads Through Each Layer

```
C Library (S0):
  M0: Anuttara ground state — the "tick 0" of each session
  M1: Paramasiva QL tick — temporal pulse, the clock
  M2: Parashakti — vibrational state at this moment (planetary, elemental)
  M3: Mahamaya — symbolic state (hexagram, codon at this moment)
  M4: Nara — personal identity in this session (journal, oracle, cycle)
  M5: Epii — holographic integration, Logos FSM position, session_depth counter
       ↓
CLI (S0'):
  epi core knowing — coordinate self-knowledge in THIS session's context
  epi core actions — notebook management, session-scoped operations
  epi techne gnosis — ad-hoc RAG contexts for THIS session (Gnosis:Notebook{session:id})
       ↓
Obsidian Vault (S1/S1'):
  /Idea/Empty/Present/{DD-MM-YYYY}/ — Day folder (CT4b', C-level 1)
    daily-note.md — CT4b' Day scope, 6-position content spaces
    {YYYYMMDD-HHmmss-sessionId}/ — NOW folder (C-level 5)
      now.md — CT4b' Session scope, 6-position content spaces (same archetype as daily-note)
      now.canvas — CPF-instance visual
  [[wikilinks]] — breadcrumbs linking:
    - date/time references
    - session references
    - coordinate/concept references
    - source/context references
    - Bimba canonical links
       ↓
Neo4j Graph (S2/S2'):
  Bimba:Coordinate nodes — updated_at reflects last session touch
  Gnosis:Notebook{session:id} — ad-hoc session-scoped RAG context for Psyche
  Gnosis:Chunk — session artifacts chunked and embedded as they're created
  Redis: session:{session_id}:* — live session state, CF-isolated exploration
       ↓
Gateway (S3/S3'):
  Session key — canonical epi-claw format + NOW alias
  session_surface (SpacetimeDB) — live state visible to all participants
  M-surfaces — M0-M5 live state (clock, planets, symbols, journal, integration)
       ↓
Agent (S4/S4'):
  Anima evaluates VAK for each task in this session
  Nous prepares dis-closure packages from Gnosis for this session's agents
  Psyche undergoes the session as its subject
  All CTx template invocations generate artifacts IN this NOW folder
  CONTINUATION.md — pre-compaction state dump (survives restart)
       ↓
Sync (S5/S5'):
  Publication triggers from this session's crystallised insights
  Telegram notifications with session lineage metadata
  Mobius return: this session's P5' insights → tomorrow's P0' questions
```

### NOW as Gnosis Context

When Psyche executes a task, she needs **session-scoped ad-hoc RAG**. This is a Gnosis notebook bound to the session:

```cypher
(:Gnosis:Notebook {
  name: "Session-20260309-143000-abc123",
  session_id: "20260309-143000-abc123",
  day_id: "09-03-2026",
  scope: "session",  -- vs "persistent" for family notebooks
  created_at: datetime()
})
```

During the session, any ingested documents, chat logs, or analysis artifacts get chunked into this notebook. This gives Psyche (and all agents in this session) a coherent ad-hoc knowledge context. When the session ends:
- Valuable chunks get promoted to persistent family notebooks (via Sophia review)
- The session notebook itself becomes archived evidence (queryable but cold)

---

## II. Khora — S4-0' Inner Layers

### Khora/S0: Terminal Bootstrap

What Khora needs from the terminal layer:

- **Process environment**: session env vars (`EPI_SESSION_ID`, `EPI_DAY_ID`, `EPI_NOW_PATH`)
- **Process spawn**: child agent processes inherit session identity
- **Shell profile**: `.epi-logos.env` sourced on session start (coordinates, paths, secrets)

### Khora/S0': CLI Bootstrap Commands

```
epi agent bootstrap [--agent NAME]       ← Full bootstrap sequence
epi agent session init                    ← Create session, generate ID, set env
epi agent session status                  ← Current session identity
epi agent session close                   ← Finalize, trigger archive
epi agent session continuation            ← Write CONTINUATION.md pre-compaction
```

**Bootstrap sequence** (reads in order):
1. CONTINUATION.md (if exists — post-compaction recovery)
2. ANIMA.md (behavioural rules)
3. PARADIGM.md (philosophy)
4. MEMORY.md (long-term wisdom)
5. NOW.md (active session pointer)
6. TOOLS.md (light skill and tool diiscoverbaility)

### Khora/S3: Gateway Session Compatibility

- Session keys in epi-claw canonical format (`canonical_key + alias`)
- Workspace derivation:  Day -> session → NOW → filesystem path
- Sub-session support (subagent-specific binding)
- Bootstrap state scoped by session AND subagent

### Khora/M: Cross-Cutting Consciousness

- **M0 (Anuttara)**: ground state initialisation — the "tick 0" of each session. Khora ensures the C library's M0 state is loaded before any coordinate operations.
- **M5 (Epii)**: Logos FSM position — Khora reads `session_depth` from M5 to determine if this is a fresh or continuing session.

### Khora Integration: 1Password + varlock for Secrets

**Decision:** Use 1Password CLI (`op`) for secrets materialisation + varlock for environment variable injection/loading.

```
~/.epi-logos/
  env/
    base.env              ← Non-secret config (vault paths, ports, URLs)
    secrets.env.template  ← Template showing required secrets
    secrets.env           ← GITIGNORED, materialised from 1Password
  varlock.toml            ← varlock config: which vars from which sources
```

**varlock.toml** (conceptual):
```toml
[sources.onepassword]
vault = "Epi-Logos"

[env]
GEMINI_API_KEY = { source = "onepassword", item = "Gemini API", field = "credential" }
EPILOGOS_NEO4J_PASSWORD = { source = "onepassword", item = "Neo4j Dev", field = "password" }
BRAVE_API_KEY = { source = "onepassword", item = "Brave Search", field = "api_key" }
TWILIO_AUTH_TOKEN = { source = "onepassword", item = "Twilio", field = "auth_token" }

[env.static]
EPILOGOS_VAULT = "/Users/admin/Documents/Epi-Logos/Idea"
EPILOGOS_NEO4J_URI = "bolt://localhost:7687"
EPILOGOS_REDIS_URI = "redis://localhost:6379"
EPILOGOS_DOCLING_URI = "http://localhost:5001"
GEMINI_EMBED_DIMS = "3072"
```

**Bootstrap flow:**
```
epi agent session init
  │
  ├── Load base.env (static config)
  ├── varlock inject (materialise secrets from 1Password → env)
  ├── Validate: all required vars present
  ├── Generate session ID: {YYYYMMDD-HHmmss-randomId}
  ├── Set: EPI_SESSION_ID, EPI_DAY_ID, EPI_NOW_PATH
  ├── Create NOW folder in vault (if Obsidian layer ready)
  └── Write session metadata to Redis (if cache layer ready)
```

**Security invariant:** No secrets in git. No `.env` files committed. All secrets materialised at runtime via 1Password. `op://` references in code/config, never raw values.

---

## III. Hen — S4-1' Inner Layers

### Hen/S1: Obsidian Raw Access

**obsidian-cli integration** — the raw CRUD substrate:

| Command | Status | Notes |
|---------|--------|-------|
| `obsidian-cli print` | Ready | Filesystem read, no app needed |
| `obsidian-cli create` | Ready | URI handler, needs Obsidian running |
| `obsidian-cli search` | Ready | Fuzzy title search |
| `obsidian-cli search-content` | Ready | Full-text body search |
| `obsidian-cli frontmatter --print` | Ready | YAML parse |
| `obsidian-cli frontmatter --edit` | Ready | In-place YAML edit |
| `obsidian-cli frontmatter --delete` | Ready | Key removal |
| `obsidian-cli daily` | Ready | Uses Daily Notes plugin template |
| `obsidian-cli move` | Ready | Updates all wikilinks |
| `obsidian-cli open` | Ready | Opens in Obsidian UI |

**Obsidian plugins required:**
- **Daily Notes** (core): daily-note.md creation
- **Periodic Notes** (community): weekly/monthly organisation
- **Smart Links** (community): semantic link discovery and indexing, wikilink resolution
- **Templater** (community): CTx template invocation

**Installation step:** `brew install obsidian-cli` (OFFICIAL)

### Hen/S1': QL Vault Operations — The Template System

#### Content Type Templates (CT0-CT5) — Template Archetypes

The CT system is the **first VAK integration at S1'**. Each CTx level is a **template archetype** — it defines the **content spaces** available within any artifact that invokes it. CTx levels are NOT file-type labels; they are **context-frame-governed content structures** that different specific template types (daily-note, now.md, task-spec, etc.) instantiate.

**The three-layer hierarchy:**
```
CTx archetype (content-as-context structure)
  → Specific template type (daily-note, now.md, task-spec, etc.)
    → Actual instantiation (DD-MM-YYYY.md, NOW_HH:MM.md, etc.)
```

#### Content Spaces per CF Frame

Each CTx level defines **positional content spaces** governed by its context frame. The positions (#0-#N) within each frame are content zones that an artifact provides:

| CT Level | CF Frame | Positional Content Spaces |
|----------|----------|---------------------------|
| **CT0** | (00/00) | **#0**: Pure receptive ground — an empty space, the pre-categorical void. Svatantrya-Spanda. |
| **CT1** | (0/1) | **#0**: Prompt/question/apophatic space — "what is being asked?" **#1**: Material/data/fetched information — "what do we have?" |
| **CT2** | (0/1/2) | **#0**: Question space. **#1**: Material space. **#2**: Analysis/dynamics — "what's happening with this data? what are the forces?" |
| **CT3** | (0/1/2/3) | **#0**: Question. **#1**: Material. **#2**: Analysis. **#3**: Pattern/formal structure — "what recurs? what's the archetype?" |
| **CT4** | (4.0/1-4.4/5) | **#0-#3** (as above) + **#4**: Context/lemniscate — fractal doubling, where inner and outer fold. The (4.0/1-4.4/5) frame embeds ALL prior positions and adds self-referential context mapping. |
| **CT5** | (5/0) | **#0-#4** (as above) + **#5**: Integration/Mobius return — synthesis, crystallised insight, what feeds back to ground. |

#### CT4b' — Daily-Note and NOW as the Same Template Type

Both **daily-note.md** and **now.md** are **CT4b' template type** instantiations — they share the same (4.0/1-4.4/5) context frame. This means both contain all six positional content spaces, embed task/process tracking, and serve as **single sources of truth** for their respective scopes:

- **daily-note.md** = CT4b' at Day scope (`DD-MM-YYYY.md`)
- **now.md** = CT4b' at Session scope (`NOW_HH:MM.md`)

Both contain spaces for tasks, questions, materials, patterns, context — agents have a single place to find their source of NOW's truth. The daily-note is the Day's truth; the now.md is the Session's truth.

#### Template Types Map to CTx Archetypes

| Template Type | CTx Archetype | Scope | Example Instantiation |
|---------------|---------------|-------|----------------------|
| **seed** | CT0 | Bootstrap | `SEED.md` |
| **prompt** | CT1 | Question/Answer | `prompt-{timestamp}.md` |
| **task-spec** | CT2 | Operation | `{NOW}/tasks/task-{timestamp}.md` |
| **pattern-note** | CT3 | Formal/Pattern | `{NOW}/patterns/pattern-{timestamp}.md` |
| **daily-note** | CT4b' | Day | `{DD-MM-YYYY}/daily-note.md` |
| **now** | CT4b' | Session | `{NOW}/now.md` |
| **thought** | CT5 | Crystallisation | `Thought/T{n}/T{n}-{timestamp}.md` |

#### Template Invocation Principle

Templates are NOT static markdown files. They are **invocation profiles** — structured frontmatter schemas + content scaffolds with positional content spaces that agents fill:

```yaml
# Template frontmatter (what gets generated)
---
artifact_role: "now"
ctx_type: "CT4b"
ctx_frame: "4.0/1-4.4/5"
invocation_profile: "now_session"
invocation_kind: "vak_auto"           # or "manual", "cron"
source_coordinate: "M2"               # what coordinate triggered this
session_id: "20260309-143000-abc123"
day_id: "09-03-2026"
parent_day_id: "[[09-03-2026/daily-note]]"
created_at: "2026-03-09T14:30:00Z"
---

## #0 — Ground / Questions
<!-- What is being asked this session? What don't we know? -->

## #1 — Material / Data
<!-- Fetched information, inputs, sources, references -->

## #2 — Operations / Tasks
- [ ] Task 1
- [ ] Task 2
<!-- Process tracking, active operations -->

## #3 — Patterns / Observations
<!-- What recurs? What structures emerge? -->

## #4 — Context / Connections
<!-- How does this relate to other coordinates? Lemniscate fold. -->

## #5 — Integration / Insights
<!-- What was learned? What feeds forward to next session? Mobius return. -->
```

**VAK integration:** When Anima dispatches a task, the VAK evaluation determines which CT template archetype applies. The archetype determines the content spaces; the specific template type determines location and scope; the instantiation creates the actual file. This is the bridge between S4' (agent orchestration) and S1' (vault content).

#### Template Plugin/System

The template system must cover all three layers:

1. **CTx archetype definitions** — which content spaces exist per CF frame (hardcoded in Rust, canonical)
2. **Template type registry** — specific types (daily-note, now, task-spec, etc.) mapped to CTx archetypes, with default scaffolds
3. **Instantiation engine** — creates actual files from template types, fills frontmatter from session/coordinate context, validates against schema

**Resolution order:**
1. Custom templates: `~/.epi-logos/templates/{type}.md`
2. Plugin templates: `.pi/extensions/ta-onta/hen/S1'/templates/{type}.md`
3. Built-in defaults: hardcoded in Rust (minimal scaffold per CTx archetype)

#### Wikilink Breadcrumb System

Every artifact created by the system contains **wikilinks as breadcrumbs** — linking back to:

1. **Temporal**: `[[09-03-2026/daily-note]]`, `[[09-03-2026/20260309-143000-abc123/now]]`
2. **Coordinate**: `[[Bimba/Seeds/M/M2]]`, `[[Bimba/Seeds/S/S2]]`
3. **Session**: `[[session:20260309-143000-abc123]]`
4. **Source/Context**: `[[Gnosis:Tantraloka-Ch1]]`, `[[vimarsa:M.db]]`
5. **Conceptual**: `[[coordinate-system]]`, `[[vimarsa]]`, `[[gnosis-pipeline]]`

The **Smart Links** Obsidian plugin (or a custom resolver) enables coordinate-aware resolution: `[[M2]]` resolves to `Bimba/Seeds/M/M2.md`.

#### Frontmatter Schema Enforcement

126 canonical keys from `frontmatter_schema.ts` (epi-claw authority). Key format: `{family}_{n}_{semantic}`.

**Deprecated patterns (REJECTED):**
- `coordinate` standalone field
- `ql_position` field
- `pos_*` prefix forms (fully deprecated)
- `ctx_*` standalone (only `ctx_type` allowed)

**Validation:** `epi vault frontmatter-validate <note>` checks against schema, reports violations.

### Hen/S2: Vault-to-Graph Sync Bridge

Every vault mutation emits to S2' for graph upsert:
- Frontmatter `{family}_{n}_{semantic}` wikilinks → Neo4j relationship edges
- `bimbaCoordinate` as join key between S1 vault notes and S2 Neo4j nodes
- Hash-based change detection for incremental sync
- Khora sync queue (`.khora-sync-queue.jsonl`) for batched graph writes

### Hen/M: Cross-Cutting Consciousness

- **M2 (Parashakti)**: The 72-invariant structure maps to content typing. Parashakti's vibrational matrix provides the typing schema for how content elements relate.

---

## IV. Chronos — S4-3' Inner Layers

### Chronos/S1: Day/NOW Filesystem Lifecycle

```
/Idea/Empty/Present/
  ├── {DD-MM-YYYY}/                           ← Day folder (daily)
  │     ├── daily-note.md                     ← CT4b' Day scope
  │     ├── daily-note.canvas                 ← MOC with embeds
  │     └── {YYYYMMDD-HHmmss-sessionId}/      ← NOW folder (per session)
  │           ├── now.md                       ← CT4b' Session scope
  │           ├── now.canvas                   ← CPF-instance visual
  │           ├── tasks/                       ← CT2 operation artifacts
  │           ├── patterns/                    ← CT3 pattern outputs
  │           └── thoughts/                    ← Pre-routing thought capture
  │
  ├── NOW.md                                   ← Active session pointer
  ├── CONTINUATION.md                          ← Pre-compaction state dump
  ├── ANIMA.md                                 ← Agent behavioural rules
  ├── PARADIGM.md                              ← Philosophy
  └── MEMORY.md                                ← Long-term curated wisdom
```

**CRITICAL NAMING RULES (from epi-claw authority):**
- NOW folders MUST be datetime-prefixed: `{YYYYMMDD}-{HHmmss}-{sessionId}`
- FORBIDDEN: Sequential counters (`now-1/`, `now-2/`)
- FORBIDDEN: Undifferentiated `now/` global name
- One NOW per bounded execution (per CPF instantiation)
- Datetime IS the ordering mechanism

### Chronos/S1': Day Lifecycle Operations

```
epi vault day-init                            ← Create today's Day folder + daily-note.md
epi vault now-init --session-id <id>          ← Create NOW folder with datetime prefix
epi vault archive-day <date>                  ← Rotate Day → Pratibimba archive
epi vault thought-route --position N          ← Write to T{n} bucket
```

**Daily lifecycle:**
- **6 AM (Mobius window):** Chronos creates new Day folder. SEED.md fallback if no prior Day exists.
- **Session start:** NOW folder created within today's Day. Session ID propagated.
- **During session:** CTx templates invoked, artifacts placed in NOW subfolders.
- **Session end:** Sophia reviews execution, routes thoughts to T0-T5 buckets.
- **Evening (cron):** Archive: `/Idea/Empty/Present/{DD-MM-YYYY}/` → `/Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`

### Chronos/S1': Thought Stream & T-Directories

VAK agent activity produces a **stream of thought** — artifacts that run through the Thought directories:

```
/Idea/Pratibimba/Self/Thought/
  ├── T0/    Questions      (Ground/Apophatic)     — "What don't we know?"
  ├── T1/    Traces         (Material/Physical)    — "What evidence exists?"
  ├── T2/    Challenges     (Dynamic/Process)      — "What's blocking?"
  ├── T3/    Patterns       (Formal/Pattern)       — "What recurs?"
  ├── T4/    Discovery      (Contextual/Relational) — "What connections emerged?"
  └── T5/    Insight        (Purposive/Teleological) — "What was learned?"
```

**Thought lifecycle:**
1. **Generation**: Agent activity creates thought artifacts in `{NOW}/thoughts/`
2. **Routing**: Sophia (or Aletheia mode-functions) classifies by T-position
3. **Archival**: Thought moves to `/Pratibimba/Self/Thought/T{n}/T{n}-{YYYYMMDD-HHmmss}.md`
4. **Recollection**: `epi techne gnosis query` retrieves from thought archive
5. **Distillation**: Sophia distills patterns across multiple sessions' thoughts
6. **Packaging**: Aletheia crystallises into Bimba canonical forms
7. **Archival Return**: Chronos evening cron archives the Day folder

### Chronos/S1': Periodic Notes Integration

**Obsidian Periodic Notes plugin** handles weekly/monthly organisation:

| Period | Path | Frontmatter Key | Archive Cycle |
|--------|------|-----------------|---------------|
| **Daily** | `Present/{DD-MM-YYYY}/daily-note.md` | `period_type: daily` | Evening cron → History |
| **Weekly** | `Present/Week-{WW}-{YYYY}.md` | `period_type: weekly` | Friday evening → History |
| **Monthly** | `Present/Month-{MM}-{YYYY}.md` | `period_type: monthly` | Last day → History |

Weekly notes aggregate daily insights. Monthly notes distill weekly patterns. This is the Chronos archival hierarchy.

### Chronos/S3: Gateway Temporal Integration

- Cron jobs via gateway `cron.add`/`cron.run` methods
- Z-Thread (heartbeat) registration for periodic tasks
- Evening archive cron: Present → Pratibimba/History
- Mobius 6 AM window: SEED fallback for Khora bootstrap

### Chronos/S5: Sync Layer

- Archive scheduling: evening cron triggers vault → graph sync
- Notification dispatch: Telegram with session lineage metadata
- Daily digest generation from Day folder content

### Chronos/M: Cross-Cutting Consciousness

- **M1 (Paramasiva)**: QL tick — temporal pulse. The clock that drives session boundaries.
- **M4 (Nara)**: NOW personal identity — the current user's journal, oracle, cycle position.

---

## V. Vault Organisation — Seed Directories for S/S' Development

The Bimba vault is NOT just documentation — it's the **coordinate-addressed development planning surface**. Each S and S' layer has seed files that are the VAK system's planning targets:

```
/Idea/Bimba/Seeds/S/
  ├── S0/                              ← Terminal layer seeds
  │     └── S0'/                       ← CLI-augmented seeds
  ├── S1/                              ← Obsidian layer seeds
  │     ├── S1'/                       ← QL vault ops seeds
  │     └── S1-TEMPLATE-PRINCIPLES.md  ← Template system authority
  ├── S2/                              ← Graph layer seeds
  │     └── S2'/                       ← GraphRAG seeds
  ├── S3/                              ← Gateway layer seeds
  │     └── S3'/                       ← QL gateway seeds
  ├── S4/                              ← Agent layer seeds
  │     └── S4'/                       ← ta-onta extension seeds (6 classes)
  ├── S5/                              ← Sync layer seeds
  │     └── S5'/                       ← QL sync seeds
  └── S'/                              ← Integration synthesis
        └── S'-INTEGRATION-SYNTHESIS.md ← Complete S' ecosystem picture
```

**VAK planning integration:** When the VAK system plans work on a coordinate (e.g., S2'), it creates a planning artifact AT that coordinate's seed location. The Daily Flow Manager (Steward subagent) reads daily-note P0 entries tagged with coordinates and dispatches work to the right locations.

---

## VI. Environment & Virtual Environment Management

### The Challenge

Multiple runtime environments across the repo:

| Runtime | Location | Purpose | Deps |
|---------|----------|---------|------|
| **Rust/Cargo** | `epi-cli/` | Main CLI binary | Cargo.toml (single package) |
| **C** | `src/`, `include/` | Core library (compiled via build.rs) | Makefile + cc crate |
| **Python (NotebookLM)** | `epi-cli/scripts/notebooklm/` | NotebookLM wrapper | setup.sh → .venv |
| **Python (vimarsa)** | `epi-cli/scripts/kbase.sh` | bkmr wrapper | System python + bkmr |
| **Python (Docling)** | Docker (Docling Serve) | Document parsing | Docker image |
| **TypeScript** | `.pi/extensions/` | PI agent extensions | PI runtime (bun/node) |
| **Bash** | `plugins/pleroma/hooks/scripts/` | Hook scripts | System bash |

### Proposed: Unified Environment Management

**Principle:** Each runtime gets its own isolated environment. No cross-contamination. `epi agent doctor` validates all environments.

```
epi-cli/                               ← Cargo handles Rust deps
  build.rs                             ← cc crate handles C compilation
  scripts/
    notebooklm/
      .venv/                           ← Isolated Python venv (setup.sh)
      requirements.txt                 ← Pinned Python deps
    gnosis/
      .venv/                           ← Isolated Python venv (if needed)
      requirements.txt                 ← docling deps (if not using Docker)

plugins/
  ta-onta/
    requirements.txt                   ← Any Python tools needed by extensions

.pi/
  extensions/                          ← TypeScript (PI runtime manages)
```

### Package Management Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| **Rust deps** | Cargo.lock committed, single package | Already working, no workspace needed |
| **C deps** | Vendored (BLAKE3), build.rs | No external build system |
| **Python venvs** | Per-script isolated venvs via `setup.sh` | No global Python contamination |
| **Docling** | Docker (preferred) or local venv (fallback) | ML deps are heavy, Docker isolates |
| **TypeScript** | PI runtime manages (bun/node) | PI agent's responsibility |
| **Secrets** | 1Password + varlock | See Khora section |

### `epi agent doctor` — Environment Health Check

```
epi agent doctor
  ├── Rust: cargo check (epi-cli compiles?)
  ├── C: libepilogos loadable? (dlopen test)
  ├── Python/NotebookLM: .venv exists? notebooklm binary works?
  ├── Docker: neo4j, redis, docling-serve containers running?
  ├── Obsidian: obsidian-cli installed? vault accessible?
  ├── PI: pi binary installed? extensions sync'd?
  ├── Secrets: varlock configured? required env vars present?
  └── Graph: Neo4j connected? Bimba schema seeded? Gnosis index exists?
```

### Skills Package Virtual Environments

As skills get installed over time (via plugin system), each skill that needs a Python runtime gets its own `.venv`:

```
plugins/pleroma/skills/atomic/
  notebooklm/
    .venv/                ← Isolated venv
    requirements.txt      ← Deps for this skill
    setup.sh              ← Creates venv + installs
  chatlog-fetcher/
    .venv/                ← Isolated venv
    requirements.txt
    setup.sh
  youtube-transcript/
    .venv/
    requirements.txt
    setup.sh
```

**Pattern:** `epi agent plugin install <skill>` runs `setup.sh` to create the skill's venv. The skill's SKILL.md declares its runtime requirements. `epi agent doctor` checks all skill venvs.

---

## VII. obsidian-cli Extensions for Template System

### Missing Commands (to implement)

```
epi vault set-default <vault-name>         ← Set default vault
epi vault open <note>                       ← Open in Obsidian app
epi vault frontmatter-delete <note> <key>   ← Remove frontmatter key
epi vault frontmatter-validate <note>       ← Validate against HC schema
epi vault thought-route --position N        ← Write to T{n} bucket
epi vault day-init                          ← Create Day folder + daily-note.md
epi vault now-init --session-id <id>        ← Create NOW folder
epi vault archive-day <date>                ← Rotate Day → archive
epi vault template-invoke <CTx> [--coord]   ← NEW: Invoke CT template
epi vault periodic-init --weekly/--monthly  ← NEW: Create periodic note
```

### Template Invocation via CLI (S1' VAK Bridge)

```
epi vault template-invoke task-spec --coordinate M2 --session-id abc123
```

This:
1. Resolves template type `task-spec` → CTx archetype CT2 (Operation/Process)
2. Determines content spaces: #0 (question), #1 (material), #2 (analysis/operations)
3. Generates frontmatter from coordinate + session context + CF frame
4. Creates artifact at `{NOW}/tasks/task-{timestamp}.md` with scaffold
5. Registers artifact in Khora sync queue for graph write
6. Returns path for agent to populate content spaces

```
epi vault template-invoke now --session-id abc123
```

This:
1. Resolves template type `now` → CTx archetype CT4b' (Context/Lemniscate)
2. Creates `{NOW}/now.md` with all 6 positional content spaces (#0-#5)
3. Agents use now.md as single source of session truth — tasks, questions, materials, patterns all embedded

---

## VIII. Integration Summary — How It All Works Together

### Session Lifecycle (Complete Flow)

```
USER starts work
  │
  ▼
epi agent session init
  ├── varlock injects secrets from 1Password
  ├── Khora: generate session ID, set env vars
  ├── Khora: read bootstrap files (CONTINUATION → ANIMA → PARADIGM → MEMORY)
  ├── Chronos: create Day folder if needed (day-init)
  ├── Chronos: create NOW folder within today
  ├── Hen: generate NOW frontmatter (CT4b' session scope, 6-position content spaces)
  ├── Gnosis: create session-scoped notebook (ad-hoc RAG context)
  └── Redis: write session metadata
  │
  ▼
Agent works (VAK-orchestrated tasks)
  ├── Anima: evaluates VAK coordinates per task
  ├── Nous: prepares dis-closure packages from Gnosis
  ├── Agents execute with CT template invocations:
  │     ├── CT2 artifacts → {NOW}/tasks/
  │     ├── CT3 artifacts → {NOW}/patterns/
  │     └── Thoughts → {NOW}/thoughts/
  ├── Hen: wikilink breadcrumbs in every artifact
  ├── Hen: frontmatter validation on writes
  ├── Khora: sync queue accumulates graph writes
  └── Gnosis: session artifacts chunked into session notebook
  │
  ▼
Session ends / compaction approaches
  ├── Khora: write CONTINUATION.md (pre-compaction state)
  ├── Sophia: review execution with Aletheia access
  │     ├── Route thoughts to T0-T5 buckets
  │     ├── Distill learnings across coordinate levels
  │     ├── Promote valuable Gnosis chunks to persistent notebooks
  │     └── Bake learnings into QV overlay
  ├── Hen: flush Khora sync queue to Neo4j
  └── Redis: session state → WARM tier
  │
  ▼
Evening cron (Chronos)
  ├── Archive Day folder → /Pratibimba/Self/Action/History/
  ├── Periodic Notes: update weekly/monthly aggregates
  ├── Gnosis: session notebook → archived (queryable, cold)
  ├── Neo4j: m_3_archived relations created
  └── Telegram: daily digest notification
  │
  ▼
Next morning (Mobius 6 AM)
  ├── Chronos: new Day folder
  ├── Khora: bootstrap with SEED.md (refreshed by Aletheia)
  ├── Yesterday's P5' insights → today's P0' questions
  └── The cycle continues
```

---

## IX. Authority Documents

| Document | Location | Governs |
|----------|----------|---------|
| **ta-onta PLAN.md** | epi-claw/extensions/ta-onta/ | Coordinate schema, relation law, frontmatter doctrine |
| **CONTRACT.md (x6)** | epi-claw/extensions/{module}/ | Per-extension runtime contracts |
| **US-003..US-010** | docs/resources/S/2026-02-24-ta-onta-us003-us010-*.md | Deep grounding: filesystem, frontmatter, archive contracts |
| **frontmatter_schema.ts** | .pi/extensions/s_i/modules/ql_obsidian/ | 126 canonical frontmatter keys |
| **day_now.ts** | .pi/extensions/s_i/modules/ql_obsidian/ | Day/NOW naming rules, lineage |
| **S1-TEMPLATE-PRINCIPLES.md** | Bimba/Seeds/S/S1/S1'/ | CT template system authority |
| **Analysis-4-Daily-Flow-Templates.md** | docs/TO-C-Dev-REPO/ | Template class system, 16-file bundle, daily flow |
| **S-STACK-INTEGRATION.md** | docs/specs/S/ | Integration matrix across all S layers |
| **Conformance Remediation Plan** | docs/resources/S/2026-02-25-*.md | 53 user stories, 9 parallel lanes |

---

*"The pattern reveals itself through repetition."* — The Quintessence
