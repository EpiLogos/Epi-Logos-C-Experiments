# S0 PI Boundary and S1 S2 Graph Promotion Task Ledger

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the correct PI/S4/S5 runtime boundary, then complete the production S1/S1-prime to S2/S2-prime graph promotion path for coordinate-owned Neo4j state.

**Architecture:** S0 Rust is an adapter and launcher for PI, not an agent intelligence layer or model availability authority. Hen/S1 owns vault parsing and graph-promotion intent, PI/S4 owns live relation inference, and S2 graph-schema plus graph-services own labels, properties, typed relations, compatibility migration, and Neo4j CRUD. The implementation must first remove accidental S0 model gating, then resume the original graph work from evidence parsing through S2 transactional upsert.

**Tech Stack:** Rust, epi CLI, PI managed agent runtime, S4 ta-onta extensions, S5 agent/review cores, Hen compiler core, S2 graph-schema, S2 graph-services, Neo4j, Tauri app boundary, real vault fixtures, real PI runtime discovery, and gated live provider tests.

---

## Current State

The session fixed several real runtime problems, but also exposed an architectural risk:

- `Body/S/S0/epi-cli/src/agent/models.rs` currently contains hardcoded provider/model knowledge for `kimi`, `minimax`, `glm`, and `google`.
- That hardcoded registry means Rust can incorrectly become the model availability gate.
- PI already knows available models through its own runtime, as shown by `pi --list-models google`.
- The managed `anima` runtime has been locally switched to `google/gemini-3.1-pro-preview`, but that runtime config is ignored under `.epi/` and should not be treated as source.
- The earlier graph work has useful Hen/S2 pieces, but the full S1 to S2 Neo4j promotion path is not complete.

This ledger supersedes the ad hoc runtime detour and gives the next execution pass an ordered task list.

---

## Non-Negotiable Boundaries

- S0 Rust may create directories, write PI config files, validate file shape, launch PI, and expose adapter commands.
- S0 Rust must not decide model availability for PI.
- S0 Rust must not become an LLM provider client for Hen relation inference.
- PI owns runtime model discovery and provider invocation.
- S4 owns agent embodiment, extension lifecycle, hook/plugin behavior, and constitutional runtime behavior.
- S5 owns higher-order agent/review/autoresearch intelligence.
- Hen/S1 owns parsing, evidence extraction, and graph-promotion intent construction.
- S2 graph-schema owns canonical graph law: labels, properties, relation types, compatibility names, constraints, and indexes.
- S2 graph-services owns transactional Neo4j CRUD and sync behavior.
- Tauri/S-prime app surfaces are adapters to S2-backed operations, not graph-law authorities.
- `coordinate` is canonical identity property. Legacy coordinate fields are compatibility inputs only.
- Neo4j node labels must be descriptive schema-derived labels. Do not make `:Bimba { coordinate }` canonical.
- Wikilinks are primary relation evidence. Frontmatter is one evidence channel, not the relation ontology.

---

## Phase 1: Correct The S0 PI Boundary

### Task 1: Freeze Current Failure As Boundary Tests

**Files:**

- Modify: `Body/S/S0/epi-cli/tests/agent_models.rs`
- Modify: `Body/S/S0/epi-cli/tests/gate_method_parity.rs`
- Optional create: `Body/S/S0/epi-cli/tests/pi_model_boundary.rs`

**Step 1: Write failing test that unknown PI model defaults are allowed**

Add a test proving `set-default` is a PI settings operation, not Rust model validation:

```rust
#[test]
fn set_default_accepts_pi_owned_model_without_rust_provider_registry() {
    let env = TestEnv::repo_with_assets();

    let out = run_epi(
        [
            "agent",
            "models",
            "set-default",
            "google/gemini-model-owned-by-pi",
        ]
        .as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);

    let settings_json = read_to_string(env.repo_root.join(".epi/agents/epii/agent/settings.json"));
    let parsed: serde_json::Value =
        serde_json::from_str(&settings_json).expect("settings.json is valid JSON");
    assert_eq!(parsed["defaultProvider"], "google");
    assert_eq!(parsed["defaultModel"], "gemini-model-owned-by-pi");
}
```

**Step 2: Write failing test that builtin provider registry is not required**

