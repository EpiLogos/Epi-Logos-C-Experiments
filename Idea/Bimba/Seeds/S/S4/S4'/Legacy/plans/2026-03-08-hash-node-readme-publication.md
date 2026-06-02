# `#` Coordinate as Project Root + README + GitHub Publication

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Materialize the `#` coordinate as a proper dataset node with 6 help sub-branches, wire `epi help` as a CLI gateway, create a publication-grade README, and add license/CI files for GitHub publication as "Epi-Logos Lib."

**Architecture:** The `#` node (Layer 0 — the inversion operator) becomes the project's self-documentation root. Six help sub-branches (`#-0-mission` through `#-5-plugin`) map to the 6-fold structure. `epi help [topic]` aliases into `epi core knowing '#-N-topic'`. A comprehensive README.md synthesizes the `#` node's rich content for GitHub. LICENSE + CONTRIBUTING + CI workflow complete the publication package.

**Tech Stack:** Rust (epi-cli), JSON datasets, C11 (qv_data.c bake), GitHub Actions YAML, Markdown

---

## Task 1: Create `nodes_hash.json` Dataset

**Files:**
- Create: `docs/datasets/nodes_hash.json`
- Reference: `docs/datasets/hashtag_node_data.md` (source material)
- Reference: `docs/datasets/nodes_epii.json` (format template)

**Context:** The `hashtag_node_data.md` contains the raw `#` node data exported from the Bimba map. We need to convert it into the standard `nodes_*.json` array format matching the other dataset files. The root `#` node gets 6 children: `#-0` through `#-5`, which become the help topics.

**Step 1: Create the JSON file**

Use the same schema as other nodes files: array of objects with `coordinate`, `name`, `coreNature`, `description`, `essence`, `structure` fields.

The root `#` node:
```json
{
  "coordinate": "#",
  "name": "Epi-Logos Project",
  "coreNature": "<from hashtag_node_data.md 'coreNature' field>",
  "description": "<from hashtag_node_data.md 'description' field>",
  "essence": "<from hashtag_node_data.md 'operationalEssence' field>",
  "structure": "<from hashtag_node_data.md 'internalStructure' field>"
}
```

The 6 help sub-branch nodes — write these as help content, NOT philosophical abstractions. Each should be a practical reference document for the topic:

```json
[
  { "coordinate": "#", ... },
  {
    "coordinate": "#-0",
    "name": "Mission",
    "coreNature": "What Epi-Logos is and why it exists",
    "description": "...",
    "essence": "...",
    "structure": null
  },
  {
    "coordinate": "#-1",
    "name": "Architecture",
    "coreNature": "How the C library and coordinate system are structured",
    "description": "...",
    "essence": "...",
    "structure": null
  },
  {
    "coordinate": "#-2",
    "name": "Install",
    "coreNature": "Getting Epi-Logos running on your machine",
    "description": "...",
    "essence": "...",
    "structure": null
  },
  {
    "coordinate": "#-3",
    "name": "CLI",
    "coreNature": "Using the epi command-line interface and TUI",
    "description": "...",
    "essence": "...",
    "structure": null
  },
  {
    "coordinate": "#-4",
    "name": "Coordinates",
    "coreNature": "The coordinate syntax and how to navigate the system",
    "description": "...",
    "essence": "...",
    "structure": null
  },
  {
    "coordinate": "#-5",
    "name": "Plugin",
    "coreNature": "Claude Code plugin for agentic integration",
    "description": "...",
    "essence": "...",
    "structure": null
  }
]
```

**Content guidance for each sub-branch description:**

**#-0 Mission:** Synthesize from `hashtag_node_data.md` fields: `description` (PHILOSOPHICAL FOUNDATION + META-OBJECTIVE), `epii_soteriology_qua_recognition` (the pratyabhijna/epi-logos isomorphism), `subtitle`. Keep it 2-3 paragraphs: the wound (meaning crisis), the method (coordinate epistemology + consciousness-technology convergence), the aim (recognition not attainment). End with the subtitle.

