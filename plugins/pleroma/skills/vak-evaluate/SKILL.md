---
name: vak-evaluate
description: Walk S4-0′ through S4-5′ to assign VAK coordinates (CPF/CT/CP/CF/CFP/CS) for any incoming task. Routes to the correct constitutional agent via CF code.
---

# VAK Evaluate

Assign 6-layer VAK coordinates to the current task. Run this at the start of any non-trivial work.

## Steps

**S4-0′ CPF — Is this user-engaged dialogue or mechanistic execution?**
- User needs exploration, brainstorming, or clarification → `(00/00)` dialogical
- Task is clearly specified and ready for execution → `(4.0/1-4.4/5)` mechanistic

**S4-1′ CT — What is the primary artifact type?**
- CT0 Relational: relationships, dialogue, discovery
- CT1 Definitional: specs, architecture, research
- CT2 Operational: code, tests, scripts
- CT3 Pattern: analysis, debugging, refactoring
- CT4 Contextual: planning, coordination, context management
- CT5 Integrative: synthesis, reflection, integration

**S4-2′ CP — Which position in the quaternal cycle?**
- 4.0 Ground: What do we have?
- 4.1 Definition: What must be true?
- 4.2 Operation: What is being done?
- 4.3 Pattern: What shape does it take?
- 4.4 Context: Where/when does it apply?
- 4.5 Integration: What was produced?

**S4-3′ CF — Which constitutional agent?**
- `(00/00)` → Nous (brainstorming, Ouroboros)
- `(0/1)` → Logos (research, definition)
- `(0/1/2)` → Eros (testing, Night′ quality)
- `(0/1/2/3)` → Mythos (architecture, root-cause)
- `(4.0/1-4.4/5)` → Anima (execution orchestrator, Ralph mode)
- `(4.5/0)` → Psyche (live identity, synthesis)
- `(5/0)` → Sophia (closure, Möbius return)

**S4-4′ CFP — Thread topology**
- CFP0 Base: single-agent
- CFP1 P-Thread: parallel tasks → N agents
- CFP2 C-Thread: one task → sequential chain
- CFP3 F-Thread: fusion (same task → N agents → merge)
- CFP4 L-Thread: lemniscate (Night′ pass)
- Z: autonomous autopilot

**S4-5′ CS — Context scope**
- CS0 Full: complete context
- CS1 Quick: minimal context
- CS2–CS5: scoped to specific layers

## Output Format

```
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n]  CP: 4.[n]
CF: ([code]) → [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night′ | Day+Night′]
```

## Routing

After coordinates are assigned, invoke `anima-orchestration` to dispatch to the correct constitutional agent.

If CPF is `(00/00)` and task is ambiguous, invoke `brainstorming` (Nous) first.
