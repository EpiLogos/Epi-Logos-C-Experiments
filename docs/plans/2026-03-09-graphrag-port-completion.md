# GraphRAG Port Completion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the remaining `epi graph` retrieval stubs with real Rust GraphRAG behavior backed by Neo4j seed topology, progressive disclosure, and hybrid graph/vector retrieval.

**Architecture:** Keep the existing seeded `Bimba` topology and low-level retrieval modules, then add a higher-level GraphRAG orchestration layer that classifies queries, infers coordinate intent, performs keyword and coordinate-aware graph search, expands context, and optionally fuses vector search when embeddings are available. Command dispatch should call these retrieval flows directly instead of returning placeholder strings.

**Tech Stack:** Rust, `neo4rs`, `tokio`, `reqwest`, `clap`, Neo4j vector index, existing `epi-cli` integration tests.

---

### Task 1: Lock in the missing behavior with tests

**Files:**
- Modify: `epi-cli/src/graph/retrieval/graphrag.rs`
- Modify: `epi-cli/tests/graph_retrieval.rs`

**Step 1: Write failing unit tests for GraphRAG helper behavior**

Add tests for:
- query classification (`what is`, `how does`, `related to`)
- coordinate extraction from mixed natural language
- position inference from semantic terms like `foundation`, `process`, `context`

**Step 2: Write failing integration tests for the live retrieval surface**

Add ignored tests that:
- seed Neo4j and call the new GraphRAG retrieval entrypoint with a natural-language query
- verify graph-only hybrid retrieval returns scored results
- verify `graph::dispatch()` no longer returns stub strings for `Retrieve`, `GraphRAG`, and `Hybrid`

**Step 3: Run targeted tests to confirm RED**

Run:
```bash
cargo test graphrag --lib
```

Expected: missing methods/types or assertion failures proving the new behavior is not implemented yet.

### Task 2: Implement the GraphRAG orchestration layer

**Files:**
- Modify: `epi-cli/src/graph/retrieval/graphrag.rs`
- Modify: `epi-cli/src/graph/retrieval/hybrid.rs`

**Step 1: Add GraphRAG query analysis**

Implement:
- query classification
- coordinate extraction
- position inference
- disclosure-level selection based on query type

**Step 2: Add real graph retrieval entrypoints**

Implement:
- direct coordinate retrieval with progressive disclosure
- keyword graph search across `coordinate`, `name`, `family`, `layer`, `essence`, `description`
- context expansion for top matches using relationship traversal

**Step 3: Add real hybrid retrieval execution**

Implement:
- graph-only retrieval mode
- vector retrieval via Neo4j vector index when embeddings are available
- RRF and weighted fusion over live result sets
- graceful fallback to graph-only when embeddings or vector content are absent

### Task 3: Wire the CLI commands to the retrievers

**Files:**
- Modify: `epi-cli/src/graph/mod.rs`

**Step 1: Replace placeholder dispatch branches**

Implement real command handling for:
- `Retrieve`
- `GraphRAG`
- `Hybrid`

**Step 2: Improve `Query` command behavior**

Use the same progressive disclosure surface for `query` so `--level` is meaningful and consistent with GraphRAG output.

### Task 4: Verify against the seeded graph

**Files:**
- Modify as needed: `epi-cli/tests/graph_retrieval.rs`

**Step 1: Run focused retrieval tests**

Run:
```bash
cargo test --lib graphrag
cargo test --test graph_retrieval -- --ignored --nocapture
```

**Step 2: Run broader graph verification**

Run:
```bash
cargo test --test graph_client -- --ignored --nocapture
cargo test --test graph_seed -- --ignored --nocapture
```

**Step 3: Confirm no remaining retrieval stubs**

Check:
```bash
rg -n "GraphRAG query:|Hybrid query:|Retrieving .*nested" epi-cli/src/graph
```

Expected: no placeholder dispatch strings remain.
