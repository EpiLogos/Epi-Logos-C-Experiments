# S0' Update: QV Pipeline, Plugin Package & Compression Architecture

**Status:** Design Approved
**Date:** 2026-03-07
**Parent Spec:** S0-S0i-CLI-CORE.md
**Coordinates:** S0' (CLI surface), M5 (QV self-API), S1'/S2' (compression sources)

---

## 1. Overview

Four interconnected workstreams extending the S0' CLI and `epi core knowing` command into a full self-knowledge pipeline:

1. **QV Data Population Pipeline** — Admin CLI methods to stage, update, and bake quintessential data into the C library
2. **Epi-Logos Plugin Package** — Full installable plugin (not just a skill) for Claude Code / Codex / PI agent
3. **S2'/S1' -> S0' Compression Pipeline** — CI/CD flow compressing verbose graph/vault data down to quintessential pithys
4. **M-Branch Dataset Extraction** — Initial population of QV data from existing `docs/datasets/nodes_*.json` files

---

## 2. Three-Tier QV Resolution

At runtime, `epi core knowing <coord>` resolves pithys through a three-tier cascade:

| Tier | Source | Location | Purpose |
|------|--------|----------|---------|
| 1 | JSON overlay | `~/.epi-logos/qv/overlay.json` | Fast iteration, no recompile |
| 2 | C library | `m5_lookup()` compiled .rodata | Shipped data, baked from overlay |
| 3 | Static tables | `RELATION_PITHYS` in Rust | Always-available fallback |

**Resolution order:** Overlay checked first -> C fallback -> static tables fallback.

The overlay is the **staging tier** — a human/agent-editable JSON file that sits between verbose source data and the compiled binary. The `bake` command writes overlay data into C source, which gets compiled into the binary on next `cargo install`.

---

## 3. QV Admin CLI

### 3.1 New Subcommands

```bash
epi core knowing update <coord> "<pithy>"   # Write pithy to JSON overlay
epi core knowing coverage                    # Coverage report (filled vs empty)
epi core knowing bake                        # Bake overlay -> C source arrays
epi core knowing export                      # Export all QV data as JSON
```

### 3.2 Satya Gate

All write operations (`update`, `bake`) are protected by a session-level password gate:

- On the **first write operation** in a CLI session, prompt: `Enter satya passphrase:`
- Correct passphrase: `satya`
- Once authenticated, the session remains unlocked (no re-prompting)
- Read operations (`knowing <coord>`, `coverage`, `export`) are ungated
- Gate applies to interactive use only — `--json` mode still requires the gate via stdin

**Implementation:** A session-level flag in the CLI runtime. Not cryptographic security — a mindfulness gate ensuring intentional updates to the canonical knowledge base.

### 3.3 Overlay Format

```json
{
  "version": 1,
  "updated_at": "2026-03-07T12:00:00Z",
  "coordinates": {
    "M0": {
      "pithy": "Anuttara -- absolute ground, vimarsa engine",
      "q_nature": "Computational-contemplative synthesis",
      "q_essence": "Supreme Word, 8-fold void operations, foundational grammar of existence"
    },
    "M0'": {
      "pithy": "Anuttara (inverted) -- UI reflection of ground"
    },
    "#0": {
      "pithy": "Ground -- absolute source, pre-categorical bedrock"
    },
    "CF(012)": {
      "pithy": "The Trika -- User, Agent, Code"
    }
  }
}
```

