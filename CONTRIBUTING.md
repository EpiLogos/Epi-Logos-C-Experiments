# Contributing to Epi-Logos

Epi-Logos is a shared knowledge project and a production codebase. Contribution here is not only adding features; it is stewardship of a coordinate-governed system whose docs, code, tests, vault artifacts, and runtime surfaces must remain mutually accountable.

The practical rule is strict: build real functionality, verify it with real tests, and document the state honestly.

## First Orientation

1. Install or build the CLI from source:

   ```bash
   cargo install --path Body/S/S0/epi-cli
   epi core verify
   ```

2. Read the coordinate surface you are touching:

   ```bash
   epi core knowing M4
   epi core knowing S2
   epi help coordinates
   ```

3. Check current status before claiming readiness:

   ```bash
   make test
   make rust-test
   pnpm --dir Body/M/epi-theia test:contracts
   ```

4. If your work depends on live graph/gateway services, run the relevant doctor or runbook commands instead of assuming availability.

## Production-Readiness Standard

- Do not introduce mock, demo, placeholder, or "fake until wired" behavior into production paths.
- Tests must exercise real functionality. Fixtures are acceptable only when they are generated from or pinned to real contracts, not invented to satisfy shape checks.
- A degraded state must be surfaced as degraded. Do not relabel blocked, pending, fallback, or dry-run behavior as live.
- Privacy and protected-local boundaries are release gates, not UX preferences.
- Human-required gates must not be bypassed by agents, automation, or convenience helpers.

## Coordinate-First Development

The coordinate system is the codebase map. Before editing, identify the coordinate family and owner:

| Area | Typical coordinate ownership |
| --- | --- |
| C kernel, pointer-web, profile substrate | `S0`, `S0'`, `M0-M5` |
| Vault writes and Hen compiler law | `S1`, `S1'` |
| Neo4j graph schema, retrieval, semantic cache | `S2`, `S2'` |
| Gateway, sessions, SpaceTimeDB, Graphiti, Redis context | `S3`, `S3'` |
| Agent foundation, VAK/orchestration, ta-onta runtime | `S4`, `S4'` |
| Review, autoresearch, Epii agent/kbase/plugin bodies | `S5`, `S5'` |
| Theia/Electron product surface | `M'`, especially `Body/M/epi-theia` |
| Canonical specs, plans, and design authority | `Idea/Bimba/Seeds/**` |
| UX/system explanation | `Idea/Pratibimba/System/**` |

Do not move design/canon material into implementation folders unless it is implementation-local README material. Do not move generated artifacts or runtime bundles into vault knowledge paths.

## Development Workflow

### C substrate

```bash
make
make test
make debug
```

The C code lives under `Body/S/S0/epi-lib`. Test binaries are emitted under `Body/S/S0/epi-lib/test/bin/`.

### Rust CLI and S-stack

```bash
cargo build --manifest-path Body/S/S0/epi-cli/Cargo.toml
make rust-test
make rust-target-size
make rust-clean
```

`make rust-test` uses `/tmp/epi-logos-cargo-target` by default to keep repo artifacts contained.

### M' Theia surface

```bash
pnpm --dir Body/M/epi-theia install
pnpm --dir Body/M/epi-theia build
pnpm --dir Body/M/epi-theia test:contracts
```

The canonical M' shell is `Body/M/epi-theia`. New product-surface work should route through Theia extensions and contracts, not deprecated migration-source surfaces.

### Graph and gateway services

Use live-service runbooks and doctors before claiming health:

```bash
cargo run --manifest-path Body/S/S0/epi-cli/Cargo.toml -- graph bootstrap-dev
source .env.graph-dev
epi --json graph doctor
```

For gateway and SpaceTimeDB operation, see `docs/operations/track-03-runbook.md`.

## Documentation Contributions

Docs are part of the system contract.

- Root docs should distinguish verified state, active blockers, and roadmap.
- Changelog entries should start from the minimum evolute baseline and avoid backfilling mythic prehistory.
- Public distribution claims must not say a channel exists until it has release evidence.
- Seed-governed design docs belong under the owning `Idea/Bimba/Seeds/**` coordinate.
- UX-facing explanation belongs under `Idea/Pratibimba/System/**`.
- Operational runbooks belong under `docs/operations/`.

## Code Standards

- C11 with `-Wall -Wextra -Werror -pedantic`.
- `Holographic_Coordinate` / HC hot coordinate shape must remain exactly 128 bytes where that invariant applies.
- Tagged pointers must be untagged with `GET_PTR(ptr)` before dereference.
- Keep protected-local payloads out of public-current profile, graph, SpaceTimeDB, and UI surfaces.
- Rust code should be `cargo fmt` clean. Warning debt should be reduced, not normalized.
- Theia extensions should consume shared contracts and kernel-bridge surfaces rather than inventing direct runtime calls.

## GitNexus and Impact Discipline

This repo is indexed by GitNexus. Before changing a function, class, method, or shared symbol, run impact analysis for the symbol and respect high-risk findings. Before committing, run change detection to verify the affected scope.

For documentation-only edits that do not modify indexed code symbols, record the docs scope clearly and still verify with relevant docs/build commands.

## Commit Messages

Use conventional commits:

```text
docs: refresh release status docs
fix: harden graph doctor fallback reporting
test: add real profile contract fixture coverage
refactor: move gateway lifecycle helper to S3 service owner
```

## License

By contributing, you agree to license your contributions under MIT OR Apache-2.0.
