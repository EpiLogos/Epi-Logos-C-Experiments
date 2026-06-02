# OMX Pleroma Claw Runtime Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Execution Guardrails:** Also use superpowers:test-driven-development, superpowers:verification-before-completion, superpowers:requesting-code-review, and GitNexus impact analysis before editing any runtime symbol.

**Goal:** Make repo-local Codex sessions run on oh-my-codex now, re-found Pleroma as an OMX-derived transportable package governed by ta-onta specs, and then replace the PI-native harness substrate with claw-code-parity Rust once parity gates are green.

**Architecture:** Keep semantic authority split cleanly. Ta-onta specs remain the authority for Pleroma behavior. OMX becomes the Codex-facing workflow/runtime layer under repo-local `.codex/` and `.omx/`. `epi-cli` remains the control plane that installs, verifies, and projects runtime assets. PI stays as a temporary compatibility substrate only. Claw-rust becomes the long-term native harness substrate once its verified runtime parity is sufficient for Epi control-plane integration.

**Tech Stack:** `vendors/oh-my-codex` for fork/source work, repo-local `.codex/` + `.omx/` for installed Codex runtime state, Rust `epi-cli/src/agent/*`, ta-onta `.pi/extensions/*`, future claw-rust vendor/fork, integration tests, shell smoke tests, GitNexus impact/detect-changes, real OMX and claw parity verification.

---

## Current checkpoint

- OMX is installed project-scoped in this repo and verified with `omx doctor`.
- The stable OMX source lives at `vendors/oh-my-codex/`, while installed OMX runtime payloads are copied into `.codex/omx-runtime/`.
- Repo-local Codex runtime files now live under `.codex/` and `.omx/`.
- `AGENTS.md` was intentionally not overwritten; existing repo instructions remain authoritative.
- `epi-cli` is still PI-first in substrate terms (`epi-cli/src/agent/runtime.rs`, `epi-cli/src/agent/spawn.rs`, `docs/dev/pi-operator-protocol.md`).
- Pleroma still exists primarily as ta-onta runtime/module content under `.pi/extensions/ta-onta/pleroma/`, with specs calling for a future `plugins/pleroma/` package.

## Non-goals

- Do not overwrite repo-specific `AGENTS.md` with stock OMX content.
- Do not treat OMX-generated `.codex/skills` as the long-term Pleroma source of truth.
- Do not switch `epi agent` from PI to claw in one jump without a dual-lane verification phase.
- Do not re-author Pleroma from the current `.pi` implementation alone; specs stay authoritative.

## Task 1: Freeze authority and provenance

**Files:**
- Create: `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md`
- Modify: `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-03-08-superpowers-pleroma-source-inventory.md`
- Test: `epi-cli/tests/agent_docs.rs`

**Step 1: Write the failing test**

Add a doc-validation test asserting the authority matrix explicitly names:

- `OMX` as the Codex runtime/workflow layer
- `ta-onta specs` as Pleroma semantic authority
- `PI` as compatibility substrate
- `claw-rust` as target native harness substrate

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_docs omx_pleroma_claw_authority_matrix_exists -- --exact --nocapture`

Expected: FAIL because the new authority matrix does not exist yet.

**Step 3: Write minimal implementation**

Document:

- the authority split
- what is source material vs source of truth
- what can be derived/generated
- what must stay spec-driven

Update existing S4 docs so they no longer imply that superpowers lineage remains the canonical long-term base.

**Step 4: Run test to verify it passes**

Run the same test and confirm PASS.

**Step 5: Commit**

```bash
git add Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-03-08-superpowers-pleroma-source-inventory.md epi-cli/tests/agent_docs.rs
git commit -m "docs: freeze omx pleroma claw authority split"
```

## Task 2: Make OMX installation reproducible from the repo

**Files:**
- Create: `tools/omx/setup-project.sh`
- Create: `docs/provenance/2026-04-03-oh-my-codex-vendor.md`
- Modify: `.gitignore`
- Test: `tools/e2e/omx-project-setup-smoke.sh`

**Step 1: Write the failing test**

Create a smoke script that:

- asserts `vendors/oh-my-codex/dist/cli/omx.js` exists
- runs project-scoped setup in a temp repo fixture
- verifies generated config points to the vendored repo path, not `/tmp`

**Step 2: Run test to verify it fails**

Run: `bash tools/e2e/omx-project-setup-smoke.sh`

Expected: FAIL because the wrapper and provenance doc do not exist yet.

**Step 3: Write minimal implementation**

Add:

- a checked-in setup wrapper that always installs from `vendors/oh-my-codex`
- a provenance note pinning the vendored OMX commit
- ignore rules only for runtime state that must stay local

**Step 4: Run test to verify it passes**

Run the smoke script and confirm all generated paths are repo-local and stable.

**Step 5: Commit**

```bash
git add tools/omx/setup-project.sh docs/provenance/2026-04-03-oh-my-codex-vendor.md .gitignore tools/e2e/omx-project-setup-smoke.sh
git commit -m "build: make repo-local omx install reproducible"
```

## Task 3: Add a Codex runtime lane to `epi-cli`

**Files:**
- Create: `epi-cli/src/agent/codex_runtime.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Modify: `epi-cli/src/agent/install.rs`
- Modify: `epi-cli/src/agent/doctor.rs`
- Modify: `epi-cli/src/agent/agent_dirs.rs`
- Test: `epi-cli/tests/agent_codex_runtime.rs`

