# `epi` — The Master CLI

**Coordinate:** S0' (Terminal surface, inverted — the reflective CLI interface to the S' Stack)
**Version:** 0.1.0
**Language:** Rust (Cargo workspace: `epi-cli/`)
**Parent Spec:** [`docs/specs/S/S_Series_Master_CLI_Architecture.md`](../../specs/S/S_Series_Master_CLI_Architecture.md)
**Status:** Active Development

---

## What is `epi`?

`epi` is the unified command-line interface for the Epi-Logos coordinate system. It routes commands across the full S' implementation stack:

| Namespace | Coordinate | Layer | Status |
|-----------|------------|-------|--------|
| `epi core` | S0' | C library — bare-metal QL engine | **Live** |
| `epi vault` | S1' | Obsidian vault operations | **Live (obsidian-cli wrapper)** |
| `epi graph` | S2' | Neo4j + Redis — GraphRAG | **Live (stub — needs connection)** |
| `epi gate` | S3' | WebSocket gateway | Stub |
| `epi agent` | S4' | PI agent lifecycle | **Live (pi wrapper)** |
| `epi sync` | S5' | n8n webhooks | Stub |

Plus tooling namespaces: `epi sesh`, `epi kbase`, `epi book`, `epi techne`, `epi app`, `epi code`.

---

## Changelog

### v0.1.0 — 2026-03-05

**Initial Rust CLI — Pillar I + S' Stack foundation**

- `epi core` — full bare-metal QL interface via FFI to `libepilogos.so`
  - `inspect`, `walk`, `verify`, `hash`, `arena`, `families`, `web`, `operators`, `cf`, `dump`
  - All 17 BIMBA entities (7 psychoids + 3 weaves + 7 CF roots)
  - Torus walk + double covering visualization
  - Tagged pointer decode (bits 63-48)
- `epi vault` — Obsidian vault wrapper (12 subcommands)
  - `status`, `create`, `read`, `search`, `search-content`, `daily`
  - `frontmatter-get`, `frontmatter-set`, `move`, `delete`
  - `now-read`, `now-write` — direct filesystem access to `$EPILOGOS_VAULT/Empty/Present/NOW.md`
- `epi graph` — GraphRAG module (16 Rust modules, QL-aware)
  - `status`, `query`, `sync`, `retrieve`, `graphrag`, `hybrid`
  - Types: `NodeRef`, `EdgeRef`, `PathResult`, `GraphResult`, `RelationshipType`
  - Coordinate-to-label mapping (`#0`→`M0_Anuttara`, etc.)
  - Retrieval stack: coordinate, GraphRAG, hybrid (stub — needs Neo4j)
- `epi agent` — PI agent lifecycle wrapper (6 subcommands)
  - `install`, `status`, `extensions-list`, `spawn`, `attach`, `run`
- Tooling namespaces: `sesh`, `kbase`, `book`, `techne`, `app`, `code`
- `--json` global flag for structured output
- `--lib` global flag to specify `libepilogos.so` path

---

## Installation & Dev Workflow

### Prerequisites

