# Hen Coordinate Graph Promotion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the production S1 -> S2 promotion path where Hen parses vault artifacts, extracts wikilink/frontmatter/body evidence, uses real LLM inference for relation intent, and S2 persists coordinate-owned graph state in Neo4j using descriptive labels, canonical `coordinate` identity, schema-owned properties, and typed relationships.

**Architecture:** S1/Hen owns vault artifact analysis and relation-intent production. S2/graph-schema owns graph labels, property keys, coordinate-prefix coverage, relationship types, indexes, and compatibility rules. S2/graph-services owns transactional Neo4j writes and CRUD/query boundaries. S0 CLI and M/Tauri are adapters only; they invoke S2 services and never become graph-law authorities. Legacy `:Bimba`, `BimbaCoordinate`, `bimbaCoordinate`, and `bimba_coordinate` forms remain compatibility inputs only until migration removes them.

**Tech Stack:** Rust, Hen compiler core, S2 graph-schema, S2 graph-services, Neo4j, neo4rs, Tauri 2, TypeScript, real vault fixtures, live Neo4j integration tests, and live LLM relation-inference tests behind explicit environment gates.

---

## Ground Rules

- `coordinate` is the canonical identity property on every coordinate-bearing node.
- Neo4j labels are descriptive and schema-derived. Do not make `:Bimba {coordinate}` the canonical node shape.
- `:Bimba`, `:BimbaNode`, `:BimbaCoordinate`, `bimbaCoordinate`, and `bimba_coordinate` are compatibility forms only.
- Wikilinks are primary S1 relation evidence. Frontmatter is one evidence channel, not the whole relation law.
- LLM inference is required for relation classification where deterministic wikilink/frontmatter evidence cannot supply the typed relationship by itself.
- S2 graph-schema and graph-services remain the schema/protocol authorities.
- S0 CLI, M/Tauri commands, S3 UI stores, and S4 integrations must remain adapters.
- No ad hoc relationship labels in feature code. Every relationship type must be registered in graph-schema with tests and property rules.
- No mock/demo/placeholder tests. Unit tests must validate real parsing, real schema validation, real Cypher construction constraints, or real service behavior. LLM and Neo4j tests may be gated by environment, but when run they must hit real providers.

---

## Target Protocol

### Node Identity

Every promoted coordinate-bearing graph node is addressed by:

```cypher
MATCH (n)
WHERE n.coordinate = $coordinate
RETURN n
```

The identity property is always:

```rust
pub const COORDINATE_PROPERTY: &str = "coordinate";
```

Labels are additive descriptors, for example:

```text
:Coordinate
:VaultArtifact
:ThoughtArtifact
:ContextFrame
:Psychoid
:Kernel
:Lens
:Agent
:DailyNote
:NowSession
:GraphPromotion
```

The exact labels come from schema functions, not from callers.

### Coordinate Ownership

S1 may discover and normalize coordinates, but S2 owns coordinate graph materialization. S1 emits a promotion intent; S2 decides node labels, indexes, constraints, typed relationships, and compatibility updates.

### Property Naming

Properties must be query-grade:

```rust
coordinate: String
coordinate_prefix: String
coordinate_depth: i64
coordinate_parent: Option<String>
coordinate_axis: Option<String>
vault_path: Option<String>
artifact_kind: Option<String>
content_hash: Option<String>
title: Option<String>
summary: Option<String>
source_mtime: Option<i64>
sync_status: String
sync_version: String
last_promoted_at: String
promotion_source: String
relation_evidence_count: i64
```

Coordinate-prefix property families must be covered explicitly:

```text
c_*
p_*
l_*
s_*
t_*
m_*
q_*
```

Each family needs schema-owned validation for key shape, value type, cardinality, and query/index status. Callers may not invent technical graph properties by string concatenation outside graph-schema.

### Relationship Typing

Relationships are typed by schema registry and created by graph-services. Wikilinks initially establish reference evidence; Hen plus LLM inference classifies the stronger relation when evidence supports it.

Minimum production relationship families for this pass:

```text
REFERENCES
SOURCES
CONTAINS
PART_OF
ELABORATES
CONTRASTS
IMPLEMENTS
OPERATES_IN
REFLECTS_AS
INVERTS_TO
SUPPORTS
CRITIQUES
DERIVES_FROM
PROMOTES_TO
SYNCED_FROM
```

Each relationship carries useful procedural properties:

```rust
evidence_kind: String          // wikilink, frontmatter, body_context, llm_inference, migration
evidence_text: Option<String>
source_path: Option<String>
source_line: Option<i64>
target_text: Option<String>
confidence: Option<f64>
inferred_by: Option<String>
prompt_hash: Option<String>
created_by_sync_version: String
last_verified_at: String
```

### Compatibility Migration

Compatibility reads must support legacy fields:

```cypher
WHERE n.coordinate = $coordinate
   OR n.bimbaCoordinate = $coordinate
   OR n.bimba_coordinate = $coordinate
```

Compatibility writes must converge them:

```cypher
SET n.coordinate = coalesce(n.coordinate, n.bimbaCoordinate, n.bimba_coordinate)
REMOVE n.bimbaCoordinate
REMOVE n.bimba_coordinate
```

