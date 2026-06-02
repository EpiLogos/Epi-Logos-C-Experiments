---
coordinate: "S4.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4'-SPEC]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.4' Shard: VAK and Psyche Law

## Canonical Role

[[S4.4']] is the [[Anima]] carrier of [[S4']]: [[P4]] / [[CT4a]]-[[CT4b]] sovereign dispatch law, [[VAK]] evaluation, [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] publication, [[Psyche]] state, context-pack assembly, goal prelude, and inhabited task-world governance.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4'-SPEC]], [[S4-SPEC]], [[S4'-TRACEABILITY-INDEX]], [[S4-4-SPEC]], [[S4-4'-GOAL-PRELUDE-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]].
- World/MOC anchors: [[S4']], [[Anima]], [[Psyche]], `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[ta-onta-anima-superpowers-vak-integration-spec]], [[VAK-SUPERPOWERS-INTEGRATION-SPEC]], [[2026-05-22-vak-as-operational-substrate]], [[2026-04-04-anima-vak-gate-skill-injection]], [[2026-03-15-vak-constitutional-architecture]].

## Current Body Reality

Current implementation is `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`, `CONTRACT.md`, `modules/dispatch-validate.ts`, `modules/moirai-dispatch.ts`, `modules/anima-invoke-payload.ts`, `modules/skill-registry.ts`, `modules/sophia-hook.ts`, and `S4/**` team/chain/subagent primitives. It registers `vak_evaluate`, `goal_prelude`, `anima_orchestrate`, `nous_disclose`, dispatch/fusion/night-pass/self-invoke tools, chains, subagents, and `tilldone`.

The dispatch validator makes an important live correction: no VAK address or [[CPF]] `(00/00)` is dialogical/Ouroboros and allowed without strict CF binding; any other CPF is mechanistic and requires canonical [[VakAddress]] shape and constitutional CF match. Tests include `dispatch_vak_required.test.ts`, `dispatch_gate_block.test.ts`, `parallel_vak.test.ts`, `dispatch_fusion_validate.test.ts`, `moirai_night_pass.test.ts`, and `anima_invoke_payload.test.ts`.

## Build Contract

All non-trivial autonomous dispatch routes through [[VAK]] first, then Anima orchestration, then bounded dispatch. Dialogical work may remain in `(00/00)` while the question is still being discovered. [[Anima]] is the dispatch function; [[Psyche]] is the session subject; [[Sophia]] performs review/crystallisation pressure; [[Nous]] clears and prepares disclosure.

The first `/goal` pass belongs here as [[GoalPrelude]]. It writes a NOW-bound artifact and returns to user dialogue. It must not create cron, run history, or Epii review resolution until confirmed intent exists.

## API / Envelope / Implementation Hooks

- `s4'.vak.evaluate`, `s4'.cs.*`, `s4'.context.assemble`, `s4'.psyche.*`, `s4'.goal.*`.
- PI tools: `vak_evaluate`, `goal_prelude`, `anima_orchestrate`, `nous_disclose`, `dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `dispatch_moirai_night_pass`, `anima_self_invoke`, `run_chain`, `subagent_*`, `tilldone`.
- Full VAK envelope: `cpf`, `ct[]`, `cp`, `cf`, `cfp`, `cs.code`, `cs.direction`.
- Capability suggestions come from Pleroma matrix lookup when VAK address is valid.

## Test Obligations

- `dispatch_vak_required.test.ts` must preserve dialogical vs mechanistic behavior.
- `parallel_vak.test.ts` and `dispatch_fusion_validate.test.ts` must enforce [[CFP]] semantics.
- `skill_registry_query.test.ts` must prove matrix-based skill lookup.
- `/goal` tests must prove prelude-only first pass.
- Psyche state tests must prove persistence once the richer store is implemented.

## Open Gaps

- `s4'.context.assemble`, richer `s4'.goal.*`, and persisted Psyche goal state remain open.
- Rust `epi agent vak evaluate` is a heuristic fallback; semantic/canonical evaluation lives in the skill-mediated path.
- Sophia post-execution review is guarded but not yet a full coordinate-native crystallisation lifecycle.

## Boundaries

[[S4.4']] evaluates and dispatches work. [[S4.2']] gates capabilities, [[S4.3']] provides temporal conditioning, [[S4.5']] curates review handoff, and [[S5']] [[Epii]] evaluates return meaning.
