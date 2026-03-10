# Aletheia (S4-5') Analysis — Knowledge Crystallization & Gnosis RAG

**Status:** Comprehensive FR/US Extraction and Validation
**Date:** 2026-03-10
**Extension:** Aletheia (S4-5', formerly S3-5')
**S-Layer Fold:** S5 (Sync/Integration)
**Position:** #5 in the ta-onta meta-extension package

---

## Executive Summary

Aletheia is the **integration apex** of the ta-onta extension stack -- the final module that synthesizes all others' output into durable knowledge. It folds S5 (Sync/Integration) into the agent layer, operating as a functional layer *within* the Anima system rather than a standalone plugin. Its primary deliverable is the **Gnosis RAG pipeline** (a local NotebookLM replacement) and the **Night' analysis engine** that crystallizes session learnings into the Bimba coordinate graph.

Aletheia's 6 function clusters (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) are **CF code routing designations** governed by Nous -- not separate systems. They are invoked via CF dispatch routing through the Anima orchestration layer.

### Key Architectural Identity

From the FR Layer Assignment (2026-02-27, verbatim): *"Aletheia (S3-5') is the integration apex of the S3 module stack -- a functional layer within the Anima system -- not a separate plugin building its own tool stack."*

From the TA-ONTA Extension Spec (2026-03-09): *"Aletheia's subagents are Nous's instruments for knowledge dis-closure. Nous governs them; Anima calls Nous."*

Chain of invocation: `Anima -> Nous -> Aletheia subagents -> Gnosis/S0'/S1'/S2' methods`

---

## A. Functional Requirements (FRs)

### A.1 Gnosis RAG Pipeline

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-001** | Docling Serve integration via docling-rs crate for document parsing (PDF/HTML/DOCX/MD) | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: docker-compose entry, Cargo.toml dep, architecture decision documented | P0 |
| **FR-AL-002** | Section-aware hybrid chunking (512 tokens max, 64 token overlap, chat logs as turn-per-chunk) | S4-TA-ONTA-EXTENSION-SPEC.md Section III; Epii corpus design (2026-02-21) | FULL: chunker.rs specified, algorithm ported from Python contextual RAG | P0 |
| **FR-AL-003** | Contextual RAG via Gemini Flash: whole-doc summary + chunk -> 1-2 sentence context prefix, batched (20 chunks/call) | S4-TA-ONTA-EXTENSION-SPEC.md Section III; Epii corpus design Section 3 | FULL: prompt template specified, batch strategy documented | P0 |
| **FR-AL-004** | 3072-dim Gemini embeddings for ingested chunks, unified with Bimba coordinate space | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: dimension choice justified, vector index spec provided | P0 |
| **FR-AL-005** | Neo4j Gnosis namespace (Gnosis:Notebook, Gnosis:Document, Gnosis:Chunk) separate from Bimba, cross-linked via RELATES_TO_COORDINATE edges | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: Cypher schema, relationships, vector index all specified | P0 |
| **FR-AL-006** | Content-hash dedup (BLAKE3) for documents -- skip if already ingested with same hash | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: content_hash property specified | P1 |
| **FR-AL-007** | Retrieval pipeline: embed query (RETRIEVAL_QUERY task type) -> vector search (top-K cosine) -> optional graph enrichment (RRF fusion) -> ranked results | S4-TA-ONTA-EXTENSION-SPEC.md Section III; GraphRAG port completion plan | FULL: data flow documented | P0 |
| **FR-AL-008** | Vimarsa aperture <-> Gnosis:Notebook alignment (each bkmr project = a Gnosis notebook, 7+1 mappings) | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: mapping table, sync flow documented | P1 |
| **FR-AL-009** | Gnosis replaces NotebookLM in KnowingDossier notebook facet -- not a 7th facet, it IS the notebook facet | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: NotebookPulseFacet struct update specified, migration strategy documented | P1 |
| **FR-AL-010** | Model picker integration: gnosis.contextualise, gnosis.embed, gnosis.rewrite keys in PI model registry | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: GnosisModelConfig struct specified, model picker UI behavior described | P2 |
| **FR-AL-011** | Darshana pre-ingestion structural analysis (scout/read/threads) for enriched chunking boundaries | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: integration flow documented, CT1/CT3 range specified | P2 |
| **FR-AL-012** | Books as first-class ingestion source: batch scan ~/Documents/books, `epi book ask` for Gnosis-backed queries | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL: CLI surface specified, ingestion flow documented | P1 |

### A.2 Knowledge Crystallization Pipeline

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-013** | Extract session learnings to /Thought/ on session:stop hook | FR Layer Assignment US-001 | FULL: LearningExtractor class, Khora hook wiring | P0 |
| **FR-AL-014** | QL position categorization for extracted learnings (>80% accuracy target) | FR Layer Assignment US-002 | FULL: LLM classifier with pattern indicators per P0-P5 | P1 |
| **FR-AL-015** | Duplicate learning detection via vector similarity (threshold >= 0.9) creating pos_t_duplicates relationships | FR Layer Assignment US-003 | FULL: Hen GraphRAG + vector similarity integration | P1 |
| **FR-AL-016** | Eros verification mode selection (Assert/Query/Reflect via Moirai CF2 cluster) | FR Layer Assignment US-004 through US-007 | FULL: 3 modes specified with performance targets (<2s Assert, <10s Query) | P1 |
| **FR-AL-017** | Crystallize verified learnings to /Bimba/Forms/ with ULID-based coordinate generation and bimba_state encoding (6-bit QL) | FR Layer Assignment US-008 | FULL: Crystallizer class specified | P1 |
| **FR-AL-018** | T0'-T5' thought routing: P0'->Questions, P1'->Traces, P2'->Challenges, P3'->Patterns, P4'->Discovery, P5'->Insight | S4-EXTENSION-ARCHITECTURE.md Section III; T-coordinate integration plan | FULL: vault path mapping specified | P0 |
| **FR-AL-019** | Create Neo4j pos_{n}_{semantics} relationships via Hen coordination interface | FR Layer Assignment US-009 | FULL: relationship format specified, Hen as builder owner | P1 |
| **FR-AL-020** | Full Extract-Verify-Crystallize pipeline orchestrator (US-001 -> US-007 -> US-008) | FR Layer Assignment US-012 | FULL: pipeline orchestrator specified | P0 |

### A.3 Night' Analysis & Mobius Return

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-021** | Night' analysis engine: Moirai triad (Klotho Assert / Lachesis Query / Atropos Reflect) | S4-EXTENSION-ARCHITECTURE.md Section III; VAK Handover doc Section 3.2 | FULL: CF2 cluster with positional routing | P0 |
| **FR-AL-022** | Janus temporal envelopes: forward/backward temporal context injection | S4-EXTENSION-ARCHITECTURE.md Section III | PARTIAL: mentioned but implementation detail sparse | P1 |
| **FR-AL-023** | P5 -> P0 Mobius 24-hour cycle: insight generates new unknowns, SEED.md refresh | S4-EXTENSION-ARCHITECTURE.md Section III; FR Layer Assignment FR-5 | FULL: Chronos 11 PM trigger, Aletheia executes | P0 |
| **FR-AL-024** | SEED.md creation for next day with unresolved questions + blockers | FR Layer Assignment US-013 | FULL: Khora/Chronos coordination documented | P0 |
| **FR-AL-025** | Update Bimba Seeds with backlinks from crystallized insights | FR Layer Assignment US-014 | FULL: S1' Obsidian scan + Hen backlink addition | P2 |
| **FR-AL-026** | Prepare tomorrow's ground context (NOW.md with SEED as P0) | FR Layer Assignment US-015 | FULL: Khora write path, Chronos timing | P1 |

