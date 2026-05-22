# Agent-Led Coordinate Promotion Policy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace broad graph sync assumptions with an agent-led promotion policy that routes Bimba world/seed material, S/S' and M' technical docs, and day/now/thought artifacts to the right graph surface with intelligent property extraction.

**Architecture:** Hen extracts artifact evidence and wikilink structure, then S2 classifies promotion eligibility before any Neo4j write. PI/Pleroma owns intelligent property proposal and relation/property enrichment; S2 owns schema validation and final materialization. Day/now/thought files route to Graphiti episodic tracking unless explicitly promoted as coordinate graph state.

**Tech Stack:** Rust crates `epi-s1-hen-compiler-core`, `epi-s2-graph-schema`, `epi-s2-graph-services`, `epi-cli`; PI agent runtime and Pleroma skills; Neo4j for coordinate graph; Graphiti sidecar for episodic memory.

---

## Correction To Prior Assumption

The system should not run a large automatic Obsidian-to-Neo4j sync. Promotion is an agent-invocable operation with policy, evidence, and intelligence gates.

The common promoted surfaces are:

- `Idea/Bimba/Seeds/**`: Bimba seed/spec material; typically coordinate graph candidates when coordinate-bearing.
- `Idea/Bimba/World/**`: Bimba world/template material; maps to `q_*` quintessential/template properties when promoted.
- `Idea/Empty/Present/**`: day/session/now material; defaults to Graphiti episodic tracking, not canonical Neo4j coordinate nodes.
- `Idea/Pratibimba/Self/Thought/**`: thought artifacts; defaults to Graphiti or Thought/T' episode surfaces unless explicitly coordinate-promoted.
- S/S' technical docs and M' docs: coordinate graph candidates, but require intelligent property extraction for query-grade `s_*`, `m_*`, and supporting `c_*` properties.
- Repo source files/folders: not graph nodes by default; they are tracked as implementation evidence/provenance linked to S/S' or M' coordinate nodes.

## Coordinate Semantics Must Be Agent-Readable

Coordinate property construction is not arbitrary label-making. S2 must expose a compact coordinate semantics registry that any agent can inspect before proposing properties. The registry is schema-owned in `Body/S/S2/graph-schema` and surfaced through the S0 adapter as:

```bash
epi --json graph coordinate-semantics
```

The registry must include:

- all coordinate property families: `c`, `p`, `l`, `s`, `t`, `m`, `q`
- each family's semantic domain, direct axis, inverted axis, and property guidance
- position semantics for `0..=5`, including C-role and P-question guidance
- the canonical property construction law:
  - identity property: `coordinate`
  - direct key: `{family}_{position}_{semantic_suffix}`
  - inverted key: `{family}_{position}_i_{semantic_suffix}`
  - invalid spellings: `prime`, `inverted`, `inversion` inside property keys
- authority paths: `repo-ontology.md`, `docs/resources/updated-ql-mef/epi_logos_cheat_sheet.md`, `Idea/Bimba/World/Types/Coordinates`, and `Body/S/S2/graph-schema/src/lib.rs`

Hen property-intelligence requests must direct PI/Pleroma to consult this S2 registry before final property selection. Hen may carry evidence and prompt constraints, but S2 remains the coordinate-law authority.

## Redis Runtime And Client Boundary

The Docker Redis container is the runtime service. Rust crates use the normal crates.io Redis client to talk to that service; the old `Body/S/S0/epi-cli/vendor/redis` patch is no longer selected in `Body/S/S0/epi-cli/Cargo.toml`.

Current dependency inspection should show `redis v0.25.5` from crates.io, consumed by `epi-cli`, `epi-s3-redis-context`, and indirectly `epi-s2-graph-services`. This keeps the runtime story simple: Docker owns the Redis server, Rust owns only the client library, and S3 remains the Redis runtime bridge consumed by S2 semantic-cache contracts.

## Promotion Classes

### `canonical_bimba_seed`

