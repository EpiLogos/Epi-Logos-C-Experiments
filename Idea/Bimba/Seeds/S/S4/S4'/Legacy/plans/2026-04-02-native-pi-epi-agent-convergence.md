# Native PI Epi Agent Convergence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Execution Guardrails:** Also use superpowers:test-driven-development, superpowers:systematic-debugging, superpowers:verification-before-completion, and superpowers:requesting-code-review during implementation.

**Goal:** Make `epi agent` a true native-PI operator experience with Epi-Logos augmentations, while keeping `epi` as the control plane and enforcing canonical CLI-only vault access.

**Architecture:** Split the system into two planes. The operator plane must be native PI and native OmniPanel, with no fake replacement UIs. The control plane remains `epi`, responsible for session setup, repo-native extension sync, runtime metadata, gateway state, and vault/graph coordination. Interactive launches must hand the terminal to PI itself; only non-interactive gateway jobs and isolated verification runs may capture PI output programmatically.

**Tech Stack:** Rust CLI (`clap`, `std::process`, `tokio`), PI CLI, TypeScript PI extensions under `.pi/`, Electron/Vite OmniPanel, Obsidian CLI, Neo4j/Redis, Rust integration tests, Vitest/Playwright.

---

## Objective Findings

1. `epi agent chat` is a custom ratatui wrapper, not native PI.
   - Evidence: `epi-cli/src/agent/chat.rs`
   - Impact: the user gets a fake terminal UI instead of PI's real chat/settings/operator surface.

2. The current interactive launch path captures output instead of yielding the terminal to PI.
   - Evidence: `epi-cli/src/agent/spawn.rs` uses `Command::output()` through `invoke_pi(...)` for `spawn`, `attach`, and `run_pi`.
   - Impact: `epi agent spawn` and `epi agent run` are not true operator entrypoints.

3. The gateway depends on a non-interactive captured PI path and that must be preserved.
   - Evidence: `epi-cli/src/gate/server.rs` calls `agent::spawn::run_prompt(...)`.
   - Impact: the remediation must separate interactive launches from captured background/chat jobs; deleting all captured PI helpers would break gateway chat.

4. `epi agent` currently points PI at a different agent home than the canonical direct-PI path.
   - Evidence:
     - Canonical PI home exists at `/Users/admin/.pi/agent`
     - Managed Epi agent home exists at `/Users/admin/.epi/agents/main/agent`
     - `epi-cli/src/agent/spawn.rs` exports `PI_CODING_AGENT_DIR` and `EPI_AGENT_DIR` to the managed Epi path
   - Impact: even if PI built-ins still load, the operator is not entering the same PI environment they get from direct `pi`.

5. Vault contact is not canonical.
   - Evidence: `epi-cli/src/vault/mod.rs` tries `obsidian` before `obsidian-cli`.
   - Impact: `epi vault ...` can hit the GUI binary, hang, or bypass the intended CLI contract.

6. Several ta-onta extensions bypass the vault contract and/or call invalid commands.
   - Evidence:
     - Raw `obsidian` usage in `.pi/extensions/ta-onta/hen/extension.ts`, `.pi/extensions/ta-onta/chronos/extension.ts`, `.pi/extensions/ta-onta/anima/extension.ts`, `.pi/extensions/ta-onta/aletheia/extension.ts`
     - Invalid command references:
       - `epi vault sync-status` does not exist
       - `epi vault kairos-status` does not exist
       - `epi vault seed-read` does not exist
       - `epi vault now-path` does not exist
       - `epi graph query --coordinate ... --text ...` does not exist
       - `epi graph query --coordinate ... --json` is not the current CLI shape
       - `epi techne gnosis notebook --update ...` does not exist
       - `epi agent spawn --list|--continue|--remove` does not exist
   - Impact: the integrated PI path is not trustworthy until command parity is repaired.

7. Gateway/Electron is materially closer to the intended product than `epi agent chat`.
   - Evidence:
     - `epi gate status --json` returns a live gateway on `18794`
     - `Idea/Pratibimba/System/epi-app/main/main.ts`
     - `Idea/Pratibimba/System/epi-app/renderer/controllers/epi-claw/controllers.ts`
     - `epi-cli/tests/gate_electron_controller_compat.rs`
   - Impact: OmniPanel is already a real operator path; PI should match that level of product coherence.

