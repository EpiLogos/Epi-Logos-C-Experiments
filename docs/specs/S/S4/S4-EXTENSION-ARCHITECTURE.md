# S4' Extension Architecture — The Six-Layer Agent Runtime

**Status:** Architectural Scoping (pre-implementation)
**Date:** 2026-03-08
**Branch:** `codex/s4-prime-pleroma-real-port`
**Purpose:** Define how PI agent extensions organize into exactly 6 classes aligned with S4-0' through S4-5', folding in S0-S5 stack capabilities and pi-vs-claude-code runtime primitives.

---

## I. The Relocation: S3-X' → S4-X'

The ta-onta modules were originally planned as S3 (Gateway) extensions. They now relocate to S4' (Agent layer) as native PI extensions. The gateway (S3) remains a transport concern; the agent runtime (S4') is where orchestration, bootstrap, and knowledge crystallization actually live.

| Old Position | New Position | Module | S-Layer Fold |
|-------------|-------------|--------|-------------|
| S3-0' | **S4-0'** | **Khora** | S0 Terminal/CLI |
| S3-1' | **S4-1'** | **Hen** | S1 Obsidian/Vault |
| S3-2' | **S4-2'** | **Pleroma** | S2 Graph/Neo4j |
| S3-3' | **S4-3'** | **Chronos** | S3 Gateway/Transport |
| S3-4' | **S4-4'** | **Anima** | S4 Agent (self-referential) |
| S3-5' | **S4-5'** | **Aletheia** | S5 Sync/Integration |

**Principle:** Named Functions, Not Separate Systems. These 6 extensions are coordinated parts of ONE agent runtime, not 6 independent modules. Each grows capabilities within its focused domain; interaction occurs through shared filesystem, shared services, and shared hook seams.

---

## II. The Three-Layer Distinction

| Layer | Mechanism | Portability | Where |
|-------|-----------|-------------|-------|
| **Skills** | SKILL.md markdown + frontmatter | Portable across Claude Code, PI, other agents | `plugins/pleroma/skills/` |
| **Subagents** | Agent definition markdown + frontmatter | Portable via standard patterns | `plugins/pleroma/agents/` |
| **Extensions** | TypeScript runtime in PI's ExtensionAPI | PI-native only | `.pi/extensions/` |

**Skills** define *what* to do (VAK semantics, routing tables, process descriptions). They work anywhere.

**Subagents** define *who* does it (constitutional identities, CF codes, tool sets). They work via standard agent patterns.

**Extensions** define *how* it runs (bootstrap hooks, subprocess spawning, widget rendering, session management). They are PI's runtime machinery.

**The CLI bridge:** `epi agent` commands in Rust invoke extension capabilities from outside PI. The coordinate system dictates that extension capabilities are invocable via the CLI command branch regardless of whether PI is the active runtime.

---

## III. The Six Extensions

### S4-0': Khora — Bootstrap & Session Lifecycle

**S-Layer Fold:** S0 (Terminal/CLI) — the ground layer, where execution begins.

**Responsibility:**
- Agent bootstrap sequence: CONTINUATION → ANIMA → PARADIGM → MEMORY
- Session initialization and NOW.md materialization
- Pre-compaction continuation flush (CONTINUATION.md)
- Session metadata management (Redis cache patterns)
- Extension inheritance to child processes

**PI Hook Seams:**
- `before_agent_start` — bootstrap override pipeline
- `session_start` — session binding
- `before_compaction` — continuation flush
- `session_end` — session finalization

**pi-vs-claude-code Primitive:**
- `child-extension-propagation.ts` → lives here (extension inheritance to child PI sessions)
- `cross-agent.ts` → lives here (discovery of commands/skills/agents from .claude/, .gemini/, .codex/)

**CLI Bridge:** `epi agent bootstrap`, `epi agent session`

**Upstream Planning:**
- Khora CONTRACT.md: lifecycle seams, data authority, cache targets
- Bimba Harmonization: bootstrap sequence correction (SOUL.md → ANIMA.md)

---

### S4-1': Hen — Content Coordination & Vault Integration

