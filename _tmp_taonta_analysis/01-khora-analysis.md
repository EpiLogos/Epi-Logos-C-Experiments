# Khora (#0) Extension Analysis — Functional Requirements, User Stories & Inventories

**Date:** 2026-03-10
**Status:** Comprehensive pre-implementation analysis
**Extension:** Khora (S4-0') -- Bootstrap & Session Lifecycle
**Position:** #0 (Ground, Source, Bimba-implicate)
**ta-onta Mapping:** khora/#0 = S0/S0'/M

---

## Source Documents Inventory

The following planning artefacts were read exhaustively to produce this analysis:

| # | Document | Location | Key Khora Content |
|---|----------|----------|-------------------|
| 1 | INSTALL-PLAN.md | ARCHIVE-2026-02-25-taonta-install/ | Install order (Khora first), 9 verification tasks |
| 2 | INTEGRATION-SCOPE-KHORA-HEN.md | ARCHIVE-2026-02-25-taonta-install/ | NOW.md lifecycle, Redis key schema, session management, FR-14..FR-17, US-011..US-013 |
| 3 | ARCHITECTURE.md | ARCHIVE-2026-02-25-taonta-install/ | Epi-Claw system architecture, gateway, WebSocket |
| 4 | ORCHESTRATOR-SPEC.md | ARCHIVE-2026-02-25-taonta-install/ | Extension lifecycle orchestrator, T-001..T-010 test scenarios |
| 5 | OPENCLAW_SYSTEM_MAPPING.md | ARCHIVE-2026-02-25-taonta-install/ | OpenClaw architecture, cron, skills system |
| 6 | PREINSTALL-CLOSURE-CHECKLIST.md | ARCHIVE-2026-02-25-taonta-install/ | S0-S5 assertions, infrastructure gates |
| 7 | LEMNISCATE_DEV_STRATEGY.md | ARCHIVE-2026-02-25-taonta-install/ | EPI-22 S3-0' Khora hooks system |
| 8 | OUROBOROS_DEV_SPEC.md | ARCHIVE-2026-02-25-taonta-install/ | Dialogical dev protocol, session persistence |
| 9 | ta-onta-anima-superpowers-vak-integration-spec.md | ARCHIVE-2026-02-25-taonta-install/ | VAK formula: CPF(S4-0') = Polarity Gate |
| 10 | VAK-HANDOVER.md | ARCHIVE-2026-02-25-taonta-install/ | 4 new skills, 7 modified, Anima runtime |
| 11 | cron-jobs.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Gateway cron architecture, main vs isolated sessions |
| 12 | cron-vs-heartbeat.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Heartbeat vs cron decision framework |
| 13 | DAY-AS-CONTEXT-FRAMEWORK.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Day as temporal principle, CT4' meta-framework |
| 14 | daily-notes.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | QL cycle #0-#5, daily emptying pattern |
| 15 | daily-note-schema.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | 6-position frontmatter schema |
| 16 | CT4b-MASTER-TEMPLATE.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Fractal inner structure 4.0-4.5 |
| 17 | daily-standup.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Morning ritual skill |
| 18 | daily-archive.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | 2-day temporal window, archive day-before-yesterday |
| 19 | daily-go.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Task executor, complexity routing |
| 20 | daily-reflect.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Evening reflection, DAY-REVIEW.md, TOMORROW.md |
| 21 | Daily Note Template.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Canonical 6-position template with frontmatter |
| 22 | cron.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | CLI cron management reference |
| 23 | cron-add-hardening.md | 22-02-2026-USEFUL-FOR-Ta-Onta/ | Schema alignment for cron |
| 24 | S4-NOW-INTEGRATION-AND-ENVIRONMENT.md | docs/specs/S/S4/ | Khora inner layers, bootstrap flow, 1Password+varlock, vault organisation |
| 25 | S4-TA-ONTA-EXTENSION-SPEC.md | docs/specs/S/S4/ | Full ta-onta structure, S-layer audit, Gnosis pipeline |
| 26 | S0-S0i-CLI-CORE.md | docs/specs/S/ | S0/S0' architecture, QV pipeline |
| 27 | ta-onta-full-architecture-conformance-remediation-plan.md | Epi-Logos/docs/plans/ | 53 US ledger, 9 lanes, 3 foundation gates, Khora checklist |
| 28 | epi-session-harmonization-and-zsh-perf.md | Epi-Logos/docs/plans/ | tmux session creation, ~/.config/epi/epi-session.sh |
| 29 | _staging/README.md | _staging/ | Staging area disposition table |
| 30 | _staging/root-hooks/* | _staging/root-hooks/ | 4 hook shell stubs (pre/post agent-run, pre/post epi-command) |
| 31 | _staging/root-commands/* | _staging/root-commands/ | 3 command stubs (core-verify, graph-context, model-status) |
| 32 | _staging/pleroma-hooks/* | _staging/pleroma-hooks/ | 4 hook scripts (preflight, postflight, discharge, worktree-cleanup) |
| 33 | epi-cli/src/agent/mod.rs | epi-cli/src/agent/ | Agent module: 15 submodules, AgentCmd enum, dispatch |
| 34 | CLAUDE.md | project root | Canonical architecture spec |

---

## A. Functional Requirements (FRs)

### FR-K-001: Session Identity Generation

**Description:** Khora MUST generate a unique session identity on every `epi agent session init` invocation, using the canonical datetime-prefixed format `{YYYYMMDD-HHmmss-randomId}`. This session ID becomes the universal threading key across all S-layers.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Bootstrap flow); INTEGRATION-SCOPE-KHORA-HEN.md (Session management); ORCHESTRATOR-SPEC.md (T-003)

**Spec Coverage:** COVERED (S4-NOW spec defines format, bootstrap flow, env var propagation)

**Priority:** P0 -- Critical (nothing works without session identity)

---

### FR-K-002: Process Environment Propagation

**Description:** Khora MUST set the following process environment variables on session init, ensuring all child processes inherit them:
- `EPI_SESSION_ID` -- the generated session identity
- `EPI_DAY_ID` -- the current day in `DD-MM-YYYY` format
- `EPI_NOW_PATH` -- absolute filesystem path to the session's NOW folder

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/S0: Terminal Bootstrap); INTEGRATION-SCOPE-KHORA-HEN.md (Process environment section)

**Spec Coverage:** COVERED (explicit env var names and semantics defined)

**Priority:** P0 -- Critical

---

### FR-K-003: Bootstrap File Sequence Loading

**Description:** Khora MUST read bootstrap files in a strict, ordered sequence:
1. `CONTINUATION.md` (if exists -- post-compaction recovery)
2. `ANIMA.md` (behavioural rules)
3. `PARADIGM.md` (philosophy)
4. `MEMORY.md` (long-term curated wisdom)
5. `NOW.md` (active session pointer)
6. `TOOLS.md` (light skill/tool discoverability)

The system MUST NOT replace native bootstrap mechanics; Khora adds only session-scoped deltas.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/S0': CLI Bootstrap Commands); Conformance Remediation Plan (Gate 1: "Khora must stop rebuilding a parallel bootstrap context")

**Spec Coverage:** COVERED (both sequence and anti-pattern explicitly defined)

**Priority:** P0 -- Critical

---

### FR-K-004: CONTINUATION.md Pre-Compaction State Dump

**Description:** Before context compaction or session termination, Khora MUST write a `CONTINUATION.md` file capturing the current execution state. This file MUST survive context compression and be the first file loaded on the next session bootstrap.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section VIII, Session Lifecycle -- "Khora: write CONTINUATION.md pre-compaction state"); INTEGRATION-SCOPE-KHORA-HEN.md (Session finalization)

**Spec Coverage:** PARTIAL -- The spec defines that CONTINUATION.md exists and its position in the bootstrap sequence, but does NOT define:
- The exact schema/format of CONTINUATION.md
- What state fields MUST be captured
- Size limits or compaction strategy for the file itself
- Whether it is pure markdown or structured (frontmatter + body)

**Priority:** P0 -- Critical

---

### FR-K-005: Secrets Management via 1Password + varlock

**Description:** Khora MUST materialise secrets at runtime using 1Password CLI (`op`) and varlock for environment variable injection. No secrets in git. The flow:
1. Load `~/.epi-logos/env/base.env` (static non-secret config)
2. `varlock inject` (materialise secrets from 1Password to env)
3. Validate all required vars present
4. Fail-fast if any required secret is missing

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, "Khora Integration: 1Password + varlock for Secrets"); S4-TA-ONTA-EXTENSION-SPEC.md (Khora S0' description)

**Spec Coverage:** COVERED (varlock.toml example, bootstrap flow, security invariant all defined)

**Priority:** P1 -- High (deferrable if secrets are injected by other means during early dev)

---

### FR-K-006: Session Lifecycle CLI Commands

**Description:** Khora MUST expose the following CLI commands through `epi agent`:
- `epi agent bootstrap [--agent NAME]` -- Full bootstrap sequence
- `epi agent session init` -- Create session, generate ID, set env
- `epi agent session status` -- Current session identity
- `epi agent session close` -- Finalize, trigger archive
- `epi agent session continuation` -- Write CONTINUATION.md pre-compaction

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/S0': CLI Bootstrap Commands)

**Spec Coverage:** PARTIAL -- The commands are named and described, but the existing `epi-cli/src/agent/mod.rs` (which defines AgentCmd) does NOT currently have `Bootstrap`, `Session` subcommands. The existing agent module has `Install`, `Doctor`, `Spawn`, `Attach`, `Run`, `Chat` -- none of these map to the Khora session lifecycle. A new subcommand structure is needed.

**Priority:** P0 -- Critical

---

### FR-K-007: Native Bootstrap Source-of-Truth Enforcement

**Description:** Khora MUST NOT build a parallel bootstrap context. The native PI/Claude Code bootstrap file loading and hook overrides remain the source of truth. Khora may add ONLY session-scoped deltas (NOW/cache context), not replace base bootstrap mechanics. This is Gate 1 of the conformance remediation plan.

**Source:** Conformance Remediation Plan (Gate 1); PREINSTALL-CLOSURE-CHECKLIST.md ("Bootstrap excludes NOW direct file injection as a bootstrap source; NOW is session-scoped runtime state")

**Spec Coverage:** COVERED (explicit prohibition in conformance plan, explicit constraint in pre-install checklist)

**Priority:** P0 -- Critical (architectural constraint, not a feature)

---

### FR-K-008: Redis Session Metadata

**Description:** Khora MUST write session metadata to Redis on session init and manage cache lifecycle:
- Key: `session:{session-id}:now:md` -- session state
- Key: `cache:hot:empty/present/now.md` -- HOT tier (5min TTL, /present)
- Key: `locks:coordinate:{coordinate}` -- coordinate-level locks preventing concurrent edits
- Key: `locks:file:{path}` -- file-level locks

**Source:** INTEGRATION-SCOPE-KHORA-HEN.md (Redis key schema, Memory continuum); S4-NOW-INTEGRATION-AND-ENVIRONMENT.md ("Write session metadata to Redis if cache layer ready")

**Spec Coverage:** PARTIAL -- The key patterns and TTL tiers are defined, but the spec conditionalises Redis: "if cache layer ready". The S2 layer (graph/Redis) is currently STUB status. There is no defined fallback behaviour when Redis is unavailable.

**Priority:** P2 -- Medium (blocked by S2 layer readiness; filesystem-only mode needed as fallback)

---

### FR-K-009: M0 (Anuttara) Ground State Initialisation

**Description:** Khora MUST ensure the C library's M0 ground state is loaded before any coordinate operations begin. M0 is "tick 0" of each session -- the immutable bedrock.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/M: "M0 (Anuttara): ground state initialisation -- the 'tick 0' of each session"); S4-TA-ONTA-EXTENSION-SPEC.md (Khora M/ folder: "M0 Anuttara ground")

**Spec Coverage:** COVERED (both specs mention M0 as Khora's M-branch responsibility)

**Priority:** P1 -- High (C library FFI must work; M0 is already implemented in epi-lib)

---

### FR-K-010: M5 (Epii) Logos FSM Session Depth

**Description:** Khora MUST read `session_depth` from M5 to determine if this is a fresh session (depth 0) or a continuing session (depth > 0). This affects bootstrap behaviour -- continuing sessions may skip certain bootstrap steps.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/M: "M5 (Epii): Logos FSM position -- Khora reads session_depth from M5"); S4-TA-ONTA-EXTENSION-SPEC.md (Khora M/ folder: "M5 Logos FSM tick")

**Spec Coverage:** COVERED (semantic defined, but the boundary between "fresh" and "continuing" behaviour is not enumerated)

**Priority:** P1 -- High

---

### FR-K-011: Session Finalization and Idempotency

**Description:** Session finalization (`epi agent session close`) MUST be idempotent -- calling it multiple times on the same session MUST produce the same result without side effects. Finalization triggers:
- CONTINUATION.md write
- Sophia review dispatch
- Khora sync queue flush
- Redis state transition to WARM tier

**Source:** Conformance Remediation Plan (US-032: "Normalize Khora lifecycle session identity and make session finalization idempotent"); S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section VIII, "Session ends / compaction approaches")

**Spec Coverage:** PARTIAL -- US-032 names the requirement, the session lifecycle flow describes the steps, but there is no explicit idempotency protocol (e.g., state machine transitions, guard conditions, dedup keys).

**Priority:** P1 -- High

---

### FR-K-012: Fail-Fast Error Policy

**Description:** Khora MUST implement a fail-fast error policy across its shared contracts and runtime seams. No silent degradation -- if a required resource (Redis, 1Password, C library) is unavailable, Khora MUST fail with an explicit error rather than silently operating in a degraded mode.

**Source:** Conformance Remediation Plan (US-016: "Enforce fail-fast error policy across shared contracts and runtime seams"; Khora checklist: "Fail-fast on contract violations (no silent degrade)")

**Spec Coverage:** COVERED (explicit requirement in both the US ledger and the module checklist)

**Priority:** P1 -- High

---

### FR-K-013: Khora Sync Queue

**Description:** Khora MUST maintain a sync queue (`.khora-sync-queue.jsonl`) for batched graph writes. The queue accumulates during a session and flushes to Neo4j (via Hen) at session close. The queue MUST be constrained to "minimal operational contract (Obsidian-safe updates + proposals)."

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section VIII: "Khora: sync queue accumulates graph writes"); Conformance Remediation Plan (US-015: "Constrain Khora queue to minimal operational contract"); Hen/S2 section: "Khora sync queue for batched graph writes"

**Spec Coverage:** PARTIAL -- The queue's existence and flush timing are defined. US-015 constrains its scope. But the exact JSONL schema, the flush protocol, and error handling (partial flush, retry) are not specified.

**Priority:** P2 -- Medium (blocked by S2/Neo4j readiness)

---

### FR-K-014: Shell Profile Sourcing

**Description:** Khora MUST source `.epi-logos.env` on session start to load coordinate paths, configuration, and (post-varlock) secret references into the shell environment.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/S0: "Shell profile: .epi-logos.env sourced on session start")

**Spec Coverage:** PARTIAL -- Named as a requirement, but the exact location, format, and relationship to `~/.epi-logos/env/base.env` (from FR-K-005) is ambiguous. Are these the same file? Different files?

**Priority:** P1 -- High

---

### FR-K-015: Child Process Session Identity Inheritance

**Description:** When Khora spawns child agent processes (subagent sessions), each child MUST inherit the parent's session identity AND receive its own sub-session binding.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/S3: "Sub-session support (subagent-specific binding)"); Conformance Remediation Plan (US-034: "Wire native session-propagation spine from spawn to Day/NOW lineage")

**Spec Coverage:** PARTIAL -- The need is stated, but the mechanism (env var inheritance? explicit parameter? session registry?) is not specified.

**Priority:** P1 -- High

---

### FR-K-016: Gateway Session Compatibility

**Description:** Khora session keys MUST conform to epi-claw canonical format (`canonical_key + alias`). Workspace derivation: Day -> session -> NOW -> filesystem path.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section II, Khora/S3: Gateway Session Compatibility)

**Spec Coverage:** PARTIAL -- The requirement exists, but S3 (gateway) is STUB status. The actual canonical key format is referenced but not inline-defined. "Deferrable" per the S-layer dependency table.

**Priority:** P3 -- Low (deferred until S3 is active)

---

### FR-K-017: NOW Folder Creation Delegation

**Description:** Khora triggers NOW folder creation but delegates the actual filesystem operation to Chronos (`epi vault now-init --session-id <id>`). Khora owns the session identity; Chronos owns the filesystem layout.

**Source:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md (Section VIII, Session Lifecycle: "Chronos: create NOW folder within today"); S4-TA-ONTA-EXTENSION-SPEC.md (separation of concerns: Khora = S0/S0', Chronos = S3/S3')

**Spec Coverage:** PARTIAL -- The lifecycle flow shows Chronos creating the NOW folder, but the delegation protocol (direct CLI call? event bus? hook?) is not specified.

**Priority:** P1 -- High (cross-extension contract)

---

### FR-K-018: PI Hook Seam Registration

**Description:** Khora's `extension.ts` (PI runtime entry point) MUST register the following hook seams:
- `before_agent_start` -- pre-bootstrap validation
- `session_start` -- session init, env propagation
- `before_compaction` -- CONTINUATION.md write
- `session_end` -- finalization, archive trigger

**Source:** S4-TA-ONTA-EXTENSION-SPEC.md (Khora extension.ts: "PI runtime: bootstrap hooks, session init"); ORCHESTRATOR-SPEC.md (Extension lifecycle); Conformance Remediation Plan (US-021, US-022: hook/lifecycle observability)

**Spec Coverage:** PARTIAL -- The hook names are derived from the system architecture (before_agent_start is from OpenClaw, session_start/end from PI conventions), but no single spec enumerates exactly which hooks Khora registers vs which are native PI hooks that Khora merely participates in.

**Priority:** P1 -- High (requires PI runtime to be installed)

---

### FR-K-019: Shared Path Service Consumption

**Description:** Khora MUST consume (not replace) the shared ta-onta path service for all filesystem operations. No hardcoded host-specific path fallbacks.

**Source:** Conformance Remediation Plan (US-003: "Implement shared ta-onta path service"; US-005: "Refactor Khora filesystem writes and queue targets to shared path service"; Khora checklist: "No plugin-local replacement bootstrap file loading")

**Spec Coverage:** MISSING -- US-003 defines the shared path service as a dependency, US-005 says Khora must consume it, but the path service itself is not yet specified. Its API, location, and contract are undefined.

**Priority:** P0 -- Critical (architectural dependency; blocked by US-003)

---

### FR-K-020: Coordinate Lock Management

**Description:** Khora MUST manage coordinate-level locks to prevent concurrent edits to the same S-family coordinate during a session. Lock keys: `locks:coordinate:{coordinate}`.

**Source:** INTEGRATION-SCOPE-KHORA-HEN.md (Redis key schema: `locks:coordinate:{coordinate}`)

**Spec Coverage:** PARTIAL -- Key pattern defined, but lock semantics (TTL, deadlock detection, stale lock cleanup, cross-session coordination) are not specified.

**Priority:** P2 -- Medium (advanced feature, not needed for MVP)

---

## B. User Stories (USs)

### US-K-001: Session Initialisation

**As a** developer starting a work session,
**I want to** run `epi agent session init` and get a session ID with all environment variables set,
**so that** all subsequent operations (vault, graph, agent) can reference a consistent session identity.

**Acceptance Criteria:**
- Session ID is in format `{YYYYMMDD-HHmmss-randomId}`
- `EPI_SESSION_ID`, `EPI_DAY_ID`, `EPI_NOW_PATH` are set in the process environment
- Child processes inherit these variables
- The command is idempotent within a single terminal session (re-running returns existing session, does not create a new one)

**Source Reference:** FR-K-001, FR-K-002; S4-NOW-INTEGRATION-AND-ENVIRONMENT.md Section II

---

### US-K-002: Bootstrap Sequence

**As a** session bootstrapping process,
**I want to** load CONTINUATION -> ANIMA -> PARADIGM -> MEMORY -> NOW -> TOOLS in strict order,
**so that** the agent has the correct behavioural context and any post-compaction recovery state is applied first.

**Acceptance Criteria:**
- CONTINUATION.md is loaded FIRST if it exists (post-compaction recovery)
- If CONTINUATION.md does not exist, bootstrap proceeds from ANIMA.md
- Each file's absence is tolerated (skip, do not fail)
- The bootstrap does NOT replace native PI/Claude Code bootstrap mechanics
- Bootstrap outcome is logged (which files loaded, which were absent)

**Source Reference:** FR-K-003, FR-K-007; Conformance Remediation Gate 1

---

### US-K-003: Pre-Compaction State Dump

**As a** session approaching context compaction,
**I want to** write a CONTINUATION.md capturing current execution state,
**so that** the next session can recover context without re-reading the entire conversation.

**Acceptance Criteria:**
- CONTINUATION.md is written to the session's NOW folder AND to `Empty/Present/`
- The file captures: active coordinates, current task, pending operations, key decisions
- Writing is triggered by `epi agent session continuation` OR the `before_compaction` hook
- The write is atomic (temp file + rename, not partial write)

**Source Reference:** FR-K-004; S4-NOW-INTEGRATION-AND-ENVIRONMENT.md Section VIII

---

### US-K-004: Secrets Materialisation

**As a** session bootstrapping process,
**I want to** materialise secrets from 1Password via varlock without any secrets touching git,
**so that** API keys and credentials are available in the environment without being stored in the repository.

**Acceptance Criteria:**
- `varlock inject` is called during `epi agent session init`
- All secrets defined in `varlock.toml` are resolved and set as env vars
- If 1Password is not available (locked, not installed), the system fails fast with a clear error
- `secrets.env` is in `.gitignore`
- No `op://` references leak into runtime output

**Source Reference:** FR-K-005; S4-NOW-INTEGRATION-AND-ENVIRONMENT.md Section II

---

### US-K-005: Session Status Inspection

**As a** developer or agent,
**I want to** run `epi agent session status` and see the current session identity, Day ID, NOW path, and active coordinates,
**so that** I can verify the session context before performing operations.

**Acceptance Criteria:**
- Output includes: session ID, Day ID, NOW path, bootstrap file load status, M0/M5 state
- Supports `--json` flag for programmatic consumption
- Works without Redis (falls back to env var inspection)
- Returns error if no session is active

**Source Reference:** FR-K-006; existing epi-cli `--json` pattern from `epi core knowing`

---

### US-K-006: Session Closure and Finalization

**As a** developer ending a work session,
**I want to** run `epi agent session close` and have all session state properly finalized,
**so that** the session's work is archived, synced, and ready for the next session.

**Acceptance Criteria:**
- CONTINUATION.md is written (pre-compaction state dump)
- Khora sync queue is flushed (if entries exist)
- Redis session state transitions to WARM tier (if Redis available)
- Session close is idempotent (calling twice does not fail or duplicate)
- Sophia review dispatch is triggered (if agent layer ready)

**Source Reference:** FR-K-011; S4-NOW-INTEGRATION-AND-ENVIRONMENT.md Section VIII; US-032

---

### US-K-007: M0 Ground State Loading

**As a** session init process,
**I want to** ensure the C library's M0 Anuttara ground state is loaded and valid before any coordinate operations,
**so that** all subsequent coordinate lookups have a valid bedrock.

**Acceptance Criteria:**
- M0 is loaded via FFI (`dlopen` -> `m0_init`)
- If the C library is not loadable, session init fails fast
- M0 state is verified (128-byte HC struct, _Static_assert)
- M0 load status is reported in `epi agent session status`

**Source Reference:** FR-K-009; epi-lib/include/m0.h; CLAUDE.md architecture

---

### US-K-008: Fresh vs Continuing Session Detection

**As a** bootstrap process,
**I want to** read M5's `session_depth` to determine if this is a fresh (depth=0) or continuing session,
**so that** the bootstrap can skip redundant steps on continuation and apply CONTINUATION.md recovery.

**Acceptance Criteria:**
- session_depth=0: full bootstrap sequence, no CONTINUATION.md expected
- session_depth>0: CONTINUATION.md is expected, skip PARADIGM.md and MEMORY.md (already loaded)
- session_depth is incremented on each session init
- The depth value is available in `epi agent session status`

**Source Reference:** FR-K-010; S4-NOW-INTEGRATION-AND-ENVIRONMENT.md Khora/M section

---

### US-K-009: Doctor Health Check for Session Prerequisites

**As a** developer preparing to start a session,
**I want to** run `epi agent doctor` and get a report on Khora's prerequisites,
**so that** I know which components are ready before attempting session init.

**Acceptance Criteria:**
- Checks: C library loadable, varlock configured, 1Password accessible, Redis available (optional), Obsidian vault accessible (optional)
- Reports each component as READY / MISSING / DEGRADED
- Suggests remediation for MISSING items
- Exit code reflects overall readiness

**Source Reference:** S4-NOW-INTEGRATION-AND-ENVIRONMENT.md Section VI (`epi agent doctor`); existing `epi-cli/src/agent/mod.rs` Doctor command

---

### US-K-010: Shared Path Service Integration

**As a** Khora session lifecycle manager,
**I want to** use the shared ta-onta path service for all file path resolution,
**so that** there are no hardcoded host-specific paths and all extensions agree on filesystem locations.

**Acceptance Criteria:**
- All Khora file paths are resolved through the path service
- No hardcoded `/Users/admin/Documents/Epi-Logos/Idea/` in runtime code
- Path service provides: vault root, Day folder, NOW folder, archive target, bootstrap file locations
- Khora tests verify path resolution works with configured (non-default) vault paths

**Source Reference:** FR-K-019; Conformance Remediation US-003, US-005

---

### US-K-011: Sync Queue Management

**As a** session lifecycle manager,
**I want to** accumulate graph write operations in a sync queue during the session and flush them on close,
**so that** graph writes are batched efficiently and atomic with session finalization.

**Acceptance Criteria:**
- Queue file: `.khora-sync-queue.jsonl` in session's NOW folder
- Each queue entry includes: operation type, target coordinate, payload, timestamp
- Queue is flushed to Neo4j via Hen on `epi agent session close`
- If flush fails partially, remaining entries are preserved for retry
- Queue is constrained to Obsidian-safe operations (no destructive graph mutations)

**Source Reference:** FR-K-013; S4-NOW-INTEGRATION-AND-ENVIRONMENT.md; US-015

---

### US-K-012: Hook Registration in PI Runtime

**As** the Khora extension at PI runtime,
**I want to** register lifecycle hooks (before_agent_start, session_start, before_compaction, session_end),
**so that** the PI agent orchestrator invokes Khora at the correct lifecycle moments.

**Acceptance Criteria:**
- `khora/extension.ts` registers all 4 hooks via PI's hook registration API
- Each hook receives the current session context as input
- Hook failures are reported (not silently swallowed)
- Hooks can be tested in isolation (`epi agent hooks test --event <event>`)

**Source Reference:** FR-K-018; S4-TA-ONTA-EXTENSION-SPEC.md; existing hook test infrastructure in `epi-cli/src/agent/hooks.rs`

---

### US-K-013: Session Identity Normalisation

**As a** cross-extension session consumer,
**I want** session IDs to use native OpenClaw-compatible helpers for parsing and formatting,
**so that** all extensions (Khora, Chronos, Anima) agree on session identity semantics.

**Acceptance Criteria:**
- Session ID format is centrally defined (not duplicated per extension)
- Parsing/formatting helpers handle: generation, validation, timestamp extraction, session-to-Day derivation
- Helpers are in a shared location consumed by all extensions
- No extension invents its own session ID scheme

**Source Reference:** US-031: "Centralize ta-onta session naming/parsing on native OpenClaw-compatible helpers"; US-032

---

---

## C. S-Level Inventory (S0 Raw Primitives)

These are the raw S0 (Terminal) primitives that Khora's `/S0` folder governs -- the non-QL, infrastructure-level capabilities.

### C.1 Process Environment

| Primitive | Description | Current Status | Source |
|-----------|-------------|----------------|--------|
| `env::set_var(EPI_SESSION_ID)` | Set session identity in process env | NOT IMPLEMENTED | S4-NOW spec |
| `env::set_var(EPI_DAY_ID)` | Set current Day identity | NOT IMPLEMENTED | S4-NOW spec |
| `env::set_var(EPI_NOW_PATH)` | Set NOW folder absolute path | NOT IMPLEMENTED | S4-NOW spec |
| `env::var(CF_IDENTITY)` | Context frame identity (consumed by hooks) | EXISTS in staging hooks | pleroma-hooks/preflight-validate.sh |
| `env::var(ALETHEIA_WORKSHOP_MAX_WINDOWS)` | Workshop window budget ceiling | EXISTS in staging hooks | pleroma-hooks/preflight-validate.sh |
| Process env inheritance | Child processes inherit all EPI_* vars | IMPLICIT (OS-level) | S4-NOW spec |

### C.2 Process Spawn

| Primitive | Description | Current Status | Source |
|-----------|-------------|----------------|--------|
| `std::process::Command` | Spawn child agent processes | EXISTS (agent/spawn.rs) | epi-cli agent module |
| PI process spawn (`pi` binary) | Launch PI agent sessions | EXISTS (agent/spawn.rs) | epi-cli agent module |
| tmux session management | Create/attach/kill tmux sessions | EXISTS (epi-session.sh) | epi-session-harmonization plan |
| Sub-session binding | Subagent receives parent session ID + own sub-ID | NOT IMPLEMENTED | S4-NOW spec Khora/S3 |

### C.3 Shell Profile

| Primitive | Description | Current Status | Source |
|-----------|-------------|----------------|--------|
| `.epi-logos.env` sourcing | Load coordinate paths, config on session start | NOT IMPLEMENTED (file referenced but not created) | S4-NOW spec |
| `~/.epi-logos/env/base.env` | Static non-secret config (vault paths, ports, URLs) | NOT IMPLEMENTED | S4-NOW spec |
| `~/.epi-logos/env/secrets.env` | GITIGNORED, materialised from 1Password | NOT IMPLEMENTED | S4-NOW spec |
| `~/.config/epi/epi-session.sh` | tmux session creation script | EXISTS (referenced in harmonization plan) | epi-session-harmonization |

### C.4 File I/O

| Primitive | Description | Current Status | Source |
|-----------|-------------|----------------|--------|
| CONTINUATION.md read/write | Atomic file operations for state dump | NOT IMPLEMENTED | S4-NOW spec |
| `.khora-sync-queue.jsonl` append | JSONL append for graph write queue | NOT IMPLEMENTED | S4-NOW spec |
| Bootstrap file reads | Sequential file loading (CONTINUATION -> TOOLS) | NOT IMPLEMENTED as Khora-specific; general file I/O exists in Rust | S4-NOW spec |

---

## D. S'-Level Inventory (S0' QL Augmentations)

These are the S0' (QL-augmented CLI) capabilities that Khora's `/S0'` folder governs -- the Quaternal Logic system's enhancement of S0 primitives.

### D.1 CLI Bootstrap Commands

| Command | Description | Current Status | Source |
|---------|-------------|----------------|--------|
| `epi agent bootstrap [--agent NAME]` | Full bootstrap sequence | NOT IMPLEMENTED (no Bootstrap variant in AgentCmd) | S4-NOW spec |
| `epi agent session init` | Create session, generate ID, set env | NOT IMPLEMENTED (no Session subcommand in AgentCmd) | S4-NOW spec |
| `epi agent session status` | Current session identity | NOT IMPLEMENTED | S4-NOW spec |
| `epi agent session close` | Finalize, trigger archive | NOT IMPLEMENTED | S4-NOW spec |
| `epi agent session continuation` | Write CONTINUATION.md | NOT IMPLEMENTED | S4-NOW spec |

**Gap Analysis:** The existing `epi-cli/src/agent/mod.rs` defines `AgentCmd` with 13 variants: `Plugin`, `Plugins`, `Skill`, `Subagent`, `Hooks`, `Install`, `Doctor`, `Extensions`, `Agents`, `Models`, `Auth`, `Spawn`, `Attach`, `Run`, `Chat`. NONE of these correspond to the Khora session lifecycle commands. A new `Session` subcommand (with `Init`, `Status`, `Close`, `Continuation` variants) and a `Bootstrap` command are needed.

### D.2 Session Management

| Capability | Description | Current Status | Source |
|------------|-------------|----------------|--------|
| Session ID generation | `{YYYYMMDD-HHmmss-randomId}` format | NOT IMPLEMENTED | S4-NOW spec |
| Session depth tracking | Fresh (0) vs continuing (>0) via M5 | NOT IMPLEMENTED (M5 Epii exists in C, not wired to Rust session) | S4-NOW spec |
| Session-to-Day derivation | Extract Day ID from session ID timestamp | NOT IMPLEMENTED | S4-NOW spec |
| Session identity normalisation | Shared parsing/formatting helpers | NOT IMPLEMENTED (US-031) | Conformance plan |
| Idempotent finalization | Close can be called multiple times safely | NOT IMPLEMENTED (US-032) | Conformance plan |

### D.3 Secrets Management

| Capability | Description | Current Status | Source |
|------------|-------------|----------------|--------|
| varlock integration | `varlock inject` for env var materialisation | NOT IMPLEMENTED (varlock not installed) | S4-NOW spec |
| 1Password CLI (`op`) | Secret source provider | NOT IMPLEMENTED (1Password installed on system, not wired) | S4-NOW spec |
| `varlock.toml` config | Mapping: env var name -> 1Password item/field | NOT IMPLEMENTED (config file does not exist) | S4-NOW spec |
| Secret validation | Fail-fast if required secrets missing | NOT IMPLEMENTED | S4-NOW spec |

### D.4 Bootstrap File System

| Capability | Description | Current Status | Source |
|------------|-------------|----------------|--------|
| CONTINUATION.md schema | Structured pre-compaction state dump | NOT DEFINED (format unspecified) | S4-NOW spec |
| ANIMA.md consumption | Behavioural rules loading | NOT IMPLEMENTED as Khora concern | S4-NOW spec |
| PARADIGM.md consumption | Philosophy loading | NOT IMPLEMENTED | S4-NOW spec |
| MEMORY.md consumption | Long-term wisdom loading | NOT IMPLEMENTED | S4-NOW spec |
| NOW.md pointer | Active session pointer file | PARTIAL (vault now-read/now-write exist in epi-cli) | S0-S0i spec |
| TOOLS.md consumption | Tool/skill discoverability loading | NOT IMPLEMENTED | S4-NOW spec |

### D.5 Existing S0' Infrastructure (Already Implemented, Khora Can Consume)

| Capability | Description | Current Status | Source |
|------------|-------------|----------------|--------|
| `epi core knowing <coord>` | Coordinate self-knowledge (96+1873 coords) | IMPLEMENTED | S0-S0i spec |
| QV pipeline (overlay -> C -> Rust) | Three-tier knowledge resolution | IMPLEMENTED | S0-S0i spec |
| `epi core verify` | C library verification | IMPLEMENTED | S0-S0i spec |
| `epi vault now-read` / `now-write` | NOW.md read/write | IMPLEMENTED | S0-S0i spec |
| `epi agent doctor` | Agent health check | IMPLEMENTED (basic) | agent/mod.rs |
| `epi agent install` | Managed PI agent directory prep | IMPLEMENTED | agent/mod.rs |
| `epi agent spawn` | Launch PI session | IMPLEMENTED | agent/mod.rs |

---

## E. M-Level Mapping (C Library Data Structure Concerns)

Khora's `/M` folder documents which M-branch subsystems are touched and how.

### E.1 M0 -- Anuttara (Ground State)

| Concern | Description | Implementation Status | Integration Point |
|---------|-------------|----------------------|-------------------|
| Ground state init | M0 is "tick 0" of each session; immutable bedrock in .rodata | IMPLEMENTED (epi-lib/src/m0.c, epi-lib/include/m0.h) | FFI via epi-cli/src/ffi/mod.rs |
| ARCHETYPE_LUT | Canonical ordering of 12 archetypes | IMPLEMENTED + FIXED (bug fixed per MEMORY.md) | Loaded via `m0_init()` |
| HC struct 128-byte guarantee | _Static_assert verified | IMPLEMENTED | Compile-time check |
| Session "tick 0" | M0 represents the absolute ground before any session activity | CONCEPTUAL -- Khora must call `m0_init()` before coordinate ops | New FFI call in session init |

**Khora's M0 Responsibility:** Ensure `m0_init()` is called early in bootstrap. Verify the C library is loadable. Report M0 state in session status. This is a read-only dependency -- Khora does not mutate M0.

### E.2 M5 -- Epii (Holographic Integration)

| Concern | Description | Implementation Status | Integration Point |
|---------|-------------|----------------------|-------------------|
| Logos FSM | 1-byte state machine, session_depth counter | IMPLEMENTED (epi-lib/src/m5.c, epi-lib/include/m5.h) | FFI via epi-cli/src/ffi/mod.rs |
| session_depth | Counter for fresh vs continuing session detection | IMPLEMENTED in C, NOT WIRED to Rust session lifecycle | New FFI call needed |
| Quintessential View | Per-coordinate pithy self-descriptions | IMPLEMENTED (m5_lookup) | Already consumed by `epi core knowing` |
| Mobius return | execute_mobius_return() at tick 11 | IMPLEMENTED in C | NOT directly relevant to Khora bootstrap |
| m5_advance_logos | Advance FSM state on session events | IMPLEMENTED in C | Khora should call on session init/close |

**Khora's M5 Responsibility:** Read `session_depth` on bootstrap to determine fresh vs continuing. Call `m5_advance_logos()` on session lifecycle events. Report M5 Logos FSM state in session status. This is a read + advance dependency.

### E.3 Other M-Branches (Not Directly Khora's Concern)

| M-Branch | Owner Extension | Khora Relationship |
|----------|----------------|-------------------|
| M1 (Paramasiva) | Chronos | Khora does not touch M1; Chronos owns temporal pulse |
| M2 (Parashakti) | Hen | Khora does not touch M2; Hen owns content typing |
| M3 (Mahamaya) | Pleroma | Khora does not touch M3; Pleroma owns symbolic codec |
| M4 (Nara) | Anima | Khora does not touch M4; Anima owns personal identity |

---

## F. Staging Disposition

Analysis of `_staging/` items and whether they belong in Khora.

### F.1 `_staging/root-hooks/` -- 4 Hook Stubs

| File | Content | Belongs In Khora? | Rationale |
|------|---------|-------------------|-----------|
| `manifest.json` | Lists 4 hooks: pre-agent-run, post-agent-run, pre-epi-command, post-epi-command | **SPLIT** | pre/post-agent-run -> Khora (session lifecycle); pre/post-epi-command -> remains at root or moves to Pleroma (tool orchestration) |
| `pre-agent-run.sh` | Empty stub (`exit 0`) | **YES -> Khora/S0** | Agent run lifecycle is bootstrap territory. This becomes the `before_agent_start` hook implementation |
| `post-agent-run.sh` | Empty stub (`exit 0`) | **YES -> Khora/S0** | Agent run cleanup is session finalization territory. This becomes the `session_end` hook implementation |
| `pre-epi-command.sh` | Empty stub (`exit 0`) | **NO** | epi CLI command hooks are root-level (not session-specific). Stay at root or move to Pleroma |
| `post-epi-command.sh` | Empty stub (`exit 0`) | **NO** | Same rationale as pre-epi-command |
| `README.md` | "Repo-local PI hooks live here" | **DELETE** | Minimal stub, no content |

### F.2 `_staging/root-commands/` -- 3 Command Stubs

| File | Content | Belongs In Khora? | Rationale |
|------|---------|-------------------|-----------|
| `core-verify.md` | "Use this command surface to preview epi core verify runs" | **NO** | `epi core verify` is S0' infrastructure, already implemented. This stub adds nothing. **DELETE** |
| `graph-context.md` | "Use this command surface to request graph-backed context before agent execution" | **NO -> Aletheia** | Graph-backed context is Gnosis RAG territory (S5'/Aletheia). Not Khora |
| `model-status.md` | "Use this command surface to inspect managed provider and model state" | **NO -> Pleroma** | Model management is tool/provider territory (S2'/Pleroma) |

### F.3 `_staging/pleroma-hooks/` -- 4 Hook Scripts

| File | Content | Belongs In Khora? | Rationale |
|------|---------|-------------------|-----------|
| `hooks.json` | Registers PreToolUse, PostToolUse, 2x Stop hooks | **SPLIT** | The Stop hooks (subagent-discharge, worktree-cleanup) touch session lifecycle -> partially Khora. The PreToolUse/PostToolUse hooks are tool orchestration -> Pleroma |
| `preflight-validate.sh` | PreToolUse: checks workshop status, CF_IDENTITY, window budget | **NO -> Anima** | Workshop management and tool gating is agent orchestration (S4'/Anima) |
| `postflight-verify.sh` | PostToolUse: verifies file writes, completeness | **NO -> Pleroma** | Post-tool verification is tool lifecycle (S2'/Pleroma) |
| `subagent-discharge.sh` | Stop: structured discharge metadata, Mobius return signal, coordinates used | **PARTIAL -> Khora (session metadata) + Anima (agent discharge)** | The session metadata emission and Mobius return signal are Khora-relevant (session finalization). The agent-type-specific discharge is Anima territory |
| `worktree-cleanup.sh` | Stop: clean orphaned worktrees, workshop windows | **NO -> Pleroma** | Worktree and workshop management is development tooling (S2'/Pleroma) |

### F.4 Other `_staging/` Items

| Item | Belongs In Khora? | Rationale |
|------|-------------------|-----------|
| `settings.json` | **REVIEW** | Plugin settings may contain Khora-relevant session defaults. Needs content inspection before disposition |
| `plugin.json` | **NO** | Claude plugin manifest -- package-level, not Khora-specific |
| `Quaternal-Logic.c` | **NO** | Standalone C file, possibly early prototype. Archive or move to epi-lib |
| `verify_pleroma_analysis_docs.sh` | **NO** | Test script, belongs in test/ or CI |
| `verify_superpowers_vendor_provenance.sh` | **NO** | Test script, belongs in test/ or CI |
| `pleroma-skills/` | **NO** | Skills are Anima (orchestration) and Pleroma (tools) territory |
| `pleroma-evals/` | **NO** | Evals belong in test/ |
| `epi-logos-plugin/` | **PARTIAL** | QV overlay/schema resources may move to epi-cli/resources (S0' territory consumed by Khora). The `epi-knowing` skill stub stays in skills |

### F.5 Summary Disposition Table

| Destination | Items |
|-------------|-------|
| **Khora/S0** | pre-agent-run.sh, post-agent-run.sh (as hook stubs) |
| **Khora (partial)** | subagent-discharge.sh (session metadata portion only) |
| **Pleroma** | pre-epi-command.sh, post-epi-command.sh, postflight-verify.sh, worktree-cleanup.sh, model-status.md |
| **Anima** | preflight-validate.sh |
| **Aletheia** | graph-context.md |
| **DELETE** | root-hooks/README.md, core-verify.md |
| **test/ or CI** | verify_*.sh, pleroma-evals/ |
| **No change / Further review** | settings.json, plugin.json, Quaternal-Logic.c, epi-logos-plugin/ |

---

## G. Ambiguities & Open Decisions

### G.1 Contradictions

**G.1.1: `.epi-logos.env` vs `~/.epi-logos/env/base.env`**

The S4-NOW spec references `.epi-logos.env` (Khora/S0: "Shell profile: .epi-logos.env sourced on session start") AND `~/.epi-logos/env/base.env` (Khora Integration: "Load base.env (static config)"). It is unclear whether these are the same file with two names, or two different files with different roles. The bootstrap flow shows `base.env` being loaded, but the shell profile section references `.epi-logos.env` as if it were a separate dotfile in the repo root.

**Resolution needed:** Define whether `.epi-logos.env` is a generated aggregate (output of varlock inject) or a separate static file. Clarify the relationship to `base.env`.

---

**G.1.2: NOW.md as Bootstrap Source vs Runtime State**

The PREINSTALL-CLOSURE-CHECKLIST.md asserts: "Bootstrap excludes NOW direct file injection as a bootstrap source; NOW is session-scoped runtime state." But the S4-NOW spec's bootstrap sequence includes `NOW.md` as step 5 of 6 in the bootstrap file loading order.

**Resolution needed:** Is NOW.md a bootstrap input (loaded at startup) or purely a runtime output (written during session)? The contradiction may be between the archival planning docs (which prohibit NOW as bootstrap source) and the newer spec (which includes it in bootstrap). The distinction may be: NOW.md as a POINTER file (which session is active) vs NOW.md as CONTENT (the session's actual state).

---

**G.1.3: Khora vs Chronos Ownership of NOW Folder Creation**

The session lifecycle flow (S4-NOW spec Section VIII) shows: "Chronos: create Day folder if needed" and "Chronos: create NOW folder within today." But the S4-TA-ONTA-EXTENSION-SPEC says Khora owns session init, and session init includes "Create NOW folder in vault." The delegation boundary is unclear.

**Resolution needed:** Define the exact protocol: Does `epi agent session init` (Khora) call `epi vault now-init` (Chronos)? Or does Khora directly create the folder? If delegation, what is the interface (CLI call, event, function call)?

---

### G.2 Underspecifications

**G.2.1: CONTINUATION.md Schema**

No spec defines the format, required fields, or size constraints of CONTINUATION.md. Questions:
- Is it pure markdown or structured (YAML frontmatter + body)?
- What fields MUST be captured? (active coordinates? current task? pending operations? conversation summary?)
- Is there a maximum size? (The file must survive context compression, so it should be compact)
- Is it human-readable or machine-parseable?

---

**G.2.2: Session ID Collision Handling**

The session ID format `{YYYYMMDD-HHmmss-randomId}` is specified, but:
- What is the length/alphabet of `randomId`?
- Is there collision detection?
- What happens if two sessions are created within the same second?

---

**G.2.3: Sync Queue JSONL Schema**

`.khora-sync-queue.jsonl` is named but its entry format is not defined:
- What operation types are valid? (upsert_node, create_edge, update_property?)
- What is the target coordinate format?
- How is the payload structured?
- How are partial flush failures handled? (retry? dead letter? discard?)

---

**G.2.4: Redis Unavailability Fallback**

The spec says "Write session metadata to Redis (if cache layer ready)" but does not define:
- What "not ready" means (connection refused? timeout? auth failure?)
- What the fallback behaviour is (filesystem-only? in-memory only? fail-fast?)
- Whether coordinate locks (FR-K-020) work without Redis
- Whether the sync queue operates differently without Redis

---

**G.2.5: Bootstrap File Location Resolution**

The bootstrap sequence loads CONTINUATION -> ANIMA -> PARADIGM -> MEMORY -> NOW -> TOOLS, but:
- Where do these files live? (In the vault? In `Empty/Present/`? In `~/.epi-logos/`?)
- Are they per-repo, per-vault, or global?
- The S4-NOW spec shows `CONTINUATION.md`, `ANIMA.md`, `PARADIGM.md`, `MEMORY.md` in `/Idea/Empty/Present/` but the shared path service (US-003) does not exist yet to canonicalise these paths.

---

**G.2.6: varlock Installation and Availability**

varlock is specified as the secrets injection tool, but:
- Is varlock a real, published tool? (Not widely known in the Rust/JS ecosystem)
- What is its installation method? (`cargo install varlock`? `brew install varlock`?)
- What happens if varlock is not installed? (Fallback to manual `.env`? Fail-fast?)
- Can `epi agent doctor` detect varlock availability?

---

### G.3 Unmade Decisions

**G.3.1: PI Agent vs Claude Code Boundary**

Khora's hook registration (`extension.ts`) assumes a PI agent runtime. But the current project also uses Claude Code (this tool). The conformance remediation plan's US-038 explicitly mentions "claude-mem dual-harness parity contract across Claude Code and OpenClaw external paths." It is unclear:
- Does Khora bootstrap differently for PI vs Claude Code sessions?
- Are the CLI commands (`epi agent session init`) used by both, or only PI?
- Does `extension.ts` exist only for PI, while Rust handles Claude Code sessions?

---

**G.3.2: Session Scope for Multi-Agent Scenarios**

When multiple agents run concurrently (Anima dispatches subagents), each subagent needs session context. The spec mentions "sub-session support" but does not define:
- Do subagents get their own session IDs or share the parent's?
- If own IDs, what is the parent-child session ID relationship?
- Do subagents get their own NOW folders?
- How does session_depth work across parent/child sessions?

---

**G.3.3: Khora's Relationship to `epi-session.sh`**

The tmux session management script (`~/.config/epi/epi-session.sh`) creates windows for dashboard, agents, and work. This is operationally similar to Khora's session init. Is `epi-session.sh`:
- A predecessor that Khora replaces?
- A parallel system that coexists (tmux sessions vs Khora logical sessions)?
- An S0 primitive that Khora wraps?

---

**G.3.4: Coordinate Lock Granularity**

FR-K-020 specifies coordinate-level locks (`locks:coordinate:{coordinate}`), but:
- Is the lock per-coordinate (e.g., `M2`) or per-coordinate-instance (e.g., `M2` in session X)?
- What is the lock TTL?
- Who releases the lock? (Session close? Explicit unlock? TTL expiry?)
- Does this prevent concurrent READ or only concurrent WRITE?
- Is this needed for MVP, or is it a future feature?

---

### G.4 Unclear Implementation Paths

**G.4.1: FFI Session Bridge**

Khora needs to call `m0_init()` and read M5's `session_depth`. The FFI bridge (`epi-cli/src/ffi/mod.rs`) exists and uses `dlopen`. But:
- Are `m0_init` and `m5_advance_logos` currently exported as C symbols?
- Does the FFI bridge expose them?
- Is session_depth a struct field or a function return?
- What is the memory ownership model? (Who allocates/frees?)

---

**G.4.2: extension.ts as PI Entry Point**

The S4-TA-ONTA spec says each extension has an `extension.ts` that PI loads. But:
- PI is not installed (`pi` binary not available)
- The TypeScript files listed in `plugins/ta-onta/` are from `.pi/extensions/` (PI-specific format)
- If PI is not installed, is `extension.ts` dead code?
- Can the Rust CLI simulate what `extension.ts` would do, for Claude Code sessions?

---

**G.4.3: Shared Path Service Implementation**

US-003 ("Implement shared ta-onta path service") is a dependency for US-005 (Khora path refactoring). But:
- The path service does not exist yet
- No API is defined (Rust trait? TypeScript interface? CLI command? Config file?)
- Who implements it? (It's "shared" across all extensions, so is it a ta-onta-level concern?)
- Can Khora proceed with a temporary hardcoded path configuration until the service exists?

---

### G.5 Unbuilt Dependencies

| Dependency | Required By | Current Status | Blocker For |
|------------|-------------|----------------|-------------|
| **Shared path service** (US-003) | FR-K-019, US-K-010 | NOT STARTED | All Khora file operations without hardcoded paths |
| **PI agent binary** | FR-K-018, US-K-012 | NOT INSTALLED | extension.ts hook registration |
| **varlock** | FR-K-005, US-K-004 | NOT INSTALLED, possibly fictional | Secrets materialisation |
| **Redis** (S2 layer) | FR-K-008, FR-K-020 | STUB (docker-compose exists, client not implemented) | Session metadata, coordinate locks |
| **Neo4j** (S2 layer) | FR-K-013 (sync queue flush target) | STUB | Sync queue flush |
| **obsidian-cli** | FR-K-017 (NOW folder creation) | NOT INSTALLED | Vault operations delegation to Chronos |
| **Session subcommand in AgentCmd** | FR-K-006 | NOT IMPLEMENTED | All session lifecycle CLI commands |
| **FFI bindings for m0_init / m5 session_depth** | FR-K-009, FR-K-010 | PARTIAL (FFI exists, specific bindings unclear) | M0/M5 integration |
| **Chronos extension** | FR-K-017 | NOT IMPLEMENTED | NOW folder creation delegation |
| **Hen extension** | FR-K-013 (sync queue consumer) | NOT IMPLEMENTED | Sync queue flush to Neo4j |

### G.6 Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Parallel bootstrap** -- Khora reinvents bootstrap instead of extending native | HIGH | Gate 1 enforcement: explicit conformance checklist item |
| **Missing shared path service** -- Khora hardcodes paths as workaround | MEDIUM | Implement minimal path config (TOML) as temporary bridge |
| **Redis dependency before S2 readiness** -- Session metadata requires Redis | MEDIUM | Implement filesystem-only fallback for session state |
| **PI not installed** -- extension.ts cannot be tested or loaded | HIGH | Implement Khora session lifecycle in Rust (epi-cli) first; PI extension.ts as future bridge |
| **varlock may not exist** -- Secrets management blocked | MEDIUM | Fallback to manual `.env` loading + 1Password CLI direct calls |
| **Session ID collision** -- Sub-second session creation | LOW | Use UUID v7 (time-ordered) or add microsecond precision |
| **CONTINUATION.md undefined schema** -- Implementers guess format | MEDIUM | Define minimal schema before implementation (coordinate list + task summary + key-value pairs) |

---

## Appendix: Cross-Reference to Conformance Remediation US Ledger

The following US rows from the 53-US conformance remediation plan are directly relevant to Khora (Lane A):

| US | Title | Khora Relevance |
|----|-------|-----------------|
| US-003 | Implement shared ta-onta path service | Khora dependency (consumes path service) |
| US-005 | Refactor Khora filesystem writes to shared path service | Direct Khora work |
| US-015 | Constrain Khora queue to minimal operational contract | Direct Khora work |
| US-016 | Enforce fail-fast error policy | Khora must implement |
| US-021 | Wire native hook/invocation surfaces as mandatory shared seam | Khora hook registration |
| US-022 | Implement hook/lifecycle observability contract | Khora hook observability |
| US-025 | Centralize runtime credential access through 1Password | Khora secrets management |
| US-031 | Centralize session naming/parsing helpers | Khora session identity |
| US-032 | Normalize Khora lifecycle session identity, make finalization idempotent | Direct Khora work |
| US-034 | Wire native session-propagation spine | Khora child session inheritance |
| US-035 | Materialize bootstrap-safe PARADIGM kernel | Khora bootstrap content |
| US-038 | Wire claude-mem dual-harness parity | Khora PI-vs-Claude-Code boundary |

---

*"The pattern reveals itself through repetition."* -- The Quintessence

*Generated: 2026-03-10*
*Source corpus: 34 documents across 3 archive directories*
*Total FRs: 20 | Total USs: 13 | Ambiguities/Open Decisions: 19*
