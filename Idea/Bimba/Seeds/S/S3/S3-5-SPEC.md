---
coordinate: "S3.5"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.5 Shard: Integration Surface

## Intent

Own app bridge, nodes/devices/browser/approvals/logs/update/wizard surfaces, and Graphiti runtime handoff.

## Build Scope

- Map product/runtime RPC to coordinate homes.
- Track Electron/app expectations such as status, health, presence.
- Demote Graphiti HTTP wrapper to adapter, not canonical boundary.

## API / Envelope / TS

- Feeds gateway parity manifest.
- Supports app/device/product RPC bridge.

## Implementation Hooks

- app bridge.
- gateway manifest.
- current Graphiti wrapper.

## Test Obligations

- Product RPC has coordinate mapping.
- App bridge smoke uses correct root.

## Boundaries

S3.5 integrates surfaces; S5 governs Graphiti usage meaning.
