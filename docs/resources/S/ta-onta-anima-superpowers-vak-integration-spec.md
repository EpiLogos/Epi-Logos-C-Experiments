# TA ONTA + Anima + Superpowers Integration Specification
## The VAK Execution Language - Complete System Design

**Date:** 2026-02-19  
**Status:** Integration Specification  
**Intent:** Define the full execution language of the Epi-Logos agentic system

---

## Executive Summary

This document synthesizes the complete architecture for the TA ONTA unified plugin, integrating:
- The S4-X' Context Frame System as the VAK (typed transition calculus)
- Agent Superpowers as the discipline/validation layer
- One Context for cross-session memory tracking
- The NOW paradigm as the central nervous system
- External CLI proxy skills (Pleroma module)
- Klein topology for bidirectional agent passes

The result is a self-modulating recursive loop that can spawn copies of itself across external coding agents.

---

## 1. Source References

### 1.1 Core Sources
- **One Context Notebook**: Git-like memory for agents - branch/commit/merge for sessions
- **Agent Superpowers Plugin**: TDD + Code Review + Engineering discipline for agents
- **BMAD Framework**: Agile/Product management perspective on AI development
- **Unified Memory Architecture**: One Core, Multiple Harnesses design pattern
- **S4-X' Context Frame System**: The invocation grammar of Anima
- **TA ONTA PRD**: Unified plugin specification (6 modules in one)

### 1.2 Key Conceptual Sources
- **Richmond Alake Memory Architecture**: Memory Unit, Manager, Core, Harness
- **Klein Topology**: Bidirectional pass (Day forward + Night′ inverse)
- **Möbius Return**: Sophia → Nous, daily synthesis loop

---

## 2. The VAK Formula (S4-X' as Typed Transition Calculus)

### 2.1 The Six Coordinate Layers

| Layer | Notation | Name | Function |
|-------|----------|------|----------|
| **CPF** | S4-0' | Polarity Gate | Engaged dialogical ↔ Autonomous mechanistic |
| **CT** | S4-1' | Semantic Phase-Type | Relational / Definitional / Operational / Pattern / Contextual / Integrative |
| **CP** | S4-2' | Incubation Coordinate | Position on 4.x lattice (ground → integration) |
| **CF** | S4-3' | Archetypal Operator | Which agent/archetype speaks (Nous, Logos, Eros, etc.) |
| **CFP** | S4-4' | Nesting Algebra | How many loops, how braided, how recursive |
| **CS** | S4-5' | Path Operator | Day forward vs Night′ backward traversal |

### 2.2 Day/Night Prime (′)

The prime (′) denotes directionality:
- **Day (unprimed)**: Forward pass - agent executes task
- **Night (′)**: Inverse/reflective pass - agent reviews/validates/inverts

This is the formal hook for the **Klein double-cover** topology.

### 2.3 Context Sequences (Traversal Paths)

| CS | Name | Path | Use Case |
|----|------|------|----------|
| CS0 | Ground Direct | 0 → 5 | Immediate intuitive action |
| CS1 | Quick Ground | 4.0 ↔ 4.5 | Rapid operational assessment |
| CS2 | Ground Context Operation | 0 → 4.1 → 4.2 → 4.5 | Standard operational workflow |
| CS3 | Full Forward | 0 → 1 → 2 → 3 → 4 → 5 | Complete pass |
| **CS4** | **Full Spectrum** | **Bidirectional weaving** | **The Klein model** |
| CS5 | Möbius Return | 4.0 ↔ 4.5 → 4.5 ↔ 4.0 | Direct synthesis |

**CS4 (Full Spectrum)** is the Klein topology - forward pass (one agent) + backward pass (another agent) to cover the full manifold.

---

## 3. The Two Master Regimes

### 3.1 Ouroboros (Dialogical Mode)
- **CPF Value:** `00/00`
- **Mode:** Engaged, Socratic questioning
- **Agency:** Equal (human and agent as partners)
- **Use Case:** Planning, exploration, complex reasoning

### 3.2 Ralph (Mechanistic Mode)
- **CPF Value:** `4.0/1–4.4/5`
- **Mode:** Autonomous headless execution
- **Agency:** Agent dominant, human as validator
- **Use Case:** Task execution, PRD implementation, code generation

Both regimes have **Möbius return** built in (Sophia → Nous) with Day/Night′ directionality.

---

## 4. Agent Superpowers - Augmented for VAK

### 4.1 Current Superpowers Architecture

**Core Capabilities:**
- Strategic Planning (Brainstorming, Design Docs)
- Engineering Discipline (TDD, Systematic Debugging, Code Review)
- Workflow Automation (Git Worktrees, Subagent Dispatch)

