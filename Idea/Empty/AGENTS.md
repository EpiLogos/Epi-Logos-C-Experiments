# AGENTS.md — Empty

## Purpose
`Idea/Empty` is the temporal working surface of the vault: the `Present/` day/session/now tree plus two harmonisation bridge files that point legacy coordinate-language out to current canon. It is not a source of truth — durable coordinate definitions graduate into [[World-Ontology]] / [[World/Types]].
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[World-Ontology]]

## Ownership
- `Present/` — temporal day/session/now tree: `DD-MM-YYYY/` day folders, each with datetime-prefixed session dirs (`YYYYMMDD-HHmmss-id/` with `tasks/ patterns/ thinking/ thoughts/`) and in-day working artifacts (plans, design notes, canon extracts).
- `COORDINATE-MAP.md` — harmonisation bridge from the old `Idea/Empty` coordinate map into current S/S′ canon (defers to [[S-SYSTEM-INDEX]] + level specs); described as "a harmonised bridge from the older `Idea/Empty` coordinate files into current canon".
- `coordinate-semantics.md` — natural-language glossary bridge for the original coordinate definitions; described as "a harmonised bridge for the original coordinate-language definitions"; defers to [[CLAUDE.md]] for `#`/families/operators.
- Does NOT own canonical Forms/Types/Pratibimba (those live in `Bimba/`) nor implementation (that lives in the `Body/` code roots). The two bridge files explicitly delegate authority — do not treat them as the live coordinate spec.

## Local Contracts
- Owning ontology frame + residency law: [[World-Ontology]]; root `#`/family/operator law: [[CLAUDE.md]].
- The bridge files themselves are NOT contracts — they redirect to [[S-SYSTEM-INDEX]] and the [[S0-SPEC]] family for current authority.
- No `CONTRACT.md` / `Cargo.toml` / `lib.rs` here — this is a vault tree, not a crate.

## Work Guidance
- `[[wikilink]]` every coordinate / spec / carrier / agent / concept reference by file basename (verify the target exists first).
- Vault writes MUST use coordinate-prefixed `c_n_*` frontmatter; do not invent keys (unknown keys are ERRORS).
- Day/NOW placement law: day = `Present/DD-MM-YYYY/daily-note.md`; NOW = `Present/DD-MM-YYYY/YYYYMMDD-HHmmss-id/now.md` (datetime-prefixed, no sequential counters).
- Keep this surface temporal: graduate durable definitions into [[World-Ontology]] / [[World/Types]] (via Hen) rather than hardening them in the bridge files.

## Verification
- Vault validation before committing any vault write: use the `bimba-vault-validate` skill (frontmatter, residency, wikilinks, hierarchy placement).

## Child DOX Index
- (leaf)
