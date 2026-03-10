# Semantic Graph Lifecycle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `q_*`-driven semantic indexing, safe `bootstrap/update/reconcile` graph lifecycle commands, changed-node-only semantic re-embedding, and a RedisVL-backed semantic cache service abstraction for the Rust CLI.

**Architecture:** The graph remains the source of truth. Neo4j stores canonical nodes, relationships, semantic documents, source hashes, embeddings, and graph metadata. Every `q_*` property is part of the semantic surface by convention, not allowlist. Semantic caching is provided by a small Python RedisVL service that the Rust CLI talks to through a local service abstraction. Re-embedding is driven by semantic source hash drift: only nodes whose semantic document changed, plus relation-dependent neighbors whose summaries changed, are re-embedded on `update`/`reconcile`.

**Tech Stack:** Rust, Neo4j/neo4rs, Python RedisVL service, Redis Stack / Query Engine, Gemini embeddings, Cargo integration tests

---

### Task 1: Graph metadata + lifecycle contract

**Files:**
- Create: `epi-cli/src/graph/meta.rs`
- Modify: `epi-cli/src/graph/mod.rs`
- Modify: `epi-cli/src/graph/schema.rs`
- Test: `epi-cli/tests/graph_commands.rs`

**Step 1: Write the failing test**

Add an ignored live test that proves:
- `graph init` fails on a non-empty graph with guidance to use `graph update` or `graph reconcile`
- `graph bootstrap` succeeds on an empty graph
- `graph reconcile` is safe to run after bootstrap and reports alignment/update state

**Step 2: Run test to verify it fails**

Run: `cargo test --test graph_commands -- --ignored --nocapture`

Expected: FAIL because the new commands/behavior do not exist yet.

**Step 3: Write minimal implementation**

Implement:
- `GraphMeta` read/write helpers backed by a singleton Neo4j metadata node
- lifecycle commands: `Bootstrap`, `Update`, `Reconcile`
- safe `Init` behavior as bootstrap-only, refusing to run on populated graphs
- schema metadata fields for `schema_version`, `seed_source_hash`, `embedding_version`, `q_schema_version`, and `graph_revision`

**Step 4: Run test to verify it passes**

Run: `cargo test --test graph_commands -- --ignored --nocapture`

Expected: PASS

### Task 2: `q_*` semantic document extraction

**Files:**
- Create: `epi-cli/src/graph/semantic.rs`
- Modify: `epi-cli/src/graph/mod.rs`
- Test: `epi-cli/tests/graph_retrieval.rs`

**Step 1: Write the failing test**

Add tests that prove:
- every node semantic document always includes core properties
- every property whose key starts with `q_` is included, with no hardcoded allowlist
- relation summaries are included in a deterministic, compact form

**Step 2: Run test to verify it fails**

Run: `cargo test --test graph_retrieval -- --ignored --nocapture`

Expected: FAIL because no semantic document builder exists yet.

**Step 3: Write minimal implementation**

Implement:
- semantic document builder using live Neo4j data
- generic `q_*` property extraction
- deterministic source hash generation from the semantic document
- compact incoming/outgoing relation summaries for embedding input

**Step 4: Run test to verify it passes**

Run: `cargo test --test graph_retrieval -- --ignored --nocapture`

Expected: PASS

### Task 3: Embedding refresh/update tracking

**Files:**
- Modify: `epi-cli/src/graph/semantic.rs`
- Modify: `epi-cli/src/graph/embeddings.rs`
- Modify: `epi-cli/src/graph/mod.rs`
- Test: `epi-cli/tests/graph_seed.rs`

**Step 1: Write the failing test**

Add ignored live tests that prove:
- node-level semantic metadata is stored on nodes
- embeddings are refreshed when `embedding_version` changes
- only stale nodes are re-embedded
- relation-dependent nodes become stale when their relation summary changes

**Step 2: Run test to verify it fails**

Run: `cargo test --test graph_seed -- --ignored --nocapture`

Expected: FAIL because semantic metadata/refresh logic is missing.

**Step 3: Write minimal implementation**

Implement:
- node-level semantic metadata fields: `semantic_document`, `semantic_source_hash`, `semantic_embedding_version`, `semantic_indexed_at`
- stale-node detection using source hash + embedding version
- changed-set expansion across relation-summary dependencies
- refresh-stale-on-update/reconcile rather than arbitrary full re-embed

**Step 4: Run test to verify it passes**

Run: `cargo test --test graph_seed -- --ignored --nocapture`

Expected: PASS

### Task 4: RedisVL semantic cache service integration

**Files:**
- Create: `epi-cli/src/graph/semantic_cache.rs`
- Create: `epi-cli/scripts/redisvl_cache_service/`
- Modify: `epi-cli/src/graph/mod.rs`
- Modify: `epi-cli/src/graph/retrieval/hybrid.rs`
- Test: `epi-cli/tests/semantic_cache_contract.rs`

**Step 1: Write the failing test**

Add non-network tests that prove:
- semantic-cache service config resolves a Python entrypoint and base URL
- request payloads include prompt, tags/filters, retrieval attributes, and similarity threshold

**Step 2: Run test to verify it fails**

Run: `cargo test --test semantic_cache_contract -- --nocapture`

Expected: FAIL because the RedisVL semantic-cache abstraction and service contract do not exist.

**Step 3: Write minimal implementation**

Implement:
- `SemanticCacheConfig`
- a small Python RedisVL service for semantic cache search/store/invalidate
- a Rust client abstraction that talks to the local service
- integration seam in retrieval so cached query responses can be checked before graph/vector retrieval when configured

**Step 4: Run test to verify it passes**

Run: `cargo test --test semantic_cache_contract -- --nocapture`

Expected: PASS

### Task 5: Full verification

**Files:**
- Modify: `docs/plans/2026-03-10-semantic-graph-lifecycle.md`

**Step 1: Run formatting**

Run: `cargo fmt --all`

Expected: exit 0

**Step 2: Run the full relevant live suite**

Run:
- `cargo test --test graph_commands -- --ignored --nocapture`
- `cargo test --test graph_retrieval -- --ignored --nocapture`
- `cargo test --test graph_seed -- --ignored --nocapture`
- `cargo test --test graph_sync -- --ignored --nocapture`
- `cargo test --test redis_cache -- --ignored --nocapture`
- `cargo test test_embed_real --lib -- --ignored --nocapture`
- `cargo test test_embed_batch_real --lib -- --ignored --nocapture`

Expected: PASS, or explicit evidence for any remaining external-service blockers.