Use for coordinate-bearing Bimba map/seed material. Target: Neo4j coordinate graph. Properties should include canonical identity, coordinate prefix/depth/axis/parent, source path, content hash, and selected ontology properties.

### `bimba_world_template`

Use for `Idea/Bimba/World/**` files. Target: Neo4j coordinate graph only when coordinate-bearing or explicitly invoked. Property family emphasis: `q_*` quintessential/template properties, plus `c_*` artifact identity and provenance.

### `technical_coordinate_doc`

Use for S/S' and M' architecture/protocol/code-boundary docs. Target: Neo4j coordinate graph. Requires PI/Pleroma property proposal over the full coordinate schema. S/S' docs often lead with `s_*` and `c_*`; M' docs often lead with `m_*` and `c_*`; neither is restricted to those families.

### `code_provenance_evidence`

Use for repo files/folders related to S/S' and M' layers. Target: relationship/evidence properties on coordinate nodes, not standalone canonical nodes by default. Tracks files, folders, symbols, ownership, and execution-flow links.

### `episodic_temporal_trace`

Use for day/now/session files under `Idea/Empty/Present/**`. Target: Graphiti episodic system through S3/S5 gateway surfaces. These should not become canonical Neo4j coordinate nodes unless explicitly promoted by agent policy.

### `thought_episode`

Use for `Idea/Pratibimba/Self/Thought/**`. Target: Graphiti or Thought/T' tracking, with links back to `c_0_source_coordinates`. Coordinate graph promotion is explicit, not default.

### `manual_review_required`

Use when the artifact is coordinate-bearing but ambiguous, has conflicting frontmatter, lacks sufficient evidence, or asks for properties outside the registered schema.

## Task 1: Add S2 Promotion Policy Classifier

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Create: `Body/S/S2/graph-services/tests/promotion_policy_contract.rs`

**Step 1: Write failing tests**

Create tests proving:

- `Idea/Bimba/Seeds/M/M2.md` with coordinate becomes `canonical_bimba_seed`.
- `Idea/Bimba/World/NOW.md` becomes `bimba_world_template` and requests `q_*` property intelligence.
- `Idea/Empty/Present/21-05-2026/now.md` becomes `episodic_temporal_trace`.
- `Idea/Pratibimba/Self/Thought/T3/T3-20260521.md` becomes `thought_episode`.
- `docs/specs/S/S2-S2i-GRAPH.md` or S/S' docs become `technical_coordinate_doc`.
- repo paths like `Body/S/S2/graph-services/src/sync_coordinator.rs` become `code_provenance_evidence`.

**Step 2: Implement classifier**

Add:

```rust
pub enum PromotionClass {
    CanonicalBimbaSeed,
    BimbaWorldTemplate,
    TechnicalCoordinateDoc,
    CodeProvenanceEvidence,
    EpisodicTemporalTrace,
    ThoughtEpisode,
    ManualReviewRequired,
}

pub struct PromotionPolicyDecision {
    pub class: PromotionClass,
    pub target_surface: PromotionTargetSurface,
    pub requires_intelligent_properties: bool,
    pub coordinate_property_families: Vec<String>,
    pub leading_property_families: Vec<String>,
    pub reason: String,
}
```

`PromotionTargetSurface` should include at least `Neo4jCoordinateGraph`, `GraphitiEpisode`, `EvidenceOnly`, and `ManualReview`.

