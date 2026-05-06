---
coordinate: "S4.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.2' Shard: Permission Boundary

## Intent

Own the [[Pleroma]] carrier of [[S4.2']] inside [[ta-onta]]: permission boundary, capability registry, skill/tool operation law, bounded primitive surface, write authority, and sandbox contract consumed by S0.

This is not the whole [[S2]] graph system. It is operation/entity law internalized inside S4' so agent action has bounded executable surfaces.

Pleroma is also the intended fork-lineage home for [[oh-my-codex]]. The target is not that Pleroma merely wraps or references `vendors/oh-my-codex`; the target is a Pleroma version that bears that lineage: OMX/Codex orchestration, skills, hooks, team/runtime mechanics, and prompt-routing experience raised into the S4.2' bounded-primitive and capability substrate. The live `plugins/pleroma` package is therefore an adapter/package surface until this fork is made real inside `Body/S/S4/ta-onta/S4-2p-pleroma`.

## Build Scope

- Define `s4'.permission.get`.
- Return durable capability/permission state.
- Gate tool/write surfaces before execution.

## API / Envelope / TS

- Populates `s_4_permission_boundary`.
- Required by `s0.exec`.

## Implementation Hooks

- `Body/S/S4/ta-onta/S4-2p-pleroma/`.
- Root `.pi/extensions/ta-onta/pleroma` may remain as compatibility shim while PI tooling still resolves project `.pi`.
- `vendors/oh-my-codex/` is the fork ancestor for the Pleroma runtime lineage.
- `Body/S/S4/plugins/pleroma/` is the Codex/OMX adapter/package surface, not the canonical Pleroma module itself.
- permission registry.
- skill/tool manifests.
- plugin-runtime bridge.
- bounded primitive wrappers.

## Test Obligations

- Unauthorized write is denied before S0 spawn.
- Capability status matches installed tools.

## Boundaries

S4.2' authorizes; S0 enforces process execution.
