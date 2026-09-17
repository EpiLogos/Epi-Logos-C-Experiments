# AGENTS.md — Body

## Purpose
The embodied system: the [[S]]/[[S']] technology substrate stack and the [[M']] coded expression (the Pratibimba IDE surface). Pure container — it holds two coordinate subtrees and owns no code of its own.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] / [[M'-SYSTEM-SPEC]]

## Ownership
- `S/` — the six-layer S-stack ([[S0]]..[[S5]]) plus `epi-kernel-contract` at `S/` root (the cross-stack typed-shape crate, sibling to S0..S5 per DR-S0-1). See `S/AGENTS.md`.
- `M/` — the [[M']] coded expression; currently `M/epi-theia` (the Pratibimba Theia IDE surface). See `M/AGENTS.md`.
- `_quarantine/` — parked `root-spec-seed` + `root-staging-remainder`; do NOT build on quarantined material.
- Does NOT own any domain law itself. Every S-layer/M'-coordinate's law lives in its own module under `S/Sn` or `M/`, never hoisted into Body or into [[S0]]/[[M0']] for convenience.

## Local Contracts
(none at this level — Body is a container). Binding contracts live in the children: `S/epi-kernel-contract/src/lib.rs //!` (the cross-stack kernel envelope) and each layer's owning spec ([[S0-SPEC]]..[[S5-SPEC]], [[S0-ARCHITECTURE]]..[[S5-ARCHITECTURE]], the [[M']] specs). See parent root AGENTS.md + Canon.

## Work Guidance
- Route by coordinate: S/S' work descends into `S/`; M' work descends into `M/`. Do not place new work at the Body root.
- Run `gitnexus_impact` before editing any symbol; `[[wikilink]]` all entity references; use coordinate-prefixed `c_n_*` frontmatter for any vault writes.

## Verification
(none specific — inherit parent). Per-area checks live in the children (`cargo test -p <crate>`, `make test` / `make rust-test` in `S/S0/epi-lib`, `pnpm --dir Body/M/epi-theia test:contracts`).

## Child DOX Index
- `Body/S/AGENTS.md` — the [[S]]/[[S']] technology substrate: S0 C/CLI ground through S5 world boundary, plus `epi-kernel-contract`.
- `Body/M/AGENTS.md` — the [[M']] coded expression: `epi-theia`, the "Pratibimba System — Theia-based IDE surface for the Epi-Logos M5-3 layer."
