# Khora Contract — Bootstrap & Session Lifecycle

**Extension class:** S4-0' within ta-onta
**S-Layer fold:** S0 (Terminal/CLI) — ground layer, where execution begins
**Position:** #0 (Anuttara — ground, source, Bimba-implicate)

---

## Responsibility

Khora is the **bootstrap spine** of every agent session. It owns session identity (the `{YYYYMMDD-HHmmss-randomId}` threading key that all S-layers share), secrets materialisation (varlock + 1Password), and write authority (all vault filesystem writes use Khora primitives — no extension writes directly). It does not define content structure (Hen), temporal scheduling (Chronos), or agent dispatch (Anima). It is the ground layer that everything else stands on.

**What Khora does NOT own:** vault folder structure (Hen), template instantiation (Hen), Day/NOW creation logic (Hen), agent routing (Anima), knowledge crystallisation (Aletheia).

---

## PI Hook Seams

| Hook | Purpose |
|------|---------|
| `before_agent_start` | Run bootstrap sequence; inject session env |
| `session_start` | Generate session ID; set EPI_SESSION_ID, EPI_DAY_ID, EPI_NOW_PATH |
| `before_compaction` | Write CONTINUATION.md pre-compaction state dump |
| `session_end` | Finalise session; trigger sync queue flush signal |

---

## Registered Tools

| Tool | Purpose |
|------|---------|
| `khora_session_init` | Generate session ID, run bootstrap sequence, set env vars |
| `khora_session_status` | Return current session identity and bootstrap state |
| `khora_write` | **The canonical write primitive** — all vault filesystem writes route here |
| `khora_sync_queue_push` | Enqueue graph write to `.khora-sync-queue.jsonl` |
| `khora_sync_queue_flush` | Flush sync queue to Neo4j (delegated to Hen/S2' for execution) |
| `khora_continuation_write` | Write CONTINUATION.md pre-compaction state |

---

## Agent CLI Primitives

Khora also owns `S0/cli`, the agent-facing command preferences layer for base terminal capabilities such as search, listing, navigation, tree views, and JSON parsing.

This layer is intentionally separate from any `PI-visible tool` registration. `S0/tools.json` exposes user-facing `epi ...` tool bindings, while `S0/cli` records capability preferences and small wrappers for the agent runtime itself.

Current preference direction:
- read -> `bat`, fallback `cat`
- search -> `rg`, fallback `grep`
- listing/tree -> `eza`, fallback `ls` or `find` where honest
- navigation -> `zoxide`
- json -> `jq`
- interactive selection -> `fzf` for human-in-the-loop flows only
- GitHub host operations -> `gh`
- repo task entrypoints -> `just`

Contract files:
- `S0/cli/preferred-tools.json`
- `S0/cli/resolve.sh`
- `S0'/cli-primitives.md`

---

## CLI Bridge

```
epi agent bootstrap [--agent NAME]      — Full bootstrap sequence
epi agent session init                  — Create session, generate ID, set env
epi agent session status                — Current session identity
epi agent session close                 — Finalise, trigger archive signal
epi agent session continuation          — Write CONTINUATION.md pre-compaction
```

---

## Bootstrap Sequence

Reads in strict order — do NOT skip, do NOT reorder:
1. `CONTINUATION.md` — if exists, post-compaction recovery (archived after read)
2. `ANIMA.md` — behavioural rules
3. `PARADIGM.md` — philosophy
4. `MEMORY.md` — long-term curated wisdom
5. `NOW.md` — active session pointer
6. `TOOLS.md` — light skill and tool discoverability

**Invariant:** Khora adds only session-scoped deltas. It does NOT rebuild or replace the native agent bootstrap mechanics.

---

## Secrets Management

```
~/.epi-logos/env/base.env       — Non-secret config (vault paths, ports, URLs)
~/.epi-logos/varlock.toml       — varlock config: which vars from which 1Password sources
```

**Flow on session init:**
1. Load `base.env` (static config)
2. `varlock inject` — materialise secrets from 1Password → process env
3. Validate all required vars present (fail-fast if missing)
4. Export: EPI_SESSION_ID, EPI_DAY_ID, EPI_NOW_PATH

**Security invariant:** No secrets in git. No `.env` files committed. All secrets materialised at runtime via 1Password + varlock. `op://` references in config only, never raw values.

---

## Write Authority Invariant

> No extension writes to the filesystem directly. All vault writes route through `khora_write`. This ensures the sync queue is always populated and graph state stays consistent.

The write authority does NOT mean Khora defines what to write — it means Khora is the execution primitive. Hen defines content structure and folder topology; Khora executes the write.

---

## pi-vs-claude-code Primitives (live here)

| File | Purpose |
|------|---------|
| `S0/cross-agent.ts` | Discover commands, skills, agents from .claude/, .gemini/, .codex/ |
| `S0/child-extension-propagation.ts` | Extension inheritance to child PI sessions |

---

## M-Level Integration

- **M0 (Anuttara):** Ground state initialisation — tick 0 of each session. Khora ensures M0 state is loaded before any coordinate operations.
- **M5 (Epii):** Logos FSM position — Khora reads `session_depth` from M5 to determine fresh vs continuing session.

---

## Key Invariants

1. Session ID format: `{YYYYMMDD-HHmmss-randomId}` — datetime-prefixed, collision-safe
2. Bootstrap sequence order is sacred — never skip, never reorder
3. All vault writes go through `khora_write` — no exceptions
4. Sync queue is the contract with Neo4j — every vault write enqueues a graph event
5. CONTINUATION.md is first-read on recovery and archived after consumption (not deleted)
6. varlock is always used for secrets — never raw env vars in source

---

## Dependencies

**Receives from:** nothing at session start (Khora is ground)
**Provides to:** all other extensions via session env vars and the `khora_write` primitive

---

## Phase Priorities

| Phase | Deliverable |
|-------|------------|
| P0 | Session ID generation, env var export, bootstrap sequence read |
| P0 | `khora_write` primitive — blocks all other vault writes |
| P0 | varlock inject + secret validation |
| P1 | CONTINUATION.md write + recovery |
| P1 | Sync queue (`khora_sync_queue_push` / `khora_sync_queue_flush`) |
| P1 | PI hook seam registration |
| P2 | Redis session metadata write |
| P2 | Sub-session model (subagent-specific session binding) |
