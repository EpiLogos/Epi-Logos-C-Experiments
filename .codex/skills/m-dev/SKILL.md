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

   Discovery is Seed-first: active implementation plans live under `Idea/Bimba/Seeds/M/Legacy/plans/**` or `Idea/Bimba/Seeds/S/Legacy/plans/**`. The old `docs/plans/**` path is legacy fallback only.

   Read `hardStops`, `softCautions`, `carryForwardRisks`, and `workOrders`. Stop only for `hardStops`. Cautions and risks are guidance, not blockers. `workOrders` is the queue; `recommendedRoute` is the strategic path. Resume active first, then claim ready, skip `wait`.

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

4. **Execute.** Read the tranche body (one section of the plan markdown) and the substrate files you'll actually touch. Skip required-reading rituals unless the body itself names specific files. TDD when reasonable. Real verification (no mocks/fakes/placeholders).

5. **Mark.**

   ```bash
   node .codex/scripts/m-dev-plan-assess.mjs --mark <TASK_ID> --status done --evidence "<one sentence: test counts + key file>" --write --json --require-now
   ```

   Use `review` for partial; `blocked` only for real external blockers.

6. **Evidence is the string in the ledger, not a separate file.** Do NOT write `*-evidence.md` / `*-summary.md` / `*-report.md` that restate the ledger entry.

   Exception: when the tranche's deliverable IS a document (audit inventory, readiness report, runbook update, decision register), write THAT file — it's the work product, not evidence about evidence. Default location: `<plan_folder>/plan.runs/<task-id>-<deliverable-kind>.md`, where `<plan_folder>` is the Seed-hosted plan folder when one exists.

7. **Continue.** Reassess after each mark. Continue until a hard stop or the route exhausts. Don't re-run the assessor as verification before/after every mark — that's overhead, not safety.

## Subagents

When dispatched, subagents read `.codex/m-dev-subagent-brief.md` for shared protocol (lane discipline, mark template, no-mock rule, no-evidence-file rule, return format). The dispatching agent passes only the tranche-specific bits: id, plan-file:line-range, write scope, return shape.

Subagents do NOT write `plan.state.json` directly; they invoke `--mark` via the helper.

## Rule

Verify, don't trust. Every done claim is unproven until you run the acceptance commands yourself. Cut ceremony. Don't write files that duplicate the ledger string. Real verification, not theater.
