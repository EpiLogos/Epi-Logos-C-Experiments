# S4 Plugin Foundation Phase 1 and Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the existing `epi agent` foundation with a Claude-compatible plugin, skill, subagent, and hook substrate that supports real validation, discovery, hook contract testing, and local `--plugin-dir` runtime loading.

**Architecture:** Keep `.pi/` as the Pi-native execution substrate and keep the current managed agent layout, extension sync, model/auth, and spawn flows intact. Add a separate Rust registry/runtime layer for plugin-root bundles (`.claude-plugin/plugin.json`, `skills/`, `agents/`, `hooks/hooks.json`) so discovery, validation, and runtime selection are explicit, testable, and reusable by future evaluation and installed-cache work.

**Tech Stack:** Rust CLI (`clap`, `serde`, `serde_json`, `serde_yaml`), real filesystem fixtures in integration tests, temp directories, real shell hook scripts, real stdin/stdout JSON exchange, managed `.epi` agent directories, repo-local `.pi` substrate.

---

## Current State and Constraints

- `epi-cli/src/agent/` already supports managed agent directories, repo `.pi` sync, models/auth registries, and `spawn`/`run`/`attach`.
- Root-level `skills/`, `commands/`, and `hooks/` exist as intermediate scaffolding and must remain compatible, but plugin-root packaging is now the target architecture.
- This tranche must not implement ta-onta domain plugins yet.
- This tranche must not discard or bypass the existing `.pi` runtime direction.
- Validation and discovery must be real: no mocked registries, no fake hook execution, no placeholder loaders.

## Phase 1 Deliverables

- Plugin manifest parser for `.claude-plugin/plugin.json`
- Plugin discovery from repo `plugins/` and explicit paths
- Skill parser and registry for plugin `skills/*/SKILL.md`
- Subagent parser and registry for plugin `agents/*.md`
- Hook parser and registry for plugin `hooks/hooks.json`
- Validation commands:
  - `epi agent plugin validate <path>`
  - `epi agent skill validate <path>`
  - `epi agent subagent validate <path>`
  - `epi agent hooks validate <path>`
- Discovery command:
  - `epi agent plugins list`

## Phase 2 Deliverables

- Local `--plugin-dir <path>` support on managed runtime entrypoints
- Session runtime index written into the selected managed agent directory
- Hook contract test command with real stdin/stdout execution:
  - `epi agent hooks test --event <name> --fixture <file> <hooks-json-or-plugin-root>`
- Spawn/run verification that selected plugin roots are resolved, indexed, and exported into the managed runtime environment

### Task 1: Add failing integration tests for plugin bundle validation and discovery

**Files:**
- Create: `epi-cli/tests/agent_plugins.rs`
- Modify: `epi-cli/tests/common/mod.rs`

**Step 1: Write the failing tests**

Add integration tests that build real temp plugin bundles with:

- `.claude-plugin/plugin.json`
- `skills/example/SKILL.md`
- `agents/reviewer.md`
- `hooks/hooks.json`
- executable hook scripts under `hooks/scripts/`

Required cases:

- valid plugin bundle passes `epi agent plugin validate <path> --json`
- repo `plugins/` discovery finds multiple valid bundles in deterministic order
- invalid manifest, duplicate skill names, invalid hook events, and missing component files fail validation with actionable errors

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_plugins -- --nocapture`
Expected: FAIL because the new CLI surface and parsers do not exist.

**Step 3: Write minimal implementation**

- Extend the test helpers so they can create plugin bundles, fixtures, and executable hook scripts.
- Do not add production code yet beyond the minimum needed to compile later test files if required.

**Step 4: Run test to verify it still fails for the expected missing implementation reason**

Run: `cargo test --test agent_plugins valid_plugin_bundle_passes_validation -- --exact --nocapture`
Expected: FAIL with missing `epi agent plugin` command or equivalent validation behavior.

**Step 5: Commit**

```bash
git add epi-cli/tests/agent_plugins.rs epi-cli/tests/common/mod.rs
git commit -m "test: add failing plugin bundle validation coverage"
```

### Task 2: Implement plugin manifest, skill, subagent, and hook parsers

**Files:**
- Create: `epi-cli/src/agent/capabilities.rs`
- Create: `epi-cli/src/agent/plugin_manifest.rs`
- Create: `epi-cli/src/agent/skills.rs`
- Create: `epi-cli/src/agent/subagents.rs`
- Create: `epi-cli/src/agent/hooks.rs`
- Modify: `epi-cli/src/agent/mod.rs`

**Step 1: Write the failing parser-focused tests**

Add or extend `epi-cli/tests/agent_plugins.rs` coverage so that validation asserts structured fields from:

- plugin manifest name/version/description
- skill frontmatter and body
- subagent frontmatter and body
- hook event/type/path data
- allowed tool capability validation

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_plugins plugin_validation_reports_skill_and_hook_inventory -- --exact --nocapture`
Expected: FAIL because parser modules do not exist.

**Step 3: Write minimal implementation**

Implement:

- minimal manifest schema with required `name` and `version`
- markdown frontmatter parser shared by skills and subagents
- capability registry with a fixed initial allowlist for Claude-compatible tool IDs plus current Epi bridge tool names
- hook schema with supported event names and command/agent/prompt action types
- canonical validation errors that preserve the offending file path

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_plugins plugin_validation_reports_skill_and_hook_inventory -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/capabilities.rs epi-cli/src/agent/plugin_manifest.rs epi-cli/src/agent/skills.rs epi-cli/src/agent/subagents.rs epi-cli/src/agent/hooks.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_plugins.rs
git commit -m "feat: add plugin bundle parsers and validation primitives"
```

### Task 3: Implement plugin discovery and validation CLI

**Files:**
- Create: `epi-cli/src/agent/plugins.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_plugins.rs`

**Step 1: Write the failing tests**

Cover:

- `epi agent plugins list --json` discovers repo-local `plugins/*`
- `epi agent plugin validate <path> --json` returns a structured report
- `epi agent skill validate <path> --json`
- `epi agent subagent validate <path> --json`
- `epi agent hooks validate <path> --json`

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_plugins plugin_discovery_lists_repo_plugins -- --exact --nocapture`
Expected: FAIL because discovery commands do not exist.

**Step 3: Write minimal implementation**

Implement:

- repo-local plugin discovery under `<repo>/plugins`
- explicit single-path validation for plugin roots and component files
- JSON reports that include resolved absolute paths, inventory counts, and validation errors
- deterministic ordering by plugin name then path

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_plugins -- --nocapture`
Expected: PASS for discovery and validation cases.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/plugins.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_plugins.rs
git commit -m "feat: add plugin discovery and validation cli"
```

### Task 4: Add hook contract validation and execution tests

**Files:**
- Modify: `epi-cli/src/agent/hooks.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Create: `epi-cli/tests/agent_hooks.rs`
- Modify: `epi-cli/tests/common/mod.rs`

**Step 1: Write the failing tests**

Use real temp files to verify:

- `epi agent hooks validate <path>` rejects invalid event names and missing command scripts
- `epi agent hooks test --event PreToolUse --fixture <file> <path>` spawns the configured command hook
- the hook receives the fixture JSON on stdin
- the hook returns structured JSON on stdout
- `continue: false` and decision payloads are surfaced back to the CLI

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_hooks -- --nocapture`
Expected: FAIL because hook execution/test plumbing does not exist.

**Step 3: Write minimal implementation**

Implement:

- hook config loader reusable from plugin validation
- hook command execution with stdin fixture piping
- stdout JSON parsing and raw stderr capture
- per-event filtering so only matching hooks fire

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_hooks -- --nocapture`
Expected: PASS with real stdin/stdout exchange.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/hooks.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_hooks.rs epi-cli/tests/common/mod.rs
git commit -m "feat: add hook contract validation and execution tests"
```

### Task 5: Add local `--plugin-dir` runtime loading to managed spawn and run

**Files:**
- Modify: `epi-cli/src/agent/agent_dirs.rs`
- Modify: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Modify: `epi-cli/src/agent/plugins.rs`
- Modify: `epi-cli/tests/agent_spawn.rs`
- Modify: `epi-cli/tests/common/mod.rs`

**Step 1: Write the failing tests**

Add tests that:

- pass `--plugin-dir` to `epi agent spawn`
- resolve the plugin bundle in place without copying it into cache
- write a managed runtime index file under the selected agent directory
- export environment variables pointing PI to the runtime index and selected plugin roots
- preserve existing `.pi` sync behavior

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_spawn spawn_indexes_explicit_plugin_dirs -- --exact --nocapture`
Expected: FAIL because `spawn` does not accept or index plugin dirs yet.

**Step 3: Write minimal implementation**

Implement:

- `--plugin-dir` as a repeatable option for `spawn` and `run`
- plugin root resolution and validation before PI launch
- managed runtime index file such as `agent/plugin-runtime.json`
- exported env vars for the launched PI process containing the runtime index path and selected plugin roots

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_spawn spawn_indexes_explicit_plugin_dirs -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/agent_dirs.rs epi-cli/src/agent/spawn.rs epi-cli/src/agent/mod.rs epi-cli/src/agent/plugins.rs epi-cli/tests/agent_spawn.rs epi-cli/tests/common/mod.rs
git commit -m "feat: add local plugin-dir runtime loading"
```

### Task 6: Fresh verification before claiming tranche status

**Files:**
- Modify as needed: docs or code touched above

**Step 1: Run focused verification**

Run:

```bash
cargo test --test agent_plugins -- --nocapture
cargo test --test agent_hooks -- --nocapture
cargo test --test agent_spawn -- --nocapture
```

Expected: PASS for all new plugin/skill/subagent/hook/runtime cases.

**Step 2: Run broader agent verification**

Run:

```bash
cargo test --test agent_dirs -- --nocapture
cargo test --test agent_install -- --nocapture
cargo test --test agent_extensions -- --nocapture
cargo test --test agent_agents -- --nocapture
cargo test --test agent_models -- --nocapture
cargo test --test agent_auth -- --nocapture
```

Expected: PASS with no regressions in the existing managed agent foundation.

**Step 3: Re-read Phase 1 and Phase 2 checklist**

Confirm each requested surface exists and report any deferred work explicitly:

- plugin manifest parser
- plugin discovery
- skill parser/registry
- subagent parser/registry
- hook parser/registry
- validation CLI commands
- local `--plugin-dir` runtime loading

**Step 4: Commit**

```bash
git add docs/plans/2026-03-07-s4-plugin-foundation-phase1-phase2.md epi-cli/src/agent epi-cli/tests
git commit -m "feat: land s4 plugin foundation phase 1 and phase 2 substrate"
```

## Out of Scope for This Tranche

- Installed plugin cache and semver invalidation
- Evaluation suite runner
- `epi-core` plugin authoring
- Pleroma plugin authoring
- ta-onta plugin authoring
- LSP and MCP plugin execution

## Immediate Execution Choice

The user already requested immediate in-session execution, so this plan should be executed now in this session with strict red-green verification at each step.
