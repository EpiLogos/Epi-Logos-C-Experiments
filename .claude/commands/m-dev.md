---
description: "Autonomously develop the active implementation plan set"
---

# `/m-dev`

Run the active implementation plan set as a context-first autopilot loop.

This is the only user-facing command. Internally, `/m-dev` discovers the plan set, refreshes the index/state ledger, marks a short dependency-aware route through the work, converts it into work orders, builds context packs from the plan and source/spec files, then keeps executing until a real hard stop appears.

Subagents and worktrees are execution strategies, not extra user-facing commands. Use them when they make the current work order batch safer or faster; keep the ledger owned by the controller.

## Modes

- **Default:** autonomous in-session execution by the current agent, continuing through work orders while verification remains clean.
- **`--route`:** explicitly mark the current recommended 3-5 task route. The command does this by default unless the user is only resetting or inspecting.
- **`--subagents`:** allow subagent-driven implementation/review for suitable work orders.
- **`--parallel`:** use only when work orders are independent by write scope, service state, schema/API boundary, and verification path.
- **`--reset`:** reset `plan.state.json` to a clean pending ledger for the active plan set.

## Required Skills

Invoke only what applies:

- Always use `superpowers:test-driven-development` before code changes.
- Always use `superpowers:verification-before-completion` before marking done.
- Use `superpowers:subagent-driven-development` when the selected work-order batch benefits from fresh implementer/reviewer contexts.
- Use `superpowers:dispatching-parallel-agents` only when multiple work orders are genuinely independent.

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

The assessment also returns `workOrders`: ordered `resume`, `claim`, `wait`, or `skip` actions. Work orders are the operational queue; route ids are the strategic path.

Do not manually invent task state if the assessor can compute it.

## Step 2 - Classify Risks

Read `hardStops`, `softCautions`, and `carryForwardRisks`.

Stop only for hard stops:

- Destructive action is required and not explicitly approved.
- External credentials or private user-final approval are required.
- A privacy/user-final gate blocks the specific work order.
- Verification cannot be made meaningful because the required harness/service does not exist and no captured-live fixture path is available.
- Dirty files directly conflict with the same symbols/files the work order must edit and cannot be isolated in a worktree.

Do not stop for ordinary active leases, review items, dirty unrelated lanes, implementation-owner defaults, or downstream readiness gaps. Treat those as queue state: resume, requeue, isolate, or carry forward.

## Step 3 - Read The Work Orders

Use `workOrders` as the execution queue. Each work order includes:

- `action`: `resume`, `claim`, `wait`, or `skip`.
- `owner`, `leaseExpiresAt`, and `worktree` when a task is already owned.
- `effortWeight`: small tasks are light; larger/week-scale tasks count heavier.
- `modeHint`: `in-session`, `consider-subagents-if-approved`, or `split-before-execution`.
- `dependsOn`, `writeScopes`, and computed status.

Resume active work orders first. Then claim ready work orders. Skip or defer `wait` orders until their dependencies are done. For a light route, continuing through 4-5 tasks is encouraged if verification remains clean. For a balanced route, aim for 3-4 tasks. For a heavy route, split or subagent-review the heavy item rather than stopping the whole system.

## Step 4 - Build Each Context Pack

Before resuming or claiming each work order, generate the context pack:

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

## Step 4.5 - Substrate-Truth Gate

Before claiming or resuming, **read the live state of the substrate that the active work order names**. Compare it against the work order's deliverables. The plan is a hypothesis about what is still to do; the `/Body/` substrate is ground truth.

### Architecture-Corpus Gate

For cross-system work, read the seed-level architecture corpus before treating a task as local. At minimum, consult `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md`, `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md`, `Idea/Bimba/Seeds/S/S-SOURCE-TRACEABILITY-INDEX.md`, and `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`.

Preserve these invariants:

- The coordinate system is the modular system. Do not let convenience package residency override coordinate ownership.
- `S0` is the command membrane and executable return surface. It may parse, route, invoke, validate, audit, and report. It must not become the source authority for S2 graph law, S3 gateway/temporal law, S4 agent law, or S5 review/autoresearch law.
- `M` is the Bimba ontological map. `M'` is coded Pratibimba expression. Treat legacy `M0..M5` implementation labels and `#` dataset labels through that inversion guard.
- `/pratibimba/system` is the active M' Theia shell authority. `Body/M/epi-tauri` is migration-source-only unless a later explicit decision reactivates it.

