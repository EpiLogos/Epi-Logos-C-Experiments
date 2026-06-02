# Epi-Logos

> A coordinate-native knowledge architecture for reflexive intelligence, shared inquiry, and sovereign technical practice.

Epi-Logos is a philosophical-computational system that treats knowledge as a field with structure, not as a heap of facts. Its central wager is simple and demanding: if language, number, code, and lived experience already shape one another, then our tools should make that shaping visible, auditable, and transformable.

The project is both theory and substrate. At the theoretical level, Epi-Logos is a meta-techne: a craft for making inquiry responsible to its own form. At the technical level, it is a repo-native system of C, Rust, graph, gateway, agent, vault, and Theia surfaces arranged through a coordinate grammar.

## Current Status

This repository is in active developmental convergence, not packaged release.

As of the 2026-06-02 documentation baseline:

| Surface | Status | Evidence |
| --- | --- | --- |
| C substrate | Verified | `make test` passes all C suites across M0-M5, Pillar/VAK/kernel, and pointer-web checks. |
| M' Theia surface | Verified at contract level | `pnpm --dir Body/M/epi-theia test:contracts` passes 150 Node contract tests. |
| Rust CLI and S-stack control plane | Substantially implemented, currently blocked in full suite | `make rust-test` builds and runs many suites but fails on one experimental runtime protocol-doc materialization check; warning debt remains. |
| M-dev Cycle 2 | Near closure, not complete | `79/84` tasks done; remaining tasks are graph/relay/method-drift/no-orphan closure items. |
| Cycle 3 design reconciliation | Opened | Plan folder exists for four-way reconciliation across UX docs, M' specs, landed code/substrate, and Theia surfaces. |

See [docs/STATUS.md](docs/STATUS.md) for the current verification ledger and known blockers.

## What This Is

Epi-Logos names the recursive move of logos upon logos: language and reason bending back to examine the conditions by which they gather meaning. In practical terms, the system gives people and agents a shared coordinate surface for asking:

- What is being assumed?
- What structure is actually operative?
- Which context is being hidden or flattened?
- What would make an action verifiable, reversible, and worthy of trust?
- How does a synthesis return to ground instead of becoming a closed doctrine?

That is why the project combines philosophical canon, symbolic systems, graph databases, agent orchestration, vault residency, and runtime contracts. They are not separate ornaments. They are different registers of one working field.

## Coordinate Grammar

The coordinate system is the repo map. It gives architecture, documentation, and runtime behavior a shared address space.

| Family | Letter | Role |
| --- | --- | --- |
| Category | `C` | Ontological foundation and type structure |
| Position | `P` | Functional movement through ground, definition, operation, pattern, context, integration |
| Lens | `L` | Epistemic modes and interpretive pressure |
| Stack | `S` | Technology substrate from terminal to sync |
| Thought | `T` | Cognitive and vault artifacts |
| Subsystem | `M` | The six consciousness/runtime domains |

The six subsystem positions recur throughout the repo:

| Coordinate | Name | Technical emphasis |
| --- | --- | --- |
| `M0` / `M0'` | Anuttara | Prior-ground, void/proto-logic, Bimba map |
| `M1` / `M1'` | Paramasiva | Structure, harmonic profile, topology, interval grammar |
| `M2` / `M2'` | Parashakti | 72-invariant, correspondence, frequency/meaning |
| `M3` / `M3'` | Mahamaya | 64 codons, clock/cosmos, symbolic transcription |
| `M4` / `M4'` | Nara | Personal field, protected local experience, oracle/day surfaces |
| `M5` / `M5'` | Epii | Integration, review, autoresearch, recursive self-accounting |

Operators such as `.`, `-`, `/`, and context-frame notation express nesting, branching, fusion, and execution context. The syntax matters because the same coordinates are used by code, graph data, docs, prompts, and UI surfaces.

## Repository Shape

```text
Body/
  S/
    S0/epi-lib/          C11 substrate: M0-M5, kernel, VAK, pointer-web
    S0/epi-cli/          Rust CLI/control plane and TUI
    S0/portal-core/      Shared profile/kernel contracts
    S1/                  Hen compiler and vault/write-law substrate
    S2/                  Graph schema and graph services
    S3/                  Gateway, SpaceTimeDB, Graphiti, Redis context
    S4/                  PI agent foundation and ta-onta runtime
    S5/                  Review, autoresearch, agent, kbase, plugin bodies
  M/
    epi-theia/           Canonical M' Theia/Electron surface
Idea/
  Bimba/Seeds/           Canonical specs, plans, coordinate-governed design
  Pratibimba/System/     UX/system documentation for the M' surface
docs/
  STATUS.md              Current verification and release-readiness ledger
  operations/            Operator runbooks
  provenance/            Vendor/provenance records
Makefile                 Root verification and build targets
```

The old simple shape of "C library plus Rust CLI" is no longer accurate. The CLI is now a control plane over a multi-crate S0-S5 substrate, and the M' surface is Theia-based.

## Quick Start

### Prerequisites

- Rust toolchain via `rustup`
- C compiler, with `clang` preferred
- `pnpm` for the Theia workspace
- Optional live services: Neo4j, Redis Stack, SpaceTimeDB, Graphiti runtime, and PI tooling

### Build and install the CLI from source

```bash
cargo install --path Body/S/S0/epi-cli
epi core verify
```

### Run core verification

```bash
make test
```

This compiles and runs the C substrate suites from `Body/S/S0/epi-lib/test/`.

### Run Rust verification

```bash
make rust-test
```

This routes Cargo artifacts to `/tmp/epi-logos-cargo-target` by default. At the current baseline it is expected to expose the experimental runtime protocol-doc materialization blocker noted in [docs/STATUS.md](docs/STATUS.md).

### Run Theia contract verification

```bash
pnpm --dir Body/M/epi-theia test:contracts
```

This checks the M' shell contracts, extension contracts, integrated plugin composition, privacy gates, accessibility/performance release rules, and body/deep-surface handoff invariants.

### Bootstrap the graph stack

```bash
cargo run --manifest-path Body/S/S0/epi-cli/Cargo.toml -- graph bootstrap-dev
source .env.graph-dev
epi --json graph doctor
```

Only claim graph health after `epi --json graph doctor` reports the live service state.

## CLI Surface

Examples:

```bash
epi core verify
epi core knowing M4
epi core knowing --family M
epi help coordinates
epi vault search "query"
epi graph doctor
epi agent doctor --json
```

Use `--json` for machine-readable output and `--tui` where supported.

## Distribution

Source build is the current supported path. Cargo, prebuilt binary, and Homebrew distribution are planned release channels, not yet public release facts. See [DISTRIBUTION.md](DISTRIBUTION.md).

## Contributing

Contributions are expected to be production-oriented. Mock/demo/placeholder patterns are not acceptable, and tests must exercise real functionality. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Licensed under either MIT or Apache-2.0, at your option. See [LICENSE-MIT](LICENSE-MIT) and [LICENSE-APACHE](LICENSE-APACHE).

---

Ontology is lived conception becoming living code.