**Problem Solved:**
Agents tend to "jump in" and write code without planning. Superpowers forces:
1. Ask questions first (Socratic)
2. Write design document
3. Break into 2-5 minute tasks
4. TDD cycle (Red-Green-Refactor)
5. Code review before completion

### 4.2 Augmentation for VAK Language

The augmentation transforms Superpowers from **coding-specific** to **task-agnostic**:

#### 4.2.1 TDD → TDD (Test-Driven Development → Test-Driven Design)

| Original | Augmented |
|---------|-----------|
| Write failing test | Define acceptance criteria (CPF/CT) |
| Write minimal code | Execute at CP coordinate |
| Refactor | Validate against CF archetype |

#### 4.2.2 Validation Gates (Generalized)

| Gate | VAK Equivalent | Function |
|------|-----------------|----------|
| **Spec Gate** | CT validation | Does task align with semantic phase? |
| **Scope Gate** | CP validation | Are we at right incubation coordinate? |
| **Agent Gate** | CF selection | Which archetype should execute? |
| **Nesting Gate** | CFP validation | Is complexity appropriate? |
| **Direction Gate** | CS/Day-Night′ | Forward pass or reflective inverse? |

#### 4.2.3 Human Validation Steps

Rather than just code review, generalize to:
- **Day Pass Validation**: Agent presents work
- **Night′ Pass Validation**: Human or second agent reviews
- **Möbius Synthesis**: Integration back to ground (Sophia → Nous)

---

## 5. NOW Paradigm - Central Nervous System

### 5.1 The Actual File Structure

The NOW paradigm is NOT about context.md/progress.md as separate files. It operates via **actual files**:

```
daily-note.md          (parent - inherits temporal/processual nature of the day)
├── now.md            (subfile - current task context)
└── now.canvas       (subfile - visual state, canvas data)
```

These files inherit the **temporal, processual nature of the day** - considered etymologically as "NOW in flow."

### 5.2 NOW File Contents

**now.md** contains:
- Current task context
- Progress tracking
- VAK coordinates (CPF, CT, CP, CF, CFP, CS)
- Session state

**now.canvas** contains:
- Visual state representation
- Agent positions on the topology

### 5.3 Obsidian Integration

The system leverages **Obsidian wikilinks** `[[]]` for:
- Temporal tracking across artifacts
- Cross-referencing between sessions
- Natural linking between related items

**Hen sync** turns these wikilinks into **Neo4j relations**, creating a graph of temporal connections.

### 5.4 NOW in the VAK Cycle

```
Bootstrap → Load daily-note.md → Load now.md → Determine CPF/CT/CP/CF → 
  Execute (Day pass) → Validate → 
    If complex → Night′ pass (reflection) → 
      Merge → Möbius Return → 
        Update now.md → Synthesize to daily-note.md → 
          Archive daily-note → SEED for tomorrow
```

---

## 6. Pleroma Module - External CLI Proxy Skills

### 6.1 The Skill Architecture

**Pleroma** = Epi-Logos skills framework for managing external coding agents

#### 6.1.1 Proxy Skills

A proxy skill simply points to an Epi-Claw skill, making skills **shared infrastructure**:

```
/skills/
├── epi-claw-native/        # Skills native to Epi-Claw
│   ├── kbase/             # Semantic search
│   ├── notebooklm/         # Research
│   ├── vercel/            # Deployment
│   └── ...
│
├── proxy/                  # Proxy skills (lightweight wrappers)
│   ├── codex/            # → epi-claw-native/kbase
│   ├── claude-code/     # → epi-claw-native/kbase
│   ├── gemini-cli/       # → epi-claw-native/nanobanana
│   └── one-context/     # → tracks memory across sessions
│
└── superpowers/          # Workflow enforcement skills
    ├── tdd/              # Test-driven design gate
    ├── code-review/      # Validation pass
    └── brainstorming/    # Socratic questioning
```

#### 6.1.2 How Proxy Skills Work

1. External CLI (Codex, Claude Code, Gemini) connects to Epi-Claw
2. Proxy skill loads the actual Epi-Claw skill logic
3. Execution happens in external CLI but follows Epi-Claw patterns
4. Results tracked in One Context for cross-session memory

### 6.2 External CLI Integration

| External CLI | Proxy Skill | Capabilities |
|-------------|-------------|--------------|
| Codex | `pleroma.codex.execute` | Code generation, file operations |
| Claude Code | `pleroma.claude.execute` | General agentic tasks |
| Gemini CLI | `pleroma.gemini.execute` | Image gen (via nanobanana), analysis |
| One Context | `pleroma.onecontext.track` | Memory tracking across systems |

### 6.3 Klein Model with External Agents

When using external CLIs:

1. **Day Pass (Forward)**: External CLI executes primary task
2. **Night′ Pass (Inverse)**: Epi-Claw validates, reflects, inverts
3. **Handoff**: Results flow back to Epi-Claw context
4. **Möbius**: Synthesis returns to Nous for next iteration