Legacy labels may remain during migration but must not be added as canonical labels by new code.

### Sync Boundaries

S1/Hen:

- Parse frontmatter.
- Parse markdown body.
- Parse wikilinks with line/context evidence.
- Resolve links where possible.
- Build relation evidence.
- Invoke real LLM inference for relationship classification.
- Emit `GraphPromotionIntent`.
- Never write Neo4j directly.

S2/graph-schema:

- Define labels.
- Define property registry.
- Define coordinate-prefix property families.
- Define relationship registry.
- Define migration compatibility names.
- Define constraints/indexes.

S2/graph-services:

- Validate promotion intent against graph-schema.
- Upsert coordinate nodes in transactions.
- Apply descriptive labels.
- Upsert typed relationships.
- Run compatibility migrations.
- Expose CRUD/query API to adapters.

S0 CLI:

- Adapter for bootstrap, doctor, sync, query, and migration commands.
- No graph schema decisions.

M/Tauri:

- Live app boundary.
- Calls S2 service-backed commands.
- Does not maintain direct Neo4j law in the app shell.

S4/Aletheia:

- Higher-order integration consumer.
- Supplies or requests graph operations through S2/S0/M adapters only.

---

## Task 1: Baseline Scope, VAK/GitNexus/Depwire Evidence

**Files:**

- `AGENTS.md`
- `CLAUDE.md`
- `repo-ontology.md`
- `docs/dev/architecture/depwire/CURRENT.md`
- `Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md`
- `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`
- `Idea/Bimba/Seeds/S/S1/S1'/Legacy/plans/2026-03-07-s1-s2-implementation-plan.md`

**Steps:**

1. Run the VAK gate for this non-trivial implementation pass and record the coordinate/agent routing in the implementation notes.
2. Refresh GitNexus if stale:

```bash
/opt/homebrew/bin/node /Users/admin/.npm-global/bin/gitnexus status
/opt/homebrew/bin/node /Users/admin/.npm-global/bin/gitnexus analyze
```

3. Capture GitNexus context before editing each touched symbol:

```bash
/opt/homebrew/bin/node /Users/admin/.npm-global/bin/gitnexus context graph_sync_intent
/opt/homebrew/bin/node /Users/admin/.npm-global/bin/gitnexus context SyncCoordinator
/opt/homebrew/bin/node /Users/admin/.npm-global/bin/gitnexus context RelationshipManager
```

4. Refresh depwire:

```bash
./depwire/dist/index.js parse .
./depwire/dist/index.js health .
```

**Acceptance:**

- Implementation notes include a file/component inventory.
- Implementation notes include symbol/execution-flow map for Hen -> S2 -> CLI/Tauri.
- Implementation notes identify stale or missing GitNexus/depwire coverage rather than trusting false negatives.

---

## Task 2: Hen Wikilink Parser

**Files:**

- `Body/S/S1/hen-compiler-core/src/lib.rs`
- `Body/S/S1/hen-compiler-core/src/wikilinks.rs`
- `Body/S/S1/hen-compiler-core/tests/wikilink_parser.rs`

**Failing Test First:**

Create `Body/S/S1/hen-compiler-core/tests/wikilink_parser.rs`:

```rust
use hen_compiler_core::wikilinks::{parse_wikilinks, WikilinkTarget};

#[test]
fn parses_body_wikilinks_with_aliases_lines_and_context() {
    let markdown = r#"
# C0 Overview

This develops [[C0/Seeds/T5|the fifth seed]] and [[#Local Heading]].

```text
Do not parse [[Inside Code]]
```

Later, see [[Bimba/Coordinate Family]].
"#;

    let links = parse_wikilinks(markdown);

    assert_eq!(links.len(), 3);
    assert_eq!(links[0].target, WikilinkTarget::Path("C0/Seeds/T5".into()));
    assert_eq!(links[0].alias.as_deref(), Some("the fifth seed"));
    assert_eq!(links[0].line, 4);
    assert!(links[0].context.contains("This develops"));
    assert_eq!(links[1].target, WikilinkTarget::Heading("Local Heading".into()));
    assert_eq!(links[2].target, WikilinkTarget::Path("Bimba/Coordinate Family".into()));
}
```

**Implementation:**

- Add a real parser that handles `[[target]]`, `[[target|alias]]`, `[[target#heading]]`, and `[[#heading]]`.
- Track line numbers and a trimmed context window.
- Ignore fenced code blocks.
- Preserve raw target text for later resolver/intelligence stages.
- Export the module from `lib.rs`.

**Run:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test wikilink_parser
```

**Commit:**

```bash
git add Body/S/S1/hen-compiler-core/src/lib.rs Body/S/S1/hen-compiler-core/src/wikilinks.rs Body/S/S1/hen-compiler-core/tests/wikilink_parser.rs
git commit -m "Add Hen wikilink parser"
```

---

## Task 3: Hen Artifact Evidence Model

**Files:**

- `Body/S/S1/hen-compiler-core/src/artifact_evidence.rs`
- `Body/S/S1/hen-compiler-core/src/lib.rs`
- `Body/S/S1/hen-compiler-core/tests/artifact_evidence.rs`

**Failing Test First:**

```rust
use hen_compiler_core::artifact_evidence::{collect_artifact_evidence, ArtifactKind};