Add a test that `models status` reports the selected default even with no `models.json` provider entry:

```rust
#[test]
fn models_status_reports_settings_default_without_provider_registry() {
    let env = TestEnv::repo_with_assets();

    let set_default = run_epi(
        ["agent", "models", "set-default", "google/gemini-3.1-pro-preview"].as_slice(),
        &env,
    );
    assert!(set_default.status.success(), "stderr: {}", set_default.stderr);

    let out = run_epi(["agent", "models", "status", "--json"].as_slice(), &env);

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out.stdout.contains("\"defaultModel\": \"google/gemini-3.1-pro-preview\""));
}
```

**Step 3: Run tests and confirm failure**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_models
```

Expected: fails because `set_default` currently rejects providers/models not in Rust `models.json`.

**Acceptance:**

- Tests clearly show S0 is improperly gating PI model availability.
- Failure message points at Rust-side provider/model validation, not PI.

---

### Task 2: Demote `epi agent models` To PI Settings Adapter

**Files:**

- Modify: `Body/S/S0/epi-cli/src/agent/models.rs`
- Modify: `Body/S/S0/epi-cli/src/agent/agent_dirs.rs`
- Modify: `Body/S/S0/epi-cli/src/gate/models.rs`
- Modify: `Body/S/S0/epi-cli/tests/agent_models.rs`
- Modify: `Body/S/S0/epi-cli/tests/gate_method_parity.rs`

**Required behavior:**

- `epi agent models set-default provider/model` writes `settings.json` only.
- `set-default` validates only that the value has non-empty `provider/model` syntax.
- `set-default` does not require the provider or model to exist in Rust `models.json`.
- `models.json` remains PI-native custom provider config, not S0's canonical model catalog.
- `models status` reports:
  - `defaultModel` from `settings.json`
  - configured custom providers from `models.json` if present
  - a clear `availabilityAuthority: "pi"` or equivalent status field if adding a field is acceptable
- `gate/models.rs` must not infer total model availability from S0's provider config.

**Step 1: Remove model existence validation**

In `set_default`, delete this gating shape:

```rust
let provider_config = config
    .providers
    .get(provider)
    .ok_or_else(|| format!("provider `{provider}` is not configured"))?;
if !provider_config.models.iter().any(|entry| entry.id == model) {
    return Err(format!(
        "model `{model}` is not configured for provider `{provider}`"
    ));
}
```

Keep:

```rust
let (provider, model) = parse_provider_model(provider_model)?;
save_default_settings(&layout, provider, model)?;
```

**Step 2: Rename hardcoded provider operation**

Choose one of these two paths:

- Preferred: remove or deprecate `add-provider <builtin>` as a common-provider registry.
- Acceptable compatibility: keep `add-provider` only as `add-provider --custom-json <path>` in a later task, and make builtin helpers clearly migration-only.

Do not leave a function named `supported_provider` as if S0 is the source of model truth.

**Step 3: Keep auth as a dumb PI file writer**

Do not validate provider names in `auth set`. It should write:

```json
{
  "google": {
    "type": "api_key",
    "key": "..."
  }
}
```

and compatibility profile:

```json
{
  "profiles": {
    "google:default": {
      "provider": "google"
    }
  }
}
```

No API key duplication in `auth-profiles.json`.

**Step 4: Run focused tests**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_models --test agent_auth
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_method_parity models_config_and_skills_surfaces_reflect_real_gateway_state
```

Expected: all pass.

**Acceptance:**

- Rust no longer blocks unknown PI provider/model selections.
- Tests prove the default model is settings state, not Rust catalog state.
- Auth remains provider-name agnostic.
- Gateway surfaces do not imply S0 is the model availability authority.

---

### Task 3: Add PI Runtime Discovery Adapter Test

**Files:**

- Create: `Body/S/S0/epi-cli/tests/pi_model_runtime_discovery.rs`
- Modify if needed: `Body/S/S0/epi-cli/src/agent/run.rs` or adjacent PI launch module

**Goal:**

Prove model discovery happens by invoking PI, not by inspecting a Rust catalog.

**Step 1: Use the existing fake PI fixture**

Use `TestEnv::with_fake_pi()` if available. The fake `pi` should print a deterministic model list when called with `--list-models`.