**Key:** Coordinate keys use the same syntax as `epi core knowing` input (M0, M0', #3, CF(012), W0.5, etc.).

### 3.4 q_ Property Types (Extensible)

The overlay supports multiple `q_` prefixed property types for quintessential data:

| Property | Purpose | Source |
|----------|---------|--------|
| `pithy` | One-liner quintessence (the primary QV) | Human / Haiku compression |
| `q_nature` | Core nature summary | Dataset `coreNature` field |
| `q_essence` | Functional essence | Dataset `essence` field |
| `q_formulation` | Formal expression | Dataset `formulation` field |
| `q_structure` | Structural summary | Dataset `structure` field |

These `q_` properties model what becomes the Neo4j write-back protocol: each maps to a `q_` prefixed property on graph nodes, enabling targeted semantic embedding and meaning compression at the quintessential level. The root data is extensible in principle — new `q_` types can be added without schema changes.

### 3.5 Neo4j Write-Back Protocol (Future CI/CD)

When the S2' layer is live, the pipeline becomes bidirectional:

```
S2' (Neo4j) ──compress──> JSON overlay ──bake──> C library
     ^                                              |
     └──────── write-back q_ properties ────────────┘
```

- Graph nodes gain `q_pithy`, `q_nature`, `q_essence`, etc. as first-class properties
- These are the target properties for semantic embedding quality — high-level meaning compression
- `epi graph sync-qv` writes overlay data back to Neo4j as `q_*` properties
- `epi graph compress` pulls verbose node data and runs Haiku compression -> overlay

---

## 4. Bake Process (Overlay -> C Source)

The `bake` command writes overlay pithys into C source arrays so the binary ships with real data:

1. Read `~/.epi-logos/qv/overlay.json`
2. For each coordinate with a `pithy` value:
   - Map coordinate to the appropriate C array index
   - Generate/update the static string in `src/m5.c` QV initialization
3. Write updated `src/m5.c` (or a dedicated `src/qv_data.c`)
4. User runs `cargo install --path epi-cli/` to compile

**Satya-gated.** The bake operation modifies source code and requires the passphrase.

**Target file:** A new `src/qv_data.c` containing only QV string arrays, included by `m5.c`. This separates hand-written logic from generated data.

```c
// src/qv_data.c -- GENERATED by 'epi core knowing bake'
// Do not edit manually. Update via 'epi core knowing update'.

#include "m5.h"

const char* QV_PITHY_M[6] = {
    "Anuttara -- absolute ground, vimarsa engine",          // M0
    "Paramasiva -- structural logos, quaternal unfolding",   // M1
    "Parashakti -- vibrational matrix, 72 invariants",      // M2
    "Mahamaya -- symbolic codec, nucleotide/hexagram map",  // M3
    "Nara -- personal dialogical interface, oracle engine",  // M4
    "Epii -- holographic integration, recursive self-API",   // M5
};

const char* QV_PITHY_M_INV[6] = { /* M0'-M5' */ };
const char* QV_PITHY_PSYCHOID[6] = { /* #0-#5 */ };
// ... etc for all coordinate types
```

---

## 5. Epi-Logos Plugin Package

### 5.1 Package Structure

```
epi-logos-plugin/
  README.md
  skills/
    epi-knowing.md          # Coordinate self-knowledge (existing, moved here)
    epi-workflow.md         # Development workflow integration (future)
    epi-agent.md            # Agent interaction patterns (future)
  resources/
    qv/
      overlay.json          # Default QV overlay shipped with plugin
      schema.json           # Overlay JSON schema
  scripts/
    install.sh              # Installs epi CLI + copies resources
    populate.sh             # Runs dataset extraction pipeline
  lib/
    coordinate-syntax.md    # Shared reference for coordinate parsing
  hooks/                    # Future: pre-commit, post-build hooks
```

### 5.2 Installation

The plugin installs via Claude Code's plugin marketplace or manually:

```bash
# Claude Code marketplace (future)
/plugin marketplace add epi-logos/epi-logos-marketplace
/plugin install epi-logos@epi-logos-marketplace

# Manual install
git clone <repo> ~/.claude/plugins/cache/epi-logos/epi-logos-plugin/1.0.0/
# Then register in installed_plugins.json

# Codex / PI agent
# Copy skills/ to respective skill directories
# Copy resources/ to ~/.epi-logos/
```

### 5.3 Relationship to PI Agent Extensions

The plugin mirrors the PI agent's `.pi/extensions/` structure:

| PI Extension | Plugin Equivalent | Purpose |
|-------------|-------------------|---------|
| `s/modules/terminal/` | `skills/epi-knowing.md` | S0' CLI access |
| `s/modules/obsidian/` | `skills/epi-vault.md` (future) | S1' vault ops |
| `s/modules/graphdb/` | `skills/epi-graph.md` (future) | S2' graph queries |
| `s_i/modules/ql_types/` | `lib/coordinate-syntax.md` | Shared QL reference |
| `s_i/modules/vak_system/` | `resources/qv/` | QV data resources |

The plugin is the **cross-agent portable form** of the S/S' stack. PI extensions are TypeScript-native; the plugin is agent-harness-agnostic (markdown skills + JSON resources + shell scripts).

### 5.4 Versioning

- Plugin version tracks the `epi` CLI version (currently 0.1.0)
- The overlay.json ships with whatever QV data has been baked at release time
- Skills evolve independently but are tagged with the plugin release

---

## 6. S2'/S1' -> S0' Compression Pipeline

### 6.1 Data Flow Direction

**Always top-down compression.** Verbose data at S2'/S1' compresses DOWN to S0' quintessential pithys.

```
S2' (Neo4j graph nodes)          S1' (Obsidian vault docs)
  |  Full descriptions,            |  Chunked text, embeddings,
  |  coreNature, essence,          |  markdown with frontmatter
  |  structure, formulation         |
  └──────────┬──────────────────────┘
             │ Haiku agent / compression script
             ▼
    JSON overlay (staging tier)
      q_pithy, q_nature, q_essence, ...
             │
             │ 'epi core knowing bake' (satya-gated)
             ▼
    C library (src/qv_data.c)
      Static strings compiled into binary
             │
             │ 'cargo install' / release build
             ▼
    Shipped binary + plugin package
      Self-contained, no runtime deps
```

### 6.2 Compression Agent (Haiku)

For the initial M-branch population:

1. Read `docs/datasets/nodes_<subsystem>.json` (6 files, one per M-branch)
2. For each node with a coordinate matching `#N` or `#N-*`:
   - Extract `name`, `description`, `essence`, `coreNature`
   - Compress to one-liner pithy via Haiku prompt:
     ```
     Given this coordinate data, write a pithy one-liner (max 80 chars)
     that captures the quintessence. Format: "Name -- essential function"
     ```
3. Write results to `overlay.json` under the appropriate coordinate keys
4. Run `epi core knowing coverage` to verify population

### 6.3 Dataset -> Coordinate Mapping

The datasets use `#N-M` sub-coordinate notation. The QV system maps these:

| Dataset coordinate | QV coordinate | Level |
|-------------------|---------------|-------|
| `#0` | `M0` | Root M-branch position |
| `#0-0` through `#0-5` | M0 sub-positions | Sub-branch detail |
| `#1` | `M1` | Root M-branch position |
| `#5` | `M5` | Root M-branch position |
| `#5-0` through `#5-5` | M5 sub-branches | #5-0 through #5-5 |

Root-level nodes (`#0`, `#1`, ..., `#5`) map directly to `M0`-`M5` family coordinates. Sub-coordinates (`#N-M`) populate sub-branch detail in the overlay.

### 6.4 Coverage Tracking

```bash
$ epi core knowing coverage

QV Coverage Report
==================
Family Coordinates (72 total):
  M:  6/6  base  +  3/6  inverted  = 75%
  S:  0/6  base  +  0/6  inverted  =  0%
  ...

Raw Psychoids (#0-#5):  6/6  = 100%
Context Frames (7):     2/7  =  29%
Weaves (4):             0/4  =   0%

Overall: 17/89 coordinates populated (19%)
```

---

## 7. Initial Population Scope

### 7.1 Immediate (This Sprint)

- **M0-M5 root pithys** from datasets (6 coordinates)
- **#0-#5 psychoid pithys** from C library existing data + datasets
- **M0'-M5' inverted pithys** (can derive from base + branch mapping)
- **S0-S5 and S0'-S5' pithys** (critical for CI/CD self-knowledge)
- **7 CF root pithys** (already defined in Rust static tables)
- **4 weave pithys** (already defined in Rust static tables)

### 7.2 Next Phase

- Sub-branch detail for M0-M5 (30+ sub-coordinates from datasets)
- P, L, T, C family pithys (24 base + 24 inverted)
- Neo4j write-back of q_ properties
- Full S2' -> S0' automated pipeline

---

## 8. Implementation Dependencies

```
[M-branch dataset extraction]──────┐
                                    ├──> [JSON overlay populated]
[Admin CLI: update/coverage/bake]───┘          │
                                               ▼
[Plugin package structure]─────────> [Shipped plugin with QV data]
                                               │
[S2'/S1' compression pipeline]────> [CI/CD automation, future]
```

Tasks 1-3 (CLI + overlay + dataset extraction) can run in parallel.
Task 4 (plugin packaging) depends on having QV data to ship.
Task 5 (S2'/S1' pipeline) is future CI/CD, spec only for now.
