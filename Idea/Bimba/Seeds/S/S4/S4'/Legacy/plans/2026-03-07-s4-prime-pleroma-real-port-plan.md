# S4' Pleroma Real Port and 4.0-4.5 Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the real S4' executive layer as a clean Pleroma port: one Claude-compatible plugin-root package that ports the intended superpowers-derived capability body, realizes the full S4-0' through S4-5' execution grammar, and keeps Rust plus `.pi` as substrate rather than as the primary authoring surface.

**Architecture:** Treat the current Rust plugin runtime and `.pi` extensions as the deep mechanics layer, and treat `plugins/pleroma/` as the executive form of those mechanics. Port existing upstream skills and capability ideas from `obra/superpowers`, installed `epi-claw`, and VAK planning into a single plugin with internal module slices, rather than proliferating many top-level extensions. Use a clean-room port method: preserve intended behavior and naming where it is authoritative, but re-author packaging, registries, hooks, subagents, and evaluation so the result is coherent, Claude-compatible, and testable from first principles.

**Tech Stack:** Rust CLI (`clap`, `serde`, `serde_json`, `serde_yaml`), repo-local `.pi` TypeScript extensions, plugin-root filesystem bundles, real shell scripts, temp-dir integration tests, JSON stdin/stdout hook contracts, real eval fixtures, managed `~/.epi/agents/<agent>` runtime state.

---

## Locked Decisions

- `plugins/pleroma/` is the primary executive package for the first real port.
- `.pi/extensions/*.ts` and `epi-cli/src/agent/*.rs` stay the substrate and must not become a second authoring system.
- Pleroma owns cross-agent executive capabilities and general-purpose agentic workflow tools that are part of the S4' body.
- Ta-onta module semantics are expressed as internal slices, namespaces, skills, subagents, hooks, and eval suites, not as a spray of unrelated top-level plugin packages.
- The 4.0-4.5 execution body is the inner form of S4': the plugin must make the reflection-family coordinates operational, not merely documented.
- Evaluation is first-class. Every major ported capability must have real validation or eval coverage before it is considered landed.
- Existing upstream `epi-claw` artifacts are evidence and source material, not the final architecture. We port the intended thing, not the accidental shape.

## Capability Layer Assignment

### Substrate Only

These belong in Rust or `.pi/extensions/` and are never the primary user-facing workflow artifact:

- plugin discovery, validation, install/cache, runtime indexing
- hook execution engine
- eval runner and score/report plumbing
- child-extension propagation and constrained subagent spawn
- bounded primitive bridges for `tmux`, `mprocs`, `onecontext`, `bkmr`, `ralph-tui`, `gitbutler`, `worktrunk`, `cmux`, `notebooklm`

### Atomic Skills

These are single-purpose capabilities that wrap one tool or one bounded operation:

- `tmux`
- `cmux`
- `mprocs`
- `worktrunk`
- `ralph-tui`
- `repl` (Darshana)
- `notebooklm`
- `chatlog-fetcher`
- `youtube-transcript`
- `pleroma-skill-proxy`
- `technē-spawn`
- `technē-relay`
- `technē-list`
- `technē-close`
- `technē-webmcp-*`
- `gitbutler`

### Orchestration Skills

These compose atomic skills and the S4' grammar:

- `vak-coordinate-frame`
- `vak-evaluate`
- `anima-orchestration`
- `day-night-pass`
- `ouroboros`
- `klein-mode`
- `brainstorming`, `writing-plans`, `test-driven-development`, `verification-before-completion`, `subagent-driven-development`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch` as ported/owned workflow surfaces where appropriate

### Subagents

These are the role-bearing executive agents surfaced through plugin `agents/`:

- constitutional agents: `nous`, `logos`, `eros`, `mythos`, `psyche`, `sophia`
- Aletheia cluster agents: `anansi`, `janus`, `moirai`, `mercurius`, `agora`, `zeithoven`
- Moirai specializations: `klotho`, `lachesis`, `atropos` if they remain separate surfaced subagents rather than only internal specializations
- `techne-helper` as the bounded helper subagent for workshop/session/process management

### Hooks

These enforce discipline and runtime law:

- pre-run plugin/runtime validation
- post-run verification and discharge checks
- eval-on-change hooks for skills/agents/hooks manifests
- agent-stop and subagent-stop contract checks
- worktree/session cleanup hooks

### Eval Suites

These verify real behavior:

- manifest and registry validation suites
- skill invocation and metadata suites
- hook stdin/stdout suites
- constitutional routing suites for S4-0' through S4-5'
- real external-tool contract suites for `tmux`, `ralph-tui`, `repl`, `notebooklm`, `youtube-transcript`, `chatlog-fetcher`
- Ouroboros and Klein-mode topology suites

## S4' 4.0-4.5 Capability Body

### S4-0' CPF: Polarity and Entry Mode

Authoring/runtime surfaces:

- `vak-evaluate`
- `brainstorming`
- entry-point hooks that decide dialogical vs autonomous posture
- `nous` fresh-perspective subagent routing

### S4-1' CT: Typed Lens and Artifact Class

Authoring/runtime surfaces:

- `vak-coordinate-frame`
- typed skill metadata and artifact contracts
- Hen-facing template and artifact validation hooks
- evidence acquisition skills such as `youtube-transcript`, `chatlog-fetcher`, and `repl`

### S4-2' CP: Operation and Execution

Authoring/runtime surfaces:

- `tmux`, `cmux`, `mprocs`, `worktrunk`, `gitbutler`, `ralph-tui`
- `technē-*` skills
- `pleroma-skill-proxy`
- bounded PI primitive registry

### S4-3' CF: Constitutional Agent Form

Authoring/runtime surfaces:

- constitutional subagent registry
- Aletheia cluster subagents
- `anima-orchestration`
- role-aware tool/capability policies

### S4-4' CFP: Thread Topology

Authoring/runtime surfaces:

- parallel, chain, fusion, long, big, and zero-touch execution shapes
- `dispatching-parallel-agents`
- `subagent-driven-development`
- `executing-plans`
- Ouroboros as a high-order protocol that composes thread types rather than replacing them

### S4-5' CS: Sequence and Closure

Authoring/runtime surfaces:

- `day-night-pass`
- `klein-mode`
- verification, discharge, and Mobius return hooks
- `finishing-a-development-branch`
- eval suites that exercise Day, Night', Day+Night', and Klein inversion paths

## Canonical Plugin Layout

```text
plugins/pleroma/
  .claude-plugin/
    plugin.json
  skills/
    atomic/
    orchestration/
    constitutional/
  agents/
    constitutional/
    aletheia/
    moirai/
  hooks/
    hooks.json
    scripts/
  evals/
    suites/
    fixtures/
  scripts/
  settings.json
```

Implementation note:

- Keep filesystem packaging Claude-compatible.
- Use namespaced plugin skill names at runtime, but keep on-disk organization readable.
- Do not create separate top-level plugins for every ta-onta slice during this tranche.

## Task 1: Freeze the Port Inventory and Capability Parity Matrix

**Files:**
- Create: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md`

**Step 1: Write the failing test**

Create a doc-validation integration test that asserts the parity matrix exists and lists every locked capability family:

```rust
#[test]
fn pleroma_port_matrix_lists_all_capability_families() {
    let text = std::fs::read_to_string("Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md").unwrap();
    for needle in ["tmux", "cmux", "worktrunk", "ralph-tui", "ouroboros", "klein-mode", "repl", "notebooklm"] {
        assert!(text.contains(needle), "missing {needle}");
    }
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_docs pleroma_port_matrix_lists_all_capability_families -- --exact --nocapture`
Expected: FAIL because the matrix doc and test do not exist.

**Step 3: Write minimal implementation**

Create the matrix doc with these columns:

- capability
- source of truth
- target layer
- target path
- port mode (`port-as-is`, `port-and-refine`, `fresh-design`)
- verification method

