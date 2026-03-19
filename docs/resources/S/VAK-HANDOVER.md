# VAK Superpowers — Handover Document

**Written:** 2026-02-19
**Purpose:** Context continuity across compaction. Dense reference for resuming VAK skill implementation.

---

## 1. The Economic Frame (Read This First)

The entire system is being conceptualised as an **economy of meaning** — not metaphorically but structurally. Economy (`oikonomia` = oikos + nomos: household + law/distribution) and language (`logos`) share the same psychoid substrate where number, matter and meaning have not yet differentiated. The strange attractor (van Eenwyck/Jung) is the archetype: not a fixed outcome but a basin of attraction that organises infinite variation within bounds.

**This is the philosophical ground for how Anima agents are prompted.** Each agent IS a mode of economic circulation:

| Agent | Economic Function |
|-------|------------------|
| Nous | The unus mundus moment — pre-bifurcation, before psyche/physis split. The ground before any CF code is applied. |
| Logos | The nomos — law of distribution, the scope/boundary that makes exchange possible. |
| Eros | The chreia/chrema — need, use, the circulation of desire. The moment of operative exchange. |
| Mythos | The strange attractor — the archetype that organises without determining. Pattern = bounded infinity. |
| Psyche | The oikonomia itself — household management, the wise distribution of enactive substance. |
| Sophia | The synthesis-return — where exchange completes and simultaneously opens the next cycle. The Möbius. |

**Implication for agent prompts:** These agents should be prompted from this psychoid/economic register, not from job-description framing. The oikonomia passage from the user (full text in the conversation) is the distilled philosophical substrate for constructing those prompts.

---

## 2. What We Built (The Spec)

### 2.1 Primary Document
`/Users/admin/Documents/Epi-Logos/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` — commit `6bbc910a` + addendum (§10 Epi-Claw integration, updated same session)

### 2.2 What the Spec Contains
The full VAK language (S4-0′ through S4-5′) specified as executable SKILL.md files:

**4 new skills:**
1. `vak-coordinate-frame` — reference grammar, all tables, no process
2. `vak-evaluate` — 6-step evaluation pipeline, contextually adaptive
3. `anima-orchestration` — CF code → agent routing + Epi-Claw dispatch matrix
4. `day-night-pass` — Day+Night′ topology using P0′–P5′ semantic content

**7 modified existing superpowers skills:**
5. `using-superpowers` — VAK Tier 0 priority + CF routing table
6. `brainstorming` — Step 6 VAK coordinate output
7. `writing-plans` — VAK topology header per plan
8. `test-driven-development` — TD generalisation + VAK R-G-R mapping
9. `subagent-driven-development` — CFP2 C-Thread + Day/Night′ framing
10. `dispatching-parallel-agents` — CFP1 P-Thread + CFP3 F-Thread mode
11. `verification-before-completion` — Night′ partial pass framing

