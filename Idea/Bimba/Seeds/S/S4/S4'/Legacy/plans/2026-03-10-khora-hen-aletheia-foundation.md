# Khora Hen Aletheia Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the production-ready foundational surface for Khora session lifecycle, Hen vault/day-now/template operations, and Aletheia gnosis scaffolding in `epi-cli` and `.pi/extensions/ta-onta/`.

**Architecture:** Keep the implementation inside existing Rust domains instead of introducing a new orchestration layer. Add small reusable support modules for environment/session/template/path logic, route new CLI commands through existing `agent`, `vault`, `book`, and `techne` namespaces, and keep Aletheia limited to service lifecycle, status, and ingestion/query scaffolding that does not require rewriting existing S2 graph work.

**Tech Stack:** Rust (`clap`, `chrono`, `serde_yaml`, `reqwest`, `tokio`), shell hook scripts, markdown/template files, docker compose.

---

### Task 1: Khora Session Domain Model

**Files:**
- Create: `epi-cli/src/sesh/session.rs`
- Modify: `epi-cli/src/sesh/mod.rs`
- Test: `epi-cli/tests/session_lifecycle.rs`

**Step 1: Write the failing test**

Add tests that assert:
- session IDs match `{YYYYMMDD}-{HHmmss}-{random6}`
- `day_id` is `DD-MM-YYYY`
- bootstrap read order is `CONTINUATION.md`, `ANIMA.md`, `PARADIGM.md`, `MEMORY.md`, `NOW.md`, `TOOLS.md`
- `status` payload includes session identity and elapsed duration

**Step 2: Run test to verify it fails**

Run: `cargo test --test session_lifecycle`
Expected: FAIL because `sesh::session` helpers and new command surface do not exist yet.

**Step 3: Write minimal implementation**

Implement:
- `SessionContext` and `BootstrapArtifact` structs
- session ID generator
- day/session env derivation
- bootstrap file path discovery rooted at the workspace or vault NOW path
- elapsed time/status formatting helpers

**Step 4: Run test to verify it passes**

Run: `cargo test --test session_lifecycle`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/sesh/session.rs epi-cli/src/sesh/mod.rs epi-cli/tests/session_lifecycle.rs
git commit -m "feat: add khora session domain helpers"
```

### Task 2: Khora Agent Session Commands

**Files:**
- Modify: `epi-cli/src/agent/mod.rs`
- Create: `epi-cli/src/agent/session.rs`
- Modify: `epi-cli/src/main.rs`
- Test: `epi-cli/tests/agent_session_commands.rs`

**Step 1: Write the failing test**

Add tests that exercise:
- `epi agent session init`
- `epi agent session status`
- `epi agent session continuation`
- `epi agent session close`

Assert that init writes/returns `EPI_SESSION_ID`, `EPI_DAY_ID`, and `EPI_NOW_PATH`; continuation writes `CONTINUATION.md`; close reports executed hooks and archive target.

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_session_commands`
Expected: FAIL because `AgentCmd::Session` does not exist.

**Step 3: Write minimal implementation**

Add `AgentCmd::Session` with subcommands:
- `init`
- `status`
- `close`
- `continuation`

Use the `sesh::session` helpers. Keep side effects production-safe:
- load `.epi-logos.env` when present
- describe 1Password/varlock requirements if secret tooling is absent
- execute hook scripts if present

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_session_commands`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/mod.rs epi-cli/src/agent/session.rs epi-cli/src/main.rs epi-cli/tests/agent_session_commands.rs
git commit -m "feat: add khora agent session commands"
```

### Task 3: Hen Vault Paths and Templates

**Files:**
- Create: `epi-cli/src/vault/paths.rs`
- Create: `epi-cli/src/vault/templates.rs`
- Modify: `epi-cli/src/vault/mod.rs`
- Test: `epi-cli/tests/vault_paths_templates.rs`

**Step 1: Write the failing test**

Add tests for:
- day path: `{VAULT}/Empty/Present/{DD-MM-YYYY}/daily-note.md`
- now path: `{VAULT}/Empty/Present/{DD-MM-YYYY}/{YYYYMMDD-HHmmss-sessionId}/now.md`
- archive day path: `{VAULT}/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`
- thought path: `{VAULT}/Pratibimba/Self/Thought/T{n}/T{n}-{timestamp}.md`
- template fallback order: `~/.epi-logos/templates` -> `.pi/extensions/ta-onta/hen/S1'/templates` -> built-in
- CT4b' generates all six positional headings for `daily-note` and `now`

**Step 2: Run test to verify it fails**

