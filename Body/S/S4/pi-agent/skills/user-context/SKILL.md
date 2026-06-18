---
name: user-context
description: "Mandatory-routed UserContextFrame skill for VAK dispatches that need PASU, kairos, identity, recent-session, active-goal, recognition, and provenance context."
ct: CT4
cp: "4.4"
agent_affinity: constitutional-7
canonical_spec: "[[M'-USER-CONTEXT-SKILL-SPEC]]"
schema: "./schema.json"
entrypoint: "./index.ts"
---

# User Context

`user-context` is a first-class Pleroma-Techne atomic skill. It is invoked before agent dispatch when VAK routing says the user's temporal and longitudinal situation is load-bearing.

## Fire Rules

Fire when any routing condition is true:

- `CT` includes `CT2`, `CT4`, `CT4a`, `CT4b`, or `CT5`.
- `CF` is not `(00/00)`.
- `target` is in the Nara branch (`#4...`, `M4...`, or `M4'...`).
- `agent_role` is one of `anima`, `nous`, `logos`, `eros`, `mythos`, `psyche`, or `sophia`.
- `require_user_context` is true.
- `user_context_policy` is `fire`.

Skip only when every auto-routing condition is false, or when `user_context_policy` is `skip`.

## Output

The skill returns a validated `UserContextFrame` with seven channels:

- `pasu`
- `kairos`
- `identity`
- `recent_sessions`
- `active_dev_goals`
- `recognized`
- provenance metadata (`recognition_provenance`, `fired_at`, `fired_for`, `fire_reason`)

The frame carries structural signal only. Raw journal text, dream text, and private narrative content do not enter the frame.

## Injection Contract

`createDualInjection()` prepares:

- agent articulation context under `[[UserContext]]`
- a position-5-prime compatibility payload containing `lens_resonance_72` and `user_temporal_N`

Per [[M'-USER-CONTEXT-SKILL-SPEC]], current canon treats user-personal energy as the E_4 personal-resonance input and keeps E_5 focused on harmonic substrate. The compatibility payload is retained for Track 12.21/33 consumers that still expect a second-channel shape.

## Compliance

`assertUserContextRoutingCompliance()` refuses dispatch envelopes that match fire rules but carry neither an inline `user_context_frame` nor a `user_context_frame_ref`.

The exported `USER_CONTEXT_ROUTING_COMPLIANCE_CYPHER` is the Anuttara registration source for:

```bash
pi register-constraint user_context_routing_compliance constraints/user_context_routing_compliance.cypher
```

## Session Close

`appendPasuSessionHistory()` appends session-close deltas to `Idea/Pratibimba/Self/PASU.md` under `c_3_session_history`. The session-close caller is also responsible for appending the matching `M5_ContemplationObject.vak_profile_pairs[]` entry.
