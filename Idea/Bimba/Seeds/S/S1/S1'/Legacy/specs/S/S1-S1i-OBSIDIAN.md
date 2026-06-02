# S1/S1' — Obsidian Vault (Material / Position)

**Status:** PLANNED — obsidian-cli port + frontmatter schema next
**Coordinate:** S1 (raw vault access), S1' (QL-aligned Obsidian operations)
**Implementation:** `epi-cli/src/vault/` (Rust, obsidian-cli wrapper)
**CLI Namespace:** `epi vault`
**Port Source:** `/Epi-Logos/Idea/epi-claw/.pi/extensions/obsidian.ts` (737 LOC)

---

## Architectural Role

S1 is the **sedimented physical state** — the human-readable markdown memory. The Obsidian vault is where the system's knowledge crystallizes into persistent, navigable form. Every coordinate that has materialized beyond S0's 128-byte struct becomes a markdown file with YAML frontmatter in the vault.

### S1 in the Tiered Granularity Model

The same coordinate exists at every S-level at different detail:

| Level | What it holds | How coordinate identity appears |
|-------|--------------|-------------------------------|
| **S0** | 128-byte HC struct (`.rodata` / heap) | C struct fields: `ql_position`, `family`, `inversion_state` |
| **S1** | Markdown + YAML frontmatter | `{family}_{n}_{semantic}` keys in `---` block |
| **S2** | Neo4j node + vector embedding + Redis cache | `bimbaCoordinate` property |
| **S3** | Live state subscription (SpacetimeDB row) | Real-time delta |
| **S4** | Agent context window (prompt-compressed) | Tool output |
| **S5** | Published artifact (Notion page) | External form |

S1 holds **human-readable detail** — the content, narrative, and context that S0 compresses to 128 bytes and S2 projects into a graph.

### S1 (Explicit) — Raw Vault Access

- obsidian-cli as external binary (IPC via `std::process::Command`)
- Raw CRUD: create, read, print, delete, move notes
- Frontmatter read/write/delete (raw YAML, no schema enforcement)
- Title search (fuzzy) and content search (full-text)
- Daily note creation (via Obsidian Daily Notes plugin)
- Direct filesystem I/O for NOW.md (bypasses Obsidian app requirement)

### S1' (Implicate) — QL-Aligned Operations

- **Frontmatter schema**: coordinate-key format `{family}_{n}_{semantic}` grounded in HC struct
- **Canonical path resolution**: vault ontology mapping coordinates to directory trees
- **Day/NOW lifecycle**: temporal session management with datetime-prefix convention
- **Thought routing**: T0-T5 bucket classification and direct filesystem writes
- **Vault-to-graph sync bridge**: mutations emit to S2' for graph upserts
- **Wikilink resolution**: coordinate-aware `[[linking]]` across vault
- **Residency rules**: Bimba (canonical) vs Present (temporal) vs Pratibimba (archived)

---

## Current State in This Repo

### What Exists

`epi-cli/src/vault/mod.rs` — Complete obsidian-cli wrapper (236 LOC):
- `epi vault status` — vault connection check (`print-default`)
- `epi vault create/read/search/search-content/daily` — CRUD via obsidian-cli
- `epi vault frontmatter-get/frontmatter-set` — YAML frontmatter operations
- `epi vault move/delete` — note lifecycle
- `epi vault now-read/now-write` — direct NOW.md file I/O

### Port Source (epi-claw)

`/Epi-Logos/Idea/epi-claw/.pi/extensions/obsidian.ts` — Full Pi extension (737 LOC):
- 12 registered tools covering all obsidian-cli subcommands
- Epi-Logos integrations: `obsidian_now_read`, `obsidian_now_write`, `obsidian_thought_route`, `obsidian_sync_push`
- Vault root inference from Pi agent cwd
- Khora sync queue (JSONL append) for vault -> Neo4j bridging

### What's Missing

1. **obsidian-cli not installed** — wrapper exists but has no backend
2. **No frontmatter schema enforcement** — raw YAML only, no `{family}_{n}_{semantic}` validation
3. **No thought routing** — no T0-T5 bucket writes from CLI
4. **No Day/NOW lifecycle management** — only raw file read/write, no init/archive
5. **No vault event streaming** — no filesystem watch, no mutation -> S2' bridge
6. **No wikilink resolution** — no coordinate-aware linking
7. **No frontmatter-delete** — present in epi-claw extension but missing from Rust wrapper