The M' specs and S' specs carry direct wikilinks into the substrate — `[[Body/S/S0/epi-lib/include/m{n}.h]]`, `[[Body/S/S0/portal-core/src/...]]`, `[[Body/S/S2/graph-schema]]`, `[[Body/S/S2/graph-services]]`, `[[Body/S/S3/gateway]]`, `[[Body/S/S3/gateway-contract]]`, `[[Body/S/S5/epii-autoresearch-core]]`, `[[Body/S/S4/plugins/pleroma/capability-matrix.json]]`, etc. Follow them. The spec corpus is the navigation layer into the code; use it.

For each work order:

1. Identify the `Body/S/...` / `Body/M/...` paths the deliverable names (explicitly or via spec wikilinks).
2. Read or `ls`/`wc -l`/grep the actual files. Note LOC counts, test coverage, module composition.
3. Triage the deliverable against the live state:
   - **Landed.** The substrate already carries the deliverable. Halt and flag the task for recast — do not redo. Mark `--status review` with evidence pointing at the landed substrate; surface to the user that the tranche needs reframing as drift-audit or extension work rather than first-time build.
   - **Partial.** The substrate carries some of the deliverable. Narrow the work order to the genuine gap; do not rebuild the landed portion.
   - **Forward.** The substrate does not yet carry the deliverable. Proceed.
4. Honour prior plans whose state the current track inherits. If a tranche reads as first-time work but a prior dated plan in `docs/plans/` already executed that work (and the live code reflects it), inherit and extend rather than re-execute.

Specific patterns to watch for:
- **Schema/seed/import tranches** that assume an empty graph when `Body/S/S2/graph-services/src/{seed,dataset_import}.rs` and `docs/datasets/*-deep/` already populated it.
- **Gateway-skeleton tranches** that assume a fresh build when `Body/S/S3/gateway/src/` and `Body/S/S3/gateway-contract/src/lib.rs` are already production.
- **Kernel/profile tranches** that assume bare metal when `Body/S/S0/epi-lib/src/m{0..5}.c` and `Body/S/S0/portal-core/src/kernel.rs` already compute the substrate.
- **S5 core tranches** that assume new cores when `Body/S/S5/epii-{autoresearch,review,agent}-core/src/lib.rs` are live.
- **VAK / dispatch tranches** that assume new governance when `Body/S/S4/plugins/pleroma/capability-matrix.json` is the test-locked canonical authority (per Track 11 IOD-17).

Make the disposition explicit before any code is written. Substrate-truth before plan-truth.

## Step 5 - Select Work

Default to the first `resume` or `claim` work order. Continue to later work orders after the prior task is marked `done`, `review`, or `blocked` with evidence.

Use parallel execution only if every selected work order is genuinely independent:

- No overlapping write scopes.
- No shared schema/API/migration/lockfile/service boundary.
- No shared unresolved architectural decision.
- No shared fragile live service, port, fixture directory, or state store.
- Each task can be reviewed and verified independently.

When uncertain, execute sequentially or isolate in worktrees. Do not ask the user unless there is a hard stop.

## Step 6 - Claim Work

Claim each selected task before implementation:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --claim <TASK_ID> --owner <AGENT_OR_THREAD_ID> --lease-minutes 120 --write --json $ARGUMENTS
```

If the same owner already holds the task, this renews the lease and resumes it. If another live owner holds the task, pick another safe work order unless it is stale and deliberately requeued.

## Step 7 - Execute

### Default Autopilot Execution

Work in the current session:

1. Use the context pack and required reading to build working context.
2. If code changes are needed, follow TDD.
3. Implement the smallest tranche-complete change.
4. Run task-specific verification from the plan.
5. Self-review against the task body, source specs, open decisions, and production-readiness rules.
6. Mark the ledger, reassess, and continue to the next work order unless a hard stop appears.

### Optional Subagent Execution

When the work-order batch is safe for subagents:

1. Dispatch a fresh implementer subagent with the context pack and the exact required-reading list.
2. Require the subagent to read/search the listed source/spec files before editing.
3. Run spec-compliance review against the task, source specs, and open decisions.
4. Run code-quality review.
5. Rework until reviews pass.

Subagents must not update `plan.state.json`; the controller owns claims, leases, route state, and final marking.

## Step 8 - Verify Before Completion

Verification must exercise real functionality for the task. Mock-only, placeholder, fake-review, demo-data, or fixture-only claims do not satisfy production readiness.

Before marking a task done, rerun:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --write --json $ARGUMENTS
```

Confirm the task is still owned/resumable and no hard stop appeared.

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
