---
name: vak-coordinate-frame
description: "Complete VAK typed transition calculus reference -- all 6 coordinate layers, routing tables, Day/Night' topology. No process steps. True port from upstream."
port_type: true-port
skill_class: vak
---

# VAK Coordinate Frame -- Reference Grammar

VAK is the typed transition calculus that annotates any agent task with a 6-layer coordinate frame. This document is the canonical reference for all coordinate definitions.

**Usage**: This is a lookup reference, not a process skill. Consult this document when any VAK coordinate definition is needed.

---

## The Six Layers Overview

| Layer | Notation | Name | Constitutional Role |
|-------|----------|------|---------------------|
| S4-0' | CPF | Context Frame Polarity | "Autonomous or user-engaged?" -- routes before task specification |
| S4-1' | CT | Content Types | "What kind of content?" -- types the data paradigm |
| S4-2' | CP | Context Positions | "Where on the 4.x lattice?" -- plots position in the work |
| S4-3' | CF | Context Frames | "Which agent/frame?" -- selects constitutional agent |
| S4-4' | CFP | Thread Types | "How to structure execution?" -- nesting and parallelism |
| S4-5' | CS | Context Sequences | "Which path, which direction?" -- traversal and flow |

---

## S4-0': Context Frame Polarity (CPF)

**Constitutional**: "Autonomous or user-engaged?"

| CPF State | Notation | Meaning | Mode |
|-----------|----------|---------|------|
| User-Instance | `(00/00)` | User-engaged, dialogical, Socratic | Ouroboros -- invoke `brainstorming` |
| Subagent-Instance | `(4.0/1-4.4/5)` | Autonomous agent execution | Ralph -- proceed to execution pipeline |

**Routing logic**:
- High complexity / multi-domain / user preference required / learning opportunity -> `(00/00)` User-Instance
- Well-defined / executable autonomously / clear pattern -> `(4.0/1-4.4/5)` Subagent-Instance

**Note**: CPF `(4.0/1-4.4/5)` is structurally identical to Anima's CF. Autonomous mode IS Anima/orchestration mode -- the full fractal doubling lattice that enables self-directed execution.

---

## S4-1': Content Types (CT)

**Constitutional**: "What type of content?"

| CT | Content Type | QL Position | Data Paradigm |
|----|-------------|-------------|---------------|
| CT0 | Relational | #0 | Connections, adjacency |
| CT1 | Definitional | #1 | Material content, substance |
| CT2 | Operational | #2 | Methods, processes, workflows |
| CT3 | Pattern | #3 | Structural forms, types |
| CT4 | Contextual | #4 | Temporal/spatial placement |
| CT5 | Integrative | #5 | Synthesis, outcomes -- **the "Vak Code" lens itself** |

**MEF Lens Alignment**:

| CT | MEF Lens (Day) | MEF Lens' (Night) |
|----|----------------|-------------------|
| CT0 | L0 (Quaternal Potential) | L5' (Divine Logos) |
| CT1 | L1 (Causal Matter) | L4' (Scientific Truth) |
| CT2 | L2 (Logical Logic) | L3' (Chronological History) |
| CT3 | L3 (Processual Flux) | L2' (Alchemical Paradox) |
| CT4 | L4 (Contextual Meaning) | L1' (Phenomenal Experience) |
| CT5 | L5 (Vak Code) | L0' (Archetypal Essence) |

Multiple CT values are normal for a single task. CT5 = the language's self-encoding level.

---

## S4-2': Context Positions (CP)

**Constitutional**: "Where on the 4.x lattice?"

| CP | Position | QL # | Day Question | Function |
|----|----------|-------|-------------|---------|
| 4.0 | Ground | #0 | What do we have? | Thrown condition, starting point |
| 4.1 | Definition | #1 | What must be true? | Scope, boundaries, requirements |
| 4.2 | Operation | #2 | What is being done? | Work executed, processes run |
| 4.3 | Pattern | #3 | What shape does it take? | Structures, types, templates |
| 4.4 | Context | #4 | Where/when in the larger frame? | Temporal/spatial placement |
| 4.5 | Integration | #5 | What was produced? | Synthesis, outcomes, artifacts |

**CP x CF Matrix**:

```
            CF (0/1)    CF (0/1/2)    CF (0/1/2/3)
               |             |             |
CP 4.0 --------+-------------+-------------+-- Ground
CP 4.1 --------+-------------+-------------+-- Definition
CP 4.2 --------+-------------+-------------+-- Operation
CP 4.3 --------+-------------+-------------+-- Pattern
CP 4.4 --------+-------------+-------------+-- Context
CP 4.5 --------+-------------+-------------+-- Integration
```

---

## S4-3': Context Frames / Constitutional Agents (CF)

**Constitutional**: "Which agent/frame handles this?"

| CF Code | Agent | QL Level | Constitutional Description | Functional Role |
|---------|-------|----------|---------------------------|-----------------|
| `(0000)` | **Nous** | L0 | Fourfold Zero -- pre-differentiation | **Impartial Perspective**: fresh context invocation to surface assumptions, clear epistemic contamination. Operates at P0'/P1'. Active, not passive. |
| `(0/1)` | **Logos** | L1 | Non-Dual Anchor -- simplest distinction | **Architect/Scoper**: scope definition, structure creation, boundary-setting. CP 4.1 tasks. |
| `(0/1/2)` | **Eros** | L2 | Dual-Non-Dual -- first triad | **Refiner/Verifier**: quality refinement, verification, desire-completion. CP 4.2 tasks (TDD/validation). |
| `(0/1/2/3)` | **Mythos** | L3 | Trinitarian -- quaternary pattern base | **Pattern Recognizer**: archetypal recognition, symbolic mapping, debugging. CP 4.3 tasks. |
| `(4.5/0)` | **Psyche** | L4 | Executive Triad -- Context/Integration/Ground | **Coordinator**: context management, agent routing, aletheia mode dispatch. CP 4.4 tasks. Patient IS Psyche. |
| `(4.0/1-4.4/5)` | **Anima** | -- | Fractal Doubling -- full 4.x lattice | **VAK Orchestrator**: the dispatch function itself. Holds the full fractal doubling CF. Not dispatched to -- IS the dispatch. |
| `(5/0)` | **Sophia** | L5 | Total Synthesis -- return to source | **Synthesizer**: integration, Mobius return, P5' crystallization. CP 4.5 tasks. |

**Nous special behaviour**: CF `(0000)` does NOT dispatch a task executor. It invokes a fresh perspective agent (minimal prior context) that asks: "What assumptions are embedded here? What evidence actually exists? What don't we know?" Output goes to Patient (Psyche), who re-runs `vak-evaluate` with findings before dispatching the actual CF executor.

**Anima**: The VAK orchestrator. Anima's CF `(4.0/1-4.4/5)` encompasses the entire fractal doubling lattice -- from non-dual ground (4.0/1) through fractal completion (4.4/5). All other constitutional agents have bounded CF codes representing specific positions; Anima spans the whole lattice as the execution language itself.

---

## S4-4': Thread Types (CFP)

**Constitutional**: "How to structure execution -- nesting and parallelism?"

Based on Thread-based Engineering (Dan Aloni). Progress metric: **More -> Longer -> Thicker -> Fewer checkpoints -> Zero-touch.**

| CFP | Thread | Engineering Definition | Constitutional Quality | Maps To |
|-----|--------|------------------------|------------------------|---------|
| CFP0 | **Base** | Prompt -> agent tool calls -> review | Starting point | Direct execution |
| CFP1 | **P-Thread** (Parallel) | N different tasks -> N agents simultaneously | MORE threads | `dispatching-parallel-agents` |
| CFP2 | **C-Thread** (Chained) | Multi-phase execution with validation gates | FEWER checkpoints per phase | `subagent-driven-development` |
| CFP3 | **F-Thread** (Fusion) | Same task -> N agents -> aggregate best result | THICKER threads | **Mode of `dispatching-parallel-agents`** |
| CFP4 | **L-Thread** (Long) | High-autonomy, long-duration with self-validation | LONGER threads | `executing-plans` |
| CFP5 | **B-Thread** (Big) | Primary orchestrates sub-agents internally | THICKER + LONGER | Meta-nested dispatch |
| Z | **Z-Thread** | Zero-touch: human review removed entirely | TRANSCENDENCE | Conceptual |