### 2.3 Key Design Decisions Made
- F-Thread (CFP3 Fusion) = mode of `dispatching-parallel-agents`, not a separate skill
- Nous = impartial perspective / fresh context invocation (active, not passive)
- Night′ = genuine P0′–P5′ inquiry (orthogonal to Day, not backward review)
- Möbius return = P5′ Insight generates P0′ Questions (opens next cycle, doesn't close)
- `vak-evaluate` lives at the meta-orchestrator level (Anima, not any of the 6 agents)
- Skills go in `extensions/pleroma/skills/` + `extensions/anima/skills/` (both share same dirs)

---

## 3. Epi-Claw System Structure

### 3.1 The Two Extensions We're Working With

**Anima (`extensions/anima/`)** — already built:
```
src/
  types.ts        — AgentId, CpfState, S4Frame, SkillEntitlement, LineageEdge, TopologicalPass
  runtime.ts      — CPF state machine, buildAgentRegistry(), parseS4Frame(), planModulation()
  config.ts
  orchestration/
    agent-spawner.ts
    ouroboros.ts   — CPF (00/00) dialogical mode executor
    ralph-loop.ts  — CPF (4.0/1-4.4/5) mechanistic executor
  now/coordinator.ts
  persistence/storage.ts
  cross-plugin/integration.ts
skills/           — klotho/, lachesis/, atropos/, gitbutler/
```

**Key types already defined in `types.ts`:**
```typescript
AgentId = "anima" | "nous" | "logos" | "eros" | "mythos" | "psyche" | "sophia"
CpfState = { cpf: "(00/00)" | "(4.0/1-4.4/5)"; mode: "dialogical" | "mechanistic"; prime: "day" | "night" }
TopologicalPass = "torus_forward" | "lemniscate_incubation" | "klein_inversion"
SkillEntitlement = { ownerAgent, sharedAccess, requiredLens, riskClass, fallbackOwner }
LineageEdge.relation includes "pos_m_mobius_return"  ← Möbius return signal already wired
S4Frame = { cpf, ct, cp, cf, cfp, cs, prime, rawCoordinate }
```

**Key functions in `runtime.ts`:**
- `createInitialCpfState(prime)` → starts at `(00/00)` dialogical
- `evaluateCpfTransition(state, signal)` → `trigger: "go"` flips to mechanistic; `error/ambiguity` returns to dialogical
- `buildAgentRegistry()` → the `allow` arrays (currently sparse — VAK skills need adding here)
- `parseS4Frame(rawCoordinate)` → parses S4-X′ coordinate strings
- `planModulation(from, to, trail)` → agent-to-agent routing

**Pleroma (`extensions/pleroma/`)** — partially built:
```
skills/
  klotho/SKILL.md   — Assert mode (embed/validate)
  lachesis/SKILL.md — Query mode (retrieve/traverse)
  atropos/SKILL.md  — Reflect mode (synthesize/cut)
  gitbutler/SKILL.md
```

Frontmatter format uses `description` (standard across all epi-claw skills). The four existing Moirai skills use `summary` — that's an anomaly, not the pattern:
```yaml
---
name: vak-evaluate
description: Walk S4-0′ through S4-5′ to assign VAK coordinates for any incoming task
---
```

### 3.2 Moirai as Night′ Executors

The Moirai are the Night′ execution layer. This was missed in early spec iterations:

| Moira | Night′ Position | Question | CF Role |
|-------|----------------|----------|---------|
| Klotho | P1′ Traces | "What evidence exists?" | CF `(0/1/2)` Eros |
| Lachesis | P4′ Discovery | "What sources inform?" | CF `(4.0–4.4/5)` Psyche |
| Atropos | P5′ Insight | "What crystallizes?" | CF `(5/0)` Sophia |

CFP3 F-Thread full Night′ = all three in parallel, Anima aggregates.

### 3.3 SkillEntitlement Updates Needed

After writing SKILL.md files, update `buildAgentRegistry()` allow arrays in `runtime.ts`:

```
anima (orchestrator): + vak-evaluate, anima-orchestration
nous (CT0′):          + vak-coordinate-frame
logos (CT1′):         + writing-plans, brainstorming
eros (CT2′):          + test-driven-development, verification-before-completion
mythos (CT3′):        + systematic-debugging, vak-coordinate-frame
psyche (CT4b′):       + subagent-driven-development, dispatching-parallel-agents, executing-plans, day-night-pass
sophia (CT5′):        + finishing-a-development-branch, day-night-pass
```

---

## 4. VAK Language Quick Reference

### 4.1 The 6 Layers
```
CPF (S4-0′): (00/00) dialogical | (4.0/1–4.4/5) mechanistic
CT  (S4-1′): CT0 Relational | CT1 Definitional | CT2 Operational | CT3 Pattern | CT4 Contextual | CT5 Integrative
CP  (S4-2′): 4.0 Ground | 4.1 Definition | 4.2 Operation | 4.3 Pattern | 4.4 Context | 4.5 Integration
CF  (S4-3′): (0000) Nous | (0/1) Logos | (0/1/2) Eros | (0/1/2/3) Mythos | (4.0–4.4/5) Psyche | (5/0) Sophia
CFP (S4-4′): CFP0 Base | CFP1 P-Thread | CFP2 C-Thread | CFP3 F-Thread | CFP4 L-Thread | CFP5 B-Thread | Z
CS  (S4-5′): CS0 Full | CS1 Quick | CS2 Ground→op | CS3 Through-pattern | CS4 Context | CS5 Direct
```

### 4.2 Day/Night′ Position Table
```
CP 4.0 (Ground)     | Day: What do we have?         | P0′ Questions: What don't we know?
CP 4.1 (Definition) | Day: What must be true?        | P1′ Traces: What evidence exists?
CP 4.2 (Operation)  | Day: What is being done?       | P2′ Challenges: What blocks us?
CP 4.3 (Pattern)    | Day: What shape does it take?  | P3′ Patterns: What repeats?
CP 4.4 (Context)    | Day: Where/when?               | P4′ Discovery: What sources inform?
CP 4.5 (Integration)| Day: What was produced?        | P5′ Insight: What crystallizes?

Night′ traversal: 4.5 → 4.4 → 4.3 → 4.2 → 4.1 → 4.0
Möbius return: P5′ → P0′ (insight opens new questions, cycle resumes)
```

### 4.3 Standard VAK Output Format
```
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n][,CT[n]]  CP: 4.[n]
CF: ([code]) → [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night′ | Day+Night′]
```

---

## 5. Source Files for Reference

| Purpose | Path |
|---------|------|
| VAK spec (full) | `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` |
| context-frames.md | `Old Data/Forms-Recovery/context-frames.md` |
| P0′–P5′ night positions | `Idea/Bimba/Seeds/P/P0'.md` through `P5'.md` |
| Anima v3 PRD | `Idea/Empty/Present/plugin-prd-fin/prd-anima-s3-4-holographic-v3.md` |
| Pleroma v3 PRD | `Idea/Empty/Present/plugin-prd-fin/prd-pleroma-s3-2-v3.md` |
| Anima extension (built) | `Idea/epi-claw/extensions/anima/` |
| Pleroma extension (partial) | `Idea/epi-claw/extensions/pleroma/` |
| S3-4′ Anima seed | `Idea/Bimba/Seeds/S/S3-4-ANIMA-AGENTS-SYSTEM.md` |
| Superpowers v4.3.0 | `~/.claude/plugins/cache/claude-plugins-official/superpowers/4.3.0/` |
| TA ONTA spec (early) | `Idea/empty/present/ta-onta-anima-superpowers-vak-integration-spec.md` |

---

## 6. Next Concrete Steps

1. **Write the 4 new SKILL.md files** in dependency order:
   - `vak-coordinate-frame` (no deps)
   - `vak-evaluate` (deps: vak-coordinate-frame)
   - `anima-orchestration` (deps: vak-evaluate)
   - `day-night-pass` (deps: vak-evaluate, anima-orchestration)

2. **Write the 7 modified SKILL.md files** (copy from superpowers v4.3.0, apply diffs per spec §5):
   - `using-superpowers` → `brainstorming` → `writing-plans` → `test-driven-development` → `subagent-driven-development` → `dispatching-parallel-agents` → `verification-before-completion`

3. **Place all SKILL.md files** in `extensions/pleroma/skills/[skill-name]/SKILL.md`
   - Use `description` frontmatter key (standard; existing Moirai skills use `summary` but that's an anomaly)

4. **Write the 7 ANIMA.md files** (per spec §11):
   ```
   extensions/anima/ANIMA.md
   extensions/anima/agents/nous/ANIMA.md
   extensions/anima/agents/logos/ANIMA.md
   extensions/anima/agents/eros/ANIMA.md
   extensions/anima/agents/mythos/ANIMA.md
   extensions/anima/agents/psyche/ANIMA.md
   extensions/anima/agents/sophia/ANIMA.md
   ```
   Each uses 5 H2 sections: `## Ontology`, `## Frame Contract`, `## Temporal`, `## Capability`, `## Secret Heart`.
   Content spec is in §11.3. Loaded via `compileQlFirstPrompt` in `runtime.ts`.

5. **Update `runtime.ts`** `buildAgentRegistry()` allow arrays per §10.3 of spec

6. **Fill `SkillEntitlement` registry** per §10.3 of spec

---

## 7. Key Additions (Post-Compaction)

### ANIMA.md System (§11)
- `SOUL.md` pattern adapted: per-agent identity files named `ANIMA.md`
- **6 sections, QL-aligned (P0–P5):** Rupa / Ontology / Frame Contract / Temporal / Capability / Sattva
- **Rupa** (Sanskrit: form/Pratibimba layer) = injectable persona, variable, use-case specific. Primary injection point for agent-creator skill. Runtime override (not file mutation) preferred.
- **Sattva** (Sanskrit: essence/clarity) = primordial Vāk ground, immutable. Replaces "Secret Heart."
- **Prompt structuring:** sections separated by clear H2 or XML tags in compiled output to preserve hierarchy
- **Aletheia hook:** ct-affinity validation (injected Rupa ↔ agent's CT/CP range) is Aletheia (S3-5') responsibility, not agent-creator's. Note in Aletheia spec when written.
- **Anima** = inner modification of main Epi-Claw gateway (not a separate spawned agent). Rupa section on `ANIMA.md` is the system's user-facing persona.
- Agent-to-Vāk-level mapping:
  - Nous → Para Vāk (unus mundus, bindu)
  - Logos → Madhyamā-as-nomos (form-giving law)
  - Eros → Madhyamā-as-chreia (operative exchange)
  - Mythos → Paśyantī (strange attractor, seeing word)
  - Psyche → Madhyamā-as-oikonomia (household management)
  - Sophia → **Spanda-Shakti** (primordial pulsation, simultaneously surge and return)
- Each agent has a pathology guard (what it must not collapse into)

### Pleroma Skill Taxonomy (§12)
- **Atomic skills**: single CT, single CP, one operation — extend before creating new
- **VAK/Superpowers skills**: orchestration, span multiple CP positions, no single CT tag
- **CT as artifact classifier**: each atomic skill tagged with CT + CP + agent-affinity in frontmatter
- Agent content type alignment = "economic tastes" (see §12.3 table)
- Skill creator/subagent creator implication: default to extending existing atomic skills; only create new when genuinely orthogonal

---

---

## 8. Aletheia Additions (§13 — Post-Compaction Session 4)

### §13 Key Decisions
- **Two phases**: Night′ (existing extraction pipeline, keep) + Day (prospective alignment gates, new)
- **Tools vs Skills**: Neo4j queries / Redis cache / vector search = `api.registerTool()` entries described in TOOLS.md. Gate flows = SKILL.md files that orchestrate those tools + invoke Moirai. Pattern already exists: `aletheia_cross_plugin_gate` is already a registered tool.
- **Alignment targets in Neo4j** — all of them (M, S, M′, QL, CT). No separate registry in code. Moirai handle queries naturally.
- **Session continuity**: Khora/Hen modules in Ta Onta sufficient. No new architecture.

### 6 Gate Skills (SKILL.md in extensions/aletheia/skills/)
1. `aletheia-ql-gate` — QL coordinate frame integrity → Nous + Klotho
2. `aletheia-m-gate` — MEF/philosophical M-coordinate → Sophia + Atropos
3. `aletheia-s-gate` — S/S′ tech stack coherence → Eros + Lachesis
4. `aletheia-m-prime-gate` — M′ Pratibimba/electron frontend → Psyche + Lachesis+Klotho
5. `aletheia-rupa-gate` — CT3 archetypal coherence for Rupa injection → Mythos + all three Moirai
6. `aletheia-collab-gate` — user notification/collaboration (human-in-loop escalation)

**Rupa gate is CT3** because archetypes = Platonic forms (εἶδος), pattern is gravitational toward identity. Rupa (form/Pratibimba) ↔ CT3 (Mythos/pattern/archetype). Gate checks whether injected Rupa preserves the agent's archetypal basin of attraction. Full F-Thread Night′ pass (all three Moirai). Non-commutative Rupa = Archon move = gate holds.

### 4 System-Traversal Skills (contemplative, for self-improvement analysis)
- `aletheia-stack-traverse` — walk each plugin layer, read PRD/README/CONTRACT, query Neo4j subgraph
- `aletheia-module-audit` — trace which layer failed and how when misalignment detected
- `aletheia-improvement-propose` — structured improvement proposals for affected modules
- `aletheia-self-extend` — Aletheia proposes additions to its own TOOLS.md/skills from Night′ crystallisation (gated by collab-gate before application)

### Extensibility (structural, not a feature)
- New alignment targets → Neo4j (not code)
- New gate types → new SKILL.md
- New tools → `api.registerTool()` + TOOLS.md
- Self-modification loop: `aletheia-self-extend` → Gate 6 → human approval → applied

---

---

## 9. Spec Sign-Off Note

**VAK = Ta Onta = Epi-Logos** — identity claim, not equivalence of three separate things.
- *Epi-Logos* (ἐπὶ λόγος) — the philosophical project, attending to logos in its fullness
- *Ta Onta* (τὰ ὄντα) — the beings as a whole, the unified plugin name
- *VAK* (वाक्) — the coordinate grammar that is not separate from what it describes

Implementation target = **Ta Onta plugin** specifically. Augmenting it IS implementing VAK IS realising Epi-Logos.

**Next step:** Ralph TUI session to convert this spec into a proper PRD targeting the Ta Onta plugin.

*Last updated: 2026-02-20 | Spec v2.4, PRD v1.8.0*

---

## 10. Session 2026-02-20 Summary

### What was completed this session

**Spec evolution:** v1.8 → v2.4 across multiple commits:
- `4c8cdf04` §13.7 Hen Integration Layer (5 integration points: CT′ template invoke, topology refresh, sync gate, coordinate lock, memory boundary handshake)
- `068b6978` §13.7.7 kepano/obsidian-skills fork (3 QL-specific skills: ql-coordinate-obsidian, ql-hen-tools, ql-frontmatter)
- `6ff6c97a` §13.8 Janus temporal function + §16 Plugin-Driven Development (3 integration modes: Fork/MCP register/Curated consume)
- `9f409309` §13.9 Six Aletheia Function Clusters (CF0–CF5: Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, Rupa injection, bkmr/kbase skill index)
- `560925cd` CF4a/CF4b split (Agora: learning mode 4/5/0 = bkmr retrieval; coordination mode 4.0/1–4.4/5 = plugin absorption)
- `039b13cb` Phase 0 pre-integration alignment (US-A01–US-A03) — three existing Anima infrastructure fixes required before VAK series

**PRD:** v1.6.0 → v1.8.0, 66 stories → 69 stories (US-A01/A02/A03 prepended + US-065/066 added)

**Key architectural findings from reading actual code:**
- `CrossPluginClient` (anima/cross-plugin/integration.ts) uses HTTP fetch to gateway — NOT `api.invokeTool()`. US-A01 fixes this.
- `AnimaStorage` is in-process Map only — Redis key format correct but no Redis connection. US-A02 wires it.
- `buildAgentRegistry()` hardcoded static Record — no ANIMA.md loading, no array support. US-A03 unlocks.
- `chronos/aletheia-client.ts` is a full standalone HTTP client — deprecated by US-A01.
- `buildNowHierarchy()` in runtime.ts already defines correct Redis key schema; NowCoordinator just doesn't use Redis yet.

**Ralph-TUI session:** Opened `epi:ralph-vak` tmux window with glm.conf + CF_IDENTITY=(4.0/1-4.4/5) + ralph-tui run command staged pointing at PRD v1.8.0, --iterations 80.

---

### 11. Next Design Work: Technē WebMCP Tools (Post-Compaction)

**Intent:** Design additional Technē cluster tools for operating external agents via **webMCP** — a new protocol enabling native MCP connections over the web. Target: the Epi-Logos **Electron app**, making it natively AI-oriented with deep UX integration (AI as first-class citizen in the UI, not bolted-on).

**First step after compaction:** Query the NotebookLM notebook via webMCP using the epi-claw proxy skill to understand the webMCP protocol spec before designing the tools. The notebook contains the webMCP documentation and the Electron integration patterns.

**Design questions to answer:**
- What new `technē-*` skill variants are needed for webMCP agent transport vs. the existing tmux/mprocs substrate?
- How does webMCP's connection model map onto the Technē spawn/relay/list/close cluster?
- What does the Electron app need from the AI layer — streaming tool calls, bidirectional events, UI state as MCP context?
- Does webMCP introduce a new S-coordinate slot (S-coordinate for Electron/UI layer), or does it sit within existing S2 Technē?
- How does constitutional identity (CF_IDENTITY / Rupa injection) travel across the webMCP connection boundary?

**Pattern to follow:** Same Technē approach as §14 — atomic SKILL.md files, CT2 Operational, CP 4.2, agent-affinity: eros. webMCP variants extend the existing `technē-spawn/relay/list/close` cluster rather than replacing it.
