# Hen (#1) Extension Analysis: S4-1' Content Coordination & Vault

**Date:** 2026-03-10
**Status:** Comprehensive Pre-Implementation Analysis
**Position:** #1 (Paramasiva archetype) in ta-onta meta-extension package
**Extension Path:** `plugins/ta-onta/hen/` (DOES NOT YET EXIST in repo)
**S-Layer:** S4-1' (folds S1 Obsidian into agent layer)

---

## Executive Summary

Hen is the **content coordination and vault** extension of the ta-onta meta-extension package. It owns the following concerns:

1. **Frontmatter schema enforcement** -- canonical `{family}_{n}_{semantic}` key format, deprecated pattern rejection, HC struct alignment
2. **Wikilink breadcrumb system** -- 5 categories (temporal, coordinate, session, source/context, conceptual)
3. **Graph coordination** -- vault-to-Neo4j sync bridge via `bimbaCoordinate` join key
4. **Content type classification** -- CT template archetypes (CT0-CT5), template type registry, instantiation engine
5. **Vault topology** -- Bimba (canonical) / Empty/Present (temporal) / Pratibimba (archived) path resolution
6. **CT4b' template system** -- fractal doubling template for both daily-note.md and now.md
7. **obsidian-cli integration** -- Rust wrapper over external binary for vault CRUD

### Current Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| obsidian-cli wrapper | EXISTS (14 commands) | `epi-cli/src/vault/mod.rs` |
| Frontmatter validation | EXISTS (basic) | `epi-cli/src/vault/frontmatter.rs` |
| Thought routing | EXISTS (T0-T5) | `epi-cli/src/vault/mod.rs` (ThoughtRoute) |
| NOW.md read/write | EXISTS | `epi-cli/src/vault/mod.rs` (NowRead/NowWrite) |
| CT template system | MISSING | -- |
| Wikilink breadcrumbs | MISSING | -- |
| Vault-to-graph sync | MISSING | -- |
| Day/NOW lifecycle | MISSING (partially in Chronos scope) | -- |
| `plugins/ta-onta/hen/` | MISSING (directory does not exist) | -- |

---

## A. Functional Requirements

### Notation

- **FR-H-NNN**: Functional Requirement for Hen
- **Origin**: Source document(s) from which the FR was extracted
- **Priority**: P0 (blocker), P1 (core), P2 (augmentation), P3 (future)
- **Layer**: S1 (raw primitive), S1' (QL augmentation), S2 (graph bridge), M (cross-cutting)

### FR Table