Run: `cargo test --test vault_paths_templates`
Expected: FAIL because these helpers do not exist.

**Step 3: Write minimal implementation**

Implement reusable path helpers and built-in template rendering for:
- `seed`
- `prompt`
- `task-spec`
- `pattern-note`
- `daily-note`
- `now`
- `thought`

**Step 4: Run test to verify it passes**

Run: `cargo test --test vault_paths_templates`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/vault/paths.rs epi-cli/src/vault/templates.rs epi-cli/src/vault/mod.rs epi-cli/tests/vault_paths_templates.rs
git commit -m "feat: add hen vault path and template helpers"
```

### Task 4: Hen Frontmatter Validation Tightening

**Files:**
- Modify: `epi-cli/src/vault/frontmatter.rs`
- Test: `epi-cli/tests/vault_frontmatter.rs`

**Step 1: Write the failing test**

Add tests covering:
- rejection of deprecated keys `coordinate`, `ql_position`, `pos_*`
- acceptance of canonical `{family}_{n}_{semantic}` keys across all families
- required temporal keys for present/NOW notes
- thought routing notes requiring matching `thought_type`
- invalid coordinate-link values surfaced as errors

**Step 2: Run test to verify it fails**

Run: `cargo test --test vault_frontmatter`
Expected: FAIL because current validation is permissive.

**Step 3: Write minimal implementation**

Refactor validator to:
- distinguish canonical metadata keys from deprecated keys
- validate coordinate-key values and family/position semantics
- validate temporal and thought-note invariants

**Step 4: Run test to verify it passes**

Run: `cargo test --test vault_frontmatter`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/vault/frontmatter.rs epi-cli/tests/vault_frontmatter.rs
git commit -m "feat: enforce hen frontmatter schema"
```

### Task 5: Hen CLI Lifecycle Commands

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`
- Test: `epi-cli/tests/vault_commands.rs`

**Step 1: Write the failing test**

Add tests for:
- `frontmatter-delete`, `open`, and `set-default` argument mapping
- `template-invoke`
- `day-init`
- `now-init --session-id`
- `archive-day`
- `thought-route --position`

Use real filesystem behavior for local vault writes and deterministic clock/session injection where needed.

**Step 2: Run test to verify it fails**

Run: `cargo test --test vault_commands`
Expected: FAIL because the new commands and deterministic helpers are incomplete.

**Step 3: Write minimal implementation**

Expand `VaultCmd` and `dispatch` to support the new lifecycle commands and reuse the path/template helpers. Keep obsidian-cli integration via the globally installed `obsidian`/`obsidian-cli` binaries where appropriate, but avoid UI-only flows in tests.

**Step 4: Run test to verify it passes**

Run: `cargo test --test vault_commands`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/vault/mod.rs epi-cli/tests/vault_commands.rs
git commit -m "feat: add hen vault lifecycle commands"
```

### Task 6: Khora Hen Extension Scaffolding

**Files:**
- Create: `.pi/extensions/ta-onta/khora/extension.ts`
- Create: `.pi/extensions/ta-onta/khora/CONTRACT.md`
- Create: `.pi/extensions/ta-onta/khora/S0/tools.json`
- Create: `.pi/extensions/ta-onta/khora/S0/pre-session-init.sh`
- Create: `.pi/extensions/ta-onta/khora/S0/post-session-close.sh`
- Create: `.pi/extensions/ta-onta/khora/S0'/ffi.md`
- Create: `.pi/extensions/ta-onta/khora/S0'/session-state.d.ts`
- Create: `.pi/extensions/ta-onta/hen/extension.ts`
- Create: `.pi/extensions/ta-onta/hen/CONTRACT.md`
- Create: `.pi/extensions/ta-onta/hen/S1/tools.json`
- Create: `.pi/extensions/ta-onta/hen/S1'/templates/*.md`
- Create: `.pi/extensions/ta-onta/hen/M/README.md`
- Test: `epi-cli/tests/agent_extensions_ta_onta.rs`

**Step 1: Write the failing test**

Add tests that assert required files/directories exist and that tool registration manifests contain the expected command bindings for Khora and Hen.

**Step 2: Run test to verify it fails**

Run: `cargo test --test agent_extensions_ta_onta`
Expected: FAIL because files are missing.

**Step 3: Write minimal implementation**

Create the extension surface and keep it honest:
- hooks are executable shell scripts with environment validation/cleanup behavior
- tool manifests map PI-visible tool names to real `epi` commands
- template files align with built-in CT archetypes

**Step 4: Run test to verify it passes**

Run: `cargo test --test agent_extensions_ta_onta`
Expected: PASS.