### A.4 Dis-closure State Machine

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-027** | Collapsible state machine: S0/S1/S2 superposition collapses by context frame per agent needs | S4-TA-ONTA-EXTENSION-SPEC.md Section IV | FULL: 6 CF modes specified (VOID through MOBIUS) | P0 |
| **FR-AL-028** | Per-agent dis-closure packages: Nous prepares germane + necessary knowledge for each executing agent | S4-TA-ONTA-EXTENSION-SPEC.md Section IV | FULL: dis-closure modes table per agent role | P0 |
| **FR-AL-029** | Sophia post-execution review with full Aletheia access (Gnosis retrieval, QV overlay, vimarsa, SEED refresh) | S4-TA-ONTA-EXTENSION-SPEC.md Section IV | FULL: Sophia's baking targets documented | P1 |

### A.5 Aletheia Gate Skills (from VAK Handover Section 8)

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-030** | aletheia-ql-gate: QL coordinate frame integrity -> Nous + Klotho | VAK Handover Section 8, Section 13 | DOCUMENTED in older spec, not yet in S4-TA-ONTA | P2 |
| **FR-AL-031** | aletheia-m-gate: MEF/philosophical M-coordinate -> Sophia + Atropos | VAK Handover Section 8 | DOCUMENTED in older spec | P2 |
| **FR-AL-032** | aletheia-s-gate: S/S' tech stack coherence -> Eros + Lachesis | VAK Handover Section 8 | DOCUMENTED in older spec | P2 |
| **FR-AL-033** | aletheia-m-prime-gate: M' Pratibimba/electron frontend -> Psyche + Lachesis+Klotho | VAK Handover Section 8 | DOCUMENTED in older spec | P3 |
| **FR-AL-034** | aletheia-rupa-gate: CT3 archetypal coherence for Rupa injection -> Mythos + all three Moirai | VAK Handover Section 8 | DOCUMENTED in older spec | P3 |
| **FR-AL-035** | aletheia-collab-gate: user notification/collaboration (human-in-loop escalation) | VAK Handover Section 8 | DOCUMENTED in older spec | P2 |

### A.6 System Traversal Skills (from VAK Handover Section 8)

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-036** | aletheia-stack-traverse: walk each plugin layer, read PRD/README/CONTRACT, query Neo4j subgraph | VAK Handover Section 8 | DOCUMENTED in older spec | P3 |
| **FR-AL-037** | aletheia-module-audit: trace which layer failed and how when misalignment detected | VAK Handover Section 8 | DOCUMENTED in older spec | P3 |
| **FR-AL-038** | aletheia-improvement-propose: structured improvement proposals for affected modules | VAK Handover Section 8 | DOCUMENTED in older spec | P3 |
| **FR-AL-039** | aletheia-self-extend: Aletheia proposes additions to its own TOOLS.md/skills from Night' crystallisation (gated by collab-gate) | VAK Handover Section 8 | DOCUMENTED in older spec | P3 |

### A.7 CLI Surface

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-040** | `epi techne gnosis serve start/stop/status` -- Docling Serve lifecycle (docker) | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P0 |
| **FR-AL-041** | `epi techne gnosis ingest <file|url>` -- single document ingestion with --notebook, --coordinate, --source-type, --author flags | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P0 |
| **FR-AL-042** | `epi techne gnosis ingest-books [--dir PATH]` -- batch ingest from /books directory | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P1 |
| **FR-AL-043** | `epi techne gnosis ingest-chat <session-id>` -- chat log ingestion with --platform flag | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P2 |
| **FR-AL-044** | `epi techne gnosis query "question"` -- semantic search with --notebook, --coordinate, --top-k, --json | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P0 |
| **FR-AL-045** | `epi techne gnosis notebook create/list/delete` -- notebook CRUD | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P1 |
| **FR-AL-046** | `epi techne gnosis document list [--notebook NAME]` -- list ingested documents | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P1 |
| **FR-AL-047** | `epi techne gnosis sync --from-vimarsa` -- sync vimarsa bookmarks to Gnosis | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P2 |
| **FR-AL-048** | `epi techne gnosis status` -- pipeline health check (Docling, Neo4j, embedding API) | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P0 |
| **FR-AL-049** | `epi book ask "question" [--book TITLE]` -- query a book via Gnosis RAG | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P1 |
| **FR-AL-050** | `epi book ingest <file>` / `epi book list` / `epi book status` -- book management shortcuts | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P2 |
| **FR-AL-051** | `epi core actions notebook {create,list,delete,ingest,query,sync}` -- notebook CRUD via core actions branch | S4-TA-ONTA-EXTENSION-SPEC.md Section III | FULL | P1 |
| **FR-AL-052** | `epi agent thought create/route/crystallize` -- thought management via agent CLI bridge | S4-EXTENSION-ARCHITECTURE.md Section VI | FULL | P1 |
| **FR-AL-053** | `epi agent seed refresh/status` -- SEED.md management | S4-EXTENSION-ARCHITECTURE.md Section VI | FULL | P1 |

### A.8 Pedagogical Modes

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-054** | Socratic pedagogical mode: Q0/Q2 tags, output to /Thought/Questions/ | FR Layer Assignment US-018 | FULL | P2 |
| **FR-AL-055** | Cartographic pedagogical mode: P3/P4 tags, output to /Thought/Patterns/ | FR Layer Assignment US-019 | FULL | P2 |
| **FR-AL-056** | Synthetic pedagogical mode: P5 tags, triggers Mobius return | FR Layer Assignment US-020 | FULL | P2 |

### A.9 Infrastructure

| FR ID | Description | Source | Spec Coverage | Priority |
|-------|-------------|--------|---------------|----------|
| **FR-AL-057** | Docker infrastructure: Docling Serve added to docker-compose.epi-s2.yml alongside Neo4j + Redis | S4-TA-ONTA-EXTENSION-SPEC.md Section VI | FULL | P0 |
| **FR-AL-058** | Environment variables: EPILOGOS_DOCLING_URI, GEMINI_API_KEY, GEMINI_EMBED_MODEL, GEMINI_EMBED_DIMS | S4-TA-ONTA-EXTENSION-SPEC.md Section VI | FULL | P0 |
| **FR-AL-059** | LLM tier optimization: FREE (Gemini extraction), CHEAP (GLM Eros), FULL (Claude Mobius) | FR Layer Assignment US-021 | PUSH-DOWN to per-invocation pattern | P2 |
| **FR-AL-060** | Feature flags for all capabilities (staged enablement, reversibility) | FR Layer Assignment NFR table | FULL | P1 |
| **FR-AL-061** | Schema migration path: T1Document/T1Chunk labels -> Gnosis:Document/Gnosis:Chunk multi-labels | S4-TA-ONTA-EXTENSION-SPEC.md Section VII | FULL: migration Cypher provided | P2 |

---

## B. User Stories (USs)

### US-AL-001: Ingest a PDF Document into Gnosis

**As** a knowledge worker,
**I want** to run `epi techne gnosis ingest ~/Documents/books/Tantraloka.pdf --coordinate M0 --notebook M-Consciousness`,
**So that** the document is parsed, chunked, contextualized, embedded, and stored in Neo4j with coordinate links.

