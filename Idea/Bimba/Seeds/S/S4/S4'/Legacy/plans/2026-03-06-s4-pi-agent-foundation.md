# S4 PI Agent Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a repo-native S4' PI agent foundation inside the Epi-Logos C repo with multi-agent support, managed PI agent directories, ported PI ecosystem extensions, an `epi-citta` extension that routes through `epi-cli`, and future-facing `skills`, `commands`, and `hooks` surfaces.

**Architecture:** Rust remains the sovereign operational shell through `epi-cli`, while PI-native assets live in this repo as first-class runtime files under `.pi/`, `skills/`, `commands/`, and `hooks/`. The implementation must not reuse `epi-claw` runtime/state directly; instead it borrows structural patterns only, keeps its own managed agent directories, and makes the `epi` CLI the exclusive substrate for Epi-specific agent capability.

**Tech Stack:** Rust (`clap`, `color-eyre`), shell filesystem/process integration, PI agent runtime, repo-local TypeScript extension files loaded by PI, Markdown skill/command assets, JSON agent config/auth/model files, cargo tests plus CLI integration tests.

---

## Locked Decisions

- S4' is native to this repo, not a wrapper around `epi-claw`.
- Multi-agent support is required from day one.
- The repo must contain its own `.pi/`, `skills/`, `commands/`, and `hooks/` directories.
- PI ecosystem extensions copied from the `pi-vs-claude-code` lineage are allowed as local assets.
- The one extension that must be authored specifically for this repo is the `epi-citta` extension that exposes `epi-cli` as the agent’s core substrate.
- Provider/model/auth state must be managed cleanly for this repo’s PI agent directories and start with Kimi, MiniMax, and GLM.
- Do not introduce an OpenClaw-style app/runtime dependency tree just to get PI working here.

## Target File Layout

```text
epi-cli/
  src/agent/
    mod.rs
    agent_dirs.rs
    install.rs
    doctor.rs
    extensions.rs
    agents.rs
    models.rs
    auth.rs
    spawn.rs
  tests/
    agent_dirs.rs
    agent_install.rs
    agent_extensions.rs
    agent_agents.rs
    agent_models.rs
    agent_auth.rs
    agent_spawn.rs

.pi/
  composite-entry.ts
  extensions/
    epi-citta.ts
    cross-agent.ts
    subagent-widget.ts
    agent-team.ts
    agent-chain.ts
    child-extension-propagation.ts
    prompt-url-widget.ts
    redraws.ts
    themeMap.ts
  prompts/
    epi-system.md
    epi-agent-help.md
  agents/
    teams.yaml
    agent-chain.yaml

skills/
  README.md
  epi-cli/
    SKILL.md
  graph/
    SKILL.md
  vault/
    SKILL.md

commands/
  README.md
  model-status.md
  graph-context.md
  core-verify.md

hooks/
  README.md
  manifest.json
  pre-agent-run.sh
  post-agent-run.sh
  pre-epi-command.sh
  post-epi-command.sh
```

## Testing Rules

- Prefer real filesystem/process tests over mocks.
- For `epi-cli` integration, use temp directories plus real spawned helper binaries/scripts written during the test run.
- Do not assert only on function return values; assert on files written, argv captured, environment propagated, and command output.
- Keep live PI/provider probes behind explicit env flags, but local integration coverage must still be real and end-to-end.

### Task 1: Create the repo-native S4' filesystem scaffold

**Files:**
- Create: `.pi/composite-entry.ts`
- Create: `.pi/prompts/epi-system.md`
- Create: `.pi/prompts/epi-agent-help.md`
- Create: `.pi/agents/teams.yaml`
- Create: `.pi/agents/agent-chain.yaml`
- Create: `skills/README.md`
- Create: `commands/README.md`
- Create: `hooks/README.md`
- Create: `hooks/manifest.json`

**Step 1: Write the failing test**

Create `epi-cli/tests/agent_dirs.rs` with a test that runs `epi agent doctor --json` against an empty temp home and expects missing scaffold entries to be reported.

```rust
#[test]
fn doctor_reports_missing_repo_pi_assets() {
    let result = run_epi(["agent", "doctor", "--json"], TestEnv::empty());
    assert!(result.stdout.contains("\"missingRepoAssets\""));
    assert!(result.stdout.contains(".pi/composite-entry.ts"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_dirs doctor_reports_missing_repo_pi_assets -- --exact --nocapture`
Expected: FAIL because `epi agent doctor` and the scaffold files do not exist yet.

**Step 3: Write minimal implementation**

- Add the scaffold files with placeholder-but-valid content.
- Implement enough `epi agent doctor` structure to enumerate required repo assets.

