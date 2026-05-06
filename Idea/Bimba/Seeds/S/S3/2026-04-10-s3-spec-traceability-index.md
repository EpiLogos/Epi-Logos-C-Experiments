---
coordinate: "S3"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-10"
c_4_artifact_role: "traceability_index"
c_0_source_coordinates: ["[[S3]]", "[[S3']]", "[[S-STACK-INTEGRATION]]", "[[S3-S3i-GATEWAY]]"]
---

# [[S3]] Spec Traceability Index

This note records the source pool used to derive the current `[[S3]]` specification in
`Idea/Bimba/World/Types/Coordinates/S/S3/S3.md`.

## Governing Canon

- `docs/specs/S/S3-S3i-GATEWAY.md`
  Current decisive split: `[[S3]]` as gateway control plane and `[[S3']]` as shared
  state plane.
- `docs/specs/S/S-STACK-INTEGRATION.md`
  Stack-wide placement of `[[S3]]` inside the larger S-layer architecture.

## Primary Planning Layer

- `docs/plans/2026-03-07-s3-gateway-full-implementation.md`
  Main implementation-intent plan for full gateway shape.
- `docs/plans/2026-03-10-full-gateway-functionality-plan.md`
  Expanded target command surface and gateway responsibility envelope.
- `docs/plans/2026-03-07-s3-electron-verification-notes.md`
  Parity-facing notes for client expectations around the gateway plane.

## Legacy and Genealogical Sources

- `[[2026-02-11-omnipanel-gateway-parity-plan]]`
  Early parity framing that still informs `[[OmniPanel]]` compatibility pressure.
- `[[2026-02-17-omnipanel-gateway-state-architecture-plan]]`
  Transitional gateway/state split thinking before the current spec settled.
- `[[2026-02-26-epi-logos-canonical-system-plan]]`
  Older canonical placement that conflicts with the current `[[S3]]` reading and was
  treated as genealogy rather than target shape.
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/COORDINATE-MAP.md`
  Older coordinate map carrying superseded `[[PAI]]` / harness-era readings.
- `/Users/admin/Documents/Epi-Logos/Idea/Empty/coordinate-semantics.md`
  Broader coordinate semantics used to orient the older stack language.
- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S3.md`
  Prior world-level `[[S3]]` note used as historical background only.

## Related Inversion / Adjoining Coordinate Sources

- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S3'.md`
  Historical adjacent reading of `[[S3']]`, consulted to understand the older pair.
- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S3'Cx.md`
  Additional adjacent material used to clarify older night-side framing.

## Implementation and Contract Anchors Consulted

- `docs/dev/S3/README.md`
  Current runtime-facing description of the gateway slice.
- `.pi/extensions/ta-onta/chronos/CONTRACT.md`
  Extension contract clarifying how `[[Chronos]]` addresses gateway authority.
- `.pi/extensions/ta-onta/chronos/extension.ts`
  Concrete extension-side shape used to validate intended integration.
- `epi-cli/src/gate/parity.rs`
- `epi-cli/src/gate/protocol.rs`
- `epi-cli/src/gate/runtime.rs`
- `epi-cli/src/gate/sessions.rs`
- `epi-cli/src/gate/session_store.rs`
- `epi-cli/src/gate/system.rs`
- `epi-cli/src/gate/server.rs`
- `epi-cli/src/gate/spacetimedb_bridge.rs`
  Code anchors consulted only to verify that the normative `[[S3]]` reading was not
  being invented against the grain of the live system.

## Conclusion Trace

From this source pool, the working conclusion for the current type-level coordinate is:

- `[[S3]]` is the imperative gateway control plane
- it owns command, session authority, runtime control, and operator-facing transport
- it must remain distinct from `[[S3']]`, which owns shared synchronized state
- older plugin / harness / `[[PAI]]` readings remain genealogical background, not the
  target architecture
