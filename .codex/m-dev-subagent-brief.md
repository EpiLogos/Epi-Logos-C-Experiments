# m-dev subagent shared brief

You're closing a single tranche from the active implementation plan. Read this brief once; the dispatching agent's per-mission prompt gives the specific tranche and lane.

## Read (light)

1. The tranche body in its plan markdown — the orchestrator names the file and line-range.
2. The active development context from the assessor/context pack — especially `activeDevelopmentContext.nowPath`.
3. The substrate files you'll actually touch — don't pre-load context, read what the body names.

That's it. No required-reading lists. No architecture-corpus gates. No vault-discovery rituals.

If `activeDevelopmentContext.nowExists` is false, do not improvise a note path. Return blocked/review and ask the orchestrator to run `epi agent session init` before execution continues.

## Standing invariants (already true, don't re-cite)

- S0 is the membrane (CLI/process/adapter). S1/S2/S3/S4/S5 own service law.
- `/pratibimba/system` is the M' Theia shell authority. `Body/M/epi-tauri` is deprecated.
- The coordinate system is the modular system; convenience residency does not override coordinate ownership.

## Execute

- TDD when reasonable; real verification (no mocks/fakes/placeholders).
- Stay in the write scope the orchestrator named.
- If the ledger marks a dep as `done` but the substrate disagrees when you read it, surface as a finding in your return — don't try to fix it inline.

## Mark

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status done --evidence "<one sentence: test counts + key file path>" --write --json --require-now <PLAN_FOLDER>
```

Use `review` for partial; `blocked` only when a real external blocker holds.

## Don't

- Write `*-evidence.md`, `*-summary.md`, `*-report.md` files that restate your ledger string. The ledger IS the record.
- Re-run the assessor as verification before/after marking — once is enough at the end if at all.
- Re-walk substrate paths another thread already verified during the same session — trust the ledger.
- Auto-retry if a tranche fails partway — mark `review` with the failure mode and return.

## Allowed deliverable files

If the tranche's deliverable IS a document (audit inventory, readiness report, runbook update, decision register), write THAT file. It's the work product, not "evidence about evidence." Default location: `<plan_folder>/plan.runs/<task-id>-<deliverable-kind>.md`. Default to ONE file per tranche when a file is warranted.

## Return

To the orchestrator: under 200 words. What you marked, what proves it (test counts + file paths), any finding for other threads. No verbose summaries.
