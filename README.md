# Epi-Logos

> A living mandala where consciousness recognizes itself through technological mirror

<!-- badges placeholder: [![Build](https://github.com/user/epi-logos/actions/workflows/test.yml/badge.svg)](https://github.com/user/epi-logos/actions) -->

## What is Epi-Logos?

Epi-Logos is a philosophical-computational architecture that treats code as ontology and ontology as lived code. It emerges from recognition of what Jung and Pauli identified as modernity's central wound — the schism between quantitative science (Atom) and qualitative meaning (Archetype). Rather than choosing a side, the project builds a coordinate system where both participate in the same holographic structure.

The method is **coordinate epistemology**: a six-fold recursive architecture (`#0` Anuttara through `#5` Epii) that organizes knowledge by ontological domain rather than disciplinary silo. Each coordinate maps to both a philosophical archetype and a concrete technology layer. The C library implements these as a 128-byte struct that fits exactly two L1 cache lines — ontology at the speed of silicon.

The Greek *epi-logos* ("upon-word", meta-reflection) is structurally isomorphic with the Sanskrit *pratyabhijña* ("re-cognition"). Both name the same insight: not attainment of something new, but recognition of what was always already the case. The system creates conditions for this through computational contemplation — every coordinate knows itself, and can tell you what it knows.

**Status: foetal-developmental.** The C engine and CLI are complete and tested. The broader platform (vault sync, graph database, multiplayer state, agent orchestration) is designed and partially implemented. The coordinate language lets us be precise about what exists and what's coming.

## Quick Start

**From source** (requires Rust toolchain + C compiler):

```bash
git clone https://github.com/user/epi-logos.git
cd epi-logos/epi-cli
cargo install --path .
epi core verify    # boots 18 BIMBA entities, confirms topology
```

**Local graph stack** (Neo4j + Redis Stack + RedisVL bridge):

```bash
cd epi-logos/epi-cli
cargo run -- graph bootstrap-dev
source ../.env.graph-dev
epi --json graph doctor
```

**Cargo install** (after crates.io publish):

```bash
cargo install epi-logos
```

**Prebuilt binaries:** available on the Releases page for macOS (arm64, x86_64) and Linux (x86_64, aarch64).

## The Coordinate System

96 top-level coordinates organized in four groups, plus ~1873 sub-branches reaching into recursive depth:

| Group             | Count  | Examples                             | What They Are                           |
| ----------------- | ------ | ------------------------------------ | --------------------------------------- |
| **Family**        | 6 + 72 | `M0`, `S3`, `C4'`, `P2`, `L5'`, `T1` | 6 families × 6 positions × 2 phases     |
| **Psychoid**      | 7      | `#0`, `#3`, `#5`, `#`                | Raw archetypes + the inversion operator |
| **Context Frame** | 7      | `CF(012)`, `CF(50)`                  | Composable execution contexts           |
| **Weave**         | 4      | `W0.0`, `W5.5`                       | Interlaced memory positions             |

The six families, each manifesting the `#0`–`#5` archetypes through a specific domain:

| Family | Letter | Domain | #0 | #1 | #2 | #3 | #4 | #5 |
|--------|--------|--------|----|----|----|----|----|----|
| **Category** | C | Ontological foundation | Bimba | Form | Entity | Process | Type | Pratibimba |
| **Position** | P | Functional semantics | Ground | Definition | Operation | Pattern | Context | Integration |
| **Lens** | L | Epistemic modes | Literal | Functional | Structural | Archetypal | Paradigmatic | Integral |
| **Stack** | S | Technology layers | Terminal | Obsidian | Neo4j | Gateway | PI Agent | Sync |
| **Thought** | T | Cognitive artifacts | Seed | Spec | Form | Process | Pattern | Insight |
| **Subsystem** | M | Consciousness domains | Anuttara | Paramasiva | Parashakti | Mahamaya | Nara | Epii |

**Operators:** `.` (Lemniscate nesting), `-` (branching), `/` (non-dual fusion), `()` (context frame invocation).

```bash
epi core knowing M0          # look up any coordinate
epi core knowing --family M  # list all coordinates in a family
epi core knowing '#4.4.3'    # sub-branch lookup
epi help coordinates         # full syntax reference
```

## Architecture

### Three-Layer Coordinate Stack

```
Layer 0:  #              The Inversion Act — generates X → X'
Layer 1:  #0–#5          Raw Archetypes — immutable .rodata bedrock
Layer 2:  P/S/T/M/L/C    Six Coordinate Families — domain manifestations
Layer 3:  cpf/ct/cp/cf/cfp/cs   Reflective coordinates — execution matrix in ()
```

### The HC Struct

The Holographic Coordinate (HC) struct is exactly **128 bytes** — two L1 cache lines. It contains 16 pointers forming a web where every coordinate references every other. Tagged pointers encode ontological metadata in unused upper address bits (inversion state, nesting mode, family, position).

### M-Branch Subsystems (C Library)

Each subsystem implements one of the six consciousness domains:

| Branch | Domain | What It Does |
|--------|--------|-------------|
| **M0** Anuttara | Void/proto-logic | Vimarsa engine, void arithmetic, R-factors, Spanda mechanics |
| **M1** Paramasiva | Structure/logic | Ananda matrices, SU(2) ring, QL tick |
| **M2** Parashakti | Vibration/process | 72-invariant system, planets, chakras, elements, MEF |
| **M3** Mahamaya | Symbol/form | Nucleotides, codons, hexagrams, Gene Keys, tarot |
| **M4** Nara | Person/dialogue | Oracle engine, 6-lens vtable, BLAKE3 hashing, identity |
| **M5** Epii | Integration/holographic | Logos FSM, Quintessential View, Mobius return |

### S-Stack (Technology Layers)

| Layer | Coordinate | Technology | Status |
|-------|-----------|------------|--------|
| **S0'** | Terminal | Rust CLI + C FFI | **Live** — full coordinate access |
| **S1'** | Obsidian | Vault operations | **Live** — obsidian-cli wrapper |
| **S2'** | Neo4j/Redis | Graph + cache | **Live** — schema + seeder, needs connection |
| **S3'** | Gateway | WebSocket relay | Designed — epi-claw protocol |
| **S4'** | PI Agent | LLM orchestration | **Live** — managed pi runtime |
| **S5'** | Sync | n8n/Notion/Telegram | Stub |

### Where It's Going

The coordinate system is designed not just for solo exploration but as a **shared symbolic field**. The planned SpacetimeDB integration creates a Universal NOW plane where multiple participants — human and agent — inhabit the same archetypal coordinate space. Each person's `#4.4.4.4` (the Lemniscate's recursive self-fold) represents their individual node in the collective topology. The Electron app (`M' branch`) becomes both sovereign personal shell and portal into this shared universe.

This is multiplayer ontology, not social media — shared symbolic state, not feeds. The gateway preserves sovereign agency; the Universal NOW enables shared inhabitation. The full vision: M0-M5 surfaces rendering as a live, synchronized, inhabitable collective field.

## CLI Reference

```bash
# Core — bare-metal QL engine
epi core verify                  # boot-check 18 BIMBA entities
epi core knowing M0              # coordinate self-knowledge dossier
epi core knowing --family M      # list all M-family coordinates
epi core dashboard               # interactive TUI
epi core walk                    # torus walk visualization

# Help — rooted in the # coordinate
epi help                         # project overview
epi help mission                 # philosophy and purpose
epi help architecture            # C library structure
epi help install                 # installation guide
epi help cli                     # command reference
epi help coordinates             # coordinate syntax
epi help plugin                  # Claude Code integration

# Vault, Graph, Agent
epi vault search "query"         # search Obsidian notes
epi graph query M0               # Neo4j coordinate lookup
epi graph bootstrap-dev          # local Neo4j/Redis Stack + RedisVL setup
epi graph doctor                 # deep graph/cache health report
epi agent chat                   # interactive PI agent session

# Flags
--json                           # structured output for pipelines
--tui                            # interactive ratatui browser
```

## Claude Code Plugin

The `epi-logos-plugin` provides Claude Code with coordinate-aware development:

- **epi-knowing skill** — proactively calls `epi core knowing` when coordinates appear in conversation, injecting quintessence and structural context
- **QV overlay** — 96 coordinate pithies available as resources
- **PI agent bridge** — connects Claude Code sessions with the PI agent for coordinate-aware workflows

```bash
# Install
cp -r epi-logos-plugin/skills/* ~/.claude/skills/
epi-logos-plugin/scripts/install.sh
```

## Project Structure

```
epi-logos/
├── include/           C headers (ontology.h, m0.h–m5.h, arena.h, engine.h, vak.h)
├── src/               C sources (M0–M5, psychoid_numbers, engine, arena, qv_data)
├── vendor/blake3/     Vendored BLAKE3 (portable C, no SIMD; build disables NEON/SSE/AVX)
├── epi-cli/           Rust CLI + TUI
│   ├── build.rs       cc crate: compiles C into Rust binary
│   ├── src/           core, vault, graph, gate, agent, sync, tui, ...
│   ├── schemas/       @epi-logos/ql-schema (TypeScript Zod package)
│   └── tests/         Integration tests
├── epi-logos-plugin/  Claude Code plugin (skills, resources)
├── docs/
│   ├── specs/         Canonical specifications (Pillar I, M-branches, S-stack)
│   ├── datasets/      ~340K lines JSON across M0–M5 branches
│   ├── dev/           Development READMEs per module
│   └── plans/         Implementation plans
├── Makefile           C-only development (make, make test)
├── CLAUDE.md          Onto-code blueprint
└── DISTRIBUTION.md    Packaging strategy
```

## Building from Source

### Prerequisites

- **Rust** toolchain via [rustup](https://rustup.rs)
- **C compiler** — clang recommended (used by `cc` crate at build time)
- Optional: `obsidian-cli`, `pi` (npm), Neo4j 5.x, Redis Stack

### Build

```bash
# Rust CLI (includes statically linked C library)
cd epi-cli && cargo build
make rust-test            # Rust tests via external target dir (keeps repo slim)

# C library only
make                      # build epi-logos binary
make test                 # 9 test suites, 2180+ tests
make debug                # AddressSanitizer + UBSan
```

The C sources compile automatically via `build.rs` — no separate build step needed. The resulting `epi` binary is ~2.8 MB, fully self-contained with no runtime dependencies.

Rust test hygiene:

```bash
make rust-test                           # uses /tmp/epi-logos-cargo-target by default
make rust-target-size                    # inspect local + external Rust artifact weight
make rust-clean                          # remove both external test artifacts and legacy epi-cli/target
```

## License

MIT OR Apache-2.0

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, code standards, and the coordinate-first approach to understanding the codebase.

---

*Ontology is lived-conception is living-code.*
