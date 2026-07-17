---
description: "Autonomously develop the active implementation plan set"
---

# `/m-dev`

## Execution Discipline (standing disposition — hold for every /m-dev session)

This command inherits the Fable Mindset: a disciplined agent does not rush to the keyboard. It grounds in reality, forms a hypothesis, acts in deliberate batches, stops to read what came back, and only then decides the next move. It treats its own edits as unproven until a real check passes. When something fails, it diagnoses instead of retrying blind. Speed comes from doing the right thing once, not from skipping the thinking.

The loop: **GROUND → REASON → ACT → OBSERVE → RE-EVALUATE → VERIFY → NARRATE**

1. State hypothesis before first tool call. One line: what you're testing.
2. After every tool result, STOP and read it. Update plan from what you saw — not from the plan you formed before the data.
3. Read exact file before editing. Never edit from memory of what a file "probably" contains.
4. Batch independent operations. Serialize dependent ones.
5. After editing, run REAL verification (test/build/lint), not ls/echo.
6. On failure: diagnose before retry. Read error → inspect state → corrected fix → re-verify.
7. Report honestly. "Tests pass" not "looks good."
8. Match effort to task. One-line fix ≠ war room.

Never: fire tools without hypothesis · barrel through pre-planned sequence · edit from memory · retry same failing command · declare done because "looks right"

Run the active implementation plan set as a context-first autopilot loop. Discover the plan set, refresh the ledger, mark a short route, claim → execute → mark → continue. **Done status in the ledger is a CLAIM, not verified truth. Verify dependencies yourself. Do not build on unverified claims.** Cut ceremony.

## Modes

- **Default:** in-session autonomous execution.
- **`--route`:** mark a fresh 3-5 task route (the command does this by default).
- **`--subagents`:** allow subagent-driven execution for suitable batches.
- **`--parallel`:** only when work orders are genuinely independent (no shared write scopes, no shared fragile service).
- **`--continue-through-review`:** when the human has taken review externally, schedule and claim behind `review` dependencies without auto-handoff. Review records remain unresolved and still block `done` closure.
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

After this: **the ledger records claims, not verified truth.** If a dep is marked `done` with evidence, verify it yourself — run its acceptance commands, check its deliverables. Don't assume another agent's evidence is accurate. Don't build on unverified claims.

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

The claim REFUSES when hard stops are unresolved (missing or stale NOW — a month-old NOW no longer satisfies `--require-now`) or when the working tree carries too many dirty files outside plan artifacts. `--allow-dirty` overrides the dirty gate and the override is recorded in the ledger. `audit_required` tasks are claimable — they are the re-verification queue. `quarantine` tasks are not; a human lifts quarantine.

## Step 4 — Execute

Read the tranche body in the plan markdown (one section, line-range) and the substrate files you'll actually touch. The body lists deliverables + verification commands. That's the brief. Skip required-reading rituals unless the body itself names specific files.

Code changes: TDD when reasonable. Real verification — no mocks/fake/placeholder.

## Step 5 — Verify, then Mark

The close path is two commands, two identities. The implementer never closes alone.

**1. Independent verification** — a different owner than the implementer re-runs the tranche's checks fresh:

```bash
node .codex/scripts/verify-tranche.mjs <TASK_ID> --owner <VERIFIER_ID>
```

This re-executes the Verify-line commands plus honesty-lint and verify-all, and writes `plan.runs/verifications/<TASK_ID>.md` with a PASS or REFUSED verdict. A red stage refuses the record.

**2. Mark with a structured receipt:**

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status done \
  --receipt '{"command":"<verification command run>","exitCode":0,"testsPassed":<n>,"testsFailed":0,"keyPaths":["<key file>"]}' \
  --evidence "<one sentence: what landed>" --owner <IMPLEMENTER_ID> --write --json --require-now $ARGUMENTS
```

The mark is REFUSED (fail closed) when: no receipt or the receipt isn't exit-0 with 0 failures; no fresh PASS verification record exists; the record's verifier-owner equals the closing owner; a cited `DR-*` id is absent from the decision registers (or claimed VALIDATED when the register doesn't say so); a dependency is quarantined; or the track's verification class (`plan.runs/verification-classes.json`) demands UI-flow (UF: playwright/test:e2e/boot-smoke) or live-wire (W: spawned gateway) proof the receipt doesn't carry.

**Unrelated-flake judgment (don't hold a green deliverable hostage).** A tranche is verified when *its own* deliverable checks pass — its unit tests, its dedicated e2e spec, typecheck, build. When the ONLY red is in the shared/whole-repo gate and lands in tests the tranche does not touch, apply judgment before holding it: is the failing test independently flaky (times out under parallel load, passes green in isolation, or passed on a sibling run of the same tree)? If yes, that is an environmental flake, not this tranche's defect — close it. The honest mechanism: re-run `verify-tranche <id> --owner <verifier> --only honesty-lint` so the record's PASS rests on the tranche's own Verify line (which already carries its class-proof: its own playwright/e2e for UF, its own live-wire for W), and note the confirmed-flaky sibling test in the evidence string. This is NOT "retry the full gate until it happens to go green" (that IS gate-gaming — forbidden). It is: prove the deliverable, name the flake, move on. When in doubt whether a failure is truly unrelated, spend ONE targeted run (the failing test in isolation) to confirm — not a loop of full-gate re-runs. The human Architect's "this is fine, mark it" is a valid close signal; a flaky unrelated suite is not a reason to burn their turn.

Use `review` for partial; `blocked` only when a real external blocker holds (waiting on user, missing service, deferred decision). Neither requires the done gate — use them honestly instead of forcing a done.

`--status quarantine` marks fraud: dependents that trusted the task flip to `audit_required` automatically.

**Evidence is a string in the ledger, not a separate file.** Do NOT write `*-evidence.md` / `*-summary.md` / `*-report.md` that restate the ledger entry. The ledger IS the record.

**Allowed exceptions** — write a file only when the tranche's DELIVERABLE is itself a document (audit inventory, readiness report, runbook, decision register update). The file IS the work product, not "evidence about evidence." Default location: `<plan_folder>/plan.runs/<task-id>-<deliverable-kind>.md`, where `<plan_folder>` is the Seed-hosted plan folder when one exists.

## Step 6 — Commit the tranche (keeps the tree clean for the next claim)

After a `done` mark, **commit that tranche's changes** (`git add -A && git commit`). This is part of the close, not optional bookkeeping: the dirty-file gate that guards `--claim` (Step 3) is satisfied ONLY by real commits. An uncommitted tree silently accumulates across sessions until claims start refusing — the recurring "N dirty files outside plan artifacts" stall that halts autonomous flow. One commit per closed tranche; the message names the tranche id + a one-line summary of what landed (it IS the checkpoint boundary). Then loop back to Step 1/Step 3 for the next tranche.

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

Verify, don't trust. Every done claim is unproven until you run the acceptance commands yourself. Cut ceremony. Real verification, not theater.
