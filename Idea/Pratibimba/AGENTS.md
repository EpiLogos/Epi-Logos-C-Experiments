# AGENTS.md — Pratibimba

## Purpose
`Idea/Pratibimba/` is the instantiated-reflection tree of the vault: the M' UX/system architecture surface (`System/`) plus the self-facing runtime surfaces (`Self/`: PASU bootstrap, Thought T/T', Action history/work). Reflections only — no app source or build output (per `System/README.md`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]]

## Ownership
- `System/README.md` — UX/system architecture index for [[M']]; runtime code lives in `Body/M/epi-theia` (not here).
- `System/Subsystems/` — one documentation home per M' subsystem ([[M0']]..[[M5']]: [[Anuttara]], [[Paramasiva]], [[Parashakti]], [[Mahamaya]], [[Nara]], [[Epii]]).
- `System/docs/` — operator runbook, publishing/dependency/extension-naming models, and `decisions/` ADRs (adr-05-*).
- `Self/PASU.md` — PASU bootstrap (non-dual agent-user field; Kairos ground for [[M4-Nara]]) and `c_3_session_history` accumulator for [[user-context]] session-close write-back.
- `Self/Thought/T/` — T0..T5 + T0'..T5' Thought-coordinate Forms.
- `Self/Action/` — `History/{YYYY}/...` (day/now archive) and `Work/` (Projects, Bimba Map).
- Does NOT own implementation/behavior (lives in `Body/M/epi-theia`) nor canonical specs/diagrams (live in `Idea/Bimba/Seeds/M/**`). Domain law stays in its owning M' coordinate spec, not relocated here.

## Local Contracts
- `Idea/Pratibimba/System/README.md` — residency rule + subsystem map + diagram flow (the binding local doc shape).
- `Idea/Pratibimba/System/Subsystems/README.md` — subsystem CF/register assignments and authoring rule.
- Owning specs: [[M'-SYSTEM-SPEC]], [[M'-PORTAL-SPEC]] (Seeds canon, not forked here).
- No `CONTRACT.md` / `Cargo.toml` / `lib.rs` — this is a vault tree, not a crate.

## Work Guidance
- `[[wikilink]]` every coordinate / spec / carrier / agent / concept reference by file basename (verify the target exists first).
- Vault writes MUST use coordinate-prefixed `c_n_*` frontmatter; do not invent keys (unknown keys are ERRORS).
- Keep this tree light and link-rich: link to canonical Seeds, do not copy spec text or reintroduce app source / `node_modules` / build output.
- Canon Forms/Types/Pratibimba writes go through Hen ([[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]); SwarmVault never writes into `Idea/`.

## Verification
- Vault validation before committing any write: use the `bimba-vault-validate` skill (frontmatter, residency, wikilinks, hierarchy placement).

## Child DOX Index
- (leaf)
