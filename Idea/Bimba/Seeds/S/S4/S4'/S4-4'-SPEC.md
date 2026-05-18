---
coordinate: "S4.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.4' Shard: VAK and Psyche Law

## Intent

Own the [[Anima]] carrier of [[S4.4']] inside [[ta-onta]]: [[VAK]] evaluation, [[CPF]]/[[CT]]/[[CP]]/[[CF]]/[[CFP]]/[[CS]] publication, [[Psyche]] state, context-pack assembly, goals, scope, and inhabited task-world law.

This is the sovereign dispatch center of S4'. It consumes the other ta-onta carriers and makes them one operational language.

## Build Scope

- Type `s4'.vak.evaluate` fields.
- Define Psyche lifecycle.
- Define [[S4-4'-GOAL-PRELUDE-SPEC]] as the default `/goal` discovery surface: first pass writes NOW-bound markdown and returns to user dialogue before any execution, cron scheduling, or review promotion.
- Keep day-night-pass inside Anima orchestration, not a separate authority.

## API / Envelope / TS

- Owns `s4'.vak.evaluate`, `s4'.cs.*`, `s4'.context.assemble`, `s4'.psyche.*`, `s4'.goal.*`.
- Populates coordinate and lived-environs layers.
- `s4'.goal.prelude` is dialogical and NOW-bound; `s4'.goal.compile` and `s4'.goal.invoke` require confirmed intent.

## Implementation Hooks

- `.pi/extensions/ta-onta/anima/`.
- Anima VAK evaluator.
- Psyche store.
- context assembler.
- constitutional agent definitions and VAK skills.

## Test Obligations

- VAK output includes primary family, coordinate, CPF, CT, CP, CF, CFP, CS.
- Psyche update/read round-trips.
- First `/goal` pass creates a `goal-prelude` artifact only; no cron job, run history, or Epii review resolution is created without explicit continuation.

## Boundaries

VAK evaluates work; Epii evaluates return meaning.