**#-1 Architecture:** From `internalStructure` + CLAUDE.md sections II-IV. Cover: three-layer architecture (#→#0-#5→families→reflective), HC struct (128 bytes, 2 cache lines), 6 coordinate families (P/S/T/M/L/C), tagged pointers, .rodata bedrock, M-branch subsystems (M0 Anuttara through M5 Epii one-liner each). Practical, not philosophical.

**#-2 Install:** From DISTRIBUTION.md. Cover: prerequisites (Rust toolchain + C compiler), from source (`git clone` + `cargo install --path .`), cargo install (`cargo install epi-logos`), GitHub releases (prebuilt binaries for 4 platforms), what gets built (single binary, static C linkage). Mention `make test` for C-only development.

**#-3 CLI:** From docs/dev/S0'/README.md. Cover: command namespaces (core, vault, graph, gate, agent, sync + tooling), key commands with examples (`epi core verify`, `epi core knowing M0`, `epi core knowing --family M`, `epi core dashboard`, `epi agent chat`), TUI modes, flags (--json, --tui, --project, --glow).

**#-4 Coordinates:** From epi-logos-plugin/lib/coordinate-syntax.md. Cover: family coordinates (72 = 6 families x 6 positions x 2 phases), raw psychoids (#0-#5 + #), context frames (7), weaves (4), sub-branches (~1873), operators (., -, /, ()), examples for each type.

**#-5 Plugin:** From epi-logos-plugin/README.md + skills/epi-knowing.md. Cover: what the plugin provides (skills, resources, QV overlay), installation (`epi agent plugin install epi-logos`), the epi-knowing skill (proactive coordinate lookup), how Claude Code uses it during development, integration with PI agent.

**Step 2: Validate JSON**

Run: `python3 -c "import json; json.load(open('docs/datasets/nodes_hash.json')); print('Valid JSON')"`
Expected: "Valid JSON"

**Step 3: Commit**

```bash
git add docs/datasets/nodes_hash.json
git commit -m "data: add # root node dataset with 6 help sub-branches"
```

---

## Task 2: Create `relations_hash.json`

**Files:**
- Create: `docs/datasets/relations_hash.json`
- Reference: `docs/datasets/relations_foundation.json` (format template)