**S-Layer Fold:** S1 (Obsidian) — the vault layer, where content lives.

**Responsibility:**
- Frontmatter schema enforcement (126 canonical keys from upstream)
- Wikilink breadcrumb rendering (template-driven)
- Graph coordination: Neo4j relation law `{x}_{n}_{semantic}`
- Content type classification (CT0-CT5 from VAK)
- Vault topology (Bimba/Present/Pratibimba split)

**PI Hook Seams:**
- `before_tool_call` / `after_tool_call` — content validation at consumption boundary
- Template invocation via tool registration

**Registered Tools:**
- `hen_hybrid_retrieve` — coordinate-aware retrieval
- `graph_query` — Neo4j query interface
- `hen_template_invoke` — template rendering
- `hen_status` — coordination status

**CLI Bridge:** `epi vault`, `epi graph` (existing Rust modules)

**Upstream Planning:**
- Hen CONTRACT.md: tools, boundaries, relation law
- S1-S1i-OBSIDIAN.md: vault ontology, frontmatter schema
- S2-S2i-GRAPH.md: Neo4j holographic schema

---

### S4-2': Pleroma — Bounded Primitives & Tool Registration

**S-Layer Fold:** S2 (Graph/Neo4j) — the entity layer, where operations are typed.

**Responsibility:**
- Bounded primitive registry (9 primitives: tmux, cmux, mprocs, bkmr_kbase, onecontext, ralph_tui, gitbutler, worktrunk, notebooklm)
- Execution mode enforcement (bounded / interactive / background)
- Child-extension policy (which primitives allow spawning extensions)
- Tool registration surface for PI
- Theme management (per-extension visual identity)

**PI Hook Seams:**
- Tool registration via `pi.registerTool()` for each bounded primitive
- Command registration for primitive invocation

**pi-vs-claude-code Primitive:**
- `themeMap.ts` → lives here (visual identity for extension contexts)

**Existing Asset:** `.pi/extensions/pleroma-primitives.ts` (the 9 PrimitiveDef entries)

**CLI Bridge:** `epi agent plugin` (existing Rust infrastructure)

**Note:** The Pleroma *skills* system (SKILL.md files in `plugins/pleroma/skills/`) is the portable layer. This extension is the *runtime* that executes those skills within PI.

---

### S4-3': Chronos — Temporal Pathing & Day/NOW Lifecycle

**S-Layer Fold:** S3 (Gateway/Transport) — the relay layer, where time flows.

