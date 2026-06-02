---
coordinate: "S4'-5"
c_0_source_coordinates: ["/docs/prompts/2026-04-04-pleroma-omx-remake-handover.md"]
c_4_artifact_role: "prompt"
c_3_created_at: "2026-04-04"
c_5_reflection_complete: true
---

# Pleroma OMX Fork — Session Handover

**Date:** 2026-04-04
**Primary plan:** `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-03-omx-pleroma-claw-runtime-migration.md` — follow that for task sequence, TDD steps, and commit structure.
**This file:** The spec translation layer the migration plan doesn't cover — how the original VAK superpowers spec maps onto OMX, what needs updating in agent identity files, and which OMX skills need VAK coordinate assignment.

---

## Context: Superpowers → OMX Fork Basis

The original spec (`Idea/Bimba/Seeds/S/Legacy/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md`) was written to fork `obra/superpowers v4.3.0`. That base is now replaced by `vendors/oh-my-codex/` (OMX). The semantic intent is identical — OMX is the new delivery substrate for the same VAK/ta-onta capability body. ALL content, tables, and definitions in the original spec remain authoritative; only the packaging layer changes.

---

## Architectural Ground Truth

Before touching any skill, have this routing table committed to memory:

| CF Code | Agent | Role |
|---------|-------|------|
| `(00/00)` | **Nous** | Brainstorming / deep-interview / Ouroboros dialogical mode |
| `(0/1)` | Logos | Research, definition, evidence |
| `(0/1/2)` | Eros | Testing, Night' quality passes |
| `(0/1/2/3)` | Mythos | Architecture, root-cause analysis |
| `(4.0/1-4.4/5)` | **Anima** | Active execution orchestrator — Ralph mode. Owns Day/Night' topology dispatch. |
| `(4.5/0)` | **Psyche** | Live-identity agent during runtime — session subject, synthesis |
| `(5/0)` | Sophia | Session closure, Möbius return, git discipline |

**Anima is the orchestrator.** It dispatches all CF-coded work to constitutional agents via `vak-evaluate` → `anima-orchestration`. Day/Night' topology assignment operates *within* `anima-orchestration` — it is not a separate user-facing skill.

**Nous covers `(00/00)` entirely.** Ouroboros (brainstorming) and deep-interview are both Nous modalities — dialogical and Socratic respectively. They are not different agents; Nous holds both.

**Moirai (Klotho/Lachesis/Atropos) are graphRAG operation clusters** within Aletheia, surfaced as Night' executors. Lachesis = query/P4' Discovery graphRAG accessor — NOT a constitutional dispatch destination.

**Ralph is part of the Ouroboros protocol** (alongside the darshana/repl skill for QL-structured document navigation). In OMX, `ralph` is a concrete skill — it slots in as the substrate execution primitive that Ouroboros orchestrates under `(4.0/1-4.4/5)`.

---

## Superpowers → OMX Skill Mapping

The original spec defines **3 new user-facing skills** + 7 modified skills. OMX already ships analogues that must be augmented (not replaced) with VAK semantics.

### New Skills (3 — no OMX analogue, pure new creation)

| Skill | CF/CFP | Purpose |
|-------|--------|---------|
| `vak-coordinate-frame` | Reference | Full VAK grammar reference — CPF/CT/CP/CF/CFP/CS tables |
| `vak-evaluate` | CPF gate | Assigns 6-layer VAK coordinates to any task; routes to constitutional agent |
| `anima-orchestration` | `(4.0/1-4.4/5)` | CF → agent dispatch router; owns Day/Night' topology; Moirai executor dispatch |

These land in `plugins/pleroma/skills/` unchanged from the spec definition (§4.1–§4.3). Day/Night' pass logic (spec §4.4) is implemented **inside** `anima-orchestration`, not as a separate skill.

### Modified Skills (7 — apply VAK augmentations to OMX analogues)