#[test]
fn combines_frontmatter_and_body_wikilink_evidence() {
    let markdown = r#"---
coordinate: C0/T5
title: The Seed
source_coordinates:
  - C0
  - T5
---

This note references [[C0/T4|prior seed]] and [[C1]].
"#;

    let evidence = collect_artifact_evidence("Idea/Empty/seed.md", markdown).unwrap();

    assert_eq!(evidence.coordinate.as_deref(), Some("C0/T5"));
    assert_eq!(evidence.title.as_deref(), Some("The Seed"));
    assert_eq!(evidence.artifact_kind, ArtifactKind::VaultMarkdown);
    assert_eq!(evidence.frontmatter_source_coordinates, vec!["C0", "T5"]);
    assert_eq!(evidence.body_wikilinks.len(), 2);
    assert!(evidence.content_hash.starts_with("sha256:"));
}
```

**Implementation:**

- Parse frontmatter as evidence, not as graph law.
- Normalize known frontmatter keys through Hen evidence structs only.
- Include source path, artifact kind, title, coordinate, source coordinate list, body links, headings, content hash, and markdown body hash.
- Keep unknown frontmatter keys in an evidence map for later schema validation; do not silently discard them.

**Run:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test artifact_evidence
```

**Commit:**

```bash
git add Body/S/S1/hen-compiler-core/src/artifact_evidence.rs Body/S/S1/hen-compiler-core/src/lib.rs Body/S/S1/hen-compiler-core/tests/artifact_evidence.rs
git commit -m "Model Hen artifact evidence"
```

---

## Task 4: Hen Relation Inference Contract With Real LLM Provider

**Files:**

- `Body/S/S1/hen-compiler-core/src/relation_inference.rs`
- `Body/S/S1/hen-compiler-core/src/lib.rs`
- `Body/S/S1/hen-compiler-core/tests/relation_inference_contract.rs`
- `Body/S/S1/hen-compiler-core/tests/relation_inference_live.rs`

**Failing Test First:**

```rust
use hen_compiler_core::relation_inference::{
    build_relation_inference_request, validate_relation_candidates, RelationType,
};
use hen_compiler_core::artifact_evidence::collect_artifact_evidence;

#[test]
fn builds_pi_relation_request_from_real_wikilink_evidence() {
    let source = collect_artifact_evidence(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\n---\nThis elaborates [[C0/T4]] and contrasts [[C1]].",
    )
    .unwrap();

    let request = build_relation_inference_request(&source, &[]).unwrap();

    assert_eq!(request.source_coordinate, "C0/T5");
    assert_eq!(request.link_evidence.len(), 2);
    assert!(request.system_instructions.contains("schema-owned relationship types"));
    assert!(request.system_instructions.contains("Do not invent relationship labels"));
}

#[test]
fn rejects_candidates_with_unregistered_relationship_type() {
    let result = validate_relation_candidates(r#"
      [{"source_coordinate":"C0/T5","target_coordinate":"C0/T4","relation_type":"MADE_UP","confidence":0.91}]
    "#);

    assert!(result.is_err());
}
```

**Live Test:**

Create `relation_inference_live.rs` as an environment-gated test that invokes the actual PI agent inference boundary. This is not a mock. If the managed PI agent runtime is not configured, the test must print a clear skip message and return.

Required runtime:

```text
epi agent models add-provider --agent anima kimi
epi agent models set-default --agent anima kimi/kimi-k2
epi agent auth set --agent anima kimi --api-key "$KIMI_API_KEY"
```

Optional Hen-to-PI routing overrides:

```text
EPI_HEN_PI_AGENT=anima
EPI_HEN_PI_ROLE=logos
EPI_HEN_PI_AGENT_DIR=/path/to/.epi/agents/anima/agent
EPI_HEN_PI_SYSTEM_PROMPT=/path/to/Body/S/S4/pi-agent/prompts/epi-system.md
EPI_HEN_PI_PROGRAM=pi
```

Provider boundary clarification:

- Hen does not own model/provider credentials, provider endpoints, or OpenAI-compatible payload construction.
- Hen owns evidence extraction, request construction, and candidate validation.
- PI/S4 owns provider/model selection and auth through the managed agent runtime (`epi agent models` and `epi agent auth`).
- The Hen relation inference provider calls PI in a constrained non-interactive mode: no tools, no session, no context-file loading, and no extension loading. This keeps relation classification inside PI while avoiding unrelated runtime plugin side effects.
- The runtime provider may be Kimi, Minimax, GLM, Gemini, or another PI-supported backend later, but that choice remains invisible to Hen.

The live test must assert that:

- The provider returns JSON candidates.
- Every candidate uses a graph-schema registered relation type.
- Every candidate includes evidence text and confidence.
- At least one relation is inferred from body wikilink evidence.

**Implementation:**

- Define:

```rust
pub struct RelationInferenceRequest { /* source coordinate, evidence, allowed relation schema */ }
pub struct RelationInferenceCandidate { /* source, target, type, confidence, evidence, provenance */ }
pub trait RelationInferenceProvider { async fn infer(&self, request: &RelationInferenceRequest) -> Result<Vec<RelationInferenceCandidate>>; }
```

