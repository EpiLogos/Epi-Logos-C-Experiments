# using-superpowers VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/omx-setup/SKILL.md`
**VAK position:** Tier 0 gate | CF: meta | Complexity: LOW

## 1. Internal Workflow Summary

OMX setup skill: install/configure oh-my-codex for project + user directories.
`omx setup [--force] [--dry-run] [--verbose] [--scope user|project]`
Creates directories, installs prompts/skills/configs, generates AGENTS.md.

## 2. VAK Seam Map

Our `using-superpowers` is NOT an OMX setup skill — it's the **Pleroma session entry skill**.
It replaces both `omx-setup` and the original Superpowers `using-superpowers`.

Purpose: establish VAK operating context for the session. Tier 0 gate.

Content needed:
- CF routing table (all 7 agents)
- VAK priority stack (run `vak-evaluate` before anything)
- Red flags (rationalizations that bypass VAK)
- CPF/CF quick reference
- How to invoke skills in Pleroma/VAK system

## 3. VAK Priority Stack

1. `vak-evaluate` FIRST — assign coordinates before any work
2. If CPF `(00/00)` → Nous / `deep-interview`
3. If CFP1+ → check CFP thread type before dispatch
4. Only after coordinates assigned → `anima-orchestration`

## 4. Constitutional Agent Binding

Not owned by any single agent — this is the meta-entry point.
Available to all agents.

## 5. No State Schema / No Handoff

This is a reference skill. No state_write. No handoff contract.
Invoked once at session start to establish VAK operating frame.