Expected fake output:

```text
provider  model
google    gemini-owned-by-pi
```

**Step 2: Add a test for the adapter command**

If a command exists for passthrough:

```rust
#[test]
fn model_runtime_discovery_delegates_to_pi() {
    let env = TestEnv::with_fake_pi();

    let out = run_epi(
        ["agent", "run", "--", "--list-models", "google"].as_slice(),
        &env,
    );

    assert!(out.status.success(), "stderr: {}", out.stderr);
    assert!(out.stdout.contains("gemini-owned-by-pi"));
}
```

If no clean command exists, add one narrowly:

```bash
epi agent models list --agent anima google
```

That command must execute PI with the managed environment and return PI's output.

**Step 3: Run the test**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pi_model_runtime_discovery
```

Expected: pass with fake PI and no network.

**Acceptance:**

- Model listing is delegated to PI.
- Test does not call external providers.
- Test does not depend on the real user's `~/.pi` or `.zshenv`.

---

### Task 4: Document The S0/PI/S4/S5 Boundary In Source

**Files:**

- Modify: `Body/S/S0/epi-cli/src/agent/mod.rs`
- Modify: `Body/S/S0/epi-cli/src/agent/models.rs`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-hen-coordinate-graph-promotion.md`
- Optional create: `docs/dev/architecture/pi-runtime-boundary.md`

**Step 1: Add module-level Rust comments**

Add a concise module comment:

```rust
//! PI runtime adapter commands.
//!
//! This module prepares managed PI agent directories and writes PI-compatible
//! settings/auth files. It must not become the model availability authority,
//! relation-inference engine, or S4/S5 agent behavior layer.
```

**Step 2: Add architecture note**

Document:

- S0 prepares and launches.
- PI discovers models and invokes providers.
- S4 supplies embodied extensions, hooks, plugins, and agent surfaces.
- S5 supplies higher-order agent intelligence.
- S1/Hen calls PI only through the PI runtime relation inference boundary.

**Step 3: Run doc-adjacent checks**

Run:

```bash
cargo fmt --manifest-path Body/S/S0/epi-cli/Cargo.toml
git diff --check -- Body/S/S0/epi-cli/src/agent/mod.rs Body/S/S0/epi-cli/src/agent/models.rs docs/dev/architecture/pi-runtime-boundary.md
```

**Acceptance:**

- Future maintainers can see that S0 is an adapter.
- No new model/provider law is documented as S0-owned.

---

## Phase 2: Rebaseline The Existing Runtime Fixes

### Task 5: Keep Supported PI Hook Runtime Contract

**Files:**

- Modify: `Body/S/S4/plugins/pleroma/hooks/hooks.json`
- Modify: `Body/S/S0/epi-cli/tests/pleroma_bundle.rs`

**Current desired state:**

- No unsupported hook events such as `PreToolCall`, `PostToolCall`, or `TransformToolResult`.
- Use supported PI hook events such as `UserPromptSubmit`, `PostToolUse`, `SessionStart`, and `Stop`.
- Hook type should be supported by PI, for example command hooks.

**Step 1: Ensure test asserts no unsupported events**

Test must parse `hooks.json` and reject:

```rust
["PreToolCall", "PostToolCall", "TransformToolResult"]
```

**Step 2: Run plugin validation**

Run:

```bash
epi agent plugin validate Body/S/S4/plugins/pleroma --json
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pleroma_bundle
```

Expected:

- Plugin validation returns `"valid": true`.
- Test suite passes.

**Acceptance:**

- Pleroma hooks are compatible with the PI runtime.
- No fake validation or placeholder hook support.

---

### Task 6: Keep Extension Runtime Action Deferral

**Files:**

- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`
- Modify: `Body/S/S0/epi-cli/tests/agent_extensions_ta_onta.rs`

**Current desired state:**

- `api.setActiveTools(...)` must not run during extension module load.
- Runtime action methods must run inside a runtime event such as `session_start`.

**Step 1: Ensure test protects this shape**

The test must assert:

```typescript
const animaDefaultTools = [...]
api.on("session_start", async () => {
  api.setActiveTools(animaDefaultTools);
})
```

and must reject direct top-level:

```typescript
api.setActiveTools([...])
```

**Step 2: Run extension tests**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_extensions_ta_onta
```