**Step 3: Run tests**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test promotion_policy_contract
```

**Acceptance:**

- Promotion policy decides destination before S2 validation/upsert.
- Day/now/thought material does not silently become canonical Neo4j nodes.

## Task 2: Add Intelligent Property Proposal Contract

**Files:**

- Modify: `Body/S/S1/hen-compiler-core/src/relation_inference.rs`
- Create: `Body/S/S1/hen-compiler-core/src/property_intelligence.rs`
- Create: `Body/S/S1/hen-compiler-core/tests/property_intelligence_contract.rs`
- Modify: `Body/S/S1/hen-compiler-core/src/lib.rs`

**Step 1: Write failing tests**

Tests must prove:

- Hen can build a property-intelligence request from real artifact evidence.
- The request includes coordinate, source path, wikilinks, headings, content hashes, and promotion class.
- The request does not include provider/model/API key fields.
- The full coordinate-property families are explicit: `["c", "p", "l", "s", "t", "m", "q"]`.
- Leading property-family hints are explicit without becoming restrictions, e.g. `["s", "c"]` for S docs, `["m", "c"]` for M' docs, `["q", "c"]` for Bimba world templates.
- The prompt contract states that `i` is the only property-key inversion marker: `m_2_i_colour` means M2', while `m_2_prime_colour` is invalid.

**Step 2: Implement request DTO**

Add:

```rust
pub struct PropertyIntelligenceRequest {
    pub source_coordinate: Option<String>,
    pub source_path: String,
    pub promotion_class: String,
    pub coordinate_property_families: Vec<String>,
    pub leading_property_families: Vec<String>,
    pub known_schema_properties: Vec<String>,
    pub wikilink_evidence: Vec<RelationLinkEvidence>,
    pub frontmatter_evidence: Vec<...>,
    pub headings: Vec<...>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub system_instructions: String,
}
```

**Step 3: Keep provider boundary PI-owned**

Hen may construct the request and validate candidate property JSON. It must not choose direct model providers. PI/Pleroma executes property intelligence.

**Step 4: Run tests**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test property_intelligence_contract
```

**Acceptance:**

- Property extraction is agent-intelligent, schema-aware, and not hardcoded script-only parsing.

## Task 3: Add S2 Property Proposal Validator

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Create: `Body/S/S2/graph-services/tests/property_proposal_contract.rs`

**Step 1: Write failing tests**

Tests must reject:

- proposed property keys outside graph-schema registry
- proposed prefix family outside the canonical coordinate-property families
- proposed property keys that misuse prime/inversion spelling instead of the canonical `i` segment
- empty evidence text
- values with incompatible property type

Tests must accept:

- `q_*` leading properties for `bimba_world_template`
- `s_*` leading properties for S/S' technical docs
- `m_*` leading properties for M' docs, including `m_*_i_*` inversion properties
- shared `c_*` identity/provenance properties across all coordinate graph classes
- non-leading coordinate families when PI/Pleroma provides valid schema-registered evidence

**Step 2: Implement validator**

Add DTOs:

```rust
pub struct PropertyProposal {
    pub key: String,
    pub value: serde_json::Value,
    pub evidence_kind: String,
    pub evidence_text: String,
    pub source_path: Option<String>,
    pub source_line: Option<usize>,
    pub proposed_by: String,
}
```

Validation must use `epi-s2-graph-schema` property specs.

**Step 3: Run tests**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test property_proposal_contract
```

**Acceptance:**

- PI/Pleroma may propose properties, but S2 decides whether they are valid graph state.

## Task 4: Track Code/File/Folder Provenance For S/S' And M'

**Files:**

- Modify: `Body/S/S2/graph-schema/src/lib.rs`
- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Create: `Body/S/S2/graph-schema/tests/code_provenance_properties.rs`
- Create: `Body/S/S2/graph-services/tests/code_provenance_contract.rs`

**Step 1: Write failing tests**

Required properties:

- `s_0_repo_path`
- `s_0_repo_root`
- `s_0_file_kind`
- `s_0_component`
- `s_0_symbol_refs`
- `s_0_execution_flow_refs`
- `s_0_depends_on_paths`
- `s_0_owned_by_coordinate`
- `m_0_repo_path`
- `m_0_component`
- `m_0_symbol_refs`

**Step 2: Register properties**

Add query-grade property specs for code provenance fields. These should be node or relationship properties depending on whether they describe the coordinate node itself or evidence links.

**Step 3: Add evidence relationship**

Use registered relationship types only. Prefer `IMPLEMENTS`, `SOURCES`, or `SYNCED_FROM` with evidence properties rather than inventing ad hoc relation labels.

**Step 4: Run tests**

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml --test code_provenance_properties
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test code_provenance_contract
```

