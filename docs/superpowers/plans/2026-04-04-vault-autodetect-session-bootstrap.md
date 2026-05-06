# Vault Autodetect & Session Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the PI agent system work out-of-the-box for the user — vault autodetected from `.obsidian/` in repo root, `Idea/` content root resolved automatically, daily/NOW folder structures created on every session start without any manual `set-default` setup.

**Architecture:** Two-layer fix. Layer A (Rust CLI): `vault_name()` and `vault_root()` helpers in `vault/mod.rs` autodetect from env vars → `.obsidian/` → `Idea/` presence; `obsidian_cli()` injects `-v {vault_name}` automatically; `set-default` persists to `~/.epi-logos/env/base.env`. Layer B (Extensions): Khora `session_start` exports `EPI_VAULT_NAME` and `EPILOGOS_VAULT` into the process before any other hook fires; Chronos `session_start` removes the fatal early-return on `vault daily` failure so filesystem ops always run.

**Tech Stack:** Rust (`epi-cli/src/vault/mod.rs`), TypeScript (PI extensions), `make rust-test`, `epi agent extensions sync --agent main`

---

## File Map

| File | Change |
|------|--------|
| `epi-cli/src/vault/mod.rs` | Add `vault_name()`, fix `vault_root()`, inject `-v` in `obsidian_cli()`, `set-default` writes base.env |
| `epi-cli/tests/vault_commands.rs` | Tests for autodetection, `-v` injection, base.env write |
| `.pi/extensions/ta-onta/khora/extension.ts` | `session_start`: export `EPI_VAULT_NAME` + `EPILOGOS_VAULT` |
| `.pi/extensions/ta-onta/chronos/extension.ts` | `session_start`: remove early-return on `vault daily` failure |
| `epi-cli/tests/agent_extensions_ta_onta.rs` | Contract assertions for the new extension behaviour |

---