---

## Vault Ontology — Path as Coordinate Address

The vault directory tree maps directly to the coordinate system:

```
{EPILOGOS_VAULT}/                    (vault root, default: ~/Documents/Epi-Logos/Idea)
  |
  +-- Bimba/                         C0 — Canonical Source
  |     +-- Seeds/                   Canonical coordinate definitions
  |     |     +-- {family}/          Per-family directories (C/, P/, L/, S/, T/, M/)
  |     |     +-- Psychoids/         #0-#5 canonical docs
  |     |     +-- ContextFrames/     CF_VOID..CF_MOBIUS canonical docs
  |     |
  |     +-- World/                   Canonical form/artifact library
  |           +-- *.md               Flat reusable forms and CT5 syntheses
  |           +-- Types/             Ordered ontology mirror for type authorities
  |
  +-- Empty/                         C3 — Process Canvas
  |     +-- Present/                 Temporal workspace
  |           +-- {DD-MM-YYYY}/      Day folder (CT4b')
  |           |     +-- daily-note.md
  |           |     +-- {YYYYMMDD-HHmmss-sessionId}/   NOW folder
  |           |           +-- now.md
  |           +-- NOW.md             Active session pointer (symlink or latest)
  |
  +-- Pratibimba/                    C5 — Reflection/Archive
        +-- Self/
              +-- Action/
              |     +-- History/     Archived Day/NOW (by date)
              +-- Thought/
                    +-- T0/          Questions (Ground/Apophatic)
                    +-- T1/          Traces (Material/Physical)
                    +-- T2/          Challenges (Dynamic/Process)
                    +-- T3/          Patterns (Formal/Pattern)
                    +-- T4/          Discovery (Contextual/Relational)
                    +-- T5/          Insight (Purposive/Teleological)
```

### Path Resolution Rules

