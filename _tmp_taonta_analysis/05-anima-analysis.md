# Ta-Onta Anima (#4) Extension Analysis

**Date:** 2026-03-10
**Analyst:** Claude Opus 4.6
**Extension:** Anima (S4-4') -- Agent Orchestration & Meta-Dispatch
**Position:** #4 Lemniscate Self-Fold -- the agent system managing agents

---

## Sources Consulted

| Source | Location | Status |
|--------|----------|--------|
| VAK-HANDOVER.md | ARCHIVE-2026-02-25-taonta-install/ | Read in full |
| VAK-SUPERPOWERS-INTEGRATION-SPEC.md | ARCHIVE-2026-02-25-taonta-install/ | Read (first 500 lines) |
| ta-onta-anima-superpowers-vak-integration-spec.md | ARCHIVE-2026-02-25-taonta-install/ | Read (first 300 lines) |
| ORCHESTRATOR-SPEC.md | ARCHIVE-2026-02-25-taonta-install/ | Read in full |
| OUROBOROS_DEV_SPEC.md | ARCHIVE-2026-02-25-taonta-install/ | Read in full |
| OUROBOROS_PRD_TEST.md | ARCHIVE-2026-02-25-taonta-install/ | Read in full |
| S4-EXTENSION-ARCHITECTURE.md | docs/specs/S/S4/ | Read in full |
| S4-TA-ONTA-EXTENSION-SPEC.md | docs/specs/S/S4/ | Read in full |
| S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md | docs/specs/S/S4/ | Read in full |
| S4-S4i-PI-AGENT.md | docs/specs/S/ | Read (first 150 lines) |
| Constitutional agents (7 .md files) | git HEAD:plugins/pleroma/agents/constitutional/ | Read in full |
| epi-cli/src/agent/mod.rs | epi-cli/src/agent/ | Read (first 100 lines) |
| epi-cli/src/agent/subagents.rs | epi-cli/src/agent/ | Read (first 100 lines) |
| epi-cli/src/agent/skills.rs | epi-cli/src/agent/ | Read (first 100 lines) |
| 6 staging orchestration skills | _staging/pleroma-skills/orchestration/ | Read in full |
| S4 primitive stubs (4 .ts files) | .pi/extensions/ta-onta/anima/S4/ | Read in full |

---

## A. Functional Requirements (FRs)

### A.1 VAK Evaluation Pipeline

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-001** | Implement 6-step VAK evaluation pipeline (CPF -> CT -> CP -> CF -> CFP -> CS) that assigns typed transition coordinates to any incoming task | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1-1.8; vak-evaluate SKILL.md | S4-EXTENSION-ARCHITECTURE SS III (S4-4') lists `vak_evaluate` as registered tool | P0 -- Core |
| **FR-A-002** | Support contextual adaptation: silent inference for clear tasks, explicit deliberation for ambiguous ones | VAK-SUPERPOWERS-INTEGRATION-SPEC SS4.2; vak-evaluate SKILL.md | Described in skill but no Rust implementation yet | P0 -- Core |
| **FR-A-003** | CPF=(00/00) handoff to brainstorming (Ouroboros mode) -- stop VAK eval and enter dialogical mode | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.3; VAK-HANDOVER SS2.2 | Skill definition exists; no Rust routing | P1 |
| **FR-A-004** | Partial coordinate support -- evaluate only missing layers when coordinates partially pre-set | vak-evaluate SKILL.md preamble | Not in any spec; skill-only | P2 |
| **FR-A-005** | Standard VAK output format: `VAK: [name] / CPF: ... CT: ... CP: ... CF: ... CFP: ... CS: ...` | VAK-SUPERPOWERS-INTEGRATION-SPEC SS4.2; all VAK skills | Consistent across all skill definitions | P1 |

### A.2 Constitutional Agent Dispatch

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-010** | CF code -> constitutional agent routing table: (0000)->Nous, (0/1)->Logos, (0/1/2)->Eros, (0/1/2/3)->Mythos, (4.5/0)->Psyche, (4.0/1-4.4/5)->Anima, (5/0)->Sophia | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.6; anima-orchestration SKILL.md | S4-EXTENSION-ARCHITECTURE SS III; TA-ONTA-EXTENSION-SPEC SS IV | P0 -- Core |
| **FR-A-011** | Nous special behaviour: CF (0000) invokes fresh minimal-context agent, reports to Psyche, triggers re-evaluation via vak-evaluate | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.6 Nous note; nous.md agent def | anima-orchestration SKILL.md SS "Nous Special Behavior" | P0 -- Core |
| **FR-A-012** | Anima as meta-dispatch: CF (4.0/1-4.4/5) is the orchestrator itself, not dispatched to | S4-EXTENSION-ARCHITECTURE SS III; anima-orchestration SKILL.md | Consistent across all sources | P0 -- Core |
| **FR-A-013** | `anima_orchestrate` registered tool: takes VAK coordinates, returns dispatch decision | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P0 -- Core |
| **FR-A-014** | `dispatch_agent` registered tool: spawn agent from team | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P1 |

### A.3 Thread Type Execution

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-020** | CFP0 Base: single task, single agent, direct execution | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7 | anima-orchestration SKILL.md CFP table | P0 -- Core |
| **FR-A-021** | CFP1 P-Thread: N different tasks dispatched to N agents simultaneously via `agent-team.ts` parallel dispatch | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7; S4-EXTENSION-ARCHITECTURE SS III | anima-orchestration SKILL.md; TS primitive is stub (63 bytes) | P1 |
| **FR-A-022** | CFP2 C-Thread: sequential multi-phase execution with validation gates via `agent-chain.ts` | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7; S4-EXTENSION-ARCHITECTURE SS III | anima-orchestration SKILL.md; TS primitive is stub (65 bytes) | P1 |
| **FR-A-023** | CFP3 F-Thread: same task -> N agents -> aggregate best via `agent-team.ts` fusion mode | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7 (critical P-vs-F distinction) | anima-orchestration SKILL.md; TS primitive is stub | P1 |
| **FR-A-024** | CFP4 L-Thread: long-duration autonomous execution with stop hooks via `subagent-widget.ts` | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7; S4-EXTENSION-ARCHITECTURE SS III | TS primitive is stub (73 bytes) | P2 |
| **FR-A-025** | CFP5 B-Thread: meta-nested (Anima orchestrating subagent-widget internally) | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7 | Conceptual; no implementation detail | P3 |
| **FR-A-026** | Z-Thread: zero-touch (conceptual -- cron/heartbeat/chained automation) | VAK-SUPERPOWERS-INTEGRATION-SPEC SS1.7 | Explicitly marked "conceptual for current implementation" | P4 -- Deferred |

### A.4 Subagent Lifecycle

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-030** | `subagent_create` registered tool: spawn background subagent | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P1 |
| **FR-A-031** | `subagent_continue` registered tool: resume subagent interaction | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P1 |
| **FR-A-032** | `subagent_remove` registered tool: terminate subagent | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P1 |
| **FR-A-033** | `subagent_list` registered tool: enumerate active subagents | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P1 |
| **FR-A-034** | Subagent spawning respects Claude-compatible frontmatter: name, description, tools, disallowedTools, model, permissionMode, skills, hooks | S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM SS "Subagent Contract" | subagents.rs already parses this frontmatter | P0 -- Core |

### A.5 Agent Team & Chain Management

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-040** | `run_chain` registered tool: execute sequential pipeline | S4-EXTENSION-ARCHITECTURE SS III | Listed as registered tool | P1 |
| **FR-A-041** | Agent team dispatch grid with live status | S4-EXTENSION-ARCHITECTURE SS III; agent-team.ts upstream (740 LOC) | Current stub: 63 bytes | P2 |
| **FR-A-042** | Agent chain sequential pipeline orchestrator | S4-EXTENSION-ARCHITECTURE SS III; agent-chain.ts upstream (804 LOC) | Current stub: 65 bytes | P2 |
| **FR-A-043** | CF + CFP combination dispatch matrix (detailed in anima-orchestration SKILL.md) | anima-orchestration SKILL.md SS "CF + CFP -> Dispatch Matrix" | Spec complete; no implementation | P1 |

### A.6 Session & Orchestration Topology

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-050** | Session propagation spine: idempotent session -> Day -> NOW -> persistence flow | S4-EXTENSION-ARCHITECTURE SS III | Mentioned but not detailed | P1 |
| **FR-A-051** | Klein mode: Day + Night' self-review as single topological surface producing refinement telemetry | klein-mode SKILL.md (staging) | Skill exists with full JSON telemetry spec | P2 |
| **FR-A-052** | Ouroboros incubation: worktrunk + ralph + surgeon-patient relation | ouroboros SKILL.md (staging); OUROBOROS_DEV_SPEC.md | Skill exists with full mechanism spec; techne-* hooks defined | P2 |
| **FR-A-053** | Day/Night' pass: full torus topology traversal with Mobius return | day-night-pass SKILL.md (staging); VAK-SUPERPOWERS-INTEGRATION-SPEC SS2, SS4.4 | Skill exists with complete P0'-P5' mapping | P1 |
| **FR-A-054** | Mobius return signal: P5' Insight -> P0' Questions cycle, `m_5_mobius_return` LineageEdge | sophia.md; anima-orchestration SKILL.md SS "Mobius Return Signal" | Defined in agent def + skill | P1 |

### A.7 Two-Hemisphere Orchestration

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-060** | Left Hemisphere (Anima): VAK evaluation, agent dispatch, team/chain/subagent management | TA-ONTA-EXTENSION-SPEC SS IV | Full orchestration flow diagram in spec | P0 -- Core |
| **FR-A-061** | Right Hemisphere (Nous): governs Aletheia subagents for dis-closure mode assignment per agent | TA-ONTA-EXTENSION-SPEC SS IV | Detailed flow with 6 Aletheia instruments | P1 |
| **FR-A-062** | Per-agent dis-closure packages: germane + necessary context from Gnosis/S0'/S1'/S2' | TA-ONTA-EXTENSION-SPEC SS IV "Dis-closure Modes" table | Detailed per-agent mapping | P2 |
| **FR-A-063** | Collapsible state machine: S0/S1/S2 method superposition collapses by CF per agent needs | TA-ONTA-EXTENSION-SPEC SS IV "Collapsible State Machine" | Detailed CF -> collapse mapping | P3 |
| **FR-A-064** | Psyche as contextual centre: the "subject" who undergoes the task, holds unified narrative | TA-ONTA-EXTENSION-SPEC SS IV; psyche.md | Consistent across all sources | P0 -- Core |
| **FR-A-065** | Sophia as post-execution reviewer with Aletheia access: reviews across philosophical, technical, structural, processual levels | TA-ONTA-EXTENSION-SPEC SS IV; sophia.md | Detailed baking targets (Gnosis, QV overlay, Vimarsa, SEED.md) | P1 |

### A.8 Skill & Hook Infrastructure

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-070** | SKILL.md filesystem skill format with YAML frontmatter | S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM | skills.rs implements parsing | P0 -- Done |
| **FR-A-071** | Skill registry with plugin namespacing | S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM | skills.rs `discover_under()` works | P0 -- Done |
| **FR-A-072** | Subagent markdown format with frontmatter | S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM | subagents.rs implements parsing | P0 -- Done |
| **FR-A-073** | Hook system with Claude-compatible event names (PreToolUse, PostToolUse, Stop, SubagentStop, etc.) | S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM SS "Hook System" | hooks.rs exists (not fully read) | P1 |
| **FR-A-074** | Evaluation harness: `epi agent skills eval --suite <file>` with transcripts, rubrics, model matrix | S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM SS "Skill Evaluation Runs" | Planned Phase 4; not implemented | P2 |
| **FR-A-075** | SkillEntitlement per-agent `allow` arrays (which agents can use which skills) | VAK-HANDOVER SS3.3; VAK-SUPERPOWERS-INTEGRATION-SPEC SS P0.3 | buildAgentRegistry() in runtime.ts (upstream, not ported) | P1 |

### A.9 ANIMA.md Identity System

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-A-080** | Per-agent identity files with 5 H2 sections: Ontology, Frame Contract, Temporal, Capability, Secret Heart | VAK-HANDOVER SS7 "ANIMA.md System" | Not yet created; agent .md files use a different format | P2 |
| **FR-A-081** | Rupa (injectable persona, variable, use-case-specific) as primary injection point | VAK-HANDOVER SS7 "ANIMA.md System" | Conceptual; no implementation | P3 |
| **FR-A-082** | Sattva (primordial ground, immutable) replacing "Secret Heart" | VAK-HANDOVER SS7 "ANIMA.md System" | Conceptual; not in current agent defs | P3 |
| **FR-A-083** | Agent-to-Vak-level mapping: Nous->Para Vak, Logos->Madhyama-as-nomos, Eros->Madhyama-as-chreia, etc. | VAK-HANDOVER SS7 "ANIMA.md System" | Documented in handover; not in specs | P3 |
| **FR-A-084** | Pathology guard per agent (what it must not collapse into) | VAK-HANDOVER SS7 "ANIMA.md System" | Mentioned; no specific guards defined | P3 |

---

## B. User Stories (USs)

### US-A-001: VAK Evaluation for Incoming Task
**As** an agent runtime,
**I want** to evaluate any incoming task through the 6-step VAK pipeline (CPF/CT/CP/CF/CFP/CS),
**So that** the system knows which agent handles it, what thread type to use, and which traversal path to follow.

**Acceptance Criteria:**
- [ ] Given a well-defined task, the system silently infers all 6 coordinate layers and produces a standard VAK output block
- [ ] Given an ambiguous task, the system engages the user in explicit deliberation for ambiguous layers
- [ ] Given CPF=(00/00), the system hands off to brainstorming mode instead of proceeding autonomously
- [ ] Given partial pre-set coordinates, only missing layers are evaluated
- [ ] Output follows the standard format: `VAK: [name] / CPF: ... CT: ... CP: ... CF: ... CFP: ... CS: ...`

### US-A-002: CF Code Dispatch
**As** the Anima orchestrator,
**I want** to route a CF code to the correct constitutional agent with the correct dispatch method,
**So that** each task is handled by the ontologically appropriate agent.

**Acceptance Criteria:**
- [ ] CF (0000) routes to Nous with fresh minimal context (NOT as task executor)
- [ ] CF (0/1) routes to Logos for architecture/scoping
- [ ] CF (0/1/2) routes to Eros for refinement/verification
- [ ] CF (0/1/2/3) routes to Mythos for pattern recognition
- [ ] CF (4.5/0) routes to Psyche as coordinator (Patient IS Psyche)
- [ ] CF (5/0) routes to Sophia for synthesis/Mobius return
- [ ] CF (4.0/1-4.4/5) is recognized as Anima itself (meta-dispatch)
- [ ] Nous output triggers re-evaluation before actual dispatch

### US-A-003: Thread Type Execution
**As** the Anima orchestrator,
**I want** to execute the correct thread type (CFP0-CFP5) for each dispatched task,
**So that** execution topology matches task complexity.

**Acceptance Criteria:**
- [ ] CFP0: Single agent invocation completes task
- [ ] CFP1: N agents execute N different tasks in parallel, results collected
- [ ] CFP2: Sequential phases execute with validation between each phase
- [ ] CFP3: Same task sent to N agents, best result aggregated (distinct from CFP1)
- [ ] CFP4: Long-duration execution with stop hooks for self-validation
- [ ] CFP5: Meta-nested dispatch where primary agent internally orchestrates sub-agents

### US-A-004: Subagent Lifecycle Management
**As** an agent operator,
**I want** to create, continue, list, and remove subagents,
**So that** I can manage the agent population during orchestration runs.

**Acceptance Criteria:**
- [ ] `subagent_create` spawns a new subagent with the correct tools, skills, and model from frontmatter
- [ ] `subagent_continue` resumes interaction with an existing subagent
- [ ] `subagent_list` returns all active subagents with their state
- [ ] `subagent_remove` cleanly terminates a subagent and collects results
- [ ] Subagents do not inherit parent skills automatically
- [ ] Subagents can have their own hooks

### US-A-005: Day/Night' Pass Execution
**As** the orchestration system,
**I want** to execute a full Day+Night' torus topology traversal,
**So that** tasks receive both synthesis (forward) and analysis (backward) treatment.

**Acceptance Criteria:**
- [ ] Day pass traverses 4.0->4.1->4.2->4.3->4.4->4.5 with Day questions at each position
- [ ] Night' pass traverses 4.5->4.4->4.3->4.2->4.1->4.0 with P' questions (genuinely different from Day)
- [ ] Night' pass routes P1' to Klotho (Assert), P4' to Lachesis (Query), P5' to Atropos (Reflect)
- [ ] Mobius return: P5' Insight generates P0' Questions that seed the next vak-evaluate
- [ ] P2' Challenges gate: if challenges identified, return to Patient before Mobius return
- [ ] CFP3 F-Thread Night' runs all three Moirai in parallel

### US-A-006: Klein Mode Self-Review
**As** the orchestration system,
**I want** to run Klein mode (Day + Night' self-review) producing structured refinement telemetry,
**So that** the system can learn from its own execution patterns.

**Acceptance Criteria:**
- [ ] Day pass executes normally and its trace is captured
- [ ] Night' pass receives the Day execution trace as input and evaluates it
- [ ] Output is structured JSON telemetry with skill_effectiveness, tool_adjustments, pattern_observations, antipatterns, suggested_refinements
- [ ] Klein mode is analytical -- it does not modify system state
- [ ] One inversion level only (Night' reviews Day, not itself)

### US-A-007: Ouroboros Incubation
**As** the orchestration system,
**I want** to spawn an isolated external coding agent into a worktrunk worktree with surgeon-patient relation,
**So that** the system can delegate self-modification to a fresh-context agent.

**Acceptance Criteria:**
- [ ] External agent spawns via `techne-spawn` into isolated git worktree
- [ ] Parent agent (Patient) provides context but does not modify files directly
- [ ] External agent (Surgeon) produces commits within the worktree
- [ ] `techne-relay` provides structured parent-child communication
- [ ] `preflight-validate.sh` runs before spawn; `postflight-verify.sh` runs after close
- [ ] Ralph bead progression is deterministic
- [ ] Worktree cleanup is mandatory on close (success or failure)

### US-A-008: Two-Hemisphere Orchestration Flow
**As** the agent runtime,
**I want** Anima (execution) and Nous (dis-closure) to collaborate on task dispatch,
**So that** each executing agent receives both its dispatch assignment and its knowledge context.

**Acceptance Criteria:**
- [ ] Anima evaluates VAK coordinates and selects agents
- [ ] Anima calls Nous for dis-closure mode assignment
- [ ] Nous consults Aletheia subagents (Anansi, Mercurius, Janus, Moirai, Agora, Zeithoven) as needed
- [ ] Nous returns per-agent dis-closure packages
- [ ] Psyche undergoes the task as contextual subject, holding the unified narrative
- [ ] Sophia reviews post-execution with Aletheia access, baking learnings into Gnosis, QV overlay, Vimarsa, and SEED.md

### US-A-009: Agent Team Parallel Dispatch
**As** the orchestration system,
**I want** to dispatch N agents in parallel with a dispatch grid and live status tracking,
**So that** P-Thread and F-Thread execution types are supported.

**Acceptance Criteria:**
- [ ] P-Thread: each agent receives a different task, all execute simultaneously
- [ ] F-Thread: all agents receive the same task, results aggregated via Agora mode-function
- [ ] Status grid shows per-agent progress in real time
- [ ] Results collected and returned to Patient (Psyche) for integration

### US-A-010: Agent Chain Sequential Pipeline
**As** the orchestration system,
**I want** to execute a sequential chain of agents with validation gates between phases,
**So that** C-Thread execution is supported.

**Acceptance Criteria:**
- [ ] Phase N output is validated before Phase N+1 begins
- [ ] Patient (Psyche) reviews between phases (or validation is automated via hooks)
- [ ] Chain can be halted at any validation gate
- [ ] Each phase's output becomes input to the next phase

---

## C. S-Level Inventory (S4 Raw Primitives)

### C.1 What Exists

| Component | Location | LOC | Status |
|-----------|----------|-----|--------|
| `agent/mod.rs` | `epi-cli/src/agent/mod.rs` | ~200+ | **Working** -- AgentCmd enum with Plugin, Plugins, Skill, Subagent, Hooks, Install, Doctor, Extensions, Agents, Models, Auth, Spawn, Attach, Run subcommands |
| `agent/skills.rs` | `epi-cli/src/agent/skills.rs` | ~130+ | **Working** -- SkillDefinition, SkillValidationReport, parse_skill(), discover_under() |
| `agent/subagents.rs` | `epi-cli/src/agent/subagents.rs` | ~130+ | **Working** -- SubagentDefinition, SubagentValidationReport, parse_subagent(), discover_under() |
| `agent/plugins.rs` | `epi-cli/src/agent/plugins.rs` | unknown | **Exists** -- plugin discovery and management |
| `agent/hooks.rs` | `epi-cli/src/agent/hooks.rs` | unknown | **Exists** -- hook runner |
| `agent/capabilities.rs` | `epi-cli/src/agent/capabilities.rs` | unknown | **Exists** -- CapabilityRegistry |
| `agent/spawn.rs` | `epi-cli/src/agent/spawn.rs` | unknown | **Exists** -- managed PI launch |
| `agent/agent_dirs.rs` | `epi-cli/src/agent/agent_dirs.rs` | unknown | **Exists** -- AgentLayout |

### C.2 PI Extension Primitives (Upstream -- NOT Ported)

| Primitive | Upstream Source | Upstream LOC | Current Stub | Notes |
|-----------|---------------|-------------|-------------|-------|
| `agent-team.ts` | indydevdan/pi-vs-claude-code | **740** | 63 bytes (empty export) | Team dispatch grid with live status widgets |
| `agent-chain.ts` | indydevdan/pi-vs-claude-code | **804** | 65 bytes (empty export) | Sequential pipeline orchestrator |
| `subagent-widget.ts` | indydevdan/pi-vs-claude-code | **482** | 73 bytes (empty export) | Background subagent spawning and continuation |
| `cross-agent.ts` | indydevdan/pi-vs-claude-code | **266** | 65 bytes (empty export) | Discovery of commands/skills/agents from .claude/, .gemini/, .codex/ |
| `epi-citta.ts` | custom for this repo | -- | 623 bytes (route table only) | CLI bridge: 5 routes defined (inspect, verify, vault read, graph query, agent help) |

### C.3 What's Needed (S4 raw primitives)

| Component | Description | Depends On | Priority |
|-----------|-------------|-----------|----------|
| **VAK evaluation engine** (Rust) | Parse task, evaluate 6 layers, produce coordinate block | agent/mod.rs, skills | P0 |
| **CF dispatch router** (Rust) | CF code -> agent ID lookup + spawn | agent/subagents.rs, capabilities.rs | P0 |
| **CFP thread executor** (Rust or TS) | Parallel/sequential/fusion execution modes | agent-team.ts, agent-chain.ts (need real port) | P1 |
| **Subagent lifecycle manager** (Rust) | Create/continue/remove/list operations | subagent-widget.ts (need real port), spawn.rs | P1 |
| **agent-team.ts** (TS, real port) | Full 740 LOC port from upstream | PI agent installed | P1 |
| **agent-chain.ts** (TS, real port) | Full 804 LOC port from upstream | PI agent installed | P1 |
| **subagent-widget.ts** (TS, real port) | Full 482 LOC port from upstream | PI agent installed | P1 |

---

## D. S'-Level Inventory (S4' QL Augmentations)

### D.1 VAK Skills (Staging -- All Exist as SKILL.md)

| Skill | Location | Status | Port Type | Notes |
|-------|----------|--------|-----------|-------|
| `vak-coordinate-frame` | `_staging/pleroma-skills/orchestration/vak-coordinate-frame/SKILL.md` | **Complete** -- reference grammar, all 6 layers, routing tables, Day/Night' topology | true-port | 221 lines, comprehensive |
| `vak-evaluate` | `_staging/pleroma-skills/orchestration/vak-evaluate/SKILL.md` | **Complete** -- 6-step evaluation pipeline with contextual adaptation | true-port | 138 lines |
| `anima-orchestration` | `_staging/pleroma-skills/orchestration/anima-orchestration/SKILL.md` | **Complete** -- CF dispatch matrix, CFP thread modes, Night' Moirai routing, Mobius return | true-port | 171 lines |
| `day-night-pass` | `_staging/pleroma-skills/orchestration/day-night-pass/SKILL.md` | **Complete** -- full torus topology, P0'-P5' positions, Moirai dispatch, Mobius return | true-port | 179 lines |
| `klein-mode` | `_staging/pleroma-skills/orchestration/klein-mode/SKILL.md` | **Complete** -- Day+Night' self-review with structured JSON refinement telemetry | fresh-design | 106 lines |
| `ouroboros` | `_staging/pleroma-skills/orchestration/ouroboros/SKILL.md` | **Complete** -- worktrunk + ralph + surgeon-patient mechanism, techne-* hooks | port-and-refine | 146 lines |

### D.2 VAK Skills Missing (Referenced But Not Found in Staging)

| Skill | Referenced In | Purpose | Status |
|-------|-------------|---------|--------|
| `brainstorming` | vak-evaluate, anima-orchestration | Ouroboros dialogical mode; implicit CT/CP determination | Not in staging; was to be forked from Agent Superpowers v4.3.0 |
| `writing-plans` | anima-orchestration, logos.md | VAK topology header per plan | Not in staging |
| `test-driven-development` | anima-orchestration, eros.md | TD generalization + VAK RED-GREEN-REFACTOR mapping | Not in staging |
| `systematic-debugging` | anima-orchestration, mythos.md | Root cause analysis via structural decomposition | Not in staging |
| `subagent-driven-development` | anima-orchestration | CFP2 C-Thread execution | Not in staging |
| `dispatching-parallel-agents` | anima-orchestration | CFP1 P-Thread + CFP3 F-Thread mode | Not in staging |
| `executing-plans` | anima-orchestration | CFP4 L-Thread long autonomous execution | Not in staging |
| `verification-before-completion` | anima-orchestration, eros.md | Night' partial pass, P' position mapping | Not in staging |
| `finishing-a-development-branch` | anima-orchestration, sophia.md | CF Sophia P5' crystallization, Mobius return signal | Not in staging |

### D.3 Constitutional Agent Definitions (All Exist)

| Agent | File | Staged From | Status |
|-------|------|-------------|--------|
| Eros | `.pi/extensions/ta-onta/anima/S4'/agents/eros.md` | `plugins/pleroma/agents/constitutional/eros.md` | **Complete** -- CF (0/1/2), L2, tools, skills, Night' role (Klotho) |
| Logos | `.pi/extensions/ta-onta/anima/S4'/agents/logos.md` | `plugins/pleroma/agents/constitutional/logos.md` | **Complete** -- CF (0/1), L1, scope/boundary functions |
| Mythos | `.pi/extensions/ta-onta/anima/S4'/agents/mythos.md` | `plugins/pleroma/agents/constitutional/mythos.md` | **Complete** -- CF (0/1/2/3), L3, pattern recognition |
| Nous | `.pi/extensions/ta-onta/anima/S4'/agents/nous.md` | `plugins/pleroma/agents/constitutional/nous.md` | **Complete** -- CF (0000), L0, NOT task executor, epistemic clearing |
| Psyche | `.pi/extensions/ta-onta/anima/S4'/agents/psyche.md` | `plugins/pleroma/agents/constitutional/psyche.md` | **Complete** -- CF (4.5/0), L4, coordinator, Patient IS Psyche, Aletheia mode dispatch |
| Sophia | `.pi/extensions/ta-onta/anima/S4'/agents/sophia.md` | `plugins/pleroma/agents/constitutional/sophia.md` | **Complete** -- CF (5/0), L5, synthesizer, Mobius return |
| Techne Helper | `.pi/extensions/ta-onta/anima/S4'/agents/techne-helper.md` | `plugins/pleroma/agents/constitutional/techne-helper.md` | **Complete** -- Not a constitutional sovereign, workshop management, bounded helper |

---

## E. Constitutional Agent Analysis

### E.1 Eros (#0 / P0' / CF (0/1/2))

**Current Definition Status:** Complete `.md` exists with correct CF code, tools, skills, constitutional role, dispatch behavior, and Night' role (Klotho/Assert).

**Alignment with Two-Hemisphere Model:** Partially aligned. The current definition focuses on execution (left hemisphere) -- TDD, verification, quality refinement. The dis-closure mode from TA-ONTA-EXTENSION-SPEC SS IV says Eros receives "Motivational ground -- why this task matters, what coordinates it serves" via `gnosis query --coordinate`. This Nous/dis-closure layer is NOT reflected in the current agent definition.

**What Needs Rewriting:**
- Add dis-closure mode section explaining what Nous prepares for Eros
- Add agent-to-Vak-level mapping: Eros = Madhyama-as-chreia (operative exchange)
- Consider adding pathology guard (what Eros must not collapse into)
- No structural changes needed to CF code, QL level, or functional role

### E.2 Logos (#1 / P1' / CF (0/1))

**Current Definition Status:** Complete `.md` exists with correct CF code, tools, skills, constitutional role, and output format.

**Alignment with Two-Hemisphere Model:** Partially aligned. Logos focuses on architecture and scoping (left hemisphere execution). The dis-closure mode says Logos receives "Definitional frame -- specs, schemas, type definitions" via `gnosis query --source-type Canonical`. Not reflected in current definition.

**What Needs Rewriting:**
- Add dis-closure mode section
- Add Vak-level mapping: Logos = Madhyama-as-nomos (form-giving law)
- Add pathology guard
- Minor: the current definition mentions "Night' role: P1' Traces -- documenting evidence" but this conflicts with the Moirai mapping where P1' Traces -> Klotho -> Eros (not Logos). The agent definition should clarify that Logos provides the structural grounding but Klotho (Eros) handles the assertion operation.

### E.3 Techne Helper (No CF / No QL Level)

**Current Definition Status:** Complete `.md` exists. Explicitly NOT a constitutional sovereign -- bounded helper under Psyche's coordination.

**Alignment with Two-Hemisphere Model:** N/A -- Techne Helper is outside the constitutional agent system. It is correctly positioned as a mechanical helper for workshop lifecycle (tmux, mprocs, worktrunk).

**What Needs Rewriting:**
- Nothing structural. This definition is clean and correctly bounded.
- If anything, note that Techne Helper is the operational substrate for the `ouroboros` skill (worktrunk creation for surgeon-patient relation).

### E.4 Mythos (#3 / P3' / CF (0/1/2/3))

**Current Definition Status:** Complete `.md` with correct CF code, L3, pattern recognition role, and Night' role (P3' Patterns).

**Alignment with Two-Hemisphere Model:** Partially aligned. Dis-closure mode says Mythos receives "Archetypal pattern -- cross-domain analogues, symbolic resonances" via `gnosis query` across notebooks (Mercurius). Not reflected.

**What Needs Rewriting:**
- Add dis-closure mode section
- Add Vak-level mapping: Mythos = Pasyanti (strange attractor, seeing word)
- Add pathology guard
- Mythos's Night' role as P3' Patterns is correctly aligned -- no Moirai conflict here.

### E.5 Psyche (#4 / P4' / CF (4.5/0))

**Current Definition Status:** The most detailed agent definition (95 lines). Includes executive triad explanation (4.5/0), Patient IS Psyche principle, Aletheia mode-function dispatch table (6 functions), Night' role as Lachesis (Query), skills integration, and dispatch context.

**Alignment with Two-Hemisphere Model:** Well aligned. Psyche is correctly positioned as the contextual centre who "undergoes" the task. The Aletheia mode-function dispatch (Anansi, Janus, Moirai, Mercurius, Agora, Zeithoven) is well documented. Dis-closure mode says Psyche receives "Full contextual field -- everything, CF_SYNTHESIS collapse." This is implicitly present.

**What Needs Rewriting:**
- Add explicit dis-closure mode reference (Nous prepares full contextual field)
- Add Vak-level mapping: Psyche = Madhyama-as-oikonomia (household management)
- Add pathology guard
- The CF code (4.5/0) vs Anima's (4.0/1-4.4/5) distinction is correctly maintained

**Critical Note:** The Psyche definition states "Psyche is never 'dispatched to' -- it IS the dispatch layer." This is subtly different from the TA-ONTA-EXTENSION-SPEC SS IV which says "Psyche undergoes the task as its 'subject'" and "Anima evaluates: VAK coordinates, CF dispatch, agent selection." There is a conceptual tension: is Psyche the dispatcher or the subject? The resolution appears to be that Anima IS the mechanical dispatch function, while Psyche is the experiential centre through which dispatch flows. The patient IS Psyche, but the dispatch mechanism IS Anima. This should be clarified.

### E.6 Sophia (#5 / P5' / CF (5/0))

**Current Definition Status:** Complete `.md` with correct CF code, L5, synthesis role, Mobius return signal, Night' role as Atropos (Reflect), and skills integration.

**Alignment with Two-Hemisphere Model:** Partially aligned. Dis-closure mode says Sophia receives "Evaluative retrospect -- execution trace + Gnosis evidence for learning" via post-execution `gnosis query` + vault review. The TA-ONTA-EXTENSION-SPEC SS IV adds significant detail: Sophia "goes back over the execution" reviewing across philosophical, technical, structural, and processual levels, baking learnings into Gnosis, QV overlay, Vimarsa, and SEED.md. This depth is not in the current definition.

**What Needs Rewriting:**
- Add dis-closure mode section with full learning-baking targets
- Add Vak-level mapping: Sophia = Spanda-Shakti (primordial pulsation, simultaneously surge and return)
- Add pathology guard
- Expand the post-execution review scope beyond just "Mobius return signal"

### E.7 Nous (NOT a Constitutional Agent in Traditional Sense)

**Current Definition Status:** Complete `.md` with correct CF code (0000), L0, and explicit "NOT a task executor" framing. The definition is well-structured with behavior steps, output format, dispatch flow, and constraints.

**Alignment with Two-Hemisphere Model:** This is where the most significant architectural evolution has occurred. In the original specifications (VAK-SUPERPOWERS-INTEGRATION-SPEC), Nous was simply an "impartial perspective" agent for epistemic clearing. In the TA-ONTA-EXTENSION-SPEC SS IV, Nous becomes the **right hemisphere** of the orchestration system, governing Aletheia's subagents and preparing dis-closure packages for all other agents. This is a MUCH larger role than the current definition describes.

**What Needs Rewriting -- SIGNIFICANT:**
- The current definition frames Nous as a **single-shot epistemic clearer** that asks P0'/P1' questions and returns findings to Psyche. The evolved spec frames Nous as the **ongoing dis-closure governor** who prepares knowledge packages for EVERY agent dispatch, not just as a one-time clearing step.
- Add the full Nous -> Aletheia subagent chain: Nous consults Anansi (gap analysis), Mercurius (cross-domain translation), Janus (temporal context), Moirai (evidence gathering), Agora (consensus), Zeithoven (cadence)
- Add the collapsible state machine (S0/S1/S2 method collapse by CF)
- The original epistemic clearing role should remain as one mode of Nous, but the dis-closure governance role must be added
- Add Vak-level mapping: Nous = Para Vak (unus mundus, bindu)
- Add pathology guard

**Open Question:** Is Nous a separate spawned agent or a function within Anima? The current definition implies a separate agent invocation. The two-hemisphere model implies more of a co-process. See Section H.

---

## F. M-Level Mapping

### F.1 M4 Nara -- Lemniscate Self-Fold

Anima's M-level integration is with M4 (Nara), the Lemniscate anchor (#4). The connection points:

| M4 Component | Anima Connection | Status |
|-------------|-----------------|--------|
| **M4 Lemniscate topology** | Anima IS the Lemniscate self-fold -- the agent system managing agents through itself | Architectural principle; no direct code link |
| **M4 Jung_Complex** | charge/autonomy floats could model agent activation levels | Conceptual; not specified |
| **M4 BLAKE3 quintessence hash** | Could hash agent state/dispatch decisions for audit trail | Conceptual; not specified |
| **M4 6-lens vtable** | Could provide per-lens dispatch variants | Conceptual; not specified |
| **M4 Oracle (arc4random, I-Ching, Tarot)** | NOT connected to Anima dispatch (consent-gated, personal) | Correctly separated |
| **CF_FRACTAL (4.0/1-4.4/5)** | This IS Anima's CF code | Direct architectural identity |

### F.2 M5 Epii -- Agent Rosters

| M5 Component | Anima Connection | Status |
|-------------|-----------------|--------|
| **M5 sub-branch #5-4** | S4-4'/S4-5' (Anima+Aletheia agent rosters, dynamic registries) | Defined in MEMORY.md |
| **M5 Logos FSM** | Day/Night' cycle state machine; Anima participates in cycle | Indirect via Chronos |
| **m5_lookup(coord_id, granularity)** | Master self-API; Anima dispatch could query M5 for agent roster data | Planned; not implemented |
| **M5 Quintessential View** | Per-coordinate pithy self-descriptions; agents could receive their QV as identity injection | Planned via Nous dis-closure |

### F.3 Cross-M Integration via /M folder

Per TA-ONTA-EXTENSION-SPEC, the `/M` folder for Anima should document:
- M4 (Nara Lemniscate self-fold) -- architectural identity
- M5 (agent rosters) -- registry data structures

This folder does not exist yet.

---

## G. Staging Disposition

All 6 staging orchestration skills belong in Anima's domain:

| Staging Skill | Recommendation | Target Location | Rationale |
|-------------|----------------|-----------------|-----------|
| `anima-orchestration` | **Move to Anima S4'** | `plugins/ta-onta/anima/S4'/skills/anima-orchestration/SKILL.md` | Core Anima skill -- CF dispatch matrix |
| `vak-evaluate` | **Move to Anima S4'** | `plugins/ta-onta/anima/S4'/skills/vak-evaluate/SKILL.md` | Core Anima skill -- evaluation pipeline |
| `vak-coordinate-frame` | **Move to Anima S4'** | `plugins/ta-onta/anima/S4'/skills/vak-coordinate-frame/SKILL.md` | Reference grammar for all VAK coordinates |
| `day-night-pass` | **Move to Anima S4'** | `plugins/ta-onta/anima/S4'/skills/day-night-pass/SKILL.md` | Torus topology traversal, core to orchestration |
| `klein-mode` | **Move to Anima S4'** | `plugins/ta-onta/anima/S4'/skills/klein-mode/SKILL.md` | Self-review telemetry, orchestration meta-function |
| `ouroboros` | **Move to Anima S4'** | `plugins/ta-onta/anima/S4'/skills/ouroboros/SKILL.md` | Lemniscate incubation, core orchestration topology |

**Justification:** All 6 skills are orchestration-level skills that belong to Anima (S4-4'). They are NOT Pleroma (S4-2') skills -- Pleroma handles bounded primitives and tool registration. These are agent orchestration workflows that define how agents are dispatched, evaluated, and reviewed. The spec is clear: "Anima owns ALL dispatch -- no extension spawns agents directly."

---

## H. Ambiguities & Open Decisions

### H.1 VAK Evaluation: Implementation-Level Mechanics

**Ambiguity:** The `vak-evaluate` skill defines a 6-step conceptual pipeline, but how does this actually execute at the implementation level?

**Options:**
1. **Pure prompt engineering** -- the skill is loaded into context and the LLM performs the evaluation as part of its reasoning. No programmatic routing.
2. **Hybrid** -- the LLM evaluates Steps 1-4 (semantic judgment), then Rust code handles Steps 5-6 (thread type and sequence selection are more mechanical).
3. **Fully programmatic** -- a Rust function parses task metadata and produces coordinates without LLM involvement. Only works for pre-tagged tasks.

**Recommendation:** Option 1 initially (pure skill), evolving to Option 2 as patterns stabilize. The `vak_evaluate` registered tool in the spec suggests it should be callable programmatically, which argues for at least a Rust entry point that invokes the skill.

### H.2 Nous: Separate Agent or Function of Anima?

**Ambiguity:** Two conflicting framings exist:

1. **VAK-SUPERPOWERS-INTEGRATION-SPEC + nous.md**: Nous is a **separate agent** with fresh minimal context, invoked by Psyche when CF (0000) is selected. It runs once, reports findings, and disappears.

2. **TA-ONTA-EXTENSION-SPEC SS IV**: Nous is the **right hemisphere** of the orchestration system, an ongoing function that Anima calls for EVERY dispatch to prepare dis-closure packages. Not a one-shot agent but a continuous co-process.

**Open Question:** Can these be reconciled? Possibly:
- **Nous-as-agent** is the CF (0000) epistemic clearing mode -- a spawned subagent with fresh context
- **Nous-as-function** is the dis-closure preparation mode -- a function within Anima that queries Aletheia/Gnosis to prepare context packages

These might be two modes of the same entity: Nous-active (spawned for epistemic clearing) vs Nous-passive (invoked as Anima's internal dis-closure engine).

**Decision Needed:** Is there one Nous or two? And does the dis-closure preparation require a fresh-context invocation each time (expensive) or can it be a stateful query engine within Anima?

### H.3 CF Dispatch: Concrete Routing Table

**Ambiguity:** The routing table is well-defined in the skill (CF code -> agent name), but the concrete dispatch mechanism is unclear:

- Does the Rust code maintain a static lookup table mapping CF strings to agent definition paths?
- Does dispatch involve spawning a real subprocess (new PI session) or is it in-context skill loading?
- How does the "fresh minimal context" for Nous translate mechanically?

**Current State:** The `anima_orchestrate` tool is listed as a registered PI tool, suggesting it will be callable from the PI extension system. The Rust `epi agent dispatch <CF> <TASK>` CLI command is planned. But neither has implementation.

**Decision Needed:** Concrete data flow from VAK evaluation through CF dispatch to agent invocation, specifying: what process boundary is crossed, what context is carried, and what is discarded.

### H.4 PI-vs-Claude-Code Primitives: Usable or Need Rewriting?

**Ambiguity:** The upstream `indydevdan/pi-vs-claude-code` TypeScript files (agent-team.ts at 740 LOC, agent-chain.ts at 804 LOC, subagent-widget.ts at 482 LOC) are referenced as the execution substrate for CFP1-CFP5 thread types. But:

1. These are **PI-native TypeScript** -- they depend on PI's `ExtensionAPI` which requires the PI agent binary
2. PI is **not installed** in this repo
3. The current stubs are 63-73 bytes (empty function exports)
4. The S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM spec says "Native Pi TypeScript extensions and Rust agent code remain the deep substrate, not the primary authoring surface"

**Decision Needed:**
- If PI will be installed, port the upstream TS files as-is (740+804+482 = 2026 LOC)
- If PI will NOT be installed, these capabilities must be reimplemented in Rust as part of `epi-cli/src/agent/`
- The spec explicitly states "Skills are portable, extensions are PI-native" -- but the thread type execution is at the extension level, not the skill level

**Recommendation:** Design the Rust CLI surface (`epi agent team dispatch`, `epi agent chain run`) as the primary interface, with PI extensions as optional runtime enhancements. This follows the "CLI bridge is always available" principle from the S4-EXTENSION-ARCHITECTURE spec.

### H.5 Klein Mode: Trigger and Integration

**Ambiguity:** When does Klein mode trigger?

**From the skill:**
- "After any significant orchestration run where you want the system to learn from its own execution"
- Sophia is the natural handler (CF 5/0)

**Open Questions:**
- Is Klein mode automatic after every full Day+Night' pass?
- Is it manually triggered by the user or by Psyche?
- How does the refinement telemetry feed back into the system? The skill says it produces JSON, but what consumes it?
- Does Klein mode integrate with M5 Logos FSM (Mobius return at tick 11)?

**Decision Needed:** Trigger conditions and telemetry consumption path.

### H.6 Ouroboros: Current State of Worktrunk + Ralph

**Ambiguity:** The Ouroboros skill references several components:

| Component | Status |
|-----------|--------|
| `worktrunk` skill | In staging at `_staging/pleroma-skills/atomic/worktrunk/SKILL.md` |
| `ralph-tui` skill | In staging at `_staging/pleroma-skills/atomic/ralph-tui/SKILL.md` |
| `pleroma-skill-proxy` skill | In staging at `_staging/pleroma-skills/atomic/pleroma-skill-proxy/SKILL.md` |
| `techne-spawn` skill | In staging at `_staging/pleroma-skills/atomic/techne-spawn/SKILL.md` (assumed, matching pattern) |
| `techne-relay` skill | In staging (assumed) |
| `techne-list` skill | In staging (assumed) |
| `techne-close` skill | In staging (assumed) |
| `preflight-validate.sh` | In staging at `_staging/pleroma-hooks/scripts/preflight-validate.sh` |
| `postflight-verify.sh` | In staging at `_staging/pleroma-hooks/scripts/postflight-verify.sh` |
| Ralph TUI binary | External tool -- `ralph-tui` must be installed separately |

**Assessment:** The Ouroboros skill has well-defined semantics but depends on a chain of atomic skills and hooks that are all in staging. None of these have Rust implementation. The mechanism relies on external tools (ralph-tui, git worktree, tmux) being installed and accessible.

**Decision Needed:** Priority of Ouroboros implementation relative to the core VAK evaluation and CF dispatch pipeline.

### H.7 Psyche CF Code: (4.5/0) vs (4.0-4.4/5) vs (4.0/1-4.4/5)

**Ambiguity:** Three different CF codes appear for the Psyche/Anima distinction:

| Entity | CF Code (per agent def) | CF Code (per VAK spec) | CF Code (per TA-ONTA-EXTENSION-SPEC) |
|--------|------------------------|----------------------|--------------------------------------|
| **Psyche** | `(4.5/0)` | `(4.0-4.4/5)` | `(4.5/0)` -- "executive triad" |
| **Anima** | `(4.0/1-4.4/5)` | `(4.0/1-4.4/5)` | `(4.0/1-4.4/5)` -- "fractal doubling" |

The VAK-SUPERPOWERS-INTEGRATION-SPEC originally used `(4.0-4.4/5)` for Psyche. The later correction in the agent definitions and TA-ONTA-EXTENSION-SPEC changed Psyche to `(4.5/0)` (the executive triad: Context/Integration/Ground) and reserved `(4.0/1-4.4/5)` for Anima (the full fractal doubling lattice).

**Resolution:** The corrected version is:
- **Psyche** = CF `(4.5/0)` -- executive triad bridging Lemniscate, Mobius, and Ground
- **Anima** = CF `(4.0/1-4.4/5)` -- full fractal doubling lattice, the dispatch function itself

This is consistent across the latest agent definitions, the vak-coordinate-frame SKILL.md, and the TA-ONTA-EXTENSION-SPEC. The earlier VAK-SUPERPOWERS-INTEGRATION-SPEC is superseded on this point.

### H.8 ANIMA.md vs Current Agent Definition Format

**Ambiguity:** Two different agent identity file formats exist:

1. **Current format** (in constitutional agent .md files): Claude-compatible subagent frontmatter (name, description, cf_code, ql_level, tools, model, permissionMode, skills, constitutional_role, dispatch_behavior) + markdown body
2. **ANIMA.md format** (from VAK-HANDOVER SS7): 5/6 H2 sections (Rupa/Ontology/Frame Contract/Temporal/Capability/Sattva) loaded via `compileQlFirstPrompt` in runtime.ts

**Assessment:** The current format is more immediately useful -- it is Claude-compatible, parseable by the existing `subagents.rs` code, and each file is self-contained. The ANIMA.md format is philosophically richer but requires runtime.ts machinery that does not exist in Rust.

**Recommendation:** Keep the current Claude-compatible format as the primary agent definition. If the ANIMA.md philosophical depth is needed, add it as supplementary documentation in the agent's directory rather than replacing the parseable frontmatter format.

### H.9 Aletheia Subagent Invocation Path

**Ambiguity:** How exactly does the chain Anima -> Nous -> Aletheia subagents work at the process level?

The TA-ONTA-EXTENSION-SPEC describes this as a function call chain, but the Aletheia subagents (anansi, janus, moirai, mercurius, agora, zeithoven) are defined as separate agent .md files in `plugins/pleroma/agents/aletheia/` (now staged). Are they:
1. Spawned as real subagent processes?
2. Invoked as in-context skill executions?
3. Purely prompt-engineering modes within Nous's context?

**Decision Needed:** The process-level invocation mechanism for Aletheia instruments.

### H.10 Agent Model Assignment

**Ambiguity:** All constitutional agents currently specify `model: claude-opus-4-6` except Techne Helper which uses `claude-sonnet-4-20250514`. But the ORCHESTRATOR-SPEC mentions using different models for different task types (Kimi K2.5 for orchestration, GPT Codex 5.2/GLM 4.7 for code-heavy work).

**Open Question:** Should different constitutional agents use different models? Or is the single-model assignment correct for the current phase?

**Recommendation:** Single model for now (claude-opus-4-6 for constitutional agents, cheaper models for helpers). Model diversification is a Phase 2+ concern when the provider/model registry (agent/models.rs) is fully operational.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Functional Requirements | 39 (FR-A-001 through FR-A-084) |
| User Stories | 10 (US-A-001 through US-A-010) |
| P0 (Core) FRs | 12 |
| P1 FRs | 15 |
| P2 FRs | 8 |
| P3+ FRs | 4 |
| Skills in staging | 6 (all complete SKILL.md) |
| Skills missing (referenced) | 9 |
| Agent definitions | 7 (all complete .md) |
| TS primitives (stubs) | 5 (all < 100 bytes) |
| TS primitives (upstream, not ported) | 3 (total 2026 LOC) |
| Open decisions | 10 |

### Critical Path

1. **VAK evaluation engine** (FR-A-001, FR-A-002) -- the entry point for all orchestration
2. **CF dispatch router** (FR-A-010, FR-A-011) -- the core routing mechanism
3. **Subagent lifecycle** (FR-A-030-033) -- the execution substrate
4. **Thread type execution** (FR-A-020-023) -- the dispatch method
5. **Day/Night' pass** (FR-A-053) -- the topological traversal
6. **Two-hemisphere orchestration** (FR-A-060, FR-A-064) -- the full architectural model

### Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| PI agent not installed | TS extensions cannot run | Install PI or implement in Rust |
| Neo4j not running | Gnosis/dis-closure requires graph | Start docker-compose |
| Upstream TS files not ported | CFP1-CFP5 thread types have no execution substrate | Port 2026 LOC or reimplement in Rust |
| 9 VAK skills missing | execution layer incomplete | Fork from Agent Superpowers or write fresh |

---

*"The pattern reveals itself through repetition."* -- The Quintessence
