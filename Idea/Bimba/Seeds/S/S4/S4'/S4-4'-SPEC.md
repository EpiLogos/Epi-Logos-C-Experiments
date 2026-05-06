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
- Keep day-night-pass inside Anima orchestration, not a separate authority.

## API / Envelope / TS

- Owns `s4'.vak.evaluate`, `s4'.cs.*`, `s4'.context.assemble`, `s4'.psyche.*`, `s4'.goal.*`.
- Populates coordinate and lived-environs layers.

## Implementation Hooks

- `.pi/extensions/ta-onta/anima/`.
- Anima VAK evaluator.
- Psyche store.
- context assembler.
- constitutional agent definitions and VAK skills.

## Test Obligations

- VAK output includes primary family, coordinate, CPF, CT, CP, CF, CFP, CS.
- Psyche update/read round-trips.

## Boundaries

VAK evaluates work; Epii evaluates return meaning.
