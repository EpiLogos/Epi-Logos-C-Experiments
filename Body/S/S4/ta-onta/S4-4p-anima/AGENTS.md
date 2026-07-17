# AGENTS.md — S4-4p-anima

## Purpose
The Anima ta-onta carrier (S4-4' class): the agent-orchestration & meta-dispatch extension — VAK evaluation, CF dispatch, CFP thread execution, and CS-phase management for the PI agent runtime.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]] / [[S4-ARCHITECTURE]] (see also [[S-SYSTEM-INDEX]]).

## Ownership
- `CONTRACT.md` — binding interface (responsibility, registered tools, CF→agent map, CFP thread types, invariants)
- `extension.ts` — source-contract facade + entrypoint; re-exports the runtime under `./extension/`
- `extension/` — runtime: `mod.ts`, `tools.ts` (aggregator: vak_evaluate + goal_prelude, then registers the split families per 17.T17.10), `dispatch-tools.ts` (the six-tool dispatch family: anima_orchestrate, anima_arena_orchestrate, dispatch_parallel_agents, dispatch_fusion_agents, dispatch_moirai_night_pass, anima_self_invoke + arena/Mercurius helpers), `nous-disclose.ts` (isolated nous_disclose S0'/S1'/S2' dis-closure tool), `dispatch.ts` (incl. the 46.1 [[Z-thread]] runtime primitive: `registerZThreadShape`/`dispatchZThread` composing ≥2 distinct CFP moves under one autonomous envelope, closed only by the 12.35 Verify gate via `evaluateVerifyGate`; state queryable via `getZThreadSnapshot`/`listZThreadSnapshots`), `capabilities.ts` (Pleroma capability-matrix reader; derives a constitutional CF team only from its `cf_team_composition_gates` and `constitutional_ct_mapping`), `subscriptions.ts`
- `lib/` — pure reusable Anima orchestration helpers; currently `arena-orchestrator.ts` holds classifier-aware arena turn routing, Mercurius kairos state, CPF-gate, and dispatch-plan policy.
- `modules/` — per-agent dispatch/route/hook units (nous-clearing, logos-scope, eros-route, mythos-pattern, `symbolic-protein-reader.ts` for protected-handle Mythos reading/history/close binding, psyche-continuity with renderer-state carry-forward for review blocks, reading-frame-evaluator, sophia-hook/synthesis, aphoristic-skill, moirai-dispatch, judge-role, `dispatch-policy.ts` which emits Pleroma-consumable `tmux_topology_decision` envelopes from selected VAK/Elo dispatches, `parent-slice.ts` which redacts a [[ConversationSliceHandle]] into the same child environment for headless tmux and visible cmux projections and publishes successful child c=1/c=0 completion to Chronos, skill-registry, dispatch-validate, anima-invoke-payload)
- `S4/` — CFP execution primitives: `agent-team.ts`, `agent-chain.ts`, `subagent-widget.ts`, `pi-pi.ts`, `cross-agent.ts`, `epi-citta.ts` (+ `teams.yaml`, `agent-chain.yaml`)
- `S4'/agents/` — constitutional agent .md files (anima, nous, logos, eros, mythos, psyche, sophia, techne-helper); `psyche.md` is also the `techne_vama_summon` template-authority profile.
- `S4'/skills/` — skills that gate tool use (anima-orchestration, vak-evaluate, klein-mode, day-night-pass, ouroboros, symbolic-protein-reading, etc.)
- `spine-contribution.ts` — S4/S4' spine injection/ledger/query contribution
- `tests/` — contract + behaviour tests (dispatch gate, VAK-required, reading-frame evaluator, fusion validate, agent hooks, `symbolic_protein_reader.test.ts` for Mythos trigger/history/voice/provenance/config behavior, `z_thread_dispatch.test.ts` for the 46.1 Z-thread envelope/gate/query behaviour)
- Does NOT own: vault writes ([[S4-0p-khora]]), content/templates ([[S4-1p-hen]]), bounded primitives ([[S4-2p-pleroma]]), temporal scheduling ([[S4-3p-chronos]]), knowledge crystallisation tooling ([[S4-5p-aletheia]] — Anima dispatches TO its subagents, does not define them).

## Local Contracts
- `CONTRACT.md` (Anima Contract — Agent Orchestration & Meta-Dispatch)
- Source-contract facade: `extension.ts` (preserves the active-tool list inspected by S0 tests)
- Owning spec: [[S4-SPEC]] / [[S4-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; report blast radius.
- [[wikilink]] all entity references (coordinates, agents, carriers, specs) in agent-authored artifacts.
- `extension.ts` is a contract facade inspected by S0 tests — keep the `animaDefaultTools` list and runtime-symbol comments in sync with `./extension/`.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter; never write into `Idea/` directly (route via Khora/Hen).

## Verification
- `node --test tests/*.test.ts` (TypeScript contract and behavior tests in this directory; run from `Body/S/S4/ta-onta/S4-4p-anima`).
- `node --test tests/arena-orchestrator.test.ts` for classifier-aware arena turn-routing policy.
- `node --test tests/symbolic_protein_reader.test.ts` for [[Mythos]] symbolic-protein trigger, close, privacy, voice, provenance, and tunable behavior.
- Phase-preserving dispatch fixture: `node --test tests/phase_preserving_dispatch.test.ts` from this directory or with the repo-relative path.

## Child DOX Index
- (leaf)