---

## 7. Anima as Top-Level Orchestrator

### 7.1 The 6 Constitutional Agents

| Agent | Level | Role | Primary Function |
|-------|-------|------|-----------------|
| **Nous** | L0 | Silent Witness | Pure observation before conceptualization |
| ** Logos** | L1 | Architect | Scope definition, structure creation |
| **Eros** | L2 | Transmuter | Verification, refinement, desire-driven action |
| **Mythos** | L3 | Pattern Seer | Archetypal recognition, symbolic mapping |
| **Psyche** | L4 | Coordinator | Context management, agent routing |
| **Sophia** | L5 | Synthesizer | Integration, Möbius return |

### 7.2 Anima in the VAK Cycle

Anima determines **which agent** (CF layer) executes based on:
- Current CPF mode (dialogical/mechanistic)
- CT phase (what kind of work)
- CP coordinate (where in the flow)
- CFP nesting (complexity level)

### 7.3 Anima + Superpowers Integration

When Anima spawns work:

1. **Task received** → Determine topology (torus/lemniscate/Klein)
2. **Select CF archetype** → Which agent handles
3. **Invoke Superpower** → TDD, validation, review as appropriate
4. **External CLI?** → Pleroma proxy skill invoked
5. **Track in One Context** → Cross-session memory
6. **Return to NOW** → Update progress, next steps

---

## 8. Complete Integration Architecture

### 8.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TA ONTA UNIFIED PLUGIN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    S4-X' CONTEXT FRAME SYSTEM                       │   │
│  │                   (The VAK Typed Transition Calculus)               │   │
│  │                                                                      │   │
│  │  CPF ──► CT ──► CP ──► CF ──► CFP ──► CS                         │   │
│  │   │                                              │                  │   │
│  │   ▼                                              ▼                  │   │
│  │  Polarity                                    Path                   │   │
│  │  (Day/Night′)                              (Klein)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AGENT SUPERPOWERS                               │   │
│  │                  (Discipline/Validation Layer)                      │   │
│  │                                                                      │   │
│  │  TDD → Validation Gates → Code Review → Human Checkpoint           │   │
│  │   │           │              │              │                       │   │
│  │   ▼           ▼              ▼              ▼                       │   │
│  │  Day Pass   CT Phase      CF Archetype   Night′ Pass              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ANIMA                                        │   │
│  │                   (Top-Level Orchestrator)                          │   │
│  │                                                                      │   │
│  │  Nous ─► Logos ─► Eros ─► Mythos ─► Psyche ─► Sophia            │   │
│  │    │                                            │                   │   │
│  │    └───────────────────◄──────────────────────┘                   │   │
│  │                    Möbius Return                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PLEROMA (Skills)                                │   │
│  │               (External CLI Proxy Skills)                          │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │   Codex    │  │Claude Code  │  │ Gemini CLI  │             │   │
│  │  │  Proxy    │  │   Proxy     │  │   Proxy    │             │   │
│  │  └─────┬──────┘  └──────┬──────┘  └──────┬──────┘             │   │
│  │        │                 │                 │                       │   │
│  │        └────────────────┼────────────────┘                       │   │
│  │                          ▼                                          │   │
│  │               ┌─────────────────────┐                              │   │
│  │               │   Superpowers      │                              │   │
│  │               │   Skills Proxy    │                              │   │
│  │               └─────────────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ONE CONTEXT                                   │   │
│  │                  (Cross-Session Memory)                          │   │
│  │                                                                      │   │
│  │  main.md ──► branch/ ──► commit.md ──► log.md                    │   │
│  │       │                                    │                       │   │
│  │       └──────────────◄────────────────────┘                       │   │
│  │                   Retrieve/Search                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        NOW PARADIGM                                 │   │
│  │                   (Central Nervous System)                          │   │
│  │                                                                      │   │
│  │  context.md + progress.md = NOW.md                                 │   │
│  │        │                         │                                   │   │
│  │        └─────────────┬─────────┘                                   │   │
│  │                      ▼                                              │   │
│  │              SEED → NOW → /Thought/ → /Bimba/ → SEED            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Execution Flow Example

**Task:** "Build a website for my AI product"

