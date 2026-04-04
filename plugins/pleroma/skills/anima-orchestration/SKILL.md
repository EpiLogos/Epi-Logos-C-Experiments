---
name: anima-orchestration
description: CF code → constitutional agent dispatch router. Owns Day/Night′ topology assignment and Moirai executor dispatch. CF (4.0/1-4.4/5) Anima.
---

# Anima Orchestration

Dispatch work to the correct constitutional agent based on assigned VAK CF code.
Always run `vak-evaluate` first to obtain coordinates.

## Routing Matrix

| CF Code | Agent | Primary Skills | CFP Threads |
|---------|-------|---------------|-------------|
| `(00/00)` | Nous | brainstorming, deep-interview | CFP0 dialogical |
| `(0/1)` | Logos | deepsearch, ask-claude/gemini | CFP0, CFP1 |
| `(0/1/2)` | Eros | tdd, verification-before-completion, ai-slop-cleaner | CFP0, CFP4 Night′ |
| `(0/1/2/3)` | Mythos | analyze, systematic-debugging | CFP0, CFP2 |
| `(4.0/1-4.4/5)` | Anima | ralph, darshana, pipeline, team, ultrawork | CFP1/2/3, Z |
| `(4.5/0)` | Psyche | session subject, identity synthesis | CFP0 |
| `(5/0)` | Sophia | finishing-a-development-branch, git-master | CFP0 Möbius |

## Day/Night′ Topology

**Day pass** (torus forward): work through CP 4.0 → 4.1 → 4.2 → 4.3 → 4.4 → 4.5
**Night′ pass** (lemniscate): P5′ → P4′ → P3′ → P2′ → P1′ → P0′ (orthogonal inquiry)
**Möbius return**: P5′ Insight generates P0′ Questions — opens next cycle

Night′ executors (Moirai clusters in Aletheia):
- Klotho → P1′ Traces (CF `(0/1/2)` Eros)
- Lachesis → P4′ Discovery (CF `(4.0/1-4.4/5)` Anima)
- Atropos → P5′ Insight (CF `(5/0)` Sophia)

Full Night′ (CFP3 F-Thread): all three Moirai in parallel; Anima aggregates.

## Dispatch Steps

1. Read CF code from VAK coordinates
2. Select agent from routing matrix
3. If CFP3: dispatch Klotho + Lachesis + Atropos in parallel, aggregate at Anima
4. If CPF `(4.0/1-4.4/5)` + Anima: use `ralph` or `pipeline` as substrate execution primitive
5. If CPF `(00/00)`: hand off to Nous/`brainstorming` before any mechanistic work
6. At completion: check if Night′ pass is warranted; if so, dispatch via CFP4 L-Thread