8. Graph/Gnosis are service-gated, not absent.
   - Evidence: `epi graph doctor --json` reports real Neo4j/Redis/semantic-cache checks but current services are down.
   - Impact: the remediation plan must separate "broken integration contract" from "live service not running."

## Required File Actions

### Update

- `epi-cli/src/agent/mod.rs`
- `epi-cli/src/agent/spawn.rs`
- `epi-cli/src/agent/agent_dirs.rs`
- `epi-cli/src/agent/install.rs`
- `epi-cli/src/agent/doctor.rs`
- `epi-cli/src/main.rs`
- `epi-cli/src/vault/mod.rs`
- `.pi/extensions/ta-onta/hen/extension.ts`
- `.pi/extensions/ta-onta/chronos/extension.ts`
- `.pi/extensions/ta-onta/anima/extension.ts`
- `.pi/extensions/ta-onta/aletheia/extension.ts`
- `.pi/extensions/ta-onta/aletheia/modules/hen-integration.ts`
- `.pi/extensions/ta-onta/aletheia/modules/chronos-integration.ts`
- `epi-cli/tests/agent_spawn.rs`
- `epi-cli/tests/vault_commands.rs`
- `epi-cli/tests/agent_extensions_ta_onta.rs`
- `epi-cli/tests/common/mod.rs`

### Add

- `epi-cli/src/agent/runtime.rs`
- `epi-cli/tests/agent_native_pi_contract.rs`
- `epi-cli/tests/vault_cli_contact.rs`
- `epi-cli/tests/ta_onta_cli_contract.rs`
- `tools/e2e/pi-native-operator-smoke.sh`
- `tools/e2e/omnipanel-gateway-smoke.sh`
- `docs/dev/pi-operator-protocol.md`

### Delete

- The ratatui chat/event-loop implementation currently in `epi-cli/src/agent/chat.rs`
- The `obsidian` fallback branch in `epi-cli/src/vault/mod.rs`
- All raw `spawnSync("obsidian", ...)` branches in ta-onta extensions
- Invalid/stale extension command strings that no longer match the actual `epi` CLI

### Keep

- `agent::spawn::run_prompt(...)` as the non-interactive captured path used by the gateway
- `verify-runtime` as the isolated, captured smoke path
- Gateway/Electron parity tests already in `epi-cli/tests/gate_electron_controller_compat.rs`

## Contract Decisions

1. Native PI is the canonical operator interface.
   - `epi agent chat` must stop being a custom UI.
   - `epi agent spawn` must hand the terminal to PI.
   - `epi agent run` must be a true passthrough to PI, not a pseudo-shell.

2. `epi` remains the control plane, not the replacement UI.
   - Keep `doctor`, `install`, `extensions`, `session`, `models`, `auth`, `verify-runtime`.
   - Use those commands to prepare and inspect PI, not to impersonate it.

3. Vault contact must be CLI-only.
   - No runtime path may invoke GUI `obsidian`.
   - Lowest-level contact is `obsidian-cli`.
   - Higher-level ta-onta/vault semantics should route through `epi vault` where supported, otherwise through `obsidian-cli`.

4. Do not add fake CLI commands just to satisfy stale extension code.
   - Add only commands that are genuine operator primitives.
   - `epi vault now-path` is a legitimate helper and may be added.
   - `epi vault sync-status` should not be invented unless there is a real runtime status to expose.
   - `epi graph query --text` should not be faked; use or extend the real graph command surface.

5. Interactive operator launches and captured background launches are different products.
   - Interactive: PI owns stdin/stdout/stderr.
   - Background/captured: gateway jobs own stdout capture.

## Task 1: Freeze the Native PI Contract

**Files:**
- Create: `epi-cli/src/agent/runtime.rs`
- Create: `epi-cli/tests/agent_native_pi_contract.rs`
- Modify: `epi-cli/tests/common/mod.rs`
- Modify: `epi-cli/tests/agent_spawn.rs`

**Step 1: Write the failing test**

