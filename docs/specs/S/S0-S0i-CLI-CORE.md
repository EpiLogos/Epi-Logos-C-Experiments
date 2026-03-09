# S0/S0' — Terminal / CLI Core (Ground)

**Status:** ACTIVE — Primary development surface
**Coordinate:** S0 (explicit terminal), S0' (QL-augmented CLI)
**Implementation:** `epi-cli/` (Rust) + `src/` (C library)
**CLI Namespace:** `epi core`, `epi` (root router)

---

## Current State

S0' is the most mature layer. The `epi` CLI (Rust, clap) routes to the C library (`libepilogos`) via FFI.

### What Exists
- **epi-cli/src/**: 15 module directories (core, ffi, tui, vault, graph, gate, agent, sync, app, book, code, kbase, sesh, techne)
- **C library**: M0-M4 implemented, psychoid numbers, engine, arena, families
- **CLI commands**: `epi core {inspect, walk, verify, ring, m0, m1}`, `epi vault {CRUD, frontmatter, daily, now-read/write}`, stubs for graph/gate/agent/sync

### Architecture
```
epi (Rust CLI router)
  |-- core (FFI -> libepilogos.so)
  |-- vault (obsidian-cli wrapper -> S1)
  |-- graph (neo4j/redis client -> S2)
  |-- gate (gateway client -> S3)
  |-- agent (pi lifecycle -> S4)
  |-- sync (n8n/notion -> S5)
  |-- tui (ratatui dashboard)
  |-- ffi (dlopen + C function bindings)
  |-- techne (build/test orchestration)
```

### S0 vs S0' Distinction
- **S0** = raw terminal primitives: process spawn, shell env, file I/O, CLI argument parsing
- **S0'** = QL-augmented: coordinate validation, topology-aware routing, the `epi` command grammar itself

### Integration Points
- Every other S-layer is accessed **through** S0' — the CLI is the universal substrate
- C library loaded via `dlopen` at runtime (path configurable via `--lib`)
- All S1-S5 commands pass through the CLI router before reaching their layer

### Next Steps
- Complete `epi core` coverage for M2-M4
- Wire `epi vault` to actual obsidian-cli (requires S1 setup)
- Implement `epi graph` client (requires S2 setup)
- TUI dashboard (`ratatui`) for live system visualization

### QV Pipeline (v0.2.0)

The Quintessential View pipeline manages self-knowledge data:
- **Overlay** (`~/.epi-logos/qv/overlay.json`) — staging tier for fast iteration
- **Bake** (`epi core knowing --bake`) — generates `src/qv_data.c` with static strings
- **Three-tier resolution** — overlay -> C library -> static Rust tables
- **Write gate** — session passphrase protects overlay modifications
- **Coverage** — `epi core knowing --coverage` reports population across 89 coordinate slots
- **Knowing dossier** — `epi core knowing <coord>` resolves essence, structural correspondences, relational field, KBase field, notebook pulse, and latest snapshot
- **Knowing actions** — `--project`, `--refresh`, `--open`, `--glow`, and `--tui` turn the command into a lightweight knowledge portal surface

See `docs/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md` for full architecture.