- Add a production provider that calls the managed PI agent runtime.
- Do not add a fake provider as the default execution path.
- Keep deterministic tests focused on request building and candidate validation, not pretending to test inference.

**Run:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test relation_inference_contract
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test relation_inference_live -- --ignored
```

**Commit:**

```bash
git add Body/S/S1/hen-compiler-core/src/relation_inference.rs Body/S/S1/hen-compiler-core/src/lib.rs Body/S/S1/hen-compiler-core/tests/relation_inference_contract.rs Body/S/S1/hen-compiler-core/tests/relation_inference_live.rs
git commit -m "Add Hen relation inference contract"
```

---

## Task 5: Replace Thin GraphSyncIntent With Promotion Intent

**Files:**

- `Body/S/S1/hen-compiler-core/src/lib.rs`
- `Body/S/S1/hen-compiler-core/src/graph_promotion.rs`
- `Body/S/S1/hen-compiler-core/tests/graph_sync_intent.rs`
- `Body/S/S1/hen-compiler-core/tests/graph_promotion_intent.rs`

**Failing Test First:**

```rust
use hen_compiler_core::graph_promotion::GraphPromotionIntent;

#[test]
fn promotion_intent_carries_properties_labels_and_typed_relations() {
    let intent = GraphPromotionIntent::from_markdown(
        "Idea/Empty/current.md",
        "---\ncoordinate: C0/T5\ntitle: Current\n---\nLinks [[C0/T4]].",
    )
    .unwrap();

    assert_eq!(intent.node.coordinate, "C0/T5");
    assert!(intent.node.requested_label_hints.contains(&"VaultArtifact".to_string()));
    assert_eq!(intent.node.properties.get("title").unwrap(), "Current");
    assert_eq!(intent.link_evidence.len(), 1);
}
```

**Implementation:**

- Keep `graph_sync_intent` as a compatibility function for existing callers.
- Introduce `GraphPromotionIntent` as the canonical S1 output.
- Include:
  - node identity evidence
  - artifact properties
  - label hints
  - wikilink evidence
  - frontmatter evidence
  - LLM relation candidates
  - content hash
  - compatibility source fields
- Do not set final Neo4j labels in Hen; only provide hints and evidence.

**Run:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test graph_promotion_intent
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test graph_sync_intent
```

**Commit:**

```bash
git add Body/S/S1/hen-compiler-core/src/lib.rs Body/S/S1/hen-compiler-core/src/graph_promotion.rs Body/S/S1/hen-compiler-core/tests/graph_sync_intent.rs Body/S/S1/hen-compiler-core/tests/graph_promotion_intent.rs
git commit -m "Promote Hen graph sync intent to graph promotion intent"
```

---

## Task 6: S2 Schema Descriptive Label Registry

**Files:**

- `Body/S/S2/graph-schema/src/lib.rs`
- `Body/S/S2/graph-schema/tests/label_registry.rs`

**Failing Test First:**

```rust
use epi_s2_graph_schema::{labels_for_coordinate_node, compatibility_labels, COORDINATE_PROPERTY};

#[test]
fn coordinate_identity_is_property_and_labels_are_descriptive() {
    let labels = labels_for_coordinate_node("C0/T5", "VaultMarkdown").unwrap();

    assert_eq!(COORDINATE_PROPERTY, "coordinate");
    assert!(labels.contains(&"Coordinate".to_string()));
    assert!(labels.contains(&"VaultArtifact".to_string()));
    assert!(!labels.contains(&"Bimba".to_string()));
}

#[test]
fn bimba_labels_are_compatibility_only() {
    let compat = compatibility_labels();

    assert!(compat.contains(&"Bimba".to_string()));
    assert!(compat.contains(&"BimbaCoordinate".to_string()));
}
```

**Implementation:**

- Add `GraphLabelSpec`.
- Add schema-owned label derivation by coordinate prefix, artifact kind, and promotion source.
- Mark legacy labels as compatibility-only.
- Update existing graph-schema tests that currently imply `:Bimba` as canonical.
- Preserve `COORDINATE_PROPERTY = "coordinate"`.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml label_registry
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
```

**Commit:**

```bash
git add Body/S/S2/graph-schema/src/lib.rs Body/S/S2/graph-schema/tests/label_registry.rs
git commit -m "Add descriptive graph label registry"
```

---

## Task 7: S2 Schema Property Registry and Full Prefix Coverage

**Files:**

- `Body/S/S2/graph-schema/src/lib.rs`
- `Body/S/S2/graph-schema/tests/property_registry.rs`
- `Body/S/S2/graph-schema/tests/coordinate_prefix_properties.rs`

**Failing Test First:**

```rust
use epi_s2_graph_schema::{
    canonical_property_key, property_spec, validate_coordinate_prefix_property,
};

#[test]
fn covers_all_coordinate_prefix_property_families() {
    for prefix in ["c", "p", "l", "s", "t", "m", "q"] {
        let key = format!("{prefix}_0_summary");
        assert!(
            validate_coordinate_prefix_property(&key).is_ok(),
            "{key} should be accepted"
        );
    }
}

