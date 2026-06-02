# Graph Bootstrap + Health Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a proper local graph development bootstrap flow and a deep health surface that verifies Neo4j, Redis Stack, RedisVL semantic cache readiness, and semantic index maintenance state.

**Architecture:** `epi graph bootstrap-dev` owns local developer readiness: start Docker services, prepare the RedisVL Python environment, and verify the stack is reachable before claiming success. `epi graph doctor` owns operational truth: it reports backend connectivity, Redis Stack search capability, semantic-cache bridge readiness, graph metadata, seeded node counts, semantic index counts, and stale-node counts. `epi graph status` remains a lightweight human-readable glance.

**Tech Stack:** Rust CLI, Neo4j/neo4rs, Redis async client, Python RedisVL service, Docker Compose, Cargo integration tests

---

### Task 1: Specify bootstrap + doctor contract

**Files:**
- Modify: `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`
- Modify: `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md`
- Create: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-graph-bootstrap-health.md`

**Step 1: Write the docs first**

Document:
- `epi graph bootstrap-dev` as the single local setup path
- Redis Stack as the semantic-cache backend requirement
- `epi graph doctor` as the deep health report
- changed-node-only plus relation-dependent re-embedding in doctor output

**Step 2: Verify docs exist**

Run: `rg -n "bootstrap-dev|graph doctor|Redis Stack|stale" docs/specs docs/plans`

Expected: matches in the updated spec and plan files

### Task 2: Bootstrap-dev TDD

**Files:**
- Modify: `epi-cli/tests/graph_commands.rs`
- Modify: `epi-cli/src/graph/mod.rs`
- Create: `epi-cli/src/graph/dev.rs`
- Modify: `epi-cli/scripts/redisvl_cache_service/setup.sh`

**Step 1: Write the failing test**

Add tests that prove:
- `bootstrap-dev` is exposed as a graph command
- bootstrap output includes compose file, RedisVL setup path, and environment hints
- a live ignored test can run `bootstrap-dev` and then confirm doctor reports backend readiness

**Step 2: Run test to verify it fails**

Run: `cargo test --test graph_commands bootstrap -- --nocapture`

Expected: FAIL because the command/behavior does not exist yet

**Step 3: Write minimal implementation**

Implement:
- `epi graph bootstrap-dev`
- helper functions to locate compose/setup paths
- compose bring-up and backend wait logic
- improved RedisVL setup script with deterministic dependency install and clearer output

**Step 4: Run test to verify it passes**

Run: `cargo test --test graph_commands bootstrap -- --nocapture`

Expected: PASS

### Task 3: Doctor TDD

**Files:**
- Modify: `epi-cli/tests/graph_commands.rs`
- Modify: `epi-cli/tests/semantic_cache_contract.rs`
- Modify: `epi-cli/src/graph/semantic_cache.rs`
- Modify: `epi-cli/scripts/redisvl_cache_service/redisvl_cache_service.py`
- Create: `epi-cli/src/graph/doctor.rs`
- Modify: `epi-cli/src/graph/mod.rs`

**Step 1: Write the failing test**

Add tests that prove:
- doctor JSON includes Neo4j, Redis, Redis Stack, semantic-cache, graph metadata, and semantic index sections
- the Python bridge exposes a health command with Redis Stack/search readiness
- the live ignored suite reports real node counts, semantic counts, and stale-node counts

**Step 2: Run test to verify it fails**

Run:
- `cargo test --test semantic_cache_contract -- --nocapture`
- `cargo test --test graph_commands doctor -- --nocapture`

Expected: FAIL because the doctor/health structures do not exist yet

**Step 3: Write minimal implementation**

Implement:
- Rust doctor report structs and human/json rendering
- semantic-cache bridge health command and Rust client health method
- live graph metadata/index inspection in doctor
- status output derived from the same checks but simplified for glanceability

**Step 4: Run test to verify it passes**

Run:
- `cargo test --test semantic_cache_contract -- --nocapture`
- `cargo test --test graph_commands doctor -- --nocapture`

Expected: PASS

### Task 4: Full verification

**Files:**
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-graph-bootstrap-health.md`

**Step 1: Run formatting**

Run: `cargo fmt --all`

Expected: exit 0

**Step 2: Run the focused suite**

Run:
- `cargo test --test graph_commands -- --ignored --nocapture`
- `cargo test --test semantic_cache_contract -- --nocapture`
- `cargo test --test semantic_cache_contract semantic_cache_python_bridge_round_trip -- --ignored --nocapture`

Expected: PASS

**Step 3: Run the live graph regressions**

Run:
- `cargo test --test graph_retrieval -- --ignored --nocapture`
- `cargo test --test graph_seed -- --ignored --nocapture`
- `cargo test --test graph_sync -- --ignored --nocapture`
- `cargo test --test redis_cache -- --ignored --nocapture`
- `cargo test test_embed_real --lib -- --ignored --nocapture`
- `cargo test test_embed_batch_real --lib -- --ignored --nocapture`

Expected: PASS, or explicit evidence for any remaining external-service blocker
