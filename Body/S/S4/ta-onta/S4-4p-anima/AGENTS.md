# AGENTS.md — S4-4p-anima

## Purpose
The Anima ta-onta carrier (S4-4' class): the agent-orchestration & meta-dispatch extension — VAK evaluation, CF dispatch, CFP thread execution, and CS-phase management for the PI agent runtime.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]] / [[S4-ARCHITECTURE]] (see also [[S-SYSTEM-INDEX]]).

## Ownership
- `CONTRACT.md` — binding interface (responsibility, registered tools, CF→agent map, CFP thread types, invariants)
- `extension.ts` — source-contract facade + entrypoint; re-exports the runtime under `./extension/`
- `extension/` — runtime: `mod.ts`, `tools.ts` (aggregator: vak_evaluate + goal_prelude, then registers the split families per 17.T17.10), `dispatch-tools.ts` (the six-tool dispatch family: anima_orchestrate, anima_arena_orchestrate, dispatch_parallel_agents, dispatch_fusion_agents, dispatch_moirai_night_pass, anima_self_invoke + arena/Mercurius helpers), `nous-disclose.ts` (isolated nous_disclose S0'/S1'/S2' dis-closure tool), `dispatch.ts` (incl. the 46.1 [[Z-thread]] runtime primitive: `registerZThreadShape`/`dispatchZThread` composing ≥2 distinct CFP moves under one autonomous envelope, closed only by the 12.35 Verify gate via `evaluateVerifyGate`; state queryable via `getZThreadSnapshot`/`listZThreadSnapshots`), `capabilities.ts` (Pleroma capability-matrix reader; derives a constitutional CF team only from its `cf_team_composition_gates` and `constitutional_ct_mapping`), `subscriptions.ts`
- `lib/` — pure reusable Anima orchestration helpers; `arena-orchestrator.ts` holds classifier-aware arena turn routing, Mercurius kairos state, CPF-gate, and dispatch-plan policy; `child-pi-executor.ts` (50.T50.02) is **THE single choke point where a dispatch decision becomes a child pi process** — the three former `spawn("pi", …)` copies in `S4/{agent-team,agent-chain,pi-pi}.ts` all route through `dispatchChildPi()`, which applies every invariant once: Pi→subagent only (`CHILD_PI_BINARY`, not injectable), the `--tools` allow-list via `resolveEntitlement()` (agent-chain and pi-pi previously passed raw frontmatter tool strings with NO gate), `guardVamaShaktiDispatch` (DR-VAMA-5), and `enforceReviewGate` (12.T12.4). A violated invariant throws `ChildPiDispatchRefused` and no process is spawned. `childPiRuntimeArgs()` remains the runtime-arg source, now called only here. `vak-orchestration-surface.ts` (50.T50.03) is the **typed six-coordinate scripting surface** an Anima orchestration is written against — each of CPF/CT/CP/CF/CFP/CS is a composable AXIS with its own reader (`reviewPolarity`/`haltsForHuman`, `artifactTemplates`, `framePosition(Index)`, `boundAgent` via [[AGENT_CF]], `executionShape`/`primitiveFor` via `zThreadToolForMove`, `sequence`/`isNightPass`), plus `defineOrchestration`/`runOrchestration` (CS orders the run: Day before Night′, then CP position) and the load-bearing envelope invariant: `emit()` is the ONLY emission constructor and `assertFullEnvelope`/`describeEnvelopeViolations` refuse a partial or non-canonical address naming the offending coordinate. Types are NOT redefined — it consumes `ta-onta/shared/vak_address.ts`, the one TS mirror.
- `modules/` — per-agent dispatch/route/hook units (nous-clearing, logos-scope, eros-route, mythos-pattern, `symbolic-protein-reader.ts` for protected-handle Mythos reading/history/close binding, psyche-continuity with renderer-state carry-forward for review blocks, reading-frame-evaluator, sophia-hook/synthesis, aphoristic-skill, moirai-dispatch, judge-role, `dispatch-policy.ts` which emits Pleroma-consumable `tmux_topology_decision` envelopes from selected VAK/Elo dispatches, `parent-slice.ts` which redacts a [[ConversationSliceHandle]] into the same child environment for headless tmux and visible cmux projections and publishes successful child c=1/c=0 completion to Chronos, skill-registry, dispatch-validate, anima-invoke-payload)
- `S4/` — CFP execution primitives: `agent-team.ts`, `agent-chain.ts`, `subagent-widget.ts`, `pi-pi.ts`, `cross-agent.ts`, `epi-citta.ts` (+ `teams.yaml`, `agent-chain.yaml`). Since 50.T50.02 the three child-pi dispatch seams (`agent-team.ts` `dispatchAgent`, `agent-chain.ts` `runAgent`, `pi-pi.ts` `queryExpert`) own their prompt assembly, stream parsing and widget state only — the process, argv and guards belong to `lib/child-pi-executor.ts`. Do NOT reintroduce a `spawn("pi", …)` here; add the invariant to the executor instead. (`subagent-widget.ts` and `extension/dispatch.ts` spawn `epi`, not `pi` — a different family, not covered by that executor.)
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
- `node --test tests/vak_orchestration_surface.test.ts` (50.T50.03) for the six-coordinate scripting surface + the CROSS-LANGUAGE parity fixture `../shared/vak_address.parity.json`, which is also read by `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test vak_address_ts_parity` — neither side greps the other's source; both must accept the canonical cases and refuse the rejected ones. LIVE: `node tests/vak-orchestration-live.mjs` composes across 6/6 coordinates and executes through the gated executor with real child pi's.
- `node --test tests/child_pi_executor.test.ts` (50.T50.02) for the unified child-pi dispatch invariants (entitlement-resolved `--tools`, DR-VAMA-5 dialogue-only refusal, review gate, argv contract). LIVE proof, excluded from the shared gate because it makes real model calls: `node tests/child-pi-executor-live.mjs` — dispatches real child pi's and shows a denied tool genuinely unreachable by the child. Cross-language contract: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_extensions_ta_onta`.
- `node --test tests/symbolic_protein_reader.test.ts` for [[Mythos]] symbolic-protein trigger, close, privacy, voice, provenance, and tunable behavior.
- Phase-preserving dispatch fixture: `node --test tests/phase_preserving_dispatch.test.ts` from this directory or with the repo-relative path.

## Child DOX Index
- (leaf)
