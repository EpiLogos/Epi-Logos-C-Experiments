# AGENTS.md — pi-agent

## Purpose
The repo-native PI surface for Epi-Logos: curated PI entrypoint, extension shims, prompts, and agent topology synced into each managed PI agent. (README: "This directory is the repo-native PI surface for Epi-Logos.")
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]]

## Ownership
- `composite-entry.ts` — curated PI entrypoint composing the repo extension set (registers code-mode first, then loads the synced sibling `../ta-onta` carrier + epii entitlement activation on `session_start`). NOTE (pre-existing, 50.T50.01): the unguarded `../ta-onta/composite-entry.ts` import currently throws — `S4-2p-pleroma/S2/damage-control.ts` requires `yaml`, unresolvable in both the Body tree and `~/.epi/agents/*/agent` — so the whole entry fails to load; load code-mode directly via `--extension` until that carrier dependency is resolved.
- `extensions/` — repo-owned PI extension shims copied into each managed agent (`epi-citta.ts`, `epii-entitlement-activation.ts`, `skill-entitlement.ts`, `code-mode.ts`). The canonical `ta-onta/` carrier is synced as a sibling of the managed `agent/` directory.
  - `code-mode.ts` — registers `run_tool_script` (50.T50.01): the [[Code-Mode]] run surface. An agent collapses a multi-tool task into ONE TypeScript program instead of a JSON call staircase that re-sends the whole conversation per hop. Chains code-mode guidance (incl. every tool's RETURN SHAPE) onto the system prompt via `before_agent_start`; writes a per-run JSONL trace when `EPI_CODE_MODE_TRACE` is set.
- `lib/` — entitlement core (`entitlement.ts`, `entitlement-loader.ts`), capability-parity gate (`capability-parity.ts` — Pi-startup parity assertion against the gateway `s4'.mediation.capabilities.list` surface, 12.T12.10), axiom-translation tooling (`axiom-translate.ts` — DR-B-2 plain prose to reviewable OWL/SHACL Turtle over epi-gnostic provenance), review-routing gate (`review-gate.ts` — Pi-owned recursive-self-review/user-final-validation gate, 12.T12.4), + Vama Shakti runtime: `dispatch-guard.ts` (structural dialogue-only dispatch enforcement, DR-VAMA-5) and `agent-registry.ts` (ad-hoc `PiAgentRegistry` — register/resolve/release/listByArena + `guardSpeakerDispatch` + `closeScene` lifecycle routing). Code-mode substrate (50.T50.01): `code-mode.ts` (`resolveToolFunction` — THE single dispatch choke point, applying the spawn `--tools` allow-list *then* `isEntitled()`; `runToolScript`; `accountTokens` script-vs-staircase measurement; `codeModeGuidance`), `code-mode-tools.ts` (the callable surface + `TOOL_SIGNATURES` declaring every return shape), `epi-tools.mjs` (the bridge module copied beside each emitted program; `.mjs` so it loads with no build step).
- `agents/` — shared agent topology / team defs (`anima.md`, `anuttara.md`, constitutional psyche-facet profiles `nous.md`/`logos.md`/`eros.md`/`mythos.md`/`psyche.md`/`sophia.md`, `agent-chain.yaml`, `teams.yaml`, `pi-pi/`).
- `prompts/` — system + help prompts (`epi-system.md`, `epi-agent-help.md`).
- `skills/` — repo-owned skills: `anuttara-symbolic-parse/`, `user-context/`, `custom/` (`skill-lookup/`, `mlx-lora/`), and vendored [[Hermes]] skills under `hermes/`.
- `tests/` — entitlement + agent-registration + capability-parity + axiom-translation tests.
- `damage-control-rules.yaml` — runtime damage-control config.
- Does NOT own ta-onta carrier source (canonical home is sibling `Body/S/S4/ta-onta`, loaded through explicit sibling imports after sync) nor coordinate/agent-constitution law — that lives in [[S4-SPEC]] and per-carrier `CONTRACT.md`, not here.

## Local Contracts
- No CONTRACT.md here. Binding spec: [[S4-SPEC]] / [[S4-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- Control plane is the `epi agent ...` CLI (install, doctor, extensions sync, spawn) per README; managed runtime layout `~/.epi/agents/<agent-id>/agent/...`.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Treat this directory as production runtime configuration (README): review changes like CLI code. Edit the Body source tree, never the managed `~/.epi/agents/...` copies — `epi agent extensions sync` propagates from here.

## Verification
- Code-mode (50.T50.01): `node --test Body/S/S4/pi-agent/tests/code-mode.test.ts` (31 behavioural tests — real programs in real node child processes against real files). LIVE proof, deliberately excluded from the shared gate because it makes a real model call: `node Body/S/S4/pi-agent/tests/code-mode-live-pi.mjs [--provider P] [--model M]` — spawns a real `pi`, asserts ONE program, gated calls, real side effect, and the measured token delta.
- TS suites (node test runner): `node --test Body/S/S4/pi-agent/tests/entitlement.test.ts Body/S/S4/pi-agent/tests/epii-entitlement-activation.test.ts Body/S/S4/pi-agent/tests/vama-shakti-dialogue-only.test.ts Body/S/S4/pi-agent/tests/no-tool-bypass.test.ts Body/S/S4/pi-agent/tests/capability-parity.test.ts Body/S/S4/pi-agent/tests/axiom-translate.test.ts Body/S/S4/pi-agent/tests/anuttara-symbolic-parse.test.ts Body/S/S4/pi-agent/lib/review-gate.test.ts`.
- Skill lookup: `node --test Body/S/S4/pi-agent/skills/custom/skill-lookup/skill-lookup.test.ts`.
- Python: `pytest Body/S/S4/pi-agent/tests/test_anima_registration.py`.
- No crate/package manifest here; `make rust-test` does not cover this dir.

## Child DOX Index
- (leaf)
