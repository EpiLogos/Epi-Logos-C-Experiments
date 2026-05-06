# Anima Contract — Agent Orchestration & Meta-Dispatch

**Extension class:** S4-4' within ta-onta
**S-Layer fold:** S4 (Agent — Lemniscate self-fold, where the agent system manages agents)
**Position:** #4 (Nara — context, type, lemniscate, personal dialogical)

---

## Architecture Layer Model

Three distinct layers in the PI agent system — all other extensions follow this model:

| Layer | Mechanism | Portability | Responsibility |
|-------|-----------|-------------|----------------|
| **Extension** | TypeScript (`extension.ts`) | PI-native | Registers raw tools via `pi.registerTool()` — first-class, always available regardless of agent context |
| **Skills** | `SKILL.md` markdown | Portable (any agent runtime) | Gate and contextualise tool use — the "how/when" wrapper that gives subagents structured access to raw tool capabilities |
| **Subagents** | PI-native agent definitions | PI-native | System prompt + declared tool access + skill references. Dispatched by agent-team / agent-chain / subagent-widget |

Raw tools are always available at the extension level. Skills shape and constrain tool invocation for specific workflows. Subagents are the agents that USE skills (and through them, tools) to accomplish work.

---

## Responsibility

Anima is the **orchestration centre** — the lemniscate self-fold where the agent system manages itself. It owns VAK evaluation (task → 6-layer coordinate assignment), CF dispatch (CF code → constitutional agent routing), thread-type execution (CFP0-CFP5 via agent-team/chain/subagent primitives), and CS-phase management (Klein mode, Ouroboros, day/night configuration). All agent dispatch in the ta-onta system routes through Anima. No other extension spawns agents directly.

**What Anima does NOT own:** vault writes (Khora), content structure (Hen), temporal scheduling (Chronos), knowledge crystallisation/retrieval tooling (Aletheia). Anima dispatches TO Aletheia's specialist subagents — it does not define them.

---

## PI Hook Seams

| Hook | Purpose |
|------|---------|
| `before_agent_start` | Evaluate VAK for incoming task; assign CF code |
| `after_tool_call` | Check if Sophia post-execution review is needed |
| `session_end` | Trigger Sophia review + thought routing to `thoughts/` |

---

## Registered Tools

| Tool | Purpose |
|------|---------|
| `vak_evaluate` | Assign 6-layer VAK coordinates (CPF/CT/CP/CF/CFP/CS) to a task |
| `anima_orchestrate` | CF code → constitutional agent routing decision |
| `dispatch_agent` | Spawn agent from team grid (agent-team.ts) |
| `run_chain` | Execute sequential agent pipeline (agent-chain.ts) |
| `subagent_create` | Spawn background subagent (subagent-widget.ts) |
| `subagent_continue` | Resume background subagent |
| `subagent_list` | List active background subagents |
| `subagent_remove` | Terminate and clean up subagent |

---

## CLI Bridge

```
epi agent vak evaluate <TASK>        — VAK coordinate assignment
epi agent dispatch <CF> <TASK>       — CF code → agent routing
epi agent team list                  — Show constitutional agent roster
epi agent team dispatch              — Dispatch agent team
epi agent team grid                  — Multi-agent grid status
epi agent chain list                 — Show available agent chains
epi agent chain run <CHAIN> <TASK>   — Execute sequential pipeline
epi agent spawn / attach / run / chat  — Existing subagent commands
```

---

## VAK Evaluation — 6-Layer Coordinate Assignment

For every task entering the system, Anima assigns:

| Layer | Coordinate | Purpose |
|-------|-----------|---------|
| CPF | Category-Position-Frame | What ontological type is this task? |
| CT | Context-Time | What temporal frame governs this? |
| CP | Context-Position | Where in the semantic space does this land? |
| CF | Context-Frame | Which context frame governs execution? |
| CFP | Context-Frame-Position | What thread type to execute? |
| CS | Context-System | What system-wide state is relevant? |

CF code → constitutional agent mapping:

| CF Code | Agent | Role |
|---------|-------|------|
| `(0/1)` | Logos | Binary/formal reasoning |
| `(0/1/2)` | Eros | Dialectical synthesis |
| `(0/1/2/3)` | Mythos | Narrative/pattern work |
| `(4.0/1-4.4/5)` | Psyche | Session subject — undergoes the task |
| `(4.5/0)` | Psyche | Executive triad (confirmed CF code) |
| `(5/0)` | Sophia | Möbius review, crystallisation |
| `(00/00)` | Nous | Pre-categorical clearing, dis-closure preparation |

---

## CFP Thread Types → pi-vs-claude-code Primitives

| CFP | Thread Type | Primitive | Description |
|-----|------------|-----------|-------------|
| CFP0 | Base Thread | — | Direct single-agent execution |
| CFP1 | P-Thread | `agent-team.ts` | Parallel multi-agent dispatch grid |
| CFP2 | C-Thread | `agent-chain.ts` | Sequential pipeline (A → B → C) |
| CFP3 | F-Thread | `agent-team.ts` fusion mode | Same task → N agents → aggregate |
| CFP4 | L-Thread | `subagent-widget.ts` | Background subagent with stop hooks |
| CFP5 | B-Thread | meta-nested | Anima orchestrating subagent-widget |