**Step 1: Write the failing test**

Add integration tests asserting:

- `epi agent codex install` uses `vendors/oh-my-codex`
- `epi agent codex doctor` verifies `.codex/config.toml`, `.codex/skills`, `.codex/agents`, and `.omx/setup-scope.json`
- the command reports repo-local runtime roots, not user-home defaults

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_codex_runtime -v`

Expected: FAIL because no Codex runtime lane exists in `epi-cli`.

**Step 3: Write minimal implementation**

Create a small control-plane surface for OMX/Codex runtime management without mixing it into PI launch planning.

**Step 4: Run test to verify it passes**

Run the same test and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/codex_runtime.rs epi-cli/src/agent/mod.rs epi-cli/src/agent/install.rs epi-cli/src/agent/doctor.rs epi-cli/src/agent/agent_dirs.rs epi-cli/tests/agent_codex_runtime.rs
git commit -m "feat(agent): add repo-local codex runtime control lane"
```

## Task 4: Rebase Pleroma from superpowers-first to OMX-first inventory

**Files:**
- Create: `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-port-matrix.md`
- Modify: `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-03-08-pleroma-canonical-brief.md`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-EXTENSION-ARCHITECTURE.md`
- Test: `epi-cli/tests/agent_docs.rs`

**Step 1: Write the failing test**

Add a doc-validation test that expects the Pleroma matrix to list:

- OMX-derived workflow/runtime surfaces
- ta-onta-spec-governed Pleroma surfaces
- retained `.pi` compatibility surfaces
- claw-rust substrate handoff targets

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_docs pleroma_omx_port_matrix_exists -- --exact --nocapture`

Expected: FAIL because the matrix doc does not exist yet.

**Step 3: Write minimal implementation**

Map each current capability to one of:

- `retain from OMX`
- `port from current Pleroma runtime`
- `derive from ta-onta spec`
- `move to claw substrate`

**Step 4: Run test to verify it passes**

Run the same test and confirm PASS.

**Step 5: Commit**

```bash
git add Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-port-matrix.md Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-03-08-pleroma-canonical-brief.md Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-EXTENSION-ARCHITECTURE.md epi-cli/tests/agent_docs.rs
git commit -m "docs: rebase pleroma inventory onto omx runtime model"
```

## Task 5: Create the real transportable `plugins/pleroma/` package

**Files:**
- Create: `plugins/pleroma/.claude-plugin/plugin.json`
- Create: `plugins/pleroma/settings.json`
- Create: `plugins/pleroma/skills/`
- Create: `plugins/pleroma/agents/`
- Create: `plugins/pleroma/hooks/hooks.json`
- Create: `plugins/pleroma/evals/suites/`
- Test: `epi-cli/tests/pleroma_bundle.rs`

**Step 1: Write the failing test**

Add a bundle validation test that points at `plugins/pleroma` and expects:

- a real plugin manifest
- non-empty skill inventory
- non-empty agent inventory
- non-empty hook/eval inventory

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test pleroma_bundle -v`

Expected: FAIL because `plugins/pleroma` does not exist yet.

**Step 3: Write minimal implementation**

Scaffold the package from the Task 4 matrix, not from OMX-generated `.codex` output.

**Step 4: Run test to verify it passes**

Run the same test and confirm PASS.

**Step 5: Commit**

```bash
git add plugins/pleroma epi-cli/tests/pleroma_bundle.rs
git commit -m "feat(pleroma): create transportable plugin package skeleton"
```

## Task 6: Project `plugins/pleroma` into repo-local Codex and managed agent runtimes

**Files:**
- Modify: `epi-cli/src/agent/plugins.rs`
- Modify: `epi-cli/src/agent/skills.rs`
- Modify: `epi-cli/src/agent/subagents.rs`
- Modify: `epi-cli/src/agent/agent_dirs.rs`
- Test: `epi-cli/tests/agent_plugin_install.rs`
- Test: `epi-cli/tests/agent_native_pi_contract.rs`

**Step 1: Write the failing test**

Add tests asserting:

- `plugins/pleroma` can be discovered and validated
- plugin skills can be projected into `.codex/skills` or compatible managed roots
- PI compatibility projections continue to work during transition

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_plugin_install --test agent_native_pi_contract -v`