Create a pure planning layer so the tests do not need a real PTY. Add tests that assert:

```rust
assert_eq!(plan.launch_mode, PiLaunchMode::InteractiveInherit);
assert_eq!(plan.capture_output, false);
assert!(plan.args.contains(&"--no-extensions".to_string()));
assert!(plan.args.iter().any(|arg| arg.ends_with("extensions/epi-citta.ts")));
```

Add separate assertions for:

```rust
assert_eq!(prompt_plan.launch_mode, PiLaunchMode::CapturedPrompt);
assert_eq!(verify_plan.launch_mode, PiLaunchMode::IsolatedVerify);
```

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract --test agent_spawn -v`

Expected: FAIL because there is no `runtime.rs` planning layer and interactive commands still use the captured output path.

**Step 3: Write minimal implementation**

Create `epi-cli/src/agent/runtime.rs` with a planning contract:

```rust
pub enum PiLaunchMode {
    InteractiveInherit,
    CapturedPrompt,
    IsolatedVerify,
}

pub struct PiLaunchPlan {
    pub mode: PiLaunchMode,
    pub args: Vec<String>,
    pub agent_dir: std::path::PathBuf,
    pub prompts_dir: std::path::PathBuf,
    pub plugin_runtime_path: std::path::PathBuf,
}
```

Refactor `spawn.rs` to build plans through this module instead of mixing planning and process execution.

**Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract --test agent_spawn -v`

Expected: PASS

**Step 5: Commit**

```bash
git add epi-cli/src/agent/runtime.rs epi-cli/tests/agent_native_pi_contract.rs epi-cli/tests/common/mod.rs epi-cli/tests/agent_spawn.rs
git commit -m "test: freeze native pi agent launch contract"
```

## Task 2: Replace the Fake Chat UI with Native PI

**Files:**
- Delete: `epi-cli/src/agent/chat.rs`
- Create: `epi-cli/src/agent/launch.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Modify: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/src/main.rs`
- Test: `epi-cli/tests/agent_native_pi_contract.rs`

**Step 1: Write the failing test**

Add tests that assert `epi agent chat` and `epi agent spawn` both use the interactive PI path and do not attempt to render a custom TUI:

```rust
assert_eq!(chat_plan.mode, PiLaunchMode::InteractiveInherit);
assert_eq!(spawn_plan.mode, PiLaunchMode::InteractiveInherit);
```

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract -v`

Expected: FAIL because `chat.rs` still owns the ratatui event loop and `spawn()` still captures output.

**Step 3: Write minimal implementation**

Delete the ratatui wrapper and replace it with a thin native launcher:

```rust
pub fn launch_interactive(layout: &AgentLayout, args: &[String]) -> Result<String, String> {
    let status = configure_std_command(layout, args)
        .stdin(std::process::Stdio::inherit())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .status()
        .map_err(|err| format!("failed to launch pi: {err}"))?;

    if status.success() {
        Ok(String::new())
    } else {
        Err(format!("pi exited with status {status}"))
    }
}
```

Wire `AgentCmd::Chat` to this launcher as a compatibility alias. `AgentCmd::Spawn` should use the same interactive launcher. Keep `run_prompt()` captured for gateway jobs.

**Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract --test agent_spawn -v`

Expected: PASS

**Step 5: Commit**

```bash
git add epi-cli/src/agent/launch.rs epi-cli/src/agent/mod.rs epi-cli/src/agent/spawn.rs epi-cli/src/main.rs epi-cli/tests/agent_native_pi_contract.rs
git rm epi-cli/src/agent/chat.rs
git commit -m "feat: make epi agent use native pi for interactive launches"
```

## Task 3: Convert `epi agent` from Replacement-Home to Augmentation-Home