**Acceptance:**

- S/S' and M' graph nodes can answer “what code/files/folders implement or evidence this coordinate?”

## Task 5: Route Day/Now/Thought Promotion To Graphiti

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Inspect/modify if needed: `Body/S/S3/gateway-contract/src/lib.rs`
- Create: `Body/S/S2/graph-services/tests/graphiti_routing_contract.rs`

**Step 1: Write failing tests**

Tests must prove:

- `Idea/Empty/Present/**` routes to `GraphitiEpisode`.
- `Idea/Pratibimba/Self/Thought/**` routes to `GraphitiEpisode` or Thought episode surface.
- Neo4j coordinate upsert is not attempted for these classes unless an explicit override is present.

**Step 2: Implement routing**

Produce an invocation plan for S3/S5 Graphiti deposit methods, not a direct Graphiti write inside S2 unless an existing S2 adapter authority already exists.

**Step 3: Run tests**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graphiti_routing_contract
```

**Acceptance:**

- Episodic memory sync belongs to Graphiti surfaces, not canonical coordinate graph sync.

## Task 6: Add PI-Agent-Invocable Promotion Tool Surface

**Files:**

- Modify: `Body/S/S0/epi-cli/src/agent/mod.rs`
- Modify: `Body/S/S0/epi-cli/src/graph/mod.rs`
- Create: `Body/S/S0/epi-cli/tests/agent_graph_promotion_contract.rs`
- Inspect/modify if needed: S4/Pleroma extension tool registration under `Body/S/S4/`

**Step 1: Write failing tests**

Tests must prove:

- PI agent can invoke a graph promotion planning surface.
- The CLI/API exposes policy classification, dry-run plan, and validation errors.
- The CLI/API does not define graph labels/properties/relation laws itself.
- Invocation can request property intelligence via PI/Pleroma rather than direct provider configuration.

**Step 2: Implement adapter**

S0 should call S1/S2 APIs and serialize results. S0 must not create raw graph-law strings.

**Step 3: Run tests**

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_graph_promotion_contract
```

**Acceptance:**

- The sync/promotion tools are invocable at PI agent level.
- Agent runtime can plan promotion without bypassing S2 schema authority.

## Task 7: Add Gated Live End-To-End Promotion With Intelligence

**Files:**

- Create/modify: `Body/S/S2/graph-services/tests/hen_promotion_e2e.rs`
- Create/modify: `Body/S/S1/hen-compiler-core/tests/property_intelligence_live.rs`

**Step 1: Deterministic no-LLM test**

Use prebuilt property proposals and relation candidates. This tests S1->S2 handoff and validation, not inference quality.

**Step 2: Gated live PI test**

Only run with explicit env gates:

```bash
EPI_HEN_PROPERTY_LIVE=1
EPI_GRAPH_LIVE=1
```

The test must call PI/Pleroma for property proposal and real Neo4j for final materialization.

**Step 3: Assertions**

Assert:

- S/S' or M' artifact gets useful query-grade properties.
- invalid property proposals are rejected by S2.
- created node can be queried by coordinate and property prefix family.
- day/now artifacts route to Graphiti, not Neo4j.

**Acceptance:**

- The agent-led promotion loop is real, gated, and production-shaped.

## Verification Matrix

Run focused tests after each tranche:

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test property_intelligence_contract
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml --test code_provenance_properties
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test promotion_policy_contract
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test property_proposal_contract
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graphiti_routing_contract
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_graph_promotion_contract
```

Run full non-live matrix before final handoff:

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml
```

Live gated only with explicit approval:

```bash
EPI_HEN_PROPERTY_LIVE=1 EPI_GRAPH_LIVE=1 cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test hen_promotion_e2e -- --ignored
```
