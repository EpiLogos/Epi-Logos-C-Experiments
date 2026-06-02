# `epi` — The Master CLI

**Coordinate:** S0' (Terminal surface, inverted — the reflective CLI interface to the S' Stack)
**Version:** 0.1.0
**Language:** Rust (Cargo workspace: `epi-cli/`)
**Parent Spec:** [`Idea/Bimba/Seeds/S/Legacy/specs/S/S_Series_Master_CLI_Architecture.md`](../../specs/S/S_Series_Master_CLI_Architecture.md)
**Status:** Active Development

---

## What is `epi`?

`epi` is the unified command-line interface for the Epi-Logos coordinate system. It routes commands across the full S' implementation stack:

| Namespace | Coordinate | Layer | Status |
|-----------|------------|-------|--------|
| `epi core` | S0' | C library — bare-metal QL engine | **Live** |
| `epi vault` | S1' | Obsidian vault operations | **Live (obsidian-cli wrapper)** |
| `epi graph` | S2' | Neo4j + Redis — GraphRAG | **Live (stub — needs connection)** |
| `epi gate` | S3' | WebSocket gateway | **Live** |
| `epi agent` | S4' | PI agent lifecycle + native operator launch | **Live (native PI control plane)** |
| `epi sync` | S5' | n8n webhooks | Stub |

Plus tooling namespaces: `epi sesh`, `epi kbase`, `epi book`, `epi techne`, `epi app`, `epi code`.

---

## Changelog

### v0.4.0 — 2026-04-02

**Native PI + Gateway Harmonisation**

- `epi agent` with no subcommand now launches native `pi` directly
- `epi agent spawn` and `epi agent chat` now share the same native interactive PI contract
- interactive operator launches now perform a shared gateway readiness preflight before handing the terminal to PI
- managed agent state now defaults to repo-local `.epi/` instead of ambient home-level runtime paths
- repo-authored skills and ta-onta subagents are projected into repo-local compatibility directories rather than relying on `~/.agents`
- `epi up` and `epi agent` now share the same repo-local gateway state root
- ta-onta extension command paths were corrected to use real `epi` and `obsidian-cli` surfaces only

### v0.3.0 — 2026-03-07

**S1-S2 Live Stack + HC Zod Schema Package**

- **S2' Neo4j + Redis live** — `epi graph init` seeds 96 BimbaCoordinate nodes + 187 relationships. Real `neo4rs` 0.9 client, `redis` 0.25 async client. Docker Compose for dev (`docker-compose.epi-s2.yml`).
- **`epi graph` commands live** — `init`, `status`, `up`, `down`, `query`, `sync`, `import` all wired to real Neo4j/Redis.
- **GraphRAG retrieval** — coordinate retrieval, N-hop context, family queries, hybrid RRF fusion, progressive disclosure (6 levels: UuidOnly → Complete).
- **S1-S2 sync bridge** — vault-to-graph sync coordinator, bidirectional conflict resolution (6 strategies), link enforcement, Gemini embedding client.
- **Dataset import** — M0-M5 branch JSON datasets from `Idea/Bimba/Map/datasets/`.
- **`@epi-logos/ql-schema`** — TypeScript Zod schema package (`epi-cli/schemas/`). Propagates the C HC struct (128 bytes) to TS as four concentric rings:
  - Ring 1: `HCIdentity` — 8-byte kernel (qlPosition, family, inversionState, flags, weaveState)
  - Ring 2: `HCCoordinate` — + 12-fold pointer web (c/p/l/s/t/m + cpf/ct/cp/cf/cfp/cs)
  - Ring 3: `HCNode` — + storage properties (uuid, name, layer, topoMode, essence, vaultPath, embedding)
  - Ring 4: `HCRuntime` — + execution context (contextFrame, disclosureLevel, mode, payload)
  - Coordinate validator (port of Rust parser), 68 canonical frontmatter keys, 34 Neo4j relation types
  - Foundation for Pi agent extensions, Obsidian frontmatter, and Neo4j node typing
  - 69 tests, builds to `dist/` with `.d.ts` declarations
