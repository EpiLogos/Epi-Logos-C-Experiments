# Knowing Dossier Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `epi core knowing` from a shallow coordinate lookup into a lightweight but real dossier portal with six facets: essence, structural correspondences, relational field, kbase field, notebook pulse, and latest snapshot, plus actionable `open`/`glow` orchestration.

**Architecture:** Keep one canonical dossier shape for both bare CLI and ratatui. Store hand-curated coordinate text separately from live snapshot/cache data, then have a single knowing orchestrator assemble the dossier from canonical overlay, graph retrieval, kbase lookup, and NotebookLM extraction. Render the same dossier in two views: plain CLI text/JSON now, ratatui browser second.

**Tech Stack:** Rust 2021, clap 4, serde/serde_json, color-eyre, tokio, existing Neo4j retrieval modules, existing `bkmr` and NotebookLM CLI wrappers, ratatui.

---

### Task 1: Extract `knowing` into a real dossier module

**Files:**
- Create: `epi-cli/src/core/knowing/mod.rs`
- Create: `epi-cli/src/core/knowing/types.rs`
- Create: `epi-cli/src/core/knowing/render.rs`
- Modify: `epi-cli/src/core/mod.rs`
- Test: `epi-cli/tests/core_knowing.rs`

**Step 1: Write the failing dossier-shape test**

```rust
#[test]
fn knowing_family_coordinate_json_has_six_facets_and_actions() {
    let dossier = epi_logos::core::knowing::build_structural_dossier_for_test("C1").unwrap();
    assert_eq!(dossier.coordinate, "C1");
    assert!(dossier.essence.text.len() > 0);
    assert_eq!(dossier.structural_correspondences.len(), 6);
    assert!(dossier.actions.iter().any(|a| a.id == "refresh"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: FAIL because `core::knowing` module and dossier builder do not exist yet.

**Step 3: Write the minimal dossier types and builder**

```rust
pub struct KnowingDossier {
    pub coordinate: String,
    pub essence: EssenceFacet,
    pub structural_correspondences: Vec<StructuralCorrespondence>,
    pub relational_field: RelationalFieldFacet,
    pub kbase_field: KbaseFieldFacet,
    pub notebook_pulse: NotebookPulseFacet,
    pub latest_snapshot: LatestSnapshotFacet,
    pub actions: Vec<KnowingAction>,
}
```

Create the builder with structural-only placeholder population for now, then route `CoreCmd::Knowing` through this module without changing user-visible behavior yet.

**Step 4: Add CLI renderers for text and JSON**

```rust
pub fn render_text(dossier: &KnowingDossier) -> String
pub fn render_json(dossier: &KnowingDossier) -> color_eyre::Result<String>
```

Use section names that match the intended model exactly:
`Essence`, `Structural Correspondences`, `Relational Field`, `KBase Field`, `Notebook Pulse`, `Latest Snapshot`, `Actions`.

**Step 5: Run tests to verify the baseline passes**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS for the new dossier-shape tests.

**Step 6: Commit**

```bash
git add epi-cli/src/core/mod.rs epi-cli/src/core/knowing epi-cli/tests/core_knowing.rs
git commit -m "refactor: extract knowing dossier module"
```

### Task 2: Split canonical overlay from live snapshot cache

**Files:**
- Modify: `epi-cli/src/core/overlay.rs`
- Create: `epi-cli/src/core/knowing/cache.rs`
- Modify: `epi-cli/src/core/knowing/mod.rs`
- Test: `epi-cli/tests/core_knowing.rs`

**Step 1: Write failing persistence tests**

```rust
#[test]
fn canonical_overlay_and_live_cache_use_separate_files() {
    let paths = epi_logos::core::overlay::test_paths("/tmp/epi-knowing-test");
    assert!(paths.canonical.ends_with("overlay.json"));
    assert!(paths.live_cache.ends_with("snapshot-cache.json"));
}

