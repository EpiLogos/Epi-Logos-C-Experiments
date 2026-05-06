---
coordinate: "S4'"
c_4_artifact_role: "orientation"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-24T00:00:00Z"
c_3_day_id: "24-04-2026"
c_3_ctx_frame: "4.0/1-4.4/5"
c_0_source_coordinates:
  - "[[S0']]"
  - "[[S1']]"
  - "[[S2']]"
  - "[[S3']]"
  - "[[S4']]"
  - "[[S5']]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
  - "[[FLOW 2026 04 23 PARALLEL TRACKS HANDOVER]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
---

# FLOW 2026 04 24 ORIENTATION

> **Return here first.** This file is the current-state orientation for the Epi-Logos PI agent build. When beginning a session on ta-onta, the envelope, or any S' coordinate work, read this file before reading anything else.

---

## The Core Architecture (What We Are Building)

The system is a **PI agent** (`@mariozechner/pi-coding-agent`) whose full capability surface is named **ta-onta** — the six S' layer extensions (Khora/Hen/Pleroma/Chronos/Anima/Aletheia) plus their tooling, skills, scripts, hooks, and commands. The S' coordinates are not an abstraction on top of the agent — they ARE the agent's reflective self-understanding of its own substrate.

The **envelope** is the structured context package the agent receives at session start and updates turn by turn. It has 12 semantic layers (Transport → QL Process), 115 fields, 60 of which are hot (always present). The envelope schema is the canonical spec for what the agent knows about itself and its environment.

The **vendor compiler spine** (claude-memory-compiler) has been ported as the four-seam wiring: session_start inject → session_shutdown ledger extract → compiler pass → query surface. This gives us the *container*. The 12-layer field assembly inside that container is what remains to be built.

---

## S' Layer Reality Check — Coordinate First

### [[S0']] — epi-cli (CLI Law / Meta-Tool)

**What it is:** `epi` IS S0'. The CLI binary is not just a convenience wrapper — it is the coordinate contract for everything below. Every infrastructure concern (graph queries, vault ops, agent invocations, gateway control) surfaces through `epi`. The agent gets `epi` as its primary tool.

**What's live:** `epi vault`, `epi gate`, `epi agent`, `epi gnostic` (RAG-Anything pipeline), basic session management.

**Critical gap:** `epi graph` — the Bimba/Parashakti Neo4j coordinate traversal commands — does not yet properly expose Cypher-level graph pathfinding. The Parashakti tools (cross-namespace traversal, coordinate node queries, MAPS_TO_COORDINATE/RESONATES_WITH edge traversal) need to be `epi graph` subcommands, not buried in bimba-mcp or left as Python stubs.

**Also missing:** `epi episodic` — episodic memory tooling (arc open/close/status, episode record, oracle arc, Möbius arc) needs first-class CLI surface. Currently only exposed as ta-onta tools calling HTTP directly to port 37778. This is wrong — they should go through `epi`.

**Distinction to hold:** `epi gnostic` = RAG-Anything document corpus (ingestion, chunking, semantic retrieval from the document body). `epi graph` = Bimba coordinate graph (Cypher traversal, coordinate-aware node queries, the ontological map). These are separate pipelines pointing at the same Neo4j instance but querying fundamentally different information.

---

### [[S1']] — Obsidian Compiler Spine (Vault Content Membrane)

**What it is:** The vendor four-seam pattern ported to PI events. The vault is the material substrate (`/Idea` dir). S1' is the compilation layer that transforms raw vault content into the knowledge base the agent reads at session start. This is NOT about obsidian-cli as an external tool — it's about the compiler pass that reads vault content and produces injectable knowledge.

**What's live:** The four-seam wiring is done (Hen's `spine-contribution.ts` delegates to `compile.py`). The vendor's `knowledge/index.md` is injected as the S1'/hot slot. The ledger structure exists at `epi-dev-vault/ledger/s1/`.

**What needs building:** The remaining 11 envelope-layer compiler passes. Currently only S1' (vault content) has a real compile body. S0'/S2'/S3'/S4'/S5' all have stub compile bodies. The 12 named semantic ledger channels (`transport.ledger`, `coordinate.ledger`, `ql.ledger`, etc.) need to replace or augment the current S-coordinate-named channels (`s0`-`s5`).

**Priority:** The `ql.ledger` compiler pass must be implemented first — per the envelope spec, QL context governs how all other compiler passes interpret their ledger entries.

---

### [[S2']] — Context Economy (Parashakti + RAG-Anything + Graphiti + Redis)