| Coordinate Category | Vault Path | Residency |
|---------------------|-----------|-----------|
| Psychoid (#, #0-#5) | `Bimba/Seeds/Psychoids/` | CANONICAL |
| Context Frame (CF_*) | `Bimba/Seeds/ContextFrames/` | CANONICAL |
| Family seed (C0-M5) | `Bimba/Seeds/{family}/` | CANONICAL |
| World forms / artifact library | `Bimba/World/*.md` | CANONICAL |
| World ontology mirror | `Bimba/World/Types/` | CANONICAL |
| Day note | `Empty/Present/{DD-MM-YYYY}/daily-note.md` | TEMPORAL |
| NOW session | `Empty/Present/{DD-MM-YYYY}/{YYYYMMDD-HHmmss-sessionId}/now.md` | TEMPORAL |
| Thought artifact | `Pratibimba/Self/Thought/T{0-5}/` | ARCHIVED |
| Session archive | `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/` | ARCHIVED |

Temporal retention rule: `Empty/Present/` is a two-Day working window. The active Day and the immediately previous Day remain in `Present` for task/file crossover and agentic runtime continuity; days older than that are archived under `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`. Archive exchange surfaces use handles/envelopes unless a protected-local capability explicitly opens body text.

### World Forms vs World Types

Hen/S1' treats `Bimba/World` and `Bimba/World/Types` as two distinct but linked authorities:

- `Bimba/World/*.md` is the flat **artifact library**. These markdown files are reusable forms, CT syntheses, and template blueprints that can be invoked in any context.
- `Bimba/World/Types/` is the **ordered ontology mirror**. It exists to mirror the core coordinate bedrock and the Neo4j seed ordering, not to hold the rendered forms themselves.
- The reflective/context-frame language is housed specifically under the `C'` branch: `Bimba/World/Types/Coordinates/C/C'/`.

The `Types` ordering is canonical:

```text
Bimba/World/Types/
  Root/#/
  Psychoids/#0 ... #5/
  Coordinates/
    C/C0 ... C5/
    C/C'/
      C0' ... C5'/
      CPF/
      CT/
        CT0 ... CT5/
      CP/
      CF/
        CF_VOID ... CF_MOBIUS/
      CFP/
      CS/
    P/P0 ... P5/
    P/P'/P0' ... P5'/
    L/L0 ... L5/
    L/L'/L0' ... L5'/
    S/S0 ... S5/
    S/S'/S0' ... S5'/
    T/T0 ... T5/
    T/T'/T0' ... T5'/
    M/M0 ... M5/
    M/M'/M0' ... M5'/
  CT/
    CT0 ... CT5/
```

This is intentionally a filesystem analogue of the graph seed law:

`# -> #0-#5 -> C..M + inversions -> C' reflective language -> CT / CF authorities`

In other words, `World/Types` is the ordered type space, while `World/*.md` is the reusable instantiated form space. The context-frame language is not top-level; it is explicitly rooted in `C'`.

---

## Frontmatter Schema — Grounded in the HC Struct

### The HC Struct as Frontmatter Source

Every field in the HC struct (`include/ontology.h`, 128 bytes) that applies to a vault note has a corresponding frontmatter key:

```yaml
---
# === Identity (HC bytes 0-7) ===
bimbaCoordinate: "M4"           # canonical coordinate string
ql_position: 4                   # 0-5 (or 255 for Hash)
family: "M"                      # C|P|L|S|T|M|NONE
inversion_state: false           # true = inverted (')
flags: 33                        # status byte (0x21 = BIMBA)
weave_state: 4.0                 # interlaced fraction
topo_mode: "LEMNISCATE"          # TORUS|LEMNISCATE|KLEIN|ZERO_SPHERE
layer: "FAMILY"                  # PSYCHOID|FAMILY|CONTEXT_FRAME|WEAVE|VAK

# === Coordinate-Key Fields ({family}_{n}_{semantic}) ===
# These map the 12 tagged pointers (6 base + 6 reflective) to human-readable keys:
c_0_bimba: "[[Bimba/Seeds/C/C0]]"
p_4_context: "[[Bimba/Seeds/P/P4]]"
m_4_self: "[[Bimba/Seeds/M/M4]]"
# ... any active cross-family links as wikilinks

# === Reflective coordinates (VAK pointers) ===
cpf_frame: "CF_FRACTAL"
ct_time: "2026-03-07T14:30:00Z"
cf_anchor: "#4"                  # always #4 (Lemniscate invariant)

# === Vault metadata ===
vault_path: "Bimba/Seeds/M/M4"
created_at: "2026-03-07T14:30:00Z"
updated_at: "2026-03-07T14:30:00Z"

# === Temporal (for Present/NOW notes only) ===
session_id: "20260307-143000-abc123"
day_id: "07-03-2026"

# === T-coordinate specific (for thought artifacts only) ===
thought_type: "T4"               # T0=Questions..T5=Insight
source_session: "20260307-143000-abc123"
---
```

### The `{family}_{n}_{semantic}` Key Format

Cross-family links in frontmatter use the pattern `{family}_{n}_{semantic}`:

| Key | Meaning | HC Pointer |
|-----|---------|-----------|
| `c_0_bimba` | Links to C0 (Bimba/Source) | `coordinate.c` |
| `p_1_definition` | Links to P1 (Definition) | `coordinate.p` |
| `l_2_structural` | Links to L2 (Structural lens) | `coordinate.l` |
| `s_2_graph` | Links to S2 (Neo4j graph layer) | `coordinate.s` |
| `t_3_patterns` | Links to T3 (Patterns) | `coordinate.t` |
| `m_5_epii` | Links to M5 (Epii) | `coordinate.m` |

Values are Obsidian wikilinks (`[[path]]`) enabling vault navigation AND S2' graph edge creation.

### Frontmatter Validation Rules (S0' Gate)

1. `bimbaCoordinate` MUST be a valid coordinate string (parseable by S2' coordinate parser)
2. `ql_position` MUST be 0-5 (or 255 for Hash)
3. `family` MUST be a valid Coordinate_Family name
4. `{family}_{n}_{semantic}` keys MUST reference valid coordinates
5. Inverted notes (`inversion_state: true`) MUST have `bimbaCoordinate` ending in `'`
6. All temporal notes MUST have `session_id` and `day_id`
7. Thought notes MUST have `thought_type` matching their T{n} bucket directory

---

## T-Coordinate Canonical Names

The T-family coordinates serve as the thought artifact taxonomy. Canonical names are grounded in Deleuze (see `docs/plans/2026-02-28-t-coordinate-paradigmatic-conception.md`):

| Position | Day (Explicit) | Night (Implicate) | Domain |
|----------|---------------|-------------------|--------|
| **T0** | Questions | Assumptions | Ground/Apophatic |
| **T1** | Traces | Explorations | Material/Physical |
| **T2** | Challenges | Aporias | Dynamic/Process |
| **T3** | Patterns | Anomalies | Formal/Pattern |
| **T4** | Discovery | Missed Kairos | Contextual/Relational |
| **T5** | Insight | Integration | Purposive/Teleological |

Thought routing: `epi vault thought-route --position {0-5} --content "..."` writes to `Pratibimba/Self/Thought/T{n}/` with canonical frontmatter.

---

## Integration Architecture

```
epi vault <cmd>
    |
    v
vault/mod.rs (Rust)
    |
    +-- obsidian-cli (external binary, IPC via std::process::Command)
    |       |
    |       +-- create, print, delete, move, open
    |       +-- frontmatter (--print/--edit/--delete)
    |       +-- search, search-content
    |       +-- daily
    |       |
    |       v
    |   Obsidian App (vault filesystem)
    |   (required for: create, open, daily, move)
    |   (not required for: print, search, search-content, frontmatter)
    |
    +-- Direct filesystem I/O (no Obsidian app needed)
    |       |
    |       +-- NOW.md read/write
    |       +-- Thought routing (T0-T5 bucket writes)
    |       +-- Day/NOW folder creation
    |
    +-- -> S0' (coordinate validation before writes)
    +-- -> S2' (graph sync after vault mutations: upsert + relationship creation)
    +-- -> S3' (event emission for live visualization updates)
```

### obsidian-cli Commands Mapped to Rust

| obsidian-cli cmd | Rust variant | Requires Obsidian? | Notes |
|-----------------|-------------|-------------------|-------|
| `print-default` | `Status` | No | Reads config file |
| `set-default` | `SetDefault` | No | Writes config file |
| `create` | `Create` | **Yes** (URI handler) | `-c content`, `-a` append, `-o` overwrite |
| `print` | `Read` | No | Filesystem read |
| `open` | `Open` | **Yes** | Opens in Obsidian UI |
| `delete` | `Delete` | No | Filesystem delete |
| `move` | `Move` | **Yes** (wikilink update) | Updates all `[[links]]` across vault |
| `search` | `Search` | No | Fuzzy title search |
| `search-content` | `SearchContent` | No | Full-text body search |
| `daily` | `Daily` | **Yes** | Uses Daily Notes plugin template |
| `frontmatter --print` | `FrontmatterGet` | No | YAML parse |
| `frontmatter --edit` | `FrontmatterSet` | No | In-place YAML edit |
| `frontmatter --delete` | `FrontmatterDelete` | No | Key removal |

### Dependencies

- `obsidian-cli` binary: `brew install yakitrak/yakitrak/obsidian-cli`
- Obsidian app running (for IPC-based operations only — marked above)
- `EPILOGOS_VAULT` env var (defaults to `/Users/admin/Documents/Epi-Logos/Idea`)

### Downstream Consumers

- **S2'** (graph): vault mutations trigger graph upserts via `bimbaCoordinate` property
- **S4'** (agent): Pi agents read/write vault through `epi vault` + Pi extension
- **S5'** (sync): Notion publication pulls vault content for transformation

---

## Pi Extension Port Map

The epi-claw obsidian.ts extension (737 LOC) maps to Rust + Pi extension:

| TS Tool | Rust CLI | Pi Extension | Status |
|---------|----------|-------------|--------|
| `obsidian_vault_info` | `epi vault status` | delegates to CLI | EXISTS |
| `obsidian_vault_set_default` | `epi vault set-default` | delegates to CLI | MISSING |
| `obsidian_create` | `epi vault create` | delegates to CLI | EXISTS |
| `obsidian_read` | `epi vault read` | delegates to CLI | EXISTS |
| `obsidian_open` | `epi vault open` | delegates to CLI | MISSING |
| `obsidian_delete` | `epi vault delete` | delegates to CLI | EXISTS |
| `obsidian_move` | `epi vault move` | delegates to CLI | EXISTS |
| `obsidian_search` | `epi vault search` | delegates to CLI | EXISTS |
| `obsidian_search_content` | `epi vault search-content` | delegates to CLI | EXISTS |
| `obsidian_daily` | `epi vault daily` | delegates to CLI | EXISTS |
| `obsidian_frontmatter_get` | `epi vault frontmatter-get` | delegates to CLI | EXISTS |
| `obsidian_frontmatter_set` | `epi vault frontmatter-set` | delegates to CLI | EXISTS |
| `obsidian_frontmatter_delete` | `epi vault frontmatter-delete` | delegates to CLI | MISSING |
| `obsidian_now_read` | `epi vault now-read` | delegates to CLI | EXISTS |
| `obsidian_now_write` | `epi vault now-write` | delegates to CLI | EXISTS |
| `obsidian_thought_route` | `epi vault thought-route` | delegates to CLI | MISSING |
| `obsidian_sync_push` | (moved to S2') | S2' sync bridge | DEFERRED |

### New Commands Needed

```
epi vault set-default <vault-name>        -- set default vault
epi vault open <note>                      -- open in Obsidian app
epi vault frontmatter-delete <note> <key>  -- remove frontmatter key
epi vault frontmatter-validate <note>      -- validate against HC schema
epi vault thought-route --position N       -- write to T{n} bucket
epi vault day-init                         -- create today's Day folder + daily-note.md
epi vault now-init --session-id <id>       -- create NOW folder with datetime prefix
epi vault archive-day <date>               -- rotate Day -> Pratibimba archive
```

---

## Implementation Plan

### Phase 1: obsidian-cli Setup + Missing Commands

- Install obsidian-cli: `brew install yakitrak/yakitrak/obsidian-cli`
- Test `epi vault status` end-to-end against live vault
- Add missing Rust commands: `set-default`, `open`, `frontmatter-delete`
- Verify all 14 obsidian-cli commands work via Rust wrapper

### Phase 2: Thought Routing (T0-T5)

- Implement `epi vault thought-route` — direct filesystem write to `Pratibimba/Self/Thought/T{n}/`
- Canonical frontmatter generation: `bimbaCoordinate`, `thought_type`, `source_session`, `timestamp`
- T-coordinate canonical names: Questions/Traces/Challenges/Patterns/Discovery/Insight
- Filename convention: `T{n}-{YYYYMMDD-HHmmss}.md`

### Phase 3: Frontmatter Schema Layer (S1')

- Implement frontmatter schema validation against HC struct fields
- `epi vault frontmatter-validate` command
- Enforce `{family}_{n}_{semantic}` key format on writes
- `bimbaCoordinate` as mandatory field for all coordinate notes
- Cross-reference validation: wikilink targets must resolve to valid vault paths

### Phase 4: Day/NOW Lifecycle

- `epi vault day-init` — create Day folder (`{DD-MM-YYYY}/daily-note.md`)
- `epi vault now-init` — create NOW folder (`{YYYYMMDD-HHmmss-sessionId}/now.md`)
- Session ID propagation for NOW folder naming
- `epi vault archive-day` — snapshot Day -> `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`; retention pruning keeps only active+previous Day in `Empty/Present/`

### Phase 5: Vault -> S2' Sync Bridge

- Vault mutation events -> S2' graph upserts (frontmatter parsed -> Neo4j node properties)
- `{family}_{n}_{semantic}` wikilinks -> S2' relationship edges (FAMILY_LINK, POS{n} types)
- Hash-based change detection for incremental sync
- `bimbaCoordinate` as the join key between S1 vault notes and S2 Neo4j nodes

### Phase 6: Event Streaming

- Filesystem watch on vault (Rust `notify` crate)
- Event classification: create/modify/delete/rename -> typed vault events
- Event emission to S2' for graph sync
- Event emission to S3' for live gateway updates

---

## Authority Documents

- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` (Obsidian CLI shared service)
- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-28-epi-claw-cli-harmonization-daily-commands.md` (Daily/NOW commands)
- `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S1/S1' module definition)
- `docs/plans/2026-02-28-t-coordinate-paradigmatic-conception.md` (T-family canonical names + Deleuze grounding)
- `/Epi-Logos/Idea/epi-claw/.pi/extensions/obsidian.ts` (Port source — 737 LOC, 16 Pi tools)
- `include/ontology.h` (HC struct — the canonical schema source for frontmatter)
- `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md` (Neo4j schema — S1 frontmatter must map 1:1 to S2 node properties)