#[test]
fn legacy_pithy_overlay_still_loads_as_essence_text() {
    let entry = load_legacy_fixture("C1");
    assert_eq!(entry.essence.as_deref(), Some("Form -- essential nature"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: FAIL because there is only one overlay file and no backward-compatible loader.

**Step 3: Implement canonical/live separation**

Canonical overlay keeps curated coordinate text and hand-authored fields:

```rust
pub struct CanonicalEntry {
    pub essence: Option<String>,
    pub q_nature: Option<String>,
    pub q_essence: Option<String>,
    pub q_formulation: Option<String>,
    pub q_structure: Option<String>,
}
```

Live snapshot cache stores refreshable data:

```rust
pub struct SnapshotEntry {
    pub updated_at: String,
    pub project_scope: Option<String>,
    pub latest_snapshot: Option<String>,
    pub kbase_hits: Vec<KbaseHit>,
    pub notebook_pulse: Option<NotebookPulse>,
    pub relation_hits: Vec<RelationHit>,
}
```

Keep `--update` targeting canonical essence text, not snapshot content.

**Step 4: Add migration-safe read paths**

If an old entry contains only `pithy`, treat it as `essence` when loading; do not rewrite the whole file during reads.

**Step 5: Run tests to verify backward compatibility**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS including legacy overlay compatibility.

**Step 6: Commit**

```bash
git add epi-cli/src/core/overlay.rs epi-cli/src/core/knowing/cache.rs epi-cli/src/core/knowing/mod.rs epi-cli/tests/core_knowing.rs
git commit -m "feat: split knowing canonical overlay from live snapshot cache"
```

### Task 3: Replace fake relations with graph-backed relational field

**Files:**
- Create: `epi-cli/src/core/knowing/graph.rs`
- Modify: `epi-cli/src/core/knowing/mod.rs`
- Modify: `epi-cli/src/graph/retrieval/coordinate.rs`
- Modify: `epi-cli/src/graph/retrieval/graphrag.rs`
- Test: `epi-cli/tests/core_knowing.rs`
- Test: `epi-cli/tests/graph_retrieval.rs`

**Step 1: Write the failing relational-field test**

```rust
#[tokio::test]
#[ignore]
async fn knowing_relational_field_prefers_constellation_and_chain_data() {
    let dossier = build_live_dossier_for_test("M4").await.unwrap();
    assert!(!dossier.relational_field.constellation.is_empty());
    assert!(dossier.relational_field.chain.len() > 0);
    assert!(dossier.relational_field.items.iter().all(|item| item.kind != "structural"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cargo test --manifest-path epi-cli/Cargo.toml graph_retrieval -- --ignored --nocapture`
Expected: FAIL because the knowing dossier does not yet query graph data.

**Step 3: Add a focused graph adapter for knowing**

Implement a function that returns:

```rust
pub struct RelationalFieldFacet {
    pub constellation: Vec<String>,
    pub chain: Vec<String>,
    pub items: Vec<RelationHit>,
    pub source: String,
}
```

Behavior:
- Use graph retrieval as the primary source.
- Prefer branch/constellation membership first.
- Then add nearest chain/path material.
- Do not reuse same-position family correspondences as “relations”.
- Degrade cleanly when Neo4j is unavailable.

**Step 4: Add ignored live integration coverage**

Extend `epi-cli/tests/graph_retrieval.rs` with a dossier-specific test that runs against the real Neo4j dataset seeded by `seed_coordinate_space`.

**Step 5: Run tests**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS for pure dossier tests.

Run: `cargo test --manifest-path epi-cli/Cargo.toml graph_retrieval -- --ignored --nocapture`
Expected: PASS with Docker-backed Neo4j running.

**Step 6: Commit**

```bash
git add epi-cli/src/core/knowing/graph.rs epi-cli/src/core/knowing/mod.rs epi-cli/src/graph/retrieval/coordinate.rs epi-cli/src/graph/retrieval/graphrag.rs epi-cli/tests/core_knowing.rs epi-cli/tests/graph_retrieval.rs
git commit -m "feat: add graph-backed relational field to knowing dossier"
```

### Task 4: Add the KBase field and `open`/`glow` orchestration

**Files:**
- Create: `epi-cli/src/core/knowing/kbase.rs`
- Modify: `epi-cli/src/kbase/mod.rs`
- Modify: `epi-cli/src/core/mod.rs`
- Modify: `epi-cli/src/core/knowing/mod.rs`
- Test: `epi-cli/tests/core_knowing.rs`

**Step 1: Write the failing KBase/action tests**

```rust
#[test]
fn kbase_field_exposes_selectable_file_hits() {
    let dossier = sample_dossier_with_kbase_hits();
    assert_eq!(dossier.kbase_field.items[0].selection_index, 1);
    assert!(dossier.actions.iter().any(|a| a.id == "glow"));
    assert!(dossier.actions.iter().any(|a| a.id == "open"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: FAIL because there is no KBase facet or action wiring.

**Step 3: Implement a real KBase adapter**

Behavior:
- Query project-scoped `bkmr` first.
- Prefer coordinate-family project buckets and coordinate tags.
- Return compact hits with title, path/URL, project, score, and whether the item is markdown.
- Keep files in the `kbase field`; do not leak them into the relational field.

Target shape:

```rust
pub struct KbaseFieldFacet {
    pub project_scope: Option<String>,
    pub items: Vec<KbaseHit>,
    pub source: String,
}
```

**Step 4: Add `knowing` actions for file-opening**

Extend `CoreCmd::Knowing` with:

```rust
#[arg(long)]
open: Option<usize>,

#[arg(long)]
glow: Option<usize>,

#[arg(long)]
refresh: bool,

#[arg(long)]
project: Option<String>,

#[arg(long, default_value = "5")]
limit: usize,
```

Rules:
- `--open N` opens the selected KBase hit via the existing OS/file opener path.
- `--glow N` opens markdown hits in `glow`.
- If the selected hit is not markdown, return a clear error.

**Step 5: Run tests**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS for dossier/action tests.

Run manually with real tool: `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing M4 --project <project-name>`
Expected: text dossier with numbered `KBase Field` hits and action hints.

**Step 6: Commit**

```bash
git add epi-cli/src/core/mod.rs epi-cli/src/core/knowing/kbase.rs epi-cli/src/core/knowing/mod.rs epi-cli/src/kbase/mod.rs epi-cli/tests/core_knowing.rs
git commit -m "feat: add kbase field and knowing file actions"
```

### Task 5: Add Notebook pulse and latest snapshot refresh flow

**Files:**
- Create: `epi-cli/src/core/knowing/notebook.rs`
- Modify: `epi-cli/src/techne/mod.rs`
- Modify: `epi-cli/src/core/knowing/cache.rs`
- Modify: `epi-cli/src/core/knowing/mod.rs`
- Test: `epi-cli/tests/core_knowing.rs`

**Step 1: Write the failing snapshot-refresh tests**

```rust
#[test]
fn latest_snapshot_prefers_live_sources_over_static_fallbacks() {
    let dossier = dossier_with_refresh_data();
    assert!(dossier.latest_snapshot.text.contains("Notebook"));
    assert!(dossier.latest_snapshot.text.contains("KBase"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: FAIL because snapshot synthesis and notebook pulse do not exist.

**Step 3: Implement the Notebook adapter**

Target shape:

```rust
pub struct NotebookPulseFacet {
    pub notebook: Option<String>,
    pub text: Option<String>,
    pub updated_at: Option<String>,
    pub source: String,
}
```

Behavior:
- Query the configured NotebookLM CLI for one compact extract per coordinate.
- Keep the result tight: one pulse, not a dump.
- Allow a coordinate-to-notebook map or simple family-based default lookup.
- If NotebookLM is unavailable, keep the field empty and non-fatal.

**Step 4: Implement refresh synthesis**

`--refresh` should:
- gather KBase hits
- gather graph relation hits
- gather notebook pulse
- synthesize a fresh `latest_snapshot`
- write only the snapshot cache

`latest_snapshot` should remain concise and explicitly derived from live sources.

**Step 5: Run tests**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS for pure snapshot synthesis tests.

Run manually with real tools: `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing M4 --refresh --project <project-name>`
Expected: dossier refresh completes and persists `snapshot-cache.json`.

**Step 6: Commit**

```bash
git add epi-cli/src/core/knowing/notebook.rs epi-cli/src/core/knowing/cache.rs epi-cli/src/core/knowing/mod.rs epi-cli/src/techne/mod.rs epi-cli/tests/core_knowing.rs
git commit -m "feat: add notebook pulse and knowing snapshot refresh"
```

### Task 6: Add ratatui dossier browser on top of the same schema

**Files:**
- Create: `epi-cli/src/tui/knowing.rs`
- Modify: `epi-cli/src/tui/mod.rs`
- Modify: `epi-cli/src/core/mod.rs`
- Modify: `epi-cli/src/core/knowing/render.rs`
- Test: `epi-cli/tests/core_knowing.rs`

**Step 1: Write the failing TUI-state test**

```rust
#[test]
fn knowing_tui_state_tracks_selected_kbase_hit_and_active_facet() {
    let state = KnowingTuiState::new(sample_dossier());
    assert_eq!(state.active_facet, FacetTab::Essence);
    assert_eq!(state.selected_kbase_index, 0);
}
```

**Step 2: Run tests to verify they fail**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: FAIL because the TUI state module does not exist.

**Step 3: Implement the dossier browser**

Behavior:
- left/top pane: coordinate identity, branch, essence
- middle pane tabs: six facets
- right/bottom pane: actions and selected item detail
- Enter executes the current action on the selected hit
- Reuse the same dossier builder used by plain CLI

Prefer a focused dossier browser instead of a large dashboard.

**Step 4: Add a clear entrypoint**

Either:
- `epi core knowing M4 --tui`

or:
- `epi core knowing-tui M4`

Choose one and document it; do not create both.

**Step 5: Run tests**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS for TUI state tests.

Run manually: `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing M4 --tui`
Expected: dossier browser opens and can navigate hits/actions.

**Step 6: Commit**

```bash
git add epi-cli/src/tui/knowing.rs epi-cli/src/tui/mod.rs epi-cli/src/core/mod.rs epi-cli/src/core/knowing/render.rs epi-cli/tests/core_knowing.rs
git commit -m "feat: add knowing dossier tui browser"
```

### Task 7: Documentation, verification, and operator polish

**Files:**
- Modify: `docs/dev/S0'/README.md`
- Modify: `epi-logos-plugin/skills/epi-knowing.md`
- Modify: `docs/specs/S/S0-S0i-CLI-CORE.md`
- Test: `epi-cli/tests/core_knowing.rs`

**Step 1: Write the failing command-contract tests**

```rust
#[test]
fn knowing_help_mentions_refresh_open_glow_project_and_limit() {
    let help = knowing_help_text();
    assert!(help.contains("--refresh"));
    assert!(help.contains("--open"));
    assert!(help.contains("--glow"));
    assert!(help.contains("--project"));
    assert!(help.contains("--limit"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: FAIL until docs/help wiring is complete.

**Step 3: Update docs and operator examples**

Document:
- the six-facet dossier model
- canonical overlay vs live snapshot cache
- project-scoped KBase integration
- `--refresh`, `--open`, `--glow`, `--project`, `--limit`
- TUI entrypoint

Add examples like:

```bash
epi core knowing C1
epi core knowing M4 --project early-epi
epi core knowing M4 --refresh --project early-epi
epi core knowing M4 --glow 2
epi core knowing M4 --tui
```

**Step 4: Run full verification**

Run: `cargo test --manifest-path epi-cli/Cargo.toml core_knowing -- --nocapture`
Expected: PASS

Run: `cargo test --manifest-path epi-cli/Cargo.toml`
Expected: PASS except for pre-existing ignored/live-tool suites.

Run live checks:
- `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing C1`
- `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing M4 --project <project-name>`
- `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing M4 --refresh --project <project-name>`
- `cargo run --manifest-path epi-cli/Cargo.toml -- core knowing M4 --glow 1`

Expected: all commands behave as documented; no facet mislabeling; no file hits appear under relational field.

**Step 5: Request code review**

Use superpowers:requesting-code-review after the verification commands pass and before any merge/cleanup work.

**Step 6: Commit**

```bash
git add docs/dev/S0'/README.md epi-logos-plugin/skills/epi-knowing.md docs/specs/S/S0-S0i-CLI-CORE.md epi-cli/tests/core_knowing.rs
git commit -m "docs: document knowing dossier workflow"
```

## Notes for Execution

- Preserve the existing `--update`, `--coverage`, `--export`, and `--bake` flows while moving them behind the new dossier module.
- Do not store live graph/KBase/Notebook data in the canonical overlay file.
- Do not call structural correspondences “relations” in the rendered output.
- Keep the dossier concise by default even when source material is large.
- Favor live integration tests against real Neo4j, real `bkmr`, and real NotebookLM when available; gate them with ignored/manual suites instead of replacing them with fake behavior.
- Because the current worktree is already dirty, review the git diff before each task commit and stage only the files listed in that task.