#[test]
fn rejects_unknown_technical_properties() {
    assert!(property_spec("randomGraphThing").is_err());
}

#[test]
fn canonicalizes_legacy_coordinate_property_names_as_compatibility_only() {
    assert_eq!(canonical_property_key("bimbaCoordinate").unwrap(), "coordinate");
    assert_eq!(canonical_property_key("bimba_coordinate").unwrap(), "coordinate");
}
```

**Implementation:**

- Add `GraphPropertySpec` with:
  - key
  - value type
  - cardinality
  - query/index expectation
  - compatibility aliases
  - owning layer
- Register procedural properties needed for query and sync:
  - `coordinate`
  - `coordinate_prefix`
  - `coordinate_depth`
  - `coordinate_parent`
  - `coordinate_axis`
  - `vault_path`
  - `artifact_kind`
  - `title`
  - `summary`
  - `content_hash`
  - `source_mtime`
  - `sync_status`
  - `sync_version`
  - `last_promoted_at`
  - `promotion_source`
  - `relation_evidence_count`
- Implement coordinate-prefix family validation for `c_*`, `p_*`, `l_*`, `s_*`, `t_*`, `m_*`, and `q_*`.
- Keep unknown caller-supplied graph properties out of writes unless explicitly whitelisted.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml property_registry
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml coordinate_prefix_properties
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
```

**Commit:**

```bash
git add Body/S/S2/graph-schema/src/lib.rs Body/S/S2/graph-schema/tests/property_registry.rs Body/S/S2/graph-schema/tests/coordinate_prefix_properties.rs
git commit -m "Add graph property registry with coordinate prefix coverage"
```

---

## Task 8: S2 Relationship Registry

**Files:**

- `Body/S/S2/graph-schema/src/lib.rs`
- `Body/S/S2/graph-schema/tests/relationship_registry.rs`
- `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`

**Failing Test First:**

```rust
use epi_s2_graph_schema::{relationship_spec, relationship_types};

#[test]
fn relationship_types_are_schema_registered() {
    for rel_type in [
        "REFERENCES",
        "SOURCES",
        "CONTAINS",
        "PART_OF",
        "ELABORATES",
        "CONTRASTS",
        "IMPLEMENTS",
        "OPERATES_IN",
        "REFLECTS_AS",
        "INVERTS_TO",
        "SUPPORTS",
        "CRITIQUES",
        "DERIVES_FROM",
        "PROMOTES_TO",
        "SYNCED_FROM",
    ] {
        assert!(relationship_spec(rel_type).is_ok(), "{rel_type} missing");
    }
}

#[test]
fn no_unknown_relationship_type_is_accepted() {
    assert!(relationship_spec("POS0_LINKS_TO").is_err());
    assert!(relationship_spec("MADE_UP").is_err());
}
```

**Implementation:**

- Add `GraphRelationshipSpec`.
- Register relationship types and required/optional properties.
- Mark old positional labels like `POS0_LINKS_TO` as migration inputs only, not canonical outputs.
- Update S2 spec with the relationship registry and the rule that relation creation code may only use registered types.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml relationship_registry
```

**Commit:**

```bash
git add Body/S/S2/graph-schema/src/lib.rs Body/S/S2/graph-schema/tests/relationship_registry.rs Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md
git commit -m "Register canonical graph relationship types"
```

---

## Task 9: S2 Promotion Coordinator

**Files:**

- `Body/S/S2/graph-services/src/sync_coordinator.rs`
- `Body/S/S2/graph-services/src/lib.rs`
- `Body/S/S2/graph-services/tests/graph_promotion_contract.rs`

**Failing Test First:**

```rust
use epi_s2_graph_services::sync_coordinator::PromotionPlan;

#[test]
fn promotion_plan_uses_coordinate_property_and_descriptive_labels() {
    let plan = PromotionPlan::from_intent_fixture("C0/T5", "VaultMarkdown").unwrap();

    assert_eq!(plan.identity_property, "coordinate");
    assert!(plan.labels.contains(&"Coordinate".to_string()));
    assert!(plan.labels.contains(&"VaultArtifact".to_string()));
    assert!(!plan.labels.contains(&"Bimba".to_string()));
    assert!(plan.properties.contains_key("coordinate_depth"));
}
```

**Implementation:**

- Introduce `PromotionPlan` as the validated S2 execution form.
- Convert Hen `GraphPromotionIntent` into `PromotionPlan` using graph-schema.
- Reject unknown properties and unknown relationship types before any Neo4j write.
- Keep compatibility read support but do not add canonical legacy labels.
- Build Cypher with parameters only. No string-interpolated property values or relationship properties.
- For dynamic labels, use schema-filtered label names and a single controlled label application path, such as APOC label application if APOC is already part of the Neo4j deployment. If APOC is not guaranteed, use static-label query branches generated from schema-registered labels only.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graph_promotion_contract
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --tests
```

**Commit:**

```bash
git add Body/S/S2/graph-services/src/sync_coordinator.rs Body/S/S2/graph-services/src/lib.rs Body/S/S2/graph-services/tests/graph_promotion_contract.rs
git commit -m "Add S2 graph promotion coordinator"
```

