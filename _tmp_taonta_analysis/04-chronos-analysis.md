# Chronos (#3) Extension Analysis — Functional Requirements & User Stories

**Status:** Pre-implementation analysis
**Date:** 2026-03-10
**Extension:** `plugins/ta-onta/chronos/` (S4-3': Temporal Pathing & Day/NOW Lifecycle)
**Coordinate:** S3/S3' folded into S4-3' agent layer
**Directory Status:** Does not yet exist (`plugins/ta-onta/chronos/` is empty)

---

## Source Documents Analysed

| # | Document | Location | Relevance |
|---|----------|----------|-----------|
| 1 | DAY-AS-CONTEXT-FRAMEWORK.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Constitutional meaning of Day, CT4' meta-framework, inner 0-5 structure |
| 2 | CT4b-MASTER-TEMPLATE.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | CT4b' fractal structure, Day vs NOW, Chronos operations list |
| 3 | daily-note-schema.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Position mapping, frontmatter schema, column definitions |
| 4 | daily.md (daily entry task processor) | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Complexity assessment, QL cycle, directory scaffold |
| 5 | daily-notes.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Daily note as system hub, emptying protocol |
| 6 | daily-archive.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | 2-day temporal window, archive path, learning extraction |
| 7 | daily-go.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Subagent execution from daily entries, parallel dispatch |
| 8 | daily-standup.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Morning parse of Daily Note #0, presentation format |
| 9 | daily-reflect.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Evening reflection, DAY-REVIEW.md, TOMORROW.md creation |
| 10 | Daily Note Template.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Canonical frontmatter + 6-position content scaffold |
| 11 | cron.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Gateway cron CLI reference |
| 12 | cron-jobs.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Cron architecture: schedules, main vs isolated, payloads, delivery |
| 13 | cron-add-hardening.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Schema alignment, normalization fixes |
| 14 | cron-vs-heartbeat.md | ARCHIVE/22-02-2026-USEFUL-FOR-Ta-Onta/ | Decision guide: heartbeat for batched checks, cron for exact timing |
| 15 | INSTALL-PLAN.md | ARCHIVE/ | Extension install order, verification tasks T4 (Chronos daily job), T9 (full daily cycle) |
| 16 | LEMNISCATE_DEV_STRATEGY.md | ARCHIVE/ | Chronos as S3-3' temporal context, boot sequence |
| 17 | epi-session-harmonization-and-zsh-perf.md | Epi-Logos/docs/plans/ | Tmux session layout, epi-session.sh |
| 18 | epi-claw-cli-harmonization-daily-commands.md | Epi-Logos/docs/plans/ | `epi-claw daily` command family, position flags, routing architecture |
| 19 | tilldone-dispatch-design.md | Epi-Logos/docs/plans/ | Coverage-gated subagent dispatch pattern |
| 20 | S4-NOW-INTEGRATION-AND-ENVIRONMENT.md | docs/specs/S/S4/ | Section IV: Chronos inner layers (S1, S1', S3, S5, M) |
| 21 | S4-TA-ONTA-EXTENSION-SPEC.md | docs/specs/S/S4/ | Ta-onta package structure, Chronos slot definition |
| 22 | S3-S3i-GATEWAY.md | docs/specs/S/ | Full S3 gateway spec, cron RPC surface, 75+ methods |
| 23 | S-STACK-INTEGRATION.md | docs/specs/S/ | Integration matrix, data flow patterns |
| 24 | gate/mod.rs | epi-cli/src/gate/ | Existing Rust gateway stub (22 modules declared, cron included) |

---

## A. Functional Requirements (FRs)

### A.1 Day Filesystem Lifecycle

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-001** | Create Day folder (`/Idea/Empty/Present/{DD-MM-YYYY}/`) at 6 AM or on first session start of the day, containing `daily-note.md` and `daily-note.canvas` | [2] CT4b, [20] S4-NOW IV | S4-NOW Sec IV: "6 AM (Mobius window): Chronos creates new Day folder" | P0 |
| **FR-C-002** | Generate `daily-note.md` as CT4b' template with full 6-position content spaces (#0-#5), correct frontmatter schema (uuid, created, type:daily, ql_position:#4, ct4b_frame, per-position arrays) | [3] schema, [10] template, [20] S4-NOW III | S4-NOW Sec III (Hen/S1' CT template) | P0 |
| **FR-C-003** | SEED.md fallback: if no prior Day exists at 6 AM Mobius window, bootstrap from SEED.md instead of yesterday's synthesis | [15] INSTALL-PLAN T6, [20] S4-NOW IV | S4-NOW: "SEED.md fallback if no prior Day exists" | P1 |
| **FR-C-004** | Day folder must contain only datetime-prefixed NOW subfolders — FORBIDDEN: sequential counters (`now-1/`), undifferentiated `now/` global name | [20] S4-NOW IV | S4-NOW: "CRITICAL NAMING RULES" | P0 |

### A.2 NOW Filesystem Lifecycle

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-005** | Create NOW folder (`{YYYYMMDD-HHmmss-sessionId}/`) within today's Day folder on session start, containing `now.md`, `now.canvas`, `tasks/`, `patterns/`, `thoughts/` subdirectories | [20] S4-NOW IV | S4-NOW Sec IV: full path structure listed | P0 |
| **FR-C-006** | Generate `now.md` as CT4b' template at Session scope (same archetype as daily-note, same 6 content spaces), with session-scoped frontmatter (artifact_role:now, ctx_type:CT4b, session_id, day_id, parent_day_id wikilink) | [20] S4-NOW III | S4-NOW Sec III template invocation | P0 |
| **FR-C-007** | Maintain `NOW.md` as active session pointer file in `/Idea/Empty/Present/` pointing to the current NOW folder | [20] S4-NOW IV | S4-NOW: path structure shows NOW.md at Present/ root | P1 |
| **FR-C-008** | Write `CONTINUATION.md` pre-compaction state dump before session ends, enabling post-compaction recovery | [20] S4-NOW I, IV | S4-NOW Sec I: "CONTINUATION.md — pre-compaction state dump (survives restart)" | P1 |

### A.3 Archive Scheduling

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-009** | Evening cron job archives Day folder: `/Idea/Empty/Present/{DD-MM-YYYY}/` -> `/Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/` | [6] daily-archive, [20] S4-NOW IV | S4-NOW Sec IV: exact archive path given | P0 |
| **FR-C-010** | Maintain 2-day temporal window in `/Present/`: keep today + yesterday, archive day-before-yesterday | [6] daily-archive | Not in S4 spec (from planning docs only) | P1 |
| **FR-C-011** | Pre-condition check: archive BLOCKED unless `reflection_complete: true` in daily note frontmatter (or `--force` flag) | [6] daily-archive | Not in S4 spec (from planning docs only) | P2 |
| **FR-C-012** | Process TOMORROW.md: content seeded to next day's #0, then archive TOMORROW.md to today's History folder | [6] daily-archive, [9] daily-reflect | Not in S4 spec | P2 |
| **FR-C-013** | Process DAY-REVIEW.md: synthesis logged to Daily Note #5, then archive/clean | [6] daily-archive, [9] daily-reflect | Not in S4 spec | P2 |
| **FR-C-014** | Extract learnings from archived Daily Note #5 and route to Thought directories: insights -> `Thought/Insight/`, patterns -> `Thought/Patterns/`, questions -> `Thought/Questions/`, challenges -> `Thought/Challenges/` | [6] daily-archive, [5] daily-notes | Not in S4 spec (but aligns with Thought Stream in S4-NOW) | P2 |
| **FR-C-015** | Set `archived: true` and `archived_date` in archived daily note frontmatter | [6] daily-archive | Not in S4 spec | P2 |

### A.4 Thought Stream & T-Directories

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-016** | Route thought artifacts from `{NOW}/thoughts/` to positional T-directories: T0/ (Questions), T1/ (Traces), T2/ (Challenges), T3/ (Patterns), T4/ (Discovery), T5/ (Insight) at path `/Idea/Pratibimba/Self/Thought/T{n}/` | [20] S4-NOW IV | S4-NOW Sec IV: full T-directory listing with positional semantics | P1 |
| **FR-C-017** | Thought lifecycle: Generation (agents create in NOW/thoughts/) -> Routing (Sophia/Aletheia classify by T-position) -> Archival (move to T{n}/ with datetime filename) -> Recollection (gnosis query) -> Distillation -> Packaging | [20] S4-NOW IV | S4-NOW Sec IV: 7-step thought lifecycle | P1 |
| **FR-C-018** | CLI command `epi vault thought-route --position N` to write thought to T{n} bucket | [20] S4-NOW VII | S4-NOW Sec VII: missing commands list | P2 |

### A.5 Periodic Notes

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-019** | Weekly notes at `Present/Week-{WW}-{YYYY}.md` with `period_type: weekly`, aggregating daily insights, archived Friday evening | [20] S4-NOW IV | S4-NOW Sec IV: Periodic Notes table | P2 |
| **FR-C-020** | Monthly notes at `Present/Month-{MM}-{YYYY}.md` with `period_type: monthly`, distilling weekly patterns, archived last day | [20] S4-NOW IV | S4-NOW Sec IV: Periodic Notes table | P3 |
| **FR-C-021** | Integration with Obsidian Periodic Notes plugin for weekly/monthly organisation | [20] S4-NOW III | S4-NOW Sec III: "Periodic Notes (community): weekly/monthly organisation" | P3 |

### A.6 Morning & Evening Rituals

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-022** | Morning standup (`daily-standup`): parse today's Daily Note #0, identify entries awaiting expansion, show active tasks, present yesterday's incomplete items | [8] daily-standup | Not in S4 spec (planning doc skill) | P2 |
| **FR-C-023** | Evening reflection (`daily-reflect`): generate DAY-REVIEW.md from day analysis, present contemplation prompts, await user dialogue, log synthesis to #5, create TOMORROW.md with Mobius seeds | [9] daily-reflect | Not in S4 spec (planning doc skill) | P2 |
| **FR-C-024** | Mobius return: today's #5 (Synthesis) seeds tomorrow's #0 (Ground Reception) — `4.5 -> 4.0` cycle continuation | [1] DAY-AS-CONTEXT, [2] CT4b | S4-NOW Sec IV: "Yesterday's P5' insights -> today's P0' questions" | P1 |

### A.7 Gateway Temporal Integration (Cron/Heartbeat/Z-Thread)

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-025** | Register cron jobs via gateway `cron.add` / `cron.run` methods for scheduled temporal operations (6 AM day creation, evening archive) | [11][12] cron docs, [20] S4-NOW IV | S4-NOW Sec IV: "Cron jobs via gateway cron.add/cron.run methods" | P1 |
| **FR-C-026** | Z-Thread heartbeat registration for periodic tasks (session health, temporal awareness checks) | [20] S4-NOW IV | S4-NOW Sec IV: "Z-Thread (heartbeat) registration for periodic tasks" | P2 |
| **FR-C-027** | Cron job storage persisted to `~/.clawdbot/cron/jobs.json` (or Rust equivalent), survives restarts | [12] cron-jobs | S3-GATEWAY Sec V: cron.* methods in parity list | P2 |
| **FR-C-028** | Support both main-session (system event via heartbeat) and isolated (dedicated agent turn) cron execution modes | [12] cron-jobs, [14] cron-vs-heartbeat | Not in S4 spec (from epi-claw cron architecture) | P2 |
| **FR-C-029** | Cron schedule types: `at` (one-shot timestamp), `every` (fixed interval ms), `cron` (5-field expression with timezone) | [12] cron-jobs | S3-GATEWAY: cron.add in parity list | P2 |

### A.8 Temporal Threading & Context Continuity

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-030** | Maintain temporal thread continuity across day transitions: previous day's P5 flows to next day's P0 via TOMORROW.md / SEED.md | [1] DAY-AS-CONTEXT, [24] CT4b | S4-NOW Sec I, IV | P1 |
| **FR-C-031** | CT4b' as time-period meta-framework: support Day, Week, Session, Sprint, Project instances all using same fractal structure | [1] DAY-AS-CONTEXT, [2] CT4b | Not in S4 spec (from planning docs) | P3 |
| **FR-C-032** | Nested contexts within Day Position #4: astrological (Kairos), life chapter, temporal hierarchy, info streams — each with own CT4' sub-structure | [1] DAY-AS-CONTEXT, [2] CT4b | Not in S4 spec (from planning docs) | P3 |

### A.9 CLI Bridge Commands

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-033** | `epi vault day-init` — create today's Day folder + daily-note.md from CT4b' template | [20] S4-NOW VII | S4-NOW Sec VII: explicit CLI command listed | P0 |
| **FR-C-034** | `epi vault now-init --session-id <id>` — create NOW folder with datetime prefix within today's Day | [20] S4-NOW VII | S4-NOW Sec VII: explicit CLI command listed | P0 |
| **FR-C-035** | `epi vault archive-day <date>` — rotate Day folder to Pratibimba archive path | [20] S4-NOW VII | S4-NOW Sec VII: explicit CLI command listed | P1 |
| **FR-C-036** | `epi vault thought-route --position N` — write to T{n} bucket | [20] S4-NOW VII | S4-NOW Sec VII: explicit CLI command listed | P2 |
| **FR-C-037** | `epi vault periodic-init --weekly/--monthly` — create periodic note | [20] S4-NOW VII | S4-NOW Sec VII: explicit CLI command listed | P3 |
| **FR-C-038** | `epi vault template-invoke <CTx> [--coord]` — invoke CT template for artifact generation | [20] S4-NOW VII | S4-NOW Sec VII: explicit CLI command listed | P2 |

### A.10 Daily Entry Processing (Position #0 Expansion)

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-039** | Parse Daily Note Position #0 entry table (ID, Capture, Type, Actions, Context columns) and expand to task workflow | [3] schema, [4] daily.md | Not in S4 spec (skill-level concern) | P2 |
| **FR-C-040** | Complexity assessment routing: LIGHT (0-3), STANDARD (4-7), DEEP (8-12) based on 6 factors (scope, domains, dependencies, research, subagent potential, integration points) | [4] daily.md | Not in S4 spec (skill-level concern) | P3 |
| **FR-C-041** | Create QL-aligned task directory scaffold: `0-ground/`, `1-definition/`, `2-resources/`, `3-plan/`, `4-execution/`, `5-synthesis/`, `artifacts/` | [4] daily.md | Not in S4 spec (skill-level concern) | P3 |

### A.11 Sync Layer Integration

| ID | Description | Source(s) | Spec Coverage | Priority |
|----|-------------|-----------|---------------|----------|
| **FR-C-042** | Archive scheduling triggers vault -> graph sync (Hen/S2 flush) | [20] S4-NOW IV | S4-NOW Sec IV: "Archive scheduling: evening cron triggers vault -> graph sync" | P2 |
| **FR-C-043** | Notification dispatch: Telegram daily digest with session lineage metadata | [20] S4-NOW IV | S4-NOW Sec IV: "Notification dispatch: Telegram with session lineage metadata" | P3 |
| **FR-C-044** | Daily digest generation from Day folder content at archive time | [20] S4-NOW IV | S4-NOW Sec IV: "Daily digest generation from Day folder content" | P3 |

---

## B. User Stories (USs)

### B.1 Day Lifecycle

**US-C-001: As a user, I want a new Day folder created automatically at 6 AM so that my daily workspace is ready when I start work.**

*Acceptance Criteria:*
- [ ] At 6 AM (Mobius window), Chronos creates `/Idea/Empty/Present/{DD-MM-YYYY}/`
- [ ] `daily-note.md` is generated from CT4b' template with all 6 position sections
- [ ] `daily-note.canvas` is created as MOC stub
- [ ] If no prior Day exists (first run), SEED.md fallback bootstrap is used
- [ ] Frontmatter includes: uuid, created, type:daily, ql_position:#4, ct4b_frame, per-position arrays (initially empty)
- [ ] The command `epi vault day-init` can also trigger this manually

**US-C-002: As an agent starting a session, I want a NOW folder created within today's Day so I have a bounded execution identity.**

*Acceptance Criteria:*
- [ ] NOW folder name follows `{YYYYMMDD-HHmmss-sessionId}` format
- [ ] Sequential counters and undifferentiated `now/` names are rejected
- [ ] `now.md` is CT4b' template at Session scope with 6 position sections
- [ ] `now.canvas`, `tasks/`, `patterns/`, `thoughts/` subdirectories are created
- [ ] Frontmatter includes session_id, day_id, parent_day_id wikilink
- [ ] `NOW.md` pointer file in `/Present/` updated to point to this folder
- [ ] The command `epi vault now-init --session-id <id>` triggers this

**US-C-003: As a user finishing my day, I want the evening archive to rotate old days to History while keeping a 2-day working window.**

*Acceptance Criteria:*
- [ ] Archive blocked unless `reflection_complete: true` or `--force` flag
- [ ] Day-before-yesterday moved to `/Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`
- [ ] Yesterday + today remain in `/Present/`
- [ ] TOMORROW.md processed (seeded to next day's #0, then archived)
- [ ] DAY-REVIEW.md processed (synthesis in #5, then archived)
- [ ] Archived daily note frontmatter updated: `archived: true`, `archived_date`
- [ ] `epi vault archive-day <date>` available for manual invocation

### B.2 Temporal Continuity

**US-C-004: As a user, I want today's synthesis (#5) to automatically seed tomorrow's ground (#0) so I never lose continuity.**

*Acceptance Criteria:*
- [ ] Evening reflection creates TOMORROW.md with carried-forward tasks, reflection outcomes, context
- [ ] Next morning, TOMORROW.md content seeds new daily-note Position #0
- [ ] If no TOMORROW.md exists, SEED.md fallback is used
- [ ] Wikilink breadcrumbs connect today -> tomorrow -> yesterday chain

**US-C-005: As an agent, I want CONTINUATION.md written before session compaction so I can recover state on restart.**

*Acceptance Criteria:*
- [ ] CONTINUATION.md written to `/Idea/Empty/Present/` before compaction
- [ ] Contains session state sufficient for post-compaction recovery
- [ ] Bootstrap sequence reads CONTINUATION.md first if it exists (before ANIMA.md, PARADIGM.md, MEMORY.md)
- [ ] After recovery, CONTINUATION.md is consumed (archived or deleted)

### B.3 Thought Routing

**US-C-006: As an agent producing thought artifacts during a session, I want them routed to the correct T-directory by position.**

*Acceptance Criteria:*
- [ ] Thought artifacts created in `{NOW}/thoughts/` during session
- [ ] Sophia/Aletheia classifies each thought by T-position (0-5)
- [ ] Thought archived to `/Idea/Pratibimba/Self/Thought/T{n}/T{n}-{YYYYMMDD-HHmmss}.md`
- [ ] `epi vault thought-route --position N` available for CLI routing
- [ ] Routed thoughts queryable via `epi techne gnosis query`

### B.4 Morning & Evening Rituals

**US-C-007: As a user starting my morning, I want a standup summary showing today's structure, pending entries, and yesterday's carryover.**

*Acceptance Criteria:*
- [ ] Parse today's Daily Note Position #0 entry table
- [ ] Show entries with actions (#todo/agent, #todo/human) and expansion status
- [ ] Show Position #1 incomplete todos (Must/Should/Could)
- [ ] Show active task folders
- [ ] Present suggested focus areas

**US-C-008: As a user closing my day, I want an evening reflection flow that summarizes work, enables dialogue, and seeds tomorrow.**

*Acceptance Criteria:*
- [ ] DAY-REVIEW.md generated in `/Present/` with day summary, incomplete tasks, key learnings, contemplation prompts
- [ ] User dialogue captured with reflections, explorations, decisions
- [ ] Synthesis logged to Daily Note Position #5
- [ ] TOMORROW.md created with carried-forward tasks, reflection outcomes, context
- [ ] Frontmatter updated: `reflection_complete: true`, `tomorrow_seeded: true`
- [ ] Signal "ready for archive" after completion

### B.5 Cron & Scheduled Operations

**US-C-009: As a system operator, I want Chronos to register cron jobs for 6 AM day creation and evening archive.**

*Acceptance Criteria:*
- [ ] 6 AM cron job registered via gateway `cron.add` (cron expression: `0 6 * * *`)
- [ ] Evening archive cron job registered (configurable time, default `0 23 * * *`)
- [ ] Jobs persist across gateway restarts
- [ ] Jobs support timezone configuration
- [ ] Manual override via `epi vault day-init` and `epi vault archive-day`

**US-C-010: As an agent, I want Z-Thread heartbeat to maintain temporal awareness during sessions.**

*Acceptance Criteria:*
- [ ] Heartbeat registered for periodic temporal checks
- [ ] Heartbeat detects day boundary transitions (midnight crossing)
- [ ] Heartbeat monitors session health and duration
- [ ] HEARTBEAT.md checklist includes temporal awareness items

### B.6 Periodic Notes

**US-C-011: As a user, I want weekly and monthly notes that aggregate insights from daily notes.**

*Acceptance Criteria:*
- [ ] Weekly note created at `Present/Week-{WW}-{YYYY}.md` with `period_type: weekly`
- [ ] Monthly note at `Present/Month-{MM}-{YYYY}.md` with `period_type: monthly`
- [ ] Weekly aggregates daily insights from the past 7 days
- [ ] Monthly distills weekly patterns from the past month
- [ ] Archived on schedule (weekly: Friday evening, monthly: last day)
- [ ] `epi vault periodic-init --weekly/--monthly` for manual creation

---

## C. S-Level Inventory (S3 Raw Primitives)

Chronos's `/S3` folder contains raw gateway primitives that Chronos wraps:

### C.1 Gateway Session Primitives

| Primitive | Gateway Method | Description | Status in gate/mod.rs |
|-----------|---------------|-------------|----------------------|
| Session create | `sessions.*` | Create/resolve/list sessions | Module declared: `sessions.rs` |
| Session key management | `sessions.resolve` | Canonical key + alias resolution | Declared |
| Session bootstrap | Bootstrap sequence | CONTINUATION -> ANIMA -> PARADIGM -> MEMORY -> NOW | Module declared: `bootstrap.rs` |
| Workspace derivation | Workspace policy | Day -> session -> NOW -> filesystem path | Module declared: `workspace.rs` |

### C.2 Cron Primitives

| Primitive | Gateway Method | Description | Status in gate/mod.rs |
|-----------|---------------|-------------|----------------------|
| Cron add | `cron.add` | Register a scheduled job | Module declared: `cron.rs` |
| Cron run | `cron.run` | Force-run or due-run a job | Declared |
| Cron list | `cron.list` | List registered jobs | Declared |
| Cron status | `cron.status` | Job count and health | Declared |
| Cron update | `cron.update` | Modify existing job | Declared |
| Cron remove | `cron.remove` | Delete a job | Declared |
| Cron runs | `cron.runs` | Job execution history | Declared |

### C.3 Heartbeat Primitives

| Primitive | Gateway Method | Description | Status in gate/mod.rs |
|-----------|---------------|-------------|----------------------|
| Heartbeat config | `set-heartbeats` | Configure heartbeat interval | Module: `system.rs` |
| Last heartbeat | `last-heartbeat` | Query last heartbeat time | Module: `system.rs` |
| System event | `system-event` | Inject system event for next heartbeat | Module: `system.rs` |
| System presence | `system-presence` | Current presence state | Module: `system.rs` |

### C.4 Z-Thread

| Primitive | Description | Status |
|-----------|-------------|--------|
| Z-Thread registration | Register periodic background tasks | NOT IMPLEMENTED (concept only) |
| Z-Thread lifecycle | Start/stop/status for background threads | NOT IMPLEMENTED |

**Note:** Z-Thread is referenced in the S4 spec but has no concrete implementation spec. It appears to be the conceptual name for the heartbeat+cron combination that provides background temporal awareness. See Ambiguities section.

---

## D. S'-Level Inventory (S3' QL Augmentations)

Chronos's `/S3'` folder contains the QL-augmented temporal operations:

### D.1 Day/NOW Lifecycle Operations

| Operation | CLI Command | Description | Depends On |
|-----------|-------------|-------------|------------|
| Day init | `epi vault day-init` | Create Day folder + daily-note.md + canvas | S1 (obsidian-cli), Hen templates |
| NOW init | `epi vault now-init --session-id <id>` | Create NOW folder with subdirs + now.md | S1 (obsidian-cli), Hen templates |
| Day archive | `epi vault archive-day <date>` | Rotate Day -> History path | S1 (filesystem), S2 (graph sync) |
| Session pointer | NOW.md management | Update/read active session pointer | S1 (filesystem) |
| Continuation | CONTINUATION.md | Pre-compaction state dump | Khora bootstrap |

### D.2 Temporal Threading

| Operation | Description | Depends On |
|-----------|-------------|------------|
| Mobius return (P5->P0) | Synthesis seeds next ground | Evening reflect -> TOMORROW.md -> morning #0 |
| SEED.md fallback | Bootstrap from seed when no prior day exists | Aletheia (SEED refresh) |
| Day transition detection | Detect midnight crossing during session | Heartbeat / Z-Thread |
| Session lineage | Track session parentage (Day -> NOWs) | Frontmatter wikilinks |

### D.3 Archive Scheduling

| Operation | Trigger | Description | Depends On |
|-----------|---------|-------------|------------|
| Evening archive cron | Cron job (default 11 PM) | Move Day folder to History | S3 cron, S1 filesystem |
| Weekly archive | Friday evening cron | Move weekly note to History | S3 cron, S1 filesystem |
| Monthly archive | Last day cron | Move monthly note to History | S3 cron, S1 filesystem |
| Archive pre-check | Reflection gate | Block archive without reflection_complete | S1 frontmatter read |
| Graph sync flush | Post-archive trigger | Flush Khora sync queue to Neo4j | S2 neo4rs, Hen |

### D.4 Periodic Notes

| Operation | CLI Command | Description | Depends On |
|-----------|-------------|-------------|------------|
| Weekly init | `epi vault periodic-init --weekly` | Create weekly aggregation note | S1, Periodic Notes plugin |
| Monthly init | `epi vault periodic-init --monthly` | Create monthly distillation note | S1, Periodic Notes plugin |
| Daily insights aggregation | Automated | Extract #5 insights from daily notes for weekly | S1 vault read |
| Weekly pattern distillation | Automated | Extract patterns from weeklies for monthly | S1 vault read |

### D.5 Thought Stream Routing

| Operation | CLI Command | Description | Depends On |
|-----------|-------------|-------------|------------|
| Thought route | `epi vault thought-route --position N` | Classify and move thought to T{n}/ | S1 filesystem, Sophia classification |
| Thought generation | In-session | Agents create in {NOW}/thoughts/ | Anima agent dispatch |
| Thought archival | Post-session | Move from NOW/thoughts/ to T{n}/ dated | Evening archive or session close |

---

## E. M-Level Mapping

### E.1 M1 (Paramasiva) — QL Tick / Temporal Pulse

| Aspect | Description | Source |
|--------|-------------|--------|
| **Role** | The clock that drives session boundaries. M1 provides the temporal pulse — the QL tick that advances the coordinate system through time. | S4-NOW Sec IV: "M1 (Paramasiva): QL tick — temporal pulse" |
| **Integration Point** | Chronos reads M1 state to determine session duration, day boundary proximity, and temporal context for scheduled operations. | S4-NOW Sec I: "M1: Paramasiva QL tick — temporal pulse, the clock" |
| **C Library Hook** | M1 implementation in `epi-lib/include/m1.h` + `epi-lib/src/m1.c` provides the tick counter. Chronos wraps this as the temporal heartbeat. | MEMORY.md: "M1 Paramasiva: IMPLEMENTED" |
| **Data Flow** | M1 tick -> Chronos temporal awareness -> day boundary detection -> cron trigger | Integration matrix |

### E.2 M4 (Nara) — NOW Personal Identity

| Aspect | Description | Source |
|--------|-------------|--------|
| **Role** | M4 provides the personal identity context for the current session. The NOW is not just temporal — it carries the user's journal state, oracle position, and personal cycle. | S4-NOW Sec IV: "M4 (Nara): NOW personal identity" |
| **Integration Point** | Chronos reads M4 state to enrich NOW identity: current journal entries, oracle hexagram, personal cycle position (M4 Nara's Lemniscate self-fold). | S4-NOW Sec I: "M4: Nara — personal identity in this session (journal, oracle, cycle)" |
| **C Library Hook** | M4 implementation in `epi-lib/include/m4.h` + `epi-lib/src/m4.c`. BLAKE3 quintessence hash, 6-lens vtable, oracle (I-Ching + Tarot). | MEMORY.md: "M4 Nara: IMPLEMENTED. 401 tests." |
| **Kairos** | M4's oracle and astrological context feed Chronos's Kairos interpretation — determining "opportune / guarded / neutral" moments for scheduled operations. | [1] DAY-AS-CONTEXT: "Astrological data (Kairos context)" in Position #4 |
| **Data Flow** | M4 personal state -> Chronos NOW identity enrichment -> daily-note #4 Kairos context | CT4b nested contexts |

---

## F. Staging Disposition

Assessment of `_staging/` items for Chronos relevance:

| Staging Item | Path | Disposition | Rationale |
|-------------|------|-------------|-----------|
| **pleroma-hooks/scripts/** | `_staging/pleroma-hooks/scripts/` | NOT Chronos | Pre/post-flight, worktree cleanup — agent lifecycle, not temporal |
| **pleroma-skills/atomic/mprocs** | `_staging/pleroma-skills/atomic/mprocs/SKILL.md` | NOT Chronos | Process multiplexer, not temporal |
| **pleroma-skills/orchestration/day-night-pass** | `_staging/pleroma-skills/orchestration/day-night-pass/SKILL.md` | **CHRONOS CANDIDATE** | Day/Night pass pattern is directly temporal lifecycle |
| **pleroma-skills/orchestration/ouroboros** | `_staging/pleroma-skills/orchestration/ouroboros/SKILL.md` | **CHRONOS CANDIDATE** | Ouroboros cycle is the Mobius return pattern that Chronos manages |
| **root-hooks/** | `_staging/root-hooks/` | PARTIAL Chronos | `manifest.json`, `post-agent-run.sh`, `pre-agent-run.sh` — session lifecycle hooks may have temporal concerns |
| **root-commands/graph-context.md** | `_staging/root-commands/graph-context.md` | NOT Chronos | Graph context, not temporal |
| **root-commands/core-verify.md** | `_staging/root-commands/core-verify.md` | NOT Chronos | Verification, not temporal |
| **root-commands/model-status.md** | `_staging/root-commands/model-status.md` | NOT Chronos | Model status, not temporal |
| **root-skills/vault/SKILL.md** | `_staging/root-skills/vault/SKILL.md` | PARTIAL Chronos | Vault operations overlap with Day/NOW lifecycle |
| **settings.json** | `_staging/settings.json` | NOT Chronos | Plugin settings, not temporal |

**Items to integrate into Chronos:**
1. `day-night-pass/SKILL.md` -> `plugins/ta-onta/chronos/S3'/skills/day-night-pass.md`
2. `ouroboros/SKILL.md` -> `plugins/ta-onta/chronos/S3'/skills/ouroboros.md`
3. Relevant temporal hooks from `root-hooks/` -> `plugins/ta-onta/chronos/S3/hooks/`

---

## G. Ambiguities & Open Decisions

### G.1 Cron vs Heartbeat: Which Manages Which Lifecycle Events?

**Status:** PARTIALLY RESOLVED

The epi-claw documentation (cron-vs-heartbeat.md) provides clear guidance:

| Event | Mechanism | Rationale |
|-------|-----------|-----------|
| 6 AM Day creation | **Cron** (isolated, `0 6 * * *`) | Exact timing required, standalone task |
| Evening archive | **Cron** (isolated, configurable time) | Exact timing, noisy task, should not clutter main session |
| Morning standup | **Cron** (main session, system event) | Context-aware, benefits from main session |
| Midnight day transition | **Heartbeat** | Natural fit for periodic awareness check |
| Session health check | **Heartbeat** | Batches with other periodic checks |
| Temporal awareness | **Heartbeat** | HEARTBEAT.md checklist item |

**Decision needed:** Should there be a dedicated Chronos heartbeat checklist (`CHRONOS_HEARTBEAT.md`) or should Chronos items be part of the global `HEARTBEAT.md`?

### G.2 Gateway Dependency: What Can Work Without S3?

**Status:** OPEN — CRITICAL PATH CONCERN

The S4 spec (Section II audit table) explicitly states: **Chronos depends on S1, S1', S3, S5 — "All stub/partial"** and lists blockers as "obsidian-cli, gateway, n8n."

**What CAN work without the gateway (S3):**
- Day folder creation (pure filesystem — S1 via Rust)
- NOW folder creation (pure filesystem)
- Daily-note/now.md template generation (Hen templates)
- Archive file moves (pure filesystem)
- Thought routing (pure filesystem)
- CONTINUATION.md and NOW.md pointer management
- CLI commands (`epi vault day-init`, `epi vault now-init`, etc.)

**What REQUIRES the gateway (S3):**
- Cron job registration (FR-C-025 through FR-C-029)
- Heartbeat integration (FR-C-026)
- Z-Thread (FR-C-026)
- Evening cron-triggered archive (FR-C-009 automation, not manual)
- Telegram notification dispatch (FR-C-043)
- Live state publication to SpacetimeDB

**Recommendation:** Implement Chronos in two tranches:
1. **Tranche A (no gateway needed):** All filesystem lifecycle operations via `epi vault` CLI commands. Manual invocation. This is immediately implementable.
2. **Tranche B (gateway needed):** Cron registration, heartbeat integration, automated scheduling, notification dispatch. Blocked until S3 gateway kernel is operational.

### G.3 Archive Path: Is This Confirmed?

**Status:** CONFIRMED

The archive path `/Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/` appears in:
- S4-NOW Sec IV (authoritative): "Archive: `/Idea/Empty/Present/{DD-MM-YYYY}/` -> `/Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`"
- daily-archive.md (planning doc): "SOURCE: `Idea/Empty/Present/{day-before-yesterday}.md` / DEST: `Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/W{WW}/{DD}/`"

**Discrepancy:** The planning doc includes a `W{WW}` (week number) directory level that the S4 spec omits.

**Decision needed:** Include week-number directory level in archive path? The S4 spec version (no week) is simpler and authoritative. The planning doc version enables weekly aggregation at the filesystem level.

**Recommendation:** Use the S4 spec version (`{YYYY}/{MM}/{DD}/`) as canonical. Weekly aggregation can happen via periodic notes without a filesystem week directory.

### G.4 Thought Routing: Does Chronos Own This or Does Aletheia?

**Status:** SHARED RESPONSIBILITY

The S4-NOW spec is clear on the division:

| Step | Owner | Description |
|------|-------|-------------|
| Generation | Anima (S4-4') | Agents create thought artifacts in `{NOW}/thoughts/` |
| Routing/Classification | **Sophia with Aletheia access** (S4-4'/S4-5') | Sophia classifies by T-position |
| Filesystem Move | **Chronos** (S4-3') | Chronos physically moves file to `T{n}/` directory |
| Recollection/Query | Aletheia (S4-5') | Gnosis retrieval from thought archive |
| Archival (Day-level) | **Chronos** (S4-3') | Evening cron archives the Day folder (which contains NOW/thoughts/) |

**Resolution:** Chronos owns the **filesystem mechanics** of thought routing (the move operation, the T-directory structure, the archival timing). Aletheia owns the **classification intelligence** (deciding which T-position a thought belongs to). This is the standard S/S' split: S3 (raw primitive: filesystem move) + S3' (QL augmentation: position-aware routing).

### G.5 Periodic Notes Plugin: Obsidian Plugin or Our Own?

**Status:** OBSIDIAN COMMUNITY PLUGIN (external dependency)

The S4-NOW spec (Sec III) explicitly states: "Periodic Notes (community): weekly/monthly organisation" as a required Obsidian plugin.

**This means:**
- Periodic Notes is an Obsidian community plugin that must be installed in the vault
- It provides the weekly/monthly note creation and linking infrastructure
- Chronos wraps it via obsidian-cli or direct filesystem operations
- If obsidian-cli is not available, Chronos can create periodic notes directly (filesystem fallback)

**Decision needed:** Can Chronos operate without the Obsidian Periodic Notes plugin by implementing its own weekly/monthly creation logic? **Recommendation:** Yes. The plugin provides convenience within Obsidian UI, but the CLI path should create periodic notes independently via template invocation.

### G.6 Kairos Interpretation: How Is This Implemented?

**Status:** CONCEPTUAL — NO IMPLEMENTATION SPEC

Kairos (the "opportune moment") appears in:
- DAY-AS-CONTEXT-FRAMEWORK: "Position #4: Context (different info streams within Chronos) - Astrological data (Kairos context)"
- CT4b template: Position #4 nested context includes "Astrological Context (Kairos): Moon phase, signs, aspects"

**What Kairos interpretation appears to mean:**
- M4 Nara's oracle state (I-Ching hexagram, Tarot) provides a "moment reading"
- M2 Parashakti's planetary state provides astrological context
- Chronos combines these to produce a Kairos assessment: **opportune / guarded / neutral**
- This assessment could influence scheduling decisions (e.g., defer non-critical cron jobs during "guarded" periods)

**Decision needed:**
1. Is Kairos a first-class scheduling concern or purely informational metadata for the daily note?
2. Does Kairos data come from M2 (planetary) + M4 (oracle), or from an external astrology API?
3. What is the concrete Kairos data model? (enum? score? struct?)

**Recommendation:** Treat Kairos as **informational metadata** for the daily note Position #4, not as a scheduling constraint. M4 oracle state populates it. No external API dependency. Defer scheduling-influencing Kairos until the system is mature.

### G.7 Z-Thread: What IS This Exactly?

**Status:** AMBIGUOUS — CONCEPTUAL NAME WITHOUT CONCRETE SPEC

Z-Thread appears only in:
- S4-TA-ONTA-EXTENSION-SPEC (Chronos slot definition): "S3/ -- Primitives: gateway sessions, cron/heartbeat, **Z-Thread**"
- S4-NOW Sec IV: "Z-Thread (heartbeat) registration for periodic tasks"

**Analysis:** Based on context, Z-Thread appears to be **the named concept for the heartbeat background thread** — the "zero thread" or "background thread" that runs alongside the main agent session. It is NOT a separate mechanism from heartbeat; it IS the heartbeat mechanism viewed from the Chronos temporal management perspective.

In the epi-claw cron architecture:
- **Heartbeat** = the periodic agent turn in the main session (every N minutes)
- **Cron** = precise scheduled jobs (at/every/cron expression)
- **Z-Thread** = the conceptual name for the heartbeat runner process itself (the "zeroth thread" that keeps the system temporally aware)

**Recommendation:** Implement Z-Thread as an alias/wrapper for heartbeat registration from Chronos's perspective. No separate threading mechanism needed. Document that Z-Thread = "Chronos's view of the heartbeat runner."

### G.8 Daily CLI Surface: epi-claw vs epi vault

**Status:** DUAL CLI SURFACE — NEEDS RECONCILIATION

Two CLI designs exist for daily operations:

1. **epi-claw daily** (from planning doc [18]): `epi-claw daily -a "text" -p5`, position-aware append, pipe support
2. **epi vault day-init / now-init** (from S4 spec [20]): lifecycle management commands

**The epi-claw CLI design is richer** (position-aware append, read, `--now` flag, `--date` targeting), but it belongs to the epi-claw TypeScript runtime, not the Rust epi-cli.

**Decision needed:** Does Chronos in the Rust CLI replicate the epi-claw daily command's position-aware append? Or does it only provide lifecycle management (init, archive, template-invoke)?

**Recommendation:** The Rust CLI (`epi vault`) provides lifecycle management. Position-aware append (`-p5 -a "text"`) can be implemented later as `epi vault daily-append --position N --text "..."` or deferred to the PI agent layer where epi-claw daily routing exists.

### G.9 Template Authority: Who Generates Templates?

**Status:** SHARED — Hen generates, Chronos triggers

The S4-NOW spec (Sec III) places CT template definitions in Hen/S1', not Chronos:
- Hen owns: template type registry, CTx archetype definitions, instantiation engine
- Chronos owns: WHEN templates are instantiated (6 AM day-init, session start now-init, evening archive)

**Resolution:** Chronos calls Hen's template invocation API. Chronos does NOT define templates — it triggers their creation at the right temporal moments.

### G.10 Obsidian-CLI Dependency

**Status:** BLOCKER for some operations

The S4 spec lists obsidian-cli as a required dependency for Hen/S1 operations. Chronos depends on Hen for vault writes.

**Current state:** obsidian-cli is NOT installed (`brew install obsidian-cli` not yet done).

**Workaround:** Many Chronos operations are pure filesystem (mkdir, file write). These can bypass obsidian-cli and write directly via Rust `std::fs`. Only obsidian-specific features (URI handler, wikilink-updating moves, search) strictly require obsidian-cli.

**Recommendation:** Implement Chronos filesystem operations in Rust directly. Use obsidian-cli only for operations that require Obsidian app integration (open, search, frontmatter that triggers Obsidian plugins).

---

## H. Implementation Priority Matrix

| Phase | FRs | Description | Dependencies | Estimate |
|-------|-----|-------------|--------------|----------|
| **Phase 0: Directory scaffold** | — | Create `plugins/ta-onta/chronos/{S3,S3',M}/`, CONTRACT.md, extension.ts stub | None | 1 session |
| **Phase 1: Filesystem lifecycle** | FR-C-001,002,004,005,006,007,033,034 | Day-init, NOW-init, template generation, CLI commands | S1 (filesystem, no obsidian-cli needed) | 2-3 sessions |
| **Phase 2: Archive & routing** | FR-C-009,010,015,016,017,018,035,036 | Archive-day, thought routing, learning extraction | S1 filesystem | 2 sessions |
| **Phase 3: Temporal continuity** | FR-C-003,008,024,030 | SEED.md fallback, CONTINUATION.md, Mobius return, TOMORROW.md | Phase 1+2 | 1-2 sessions |
| **Phase 4: Rituals** | FR-C-022,023 | Morning standup, evening reflection (as skills/commands) | Phase 1+2+3 | 2 sessions |
| **Phase 5: Cron integration** | FR-C-025,026,027,028,029 | Gateway cron registration, heartbeat, Z-Thread | S3 gateway operational | 2 sessions |
| **Phase 6: Periodic & sync** | FR-C-019,020,021,042,043,044 | Weekly/monthly notes, graph sync, notifications | S3 + S5 | 2 sessions |

---

## I. Cross-Extension Dependency Map

```
Chronos (S4-3') depends on:
  Khora (S4-0'):
    - Session ID generation (EPI_SESSION_ID env var)
    - Bootstrap sequence (CONTINUATION.md first-read)
    - Secrets (1Password + varlock for API keys)
    - Filesystem edge validation

  Hen (S4-1'):
    - CT4b' template definitions and instantiation
    - Frontmatter schema enforcement (126 canonical keys)
    - Wikilink breadcrumb generation
    - obsidian-cli raw CRUD substrate

  Pleroma (S4-2'):
    - Tool registration for temporal CLI commands
    - Graph CRUD for archival metadata

  Anima (S4-4'):
    - Agent dispatch for morning standup / evening reflect skills
    - Sophia post-execution review triggers thought routing

  Aletheia (S4-5'):
    - Thought classification (T-position assignment)
    - SEED.md refresh from crystallised insights
    - Gnosis: session notebook archive

Chronos (S4-3') provides to:
  Khora: 6 AM Day folder exists for bootstrap
  Hen: temporal context for template frontmatter (day_id, session_id)
  Anima: session temporal boundaries, day lifecycle events
  Aletheia: evening archive triggers knowledge crystallisation
```

---

*"The pattern reveals itself through repetition."* -- The Quintessence

**Document generated:** 2026-03-10
**Sources:** 24 documents across 4 repositories/archives
**Total FRs:** 44
**Total USs:** 11
**Open Decisions:** 10