The matrix must distinguish real upstream artifacts from fresh-design items such as `cmux`, `worktrunk`, `chatlog-fetcher`, and `klein-mode` when there is no direct installed skill artifact.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_docs pleroma_port_matrix_lists_all_capability_families -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md epi-cli/tests/agent_docs.rs
git commit -m "docs: freeze pleroma port matrix"
```

## Task 2: Extend the Plugin Runtime for Installed Plugins, Cache, and Eval Suite Discovery

**Files:**
- Create: `epi-cli/src/agent/plugin_cache.rs`
- Create: `epi-cli/src/agent/evals.rs`
- Modify: `epi-cli/src/agent/plugins.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Create: `epi-cli/tests/agent_plugin_install.rs`
- Create: `epi-cli/tests/agent_evals.rs`

**Step 1: Write the failing test**

Add integration tests for:

- installing a plugin root into managed cache
- copying relative assets and preserving executable bits
- discovering `evals/suites/*.yaml`
- invalidating cache on plugin version change

```rust
#[test]
fn install_copies_plugin_and_discovers_eval_suites() {
    let env = TestEnv::repo_with_assets();
    let plugin = create_realistic_pleroma_bundle(env.repo_root.join("plugins"));
    let out = run_epi(["agent", "plugin", "install", plugin.root.to_str().unwrap(), "--json"].as_slice(), &env);
    assert!(out.stdout.contains("\"installed\": true"));
    assert!(out.stdout.contains("\"suiteCount\":"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_plugin_install --test agent_evals -- --nocapture`
Expected: FAIL because installed-plugin cache and eval discovery do not exist.

**Step 3: Write minimal implementation**

Implement:

- install/uninstall/list for plugin cache
- relative-path validation for scripts and fixtures
- eval suite discovery and manifest parsing
- JSON reports with suite inventory and cache location

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_plugin_install --test agent_evals -- --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/plugin_cache.rs epi-cli/src/agent/evals.rs epi-cli/src/agent/plugins.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_plugin_install.rs epi-cli/tests/agent_evals.rs
git commit -m "feat: add plugin install cache and eval suite discovery"
```

## Task 3: Port the Bounded Primitive Registry Into `.pi`

**Files:**
- Create: `.pi/extensions/pleroma-primitives.ts`
- Modify: `.pi/composite-entry.ts`
- Modify: `.pi/extensions/agent-team.ts`
- Modify: `.pi/extensions/agent-chain.ts`
- Create: `epi-cli/tests/agent_primitives.rs`

**Step 1: Write the failing test**

Add a spawn integration test that validates the runtime exports a primitive registry containing:

- `tmux`
- `cmux`
- `mprocs`
- `bkmr_kbase`
- `onecontext`
- `ralph_tui`
- `gitbutler`
- `worktrunk`
- `notebooklm`

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_primitives -- --nocapture`
Expected: FAIL because the new primitive extension is not registered.

**Step 3: Write minimal implementation**

Implement the primitive bridge with:

