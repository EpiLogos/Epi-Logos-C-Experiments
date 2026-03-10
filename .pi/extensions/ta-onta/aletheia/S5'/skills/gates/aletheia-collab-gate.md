---
name: aletheia-collab-gate
description: "Gate 6 (SAFETY BOUNDARY): Human-in-loop collaboration gate. ANY system self-learning decision, architectural spawn, or permanent knowledge crystallisation MUST pass through this gate. It exits to the user for explicit approval before proceeding. No autonomous pass-through."
gate: 6
human_in_loop: true
phase: 2
status: stub
critical: true
---

# aletheia-collab-gate

**Gate 6 — Human-in-Loop Collaboration (SAFETY BOUNDARY)**

> Phase 2+ implementation. Stub only — do not execute.
> **This gate is CRITICAL and must never be bypassed.**

## When This Gate Fires

Gate 6 is the safety boundary for ALL system self-learning and architectural decisions:

- Promoting a session thought to Bimba (permanent knowledge graph crystallisation)
- Spawning a new constitutional agent or subagent
- Modifying Aletheia's own gate logic or skill routing
- Any `aletheia_seed_refresh` that would alter canonical coordinate definitions
- Archive-day when `c_5_reflection_complete` needs human sign-off

## Gate Behaviour

When triggered, this gate:
1. **Halts autonomous processing** — no further action without human approval
2. **Presents the decision** to the human in clear language:
   - What is being proposed?
   - What will change permanently?
   - What is the reversibility?
3. **Waits for explicit `yes/no`** — timeout = no
4. **On approval**: proceeds and logs approval to session notebook with `[[wikilink]]` to the artifact
5. **On rejection**: aborts and writes a rejection note to the session notebook

## Principle

*"The human retains final say on all system learning."* The gate is not a bottleneck — it is the guarantee that the system evolves with, not ahead of, its human partner.