**Files:**
- Modify: `epi-cli/src/agent/agent_dirs.rs`
- Modify: `epi-cli/src/agent/install.rs`
- Modify: `epi-cli/src/agent/doctor.rs`
- Modify: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/tests/agent_native_pi_contract.rs`

**Step 1: Write the failing test**

Add tests that freeze the intended topology:

```rust
assert_eq!(canonical_pi_agent_dir(home), home.join(".pi/agent"));
assert_eq!(managed_epi_agent_dir(home, "main"), home.join(".epi/agents/main/agent"));
assert_eq!(interactive_plan.agent_dir, canonical_pi_agent_dir(home));
assert_ne!(verify_plan.agent_dir, canonical_pi_agent_dir(home));
```

Add doctor/install assertions for:

```rust
assert!(report.contains("\"canonicalPiAgentDir\":"));
assert!(report.contains("\"managedEpiAgentDir\":"));
assert!(report.contains("\"interactiveLaunchMode\": \"native-pi\""));
```

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract -v`

Expected: FAIL because the current code treats the managed Epi dir as PI's primary interactive home.

**Step 3: Write minimal implementation**

Refactor `AgentLayout` to resolve both:

```rust
pub canonical_pi_agent_dir: PathBuf,
pub managed_epi_agent_dir: PathBuf,
```

Rules:
- Interactive `chat` / `spawn` / `attach` / CLI `run` use the canonical PI home.
- Repo augmentations are passed through flags/env only.
- Managed Epi dir stores repo-managed runtime metadata, sync state, generated prompt assets, plugin runtime index, and verification artifacts.
- `verify-runtime` remains isolated under `.tmp-real-pi-verify/...`.

Update `install` and `doctor` output to describe augmentation-mode clearly instead of implying the managed Epi dir is "the agent."

**Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract -v`

Expected: PASS

**Step 5: Commit**

```bash
git add epi-cli/src/agent/agent_dirs.rs epi-cli/src/agent/install.rs epi-cli/src/agent/doctor.rs epi-cli/src/agent/spawn.rs epi-cli/tests/agent_native_pi_contract.rs
git commit -m "refactor: make epi agent an augmentation layer over native pi"
```

## Task 4: Make Vault Contact Canonical Through `obsidian-cli`

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`
- Modify: `epi-cli/tests/vault_commands.rs`
- Create: `epi-cli/tests/vault_cli_contact.rs`
- Modify: `epi-cli/tests/common/mod.rs`

**Step 1: Write the failing test**

Create tests that prove:

```rust
assert_eq!(selected_binary(), "obsidian-cli");
assert!(!log_contents.contains("obsidian\n"));
assert!(log_contents.contains("obsidian-cli\n"));
```

Update fake vault tests so only `obsidian-cli` is installed in the fake PATH.

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test vault_commands --test vault_cli_contact -v`

Expected: FAIL because `vault/mod.rs` still tries `obsidian` before `obsidian-cli`.

**Step 3: Write minimal implementation**

Replace the binary-selection logic with a single canonical CLI path:

```rust
fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    let out = Command::new("obsidian-cli").args(args).output()?;
    ...
}
```

If an override is genuinely needed later, add an explicit env/config key such as `EPILOGOS_OBSIDIAN_CLI_BIN`; do not silently fall back to GUI `obsidian`.

**Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test vault_commands --test vault_cli_contact -v`

Expected: PASS

**Step 5: Commit**

```bash
git add epi-cli/src/vault/mod.rs epi-cli/tests/vault_commands.rs epi-cli/tests/vault_cli_contact.rs epi-cli/tests/common/mod.rs
git commit -m "fix: enforce obsidian-cli as the canonical vault contact"
```

## Task 5: Reconcile Ta-Onta Extension Command Parity

**Files:**
- Modify: `.pi/extensions/ta-onta/hen/extension.ts`
- Modify: `.pi/extensions/ta-onta/chronos/extension.ts`
- Modify: `.pi/extensions/ta-onta/anima/extension.ts`
- Modify: `.pi/extensions/ta-onta/aletheia/extension.ts`
- Modify: `.pi/extensions/ta-onta/aletheia/modules/hen-integration.ts`
- Modify: `.pi/extensions/ta-onta/aletheia/modules/chronos-integration.ts`
- Modify: `epi-cli/src/vault/mod.rs`
- Create: `epi-cli/tests/ta_onta_cli_contract.rs`
- Modify: `epi-cli/tests/agent_extensions_ta_onta.rs`

**Step 1: Write the failing test**

Create a contract-parity test that scans the extension source for known-bad command strings:

```rust
assert!(!source.contains("spawnSync(\"obsidian\""));
assert!(!source.contains("vault\", \"sync-status\""));
assert!(!source.contains("vault\", \"kairos-status\""));
assert!(!source.contains("vault\", \"seed-read\""));
assert!(!source.contains("vault\", \"now-path\""));
assert!(!source.contains("\"graph\", \"query\", \"--coordinate\""));
assert!(!source.contains("\"agent\", \"spawn\", \"--list\""));
```

Freeze the intended resolution policy:
- Add `epi vault now-path` only if the helper is truly needed and matches existing path semantics.
- Do not add `vault sync-status` unless there is a real status implementation.
- Replace `kairos-status` with `vault kairos status`.
- Replace invalid graph flag usage with the actual graph command contract or a real retrieval command.
- Replace invalid `agent spawn --list|--continue|--remove` calls with existing agent/session/subagent surfaces or remove them.

**Step 2: Run test to verify it fails**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test ta_onta_cli_contract --test agent_extensions_ta_onta -v`

Expected: FAIL because the stale strings exist today.

**Step 3: Write minimal implementation**

Repair each extension one by one:

- `hen`
  - remove raw `obsidian`
  - use `epi vault ...` where the CLI already supports the behavior
  - if `now-path` is genuinely required, add it to Rust and test it

- `chronos`
  - remove raw `obsidian`
  - replace `seed-read` with a real primitive or remove the SEED injection branch until a real command exists

- `anima`
  - replace invalid graph query shapes
  - remove invalid `agent spawn` pseudo-subcommands

- `aletheia`
  - replace `vault sync-status` / `kairos-status`
  - replace raw vault writes through `obsidian`
  - align notebook operations with the actual `epi techne gnosis notebook` surface

**Step 4: Run test to verify it passes**

Run: `cargo test --manifest-path epi-cli/Cargo.toml --test ta_onta_cli_contract --test agent_extensions_ta_onta -v`

Expected: PASS

**Step 5: Commit**

```bash
git add .pi/extensions/ta-onta/hen/extension.ts .pi/extensions/ta-onta/chronos/extension.ts .pi/extensions/ta-onta/anima/extension.ts .pi/extensions/ta-onta/aletheia/extension.ts .pi/extensions/ta-onta/aletheia/modules/hen-integration.ts .pi/extensions/ta-onta/aletheia/modules/chronos-integration.ts epi-cli/src/vault/mod.rs epi-cli/tests/ta_onta_cli_contract.rs epi-cli/tests/agent_extensions_ta_onta.rs
git commit -m "fix: align ta-onta extension commands with the real cli contract"
```

## Task 6: Add Real Operator Smoke Flows

**Files:**
- Create: `tools/e2e/pi-native-operator-smoke.sh`
- Create: `tools/e2e/omnipanel-gateway-smoke.sh`
- Create: `docs/dev/pi-operator-protocol.md`
- Modify: `Makefile`

**Step 1: Write the failing test**

Write script-level dry-run checks first:

```bash
bash tools/e2e/pi-native-operator-smoke.sh --dry-run
bash tools/e2e/omnipanel-gateway-smoke.sh --dry-run
```

Expected dry-run output should enumerate:
- required binaries
- gateway/vault/graph preflight
- exact operator steps
- explicit pass/fail checkpoints

**Step 2: Run test to verify it fails**

Run:

```bash
bash tools/e2e/pi-native-operator-smoke.sh --dry-run
bash tools/e2e/omnipanel-gateway-smoke.sh --dry-run
```

Expected: FAIL because the scripts do not exist.

**Step 3: Write minimal implementation**

Add two blessed operator rituals:

1. `pi-native-operator-smoke.sh`
   - preflight `pi`, `obsidian-cli`, `epi agent doctor`, `epi graph doctor`
   - `epi agent session init`
   - `epi agent spawn --agent main`
   - operator checklist: inspect tools, create one vault artifact, write continuation, verify file outputs

2. `omnipanel-gateway-smoke.sh`
   - preflight `epi gate status --json`
   - ensure gateway is running
   - launch app or instruct `npm --prefix Idea/Pratibimba/System/epi-app run dev`
   - operator checklist for Overview, Chat, Sessions, Skills, Cron, Config, Logs, Debug

Document both flows in `docs/dev/pi-operator-protocol.md`.

**Step 4: Run test to verify it passes**

Run:

```bash
bash tools/e2e/pi-native-operator-smoke.sh --dry-run
bash tools/e2e/omnipanel-gateway-smoke.sh --dry-run
```

Expected: PASS

**Step 5: Commit**

```bash
git add tools/e2e/pi-native-operator-smoke.sh tools/e2e/omnipanel-gateway-smoke.sh docs/dev/pi-operator-protocol.md Makefile
git commit -m "docs: add blessed native pi and omnipanel operator smoke flows"
```

## Task 7: Run Integrated Verification and Close Drift

**Files:**
- Modify as needed from previous tasks
- Test:
  - `epi-cli/tests/agent_native_pi_contract.rs`
  - `epi-cli/tests/vault_cli_contact.rs`
  - `epi-cli/tests/ta_onta_cli_contract.rs`
  - `epi-cli/tests/gate_electron_controller_compat.rs`
  - `Idea/Pratibimba/System/epi-app/tests/main/gateway-parity.test.ts`

**Step 1: Write the failing checklist**

Create a final checklist in the PR/notes:

```text
[ ] `epi agent chat` no longer renders a custom TUI
[ ] `epi agent spawn` opens native PI
[ ] direct `pi` and `epi agent spawn` share the same operator experience
[ ] vault paths never invoke GUI `obsidian`
[ ] ta-onta extensions contain no invalid command strings
[ ] gateway Electron parity tests still pass
[ ] native PI operator smoke flow is documented and runnable
```

**Step 2: Run full verification**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test agent_native_pi_contract --test agent_spawn --test vault_commands --test vault_cli_contact --test ta_onta_cli_contract --test agent_extensions_ta_onta --test gate_electron_controller_compat -v
npm --prefix Idea/Pratibimba/System/epi-app run test -- gateway-parity
bash tools/e2e/pi-native-operator-smoke.sh --dry-run
bash tools/e2e/omnipanel-gateway-smoke.sh --dry-run
```