- **Dual crate** — `[lib]` (epi_logos) + `[[bin]]` (epi) for integration test support. 87+ Rust tests.

### v0.2.0 — 2026-03-07

**QV Pipeline, Admin CLI, Plugin Package**

- **Three-tier QV resolution** — JSON overlay -> C library -> static Rust tables
- `epi core knowing <coord> --update "pithy"` — write-gated overlay updates
- `epi core knowing --coverage` — QV population coverage report
- `epi core knowing --bake` — generates `src/qv_data.c` from overlay
- `epi core knowing --export` — export all QV data as JSON
- **Write gate** — session-level passphrase for write operations
- **JSON overlay** at `~/.epi-logos/qv/overlay.json` — fast iteration without recompile
- **Plugin package** — `epi-logos-plugin/` with skills, resources, scripts
- **Initial data** — 89/89 coordinates populated (100% coverage across all families, inversions, psychoids, CF, weaves)

### v0.1.0 — 2026-03-07

**Static C compilation, M5 TUI, agent chat, distribution**

- **Static linking via `cc` crate** — C sources compile directly into the Rust binary at build time. No more `libepilogos.so` or `--lib` flag needed. Single 2.8 MB self-contained binary.
- `build.rs` compiles Pillar I + M0-M5 + vendored BLAKE3 via `cc` crate
- `libloading` dependency removed; all C symbols declared via `extern "C"` blocks
- `epi core m5` — M5 (Epii) holographic integration TUI
  - Sub-branch explorer (#5-0 through #5-5)
  - Logos FSM live state with stage names (A-logos → Ana-logos)
  - Quintessential View lookup per coordinate
- `epi core knowing` — non-interactive coordinate self-knowledge CLI
  - CT5 5/0 output: quintessence + cross-family relational tree
  - `--family <FAM>` lists available coordinates for discovery
  - `--json` for agent/pipeline consumption
  - Global Claude Code skill at `~/.claude/skills/epi-knowing.md`
- `epi agent chat` — interactive TUI chat with PI agent
  - Scrollable conversation history, input line
  - Spawns `pi` subprocess with stdin/stdout piped
  - Graceful error if `pi` not installed
- **Makefile overhaul** — targets for all 9 test suites, static library, debug builds
- **DISTRIBUTION.md** — packaging strategy (cargo install, GitHub Releases, Homebrew)
- Cargo.toml metadata updated: crate name `epi-logos`, binary name `epi`

### v0.0.1 — 2026-03-05

**Initial Rust CLI — Pillar I + S' Stack foundation**

- `epi core` — full bare-metal QL interface via FFI
  - `inspect`, `verify`, `dump`, `walk`, `walk-tui`, `hash`, `families`, `operators`, `cf`, `dashboard`
  - All 18 BIMBA entities (7 psychoids + 4 weaves + 7 CF roots)
  - Torus walk + double covering visualization
  - Tagged pointer decode (bits 63-48)
- `epi vault` — Obsidian vault wrapper (12 subcommands)
- `epi graph` — GraphRAG module (16 Rust modules, QL-aware)
- `epi agent` — PI agent lifecycle wrapper (install, doctor, spawn, attach, run)
- Tooling namespaces: `sesh`, `kbase`, `book`, `techne`, `app`, `code`
- `--json` global flag for structured output

---

## Installation & Dev Workflow

### Prerequisites

- Rust + Cargo (`rustup`)
- C compiler (clang or gcc) — used by `cc` crate at build time
- Optional runtime deps: `obsidian-cli`, `pi` (npm), `neo4j`, `redis`

### Build & Install

```bash
# One-time or after any code change — installs to ~/.cargo/bin/epi
cargo install --path epi-cli/

# Fast incremental build during development (no install)
cd epi-cli && cargo build
./target/debug/epi --help
```

The C library is compiled automatically by `build.rs` — no separate build step needed.

### C-Only Development

For working on the C sources directly:

```bash
make          # Build epi-logos C binary
make test     # Run all 9 test suites (2180 tests)
make debug    # Build with AddressSanitizer + UBSan
make lib      # Build libepilogos.a static library
make clean    # Remove all build artifacts
```

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `EPILOGOS_VAULT` | `/Users/admin/Documents/Epi-Logos/Idea` | Root of Obsidian vault |
| `NEO4J_URI` | — | Neo4j connection URI for `epi graph` |
| `GEMINI_API_KEY` | — | Embedding service for `epi graph` retrieval |

### Shell Setup

`~/.cargo/bin` must precede any legacy `epi` scripts in `PATH`. The `.zshrc` has:

```zsh
export PATH="$HOME/.cargo/bin:$PATH"  # line 2 — cargo wins
alias epi-legacy="~/.config/epi/epi-session-v2.sh"  # old session launcher, renamed
```

Open a new shell after `cargo install` to pick up the binary.

---

## Command Reference

### `epi core` — Bare-Metal QL (S0')

Interface to the C engine via statically linked FFI.

```bash
epi core verify                         # Boot-verify all 18 BIMBA entities
epi core inspect <coord>                # Inspect any coordinate
epi core dump                           # Full .rodata dump
epi core walk [--steps N]               # Torus walk visualization
epi core walk-tui                       # Interactive torus walk TUI
epi core hash <coord>                   # Apply # inversion
epi core families                       # All 36 family coordinates
epi core dashboard                      # Interactive dashboard TUI
epi core operators                      # Operator table + tagged pointer bits
epi core cf                             # List 7 CF roots
epi core m5                             # M5 holographic integration TUI
epi core knowing <coord>                # Coordinate dossier (CT5 5/0 + live facets)
epi core knowing <coord> --json         # JSON output for agents
epi core knowing <coord> --tui          # Dossier browser in ratatui
epi core knowing --family <FAM>         # List coordinates in a family
epi core knowing <coord> --update "text"   # Update pithy in overlay (write-gated)
epi core knowing <coord> --project early-epi  # Scope KBase lookup
epi core knowing <coord> --refresh      # Refresh live snapshot cache
epi core knowing <coord> --glow 1       # Preview selected markdown KBase hit
epi core knowing <coord> --open 1       # Open selected KBase hit
epi core knowing --coverage                # QV coverage report
epi core knowing --bake                    # Bake overlay -> src/qv_data.c
epi core knowing --export                  # Export all QV data as JSON
```

**Coordinate syntax:**
```
#0 #1 #2 #3 #4 #5 #        <- psychoids + hash operator
P0 S3 M2 C5 L4 T1          <- family coordinates (base)
M0' S3' C4' P2i L5i T1'    <- inverted coordinates (' or i suffix)
CF(0000) CF(01) CF(012)     <- context frame roots
CF(0123) CF(4x) CF(450) CF(50)
W0.0 W0.5 W5.0 W5.5        <- weave interleaves
M2-1 #2-1-0 #0-3-2         <- sub-branch coordinates (any depth)
#4.0 #4.4.3 M4.1-0         <- Lemniscate nesting (. after 4)
#0-4.0/1 #0-4.0/1/2/3      <- non-dual fusion (/ operator)
#0-4.4.0-4.4/5             <- fractal doubling
#1-3-4.(0000)              <- CF nesting (normalized to #1-3-4.0000)
```

### `epi vault` — Obsidian (S1')

Wraps `obsidian-cli`. Requires it installed and a vault configured.

```bash
epi vault status                            # Default vault name
epi vault create <note> [-c content] [-v vault]
epi vault read <note> [-v vault]
epi vault search <query> [-v vault]         # Search note titles
epi vault search-content <query>            # Search note bodies
epi vault daily [-v vault]                  # Create/open daily note
epi vault frontmatter-get <note> [-k key]   # Read YAML frontmatter
epi vault frontmatter-set <note> <k> <v>    # Write YAML frontmatter
epi vault move <note> <new-path>            # Rename (updates wikilinks)
epi vault delete <note>
epi vault now-read                          # Read NOW.md from Present/
epi vault now-write "<content>"             # Write NOW.md
```

### `epi graph` — Neo4j + Redis (S2')

GraphRAG retrieval over live Neo4j + Redis Stack backends, with RedisVL-backed semantic-cache health and local bootstrap support.

```bash
epi graph bootstrap-dev                # Start local stack + prepare RedisVL bridge
epi graph status                       # Lightweight connection/status glance
epi graph doctor                       # Deep health + stale semantic report
epi graph query <coordinate>           # Nodes for QL coordinate
epi graph sync [path]                  # Sync vault to graph
epi graph retrieve <coord> [--nested]  # Coordinate-based retrieval
epi graph graphrag "<query>" [--depth N]  # GraphRAG retrieval
epi graph hybrid "<query>" [--top-k N]   # Hybrid vector + graph
```

### `epi agent` — PI Agent (S4')

Wraps the `pi` binary with managed agent environments.

```bash
epi agent                              # Launch native PI with the managed repo runtime
epi agent install                      # Set up repo-local managed agent directory
epi agent doctor                       # Inspect agent foundation state
epi agent spawn [prompt]               # Start a native PI session
epi agent attach <id>                  # Attach to existing session
epi agent run <args...>                # Pass args directly to pi
epi agent chat [--agent <name>] [prompt]  # Compatibility alias for native PI chat
epi agent verify-runtime               # Captured isolated smoke run
epi agent extensions sync              # Sync repo extensions
epi agent extensions status            # Extension sync status
epi agent agents list                  # List registered agents
epi agent models status                # Model configuration status
epi agent auth status                  # Auth profile status
```

### `epi gate` — WebSocket Gateway (S3')

```bash
epi gate status
epi gate start [--port 18794]
epi gate stop
epi gate methods
epi gate inspect
```

### `epi sync` — n8n Webhooks (S5') — Stub

```bash
epi sync status
```

### Tooling Namespaces

```bash
epi sesh   # Tmux session lifecycle
epi kbase  # bkmr bookmark manager
epi book   # bookokrat TUI reader
epi techne # Chat log capture, NotebookLM, quote research
epi app    # EpiLogos Electron app
epi code   # Claude Code with LLM provider profiles
```

### Global Flags

```bash
--json          # Structured JSON to stdout (agent/pipeline mode)
```

---

## Architecture

```
epi (Rust binary — ~/.cargo/bin/epi, 2.8 MB)
├── clap — subcommand routing + help generation
├── ratatui + crossterm — TUI engine
├── serde_json — --json output
├── serde_yaml — frontmatter parsing (epi vault)
├── cc crate (build-time) — compiles C sources into binary
│    └── Static C library (libepilogos)
│         ├── .rodata — 18 BIMBA entities (psychoids, weaves, CF roots)
│         ├── arena allocator + 36 family coordinates
│         ├── torus engine + double covering
│         └── M0-M5 subsystem implementations + BLAKE3
│
├── src/
│   ├── main.rs          — CLI entry point, dispatch
│   ├── lib.rs           — library crate (epi_logos) for integration tests
│   ├── ffi/             — extern "C" bindings + tagged pointer helpers
│   ├── core/            — epi core (statically linked to C engine)
│   ├── tui/             — ratatui dashboard, walk, families, M5 viewer
│   ├── vault/           — epi vault (obsidian-cli wrapper + frontmatter validation)
│   ├── graph/           — epi graph (20+ modules, live Neo4j/Redis GraphRAG)
│   │   ├── client.rs, redis_cache.rs  — real async clients
│   │   ├── schema.rs, seed.rs         — DDL + 96-node seeder
│   │   ├── retrieval/                 — coordinate, hybrid RRF, progressive disclosure
│   │   ├── sync_coordinator.rs        — vault → graph sync
│   │   └── embeddings.rs              — Gemini embedding client
│   ├── agent/           — epi agent (native PI control plane + repo-local runtime)
│   ├── gate/            — epi gate (live gateway + shared preflight)
│   ├── sync/            — epi sync (stub)
│   └── {sesh,kbase,book,techne,app,code}/  — tooling wrappers
│
└── schemas/             — @epi-logos/ql-schema (TypeScript Zod package)
    ├── src/             — 4 concentric ring schemas + enums + validator
    ├── tests/           — 69 vitest tests (cross-check against 96 seed coords)
    └── dist/            — compiled .js + .d.ts (npm-publishable)
```

---

## What's Live vs. Stub

| Feature | State | Notes |
|---------|-------|-------|
| `epi core` — all subcommands | **Live** | Statically linked, no runtime deps |
| `epi core m5` — M5 TUI | **Live** | Logos FSM + sub-branch explorer |
| `epi core knowing` — coordinate dossier | **Live** | Essence + structural + graph + KBase + notebook + snapshot, --json, --tui |
| `epi core knowing` — QV admin (--update, --coverage, --bake, --export) | **Live** | Write-gated overlay, 3-tier resolution |
| `epi vault` — all 12 subcommands | **Live** | Needs `obsidian-cli` installed |
| `epi graph init/status/up/down` | **Live** | Seeds 96 nodes + 187 rels |
| `epi graph query/sync/import` | **Live** | Needs Neo4j + Redis (docker compose) |
| `epi graph retrieve/graphrag/hybrid` | **Live** | Coordinate, RRF, progressive disclosure |
| `@epi-logos/ql-schema` (TS) | **Live** | 4-ring Zod schemas, 69 tests |
| `epi agent` / `spawn` / `chat` / `attach` / `run` | **Live** | Native PI runtime, gateway preflight, repo-local `.epi/` |
| `epi agent verify-runtime` | **Live** | Captured isolated smoke path |
| `epi gate` | **Live** | Shared WebSocket gateway runtime on the Rust side |
| `epi sync` | Stub | n8n webhook config TBD |

---

## Development Notes

- **Static linking** — `build.rs` uses `cc` crate to compile all C sources at build time. No `.so`/`.dylib` to ship.
- **All dispatch functions** return `Result<String, String>` — `Ok` prints to stdout, `Err` eprints with namespace prefix
- **No panics on missing external tools** — all CLI wrappers return `Err("Failed to execute X: ...")` gracefully
- **`rust-objcopy` SIGABRT warning** during `cargo install` — cosmetic; Homebrew Rust missing `libLLVM.dylib` for debug-stripping, does not affect the binary

---

## Related Documents

- [`DISTRIBUTION.md`](../../../DISTRIBUTION.md) — Packaging strategy (cargo install, GitHub Releases, Homebrew)
- [`Idea/Bimba/Seeds/S/Legacy/specs/S/S_Series_Master_CLI_Architecture.md`](../../specs/S/S_Series_Master_CLI_Architecture.md) — Canonical S' stack spec
- [`Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-epi-logos-lib-packaging.md`](../../plans/2026-03-07-epi-logos-lib-packaging.md) — This implementation plan
- [`Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/PILLAR-I-CANONICAL.md`](../../specs/PILLAR-I-CANONICAL.md) — Pillar I canonical spec (18 BIMBA entities, 128-byte struct)
- [`epi-cli/schemas/README.md`](../../../epi-cli/schemas/README.md) — @epi-logos/ql-schema: HC Zod schemas for Pi/Obsidian/Neo4j
- [`Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-hc-zod-schema-design.md`](../../plans/2026-03-07-hc-zod-schema-design.md) — HC Zod schema design doc
- [`CLAUDE.md`](../../../CLAUDE.md) — Full onto-code architecture blueprint
