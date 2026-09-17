---
name: m-dev
description: Use when the user invokes /m-dev or asks to autonomously develop an implementation plan set.
---

# M-Dev Plan Execution

## Execution Discipline (standing disposition — hold for every /m dev session)

This skill inherits the Fable Mindset: a disciplined agent does not rush to the keyboard. It grounds in reality, forms a hypothesis, acts in deliberate batches, stops to read what came back, and only then decides the next move. It treats its own edits as unproven until a real check passes. When something fails, it diagnoses instead of retrying blind. Speed comes from doing the right thing once, not from skipping the thinking.

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

**Done status in the ledger is a CLAIM, not verified truth. Verify dependencies yourself — run their acceptance commands, check their deliverables. Do not build on unverified claims.** Cut ceremony. Real verification, not theater.

Default to autonomous work-order execution. Verify, don't trust. Cut ceremony.

## Workflow

1. **Assess.**

   ```bash
   node .codex/scripts/m-dev-plan-assess.mjs --route --write --json --require-now
   ```

   Pass a plan folder if the user supplied one. Use `--reset --write --json` without `--route` only when asked to reset.

   When the user has explicitly taken review outside m-dev, add `--continue-through-review`. It permits scheduling and claims behind `review` dependencies without any automatic verifier handoff. It never marks review work `done`, and any dependent remains barred from `done` closure until its direct dependencies are `done`.

   Discovery is Seed-first: active implementation plans live under `Idea/Bimba/Seeds/M/Legacy/plans/**` or `Idea/Bimba/Seeds/S/Legacy/plans/**`. The old `docs/plans/**` path is legacy fallback only.

   Read `hardStops`, `softCautions`, `carryForwardRisks`, and `workOrders`. Stop only for `hardStops`. Cautions and risks are guidance, not blockers. `workOrders` is the queue; `recommendedRoute` is the strategic path. Resume active first, then claim ready, skip `wait`. Historical `blocked` records without structured external provenance are dependency-repair work: the assessor routes them as ready when their prerequisites permit instead of silently swerving them.

   Plan sections are sequential by default. A tranche whose section contains the exact line `Scheduling: independent` opts out of only the mechanically inferred immediately preceding tranche; every explicit `Depends on:` edge still binds. Use this marker only when the tranche is genuinely order-independent, never to route around a real substrate dependency.

   Active development must be NOW-bound. The assessor reports `activeDevelopmentContext` from `.epi/session.json` or `EPI_NOW_PATH`; if `--require-now` hard-stops, run `epi agent session init` and, when the daily scaffold is missing, `epi vault day-init`, then reassess. Do not create an ad-hoc note path outside `Idea/Empty/Present/{DD-MM-YYYY}/{sessionId}/now.md`.

2. **Substrate-truth spot-check (once per session, not per tranche).**

   At session start:
   - Confirm `Body/` crates compile if relevant.
   - If a pending tranche's substrate is already landed, mark `--status review` pointing at the live substrate, then continue.

   After this: the ledger records claims, not verified truth. Don't assume another agent's evidence is accurate. Run the acceptance commands yourself for any dependency whose work you're building on.

   Standing invariants (keep without re-citing):
   - S0 is the membrane (CLI/process/adapter). S1/S2/S3/S4/S5 own service law.
   - `Body/M/epi-theia` is the M' Theia shell authority; `Idea/Pratibimba/System` is its design surface (not an executable tree). The legacy Tauri shell is deprecated migration-source only, preserved at `vendor/legacy/epi-tauri`.
   - The coordinate system is the modular system; convenience residency does not override coordinate ownership.
   - `M` is the Bimba ontological map; `M'` is coded Pratibimba expression.
   - `Idea/Bimba/Seeds/**/Legacy` is the canonical home for migrated `/docs` specs, plans, and superpowers artifacts. New load-bearing plans/specs should be created in the owning Seed coordinate, not under `/docs`.
   - `Idea/Bimba/World/**` remains the crystallised architecture surface; Seeds hold developmental plans/specs and legacy source material until crystallisation.

