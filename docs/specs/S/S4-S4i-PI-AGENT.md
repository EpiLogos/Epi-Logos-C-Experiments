# S4/S4' — Pi Agent (Agent / Thought)

**Status:** PLANNED — detailed implementation plan exists, not yet executed
**Coordinate:** S4 (raw agent runtime), S4' (VAK system / ta-onta extensions)
**Implementation:** `epi-cli/src/agent/` (Rust) + `.pi/` (TypeScript extensions)
**CLI Namespace:** `epi agent`

---

## Architectural Role

S4 is the **agent layer** — LLM harness state management, prompt routing, context window compaction. The PI coding agent is the operational AI surface. S4' is the VAK system: context frame invocation, the 6-coordinate reflection family as execution grammar, and the ta-onta domain modules as the agent's ontological extensions.

### Core Principle: Ta-Onta Modules ARE S4' Extensions

The ta-onta plugin system from the Epi-Logos repo is not a separate system — it is the S4' layer's content. The PI agent's only unique extensions for this repo are the **ta-onta modules**, ported and adapted to work through `epi-cli` as their substrate.

### S4 (Explicit) — Raw Agent Runtime
- PI agent binary lifecycle (install, start, stop, doctor)
- Multi-agent directory management (isolated agent configs)
- Provider/model registry (Kimi, MiniMax, GLM, Claude)
- Auth profile management
- Agent spawn with env propagation
- Extension sync from repo `.pi/` into agent dirs

### S4' (Implicate) — VAK System / Ta-Onta
- **epi-citta extension**: the single bridge extension that exposes `epi` CLI as PI tools
- **VAK instruction set**: the 6 reflective coordinate operations (CPF, CT, CP, CF, CFP, CS)
- **Context frame invocation**: `()` operator as execution trigger
- **Ta-onta domain modules** (ported as PI extensions):
  - Khora (bootstrap/context/session)
  - Chronos (temporal pathing/cutover/archive)
  - Anima (NOW lineage/orchestration)
  - Hen (frontmatter/normalization/topology)
  - Aletheia (gate invocation/graph/crystallization)
  - Pleroma (spawn/renderer bridge/coordination)
- **15-agent swarm**: 1 orchestrator (Epii) + 1 VAK compiler (Anima) + 6 base helpers + 7 CF helpers
- **Agent-team/agent-chain orchestration** (from PI ecosystem)

---

## Current State in This Repo

### What Exists
- `epi-cli/src/agent/mod.rs` — stub (`epi agent: not yet implemented`)
- `docs/plans/2026-03-06-s4-pi-agent-foundation.md` — **12-task TDD implementation plan** (ready to execute)
- Pi agent binary: **NOT INSTALLED** (`pi` not found in PATH)

### What's Planned (from implementation plan)
1. Repo-native `.pi/` filesystem scaffold
2. Managed PI agent directory resolution (multi-agent)
3. `epi agent install` / `epi agent doctor`
4. Extension sync from repo `.pi/` into agent dirs
5. Curated PI ecosystem extensions port
6. `epi-citta` extension (the architectural nucleus)
7. Multi-agent management commands
8. Provider/model registry (Kimi, MiniMax, GLM)
9. Auth profile management
10. Managed spawn/run with agent-aware env
11. Skills/commands/hooks scaffold
12. Skills system design doc

---

## epi-citta: The Architectural Nucleus

The `epi-citta` extension is the **only extension authored specifically for this repo**. All other extensions are ported from the PI ecosystem. epi-citta exposes the `epi` CLI as the agent's core substrate:

```typescript
// .pi/extensions/epi-citta.ts
pi.registerTool({
  name: "epi_core_verify",
  description: "Verify a coordinate via epi core verify",
  parameters: Type.Object({ coordinate: Type.String() }),
  async execute(_id, params, _signal, _onUpdate, ctx) {
    return runEpi(["core", "verify", params.coordinate], ctx.cwd);
  },
});
```

### Initial Tool Set
- `epi_core_inspect` — coordinate inspection
- `epi_core_verify` — topological validation
- `epi_vault_read` — vault note retrieval
- `epi_graph_query` — graph context queries
- `epi_agent_help` — agent self-documentation

