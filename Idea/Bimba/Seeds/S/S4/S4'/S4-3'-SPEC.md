---
coordinate: "S4.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.3' Shard: CF Dispatch Law

## Intent

Own the [[Chronos]] carrier of [[S4.3']] inside [[ta-onta]] plus the [[CF]] process law it conditions: runtime timing, Day/NOW event context, team/chain timing, pipeline handoff, and execution method selection as temporally grounded process.

This is not the whole [[S3]] gateway system. It is S3/S3' temporal/process law internalized inside S4' so dispatch happens in a live Day/NOW/Kairos context.

## Build Scope

- Resolve team CFP1 vs CFP3 semantics.
- Define parallel vs chain/fusion dispatch.
- Bridge deep-interview outputs into VAK evaluation where accepted.

## API / Envelope / TS

- Supports `s4'.orchestrate`, `s4'.team.compose`, `s4'.team.status`.

## Implementation Hooks

- `.pi/extensions/ta-onta/chronos/`.
- Anima orchestration.
- team/pipeline runtime.
- Day/NOW lifecycle hooks consumed by S4'.

## Test Obligations

- Same task maps to deterministic CF route.
- Parallel and chain modes produce distinct typed traces.

## Boundaries

Dispatch law chooses agents; S5' receives review/meaning outputs.
