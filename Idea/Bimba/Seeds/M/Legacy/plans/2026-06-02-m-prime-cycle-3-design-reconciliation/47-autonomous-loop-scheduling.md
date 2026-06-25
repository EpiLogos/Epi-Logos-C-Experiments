# Track 47 — Autonomous Loop Scheduling (Aeon Invocation: Cron Auto-Fire + Event + Consent)

**Status:** Future-dev (post-cycle-3) — newly proposed 2026-06-19. **NOT part of the cycle-3 landed release set.** Released into future development needs. Closes the one genuine substrate gap that stands between "an Aeon (Track 46) is defined" and "it runs autonomously on a schedule": the cron **auto-fire tick**. Builds on landed cycle-3 substrate (Track 42 dispatch, Track 39 session-workspace, Khora result-drop wake); reopens no landed tranche; introduces no DR gate.

**Why this track exists.** Every piece of autonomous-loop invocation exists *except the time-based auto-fire*:

- **Define** a scheduled run — exists: `epi gate cron add` persists a job to `cron.json` with `schedule`, `payload`, `session_target`, `wake_mode`, `next_run_at_ms` (`Body/S/S0/epi-cli/src/gate/cron.rs`; Chronos `chronos_cron_register` / `chronos_response_orbit` in `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts`).
- **Manual fire** — exists: `epi gate cron run --id <id>` executes once.
- **Event-wake** — exists: Khora result-drop emits `khora.result.wake` when a result artifact lands in the NOW/day folder (Track 42.6, `Body/S/S4/ta-onta/S4-0p-khora/modules/flow-watcher.ts`).
- **Execute a loop** — exists: Anima `subagent_create` (CFP4) / Ralph headless.
- **Auto-fire on schedule** — **MISSING**: nothing checks `now_ms >= next_run_at_ms` and fires due jobs. The gateway heartbeat (~550 ms, `Body/S/S0/epi-cli/src/gate/server.rs`) does not tick cron; `Body/S/S0/epi-cli/src/gate/cron.rs` is CRUD + manual-run only. (`vendors/hermes-agent/cron/scheduler.py` has a reference `tick()` that checks due jobs every 60 s — the pattern, not a dependency.)

So an Aeon can be *defined + run-manually + woken-on-event* but cannot yet *fire on a cron*. This track lands the tick and routes a fired job through Anima dispatch, then binds Aeon scheduling on three triggers: cron (time), event (result-drop wake), and consent (CPF 00/00).

## Released foundation (landed — extended, not reopened)

- **Track 42.6** (result-drop wake) + **Track 39 AP-2** (Khora session-workspace) — the event trigger.
- **Track 42.7** (two-axis dispatch router) — fired jobs route through it.
- **Track 12.15** (VAK reading-frame consent / CPF gate) — done — governs autonomous fire.
- **Track 46** (companion future-dev track) — defines the Aeon being scheduled.

## Source authority

- `Body/S/S0/epi-cli/src/gate/cron.rs` — the cron CRUD + manual-run surface the tick completes.
- `Body/S/S0/epi-cli/src/gate/server.rs` — the gateway heartbeat the tick hooks.
- `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts` — Chronos temporal authority; the fire-job tool's home.
- `vendors/hermes-agent/cron/scheduler.py` — reference `tick()` pattern (not a dependency).

## Ownership split

| Concern | Owner | Residency |
|---|---|---|
| **Cron due-check + auto-fire** | **S0 gateway** | `Body/S/S0/epi-cli/src/gate/cron.rs` + `Body/S/S0/epi-cli/src/gate/server.rs` |
| **Fire-job → dispatch routing** | **S4-3p Chronos → S4-4p Anima** | `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts` |
| **Aeon schedule binding** | **Bimba World (Aeon form) + Chronos** | `Idea/Bimba/World/Aeon.md` schedule block |

## Tranches

1. **47.1 — Cron auto-fire tick** *(future-dev; extends `Body/S/S0/epi-cli/src/gate/cron.rs` + `Body/S/S0/epi-cli/src/gate/server.rs`)*

   Add a `cron::check_due_and_fire(state_root)` invoked from the existing gateway heartbeat loop in `Body/S/S0/epi-cli/src/gate/server.rs`: scan `cron.json`, fire jobs where `now_ms >= next_run_at_ms`, recompute `next_run_at_ms` for recurring schedules, record a `CronRun`, and emit a `cron.fired` event. No new scheduler process — one check inside the existing heartbeat.

   **Verification:** a job with a due `next_run_at_ms` fires automatically within one heartbeat without `cron run`; a recurring schedule re-arms `next_run_at_ms`; a disabled job never fires.

2. **47.2 — Chronos fire-job to Anima dispatch** *(future-dev; depends on 47.1; extends `Body/S/S4/ta-onta/S4-3p-chronos/extension.ts`)*

   A fired cron payload routes through Anima: a `chronos_cron_fire` tool takes the job payload + `session_target`, builds a `VakAddress`, and calls `dispatchTeamMember(agent, task, vakAddress)` (`Body/S/S4/ta-onta/S4-4p-anima/extension/dispatch.ts`) — a scheduled fire is a normal VAK dispatch, not a side channel.

   **Verification:** a fired job dispatches through Anima with its VAK address; `wake_mode` (`now` vs `next-heartbeat`) is honoured.

3. **47.3 — Aeon scheduling binding** *(future-dev; depends on 46.1, 46.2, 47.1, 47.2; cross-link 12.15)*

   An Aeon declares its invocation in its CT4b form: a `schedule` (cron expression → 47.1), an `on_event` trigger (a result-drop wake purpose → 42.6), and a consent posture (CPF (00/00) dialogical vs (4.0/1-4.4/5) autonomous → 12.15). The scheduler invokes the Aeon with its VAK args; autonomous fire requires the consent gate to have been granted — the user's consent to be in a constant assess-and-improve state is the precondition.

   **Verification:** an Aeon with a cron schedule fires autonomously and runs its loop with bound args; an `on_event` Aeon fires on result-drop; an autonomous Aeon refuses to fire without a granted CPF consent posture.

4. **47.4 — Aeon task-source binding** *(future-dev; depends on 46.1; cross-link `Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/ralph-tui`)*

   An Aeon may reference a structured task-source as its iteration work-list — a Ralph PRD (`Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/ralph-tui`, markdown PRD under `./plans/`) or a beads set — so a scheduled Aeon advances a concrete, checkpointed task list rather than an open objective. This binds the existing task-definition formats (yaml/markdown) to the Aeon loop.

   **Verification:** an Aeon bound to a Ralph PRD advances its tranches per fire; checkpoints persist across fires.

## What this UNBLOCKS

- **Genuinely autonomous Aeons.** A proven Aeon runs on a cron / event / consent trigger without a human kicking it — the "ship while you sleep" Z-thread telos, governed.
- **Scheduling as VAK dispatch.** A fired job is a normal Anima dispatch carrying a VAK address — no parallel execution path.

## What this is NOT

- **Not a new scheduler process.** One due-check inside the existing gateway heartbeat; `cron.rs` already stores jobs.
- **Not ungoverned autonomy.** Autonomous fire is CPF (00/00)-consent-gated (12.15).
- **Not a reopening of landed work.** It completes the cron surface and binds Aeon invocation; it reopens no landed tranche.
