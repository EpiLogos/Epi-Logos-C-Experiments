---
coordinate: "S1'/S3'/S5' + M'"
c_4_artifact_role: "residency-audit"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-02T00:00:00Z"
c_3_day_id: "02-06-2026"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[FLOW-2026-04-10-S1-PRIME-OBSIDIAN-SUBSTRATE-ARCHITECTURE]]"
  - "[[FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX]]"
---

# Empty/Present Residency Audit — 2026-06-02

## Decision

`Idea/Empty/Present` should hold active temporal runtime material only: current day folders, bounded carry-forward day folders, day-level Epii inbox deposits, and NOW/session folders. The April-May FLOW, PROTOCOL, PROMPT, and coordinate-mapping files at the Present root are not present-tense runtime material anymore. They should be promoted into `Idea/Bimba/Seeds/**` as canonical source or historical seed artifacts, then referenced from the S/M indexes and Cycle 2 m-dev plan where still operative.

The present working window for this audit is:

| Day | Status | Action |
|---|---|---|
| `02-06-2026` | today | should exist as active Day folder |
| `03-06-2026` | tomorrow / 19:00 crossover target | may be pre-created or created at crossover |
| `01-06-2026` | prior day inside bounded three-day window | keep until reviewed, autoreviewed, or explicitly signed off |
| `19-05-2026` | out of scope | archive to `Idea/Pratibimba/Self/Action/History/2026/05/W21/19/` |
| `2026-05-13` | out of scope and malformed date naming | archive as the semantic day `13-05-2026` to `Idea/Pratibimba/Self/Action/History/2026/05/W20/13/` |

The archive path above is confirmed by the live path resolver in `Body/S/S0/epi-cli/src/vault/paths.rs`: `Pratibimba/Self/Action/History/{YYYY}/{MM}/W{ISO-week}/{DD}`.

## File-by-File Residency