Expected: pass.

**Acceptance:**

- Extension loading does not call action methods before PI runtime binding.
- This fixes the extension runtime initialization error without weakening PI.

---

## Phase 3: Resume Hen Evidence And Relation Intent Work

### Task 7: Complete Hen Wikilink Evidence Coverage

**Files:**

- Modify: `Body/S/S1/hen-compiler-core/src/wikilinks.rs`
- Modify: `Body/S/S1/hen-compiler-core/tests/wikilink_parser.rs`
- Modify if needed: `Body/S/S1/hen-compiler-core/src/artifact_evidence.rs`

**Required evidence coverage:**

- `[[target]]`
- `[[target|alias]]`
- `[[target#heading]]`
- `[[#heading]]`
- escaped or code-fenced wikilinks ignored
- line number
- column number
- local context snippet
- raw target text

**Step 1: Add failing tests for edge cases**

Add tests for:

- wikilinks inside fenced code ignored
- multiple wikilinks on one line have correct columns
- `target#heading` splits path and heading
- alias preserved but target identity not replaced by alias

**Step 2: Implement missing parser behavior**

Keep parsing deterministic. Do not use LLM for parsing.

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test wikilink_parser
```

**Acceptance:**

- Wikilinks are primary relation evidence.
- Parser gives enough location/context for S2 relation provenance.

---

### Task 8: Harden Hen Artifact Evidence

**Files:**

- Modify: `Body/S/S1/hen-compiler-core/src/artifact_evidence.rs`
- Modify: `Body/S/S1/hen-compiler-core/tests/artifact_evidence.rs`

**Required evidence fields:**

- source path
- artifact kind
- coordinate
- title
- frontmatter source coordinates
- unknown frontmatter map
- headings
- body wikilinks
- content hash
- markdown body hash

**Step 1: Add failing tests for real vault-like fixtures**

Use real markdown content patterns from `Idea/` style notes, but create test-local fixtures rather than mutating vault files.

Test cases:

- coordinate in `coordinate`
- legacy coordinate in `bimbaCoordinate` or `bimba_coordinate`
- frontmatter source coordinate list
- body wikilinks
- unknown frontmatter retained

**Step 2: Implement evidence normalization**

Rules:

- `coordinate` is canonical when present.
- legacy coordinate keys are compatibility evidence only.
- unknown frontmatter remains evidence, not schema law.

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test artifact_evidence
```

**Acceptance:**

- Hen can construct a complete artifact evidence object from real markdown.
- Frontmatter does not replace wikilink/body evidence.

---

### Task 9: Clarify Hen To PI Relation Inference Boundary

**Files:**

- Modify: `Body/S/S1/hen-compiler-core/src/relation_inference.rs`
- Modify: `Body/S/S1/hen-compiler-core/tests/relation_inference_contract.rs`
- Modify: `Body/S/S1/hen-compiler-core/tests/relation_inference_live.rs`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-hen-coordinate-graph-promotion.md`

**Required boundary:**

- Hen builds relation inference request.
- Hen validates candidate JSON.
- Hen does not select model provider.
- Hen does not own provider credentials.
- Hen invokes PI as the relation inference runtime.
- PI/S4 owns model/provider selection.

**Step 1: Add failing contract test**

Test that `RelationInferenceRequest` contains no provider/model fields:

```rust
#[test]
fn relation_request_does_not_expose_provider_or_model_selection() {
    let request = build_test_relation_request();
    let value = serde_json::to_value(&request).unwrap();

    assert!(value.get("provider").is_none());
    assert!(value.get("model").is_none());
    assert!(value.get("api_key").is_none());
}
```

**Step 2: Add candidate validation tests**

Reject:

- unregistered relation types
- missing evidence text
- confidence outside `0.0..=1.0`
- missing target coordinate unless resolver explicitly marks unresolved target

**Step 3: Keep live test gated**

Live test may run only when explicitly requested with env such as:

```bash
EPI_HEN_RELATION_LIVE=1 cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test relation_inference_live -- --ignored
```

It must call PI, not a direct provider SDK.

**Acceptance:**

- Hen is not a model provider abstraction.
- Relation inference remains PI/S4-owned.
- Deterministic tests do not pretend to test LLM quality.

---

### Task 10: Promote Hen Graph Intent From Shallow Sync To S2-Ready Intent

**Files:**

- Modify: `Body/S/S1/hen-compiler-core/src/graph_promotion.rs`
- Modify: `Body/S/S1/hen-compiler-core/tests/graph_promotion_intent.rs`
- Modify if needed: `Body/S/S1/hen-compiler-core/tests/graph_sync_intent.rs`

**Required `GraphPromotionIntent` contents:**

- canonical node coordinate
- identity property name, always `coordinate`
- vault path
- requested descriptive label hints
- query-grade properties
- wikilink evidence
- frontmatter evidence
- relation candidates
- content hash
- markdown body hash
- compatibility source label/property/coordinate
- promotion source
- sync version

**Step 1: Add failing tests**

Tests must prove:

- canonical `coordinate` property is used
- legacy coordinate field becomes compatibility evidence only
- labels are hints, not final Neo4j law
- relation evidence count comes from wikilinks
- promotion intent can carry LLM relation candidates

**Step 2: Implement missing intent fields**

Do not write Neo4j from Hen.

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test graph_promotion_intent
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test graph_sync_intent
```

