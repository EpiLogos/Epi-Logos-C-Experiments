---
coordinate: "S4.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.5' Shard: Aletheia Membrane

## Intent

Own the [[Aletheia]] carrier of [[S4.5']] inside [[ta-onta]]: UX membrane, thought/T-bucket handling, crystallisation trigger, [[Sophia]] disclosure, Night' return handling, and [[Epii]] review handoff.

This is not the whole [[S5]] world-return system. It is S5/S5' return pressure internalized inside S4' so agent outputs can become reviewable, crystallisable, and handoff-ready.

## Build Scope

- Produce reviewable crystallisations.
- Route human-visible notices.
- Send meaning-review material to S5' inbox when required.

## API / Envelope / TS

- Supports `s4'.thought.*`, `s4'.crystallise`, `s4'.notify_user`.
- Produces crystallisation layer material.

## Implementation Hooks

- `.pi/extensions/ta-onta/aletheia/`.
- Aletheia extension.
- Sophia disclosure path.
- Epii review inbox bridge.
- Night' and Moirai-mode handoff surfaces.

## Test Obligations

- Crystallisation creates typed disclosure.
- Review-required output routes to Epii inbox target.

## Boundaries

Aletheia triggers and curates; [[Epii]] governs deep review and improvement.
