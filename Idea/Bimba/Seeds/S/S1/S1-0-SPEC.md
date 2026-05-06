---
coordinate: "S1.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.0 Shard: Vault Ground

## Intent

Own vault root discovery, filesystem contact, Obsidian config, and canonical path normalization.

## Build Scope

- Resolve the active `/Idea` root.
- Read `.obsidian` configuration where relevant.
- Normalize paths without reviving stale `NOW.md`, `World/Forms`, or `/Bimba/Forms` conventions.

## API / Envelope / TS

- Supports `s1.read`, `s1.write`, and `s1.search`.
- Feeds `s_1_target_vault_zone`.

## Implementation Hooks

- `epi vault`.
- Obsidian vault filesystem.
- `.obsidian/templates.json`.

## Test Obligations

- Read/write real markdown in a test vault.
- Reject path traversal outside the vault.

## Boundaries

S1.0 owns material pathing; [[S3']] owns temporal meaning.