If the environment allows live verification, also run:

```bash
epi agent doctor --json
epi gate status --json
epi agent session init
epi agent spawn --agent main
```

**Step 3: Fix remaining drift**

Do not ship if any of the following remain true:
- `epi agent chat` still owns a separate UI
- any extension still shells to GUI `obsidian`
- any extension still references unsupported CLI commands
- `epi agent spawn` still captures output instead of yielding the terminal

**Step 4: Run full verification again**

Repeat the command block above until all checks pass.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: converge epi agent onto native pi operator experience"
```

## End-State Acceptance Criteria

1. Running `epi agent spawn --agent main` is materially the same operator experience as running `pi` directly, except with Epi-Logos augmentations loaded.
2. `epi agent chat` is either removed or behaves as a compatibility alias to native PI, never as a second custom UI.
3. `epi agent` is clearly a control plane around PI, not a parallel chat product.
4. Every vault touchpoint goes through CLI contact only; GUI `obsidian` is never invoked by runtime code.
5. Ta-onta extensions only reference real, test-covered command surfaces.
6. Gateway/Electron remains a first-class integrated operator path and its parity tests stay green.
7. The repo has two blessed manual smoke paths only:
   - native PI operator flow
   - OmniPanel gateway flow

## Non-Goals

- Do not rebuild PI's UI inside `epi`.
- Do not add placeholder CLI commands solely to satisfy stale extension code.
- Do not collapse gateway and PI into a single runtime just to avoid clear control-plane boundaries.
- Do not claim graph/Gnosis is broken if the only issue is missing live services.

## Immediate Execution Recommendation

Start with Tasks 1 through 4 in one branch before touching graph/Gnosis behavior:

1. Freeze the native PI contract.
2. Delete the fake chat wrapper and switch interactive launches to native PI.
3. Convert agent-home handling to augmentation mode.
4. Enforce `obsidian-cli` as the only vault binary.

Do not start extension repair before Tasks 1 through 4 are merged, or you will be fixing extension behavior against the wrong operator surface.
