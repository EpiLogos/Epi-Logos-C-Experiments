---
description: "Autonomously develop the active implementation plan set"
---

# `/m-dev`

Run the active implementation plan set as a context-first autopilot loop. Discover the plan set, refresh the ledger, mark a short route, claim → execute → mark → continue. Trust the ledger. Cut ceremony.

## Modes

- **Default:** in-session autonomous execution.
- **`--route`:** mark a fresh 3-5 task route (the command does this by default).
- **`--subagents`:** allow subagent-driven execution for suitable batches.
- **`--parallel`:** only when work orders are genuinely independent (no shared write scopes, no shared fragile service).
- **`--reset`:** wipe `plan.state.json` to pending.

## Step 1 — Assess

```bash
node .codex/scripts/m-dev-plan-assess.mjs --route --write --json --require-now $ARGUMENTS
```

Read `recommendedRoute` (strategic) and `workOrders` (queue). Stop only for `hardStops`. `softCautions` and `carryForwardRisks` are guidance, not blockers.

The command is active-development work and must be NOW-bound. Read `activeDevelopmentContext` in the JSON output. If `--require-now` hard-stops, run `epi agent session init`; if it reports a missing daily note, run `epi vault day-init`. Keep all work anchored in `Idea/Empty/Present/{DD-MM-YYYY}/{sessionId}/now.md`, not an ad-hoc note path.

Plan discovery is Seed-first. Active implementation plans should live under `Idea/Bimba/Seeds/M/Legacy/plans/**` or `Idea/Bimba/Seeds/S/Legacy/plans/**`; `docs/plans/**` is legacy fallback only.

## Step 2 — Substrate-truth spot-check (once per session, not per tranche)

At session start, confirm the substrate is roughly what the route assumes:
- `Body/S/` crates compile (`cargo check --offline` if relevant)
- Named extensions in `Idea/Pratibimba/System/extensions/` exist
- If a previously-pending tranche's substrate is already landed, mark `--status review` with a one-line evidence pointing at the live substrate, then continue.

After this: **trust the ledger.** If a dep is marked `done` with evidence, that's truth. Don't re-walk it per tranche.

**Standing invariants** (keep without re-citing them per tranche):
- S0 is the membrane (CLI, process, adapter). S1/S2/S3/S4/S5 own service law.
- `/pratibimba/system` is the M' Theia shell authority. `Body/M/epi-tauri` is deprecated.
- The coordinate system is the modular system; convenience residency does not override coordinate ownership.
- `Idea/Bimba/Seeds/**/Legacy` is the canonical home for migrated `/docs` specs, plans, resources, and superpowers artifacts. New load-bearing specs/plans should be created in the owning Seed coordinate, not under `/docs`.
- `Idea/Bimba/World/**` is the crystallised architecture surface; Seeds hold developmental and legacy source material until crystallisation.

## Step 3 — Claim

Pick the first `resume` or `claim` work order. For parallel batches, only group orders that don't share write scopes or fragile services.

```bash
node .codex/scripts/m-dev-plan-assess.mjs --claim <TASK_ID> --owner <AGENT_OR_THREAD_ID> --lease-minutes 120 --write --json --require-now $ARGUMENTS
```

## Step 4 — Execute

Read the tranche body in the plan markdown (one section, line-range) and the substrate files you'll actually touch. The body lists deliverables + verification commands. That's the brief. Skip required-reading rituals unless the body itself names specific files.

Code changes: TDD when reasonable. Real verification — no mocks/fake/placeholder.

## Step 5 — Mark

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status done --evidence "<one sentence: test counts + key file path>" --write --json --require-now $ARGUMENTS
```

Use `review` for partial; `blocked` only when a real external blocker holds (waiting on user, missing service, deferred decision).

**Evidence is a string in the ledger, not a separate file.** Do NOT write `*-evidence.md` / `*-summary.md` / `*-report.md` that restate the ledger entry. The ledger IS the record.

**Allowed exceptions** — write a file only when the tranche's DELIVERABLE is itself a document (audit inventory, readiness report, runbook, decision register update). The file IS the work product, not "evidence about evidence." Default location: `<plan_folder>/plan.runs/<task-id>-<deliverable-kind>.md`, where `<plan_folder>` is the Seed-hosted plan folder when one exists.

## Subagents

When dispatching, brief each subagent like:

```
Read .codex/m-dev-subagent-brief.md for shared protocol.

Owner: <id>. Mission: close <tranche-id> per <plan-file>:<line-range>.
Write scope: <specific files/dirs this thread owns>.
Specific notes: <2-5 lines>.
Return: <expected fields>.
```

The shared brief carries: lane discipline, the `--mark` template, no-mock rule, no-evidence-file rule, return format. Don't restate it.

Subagents must not write `plan.state.json` directly; they invoke `--mark` via the helper. Controller owns route state.

## Final Response

One line per tranche: id → status → key evidence. Stop once the work is recorded. The ledger carries the long memory.

## Rule

Trust the ledger. Cut ceremony. Real verification, not theater.
