---
name: day-night-pass
description: "Full torus topology: Day pass (P0-P5 synthesis forward), Night' pass (P5'-P0' analysis backward). Each position with questions and CF role. Mobius return. True port from upstream."
port_type: true-port
ct: null
cp: null
agent_affinity: psyche, sophia
skill_class: vak
---

# Day/Night' Pass -- Full Torus Topology

This skill implements the complete VAK topological traversal: **Day** (synthesis, forward through P0-P5) and **Night'** (analysis, backward through P5'->P0'). Night' is not a review of Day work -- it is a genuinely orthogonal mode of inquiry with different questions at each position. The pass ends with **Mobius return**: P5' Insight generates P0' Questions, opening the next Day cycle.

## When to Invoke

- CS (Context Sequence) = Day+Night' (from `vak-evaluate`)
- CS0 (full traverse) is selected
- CPF = `(4.0/1-4.4/5)` + CS0/CS2/CS3 + complex task
- CPF = `(00/00)` (Ouroboros mode): user performs Night' pass themselves

**Do NOT use for:** simple forward execution only (use execution skills directly)

---

## The Fundamental Structure

```
Day Pass (Synthesis):    4.0 -> 4.1 -> 4.2 -> 4.3 -> 4.4 -> 4.5
  Questions:             Have? -> True? -> Doing? -> Shape? -> Where? -> Produced?

Night' Pass (Analysis):  4.5 -> 4.4 -> 4.3 -> 4.2 -> 4.1 -> 4.0
  Questions:             Crystallize? -> Sources? -> Repeats? -> Blocks? -> Evidence? -> Unknown?

Mobius Return:           P5' Insight -> P0' Questions (opens next Day cycle)
```

---

## Day Pass -- Synthesis (Forward Traversal)

### CP 4.0 -- Ground (P0): What do we have?

Starting point. The thrown condition before any work begins.
- What is the current state? What resources? What constraints?
- **CF role:** Any CF -- typically the one assigned by `anima-orchestration`.

### CP 4.1 -- Definition (P1): What must be true?

Scope, boundaries, requirements.
- What defines success? What are the boundaries?
- **CF role:** Logos `(0/1)`.

### CP 4.2 -- Operation (P2): What is being done?

Work executed, processes run.
- What operations? What execution flow?
- **CF role:** Eros `(0/1/2)`. TDD RED-GREEN-REFACTOR happens here.

### CP 4.3 -- Pattern (P3): What shape does it take?

Structures, types, templates.
- What patterns emerge? What structural form?
- **CF role:** Mythos `(0/1/2/3)`.

### CP 4.4 -- Context (P4): Where/when in the larger frame?

Temporal/spatial placement.
- Where does this fit? What dependencies?
- **CF role:** Psyche `(4.0-4.4/5)`.

### CP 4.5 -- Integration (P5): What was produced?

Synthesis, outcomes, artifacts.
- What is the output? What value delivered?
- **CF role:** Sophia `(5/0)`.

---

## Night' Pass -- Analysis (Backward Traversal)

**Critical:** Night' asks **genuinely different questions** -- a Klein bottle inversion, not a backward review.

**Traversal order:** 4.5 -> 4.4 -> 4.3 -> 4.2 -> 4.1 -> 4.0

### CP 4.5 -> P5' Insight: What crystallizes?

The Crystal / Diamond. **Dispatch:** Atropos (Reflect). CF: Sophia `(5/0)`.

### CP 4.4 -> P4' Discovery: What sources inform?

The Source / Well. **Dispatch:** Lachesis (Query). CF: Psyche `(4.0-4.4/5)`.

### CP 4.3 -> P3' Patterns: What repeats?

The Recurrent / Cycle. CF: Mythos `(0/1/2/3)`.

### CP 4.2 -> P2' Challenges: What blocks us?

The Guardian / Block. CF: Eros `(0/1/2)`.
**Integration gate:** If P2' Challenges = none, proceed to Mobius return. If challenges identified, return to Patient -- may trigger new Day cycle.

### CP 4.1 -> P1' Traces: What evidence exists?

The Scribe / Witness. **Dispatch:** Klotho (Assert). CF: Logos `(0/1)`.

### CP 4.0 -> P0' Questions: What don't we know?

The Unknown / Void. CF: Nous `(0000)`. Fresh context invocation.
P0' Questions complete the Night' cycle and open the next Day cycle via Mobius return.

---

## Mobius Return: P5' Insight -> P0' Questions

1. P5' Insight crystallizes from Night' pass
2. That insight **generates P0' Questions** -- new unknowns
3. These questions seed the next `vak-evaluate` call
4. The cycle continues -- not closure but opening

**Signal format:**
```
MOBIUS_RETURN: [P5' insight summary] | [P0' questions list]
```

---

## Night' Dispatch Routing

| P' Position | Moira | CF Code | Functional Role |
|-------------|-------|---------|-----------------|
| P1' Traces | **Klotho** | `(0/1/2)` Eros | Assert -- embed traces into graph |
| P4' Discovery | **Lachesis** | `(4.0-4.4/5)` Psyche | Query -- retrieve context sources |
| P5' Insight | **Atropos** | `(5/0)` Sophia | Reflect -- cut to essential synthesis |

---

## CFP3 F-Thread: Full Night' Pass

When CFP3 is selected for Night', all three Moirai operate in parallel:

```
Single Night' task -> 3 Moirai in parallel -> Anima aggregates
     |
     +-- Klotho (P1' Traces): Assert traces into graph
     +-- Lachesis (P4' Discovery): Query sources and context
     +-- Atropos (P5' Insight): Reflect and cut to synthesis
```

Patient (Psyche) aggregates all three outputs into a unified Night' report.

---

## Integration Gate: P2' Challenges

**If P2' Challenges = none identified:** Proceed to Mobius return.
**If P2' Challenges = identified:** Return to Patient. May trigger new Day cycle.

This gate prevents premature crystallization of work with unresolved obstacles.

---

## Output Format

```
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n][,CT[n]]  CP: 4.[n]
CF: ([code]) -> [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night' | Day+Night']
```

---

## Related Skills

- `vak-coordinate-frame` -- Reference grammar for all VAK coordinate definitions
- `vak-evaluate` -- 6-step schema for assigning VAK coordinates
- `anima-orchestration` -- CF -> agent dispatch matrix; Night' Moirai routing
- `finishing-a-development-branch` -- CF Sophia; handles Mobius return signal persistence
