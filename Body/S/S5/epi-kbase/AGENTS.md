# AGENTS.md — epi-kbase

## Purpose
JS/TS interface layer (package `epi-kbase`): "S5.2' kbase: bounded resource context for DAY/NOW agent runs (NotebookLM-type scoping)" (`package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-2'-SPEC]]

## Ownership
- `package.json` — package manifest + entry points (`src/index.ts` main; `./project-scope`, `./envelope-metadata`, `./sem-search`, `./skill-search` exports).
- `src/index.ts` — barrel re-export / public surface (no logic; aggregates the four modules below).
- `src/project-scope.ts` — run/day project scoping + `bindKbaseProject` (per `index.ts` exports).
- `src/envelope-metadata.ts` — `readKbaseProject` / `setKbaseProject` / `propagateKbaseToChild` envelope scope.
- `src/sem-search.ts` — `kbaseSearch` / `hasHighRelevanceMatch` semantic search.
- `src/skill-search.ts` — `skillSearch` + frontmatter parsing.
- `CONTRACT.md` — local integration contract (coordinate S5.2', export ↔ consumer table).
- Does NOT own the `bkmr` CLI or its Rust/shell wrappers (S0 `epi-cli/scripts/kbase.sh`, `epi-cli/src/core/knowing/kbase.rs`) nor kbase foundations (sibling Rust `epi-kbase-core`); domain law lives in [[S5-2'-SPEC]], not duplicated here.

## Local Contracts
- `CONTRACT.md` (export ↔ consumer integration surface; dependencies `bkmr` CLI + `BKMR_PROJECT`).
- Coordinate Header: none (`src/index.ts` is a re-export barrel, no `//!`/top doc-comment).
- Owning spec: [[S5-2'-SPEC]]; layer spec [[S5-SPEC]] / [[S5-ARCHITECTURE]]; [[S-SYSTEM-INDEX]].

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `pnpm --dir Body/S/S5/epi-kbase test` (vitest) and `pnpm --dir Body/S/S5/epi-kbase typecheck` (`tsc --noEmit`).

## Child DOX Index
- (leaf)