```ts
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export async function main(_api: ExtensionAPI) {
  await import("./extensions/epi-citta.ts");
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_dirs doctor_reports_missing_repo_pi_assets -- --exact --nocapture`
Expected: PASS with JSON including the scaffold inventory.

**Step 5: Commit**

```bash
git add .pi skills commands hooks epi-cli/tests/agent_dirs.rs epi-cli/src/agent
git commit -m "feat: scaffold repo-native s4 pi asset tree"
```

### Task 2: Add managed PI agent directory resolution with multi-agent support

**Files:**
- Create: `epi-cli/src/agent/agent_dirs.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_dirs.rs`

**Step 1: Write the failing test**

Add tests for:
- default agent dir resolution
- explicit `--agent <id>`
- env override support
- repo-local metadata layout for multiple agents

```rust
#[test]
fn resolves_named_agent_dir_under_epi_home() {
    let layout = AgentLayout::resolve(TestEnv::with_home("/tmp/home"), Some("anima")).unwrap();
    assert!(layout.agent_dir.ends_with("/.epi/agents/anima/agent"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_dirs resolves_named_agent_dir_under_epi_home -- --exact --nocapture`
Expected: FAIL because `AgentLayout` does not exist.

**Step 3: Write minimal implementation**

- Define a single resolver for:
  - repo asset root
  - EPI home
  - per-agent directories
  - `models.json`
  - `auth-profiles.json`
  - extension sync target
- Support:
  - `EPI_AGENT_HOME`
  - `EPI_AGENT_DIR`
  - `PI_CODING_AGENT_DIR`
  - `--agent <id>`

