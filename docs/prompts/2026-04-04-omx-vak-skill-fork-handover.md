# Pleroma Plugin — OMX + Superpowers → VAK System Handover

**Date:** 2026-04-04
**Plan:** `docs/plans/2026-04-04-omx-vak-skill-fork-plan.md`
**Primary spec authority:** `docs/prompts/2026-04-04-pleroma-omx-remake-handover.md`

---

## The Paradigm (read this first)

OMX + Superpowers = Pleroma plugin. Not a choice between them, not two systems coexisting — one unified VAK system that inherits mechanics from whichever source has them best.

This is the same move any serious practitioner makes: take established high-quality forms (OMX's execution machinery, Superpowers' VAK semantic layer) and infuse them with your own ontology/routing/state. Internal logic largely preserved. What changes: routing goes through the VAK system, state carries VAK coordinates, constitutional agents do the agent work.

**The augmentation is not architecturally complex.** For each skill:
- Internal mechanics: keep from best source (OMX or Superpowers)
- Routing: replace with `vak-evaluate` → `anima-orchestration`
- State: every `state_write` gains `vak: { cpf, cf, cs, cp }`
- Output: every artifact gains a VAK coordinate block
- Constitutional agent binding: frontmatter gains `cf:`, `cpf:`, `agent:`

That's it. The skill IS the VAK system because the VAK system is now the ontological ground, not an annotation layer.

---

## The ralplan triad — resolved

`ralplan`/`plan` consensus loop maps directly to constitutional agents:

- **Planner** = **Logos** (`(0/1)`) — definition, scope, boundary-setting
- **Architect** = **Mythos** (`(0/1/2/3)`) — architecture, root-cause, pattern
- **Critic** = **Eros** (`(0/1/2)`) — quality pass, Night′ challenge, P2′ Challenges mode

These are dispatched as actual constitutional agents via `anima-orchestration`. This is the paradigm demonstrated in a single skill: OMX mechanics (Planner→Architect→Critic loop) + VAK routing (Logos→Mythos→Eros dispatch) = one Pleroma skill.

---

## `using-superpowers` — rewritten as Pleroma entry point

This skill is not the Superpowers version OR the OMX `omx-setup`. It's OUR version — the Pleroma/VAK session entry skill that replaces both. It IS the VAK Tier 0 gate for the whole plugin.

Content: CF routing table (all 7 agents), VAK priority stack, red flags from Superpowers, plus OMX skill availability signal. One unified skill that tells the session "you are operating in the Pleroma/VAK system."

---

## Source selection per skill

For each skill, whichever source has stronger mechanics is the base. VAK augmentation is additive.

| Pleroma skill | Best mechanics source | VAK semantic source | Key change |
|---|---|---|---|
| `using-superpowers` | Superpowers (already VAK-aware) | Superpowers | Rewrite as unified Pleroma entry — not OMX setup, not SP version, OUR version |
| `deep-interview` | OMX (5-phase state machine, ambiguity scoring) | Superpowers `brainstorming` Step 6 | Add VAK block to Phase 4 artifacts + bridge through `vak-evaluate` |
| `ralplan` | OMX (consensus loop) | Superpowers `writing-plans` topology header | Replace Planner/Architect/Critic with Logos/Mythos/Eros dispatch via `anima-orchestration` |
| `plan` | OMX (same as ralplan base) | Superpowers `writing-plans` | Same as ralplan; plan is the base, ralplan is the consensus alias |
| `tdd` | OMX + Superpowers (comparable) | Superpowers CP map per phase | Add CP 4.1/4.2/4.3 to RED/GREEN/REFACTOR + Eros binding |
| `pipeline` | OMX (worker handoff mechanics) | Superpowers `subagent-driven-development` CFP2 | Add CFP2 framing + VAK block per worker output |
| `team` | OMX (parallel dispatch) | Superpowers `dispatching-parallel-agents` CFP1/CFP3 | Add CFP1 vs CFP3 branching + VAK frame per worker |
| `ultraqa` | OMX (verification passes) | Superpowers `verification-before-completion` Night′ | Add Night′ partial pass boundary rules |
| `git-master` | OMX (git mechanics) | Superpowers `finishing-a-development-branch` Möbius | Add P5′→P0′ Möbius contract at close |
| `vak-coordinate-frame` | — (new, no analogue) | Spec §4.1 verbatim | Full grammar reference tables |
| `vak-evaluate` | — (new, no analogue) | Spec §4.2 | Full 6-step pipeline |
| `anima-orchestration` | — (new, no analogue) | Spec §4.3–4.4 | CF routing + Day/Night′ + Moirai dispatch |

---

## ralplan context contract — settled

Each constitutional agent (Logos→Mythos→Eros) receives full accumulated context: original brief + all prior agent outputs. Sequential CFP2 C-Thread. Same as OMX — Mythos needs Logos's plan to review it, Eros needs both to critique. No decision needed, just implement it that way.

---

## Skills to delete before Phase 2

These are in `plugins/pleroma/skills/` and are wrong (superpowers copies, not Pleroma skills):
- `brainstorming/` — delete; content absorbed into `deep-interview` VAK binding
- `writing-plans/` — delete; content absorbed into `ralplan`/`plan`
- `test-driven-development/` — delete; replace with `tdd/` from OMX + VAK
- `subagent-driven-development/` — delete; replace with `pipeline/`
- `dispatching-parallel-agents/` — delete; replace with `team/`
- `verification-before-completion/` — delete; replace with `ultraqa/`
- `using-superpowers/` — delete; replace with Pleroma entry version
- `finishing-a-development-branch/` — delete; replace with `git-master/`

`day-night-pass/` — absorb into `anima-orchestration` as an internal section per spec §4.4.

---

## Do not redo

- `plugins/pleroma/.claude-plugin/plugin.json` ✅
- `plugins/pleroma/hooks/hooks.json` ✅
- `plugins/pleroma/evals/suites/vak-routing.md` ✅
- `plugins/registry.jsonl` ✅
- `plugins/pleroma/agents/` — 7 ANIMA.md files exist; audit against seam maps after skill writing but don't delete
- All `epi-cli/` infra changes ✅
- `docs/specs/S/S4/2026-04-03-omx-pleroma-*` authority docs ✅

---

## OMX source

`vendors/oh-my-codex/skills/{name}/SKILL.md` — read the originals before writing each fork.

## Superpowers VAK source

`.pi/extensions/ta-onta/anima/S4'/skills/{name}/SKILL.md` — already VAK-aware; use as semantic layer.

## Spec authority

`docs/resources/S/VAK-HANDOVER.md` and the original spec for §4.1–4.4 content.