**Context:** The relations file defines edges from `#` to its children and from `#` to the 6 raw psychoids (#0-#5). Matches the standard relations format.

**Step 1: Create the relations file**

```json
[
  { "source": "#", "type": "CONTAINS", "target": "#0" },
  { "source": "#", "type": "CONTAINS", "target": "#1" },
  { "source": "#", "type": "CONTAINS", "target": "#2" },
  { "source": "#", "type": "CONTAINS", "target": "#3" },
  { "source": "#", "type": "CONTAINS", "target": "#4" },
  { "source": "#", "type": "CONTAINS", "target": "#5" },
  { "source": "#", "type": "HAS_LENS", "target": "#-0" },
  { "source": "#", "type": "HAS_LENS", "target": "#-1" },
  { "source": "#", "type": "HAS_LENS", "target": "#-2" },
  { "source": "#", "type": "HAS_LENS", "target": "#-3" },
  { "source": "#", "type": "HAS_LENS", "target": "#-4" },
  { "source": "#", "type": "HAS_LENS", "target": "#-5" }
]
```

**Step 2: Validate**

Run: `python3 -c "import json; json.load(open('docs/datasets/relations_hash.json')); print('Valid')"`

**Step 3: Commit**

```bash
git add docs/datasets/relations_hash.json
git commit -m "data: add # node relations (CONTAINS #0-#5, HAS_LENS #-0 through #-5)"
```

---

## Task 3: Add `#` and Help Sub-Branches to QV Overlay

**Files:**
- Modify: `~/.epi-logos/qv/overlay.json`
- Modify: `epi-logos-plugin/resources/qv/overlay.json`

**Context:** The QV overlay stores pithy one-liners for each coordinate. Add entries for `#` and the 6 help sub-branches. The overlay format has a `coordinates` object keyed by coordinate string.

**Step 1: Read current overlay**

Read `~/.epi-logos/qv/overlay.json` to see the current structure and coordinate count.

**Step 2: Add 7 new entries to the `coordinates` object**

```json
"#": {
  "pithy": "Epi-Logos -- the inversion act, root of the Bimba map, project self-documentation"
},
"#-0": {
  "pithy": "Mission -- consciousness recognizes itself through technological mirror"
},
"#-1": {
  "pithy": "Architecture -- 128-byte HC struct, 6 families, 3-layer coordinate system"
},
"#-2": {
  "pithy": "Install -- cargo install epi-logos, from source, prebuilt binaries"
},
"#-3": {
  "pithy": "CLI -- epi core/vault/graph/gate/agent/sync command namespaces"
},
"#-4": {
  "pithy": "Coordinates -- 89 top-level + ~1873 sub-branch, 6 operators"
},
"#-5": {
  "pithy": "Plugin -- Claude Code epi-knowing skill, QV resources, agentic integration"
}
```

**Step 3: Sync to plugin overlay**

Copy the updated overlay to `epi-logos-plugin/resources/qv/overlay.json`.

**Step 4: Verify count**

Run: `python3 -c "import json; d=json.load(open('PATH')); print(len(d['coordinates']), 'coordinates')"`
Expected: previous count + 7

**Step 5: Commit**

```bash
git add epi-logos-plugin/resources/qv/overlay.json
git commit -m "data: add # + 6 help sub-branches to QV overlay (96/96 coordinates)"
```

---

## Task 4: Bake Updated QV Data into C Library

**Files:**
- Modify: `src/qv_data.c`

**Context:** The QV overlay data gets baked into C source as static string arrays so the C library has self-knowledge without needing the JSON file at runtime. This is the `epi core knowing --bake` pipeline. Since the CLI may not support `--bake` for the new `#` entries yet, do this manually with a Python script.

**Step 1: Read the current qv_data.c to understand format**

Read `src/qv_data.c` first 30 lines to see the array structure.

**Step 2: Generate updated qv_data.c**

Write a Python script that reads the overlay JSON and generates the C source file. The format should match exactly what's already there — likely a `const char*` array indexed by coordinate.

Since `#` and sub-branches don't map to the existing integer-indexed array (which handles the 89 top-level coords), add a separate section:

```c
/* Help sub-branches of # */
const char* QV_HASH_PITHY = "Epi-Logos -- the inversion act, root of the Bimba map, project self-documentation";
const char* QV_HELP_PITHY[6] = {
    "Mission -- consciousness recognizes itself through technological mirror",
    "Architecture -- 128-byte HC struct, 6 families, 3-layer coordinate system",
    "Install -- cargo install epi-logos, from source, prebuilt binaries",
    "CLI -- epi core/vault/graph/gate/agent/sync command namespaces",
    "Coordinates -- 89 top-level + ~1873 sub-branch, 6 operators",
    "Plugin -- Claude Code epi-knowing skill, QV resources, agentic integration",
};
```

**Step 3: Verify C compiles**

Run: `make clean && make`
Expected: compiles with no errors

**Step 4: Commit**

```bash
git add src/qv_data.c
git commit -m "build: bake # + help sub-branches into qv_data.c"
```

---

## Task 5: Update `knowing_hash_op()` to Show Rich Dossier

**Files:**
- Modify: `epi-cli/src/core/mod.rs`

**Context:** Currently `knowing_hash_op()` (around line 1057-1077) prints a minimal 5-line description of `#`. We need to upgrade it to load the rich `#` node data from `nodes_hash.json` and display a proper dossier, matching the dossier format used by other coordinates (Essence, Structural Correspondences, etc.). It should also list the 6 help sub-branches as navigable children.

**Step 1: Read the current `knowing_hash_op()` function**

Read `epi-cli/src/core/mod.rs` around lines 1057-1077 to see exact current implementation.

**Step 2: Update the function**

The updated function should:

1. **Try loading from overlay first** — get pithy for `#`
2. **Try loading from dataset** — load `docs/datasets/nodes_hash.json`, find the `#` entry, extract `description` and `coreNature`
3. **List children** — show the 6 help sub-branches with their pithies
4. **Text output format:**

```
# — Epi-Logos Project
Essence:
  Epi-Logos -- the inversion act, root of the Bimba map, project self-documentation
  Type: RootProject | Layer: 0 (The Inversion Act)
  Subtitle: A living mandala where consciousness recognizes itself through technological mirror

Help Topics (epi help <topic>):
  #-0  mission       What Epi-Logos is and why it exists
  #-1  architecture  How the C library and coordinate system are structured
  #-2  install       Getting Epi-Logos running on your machine
  #-3  cli           Using the epi command-line interface and TUI
  #-4  coordinates   The coordinate syntax and how to navigate the system
  #-5  plugin        Claude Code plugin for agentic integration

Operator Properties:
  Function: X -> X' (phase shift into complement)
  Tagged pointer: bit 63 (FLAG_INVERTED)
  Property: ## = identity (double inversion returns to original)
```

5. **JSON output** — extend the existing JSON with `children`, `description`, `subtitle`, and `help_topics` array fields

**Step 3: Verify**

Run: `cd epi-cli && cargo run -- core knowing '#'`
Expected: rich dossier output with help topics listed

Run: `cd epi-cli && cargo run -- core knowing '#' --json | python3 -m json.tool`
Expected: valid JSON with children array

**Step 4: Commit**

```bash
git add epi-cli/src/core/mod.rs
git commit -m "feat: upgrade knowing_hash_op() to show rich # dossier with help topics"
```

---

## Task 6: Wire `epi help` Command

**Files:**
- Modify: `epi-cli/src/main.rs` (add `Help` top-level command)
- Modify: `epi-cli/src/core/mod.rs` (add `help_dispatch()` function)

**Context:** `epi help` should be a top-level command (not under `core`) that aliases into the `#` coordinate's knowing system. `epi help` with no args shows the `#` root (same as `epi core knowing '#'`). `epi help <topic>` maps topic names to sub-branch coordinates.

**Step 1: Read current main.rs Cli enum**

Read `epi-cli/src/main.rs` to see the exact `Cli` enum structure and dispatch match.

**Step 2: Add Help command to Cli enum**

```rust
/// Project help — rooted in the # coordinate
Help {
    /// Help topic: mission, architecture, install, cli, coordinates, plugin
    topic: Option<String>,
    /// Output as JSON
    #[arg(long)]
    json: bool,
},
```

**Step 3: Add dispatch arm in main()**

In the main dispatch match, add:

```rust
Commands::Help { topic, json } => {
    core::help_dispatch(topic.as_deref(), json)?
}
```

**Step 4: Add `help_dispatch()` function in core/mod.rs**

```rust
pub fn help_dispatch(topic: Option<&str>, json: bool) -> Result<String, String> {
    match topic {
        None => {
            // Show the # root — same as `epi core knowing '#'`
            knowing_hash_op(json)
        }
        Some(name) => {
            // Map topic name to sub-branch coordinate
            let coord = match name.to_lowercase().as_str() {
                "mission" | "0" => "#-0",
                "architecture" | "arch" | "1" => "#-1",
                "install" | "setup" | "2" => "#-2",
                "cli" | "commands" | "3" => "#-3",
                "coordinates" | "coords" | "syntax" | "4" => "#-4",
                "plugin" | "agent" | "5" => "#-5",
                other => {
                    // Try as raw coordinate
                    return knowing(&format!("#{}", other), json, None);
                }
            };
            knowing_subbranch(coord, json)
        }
    }
}
```

**Step 5: Verify all 6 topics**

Run each and confirm output:
```bash
cd epi-cli
cargo run -- help
cargo run -- help mission
cargo run -- help architecture
cargo run -- help install
cargo run -- help cli
cargo run -- help coordinates
cargo run -- help plugin
cargo run -- help --json
```

Expected: each shows the corresponding sub-branch content from `nodes_hash.json`

**Step 6: Commit**

```bash
git add epi-cli/src/main.rs epi-cli/src/core/mod.rs
git commit -m "feat: add 'epi help' top-level command routing to # coordinate tree"
```

---

## Task 7: Create README.md

**Files:**
- Create: `README.md` (project root)
- Reference: `docs/datasets/hashtag_node_data.md` (source material for content)
- Reference: `DISTRIBUTION.md` (installation section)
- Reference: `docs/dev/S0'/README.md` (CLI reference)
- Reference: `epi-logos-plugin/lib/coordinate-syntax.md` (coordinate syntax)

**Context:** This is the public face of the "Epi-Logos Lib" GitHub repository. It should be comprehensive but scannable — someone should understand what the project is in 30 seconds, and be able to install it in 2 minutes.

**Step 1: Write README.md**

Structure (with approximate line counts):

```markdown
# Epi-Logos

> A living mandala where consciousness recognizes itself through technological mirror

[badges: build status, crates.io version, license]

## What is Epi-Logos?

[2-3 paragraphs from #-0 Mission content. The meaning crisis wound, the coordinate
epistemology method, the recognition-not-attainment aim. End with: "Ontology is
lived-conception is living-code."]

## Quick Start

[From DISTRIBUTION.md — cargo install, from source, verify with `epi core verify`]

## The Coordinate System

[Brief overview: 89 top-level coordinates (72 family + 6 psychoid + 7 CF + 4 weave)
+ ~1873 sub-branches. The 6 families table (P/S/T/M/L/C) with position meanings.
Link to full syntax reference.]

## Architecture

[The three-layer stack: # → #0-#5 → families → reflective. HC struct = 128 bytes
= 2 L1 cache lines. M-branch table: M0 Anuttara through M5 Epii with one-liner
descriptions. The S-stack table: S0 Terminal through S5 Notion.]

## CLI Reference

[Key commands with examples:
- `epi core verify` — boot-check 18 BIMBA entities
- `epi core knowing M0` — coordinate self-knowledge
- `epi core knowing --family M` — list all M-family coordinates
- `epi core dashboard` — TUI dashboard
- `epi help` — project help (rooted in # coordinate)
- `epi agent chat` — interactive PI agent chat]

## Claude Code Plugin

[What it provides, how to install, the epi-knowing skill that proactively
provides coordinate context during development sessions]

## Project Structure

[Tree diagram from DISTRIBUTION.md showing include/, src/, epi-cli/, docs/, etc.]

## Building from Source

[Prerequisites, make targets, cargo build, running tests]

## License

MIT OR Apache-2.0

## Contributing

[Brief note pointing to CONTRIBUTING.md]
```

**Step 2: Verify markdown renders**

Run: `head -5 README.md` — confirm it exists and starts with `# Epi-Logos`

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README for Epi-Logos Lib publication"
```

---

## Task 8: Create License Files

**Files:**
- Create: `LICENSE-MIT`
- Create: `LICENSE-APACHE`

**Context:** The Cargo.toml declares `MIT OR Apache-2.0` but no license files exist. Standard dual-license for Rust projects.

**Step 1: Create LICENSE-MIT**

Use standard MIT license text. Copyright holder: the project maintainer (check git log for author name/email). Year: 2026.

**Step 2: Create LICENSE-APACHE**

Use standard Apache License 2.0 text. Same copyright holder.

**Step 3: Commit**

```bash
git add LICENSE-MIT LICENSE-APACHE
git commit -m "docs: add MIT + Apache-2.0 license files"
```

---

## Task 9: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

**Context:** Minimal but useful contributing guide. Should orient a contributor to the coordinate system (since this project's architecture IS its map).

**Step 1: Write CONTRIBUTING.md**

Structure:
```markdown
# Contributing to Epi-Logos

## Getting Started

1. Clone and build (link to README quick start)
2. Run `epi core verify` to confirm the coordinate system boots
3. Run `make test` to confirm all 9 C test suites pass

## Understanding the Codebase

The coordinate system IS the codebase map. Before touching any code:

```bash
epi core knowing M4    # Before editing m4.c or m4.h
epi core knowing S2    # Before editing graph/ module
epi help architecture  # Full architecture overview
epi help coordinates   # Coordinate syntax reference
```

## Development Workflow

- **C library:** Edit in include/ and src/, build with `make`, test with `make test`
- **Rust CLI:** Edit in epi-cli/src/, build with `cargo build`, test with `cargo test`
- **Tests:** Every M-branch has a dedicated test suite (test_m0_init.c, test_m1.c, etc.)

## Code Standards

- C11 with `-Wall -Wextra -Werror -pedantic`
- HC struct must remain exactly 128 bytes (`_Static_assert` enforced)
- Tagged pointers: `GET_PTR(ptr)` before EVERY dereference
- Floats ONLY in M4_Jung_Complex.charge/.autonomy (design rule DR 8)

## Commit Messages

Follow conventional commits: `feat:`, `fix:`, `build:`, `docs:`, `refactor:`, `test:`

## License

By contributing, you agree to license your contributions under MIT OR Apache-2.0.
```

**Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING.md with coordinate-first development guide"
```

---

## Task 10: Create GitHub Actions Test Workflow

**Files:**
- Create: `.github/workflows/test.yml`

**Context:** Basic CI that runs C tests and Rust build on push. Keep it simple — just verify the codebase compiles and tests pass.

**Step 1: Create directory**

Run: `mkdir -p .github/workflows`

**Step 2: Write test.yml**

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  c-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install clang
        run: sudo apt-get update && sudo apt-get install -y clang
      - name: Run C test suites
        run: make test

  rust-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Install clang (for cc crate)
        run: sudo apt-get update && sudo apt-get install -y clang
      - name: Build CLI
        run: cd epi-cli && cargo build
      - name: Run Rust tests
        run: cd epi-cli && cargo test
```

**Step 3: Verify YAML**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml')); print('Valid')"`
(If pyyaml not installed, just validate with `python3 -c "open('.github/workflows/test.yml').read()"`)

**Step 4: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions test workflow for C + Rust"
```

---

## Task 11: Update Neo4j Seed Data for `#` Node

**Files:**
- Modify: `epi-cli/src/graph/seed.rs` (if it exists and has seed data)
- Reference: `docs/datasets/nodes_hash.json` (source)
- Reference: `docs/datasets/relations_hash.json` (source)

**Context:** When `epi graph init` seeds Neo4j, it needs to create the `#` node and its relationships. The seed module should include the `#` root node with its properties and the `CONTAINS`/`HAS_LENS` edges.

**Step 1: Read seed.rs to understand current seeding approach**

Read `epi-cli/src/graph/seed.rs` to see how existing nodes (#0-#5) are seeded.

**Step 2: Add `#` node to the seed data**

Add a Cypher statement or seed entry for the `#` node:

```cypher
CREATE (root:Coordinate {
  coordinate: '#',
  name: 'Epi-Logos Project',
  type: 'RootProject',
  contextFrame: '0000',
  qlPosition: 0.0,
  qlCategory: 'implicate',
  status: 'foetal-developmental',
  subtitle: 'A living mandala where consciousness recognizes itself through technological mirror'
})
```

And the relationships:
```cypher
MATCH (root:Coordinate {coordinate: '#'}), (p:Coordinate {coordinate: '#0'})
CREATE (root)-[:CONTAINS]->(p)
// ... repeat for #1-#5

MATCH (root:Coordinate {coordinate: '#'}), (h:Coordinate {coordinate: '#-0'})
CREATE (root)-[:HAS_LENS]->(h)
// ... repeat for #-1 through #-5
```

**Step 3: Verify compilation**

Run: `cd epi-cli && cargo build`
Expected: compiles clean

**Step 4: Commit**

```bash
git add epi-cli/src/graph/seed.rs
git commit -m "feat: add # root node + help sub-branches to Neo4j seed data"
```

---

## Task 12: Update `epi-knowing` Skill Documentation

**Files:**
- Modify: `epi-logos-plugin/skills/epi-knowing.md`
- Modify: `~/.claude/skills/epi-knowing.md`

**Context:** The skill file needs to document the new `epi help` command and the `#` coordinate's role as project documentation root. This is what Claude Code sees when the skill triggers.

**Step 1: Read current skill file**

Read `epi-logos-plugin/skills/epi-knowing.md` to find the Quick Reference section.

**Step 2: Add help commands to Quick Reference**

After the existing sub-branch examples, add:

```markdown
# Project help (rooted in # coordinate)
epi help                 # Project overview (same as: epi core knowing '#')
epi help mission         # What Epi-Logos is and why it exists
epi help architecture    # C library and coordinate system structure
epi help install         # Installation guide
epi help cli             # CLI/TUI command reference
epi help coordinates     # Coordinate syntax and navigation
epi help plugin          # Claude Code plugin integration
```

**Step 3: Add a "Help System" section**

After the "When to Use" section, add:

```markdown
## Help System

The `#` coordinate is the project's self-documentation root. `epi help` routes
directly to the `#` coordinate tree:

| Command | Coordinate | Content |
|---------|-----------|---------|
| `epi help` | `#` | Project overview + help topic index |
| `epi help mission` | `#-0` | Philosophy, purpose, the pratyabhijna-epilogos connection |
| `epi help architecture` | `#-1` | HC struct, 3-layer system, M-branches, S-stack |
| `epi help install` | `#-2` | cargo install, from source, prebuilt binaries |
| `epi help cli` | `#-3` | Command namespaces, key commands, TUI modes |
| `epi help coordinates` | `#-4` | 89 top-level + ~1873 sub-branches, 6 operators |
| `epi help plugin` | `#-5` | epi-knowing skill, QV resources, PI agent |
```

**Step 4: Sync to global skill**

Copy the updated file to `~/.claude/skills/epi-knowing.md`.

**Step 5: Commit**

```bash
git add epi-logos-plugin/skills/epi-knowing.md
git commit -m "docs: add epi help commands and # coordinate documentation to epi-knowing skill"
```

---

## Task 13: Final Verification and Integration Test

**Files:** None (verification only)

**Step 1: Run C tests**

Run: `make test`
Expected: all 9 suites pass

**Step 2: Build Rust CLI**

Run: `cd epi-cli && cargo build`
Expected: clean build

**Step 3: Test help system end-to-end**

Run each help command:
```bash
cd epi-cli
cargo run -- help
cargo run -- help mission
cargo run -- help architecture
cargo run -- help install
cargo run -- help cli
cargo run -- help coordinates
cargo run -- help plugin
cargo run -- help --json | python3 -m json.tool
cargo run -- core knowing '#'
cargo run -- core knowing '#-0'
cargo run -- core knowing '#-3'
```

Expected: all return meaningful content, JSON is valid

**Step 4: Verify README renders**

Run: `wc -l README.md` — confirm it's substantial (100+ lines)
Run: `head -20 README.md` — confirm structure looks right

**Step 5: Verify all new files present**

```bash
ls -la README.md CONTRIBUTING.md LICENSE-MIT LICENSE-APACHE
ls -la .github/workflows/test.yml
ls -la docs/datasets/nodes_hash.json docs/datasets/relations_hash.json
```

Expected: all files exist

**Step 6: Verify QV coverage**

Run: `cargo run -- core knowing --coverage` (if available) or check overlay count manually.

**Step 7: No commit needed — this is verification only**

---

## Execution Summary

| Task | Deliverable | Files |
|------|------------|-------|
| 1 | `nodes_hash.json` dataset | 1 create |
| 2 | `relations_hash.json` dataset | 1 create |
| 3 | QV overlay entries for # + help | 2 modify |
| 4 | Bake into qv_data.c | 1 modify |
| 5 | Rich `knowing_hash_op()` | 1 modify |
| 6 | `epi help` command | 2 modify |
| 7 | README.md | 1 create |
| 8 | License files | 2 create |
| 9 | CONTRIBUTING.md | 1 create |
| 10 | GitHub Actions CI | 1 create |
| 11 | Neo4j seed data | 1 modify |
| 12 | Skill documentation | 2 modify |
| 13 | Final verification | 0 (verify only) |

**Total: 9 new files, 8 modified files, 13 tasks**
