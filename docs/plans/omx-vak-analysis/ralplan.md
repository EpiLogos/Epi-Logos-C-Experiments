# ralplan VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/ralplan/SKILL.md`
**VAK agent:** Logos | CF: `(0/1)` | Complexity: HIGH

## 1. Internal Workflow Summary

Alias for `$plan --consensus`. Consensus loop:
1. **Planner** creates plan + RALPLAN-DR summary (Principles/Drivers/Options)
2. User feedback (--interactive only)
3. **Architect** reviews for architectural soundness (sequential — await before step 4)
4. **Critic** evaluates quality (must follow step 3)
5. **Re-review loop** (max 5 iterations) on non-APPROVE verdicts
6. On approval: ADR section + execution handoff options (ralph or team)

Pre-context intake gate: context snapshot in `.omx/context/{slug}-*.md`

## 2. VAK Seam Map

| Step | OMX Role | Constitutional Agent | CF Code | CP Position |
|------|----------|---------------------|---------|-------------|
| Plan creation | Planner | **Logos** | `(0/1)` | CP 4.1 Definition |
| Architectural review | Architect | **Mythos** | `(0/1/2/3)` | CP 4.3 Pattern |
| Quality critique | Critic | **Eros** | `(0/1/2)` | CP 4.2 Operation |
| Re-review loop | All | Sequential CFP2 C-Thread | — | — |
| Execution handoff | — | `vak-evaluate` → `anima-orchestration` | — | — |

This is a CFP2 C-Thread: Logos → Mythos → Eros in sequential chain, full accumulated context.

## 3. Handoff Contract Rewrite

**OMX-native:**
- `$ralph` for sequential execution
- `$team` for parallel team execution

**VAK-native:**
- Run `vak-evaluate` on approved plan → assigns CF code based on task type
- `anima-orchestration` dispatches to Anima for ralph/team substrate
- Execution options route through CF `(4.0/1-4.4/5)` → Anima → `ralph` or `team`

## 4. State Schema Delta

Add to state at consensus start:
```json
{
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf_thread": [
      {"step": "planner", "cf": "(0/1)", "agent": "logos", "cp": "4.1"},
      {"step": "architect", "cf": "(0/1/2/3)", "agent": "mythos", "cp": "4.3"},
      {"step": "critic", "cf": "(0/1/2)", "agent": "eros", "cp": "4.2"}
    ],
    "cfp": "CFP2",
    "cs": "CS0"
  }
}
```

Each agent invocation passes full accumulated context (per cross-skill Q1 resolution).

## 5. Output Format Delta

Final plan artifact gains VAK topology header:
```
VAK Topology: ralplan/{slug}
CPF: (4.0/1-4.4/5)  CFP: CFP2 C-Thread
Thread: Logos(4.1) → Mythos(4.3) → Eros(4.2)
CS: CS0 / Day
```

ADR section includes constitutional agent routing trace.

## 6. Constitutional Agent Binding

**Owner:** Logos owns the plan artifact. Mythos reviews. Eros critiques.
Each dispatch in the consensus loop is a constitutional agent invocation via CF code.
The RALPLAN-DR summary is Logos's primary artifact (CT1 Definitional).

## Cross-skill Q1 Resolution

Consensus triad maps: Planner=Logos, Architect=Mythos, Critic=Eros.
External dispatch (not internal to Logos). Sequential CFP2 C-Thread.
Each agent receives full accumulated context: brief + all prior agent outputs.
