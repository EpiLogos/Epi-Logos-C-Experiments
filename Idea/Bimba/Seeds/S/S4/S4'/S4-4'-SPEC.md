---
coordinate: "S4.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_3_updated_at: "2026-07-28T00:00:00Z"
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

Current implementation is `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`, `CONTRACT.md`, `modules/dispatch-validate.ts`, `modules/moirai-dispatch.ts`, `modules/anima-invoke-payload.ts`, `modules/skill-registry.ts`, `modules/sophia-hook.ts`, and `S4/**` team/chain/subagent primitives. It registers `vak_evaluate`, `goal_prelude`, `anima_orchestrate`, `nous_disclose`, dispatch/fusion/night-pass/self-invoke tools, chains, and subagents. It does **not** register `tilldone`. The name has sat in this carrier's active-tool contract since the Cycle-3 baseline; 12.T12.11 confirmed the tool's [[Pleroma]] residency, 50.T50.06 then bound it to CFP4 as that coordinate's tool, and the bijection removal of 2026-07-25 (`lib/thread-shape.ts`) corrected the reading to what it is now — a CAPABILITY scoped to Anima, not any coordinate's tool. The provenance is worth stating because the corrected law post-dates the tranche that hardened the mistake. The tool body and its registrar are [[Pleroma]]'s (`S4/tilldone.ts` here records both paths as `TILLDONE_TOOL_BODY` / `TILLDONE_TOOL_REGISTRAR`, so the residency is asserted in code rather than only in prose). What this carrier holds is the *executor* — the law deciding when a run-till-done thread may close — not the tool.

The dispatch validator makes an important live correction: no VAK address or [[CPF]] `(00/00)` is dialogical/Ouroboros and allowed without strict CF binding; any other CPF is mechanistic and requires canonical [[VakAddress]] shape and constitutional CF match. Tests include `dispatch_vak_required.test.ts`, `dispatch_gate_block.test.ts`, `parallel_vak.test.ts`, `dispatch_fusion_validate.test.ts`, `moirai_night_pass.test.ts`, and `anima_invoke_payload.test.ts`.