## Task 1: Add `vault_name()` to Rust CLI

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`

### What it does

`vault_name()` → `Option<String>`:
1. `EPI_VAULT_NAME` env var (set by user via base.env or `set-default`)
2. If `.obsidian/` exists in `repo_root()`, return `basename(repo_root())`
3. `None` (obsidian-cli will fail without vault; that failure is caught upstream)

- [ ] **Step 1: Write the failing test** in `epi-cli/tests/vault_commands.rs`

Add this test inside the file (after the existing tests):

```rust
#[test]
fn vault_daily_passes_vault_flag_when_epi_vault_name_set() {
    let env = env_with_fake_obsidian_cli()
        .with_env("EPI_VAULT_NAME", "MyVault");
    let _ = run_epi(["vault", "open", "SomeNote"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // obsidian-cli should receive: -v MyVault open SomeNote
    assert!(log.contains("-v"), "expected -v flag: {log}");
    assert!(log.contains("MyVault"), "expected vault name: {log}");
}

#[test]
fn vault_daily_passes_vault_flag_from_obsidian_dir_autodetect() {
    let base_env = env_with_fake_obsidian_cli();
    // Create .obsidian/ in repo_root to trigger autodetection
    std::fs::create_dir_all(base_env.repo_root.join(".obsidian")).unwrap();
    let env = base_env;
    let _ = run_epi(["vault", "open", "SomeNote"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // vault name should be basename of repo_root (the test dir name)
    assert!(log.contains("-v"), "expected -v flag from autodetect: {log}");
}

#[test]
fn vault_set_default_does_not_inject_vault_flag() {
    let env = env_with_fake_obsidian_cli()
        .with_env("EPI_VAULT_NAME", "MyVault");
    let _ = run_epi(["vault", "set-default", "OtherVault"].as_slice(), &env);
    let log = read_to_string(env.root.join("obsidian.log"));
    // set-default must NOT receive -v (it IS the vault config command)
    assert!(!log.contains("-v"), "set-default must not get -v injected: {log}");
    assert!(log.contains("set-default"), "log: {log}");
    assert!(log.contains("OtherVault"), "log: {log}");
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd epi-cli && cargo test vault_daily_passes_vault_flag -- --nocapture 2>&1 | tail -20
```
Expected: FAIL — `vault_name()` doesn't exist yet.

- [ ] **Step 3: Add `vault_name()` to `vault/mod.rs`**

In `epi-cli/src/vault/mod.rs`, add this function after `repo_root()`:

```rust
/// Resolve the Obsidian vault name for -v flag injection.
/// Priority: EPI_VAULT_NAME env var → .obsidian/ in repo_root → None
fn vault_name() -> Option<String> {
    if let Ok(name) = std::env::var("EPI_VAULT_NAME") {
        if !name.is_empty() {
            return Some(name);
        }
    }
    let repo = repo_root();
    if repo.join(".obsidian").exists() {
        if let Some(name) = repo.file_name().and_then(|n| n.to_str()) {
            return Some(name.to_string());
        }
    }
    None
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd epi-cli && cargo test vault_daily_passes_vault_flag vault_set_default -- --nocapture 2>&1 | tail -20
```
Expected: these tests still fail because `obsidian_cli()` doesn't inject `-v` yet — that's Task 2.

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/vault/mod.rs epi-cli/tests/vault_commands.rs
git commit -m "feat(vault): add vault_name() autodetection from EPI_VAULT_NAME and .obsidian/"
```

---

## Task 2: Fix `vault_root()` Autodetection

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`

### What it does

Current `vault_root()` falls back to `~/Documents/Epi-Logos/Idea` if `EPILOGOS_VAULT` is unset. New behaviour: also check `{repo_root}/Idea` before the hardcoded home fallback.

- [ ] **Step 1: Write the failing test** in `epi-cli/tests/vault_commands.rs`

```rust
#[test]
fn vault_root_autodetects_idea_in_repo_root() {
    let base_env = env_with_fake_obsidian_cli();
    // Create Idea/ in repo_root (no EPILOGOS_VAULT set)
    let idea_dir = base_env.repo_root.join("Idea");
    std::fs::create_dir_all(&idea_dir).unwrap();
    // Run day-init — it should write into repo_root/Idea, not ~/Documents/Epi-Logos/Idea
    let result = run_epi(
        ["vault", "day-init", "--now", "2026-04-04T10:00:00Z"].as_slice(),
        &base_env,
    );
    assert!(
        result.status.success(),
        "day-init failed: {}",
        result.stderr
    );
    assert!(
        idea_dir.join("Empty/Present/04-04-2026/daily-note.md").exists(),
        "daily-note must be in repo_root/Idea, got stdout: {}",
        result.stdout
    );
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd epi-cli && cargo test vault_root_autodetects_idea -- --nocapture 2>&1 | tail -20
```
Expected: FAIL — files created in wrong location (home fallback).

- [ ] **Step 3: Update `vault_root()` in `vault/mod.rs`**

Replace the existing `vault_root()` function:

```rust
fn vault_root() -> PathBuf {
    // 1. Explicit env var (base.env or test override)
    if let Ok(v) = std::env::var("EPILOGOS_VAULT") {
        let p = PathBuf::from(&v);
        if p.exists() {
            return p;
        }
    }
    // 2. {repo_root}/Idea if present (the canonical repo-as-vault layout)
    let repo = repo_root();
    let idea = repo.join("Idea");
    if idea.exists() {
        return idea;
    }
    // 3. Legacy home-based fallback
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Documents")
        .join("Epi-Logos")
        .join("Idea")
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd epi-cli && cargo test vault_root_autodetects_idea -- --nocapture 2>&1 | tail -20
```
Expected: PASS.

- [ ] **Step 5: Verify existing vault tests still pass**

```bash
cd epi-cli && cargo test template_and_day_now_commands_write_real_files now_init_creates_thinking flow_init pasu_set -- --nocapture 2>&1 | tail -30
```
Expected: all PASS (they set `EPILOGOS_VAULT` explicitly so autodetect is skipped).

- [ ] **Step 6: Commit**

```bash
git add epi-cli/src/vault/mod.rs epi-cli/tests/vault_commands.rs
git commit -m "feat(vault): vault_root() autodetects {repo_root}/Idea when EPILOGOS_VAULT not set"
```

---

## Task 3: Inject `-v vault_name` Into `obsidian_cli()`

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`

### What it does

`obsidian_cli()` automatically prepends `-v {vault_name}` to all calls **except** `set-default` and `print-default` (vault config commands that don't address note content). This is a single change point — all existing call sites get the fix for free.

- [ ] **Step 1: The tests from Task 1 still fail — confirm**

```bash
cd epi-cli && cargo test vault_daily_passes_vault_flag -- --nocapture 2>&1 | tail -10
```
Expected: FAIL.

- [ ] **Step 2: Modify `obsidian_cli()` in `vault/mod.rs`**

Replace the existing `obsidian_cli()` function:

```rust
/// Commands where vault injection would break the operation (they ARE vault config)
const VAULT_CONFIG_CMDS: &[&str] = &["set-default", "print-default", "open-vault"];

fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    let is_config_cmd = args
        .first()
        .map(|cmd| VAULT_CONFIG_CMDS.contains(cmd))
        .unwrap_or(false);

    let injected: Vec<String> = if !is_config_cmd {
        if let Some(name) = vault_name() {
            let mut v = vec!["-v".to_string(), name];
            v.extend(args.iter().map(|s| s.to_string()));
            v
        } else {
            args.iter().map(|s| s.to_string()).collect()
        }
    } else {
        args.iter().map(|s| s.to_string()).collect()
    };

    match Command::new("obsidian-cli").args(&injected).output() {
        Ok(out) if out.status.success() => Ok(String::from_utf8_lossy(&out.stdout).to_string()),
        Ok(out) => Err(String::from_utf8_lossy(&out.stderr).to_string()),
        Err(err) => Err(format!("Failed to execute obsidian-cli: {err}")),
    }
}
```

- [ ] **Step 3: Run all vault tests to verify**

```bash
cd epi-cli && cargo test --test vault_commands -- --nocapture 2>&1 | tail -30
```
Expected: `vault_daily_passes_vault_flag_when_epi_vault_name_set` → PASS, `vault_set_default_does_not_inject_vault_flag` → PASS, `vault_daily_passes_vault_flag_from_obsidian_dir_autodetect` → PASS, all existing tests → PASS.

Note: `obsidian_passthrough_commands_use_expected_args` checks exact log output for `open` and `frontmatter-delete`. With no `EPI_VAULT_NAME` set and no `.obsidian/` in test repo_root, `vault_name()` returns `None` and no injection happens — that test should still pass unchanged.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/vault/mod.rs
git commit -m "feat(vault): obsidian_cli() auto-injects -v vault_name, skips for config commands"
```

---

## Task 4: `set-default` Persists to `base.env`

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`
- Modify: `epi-cli/tests/vault_commands.rs`

### What it does

`epi vault set-default VaultName` writes `EPI_VAULT_NAME=VaultName` to `~/.epi-logos/env/base.env` AND calls `obsidian-cli set-default` (for Obsidian's own registry). Future sessions auto-load from base.env via `pre-session-init.sh`.

- [ ] **Step 1: Write the failing test** in `vault_commands.rs`

```rust
#[test]
fn set_default_writes_epi_vault_name_to_base_env() {
    let base_env = env_with_fake_obsidian_cli();
    let home = base_env.home.clone();
    let env = base_env.with_env("HOME", home.display().to_string());

    let result = run_epi(["vault", "set-default", "MyNewVault"].as_slice(), &env);
    assert!(
        result.status.success(),
        "set-default failed: {}",
        result.stderr
    );

    let base_env_path = home.join(".epi-logos/env/base.env");
    assert!(
        base_env_path.exists(),
        "base.env must be created at {}",
        base_env_path.display()
    );
    let content = std::fs::read_to_string(&base_env_path).unwrap();
    assert!(
        content.contains("EPI_VAULT_NAME=MyNewVault"),
        "base.env must contain EPI_VAULT_NAME=MyNewVault, got:\n{content}"
    );
}

#[test]
fn set_default_replaces_existing_epi_vault_name_in_base_env() {
    let base_env = env_with_fake_obsidian_cli();
    let home = base_env.home.clone();
    let env = base_env.with_env("HOME", home.display().to_string());

    // Pre-seed a base.env with an existing EPI_VAULT_NAME
    let base_env_dir = home.join(".epi-logos/env");
    std::fs::create_dir_all(&base_env_dir).unwrap();
    std::fs::write(
        base_env_dir.join("base.env"),
        "EPI_VAULT_NAME=OldVault\nSOME_OTHER_VAR=foo\n",
    ).unwrap();

    let _ = run_epi(["vault", "set-default", "UpdatedVault"].as_slice(), &env);
    let content = std::fs::read_to_string(base_env_dir.join("base.env")).unwrap();
    assert!(
        content.contains("EPI_VAULT_NAME=UpdatedVault"),
        "must update to new vault name: {content}"
    );
    assert!(
        !content.contains("EPI_VAULT_NAME=OldVault"),
        "must not keep old name: {content}"
    );
    assert!(
        content.contains("SOME_OTHER_VAR=foo"),
        "must preserve other vars: {content}"
    );
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd epi-cli && cargo test set_default_writes_epi_vault set_default_replaces -- --nocapture 2>&1 | tail -20
```
Expected: FAIL.

- [ ] **Step 3: Update `VaultCmd::SetDefault` dispatch in `vault/mod.rs`**

In the `dispatch()` function, replace the `VaultCmd::SetDefault` arm:

```rust
VaultCmd::SetDefault { vault_name } => {
    // 1. Persist EPI_VAULT_NAME to ~/.epi-logos/env/base.env
    let base_env_path = home_root().join(".epi-logos/env/base.env");
    if let Some(parent) = base_env_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("create base.env dir: {e}"))?;
    }
    let existing = if base_env_path.exists() {
        fs::read_to_string(&base_env_path)
            .map_err(|e| format!("read base.env: {e}"))?
    } else {
        String::new()
    };
    let filtered: String = existing
        .lines()
        .filter(|l| !l.starts_with("EPI_VAULT_NAME="))
        .collect::<Vec<_>>()
        .join("\n");
    let new_content = if filtered.is_empty() {
        format!("EPI_VAULT_NAME={vault_name}\n")
    } else {
        format!("{filtered}\nEPI_VAULT_NAME={vault_name}\n")
    };
    fs::write(&base_env_path, new_content)
        .map_err(|e| format!("write base.env: {e}"))?;

    // 2. Also register in Obsidian's own registry (non-fatal)
    let _ = obsidian_cli(&["set-default", vault_name.as_str()]);

    Ok(format!(
        "set-default: EPI_VAULT_NAME={vault_name} saved to {}",
        base_env_path.display()
    ))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd epi-cli && cargo test set_default_writes_epi_vault set_default_replaces -- --nocapture 2>&1 | tail -20
```
Expected: PASS.

- [ ] **Step 5: Run full vault test suite**

```bash
cd epi-cli && cargo test --test vault_commands -- --nocapture 2>&1 | tail -30
```
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add epi-cli/src/vault/mod.rs epi-cli/tests/vault_commands.rs
git commit -m "feat(vault): set-default persists EPI_VAULT_NAME to ~/.epi-logos/env/base.env"
```

---

## Task 5: Fix `chronos/extension.ts` Session Start

**Files:**
- Modify: `.pi/extensions/ta-onta/chronos/extension.ts`

### The bug

`session_start` calls `epi vault daily` and **returns early on failure**. This blocks `day-init` and `flow-init` — the filesystem operations that create the daily note and NOW folder. `vault daily` is a UI signal (opens Obsidian); filesystem ops must always run.

- [ ] **Step 1: Write the contract test** in `epi-cli/tests/agent_extensions_ta_onta.rs`

Add to the existing file:

```rust
#[test]
fn chronos_session_start_does_not_early_return_on_vault_daily_failure() {
    let root = repo_root();
    let source = fs::read_to_string(
        root.join(".pi/extensions/ta-onta/chronos/extension.ts")
    ).unwrap();

    // The early return pattern: `return;` immediately after the vault daily warn
    // New pattern: no return, just a warn, then day-init and flow-init run unconditionally
    let daily_fail_block: Vec<&str> = source
        .lines()
        .skip_while(|l| !l.contains("vault daily"))
        .take(10)
        .collect();
    let block_text = daily_fail_block.join("\n");

    assert!(
        !block_text.contains("return;"),
        "chronos session_start must not early-return after vault daily failure.\n\
         Block after vault daily:\n{block_text}"
    );
    assert!(
        source.contains("vault\", \"day-init"),
        "day-init must be called unconditionally"
    );
    assert!(
        source.contains("vault\", \"flow-init"),
        "flow-init must be called unconditionally"
    );
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd epi-cli && cargo test chronos_session_start_does_not_early_return -- --nocapture 2>&1 | tail -10
```
Expected: FAIL (`return;` is present).

- [ ] **Step 3: Fix the `session_start` handler in `chronos/extension.ts`**

Replace the `api.on("session_start", ...)` block at the bottom of `.pi/extensions/ta-onta/chronos/extension.ts`:

```typescript
  api.on("session_start", async () => {
    // `vault daily` opens today's daily note in Obsidian UI — non-fatal if vault not yet configured.
    // It MUST NOT block the filesystem operations below.
    const daily = spawnSync("epi", ["vault", "daily"], { encoding: "utf8" });
    if (daily.status !== 0) {
      console.warn(`[chronos] vault daily skipped: ${daily.stderr?.trim() || "no vault config"}`);
    }

    // Filesystem operations run unconditionally — they do not depend on Obsidian UI state.
    const dayInit = spawnSync("epi", ["vault", "day-init"], { encoding: "utf8" });
    if (dayInit.status !== 0) {
      console.warn(`[chronos] day-init skipped: ${dayInit.stderr?.trim()}`);
    }

    const flowInit = spawnSync("epi", ["vault", "flow-init"], { encoding: "utf8" });
    if (flowInit.status !== 0) {
      console.warn(`[chronos] flow-init skipped: ${flowInit.stderr?.trim()}`);
    }
  });
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd epi-cli && cargo test chronos_session_start_does_not_early_return -- --nocapture 2>&1 | tail -10
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .pi/extensions/ta-onta/chronos/extension.ts
git commit -m "fix(chronos): session_start no longer early-returns on vault daily failure — filesystem ops always run"
```

---

## Task 6: Khora `session_start` Exports Vault Env Vars

**Files:**
- Modify: `.pi/extensions/ta-onta/khora/extension.ts`

### What it does

Khora is the ground layer — it fires first on `session_start`. Before any other extension's hook runs, Khora detects and exports:
- `EPI_VAULT_NAME`: basename of `EPI_REPO_ROOT` if `.obsidian/` exists there (skipped if already set)
- `EPILOGOS_VAULT`: `{repo_root}/Idea` if that dir exists (skipped if already set)

This means Chronos (and all other extensions) inherit these vars automatically.

- [ ] **Step 1: Write the contract test** in `agent_extensions_ta_onta.rs`

```rust
#[test]
fn khora_session_start_exports_vault_env_vars() {
    let root = repo_root();
    let source = fs::read_to_string(
        root.join(".pi/extensions/ta-onta/khora/extension.ts")
    ).unwrap();

    // Must detect EPI_VAULT_NAME from .obsidian/
    assert!(
        source.contains("EPI_VAULT_NAME"),
        "khora session_start must set EPI_VAULT_NAME"
    );
    assert!(
        source.contains(".obsidian"),
        "khora must check for .obsidian dir for vault autodetection"
    );
    // Must detect EPILOGOS_VAULT from Idea/ in repo root
    assert!(
        source.contains("EPILOGOS_VAULT"),
        "khora session_start must set EPILOGOS_VAULT"
    );
    assert!(
        source.contains("\"Idea\"") || source.contains("join(repoRoot, \"Idea\")") || source.contains("join(repoRoot,\"Idea\")"),
        "khora must check for Idea/ dir for EPILOGOS_VAULT autodetection"
    );
    // Must guard: skip if already set (base.env may have set them)
    assert!(
        source.contains("process.env.EPI_VAULT_NAME"),
        "khora must guard EPI_VAULT_NAME assignment"
    );
    assert!(
        source.contains("process.env.EPILOGOS_VAULT"),
        "khora must guard EPILOGOS_VAULT assignment"
    );
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd epi-cli && cargo test khora_session_start_exports_vault -- --nocapture 2>&1 | tail -10
```
Expected: FAIL.

- [ ] **Step 3: Update `khora/extension.ts` `session_start` handler**

The current import line at the top already has `join` from `node:path`. Add `basename`:

```typescript
import { join, basename } from "node:path";
```

Replace the `api.on("session_start", ...)` block in `.pi/extensions/ta-onta/khora/extension.ts`:

```typescript
  api.on("session_start", async () => {
    // ── Vault autodetection (ground layer — must run before all other extensions) ──
    const repoRoot = process.env.EPI_REPO_ROOT || process.cwd();

    // 1. EPI_VAULT_NAME: resolve from .obsidian/ in repo root if not already set
    if (!process.env.EPI_VAULT_NAME) {
      if (existsSync(join(repoRoot, ".obsidian"))) {
        process.env.EPI_VAULT_NAME = basename(repoRoot);
      }
    }

    // 2. EPILOGOS_VAULT: resolve to {repo_root}/Idea if present and not already set
    if (!process.env.EPILOGOS_VAULT) {
      const ideaDir = join(repoRoot, "Idea");
      if (existsSync(ideaDir)) {
        process.env.EPILOGOS_VAULT = ideaDir;
      }
    }

    // ── Pre-session-init hook (varlock / base.env load) ────────────────────────
    const hookPath = new URL("./S0/pre-session-init.sh", import.meta.url).pathname;
    if (existsSync(hookPath)) {
      spawnSync("sh", [hookPath], { stdio: "inherit" });
    }

    // ── Obsidian breadcrumb: append [[NOW-{session}]] to daily Sessions heading ──
    if (_sessionId) {
      const breadcrumb = encodeURIComponent(`\n- [[NOW-${_sessionId}]]`);
      const vault = process.env.EPI_VAULT_NAME ?? "Idea";
      const uri = `obsidian://advanced-uri?vault=${encodeURIComponent(vault)}&daily=true&heading=Sessions&data=${breadcrumb}&mode=append`;
      spawnSync("open", [uri], { encoding: "utf8" });
    }
  });
```

Note: `existsSync` is already imported at the top of `khora/extension.ts`. `join` and `basename` are from `node:path`.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd epi-cli && cargo test khora_session_start_exports_vault -- --nocapture 2>&1 | tail -10
```
Expected: PASS.

- [ ] **Step 5: Run full ta-onta extension test suite**

```bash
cd epi-cli && cargo test --test agent_extensions_ta_onta -- --nocapture 2>&1 | tail -30
```
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add .pi/extensions/ta-onta/khora/extension.ts epi-cli/tests/agent_extensions_ta_onta.rs
git commit -m "feat(khora): session_start autodetects and exports EPI_VAULT_NAME + EPILOGOS_VAULT before other hooks fire"
```

---

## Task 7: Sync Extensions and Smoke Test

**Files:**
- `.epi/agents/main/agent/extensions/` (synced from `.pi/`)
- `.epi/agents/anima/agent/extensions/` (synced from `.pi/`)

### What it does

The `.pi/` directory is source. `.epi/agents/{agent}/agent/` is the deployed runtime. After source changes, run `epi agent extensions sync` to push changes to the deployed agent dir. Then verify the full session startup works.

- [ ] **Step 1: Run the full Rust test suite**

```bash
cd epi-cli && cargo test 2>&1 | tail -30
```
Expected: all tests PASS (or only pre-existing failures).

- [ ] **Step 2: Sync extensions to deployed agents**

```bash
epi agent extensions sync --agent main 2>&1
epi agent extensions sync --agent anima 2>&1
```
Expected: output reports files synced, no errors.

- [ ] **Step 3: Verify sync output**

```bash
epi agent extensions status --agent main 2>&1
```
Expected: shows `khora/extension.ts` and `chronos/extension.ts` with recent sync timestamps.

- [ ] **Step 4: Smoke test session start**

Start a PI session and confirm no error:

```bash
epi agent spawn --agent main
```

Watch the startup output. Expected:
- No `Extension ... error: session_start: vault daily failed` message
- `[chronos]` warnings about vault daily are tolerable (it's a `console.warn` now, not an error)
- `Idea/Empty/Present/{today's date}/daily-note.md` exists after startup
- `Idea/Empty/Present/{today's date}/FLOW.md` exists after startup

- [ ] **Step 5: Verify vault structure created**

```bash
ls "Idea/Empty/Present/$(date '+%d-%m-%Y')/"
```
Expected output includes `daily-note.md` and `FLOW.md`.

- [ ] **Step 6: Verify `EPI_VAULT_NAME` resolves correctly**

Inside a session, call `khora_session_status` tool. Expected output contains:
```
EPI_VAULT_NAME=Epi-Logos C Experiments
EPILOGOS_VAULT=/Users/admin/Documents/Epi-Logos C Experiments/Idea
```

- [ ] **Step 7: Final commit if any sync-only files changed**

```bash
git status
# If .epi/ files need committing:
git add .epi/agents/main/agent/extensions/ta-onta/khora/extension.ts
git add .epi/agents/main/agent/extensions/ta-onta/chronos/extension.ts
git add .epi/agents/anima/agent/extensions/ta-onta/khora/extension.ts
git add .epi/agents/anima/agent/extensions/ta-onta/chronos/extension.ts
git commit -m "chore(agents): sync khora+chronos extension fixes to deployed agent dirs"
```

---

## Self-Review

**Spec coverage:**
- [x] `vault_name()` autodetects from `EPI_VAULT_NAME` → `.obsidian/` → None → Task 1
- [x] `vault_root()` autodetects from `EPILOGOS_VAULT` → `{repo_root}/Idea` → home → Task 2
- [x] `-v vault_name` injected into all content-addressing obsidian-cli calls → Task 3
- [x] `set-default` writes `EPI_VAULT_NAME` to `base.env` → Task 4
- [x] Chronos session_start early-return removed → Task 5
- [x] Khora session_start exports vault env vars before other hooks → Task 6
- [x] Extensions synced and smoke tested → Task 7

**Type/signature consistency check:**
- `vault_name() -> Option<String>` used in `obsidian_cli()` only — consistent
- `vault_root() -> PathBuf` unchanged signature — all callers unaffected
- `home_root() -> PathBuf` already exists — used in Task 4 for base.env path
- `join` and `basename` from `node:path` — already partially imported in khora/extension.ts

**Ambiguity check:**
- `set-default` still calls `obsidian-cli set-default` for backwards compat with Obsidian's own registry — this call goes through `obsidian_cli()` but `set-default` is in `VAULT_CONFIG_CMDS` so no `-v` injection. Correct.
- Khora session_start order: vault env detection runs BEFORE `pre-session-init.sh` so base.env can override autodetection (base.env values win if already set via `varlock inject` — but the guards check `process.env.EPI_VAULT_NAME` which is set from base.env load in the hook — this means base.env would NOT win because the guard runs before the hook). **Fix:** move the hook call FIRST, then do the guard-based autodetection:

```typescript
  api.on("session_start", async () => {
    // 1. Load base.env FIRST so its values can override autodetection
    const hookPath = new URL("./S0/pre-session-init.sh", import.meta.url).pathname;
    if (existsSync(hookPath)) {
      spawnSync("sh", [hookPath], { stdio: "inherit" });
    }

    // 2. Autodetect only if not already set (by base.env or caller)
    const repoRoot = process.env.EPI_REPO_ROOT || process.cwd();
    if (!process.env.EPI_VAULT_NAME && existsSync(join(repoRoot, ".obsidian"))) {
      process.env.EPI_VAULT_NAME = basename(repoRoot);
    }
    if (!process.env.EPILOGOS_VAULT) {
      const ideaDir = join(repoRoot, "Idea");
      if (existsSync(ideaDir)) {
        process.env.EPILOGOS_VAULT = ideaDir;
      }
    }

    // 3. Breadcrumb
    if (_sessionId) {
      const breadcrumb = encodeURIComponent(`\n- [[NOW-${_sessionId}]]`);
      const vault = process.env.EPI_VAULT_NAME ?? "Idea";
      const uri = `obsidian://advanced-uri?vault=${encodeURIComponent(vault)}&daily=true&heading=Sessions&data=${breadcrumb}&mode=append`;
      spawnSync("open", [uri], { encoding: "utf8" });
    }
  });
```

**Update the Step 3 code in Task 6 to use this corrected ordering.** The contract test in Step 1 still passes (it only checks presence of key strings, not ordering).