---

## Task 10: S2 Relationship Manager Hardening

**Files:**

- `Body/S/S2/graph-services/src/relationship_manager.rs`
- `Body/S/S2/graph-services/tests/relationship_manager_contract.rs`

**Failing Test First:**

```rust
use epi_s2_graph_services::relationship_manager::RelationshipWritePlan;

#[test]
fn relationship_write_plan_rejects_positional_legacy_output() {
    let err = RelationshipWritePlan::new("C0", "C1", "POS0_LINKS_TO").unwrap_err();

    assert!(err.to_string().contains("not a canonical relationship type"));
}

#[test]
fn relationship_write_plan_preserves_evidence_properties() {
    let plan = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES")
        .unwrap()
        .with_wikilink_evidence("Idea/Empty/current.md", 12, "[[C0/T4]]");

    assert_eq!(plan.properties["evidence_kind"], "wikilink");
    assert_eq!(plan.properties["source_line"], 12.into());
}
```

**Implementation:**

- Remove canonical creation of `POS*_LINKS_TO`.
- Map legacy positional relationships through migration only.
- Create relationships by registered type and parameterized properties.
- Include provenance and confidence where supplied by Hen inference.
- Add idempotent relationship upsert semantics:

```cypher
MATCH (source {coordinate: $source_coordinate})
MATCH (target {coordinate: $target_coordinate})
MERGE (source)-[r:ELABORATES]->(target)
SET r += $properties
```

The relationship type itself must come from graph-schema, never user input.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test relationship_manager_contract
```

**Commit:**

```bash
git add Body/S/S2/graph-services/src/relationship_manager.rs Body/S/S2/graph-services/tests/relationship_manager_contract.rs
git commit -m "Harden relationship creation around schema registry"
```

---

## Task 11: Compatibility Migration Service

**Files:**

- `Body/S/S2/graph-services/src/compatibility_migration.rs`
- `Body/S/S2/graph-services/src/lib.rs`
- `Body/S/S2/graph-services/tests/compatibility_migration.rs`
- `Body/S/S0/epi-cli/src/graph/mod.rs`

**Failing Test First:**

```rust
use epi_s2_graph_services::compatibility_migration::CompatibilityMigrationPlan;

#[test]
fn migration_plan_converges_legacy_coordinate_properties() {
    let plan = CompatibilityMigrationPlan::for_coordinate("C0/T5");

    assert!(plan.cypher.contains("coalesce(n.coordinate, n.bimbaCoordinate, n.bimba_coordinate)"));
    assert!(plan.cypher.contains("REMOVE n.bimbaCoordinate"));
    assert!(plan.cypher.contains("REMOVE n.bimba_coordinate"));
    assert!(!plan.cypher.contains("SET n.bimbaCoordinate"));
}
```

**Implementation:**

- Add migration service in graph-services.
- Add CLI adapter command for dry-run and execute modes, for example:

```bash
epi graph migrate-coordinate-compat --dry-run
epi graph migrate-coordinate-compat --execute
```

- Migration must:
  - Populate `coordinate` from legacy fields.
  - Remove legacy coordinate properties after verification.
  - Add descriptive labels where schema can derive them.
  - Preserve legacy labels until final cleanup report says they are empty or deprecated.
  - Produce a report of changed nodes and unresolved conflicts.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test compatibility_migration
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml graph
```

**Commit:**

```bash
git add Body/S/S2/graph-services/src/compatibility_migration.rs Body/S/S2/graph-services/src/lib.rs Body/S/S2/graph-services/tests/compatibility_migration.rs Body/S/S0/epi-cli/src/graph/mod.rs
git commit -m "Add coordinate compatibility migration service"
```

---

## Task 12: Graph API CRUD Boundary Cleanup

**Files:**

- `Body/S/S2/graph-services/src/graph_api.rs`
- `Body/S/S2/graph-services/src/schema.rs`
- `Body/S/S2/graph-services/tests/graph_api_contract.rs`

**Failing Test First:**

```rust
use epi_s2_graph_services::graph_api::GraphQueryPlan;

#[test]
fn coordinate_lookup_does_not_require_bimba_label() {
    let plan = GraphQueryPlan::lookup_coordinate("C0/T5");

    assert!(plan.cypher.contains("WHERE n.coordinate = $coordinate"));
    assert!(!plan.cypher.contains("MATCH (n:Bimba"));
}
```

**Implementation:**

- Make coordinate lookup label-agnostic unless a schema-owned descriptor label is explicitly requested.
- Keep compatibility fallback reads.
- Ensure all CRUD methods use graph-schema property and relationship specs.
- Ensure schema/bootstrap creates indexes and constraints for query-grade properties:

```cypher
CREATE CONSTRAINT coordinate_unique IF NOT EXISTS
FOR (n:Coordinate)
REQUIRE n.coordinate IS UNIQUE

CREATE INDEX vault_path_index IF NOT EXISTS
FOR (n:VaultArtifact)
ON (n.vault_path)
```