**What it is:** The full retrieval and context assembly surface. Three distinct systems:

1. **Parashakti Neo4j** — coordinate-forward graph store. Queries via `epi graph`. Cypher traversal with MAPS_TO_COORDINATE/RESONATES_WITH edge semantics. 3072-dim embeddings. This is the Bimba map as a live queryable graph.

2. **RAG-Anything** — document corpus ingestion and retrieval. Queries via `epi gnostic`. MinerU multimodal parser → chunking → embedding → Neo4j vector index. Separate namespace from Bimba nodes.

3. **Graphiti** — episodic personal memory. Port 37778 (separate HTTP process). Rooted at `#4.4.4.4 PersonalNexus`. `group_id` property filter on same Neo4j instance. Three temporal axes (session, arc, Möbius). NOT the same as Bimba or gnostic — this is the autobiographical layer.

**Redis:** Two distinct namespaces. `S2.4'` = graph context cache (session-scoped, hot retrieval results). `S3.2'` = gateway session metadata (transport concern). Do not conflate.

**What's live:** `epi gnostic ingest/query/status`, hybrid_retrieve in Hen, basic Graphiti calls in Aletheia. 3072-dim embedding pipeline operational.

**What needs building:** `epi graph` Cypher tools, `epi episodic` arc/episode CLI, proper `s_2_disclosure_density` reranking surface, `s_2_kbase_pool_id` assembly.

---

### [[S3']] — Gateway + SpacetimeDB (Temporal Contract / Shared Runtime)

**What it is:** Two distinct systems that together constitute S3':

1. **Gateway** — WebSocket server on port 18794. Protocol v3. `hello-ok` handshake. Session store as source of truth. This is the message transport and routing layer. Every channel (terminal, app, Telegram, WhatsApp, Slack) enters here.

2. **SpacetimeDB** — presence-only layer. Hash, torus position, hexagram state. NO personal data. Self-hosted local WASM module (`epi-spacetime-module/`). Waiting on rustc≥1.90. This gives the live presence grid: who/what is active, at which torus position, with which hexagram signature.