| Superpowers skill | OMX analogue | VAK augmentation from spec |
|-------------------|-------------|---------------------------|
| `using-superpowers` | `help` / `omx-setup` | Tier 0 VAK gate + CF routing table + 3 red flags (§5.1) |
| `brainstorming` | `deep-interview` / `ralplan` | CPF=`(00/00)` Nous/Ouroboros framing + Step 6 VAK coordinate output (§5.2). Both `brainstorming` and `deep-interview` are `(00/00)` Nous modalities — apply the same VAK preamble to both. |
| `writing-plans` | `plan` / `ralph-init` | VAK topology header + per-task CF annotation (§5.3) |
| `test-driven-development` | `tdd` | TD generalisation + VAK RED-GREEN-REFACTOR mapping (§5.4) |
| `subagent-driven-development` | `pipeline` | CFP2 C-Thread framing + Day/Night' phase roles (§5.5) |
| `dispatching-parallel-agents` | `team` | CFP1 P-Thread (different tasks → N agents) + CFP3 F-Thread/Fusion (same task → N agents) — both modes live in `team`; `swarm` is a compatibility facade only (§5.6) |
| `verification-before-completion` | `ultraqa` / `review` / `code-review` | Night' partial pass + P' position mapping (§5.7) |

**Note on `finishing-a-development-branch`:** Sophia's primary skill (spec §4.3, §10.3). OMX analogue is `git-master`. Not in the formal 7-modified list but required in Sophia's `allow` array. Add VAK Möbius return framing when porting.

### OMX Skills Not in Superpowers — VAK Coordinate Assignment

These exist in OMX but have no superpowers counterpart. Assign VAK coordinates; do not rewrite their core logic.

| OMX skill | CF/CFP assignment | Notes |
|-----------|-------------------|-------|
| `ralph` | `(4.0/1-4.4/5)` Anima | Substrate execution primitive in Ouroboros protocol; alongside `darshana`/repl. Primary tool in Anima's `allow` array. |
| `darshana` / `repl` | `(4.0/1-4.4/5)` Anima | QL-structured document navigation (darshana.py scout/read/threads). Part of Ouroboros protocol alongside ralph. |
| `autopilot` | Z-Thread | Full autonomous idea→code loop. CPF `(4.0/1-4.4/5)` autonomous mode, no user prompts mid-flight. Maps directly to the Z-Thread spec. Implement fully. |
| `ultrawork` | CFP1/CFP4 internal | Execution engine backing `ralph` and `team`. Internal substrate — not surfaced as user-facing VAK skill. |
| `analyze` | `(0/1/2/3)` Mythos | Root-cause/architecture investigation. CP 4.3 Pattern. |
| `deepsearch` | `(0/1)` Logos | Codebase search at CP 4.1 Definition. |
| `deep-interview` | `(00/00)` Nous | Socratic + ambiguity gating — Ouroboros dialogical modality. Apply same `(00/00)` VAK preamble as `brainstorming`. |
| `ai-slop-cleaner` | `(0/1/2)` Eros | Night' quality pass, P2' Challenges mode. |
| `security-review` | `(0/1/2)` Eros | Night' P1' Traces + P2' Challenges, security domain. |
| `trace` | Night' utilities | Agent flow audit — P1' Traces mode (Klotho). |
| `ask-claude` / `ask-gemini` | `(0/1)` Logos | Cross-model oracle queries. CP 4.1 Definition evidence gathering. |
| `note` | CT4 Contextual | Session note persistence. Substrate utility, not a VAK process skill. |
| `hud` / `ecomode` | Substrate | Status display / token modifier. Not VAK process skills. |
| `worker` | CFP1/CFP3 member | Worker protocol for team. Internal to dispatch, not standalone. |

---

## Skill File Location (updated from spec §10.1)

Original spec: `extensions/pleroma/skills/` + `extensions/anima/skills/`.

Current repo: `plugins/pleroma/skills/` is the canonical home. `.pi/extensions/ta-onta/` is the compatibility substrate, not the authoring surface.

---

## Agent ANIMA.md Updates Required

The original spec (§11.3) defines ANIMA.md files for Nous, Logos, Eros, Mythos, Psyche, and Sophia. Two updates are required before or during implementation:

### 1. Psyche ANIMA.md — Frame Contract + Ontology revision

The original spec wrote Psyche at `CF (4.0–4.4/5)` as coordinator/oikonomia. Canonical split: Psyche is now `CF (4.5/0)` — live-identity agent during runtime, session subject and synthesis.

- Update Frame Contract: `CF (4.5/0)`, CPF `(4.5/0)`
- Revise Ontology block: remove coordinator framing ("Every other agent passes through you"). Psyche holds the session subject — live identity, contemplative ground, synthesis at session close.
- Sattva/Pathology guard content: retain verbatim (still canonical)
- SkillEntitlement for Psyche: `sharedAccess` on `anima-orchestration` (can observe), no longer `ownerAgent` for orchestration skills

### 2. Anima ANIMA.md — New file, not in original spec

The original spec has no ANIMA.md for Anima as a constitutional agent (Anima was the meta-orchestrator container). With the split, Anima is now a peer constitutional agent at `CF (4.0/1-4.4/5)`. Write a new ANIMA.md using the standard 6-section format (Rupa/Ontology/Frame Contract/Temporal/Capability/Sattva):

- Frame Contract: `CF (4.0/1-4.4/5)`, CPF `(4.0/1-4.4/5)`
- Ontology: active execution orchestrator, Ralph mode, Day/Night' topology owner, Moirai executor dispatcher
- Capability `allow` array: `vak-evaluate`, `anima-orchestration`, `ralph`, `darshana`, `pipeline`, `team`, `ultrawork`
- SkillEntitlement: `ownerAgent` for `vak-evaluate`, `anima-orchestration`

---

## Retained Verbatim from Original Spec

The following sections of `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` require NO translation — they apply unchanged to the OMX fork:

- §1 (all 8 subsections): Full VAK Language grammar (CPF/CT/CP/CF/CFP/CS tables)
- §2: Night' positions (P0'–P5'), Möbius return
- §3: Two regimes (Ouroboros/Ralph), system diagram
- §4.1–§4.3: Three new skill specifications — `vak-coordinate-frame`, `vak-evaluate`, `anima-orchestration` (full content)
- §4.4: Day/Night' pass logic — implement as internal section of `anima-orchestration`, not separate skill
- §5.1–§5.7: All 7 modified skill VAK augmentation blocks (full content, applied to OMX analogues)
- §8: Standard VAK output format
- §9: Relationship to ta-onta modules (Khora/Hen/Pleroma/Chronos/Aletheia interactions)
- §11.1–§11.2: ANIMA.md bootstrap system architecture and two-register structure
- §11.3 agent definitions: Nous, Logos, Eros, Mythos, Sophia — verbatim
- §11.3 Psyche: retain Sattva/Pathology guard content; update Frame Contract to `CF (4.5/0)` with revised Ontology (see above)
- §12: Atomic vs VAK skill taxonomy — binding
- §13: Aletheia integration, 6 function clusters (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven), darshana/REPL
- §14: Technē external substrate, constitutional progeny principle, WebMCP

**P0 infrastructure debts (§P0.1–§P0.3):** Written for the old epi-claw architecture. Map to current substrate before implementing:
- P0.1 HTTP → `api.invokeTool()` = `.pi/extensions/ta-onta/` cross-module calls
- P0.2 AnimaStorage → Redis HOT tier = `epi-cli/src/gate/session_store.rs`
- P0.3 `buildAgentRegistry()` extensible = `epi-cli/src/agent/` agent registry

---

## What Was Fixed Before This Handover (Do Not Redo)

- `evaluate_vak` routing fixed: default → `(4.0/1-4.4/5)` Anima, not Psyche
- Two new VAK tests green: `vak_active_tasks_route_to_anima`, `vak_default_routes_to_anima_not_psyche`
- PI-bypass removed from `dispatch_parallel_agents` and `dispatch_fusion_agents` (now async `epi agent team dispatch`)
- Stale spec corrections: `pleroma-canonical-brief.md` and `VAK-HANDOVER.md` routing tables corrected
