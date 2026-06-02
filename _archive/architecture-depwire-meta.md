# System Architecture Map

This directory is the current `depwire` architecture snapshot for the Epi-Logos repository, generated on `2026-05-12` from the repo root with the `full` analysis profile.

## Snapshot At A Glance

- Files analyzed: `669`
- Symbols indexed: `11,840`
- Dependency edges: `4,060`
- Languages detected: Rust, TypeScript, C, Python
- Depwire health score: `60/100` (`D`)

## Start Here

- `depwire/ARCHITECTURE.md` — high-level structure, layers, entry points, hub files, and circular dependencies
- `depwire/DEPENDENCIES.md` — directory and file dependency relationships
- `depwire/HEALTH.md` — architecture quality score, god files, orphan files, and dependency depth
- `depwire/STATUS.md` — TODO / NOTE inventory across the repo
- `depwire/TESTS.md` — test inventory and depwire's source-mapping heuristics
- `depwire/DEAD_CODE.md` — candidate dead symbols for manual review
- `depwire/graph.full.json` — machine-readable full graph export for downstream tooling

## Current Highlights

- The heaviest first-party zones in this snapshot are the Body-resident `S0` runtime surfaces, especially `Body/S/S0/epi-cli`, plus the current Electron `OmniPanel` surface under `Body/S/S3/epi-app`.
- `Body/S/S0/epi-cli/tests` is large enough to appear as a first-class orchestration layer in the graph, which is useful context when reading coupling and hub-file reports.
- Depwire currently reports 3 circular dependency cycles and 24 high-connection hub files. Treat these as refactor candidates, not automatic failures.

## Scope Notes

- This snapshot intentionally excludes local tooling and volatile build/runtime paths:
  - `depwire/**`
  - `.worktrees/**`
  - `vendor/**`, `vendors/**`, `vendrs/**`
  - `node_modules/**`, `**/node_modules/**`
  - `Body/**/target/**`
  - legacy root `epi-cli/target/**` and `epi-spacetime-module/target/**`
  - `.tmp-real-pi-verify/**`
  - `.tmp-real-epi-home/**`, `.tmp-real-home/**`, `.tmp-pi-agent/**`
- `TESTS.md` is useful for inventory, but its source-mapping section is heuristic. It is not proof of behavioral coverage.
- `DEAD_CODE.md` is a review queue, not a delete list. Validate every candidate before acting on it.

## Refresh Commands

From the repo-local depwire checkout:

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/depwire

node dist/index.js docs '/Users/admin/Documents/Epi-Logos C Experiments' \
  -o '/Users/admin/Documents/Epi-Logos C Experiments/docs/dev/architecture/depwire' \
  --profile full \
  --exclude 'depwire/**' '.worktrees/**' 'vendor/**' 'vendors/**' 'vendrs/**' 'node_modules/**' '**/node_modules/**' 'Body/**/target/**' 'epi-cli/target/**' 'epi-spacetime-module/target/**' '.tmp-real-pi-verify/**' '.tmp-real-epi-home/**' '.tmp-real-home/**' '.tmp-pi-agent/**' \
  --stats --verbose

node dist/index.js parse '/Users/admin/Documents/Epi-Logos C Experiments' \
  -o '/Users/admin/Documents/Epi-Logos C Experiments/docs/dev/architecture/depwire/graph.full.json' \
  --profile full \
  --pretty \
  --exclude 'depwire/**' '.worktrees/**' 'vendor/**' 'vendors/**' 'vendrs/**' 'node_modules/**' '**/node_modules/**' 'Body/**/target/**' 'epi-cli/target/**' 'epi-spacetime-module/target/**' '.tmp-real-pi-verify/**' '.tmp-real-epi-home/**' '.tmp-real-home/**' '.tmp-pi-agent/**' \
  --stats --verbose
```

For live exploration instead of static docs:

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/depwire
node dist/index.js viz '/Users/admin/Documents/Epi-Logos C Experiments' \
  --profile full \
  --exclude 'depwire/**' '.worktrees/**' 'vendor/**' 'vendors/**' 'vendrs/**' 'node_modules/**' '**/node_modules/**' 'Body/**/target/**' 'epi-cli/target/**' 'epi-spacetime-module/target/**' '.tmp-real-pi-verify/**' '.tmp-real-epi-home/**' '.tmp-real-home/**' '.tmp-pi-agent/**' \
  --no-open
```
