---
coordinate: "S1'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-22T00:00:00Z"
c_3_day_id: "22-04-2026"
c_3_ctx_frame: "5/0"
c_0_source_coordinates:
  - "[[S0]]"
  - "[[S0']]"
  - "[[S1]]"
  - "[[S1']]"
  - "[[S2]]"
  - "[[S2']]"
  - "[[S3]]"
  - "[[S3']]"
  - "[[S4]]"
  - "[[S4']]"
  - "[[S5]]"
  - "[[S5']]"
  - "[[M]]"
  - "[[M']]"
  - "[[S Coordinate Lattice Scaffold]]"
  - "[[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]]"
  - "[[FLOW 2026 04 12 COORDINATE FAMILY SELF DEVELOPMENT AND IDEA RESIDENCY]]"
  - "[[FLOW 2026 04 10 S1 PRIME OBSIDIAN SUBSTRATE ARCHITECTURE]]"
p_5_integrations:
  - "[[Bimba]]"
  - "[[Empty]]"
  - "[[Present]]"
  - "[[Pratibimba]]"
  - "[[Self]]"
  - "[[System]]"
  - "[[ta-onta]]"
  - "[[Khora]]"
  - "[[Hen]]"
  - "[[Anima]]"
  - "[[Aletheia]]"
---

# FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING

This flow completes the foundational naming and residency work begun across:

- [[FLOW 2026 04 10 S1 PRIME OBSIDIAN SUBSTRATE ARCHITECTURE]]
- [[S Coordinate Lattice Scaffold]]
- [[FLOW 2026 04 12 COORDINATE FAMILY SELF DEVELOPMENT AND IDEA RESIDENCY]]
- [[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]]

Its purpose is to lock in three things that must be settled before the envelope field schema becomes a load-bearing foundation rather than another design island:

1. Named S/S' coordinates — every root and first-level subcoordinate gets a planned name and system ownership declaration
2. Technical systems mapped to coordinate home and `/Idea` residency — one row per codebase directory, declared as law
3. The `Pratibimba/System` vs `Pratibimba/Self` split stated as an explicit residency invariant

This is the file the envelope field schema will cite. Everything built on top of the backbone — `epi-lib`, `epi-cli`, `epi-app`, `epi-gnostic`, `ta-onta`, `bimba-mcp`, `epi-spacetime-module` — gets its coordinate home and vault residency declared here so that future development is organised around a shared structural ground rather than local assumption.

## #4 CONTEXT

The recurring failure mode in this system's development has been:

- strong design intent
- good philosophical architecture
- code written without reference to that architecture
- systems that do not know how to relate to one another

The root cause is not poor coding. It is the absence of a **declared structural ground** that each system is required to conform to.

This file is part of establishing that ground.

The S-coordinate family is not merely a labelling convention. It IS the map of the technical stack. Each S-coordinate designates a genuinely distinct layer of the system's being — from raw CLI ground through vault substrate, graph body, gateway runtime, agent execution, and world return. Naming those coordinates and declaring which technical systems live at which coordinate is the act of making the architecture legible to itself.

The `/Idea` vault is the ontological mirror of the whole system. It does not hold the code. It holds the canonical knowledge about the code — identity, architecture, design intent, reflective trace, improvement record. Declaring where each system lives in the vault is what makes the mirror coherent rather than fragmentary.

## #5 INTEGRATION

---

## I. S / S' ROOT COORDINATE NAMING

The twelve root coordinates and their declared names, roles, and primary system ownership.

