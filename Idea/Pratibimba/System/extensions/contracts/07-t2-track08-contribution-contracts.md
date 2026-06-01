# Track 07 T2 - Track 08 Contribution Boundary

Track 07 exports individual M-extension capabilities. Track 08 owns integrated screen real estate, multi-extension choreography, plugin-level inhibition policy, and mini-mode placement.

## Public Import Rule

Track 08 imports only package-root/common exports:

- `@pratibimba/m0-anuttara`
- `@pratibimba/m1-paramasiva`
- `@pratibimba/m2-parashakti`
- `@pratibimba/m3-mahamaya`
- `@pratibimba/m4-nara`
- `@pratibimba/m5-epii`
- `@pratibimba/m-extension-runtime`

Track 08 must not import browser widgets, Theia contribution classes, generated `lib/browser/*`, private source files, S0/S2/S3/S5 internals, Neo4j, Redis, SpaceTimeDB SDKs, `portal-core`, or Epii review internals.

## Exported Contract Shape

Each extension exports `TRACK_08_CONTRIBUTION`, containing:

- Compact view contribution metadata.
- Selection handler metadata.
- Shared-bridge current-state selectors.
- Evidence serializer metadata.
- Mini-mode options.
- Cross-extension route contracts.
- Observability event contracts.
- Composition boundary ownership.

Every current-state selector is bridge-mediated through `SHARED_BRIDGE_ADAPTER`; no individual extension owns S0/S2/S3/S5 authority.

## Route Chain

- `m0.coordinate-to-m1.walk`: M0 coordinate selection to M1 walk.
- `m1.walk-to-m2.meaning-packet`: M1 `(lens, mode)` walk to M2 meaning packet.
- `m2.det-evidence-to-m3.codon-projection`: M2 DET evidence to M3 codon projection.
- `m3.scalar-oracle-to-m4.artifact-inspector`: M3 scalar oracle references to M4 protected artifact inspector.
- `m4.reviewed-insight-to-m5.review-item`: M4 reviewed insight handle to M5 review item.

## Observability Event Payload Rule

Every extension observability event must carry:

- `sourceExtension`
- `coordinateContext`
- `profileGeneration`
- `privacyClass`
- `evidenceHandles`
- `provenanceHandles`

The canonical event schema remains owned by the kernel-bridge/S5 contract. Track 07 only exports the individual event family contracts needed by Track 08.