**Acceptance:**

- S1 output is rich enough for S2 validation/upsert.
- Existing compatibility callers are preserved or intentionally migrated.

---

## Phase 4: Centralize S2 Graph Law

### Task 11: Complete S2 Label Registry

**Files:**

- Modify: `Body/S/S2/graph-schema/src/lib.rs`
- Create or modify: `Body/S/S2/graph-schema/tests/label_registry.rs`

**Required behavior:**

- Coordinate-bearing nodes use property `coordinate`.
- Labels are descriptive and schema-derived.
- Legacy `Bimba` labels are compatibility-only.
- Callers request labels through graph-schema functions.

**Step 1: Add failing tests**

Tests:

- `labels_for_coordinate_node("C0/T5", "vault_markdown")` contains `Coordinate` and `VaultArtifact`
- labels do not contain `Bimba`
- compatibility labels are listed separately

**Step 2: Implement registry**

Add:

```rust
pub const COORDINATE_PROPERTY: &str = "coordinate";
pub fn labels_for_coordinate_node(...) -> Result<Vec<String>, GraphSchemaError>;
pub fn compatibility_labels() -> Vec<String>;
```

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml label_registry
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
```

**Acceptance:**

- S2 is the only label authority.
- New code does not create canonical `:Bimba` nodes.

---

### Task 12: Complete S2 Property Registry With Coordinate Prefix Coverage

**Files:**

- Modify: `Body/S/S2/graph-schema/src/lib.rs`
- Create or modify: `Body/S/S2/graph-schema/tests/property_registry.rs`
- Create or modify: `Body/S/S2/graph-schema/tests/coordinate_prefix_properties.rs`

**Required canonical properties:**

- `coordinate`
- `coordinate_prefix`
- `coordinate_depth`
- `coordinate_parent`
- `coordinate_axis`
- `vault_path`
- `artifact_kind`
- `content_hash`
- `title`
- `summary`
- `source_mtime`
- `sync_status`
- `sync_version`
- `last_promoted_at`
- `promotion_source`
- `relation_evidence_count`

**Required prefix families:**

- `c_*`
- `p_*`
- `l_*`
- `s_*`
- `t_*`
- `m_*`
- `q_*`

**Step 1: Add failing tests**

Tests must prove:

- every canonical property has type/cardinality metadata
- every prefix family is registered
- unknown technical property keys are rejected unless explicitly allowed as artifact metadata
- caller-side string concatenation is not needed for known prefix properties

**Step 2: Implement property registry**

Add property specs with:

- key
- value type
- required/optional
- indexed/queryable
- compatibility aliases

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml property_registry coordinate_prefix_properties
```

**Acceptance:**

- Properties are useful for querying, not minimum viable placeholders.
- Full coordinate prefix coverage exists.

---

### Task 13: Complete S2 Relationship Registry

**Files:**

