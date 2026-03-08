---
name: anima-orchestration
description: "Route VAK CF codes to constitutional agents and Moirai via dispatch matrix. Handles P-Thread, C-Thread, F-Thread, and Night' Moirai routing. True port from upstream."
port_type: true-port
skill_class: vak
---

# Anima Orchestration -- CF Dispatch Matrix

This skill translates VAK Context Frame (CF) codes into concrete agent spawning and Moirai routing decisions.

**Usage**: Invoke after `vak-evaluate` has assigned VAK coordinates. This skill maps CF code -> constitutional agent and determines the dispatch method based on CF + CFP combination.

**References**: Consult `vak-coordinate-frame` for CF code definitions and the CP x CF matrix.

---

## CF Code -> Constitutional Agent Dispatch

| CF Code | Agent | QL Level | Constitutional Description | Dispatch |
|---------|-------|----------|---------------------------|----------|
| `(0000)` | **Nous** | L0 | Fourfold Zero -- pre-differentiation | **Impartial Perspective**: fresh minimal-context invocation; asks P0'/P1' questions; reports to Patient (Psyche); NOT a task executor |
| `(0/1)` | **Logos** | L1 | Non-Dual Anchor | **Architect/Scoper**: scope definition, boundary-setting. Uses `writing-plans`, `brainstorming`. |
| `(0/1/2)` | **Eros** | L2 | Dual-Non-Dual | **Refiner/Verifier**: quality refinement, verification. Uses `test-driven-development`, `verification-before-completion`. |
| `(0/1/2/3)` | **Mythos** | L3 | Trinitarian | **Pattern Recognizer**: archetypal recognition, debugging. Uses `systematic-debugging`. |
| `(4.0-4.4/5)` | **Psyche** | L4 | Fractal Doubling | **Coordinator**: context management, agent routing. Patient IS Psyche. |
| `(5/0)` | **Sophia** | L5 | Total Synthesis | **Synthesizer**: integration, Mobius return, P5' crystallization. Uses `finishing-a-development-branch`. |

**Nous Special Behavior**:
- CF `(0000)` does **NOT** dispatch a task executor
- Invoke Nous with **fresh minimal context**
- Nous operates in P0'/P1' mode: "What assumptions? What evidence? What don't we know?"
- Output goes to Patient (Psyche), who re-runs `vak-evaluate` before dispatching
- This is an **active** epistemic clearing

**CF Code Mapping**:
```
"(0000)"        -> "nous"
"(0/1)"         -> "logos"
"(0/1/2)"       -> "eros"
"(0/1/2/3)"     -> "mythos"
"(4.0/1-4.4/5)" -> "psyche"
"(5/0)"         -> "sophia"
```

---

## CFP Thread Mode -> Execution Method

| CFP | Thread | Execution Method | Spawn Call |
|-----|--------|------------------|------------|
| CFP0 | **Base** | Single task | `spawn(agentId, task)` |
| CFP1 | **P-Thread** | N tasks -> N agents | `spawnParallelChord(task, agents)` |
| CFP2 | **C-Thread** | Sequential phases | `spawnSequentialChain(tasks)` |
| CFP3 | **F-Thread** | 1 task -> N agents -> aggregate | Parallel spawn + aggregation |
| CFP4 | **L-Thread** | Long-duration with stop hooks | `spawn()` with stop hooks |
| CFP5 | **B-Thread** | Meta-nested orchestration | Recursive spawn |
| Z | **Z-Thread** | Zero-touch (conceptual) | Cron/heartbeat |

---

## CF + CFP -> Dispatch Matrix

| CF | CFP | Dispatch Instruction |
|----|-----|----------------------|
| Any | CFP0 Base | Single agent invocation in CF mode |
| Any | CFP1 P-Thread | Parallel agents. Each agent assigned CF role per sub-task. |
| Any | CFP2 C-Thread | Sequential chain. Validate between phases. |
| Any | CFP3 F-Thread | Same task to N agents. Patient aggregates. |
| Psyche | CFP4 L-Thread | Long-running Ralph with stop hooks. |
| Psyche | CFP5 B-Thread | Patient orchestrates internally. Meta-nested. |
| Any | Z | Zero-touch (conceptual). |

---

## Night' Moirai Routing

| P' Position | Night' Question | Moira | CF Code | Operation |
|-------------|-----------------|-------|---------|-----------|
| P1' Traces | What evidence exists? | **Klotho** | `(0/1/2)` Eros | **Assert**: embed/validate traces into graph |
| P4' Discovery | What sources inform? | **Lachesis** | `(4.0-4.4/5)` Psyche | **Query**: retrieve/traverse for discovery |
| P5' Insight | What crystallizes? | **Atropos** | `(5/0)` Sophia | **Reflect**: synthesize/cut to essential |

**Night' Pass Routing**:
- P1' (Traces) -> spawn Klotho (Assert). CF: `(0/1/2)` Eros.
- P4' (Discovery) -> spawn Lachesis (Query). CF: `(4.0-4.4/5)` Psyche.
- P5' (Insight) -> spawn Atropos (Reflect). CF: `(5/0)` Sophia.
- **CFP3 F-Thread full Night'** -> all three Moirai in parallel -> Anima aggregates.

---

## The Mobius Return Signal

**Signal**: `m_5_mobius_return` LineageEdge

**Emission**:
1. Atropos completes P5' Insight crystallization
2. Sophia (CF `(5/0)`) emits `m_5_mobius_return` edge
3. Edge connects P5' -> P0', opening the next Day cycle
4. The insight **generates new unknowns** -- the Night' does not resolve, it opens

**Handling**:
- `finishing-a-development-branch` detects Mobius return signal
- Patient (Psyche) archives to NOW.md and SEED.md
- Next `vak-evaluate` reads P0' questions as input

---

## Standard Orchestration Flow

**Input**: VAK coordinate block from `vak-evaluate`

**Process**:
1. Read CF code -> Look up agent in dispatch table
2. Read CFP -> Determine spawn method
3. Check CF + CFP combination -> Apply dispatch matrix
4. Special cases: Nous (re-evaluate), Night' (Moirai routing), F-Thread (aggregate)
5. Execute spawn
6. Return dispatch summary

**Output**:
```
ANIMA-ORCHESTRATION: [task-short-name]
Agent: [agentId]  CF: ([code])
Method: [spawn | spawnParallelChord | spawnSequentialChain]
Parameters: { task, agents[], tasks[] }
Moirai: [klotho | lachesis | atropos | none]
```

---

## Integration with Skills

| Skill | CF Alignment | When Used |
|-------|--------------|-----------|
| `brainstorming` | CPF `(00/00)`, CF `(0/1)` | Ouroboros mode, dialogical work |
| `writing-plans` | CF `(0/1)` Logos | Scope definition, structure creation |
| `test-driven-development` | CF `(0/1/2)` Eros | TDD cycles |
| `systematic-debugging` | CF `(0/1/2/3)` Mythos | Pattern recognition, debugging |
| `subagent-driven-development` | CFP2 C-Thread | Sequential phases |
| `dispatching-parallel-agents` | CFP1 P-Thread + CFP3 F-Thread | Parallel and fusion |
| `executing-plans` | CFP4 L-Thread | Long autonomous execution |
| `verification-before-completion` | Night' partial pass | P5'/P2'/P1' verification |
| `finishing-a-development-branch` | CF `(5/0)` Sophia | Mobius return |

**All VAK skills reference `vak-coordinate-frame`** for coordinate definitions.