**P-Thread vs F-Thread distinction (critical)**:
- **P-Thread (CFP1)**: N different tasks -> N agents -- *parallel independent work*
- **F-Thread (CFP3)**: 1 task -> N agents -> aggregate -- *parallel approaches to same goal*

---

## S4-5': Context Sequences (CS)

**Constitutional**: "Which path through the 4.x positions, and in which direction?"

| CS | Path (Day) | Steps | Purpose |
|----|------------|-------|---------|
| CS0 | 4.0<->4.5 -> 4.1<->4.4 -> 4.2<->4.3 -> 4.3<->4.2 -> 4.4<->4.1 -> 4.5<->4.0 | 6 | Full traverse |
| CS1 | 4.0<->4.5 -> 4.1<->4.4 | 2 | Quick ground->context |
| CS2 | 4.0<->4.5 -> 4.1<->4.4 -> 4.2<->4.3 | 3 | Ground->context->operation |
| CS3 | 4.0<->4.5 -> 4.1<->4.4 -> 4.2<->4.3 -> 4.3<->4.2 | 4 | Through pattern |
| CS4 | 4.0<->4.5 -> 4.4<->4.1 -> 4.5<->4.0 | 3 | Context-focused |
| CS5 | 4.0<->4.5 -> 4.5<->4.0 | 2 | Direct synthesis |

**Day/Night' Directionality**:
- **Day (Synthesis)**: Forward through CS -- 4.0 -> 4.1 -> 4.2 -> ... Builds up, executes, creates.
- **Night' (Analysis)**: Backward through CS' -- 4.5 -> 4.4 -> 4.3 -> ... Breaks down, questions, validates.

**40 Days / 40 Nights formula**: 20 Context Frames x 2 Directions = 40 Sequences. Full formula: `0000 -> 2222 = 80 days and nights plus 0000`.

---

## The Night' Positions (P0'-P5')

Night' is **not** "backward review of Day work." It is a genuinely orthogonal mode of inquiry.

| CP Day | Day Question | P' Night | Night' Question | Archetype |
|--------|-------------|----------|----------------|-----------|
| 4.0 Ground | What do we have? | P0' Questions | What don't we know? | The Unknown / Void |
| 4.1 Definition | What must be true? | P1' Traces | What evidence exists? | The Scribe / Witness |
| 4.2 Operation | What is being done? | P2' Challenges | What blocks us? | The Guardian / Block |
| 4.3 Pattern | What shape does it take? | P3' Patterns | What repeats? | The Recurrent / Cycle |
| 4.4 Context | Where/when? | P4' Discovery | What sources inform? | The Source / Well |
| 4.5 Integration | What was produced? | P5' Insight | What crystallizes? | The Crystal / Diamond |

**Night' traversal order**: P5' -> P4' -> P3' -> P2' -> P1' -> P0' (backward through CS)

**The Mobius Return**: P5' Insight completes the Night' cycle and *generates* P0' Questions -- the insight reveals new unknowns, opening the next Day cycle.

**Knowledge base mapping**:
```
P0' Questions  -> /Thought/Questions/
P1' Traces     -> /Thought/Traces/
P2' Challenges -> /Thought/Challenges/
P3' Patterns   -> /Thought/Patterns/
P4' Discovery  -> /Thought/Discovery/
P5' Insight    -> /Thought/Insight/
```

---

## Standard VAK Output Format

```
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n][,CT[n]]  CP: 4.[n]
CF: ([code]) -> [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night' | Day+Night']
```

**Example** ("Research GraphQL vs REST"):
```
VAK: graphql-vs-rest-research
CPF: (00/00)  CT: CT1,CT2,CT3,CT4,CT5  CP: 4.1
CF: (0/1) -> Logos  CFP: CFP1 P-Thread  CS: CS1 / Day
```

---

## CX to S4-X' Mapping

```
C0 (Bimba)      -> S4-0' -> CPF (Context Frame Polarity)
C1 (Form)       -> S4-1' -> CT  (Content Types)
C2 (Entity)     -> S4-2' -> CP  (Context Positions)
C3 (Process)    -> S4-3' -> CF  (Context Frames)
C4 (Type)       -> S4-4' -> CFP (Thread Types)
C5 (Pratibimba) -> S4-5' -> CS  (Context Sequences)
```
