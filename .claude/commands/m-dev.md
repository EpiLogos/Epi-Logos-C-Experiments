---
description: "Develop the next safe tranche from the active implementation plan set"
disable-model-invocation: true
---

# `/m-dev`

Run the active implementation plan set as a context-first route-development loop.

This is the only user-facing command. Internally, `/m-dev` discovers the plan set, refreshes the index/state ledger, marks a short dependency-aware route through the work, builds context packs from the plan and source/spec files, then executes in the current session by default.

Subagents are optional. Do not use them unless the user passes `--subagents`, asks for parallel work, or explicitly approves them after seeing the task.

## Modes

- **Default:** in-session execution by the current agent.
- **`--route`:** explicitly mark the current recommended 3-5 task route. The command does this by default unless the user is only resetting or inspecting.
- **`--subagents`:** use subagent-driven development for implementation/review.
- **`--parallel`:** only with `--subagents`, and only for tasks the assessor marks parallel-safe after a second sanity check.
- **`--reset`:** reset `plan.state.json` to a clean pending ledger for the active plan set.

## Required Skills

Invoke only what applies:

- Always use `superpowers:test-driven-development` before code changes.
- Always use `superpowers:verification-before-completion` before marking done.
- Use `superpowers:subagent-driven-development` only in `--subagents` mode.
- Use `superpowers:dispatching-parallel-agents` only in `--parallel --subagents` mode.

If an Epi-Logos/VAK gate is available, run it before claiming implementation work.

## Step 1 - Assess And Mark The Route

For normal development runs, run from the repository root:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --route --write --json $ARGUMENTS
```

For a reset-only request, do not mark a new route:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --reset --write --json $ARGUMENTS
```

If `$ARGUMENTS` includes only a plan folder, pass it through. If it includes mode flags such as `--subagents`, `--parallel`, `--in-session`, or `--reset`, those are accepted by the helper.

The helper writes or refreshes:

- `plan.index.json`
- `plan.state.json`
- `plan.runs/`

The assessment returns `recommendedRoute`: a 3-5 task route when enough work is available, shortened when tasks are too taxing or dependencies run out. Treat this route as the intended path for the session, not as a promise to finish everything regardless of verification.

Do not manually invent task state if the assessor can compute it.

## Step 2 - Stop Conditions

Stop and report clearly if the assessment returns `stopReasons`.

Also stop before implementation if:

- The recommended task depends on a user-final decision that is not resolved.
- The task is primarily an ADR/user-choice tranche and needs the user's choice before engineering.
- The task overlaps unrelated dirty files.
- The task requires destructive commands, external credentials, or a missing local service harness.
- The plan set is ambiguous.

If stopping, do not claim the task. Give the user the smallest useful next decision or unblocker.

## Step 3 - Read The Route

Use `recommendedRoute.tasks` as the path. Each route task includes:

- `effortWeight`: small tasks are light; larger/week-scale tasks count heavier.
- `modeHint`: `in-session`, `consider-subagents-if-approved`, or `split-before-execution`.
- `dependsOn`, `writeScopes`, and computed status.

Plan to work through the route in order. For a light route, continuing through 4-5 tasks is encouraged if verification remains clean. For a balanced route, aim for 3-4 tasks. For a heavy route, stop after the first task that needs splitting, user validation, or substantial review.

## Step 4 - Build Each Context Pack

Before claiming each task, generate the context pack for that route task:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --context <TASK_ID> --write --json $ARGUMENTS
```

Read the generated `plan.runs/context-<TASK_ID>.md`.

Then read or search the files listed under **Required Reading**. This is mandatory. The plan summary is not enough.

The process must carry forward:

- The full task body.
- Track source specs.
- Dependency-track context.
- Relevant open decisions.
- Canon/spec source files and cited sections where available.
- Existing implementation files in the write scope.
- Verification expectations.

If the context pack is thin, pause and gather missing context before implementation. Do not compensate with ceremony.

## Step 5 - Select Work

Default to the first task in `recommendedRoute.taskIds`. Continue to later route tasks only after the prior task is marked `done` or deliberately marked `review`/`blocked`.

Use `parallelGroup` only in `--parallel --subagents` mode, and only if every task is genuinely independent:

- No overlapping write scopes.
- No shared schema/API/migration/lockfile/service boundary.
- No shared unresolved architectural decision.
- No shared fragile live service, port, fixture directory, or state store.
- Each task can be reviewed and verified independently.

When uncertain, execute only the recommended task in-session.

## Step 6 - Claim Work

Claim each selected task before implementation:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --claim <TASK_ID> --write --json $ARGUMENTS
```

If the claim fails, stop and report the assessor output. Do not bypass the claim check.

## Step 7 - Execute

### Default In-Session Execution

Work in the current session:

1. Use the context pack and required reading to build working context.
2. If code changes are needed, follow TDD.
3. Implement the smallest tranche-complete change.
4. Run task-specific verification from the plan.
5. Self-review against the task body, source specs, open decisions, and production-readiness rules.

### Optional Subagent Execution

Only when `--subagents` is active, or when the user explicitly approves subagents after seeing a route task marked `consider-subagents-if-approved`:

1. Dispatch a fresh implementer subagent with the context pack and the exact required-reading list.
2. Require the subagent to read/search the listed source/spec files before editing.
3. Run spec-compliance review against the task, source specs, and open decisions.
4. Run code-quality review.
5. Rework until reviews pass.

Subagents must not update `plan.state.json`; the controller owns the ledger.

## Step 8 - Verify Before Completion

Verification must exercise real functionality for the task. Mock-only, placeholder, fake-review, demo-data, or fixture-only claims do not satisfy production readiness.

Before claiming success, rerun:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --write --json $ARGUMENTS
```

Confirm the task is still the claimed task and no new stop reason appeared.

## Step 9 - Update The Ledger

If implementation and verification pass:

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
- Active route and how far through it you got.
- Task id(s) and final status.
- Context pack path.
- What changed.
- Verification run and result.
- Any blockers, user-final decisions, or next ready task.

Keep the response concise. The ledger carries the long memory.
