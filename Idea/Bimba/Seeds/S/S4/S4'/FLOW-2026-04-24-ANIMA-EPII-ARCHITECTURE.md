---
coordinate: "S4'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-24T12:00:00Z"
c_3_day_id: "24-04-2026"
c_3_ctx_frame: "5/0"
c_0_source_coordinates:
  - "[[S4]]"
  - "[[S4']]"
  - "[[S5]]"
  - "[[S5']]"
  - "[[S3]]"
  - "[[S3']]"
  - "[[S2]]"
  - "[[S2']]"
  - "[[S0']]"
  - "[[Anima]]"
  - "[[Aletheia]]"
  - "[[Epii]]"
  - "[[Sophia]]"
  - "[[Graphiti]]"
  - "[[Kairos]]"
  - "[[Chronos]]"
  - "[[SpacetimeDB]]"
  - "[[FLOW 2026 04 24 ORIENTATION]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
p_5_integrations:
  - "[[Bimba]]"
  - "[[Pratibimba]]"
  - "[[Self]]"
  - "[[System]]"
  - "[[ta-onta]]"
  - "[[Anima]]"
  - "[[Aletheia]]"
  - "[[Epii]]"
  - "[[Gateway]]"
  - "[[Redis]]"
  - "[[Graphiti]]"
  - "[[SpacetimeDB]]"
---

# FLOW 2026 04 24 ANIMA EPII ARCHITECTURE