- Do not let `graph_api.rs` define independent schema constants.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graph_api_contract
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --tests
```

**Commit:**

```bash
git add Body/S/S2/graph-services/src/graph_api.rs Body/S/S2/graph-services/src/schema.rs Body/S/S2/graph-services/tests/graph_api_contract.rs
git commit -m "Clean graph API coordinate CRUD boundaries"
```

---

## Task 13: CLI Remains Adapter Only

**Files:**

- `Body/S/S0/epi-cli/src/graph/mod.rs`
- `Body/S/S0/epi-cli/tests/graph_adapter_contract.rs`

**Failing Test First:**

```rust
#[test]
fn graph_cli_adapter_does_not_define_schema_law() {
    let source = std::fs::read_to_string("src/graph/mod.rs").unwrap();

    assert!(!source.contains("POS0_LINKS_TO"));
    assert!(!source.contains("BimbaCoordinate"));
    assert!(source.contains("epi_s2_graph_services"));
}
```

**Implementation:**

- Remove or relocate graph-law constants from CLI modules.
- CLI commands should:
  - read files
  - call Hen for promotion intent where relevant
  - call S2 graph-services for validation/write/query
  - format output
- CLI should never decide final label, property, or relationship semantics.

**Run:**

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_adapter_contract
```

**Commit:**

```bash
git add Body/S/S0/epi-cli/src/graph/mod.rs Body/S/S0/epi-cli/tests/graph_adapter_contract.rs
git commit -m "Keep graph CLI as S2 adapter"
```

---

## Task 14: Tauri Graph Boundary Replaces Direct Graph Law

**Files:**

- `Body/M/epi-tauri/src-tauri/Cargo.toml`
- `Body/M/epi-tauri/src-tauri/src/graph/client.rs`
- `Body/M/epi-tauri/src-tauri/src/commands/graph.rs`
- `Body/M/epi-tauri/src/services/graphClient.ts`
- `Body/M/epi-tauri/src/services/types.ts`
- `Body/M/epi-tauri/src/stores/graphStore.ts`
- `Body/M/epi-tauri/src-tauri/tests/graph_boundary.rs`

**Failing Test First:**

```rust
#[test]
fn tauri_graph_client_delegates_to_s2_services() {
    let source = std::fs::read_to_string("src/graph/client.rs").unwrap();

    assert!(source.contains("epi_s2_graph_services"));
    assert!(!source.contains("MATCH (n:Bimba"));
    assert!(!source.contains("bimba_coordinate"));
}
```

**Implementation:**

- Add path dependencies from Tauri to S2 services/schema and Hen core as needed:

```toml
epi-s2-graph-schema = { path = "../../../S/S2/graph-schema" }
epi-s2-graph-services = { path = "../../../S/S2/graph-services" }
hen-compiler-core = { path = "../../../S/S1/hen-compiler-core" }
```

- Refactor Tauri graph commands to call S2-backed operations:
  - `graph_get_by_coordinate`
  - `graph_promote_vault_artifact`
  - `graph_infer_relations`
  - `graph_migrate_coordinate_compat`
  - `graph_sync_status`
- Preserve existing command names where UI compatibility requires it, but route implementation through S2 services.
- TypeScript client/store should reflect:
  - descriptive labels
  - canonical `coordinate`
  - relationship evidence/provenance
  - promotion status

**Run:**

```bash
cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml --test graph_boundary
pnpm --dir Body/M/epi-tauri vitest run
```

**Commit:**

```bash
git add Body/M/epi-tauri/src-tauri/Cargo.toml Body/M/epi-tauri/src-tauri/src/graph/client.rs Body/M/epi-tauri/src-tauri/src/commands/graph.rs Body/M/epi-tauri/src/services/graphClient.ts Body/M/epi-tauri/src/services/types.ts Body/M/epi-tauri/src/stores/graphStore.ts Body/M/epi-tauri/src-tauri/tests/graph_boundary.rs
git commit -m "Route Tauri graph boundary through S2 services"
```

---

## Task 15: End-to-End Hen -> S2 Promotion Test

**Files:**

- `Body/S/S2/graph-services/tests/hen_promotion_integration.rs`
- `Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion/current.md`
- `Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion/prior.md`
- `Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion/context.md`

**Failing Test First:**

```rust
#[tokio::test]
#[ignore = "requires live Neo4j and configured PI relation inference"]
async fn promotes_vault_markdown_into_coordinate_graph_state() {
    let fixture_root = "Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion";

    let promotion = hen_compiler_core::graph_promotion::GraphPromotionIntent::from_vault_file(
        format!("{fixture_root}/current.md"),
    )
    .await
    .unwrap();

    let service = epi_s2_graph_services::test_support::live_neo4j_service().await.unwrap();
    service.promote(promotion).await.unwrap();

    let node = service.get_by_coordinate("C0/T5").await.unwrap().unwrap();
    assert_eq!(node.properties["coordinate"], "C0/T5");
    assert!(node.labels.contains(&"Coordinate".to_string()));
    assert!(node.labels.contains(&"VaultArtifact".to_string()));
    assert!(!node.labels.contains(&"Bimba".to_string()));

    let rels = service.relationships_from("C0/T5").await.unwrap();
    assert!(rels.iter().any(|rel| rel.rel_type == "ELABORATES" || rel.rel_type == "REFERENCES"));
    assert!(rels.iter().all(|rel| rel.properties.contains_key("evidence_kind")));
}
```