| Coordinate | Declared Name | Primary Role | Owned System(s) |
|---|---|---|---|
| [[S0]] | Terminal / CLI Ground | Raw execution substrate; shell primitives; the ground layer where computation meets command | `epi-cli` (Rust CLI), `vendor/blake3`, shell tooling |
| [[S0']] | Reflective CLI Law | Declared CLI contract; preferred-tools covenant; how ground-level CLI choices are lawfully made | `khora/S0'/cli-primitives.md`, `preferred-tools.json` |
| [[S1]] | Vault Material Container | The Obsidian filesystem body; `/Idea` as physical substrate; where the ontological mirror is materialised | `/Idea` vault, Obsidian shell, `.obsidian/` |
| [[S1']] | Content Membrane / Compiler Spine | The compilation and content-API layer bridging vault material to agent runtime; frontmatter law; template system; vault health | `claude-memory-compiler` backbone, `hen` content contract, frontmatter schema law |
| [[S2]] | Graph Body | Neo4j raw storage; coordinate-forward node and relation schema; embedding substrate; chunk ingestion | `epi-gnostic` (RAG pipeline), Neo4j, LightRAG, `bimba-mcp` |
| [[S2']] | Coordinate-Aware Retrieval | Graph query law; cross-namespace edge typing; reranking contract; Redis hot/warm context layer; what the graph is permitted to return | `bimba-mcp` query interface, Redis (hot session context + warm promotion), MAPS_TO_COORDINATE / RESONATES_WITH edge law, Graphiti episodic return |
| [[S3]] | Gateway / Shared Runtime | WebSocket gateway; session store; presence layer; shared execution substrate across processes and surfaces | Gateway implementation (WebSocket, port 18794 — implementation slot, not tied to a named product), `epi-spacetime-module` (SpacetimeDB presence) |
| [[S3']] | Temporal Surfacing / State Contract | The lawful temporal and state contract for the runtime; gateway session semantics; kairos surfacing; Chronos temporal ground | `chronos` extension, `kairos-python-adapter.ts`, kerykeion, Janus temporal contract, Redis session metadata store |
| [[S4]] | Agent Execution Package | The ta-onta operational package; the full agentic inhabitation layer; where the agent lives and acts | `.pi/extensions/ta-onta/` (all 6 classes: khora/hen/pleroma/chronos/anima/aletheia) |
| [[S4']] | Agentic Inhabitation Law | The constitutional and invocation law of the agent; VAK grammar; Anima as root; context-frame execution law | Constitutional agents (`anima/S4'/agents/`), VAK law, `agent-chain.yaml`, `teams.yaml` |
| [[S5]] | World Return | External crystallisation surface; Notion sync; publication and delivery; the system presenting itself outward | Notion integration, external API surfaces, publication layer |
| [[S5']] | Recollection / Improvement Law | The law of what the system draws back from each run; crystallisation contracts; autoresearch and precision loops; Sophia and Aletheia governance | `aletheia` extension, Sophia agent, Darshana precision loop, Moirai memory weave, night' pass |

---

## II. S / S' SUBCOORDINATE NAMING

First-level subcoordinates named by their parent's domain mapped through the #0-#5 archetype positions (Ground / Form / Operation / Pattern / Context / Integration).

### [[S0]] / [[S0']] — Terminal / CLI Ground

| y | S0.y | S0.y' |
|---|---|---|
| 0 | **CLI Primitive Ground** — raw shell operations, process spawning, stdin/stdout/stderr | **CLI Contract Ground** — `preferred-tools.json`, `resolve.sh`; declared preference law: read→`bat`/`cat`, search→`rg`/`grep`, list/tree→`eza`/`ls`, navigate→`zoxide`, json→`jq`, select→`fzf`, github→`gh`, task→`just` |
| 1 | **CLI Command Form** — command grammar, argument parsing, epi entry-point structure | **CLI Command Law** — how commands are declared and versioned; the form contract; `just` recipe law |
| 2 | **CLI Execution Operations** — subprocess management, piping, exit code handling, job control | **CLI Execution Contract** — permission model for shell operations; sandboxing intent; `rg` over `grep`, `bat` over `cat` as enforced defaults |
| 3 | **CLI Scripting Patterns** — reusable compositions, workflow patterns, just recipes, mprocs launch patterns | **CLI Pattern Reflection** — pattern library; canonical workflow templates; `cmux` topology patterns |
| 4 | **CLI Context State** — working directory, environment variables, shell session state, `zoxide` jump history | **CLI Context Frame** — fast QV surfacing; lightweight session context injection at CLI level; `fzf`-backed interactive selection for human-in-the-loop flows only |
| 5 | **CLI Integration Surface** — cross-tool composition; `gh` for GitHub host operations; external tool bridges | **CLI Reflective Return** — what a CLI session yields; audit trail; session-end cleanup; hook output capture |

### [[S1]] / [[S1']] — Vault Material Container / Content Membrane

| y | S1.y | S1.y' |
|---|---|---|
| 0 | **Vault Filesystem Ground** — raw `/Idea` directory structure; folder topology; physical container | **Vault Schema Law** — ontological law of the vault; frontmatter schema; residency invariants |
| 1 | **Vault Form Layer** — template system; CT types; canonical note forms; YAML frontmatter shapes | **Vault Form Contract** — canonical CT type definitions; template law; form validation rules |
| 2 | **Vault Write Operations** — `khora_write` primitive; file create/update/delete; sync queue population | **Vault Write Law** — write authority invariant; who can write; sync queue contract; no-direct-write rule |
| 3 | **Vault Compilation Passes** — health checks; lint passes; incremental rebuild; wikilink resolution | **Vault Compiler Spine** — compiler pass contract; ledger append logic; query interface over compiled outputs |
| 4 | **Vault Temporal Context** — Day/NOW folder structure; `Empty/Present` basin; active session folders | **Vault Context Economy** — kbase assembly law; scope and relevance rules for vault retrieval |
| 5 | **Vault Integration Surface** — graph sync bridges; Obsidian plugin hooks; export surfaces | **Vault Return Law** — what the vault crystallises back; promoted artifact contract; canonical residency graduation |

### [[S2]] / [[S2']] — Graph Body / Coordinate-Aware Retrieval

| y | S2.y | S2.y' |
|---|---|---|
| 0 | **Graph Primitive Ground** — Neo4j raw connection; node/relation CRUD; base storage | **Graph Schema Law** — coordinate-forward schema; canonical node property contracts; relation type registry |
| 1 | **Graph Node Forms** — coordinate node shapes; property schemas; Bimba node families | **Graph Form Contract** — how nodes inherit coordinate law; Bimba canonical form |
| 2 | **Graph Ingestion Operations** — RAG-Anything / MinerU parse pipeline; chunking; embedding write | **Graph Operation Contract** — ingestion law; chunk boundary rules; 3072-dim embedding contract |
| 3 | **Graph Retrieval Patterns** — LightRAG query patterns; Cypher templates; cross-namespace traversal | **Graph Relation Patterns** — MAPS_TO_COORDINATE law; RESONATES_WITH classification; edge type semantics |
| 4 | **Graph Context Layer** — session-scoped graph context; vector proximity window; active retrieval window | **Graph Context Economy** — Redis hot layer (fast session context cache, warm promotion queue); reranking contract; episodic return via Graphiti; relevance scoring law. Redis sits here as the hot/warm face of the graph, not at S3 which is gateway-state-only |
| 5 | **Graph Integration Surface** — `bimba-mcp` query interface; external graph API; export shapes | **Graph Return Law** — what graph retrieval is permitted to surface; disclosure density contract |

### [[S3]] / [[S3']] — Gateway / Shared Runtime / Temporal Surfacing

| y | S3.y | S3.y' |
|---|---|---|
| 0 | **Gateway Primitive Ground** — WebSocket base; port 18794; raw connection management. Implementation is a slot — currently a bespoke WebSocket server, may be replaced; the coordinate is the contract, not the product | **Gateway Contract Ground** — protocol v3; hello-ok handshake; session contract invariants; the protocol spec that any gateway implementation must satisfy |
| 1 | **Gateway Message Form** — request/response schema; channel types; message envelope shape | **Gateway Form Law** — method name contracts; OmniPanel parity; techne primitive naming; stable message API surface |
| 2 | **Gateway Session Operations** — session create/list/patch/reset; history semantics; requester routing | **Gateway Operation Contract** — `techne_gateway_start/stop/status`; SessionStore as source of truth; Redis session metadata (session state lives here, separate from graph context Redis at S2.4') |
| 3 | **Gateway Routing Patterns** — agent-scoped routing; swarm dispatch; channel differentiation; stable/runtime session key separation | **Shared State Patterns** — SpacetimeDB presence patterns; multi-session coordination; broadcast semantics; decoupled domain event bus shape |
| 4 | **Gateway Presence Context** — SpacetimeDB live state; torus hash; hexagram presence; tick12 | **Temporal Surfacing** — Chronos temporal contract; kairos state; `planet_degrees[10]`; kerykeion surfacing; Janus threshold state |
| 5 | **Gateway Integration Surface** — app bridge (Electron/Tauri-v2 or successor); external webhook hooks; cross-system broadcast | **Gateway Return Law** — session history shape; arc tracking; what the runtime yielded per session; inter-domain event delivery |

### [[S4]] / [[S4']] — Agent Execution Package / Agentic Inhabitation Law

| y | S4.y | S4.y' |
|---|---|---|
| 0 | **Agent Bootstrap Ground** — `khora`; session identity; bootstrap sequence; varlock secrets | **Bootstrap Law** — bootstrap sequence order is sacred; `khora_write` authority invariant; session ID format |
| 1 | **Agent Content Form** — `hen`; Day/NOW templates; vault folder topology; content membrane | **Content Form Law** — canonical Day/NOW structure; template instantiation contract; `c_` frontmatter law |
| 2 | **Agent Skill Operations** — `pleroma`; skill layer; `techne` helper boundary; tool seams | **Skill Operation Law** — skill contract; techne as bounded helper; tool permission model |
| 3 | **Agent Temporal Patterns** — `chronos`; cron scheduling; session arc patterns; kairos integration | **Temporal Pattern Law** — day arc shape; session boundary invariants; archive before open |
| 4 | **Agent Context Inhabitation** — `anima`; constitutional agents; Psyche; lived-environs; NOW as real environment | **Agentic Inhabitation Law** — VAK execution grammar; team composition contract; CPF (00/00) gate rule |
| 5 | **Agent Return and Crystallisation** — `aletheia`; Sophia; disclosure; cross-system crystallisation | **Agent Return Law** — improvement loop contract; Aletheia subagent roles; Zeithoven next-form shaping |

### [[S5]] / [[S5']] — World Return / Recollection / Improvement Law

| y | S5.y | S5.y' |
|---|---|---|
| 0 | **World Ground** — Notion base; external crystallisation entry point; outward-facing root | **Recollection Ground** — night' pass trigger; session close initiation; archive signal contract |
| 1 | **World Form** — Notion page structures; external artifact forms; publication-ready shapes | **Recollection Form** — what crystallisation artifacts look like; T5' insight form; seed emergence shape |
| 2 | **World Write Operations** — Notion sync; export; external surface write | **Recollection Operations** — Aletheia crystallisation ops; Moirai memory weave; Graphiti arc commit |
| 3 | **World Delivery Patterns** — publication; sharing; external communication shapes | **Episodic Return Patterns** — Graphiti arc completion; episodic trace structure; Janus threshold marking |
| 4 | **World Audience Context** — external delivery surface; audience framing; outward presentation | **Improvement Context** — Sophia developmental vectors; Darshana precision loops; evaluation surfaces |
| 5 | **World Integration / Möbius Return** — full synthesis; the system completing its outward arc | **Improvement Law** — keep/discard rules; promotion path contract; residue class for future learning |

---

## III. TECHNICAL SYSTEMS RESIDENCY MAP

Every codebase directory declared against its coordinate home and `/Idea` residency. This is the law.

| Directory | What It Is | S-Coordinate Home | `/Idea` Residency | Notes |
|---|---|---|---|---|
| `epi-lib/` | C library implementing M0–M5 subsystems (the M' implementation body) | [[S0]] (ground-level implementation, the most fundamental material layer) | **Design/identity:** `Bimba/Map` (canonical M-coordinate identity)<br>**Running face:** `Pratibimba/System` (M' embodiment) | epi-lib is M' — the coded expression of the M-coordinate subsystem identities. Its vault life is split: canonical identity in Map, running representation in System |
| `epi-cli/` | Rust CLI — full M4 Nara + portal, gateway RPC, vault commands | [[S0]] / [[S0']] (CLI ground and reflective CLI law) | `Pratibimba/System` | The CLI is the primary human-facing shell of the whole system. Its design specs land in `Bimba/Seeds`; its running face in `Pratibimba/System` |
| `epi-gnostic/` | Python RAG pipeline — RAG-Anything, LightRAG, Neo4j vector, Gemini embeddings | [[S2]] (graph body and ingestion) | **Architecture:** `Bimba/Seeds`<br>**Running face:** `Pratibimba/System` | The gnostic pipeline IS the S2 layer in operation. Its design and specs belong in Seeds; its live configuration and state face in System |
| `epi-spacetime-module/` | SpacetimeDB WASM module — presence layer (hash, torus, hexagram) | [[S3]] (shared runtime / presence layer) | `Pratibimba/System` | Presence-only. No personal data. The S3 gateway is the slot; SpacetimeDB is the current presence implementation within that slot |
| Gateway implementation | WebSocket server (port 18794) — currently bespoke implementation | [[S3]] / [[S3']] | **Spec:** `Bimba/Seeds`<br>**Running face:** `Pratibimba/System` | This is an implementation slot at S3. The coordinate is the contract. The implementation may be replaced (OpenClaw port, custom, etc.) without the S3 coordinate changing |
| `.pi/extensions/ta-onta/` | The Pi agent operational package — 6 extension classes (khora/hen/pleroma/chronos/anima/aletheia) | [[S4]] / [[S4']] (agent execution package and agentic inhabitation law) | `Pratibimba/Self` | **Critical:** ta-onta goes in `/Self` not `/System` because it IS the agent's own operational body. It is the agent's self — not a tool the agent uses. The Pi agent's reflective life, session history, thought traces all belong here |
| `epi-app/` (Electron/React) | Desktop app — OmniPanel, domain views M0-M5, AI chat, domain hubs | [[S3']] / [[S4']] (temporal + UI-facing inhabitation layer) | `Pratibimba/System` | The app is the human-facing experiential surface of the system. System-embodiment, not agent-self |
| `bimba-mcp/` | MCP server — Neo4j bimba graph queries, sync, coordinate tools | [[S2']] (coordinate-aware retrieval law) | **Spec:** `Bimba/Seeds`<br>**Running face:** `Pratibimba/System` | bimba-mcp is the query interface layer of S2' — it exposes the graph to agents under retrieval law |
| `vendor/blake3/` | Vendored BLAKE3 hash library | [[S0]] (ground primitive dependency) | No vault residency required | Pure external dependency. No ontological mirror needed |
| `_staging/` | Parked skills, hooks, commands awaiting placement | [[S0']] (holding area for CLI and hook primitives not yet promoted) | `Empty/Present` temporarily; graduates to `Bimba/Seeds` or `Pratibimba/System` on promotion | Staging is a pre-canonical basin. Nothing stays here permanently |
| `/Idea` vault | The Obsidian vault itself — the ontological mirror | [[S1]] (vault material container — self-grounding) | IS the residency substrate; self-grounding | The vault is not mirrored elsewhere. It IS the mirror |
| `.pi/` root | Pi agent configuration, skills, hooks, settings | [[S4]] / [[S4']] | `Pratibimba/Self` | Part of the agent's own operational body |
| `docs/` | Plans, specs, design documents, datasets | Spans [[S0']]–[[S5']] (design artifacts for all layers) | `Bimba/Seeds` (canonical plans and specs graduate here); active plans stay in `Empty/Present` | docs/ is a transitional basin. Canonical specs graduate to Seeds. Active plans live in Present |

---

## IV. PRATIBIMBA RESIDENCY INVARIANT

This split is now declared as law. It must not drift.

### `Pratibimba/Self` — The Pi Agent's Own Body

`Pratibimba/Self` holds everything that is the **Pi agent's own reflective life**.

This includes:

- `ta-onta` operational package representations — the agent's own rules, contracts, extension classes
- Session traces — NOW folders, Day folder archives, action histories
- Thought lane crystallisations — T0-T5 thought artifacts, T' inversions
- Work history — project traces, completed task sediment
- PASU.md — the user-identity bootstrap (at CP 4.0, the agent's personal ground)
- CONTINUATION.md recoveries — post-compaction state dumps

The law: if it is **of the agent**, it lives in `/Self`.

The agent is not a tool in the system. It is the subject of the system. Its operational body, its history, its reflective residue — these are its own.

### `Pratibimba/System` — The Technical Body's Vault Face

`Pratibimba/System` holds the **vault representation of the technical systems**.

This includes:

- Running-face representations of `epi-lib`, `epi-cli`, `epi-app`, `epi-gnostic`, `bimba-mcp`, `epi-spacetime-module`
- Subsystem embodiment artifacts — the M'-leaning face of each coded subsystem
- App-facing reflective surfaces — OmniPanel configuration mirrors, domain hub representations
- System configuration and state artifacts not belonging to any canonical Bimba body

The law: if it is **of the technical body** (code, apps, services, running systems), it lives in `/System`.

### The Distinction in One Sentence

`Pratibimba/Self` = what the agent **is**.
`Pratibimba/System` = what the system **runs**.

---

## V. `/Idea` RESIDENCY LADDER

The movement of artifacts through the vault follows a declared ladder. This is the graduation law.

```
Empty/Present (active, temporal, live)
       ↓
Bimba/Seeds (developmental, research, canonical-in-progress)
       ↓
Bimba/World (stabilised, pithy, authoritative)

Pratibimba/Self (agent traces, history, thought sediment — no graduation needed, stays)
Pratibimba/System (system representations — updated as systems evolve, stays)
Bimba/Map (M-coordinate constitutional map — source of canonical subsystem identity)
```

Artifacts are born in `Present`. They graduate toward `World` as they stabilise. They never graduate *out of* `Self` or `System` — those are the living faces of the agent and the technical body.

---

## VI. ENVELOPE COORDINATE HOMES — PREVIEW

With the S/S' names and systems-residency now declared, the envelope layer coordinate homes become precise. This is the bridge to the next FLOW.

| Envelope Layer | Primary S-Coordinate(s) | `/Idea` Residency of Layer Artifacts |
|---|---|---|
| Transport | [[S3]], [[S3.0]], [[S3.1]], [[S3.2]] | None (transport facts have no vault residency — they are ephemeral) |
| Runtime | [[S0']], [[S3]], [[S4.0]], [[S4.0']] | `Pratibimba/Self` (session bootstrap context) |
| Temporal | [[S3']], [[S3.4']], [[S4.3']], [[S5.0']] | `Empty/Present` (Day/NOW folders) |
| Coordinate | [[C']], [[S0']], [[S4']] | `Bimba/World` (coordinate law) |
| Residency | [[S1]], [[S1']], [[S1.0']] | IS the vault — self-grounding |
| Context-Economy | [[S2]], [[S2']], [[S2.4']], [[S4']] | `Empty/Present` (assembled context pool is session-scoped) |
| Lived-Environs | [[S4.4]], [[S4.4']], [[S4.5]] | `Empty/Present` / `Pratibimba/Self` |
| Execution | [[S4']], [[S4.4']], [[C']], [[P]] | `Pratibimba/Self` (run traces) |
| Episodic Reporting | [[T]], [[T']], [[S5.3']] | `Pratibimba/Self` (T-lane crystallisations, episodic traces) |
| Crystallisation | [[S5']], [[T']], [[M']], [[C']] | `Bimba/Seeds` → `Bimba/World` (graduation path) |
| Improvement | [[S5]], [[S5']], [[S5.4']], [[S5.5']] | `Bimba/Seeds` (improvement artifacts, evaluation records) |

---

## VII. S1' AS ENVELOPE SUBSTRATE

This is the architectural principle that makes the envelope a load-bearing abstraction rather than documentation.

### The Vendor Pattern

The `claude-memory-compiler` vendor package demonstrates a stable four-seam pattern:

1. **Hook seam** — capture events as they occur
2. **Ledger** — immutable/append-safe source recording of those events
3. **Compiler passes** — transform and derive meaning from the ledger
4. **Query / return** — surface compiled state on demand

This pattern is mature. It is already the backbone of [[S1']].

### The Augmentation

The vendor pattern as delivered operates over **vault events only** — note writes, link changes, tag mutations. Its compiler understands vault content.

The full envelope is what you get when this pattern is **augmented to cover all S-layers**, not just S1.

Specifically:

- The **hook seam** expands to capture events from every S-layer: transport events (S3), temporal events (S3'), graph events (S2), agent lifecycle events (S4), crystallisation events (S5')
- The **ledger** becomes multi-layered: each S-coordinate family has its own ledger channel, all append-safe, all coordinately typed
- The **compiler passes** understand all 11 envelope concerns, not just vault content
- The **query / return** can surface any layer's compiled state — transport facts, temporal legitimacy, coordinate targeting, residency, context pool, execution state, episodic trace, crystallisation results, improvement record

**The augmented S1' IS the envelope substrate.**

The envelope is not a separate system built on top of S1'. It is S1' extended to know about all S-layers through the same four-seam pattern it already uses for vault content.

This means:

- The implementation path is clear: extend the hook seam to S2, S3, S4, S5 event sources
- The ledger grows new channels but keeps the same append-safe discipline
- The compiler grows new passes but keeps the same incremental rebuild pattern
- The query surface grows new return types but keeps the same contract shape

Coding from this principle prevents the recurring failure: systems that work within their own domain but have no shared substrate through which to coordinate.

---

## VIII. DECOUPLED DOMAIN PRINCIPLE

Each S-coordinate is a **bounded domain**. The envelope is the **integration contract** between domains.

### What a Bounded Domain Means

Each S-domain:

- Has its own internal logic and data model
- Publishes only through envelope fields — it does not expose internals
- Reads only through envelope fields — it does not reach into other domains' internals
- Can be replaced without touching other domains, provided the envelope contract is maintained

Concretely:

- S2 (graph body) can swap Neo4j for a different graph store — S4 (agent) never notices, because S4 reads from the context-economy envelope layer, not from Neo4j directly
- S3 (gateway) can swap its WebSocket implementation — S0 (CLI) never notices, because it reads session state from the runtime envelope layer, not from the gateway socket
- S0' (CLI law) can change which tools are preferred — S4 (agent execution) never notices, because it invokes CLI operations through the S0' contract, not by naming specific binaries

### The Envelope as Anti-Corruption Layer

The envelope fields are not just metadata. They are the **anti-corruption layer** between bounded domains.

When a domain needs something from another domain, it reads an envelope field. It never calls into the other domain's internals.

This is what keeps the system's vision coherent as individual domains evolve. Each domain can be improved, replaced, or extended independently. The envelope is the only shared surface.

### Decoupled Domain Map

| Domain | Publishes to Envelope | Reads from Envelope |
|---|---|---|
| [[S0]] / [[S0']] CLI | CLI context state, preferred tool surface | Nothing — ground layer, no upstream |
| [[S1]] / [[S1']] Vault | Vault schema state, compiled artifacts, residency facts | Temporal (Day/NOW path), coordinate (frontmatter law) |
| [[S2]] / [[S2']] Graph | Retrieved context pool, relation facts, episodic nodes | Coordinate (query targeting), temporal (arc scoping), residency (graph-sync destination) |
| [[S3]] / [[S3']] Gateway | Transport facts, session state, presence context, kairos | CLI (tool surface for launch), vault (session archive destination) |
| [[S4]] / [[S4']] Agent | Execution facts, agent composition, lived context | All layers — the agent is the integrating surface, but reads through envelope, not domain internals |
| [[S5]] / [[S5']] Return | Crystallisation results, improvement records | All prior layers — crystallisation needs full run picture |

### The Invariant

> A domain may only communicate with another domain through envelope fields.
> Direct cross-domain calls are architecture violations.

This invariant is what makes the envelope a load-bearing foundation rather than optional documentation.

---

## NEXT QUILTING SEAM

This file establishes the naming and residency law, the decoupled domain principle, and the S1' augmentation path.

The next move is the **envelope field schema** proper:

- group-by-group named fields for all 11 envelope layers
- each field mapped to its S-coordinate home (now named in Section II)
- each field mapped to its `/Idea` residency (now declared in Section III)
- each field marked cheap (hot, QV/S0.5'-style) or rich (cold, S5'-crystallisation-only)
- each field declared as belonging to a domain's **publish** surface or **read** surface (per Section VIII)

The schema is developed in tandem with the coordinate mappings — they sharpen each other. The coordinate lattice gives the schema its homes; the schema gives the lattice its operational content.

That schema should be written as `FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` and will cite this file as its residency, naming, and domain-decoupling ground.

The schema is also the specification from which the augmented S1' compiler spine (Section VII) can be implemented. Every field in the schema is an event type the hook seam must capture, a ledger channel the ledger must maintain, a compiler pass that must be written, and a return type the query surface must support.