```rust
pub struct AgentLayout {
    pub agent_id: String,
    pub agent_dir: PathBuf,
    pub models_path: PathBuf,
    pub auth_profiles_path: PathBuf,
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_dirs -- --nocapture`
Expected: PASS for all agent-dir layout cases.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/agent_dirs.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_dirs.rs
git commit -m "feat: add managed multi-agent directory layout"
```

### Task 3: Implement `epi agent install` and `epi agent doctor`

**Files:**
- Create: `epi-cli/src/agent/install.rs`
- Create: `epi-cli/src/agent/doctor.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_install.rs`

**Step 1: Write the failing test**

Add tests that:
- verify `install` fails clearly when `pi` is absent
- verify `doctor` reports binary/config/extensions status
- verify `install --json` emits actionable machine-readable output

```rust
#[test]
fn install_reports_missing_pi_binary_or_installer() {
    let out = run_epi(["agent", "install", "--json"], TestEnv::empty());
    assert!(out.stdout.contains("\"status\":\"missing-prerequisite\""));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_install install_reports_missing_pi_binary_or_installer -- --exact --nocapture`
Expected: FAIL because these subcommands do not exist.

**Step 3: Write minimal implementation**

- `doctor` should report:
  - repo assets present/missing
  - `pi` binary present/missing
  - per-agent dir existence
  - config files present/missing
  - extension sync status
- `install` should:
  - create the agent dir structure
  - avoid mutating external repos
  - stop short of hidden network magic if `pi` is absent, returning a clear next action

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_install -- --nocapture`
Expected: PASS with no network access required.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/install.rs epi-cli/src/agent/doctor.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_install.rs
git commit -m "feat: add pi install and doctor flows"
```

### Task 4: Implement extension sync from repo `.pi` into managed agent dirs

**Files:**
- Create: `epi-cli/src/agent/extensions.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_extensions.rs`

**Step 1: Write the failing test**

Test `epi agent extensions sync --agent anima` by writing repo `.pi` assets into a temp repo root and asserting they are copied into the managed target dir.

```rust
#[test]
fn sync_copies_repo_pi_assets_into_agent_dir() {
    let out = run_epi(["agent", "extensions", "sync", "--agent", "anima"], TestEnv::repo_with_pi());
    assert!(out.status.success());
    assert_file_contains(".epi/agents/anima/agent/extensions/epi-citta.ts", "registerTool");
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_extensions sync_copies_repo_pi_assets_into_agent_dir -- --exact --nocapture`
Expected: FAIL because `extensions sync` does not exist.

**Step 3: Write minimal implementation**

- Add:
  - `epi agent extensions sync`
  - `epi agent extensions status`
  - `epi agent extensions list`
- Sync only from this repo’s `.pi`, never from `epi-claw`.
- Preserve directory structure.
- Hash or timestamp the synced tree so `doctor` can detect drift.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_extensions -- --nocapture`
Expected: PASS with real file copies.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/extensions.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_extensions.rs .pi
git commit -m "feat: sync repo pi assets into managed agent dirs"
```

### Task 5: Port the baseline PI ecosystem extensions into `.pi/extensions`

**Files:**
- Create: `.pi/extensions/cross-agent.ts`
- Create: `.pi/extensions/subagent-widget.ts`
- Create: `.pi/extensions/agent-team.ts`
- Create: `.pi/extensions/agent-chain.ts`
- Create: `.pi/extensions/child-extension-propagation.ts`
- Create: `.pi/extensions/prompt-url-widget.ts`
- Create: `.pi/extensions/redraws.ts`
- Create: `.pi/extensions/themeMap.ts`
- Modify: `.pi/composite-entry.ts`
- Test: `epi-cli/tests/agent_extensions.rs`

**Step 1: Write the failing test**

Add a sync test that asserts the composite entry references the curated extension set and the synced files all exist.

```rust
#[test]
fn sync_includes_curated_pi_extension_set() {
    let out = run_epi(["agent", "extensions", "sync"], TestEnv::repo_with_pi());
    assert!(out.status.success());
    assert_synced_file(".pi/extensions/subagent-widget.ts");
    assert_synced_file(".pi/extensions/cross-agent.ts");
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_extensions sync_includes_curated_pi_extension_set -- --exact --nocapture`
Expected: FAIL because the extension files are missing.

**Step 3: Write minimal implementation**

- Copy the selected upstream extension files into this repo.
- Normalize import paths to this repo’s `.pi` tree.
- Keep provenance notes in comments or companion markdown, but do not reference external repos at runtime.
- Do not port any OpenClaw runtime coupling.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_extensions -- --nocapture`
Expected: PASS with the curated extension set present.

**Step 5: Commit**

```bash
git add .pi/extensions .pi/composite-entry.ts epi-cli/tests/agent_extensions.rs
git commit -m "feat: add curated pi ecosystem extensions"
```

### Task 6: Author the `epi-citta` extension around `epi-cli`

**Files:**
- Create: `.pi/extensions/epi-citta.ts`
- Modify: `.pi/composite-entry.ts`
- Test: `epi-cli/tests/agent_spawn.rs`

**Step 1: Write the failing test**

Add a spawn integration test that launches PI against a fake `pi` executable and asserts the extension arguments include `epi-citta.ts`.

```rust
#[test]
fn spawn_includes_epi_citta_extension() {
    let out = run_epi(["agent", "spawn", "--agent", "anima", "hello"], TestEnv::with_fake_pi());
    assert!(captured_argv().contains(&".pi/extensions/epi-citta.ts".to_string()));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_spawn spawn_includes_epi_citta_extension -- --exact --nocapture`
Expected: FAIL because neither spawn wiring nor the extension exists.

**Step 3: Write minimal implementation**

- Register PI commands/tools that execute `epi` subcommands, not arbitrary repo internals.
- Start with bounded, high-value routes:
  - `epi_core_inspect`
  - `epi_core_verify`
  - `epi_vault_read`
  - `epi_graph_query`
  - `epi_agent_help`
- Include preview-first behavior for destructive or provisional operations.
- Load `epi-system.md` into session startup context.

```ts
pi.registerTool({
  name: "epi_core_verify",
  description: "Verify a coordinate via epi core verify",
  parameters: Type.Object({ coordinate: Type.String() }),
  async execute(_id, params, _signal, _onUpdate, ctx) {
    return runEpi(["core", "verify", params.coordinate], ctx.cwd);
  },
});
```

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_spawn spawn_includes_epi_citta_extension -- --exact --nocapture`
Expected: PASS with captured argv proving the extension is loaded.

**Step 5: Commit**

```bash
git add .pi/extensions/epi-citta.ts .pi/prompts/epi-system.md .pi/composite-entry.ts epi-cli/tests/agent_spawn.rs
git commit -m "feat: add epi-citta pi extension"
```

### Task 7: Add multi-agent management commands in `epi agent`

**Files:**
- Create: `epi-cli/src/agent/agents.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_agents.rs`

**Step 1: Write the failing test**

Add tests for:
- `epi agent agents init`
- `epi agent agents add anima`
- `epi agent agents list --json`
- `epi agent agents inspect anima`

```rust
#[test]
fn add_agent_creates_isolated_layout() {
    let out = run_epi(["agent", "agents", "add", "anima"], TestEnv::empty());
    assert!(out.status.success());
    assert!(path_exists(".epi/agents/anima/agent/models.json"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_agents add_agent_creates_isolated_layout -- --exact --nocapture`
Expected: FAIL because the subcommand does not exist.

**Step 3: Write minimal implementation**

- Implement:
  - `epi agent agents init`
  - `epi agent agents add <id>`
  - `epi agent agents list`
  - `epi agent agents inspect <id>`
- Persist agent metadata in a repo-specific registry file under EPI home.
- Ensure each agent gets isolated config/auth/models/extensions state.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_agents -- --nocapture`
Expected: PASS with real directories/files created.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/agents.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_agents.rs
git commit -m "feat: add multi-agent management commands"
```

### Task 8: Add provider/model registry management for Kimi, MiniMax, and GLM

**Files:**
- Create: `epi-cli/src/agent/models.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_models.rs`

**Step 1: Write the failing test**

Add tests for:
- `epi agent models init`
- `epi agent models add-provider kimi`
- `epi agent models add-provider minimax`
- `epi agent models add-provider glm`
- `epi agent models set-default <provider/model>`
- `epi agent models status --json`

```rust
#[test]
fn add_provider_writes_models_json_for_glm() {
    let out = run_epi(["agent", "models", "add-provider", "glm"], TestEnv::empty());
    assert!(out.status.success());
    assert_file_contains(".epi/agents/main/agent/models.json", "\"zai\"");
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_models add_provider_writes_models_json_for_glm -- --exact --nocapture`
Expected: FAIL because the models subcommands do not exist.

**Step 3: Write minimal implementation**

- Use a data-driven provider registry.
- Seed first-class definitions for:
  - Moonshot/Kimi
  - MiniMax
  - ZAI/GLM
- Write real `models.json` files per agent.
- Support provider aliases and a single default model per agent.
- Keep the file format PI-compatible so future PI-native features can consume it directly.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_models -- --nocapture`
Expected: PASS with correct JSON content and defaults.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/models.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_models.rs
git commit -m "feat: add managed provider and model registry"
```

### Task 9: Add auth profile management for Kimi, MiniMax, and GLM

**Files:**
- Create: `epi-cli/src/agent/auth.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_auth.rs`

**Step 1: Write the failing test**

Add tests for:
- `epi agent auth set kimi --api-key test-key`
- `epi agent auth set minimax --api-key test-key`
- `epi agent auth set glm --api-key test-key`
- `epi agent auth status --json`

```rust
#[test]
fn auth_set_writes_provider_profile_for_minimax() {
    let out = run_epi(["agent", "auth", "set", "minimax", "--api-key", "secret"], TestEnv::empty());
    assert!(out.status.success());
    assert_file_contains(".epi/agents/main/agent/auth-profiles.json", "\"minimax:default\"");
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_auth auth_set_writes_provider_profile_for_minimax -- --exact --nocapture`
Expected: FAIL because the auth subcommands do not exist.

**Step 3: Write minimal implementation**

- Write PI-compatible `auth-profiles.json`.
- Support per-agent auth storage.
- Redact secrets in CLI output.
- Add `status` output that shows configured providers and active default model.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_auth -- --nocapture`
Expected: PASS with real auth profile files written.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/auth.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_auth.rs
git commit -m "feat: add managed provider auth profiles"
```

### Task 10: Implement managed `spawn`/`run` PI launches with agent-aware env propagation

**Files:**
- Create: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Test: `epi-cli/tests/agent_spawn.rs`

**Step 1: Write the failing test**

Add tests that verify:
- `PI_CODING_AGENT_DIR` points at the selected agent dir
- synced extensions are passed to PI
- prompt templates are loaded from the repo `.pi/prompts`

```rust
#[test]
fn spawn_exports_selected_agent_dir_to_pi() {
    let out = run_epi(["agent", "spawn", "--agent", "anima", "hello"], TestEnv::with_fake_pi());
    assert!(fake_pi_env().contains(("PI_CODING_AGENT_DIR", "/tmp/.../anima/agent")));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_spawn spawn_exports_selected_agent_dir_to_pi -- --exact --nocapture`
Expected: FAIL because spawn is still a raw passthrough.

**Step 3: Write minimal implementation**

- Ensure `spawn`, `attach`, and `run` resolve the selected agent layout.
- Export:
  - `PI_CODING_AGENT_DIR`
  - `EPI_AGENT_DIR`
  - repo-local prompt template path
- Auto-load the composite extension entry.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_spawn -- --nocapture`
Expected: PASS with captured env and argv.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/spawn.rs epi-cli/src/agent/mod.rs epi-cli/tests/agent_spawn.rs
git commit -m "feat: launch pi with managed agent env and extensions"
```

### Task 11: Scaffold repo-local `skills`, `commands`, and `hooks` for future growth

**Files:**
- Create: `skills/epi-cli/SKILL.md`
- Create: `skills/graph/SKILL.md`
- Create: `skills/vault/SKILL.md`
- Create: `commands/model-status.md`
- Create: `commands/graph-context.md`
- Create: `commands/core-verify.md`
- Create: `hooks/pre-agent-run.sh`
- Create: `hooks/post-agent-run.sh`
- Create: `hooks/pre-epi-command.sh`
- Create: `hooks/post-epi-command.sh`
- Modify: `hooks/manifest.json`
- Test: `epi-cli/tests/agent_extensions.rs`

**Step 1: Write the failing test**

Add a doctor/sync test that asserts these surfaces are detected and copied or reported correctly.

```rust
#[test]
fn doctor_reports_skill_command_hook_surfaces() {
    let out = run_epi(["agent", "doctor", "--json"], TestEnv::repo_with_assets());
    assert!(out.stdout.contains("\"skills\""));
    assert!(out.stdout.contains("\"commands\""));
    assert!(out.stdout.contains("\"hooks\""));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_extensions doctor_reports_skill_command_hook_surfaces -- --exact --nocapture`
Expected: FAIL because these surfaces are not yet part of the doctor inventory.

**Step 3: Write minimal implementation**

- Add minimal but valid assets.
- Do not overdesign the behavior yet.
- The goal is to establish stable places in the repo and in the agent lifecycle for future skill/command/hook evolution.

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_extensions doctor_reports_skill_command_hook_surfaces -- --exact --nocapture`
Expected: PASS with surfaced asset inventory.

**Step 5: Commit**

```bash
git add skills commands hooks epi-cli/tests/agent_extensions.rs epi-cli/src/agent
git commit -m "feat: scaffold future skill command and hook surfaces"
```

### Task 12: Study `epi-claw` skill/command/hook patterns and define the Epi-Logos variant

**Files:**
- Create: `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-06-epi-skills-system-design.md`
- Reference: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/skills`
- Reference: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/commands`
- Reference: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/hooks`

**Step 1: Write the failing test**

Write a design-checklist test in markdown form inside the design doc. The checklist must define:
- required local metadata
- discovery rules
- execution rules
- inheritance boundaries
- how skills/commands/hooks interact with multi-agent layouts

```md
- [ ] Skill discovery works from repo-local assets before agent-local overrides
- [ ] Commands remain text assets, not Rust feature creep
- [ ] Hooks stay explicit and observable
```

**Step 2: Run review to verify gaps exist**

Run: `rg -n "skills|commands|hooks" docs/plans .pi skills commands hooks`
Expected: Missing or incomplete design guidance for the Epi-Logos-specific system.

**Step 3: Write minimal implementation**

Create a dedicated design document that answers:
- what should be copied from `epi-claw`
- what should stay repo-local only
- what should remain PI-facing versus Rust-facing
- how skills/commands/hooks should be surfaced to multiple agents safely

**Step 4: Run review to verify completeness**

Run: `rg -n "discovery|override|multi-agent|hook|command|skill" Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-06-epi-skills-system-design.md`
Expected: Matches for every core design axis.

**Step 5: Commit**

```bash
git add Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-06-epi-skills-system-design.md
git commit -m "docs: define epi-logos skill command and hook system"
```

## Full Verification Gate

Run these before claiming the foundation is complete:

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli
cargo fmt --check
cargo check
cargo test -- --nocapture
```

Run these manual CLI probes with a temp home:

```bash
HOME="$(mktemp -d)" cargo run -- agent doctor --json
HOME="$(mktemp -d)" cargo run -- agent agents add anima
HOME="$(mktemp -d)" cargo run -- agent models add-provider kimi
HOME="$(mktemp -d)" cargo run -- agent auth set glm --api-key test-key
HOME="$(mktemp -d)" cargo run -- agent extensions sync
```

Expected:

- JSON output is well-formed
- per-agent layouts are created under the managed EPI home
- `models.json` and `auth-profiles.json` are written correctly
- `.pi` assets sync from this repo only
- spawn/run exports the correct agent env

## Notes For Execution

- Do not pull runtime code from `epi-claw`; only borrow patterns and selected asset content.
- Keep provider/model support tightly scoped to Kimi, MiniMax, and GLM in the first pass.
- Avoid speculative platform work. No Bun workspace unless the extension/test burden proves it necessary.
- Keep `epi-citta` small and command-first. It is the unique architectural nucleus.
- Use TDD strictly for every Rust command and filesystem/process behavior.

Plan complete and saved to `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-06-s4-pi-agent-foundation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