**Step 5: Commit**

```bash
git add .pi/extensions/ta-onta/khora .pi/extensions/ta-onta/hen epi-cli/tests/agent_extensions_ta_onta.rs
git commit -m "feat: scaffold khora and hen ta-onta extensions"
```

### Task 7: Aletheia Gnosis CLI Scaffolding

**Files:**
- Create: `epi-cli/src/techne/gnosis/mod.rs`
- Create: `epi-cli/src/techne/gnosis/config.rs`
- Create: `epi-cli/src/techne/gnosis/docling_client.rs`
- Create: `epi-cli/src/techne/gnosis/chunker.rs`
- Create: `epi-cli/src/techne/gnosis/notebook.rs`
- Create: `epi-cli/src/techne/gnosis/ingest.rs`
- Create: `epi-cli/src/techne/gnosis/query.rs`
- Create: `epi-cli/src/techne/gnosis/sync.rs`
- Modify: `epi-cli/src/techne/mod.rs`
- Modify: `epi-cli/src/book/mod.rs`
- Test: `epi-cli/tests/gnosis_commands.rs`

**Step 1: Write the failing test**

Add tests for:
- gnosis subcommand parsing
- `status` health summary composition
- `serve status` compose detection
- notebook/document listing formatter stubs
- chunker producing section-aware overlapped chunks

**Step 2: Run test to verify it fails**

Run: `cargo test --test gnosis_commands`
Expected: FAIL because the module does not exist.

**Step 3: Write minimal implementation**

Implement the non-S2-blocked surface:
- router and subcommands
- docling service config/status helpers
- chunker logic
- placeholder-free command handlers that return explicit “not yet configured/running” errors when services are absent
- `epi book ingest/ask/list/status` routed through gnosis helpers

**Step 4: Run test to verify it passes**

Run: `cargo test --test gnosis_commands`
Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/techne/mod.rs epi-cli/src/techne/gnosis epi-cli/src/book/mod.rs epi-cli/tests/gnosis_commands.rs
git commit -m "feat: add aletheia gnosis command scaffolding"
```

### Task 8: Aletheia Extension and Compose Wiring

**Files:**
- Modify: `docker-compose.epi-s2.yml`
- Create: `.pi/extensions/ta-onta/aletheia/extension.ts`
- Create: `.pi/extensions/ta-onta/aletheia/CONTRACT.md`
- Create: `.pi/extensions/ta-onta/aletheia/S5/tools.json`
- Create: `.pi/extensions/ta-onta/aletheia/S5'/agents/README.md`
- Create: `.pi/extensions/ta-onta/aletheia/M/README.md`
- Modify: `epi-cli/Cargo.toml`
- Test: `epi-cli/tests/aletheia_scaffold.rs`

**Step 1: Write the failing test**

Add tests that assert:
- Docling service appears in compose config
- aletheia extension files exist
- required subagent directory structure exists without rewriting current agent content

**Step 2: Run test to verify it fails**

Run: `cargo test --test aletheia_scaffold`
Expected: FAIL because wiring is incomplete.

**Step 3: Write minimal implementation**

Wire:
- Docling compose service
- cargo dependency placeholder for docling integration if available in the existing dependency policy
- aletheia tool manifests and runtime entry

**Step 4: Run test to verify it passes**

Run: `cargo test --test aletheia_scaffold`
Expected: PASS.

**Step 5: Commit**

```bash
git add docker-compose.epi-s2.yml epi-cli/Cargo.toml .pi/extensions/ta-onta/aletheia epi-cli/tests/aletheia_scaffold.rs
git commit -m "feat: scaffold aletheia extension and docling compose"
```

### Task 9: Verification

**Files:**
- Modify: `README.md` or relevant command docs only if needed for surfaced commands

**Step 1: Run focused test suites**

Run:
- `cargo test --test session_lifecycle`
- `cargo test --test agent_session_commands`
- `cargo test --test vault_paths_templates`
- `cargo test --test vault_frontmatter`
- `cargo test --test vault_commands`
- `cargo test --test agent_extensions_ta_onta`
- `cargo test --test gnosis_commands`
- `cargo test --test aletheia_scaffold`

**Step 2: Run broader regression sweep**

Run: `cargo test`
Expected: PASS, or document unrelated failures already present in the branch.

**Step 3: Sanity-check CLI help**

Run:
- `cargo run --bin epi -- agent --help`
- `cargo run --bin epi -- vault --help`
- `cargo run --bin epi -- techne --help`
- `cargo run --bin epi -- book --help`

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: refresh foundational command coverage"
```