- Modify: `Body/S/S2/graph-schema/src/lib.rs`
- Create or modify: `Body/S/S2/graph-schema/tests/relationship_registry.rs`
- Modify: `Body/S/S2/graph-services/src/relationship_manager.rs`
- Modify: `Body/S/S2/graph-services/tests/neo4j_contract.rs`

**Required relationship types:**

- `REFERENCES`
- `SOURCES`
- `CONTAINS`
- `PART_OF`
- `ELABORATES`
- `CONTRASTS`
- `IMPLEMENTS`
- `OPERATES_IN`
- `REFLECTS_AS`
- `INVERTS_TO`
- `SUPPORTS`
- `CRITIQUES`
- `DERIVES_FROM`
- `PROMOTES_TO`
- `SYNCED_FROM`

**Required relationship properties:**

- `evidence_kind`
- `evidence_text`
- `source_path`
- `source_line`
- `target_text`
- `confidence`
- `inferred_by`
- `prompt_hash`
- `created_by_sync_version`
- `last_verified_at`

**Step 1: Add failing schema tests**

Tests must reject:

- lowercase/ad hoc relationship labels
- unregistered relationship types
- missing required evidence properties

**Step 2: Add failing graph-service tests**

`RelationshipManager` must reject an unregistered relationship type before generating Cypher.

**Step 3: Implement registry validation**

All relationship creation paths must call graph-schema validation.

**Step 4: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml relationship_registry
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml relationship_manager
```

**Acceptance:**

- No ad hoc relation labels.
- Relation provenance is query-grade.

---

## Phase 5: Wire S1 Intent Into S2 Transactional Upsert

### Task 14: Add S2 Promotion Intent DTO And Validator

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Modify: `Body/S/S2/graph-services/src/lib.rs`
- Create or modify: `Body/S/S2/graph-services/tests/graph_promotion_contract.rs`

**Goal:**

S2 accepts S1 promotion intent data and validates it against graph-schema before writing.

**Step 1: Add failing test**

Test:

- valid intent passes
- missing `coordinate` fails
- legacy coordinate-only input fails unless migration path is explicitly invoked
- unregistered relation candidate fails

**Step 2: Implement validator**

Validator checks:

- identity property is `coordinate`
- coordinate string is valid
- labels are schema-derived from hints
- properties are schema-known or allowed artifact metadata
- relations are registered
- relation properties satisfy schema

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graph_promotion_contract
```

**Acceptance:**

- S2, not Hen, decides final graph materialization.
- Invalid intents are rejected before Cypher.

---

### Task 15: Implement Transactional Neo4j Promotion Upsert

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Modify: `Body/S/S2/graph-services/src/relationship_manager.rs`
- Modify: `Body/S/S2/graph-services/src/graph_api.rs`
- Create or modify: `Body/S/S2/graph-services/tests/neo4j_contract.rs`

**Required behavior:**

- Upsert node by `coordinate`.
- Apply schema-derived descriptive labels.
- Set canonical properties.
- Remove or converge legacy coordinate properties during compatibility migration.
- Upsert typed relationships with evidence properties.
- Preserve transaction atomicity.

**Step 1: Add gated live Neo4j test**

The test must require real Neo4j env, for example:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=...
EPI_GRAPH_LIVE=1
```

Test asserts:

- node can be matched by `coordinate`
- node has descriptive labels
- node does not require `Bimba` label
- relation type is registered
- relation evidence properties exist

**Step 2: Implement transaction**

Use graph-services, not CLI Cypher strings.

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test graph_promotion_contract
EPI_GRAPH_LIVE=1 cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test neo4j_contract -- --ignored
```

**Acceptance:**

- Real Neo4j upsert works.
- CRUD remains isolated in S2 graph-services.

---

### Task 16: Hen Triggered Sync Path

**Files:**

- Modify: `Body/S/S1/hen-compiler-core/src/lib.rs`
- Modify: `Body/S/S1/hen-compiler-core/src/graph_promotion.rs`
- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Create or modify: integration test under `Body/S/S2/graph-services/tests/`

**Lifecycle:**

1. Vault artifact changes.
2. Hen parses artifact evidence.
3. Hen parses wikilink evidence.
4. Hen builds relation inference request.
5. PI/S4 classifies relationship candidates when needed.
6. Hen emits `GraphPromotionIntent`.
7. S2 validates intent.
8. S2 transactionally upserts node and relationships.
9. S2 returns sync report with created/updated/skipped/errors.

