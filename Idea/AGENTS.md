# AGENTS.md — Idea

## Purpose
`Idea/` is the reflective filesystem ontology (the vault): structured knowledge, Forms, session state, archive, and ontological incubation — the surface the system reads, writes, syncs, and gradually develops, as distinct from the executable `Body/` code roots (per [[repo-ontology]]).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[World-Ontology]]

## Ownership
- `Bimba/` — canonical knowledge: `Seeds/` (long-form coordinate specs), `World/` (crystallised Forms + Types + MOC, incl. [[World-Ontology]]), `Map/` (the M0–M5 graph made navigable: a generated, wikilink-open *reflection* projection in `M0/`–`M5/` + raw `datasets/` provenance).
- `Pratibimba/` — instantiated reflections: `Self/` (PASU bootstrap, T'/Action surfaces) and `System/`.
- `Empty/` — temporal working surface + bridge files: `Present/` (day/session/now), plus [[COORDINATE-MAP]] and [[coordinate-semantics]] harmonisation bridges.
- `Temp - 02-06-2026.md` — root scratch cleanup note (not canon).
- Does NOT own implementation/behavior — that lives in the `Body/` code roots; `Idea/` holds knowledge only. Domain law stays in its owning coordinate spec, not relocated here by convenience.

## Local Contracts
- Owning ontology frame + residency law: [[World-Ontology]], [[repo-ontology]].
- Frontmatter/residency rules (the binding interface for any vault write): see [[repo-ontology]] (coordinate-prefixed `c_n_*` keys; `coordinate` is the one exempt key; `c_0_source_coordinates` always `string[]`).
- No `CONTRACT.md` / `Cargo.toml` / `lib.rs` here — this is a vault tree, not a crate.

## Work Guidance
- `[[wikilink]]` every coordinate / spec / carrier / agent / concept reference by file basename (verify the target exists first).
- Vault writes MUST use coordinate-prefixed `c_n_*` frontmatter; do not invent keys (unknown keys are ERRORS).
- Honour residency law: canon Forms/Types/Pratibimba writes go through Hen ([[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]); SwarmVault never writes into `Idea/`.
- Place artifacts in the correct root: `Empty/Present` for day/session/now, `Pratibimba/Self` for self-facing runtime markdown, `Bimba/World` for crystallised Forms.

## Verification
- Vault validation before committing any vault write: use the `bimba-vault-validate` skill (frontmatter, residency, wikilinks, hierarchy placement).

## Child DOX Index
- `Bimba/AGENTS.md` — canonical knowledge tree: Seeds (specs), World (Forms/Types/MOC + [[World-Ontology]]), Map (M0–M5 graph made navigable: generated reflection projection + datasets).
- `Pratibimba/AGENTS.md` — instantiated reflections: Self (PASU, T'/Action) and System.
- `Empty/AGENTS.md` — temporal working surface (Present: day/session/now) + coordinate bridge files.
