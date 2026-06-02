# World Types Mirror Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align `Idea/Bimba/World/Types` with the canonical coordinate ordering so the vault mirrors the Neo4j seed bedrock while `Idea/Bimba/World` remains the flat artifact/form library.

**Architecture:** Treat `World/Types` as the ordered ontology mirror: root `#`, psychoids `#0-#5`, seven context frames, family coordinates `C` through `M` with nested inversion folders, and type authorities layered on top of that ordering. Treat `World/*.md` as CT5 instantiated synthesis forms that can be reused as templates in any context. Update the Hen/S1' spec so this filesystem law is explicit rather than implied by implementation.

**Tech Stack:** Markdown specs and contract docs, tracked directory placeholders under `Idea/`, Rust integration tests that assert the filesystem authority.

---

### Task 1: Make The Spec Explicit

**Files:**
- Modify: `Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md`
- Modify: `.pi/extensions/ta-onta/hen/CONTRACT.md`

**Step 1: Write the failing/documenting expectation in prose**

Describe the canonical ordering:
- `#`
- `#0-#5`
- `CF_VOID` through `CF_MOBIUS`
- `C`/`C'` through `M`/`M'`
- type authorities and form instantiations

**Step 2: Encode the world/type split**

Document that:
- `Idea/Bimba/World/Types` is the ontology mirror
- `Idea/Bimba/World/*.md` are flat artifact-library forms
- Hen reads forms from `World`, not from a nested template folder

### Task 2: Materialize The Ordered Types Tree

**Files:**
- Create tracked placeholders under `Idea/Bimba/World/Types/...`
- Create: `Idea/Bimba/World/Types/README.md`

**Step 1: Add bedrock layers**

Create directories for:
- `Root/#`
- `Psychoids/#0` through `#5`
- `ContextFrames/CF_VOID` through `CF_MOBIUS`

**Step 2: Add family mirrors**

Create directories for:
- `Coordinates/C/C0` through `C5`
- `Coordinates/C/C'/C0'` through `C5'`
- repeat for `P`, `L`, `S`, `T`, `M`

**Step 3: Preserve current CT lineage**

Keep `Types/CT/...` for form/type authorities, but make it one layer inside the larger ordered mirror rather than the whole system.

### Task 3: Tighten Tests Around The New Authority

**Files:**
- Modify: `epi-cli/tests/idea_tree_templates.rs`
- Modify: `epi-cli/tests/agent_extensions_ta_onta.rs`

**Step 1: Assert the ordered mirror exists**

Add expectations for:
- root `#`
- psychoids
- all seven context frames
- representative family and inverted-family directories
- retained CT lineage directories

**Step 2: Verify Hen contract language**

Assert the contract mentions both:
- the flat `World` form library
- the ordered `World/Types` ontology mirror

### Task 4: Verification

**Step 1: Run focused verification**

Run:
- `cargo test --test idea_tree_templates --test agent_extensions_ta_onta`

Expected: PASS

**Step 2: Run full verification**

Run:
- `cargo test`

Expected: PASS or document unrelated failures