---

## Constitutional Agents (live in Anima's plugin)

Located at: `anima/S4'/agents/`

| Agent | CF Code | Role |
|-------|---------|------|
| **Psyche** | (4.5/0) | The session subject — undergoes the task; bridges Anima dispatch and Aletheia mode-functions |
| **Sophia** | (5/0) | Post-execution reviewer; distills learnings; classifies `thinking/` → `thoughts/` |
| **Nous** | (00/00) | Dis-closure preparation; prepares RAG context packages from Gnosis for task agents |
| **Eros** | (0/1/2) | Dialectical synthesis; Night' Klotho mode |
| **Logos** | (0/1) | Formal reasoning, binary clarity |
| **Mythos** | (0/1/2/3) | Narrative, pattern, archetypal work |
| **Techne** | — | Craft-level execution helper |

---

## pi-vs-claude-code Primitives (all three live here)

| File | Purpose |
|------|---------|
| `S4/agent-team.ts` | Team dispatch grid with live status widgets (740 LOC) |
| `S4/agent-chain.ts` | Sequential pipeline orchestrator (804 LOC) |
| `S4/subagent-widget.ts` | Background subagent spawning and continuation (482 LOC) |

These become the execution substrate for CFP1-CFP5 thread types.

---

## CS Runtime Phases — Day and Night'

Day/Night' is a **CS (Context-System) runtime configuration**, not a hardwired agent mode. CS encodes what phase the system is currently in; Anima reads CS and shapes dispatch accordingly.

**Day phase (CS = active session):**
- VAK evaluation → CF dispatch → agent execution → Sophia review
- Sophia classifies `thinking/` → `thoughts/` on task completion

**Night' phase (CS = post-session crystallisation — triggered by evening cron or Klein mode):**
- Anima routes to Aletheia's Moirai subagents for sequential distillation pass
- Moirai's three operational modes run in sequence: Assert (Klotho) → Query (Lachesis) → Reflect (Atropos)
- These are NOT separate agent identities — they are Moirai's operational modes activated when CS = night'
- Klein mode: Day + Night' self-review pass (after major task completion or manual trigger)
- Ouroboros: worktrunk + ralph + surgeon-patient incubation loop

**Moirai are GraphRAG specialists** (defined in Aletheia's plugin). CS phase determines when their distillation sequence runs. Their tooling (graph traversal, semantic cache, crystallisation) is available in any context — night' phase is simply when full sequential pass is warranted.

---

## Key Invariants

1. ALL agent dispatch routes through Anima — no extension spawns agents directly
2. Anima IS the dispatch function — CF (4.0/1-4.4/5) is Anima's own context frame
3. Constitutional agents live in `anima/S4'/agents/` — not in Pleroma, not in Aletheia
4. Aletheia subagents (Moirai, Anansi, etc.) live in Aletheia's plugin — dispatched BY Anima when CS/CF routes there
5. Day/Night' is a CS runtime phase, not an agent identity — Moirai are GraphRAG specialists available in any CS state
6. Sophia ALWAYS runs post-execution: classifies `thinking/` → `thoughts/`
7. Psyche is the session subject — she is the agent who undergoes, not the orchestrator
8. Nous prepares dis-closure (RAG context) before task execution — never routes tasks
9. Skills gate tool use for subagents — raw tools are registered at the extension level and are always available; skills contextualise how subagents invoke them

---

## Dependencies

**Receives from:**
- Khora: session identity, `khora_write` primitive
- Hen: template invocation for task-spec + pattern-note artifacts
- Pleroma: bounded primitive surfaces (tmux, cmux, worktrunk, etc.) for CFP execution
- Chronos: Day lifecycle events, session temporal boundaries

**Provides to:**
- Aletheia: Night' analysis triggers (Möbius pass start); `thoughts/` routing signal
- All task execution: VAK coordinates, CF codes, agent assignments
- Pleroma: orchestration dispatch decisions (which primitive to invoke)

---

## Phase Priorities

| Phase | Deliverable |
|-------|------------|
| P0 | `vak_evaluate` — 6-layer VAK coordinate assignment for tasks |
| P0 | `anima_orchestrate` — CF code → constitutional agent routing |
| P0 | Constitutional agent .md files placed in `anima/S4'/agents/` |
| P1 | CFP1 P-Thread: `agent-team.ts` port + `dispatch_agent` tool |
| P1 | CFP2 C-Thread: `agent-chain.ts` port + `run_chain` tool |
| P1 | Sophia post-execution review: `thinking/` → `thoughts/` classification |
| P1 | CFP4 L-Thread: `subagent-widget.ts` port + subagent lifecycle tools |
| P2 | Klein mode (Day + Night' self-review) |
| P2 | Ouroboros incubation loop |
| P3 | CFP3 F-Thread (fusion mode), CFP5 B-Thread (meta-nested) |