### Expansion: Ta-Onta Modules as epi-citta Routes
Each ta-onta domain module becomes a set of `epi` CLI routes that the PI agent invokes:
- `epi session init` (Khora) — bootstrap session context
- `epi session now-create` (Chronos) — temporal lifecycle
- `epi vault frontmatter-validate` (Hen) — frontmatter normalization
- `epi graph crystallize` (Aletheia) — graph write path
- `epi agent delegate` (Pleroma) — multi-agent coordination

---

## Integration Architecture

```
PI Agent (external binary)
    |
    +-- .pi/composite-entry.ts (loads all extensions)
    |       |
    |       +-- epi-citta.ts (core bridge -> epi CLI)
    |       +-- cross-agent.ts (multi-agent primitives)
    |       +-- subagent-widget.ts (subagent UI)
    |       +-- agent-team.ts (team orchestration)
    |       +-- agent-chain.ts (chain orchestration)
    |       +-- child-extension-propagation.ts
    |       +-- prompt-url-widget.ts
    |       +-- redraws.ts
    |       +-- themeMap.ts
    |
    +-- epi-citta.ts
            |
            +-- epi core {inspect, verify, walk, ring, m0-m4}
            +-- epi vault {read, write, frontmatter-*}
            +-- epi graph {query, query-context, upsert}
            +-- epi gate {subscribe, send}
            +-- epi agent {delegate, await, help}

epi-cli/src/agent/ (Rust)
    |
    +-- agent_dirs.rs    — multi-agent directory layout
    +-- install.rs       — PI binary installation
    +-- doctor.rs        — health diagnostics
    +-- extensions.rs    — extension sync
    +-- agents.rs        — multi-agent CRUD
    +-- models.rs        — provider/model registry
    +-- auth.rs          — auth profile management
    +-- spawn.rs         — managed PI launch
```

### Dependencies
- PI coding agent binary (`pi` — `@mariozechner/pi-coding-agent`)
- Node.js/Bun runtime (for TypeScript extensions)
- Provider API keys (Kimi, MiniMax, GLM — stored in auth-profiles.json)

---

## Implementation Plan

### Phase 1: PI Setup (Tasks 1-3 from plan)
- Install PI agent
- Create `.pi/` scaffold
- Implement `epi agent doctor` / `epi agent install`

### Phase 2: Extension Infrastructure (Tasks 4-6)
- Extension sync system
- Port curated PI ecosystem extensions
- Author `epi-citta` extension

### Phase 3: Multi-Agent Management (Tasks 7-9)
- Agent CRUD commands
- Provider/model registry
- Auth profile management

### Phase 4: Managed Runtime (Tasks 10-12)
- Managed spawn with env propagation
- Skills/commands/hooks scaffold
- Skills system design

### Phase 5: Ta-Onta Module Port
- Port Khora, Chronos, Anima, Hen, Aletheia, Pleroma as `epi` CLI routes
- Each module becomes a set of `epi` subcommands accessible via epi-citta
- This is where the Epi-Logos repo ta-onta plans convert to our architecture

---

## Ta-Onta -> epi-cli Translation Map

| Ta-Onta Module | epi-cli Namespace | Key Commands |
|---|---|---|
| **Khora** | `epi session` | `init`, `context`, `queue` |
| **Chronos** | `epi session` | `now-create`, `cutover`, `archive`, `cron` |
| **Anima** | `epi agent` | `translate` (VAK compiler), `delegate`, `orchestrate` |
| **Hen** | `epi vault` | `frontmatter-validate`, `normalize`, `topology-check` |
| **Aletheia** | `epi graph` | `crystallize`, `gate-invoke`, `verify-graph` |
| **Pleroma** | `epi agent` | `spawn`, `team`, `chain`, `caps-list`, `exec` |
| **Epii** | `epi sync` + orchestrator | `recompile`, `merge-signatures`, `rollup` |

---

## Authority Documents
- `docs/plans/2026-03-06-s4-pi-agent-foundation.md` (12-task implementation plan)
- `docs/resources/S/2026-02-25-ta-onta-full-architecture-conformance-remediation-plan.md` (Ta-onta conformance)
- `docs/resources/S/2026-02-24-pleroma-pi-primitives-extension-port-plan.md` (Pleroma primitives)
- `docs/resources/S/2026-02-23-pi-harness-customization-reference-for-ta-onta.md` (PI harness)
- `docs/resources/S/2026-02-24-us053-pi-native-subagent-foundation-architecture-and-downstream-impacts.md` (PI native subagent)
- `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S4/S4' module definition)
