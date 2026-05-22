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

## Z-Thread Rehear-Phase Role

Aletheia is the **rehear-phase membrane** of the Z-thread self-composing cycle. The Z-cycle runs four phases:

```
compose  →  perform  →  rehear  →  recompose  →  next compose
(/goal      (CFP        (Aletheia   (Epii         (P5' Insight
 prelude)    dispatch)   here)       autoresearch)  → P0' Questions)
```

Aletheia receives [[Sophia]]'s session-end disclosure, curates the T/T' artifacts produced by the run, and routes the rehear-output to [[Epii]] as autoresearch intake. The Aletheia sub-agent rotation through the Z-cycle:

| Sub-agent | Z-thread role | Phase |
|---|---|---|
| [[Anansi]] | compose-phase witness (the unknown the new theme reaches into) | compose |
| [[Klotho]] | spins traces as the performance unfolds (P1' Traces) | perform |
| [[Lachesis]] | measures harmonic context for analysis (P4' Discovery) | rehear |
| [[Atropos]] | marks what crystallizes (P5' Insight) | rehear |
| [[Janus]] | two-faced bridge — looks back at prior cycle, forward at next | seams |
| [[Mercurius]] | carries P5' Insight across the Möbius seam to next-cycle P0' Questions | seam |
| [[Agora]] | marketplace where challenger-vectors get evaluated | recompose |
| [[Zeithoven]] | generates the next-form; hands score to next compose | recompose |

The deeper work (Sophia/Darshana/Zeithoven autoresearch execution) delegates to [[Epii]]; Aletheia owns the membrane between Anima's session-scoped run and Epii's cross-session improvement.

## Boundaries

Aletheia triggers and curates; [[Epii]] governs deep review and improvement.

The Z-thread closure depends on two seams that are tracked as P0 blockers in [[06-vak-pleroma-implementation-gap-analysis]]: the Sophia post-execution hook (currently empty stub) and the Moirai Night' dispatch (spec exists, not wired). Until both close, the Z-cycle's rehear→recompose arc cannot round-trip.
