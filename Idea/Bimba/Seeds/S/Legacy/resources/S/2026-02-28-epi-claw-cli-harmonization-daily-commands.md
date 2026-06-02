# Epi-Claw CLI Harmonization & Daily Command Family

**Date**: 2026-02-28
**Status**: Architectural Design — captures the thread for S4 CLI surface development
**Coordinate**: S4 (Gateway/CLI surface) + S1' (QL Obsidian operations)

---

## Context

The epi-claw CLI currently exposes 25+ commands under the `openclaw` binary name. The system needs:
1. **Brand harmonization** — `epi-claw` as the primary user-facing name
2. **Daily/Obsidian command family** — `epi-claw daily`, `epi-claw now`, etc.
3. **Position-aware flag design** — `-p0` through `-p5` as P-coordinate section targeting

---

## Current CLI State

| Aspect | Current | Target |
|--------|---------|--------|
| Binary name | `openclaw` | `epi-claw` (primary alias) |
| Process title | `epi-claw` ✓ | `epi-claw` ✓ |
| Shell wrapper | `epi-claw.sh` ✓ | `epi-claw` ✓ |
| Env vars | `OPENCLAW_*` | `EPI_CLAW_*` (gradual migration) |
| Daily commands | None | `epi-claw daily` family |
| Obsidian commands | None | `epi-claw vault` / `epi-claw now` |

**Naming harmonization decision**: Add `epi-claw` as an explicit `bin` entry in `package.json` alongside `openclaw`. Transition docs/UX to `epi-claw` branding. Keep `openclaw` as backward-compatible alias indefinitely.

---

## Daily Command Family Design

### Primary Command: `epi-claw daily`

```
epi-claw daily [options] [text]

Options:
  -a, --append <text>    Append text to daily note (or current position if -p<n> set)
  -p<n>, --pos <n>       Target P-position section (0-5). Default: end of note.
  -r, --read             Read (print) the daily note or specific section
  --now                  Target the current NOW file instead of Day file
  --date <YYYY-MM-DD>    Target a specific date (default: today)
```

**Examples:**

```bash
# Read today's daily note
epi-claw daily -r

# Append to end of daily note
epi-claw daily -a "This insight needs capturing"

# Append from stdin (pipe form)
echo "Quick capture" | epi-claw daily -a

# Append to P5 (Synthesis/Integration) section
epi-claw daily -a "Key pattern discovered" -p5

# Append to P3 (Pattern) section
epi-claw daily -p3 -a "New archetype: the recursive mirror"

# Read only the P4 (Context) section
epi-claw daily -r -p4

# Target a specific date
epi-claw daily -a "Retrospective note" --date 2026-02-27

# Target NOW (current session context) instead of Day
epi-claw daily -a "Session note" --now
```

### Position Flag Semantics

| Flag | QL Position | Daily Note Section | Typical Content |
|------|------------|-------------------|-----------------|
| `-p0` | P0 Ground | `## #0 Ground` | Context, today's foundational thread |
| `-p1` | P1 Definition | `## #1 Definition` | What needs to be defined/clarified |
| `-p2` | P2 Operation | `## #2 Operation` | Tasks, operations, actions |
| `-p3` | P3 Pattern | `## #3 Pattern` | Patterns noticed, structural insights |
| `-p4` | P4 Context | `## #4 Context` | Temporal/spatial context, references |
| `-p5` | P5 Synthesis | `## #5 Synthesis` | Integrations, crystallizations |

When no position flag given, append goes to end of note (standard capture mode).

### Routing Architecture

```
User invokes: epi-claw daily -p5 -a "text"
    │
    ▼
S4 CLI (epi-claw/src/cli/daily-cli.ts)
    │  — parse flags: position=5, append="text"
    ▼
S1' QL Obsidian (s_i/modules/ql_obsidian/)
    │  — locate daily note at canonical Bimba path
    │  — find P5 section header
    │  — append text under P5
    ▼
S1 Obsidian CLI (s/modules/obsidian/)
    │  — raw file write via Obsidian CLI or direct fs (Khora-gated)
    ▼
Khora filesystem edge
    │  — validates path, queues sync, updates wikilink health
    ▼
Vault (live update)
```

---

## Additional Candidate Commands

### `epi-claw now`

