---
coordinate: "S4.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_3_updated_at: "2026-07-27T00:00:00Z"
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

Since Track 50 the carrier also holds the orchestration-as-program surfaces under `lib/`: `vak-orchestration-surface.ts` (the typed six-coordinate scripting vocabulary and the [[CP]] nesting evaluator), `child-pi-executor.ts` (the ONE choke point where a dispatch decision becomes a child pi process), `orchestration-run.ts` (Anima's own run state and context isolation), and `S4/tilldone.ts` (the completion gate). The three former `spawn("pi", …)` copies in `S4/{agent-team,agent-chain,pi-pi}.ts` now route through the executor; do not reintroduce a fourth.

## Build Contract

All non-trivial autonomous dispatch routes through [[VAK]] first, then Anima orchestration, then bounded dispatch. Dialogical work may remain in `(00/00)` while the question is still being discovered. [[Anima]] is the dispatch function; [[Psyche]] is the session subject; [[Sophia]] performs review/crystallisation pressure; [[Nous]] clears and prepares disclosure.

The first `/goal` pass belongs here as [[GoalPrelude]]. It writes a NOW-bound artifact and returns to user dialogue. It must not create cron, run history, or Epii review resolution until confirmed intent exists.

**An orchestration is a program, and [[Anima]] holds it.** A multi-tool composition is emitted as ONE TypeScript program rather than a staircase of JSON tool calls (base law in [[S4-SPEC]]); Anima's addition is that the program is written against the six C' coordinates, with [[CP]] opening nested frames and each leaf spawning a child pi. Anima owns the top-level script and its run state — children are the teams and chains, because nothing else is agentic. Context isolation is the load-bearing half: only a step's DECLARED variables cross into a downstream child, never the parent transcript, and a child's raw output is measured then dropped, so the parent's context stays flat in the number of children.

**Origination is dialogue; a repeatable expression is a score.** Every session starts `(00/00)`, and that dialogue is where the script is developed. One execution is a bounded song; a repeatable expression persists as a **score** with a content hash, re-runnable without re-originating. `persistScore()` REFUSES a session that is no longer originating — "the flow I was already mechanically running" is not an origination, which is why [[CS]] state carries the polarity. A re-run sets the session mechanistic for its duration and restores the prior polarity, so re-running mid-dialogue does not end the dialogue. Persistence itself is [[Hen]]'s; the *meaning* of the stored program is Anima's, and is re-validated on the way OUT of storage because a score is loaded in order to be executed.

**Human checkpoints are authored, never inserted.** A `(00/00)` checkpoint exists only because an agent wrote one onto a step, grounded in a closed set of three reasons; a fourth is refused rather than accepted as free text. There is no auto-insertion policy and its absence is structural — the gate reads no score store, and a review's "this class of run wanted a checkpoint" survives only as evidence a later author may adopt by hand. A checkpoint holds until a human answers it: an agent answering its own gate is not an answer.

**A thread that declares a completion gate closes only when its list says done.** [[CFP4]] runs under `tilldone` (the tool is [[Pleroma]]-resident; Anima owns the question of when a thread may close). Exhausting the cycle bound reports itself as exhaustion, never as completion.

*(absorbed from `Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/50-code-mode-orchestration.md`, 2026-07-27; 50.T50.01–50.T50.15)*

## API / Envelope / Implementation Hooks

- `s4'.vak.evaluate`, `s4'.cs.*`, `s4'.context.assemble`, `s4'.orchestration.score`, `s4'.psyche.*`, `s4'.goal.*`.
- PI tools: `vak_evaluate`, `goal_prelude`, `anima_orchestrate`, `nous_disclose`, `dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `dispatch_moirai_night_pass`, `anima_self_invoke`, `run_chain`, `subagent_*`, `tilldone`.
- Full VAK envelope: `cpf`, `ct[]`, `cp`, `cf`, `cfp`, `cs.code`, `cs.direction`.
- Capability suggestions come from Pleroma matrix lookup when VAK address is valid.

## Test Obligations

- `dispatch_vak_required.test.ts` must preserve dialogical vs mechanistic behavior.
- `parallel_vak.test.ts` and `dispatch_fusion_validate.test.ts` must enforce [[CFP]] semantics.
- `skill_registry_query.test.ts` must prove matrix-based skill lookup.
- `/goal` tests must prove prelude-only first pass.
- Psyche state tests must prove persistence once the richer store is implemented.
- `tests/acceptance-live.mjs` is the track's end-to-end gate and must stay honest: one live run over a spawned gateway proving origination, 6/6 composed coordinates, a real code-mode program, ≥2-deep CP nesting with real child pi's, the `tilldone` close, `portal.vak_eval` reaching a real subscriber, the deterministic trace in the real transcript, an ELO trial, and the score read back over `s4'.orchestration.score`. It is deliberately not named `*.test.mjs` so it stays out of the shared gate (it makes live model calls).

## Open Gaps

- `s4'.context.assemble` **landed (51.T51.1)** as the ta-onta spine's session-context surface: `SpineCompositor.assembleContextPack` is the one assembler, it publishes the pack it injects to `<gate-state-root>/s4/context-pack/<session>.json`, and the gateway serves that same object with per-carrier provenance (coordinate, cost, budget outcome, byte size, freshness, and the carrier failures the old flat injection string could not carry). Still open on this method: the S4-4-SPEC requirement that it also return **source handles, coordinate anchors, and privacy posture**, and routing `nous_disclose` through it instead of its helper path.
- Richer `s4'.goal.*` and persisted Psyche goal state remain open.
- Rust `epi agent vak evaluate` is a heuristic fallback; semantic/canonical evaluation lives in the skill-mediated path.
- Sophia post-execution review is guarded but not yet a full coordinate-native crystallisation lifecycle.

## Boundaries

[[S4.4']] evaluates and dispatches work. [[S4.2']] gates capabilities, [[S4.3']] provides temporal conditioning, [[S4.5']] curates review handoff, and [[S5']] [[Epii]] evaluates return meaning.