**Acceptance Criteria:**
- Docling Serve parses the PDF into structured markdown with section headings
- Chunker produces section-aware splits (512 tokens, 64 overlap)
- Each chunk receives a contextual prefix via Gemini Flash batch call
- 3072-dim embeddings are generated for each contextual_text
- Gnosis:Document and Gnosis:Chunk nodes are created in Neo4j
- RELATES_TO_COORDINATE edge links Document to Bimba:Coordinate{coordinate:"M0"}
- Content-hash dedup prevents re-ingestion of the same file
- CLI reports: "47 chunks ingested, 0 skipped (dedup)"

### US-AL-002: Query Gnosis for Coordinate-Scoped Knowledge

**As** an agent (or user via CLI),
**I want** to run `epi techne gnosis query "What is the nature of Spanda?" --coordinate M2 --top-k 5`,
**So that** I receive the 5 most relevant chunks from M2-aligned documents.

**Acceptance Criteria:**
- Query text is embedded with RETRIEVAL_QUERY task type
- Neo4j vector index returns top-K chunks by cosine similarity
- Results are filtered by coordinate M2 (via RELATES_TO_COORDINATE edges)
- Each result includes: chunk text, similarity score, source document title, coordinate, notebook
- Results are sorted by relevance score descending
- `--json` flag produces machine-readable output for agent pipelines

### US-AL-003: Gnosis Replaces NotebookLM in Knowing Dossier

**As** the `epi core knowing M2` command,
**I want** the notebook facet to query Gnosis natively instead of shelling out to NotebookLM,
**So that** coordinate-aware retrieval is instant and integrated.

**Acceptance Criteria:**
- NotebookPulseFacet.source reads "gnosis" instead of "notebook"
- NotebookPulseFacet.chunks contains Vec<GnosisChunkRef> (structured references)
- No external subprocess spawned -- native async Rust Gnosis query
- Query scoped to coordinate: `gnosis query --coordinate M2 --top-k 3`
- Timeout eliminated (was 2.5s for NotebookLM subprocess)
- Graceful degradation: if Neo4j unavailable, facet reports "gnosis-unavailable"

### US-AL-004: Extract Session Learning to /Thought/

**As** the session:stop hook,
**I want** Aletheia to analyze the session transcript and extract learnings categorized by QL position,
**So that** ephemeral session content crystallizes into durable /Thought/ artifacts.