```
epi-claw now [options]

Options:
  -r, --read             Read current NOW context
  -a, --append <text>    Append to current NOW
  --status               Show NOW ID, Day link, lineage
  --close                Close current NOW (trigger Aletheia closure)
```

### `epi-claw vault`

```
epi-claw vault [options]

Options:
  search <query>         Full-text search in vault
  -b, --bimba <coord>    Navigate to a coordinate's Bimba file
  --path <coord>         Print the canonical path for a coordinate
  --health               Validate wikilink health across vault
```

### `epi-claw gate`

```
epi-claw gate <gate-name> [context]

Gates: ql-gate | m-gate | s-gate | m-prime-gate | rupa-gate | collab-gate

# Trigger a specific Aletheia gate check
epi-claw gate ql-gate "about to write coordinate data to S3-2' module"
```

### `epi-claw bimba`

```
epi-claw bimba <coord> [options]

Options:
  -r, --read             Read the Bimba form for a coordinate
  -p<n>                  Read a specific QL position section
  --canvas               Open the coordinate's .canvas MOC
  --state                Show C0-C5 formation state (complete/partial/skeleton)
```

---

## S4 CLI Module Scope (Canonical Plan Extension)

The S4 CLI surface is the **user-facing and agent-facing interface** to the entire system. It is NOT a new runtime — it is the command-line skin over existing S1-S3 capabilities.

### CLI Module Layer (within S4 gateway)

```
.pi/extensions/s/modules/gateway/
└── modules/
    ├── epi_claw_runtime.ts     (existing gateway primitives)
    ├── daily_cli.ts            (new: daily note command routing)
    ├── vault_cli.ts            (new: vault navigation)
    ├── now_cli.ts              (new: NOW context commands)
    └── gate_cli.ts             (new: Aletheia gate invocation)
```

### CLI Registration Pattern

New commands register via the existing Commander pattern in `src/cli/program/register.subclis.ts`:

```typescript
// Addition to register.subclis.ts
{ path: path.join(__dirname, '../daily-cli'), name: 'daily' },
{ path: path.join(__dirname, '../vault-cli'), name: 'vault' },
{ path: path.join(__dirname, '../now-cli'), name: 'now' },
{ path: path.join(__dirname, '../gate-cli'), name: 'gate' },
{ path: path.join(__dirname, '../bimba-cli'), name: 'bimba' },
```

---

## Naming Harmonization: `package.json` Change

```json
{
  "bin": {
    "openclaw": "./dist/openclaw.mjs",
    "epi-claw": "./dist/openclaw.mjs"
  }
}
```

This makes `epi-claw` available as a first-class binary alias, resolving to the same entry point. `openclaw` remains as backward-compatible alias.

**Environment variable migration** (gradual):
- New variables use `EPI_CLAW_*` prefix
- `OPENCLAW_*` variables remain recognized for backward compat
- Migration guide added to docs

---

## Coordinate Authority

| Layer | Handles | File |
|-------|---------|------|
| S4 (gateway) | CLI command registration, arg parsing, routing | `epi_claw_runtime.ts` + `daily_cli.ts` |
| S1' (ql_obsidian) | Daily note path resolution, P-position targeting, section append | `ql_obsidian/day_now.ts` |
| S1 (obsidian) | Raw file read/write via Obsidian CLI | `obsidian/obsidian_cli.ts` |
| Khora (S3-0') | Filesystem edge: path validation, sync queue, wikilink health | `khora/filesystem-edge.ts` |

**Rule**: S4 CLI commands NEVER write directly to vault. All writes route through S1' → S1 → Khora. The CLI is a routing surface, not a filesystem actor.

---

## Development Priority

| Item | Status | US Story |
|------|--------|----------|
| `epi-claw` binary alias in package.json | Simple — add 1 line | — |
| `daily-cli.ts` command registration | New file, ~80 lines | US-NEW-DAILY |
| S1' `day_now.ts` position-aware append | Core S1' work | US-NEW-DAILY-WRITE |
| `vault-cli.ts` and `bimba-cli.ts` | After daily works | US-NEW-VAULT |
| `gate-cli.ts` | After Aletheia gates implemented | US-NEW-GATE |
| `OPENCLAW_*` → `EPI_CLAW_*` migration | Gradual, non-breaking | US-NEW-ENV |

**Gating**: The `daily` command is the highest value first target. It directly enables `epi-claw daily -p5 -a "text"` as a core user-facing capability that the whole planning system aspires to.