| Source in `Idea/Empty/Present` | Proposed destination | Bring forward | Cycle 2 implication |
|---|---|---|---|
| `FLOW-2026-04-10-S1-PRIME-OBSIDIAN-SUBSTRATE-ARCHITECTURE.md` | `Idea/Bimba/Seeds/S/S1/S1'/FLOW-2026-04-10-S1-PRIME-OBSIDIAN-SUBSTRATE-ARCHITECTURE.md` | S1' is the vault/content membrane between S1 material persistence and S4' agentic operation; Day/NOW folders must be indexed process contexts, not loose scratchpads; direct writes should converge toward Hen/Khora law. | Attach to Cycle 2 `11.T1`/`11.T2` as consumed S1' substrate evidence. Do not reopen greenfield S1 work; use it to define the precise Hen day-folder and archive gaps. |
| `FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.md` | `Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.md` | Root S/S' coordinate scaffold for S0-S5 and S0'-S5'. | Keep as historical coordinate scaffold behind `S-SYSTEM-INDEX`; useful for onboarding and traceability, not implementation authority if newer specs disagree. |
| `FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.csv` | `Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.csv` | Machine-readable companion to the scaffold, including subcoordinate labels such as S4.3' temporal pattern law and S5.0' archive signal contract. | Use as reference data for seed/index generation only. |
| `FLOW-2026-04-12-COORDINATE-FAMILY-SELF-DEVELOPMENT-AND-IDEA-RESIDENCY.md` | `Idea/Bimba/Seeds/S/FLOW-2026-04-12-COORDINATE-FAMILY-SELF-DEVELOPMENT-AND-IDEA-RESIDENCY.md` | Critical residency law: `Empty/Present` is temporal runtime/context; `Seeds` holds deeper developmental files, implementation plans, canonical research, and philosophical support artifacts; `Pratibimba/Self` and `Pratibimba/System` are distinct reflective sides. | This is the justification for the current cleanup. Add to m-dev `14.*` no-orphan/release-gate context so future plans stop writing canonical specs into Present root. |
| `FLOW-2026-04-12-ENVELOPE-ARCHITECTURE-AND-CONTEXT-FIELD.md` | `Idea/Bimba/Seeds/S/S5/S5'/FLOW-2026-04-12-ENVELOPE-ARCHITECTURE-AND-CONTEXT-FIELD.md` with an index backlink from `Idea/Bimba/Seeds/S/` | Establishes the layered envelope groups: transport, runtime, temporal, coordinate, residency, context-economy, lived-environs, execution, episodic reporting, crystallisation, improvement. | Treat as conceptual predecessor to the field schema. Cycle 2 should cite it only for why the envelope exists, while implementation follows the newer schema/specs. |
| `FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` | `Idea/Bimba/Seeds/S/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` | Canonical 12-layer field taxonomy, coordinate-prefix frontmatter law, hot/warm/cold cost axis, and compiler-spine mapping. | High-value source for Cycle 2 `11.*`, `12.*`, `13.*`, and `14.*`; update stale references in shard docs that still point to Present root. |
| `FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md` | `Idea/Bimba/Seeds/S/FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md` | S/S' naming law, Pratibimba/Self vs Pratibimba/System split, `/Idea` residency ladder, and compiler spine consequences. | Bind as the source for future archive/day-folder residency decisions. This should be read before any path/schema cleanup. |
| `FLOW-2026-04-23-PARALLEL-TRACKS-HANDOVER.md` | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/FLOW-2026-04-23-PARALLEL-TRACKS-HANDOVER.md` | Handover across M-coordinate graph population, PI integration assessment, and codebase reality check. Includes open questions on Redis namespace, Graphiti/Bimba namespace, and `c_0_ql_schema_version` ownership. | Most execution items are likely superseded, but open questions should be checked against Cycle 2 `11.*`/`12.*`/`13.*` before deletion or closure. |
| `FLOW-2026-04-23-TRACK-B-PI-INTEGRATION-AUDIT.md` | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/FLOW-2026-04-23-TRACK-B-PI-INTEGRATION-AUDIT.md` | Layer-by-layer S0-S5 audit of ta-onta/PI integration, including Hen tool inventory and S4' gaps. | Use as historical evidence for consumed S/S' substrate, not current truth. Cross-check only when a Cycle 2 task touches the named gaps. |
| `FLOW-2026-04-24-ANIMA-EPII-ARCHITECTURE.md` | `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-ANIMA-EPII-ARCHITECTURE.md` with S5' backlink | Decides Anima/Epii split, three tool surfaces, S3' as unified temporal runtime, Epii autoresearch spine, two-window tmux ground UX. | Relevant to Cycle 2 `07.*`, `10.*`, `12.*`, `13.*`: product surfaces must preserve Anima dispatch vs Epii return boundaries. |
| `FLOW-2026-04-24-ORIENTATION.md` | `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-ORIENTATION.md` | Orientation snapshot: `epi` as S0', S1' compiler passes, S2' context economy, S3' gateway/SpacetimeDB, S4' PI agent, S5' autoresearch. Flags `epi graph` and `epi episodic` as missing at the time. | Archive as orientation with status notes; verify which gaps are now done before letting Cycle 2 reuse them as open tasks. |
| `FLOW-2026-04-24-PI-AGENT-API-v0.1.md` | `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-PI-AGENT-API-v0.1.md` | Large coordinate-native API contract: namespace routing, frontmatter keys, review inbox, temporal day close, archive paths, typed methods. | High-value for `13.*` gateway method completion and intent routing. Needs stale-vs-live audit before implementation; do not treat v0.1 as automatically current. |
| `FLOW-2026-04-25-NEXT-MOVES.md` | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/FLOW-2026-04-25-NEXT-MOVES.md` | Prioritised vertical slice for two PI instances over gateway, method dispatch, essential API coverage, and Epii capability buildout. | Mostly historical roadmap. Extract only unresolved method families into Cycle 2 `13.*` if still absent. |
| `FLOW-2026-04-25-PI-AGENT-API-AUDIT.md` | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/FLOW-2026-04-25-PI-AGENT-API-AUDIT.md` | Audit of which API methods existed vs aspirational. | Historical audit; useful for provenance when reconciling old Present-root references in `S-SHARDING-TASK-LIST`. |
| `FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md` | `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md` | Canonical TypeScript interface definitions for PI API v0.1, including archive/review/frontmatter shapes. | If still used by M' shell/OmniPanel work, promote as canonical-but-versioned and update import/reference docs. |
| `FLOW-2026-05-06-SMART-ENV-HEN-LINK-CANDIDATE-POOL.md` | `Idea/Bimba/Seeds/S/S1/S1'/FLOW-2026-05-06-SMART-ENV-HEN-LINK-CANDIDATE-POOL.md` | Smart Env is a read-only suggestion pool; Hen still decides which wikilinks get written; S2 sync follows links Hen actually writes. | Attach to Cycle 2 S1' consumed-substrate closure and any M5/Canon Studio link-suggestion UX. |
| `FLOW-2026-05-07-RUST-DEPENDENCY-COMPATIBILITY.md` | `Idea/Bimba/Seeds/S/Legacy/reference/FLOW-2026-05-07-RUST-DEPENDENCY-COMPATIBILITY.md` | Records resolved Rust dependency compatibility, portal image optionality, Redis future-incompat fix, and remaining vendored warnings. | Low product value but useful build provenance. Keep in Legacy/reference unless a current Cycle 2 task hits the same dependency issue. |
| `FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX.md` | `Idea/Bimba/Seeds/S/FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX.md` | Very high value: Hermes as reference not authority; day-level Epii inbox at `Empty/Present/{DD-MM-YYYY}`; VAK is Anima grammar not ta-onta dimensions; matrix F; ST1-ST20; platform adapter + cron dual-write + subject resolver shard candidate. | Many items are already reflected in `S-AD-HOC-ROADMAP` and `S-SHARDING-TASK-LIST`; Cycle 2 should carry forward deeper implementation only: inbound normalization, subject-coordinate resolver, cron/day dual-write, lifecycle hooks, event cursor pattern, and platform adapters. |
| `M-M-prime-coordinate-mapping-inaugural.md` | `Idea/Bimba/Seeds/M/M-M-prime-coordinate-mapping-inaugural.md` | Inaugural M/M' mapping, especially M2/M3 symbolic-computational coordinate distinctions and M' implementation status/gaps. | Feed Cycle 2 `02.*`-`07.*` ownership matrix and no-orphan audit. |
| `PROMPT-2026-04-25-TS-INTERFACES-AND-API-AUDIT.md` | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/PROMPT-2026-04-25-TS-INTERFACES-AND-API-AUDIT.md` | Session prompt that produced API audit and TS interface definitions. | Keep as prompt provenance only; do not treat as canonical architecture. |
| `PROTOCOL-S-COORDINATE-MODULE-SPEC-BUILD.md` | `Idea/Bimba/Seeds/S/PROTOCOL-S-COORDINATE-MODULE-SPEC-BUILD.md` | Spec-build protocol: derive ontology from FLOW docs and old files first, then use code as evidence; missing commands become gaps, not invented surfaces. | Still valuable. Use as the rule for any future Sx/Sx' spec harmonization in Cycle 2. |

## Details to Carry Forward

- Present root cleanup is not cosmetic. It enforces the residency law stated by the April 12 residency flow: `Present` is runtime/context, `Seeds` is canonical developmental memory.
- Hen day/NOW work should stay bounded to S1'/S3' integration gaps: day folder creation, NOW child folders, FLOW.md, Epii day-level inbox, archive/crossover policy, and directory-move integrity.
- The current Rust archive path already includes `W{ISO-week}`. Older docs that omit the weekly segment are stale.
- `archive_day` still has a direct filesystem fallback and a TODO for Hen-backed directory moves. Until `s1'.vault.move_directory` exists, archive operations should be treated as operator-governed and verified.
- The 19:00 crossover should become a Chronos policy: open/ensure tomorrow, keep today active, keep yesterday as bounded carry-forward until review/autoreview signoff, then archive.
- The Hermes matrix should be consumed through already-current S specs and sharding lists. The remaining useful forward details are implementation depth, not new ontology.