**Channel integration:** The gateway IS the channel multiplexer. Defining our own `registerChannel` API shape (analogous to OpenClaw's) means defining a typed registration interface that the gateway routes to. Telegram, WhatsApp, Slack first. The epi-claw implementations are the port source — adapt from `OpenClawPluginApi.registerChannel()` to our `ExtensionAPI` equivalent.

**What's live:** Gateway on 18794, protocol v3, techne tools for start/stop/status/session management.

**What needs building:** SpacetimeDB proper activation (rustc version gate), channel registration API shape, `epi spacetime` CLI wrapping both together.

---

### [[S4']] — PI Agent + ta-onta (Agentic Inhabitation Law)

**What it is:** PI agent IS S4'. The agent itself is not a tool the agent uses — it is the S4' instantiation. Ta-onta is the full capability surface: tools, skills, scripts, hooks, commands, resources. The six extension classes (Khora/Hen/Pleroma/Chronos/Anima/Aletheia) are the S' augmentation layers nested inside S4'.

**The VAK/Anima system** is the deepest and most unbuilt part of the current state. VAK (Vak-Artha-Kriya, or in our system the CF coordinate evaluation) governs agent routing and constitutional execution:

- `cpf (00/00)` — Nous gate, requires user co-action, brainstorm mode
- `cf (0/1)` → Logos
- `cf (0/1/2)` → Eros
- `cf (0/1/2/3)` → Mythos
- `cf (4.0/1-4.4/5)` → Anima (Ralph mode, fractal doubling)
- `cf (4.5/0)` → Psyche
- `cf (5/0)` → Sophia

The VAK skill injection (`before_agent_start` reading three SKILL.md files) is mechanically wired but the SKILL.md files themselves are shallow. The constitutional agent files (Anima/Logos/Eros/Mythos/Psyche/Sophia/Nous) exist as stubs with correct structure but lack the depth of the planned system. This is where the most important design work remains.

**CS state machine** (CS0–CS5, tracked per session in Anima extension memory) resets each session — intentionally stateless. The CS position governs context depth and agent scope.

**What needs building:** Deep constitutional agent files, proper VAK skill content, `epi agent vak evaluate` CLI command doing real coordinate evaluation (not stub), Psyche as the lived-environs custodian (Layer 7 of envelope), full team composition logic.

---

### [[S5']] — Karpathy Autoresearch Loop (Improvement Law / Self-Learning Foundation)

**What it is:** S5' has a vendor — the [Karpathy autoresearch repo](https://github.com/karpathy/autoresearch) — in the same way S1' has the claude-memory-compiler vendor. The autoresearch pattern is the spine: the system generates hypotheses about its own improvement, runs evaluations, and keeps or discards challengers. S1' vendor gives us the four-seam compile→knowledge→inject cycle for *content*. S5' vendor gives us the improvement loop for *the system itself* — its coordinate understanding, skill quality, envelope field definitions, and QL schema evolution.

The S5' port mirrors the S1' port: the autoresearch loop becomes the scaffolding, and Sophia/Darshana/Zeithoven are the ta-onta augmentation built around it:

- **Sophia** — identifies improvement vectors from session crystallisation (analogous to SessionEnd flush)
- **Zeithoven** — generates challenger artifacts, next-form candidates (analogous to compile.py)
- **Darshana** — runs precision evaluation, baseline vs challenger (analogous to knowledge/index.md retrieval)
- The loop is explicit, targeted, closed — not ambient drift

**This is the architectural novelty of S5'** relative to a standard memory system. The vendor's compile→knowledge→inject cycle is S1' (content memory). The autoresearch loop is S5' (self-improving architecture). Together they give the system both episodic continuity and genuine developmental capacity.

**What's live:** `cron_evening` wired in Aletheia (HOT→COLD promotion, Möbius return, coordinate map update, Graphiti community build). The night' pass runs. This is the S5' equivalent of the vendor SessionEnd hook — the seam is there, the compiler pass body is not.

**What needs building:** The autoresearch vendor port (analogous to what we did for claude-memory-compiler), Darshana as a real evaluation surface (currently design-only), Zeithoven as a real challenger generator (currently design-only), `epi improve` CLI surface, proper S5' compiler pass reading crystallisation artifacts and producing improvement vectors.

---

## The Next Quilting Seam (What to Do Next)

Per the envelope schema's own directive:

1. **TypeScript interfaces** for the 115 fields (the envelope as a typed struct, not just a markdown schema). This is the prerequisite for everything else — the spine needs to assemble typed objects, not string blobs.

2. **Map existing ta-onta code** to field declarations. Which hot fields are actually populated? Which are stub strings? Which are missing entirely? The audit will reveal the real coverage gap.

3. **Engage with deep planning files.** Before building further, read:
   - `[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]` — the full coordinate law
   - `[[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]]` — the 11-layer rationale
   - The S/S' Forms in `/Idea/Bimba/World/` — the canonical coordinate definitions
   - The constitutional agent files in `anima/S4'/agents/` — the VAK depth is there
   - The PARADIGM.md and CONTINUATION.md templates — what the agent is injected with

4. **epi graph and epi episodic CLI** — these are the two missing `epi` subcommands that unlock S2'. Without them, graph queries remain stubs and episodic tooling remains direct HTTP.

5. **Channel API shape** — define the `registerChannel` interface for our ExtensionAPI context (not OpenClaw's), then port Telegram as the first adapter.

---

## What NOT to Do

- Do not treat epi-claw as the implementation — it is a prototype reference. Adapt patterns, don't copy code.
- Do not use obsidian-cli — our vault access goes through `epi vault` and direct file reads.
- Do not expose Neo4j/Redis/Graphiti/RAG-Anything directly to the agent — they surface through `epi`.
- Do not build more spine before building the typed envelope interfaces — the spine is ready for content but the content needs types first.
- Do not confuse `epi gnostic` (document corpus RAG) with `epi graph` (Bimba coordinate traversal) — these are different pipelines.

---

## Reference Files

| File | What it defines |
|------|----------------|
| `[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]` | 115 fields across 12 layers — the canonical content spec |
| `[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]` | S/S' coordinate law, residency invariants |
| `[[FLOW 2026 04 12 ENVELOPE ARCHITECTURE AND CONTEXT FIELD]]` | 11-layer rationale and structural inspirations |
| `[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]` | Full audit of current ta-onta implementation state |
| `[[FLOW 2026 04 23 PARALLEL TRACKS HANDOVER]]` | Track A (bimba populate) + Track B (spine port) handover |
| `[[FLOW 2026 04 11 S COORDINATE LATTICE SCAFFOLD]]` | S/S' full lattice (84 coordinates with names) |
| `COORDINATE-MAP.md` | Older coordinate map — partially outdated, use for historical context |
| `docs/plans/2026-04-23-vendor-spine-pi-port.md` | The spine port plan (completed 2026-04-24) |
| `[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]` | Anima/Epii agent split, S3' temporal runtime, PI agent API as next work |
