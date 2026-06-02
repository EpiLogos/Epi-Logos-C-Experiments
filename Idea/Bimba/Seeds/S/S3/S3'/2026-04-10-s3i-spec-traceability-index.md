---
coordinate: "S3'"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-10"
c_4_artifact_role: "traceability_index"
c_0_source_coordinates: ["[[S3']]", "[[S3]]", "[[S3-S3i-GATEWAY]]", "[[S-STACK-INTEGRATION]]"]
---

# [[S3']] Spec Traceability Index

This note records the source pool used to derive the current `[[S3']]` specification in
`Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.md`.

## Governing Canon

- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`
  Decisive canonical source for the `[[S3]]` / `[[S3']]` two-plane architecture.
- `Idea/Bimba/Seeds/S/Legacy/specs/S/S-STACK-INTEGRATION.md`
  Broader stack placement of the night-side shared-state layer.

## Primary Planning Layer

- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-gateway-full-implementation.md`
  Source for intended gateway-to-state-plane relationship.
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-full-gateway-functionality-plan.md`
  Expanded target shape of what the gateway emits toward the shared field.
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-23-nara-clock-canonical-runtime-implementation-plan.md`
  Important for understanding how `[[Nara]]`, temporal state, and shared runtime
  surfaces are meant to converge.

## Legacy and Genealogical Sources

- `[[2026-02-26-epi-logos-canonical-system-plan]]`
  Older canonical placement that still reads `[[S3']]` as loader-ish rather than shared
  ontological state.
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/COORDINATE-MAP.md`
  Older coordinate map with superseded named-plugin / infrastructure readings.
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/coordinate-semantics.md`
  Broader semantic backdrop for interpreting the old coordinate language.
- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S3'.md`
  Prior world-level `[[S3']]` note used as genealogy only.
- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S3'Cx.md`
  Adjacent historical material clarifying older inversion-side framing.
- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S3.md`
  Day-side historical note consulted to understand the older pairing.

## Implementation and Contract Anchors Consulted

- `docs/dev/S3/README.md`
  Current engineering description of the gateway area that feeds the state plane.
- `.pi/extensions/ta-onta/chronos/CONTRACT.md`
  Contract material used to understand temporal and gateway-to-state responsibilities.
- `.pi/extensions/ta-onta/chronos/extension.ts`
  Extension-side behaviour consulted as a reality check on actualisation claims.
- `epi-cli/src/gate/spacetimedb_bridge.rs`
  Main bridge anchor for how gateway events are shaped toward shared state.
- `epi-cli/src/gate/nara.rs`
  Bridge-adjacent routing for `[[Nara]]`-related signals.
- `epi-spacetime-module/src/lib.rs`
  Current `[[SpacetimeDB]]` module/schema anchor consulted while drafting the target
  state-plane form.

## Conclusion Trace

From this source pool, the working conclusion for the current type-level coordinate is:

- `[[S3']]` is the declarative shared-state plane of the `[[Universal NOW]]`
- `[[SpacetimeDB]]` is the intended host of that live collective runtime
- the canonical shape includes identity, presence, session, activity, and M-surface
  families governed by reducers and subscriptions
- older named-plugin and ta-onta-loader readings remain genealogical background, not
  the target architecture
