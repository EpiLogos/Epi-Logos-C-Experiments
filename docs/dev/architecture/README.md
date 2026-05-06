# System Architecture Map

This directory is the current `depwire` architecture snapshot for the Epi-Logos repository, generated on `2026-04-02` from the repo root with the `full` analysis profile.

## Snapshot At A Glance

- Files analyzed: `513`
- Symbols indexed: `8,437`
- Dependency edges: `3,154`
- Bridge edges: `14`
- Languages detected: Rust, TypeScript, C, Python
- Depwire health score: `64/100` (`D`)

## Start Here

- `depwire/ARCHITECTURE.md` — high-level structure, layers, entry points, hub files, and circular dependencies
- `depwire/DEPENDENCIES.md` — directory and file dependency relationships
- `depwire/HEALTH.md` — architecture quality score, god files, orphan files, and dependency depth
- `depwire/STATUS.md` — TODO / NOTE inventory across the repo
- `depwire/TESTS.md` — test inventory and depwire's source-mapping heuristics
- `depwire/DEAD_CODE.md` — candidate dead symbols for manual review
- `depwire/graph.full.json` — machine-readable full graph export for downstream tooling

## Current Highlights

- The heaviest first-party zones in this snapshot are `Idea/Pratibimba/System/bimba-mcp`, `Idea/Pratibimba/System/epi-app`, `epi-cli`, `epi-lib`, and `epi-spacetime-module`.
- `epi-cli/tests` is large enough to appear as a first-class orchestration layer in the graph, which is useful context when reading coupling and hub-file reports.
- Depwire found one circular dependency: `epi-cli/src/gate/transcripts.rs` ↔ `epi-cli/src/gate/session_store.rs`.

## Scope Notes

- This snapshot intentionally excludes local tooling and volatile build/runtime paths:
  - `depwire/**`
  - `.worktrees/**`
  - `epi-cli/target/**`
  - `epi-spacetime-module/target/**`
  - `.tmp-real-pi-verify/**`
- `TESTS.md` is useful for inventory, but its source-mapping section is heuristic. It is not proof of behavioral coverage.
- `DEAD_CODE.md` is a review queue, not a delete list. Validate every candidate before acting on it.

## Refresh Commands

From the repo-local depwire checkout:

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/depwire

node dist/index.js docs '/Users/admin/Documents/Epi-Logos C Experiments' \
  -o '/Users/admin/Documents/Epi-Logos C Experiments/docs/dev/architecture/depwire' \
  --profile full \
  --exclude 'depwire/**' '.worktrees/**' 'epi-cli/target/**' 'epi-spacetime-module/target/**' '.tmp-real-pi-verify/**' \
  --stats --verbose

node dist/index.js parse '/Users/admin/Documents/Epi-Logos C Experiments' \
  -o '/Users/admin/Documents/Epi-Logos C Experiments/docs/dev/architecture/depwire/graph.full.json' \
  --profile full \
  --pretty \
  --exclude 'depwire/**' '.worktrees/**' 'epi-cli/target/**' 'epi-spacetime-module/target/**' '.tmp-real-pi-verify/**' \
  --stats --verbose
```

For live exploration instead of static docs:

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/depwire
node dist/index.js viz '/Users/admin/Documents/Epi-Logos C Experiments' \
  --profile full \
  --exclude 'depwire/**' '.worktrees/**' 'epi-cli/target/**' 'epi-spacetime-module/target/**' '.tmp-real-pi-verify/**' \
  --no-open
```
