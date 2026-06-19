# AGENTS.md — pi-agent

## Purpose
The repo-native PI surface for Epi-Logos: curated PI entrypoint, extension shims, prompts, and agent topology synced into each managed PI agent. (README: "This directory is the repo-native PI surface for Epi-Logos.")
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]]

## Ownership
- `composite-entry.ts` — curated PI entrypoint composing the repo extension set (loads `extensions/ta-onta` + epii entitlement activation on `session_start`).
- `extensions/` — repo-owned PI extension shims copied into each managed agent (`epi-citta.ts`, `epii-entitlement-activation.ts`, `skill-entitlement.ts`, `ta-onta` -> symlink to `../../ta-onta`).
- `lib/` — entitlement core (`entitlement.ts`, `entitlement-loader.ts`), capability-parity gate (`capability-parity.ts` — Pi-startup parity assertion against the gateway `s4'.mediation.capabilities.list` surface, 12.T12.10), review-routing gate (`review-gate.ts` — Pi-owned recursive-self-review/user-final-validation gate, 12.T12.4), + Vama Shakti runtime: `dispatch-guard.ts` (structural dialogue-only dispatch enforcement, DR-VAMA-5) and `agent-registry.ts` (ad-hoc `PiAgentRegistry` — register/resolve/release/listByArena + `guardSpeakerDispatch` + `closeScene` lifecycle routing).
- `agents/` — shared agent topology / team defs (`anima.md`, `anuttara.md`, `agent-chain.yaml`, `teams.yaml`, `pi-pi/`).
- `prompts/` — system + help prompts (`epi-system.md`, `epi-agent-help.md`).
- `skills/` — repo-owned skills: `anuttara-symbolic-parse/`, `user-context/`, `custom/` (`skill-lookup/`, `mlx-lora/`), and vendored [[Hermes]] skills under `hermes/`.
- `tests/` — entitlement + agent-registration + capability-parity tests.
- `damage-control-rules.yaml` — runtime damage-control config.
- Does NOT own ta-onta carrier source (canonical home is sibling `Body/S/S4/ta-onta`, reached via the `extensions/ta-onta` symlink) nor coordinate/agent-constitution law — that lives in [[S4-SPEC]] and per-carrier `CONTRACT.md`, not here.

## Local Contracts
- No CONTRACT.md here. Binding spec: [[S4-SPEC]] / [[S4-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- Control plane is the `epi agent ...` CLI (install, doctor, extensions sync, spawn) per README; managed runtime layout `~/.epi/agents/<agent-id>/agent/...`.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Treat this directory as production runtime configuration (README): review changes like CLI code. Edit the Body source tree, never the managed `~/.epi/agents/...` copies — `epi agent extensions sync` propagates from here.

## Verification
- TS suites (node test runner): `node --test Body/S/S4/pi-agent/tests/entitlement.test.ts Body/S/S4/pi-agent/tests/epii-entitlement-activation.test.ts Body/S/S4/pi-agent/tests/vama-shakti-dialogue-only.test.ts Body/S/S4/pi-agent/tests/no-tool-bypass.test.ts Body/S/S4/pi-agent/tests/capability-parity.test.ts Body/S/S4/pi-agent/lib/review-gate.test.ts`.
- Skill lookup: `node --test Body/S/S4/pi-agent/skills/custom/skill-lookup/skill-lookup.test.ts`.
- Python: `pytest Body/S/S4/pi-agent/tests/test_anima_registration.py`.
- No crate/package manifest here; `make rust-test` does not cover this dir.

## Child DOX Index
- (leaf)
