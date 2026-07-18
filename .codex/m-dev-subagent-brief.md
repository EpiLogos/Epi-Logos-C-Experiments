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
- `Body/M/epi-theia` is the M' Theia shell authority; `Idea/Pratibimba/System` is its design surface. The legacy Tauri shell is deprecated migration-source only, preserved at `vendor/legacy/epi-tauri`.
- The coordinate system is the modular system; convenience residency does not override coordinate ownership.

## Execute

- TDD when reasonable; real verification (no mocks/fakes/placeholders).
- Stay in the write scope the orchestrator named.
- A repository-owned missing method, adapter, service, producer, receiver, route, or test harness is dependency work, not an external blocker. Preserve the failing behavioral test. Repair it in-scope; when it falls outside the assigned write scope, mark `review` and return the exact dependency so the orchestrator can promote that repair ahead of the current tranche.
- If the ledger marks a dep as `done` but the substrate disagrees, do not build around it. Repair it when it is in-scope; otherwise mark `review` with the mismatch so the orchestrator requeues the dependency first.

## Mark

A `done` mark is fail-closed: it requires a structured receipt AND an independent PASS verification record whose verifier-owner differs from yours. **You may not verify your own tranche.** When your implementation is finished and your own checks are green, mark `review` with your receipt and return — the orchestrator dispatches the independent verifier (`node .codex/scripts/verify-tranche.mjs <TASK_ID> --owner <VERIFIER_ID>`) and closes.

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status review \
  --receipt '{"command":"<verification command run>","exitCode":0,"testsPassed":<n>,"testsFailed":0,"keyPaths":["<key file>"],"tokenUsage":{"input":<n>,"output":<n>}}' \
  --evidence "<one sentence: what landed>" --owner <YOUR_ID> --write --json --require-now <PLAN_FOLDER>
```

Include `tokenUsage` (your session's approximate input/output tokens) — the daily budget refuses new claims when exhausted.

If you were dispatched AS the verifier for someone else's tranche, run verify-tranche with your own `--owner` and mark done with their receipt only when the record says PASS.

Use `review` for partial or repo-owned dependency repair. `blocked` is accepted only for a classified external dependency and requires `--blocker-kind human|environment|third-party`, `--blocked-by "<dependency>"`, and evidence. "Not implemented yet" inside this repository never qualifies. Cited `DR-*` ids are machine-checked against the decision registers and fail closed. UF-class tracks need playwright/test:e2e/boot-smoke proof; W-class tracks need live-wire/gateway proof — jsdom or manifest strings will be refused.

## Don't

- Write `*-evidence.md`, `*-summary.md`, `*-report.md` files that restate your ledger string. The ledger IS the record.
- Re-run the assessor as verification before/after marking — once is enough at the end if at all.
- Re-walk substrate paths another thread already verified during the same session — verify before trusting. If a dependency's substrate doesn't match its ledger evidence when you check it, surface as a finding and DO NOT build on it.
- Delete a red behavioral test because it exposed missing infrastructure. Keep it and drive the dependency repair.
- Auto-retry if a tranche fails partway — diagnose, then mark `review` with the dependency or failure mode and return.

## Allowed deliverable files

If the tranche's deliverable IS a document (audit inventory, readiness report, runbook update, decision register), write THAT file. It's the work product, not "evidence about evidence." Default location: `<plan_folder>/plan.runs/<task-id>-<deliverable-kind>.md`. Default to ONE file per tranche when a file is warranted.

## Return

To the orchestrator: under 200 words. What you marked, what proves it (test counts + file paths), any finding for other threads. No verbose summaries.