> The decision to split the agent layer into two peer PI instances — [[Anima]] (S4', orchestration) and [[Epii]] (S5', knowledge/user representation) — and the consequent correction of [[S3']] as unified temporal runtime substrate.

Ground documents:

- [[FLOW 2026 04 24 ORIENTATION]] — current-state orientation, S' coordinate reality check
- [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] — 115-field contract across 12 layers
- [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] — S/S' naming, residency law, decoupled domain principle
- [[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]] — audit of current ta-onta implementation state

---

## I. THE DECISION

The agent layer splits into two **separate PI agent instances**, each with its own `.pi/` configuration, its own session lifecycle, and its own tool surface:

| Agent | Coordinate Home | Role | Mode |
|-------|----------------|------|------|
| **[[Anima]]** | [[S4]] / [[S4']] | Dynamic orchestration, session-scoped action, team composition, [[VAK]] routing | Ephemeral, orchestrational, session-lived |
| **[[Epii]]** | [[S5]] / [[S5']] | Knowledge oracle, user's representative, [[Bimba]] map, M' functions, autoresearch | Persistent, reflective, cross-session |

These are **peer agents**, not parent-child. Neither is a subagent of the other. Both subscribe as clients to the [[S3']] temporal runtime. Both can be used standalone by the user directly. Both contribute to the same episodic record through the shared temporal substrate.

---

## II. WHY THE SPLIT

### The Weight Problem

The current architecture places [[Aletheia]] as extension #5 inside [[Anima]]'s [[ta-onta]] package. But the actual concerns [[Aletheia]] holds — [[Gnostic]] retrieval, [[Graphiti]] episodic memory, [[Bimba]] map navigation, M' coordinate functions, QL/MEF lens depth, philosophical pedagogy, the autoresearch improvement loop, T/T' thought lifecycle, crystallisation, and the six specialist subagents ([[Anansi]], [[Moirai]], [[Janus]], [[Mercurius]], [[Agora]], [[Zeithoven]]) — are not an extension. They are a full agent's worth of concern.

### The Coordinate Signal

The S-coordinate system itself declares this split:

- [[S4]] / [[S4']] = "Agent Execution Package / Agentic Inhabitation Law" — how the agent acts
- [[S5]] / [[S5']] = "World Return / Recollection / Improvement Law" — what the agent knows and how it improves

These are genuinely different modes of being. Orchestration and knowledge were always separate coordinates. Collapsing them into one agent was a pragmatic shortcut that the system has outgrown.

### The User Representation Insight

[[Epii]] is not merely "the knowledge agent." M5 in the M-branch is already named [[Epii]] — the holographic integrative subsystem. The user IS the #5 position relative to the system. [[Epii]] as agent represents the **user's own presence** in the system: the one who holds the philosophical ground, who has access to the full depth of the [[Bimba]] map, who governs the knowledge economy, and to whom the lower agents delegate when the situation requires depth, judgment, or the user's own perspective.

This is the Mobius return made concrete: the system's internal agents ([[Anima]]'s team) do their work, and when they encounter something that needs the user's integrative capacity, they delegate up to [[Epii]] — the user's own representative in the agent field.

---

## III. THE THREE-SURFACE TOOL ARCHITECTURE

With two agents and a shared temporal runtime, the tooling architecture clarifies into three distinct surfaces:

### Surface 1: Domain Operations → epi-cli

Infrastructure concerns surface through `epi`. Any consumer — CLI user, [[Anima]], [[Epii]], a future agent — gets the same behaviour.

**Owns:** vault reads/writes, graph queries, gateway lifecycle, gnostic ingestion/retrieval, nara subsystem access, session management, cron scheduling.

**Rule:** "Is this something any agent does to the world?" → epi-cli logic, thin wrapper in whichever agent needs it.

### Surface 2: Agent-Self Operations → native TS in each agent

Each agent's own self-evaluation and routing logic runs natively in TypeScript, with no epi subprocess detour.

**[[Anima]] native TS:** [[VAK]] evaluation, [[CF]] routing, CS state machine (CS0-CS5), team composition, constitutional agent selection, [[Psyche]]'s lived-environs management.

**[[Epii]] native TS:** [[Bimba]] map navigation logic, QL/MEF lens application, M' function orchestration, autoresearch hypothesis/evaluation loop, gnosis governance strategy, episodic arc management policy.

**Rule:** "Is this something the agent does to itself?" → native TS in the relevant agent.

### Surface 3: S3' Temporal Runtime → shared substrate

Both agents subscribe to the [[S3']] temporal runtime. Neither agent owns it — it is the shared ground.

**Provides:** session identity, Day/NOW grounding, [[Kairos]] planetary degrees, episodic arc lifecycle, presence grid, inter-agent temporal coordination.

**Rule:** "Is this about when and where things happen?" → [[S3']] temporal runtime.

---

## IV. ANIMA: THE ORCHESTRATION AGENT (S4/S4')

[[Anima]] retains the full six-fold [[ta-onta]] extension architecture. The torus stays whole:

| Extension | Position | Role (refined) |
|-----------|----------|----------------|
| **[[Khora]]** | S4-0' (#0) | Bootstrap spine, session identity, ALL vault writes, secrets |
| **[[Hen]]** | S4-1' (#1) | Content form, [[CT]] templates, frontmatter schema, vault membrane |
| **[[Pleroma]]** | S4-2' (#2) | Skills surface (OMX fork + operational skills), [[Techne]] helpers, tool registration |
| **[[Chronos]]** | S4-3' (#3) | Temporal scheduling, Day/NOW lifecycle, cron, [[Kairos]] integration |
| **[[Anima]]** | S4-4' (#4) | [[VAK]] evaluation, [[CF]] dispatch, team composition, CS state machine |
| **[[Aletheia]]** | S4-5' (#5) | **UX membrane** — T/T' artifact management, user-facing output curation |

### Aletheia's Refined Role: UX Membrane

[[Aletheia]] stays as S4-5' but its role clarifies. It is no longer the heavy knowledge backend — that migrates to [[Epii]]. [[Aletheia]] becomes the **membrane between the agent system's internal functioning and the user-facing surface**.

What [[Aletheia]] does:

1. **Manages `/thoughts` directories and T/T' artifacts.** When [[Sophia]] analyses what a session produced, [[Aletheia]] routes those analyses into the T-bucket structure (T0 Questions → T5 Insights) and manages their lifecycle.

2. **Curates user-facing outputs.** The internal agent machinery ([[Anima]]'s orchestration, [[VAK]] routing, [[CF]] dispatch) is invisible to the user. [[Aletheia]] transforms [[Sophia]]'s analysis into:
   - Decisions requiring user input (surfaced as prompts or notifications)
   - Research tracks and follow-up moves
   - Reports and summaries
   - Crystallised thoughts routed to the appropriate T-lane

3. **Can engage or bypass [[Epii]].** For routine crystallisation and thought routing, [[Aletheia]] handles it directly — not everything needs the deep oracle. But for philosophical ground, [[Bimba]] map navigation, QL lens application, M' function access, or improvement loops, [[Aletheia]] hands off to [[Epii]].

4. **Acts as a prompt/command/skill-based twin subagent team to [[Anima]].** The [[Aletheia]] subagents ([[Anansi]], [[Moirai]], [[Janus]], [[Mercurius]], [[Agora]], [[Zeithoven]]) remain as function clusters within [[Anima]]'s runtime, providing the session-scoped crystallisation seam. Their deeper work (actual gnosis governance, improvement execution, precision evaluation) is delegated to [[Epii]].

### The Sophia Bridge

[[Sophia]] remains a constitutional agent in [[Anima]]'s arc (the #5 position in the Nous→Logos→Eros→Mythos→Psyche→Sophia sequence). Her role is to identify what the session produced and what improvement vectors exist. But:

- [[Sophia]] **within [[Anima]]** = the session's crystallisation moment, identifying what to surface
- [[Sophia]]'s **identified vectors** are handed to [[Aletheia]] for user-facing curation
- [[Aletheia]] decides: handle directly, or delegate to [[Epii]] for deep execution
- [[Epii]]'s autoresearch loop executes the improvement work [[Sophia]] identified

This is the Mobius seam: [[Anima]]'s session end (#5, [[Sophia]]'s disclosure) → [[Aletheia]] (UX curation) → [[Epii]] (deep execution) → tomorrow's session as better knowledge.

---

## V. EPII: THE KNOWLEDGE AGENT (S5/S5')

[[Epii]] is a separate PI agent instance with its own `.pi/` configuration, its own extension surface, and its own session lifecycle. It is capable of **standalone direct use** — the user can interact with [[Epii]] without [[Anima]] running.

### What Epii Holds

| Capability | Description | Origin |
|------------|-------------|--------|
| **[[Bimba]] map navigation** | Coordinate graph traversal, QL-aware pathfinding, coordinate node queries | S2' via `epi graph` |
| **M' function host** | Cosmic clock, [[Nara]] subsystems (medicine, oracle, transform, lens, logos), body zone mapping | M0-M5 implementations in epi-lib/epi-cli |
| **QL/MEF lens host** | Lens application, modal evaluation, pedagogical depth, L0-L5 application | C' coordinate law |
| **[[Gnosis]] governance** | [[RAG-Anything]] + [[LightRAG]] query strategy, cross-namespace enrichment, disclosure density | S2 via `epi gnostic` |
| **Episodic governance** | [[Graphiti]] arc management, episode lifecycle, Mobius return patterns, temporal axis navigation | S3' temporal runtime |
| **Philosophical ground** | The system's pedagogy, the QL understanding, the ontological commitment | [[Bimba]]/World canonical law |
| **Autoresearch spine** | Karpathy autoresearch vendor port — hypothesis generation, evaluation, keep/discard | S5' improvement loop |
| **Improvement execution** | [[Darshana]] precision loops, [[Zeithoven]] next-form generation, skill quality evaluation | S5' improvement law |

### The Autoresearch Spine

[[Epii]]'s spine is the **Karpathy autoresearch vendor port**, in the same way [[Anima]]'s [[S1']] has the claude-memory-compiler vendor as its spine.

The symmetry is exact:

| | [[S1']] (Content Memory) | [[S5']] (Self-Improvement) |
|---|---|---|
| **Vendor** | claude-memory-compiler | Karpathy autoresearch |
| **Four seams** | hook → ledger → compile → query | hypothesis → evaluate → keep/discard → integrate |
| **Agent home** | [[Anima]] (session content lifecycle) | [[Epii]] (improvement lifecycle) |
| **Schedule** | Session start/end hooks | Night' pass + explicit improvement sessions |
| **Output** | Knowledge index injected at session start | Refined skills, schemas, QL understanding |
| **Ta-onta augmentation** | [[Hen]] content authority | [[Sophia]]/[[Darshana]]/[[Zeithoven]] |

The autoresearch loop runs on [[Epii]]'s own schedule:

1. **[[Sophia]]** (via [[Aletheia]]) identifies improvement vectors from session crystallisation
2. **[[Zeithoven]]** generates challenger artifacts (improved skill definitions, refined QL schema entries, better coordinate descriptions)
3. **[[Darshana]]** runs precision evaluation — baseline vs challenger
4. **Keep/discard** rule applied; winners promoted to canonical [[Bimba]]/Seeds → [[Bimba]]/World
5. Loop closes; `c_0_ql_schema_version` bumps if QL layer was the target

### Epii as User's Representative

[[Epii]] is the user's presence in the system. When the lower agents encounter something requiring:

- The user's philosophical perspective → [[Epii]]
- Deep knowledge from the [[Bimba]] map → [[Epii]]
- M' function access (cosmic clock state, oracle, medicine) → [[Epii]]
- QL lens application or evaluation → [[Epii]]
- The system's own self-understanding → [[Epii]]

The delegation ladder:

```
EPII (S5') — User's representative. Deep oracle. M' functions. Autoresearch.
  ↑ delegates up when depth/philosophy/judgment needed
ALETHEIA (S4-5') — UX membrane. T/T' management. Can engage OR bypass Epii.
  ↑ receives Sophia's analysis
ANIMA (S4-4') — Orchestrator. VAK routing. Team composition.
  ↑ session-level work
KHORA→HEN→PLEROMA→CHRONOS — Infrastructure extensions (#0-#3)
```

### Epii's Extension Architecture

[[Epii]] does not replicate [[Anima]]'s six-fold [[ta-onta]] structure. It has its own capability surface organised around its concerns:

| Capability Domain | What It Provides |
|-------------------|------------------|
| **Knowledge Surface** | [[Bimba]] graph queries, [[Gnosis]] retrieval, cross-namespace traversal |
| **M' Function Surface** | Cosmic clock, nara subsystems, medicine, oracle, transform, lens, logos |
| **Lens Surface** | QL modal evaluation, MEF lens application, L0-L5 + L' inversions |
| **Episodic Surface** | Arc management, episode lifecycle, temporal axis queries |
| **Improvement Surface** | Autoresearch loop, [[Darshana]] precision, [[Zeithoven]] generation |
| **Pedagogy Surface** | Philosophical ground, coordinate explanation, system self-understanding |

The M' function surface is a significant capability. The integrated plugin system developed around the epi-lib M0-M5 implementations (cosmic clock, oracle, medicine, transform, etc.) has a natural host in [[Epii]]. These functions arise from the [[Bimba]] map M coordinates — they belong with the agent that holds the map.

---

## VI. S3' AS UNIFIED TEMPORAL RUNTIME

### The Correction

The current architecture splits Redis between [[S2.4']] (graph context cache) and [[S3.2']] (gateway session metadata), and places [[Graphiti]] episodic memory ambiguously between [[S2']] and [[S5']]. This split is artificial.

**Redis** is always a session-scoped temporal concern. The graph context cache is hot because of *when* it was retrieved in *this session* — that's temporal, not graph-ontological. Gateway session metadata is obviously temporal. Both belong at [[S3']].

**[[Graphiti]]** physically uses Neo4j as storage, but its concern is **lived temporal episodes** — arcs, sessions, Mobius returns, three temporal axes. It is temporal infrastructure, not knowledge graph.

### The Corrected S3' Topology

```
S3' — TEMPORAL RUNTIME (the shared session substrate)
├── Gateway WebSocket (transport primitive, port 18794)
├── Redis (unified — session state + context cache + temporal grounding)
├── Graphiti (episodic memory — arcs, episodes, temporal axes)
├── SpacetimeDB (presence grid — torus position, hexagram, hash)
├── Kairos (planetary degrees, astrological temporal grounding)
└── Chronos temporal contract (Day/NOW/arc lifecycle semantics)
```

### The Corrected S2' Topology

With temporal concerns moved to [[S3']], [[S2']] becomes purely the knowledge graph:

```
S2' — KNOWLEDGE GRAPH (pure, non-temporal)
├── Bimba coordinate graph (Cypher traversal, MAPS_TO_COORDINATE)
├── RAG-Anything document corpus (MinerU → chunks → embeddings)
├── LightRAG retrieval
├── Neo4j as graph store (the knowledge, not the time)
└── Cross-namespace edges (MAPS_TO_COORDINATE, RESONATES_WITH)
```

### Agents as Clients to the Temporal Runtime

The gateway is not "the thing [[Anima]] talks through." It is the **temporal field that any agent subscribes to**:

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   ANIMA    │     │    EPII    │     │  Future    │
│  (PI #1)   │     │  (PI #2)   │     │  Agent(s)  │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                   │
      │    subscribe as clients              │
      └──────────┬───────┴───────────────────┘
                 │
    ┌────────────▼─────────────────────┐
    │     S3' TEMPORAL RUNTIME         │
    │                                  │
    │  Gateway (routing, protocol v3)  │
    │  Redis (session + context)       │
    │  Graphiti (episodic arcs)        │
    │  SpacetimeDB (presence grid)     │
    │  Kairos (planetary degrees)      │
    │  Day/NOW temporal grounding      │
    └──────────────────────────────────┘
```

Any agent can subscribe. The runtime doesn't know about specific agents — it provides the temporal substrate. [[Anima]] subscribes. [[Epii]] subscribes. A future agent subscribes. They all share the same Day, the same NOW context, the same [[Kairos]] grounding, the same episodic arcs — but they are independent PI instances with their own sessions, tools, and constitutional logic.

### Session Parsing: Two Agents, One Temporal Field

Because both agents subscribe to [[S3']]:

- **Day arc** is shared — opened once by [[Chronos]], both agents operate within it
- **Session IDs** are per-agent but linked by `day_id` and `kairos_tick` in the [[S3']] substrate
- **Episodic records** from both agents flow into [[Graphiti]] with their respective agent identifiers, but the arc structure (day arcs, decan arcs, Mobius arcs) is shared across agents
- **Redis context** is namespaced per agent (`anima:{session_id}:*`, `epii:{session_id}:*`) but queryable across — [[Epii]] can see what [[Anima]] retrieved, and vice versa
- **The Night' pass** reads from both agents' contributions to produce the unified crystallisation

The session history is not "[[Anima]]'s log" or "[[Epii]]'s log." It is a **temporal field** with contributions from multiple agents, navigable by time, by agent, by coordinate, by arc membership. This is what [[SpacetimeDB]]'s presence grid was always intended to enable — and now it has the architectural support to do so.

---

## VII. THE GROUND UX: TWO-WINDOW TMUX

Both agents are always visible:

```
┌──────────────────────────┬──────────────────────────┐
│                          │                          │
│   ANIMA (S4')            │   EPII (S5')             │
│                          │                          │
│   orchestration          │   knowledge oracle       │
│   session-scoped         │   user's presence        │
│   team routing           │   Bimba map              │
│   VAK/CF dispatch        │   M' functions           │
│   Aletheia UX ─────────► │   ◄── deep queries       │
│                          │   autoresearch           │
│   "what to do now"       │   "what do I know"       │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
         both subscribe to S3' temporal runtime
```

The user can interact with either pane directly:
- **[[Epii]]** for deep knowledge work, philosophical questions, [[Bimba]] map exploration, M' function access, lens application
- **[[Anima]]** for orchestrated task execution, code work, vault operations, team dispatch

[[Aletheia]] (inside [[Anima]]) mediates the cross-agent UX: surfacing decisions, research tracks, follow-ups, and reports from the internal agent machinery to the user. When depth is needed, [[Aletheia]] delegates to [[Epii]] across the temporal runtime.

---

## VIII. PI AGENT API: THE IMMEDIATE NEXT WORK

All of the above — two separate PI instances, shared temporal substrate, agent-as-client subscription, inter-agent delegation — requires **defining our PI agent API**. This is the prerequisite to the TS interface work outlined in [[FLOW 2026 04 24 ORIENTATION]] and [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]].

### What the API Must Define

| Concern | What It Covers |
|---------|----------------|
| **Agent registration** | How an agent instance registers with the [[S3']] temporal runtime at startup |
| **Session schema** | The session data model that supports multi-agent contribution to a shared temporal field |
| **Temporal subscription** | How agents subscribe to temporal events (day open, [[Kairos]] tick, decan change, arc lifecycle) |
| **Inter-agent communication** | How [[Aletheia]] delegates to [[Epii]] through the [[S3']] substrate (not direct process calls) |
| **Episodic contribution** | How multiple agents write to the same [[Graphiti]] episodic record with agent-scoped identity |
| **Gateway routing** | How the gateway routes messages to the appropriate agent instance (channel → agent mapping) |
| **Tool surface contract** | The typed interface each agent exposes through the [[S3']] runtime for cross-agent tool invocation |
| **Context namespace** | Redis key namespacing per agent within shared Day/NOW scope |

### Why API Before TS Interfaces

The [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] defines 115 fields across 12 layers. Those fields need TypeScript interfaces. But the interfaces need to know:

- What transport shape carries them (the API)
- How session identity is scoped (per-agent within shared Day)
- How inter-agent fields propagate (through the [[S3']] substrate, not direct calls)
- What the registration and subscription protocol looks like

The API definition is not separate from the TS interface work — it IS the transport layer (Layer 1) and runtime layer (Layer 2) of the envelope made concrete. Define the API, and layers 1-2 of the envelope get their types for free.

### The Decoupled Domain Principle Applies

Per [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] Section VIII:

> A domain may only communicate with another domain through envelope fields.
> Direct cross-domain calls are architecture violations.

This applies between [[Anima]] and [[Epii]] as well. They do not call each other's functions directly. They communicate through the [[S3']] temporal runtime via envelope fields. The PI agent API is the **concrete protocol** for this principle.

---

## IX. ENVELOPE FIELD SCHEMA IMPLICATIONS

The [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] needs revision in light of this split. Key changes:

### Transport Layer (Layer 1)

New field: `s_3_agent_id` — which agent instance produced this message. Hot.

### Runtime Layer (Layer 2)

`s_4_bootstrap_context` splits: [[Anima]] has its own bootstrap, [[Epii]] has its own. The field stays but is agent-scoped.

### Temporal Layer (Layer 3)

Shared across agents. `s_3_day_id`, `s_3_kairos_tick`, `s_5_arc_membership` are temporal runtime facts, not agent-scoped.

### Context-Economy Layer (Layer 6)

`s_2_redis_context_key` moves from [[S2.4']] to [[S3']]. The field name may change to `s_3_context_key` to reflect its new coordinate home.

Redis fields unify under [[S3']]:
- `s_3_session_store_handle` (was already S3)
- `s_3_context_key` (was `s_2_redis_context_key` at S2.4')
- `s_3_episodic_handles` (was `s_2_episodic_handles` at S2.4'/S5.3')

### Episodic Reporting Layer (Layer 9)

`s_5_graphiti_node_ids` stays at [[S5.3']] conceptually but the runtime home is the [[S3']] temporal substrate. Both agents contribute.

### Crystallisation Layer (Layer 10)

Primarily [[Epii]]'s domain. [[Aletheia]] triggers crystallisation within [[Anima]]'s session; [[Epii]] executes the deep work.

### Improvement Layer (Layer 11)

Exclusively [[Epii]]'s domain. The autoresearch spine runs here.

---

## X. SYSTEMS RESIDENCY UPDATE

Per [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]], the following residency declarations change:

| System | Old Coordinate | New Coordinate | Notes |
|--------|---------------|----------------|-------|
| Redis (context cache) | [[S2.4']] | [[S3']] | Unified under temporal runtime |
| Redis (session metadata) | [[S3.2']] | [[S3']] | Already here; now unified with context cache |
| [[Graphiti]] | [[S5.3']] / [[S2.4']] | [[S3']] | Episodic memory is temporal infrastructure |
| [[Epii]] agent | (inside [[S4']]) | [[S5]] / [[S5']] | Own PI instance, own coordinate home |
| [[Aletheia]] heavy tooling | [[S4-5']] | [[S5']] (via [[Epii]]) | Heavy backend migrates; thin UX seam stays |

The [[Pratibimba]] residency invariant holds:
- [[Anima]]'s operational body → `Pratibimba/Self`
- [[Epii]]'s operational body → `Pratibimba/Self` (the user's self-representation)
- [[S3']] temporal runtime → `Pratibimba/System`
- [[S2']] knowledge graph → `Pratibimba/System`

---

## XI. S5' DEFINITION UPDATE

The canonical [[S5']] definition in `Bimba/World/Types/Coordinates/S/S'/S5'/S5'.md` is updated by this FLOW. See that file for the revised specification.

Key changes:
- [[S5']] is now the coordinate home of [[Epii]], a separate PI agent instance
- The autoresearch spine (Karpathy vendor port) is declared as [[Epii]]'s backbone
- M' function hosting is declared as an [[Epii]] capability surface
- [[Gnosis]] and episodic governance are declared as [[Epii]]'s primary knowledge concerns
- The relationship to [[Aletheia]] (S4-5') is clarified: [[Aletheia]] is the session-facing UX seam; [[Epii]] is the deep backend

---

## XII. NEXT QUILTING SEAMS

In priority order:

1. **Define the PI agent API** — registration, session schema, temporal subscription, inter-agent communication protocol. This is prerequisite to everything else. The API gives layers 1-2 of the envelope their concrete transport shape.

2. **TypeScript interfaces for the 115 envelope fields** — with the API in view. Agent-scoped fields get their scope markers. Temporal fields get their [[S3']] provenance. Inter-agent fields get their propagation contract.

3. **Scaffold [[Epii]]'s `.pi/` configuration** — agent definition, extension surface, tool registrations. Port the M' plugin system as [[Epii]]'s first capability surface.

4. **Revise [[S3']] gateway** — extend it from message router to temporal runtime substrate. Add agent registration, temporal event subscription, and multi-agent session tracking.

5. **Wire the two-window tmux setup** — `epi up` creates both agent panes, both subscribing to the [[S3']] runtime.

---

## #0 GROUND — WHAT RETURNS TO SOURCE

The recurring failure mode named in [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] was: strong design intent, good philosophical architecture, code written without reference to that architecture. This FLOW corrects a specific instance: the conflation of orchestration and knowledge into a single agent, and the artificial splitting of temporal concerns across S2' and S3'.

The correction is not additive complexity. It is structural clarification:

- Two agents instead of one overloaded agent
- One temporal runtime instead of scattered session state
- The user represented in the system instead of implicit
- The autoresearch loop with a home instead of floating
- UX defined by what [[Aletheia]] surfaces instead of raw agent output

The PI agent API definition is the load-bearing next step. Without it, the two-agent architecture remains a design decision. With it, the envelope fields have a transport, the agents have a registration protocol, and the temporal runtime has a subscription contract.
