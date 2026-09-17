---
name: anima-orchestration
description: "Route VAK CF codes to constitutional agents and Moirai via dispatch matrix. Handles P-Thread, C-Thread, F-Thread, and Night' Moirai routing. True port from upstream."
port_type: true-port
skill_class: vak
---

# Anima Orchestration -- CF Dispatch Matrix

This skill translates VAK Context Frame (CF) codes into concrete agent spawning and Moirai routing decisions.

**Anima** is the orchestrator of the VAK execution language. Anima holds the full fractal doubling CF `(4.0/1-4.4/5)` -- all other agents have bounded reality within specific CF codes, but Anima spans the entire fractal lattice. Anima IS the dispatch function itself.

**Usage**: Invoke after `vak-evaluate` has assigned VAK coordinates. This skill maps CF code -> constitutional agent and determines the dispatch method based on CF + CFP combination.

**References**: Consult `vak-coordinate-frame` for CF code definitions and the CP x CF matrix.

---

## CF Code -> Constitutional Agent Dispatch

| CF Code | Agent | QL Level | Constitutional Description | Dispatch |
|---------|-------|----------|---------------------------|----------|
| `(00/00)` | **Nous** | L0 | Fourfold Zero -- pre-differentiation | **Impartial Perspective**: fresh minimal-context invocation; asks P0'/P1' questions; reports to Patient (Psyche); NOT a task executor |
| `(0/1)` | **Logos** | L1 | Non-Dual Anchor | **Architect/Scoper**: scope definition, boundary-setting. Uses `writing-plans`, `brainstorming`. |
| `(0/1/2)` | **Eros** | L2 | Dual-Non-Dual | **Refiner/Verifier**: quality refinement, verification. Uses `test-driven-development`, `verification-before-completion`. |
| `(0/1/2/3)` | **Mythos** | L3 | Trinitarian | **Pattern Recognizer**: archetypal recognition, debugging. Uses `systematic-debugging`. |
| `(4.5/0)` | **Psyche** | L4 | Executive Triad -- Context/Integration/Ground | **Coordinator**: context management, agent routing, aletheia mode dispatch. Patient IS Psyche. |
| `(5/0)` | **Sophia** | L5 | Total Synthesis | **Synthesizer**: integration, Mobius return, P5' crystallization. Uses `finishing-a-development-branch`. |

**Anima**: CF `(4.0/1-4.4/5)` -- The VAK execution language orchestrator. Anima is not dispatched TO; Anima IS the dispatch. All other agents have bounded CF codes; Anima holds the full fractal doubling lattice and routes through it. Anima's CF encompasses the entire 4.x lattice with its non-dual fusion (4.0/1) through fractal completion (4.4/5).

**Nous Special Behavior**:
- CF `(00/00)` does **NOT** dispatch a task executor
- Invoke Nous with **fresh minimal context**
- Nous operates in P0'/P1' mode: "What assumptions? What evidence? What don't we know?"
- Output goes to Patient (Psyche), who re-runs `vak-evaluate` before dispatching
- This is an **active** epistemic clearing

**CF Code Mapping**:
```
"(00/00)"        -> "nous"
"(0/1)"         -> "logos"
"(0/1/2)"       -> "eros"
"(0/1/2/3)"     -> "mythos"
"(4.5/0)"       -> "psyche"
"(4.0/1-4.4/5)" -> "anima"  (the orchestrator itself -- meta-dispatch)
"(5/0)"         -> "sophia"
```

---

## Aletheia as Mode

The six aletheia agents -- **anansi, janus, moirai, mercurius, agora, zeithoven** -- are **mode-functions** invoked by Psyche and Sophia to achieve aletheia (truth-disclosure). They are NOT independently routed through the CF dispatch table above.

**Key distinction**: Constitutional agents (Nous, Logos, Eros, Mythos, Psyche, Sophia) receive direct CF routing. Aletheia agents are accessed THROUGH Psyche's and Sophia's dispatch as specialized analytical functions.