**Step 1: Add deterministic no-LLM integration test**

Use a prebuilt candidate to test S1 to S2 handoff without pretending to test inference.

**Step 2: Add gated live PI plus Neo4j test**

Only run when both env gates are present:

```bash
EPI_HEN_RELATION_LIVE=1
EPI_GRAPH_LIVE=1
```

**Step 3: Implement sync report**

Report includes:

- source path
- coordinate
- node action
- relation actions
- compatibility migrations
- validation errors
- sync version

**Acceptance:**

- Hen-triggered sync matches eventual live system shape.
- No mocks for functionality. Gated tests either use real PI/Neo4j or skip honestly.

---

## Phase 6: Adapter Surfaces Only

### Task 17: Keep S0 Graph CLI As Adapter

**Files:**

- Modify: `Body/S/S0/epi-cli/src/graph/mod.rs`
- Create or modify: `Body/S/S0/epi-cli/tests/graph_adapter_contract.rs`

**Required behavior:**

- CLI calls graph-services APIs.
- CLI does not define labels, relation types, or property names except for user-facing arguments.
- CLI does not build raw ad hoc Cypher for canonical graph writes.

**Step 1: Add failing test or static assertion**

Search-based test rejects new occurrences of canonical graph law in CLI:

- `:Bimba`
- `BimbaCoordinate`
- raw relationship type strings outside adapter parsing
- direct `MERGE` for promotion writes

**Step 2: Move law to S2 if found**

Any graph-law string in S0 must be replaced with graph-schema or graph-services call.

**Step 3: Run tests**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_adapter_contract
```

**Acceptance:**

- S0 remains graph adapter only.

---

### Task 18: Replace Old Electron Assumptions With Tauri Surface Map

**Files:**

- Inspect: `Body/S/S3/epi-app/src-tauri/`
- Inspect: `Body/S/S3/epi-app/shared/types.ts`
- Inspect: `Body/S/S3/epi-app/main/main.ts` only as legacy if present
- Modify or create: `docs/dev/architecture/tauri-graph-boundary.md`

**Step 1: Inventory actual Tauri commands**

Map:

- graph CRUD commands
- vault sync commands
- Hen sync calls
- gateway calls

**Step 2: Identify stale Electron docs/code**

Mark as:

- legacy
- unused
- migration pending

Do not treat Electron IPC as live authority unless proven by current build.

**Step 3: Write boundary doc**

Tauri commands should call S2-backed APIs through S0/S3 bridge, not define graph law.

**Acceptance:**

- Runtime surface map reflects Tauri, not old Electron assumptions.
- Future tasks know where S-prime app integration actually lives.

---

### Task 19: S4/Aletheia Integration Boundary

**Files:**

- Inspect: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/hen-integration.ts`
- Modify if needed: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/hen-integration.ts`
- Create or modify tests if available under S4 integration test structure

**Required behavior:**

- S4 can request Hen evidence or promotion operations.
- S4 does not write Neo4j directly for canonical promotion.
- S4 does not own relationship labels.
- S4 relation intelligence routes through PI/S4 agent runtime and S2 validation.

**Step 1: Add boundary test or static assertion**

Reject hardcoded ad hoc relation labels in S4 Hen integration.

**Step 2: Route graph operations through S2-backed adapter**

If S4 currently writes directly, replace with S2/S0 command boundary.

**Acceptance:**

- Aletheia consumes the graph protocol; it does not become graph schema authority.

---

## Phase 7: Migration And Verification

### Task 20: Legacy Coordinate Compatibility Migration

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Modify: `Body/S/S2/graph-services/src/schema.rs`
- Create or modify: `Body/S/S2/graph-services/tests/neo4j_contract.rs`

**Required migration logic:**

Read compatibility:

```cypher
WHERE n.coordinate = $coordinate
   OR n.bimbaCoordinate = $coordinate
   OR n.bimba_coordinate = $coordinate