| ID | Title | Description | Layer | Priority | Origin | Dependencies | Status |
|----|-------|-------------|-------|----------|--------|-------------|--------|
| FR-H-001 | obsidian-cli Rust Wrapper | Complete Rust wrapper over all obsidian-cli commands (create, print, delete, move, open, search, search-content, daily, frontmatter --print/--edit/--delete, set-default, print-default) | S1 | P0 | S1 spec, S4-NOW spec | obsidian-cli binary installed | EXISTS (14/14 commands) |
| FR-H-002 | Frontmatter Schema Validation | Validate frontmatter YAML against HC struct fields. Enforce `{family}_{n}_{semantic}` key format. Reject deprecated patterns (`pos_*`, standalone `coordinate`, standalone `ql_position`). | S1' | P0 | S4-NOW spec III, FR-14, S1 spec | FR-H-001 | PARTIAL (basic validation exists in frontmatter.rs; deprecated pattern rejection NOT enforced on writes) |
| FR-H-003 | Coordinate Validation | Validate `bimbaCoordinate` values against full coordinate grammar (#, #0-#5, Weave_*, CF_*, VAK names, family coordinates with optional `'` suffix) | S1' | P0 | S1 spec | -- | EXISTS (frontmatter.rs `is_valid_coordinate()`) |
| FR-H-004 | CT Template Archetype Registry | Define 7 CT archetype levels (CT0-CT5 + CT4b') with positional content spaces per CF frame. Hardcode in Rust as canonical source. | S1' | P1 | S4-NOW spec III, CT4b-MASTER-TEMPLATE, DAY-AS-CONTEXT-FRAMEWORK, FR-25 | -- | MISSING |
| FR-H-005 | Template Type Registry | Map specific template types (seed, prompt, task-spec, pattern-note, daily-note, now, thought) to CTx archetypes with default scaffolds. | S1' | P1 | S4-NOW spec III, FR-25 | FR-H-004 | MISSING |
| FR-H-006 | Template Instantiation Engine | Create actual files from template types. Fill frontmatter from session/coordinate context. Validate against schema. 3-tier resolution: custom > plugin > built-in. | S1' | P1 | S4-NOW spec III, VII | FR-H-004, FR-H-005, FR-H-002 | MISSING |
| FR-H-007 | Template Invocation CLI | `epi vault template-invoke <type> [--coordinate COORD] [--session-id ID]` -- resolves template, generates frontmatter, creates artifact, registers in sync queue, returns path. | S1' | P1 | S4-NOW spec VII | FR-H-006 | MISSING |
| FR-H-008 | Wikilink Breadcrumb System | Every artifact created by the system contains wikilinks as breadcrumbs in 5 categories: temporal, coordinate, session, source/context, conceptual. | S1' | P1 | S4-NOW spec III, US-033 | FR-H-006 | MISSING |
| FR-H-009 | Vault-to-Graph Sync Bridge | Every vault mutation emits to S2' for graph upsert. Frontmatter `{family}_{n}_{semantic}` wikilinks become Neo4j relationship edges. `bimbaCoordinate` as join key. Hash-based change detection. Khora sync queue (`.khora-sync-queue.jsonl`) for batched writes. | S2 | P1 | S4-NOW spec III (Hen/S2), INTEGRATION-SCOPE-KHORA-HEN, FR-15 | FR-H-002, S2' (graph client) | MISSING |
| FR-H-010 | Thought Routing | `epi vault thought-route --position N --content "..."` writes to `Pratibimba/Self/Thought/T{n}/` with canonical frontmatter (bimbaCoordinate, ql_position, family, thought_type, timestamp, source_session, coordinate). | S1 | P0 | S1 spec, S4-NOW spec IV | -- | EXISTS |
| FR-H-011 | NOW.md Read/Write | `epi vault now-read` / `epi vault now-write` -- direct filesystem I/O to `{EPILOGOS_VAULT}/Empty/Present/NOW.md`. | S1 | P0 | S1 spec | -- | EXISTS |
| FR-H-012 | Day-Init Command | `epi vault day-init` -- create Day folder (`{DD-MM-YYYY}/daily-note.md`) with CT4b' template. | S1' | P1 | S4-NOW spec VII, S1 spec | FR-H-006 | MISSING (Chronos/S1' scope overlap) |
| FR-H-013 | NOW-Init Command | `epi vault now-init --session-id <id>` -- create NOW folder (`{YYYYMMDD-HHmmss-sessionId}/now.md`) with CT4b' template. | S1' | P1 | S4-NOW spec VII, S1 spec | FR-H-006 | MISSING (Chronos/S1' scope overlap) |
| FR-H-014 | Archive-Day Command | `epi vault archive-day <date>` -- rotate Day folder to `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`. | S1' | P2 | S4-NOW spec IV, daily-archive | FR-H-012 | MISSING (Chronos scope) |
| FR-H-015 | Frontmatter Key Normalization | Normalize legacy frontmatter keys on write: `pos{x}_{semantic}` -> `{family}_{n}_{semantic}`. Accept deprecated forms on read, canonical only on write. | S1' | P1 | FR-14, US-008, US-009, conformance remediation plan | FR-H-002 | MISSING |
| FR-H-016 | Session-Artifact-Insight Flow | Coordinate the flow: session creation (Khora) -> artifact production (Hen templates) -> insight distillation (Sophia/Aletheia) -> graph persistence (S2'). | S1' | P2 | FR-15 | FR-H-006, FR-H-009 | MISSING |
| FR-H-017 | /Thought GraphRAG Integration | Enable graph-based retrieval across `/Thought` directory structure (T0-T5 and inverted buckets). | S2 | P2 | INTEGRATION-SCOPE US-011, FR-16 | FR-H-009, Gnosis pipeline | MISSING |
| FR-H-018 | Vimarsa Semantic Search | Enable vimarsa (bkmr) aperture-aware search through vault content with coordinate breadcrumbs. | S2 | P3 | INTEGRATION-SCOPE US-012, FR-17 | Vimarsa aperture system | MISSING |
| FR-H-019 | Coordinate-Native Query | Query vault content by coordinate address (e.g., "all notes at M2", "all T3 thoughts from last week"). | S1' | P2 | FR layer assignment US-020 | FR-H-002, FR-H-009 | MISSING |
| FR-H-020 | GraphRAG Bridge Redis Cache | Redis-cached graph retrieval results with HOT/WARM/COLD tier TTLs. | S2 | P2 | FR layer assignment US-021 | Redis client, FR-H-009 | MISSING |
| FR-H-021 | Coordinate-Semantic Filters | Filter retrieval results by coordinate family, position, and semantic type. | S1' | P2 | FR layer assignment US-022 | FR-H-019 | MISSING |
| FR-H-022 | CT/CT' Template-Lens Validators | Validate that artifacts conform to their declared CTx archetype. `CTX = CT(x)` must be explicit. Profile semantics for `day_parent`, `now_child`. | S1' | P1 | US-010, US-027 | FR-H-004 | MISSING |
| FR-H-023 | Frontmatter-Neo4j Property Mapping | 1:1 mapping between frontmatter `{family}_{n}_{semantic}` keys and Neo4j node properties. Enforced bidirectionally. | S2 | P1 | FR layer assignment US-018, S2 spec | FR-H-002, FR-H-009 | MISSING |
| FR-H-024 | Seed-File Template Execution | Execute seed files as templates during initial vault setup or coordinate bootstrap. | S1' | P3 | FR layer assignment US-019 | FR-H-006 | MISSING |
| FR-H-025 | REPL Section/Slice Retrieval | Retrieve specific sections or slices of vault notes by coordinate-addressed content spaces. | S1' | P3 | FR layer assignment US-023 | FR-H-019 | MISSING |
| FR-H-026 | Periodic Notes Integration | Support weekly/monthly periodic notes via Obsidian Periodic Notes plugin. Weekly aggregates daily insights. Monthly distills weekly patterns. | S1' | P2 | S4-NOW spec IV (Chronos/S1') | FR-H-012 | MISSING (Chronos scope) |
| FR-H-027 | Smart Links Resolution | Coordinate-aware resolution of wikilinks: `[[M2]]` resolves to `Bimba/Seeds/M/M2.md`. | S1' | P3 | S4-NOW spec III | FR-H-008 | MISSING |
| FR-H-028 | Deprecated Pattern Rejection on Write | Actively reject or warn on deprecated frontmatter patterns in canonical write paths: standalone `coordinate`, standalone `ql_position`, `pos_*` prefix forms, `ctx_*` standalone (only `ctx_type` allowed). | S1' | P1 | S4-NOW spec III, conformance remediation Hen checklist | FR-H-002 | MISSING |
| FR-H-029 | 126 Canonical Frontmatter Keys | Port the 126 canonical keys from `frontmatter_schema.ts` (epi-claw authority) into Rust validation. | S1' | P1 | S4-NOW spec III, S1 spec | FR-H-002 | MISSING |
| FR-H-030 | Hen PI Hook Seams | Register `before_tool_call` and `after_tool_call` hooks for Hen-owned tools. Before: validate frontmatter, check coordinate grammar. After: emit sync event, update breadcrumbs. | S1' | P2 | S4 extension spec | FR-H-002, FR-H-008 | MISSING |
| FR-H-031 | Hen Status Tool | `hen_status` tool returning current template registry state, sync queue depth, pending validations. | S1' | P2 | S4 extension spec | FR-H-005, FR-H-009 | MISSING |
| FR-H-032 | Hen Hybrid Retrieve Tool | `hen_hybrid_retrieve` -- coordinate-aware hybrid retrieval combining vault search + graph traversal + Redis cache. | S2 | P2 | S4 extension spec | FR-H-009, FR-H-020, FR-H-021 | MISSING |

### FR Cross-Reference to Original Planning Documents

| Original FR/US | Mapped to FR-H | Source Document |
|---------------|----------------|-----------------|
| FR-14 (pos_x_semantics format) | FR-H-015, FR-H-028 | 2026-02-27-fr-layer-assignment-full.md |
| FR-15 (Session-Artifact-Insight flow) | FR-H-016 | 2026-02-27-fr-layer-assignment-full.md |
| FR-25 (Template Registry ownership) | FR-H-004, FR-H-005 | 2026-02-27-fr-layer-assignment-full.md |
| FR-34 (Primitive-Resolution APIs) | FR-H-019, FR-H-025 | 2026-02-27-fr-layer-assignment-full.md |
| US-001 (Direct Tool Contracts) | FR-H-001, FR-H-030 | 2026-02-27-fr-layer-assignment-full.md |
| US-003 (Coordination Tool Suite) | FR-H-007, FR-H-031 | 2026-02-27-fr-layer-assignment-full.md |
| US-005 (Hybrid Retrieval Pipeline) | FR-H-032 | 2026-02-27-fr-layer-assignment-full.md |
| US-007 (SQL vs Neo4j Boundary) | FR-H-023 | 2026-02-27-fr-layer-assignment-full.md |
| US-008 (Obsidian Sync) | FR-H-009 | 2026-02-27-fr-layer-assignment-full.md |
| US-009 (Retrieval Quality Gates) | FR-H-020 | 2026-02-27-fr-layer-assignment-full.md |
| US-010 (Cross-Plugin Verification) | FR-H-022 | 2026-02-27-fr-layer-assignment-full.md |
| US-011 (/Thought GraphRAG) | FR-H-017 | INTEGRATION-SCOPE-KHORA-HEN.md |
| US-012 (kbase Semantic Search) | FR-H-018 | INTEGRATION-SCOPE-KHORA-HEN.md |
| US-016 (Template Registry) | FR-H-005 | 2026-02-27-fr-layer-assignment-full.md |
| US-017 (Coordinate Grammar) | FR-H-003 | 2026-02-27-fr-layer-assignment-full.md |
| US-018 (Frontmatter-Neo4j Mapping) | FR-H-023 | 2026-02-27-fr-layer-assignment-full.md |
| US-020 (Coordinate-Native Query) | FR-H-019 | 2026-02-27-fr-layer-assignment-full.md |
| US-021 (GraphRAG Bridge Redis Cache) | FR-H-020 | 2026-02-27-fr-layer-assignment-full.md |
| US-022 (Coordinate-Semantic Filters) | FR-H-021 | 2026-02-27-fr-layer-assignment-full.md |
| US-023 (REPL Section/Slice Retrieval) | FR-H-025 | 2026-02-27-fr-layer-assignment-full.md |
| Remediation US-008 | FR-H-015 | conformance-remediation-plan.md |
| Remediation US-009 | FR-H-002, FR-H-015, FR-H-022 | conformance-remediation-plan.md |
| Remediation US-010 | FR-H-022 | conformance-remediation-plan.md |
| Remediation US-007 | FR-H-023 | conformance-remediation-plan.md |
| Deep-grounding US-003..010 Task 7 | FR-H-023, FR-H-028 | us003-us010-deep-grounding.md |
| Deep-grounding US-003..010 Task 8 | FR-H-015, FR-H-028 | us003-us010-deep-grounding.md |
| Deep-grounding US-003..010 Task 9 | FR-H-022 | us003-us010-deep-grounding.md |

---

## B. User Stories

### US-H-001: Frontmatter Schema Enforcement on Vault Writes

**As** an agent writing to the vault,
**I want** frontmatter to be automatically validated and normalized against the canonical schema,
**So that** all vault notes have consistent, coordinate-addressable metadata.

**Acceptance Criteria:**
1. All frontmatter writes enforce `{family}_{n}_{semantic}` key format
2. Deprecated keys (`pos_*`, standalone `coordinate`, standalone `ql_position`) are rejected on write with an error message
3. `bimbaCoordinate` is validated against the coordinate grammar (FR-H-003)
4. `ql_position` values must be 0-5 or 255
5. `family` values must be one of C, P, L, S, T, M, NONE
6. The 126 canonical keys from `frontmatter_schema.ts` are the authoritative set
7. Legacy keys are accepted on read (for backward compatibility) but normalized to canonical form

**Maps to:** FR-H-002, FR-H-015, FR-H-028, FR-H-029

---

### US-H-002: CT Template Invocation

**As** an agent producing an artifact during a session,
**I want** to invoke a CT template by type name and receive a properly scaffolded file with correct frontmatter,
**So that** all artifacts conform to the CT archetype system and are immediately graph-addressable.

**Acceptance Criteria:**
1. `epi vault template-invoke <type> [--coordinate COORD] [--session-id ID]` creates a file
2. Template type resolves to a CTx archetype (CT0-CT5 or CT4b')
3. Generated file has correct positional content spaces for its CF frame
4. Frontmatter includes: `bimbaCoordinate`, `ct_type`, `ct_archetype`, session lineage, coordinate context
5. File is placed in the correct location within the NOW folder structure
6. Artifact is registered in Khora sync queue for eventual graph write
7. 3-tier template resolution: custom (`~/.epi-logos/templates/`) > plugin (`plugins/ta-onta/hen/S1'/templates/`) > built-in (hardcoded Rust)

**Maps to:** FR-H-004, FR-H-005, FR-H-006, FR-H-007

---

### US-H-003: Wikilink Breadcrumb Injection

**As** a user navigating the vault,
**I want** every agent-created artifact to contain wikilink breadcrumbs linking back to its temporal, coordinate, session, source, and conceptual context,
**So that** I can trace any artifact back to its origin and navigate the knowledge graph through vault links.

**Acceptance Criteria:**
1. Temporal breadcrumbs: `[[DD-MM-YYYY/daily-note]]`, `[[DD-MM-YYYY/YYYYMMDD-HHmmss-sessionId/now]]`
2. Coordinate breadcrumbs: `[[Bimba/Seeds/{family}/{family}{n}]]`
3. Session breadcrumbs: `[[session:YYYYMMDD-HHmmss-sessionId]]`
4. Source/Context breadcrumbs: `[[Gnosis:source-name]]`, `[[vimarsa:project.db]]`
5. Conceptual breadcrumbs: `[[concept-name]]`
6. Breadcrumbs are injected in a standardized section of the generated file
7. Smart Links or custom resolver enables coordinate-aware resolution (`[[M2]]` resolves correctly)

**Maps to:** FR-H-008, FR-H-027

---

### US-H-004: Vault-to-Graph Sync

**As** the graph system (S2'),
**I want** vault mutations to be automatically queued and synced to Neo4j,
**So that** the knowledge graph stays consistent with vault content without manual intervention.

**Acceptance Criteria:**
1. Every vault write (create, update, delete, move) emits a sync event
2. Sync events are queued in `.khora-sync-queue.jsonl` (Khora's queue)
3. Frontmatter `{family}_{n}_{semantic}` wikilink values become Neo4j relationship edges
4. `bimbaCoordinate` serves as the join key between vault notes and Neo4j nodes
5. Hash-based change detection prevents redundant sync operations
6. Queue can be flushed on demand or at session end
7. Sync failures are logged with retry semantics (not silently dropped)

**Maps to:** FR-H-009, FR-H-023

---

### US-H-005: CT4b' Template for Daily Note and NOW

**As** the Day/NOW lifecycle system (Chronos),
**I want** CT4b' templates for both daily-note.md and now.md that provide all 6 positional content spaces,
**So that** session and daily work are structured according to the fractal doubling pattern.

**Acceptance Criteria:**
1. CT4b' template generates 6 positional content spaces (#0 Ground through #5 Synthesis)
2. Each content space has position-specific headers and prompt scaffolding
3. daily-note.md is CT4b' at Day scope (frontmatter: `ct4b_frame: day`, `period_type: daily`)
4. now.md is CT4b' at Session scope (frontmatter: `ct4b_frame: session`, `session_id: ...`)
5. Template follows CT4b' fractal inner structure: 4.0 Ground, 4.1 Context, 4.2 Operations, 4.3 Patterns, 4.4 Integration, 4.5 Synthesis
6. Both templates include mandatory frontmatter: `bimbaCoordinate: "#4"`, `ql_position: 4`, `family: "T"` (or appropriate)
7. Time-period generalization works for session, daily, weekly, sprint, project scopes

**Maps to:** FR-H-004, FR-H-006, FR-H-012, FR-H-013

---

### US-H-006: Thought Routing with GraphRAG

**As** an agent routing thoughts to T0-T5 buckets,
**I want** thought artifacts to be both written to the filesystem and indexed for graph retrieval,
**So that** accumulated thoughts are queryable across sessions and can inform future work.

**Acceptance Criteria:**
1. `epi vault thought-route --position N --content "..."` writes to correct T{n} directory (EXISTS)
2. Frontmatter includes `bimbaCoordinate: "T{n}"`, `thought_type`, `source_session`, `timestamp` (EXISTS)
3. Thought artifacts are queued for Gnosis ingestion (graph indexing)
4. T-position filtering works in graph queries ("all T3 patterns from this week")
5. Thought distillation across sessions produces higher-order patterns

**Maps to:** FR-H-010, FR-H-017

---

### US-H-007: Coordinate-Native Vault Query

**As** an agent planning work,
**I want** to query vault content by coordinate address,
**So that** I can find all relevant artifacts at a given coordinate position across families.

**Acceptance Criteria:**
1. Query by family: "all M-family notes" returns notes where `bimbaCoordinate` starts with M
2. Query by position: "all position-2 notes" returns notes at any family's position 2
3. Query by specific coordinate: "all M2 notes" returns exact matches
4. Query by coordinate with time range: "M2 notes from last 3 days"
5. Results include frontmatter metadata for filtering and sorting
6. Integration with Redis cache for repeated queries (HOT tier, 5min TTL)

**Maps to:** FR-H-019, FR-H-020, FR-H-021

---

### US-H-008: Hen Status and Health

**As** an operator,
**I want** to check Hen's operational status,
**So that** I can verify the template registry, sync queue, and validation systems are functioning.

**Acceptance Criteria:**
1. `hen_status` tool returns: template registry state (loaded templates, resolution order)
2. Reports sync queue depth (pending, failed, completed counts)
3. Reports pending frontmatter validations
4. Reports obsidian-cli availability and vault connection
5. Reports S2' (graph) connection status for sync bridge

**Maps to:** FR-H-031

---

## C. S-Level Inventory: S1 Raw Primitives

S1 raw primitives are the **direct obsidian-cli wrappers and filesystem I/O operations** that Hen provides. These are mechanics-level operations with no QL semantics.

### Existing S1 Primitives (in `epi-cli/src/vault/mod.rs`)

| Primitive | CLI Command | obsidian-cli? | Status | Lines |
|-----------|------------|---------------|--------|-------|
| `VaultCmd::Status` | `epi vault status` | Yes (`print-default`) | EXISTS | 142-145 |
| `VaultCmd::Create` | `epi vault create` | Yes (`create`) | EXISTS | 147-160 |
| `VaultCmd::Read` | `epi vault read` | Yes (`print`) | EXISTS | 162-168 |
| `VaultCmd::Search` | `epi vault search` | Yes (`search`) | EXISTS | 170-176 |
| `VaultCmd::SearchContent` | `epi vault search-content` | Yes (`search-content`) | EXISTS | 178-184 |
| `VaultCmd::Daily` | `epi vault daily` | Yes (`daily`) | EXISTS | 186-192 |
| `VaultCmd::FrontmatterGet` | `epi vault frontmatter-get` | Yes (`frontmatter --print`) | EXISTS | 194-203 |
| `VaultCmd::FrontmatterSet` | `epi vault frontmatter-set` | Yes (`frontmatter --edit`) | EXISTS | 205-224 |
| `VaultCmd::Move` | `epi vault move` | Yes (`move`) | EXISTS | 226-236 |
| `VaultCmd::Delete` | `epi vault delete` | Yes (`delete`) | EXISTS | 238-244 |
| `VaultCmd::NowRead` | `epi vault now-read` | No (direct fs) | EXISTS | 246-261 |
| `VaultCmd::NowWrite` | `epi vault now-write` | No (direct fs) | EXISTS | 263-279 |
| `VaultCmd::SetDefault` | `epi vault set-default` | Yes (`set-default`) | EXISTS | 282 |
| `VaultCmd::Open` | `epi vault open` | Yes (`open`) | EXISTS | 284-290 |
| `VaultCmd::FrontmatterDelete` | `epi vault frontmatter-delete` | Yes (`frontmatter --delete`) | EXISTS | 292-304 |
| `VaultCmd::ThoughtRoute` | `epi vault thought-route` | No (direct fs) | EXISTS | 307-377 |
| `VaultCmd::FrontmatterValidate` | `epi vault frontmatter-validate` | Yes (reads via `frontmatter --print`) | EXISTS | 380-404 |

### Missing S1 Primitives (from S4-NOW spec VII and S1 spec)

| Primitive | CLI Command | Description | Priority |
|-----------|------------|-------------|----------|
| `DayInit` | `epi vault day-init` | Create today's Day folder + daily-note.md from CT4b' template | P1 |
| `NowInit` | `epi vault now-init --session-id <id>` | Create NOW folder with datetime prefix + now.md | P1 |
| `ArchiveDay` | `epi vault archive-day <date>` | Rotate Day folder to Pratibimba archive | P2 |
| `TemplateInvoke` | `epi vault template-invoke <type> [--coordinate] [--session-id]` | Invoke CT template, create artifact | P1 |
| `PeriodicInit` | `epi vault periodic-init --weekly/--monthly` | Create periodic note (weekly/monthly aggregate) | P3 |

### S1 Blocker: obsidian-cli Installation

The `obsidian-cli` binary is NOT currently installed. All commands that delegate to it will fail at runtime. Install with:
```
brew install yakitrak/yakitrak/obsidian-cli
```

Note: Commands that use direct filesystem I/O (NowRead, NowWrite, ThoughtRoute) work without obsidian-cli.

---

## D. S'-Level Inventory: S1' QL Augmentations

S1' (QL Vault Operations) augments raw S1 primitives with **coordinate-aware, schema-enforced, template-driven** semantics. This is the layer where Hen's primary value lives.

### S1' Components

#### D.1 Frontmatter Schema Enforcement (PARTIAL)

**Existing:**
- `frontmatter.rs::is_valid_coordinate()` -- validates coordinate strings against grammar
- `frontmatter.rs::validate_frontmatter()` -- checks `bimbaCoordinate`, `ql_position`, `family`, coordinate keys
- `frontmatter.rs::validate_coordinate_key()` -- validates `{family}_{n}_{semantic}` key pattern

**Missing:**
- **126 canonical key registry** from `frontmatter_schema.ts` (epi-claw authority)
- **Deprecated pattern rejection on write** -- currently validates but does not reject deprecated forms
- **Normalization pipeline** -- `pos{x}_{semantic}` -> `{family}_{n}_{semantic}` conversion
- **Write-time enforcement** -- validation currently only runs on explicit `frontmatter-validate` invocation, not on every write
- **Wikilink value validation** -- `{family}_{n}_{semantic}` values that are wikilinks should resolve to valid vault paths

#### D.2 CT Template System (MISSING)

This is the largest missing component. Per S4-NOW spec Section III:

**CT Archetype Definitions (hardcoded in Rust):**

| CTx | CF Frame | Name | Positional Content Spaces |
|-----|----------|------|---------------------------|
| CT0 | (00/00) | Seed/Ground | #0 only (pure ground, no positional structure) |
| CT1 | (0/1) | Prompt/Form | #0 (question), #1 (material) |
| CT2 | (0/1/2) | Task-Spec/Operation | #0 (question), #1 (material), #2 (analysis/operations) |
| CT3 | (0/1/2/3) | Pattern-Note/Process | #0-#3 (full trika + process) |
| CT4a | (4.5/0) | Integration Preview | #4 (context), #5 (synthesis), #0 (return) |
| CT4b' | (4.0/1-4.4/5) | Fractal Doubling | All 6 positions: 4.0-4.5 (daily-note, now) |
| CT5 | (5/0) | Thought/Insight | #5 (synthesis), #0 (Mobius return) |

**Template Type -> CTx Archetype Mapping:**

| Template Type | CTx Archetype | Output Location |
|--------------|---------------|-----------------|
| `seed` | CT0 | `Bimba/Seeds/{family}/` |
| `prompt` | CT1 | `{NOW}/thoughts/` |
| `task-spec` | CT2 | `{NOW}/tasks/` |
| `pattern-note` | CT3 | `{NOW}/patterns/` |
| `daily-note` | CT4b' | `{Day}/daily-note.md` |
| `now` | CT4b' | `{NOW}/now.md` |
| `thought` | CT5 | `Pratibimba/Self/Thought/T{n}/` |

**Template Resolution Order:**
1. Custom templates: `~/.epi-logos/templates/{type}.md`
2. Plugin templates: `plugins/ta-onta/hen/S1'/templates/{type}.md`
3. Built-in defaults: hardcoded in Rust (minimal scaffold per CTx archetype)

**Template Invocation Profile (frontmatter generated):**
```yaml
---
bimbaCoordinate: "{derived from --coordinate}"
ct_type: "{template-type}"
ct_archetype: "CT{x}"
cf_frame: "{context frame notation}"
session_id: "{from --session-id or KHORA_SESSION_ID}"
day_id: "{DD-MM-YYYY}"
created_at: "{ISO 8601}"
family: "{derived from coordinate}"
ql_position: {derived from coordinate}
# Template-specific fields follow
---
```

#### D.3 Wikilink Breadcrumb System (MISSING)

Five categories of breadcrumbs per S4-NOW spec III:

1. **Temporal**: `[[DD-MM-YYYY/daily-note]]`, `[[DD-MM-YYYY/YYYYMMDD-HHmmss-sessionId/now]]`
2. **Coordinate**: `[[Bimba/Seeds/M/M2]]`, `[[Bimba/Seeds/S/S2]]`
3. **Session**: `[[session:YYYYMMDD-HHmmss-sessionId]]`
4. **Source/Context**: `[[Gnosis:Tantraloka-Ch1]]`, `[[vimarsa:M.db]]`
5. **Conceptual**: `[[coordinate-system]]`, `[[vimarsa]]`, `[[gnosis-pipeline]]`

#### D.4 Coordinate-Native Query (MISSING)

Query vault content by coordinate address:
- Family filter (all M-family)
- Position filter (all position-2)
- Specific coordinate (M2)
- Time-range filter
- Integration with Redis cache

#### D.5 CT/CT' Template-Lens Validators (MISSING)

Per US-010 from the conformance remediation plan:
- Validate artifacts against declared CTx archetype
- `CTX = CT(x)` explicit interpretation
- Profile semantics: `day_parent`, `now_child`
- CT' = invoked (runtime) instance, CT = definition (template archetype)

---

## E. M-Level Mapping: M2 Parashakti Cross-Cutting

Hen's M-level concern is **M2 (Parashakti)** -- the vibrational matrix that provides the typing schema for content element relationships.

### M2 72-Invariant Connection

The 72-invariant structure (6 families x 6 positions x 2 phases = 72) maps to content typing:
- Each of the 72 coordinates represents a distinct content-type slot
- The vibrational matrix defines HOW content elements relate (not just THAT they relate)
- This provides the typing schema that Hen uses for template selection and frontmatter key assignment

### M2 Parashakti Responsibilities in Hen Context

| Concern | M2 Contribution | Hen Consumption |
|---------|-----------------|-----------------|
| Content typing matrix | 72-invariant vibrational structure | Template archetype selection (which CTx for which coordinate) |
| Relationship dynamics | Parashakti's vibrational modes | Wikilink relationship types (breadcrumb categories) |
| Schema foundation | HC struct 128-byte layout | Frontmatter key registry (maps to struct fields) |
| Sync bridge typing | Relationship edge types in Neo4j | `{family}_{n}_{semantic}` -> POS{n}_LINKS_TO relationships |

### Cross-Cutting with Other M-Levels

| M-Level | Cross-Cut with Hen |
|---------|-------------------|
| M0 (Anuttara) | Ground state -- Hen validates against M0's immutable archetype structure |
| M1 (Paramasiva) | QL tick / temporal pulse -- Hen's CT templates have temporal scope tied to M1's clock |
| M3 (Mahamaya) | Illusory/archived relations -- `m_3_archived` relations created during archive |
| M4 (Nara) | Personal journal -- NOW personal identity, oracle integration in CT4b' templates |
| M5 (Epii) | Holographic integration -- Hen's sync bridge feeds M5's total view; QV overlay updates |

---

## F. Staging Disposition

### Current `_staging/` Contents Relevant to Hen

The `_staging/` directory contains items from the original pleroma plugin that were parked during the ta-onta restructuring. Analysis of Hen-relevant items:

| Staging Item | Hen Relevance | Disposition |
|-------------|---------------|-------------|
| `_staging/root-skills/vault/SKILL.md` | Direct Hen concern -- vault skill definition | **ABSORB** into `plugins/ta-onta/hen/S1'/skills/vault/SKILL.md` |
| `_staging/root-skills/graph/SKILL.md` | Shared with Pleroma (S2') -- graph skill | **SHARE** -- Hen consumes but Pleroma owns the graph skill |
| `_staging/root-commands/graph-context.md` | Hen's graph coordination concern | **ABSORB** into Hen's S2 bridge |
| `_staging/pleroma-skills/` | Pleroma scope, not Hen | **LEAVE** in staging for Pleroma analysis |
| `_staging/pleroma-hooks/` | Pleroma scope, not Hen | **LEAVE** in staging |
| `_staging/pleroma-evals/` | Pleroma scope, not Hen | **LEAVE** in staging |
| `_staging/root-hooks/` | Shared concern -- Hen needs `after_tool_call` hooks | **SHARE** -- Hen registers hooks, root-hooks provides infrastructure |
| `_staging/root-commands/core-verify.md` | Infrastructure, not Hen-specific | **LEAVE** in staging |
| `_staging/settings.json` | Pleroma settings -- may contain Hen-relevant config keys | **REVIEW** for Hen config extraction |
| `_staging/plugin.json` | Plugin manifest -- needs ta-onta equivalent | **SUPERSEDED** by ta-onta composite-entry.ts |
| `_staging/epi-logos-plugin/` | Plugin wrapper -- needs ta-onta equivalent | **SUPERSEDED** by ta-onta meta-extension |

### Proposed Hen Directory Structure

When `plugins/ta-onta/hen/` is created, it should follow the ta-onta 3-folder pattern:

```
plugins/ta-onta/hen/
  S1/                              -- Raw primitives
    obsidian-cli-wrapper.md        -- Documentation of the Rust wrapper
    thought-routing.md             -- Thought routing specification
  S1'/                             -- QL augmentations
    templates/                     -- Template files for CT archetypes
      seed.md                      -- CT0 template
      prompt.md                    -- CT1 template
      task-spec.md                 -- CT2 template
      pattern-note.md              -- CT3 template
      daily-note.md                -- CT4b' Day scope template
      now.md                       -- CT4b' Session scope template
      thought.md                   -- CT5 template
    frontmatter-schema.md          -- 126 canonical keys documentation
    breadcrumb-system.md           -- Wikilink breadcrumb specification
    template-lens-contracts.md     -- CT/CT' validation rules
    skills/
      vault/SKILL.md               -- Vault skill (from staging)
  M/                               -- Cross-cutting M2 Parashakti
    content-typing-matrix.md       -- 72-invariant mapping
    sync-bridge-types.md           -- Neo4j relationship type definitions
```

---

## G. Ambiguities & Open Decisions

### G.1: CT4b' as Sole Template for Daily-Note and NOW

**Question:** Should CT4b' (fractal doubling) be the ONLY template used for both daily-note.md and now.md, or should CT4a (4/5/0 integration preview) also be available as an alternative?

**Evidence:**
- S4-NOW spec III explicitly states: "Template types map: daily-note -> CT4b', now -> CT4b'"
- CT4b-MASTER-TEMPLATE.md defines CT4b' as the fractal inner structure with 4.0-4.5
- DAY-AS-CONTEXT-FRAMEWORK.md distinguishes CT4a' (standard integration) from CT4b' (fractal doubling) but designates CT4b' as the "Daily Note Home"
- The daily-note-schema.md and Daily Note Template.md both use 6 positional content spaces (#0-#5), which aligns with CT4b' not CT4a

**Resolution:** CT4b' is the **canonical and sole** template for both daily-note and now.md. CT4a (4.5/0) is a different archetype for integration preview artifacts, not for temporal notes. The 6-position structure is the defining feature of CT4b' and is correct for both Day and Session scope. CT4a would be used for synthesis artifacts that bridge context (4), synthesis (5), and return (0).

**Decision:** CONFIRMED. CT4b' is the only template for daily-note and now.md.

---

### G.2: Frontmatter Schema -- 126 Keys from TS vs Current Rust Validation

**Question:** The Rust frontmatter validation in `frontmatter.rs` validates only a small subset of fields (bimbaCoordinate, ql_position, family, coordinate keys). The TS authority (`frontmatter_schema.ts`) defines 126 canonical keys. What is the migration path?

**Evidence:**
- S4-NOW spec III: "126 canonical keys from `frontmatter_schema.ts` (epi-claw authority). Key format: `{family}_{n}_{semantic}`."
- S1 spec: "Frontmatter schema grounded in HC struct (128 bytes)"
- Current `frontmatter.rs` validates: bimbaCoordinate, ql_position, family, `{family}_{n}_{semantic}` pattern (but not against a specific key list)
- Conformance remediation plan Hen checklist: "Deprecated standalone `coordinate` / `ql_position` fields not used in canonical write paths"

**Resolution:** The 126 canonical keys should be ported to Rust as a static registry. However, the current Rust validation is NOT wrong -- it validates the KEY PATTERN correctly. What is missing is:

1. **Exhaustive key list**: The specific 126 keys should be enumerable for validation and autocompletion
2. **Write-time enforcement**: Currently validation only runs on `frontmatter-validate`, not on every write
3. **Deprecated pattern REJECTION**: Currently validated but not rejected

**Decision:** PHASED MIGRATION recommended:
- Phase 1: Add deprecated pattern rejection to write paths (FR-H-028)
- Phase 2: Port the 126 key names as a static registry in Rust (FR-H-029)
- Phase 3: Enable write-time validation for all vault mutations (FR-H-002 completion)

---

### G.3: obsidian-cli Dependency -- Install or Replace?

**Question:** The obsidian-cli binary is not installed. Should we install it, or should direct filesystem I/O replace it entirely?

**Evidence:**
- S1 spec: `brew install yakitrak/yakitrak/obsidian-cli`
- S1 spec Pi Extension Port Map: 7 commands require Obsidian app running (create, open, daily, move), 7 do not
- Current vault/mod.rs: All non-filesystem commands delegate to obsidian-cli
- S4-NOW spec: "obsidian-cli installed? vault accessible?" (in `epi agent doctor` health check)
- ThoughtRoute, NowRead, NowWrite already use direct filesystem I/O without obsidian-cli

**Resolution:** obsidian-cli should be **installed** as a dependency. It provides wikilink-aware operations (move, which updates all `[[links]]` across the vault) that cannot be replicated with simple filesystem I/O. However, for headless/CI environments, commands that do NOT require the Obsidian app should have a filesystem-fallback mode.

**Decision:**
- **Install** obsidian-cli as a required dependency for full functionality
- **Document** which commands require the Obsidian app vs. which work headless
- **Add** `--headless` flag or env var (`OBSIDIAN_HEADLESS=1`) for commands that can fall back to direct filesystem I/O
- The `epi agent doctor` health check should validate obsidian-cli presence

---

### G.4: Sync Queues -- Khora Owns Queue, Hen Owns Emission

**Question:** Who owns the sync queue architecture? The INTEGRATION-SCOPE document describes Khora owning the queue but Hen emitting to it. How does the boundary work?

**Evidence:**
- INTEGRATION-SCOPE-KHORA-HEN.md: "Khora sync queue (`.khora-sync-queue.jsonl`)" -- Khora owns the queue
- S4-NOW spec III (Hen/S2): "Khora sync queue (`.khora-sync-queue.jsonl`) for batched graph writes" -- Hen uses the queue
- Conformance remediation plan US-015: "Constrain Khora queue to minimal operational contract (Obsidian-safe updates + proposals)"
- Deep-grounding US-005: Khora queue record target-path validation primitive

**Resolution:** Clear boundary:

| Concern | Owner | Consumer |
|---------|-------|----------|
| Queue infrastructure (JSONL file, append, flush, retry) | Khora | Hen, Chronos, Aletheia |
| Sync event emission (what gets queued) | Hen | Khora (receives events) |
| Graph write execution (processing queue items) | Hen/S2 bridge | S2' (graph client) |
| Queue health monitoring | Khora | Hen (`hen_status` reports queue depth) |

**Decision:** CONFIRMED. Khora owns queue infrastructure. Hen owns event emission and graph write logic. Hen reads queue depth for status reporting but does not manage queue lifecycle.

---

### G.5: CT4b' vs CT4 -- Naming and Scope

**Question:** The planning documents use CT4b' (with prime/apostrophe) inconsistently. Is CT4b' the template TYPE or the invoked INSTANCE?

**Evidence:**
- DAY-AS-CONTEXT-FRAMEWORK.md: CT4b' is the fractal doubling (4.0/1-4.4/5), distinct from CT4a' (4.5/0)
- coordinate-type-system-and-reflection-families.md: "CT4b = CT' parent (meta-frame, frame-of-frames), CT4a = (4.5/0) integration preview"
- S4-NOW spec III: Template types map to CTx archetypes (CT4b' specifically)
- US-010: "CT/CT' template-lens artifact contract validators (`CTX = CT(x)` explicit)"
- US-027: "canonical template-definition vs runtime-invocation lineage contract (CT/CT' families)"

**Resolution:** The CT/CT' distinction is:
- **CT** = template archetype DEFINITION (what content spaces exist, what CF frame governs)
- **CT'** = runtime INVOCATION of a template (the actual file created from a CT definition)

CT4b is the archetype definition. CT4b' (with prime) is the invoked instance. However, in common usage (and in the planning docs), CT4b' is used to refer to the archetype itself. This is because the daily-note template is always invoked in the inverted/runtime mode.

**Decision:** Use **CT4b'** to refer to both the archetype and its typical invocation (since daily-note and now are always invoked). Reserve CT/CT' distinction for the formal validator logic: artifacts must declare `ct_type: "daily-note"`, `ct_archetype: "CT4b"`, and validators check that the artifact's structure matches CT4b's content-space requirements.

---

### G.6: Deprecated Frontmatter Patterns -- Accept on Read or Reject Everywhere?

**Question:** How should deprecated frontmatter patterns be handled? Accept on read for backward compatibility, or reject everywhere?

**Evidence:**
- S4-NOW spec III explicitly REJECTS: standalone `coordinate`, `ql_position`, `pos_*`, `ctx_*` (except `ctx_type`)
- Conformance remediation plan Hen checklist: "Deprecated standalone `coordinate` / `ql_position` fields not used in canonical write paths"
- Deep-grounding US-008/009: "Keep legacy input parsing policy explicit (accept/normalize/fail) per ta-onta law"
- Current frontmatter.rs: Validates `bimbaCoordinate` and `ql_position` as if they are canonical (not deprecated)
- S1 spec: validation rules mention `bimbaCoordinate` as mandatory for coordinate notes

**Resolution:** There is a critical nuance here:

1. `bimbaCoordinate` is NOT deprecated -- it IS the canonical coordinate field
2. `ql_position` and `family` are NOT deprecated in the Rust validation sense -- they are valid frontmatter fields
3. What IS deprecated: `coordinate` (without `bimba` prefix), `pos_*` prefix forms, `ctx_*` standalone keys (except `ctx_type`)

The S4-NOW spec III "REJECTED" list refers to deprecated NAMING patterns that should not be used as canonical keys. This does NOT mean `ql_position` is deprecated -- it means a standalone `coordinate` field (without the `bimba` prefix) is deprecated.

**Decision:**
- **Canonical write path**: Use ONLY canonical keys. No deprecated patterns emitted.
- **Read/validation path**: Accept deprecated patterns with a WARNING (not error). Suggest canonical equivalent.
- **Normalization**: When reading legacy notes, normalize `pos{x}_{semantic}` -> `{family}_{n}_{semantic}` in the returned data.
- **`bimbaCoordinate`**: Remains the canonical field name. NOT deprecated.
- **`ql_position`**: Remains valid. NOT deprecated. The deprecated form is standalone `coordinate` (without `bimba` prefix).

---

## Appendix A: Source Documents Consulted

| Document | Path | Key Hen Content |
|----------|------|-----------------|
| INSTALL-PLAN.md | `/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/` | Install order, verification tasks T3, T8 |
| INTEGRATION-SCOPE-KHORA-HEN.md | (same archive) | Hen PRD additions US-011..014, FR-14..18, Redis schema, sync queue |
| VAK-HANDOVER.md | (same archive) | VAK language reference, skill taxonomy, Moirai |
| VAK-SUPERPOWERS-INTEGRATION-SPEC.md | (same archive) | S4-X' layer definitions, CX -> S4-X' mapping |
| ta-onta-anima-superpowers-vak-integration-spec.md | (same archive) | Day/Night' directionality, Klein topology |
| CT4b-MASTER-TEMPLATE.md | (archive/22-02-2026) | CT4b' fractal structure, daily template, time-period generalization |
| daily-note-schema.md | (archive/22-02-2026) | Position mapping, entry schema, p0-p5 frontmatter |
| Daily Note Template.md | (archive/22-02-2026) | Full template with 6 position sections |
| DAY-AS-CONTEXT-FRAMEWORK.md | (archive/22-02-2026) | CT4' meta-framework, CT4a vs CT4b, day as general template |
| daily-archive.md | (archive/22-02-2026) | 2-day temporal window, archive paths, learning extraction |
| daily.md (daily-go.md) | (archive/22-02-2026) | Daily task executor, subagent planning |
| daily-standup.md | (archive/22-02-2026) | Morning standup skill |
| daily-reflect.md | (archive/22-02-2026) | Evening reflection, DAY-REVIEW.md, TOMORROW.md |
| cron.md | (archive/22-02-2026) | Gateway cron CLI |
| cron-jobs.md | (archive/22-02-2026) | Scheduler, jobs, schedules |
| daily-notes.md | (archive/22-02-2026) | Core daily note structure |
| 2026-02-27-fr-layer-assignment-full.md | `/Users/admin/Documents/Epi-Logos/docs/plans/` | Complete Hen FR/US table (23 USs, 4 FRs) |
| 2026-02-28-coordinate-type-system-and-reflection-families.md | (same plans) | Family ordering, CT4a/CT4b, 7-in-6 problem |
| 2026-02-28-epi-claw-cli-harmonization-daily-commands.md | (same plans) | CLI daily command family, routing architecture |
| 2026-02-22-bimba-data-foundation-harmonization.md | (same plans) | Filesystem ontology, layer framing |
| 2026-02-25-ta-onta-full-architecture-conformance-remediation-plan.md | (same plans) | 53-US ledger, Hen checklist, 9 parallel lanes |
| 2026-02-24-ta-onta-us003-us010-deep-grounding-implementation.md | (same plans) | Deep grounding Tasks 7-9 for Hen |
| 2026-02-24-ta-onta-us017-us022-deep-grounding-implementation.md | (same plans) | Conformance harness, native seam |
| S4-TA-ONTA-EXTENSION-SPEC.md | `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/S/S4/` | Ta-onta package structure, Gnosis pipeline |
| S4-NOW-INTEGRATION-AND-ENVIRONMENT.md | (same specs) | Hen/S1, Hen/S1', Hen/S2, Hen/M inner layers, template system, breadcrumbs, obsidian-cli extensions |
| S1-S1i-OBSIDIAN.md | `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/S/` | Vault ontology, frontmatter schema, Pi extension port map, implementation plan |
| epi-cli/src/vault/mod.rs | `/Users/admin/Documents/Epi-Logos C Experiments/epi-cli/src/vault/` | Current Rust implementation (406 lines) |
| epi-cli/src/vault/frontmatter.rs | (same vault dir) | Coordinate and frontmatter validation (287 lines) |

## Appendix B: Dependency Graph

```
FR-H-001 (obsidian-cli wrapper) [EXISTS]
    |
    +-- FR-H-002 (frontmatter validation) [PARTIAL]
    |       |
    |       +-- FR-H-015 (key normalization) [MISSING]
    |       +-- FR-H-028 (deprecated rejection) [MISSING]
    |       +-- FR-H-029 (126 canonical keys) [MISSING]
    |
    +-- FR-H-003 (coordinate validation) [EXISTS]
    |
    +-- FR-H-010 (thought routing) [EXISTS]
    |       |
    |       +-- FR-H-017 (/Thought GraphRAG) [MISSING]
    |
    +-- FR-H-011 (NOW.md read/write) [EXISTS]

FR-H-004 (CT archetype registry) [MISSING]
    |
    +-- FR-H-005 (template type registry) [MISSING]
    |       |
    |       +-- FR-H-006 (instantiation engine) [MISSING]
    |       |       |
    |       |       +-- FR-H-007 (template invoke CLI) [MISSING]
    |       |       +-- FR-H-008 (wikilink breadcrumbs) [MISSING]
    |       |       +-- FR-H-012 (day-init) [MISSING]
    |       |       +-- FR-H-013 (now-init) [MISSING]
    |       |       +-- FR-H-016 (session-artifact-insight flow) [MISSING]
    |       |
    |       +-- FR-H-031 (hen_status tool) [MISSING]
    |
    +-- FR-H-022 (CT/CT' validators) [MISSING]

FR-H-009 (vault-to-graph sync) [MISSING]
    |
    +-- FR-H-023 (frontmatter-Neo4j mapping) [MISSING]
    +-- FR-H-020 (Redis cache) [MISSING]
    +-- FR-H-019 (coordinate-native query) [MISSING]
    |       |
    |       +-- FR-H-021 (coordinate-semantic filters) [MISSING]
    |       +-- FR-H-025 (REPL section/slice retrieval) [MISSING]
    +-- FR-H-032 (hen_hybrid_retrieve) [MISSING]
```

## Appendix C: Conformance Remediation Mapping

The conformance remediation plan (53-US ledger) identifies Lane D as Hen's remediation lane. The following USs from the remediation plan map to Hen FRs:

| Remediation US | Remediation Title | Hen FR | Status |
|---------------|-------------------|--------|--------|
| US-007 | Normalize canonical target paths in Hen and Aletheia | FR-H-023, FR-H-028 | unknown |
| US-008 | Implement shared relation/frontmatter law normalization | FR-H-015 | unknown |
| US-009 | Wire Hen frontmatter parsing and template invocation to canonical law | FR-H-002, FR-H-015, FR-H-022 | unknown |
| US-010 | Implement Hen CT/CT' template-lens artifact contract validators | FR-H-022 | unknown |
| US-011 | Wire Anima Day/NOW creation through Hen template-lens contracts | FR-H-012, FR-H-013, FR-H-022 | unknown |
| US-027 | Implement canonical template-definition vs runtime-invocation lineage | FR-H-004, FR-H-005, FR-H-022 | unknown |
| US-033 | Implement template-driven content wikilink breadcrumbs | FR-H-008 | unknown |

### Hen Checklist (from Conformance Remediation Plan)

- [ ] Frontmatter parsing/writing uses shared canonical normalization law
- [ ] Deprecated standalone `coordinate` / `ql_position` fields not used in canonical write paths
- [ ] Topology/index/query paths do not reintroduce legacy schema assumptions
- [ ] GraphRAG mechanics consume deep substrate where available

---

*"The pattern reveals itself through repetition."* -- The Quintessence
