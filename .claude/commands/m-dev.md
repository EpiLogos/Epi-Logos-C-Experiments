---
description: "Develop the next safe tranche from the active implementation plan set"
disable-model-invocation: true
---

# `/m-dev`

Run the active implementation plan set as a disciplined, evidence-producing development loop.

This is the only user-facing command. Do not expose a command family. Internally, `/m-dev` discovers the plan set, refreshes its task index, checks current status, selects the next safe tranche or safe parallel group, claims work, executes via subagent-driven development, verifies with real tests, and updates the state ledger.

## Required Skills

Invoke these skills before acting:

1. `superpowers:subagent-driven-development`
2. `superpowers:dispatching-parallel-agents`
3. `superpowers:test-driven-development`
4. `superpowers:verification-before-completion`

If an Epi-Logos/VAK gate is available in the workspace, run it before claiming implementation work.

## Step 1 - Assess The Plan Set

Run the deterministic assessor from the repository root:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --write --json $ARGUMENTS
```

Interpret `$ARGUMENTS` as an optional explicit plan folder. If no argument is supplied, the assessor discovers the active plan set from `plan.active.json`, `docs/plans/plan.active.json`, `.codex/m-dev.active.json`, or the newest numbered folder under `docs/plans/`.

The assessor writes or refreshes:

- `plan.index.json`
- `plan.state.json`
- `plan.runs/`

Do not manually invent task state if the assessor can compute it.

## Step 2 - Stop Conditions

Stop and report clearly if the assessment returns any `stopReasons`.

Also stop before implementation if:

- The recommended task depends on a user-final decision that is not resolved.
- The recommended task overlaps unrelated dirty files.
- The recommended task requires destructive commands, external credentials, or a missing local service harness.
- The plan set is ambiguous.
- The only ready task is a decision/ADR task that requires the user's choice rather than engineering execution.

If stopping, do not claim the task. Give the user the smallest useful next decision or unblocker.

## Step 3 - Select Work

Default to the `recommendedTask`.

Use `parallelGroup` only if every task in the group is genuinely independent:

- No overlapping write scopes.
- No shared schema/API/migration/lockfile/service boundary.
- No shared unresolved architectural decision.
- No shared fragile live service, port, or fixture directory.
- Each task can be reviewed and verified independently.

When uncertain, execute only the recommended task. Conservative beats spicy here.

## Step 4 - Claim Work

Claim each selected task before implementation:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --claim <TASK_ID> --write --json $ARGUMENTS
```

If the claim fails, stop and report the assessor output. Do not bypass the claim check.

## Step 5 - Execute With Subagents

For each claimed task, follow `superpowers:subagent-driven-development`:

1. Dispatch a fresh implementer subagent with the full task text, dependencies, write scope, plan-folder path, constraints, and expected verification.
2. Require the implementer to use TDD when changing code and to run real verification.
3. Dispatch a spec-compliance reviewer subagent.
4. If spec review fails, return to the implementer and re-review.
5. Dispatch a code-quality reviewer subagent.
6. If quality review fails, return to the implementer and re-review.
7. Only after both reviews pass may the controller mark the task `done`.

Subagents must not update `plan.state.json` themselves. The controller owns the state ledger.

If using `parallelGroup`, dispatch one implementer per independent task and keep their write scopes disjoint. Review and integrate each task independently before marking any task done. If conflicts appear, stop parallel execution and finish one task at a time.

## Step 6 - Verify Before Completion

Verification must exercise real functionality for the task. Mock-only, placeholder, fake-review, demo-data, or fixture-only claims do not satisfy production readiness.

Use task-specific verification from the plan first. If no verification command exists, create the smallest honest verification for the tranche and document the gap.

Before claiming success, run:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --write --json $ARGUMENTS
```

Confirm the task is still the claimed task and no new stop reason appeared.

## Step 7 - Update The Ledger

If implementation and both reviews pass:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status done --evidence "<verification summary>" --write --json $ARGUMENTS
```

If implementation is useful but verification is partial:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status review --evidence "<what works; what remains blocked>" --write --json $ARGUMENTS
```

If blocked:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status blocked --evidence "<blocker and owner decision needed>" --write --json $ARGUMENTS
```

## Final Response

Report:

- Plan set path.
- Task(s) claimed and final status.
- What changed.
- Verification run and result.
- Any blockers, user-final decisions, or next ready task.

Keep the response concise. The ledger carries the long memory.