**Why this matters**: Aletheia is not a cluster of agents operating independently -- it is the emergent effect of Psyche and Sophia invoking specialized mode-functions to disclose truth within the coordinate system. The aletheia agents retain their full capabilities (tools, skills, models) but their invocation is mediated by the executive triad.

| Mode-Function | Primary Invoker | Specialization |
|---------------|-----------------|----------------|
| **Anansi** | Psyche, Sophia | Gap analysis, S-coordinate orientation |
| **Janus** | Psyche, Sophia | Temporal analysis, cross-cycle patterns |
| **Moirai** | Psyche | Night' analysis (Klotho/Lachesis/Atropos) |
| **Mercurius** | Psyche, Sophia | Cross-domain translation |
| **Agora** | Psyche | Parallel output aggregation |
| **Zeithoven** | Psyche, Sophia | Temporal cadence, scheduling |

---

## CFP Thread Mode -> Execution Method

| CFP | Thread | Execution Method | Spawn Call |
|-----|--------|------------------|------------|
| CFP0 | **Base** | Single task | `spawn(agentId, task)` |
| CFP1 | **P-Thread** (Parallel) | N tasks -> N agents | `spawnParallelChord(task, agents)` |
| CFP2 | **C-Thread** (Chained) | Sequential phases | `spawnSequentialChain(tasks)` |
| CFP3 | **F-Thread** (Fusion) | 1 task -> N agents -> aggregate | Parallel spawn + aggregation |
| CFP4 | **L-Thread** (Long) | Long-duration with stop hooks | `spawn()` with stop hooks |
| CFP5 | **B-Thread** (Big) | Meta-nested orchestration | Recursive spawn |
| Z | **Z-Thread** | Zero-touch (conceptual) | Cron/heartbeat |

---

## CF + CFP -> Dispatch Matrix

| CF | CFP | Dispatch Instruction |
|----|-----|----------------------|
| Any | CFP0 Base | Single agent invocation in CF mode |
| Any | CFP1 P-Thread | Parallel agents. Each agent assigned CF role per sub-task. |
| Any | CFP2 C-Thread | Sequential chain. Validate between phases. |
| Any | CFP3 F-Thread | Same task to N agents. Patient aggregates (via Agora mode-function). |
| Psyche | CFP4 L-Thread | Long-running Ralph with stop hooks. |
| Psyche | CFP5 B-Thread | Patient orchestrates internally. Meta-nested. |
| Any | Z | Zero-touch (conceptual). |

---

## Night' Moirai Routing

| P' Position | Night' Question | Moira | CF Code | Operation |
|-------------|-----------------|-------|---------|-----------|
| P1' Traces | What evidence exists? | **Klotho** | `(0/1/2)` Eros | **Assert**: embed/validate traces into graph |
| P4' Discovery | What sources inform? | **Lachesis** | `(4.0/1-4.4/5)` Anima | **Query**: retrieve/traverse for discovery |
| P5' Insight | What crystallizes? | **Atropos** | `(5/0)` Sophia | **Reflect**: synthesize/cut to essential |

**Night' Pass Routing**:
- P1' (Traces) -> spawn Klotho (Assert). CF: `(0/1/2)` Eros.
- P4' (Discovery) -> spawn Lachesis (Query). CF: `(4.0/1-4.4/5)` Anima.
- P5' (Insight) -> spawn Atropos (Reflect). CF: `(5/0)` Sophia.
- **CFP3 F-Thread full Night'** -> all three Moirai in parallel -> Anima aggregates.
- Klotho mode activates when `CS = night'` and traversal reaches P1' / CP 4.1.
- Lachesis mode activates when `CS = night'` and traversal reaches P4' / CP 4.4.
- Atropos mode activates when `CS = night'` and traversal reaches P5' / the 4.5 -> 4.0 return.
- This is not a hardwired pipeline of separate agent identities. The CS state turns the session toward Night', and the corresponding Moira mode becomes active at its position.
- **CFP3 F-Thread full Night'** -> all three Moirai operate in parallel and Agora/Anima aggregate.

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