- Rust + Cargo (`rustup`)
- `libepilogos.so` built from the C sources (see [Building the C Library](#building-the-c-library))
- Optional runtime deps: `obsidian-cli`, `pi` (npm), `neo4j`, `redis`

### Build & Install

```bash
# One-time or after any code change — installs to ~/.cargo/bin/epi
cargo install --path epi-cli/

# Fast incremental build during development (no install)
cd epi-cli && cargo build
./target/debug/epi --help
```

### Building the C Library

The `epi core` namespace requires `libepilogos.so` at runtime. Build from the project root:

```bash
clang -std=c11 -shared -fPIC -O2 -I include \
  -o libepilogos.so \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c
```

Then point `epi core` at it:

```bash
epi --lib ./libepilogos.so core verify
# or set it beside the binary, or in the project root — epi searches common locations
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

Interface to the C engine via FFI (`libepilogos.so`).

```bash
epi core verify                         # Boot-verify all 17 BIMBA entities
epi core inspect <coord>                # Inspect any coordinate
epi core walk [--steps N] [--start X]  # Torus walk visualization
epi core hash <coord>                  # Apply # inversion
epi core arena                         # Arena allocator state
epi core families                      # All 36 family coordinates
epi core web <coord>                   # 12-pointer intra-openness web
epi core operators                     # Operator table + tagged pointer bits
epi core cf                            # List 7 CF roots
epi core dump [--format json|table]    # Full .rodata dump
```

**Coordinate syntax:**
```
#0 #1 #2 #3 #4 #5 #        ← psychoids + hash operator
P0 S3 M2 C5 L4 T1          ← family coordinates
L4'  M2i                   ← inverted (phase marker)
M2.4                        ← nested (dot = fractal descent via cf)
M2-3                        ← branched (lateral relation)
CF(0000) CF(01) CF(012)    ← context frame roots
CF(0123) CF(4x) CF(450) CF(50)
W0.5 W5.0 W5.5             ← weave interleaves
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
epi vault frontmatter-get <note> [-k key]  # Read YAML frontmatter
epi vault frontmatter-set <note> <k> <v>   # Write YAML frontmatter
epi vault move <note> <new-path>           # Rename (updates wikilinks)
epi vault delete <note>
epi vault now-read                          # Read NOW.md from Present/
epi vault now-write "<content>"            # Write NOW.md
```

**`now-read` / `now-write`** operate on:
`$EPILOGOS_VAULT/Empty/Present/NOW.md`

### `epi graph` — Neo4j + Redis (S2')

GraphRAG retrieval. Requires `NEO4J_URI` for live queries; returns stubs without it.

```bash
epi graph status                       # Connection health check
epi graph query <coordinate>           # Nodes for QL coordinate
epi graph sync [path]                  # Sync vault to graph
epi graph retrieve <coord> [--nested]  # Coordinate-based retrieval
epi graph graphrag "<query>" [--depth N]  # GraphRAG retrieval
epi graph hybrid "<query>" [--top-k N]   # Hybrid vector + graph
```

**Coordinate → Neo4j label mapping:**

| QL Coord | Neo4j Label |
|----------|-------------|
| `#0` | `M0_Anuttara` |
| `#1` | `M1_Paramasiva` |
| `#2` | `M2_Parashakti` |
| `#3` | `M3_Mahamaya` |
| `#4` | `M4_Nara` |
| `#5` | `M5_Epii` |
| `P0`–`P5` | `P0_Ground`–`P5_Integration` |

### `epi agent` — PI Agent (S4')

Wraps the `pi` binary. `epi agent install` installs it via npm.

```bash
epi agent install           # npm install -g @mariozechner/pi
epi agent status            # pi --version
epi agent extensions-list   # pi extensions list
epi agent spawn [prompt]    # Start a PI session
epi agent attach <id>       # Attach to existing session
epi agent run <args...>     # Pass args directly to pi
```

### `epi gate` — WebSocket Gateway (S3') — Stub

```bash
epi gate status
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
--lib <path>    # Path to libepilogos.so (overrides auto-search)
--provisional   # Force write even if C-engine rejects topology (planned)
--signature <CF>  # Context Frame ID for parallel agent isolation (planned)
```

---

## Architecture

```
epi (Rust binary — ~/.cargo/bin/epi)
├── clap — subcommand routing + help generation
├── ratatui + crossterm — TUI engine (epi core)
├── serde_json — --json output
├── serde_yaml — frontmatter parsing (epi vault)
├── FFI — dlopen libepilogos.so at runtime
│    └── libepilogos.so (C shared library)
│         ├── .rodata — 17 BIMBA entities (psychoids, weaves, CF roots)
│         ├── arena allocator + 36 family coordinates
│         └── torus engine + double covering
│
└── src/
    ├── main.rs          — CLI entry point, dispatch
    ├── ffi/             — C FFI bindings + tagged pointer helpers
    ├── core/            — epi core (fully wired to C engine)
    ├── vault/mod.rs     — epi vault (obsidian-cli wrapper)
    ├── graph/           — epi graph (16 modules, GraphRAG port)
    │   ├── types.rs, client.rs, api.rs, mapper.rs
    │   ├── sync.rs, sync_coordinator.rs, sync_orchestrator.rs
    │   ├── bidirectional_sync.rs, embeddings.rs, redis_cache.rs
    │   ├── retrieval/   — coordinate.rs, graphrag.rs, hybrid.rs
    │   ├── alignment_validator.rs, coordinate_array_parser.rs
    │   ├── link_enforcement.rs, relationship_manager.rs
    ├── agent/mod.rs     — epi agent (pi wrapper)
    ├── gate/            — epi gate (stub)
    ├── sync/            — epi sync (stub)
    └── tui/             — ratatui dashboard
```

---

## What's Live vs. Stub

| Feature | State | Blocker |
|---------|-------|---------|
| `epi core` — all subcommands | **Live** | Needs `libepilogos.so` |
| `epi vault` — all 12 subcommands | **Live** | Needs `obsidian-cli` installed |
| `epi vault now-read/write` | **Live** | Needs `$EPILOGOS_VAULT` set |
| `epi graph status` | **Live** | — |
| `epi graph query/retrieve/graphrag/hybrid` | Stub | Needs `NEO4J_URI` + connection |
| `epi agent install/status/spawn/run` | **Live** | Needs `pi` or `npm` |
| `epi gate` | Stub | WebSocket server TBD |
| `epi sync` | Stub | n8n webhook config TBD |
| Graph embeddings | Stub | `GEMINI_API_KEY` + active connection |
| `--provisional` flag | Planned | Pillar II |
| `--signature <CF>` flag | Planned | Multi-agent swarm (Pillar III) |
| Reflective coords: cpf, ct, cp, cfp | NULL | Pillar II wiring |

---

## Development Notes

- **All dispatch functions** return `Result<String, String>` — `Ok` prints to stdout, `Err` eprints with namespace prefix
- **No panics on missing external tools** — all CLI wrappers return `Err("Failed to execute X: ...")` gracefully
- **Graph modules use stub structs** — no `neo4j` or `redis` crates yet; `Neo4jClient` and `RedisCache` are typed stubs
- **43 warnings** in current build — all `dead_code` on stub modules, safe to ignore; will clear as modules are wired
- **`rust-objcopy` SIGABRT warning** during `cargo install` — cosmetic; Homebrew Rust missing `libLLVM.dylib` for debug-stripping, does not affect the binary

---

## Related Documents

- [`docs/specs/S/S_Series_Master_CLI_Architecture.md`](../../specs/S/S_Series_Master_CLI_Architecture.md) — Canonical S' stack spec + multi-agent swarm design
- [`docs/plans/2026-03-05-epi-cli-design.md`](../../plans/2026-03-05-epi-cli-design.md) — Original CLI design (Rust, FFI, TUI layout)
- [`docs/plans/2026-03-05-epi-cli-expansion.md`](../../plans/2026-03-05-epi-cli-expansion.md) — vault/graph/agent expansion plan
- [`docs/specs/PILLAR-I-CANONICAL.md`](../../specs/PILLAR-I-CANONICAL.md) — Pillar I canonical spec (17 BIMBA entities, 128-byte struct)
- [`CLAUDE.md`](../../../CLAUDE.md) — Full onto-code architecture blueprint