## m-dev Cycle 2 Hooks

| Hook | Suggested owner |
|---|---|
| Present-root cleanup and reference rewrite | `14.T5` no-orphan audit / release gate |
| Hen day-folder structure, FLOW.md, NOW subfolder verification | `11.T1` / `11.T2` consumed S1' substrate closure |
| 19:00 crossover and bounded three-day retention | `12.T0` / `12.T3` S3'/Chronos lifecycle closure |
| Day-level Epii review inbox | `07.*`, `09.*`, `12.T2` |
| Subject-coordinate resolver and inbound normalization | `13.*` plus deferred Hermes platform handoff |
| Directory archive through Hen rather than direct `fs::rename` | S1' follow-up, guarded by IOD-19 / ADR-05-010 |

## Archive Actions Performed

- Archived `Idea/Empty/Present/19-05-2026/` to `Idea/Pratibimba/Self/Action/History/2026/05/W21/19/`.
- Archived malformed legacy day folder `Idea/Empty/Present/2026-05-13/` as semantic day `13-05-2026` to `Idea/Pratibimba/Self/Action/History/2026/05/W20/13/`.
- Left `Idea/Empty/Present/01-06-2026/` in place as the bounded prior-day carry-forward folder for the `02-06-2026` / `03-06-2026` working window.

## Migration Actions Performed

- Moved all Present-root `FLOW-*`, `PROMPT-*`, `PROTOCOL-*`, and `M-M-prime-*` artifacts into the Seed destinations listed above.
- Rewrote literal path references from the old `Idea/Empty/Present/...` artifact paths to their new `Idea/Bimba/Seeds/...` paths in Seed docs, contract inventory, and the kernel API envelope contract test.
- Left ordinary Day/NOW runtime references to `Idea/Empty/Present/{DD-MM-YYYY}` intact; those paths remain canonical for active temporal material.