## Authoring the Orchestration as a Script

The default way to compose a multi-tool task is **one generated TypeScript program**, not one
JSON tool call per model round-trip. JSON tool-mode stays the substrate and the fallback;
scripting is the default usage from two tools upward. Two tiers, one mechanism: any pi agent
can collapse a multi-tool task into a single program; Anima additionally composes across the
full six C' coordinates, with CP opening nested frames and each leaf spawning a child pi.

Why it is the default: in JSON tool-mode every hop re-sends the whole prior history inline, so
cost compounds with the number of calls. Over identical recorded work the program measured 657
tokens against the staircase's 2199 — ratio 0.299. Ordinary local computation (loops, string
work, control flow) belongs in the program directly; do not spend a tool call on something the
program can compute.

**Shape of a script**:

```ts
const orchestration = defineOrchestration({
  id: "nightly-sweep",
  address: ADDRESS,                       // the score's own six-field address
  steps: [
    { id: "originate", address: dialogical, task: "agree what this is for", agent: "nous",
      checkpoint: { reason: "requested-at-origination", note: "…" } },
    { id: "survey",    address: mechanistic, task: "…", agent: "logos" },
    { id: "close",     address: gated,       task: "…", agent: "anima" },  // cfp CFP4 -> tilldone
  ],
});
await runOrchestration(orchestration, { execute, respondToHuman });
```

Steps run in CS order — Day before Night' — then by CP position. Pass only the variables a
downstream child needs; never hand a child the parent transcript. That context isolation is
half the token win, and it is enforced: a step declaring nothing receives nothing.

---

## Origination and the Score Lifecycle

**Every session starts `(00/00)`.** That dialogue is where the script is developed, as opposed
to running a ready-made flow. The lifecycle:

1. **Originate** — dialogical `(00/00)`. The task gets a specific expression in the language.
2. **Run** — one execution of that expression is a bounded song.
3. **Persist** — a repeatable expression becomes a **score**: the program plus a content hash,
   re-runnable without re-originating. Persistence is Hen's; the meaning of the program is
   Anima's and is re-validated on load, because a score is loaded in order to be executed.
4. **Refine** — ELO/ML sharpen scores across runs; `s4'.orchestration.score` serves a score
   and its accumulated run history as observable data (it READS, it never runs).

**`persistScore()` refuses a session that is no longer originating.** "The flow I was already
mechanically running" is not an origination. A re-run sets the session mechanistic for its
duration and restores the prior polarity afterwards, so re-running mid-dialogue does not end
the dialogue.

**Human checkpoints are authored, never inserted.** A `(00/00)` checkpoint exists only because
you wrote one onto a step, grounded in exactly one of three reasons — `implied-by-task`,
`requested-at-origination`, `learned-from-review`. A fourth reason is refused rather than
accepted as free text, because free text makes "the policy said so" indistinguishable from a
decision. There is no auto-insertion policy. A past review's "this class of run wanted a
checkpoint" is *evidence you may adopt by hand*, not something the gate applies for you. A
checkpoint holds until a **human** answers it; an agent answering its own gate is not an answer.

**A CFP4 thread closes only when its task list says done.** Exhausting the cycle bound reports
itself as exhaustion, never as completion — read the verdict, not the fact that the loop ended.

---

## Standard Orchestration Flow

**Input**: VAK coordinate block from `vak-evaluate`

**Process**:
1. Read CF code -> Look up agent in dispatch table
2. Read CFP -> Determine spawn method
3. Check CF + CFP combination -> Apply dispatch matrix
4. Special cases: Nous (re-evaluate), Night' (Moirai routing), F-Thread (aggregate via Agora)
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