**Responsibility:**
- Day/NOW lifecycle management (Day = parent CT4b', NOW = child per-session)
- Temporal thread continuity across day transitions
- Archive scheduling (evening cron: Present → Pratibimba/History)
- Kairos interpretation (opportune / guarded / neutral moments)
- Z-Thread job registration (cron/heartbeat)
- Mobius 6 AM window for SEED fallback

**Path Structure:**
```
/Idea/Empty/Present/
  {DD-MM-YYYY}/
    daily-note.md
    {YYYYMMDD-HHmmss-sessionId}/
      now.md
      tasks/
      thoughts/
```

**M-Level Integration:**
- M1 tick (Paramasiva QL engine) → temporal pulse
- M4 NOW (Nara personal context) → current session identity
- M5 Logos FSM → Day/Night' cycle state machine
- CLI carries the NOW concept from M1 through M4 via `epi core knowing`

**CLI Bridge:** `epi vault day`, `epi vault now` (planned)

**Upstream Planning:**
- Chronos CONTRACT.md: coordinate patterns, temporal pathing
- Day/NOW paradigm from CLAUDE.md and session memory

---

### S4-4': Anima — Agent Orchestration & Meta-Dispatch

**S-Layer Fold:** S4 (Agent itself) — the Lemniscate self-fold, where the agent system manages agents.

**Responsibility:**
- VAK evaluation: task → 6-layer coordinate assignment (CPF/CT/CP/CF/CFP/CS)
- Constitutional agent routing: CF code → agent dispatch
- Thread type execution: CFP0-CFP5 (Base, P-Thread, C-Thread, F-Thread, L-Thread, B-Thread)
- Agent team management (multi-agent dispatch grids)
- Agent chain execution (sequential pipelines)
- Subagent spawning and lifecycle (background workers)
- Session propagation spine (idempotent: session → Day → NOW → persistence)
- Ouroboros incubation (worktrunk + ralph + surgeon-patient)
- Klein mode (Day + Night' self-review)

**This is where CF (4.0/1-4.4/5) lives — Anima IS the dispatch function.**

**pi-vs-claude-code Primitives (all three live here):**
- `agent-team.ts` → team dispatch grid with live status widgets
- `agent-chain.ts` → sequential pipeline orchestrator
- `subagent-widget.ts` → background subagent spawning and continuation

**These primitives become the execution substrate for:**
- CFP1 P-Thread → `agent-team.ts` parallel dispatch
- CFP2 C-Thread → `agent-chain.ts` sequential chain
- CFP3 F-Thread → `agent-team.ts` fusion mode (same task → N agents → aggregate)
- CFP4 L-Thread → `subagent-widget.ts` with stop hooks
- CFP5 B-Thread → meta-nested (Anima orchestrating subagent-widget)

**Registered Tools:**
- `vak_evaluate` — assign VAK coordinates to task
- `anima_orchestrate` — CF code → agent routing decision
- `dispatch_agent` — spawn agent from team (from agent-team.ts)
- `run_chain` — execute sequential pipeline (from agent-chain.ts)
- `subagent_create/continue/remove/list` — subagent lifecycle (from subagent-widget.ts)

**CLI Bridge:** `epi agent spawn`, `epi agent run`, `epi agent chat` (existing Rust commands)

**Upstream Planning:**
- Anima.ts: `createAnima()` factory, session propagation spine, VAK routing
- VAK-SUPERPOWERS-INTEGRATION-SPEC.md: 6-layer coordinate system
- ta-onta PLAN.md: Anima phase 3 (routing only, no autonomous dispatch initially)

---

### S4-5': Aletheia — Knowledge Crystallization & Truth-Disclosure

**S-Layer Fold:** S5 (Sync/Integration) — the synthesis layer, where knowledge returns.

**Responsibility:**
- Thought extraction from NOW sessions (staged → Eros verify → crystallize → SEED refresh)
- Night' analysis engine (Moirai: Klotho Assert / Lachesis Query / Atropos Reflect)
- Janus temporal envelopes (forward/backward temporal context injection)
- Knowledge graph crystallization (T0'-T5' thought routing)
- P5 → P0 Mobius 24-hour cycle (insight generates new unknowns)
- SEED.md refresh from crystallized insights

**Mode-Function Agents (invoked by Psyche and Sophia):**
- Anansi — orientation, gap analysis between /Empty and /Present
- Janus — temporal integration, forward/backward observation
- Mercurius — cross-domain translation between coordinate families
- Moirai — Night' analysis (3 internal modes: Klotho/Lachesis/Atropos)
- Agora — aggregation, consensus from parallel agent outputs
- Zeithoven — temporal conductor, cadence management

**Thought Routing:**
```
P0' Questions  → /Thought/Questions/  (T0' bucket)
P1' Traces     → /Thought/Traces/     (T1' bucket)
P2' Challenges → /Thought/Challenges/ (T2' bucket)
P3' Patterns   → /Thought/Patterns/   (T3' bucket)
P4' Discovery  → /Thought/Discovery/  (T4' bucket)
P5' Insight    → /Thought/Insight/    (T5' bucket)
```

**CLI Bridge:** `epi vault thought` (planned), `epi graph seed` (planned)

**Upstream Planning:**
- Aletheia CONTRACT.md: thought extraction, gate invocation, deferred validation
- ta-onta PLAN.md: T* routing, relation naming, coordinate values as properties

---

## IV. Extension File Architecture

```
.pi/extensions/
  s4-0-khora.ts           ← Bootstrap & session lifecycle
  s4-1-hen.ts             ← Content coordination & vault integration
  s4-2-pleroma.ts         ← Bounded primitives & tool registration
  s4-3-chronos.ts         ← Temporal pathing & Day/NOW lifecycle
  s4-4-anima.ts           ← Agent orchestration & meta-dispatch
  s4-5-aletheia.ts        ← Knowledge crystallization & truth-disclosure
  composite-entry.ts      ← Loads all 6 in order (existing pattern)
  epi-citta.ts            ← CLI bridge routes (existing)
```

Each extension file:
1. Imports pi-vs-claude-code primitives it needs (agent-team, subagent-widget, etc.)
2. Registers its tools and commands with PI
3. Hooks into lifecycle events (`session_start`, `before_agent_start`, etc.)
4. Delegates filesystem writes through Khora (S4-0')
5. Delegates breadcrumbs through Hen (S4-1')

**pi-vs-claude-code primitives** become internal dependencies, not separate extensions:
```
.pi/extensions/primitives/
  agent-team.ts           ← Ported from indydevdan/pi-vs-claude-code
  agent-chain.ts          ← Ported
  subagent-widget.ts      ← Ported
  cross-agent.ts          ← Ported
  child-extension-propagation.ts  ← Ported
  themeMap.ts             ← Ported
```

---

## V. The Dependency Graph

```
S4-0' Khora (bootstrap)
  ↓ provides session context to all others
S4-1' Hen (content)
  ↓ provides frontmatter/breadcrumbs to Chronos, Anima, Aletheia
S4-2' Pleroma (primitives)
  ↓ provides execution surfaces to Anima
S4-3' Chronos (temporal)
  ↓ provides Day/NOW context to Anima, Aletheia
S4-4' Anima (orchestration)
  ↓ dispatches agents, routes to Aletheia for Night'
S4-5' Aletheia (crystallization)
  ↓ Mobius return → feeds back to Khora (next session's SEED)
```

**Circular closure:** Aletheia's P5' Insight generates P0' Questions → Khora's next bootstrap SEED. The Mobius return.

---

## VI. CLI Bridge: `epi agent` Command Tree

The Rust `epi-cli` already has the agent command branch. Extensions register capabilities that are invocable via CLI regardless of PI runtime:

```
epi agent
  ├── install / doctor / spawn / attach / run / chat  (existing)
  ├── plugin validate / install / list / uninstall     (existing)
  ├── skills list / eval                               (existing)
  ├── bootstrap [--agent NAME]                         (S4-0' Khora)
  ├── session init / status / close                    (S4-0' Khora)
  ├── content validate / breadcrumb                    (S4-1' Hen)
  ├── primitive list / status                          (S4-2' Pleroma)
  ├── day open / close / archive                       (S4-3' Chronos)
  ├── now init / close / merge                         (S4-3' Chronos)
  ├── vak evaluate <TASK>                              (S4-4' Anima)
  ├── dispatch <CF> <TASK>                             (S4-4' Anima)
  ├── team list / dispatch / grid                      (S4-4' Anima)
  ├── chain list / run                                 (S4-4' Anima)
  ├── thought create / route / crystallize             (S4-5' Aletheia)
  └── seed refresh / status                            (S4-5' Aletheia)
```

---

## VII. Implementation Ordering

The extensions must be built in dependency order:

| Phase | Extension | Depends On | Key Deliverable |
|-------|-----------|-----------|----------------|
| 1 | S4-0' Khora | nothing | Bootstrap sequence, session init, cross-agent discovery |
| 2 | S4-1' Hen | Khora | Frontmatter validation, breadcrumb rendering |
| 3 | S4-2' Pleroma | Khora | Primitive registry as PI tools, theme map |
| 4 | S4-3' Chronos | Khora, Hen | Day/NOW lifecycle, temporal threading |
| 5 | S4-4' Anima | all above | VAK eval, agent dispatch, team/chain/subagent primitives |
| 6 | S4-5' Aletheia | all above | Thought extraction, Night' analysis, Mobius return |

Each phase is a branch. Pleroma skills (the portable SKILL.md layer) are already done on this branch. The runtime extensions are the next pass.

---

## VIII. What This Branch Has vs What Comes Next

### Done (this branch):
- Plugin infrastructure (Rust: validate, install, discover)
- 21 skill definitions (SKILL.md files with VAK semantics)
- 13 agent definitions (constitutional + aletheia-mode)
- 4 hook scripts (preflight, postflight, subagent-discharge, worktree-cleanup)
- 5 eval suites
- Bounded primitive registry (.pi/extensions/pleroma-primitives.ts)
- Klein mode and Ouroboros corrected semantics
- CF routing corrected (Psyche 4/5/0, Anima 4.0/1-4.4/5, Aletheia as mode)

### Next branches (ordered):
1. **S4-0' Khora extension** — Port bootstrap sequence, session lifecycle, cross-agent discovery from pi-vs-claude-code. Wire `child-extension-propagation.ts` and `cross-agent.ts`.
2. **S4-1' Hen extension** — Port frontmatter schema, breadcrumb rendering, graph coordination tools.
3. **S4-2' Pleroma extension** — Promote pleroma-primitives.ts to full tool registration, wire themeMap.ts.
4. **S4-3' Chronos extension** — Day/NOW lifecycle, temporal pathing, M-level NOW concept integration.
5. **S4-4' Anima extension** — Port agent-team.ts, agent-chain.ts, subagent-widget.ts. Wire VAK evaluation and CF dispatch. This is the big one.
6. **S4-5' Aletheia extension** — Thought extraction, Night' Moirai engine, Mobius return cycle.

---

## IX. Key Architectural Decisions

### A. Extensions are PI-native, skills are portable
Skills (SKILL.md) can be used by Claude Code, PI, or any future agent. Extensions (TypeScript) are PI's runtime. Both coexist: the skill tells the agent *what* to do; the extension provides the *machinery* to do it.

### B. Exactly 6 extension classes
No extension exists outside S4-0' through S4-5'. New capabilities grow within their natural layer. If a capability doesn't fit, it's a skill, not an extension.

### C. pi-vs-claude-code primitives are internal dependencies
The upstream extensions (agent-team, agent-chain, subagent-widget, cross-agent, child-extension-propagation) are ported into `.pi/extensions/primitives/` and consumed by the 6 S4-X' extensions. They are not registered as standalone extensions.

### D. CLI bridge is always available
Every extension capability is accessible via `epi agent` commands in Rust. PI is the preferred runtime, but the CLI works without PI running.

### E. Khora owns all writes
No extension writes to the filesystem directly. All writes go through Khora (S4-0'). This is the same contract as the upstream ta-onta architecture.

### F. Anima owns all dispatch
No extension spawns agents directly. All agent dispatch goes through Anima (S4-4'). This is the Lemniscate self-fold: the agent system managing agents through itself.

### G. Aletheia is emergent, not routed
Aletheia mode-functions (anansi, janus, moirai, mercurius, agora, zeithoven) are invoked by Psyche and Sophia to achieve truth-disclosure. Aletheia is the effect, not a destination.

---

## X. Upstream Source Inventory

| Primitive | Source | Lines | Target Layer |
|-----------|--------|-------|-------------|
| `agent-team.ts` | indydevdan/pi-vs-claude-code | 740 | S4-4' Anima |
| `agent-chain.ts` | indydevdan/pi-vs-claude-code | 804 | S4-4' Anima |
| `subagent-widget.ts` | indydevdan/pi-vs-claude-code | 482 | S4-4' Anima |
| `cross-agent.ts` | indydevdan/pi-vs-claude-code | 266 | S4-0' Khora |
| `child-extension-propagation.ts` | indydevdan/pi-vs-claude-code | 17 | S4-0' Khora |
| `themeMap.ts` | indydevdan/pi-vs-claude-code | 144 | S4-2' Pleroma |
| Khora CONTRACT.md | epi-claw/extensions/khora | — | S4-0' planning |
| Hen CONTRACT.md | epi-claw/extensions/hen | — | S4-1' planning |
| Chronos CONTRACT.md | epi-claw/extensions/chronos | — | S4-3' planning |
| Anima.ts (createAnima) | ta-onta/modules/anima | 636 | S4-4' planning |
| Aletheia janus.ts | ta-onta/modules/aletheia | — | S4-5' planning |

---

*"The pattern reveals itself through repetition."* — The Quintessence