- strict parameter schemas
- bounded execution modes
- child-extension propagation for allowed primitives only
- no plugin-local shadow runtime

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_primitives -- --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add .pi/extensions/pleroma-primitives.ts .pi/composite-entry.ts .pi/extensions/agent-team.ts .pi/extensions/agent-chain.ts epi-cli/tests/agent_primitives.rs
git commit -m "feat: add pleroma primitive bridge extension"
```

## Task 4: Create the Real `plugins/pleroma` Bundle Skeleton

**Files:**
- Create: `plugins/pleroma/.claude-plugin/plugin.json`
- Create: `plugins/pleroma/settings.json`
- Create: `plugins/pleroma/hooks/hooks.json`
- Create: `plugins/pleroma/evals/suites/manifest.yaml`
- Create: `plugins/pleroma/evals/fixtures/`
- Create: `epi-cli/tests/pleroma_bundle.rs`

**Step 1: Write the failing test**

Add a full-bundle validation test that points at `plugins/pleroma` in the repo and expects a non-fixture bundle with real inventory counts.

**Step 2: Run test to verify it fails**

Run: `cargo test --test pleroma_bundle repo_pleroma_bundle_validates -- --exact --nocapture`
Expected: FAIL because the bundle does not exist.

**Step 3: Write minimal implementation**

Create the initial bundle skeleton with:

- canonical plugin metadata
- declared skill/agent/hook/eval directories
- no placeholder text
- runtime settings for local loading and explicit capability namespace

**Step 4: Run test to verify it passes**

Run: `cargo test --test pleroma_bundle repo_pleroma_bundle_validates -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add plugins/pleroma epi-cli/tests/pleroma_bundle.rs
git commit -m "feat: add real pleroma plugin bundle skeleton"
```

## Task 5: Port the Atomic Skills

**Files:**
- Create: `plugins/pleroma/skills/atomic/tmux/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/cmux/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/mprocs/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/worktrunk/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/ralph-tui/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/repl/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/notebooklm/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/chatlog-fetcher/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/youtube-transcript/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/gitbutler/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/technē-spawn/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/technē-relay/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/technē-list/SKILL.md`
- Create: `plugins/pleroma/skills/atomic/technē-close/SKILL.md`
- Test: `epi-cli/tests/pleroma_bundle.rs`

**Step 1: Write the failing test**

Add validation tests that assert:

- each skill has required frontmatter
- each referenced script/primitive exists
- each skill declares the correct target capability family in metadata

**Step 2: Run test to verify it fails**

Run: `cargo test --test pleroma_bundle atomic_skill_inventory_is_complete -- --exact --nocapture`
Expected: FAIL because the skill set is missing.

**Step 3: Write minimal implementation**

Port or author each atomic skill with:

- a clean frontmatter contract
- exact bounded invocation shape
- no fake wrapper language
- direct references to plugin-local scripts or substrate primitives

For `cmux`, `worktrunk`, `chatlog-fetcher`, and `youtube-transcript`, create fresh skills only after the parity matrix marks them `fresh-design`.

**Step 4: Run test to verify it passes**

Run: `cargo test --test pleroma_bundle atomic_skill_inventory_is_complete -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add plugins/pleroma/skills/atomic epi-cli/tests/pleroma_bundle.rs
git commit -m "feat: port pleroma atomic skills"
```

## Task 6: Port the Orchestration Skills and Topological Modes

**Files:**
- Create: `plugins/pleroma/skills/orchestration/vak-coordinate-frame/SKILL.md`
- Create: `plugins/pleroma/skills/orchestration/vak-evaluate/SKILL.md`
- Create: `plugins/pleroma/skills/orchestration/anima-orchestration/SKILL.md`
- Create: `plugins/pleroma/skills/orchestration/day-night-pass/SKILL.md`
- Create: `plugins/pleroma/skills/orchestration/ouroboros/SKILL.md`
- Create: `plugins/pleroma/skills/orchestration/klein-mode/SKILL.md`
- Create: `plugins/pleroma/evals/suites/topology-routing.yaml`
- Test: `epi-cli/tests/agent_evals.rs`

**Step 1: Write the failing test**

Add eval and validation tests that assert:

- `vak-evaluate` covers S4-0' through S4-5'
- `anima-orchestration` maps CF and CFP to real dispatch shapes
- `ouroboros` composes `ralph-tui`, `tmux`, and verification surfaces without replacing them
- `klein-mode` is explicit about inversion conditions and telemetry outputs

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_evals vak_routing_suite_runs -- --exact --nocapture`
Expected: FAIL because the orchestration skills and suites do not exist.

**Step 3: Write minimal implementation**

Port and refine the orchestration skills so they:

- preserve the intended VAK routing grammar
- use the new plugin-local atomic skills
- distinguish ported behavior from redesigned behavior
- emit machine-checkable coordinate outputs where appropriate

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_evals vak_routing_suite_runs -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add plugins/pleroma/skills/orchestration plugins/pleroma/evals/suites/topology-routing.yaml epi-cli/tests/agent_evals.rs
git commit -m "feat: port pleroma orchestration skills and topologies"
```

## Task 7: Port the Constitutional and Aletheia Subagents

**Files:**
- Create: `plugins/pleroma/agents/constitutional/nous.md`
- Create: `plugins/pleroma/agents/constitutional/logos.md`
- Create: `plugins/pleroma/agents/constitutional/eros.md`
- Create: `plugins/pleroma/agents/constitutional/mythos.md`
- Create: `plugins/pleroma/agents/constitutional/psyche.md`
- Create: `plugins/pleroma/agents/constitutional/sophia.md`
- Create: `plugins/pleroma/agents/aletheia/anansi.md`
- Create: `plugins/pleroma/agents/aletheia/janus.md`
- Create: `plugins/pleroma/agents/aletheia/moirai.md`
- Create: `plugins/pleroma/agents/aletheia/mercurius.md`
- Create: `plugins/pleroma/agents/aletheia/agora.md`
- Create: `plugins/pleroma/agents/aletheia/zeithoven.md`
- Create: `plugins/pleroma/agents/constitutional/techne-helper.md`
- Test: `epi-cli/tests/pleroma_bundle.rs`

**Step 1: Write the failing test**

Add validation tests for:

- unique agent names
- correct skill preload sets
- correct tool capability policies
- explicit separation between constitutional agents and helper substrate agents

**Step 2: Run test to verify it fails**

Run: `cargo test --test pleroma_bundle constitutional_agent_registry_is_complete -- --exact --nocapture`
Expected: FAIL because the agent set does not exist.

**Step 3: Write minimal implementation**

Create the agent markdown files with:

- frontmatter for `name`, `description`, `tools`, `model`, `permissionMode`, `skills`, `hooks`
- no hidden inheritance assumptions
- correct role-specific skill preloads
- explicit `techne-helper` boundary for tmux/cmux/workshop management

**Step 4: Run test to verify it passes**

Run: `cargo test --test pleroma_bundle constitutional_agent_registry_is_complete -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add plugins/pleroma/agents epi-cli/tests/pleroma_bundle.rs
git commit -m "feat: port pleroma constitutional and aletheia agents"
```

## Task 8: Add Runtime Hooks for Verification, Cleanup, and Discharge

**Files:**
- Modify: `plugins/pleroma/hooks/hooks.json`
- Create: `plugins/pleroma/hooks/scripts/preflight-validate.sh`
- Create: `plugins/pleroma/hooks/scripts/postflight-verify.sh`
- Create: `plugins/pleroma/hooks/scripts/subagent-discharge.sh`
- Create: `plugins/pleroma/hooks/scripts/worktree-cleanup.sh`
- Test: `epi-cli/tests/agent_hooks.rs`

**Step 1: Write the failing test**

Extend hook tests so they validate:

- preflight blocks invalid plugin/runtime state
- postflight can reject incomplete work
- subagent stop returns structured discharge metadata
- worktree cleanup exchanges real JSON on stdin/stdout

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_hooks pleroma_hooks_enforce_discharge_contract -- --exact --nocapture`
Expected: FAIL because the scripts and hook config do not exist.

**Step 3: Write minimal implementation**

Author real shell scripts that:

- read JSON fixtures from stdin
- call `epi agent` or `epi` runtime checks where needed
- emit structured JSON responses
- fail loudly and deterministically when invariants are not met

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_hooks pleroma_hooks_enforce_discharge_contract -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add plugins/pleroma/hooks epi-cli/tests/agent_hooks.rs
git commit -m "feat: add pleroma runtime hooks"
```

## Task 9: Implement Evaluation-First Validation for the Real Port

**Files:**
- Modify: `epi-cli/src/agent/evals.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Create: `plugins/pleroma/evals/suites/atomic-tools.yaml`
- Create: `plugins/pleroma/evals/suites/ouroboros.yaml`
- Create: `plugins/pleroma/evals/suites/klein.yaml`
- Create: `plugins/pleroma/evals/suites/discharge.yaml`
- Create: `plugins/pleroma/evals/fixtures/*.json`
- Test: `epi-cli/tests/agent_evals.rs`