Since Track 50 (landed 2026-07-25 → 2026-07-27, tranches 50.T50.01–50.T50.16) the carrier also holds the orchestration-as-program surfaces under `lib/`: `vak-orchestration-surface.ts` (the typed six-coordinate scripting vocabulary and the [[CP]] nesting evaluator), `child-pi-executor.ts` (the ONE choke point where a dispatch decision becomes a child pi process), `orchestration-run.ts` (Anima's own run state and context isolation), and `S4/tilldone.ts` (the completion gate). The three former `spawn("pi", …)` copies in `S4/{agent-team,agent-chain,pi-pi}.ts` now route through the executor; do not reintroduce a fourth.

## Build Contract

All non-trivial autonomous dispatch routes through [[VAK]] first, then Anima orchestration, then bounded dispatch. Dialogical work may remain in `(00/00)` while the question is still being discovered. [[Anima]] is the dispatch function; [[Psyche]] is the session subject; [[Sophia]] performs review/crystallisation pressure; [[Nous]] clears and prepares disclosure.

The first `/goal` pass belongs here as [[GoalPrelude]]. It writes a NOW-bound artifact and returns to user dialogue. It must not create cron, run history, or Epii review resolution until confirmed intent exists.

**An orchestration is a program, and [[Anima]] holds it.** A multi-tool composition is emitted as ONE TypeScript program rather than a staircase of JSON tool calls (base law in [[S4-SPEC]]); Anima's addition is that the program is written against the six C' coordinates, with [[CP]] opening nested frames and each leaf spawning a child pi. Anima owns the top-level script and its run state — children are the teams and chains, because nothing else is agentic. Context isolation is the load-bearing half: only a step's DECLARED variables cross into a downstream child, never the parent transcript, and a child's raw output is measured then dropped, so the parent's context stays flat in the number of children.

**Origination is dialogue; a repeatable expression is a score.** Every session starts `(00/00)`, and that dialogue is where the script is developed. One execution is a bounded song; a repeatable expression persists as a **score** with a content hash, re-runnable without re-originating. `persistScore()` REFUSES a session that is no longer originating — "the flow I was already mechanically running" is not an origination, which is why [[CS]] state carries the polarity. A re-run sets the session mechanistic for its duration and restores the prior polarity, so re-running mid-dialogue does not end the dialogue. Persistence itself is [[Hen]]'s; the *meaning* of the stored program is Anima's, and is re-validated on the way OUT of storage because a score is loaded in order to be executed.

**Human checkpoints are authored, never inserted.** A `(00/00)` checkpoint exists only because an agent wrote one onto a step, grounded in a closed set of exactly three reasons — `implied-by-task`, `requested-at-origination`, `learned-from-review` — and a fourth is refused rather than accepted as free text, because free text makes "the policy said so" indistinguishable from an authored decision. There is no auto-insertion policy and its absence is structural — the gate reads no score store, and a review's "this class of run wanted a checkpoint" survives only as evidence a later author may adopt by hand. A checkpoint holds until a human answers it: an agent answering its own gate is not an answer.

**A thread that declares a completion gate closes only when its list says done.** The binding is on the SHAPE, not on the coordinate: a thread whose shape declares `completion: "till-done"` runs under the completion gate, and today [[CFP4]] is the move carrying that shape. A CFP does not name a tool — `conventionalToolFor("CFP4")` returns `null` on purpose, because threads are shapes and tools are capabilities, and the CFP→tool bijection was a category error. The gate tool itself is [[Pleroma]]-resident; what Anima owns is the question of when a thread may close. Exhausting the cycle bound reports itself as exhaustion, never as completion.

**The run is the unit LEARNING reads, and the trace is what makes it readable.** On completion Anima emits a deterministic execution trace — the operations the script performed over a fixed vocabulary, carrying the `scoreHash` so a replay is checkable — into the session transcript (via the existing `chat.inject` transcript-write, under its own `orchestration_trace` kind). `aeon_eval` (`Body/S/S3/redis-context/src/aeon_eval.rs`) derives the behavioural metrics from it, and a distillation JSONL row is emitted for the epii-distillation corpus. This is load-bearing rather than incidental: every behavioural metric was previously derived by COUNTING `toolCallObserved` events, and a code-mode run emits one script and therefore one turn — so a run that did fifty reads and ten edits read as ZERO of each. The measurement went blind exactly where the orchestration worked as designed. Two refusals keep the substrate honest. A trace without its `scoreHash` is refused, because replay is checkable only when the program identity rides along. And the three annotation channels the corpus requires must be DECLARED by the caller, not derived: `user_articulation_simulation` has no automatic producer anywhere in a run, so a row whose declaration OMITS a channel is refused BY NAME rather than emitted with a number nobody produced. Note the subject precisely — it is the UNDECLARED row that is refused, not every row; a run that states all three channels emits normally. A corpus scored on an invented value would train the student on a fiction, which is why the gap is made loud instead of filled. Anima carries the trace; it never computes a metric — the classification vocabulary lives once, Rust-side.

*(absorbed from `Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/50-code-mode-orchestration.md`, 2026-07-27; 50.T50.01–50.T50.16, the learning-substrate paragraph from 50.T50.14 absorbed 2026-07-28)*

## API / Envelope / Implementation Hooks

- Live on the gateway: `s4'.vak.evaluate`, `s4'.orchestrate`, `s4'.mediation.route`, `s4'.mediation.capabilities.list`, `s4'.context.assemble`, `s4'.orchestration.score`, `s4'.psyche.state`, `s4'.psyche.update`, `s4'.permission.get`.
- Named but NOT implemented, listed here so the gap is visible rather than implied: `s4'.cs.*` and richer `s4'.goal.*` (see Open Gaps).
- PI tools: `vak_evaluate`, `goal_prelude`, `anima_orchestrate`, `nous_disclose`, `dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `dispatch_moirai_night_pass`, `anima_self_invoke`, `run_chain`, `subagent_*`, and `tilldone` (the last as a scoped CAPABILITY in the active-tool contract, not a tool this carrier registers — see Current Body Reality).
- Full VAK envelope: `cpf`, `ct[]`, `cp`, `cf`, `cfp`, `cs.code`, `cs.direction`.
- Capability suggestions come from Pleroma matrix lookup when VAK address is valid.
- **Emitted on run completion.** Both are named here because the acceptance gate below asserts them, and they travel differently — the distinction matters to anyone wiring a consumer:
  - `portal.vak_eval` — BROADCAST to every gateway subscriber (and additionally returned to the caller as a receipt, so a run can record what the subscribers saw). The run's trace read against the derived music (DR-VAK-6). Anima hands the trace and its LENS to `s4'.vak.evaluate`; the [[S0]] kernel performs the reading and the gateway broadcasts it. The lens is REQUIRED and refused by name when absent: a guessed lens does not mislabel the run, it reads it in an epistemic mode the run never spoke from.
  - A **Mercurius ELO trial** — NOT broadcast. It is returned to the caller and persisted to SQLite (`mercurius_trial_log`, `mercurius_elo_ratings`, `moirai_comparison_cache`); there is no `aletheia.elo.*` portal event, and the observability events are in-memory only. The run as a fair-comparable unit, logged through [[Aletheia]] (`Body/S/S4/ta-onta/S4-5p-aletheia/modules/mercurius-elo.ts`), which this carrier reaches through its own caller `Body/S/S4/ta-onta/S4-4p-anima/modules/elo-trial-hook.ts` — that hook is what makes the trial Anima's emission at all. The matchup key derives from the trace's own coordinates, and the fields it cannot derive must be declared; an uncalibrated first trial is logged and REFUSED rather than turned into an invented rating.

## Test Obligations

- `dispatch_vak_required.test.ts` must preserve dialogical vs mechanistic behavior.
- `parallel_vak.test.ts` and `dispatch_fusion_validate.test.ts` must enforce [[CFP]] semantics.
- `skill_registry_query.test.ts` must prove matrix-based skill lookup.
- `/goal` tests must prove prelude-only first pass.
- Psyche state tests must prove persistence once the richer store is implemented.
- `tests/acceptance-live.mjs` is the track's end-to-end gate and must stay honest: one live run over a spawned gateway proving origination, 6/6 composed coordinates, a real code-mode program, ≥2-deep CP nesting with real child pi's, the `tilldone` close, `portal.vak_eval` reaching a real subscriber, the deterministic trace in the real transcript, an ELO trial, and the score read back over `s4'.orchestration.score`. It is deliberately not named `*.test.mjs` so it stays out of the shared gate (it makes live model calls).

## Open Gaps

- `s4'.context.assemble` **landed (51.T51.1, 2026-07-25)** as the ta-onta spine's session-context surface: `SpineCompositor.assembleContextPack` is the one assembler, it publishes the pack it injects to `<gate-state-root>/s4/context-pack/<session>.json`, and the gateway serves that same object with per-carrier provenance (coordinate, cost, budget outcome, byte size, freshness, and the carrier failures the old flat injection string could not carry). Still open on this method: the S4-4-SPEC requirement that it also return **source handles, coordinate anchors, and privacy posture**, and routing `nous_disclose` through it instead of its helper path.
- Richer `s4'.goal.*` and persisted Psyche goal state remain open.
- `s4'.cs.*` is named in the hook list but has no gateway implementation: [[CS]] state is carried in-process by the carrier, and no CS method dispatches. Either land it or stop naming it as a surface.
- Rust `epi agent vak evaluate` is a heuristic fallback; semantic/canonical evaluation lives in the skill-mediated path.
- Sophia post-execution review is guarded but not yet a full coordinate-native crystallisation lifecycle.

## Boundaries

[[S4.4']] evaluates and dispatches work. [[S4.2']] gates capabilities, [[S4.3']] provides temporal conditioning, [[S4.5']] curates review handoff, and [[S5']] [[Epii]] evaluates return meaning.

The negative space that matters most in practice, stated here rather than left to be recovered from Build Contract prose:

- **[[S4.1']] [[Hen]] owns score PERSISTENCE.** S4.4' owns only the *meaning* of a stored program — that it is an orchestration, with valid addresses, ordered the way `runOrchestration` orders it — and re-validates that on the way OUT of storage. The store itself, its layout and its hashing are Hen's (`Body/S/S4/ta-onta/S4-1p-hen/modules/score-store.ts`). A reader must not conclude from `s4'.orchestration.score` that S4.4' owns the store; that method is an [[S0]] adapter serving what Hen persisted.
- **[[S4.2']] [[Pleroma]] owns the `tilldone` TOOL.** S4.4' registers no copy of it and holds no task state. What is Anima's is the question of *when a run-till-done thread may close* — the run-till-done completion law stated in Build Contract above; the tool body and its registration are Pleroma-resident, scoped to Anima through the capability matrix.
- **S4.4' computes no learning metric.** It emits the trace; `aeon_eval` (S3' `redis-context`) derives the behavioural metrics and [[S5']] consumes the distillation corpus. The classification vocabulary lives once, Rust-side, and must not be mirrored here.
- **S4.4' does not resolve [[Epii]] review or improvement decisions**, and does not own the gateway transport, the vault, or the graph.