3. **Claim.**

   ```bash
   node .codex/scripts/m-dev-plan-assess.mjs --claim <TASK_ID> --owner <AGENT_OR_THREAD_ID> --lease-minutes 120 --write --json --require-now
   ```

   The claim REFUSES on unresolved hard stops (missing or STALE NOW — another day's NOW no longer satisfies `--require-now`) and on a dirty tree over the limit (`--allow-dirty` overrides, recorded in the ledger). `audit_required` tasks are claimable — they are the re-verification queue. `quarantine` tasks are not; a human lifts quarantine.

4. **Execute.** Read the tranche body (one section of the plan markdown) and the substrate files you'll actually touch. Skip required-reading rituals unless the body itself names specific files. TDD when reasonable. Real verification (no mocks/fakes/placeholders).

   A repository-owned missing capability discovered during execution is a dependency to repair, not permission to stop. Keep the failing behavioral test. If the repair is inside the tranche's write scope, implement it before resuming the surface task. If it crosses the assigned scope or ownership boundary, mark the current work `review` with the exact missing method/adapter/service and reorder or create the dependency work order ahead of it. Never replace the missing capability with a renderer-local substitute.

5. **Verify, then Mark.** The close path is two commands, two identities — the implementer never closes alone.

   Independent verification first (a different owner re-runs the tranche's checks fresh, plus honesty-lint and verify-all; writes `plan.runs/verifications/<TASK_ID>.md`):

   ```bash
   node .codex/scripts/verify-tranche.mjs <TASK_ID> --owner <VERIFIER_ID>
   ```

   Then mark with a structured receipt:

   ```bash
   node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status done \
     --receipt '{"command":"<verification command run>","exitCode":0,"testsPassed":<n>,"testsFailed":0,"keyPaths":["<key file>"]}' \
     --evidence "<one sentence: what landed>" --owner <IMPLEMENTER_ID> --write --json --require-now
   ```

   The mark is REFUSED (fail closed) when: no green receipt; no fresh PASS verification record; verifier-owner equals the closing owner; a cited `DR-*` id is absent from the decision registers; a dependency is quarantined; or the track's verification class (`plan.runs/verification-classes.json`) demands UI-flow (UF: playwright/test:e2e/boot-smoke) or live-wire (W: spawned gateway) proof the receipt doesn't carry.

   Use `review` for partial or repository-owned dependency repair. `blocked` is reserved for external dependencies and is fail-closed:

   ```bash
   node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status blocked \
     --blocker-kind human|environment|third-party --blocked-by "<external dependency>" \
     --evidence "<observed external condition>" --owner <IMPLEMENTER_ID> --write --json --require-now
   ```

   Missing repository methods, adapters, services, producers, receivers, routes, and harnesses do not qualify as external. `--status quarantine` marks fraud; dependents that trusted the task flip to `audit_required` automatically.

6. **Evidence is the string in the ledger, not a separate file.** Do NOT write `*-evidence.md` / `*-summary.md` / `*-report.md` that restate the ledger entry.

   Exception: when the tranche's deliverable IS a document (audit inventory, readiness report, runbook update, decision register), write THAT file — it's the work product, not evidence about evidence. Default location: `<plan_folder>/plan.runs/<task-id>-<deliverable-kind>.md`, where `<plan_folder>` is the Seed-hosted plan folder when one exists.

7. **Commit the tranche, then continue.** After a `done` mark, commit that tranche's changes (`git add -A && git commit`) so the working tree returns to clean. This is not optional bookkeeping: the dirty-file gate that guards `--claim` is satisfied ONLY by real commits, so an uncommitted tree silently accumulates across sessions until claims start refusing (the recurring "246 dirty files" stall). One commit per closed tranche — the message names the tranche id + a one-line summary; it is the natural checkpoint boundary. Then reassess. Continue until a hard stop or the route exhausts. Don't re-run the assessor as verification before/after every mark — that's overhead, not safety.

## Subagents

When dispatched, subagents read `.codex/m-dev-subagent-brief.md` for shared protocol (lane discipline, mark template, no-mock rule, no-evidence-file rule, return format). The dispatching agent passes only the tranche-specific bits: id, plan-file:line-range, write scope, return shape.

Subagents do NOT write `plan.state.json` directly; they invoke `--mark` via the helper.

## Rule

Verify, don't trust. Every done claim is unproven until you run the acceptance commands yourself. Cut ceremony. Don't write files that duplicate the ledger string. Real verification, not theater.