**Step 1: Write the failing test**

Add eval-runner tests that execute the suites and assert per-case status plus summary counts.

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_evals -- --nocapture`
Expected: FAIL because the suites and runner behavior are incomplete.

**Step 3: Write minimal implementation**

Implement:

- `epi agent skills eval --suite <path>`
- plugin-root suite discovery
- fixture loading
- human-readable and JSON reports
- non-zero exit on failed cases

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_evals -- --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/evals.rs epi-cli/src/agent/mod.rs plugins/pleroma/evals epi-cli/tests/agent_evals.rs
git commit -m "feat: add pleroma eval suites and runner"
```

## Task 10: Wire Runtime Loading for Local and Installed Pleroma

**Files:**
- Modify: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/src/agent/plugins.rs`
- Modify: `epi-cli/src/agent/agent_dirs.rs`
- Modify: `epi-cli/tests/agent_spawn.rs`

**Step 1: Write the failing test**

Add spawn/run tests for:

- loading repo-local `plugins/pleroma`
- loading installed cached `pleroma`
- resolving hooks, agents, and eval suites from runtime index
- exporting plugin runtime state to PI for spawned agents and subagents

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_spawn runtime_loads_real_pleroma_bundle -- --exact --nocapture`
Expected: FAIL because the runtime does not yet treat the real bundle as a full executive plugin.

**Step 3: Write minimal implementation**

Implement:

- plugin preference order: explicit path -> repo local -> installed cache
- runtime index enrichment with agents/hooks/evals
- environment propagation for child agent execution

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_spawn runtime_loads_real_pleroma_bundle -- --exact --nocapture`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/spawn.rs epi-cli/src/agent/plugins.rs epi-cli/src/agent/agent_dirs.rs epi-cli/tests/agent_spawn.rs
git commit -m "feat: load real pleroma bundle at runtime"
```

## Task 11: Run the Full Verification Gate

**Files:**
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md`

**Step 1: Write the failing test**

Add a final verification checklist test or script that asserts all required bundle directories, suites, and hooks exist and that the named commands return success.

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_docs real_pleroma_port_checklist_complete -- --exact --nocapture`
Expected: FAIL until all prior tasks are complete.

**Step 3: Write minimal implementation**

Create a final verification script and checklist covering:

- plugin validation
- plugin install/list
- skill/agent/hook validation
- eval suites
- spawn with local and installed plugin
- hook test fixture execution

**Step 4: Run test to verify it passes**

Run:

```bash
cargo test --test agent_plugins --test agent_plugin_install --test agent_primitives --test pleroma_bundle --test agent_hooks --test agent_evals --test agent_spawn -- --nocapture
```

Expected: PASS.

Then run:

```bash
cargo run --bin epi -- agent plugin validate plugins/pleroma --json
cargo run --bin epi -- agent skills eval --suite plugins/pleroma/evals/suites/topology-routing.yaml
```

Expected: both commands succeed with no placeholder outputs.

**Step 5: Commit**

```bash
git add Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md epi-cli/tests/agent_docs.rs
git commit -m "chore: verify real pleroma port tranche"
```

## Execution Order Recommendation

1. Freeze the parity matrix before touching the real bundle.
2. Finish installed-plugin cache and eval discovery before authoring the real bundle.
3. Land the bounded primitive bridge before porting atomic skills.
4. Port atomic skills before orchestration skills.
5. Port orchestration skills before subagents and hooks.
6. Make eval suites block completion for every tranche.

## Non-Negotiable Review Checks

- No placeholder architecture text inside shipped skills, agents, hooks, or evals.
- No plugin-local pseudo-runtime that bypasses the Rust and `.pi` substrate.
- No claiming an item is a port when the parity matrix marks it `fresh-design`.
- No hidden dependency on old repo-global paths when a plugin-local path should exist.
- No mock hook execution, fake eval cases, or simulated external-tool success.
- No top-level plugin proliferation unless the matrix proves a capability should leave `pleroma`.
