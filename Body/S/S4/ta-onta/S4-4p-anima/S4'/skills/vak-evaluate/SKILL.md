---
name: vak-evaluate
description: "6-step evaluation pipeline: S4-0' CPF through S4-5' CS. Contextually adaptive: silent inference for clear tasks, explicit deliberation for ambiguous ones. CPF=(00/00) hands off to brainstorming. True port from upstream."
port_type: true-port
skill_class: vak
---

# VAK Evaluate -- 6-Step Evaluation Pipeline

This skill provides the full VAK evaluation schema for assigning typed transition coordinates to any incoming task.

**Contextual Adaptation**: The agent determines contextually whether each layer needs explicit deliberation:
- **Clear, well-defined task** -> silent inference, output coordinates
- **Ambiguous scope, novel domain, or CPF=(00/00)** -> work through explicitly with user/Patient
- **Partial coordinates already set** -> evaluate only missing layers

**References**: Consult `vak-coordinate-frame` for all coordinate definitions, routing tables, and the CP x CF matrix.

---

## Step 1 -- S4-0' CPF: Route the Complexity

**Question**: Is this task dialogical (user-engaged) or mechanistic (autonomous)?

| CPF State | Notation | When to Use | Action |
|-----------|----------|-------------|--------|
| User-Instance | `(00/00)` | High complexity / multi-domain / user preference / learning | Invoke `brainstorming` (handles Steps 2-6 dialogically) |
| Subagent-Instance | `(4.0/1-4.4/5)` | Well-defined / autonomous / clear pattern | Proceed through Steps 2-6 |

**If CPF = (00/00)**: Stop here. Hand off to `brainstorming`.

---

## Step 2 -- S4-1' CT: Identify Content Type(s)

**Question**: What cognitive mode does this task require?

| CT | Content Type | QL Position | Data Paradigm |
|----|-------------|-------------|---------------|
| CT0 | Relational | #0 | Connections, adjacency |
| CT1 | Definitional | #1 | Material content, substance |
| CT2 | Operational | #2 | Methods, processes, workflows |
| CT3 | Pattern | #3 | Structural forms, types |
| CT4 | Contextual | #4 | Temporal/spatial placement |
| CT5 | Integrative | #5 | Synthesis, outcomes |

Multiple CT values are normal.

---

## Step 3 -- S4-2' CP: Plot Position on 4.x Lattice

**Question**: Where in the productive cycle does this task sit?

| CP | Position | QL # | Day Question | Function |
|----|----------|-------|-------------|---------|
| 4.0 | Ground | #0 | What do we have? | Starting point |
| 4.1 | Definition | #1 | What must be true? | Scope, boundaries |
| 4.2 | Operation | #2 | What is being done? | Execution |
| 4.3 | Pattern | #3 | What shape? | Structures, types |
| 4.4 | Context | #4 | Where/when? | Placement |
| 4.5 | Integration | #5 | What produced? | Synthesis |

---

## Step 4 -- S4-3' CF: Select Context Frame -> Agent

**Question**: Which constitutional agent handles this?

Cross-reference the primary CP with the CF routing table:

| CF Code | Agent | Functional Role |
|---------|-------|-----------------|
| `(0000)` | **Nous** | Impartial Perspective |
| `(0/1)` | **Logos** | Architect/Scoper |
| `(0/1/2)` | **Eros** | Refiner/Verifier |
| `(0/1/2/3)` | **Mythos** | Pattern Recognizer |
| `(4.0-4.4/5)` | **Psyche** | Coordinator |
| `(5/0)` | **Sophia** | Synthesizer |

**Nous Special Behaviour**: If CF = `(0000)`:
1. Do NOT dispatch task executor
2. Dispatch Nous (fresh minimal-context, P0'/P1' mode)
3. Nous asks: "What assumptions? What evidence? What don't we know?"
4. Receive findings, re-run Step 4 to select actual CF executor

---

## Step 5 -- S4-4' CFP: Determine Thread Mode

**Question**: How should execution be structured?

| CFP | Thread | When to Use |
|-----|--------|-------------|
| CFP0 | **Base** | Single task, clear scope |
| CFP1 | **P-Thread** | N different independent tasks simultaneously |
| CFP2 | **C-Thread** | Sequential phases with validation gates |
| CFP3 | **F-Thread** | Same task to N agents, aggregate best |
| CFP4 | **L-Thread** | High-autonomy, long-duration |
| CFP5 | **B-Thread** | Meta-nested orchestration |

---

## Step 6 -- S4-5' CS: Select Sequence and Direction

**Question**: How much of the coordinate chain, and which direction?

| CS | Steps | When to Use |
|----|-------|-------------|
| CS0 | 6 | Full traverse -- comprehensive work |
| CS1 | 2 | Quick ground->context |
| CS2 | 3 | Definition through execution |
| CS3 | 4 | Through pattern |
| CS4 | 3 | Context-focused |
| CS5 | 2 | Direct synthesis |

**Direction**: Day (forward synthesis), Night' (backward analysis), Day+Night' (full torus).

---

## Standard Output Format

```
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n][,CT[n]]  CP: 4.[n]
CF: ([code]) -> [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night' | Day+Night']
```

---

## Next Steps After Evaluation

1. **If CPF = (00/00)**: Invoke `brainstorming`
2. **If CPF = (4.0/1-4.4/5)**: Invoke `anima-orchestration` with full VAK coordinates
3. **If CS = Day+Night'**: After Day, invoke `day-night-pass` for Night' analysis

The VAK coordinate block becomes the execution topology for all downstream work.
