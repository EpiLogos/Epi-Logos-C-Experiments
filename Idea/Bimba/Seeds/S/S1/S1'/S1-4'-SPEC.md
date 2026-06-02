---
coordinate: "S1.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[2026-02-22-bimba-data-foundation-harmonization]]"
---

# S1.4' Shard: Temporal Artifact Law

## Canonical Role

[[S1.4']] is the [[P4]] / [[CT4]] / [[L1']] law surface for [[Day]], [[NOW]], and temporal artifact residency. It prevents singular-global-NOW drift by making each session/subagent/external invocation a child context under a Day parent. [[S1.4]] owns the files; [[S1.4']] owns the rule that makes those files lawful temporal context.

## Source And Diagram Anchors

Primary seed sources: [[S1'-SPEC]], [[S1-SPEC]], [[S1'-TRACEABILITY-INDEX]], [[S1-S1i-OBSIDIAN]], and [[2026-02-22-bimba-data-foundation-harmonization]]. Diagram anchors consumed: [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[Present]] residency, [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for [[Chronos]] and runtime consumers, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for S1' temporal-law placement. World anchors: [[Daily-Note]], [[NOW]], [[Thought]], [[FLOW]], and `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.canvas`.

## Current Body Reality

`Body/S/S0/epi-cli/src/vault/paths.rs` encodes the target parent-child path law for Day and NOW. `Body/S/S0/epi-cli/src/vault/templates.rs` emits `day_id`, `session_id`, `artifact_role`, and `thought_type` where applicable. `Body/S/S1/hen-compiler-core/src/lib.rs` enforces temporal frontmatter requirements for `now` and `thought`. `Body/S/S0/epi-cli/tests/vault_commands.rs` covers `day-init`, `now-init`, `now-path`, thought routing to T lanes, and repo-root `Idea` vault resolution.

## Build Contract

Every temporal artifact must name its Day parent and, for NOW/session artifacts, its session id. A Day artifact is the shared [[CT4b]] horizon; a NOW artifact is a bounded child window. Subagents and external invocations should receive their own `now.md` path, not append into a single global file. Temporal files must be valid [[S1.1']] frontmatter artifacts before [[Chronos]] or agents consume them.

## API / Envelope / Implementation Hooks

Target method family includes `s1'.day.materialize`, `s1'.now.materialize`, and the vault artifact side of `s3'.day.*`. Current executable hooks are `epi vault day-init`, `now-init`, `now-path`, `flow-init`, and `thought-route`. Envelope fields should include `day_id`, `session_id`, `parent_day_path`, `now_path`, `artifact_role`, `ctx_type`, and provenance links to produced artifacts.

## Test Obligations

Required tests: one Day can hold multiple NOW children; NOW frontmatter includes `day_id` and `session_id`; thought artifacts require `thought_type`; repo-root vault resolution chooses `Idea` when present; `now-path` is deterministic for a session id; `archive-day --plan` does not mutate. Tests must use real temp directories and parse resulting files.

## Open Gaps

The compatibility fallback `Idea/Empty/Present/NOW.md` still exists through `active_now_path` and should be treated as legacy/operator convenience. [[Chronos]] live state is not fully wired into a bidirectional S1' materialization contract. Directory archive movement still needs a future Hen-safe directory move surface.

## Boundaries

[[S1.4']] owns temporal artifact law. [[S1.4]] writes the files. [[S3']] / [[Chronos]] owns time/state authority. [[S4]] agents consume NOW context but must not define its path law. [[S5']] receives temporal synthesis for review/promotion.
