# Chronos Contract — Temporal Pathing & Day/NOW Lifecycle

**Extension class:** S4-3' within ta-onta
**S-Layer fold:** S3 (Gateway/Transport) — relay layer, where time flows
**Position:** #3 (Mahamaya — pattern, process, temporal structure)

---

## Responsibility

Chronos is the **temporal authority** of the agent system. It owns the Day/NOW lifecycle (scheduling when folders are created and archived), periodic notes (weekly/monthly aggregation), the Möbius 6 AM window, evening archive scheduling, Z-Thread registration, and temporal thread continuity across day transitions. Chronos TRIGGERS creation events; Hen DEFINES and CREATES the structures. Chronos TRIGGERS archival; the filesystem moves are executed via Khora's write primitive.

**What Chronos does NOT own:** NOW folder structure definition (Hen), template instantiation (Hen), thought classification (Aletheia), agent dispatch (Anima), secrets/session identity (Khora).

---

## PI Hook Seams

| Hook | Purpose |
|------|---------|
| `session_start` | Trigger day-init if today's Day folder absent; trigger now-init |
| `session_end` | Signal archive readiness; update CONTINUATION.md temporal context |
| `cron_6am` | Möbius window — new Day folder; SEED.md as morning-context package |
| `cron_evening` | Archive Day folder; trigger Aletheia Möbius crystallisation |

---

## Registered Tools

| Tool | Purpose |
|------|---------|
| `chronos_day_init` | Trigger Hen to create today's Day folder + daily-note.md |
| `chronos_now_init` | Trigger Hen to create NOW folder within today |
| `chronos_archive_day` | Rotate Day folder to Pratibimba History archive |
| `chronos_cron_register` | Register a cron job via gateway `cron.add` |
| `chronos_temporal_status` | Current Day, active NOWs, archive backlog |

---

## CLI Bridge

```
epi vault day-init                       — Trigger Day folder creation (Hen executes)
epi vault now-init --session-id <id>     — Trigger NOW folder creation (Hen executes)
epi vault archive-day <date>             — Rotate Day → Pratibimba archive
epi vault periodic-init --weekly/--monthly
```

---

## Filesystem Lifecycle (Chronos triggers, Hen + Khora execute)

### Daily Path Structure

```
/Idea/Empty/Present/
  NOW.md                               — Active session pointer (updated by Hen)
  CONTINUATION.md                      — Pre-compaction state dump
  ANIMA.md, PARADIGM.md, MEMORY.md    — Bootstrap files (Khora reads)
  SEED.md                              — Morning-context package (Aletheia crystallises, Chronos reads at 6 AM)
  {DD-MM-YYYY}/                        — Day folder (Hen creates on Chronos trigger)
    daily-note.md
    {YYYYMMDD-HHmmss-sessionId}/       — NOW folder (Hen creates on session start)
```

### SEED.md — Morning Context Package

SEED.md is NOT a bootstrap fallback only. It is the **morning-context package** crystallised by Aletheia from the previous evening's reflection. It contains:
- Yesterday's P5' insights reframed as today's P0' questions
- Carried-forward tasks and context from TOMORROW.md (itself archived after consumption)
- Aletheia's synthesis of the Möbius cycle

Location: `/Idea/Empty/Present/SEED.md` — adjacent to ANIMA.md, PARADIGM.md, MEMORY.md. Consumed at 6 AM Day folder creation; refreshed by Aletheia evening cycle.

**`/Idea/Bimba/Seeds/` is entirely different** — coordinate-addressed development planning surface for system specs and seed README files. Not managed by Chronos.

### Archive Path

```
Source:      /Idea/Empty/Present/{DD-MM-YYYY}/
Destination: /Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/W{WW}/{DD}/
```

Week directory (`W{WW}`) is canonical. Archive blocked unless `reflection_complete: true` in daily-note frontmatter (or `--force` flag).

---

## Temporal Lifecycle Events