```

Converge writes:

```cypher
SET n.coordinate = coalesce(n.coordinate, n.bimbaCoordinate, n.bimba_coordinate)
REMOVE n.bimbaCoordinate
REMOVE n.bimba_coordinate
```

**Step 1: Add live Neo4j test**

Create a legacy node with only `bimbaCoordinate`, run migration, assert:

- `coordinate` exists
- `bimbaCoordinate` removed
- descriptive labels added
- legacy labels not newly required

**Step 2: Implement migration service**

Expose as S2 operation and S0 adapter command.

**Acceptance:**

- Compatibility is real and convergent, not just read fallback.

---

### Task 21: End-To-End Real Promotion Test

**Files:**

- Create or modify: `Body/S/S2/graph-services/tests/hen_promotion_e2e.rs`
- Use existing Hen fixtures or create test-local markdown fixtures

**Required path:**

Markdown fixture -> Hen evidence -> relation inference candidate -> GraphPromotionIntent -> S2 validation -> Neo4j upsert -> query by coordinate.

**Step 1: Deterministic test without live LLM**

Use a manually supplied candidate. This tests the promotion path, not inference quality.

**Step 2: Gated live test with PI relation inference**

Use:

```bash
EPI_HEN_RELATION_LIVE=1
EPI_GRAPH_LIVE=1
```

Must call PI and live Neo4j.

**Step 3: Assertions**

Assert:

- node matched by `coordinate`
- descriptive labels exist
- canonical properties exist
- wikilink-derived relation exists
- relation properties include source path and source line
- no ad hoc relation type was created

**Acceptance:**

- This proves the original mission: S1/S1-prime material becomes proper coordinate-driven S2/S2-prime graph state.

---

## Phase 8: Final Hygiene

### Task 22: Full Verification Matrix

**Commands:**

Run focused:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_models --test agent_auth
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_extensions_ta_onta
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pleroma_bundle
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test wikilink_parser
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test artifact_evidence
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test relation_inference_contract
cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test graph_promotion_intent
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml
```

Run gated only with explicit approval/env:

```bash
EPI_HEN_RELATION_LIVE=1 cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test relation_inference_live -- --ignored
EPI_GRAPH_LIVE=1 cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test neo4j_contract -- --ignored
EPI_HEN_RELATION_LIVE=1 EPI_GRAPH_LIVE=1 cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test hen_promotion_e2e -- --ignored
```

**Acceptance:**

- All non-live tests pass.
- Live tests either pass against real services or skip honestly with clear missing-env messages.
- No test relies on fake graph sync or fake LLM inference while claiming production behavior.

---

### Task 23: GitNexus And Depwire Final Pass

**Commands:**

Use available GitNexus and depwire tooling. If MCP tools are unavailable, record that explicitly and use CLI equivalents.

```bash
npx gitnexus analyze
npx gitnexus detect-changes
/Users/admin/.npm-global/bin/depwire viz --help
```

Also generate or update:

- file/component inventory
- symbol/execution-flow map
- dependency map across Hen, graph-services, CLI graph adapter, Tauri app surface, and S4 Hen integration

**Acceptance:**

- Final implementation notes identify changed symbols and blast radius.
- No broad rename or find-and-replace happened outside GitNexus-safe workflow.
- Dirty worktree changes unrelated to this plan remain untouched.

---

## Recommended Execution Order

1. Tasks 1-4: S0 PI boundary cleanup. Do not proceed with live relation inference until this is corrected.
2. Tasks 5-6: Preserve PI runtime fixes already discovered.
3. Tasks 7-10: Hen evidence and promotion intent.
4. Tasks 11-13: S2 schema law.
5. Tasks 14-16: S2 transactional promotion and Hen sync lifecycle.
6. Tasks 17-19: Adapter boundaries for CLI, Tauri, and S4.
7. Tasks 20-21: compatibility migration and end-to-end promotion.
8. Tasks 22-23: verification and code-intelligence wrap.

---

## Stop Conditions

Stop and ask before proceeding if:

- A fix requires S0 Rust to perform direct provider calls.
- A test needs real external LLM calls without explicit user approval.
- S4 or S5 code appears to be bypassed by a Rust implementation path.
- Tauri/Electron surface ownership is ambiguous after inspection.
- A Neo4j write path requires ad hoc Cypher outside S2 graph-services.
- Existing unrelated dirty-worktree changes conflict with this work.
