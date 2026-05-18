---
name: goal-prelude
description: Use for `/goal` first-pass intent discovery. Writes a NOW-bound GoalPrelude markdown artifact, returns to dialogue, and avoids immediate execution, cron scheduling, run history, Epii resolution, or permanent crystallisation unless the user explicitly continues.
---

# Goal Prelude

Use this skill when the user invokes `/goal`, asks to convert an objective into an Anima/Psyche goal surface, or wants a goal prepared for possible immediate or scheduled execution.

## First Pass

The first pass is discovery, not execution.

1. Keep `CPF = (00/00)` and `CF = (0000)` as provisional first-pass coordinates.
2. Let [[Nous]] clear assumptions and gather only enough context for an honest summary.
3. Write one `goal-prelude` markdown file into the active NOW, preferably through `goal_prelude` or `epi agent goal prelude`.
4. Return a concise summary to the user with the open questions and suggested next mode.

Do not create a `GoalSpec`, `GoalRun`, cron job, review resolution, or permanent knowledge artifact on the first pass unless the user explicitly asks to proceed and the intent is already clear.

## Artifact Contract

The prelude belongs at:

`{NOW}/goals/goal-prelude-{YYYYMMDD-HHmmss}.md`

Required frontmatter:

```yaml
c_4_artifact_role: "goal-prelude"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_invocation_kind: "goal"
c_4_vak_status: "prelude"
c_4_cpf: "(00/00)"
c_4_cf: "(0000)"
c_4_cs: "Day"
c_5_review_required: false
```

The prelude may record candidate CT, CP, CFP, CS, Aletheia, Sophia, Chronos, or Epii routes, but those are not binding. Re-resolve VAK when the user continues.

## Continuation Rules

- Compile a `GoalSpec` only after user confirmation.
- Invoke immediate work only from a confirmed `GoalSpec` or explicit continuation.
- Schedule cron only by referencing a confirmed `GoalSpec` path.
- Hand review-required goals to Aletheia/Epii without resolving the review locally.

Cron is cadence, not meaning. Dialogue discovers meaning first.
