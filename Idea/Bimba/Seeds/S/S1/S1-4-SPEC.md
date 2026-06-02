---
coordinate: "S1.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-02-22-bimba-data-foundation-harmonization]]"
---

# S1.4 Shard: Day And NOW Artifacts

## Canonical Role

[[S1.4]] is the [[P4]] / [[CT4]] / [[L4]] context surface where temporal work becomes material vault state. It owns the base files and folders for [[Day]], session-local [[NOW]], [[FLOW]], and child runtime artifacts under `Idea/Empty/Present`. [[S1.4']] owns temporal artifact law and the [[Chronos]] handoff; [[S1.4]] owns the concrete paths and write behavior.

## Source And Diagram Anchors

Primary seed sources: [[S1-SPEC]], [[S1-SHARD-INDEX]], [[S1-TRACEABILITY-INDEX]], [[S1-S1i-OBSIDIAN]], and [[2026-02-22-bimba-data-foundation-harmonization]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[Present]] vs [[Pratibimba]] residency, [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for S1/S1' context ownership, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for [[Chronos]], [[Anima]], and M' consumers. World anchors: [[Daily-Note]], [[NOW]], [[FLOW]], and `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas`.

## Current Body Reality

`Body/S/S0/epi-cli/src/vault/paths.rs` defines `day_folder`, `day_note_path`, `now_note_path`, `archive_day_path`, and `thought_note_path`. The canonical Day path is `Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md`; the canonical NOW path is `Idea/Empty/Present/{DD-MM-YYYY}/{session_id}/now.md`. `Body/S/S0/epi-cli/src/vault/mod.rs` implements `day-init`, `now-init`, `now-path`, `now-read`, `now-write`, `flow-init`, `thought-route`, and `archive-day`. Tests in `Body/S/S0/epi-cli/tests/vault_commands.rs` assert real day/NOW file creation, repo-local vault resolution, and single-frontmatter thought-route behavior.

## Build Contract

Day is the parent temporal context and NOW is a child session context. There must not be one global semantic NOW for all work. `now-path` must resolve by session id; `now-init` must create a folder child under the Day; `day-init` must create a daily note in the repo's `Idea` vault when present; `flow-init` must write the Day-level CT0 free-writing surface. Each created artifact must carry parseable frontmatter, temporal lineage (`day_id`, `session_id` where applicable), and enough wikilink/provenance scaffolding for later [[S1.5]] return.

## API / Envelope / Implementation Hooks

Current hooks are local bootstrap commands, not full gateway law: `epi vault day-init`, `epi vault now-init`, `epi vault now-path`, `epi vault flow-init`, `epi vault thought-route`, and `epi vault archive-day`. The module comments classify these as governed-local writes because they scaffold fresh artifacts. Existing `NowRead` / `NowWrite` still use `EPI_NOW_PATH` or a fallback `Idea/Empty/Present/NOW.md`; this is compatibility behavior and must not be promoted as the target [[NOW]] model.

## Test Obligations

Required tests: create Day and NOW in a temporary real vault, verify folder and filename shape, parse resulting frontmatter as YAML, confirm multiple NOW children can coexist under one Day, confirm thought routes write under `Idea/Pratibimba/Self/Thought/T/Tn`, and verify `archive-day --plan` reports source/destination without destructive mutation. Tests must touch real temp files.

## Open Gaps

`NowRead` / `NowWrite` compatibility with `EPI_NOW_PATH` can drift from the per-session model. `archive_day` uses filesystem rename and has a noted TODO to route directory moves through Hen once directory-move support exists. Chronos live state is not owned in this shard, so any future S3' day/session source of truth must be reflected back here.

## Boundaries

[[S1.4]] writes temporal artifacts. [[S1.4']] decides the law of temporal artifact identity. [[S3']] / [[Chronos]] owns live temporal authority. [[S1.5]] handles archive/graduation return after the Day/NOW artifacts exist. [[S5]] and [[Epii]] review the meaning of promoted temporal synthesis.
