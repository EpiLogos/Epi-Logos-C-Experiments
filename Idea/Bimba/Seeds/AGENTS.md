# AGENTS.md — Seeds

## Purpose
`Idea/Bimba/Seeds` is the **long-form spec + plan source layer**: the per-family coordinate specs,
the umbrella indexes, the architecture pack, the M' system specs, and the cycle plan sets — the
material that crystallises *into* `World/` Forms and *into* the graph. An **upward / source** tree.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] (S work) / [[M'-SYSTEM-SPEC]] (M' work).

## Ownership
- Family spec folders `C/ P/ L/ S/ T/ M/` (+ primes): long-form coordinate specs, shard specs, and
  `Legacy/` archives. S work is canonically rooted at [[S-SYSTEM-INDEX]] (`S/`); M' work at the M'
  specs ([[M'-SYSTEM-SPEC]] et al.) and the active cycle plans under `M/Legacy/plans/`.
- [[M'-TAURI-PORT-SPEC]] is retained as historical migration reference only; current cross-domain
  carrier authority is [[M'-SYSTEM-SPEC]] plus the [[M0']]-[[M5']] domain specs and active carrier plans.
- `M/q-vocabulary-canon.md` — the OPEN `q_` / `qm_` register-vocabulary Form (shape law: only the
  position `n` is fixed, the facet slug is free) consumed by [[S1]] frontmatter validation and [[S2]]
  graph/semantic contracts.
- Umbrella + bridge indexes: [[ARCHITECTURE-DIAGRAM-PACK]], [[S-SYSTEM-INDEX]], [[M-SYSTEM-INDEX]],
  [[S-SOURCE-TRACEABILITY-INDEX]], `LEGACY-DOCS-MIGRATION-INDEX`.
- Cycle plan sets: `M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/` (numbered
  tranches `NN-*.md`, registered in `plan.index.json`/`plan.state.json`). New design tranches land here.
- `Seeds-Provenance-Ledger.base` — zone-level `base-view` reflection for Seed/spec/traceability
  provenance by coordinate, source links, and artifact role.
- Does NOT own crystallised Forms (`World/`), the graph reflection (`Map/`), or behaviour (`Body/`).

## Local Contracts
- Per-layer canon: the `Sn-SPEC`/`Sn-ARCHITECTURE` and `Mn'-SPEC` docs the indexes route into;
  read the umbrella + exact layer spec before shard specs (root `AGENTS.md` → Canonical Reading Protocol).
- Cycle-3 plans are plain markdown (no frontmatter); register a new tranche in `plan.index.json`
  (`tracks` array: `id`/`file`/`path`/`title`/`checksum`). Family specs use `c_n_*` frontmatter.
- No `CONTRACT.md` / crate — knowledge tree.

## Work Guidance
- `[[wikilink]]` every coordinate / spec / flow / decision reference by basename (verify it exists here).
- Spec/Form writes use coordinate-prefixed `c_n_*` frontmatter; unknown keys are ERRORS. Plan tranches
  are exempt (plain markdown) but must be registered in the plan index.
- A change to a **contract surface** (public API, method, envelope field) also flags the owning
  `[[Sn-ARCHITECTURE]]` / `[[Sn-SPEC]]` / `[[Mn'-SPEC]]` for canon update.

## Verification
- `bimba-vault-validate` for frontmatter-bearing spec/Form files. For plan tranches: confirm
  `plan.index.json` parses and the new `tracks` entry resolves to the file + checksum.

## Child DOX Index
- (leaf) — `C/ P/ L/ S/ T/ M/` family trees + `Legacy/` have no nested AGENTS.md; navigate via
  [[S-SYSTEM-INDEX]] / [[M-SYSTEM-INDEX]] / [[ARCHITECTURE-DIAGRAM-PACK]] and the per-layer specs.