**Implementation:**

- Use real markdown fixtures with frontmatter and body wikilinks.
- Run against live Neo4j.
- Run LLM inference when env is configured; otherwise require deterministic `REFERENCES` relation from wikilink evidence and mark LLM-specific assertions as skipped with a clear message.
- Validate actual persisted labels, properties, and relationships.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test hen_promotion_integration -- --ignored
```

**Commit:**

```bash
git add Body/S/S2/graph-services/tests/hen_promotion_integration.rs Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion/current.md Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion/prior.md Body/S/S1/hen-compiler-core/tests/fixtures/coordinate_promotion/context.md
git commit -m "Add end-to-end Hen coordinate graph promotion test"
```

---

## Task 16: Documentation and Spec Alignment

**Files:**

- `repo-ontology.md`
- `Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md`
- `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`
- `Idea/Bimba/Seeds/S/S1/S1'/Legacy/plans/2026-03-07-s1-s2-implementation-plan.md`
- `docs/dev/architecture/depwire/CURRENT.md`
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-electron-verification-notes.md`

**Steps:**

- Update S1 spec to state:
  - Hen parses frontmatter, body, headings, wikilinks, and content hashes.
  - Relation evidence is wikilink-first.
  - LLM inference classifies relationship intent against schema-owned allowed types.
- Update S2 spec to state:
  - `coordinate` is identity.
  - labels are descriptive.
  - graph-schema owns property and relationship registries.
  - legacy Bimba forms are compatibility only.
- Mark old Electron notes as deprecated context and point to `Body/M/epi-tauri` as the live app boundary.
- Update depwire architecture notes after implementation changes.

**Run:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --tests
```

**Commit:**

```bash
git add repo-ontology.md Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md Idea/Bimba/Seeds/S/S1/S1'/Legacy/plans/2026-03-07-s1-s2-implementation-plan.md docs/dev/architecture/depwire/CURRENT.md Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-electron-verification-notes.md
git commit -m "Document Hen to coordinate graph promotion protocol"
```

---

## Task 17: Security and Production Hardening Sweep

**Files:**

- `Body/S/S2/graph-services/src/sync_coordinator.rs`
- `Body/S/S2/graph-services/src/relationship_manager.rs`
- `Body/S/S2/graph-services/src/dataset_import.rs`
- `Body/S/S2/graph-services/src/bidirectional_sync.rs`
- `Body/S/S2/graph-services/src/link_enforcement.rs`
- `Body/M/epi-tauri/src-tauri/src/graph/client.rs`

**Steps:**

- Replace value interpolation in Cypher with parameters.
- Ensure any dynamic labels or relationship types come only from graph-schema registries.
- Add tests for malicious coordinate/title/evidence strings.
- Add tests that relationship creation rejects unknown types before query construction.
- Add tests that app/CLI adapters cannot bypass S2 validation.

**Run:**

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --tests
cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml
```

**Commit:**

```bash
git add Body/S/S2/graph-services/src/sync_coordinator.rs Body/S/S2/graph-services/src/relationship_manager.rs Body/S/S2/graph-services/src/dataset_import.rs Body/S/S2/graph-services/src/bidirectional_sync.rs Body/S/S2/graph-services/src/link_enforcement.rs Body/M/epi-tauri/src-tauri/src/graph/client.rs
git commit -m "Harden graph writes and adapter boundaries"
```

---

## Task 18: Final Verification

**Commands:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --tests
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml graph
cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml
pnpm --dir Body/M/epi-tauri vitest run
./depwire/dist/index.js parse .
./depwire/dist/index.js health .
/opt/homebrew/bin/node /Users/admin/.npm-global/bin/gitnexus analyze
```

**Live Verification When Services Are Available:**

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test relation_inference_live -- --ignored
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test hen_promotion_integration -- --ignored
EPILOGOS_ROOT="/Users/admin/Documents/Epi-Logos C Experiments" cargo run --manifest-path Body/S/S0/epi-cli/Cargo.toml -- --json graph doctor
```

**Pre-Commit/Review Checks:**

- Run GitNexus detect changes before final commit.
- Review depwire changed dependency graph.
- Confirm no new `:Bimba` canonical writes.
- Confirm no new `bimbaCoordinate` or `bimba_coordinate` writes except compatibility migration.
- Confirm every new relationship type exists in graph-schema.
- Confirm tests exercise real parser/schema/service behavior.

**Final Commit:**

```bash
git add -A
git commit -m "Implement Hen coordinate graph promotion"
```

---

## Expected End State

- Hen can parse real markdown artifacts beyond frontmatter.
- Wikilinks produce first-class relation evidence.
- LLM inference classifies relationships against an explicit S2 relationship registry.
- S2 persists nodes with descriptive labels and canonical `coordinate` properties.
- Property coverage supports technical/procedural querying across full coordinate-prefix families.
- S0 CLI and M/Tauri are adapters, not competing graph-law authorities.
- Legacy Bimba forms are readable and migratable, but no longer canonical write targets.
- Tests prove real parsing, validation, persistence boundaries, and live graph promotion where services are configured.
