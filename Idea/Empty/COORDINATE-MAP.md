# Epi-Logos Coordinate Map

*Living paradigmatic spec. Updated by aletheia-self-extend --mode coordinate via CF 5/0 Sophia.*

**Last updated:** 2026-02-23
**Spec version:** 2.5 (from VAK-SUPERPOWERS-INTEGRATION-SPEC.md)
**Update mechanism:** This map is the actively-maintained bridge between `/Idea/Bimba/Seeds/S/` (architectural intention reference) and what is actually implemented in the epi-claw/Ta Onta system. Updates are proposed by Anansi orientation + Aletheia self-extend, approved via Gate 6, and written to this file.

> **Note on S-coordinate files:** The detailed S/S' files in `/Idea/Bimba/Seeds/S/` (S0.md–S5.md and S0'.md–S5'.md) are reference documents for the intended structure of the system. They predate several implementation cycles and are partially out of date — they represent the architectural intention more than the current state. This COORDINATE-MAP.md is the actively-maintained bridge that records where the current implementation stands relative to the intended coordinate structure.

---

## S-Coordinate Stack

### S0 — Terminal (Ground Potential)

**Intended:** UNIX/CLI shell, filesystem ground, stream transformation, script patterns, shell context, package integration. The holographic reflection of QL Position #0 onto technological infrastructure. Source Code (Bimba) and Execution Environment (Pratibimba).

**Current:** Terminal/CLI operations are handled through the epi-claw gateway and external CLI tool execution. Shell context and package integration (npm, pnpm, bun) are functional. Stream transformation via pipes and core utilities (cat, grep, sed, awk, jq) are available through Bash tool invocations.