**Acceptance Criteria:**
- On session:stop, LearningExtractor processes transcript
- Each learning is classified to P0'-P5' position with >80% accuracy
- Classified learning is written to /Thought/{bucket}/ (e.g., /Thought/Questions/ for P0')
- Frontmatter includes: source_session, coordinate, timestamp, thought_lane
- Duplicate detection via vector similarity (>= 0.9 threshold) prevents duplicate entries
- Neo4j: pos_t_extracted_from relationship links Thought to Session

### US-AL-005: Eros Verification of Extracted Learning

**As** the Aletheia extraction pipeline,
**I want** to verify each extracted learning via the Moirai CF2 cluster (Assert/Query/Reflect),
**So that** only validated knowledge enters /Bimba/Forms/.

**Acceptance Criteria:**
- Assert mode (Klotho): 4-check validation in <2s (semantic coherence, factual basis, relevance, coordinate alignment)
- Query mode (Lachesis): GraphRAG verification via Hen in <10s
- Reflect mode (Atropos): synthesis when confidence <0.8 after Assert+Query
- Mode selection persists per session
- Verified learnings proceed to crystallization; failed ones are flagged for human review

### US-AL-006: Crystallize Learning to /Bimba/Forms/

**As** the crystallization pipeline,
**I want** verified learnings to be promoted from /Thought/ to /Bimba/Forms/ with full coordinate metadata,
**So that** knowledge becomes permanent in the Bimba graph.

**Acceptance Criteria:**
- ULID-based coordinate generation for new Bimba forms
- bimba_state encoding (6-bit QL) applied
- Neo4j pos_{n}_{semantics} relationships created via Hen coordination
- /Thought/ source file updated with status=crystallized and backlink to /Bimba/Forms/ entry
- Bimba Seeds scanned for relevant backlink addition

### US-AL-007: Mobius Return and SEED.md Generation

**As** the 11 PM Chronos trigger (or task-completion event),
**I want** Aletheia to execute the full Mobius return pipeline,
**So that** today's insights become tomorrow's P0 ground.

**Acceptance Criteria:**
- Read Daily Note #5 section (Sophia's synthesis)
- Generate SEED.md with: unresolved questions, blockers, insights, next-session coordinates
- SEED.md placed at canonical path for Khora's 6 AM bootstrap
- P5' Insight -> P0' Questions cycle documented in SEED
- Graph updated: MOBIUS_RETURN relationship from today's session to SEED

### US-AL-008: Dis-closure Package Preparation

**As** Nous (right hemisphere of orchestration),
**I want** to invoke Aletheia's subagents to prepare per-agent dis-closure packages,
**So that** each executing agent receives knowledge germane to its identity and necessary for the task.

**Acceptance Criteria:**
- Eros receives motivational ground (gnosis query --coordinate for purpose context)
- Logos receives definitional frame (gnosis query --source-type Canonical)
- Techne receives operational context (gnosis query --source-type SourceTexts)
- Mythos receives archetypal patterns (cross-notebook gnosis query via Mercurius)
- Psyche receives full contextual field (all methods, CF_SYNTHESIS collapse)
- Sophia receives evaluative retrospect (post-execution gnosis query + vault review)
- CF collapse mode determined by task's context frame

### US-AL-009: Batch Book Ingestion

**As** a knowledge worker,
**I want** to run `epi techne gnosis ingest-books --dir ~/Documents/books`,
**So that** all PDF/EPUB/DOCX files in my books directory are ingested into Gnosis.

**Acceptance Criteria:**
- Scan directory for supported file types
- Content-hash dedup: skip already-ingested books
- Each book auto-assigned to "Books" notebook (or --notebook override)
- Progress reporting: "N new books ingested, M chunks created, K already present"
- `--dry-run` flag shows what would be ingested without doing it

### US-AL-010: Vimarsa-to-Gnosis Sync

**As** the vimarsa curiosity workflow,
**I want** bkmr project bookmarks to trigger Gnosis ingestion when they reference files,
**So that** curiosity-driven tagging directly enriches the Gnosis graph.

**Acceptance Criteria:**
- `epi techne gnosis sync --from-vimarsa` reads vimarsa projects (C.db through root.db)
- Bookmarks with file paths trigger ingest if not already in Gnosis
- Tag coordinates (_M4, _#0, _anuttara) become RELATES_TO_COORDINATE edges
- Each vimarsa project maps to its corresponding Gnosis:Notebook
- Session-scoped notebooks created for ad-hoc session bookmarks

### US-AL-011: Book Query via Gnosis

**As** a user reading a book,
**I want** to run `epi book ask "What does Jung say about individuation?"`,
**So that** I get relevant chunks from my ingested book collection.

**Acceptance Criteria:**
- Scoped to --source-type Books filter in Gnosis
- Optional --book flag narrows to specific document
- Returns ranked chunks with page/section references
- Integrates with existing `epi book` subcommand family

### US-AL-012: Collapsible State Machine Operation

**As** the Aletheia retrieval system,
**I want** the S0/S1/S2 method superposition to collapse based on context frame + agent needs,
**So that** each agent gets appropriately scoped dis-closure.

**Acceptance Criteria:**
- CF_VOID: raw dump of all available knowledge (Eros)
- CF_BINARY: essence pair -- S0 pithy + S2 top-1 chunk (Logos)
- CF_TRIKA: trika frame -- S0 + S1 + S2 operational context (Techne)
- CF_FRACTAL: recursive -- chunk -> coordinate -> chunk -> ... (Mythos)
- CF_SYNTHESIS: fused -- all states + cross-family links (Psyche)
- CF_MOBIUS: generative return -- execution + new questions (Sophia)

---

## C. S-Level Inventory (S5 Raw Primitives)

S5 holds the raw external API mechanics that Aletheia consumes. These are the "world layer" primitives.

| Primitive | Status | Location | Description |
|-----------|--------|----------|-------------|
| **Docling Serve lifecycle** | NOT STARTED | `aletheia/S5/docling.rs` (planned) | Docker container management for Docling Serve (start/stop/status) |
| **Gnosis CLI router** | NOT STARTED | `epi-cli/src/techne/gnosis/mod.rs` (planned) | `epi techne gnosis` subcommand tree |
| **Sync/publication surface** | STUB | `epi-cli/src/sync/mod.rs` | Raw n8n/Notion/Telegram API clients (S5 explicit) |
| **Gemini embed client** | PARTIAL (87 LOC) | `epi-cli/src/graph/embeddings.rs` | Single-embed works, batch is sequential loop, no RETRIEVAL_QUERY task type |
| **Neo4j client** | PARTIAL | `epi-cli/src/graph/client.rs` | Basic connection, run/query methods, no Gnosis-specific operations |
| **Redis client** | STUB | `epi-cli/src/graph/redis_cache.rs` | Connection setup only, no Gnosis-specific cache patterns |
| **NotebookLM wrapper** | WORKING | `epi-cli/src/notebook/mod.rs` | Shells out to Python binary, 2.5s timeout -- to be replaced by Gnosis |

### S5 Primitive Gaps

1. **docling_rs crate not yet added to Cargo.toml** -- the Docling Serve Rust HTTP client
2. **Embedding batch with task type** -- embeddings.rs only supports a single embed call with no task_type parameter (RETRIEVAL_DOCUMENT vs RETRIEVAL_QUERY)
3. **Gnosis schema.rs** -- schema.rs only covers Bimba namespace (768-dim vector index); needs Gnosis namespace (3072-dim)
4. **Gnosis store** -- no gnosis_store.rs exists for Document/Chunk/Notebook CRUD
5. **techne/ module** -- the `epi techne` command branch does not exist yet in epi-cli

---

## D. S'-Level Inventory (S5' QL Augmentations)

S5' holds the QL-augmented behaviors that give S5 primitives coordinate meaning.

| Augmentation | Status | Location | Description |
|--------------|--------|----------|-------------|
| **Gnosis RAG pipeline** | NOT STARTED | `techne/gnosis/ingest.rs` (planned) | Full parse->chunk->contextualize->embed->store pipeline |
| **Gnosis retrieval engine** | NOT STARTED | `techne/gnosis/query.rs` (planned) | Embed query -> vector search -> graph enrichment -> rank |
| **Dis-closure modes** | NOT STARTED | (planned) | Per-agent knowledge packaging via collapsible state machine |
| **Knowledge crystallization** | NOT STARTED | (planned) | Extract -> Verify -> Crystallize pipeline |
| **Night' analysis engine** | NOT STARTED | (planned) | Moirai triad, Janus temporal envelopes, SEED.md generation |
| **T0'-T5' thought routing** | NOT STARTED | (planned) | Position-categorized thought extraction and vault routing |
| **Gnosis notebook facet** | NOT STARTED | `core/knowing/notebook.rs` rewrite planned | Replace NotebookLM subprocess with native Gnosis query |
| **Gate skills** | NOT STARTED | (planned) | 6 alignment gates + 4 system traversal skills |

### Key S5' Design Decisions

1. **Gnosis replaces NotebookLM** -- not additive, replacement. The NotebookPulseFacet type stays but source changes from subprocess to native Gnosis query.
2. **Notebook CRUD in `epi core actions`** -- keeping `epi core knowing` read-only, write operations go to actions branch.
3. **Session-scoped notebooks** -- ad-hoc Gnosis:Notebook nodes with session ID for temporary ingestion context.
4. **3072-dim unified embedding space** -- both Bimba:Coordinate and Gnosis:Chunk share the same vector space for cross-namespace similarity.

---

## E. Gnosis Pipeline Analysis

### E.1 Ingestion Pipeline (Parse -> Chunk -> Contextualize -> Embed -> Store)

```
STAGE 1: PARSE
  Input: PDF/HTML/DOCX/MD/ChatLog (file path or URL)
  Tool: Docling Serve via docling-rs (POST /convert)
  Output: Structured markdown with section headings
  Status: NOT IMPLEMENTED
    - docling_rs not in Cargo.toml
    - docling_client.rs does not exist
    - Docker container config specified in docker-compose.epi-s2.yml (spec only)

STAGE 2: CHUNK
  Input: Structured markdown from Stage 1
  Tool: Rust chunker (section-aware hybrid splitting)
  Config: max_chunk_size=512 tokens, overlap=64 tokens
  Special: Chat logs use turn-per-chunk with speaker metadata
  Output: Vec<RawChunk> with section_heading, chunk_index, speaker fields
  Status: NOT IMPLEMENTED
    - chunker.rs does not exist
    - Algorithm fully specified (port from Python epii/corpus)

STAGE 3: CONTEXTUALIZE
  Input: Whole document summary + individual chunks
  Tool: Gemini Flash (batched, up to 20 chunks per call)
  Prompt: "Give a short succinct context (1-2 sentences) to situate this chunk..."
  Output: contextual_text = "{context}\n\n{raw_text}"
  Status: NOT IMPLEMENTED
    - No contextualisation module exists
    - Prompt template fully specified (from Anthropic contextual RAG paper)
    - Model picker key: gnosis.contextualise

STAGE 4: EMBED
  Input: contextual_text per chunk
  Tool: Gemini embedding API (3072-dim, RETRIEVAL_DOCUMENT task type)
  Output: Vec<f32> per chunk (3072 dimensions)
  Status: PARTIAL
    - embeddings.rs EXISTS (87 LOC) with single-embed and sequential batch
    - MISSING: RETRIEVAL_DOCUMENT vs RETRIEVAL_QUERY task type differentiation
    - MISSING: 3072-dim default (currently defaults to 768)
    - MISSING: outputDimensionality parameter per the spec's 3072 requirement
    - Model picker key: gnosis.embed

STAGE 5: STORE
  Input: Document metadata + chunks with embeddings
  Tool: Neo4j via neo4rs
  Operations: Find-or-create Gnosis:Document, write Gnosis:Chunk children,
              create RELATES_TO_COORDINATE edges, content-hash dedup
  Status: NOT IMPLEMENTED
    - No gnosis_store.rs or gnosis_schema.rs exist
    - schema.rs only covers Bimba namespace
    - Cypher statements fully specified in spec

STAGE 6: INDEX
  Neo4j vector index auto-indexes new Gnosis:Chunk nodes
  Status: NOT IMPLEMENTED (spec provides CREATE VECTOR INDEX statement)

STAGE 7: NOTIFY (optional)
  Emit event for S3'/gateway live update
  Status: NOT IMPLEMENTED (future concern)
```

### E.2 Retrieval Pipeline (Query -> Embed -> Search -> Enrich -> Rank)

```
STAGE 1: EMBED QUERY
  Input: Natural language question + optional coordinate/notebook filters
  Tool: Gemini embedding API (RETRIEVAL_QUERY task type)
  Output: 3072-dim query vector
  Status: PARTIAL (embeddings.rs exists but no task type support)

STAGE 2: VECTOR SEARCH
  Input: Query vector, filters
  Tool: Neo4j vector index (gnosis_chunk_embeddings)
  Query: Top-K nearest chunks by cosine similarity
  Filters: coordinate, notebook, source_type
  Output: Ranked chunk candidates with similarity scores
  Status: NOT IMPLEMENTED

STAGE 3: GRAPH ENRICHMENT (optional)
  Input: Vector search results + coordinate filter
  Tool: Neo4j graph traversal
  Query: Bimba:Coordinate -> RELATES_TO_COORDINATE -> Gnosis:Chunk
  Fusion: RRF (Reciprocal Rank Fusion) of vector + graph scores
  Output: Re-ranked results with both vector and graph proximity scores
  Status: NOT IMPLEMENTED
    - GraphRAG port completion plan exists (2026-03-09) for Bimba retrieval
    - Gnosis-specific retrieval needs additional work

STAGE 4: RETURN
  Output: Ranked chunks with text, score, source document, coordinate, notebook
  Include: Parent document metadata for context
  Status: NOT IMPLEMENTED
```

### E.3 What Exists vs What Needs Building

| Component | Exists? | LOC | Status | Gap |
|-----------|---------|-----|--------|-----|
| `graph/embeddings.rs` | YES | 87 | Single embed works | No task type, batch is sequential, default 768 not 3072 |
| `graph/schema.rs` | YES | 99 | Bimba-only | No Gnosis schema, vector index is 768 not 3072 |
| `graph/client.rs` | YES | ~200 | Basic Neo4j | No Gnosis-specific queries |
| `graph/redis_cache.rs` | YES | stub | Connection only | No Gnosis cache patterns |
| `graph/retrieval/` | YES | stubs | graphrag.rs, hybrid.rs, coordinate.rs | Stubs, being implemented per graphrag-port-completion plan |
| `notebook/mod.rs` | YES | 97 | NotebookLM wrapper | To be replaced by Gnosis |
| `core/knowing/notebook.rs` | YES | ~100 | NotebookLM subprocess | To be rewritten for Gnosis |
| `techne/gnosis/` | NO | 0 | - | Entire module tree needed |
| `graph/gnosis_store.rs` | NO | 0 | - | Document/Chunk/Notebook CRUD |
| `graph/gnosis_schema.rs` | NO | 0 | - | Gnosis schema init + vector index |
| `techne/gnosis/chunker.rs` | NO | 0 | - | Section-aware chunking |
| `techne/gnosis/docling_client.rs` | NO | 0 | - | Docling Serve HTTP client |
| `techne/gnosis/ingest.rs` | NO | 0 | - | Full ingestion pipeline |
| `techne/gnosis/query.rs` | NO | 0 | - | Retrieval engine |
| `techne/gnosis/notebook.rs` | NO | 0 | - | Notebook CRUD CLI |
| `techne/gnosis/sync.rs` | NO | 0 | - | Vimarsa sync |
| `core/actions/notebook.rs` | NO | 0 | - | Notebook actions |

**Estimated new Rust LOC:** ~3000-5000 across all Gnosis modules

---

## F. Subagent Analysis

### F.1 Anansi (CF0 -- Nous/Orientation)

**Current Definition:** File does NOT exist on disk. The git status shows a rename from `plugins/pleroma/agents/aletheia/anansi.md` to `plugins/ta-onta/aletheia/S5'/agents/anansi.md`, but the target directory was never materialized.

**Role:** Gap analysis -- identifies what the agent does NOT know about the task at hand. Operates at CF0 (Nous orientation).

**Alignment with Nous-as-Governor:** STRONG. Anansi is naturally Nous's first instrument -- before disclosing knowledge, Nous must identify what is *missing*. Anansi queries the gap between /Empty (what could be known) and /Present (what is currently known).

**What Needs Building:**
- Agent definition markdown with CF0 routing, tool entitlements, dis-closure scope
- Integration with `gnosis query` to identify coordinate-level knowledge gaps
- Logic: given task coordinates, query Gnosis for coverage; report coordinates with no/sparse chunks

**Gnosis/S0'/S1'/S2' Method Mapping:**
- S0': `epi core knowing <coord>` -- what pithy self-descriptions exist
- S2': `gnosis query --coordinate <coord>` -- are there source chunks?
- Gap = coordinates where S2' returns empty but S0' has defined pithys

### F.2 Mercurius (CF3 -- Mythos/Kairos)

**Current Definition:** File does NOT exist on disk (same rename issue).

**Role:** Cross-domain translation -- identifies what foreign coordinates (outside the task's primary family) are relevant. Bridges M <-> P, S <-> L, etc.

**Alignment with Nous-as-Governor:** STRONG. Mercurius provides the cross-family perspective that Nous needs to prepare complete dis-closure packages. Without Mercurius, agents would only see their own coordinate family.

**What Needs Building:**
- Agent definition markdown with CF3 routing, cross-family query logic
- Multi-notebook Gnosis query across different family notebooks
- Cross-family graph traversal via Bimba coordinate relationships

**Gnosis/S0'/S1'/S2' Method Mapping:**
- S2': `gnosis query` across ALL notebooks (not scoped to one family)
- S2': Neo4j graph traversal for cross-family Bimba edges
- S0': Cross-family pithy correlations

### F.3 Janus (CF1 -- Logos/Temporal)

**Current Definition:** File does NOT exist on disk (same rename issue).

**Role:** Temporal context -- provides forward (what is planned) and backward (what happened) temporal envelopes. Named for the two-faced Roman god of transitions.

**Alignment with Nous-as-Governor:** STRONG. Janus provides the temporal dimension that static knowledge retrieval misses. For any task, Nous needs to know what came before and what is expected next.

**What Needs Building:**
- Agent definition markdown with CF1 routing, temporal query logic
- Session history query (previous sessions' NOW.md content via Khora)
- Forward planning context (SEED.md, planned tasks, pending PRDs)
- Temporal envelope packaging for agent consumption

**Gnosis/S0'/S1'/S2' Method Mapping:**
- S1': Vault note reading (previous daily notes, SEED.md)
- S2': Neo4j session lineage (parentNowId, childNowId chains)
- S0': Temporal coordinate state (Chronos kairos assessment)

### F.4 Moirai (CF2 -- Eros/Triad)

**Current Definition:** File does NOT exist on disk (same rename issue). However, the Moirai concept is extensively documented across multiple specs (VAK Handover, FR Layer Assignment, Orchestrator Spec, T-coordinate plan).

**Role:** Evidence gathering / Night' analysis. A CF2 cluster with 3 internal modes:
- **Klotho** (P1' Traces): "What evidence exists?" -- Assert mode, 4-check validation
- **Lachesis** (P4' Discovery): "What sources inform?" -- Query mode, GraphRAG
- **Atropos** (P5' Insight): "What crystallizes?" -- Reflect mode, synthesis

**Alignment with Nous-as-Governor:** STRONG but COMPLEX. Moirai operates as a unit under Nous, but its internal routing (Klotho/Lachesis/Atropos) requires sub-dispatch within CF2. This is the most architecturally complex subagent.

**What Needs Building:**
- Moirai agent definition with CF2 routing and internal positional dispatch
- Klotho: 4-check semantic validation (coherence, factual basis, relevance, coordinate alignment)
- Lachesis: GraphRAG query orchestration via Hen
- Atropos: Synthesis when confidence thresholds not met
- Full Moirai CF2 cluster can run in CFP3 F-Thread (all 3 in parallel, Anima aggregates)

**Gnosis/S0'/S1'/S2' Method Mapping:**
- S2': `gnosis query` for evidence chunks (Klotho validation material)
- S2': Hen GraphRAG for semantic search (Lachesis sources)
- S0': Coordinate validation (Klotho alignment check)
- S1': Vault artifact reading for context (Atropos synthesis input)

### F.5 Agora (CF4 -- Psyche/Learning)

**Current Definition:** File does NOT exist on disk (same rename issue).

**Role:** Consensus -- aggregates parallel Gnosis retrievals from multiple subagents. Has two modes:
- **CF4a Learning mode (4/5/0):** bkmr/vimarsa retrieval -- the "thinking with books" mode
- **CF4b Coordination mode (4.0/1-4.4/5):** Plugin absorption -- aggregating outputs from other Aletheia subagents

**Alignment with Nous-as-Governor:** STRONG. Agora is Nous's aggregation layer -- when multiple subagents produce parallel results, Agora synthesizes them into a coherent dis-closure package.

**What Needs Building:**
- Agent definition markdown with CF4 dual-mode routing
- Aggregation logic: collect outputs from Anansi/Mercurius/Janus/Moirai
- Consensus ranking: RRF-like fusion of multiple retrieval results
- Learning mode: vimarsa project browsing via bkmr integration

**Gnosis/S0'/S1'/S2' Method Mapping:**
- S2': Multiple parallel `gnosis query` calls aggregated
- S0': Vimarsa project listing and tag browsing
- S2': RRF fusion of vector + graph scores from multiple sources

### F.6 Zeithoven (CF5 -- Sophia/Synthesis)

**Current Definition:** File does NOT exist on disk (same rename issue).

**Role:** Temporal conductor -- manages cadence for knowledge refresh cycles. Named as a portmanteau (Zeit=time + Beethoven=conductor).

**Alignment with Nous-as-Governor:** MODERATE. Zeithoven is more of a scheduling/timing concern than a knowledge retrieval instrument. Its alignment with Nous is through determining *when* knowledge refresh should happen, not *what* knowledge to retrieve.

**What Needs Building:**
- Agent definition markdown with CF5 routing
- Cadence scheduling logic: when to trigger re-embedding, re-indexing, SEED refresh
- Integration with Chronos temporal hooks (11 PM / 6 AM triggers)
- Knowledge decay detection: identify stale Gnosis chunks needing refresh

**Gnosis/S0'/S1'/S2' Method Mapping:**
- S2': Gnosis metadata queries (chunk age, staleness)
- S0': Temporal state queries (Chronos kairos)
- S5': n8n workflow triggers for automated refresh cycles

### F.7 Summary: All Subagent Files Need Creation

**CRITICAL FINDING:** None of the 6 Aletheia subagent definition files exist on disk. The git status shows renames from `plugins/pleroma/agents/aletheia/` to `plugins/ta-onta/aletheia/S5'/agents/`, but the target directory `plugins/ta-onta/aletheia/` does not exist. The aletheia directory tree needs to be created from scratch.

The subagent definitions should follow the ANIMA.md pattern (5 H2 sections: Ontology, Frame Contract, Temporal, Capability, Secret Heart/Sattva) as specified in VAK Handover Section 7.

---

## G. M-Level Mapping

### G.1 M5 Epii -- Logos Cycle Echo

Aletheia's deepest M-branch relation is to M5 Epii and its Logos cycle. The parallel:

| M5 Epii (C library, `m5.c`) | S4-5' Aletheia (agent layer) |
|------------------------------|------------------------------|
| Logos FSM state machine (ticks 0->11) | Retrieval state machine (dis-closure collapse) |
| Tick 0->11 coordinate walk | S0->S1->S2 method collapse per agent |
| `m5_lookup(coord, granularity)` = master self-API | `gnosis_query(query, coord, scope)` = master retrieval API |
| Mobius return (tick 11 -> tick 0, Sacred Violation) | Insight -> Question cycle (P5' -> P0') |
| Sacred Violation (cast away const on M0 ground) | Knowledge crystallization (chunk -> Bimba edge) |
| Quintessential View (per-coordinate pithy) | Gnosis chunk (per-coordinate source evidence) |
| S0'/S1'/S2' compression trika (C owns pithy, hooks to Obsidian + Neo4j) | Aletheia's collapsible state machine (S0/S1/S2 superposition) |

**M5 sub-branch #5-5 = T+C+T'+C' (Logos Cycle):** This is the cadence of immanence -- the FSM that walks the coordinate space tick by tick. Aletheia mirrors this at the knowledge level: walking the source material space via Gnosis retrieval, with each "tick" being a dis-closure collapse for a different agent.

**M5 sub-branch #5-4 = S4-4'/S4-5' (Anima+Aletheia agent rosters):** The M5 Epii implementation already has dynamic agent roster registries for both Anima (constitutional) and Aletheia (mode-function) agents. These are the data-structure-level anchors in the C library.

### G.2 M2 Parashakti -- GraphRAG

Aletheia's M/ folder maps to M2 (Parashakti) for the GraphRAG retrieval substrate:

| M2 Parashakti (C library, `m2.c`) | S4-5' Aletheia M/ |
|-------------------------------------|-------------------|
| 72-invariant system | Content typing for Gnosis chunks |
| Vector arena (semantic embeddings) | 3072-dim embedding space |
| Parashakti as creative dynamism | Graph-driven knowledge retrieval |
| M2 sub-branch #2-1 = S+S' (stack integration) | Gnosis pipeline crosses all S-layers |

**Python Parashakti source** (30 files, ~28K LOC at `/Epi-Logos/Idea/Pratibimba/System/Subsystems/Parashakti/graph/`) is the design reference for hybrid retrieval:
- `coordinate_retrieval.py` (2143 LOC): coordinate-aware graph traversal
- `redis_cache.py` (1810 LOC): semantic cache with tier model
- `graphrag_retriever.py` (1293 LOC): RRF fusion retrieval
- `hybrid_retrieval.py`: vector + graph hybrid search

These algorithms are being ported to Rust in `epi-cli/src/graph/retrieval/` (graphrag-port-completion plan, 2026-03-09). Aletheia's Gnosis retrieval extends this with the Gnosis: namespace queries.

---

## H. Staging Disposition

### Items in `_staging/` that belong in Aletheia

| Staging Item | Current Location | Aletheia Relevance | Disposition |
|-------------|-----------------|-------------------|-------------|
| `pleroma-skills/atomic/notebooklm/SKILL.md` | `_staging/pleroma-skills/atomic/notebooklm/` | HIGH -- NotebookLM skill wraps the binary that Gnosis replaces | Keep as quality benchmark skill during Gnosis development; retire when Gnosis matches quality |
| `pleroma-skills/atomic/repl/SKILL.md` | `_staging/pleroma-skills/atomic/repl/` | HIGH -- Darshana REPL is the pre-ingestion structural analysis tool for Gnosis | Move to `plugins/ta-onta/aletheia/S5/` as a Gnosis pre-processor skill |
| `pleroma-skills/atomic/chatlog-fetcher/SKILL.md` | `_staging/pleroma-skills/atomic/chatlog-fetcher/` | MODERATE -- chat log fetching feeds `epi techne gnosis ingest-chat` | Move to `plugins/ta-onta/aletheia/S5/` as ingestion source |
| `pleroma-evals/suites/discharge.yaml` | `_staging/pleroma-evals/suites/discharge.yaml` | LOW -- general eval suite | Keep in staging |
| `pleroma-evals/suites/ouroboros.yaml` | `_staging/pleroma-evals/suites/ouroboros.yaml` | MODERATE -- Ouroboros (Mobius) flow testing | Keep in staging but reference for Aletheia Mobius testing |

### Items NOT in staging but needed

| Missing Item | Expected Location | Notes |
|-------------|-------------------|-------|
| Aletheia subagent definitions (6 files) | `plugins/ta-onta/aletheia/S5'/agents/` | Never materialized from rename |
| Aletheia CONTRACT.md | `plugins/ta-onta/aletheia/CONTRACT.md` | Gnosis pipeline, retrieval protocol, mode-functions |
| Aletheia M/ cross-cutting docs | `plugins/ta-onta/aletheia/M/` | M5 Epii Logos cycle echo, M2 Parashakti GraphRAG |
| Aletheia extension.ts (PI runtime) | `plugins/ta-onta/aletheia/extension.ts` | PI runtime: retrieval tools, pipeline governor |

---

## I. Ambiguities & Open Decisions

### I.1 Gnosis vs NotebookLM Transition

**Question:** What is the timeline and benchmark criteria for retiring NotebookLM?

**Current State:** The spec says "Keep the existing NotebookLM wrapper as a quality benchmark during development. Run identical queries through both systems to validate Gnosis retrieval quality. Once Gnosis matches or exceeds NotebookLM quality, the wrapper can be retired."

**Ambiguity:**
- No specific quality metrics defined (precision@K, recall@K, MRR, NDCG?)
- No timeline for comparison testing
- No test query set defined
- "Matches or exceeds" is subjective without quantitative thresholds

**Recommendation:** Define a benchmark suite of 20-30 representative queries across all coordinate families, establish precision@5 and MRR targets (e.g., >= 0.7), run A/B comparisons, retire NotebookLM when targets met for 3 consecutive benchmark runs.

### I.2 Docling Serve: Docker Required or Optional?

**Question:** Is Docker required to run Docling Serve, or can it run standalone?

**Current State:** The spec defines a docker-compose entry. Docling is a Python ML package that can also run standalone.

**Ambiguity:**
- docker-compose.epi-s2.yml is specified but not all users may have Docker
- Docling can run as a standalone Python process
- No fallback specified if Docker is unavailable

**Recommendation:** Docker is the primary deployment mechanism (consistent with Neo4j + Redis). Provide a fallback mode that runs Docling Serve via `pip install docling-serve && docling-serve` for users without Docker. The `epi techne gnosis serve` command should detect which mode to use.

### I.3 3072-dim Embeddings: Cost Implications and Fallback Dims

**Question:** What are the cost and storage implications of 3072-dim? Is there a fallback?

**Current State:** The spec standardizes on 3072 for production, mentions S2 spec supports 768/1536/3072, configurable via GEMINI_EMBED_DIMS.

**Ambiguity:**
- 3072-dim vectors are 4x the storage of 768-dim
- Neo4j vector index memory footprint grows linearly with dimension
- Existing Bimba vector index is 768-dim (schema.rs line 19)
- **CONFLICT**: schema.rs creates a 768-dim index, but the spec requires 3072-dim for unified space
- Re-indexing existing Bimba embeddings at 3072 would be needed for cross-namespace similarity
- GEMINI_EMBED_DIMS env var currently defaults to 768 in embeddings.rs (line 20)

**Recommendation:**
- Development/testing: 768-dim (cheaper, faster iteration)
- Production: 3072-dim (full fidelity, cross-namespace similarity)
- The GEMINI_EMBED_DIMS env var handles the switch
- Re-indexing command (`epi techne gnosis reindex`) needed for dimension changes
- Document the storage cost: ~12 bytes/dim * 3072 dims * N chunks = ~36KB per chunk for embeddings alone

### I.4 Darshana: Python Script or Rust Rewrite?

**Question:** Does Darshana stay as a Python script or get rewritten in Rust?

**Current State:** The spec refers to `darshana.py` as an "atomic REPL skill" and describes it as "pure Python, no LLM calls, lightweight, fast, no API cost."

**Ambiguity:**
- The `_staging/pleroma-skills/atomic/repl/` contains the SKILL.md definition
- darshana.py itself lives at `epi-claw/skills/repl/darshana.py` (the epi-claw workspace)
- For Gnosis pre-ingestion, it would be called as a subprocess from Rust
- No Rust equivalent exists

**Recommendation:** Keep darshana.py as Python (it is a pure-Python file parser, no heavy dependencies). Call it as a subprocess from the Gnosis ingestion pipeline when structural pre-analysis is requested. This is consistent with how the NotebookLM wrapper works (subprocess call from Rust). A Rust port is lower priority and can happen when/if the subprocess overhead becomes a bottleneck.

### I.5 Model Picker Registry Location

**Question:** Where does the model picker registry live?

**Current State:** The spec mentions `epi-cli/src/agent/models.rs` as the S4' provider/model registry. Gnosis reads from it.

**Ambiguity:**
- `agent/models.rs` does not exist in the current codebase
- No model registry pattern is established yet
- PI agent's model picker UI is referenced but PI is not installed

**Recommendation:** Create `epi-cli/src/agent/models.rs` as a simple key-value registry backed by a config file (`~/.epi-logos/models.toml`). Gnosis pipeline stages read their model config from this registry. The registry is independent of PI -- it works from CLI alone.

### I.6 Session-Scoped Notebooks: Auto-Creation and Promotion

**Question:** Are session-scoped Gnosis notebooks created automatically? What promotes them to permanent notebooks?

**Current State:** The spec mentions `Gnosis:Notebook{session:id}` as "session-scoped temporary" alongside the 7+1 permanent notebooks.

**Ambiguity:**
- No auto-creation trigger defined (on session start? on first ingest during session?)
- No promotion criteria (user explicit? threshold of chunks? time-based?)
- No cleanup strategy (delete when session ends? merge into family notebook?)
- Session ID format for notebook naming not specified

**Recommendation:** Session-scoped notebooks are created on-demand when `gnosis ingest` is called without a `--notebook` flag during an active session. They are NOT auto-created on session start. Promotion is explicit: `epi core actions notebook promote <session-notebook> --to <permanent-notebook>`. Unpromoted session notebooks are cleaned up after 30 days (configurable).

### I.7 Night' Analysis: When Does It Run?

**Question:** Is Night' analysis autonomous or triggered?

**Current State:** Multiple triggers mentioned:
- Chronos 11 PM cron trigger -> full Mobius return pipeline
- Chronos 6 AM window for SEED fallback
- session:stop hook -> extraction (but not full Night')
- `/verify-eros` CLI command -> manual Moirai invocation

**Ambiguity:**
- Is the 11 PM Chronos job the ONLY trigger for full Night' analysis?
- Can Night' be invoked manually at any time?
- Is extraction (session:stop) separate from Night' analysis (Mobius)?
- What happens if the user is still working at 11 PM?

**Recommendation:**
- **Extraction** runs on every session:stop (lightweight, always-on)
- **Night' analysis** (full Mobius) runs on:
  1. Chronos 11 PM cron (autonomous, configurable)
  2. `epi agent seed refresh` CLI command (manual trigger)
  3. Task-completion events (when a major task completes)
- If user is active at 11 PM, defer to next session:stop or midnight
- Extraction != Night'. Extraction is step 1; Night' is the full pipeline (Extract -> Verify -> Crystallize -> SEED)

### I.8 T-Routing: Chronos or Aletheia Responsibility?

**Question:** Who owns thought routing: Chronos (temporal) or Aletheia (knowledge)?

**Current State:** The FR Layer Assignment says "Aletheia LLM classifier" for position categorization but Khora's US-013 describes `/Thought Folder Routing for Aletheia` as a Khora capability that maps P0->T0 through P5->T5.

**Ambiguity:**
- Khora owns the filesystem write path for /Thought/
- Aletheia owns the LLM classification that determines WHICH T-bucket
- Chronos owns the temporal coordination (when to archive thoughts)
- Three modules touching the same pipeline

**Recommendation:** Clear responsibility split:
- **Aletheia** classifies the content (LLM position detection) and requests the write
- **Khora** executes the filesystem write to the correct /Thought/ path
- **Chronos** manages temporal lifecycle (archiving, TTL, cache invalidation)
- The pipeline is: Aletheia (classify) -> Khora (write) -> Hen (index) -> Chronos (lifecycle)

### I.9 Collapsible State Machine: How Is CF Determined Per Agent?

**Question:** How does the system determine which CF mode to use for each agent?

**Current State:** The spec provides the mapping (CF_VOID=Eros, CF_BINARY=Logos, etc.) but not the decision logic.

**Ambiguity:**
- Is CF mode hardcoded per agent identity?
- Or is it dynamically determined per task?
- Can the same agent receive different CF modes for different tasks?
- Who makes the decision: Nous, Anima, or the agent itself?

**Recommendation:** CF mode is determined by the combination of (agent identity, task complexity):
- Default mapping: each agent has a DEFAULT CF mode based on its identity
- Override: Nous can override the default based on task requirements
- Example: Logos normally gets CF_BINARY, but for a complex multi-domain task, Nous might upgrade to CF_TRIKA
- The decision is made by Nous (right hemisphere) as part of the dis-closure package preparation

### I.10 Python Epii Corpus: What to Port vs Redesign

**Question:** Which parts of the Python epii/corpus (21 modules) should be directly ported vs redesigned?

**Current State:** The S4-TA-ONTA-EXTENSION-SPEC.md Section VII provides a detailed table.

**Summary of decisions already made:**

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Parser** | REDESIGN | HTTP client (docling-rs) vs Python library import |
| **Chunker** | PORT (algorithm) | Same hybrid chunking algorithm, Rust implementation |
| **Embedder** | PORT (extend) | Extend existing embeddings.rs with batch + task types |
| **Store** | REDESIGN | New Gnosis: multi-label namespace vs T1 hierarchy |
| **Contextualisation** | PORT (same prompt) | Same Anthropic contextual RAG prompt, HTTP client |
| **CLI** | REDESIGN | Already have clap-based CLI framework |
| **Retrieval** | PORT (algorithm) | Same RRF fusion algorithm, Rust implementation |

**Remaining ambiguity:**
- The Python implementation uses 1536-dim embeddings; Rust uses 3072-dim -- needs re-validation
- Python's T1Document/T1Chunk schema needs migration to Gnosis: namespace
- Python's test suite (14K LOC) -- what to port as Rust integration tests?

**Recommendation:** Port the algorithms (chunking, contextual RAG, RRF fusion), redesign the infrastructure (parsing, storage, CLI), and write fresh Rust tests. The Python test suite serves as a reference for test scenarios but should not be mechanically ported.

---

## J. Dependency Analysis

### J.1 External Dependencies (Aletheia-specific)

| Dependency | Type | Status | Criticality |
|-----------|------|--------|-------------|
| **Neo4j 5.x** | Docker service | docker-compose exists | BLOCKING for Gnosis |
| **Redis 7.x** | Docker service | docker-compose exists | BLOCKING for cache |
| **Docling Serve** | Docker service | Specified but not added to compose | BLOCKING for document parsing |
| **Gemini API** | External API | Key needed (GEMINI_API_KEY) | BLOCKING for embeddings + contextualisation |
| **docling_rs** | Cargo crate | Not yet in Cargo.toml | BLOCKING for parse stage |
| **neo4rs** | Cargo crate | In Cargo.toml (rc version) | Ready but needs Gnosis queries |

### J.2 Internal Dependencies (Other ta-onta modules)

| Module | Dependency Type | What Aletheia Needs |
|--------|----------------|---------------------|
| **Khora** | Hook provider | `session:stop` hook for extraction trigger, filesystem write path for /Thought/ |
| **Hen** | Coordination | `create_relation` for Neo4j pos_* relationships, GraphRAG for Lachesis queries |
| **Pleroma** | Tool provider | Moirai CF2 cluster invocation, tool registration surface |
| **Chronos** | Temporal trigger | 11 PM / 6 AM cron hooks, Day/NOW lifecycle context |
| **Anima** | Orchestrator | CF dispatch routing, agent spawning, dis-closure requests from Nous |

### J.3 Implementation Ordering (from spec Phase ordering)

1. **Phase 0: Infrastructure** -- Docker (Neo4j + Redis + Docling), Cargo deps
2. **Phase 1: Gnosis Schema + Store** -- Neo4j schema, CRUD operations, notebook management
3. **Phase 2: Ingestion Pipeline** -- docling client, chunker, embeddings extension, full pipeline
4. **Phase 3: Retrieval** -- query engine, KnowingDossier Gnosis facet
5. **Phase 4: Books + Vimarsa Sync + Chat** -- batch ingestion, sync, chat logs
6. **Phase 5: Knowledge Crystallization** -- extract/verify/crystallize pipeline, Night' analysis, Mobius
7. **Phase 6: Ta-Onta Package Structure** -- directory tree, CONTRACT.md, M/ docs
8. **Phase 7: Quality Validation** -- NotebookLM benchmark, coverage, precision testing

---

## K. Cross-Reference: Aletheia FRs in Other Module Analyses

| Other Module | FR/US ID | Aletheia Relevance |
|-------------|----------|-------------------|
| Khora US-013 | /Thought Folder Routing for Aletheia | Khora writes the file; Aletheia classifies the position |
| Khora US-011 | SEED.md Bootstrap Priority | Aletheia creates SEED; Khora consumes it at 6 AM |
| Hen US-005 | Hybrid Retrieval Pipeline | Aletheia extends this for Gnosis namespace |
| Hen US-011 | /Thought GraphRAG Integration | Hen indexes; Aletheia extracts and classifies |
| Chronos | 11 PM + 6 AM triggers | Aletheia executes Mobius; Chronos schedules it |
| Anima | 12-agent roster | Aletheia's 6 function clusters are CF routing destinations |
| Pleroma US-002-004 | Moirai spawn paths | Aletheia's CF2 cluster (Klotho/Lachesis/Atropos) |

---

*Document Version:* 1.0
*Generated:* 2026-03-10
*Sources:*
- S4-TA-ONTA-EXTENSION-SPEC.md (Sections III, IV, V, VI, VII, VIII)
- S4-EXTENSION-ARCHITECTURE.md (Section III: S4-5' Aletheia)
- FR Layer Assignment Full (2026-02-27, Aletheia section)
- VAK Handover (2026-02-19, Sections 3, 8, 13)
- LEMNISCATE_DEV_STRATEGY.md (bootstrapping phases)
- Orchestrator Spec (task verification T-005, T-006, T-008)
- Epii Corpus Ingestion Design (2026-02-21)
- T-Coordinate Thoughts Integration Plan (2026-03-01)
- GraphRAG Port Completion Plan (2026-03-09)
- S2-S2i-GRAPH.md (Neo4j schema, vector index)
- S5-S5i-SYNC.md (S5 raw API primitives)
- epi-cli/src/graph/ (embeddings.rs, schema.rs, mod.rs -- current code state)
- epi-cli/src/notebook/mod.rs (NotebookLM wrapper -- to be replaced)
- epi-cli/src/core/knowing/notebook.rs (NotebookPulseFacet -- to be rewritten)