```
1. BOOTSTRAP
   - Load SEED.md (yesterday's synthesis)
   - Initialize CPF mode → Mechanistic (Ralph)
   
2. NOW UPDATE
   - Create/Update now.md (subfile of daily-note.md)
   - Set CT = operational (building)
   - Set CP = 4.0 (ground of operation)
   - Set CF = Logos (architect)
   - Use wikilinks [[]] for temporal tracking
   
3. SUPERPOWER INVOCATION
   - Task too complex → Invoke TDD gate
   - Write acceptance criteria (CT validation)
   
4. ANIMA ORCHESTRATION
   - CF = Logos decides approach
   - Spawns sub-agent (or external CLI via Pleroma)
   
5. EXTERNAL CLI (if needed)
   - Pleroma.proxy.codex.execute(task)
   - One Context tracks: branch/create, commit/milestone
   
6. DAY PASS
   - Agent executes work
   - Progress updated in NOW.md
   
7. VALIDATION (Superpower)
   - Code review pass
   - Check against CT phase
   
8. NIGHT′ PASS (if complex)
   - Second agent or human reviews
   - Reflection/inversion
   
9. MÖBIUS RETURN
   - Sophia synthesizes work
   - Updates /Bimba/Forms/
   - Returns to Nous (L0)
   
10. SEED PREPARATION
    - Extract learnings → SEED.md for tomorrow
    - One Context commit/milestone
```

---

## 9. Key Integration Points

### 9.1 Superpowers → S4-X' Mapping

| Superpower | S4-X' Layer | Function |
|------------|-------------|----------|
| Brainstorming | CT (phase-type) | Determine what kind of work |
| Planning | CP (coordinate) | Where on the lattice |
| TDD | CFP (nesting) | Test validates complexity |
| Code Review | CS (path) | Day pass validates forward |
| Subagent Dispatch | CF (archetype) | Which agent executes |
| Human Checkpoint | CPF (polarity) | Switch to dialogical |

### 9.2 Pleroma → One Context

When external CLI executes:
1. One Context creates branch: `feature/website-{timestamp}`
2. Progress commits: `commit.md` with milestones
3. Night′ validation → merge back to main
4. Retrieve searches across all branches for context

### 9.3 NOW as Bridge

NOW (now.md + now.canvas as subfiles of daily-note.md, inheriting temporal flow) connects:
- **Superpowers** (workflow) → **Anima** (orchestration)
- **Anima** (agents) → **Pleroma** (external execution)
- **Pleroma** (results) → **One Context** (memory)
- **One Context** (history) → **NOW** (current context in daily-note flow)

---

## 10. Task Specification: VAK Language Implementation

### 10.1 Objective
Modify Agent Superpowers to run the S4-X' VAK language, making it task-agnostic (not just coding) with proper gates and human validation checkpoints.

### 10.2 Deliverables

1. **VAK-Gated Superpowers**
   - TDD becomes TD (Test-Driven) with VAK validation gates
   - Code review becomes Validation Pass (Day/Night′)
   - Generalize from coding to any complex task

2. **NOW Integration**
   - NOW.md as the task tracker
   - Automatic VAK coordinate inference from task description
   - Progress tracking in progress.md section

3. **Pleroma External Skills**
   - Proxy skill definitions for Codex, Claude Code, Gemini
   - One Context integration for cross-CLI memory

4. **Anima Module Updates**
   - CF archetype selection based on VAK coordinates
   - Klein model (bidirectional pass) implementation

### 10.3 Integration into TA ONTA

| Module | Updates Required |
|--------|-----------------|
| **Khora** | now.md (subfile of daily-note.md) format includes VAK coordinates |
| **Hen** | Graph stores VAK state transitions |
| **Pleroma** | External CLI proxy skills |
| **Chronos** | VAK-aware scheduling |
| **Aletheia** | Extraction includes VAK metadata |
| **Anima** | CF selection uses VAK, implements Klein |

---

## 11. The Vision - Self-Spawning System

The ultimate vision is a system that can:

1. **Spawn copies of itself** across external coding agents (Codex, Claude Code, Gemini)
2. **Maintain context** across these spawned instances via One Context
3. **Validate work** through Superpowers-augmented gates
4. **Return synthesis** through Anima's Möbius loop
5. **Learn and seed** for tomorrow through the daily cycle

This is **toroidal recursion**: the system runs, spawns variants, validates, returns synthesis, and seeds the next iteration - all while maintaining coherent memory through NOW and One Context.

---

## 12. References

1. **One Context**: Git-like memory for agents (branch/commit/merge)
2. **Agent Superpowers**: Engineering discipline for AI coding agents
3. **BMAD**: Agile methodology for AI-driven development
4. **Richmond Alake Memory Architecture**: Memory Unit → Manager → Core → Harness
5. **S4-X' Context Frames**: CPF, CT, CP, CF, CFP, CS as typed transition calculus
6. **TA ONTA PRD**: Unified 6-module plugin specification
7. **Context Frame Types**: Topology (shapes) + Context Frames (typed moves)
8. **Klein Topology**: Bidirectional pass (Day forward + Night′ inverse)

---

**Document Version:** 1.0  
**Synthesis Date:** 2026-02-19  
**Status:** Ready for Implementation Planning