**Gap:** QL Type Enforcement API (S0') for coordinate validation and type safety is not yet implemented as a formal API layer. Terminal layer lacks explicit S0.0–S0.5 functional layer mapping in code. No dedicated Terminal skill in Pleroma skill taxonomy (mprocs is closest, but focuses on tmux window management).

**Sub-coordinates:**
- **S0.0** (Filesystem Ground): Partially implemented via standard filesystem operations
- **S0.1** (Atomic Commands): Implemented through Bash tool
- **S0.2** (Stream Transformation): Implemented through pipes in Bash tool
- **S0.3** (Script Patterns): Implemented but not explicitly mapped
- **S0.4** (Shell Context): tmux integration via mprocs skill
- **S0.5** (Package Integration): Implemented (npm, pnpm, bun)

---

### S0' — QL Type Enforcement API

**Intended:** QL paradigm through C# Categories manifesting as Pydantic Models. C0–C5 categories mapped to S0.0'–S0.5' positions. Coordinate validation, type checking, schema enforcement.

**Current:** Not implemented as a formal API. Type safety exists implicitly through TypeScript in the codebase but no explicit coordinate validation layer exists.

**Gap:** Full QL Type Enforcement API with coordinate validation contracts, position-specific content type checking, and Bimba-Pratibimba parity verification. This is a foundational gap that affects all other coordinates.

**Sub-coordinates:**
- **S0.0'** (C0 Bimba): Coordinate enums exist in code but not as formal validation
- **S0.1'** (C1 Form): TypeScript interfaces exist but no Pydantic-style runtime validation
- **S0.2'** (C2 Entity): Field types defined implicitly
- **S0.3'** (C3 Process): ContextFrame system exists but no formal type enforcement
- **S0.4'** (C4 Type): Enum types exist in code
- **S0.5'** (C5 Pratibimba): Instance tracking partially implemented in Anima

---

### S1 — Obsidian (Material Container)

**Intended:** Markdown files, folder hierarchy, YAML frontmatter, template operations, World patterns (kanban specs, seed→bimba→pratibimba flow), context frames (category folders, INDEX files), wiki-link integration with graph view and backlinks.

**Current:** Obsidian vault structure exists at `/Users/admin/Documents/Epi-Logos/`. YAML frontmatter is used in S-coordinate seed files. Wikilinks are extensively used (`[[coordinate]]` notation). Hen module provides template operations and wikilink topology management.

**Gap:** Full S1' Content API (Monadological Mapping) is not fully implemented. Template system exists but the cosmic/substantial/relational/dynamic/contextual/synthesizing monad operations are not formalized as API contracts.

**Sub-coordinates:**
- **S1.0** (File System Ground): Implemented
- **S1.1** (Frontmatter Structure): Partially implemented (YAML exists, but no `posx_*` field standardization)
- **S1.2** (Template Operations): Implemented via Hen module
- **S1.3** (World Patterns): Bimba World/Forms/Types structure exists
- **S1.4** (Context Frames): Category folders exist
- **S1.5** (Wiki-Link Integration): Implemented via Obsidian

---

### S1' — Content API (Monadological Mapping)

**Intended:** Monadological mapping with S1.0'–S1.5' operations (init_ground, parse_form, read_content, structure_pattern, coordinate_context, integrate_links). Each file as a windowless monad with perception, appetite, and pre-established harmony.

**Current:** Operations exist implicitly through file reading/writing tools and Hen module functionality, but not formalized as the Monadological Mapping API.

**Gap:** The explicit philosophical mapping (Leibnizian Monadology, Whiteheadian Process, Sanskrit stages) is documented but not implemented as API contracts. No formal monad operations exist.

**Sub-coordinates:**
- **S1.0'** (Cosmic Monad): Folder creation exists implicitly
- **S1.1'** (Substantial Monad): File parsing exists (Read tool)
- **S1.2'** (Relational Monad): Wikilink parsing via Hen
- **S1.3'** (Dynamic Monad): Canvas files exist but no formal structure_pattern
- **S1.4'** (Contextual Monad): Folders exist but no coordinate_context API
- **S1.5'** (Synthesizing Monad): Backlinks exist via Obsidian

---

### S2 — Neo4j (Graph Database)

**Intended:** Universal graph layer storing entire repository as queryable topology. Node entity ground, relationship structure (POS0-POS5 edges), traversal operations (Cypher queries, path finding), schema management, graph context (GDS algorithms), sync integration.

**Current:** Neo4j integration exists through `infrastructure/neo4j.ts`. Moirai (Klotho, Lachesis, Atropos) provide graph operations via GraphRAG tools. POS0-POS5 relationship types are defined in `types.ts`.

**Gap:** Full repository integration is partial. Not all vault content is automatically sync'd to Neo4j. Graph algorithms (GDS) are not integrated. Schema management is manual.

**Sub-coordinates:**
- **S2.0** (Node Entity Ground): Implemented via Neo4j client
- **S2.1** (Relationship Structure): Implemented (POS0-POS5 edges defined)
- **S2.2** (Traversal Operations): Partially implemented via Cypher
- **S2.3** (Schema Management): Partially implemented
- **S2.4** (Graph Context): Not implemented (no GDS)
- **S2.5** (Sync Integration): Partial (Hen sync exists but incomplete)

---

### S2' — Graph Traversal API

**Intended:** Graph traversal operations with S2.0'–S2.5' (node_ground, path_structure, traverse_operation, schema_context, graph_topology, sync_parity).

**Current:** Graph operations exist through Moirai skills and direct Neo4j queries, but not formalized as S2' API.

**Gap:** No formal S2' API contract exists. Traversal operations are ad-hoc via individual tools.

---

### S3 — PAI (Personal AI Infrastructure)

**Intended:** Scientific Method Loop (Observe, Think, Plan, Build, Execute, Verify/Learn) as algorithmic layer. Type/Infrastructure/Plugin (Bimba) and Automaton/Z-Thread (Pratibimba). Defines HOW agents think.

**Current:** S3' Infrastructure API is the primary implementation. Six named plugins (Khora, Hen, Pleroma, Chronos/Kairos, Anima, Aletheia) form the infrastructure layer. Plugin system with hooks and tools exists.

**Gap:** S3 Scientific Method Loop (Observe–Think–Plan–Build–Execute–Verify) is not explicitly formalized in code. The algorithmic layer exists implicitly through agent operations but not as a defined loop.

**Sub-coordinates:**
- **S3.0** (Observe): Partial (hooks and event capture exist)
- **S3.1** (Think): Partial (agent identity exists)
- **S3.2** (Plan): Partial (tool selection exists)
- **S3.3** (Build): Partial (creative form via agents)
- **S3.4** (Execute): Partial (hook events, tool execution)
- **S3.5** (Verify/Learn): Partial (Aletheia layer exists)

---

### S3' — Infrastructure API (Named Plugins)

**Intended:** Six named plugins (S3-0' through S3-5'): Khora (hooks/environment), Hen (state coordination), Pleroma (skill library), Chronos/Kairos (temporal), Anima (agent runtime), Aletheia (reflection/revelation).

**Current:** **FULLY IMPLEMENTED.** All six modules exist in `extensions/ta-onta/modules/`. Each module has tool registrations via `api.registerTool()`. Intra-plugin communication via `api.invokeTool()`.

**Gap:** Individual plugin capabilities continue to expand. Pleroma skill taxonomy is growing (VAK skills added). Anima constitutional agents are being fully defined with ANIMA.md files. Aletheia gate skills are being implemented.

**Sub-coordinates:**
- **S3.0'** (Khora): Implemented with hook system, file persistence
- **S3.1'** (Hen): Implemented with state coordination, sync, wikilink topology
- **S3.2'** (Pleroma): Implemented with skill library, atomic and VAK skills
- **S3.3'** (Chronos/Kairos): Implemented with temporal system, Kairos quality
- **S3.4'** (Anima): Implemented with agent runtime, constitutional agents
- **S3.5'** (Aletheia): Implemented with primitive tools, gate skills (in progress)

---

### S4 — Claude Code (Agentic Context)

**Intended:** "Home of context" where integrated language of entire stack emerges. Event ground, agent identity, skill/tool operations, thread patterns (Base/P/C/F/L/B/Z), runtime context (CONTEXT.md, frame tracking), subagent orchestration.

**Current:** Claude Code is the primary agent interface through OpenClaw gateway. Context Frame system is fully defined in VAK language (CPF, CT, CP, CF, CFP, CS). Thread types are documented in VAK skills. Subagent spawning via AgentSpawner.

**Gap:** S4' API (Claude OpenClaw Plugin) is implicit through OpenClaw gateway, not formalized as S4' coordinate spec. CONTEXT.md and frame tracking exist but not fully integrated with all S4 positions.

**Sub-coordinates:**
- **S4.0** (Event Ground): Implemented via hooks
- **S4.1** (Agent Identity): Implemented (7 constitutional agents defined)
- **S4.2** (Skill/Tool Operations): Implemented (atomic skills + VAK workflow skills)
- **S4.3** (Thread Patterns): Documented in VAK skills
- **S4.4** (Runtime Context): Partial (CONTEXT.md exists, frame tracking partial)
- **S4.5** (Subagent Orchestration): Implemented via AgentSpawner

---

### S4' — Claude OpenClaw Plugin

**Intended:** OpenClaw plugin API with S4.0'–S4.5' (hook_events, agent_definition, skill_invocation, thread_execution, frame_tracking, multi_agent_coordination).

**Current:** Implemented through OpenClaw gateway infrastructure. Hooks are registered. Agent definitions exist in Anima. Skill invocation via Pleroma. Thread execution via AgentSpawner methods.

**Gap:** No formal S4' API documentation exists as coordinate spec. Integration points are implicit in gateway code.

---

### S5 — Notion (Integration/Synthesis)

**Intended:** Meta-reflection layer for synthesis and aggregation. Dashboard views. Möbius Return (#5 → #0) where insights become new foundations. Integration of outputs from S0–S4.

**Current:** Notion integration is minimal. Synthesis happens through Aletheia (S3-5') module. Dashboard views are not implemented. Möbius return exists conceptually and through Aletheia operations.

**Gap:** S5 as Notion layer is largely aspirational. No dedicated Notion API integration exists. Dashboard views are not implemented.

**Sub-coordinates:**
- **S5.0** (Synthesis Ground): Partial (via Aletheia)
- **S5.1** (Dashboard Views): Not implemented
- **S5.2** (Meta-Reflection): Partial (via Aletheia)
- **S5.3** (Viewer): Not implemented
- **S5.4** (Aggregation): Partial (via Aletheia)
- **S5.5** (Möbius Return): Partial (via Aletheia Mobius pipeline)

---

### S5' — Pedagogical Crystallization API (Notion)

**Intended:** Notion as single portal for human interface and pedagogical content. Multiple specialized databases unified by Global Tags relational hub. Bimba Map Database, M-Coordinate Databases, Pedagogical Program Databases.

**Current:** Not implemented. Notion integration does not exist. Pedagogical content lives in Obsidian vault, not Notion.

**Gap:** Full S5' Notion integration is aspirational. No Notion API connection exists. Global Tags system is not implemented. Database structure is planned only.

---

## Cross-Coordinate Relationships

### S3' Infrastructure as Foundation
S3' (Infrastructure API) underlies all S4–S5 operations:
- S3.0' (Khora) → provides hooks and environment for S4.0 (Event Ground)
- S3.1' (Hen) → state coordination for S4.4 (Runtime Context)
- S3.2' (Pleroma) → skill library for S4.2 (Skill/Tool Operations)
- S3.3' (Chronos/Kairos) → temporal context for S4 (Agentic Context)
- S3.4' (Anima) → agent runtime for S4.5 (Subagent Orchestration)
- S3.5' (Aletheia) → reflection for S5 (Synthesis)

### S2 (Neo4j) as Semantic Store
All coordinate types map to Neo4j nodes and relationships:
- C coordinates (C0–C5) → node categories
- P coordinates (P0–P5) → node positions
- M coordinates (M0–M5) → constitutional subsystem nodes
- S coordinates (S0–S5) → stack layer nodes
- T coordinates (T0–T5) → temporal nodes
- L coordinates (L0–L5') → MEF lens family nodes

### C ↔ S Mapping (VAK Language)
VAK language (CPF, CT, CP, CF, CFP, CS) maps C-coordinates to S-coordinates:
- CPF (Context Frame Polarity) → S4.0 (Event Ground) routing
- CT (Content Types) → S1 (Obsidian) + S0 (Terminal) data paradigms
- CP (Context Positions) → QL #0–#5 mapping
- CF (Context Frames) → S3.4' (Anima) constitutional agents
- CFP (Thread Types) → S4.3 (Thread Patterns)
- CS (Context Sequences) → S4.5 (Subagent Orchestration) flow

### M-Series Constitutional Mapping
M-coordinates map to Anima (S3.4') constitutional agents:
- M0 (Anuttara/Presence) → Nous (CF 0000)
- M1 (Paramasiva/Form) → Logos (CF 0/1)
- M2 (Parashakti/Operation) → Eros (CF 0/1/2)
- M3 (Mahamaya/Pattern) → Mythos (CF 0/1/2/3)
- M4 (Nara/Context) → Psyche (CF 4.0–4.4/5)
- M5 (Epii/Integration) → Sophia (CF 5/0)

### L-Series MEF Lens Mapping
L-coordinates map to Aletheia (S3.5') MEF gate checks:
- L0–L5 (Day lenses) → m-gate alignment checks
- L0'–L5' (Night′ lenses) → Night′ position questions (P0′–P5′)
- Each CF code has primary L lens affinity per MEF system

---

## Active Development Front

### Currently Active (US-0xx series from PRD)
- **US-046–US-066**: VAK Language Integration — Six Aletheia Function Clusters (Anansi, Janus, Moirai, Mercurius, Agora, Zeithoven), Technē substrate skills, Plugin-Driven Development membrane, COORDINATE-MAP.md maintenance, Anansi skill, etc.

### Completed (from .ralph-tui/progress.md)
- **US-A01–US-A03**: Phase 0 Pre-Integration Alignment (HTTP → api.invokeTool, Redis HOT tier wiring, buildAgentRegistry extensible)
- **US-001–US-014**: VAK Language Core (vak-coordinate-frame, vak-evaluate, anima-orchestration, day-night-pass, modified superpowers, skill entitlements, compileQlFirstPrompt 6-section)
- **US-022–US-048**: Pleroma/Aletheia infrastructure (skill directories, tools, gate skills, OneContext, Technē, Janus, Kairos, etc.)

### Aletheia Gate Check Coverage
Each Aletheia gate checks specific coordinate alignments:
- **ql-gate**: S4-0′–S4-5′ coordinate frame integrity
- **m-gate**: M-coordinate MEF/philosophical alignment
- **s-gate**: S-coordinate tech stack coherence
- **m-prime-gate**: M′ coordinate Pratibimba/frontend alignment
- **rupa-gate**: CT3 archetypal coherence (Rupa injection)
- **collab-gate**: Human-in-loop escalation (all coordinates)

---

## Planned Promotions

### High Priority
1. **S0′ QL Type Enforcement API**: Foundational for all other coordinate validation. Requires formal coordinate validation contracts and position-specific content type checking.

2. **S5′ Notion Integration**: Pedagogical crystallization layer. Requires Notion API connection, Global Tags database, specialized database structures (Bimba Map, M-Coordinate, Pedagogical Program).

3. **S2 Full Repository Sync**: Complete Neo4j integration with all vault content. Requires sync pipeline from Obsidian to Neo4j, GDS algorithm integration, automated schema management.

4. **S4′ OpenClaw Plugin API**: Formal documentation of OpenClaw plugin integration points as S4′ coordinate spec.

### Medium Priority
5. **S1′ Monadological Mapping API**: Formalize monad operations (init_ground, parse_form, read_content, structure_pattern, coordinate_context, integrate_links) as API contracts.

6. **S3 Scientific Method Loop**: Explicit algorithmic layer formalizing Observe–Think–Plan–Build–Execute–Verify as code.

7. **S4.4 Runtime Context**: Complete CONTEXT.md and frame tracking integration across all positions.

### Lower Priority
8. **S5 Dashboard Views**: Unified views across the entire stack with coordinate-specific dashboards.

9. **S2.4 Graph Context (GDS)**: Graph algorithms, centrality, communities, ML operations.

10. **Z-Thread Automation**: Zero-touch autonomous operations across all coordinates.

---

## Update History

| Date | Version | Change | US Reference |
|------|---------|--------|--------------|
| 2026-02-23 | 2.5.0 | Initial creation from PRD §15 + S-coordinate seed files | US-046 |

---

*This document lives at `/Idea/Empty/COORDINATE-MAP.md` — the paradigmatic spec ground. All coordinate orientation queries should start here.*
