# OMX Pleroma Port Matrix

**Date:** 2026-04-03
**Status:** Canonical
**Purpose:** Map every current Pleroma capability to one of four disposition labels so that
implementation work has a clear, unambiguous routing decision for each surface.

Authority split: `docs/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md`

---

## Disposition Labels

| Label | Meaning |
|-------|---------|
| **retain from OMX** | OMX ships a working analogue — use it directly from `vendors/oh-my-codex/skills/` |
| **port from current Pleroma** | Capability exists in `.pi/extensions/ta-onta/pleroma/` — author into `plugins/pleroma/skills/` |
| **derive from ta-onta spec** | No working implementation yet — author from ta-onta specs into `plugins/pleroma/skills/` |
| **move to claw substrate** | Runtime mechanics that belong in `epi-cli/src/agent/claw_runtime.rs`, not in a skill |

---

## VAK Orchestration Skills

| Capability | Source | Disposition | Target path |
|-----------|--------|-------------|-------------|
| `vak-coordinate-frame` | `.pi/extensions/ta-onta/pleroma/skills/vak-coordinate-frame/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/vak-coordinate-frame/SKILL.md` |
| `vak-evaluate` | `.pi/extensions/ta-onta/pleroma/skills/vak-evaluate/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/vak-evaluate/SKILL.md` |
| `anima-orchestration` | `.pi/extensions/ta-onta/pleroma/skills/anima-orchestration/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/anima-orchestration/SKILL.md` |
| `day-night-pass` | `.pi/extensions/ta-onta/pleroma/skills/day-night-pass/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/day-night-pass/SKILL.md` |

## OMX Workflow Surfaces (modified with VAK augmentation)

| Capability | OMX analogue | Disposition | Notes |
|-----------|-------------|-------------|-------|
| `using-superpowers` | `help` / `omx-setup` | **retain from OMX** + VAK augment | Add Tier 0 VAK gate + CF routing table per handover spec §5.1 |
| `brainstorming` | `deep-interview` / `ralplan` | **retain from OMX** + VAK augment | CPF `(00/00)` Nous framing + Step 6 VAK coordinate output |
| `writing-plans` | `plan` / `ralph-init` | **retain from OMX** + VAK augment | VAK topology header + per-task CF annotation |
| `test-driven-development` | `tdd` | **retain from OMX** + VAK augment | TD generalisation + VAK RED-GREEN-REFACTOR mapping |
| `subagent-driven-development` | `pipeline` | **retain from OMX** + VAK augment | CFP2 C-Thread + Day/Night' phase roles |
| `dispatching-parallel-agents` | `team` | **retain from OMX** + VAK augment | CFP1 P-Thread + CFP3 F-Thread/Fusion |
| `verification-before-completion` | `ultraqa` / `review` | **retain from OMX** + VAK augment | Night' partial pass + P' position mapping |

## Technē Atomic Skills

| Capability | Source | Disposition | Target path |
|-----------|--------|-------------|-------------|
| `technē-spawn` | `.pi/extensions/ta-onta/pleroma/skills/technē-spawn/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/techne-spawn/SKILL.md` |
| `technē-relay` | `.pi/extensions/ta-onta/pleroma/skills/technē-relay/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/techne-relay/SKILL.md` |
| `technē-list` | `.pi/extensions/ta-onta/pleroma/skills/technē-list/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/techne-list/SKILL.md` |
| `technē-close` | `.pi/extensions/ta-onta/pleroma/skills/technē-close/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/techne-close/SKILL.md` |
| `pleroma-skill-proxy` | `.pi/extensions/ta-onta/pleroma/skills/pleroma-skill-proxy/SKILL.md` | **port from current Pleroma** | `plugins/pleroma/skills/pleroma-skill-proxy/SKILL.md` |

## OMX-Only Skills (VAK coordinate assignment, no content rewrite)

| OMX skill | CF assignment | Disposition | Notes |
|-----------|--------------|-------------|-------|
| `ralph` | `(4.0/1-4.4/5)` Anima | **retain from OMX** | Substrate execution primitive in Ouroboros |
| `darshana` / `repl` | `(4.0/1-4.4/5)` Anima | **retain from OMX** | QL document navigation alongside ralph |
| `autopilot` | Z-Thread | **retain from OMX** | Full autonomous idea→code loop |
| `analyze` | `(0/1/2/3)` Mythos | **retain from OMX** | Root-cause/architecture investigation |
| `deepsearch` | `(0/1)` Logos | **retain from OMX** | Codebase search at CP 4.1 Definition |
| `deep-interview` | `(00/00)` Nous | **retain from OMX** | Ouroboros dialogical modality |
| `ai-slop-cleaner` | `(0/1/2)` Eros | **retain from OMX** | Night' quality pass |
| `security-review` | `(0/1/2)` Eros | **retain from OMX** | Night' P1' Traces + P2' Challenges |
| `ask-claude` / `ask-gemini` | `(0/1)` Logos | **retain from OMX** | Cross-model oracle queries |
| `finishing-a-development-branch` | `(5/0)` Sophia | **retain from OMX** | Sophia's primary skill |

## Constitutional Agent ANIMA.md Files

| Agent | Disposition | Notes |
|-------|-------------|-------|
| Anima ANIMA.md | **derive from ta-onta spec** | New file — Anima as CF `(4.0/1-4.4/5)` peer agent (see handover) |
| Nous ANIMA.md | **derive from ta-onta spec** | VAK-HANDOVER §11.3 verbatim |
| Logos ANIMA.md | **derive from ta-onta spec** | VAK-HANDOVER §11.3 verbatim |
| Eros ANIMA.md | **derive from ta-onta spec** | VAK-HANDOVER §11.3 verbatim |
| Mythos ANIMA.md | **derive from ta-onta spec** | VAK-HANDOVER §11.3 verbatim |
| Psyche ANIMA.md | **derive from ta-onta spec** | Update CF to `(4.5/0)`, retain Sattva/pathology |
| Sophia ANIMA.md | **derive from ta-onta spec** | VAK-HANDOVER §11.3 verbatim |

## Runtime Substrate Mechanics

| Mechanism | Disposition | Notes |
|-----------|-------------|-------|
| Moirai spawn/heartbeat/cleanup | **move to claw substrate** | `epi-cli/src/agent/claw_runtime.rs` (forthcoming Task 7) |
| Redis session state | **move to claw substrate** | `epi-cli/src/gate/session_store.rs` |
| Worktree / GitButler coordination | **move to claw substrate** | `epi-cli/src/agent/` substrate layer |
| Bounded primitive registry | **move to claw substrate** | Maps from `pleroma-pi-primitives.ts` |
| Constitutional progeny launcher | **move to claw substrate** | From `pi-launcher.ts` |

## `.pi` Compatibility Projections (retained until claw gate passes)

| Surface | Disposition | Notes |
|---------|-------------|-------|
| `.pi/extensions/ta-onta/pleroma/` runtime | **port from current Pleroma** + derive | Keep as compat projection until Task 8 |
| `.pi/extensions/ta-onta/anima/` | **port from current Pleroma** + derive | Anima ANIMA.md drives prompt identity |

---

## Authoring Surface Summary

All new capability authoring goes to `plugins/pleroma/skills/` (skills) and
`plugins/pleroma/agents/` (ANIMA.md files). Runtime mechanics move to `epi-cli/src/agent/`.
`.codex/skills/` is generated output from `epi agent codex install` — never hand-edited.