Expected: FAIL because runtime projection is not yet sourced from `plugins/pleroma`.

**Step 3: Write minimal implementation**

Keep one source of truth for Pleroma package assets and project them into:

- repo-local Codex runtime
- repo-local managed `.epi/agents/*/agent/compat/...`

**Step 4: Run test to verify it passes**

Run the same tests and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/plugins.rs epi-cli/src/agent/skills.rs epi-cli/src/agent/subagents.rs epi-cli/src/agent/agent_dirs.rs epi-cli/tests/agent_plugin_install.rs epi-cli/tests/agent_native_pi_contract.rs
git commit -m "feat(agent): project pleroma package into managed runtimes"
```

## Task 7: Add claw-rust as an experimental native substrate lane

**Files:**
- Create: `docs/dev/claw-operator-protocol.md`
- Create: `epi-cli/src/agent/claw_runtime.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Modify: `epi-cli/src/agent/doctor.rs`
- Test: `epi-cli/tests/agent_claw_runtime.rs`
- Test: `tools/e2e/claw-parity-smoke.sh`

**Step 1: Write the failing test**

Add tests asserting:

- `epi agent claw doctor` verifies the vendored or configured claw runtime
- `epi agent claw verify-runtime` can run a non-destructive smoke path
- the smoke script can invoke the upstream parity harness or a narrowed local equivalent

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_claw_runtime -v`

Expected: FAIL because claw is not wired into `epi-cli`.

**Step 3: Write minimal implementation**

Create a feature-flagged experimental lane that leaves the current PI path intact while allowing claw verification and control-plane health checks.

**Step 4: Run test to verify it passes**

Run:

- `cargo test --manifest-path epi-cli/Cargo.toml --test agent_claw_runtime -v`
- `bash tools/e2e/claw-parity-smoke.sh`

Expected: PASS.

**Step 5: Commit**

```bash
git add docs/dev/claw-operator-protocol.md epi-cli/src/agent/claw_runtime.rs epi-cli/src/agent/mod.rs epi-cli/src/agent/doctor.rs epi-cli/tests/agent_claw_runtime.rs tools/e2e/claw-parity-smoke.sh
git commit -m "feat(agent): add experimental claw runtime lane"
```

## Task 8: Cut over authoring and runtime defaults from PI-first to claw-first

**Files:**
- Modify: `docs/dev/pi-operator-protocol.md`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md`
- Modify: `.pi/extensions/ta-onta/pleroma/CONTRACT.md`
- Modify: `epi-cli/src/agent/runtime.rs`
- Modify: `epi-cli/src/agent/spawn.rs`
- Test: `epi-cli/tests/agent_claw_runtime.rs`
- Test: `epi-cli/tests/agent_native_pi_contract.rs`

**Step 1: Write the failing test**

Add tests that assert:

- claw becomes the default substrate for new operator launches
- PI remains available only as explicit compatibility mode
- plugin/skill authoring is documented as primary, `.pi` extension authoring as compatibility-only

**Step 2: Run test to verify it fails**

Run the claw and native-PI contract tests.

Expected: FAIL because PI is still the default substrate and docs still center it.

**Step 3: Write minimal implementation**

Switch defaults only after the previous tasks pass, and document the cutover clearly.

**Step 4: Run test to verify it passes**

Run both runtime test suites and smoke checks.

**Step 5: Commit**

```bash
git add docs/dev/pi-operator-protocol.md Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md .pi/extensions/ta-onta/pleroma/CONTRACT.md epi-cli/src/agent/runtime.rs epi-cli/src/agent/spawn.rs epi-cli/tests/agent_claw_runtime.rs epi-cli/tests/agent_native_pi_contract.rs
git commit -m "feat(agent): make claw the default runtime substrate"
```

## Verification gates before declaring success

- `node vendors/oh-my-codex/dist/cli/omx.js doctor`
- `cargo test --manifest-path epi-cli/Cargo.toml`
- `cargo fmt --manifest-path epi-cli/Cargo.toml --all --check`
- `bash tools/e2e/omx-project-setup-smoke.sh`
- `bash tools/e2e/claw-parity-smoke.sh`
- `gitnexus_detect_changes({scope: "all", repo: "Epi-Logos C Experiments"})`

## Recommended execution order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8

## Handoff note

The repo is now in a good bootstrap state for Codex itself, but the generated `.codex/` install output is not the same thing as the long-term Pleroma source package. Future implementation should treat `.codex/` as runtime output and `plugins/pleroma/` plus the ta-onta specs as the lasting authoring surface.