| Event | Trigger | Action |
|-------|---------|--------|
| 6 AM (Möbius window) | Cron `0 6 * * *` | Create Day folder; read SEED.md; clear yesterday's `thoughts/` |
| Session start | Khora `session_start` hook | Create NOW folder within today; create `thinking/` + `thoughts/` |
| Task completion | Anima signal | Sophia classifies `thinking/` → moves to `thoughts/` |
| Session end | Khora `session_end` hook | Route `thoughts/` to T-buckets (Aletheia trigger) |
| Evening (configurable, default 11 PM) | Cron `0 23 * * *` | Archive Day → History; trigger Aletheia Möbius engine |

---

## Periodic Notes

| Period | Path | Frontmatter | Archive Cycle |
|--------|------|-------------|---------------|
| Daily | `Present/{DD-MM-YYYY}/daily-note.md` | `period_type: daily` | Evening cron |
| Weekly | `Present/Week-{WW}-{YYYY}.md` | `period_type: weekly` | Friday evening cron |
| Monthly | `Present/Month-{MM}-{YYYY}.md` | `period_type: monthly` | Last day of month cron |

Weekly notes aggregate daily P5' insights. Monthly notes distill weekly patterns.

---

## Gateway Integration (Tranche A vs B)

**Tranche A — no gateway needed (immediately implementable):**
- `epi vault day-init`, `epi vault now-init`, `epi vault archive-day` via Rust CLI
- Manual invocation of all temporal lifecycle operations
- Hen-executed filesystem operations

**Tranche B — requires S3 gateway:**
- Cron job registration (`cron.add`/`cron.run`)
- Z-Thread heartbeat registration
- Automated scheduling (6 AM, 11 PM)
- Telegram notification dispatch

Z-Thread = Chronos's view of the heartbeat runner. Not a separate mechanism — it IS the heartbeat, named from Chronos's perspective as the background temporal-awareness thread.

---

## M-Level Integration

- **M1 (Paramasiva):** QL tick — temporal pulse. The clock that drives session boundaries.
- **M4 (Nara):** NOW personal identity — current journal, oracle, cycle position. Enriches NOW identity and feeds Kairos context into daily-note #4.

**Kairos:** Informational metadata for daily-note Position #4 (M4 oracle state + M2 planetary context → opportune/guarded/neutral). NOT a scheduling constraint. Phase N concern.

---

## Key Invariants

1. Chronos TRIGGERS — Hen CREATES. Chronos never directly instantiates vault files.
2. Archive path includes weekly dir: `{YYYY}/{MM}/W{WW}/{DD}/` — no exceptions
3. SEED.md at `/Empty/Present/SEED.md` only — `/Bimba/Seeds/` is a completely separate concern
4. Evening archive requires `reflection_complete: true` or explicit `--force`
5. Z-Thread = heartbeat runner — do not implement as a separate threading mechanism
6. Tranche A (filesystem) is always available; Tranche B requires S3 gateway
7. TOMORROW.md content seeds next day's #0 then is archived — not a permanent file

---

## Dependencies

**Receives from:**
- Khora: session ID, session start/end hooks, `khora_write` primitive
- Hen: template instantiation for Day/NOW creation, frontmatter schema for archive operations
- Aletheia: SEED.md (morning-context package from evening crystallisation)
- S3 Gateway: cron.add/cron.run for automated scheduling (Tranche B)

**Provides to:**
- Khora: Day folder exists at bootstrap time (pre-condition for session init)
- Hen: temporal context for template frontmatter (day_id, session_id, period_type)
- Anima: Day lifecycle events, session temporal boundaries
- Aletheia: evening archive trigger → Möbius crystallisation cycle start

---

## Phase Priorities

| Phase | Deliverable |
|-------|------------|
| P0 | `epi vault day-init` (Chronos trigger → Hen creates) |
| P0 | `epi vault now-init` (session start trigger → Hen creates including `thinking/` + `thoughts/`) |
| P0 | `epi vault archive-day` (filesystem rotation with weekly dir path) |
| P1 | SEED.md read at 6 AM + consumption flow |
| P1 | TOMORROW.md processing (seed to next day's #0, then archive) |
| P1 | Temporal thread continuity (P5 → P0 Möbius across days) |
| P2 | Periodic notes (weekly/monthly init, archive) |
| P2 | Tranche B: gateway cron registration, Z-Thread heartbeat |
| P2 | Telegram daily digest notification |
| P3 | Kairos interpretation (M4 oracle → opportune/guarded/neutral metadata) |
