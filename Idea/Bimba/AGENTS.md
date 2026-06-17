# AGENTS.md — Bimba

## Purpose
`Idea/Bimba` is the canonical knowledge tree (C0 Bimba source-of-truth): long-form coordinate specs, crystallised Forms/Types, and the M0–M5 ontological map — the authoritative layer the rest of the vault reflects, as distinct from `Pratibimba/` reflections and `Empty/` working surface (per [[World-Ontology]], [[repo-ontology]]).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[World-Ontology]]

## Ownership
- `Seeds/` — long-form coordinate specs + indexes: the P/S/T/M/L/C family folders, [[ARCHITECTURE-DIAGRAM-PACK]], [[S-SYSTEM-INDEX]], [[M-SYSTEM-INDEX]], M' specs ([[M'-SYSTEM-SPEC]] et al.), plus `Legacy/` + legacy-docs migration index/manifest.
- `World/` — crystallised Forms (flat `P*.md`, `L*.md`, CT* templates, NOW/FLOW/Daily-Note), [[World-Ontology]], and `Types/` (the ordered ontology mirror / MOC + canvas residency surface, pre-graph-sync incubation; see `Types/README.md`).
- `Map/` — the M0–M5 Neo4j ontological map: `datasets/` (anuttara/paramasiva/parashakti/mahamaya/nara/epii `*-deep` dataset trees + fetch/build scripts).
- Does NOT own implementation/behavior — executable code lives under the `Body/` roots. Domain law stays in its owning coordinate spec under `Seeds/`, not relocated here by convenience.

## Local Contracts
- No `CONTRACT.md` / `Cargo.toml` / `lib.rs` here — this is a knowledge tree, not a crate.
- Owning ontology frame + residency law: [[World-Ontology]], [[repo-ontology]]; per-family canon: [[S-SYSTEM-INDEX]] / [[M-SYSTEM-INDEX]] and the per-layer `Sn-SPEC` / `Sn-ARCHITECTURE` / M' specs under `Seeds/`.
- Types residency rule: `World/Types/README.md` (Forms crystallise in flat `World/*.md`; `Seeds/` is the spec/source layer; `World/Types` is pre-sync graph-type incubation).

## Work Guidance
- `[[wikilink]]` every coordinate / spec / carrier / agent / concept reference by file basename (verify the target exists in `Seeds/` first).
- Vault writes MUST use coordinate-prefixed `c_n_*` frontmatter; unknown keys are ERRORS. `coordinate` is the one exempt key; `c_0_source_coordinates` is always `string[]`.
- Honour residency law: canonical Form/Type writes go through Hen ([[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]); SwarmVault never writes into `Idea/`.

## Verification
- Run the `bimba-vault-validate` skill before committing any write here (frontmatter, residency, wikilinks, hierarchy placement).

## Child DOX Index
- (leaf) — `Seeds/`, `World/`, `Map/` are content subtrees with no nested AGENTS.md.
