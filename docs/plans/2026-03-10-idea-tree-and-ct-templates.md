# Idea Tree And CT Templates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Materialize the canonical `Idea/` directory tree in the repo, centralize template forms under `Idea/Bimba/World`, and define production-ready CT0/CT1/CT2/CT3/CT4a/CT4b/CT5 frozen-process authorities with corresponding type lineage under `Idea/Bimba/World/Types/CT`.

**Architecture:** Treat `Idea/` as the tracked vault authority within the repo, with canonical templates living in the Bimba/World branch and runtime invocations continuing to land under `Empty/Present` and `Pratibimba`. Repoint both Obsidian template configuration and Hen template resolution to the same world-resident template root, and make CT4a/CT4b explicit in code and content.

**Tech Stack:** Rust (`epi-cli` vault module/tests), Obsidian config JSON, markdown templates with YAML frontmatter, tracked directory placeholders.

---

### Task 1: Red Tests For Idea Tree And World Template Authority

**Files:**
- Create: `epi-cli/tests/idea_tree_templates.rs`
- Modify: `epi-cli/tests/vault_paths_templates.rs`
- Modify: `epi-cli/tests/agent_extensions_ta_onta.rs`

**Step 1: Write the failing test**

Add tests that assert:
- the repo contains the canonical `Idea/` branches from `Idea Directory Tree.md`
- `.obsidian/templates.json` points to `Idea/Bimba/World`
- Hen resolves repo templates from the world root first
- canonical CT forms include `CT4a` and `CT4b`
- CT typing lineage lives under `Idea/Bimba/World/Types/CT`

**Step 2: Run test to verify it fails**

Run: `cargo test --test idea_tree_templates --test vault_paths_templates --test agent_extensions_ta_onta`
Expected: FAIL because `Idea/` is incomplete and Hen still points at the old template locations.

**Step 3: Write minimal implementation**

Update tests only.

**Step 4: Run test to verify it still fails correctly**

Run: `cargo test --test idea_tree_templates --test vault_paths_templates --test agent_extensions_ta_onta`
Expected: FAIL with missing directories/template authority.

### Task 2: Materialize The Canonical Idea Tree

**Files:**
- Create tracked placeholders under `Idea/…`
- Modify: `.obsidian/templates.json`

**Step 1: Create the structure**

Materialize the full tree from `Idea Directory Tree.md`, using tracked placeholder files for otherwise-empty leaves.

**Step 2: Point Obsidian templates at the world template root**

Set `.obsidian/templates.json` to `Idea/Bimba/World`.

**Step 3: Run tests**

Run: `cargo test --test idea_tree_templates`
Expected: PASS.

### Task 3: Define Canonical CT Frozen-Process Forms

**Files:**
- Create: `Idea/Bimba/World/CT0.md`
- Create: `Idea/Bimba/World/CT1.md`
- Create: `Idea/Bimba/World/CT2.md`
- Create: `Idea/Bimba/World/CT3.md`
- Create: `Idea/Bimba/World/CT4a.md`
- Create: `Idea/Bimba/World/CT4b.md`
- Create: `Idea/Bimba/World/CT5.md`
- Create: `Idea/Bimba/World/*.md` for named forms
- Create: `Idea/Bimba/World/Types/CT/...` lineage folders for instantiated form classes

**Step 1: Write canonical CT form authorities**

Each CT template must declare:
- CT level
- context frame gate
- included QL positions
- frozen-process semantics
- position headings/scaffold

Include the explicit split:
- `CT4a` = `CF(4/5/0)`
- `CT4b` = `CF(4.0-4.4/5)` with all six content spaces

**Step 2: Add named form instances**

Add practical forms such as `Daily-Note`, `NOW`, `Prompt`, `Task-Spec`, `Pattern-Note`, `Thought`, each with lineage back to canonical CT authorities and corresponding `Types/CT/...` placement.

**Step 3: Run tests**

Run: `cargo test --test idea_tree_templates`
Expected: PASS.

### Task 4: Rewire Hen To World Template Authority

**Files:**
- Modify: `epi-cli/src/vault/templates.rs`
- Modify: `epi-cli/src/vault/mod.rs`
- Modify tests under `epi-cli/tests/`

**Step 1: Make world templates primary**

Hen resolution order should begin with the repo’s canonical world form root, then optional user overrides, then built-ins.

**Step 2: Encode CT metadata in code**

Add explicit CT registry data in Rust so renderers/tests know:
- CF gate
- included positions
- CT4a/CT4b distinction
- named profile mapping

**Step 3: Run tests**

Run: `cargo test --test vault_paths_templates --test vault_commands`
Expected: PASS.

### Task 5: Verification

**Step 1: Run focused suites**

Run:
- `cargo test --test idea_tree_templates`
- `cargo test --test vault_paths_templates`
- `cargo test --test vault_commands`
- `cargo test --test agent_extensions_ta_onta`

**Step 2: Run full verification**

Run: `cargo test`
Expected: PASS or document unrelated failures.
