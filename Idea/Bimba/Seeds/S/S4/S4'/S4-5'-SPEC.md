---
coordinate: "S4.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4'-SPEC]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.5' Shard: Aletheia Membrane

## Canonical Role

[[S4.5']] is the [[Aletheia]] carrier of [[S4']]: [[P5]] / [[CT5]] truth-disclosure membrane, thought/T-bucket handling, [[Sophia]] disclosure, Night' return handling, crystallisation trigger, and review handoff toward [[S5']] [[Epii]].

## Source And Diagram Anchors

- Umbrella and local authority: [[S4'-SPEC]], [[S4-SPEC]], [[S4'-TRACEABILITY-INDEX]], [[S4-5-SPEC]], [[S5'-SPEC]], [[S4-4'-GOAL-PRELUDE-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]].
- World/MOC anchors: [[S4']], [[Aletheia]], `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-TA-ONTA-EXTENSION-SPEC]], [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]], [[2026-03-10-ta-onta-full-implementation]], [[2026-04-04-graphiti-unified-temporal-context-service]], [[2026-05-21-agent-led-coordinate-promotion-policy]].

## Current Body Reality

The live Aletheia carrier is `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts`, `CONTRACT.md`, `modules/gate-trigger.ts`, `modules/thought-vak.ts`, `modules/sophia-ingest.ts`, `modules/hen-integration.ts`, `modules/coordinate-loop.ts`, and `S5'/skills/**`. It registers session promotion, Gnosis ingest/query/notebook, thought route, crystallise, seed refresh, enrichment/status, episodic record/search/arc tools, Mobius arc, thought ingestion, and `epii_invoke_anima`.

Tests: `z_cycle_smoke.test.ts`, `gate_trigger.test.ts`, `sophia_ingest.test.ts`, and `thought_route_vak.test.ts`. The Janus envelope schema and Aletheia gates sit under `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/**`.

## Build Contract

Aletheia receives review pressure from [[Sophia]] and [[Psyche]], routes thoughts into T/T' surfaces, prepares reviewable crystallisations, and hands deep evaluation to [[Epii]]. It must not absorb [[S5']] governance. Every crystallisation must carry source artifacts, [[VAK]] address, session/day/NOW, privacy/review class, and whether it is a trigger, draft, or approved promotion candidate.

The Z-thread role is rehear, not recompose. Recomposition/autoresearch belongs to [[Epii]], even when Aletheia supplies Gnosis, Moirai, or Night' material.

## API / Envelope / Implementation Hooks

- Target families: `s4'.thought.*`, `s4'.crystallise`, `s4'.notify_user`.
- PI mirrors: `aletheia_thought_route`, `aletheia_crystallise`, `aletheia_session_promote`, `aletheia_seed_refresh`, `aletheia_gnosis_*`, `aletheia_episodic_*`, `epii_invoke_anima`.
- Review envelope includes session lineage, source artifacts, T-bucket, Gnosis notebook, [[VAK]] address, and target coordinate.
- Night' handoff uses Moirai through [[Anima]] dispatch rather than direct Aletheia self-routing.

## Test Obligations

- `thought_route_vak.test.ts` proves VAK-bearing thought artifacts route correctly.
- `sophia_ingest.test.ts` proves Sophia disclosure ingestion.
- `gate_trigger.test.ts` proves gate classification semantics.
- `z_cycle_smoke.test.ts` proves compose/perform/rehear/recompose seam wiring does not regress.
- Review-required material must assert Epii handoff, not auto-promotion.

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

## Open Gaps

- Sophia post-execution hook and Moirai Night' dispatch remain closure blockers for the full Z-cycle round trip.
- Provider-backed `epii_invoke_anima` reciprocity is present as a surface but not yet a complete S5' review lane.
- `s4'.notify_user` remains under-specified relative to the tool surfaces already present.

## Boundaries

Aletheia triggers and curates; [[Epii]] governs deep review and improvement.

The Z-thread closure depends on two seams that are tracked as P0 blockers in [[06-vak-pleroma-implementation-gap-analysis]]: the Sophia post-execution hook (currently empty stub) and the Moirai Night' dispatch (spec exists, not wired). Until both close, the Z-cycle's rehear→recompose arc cannot round-trip.
