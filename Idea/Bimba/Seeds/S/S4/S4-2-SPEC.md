---
coordinate: "S4.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4-SHARD-INDEX]]"
  - "[[S4-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.2 Shard: Skills, Plugins, Tools

## Canonical Role

[[S4.2]] is the [[P2]] / [[CT2]] operation layer of [[S4]]: skills, plugins, hooks, subagents-as-package-assets, tool registration, permission declarations, and package/runtime validation. It provides the operational capability surface that [[S4.4]] and [[S4.4']] dispatch into; it does not decide dispatch by itself.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4-SPEC]], [[S4-SHARD-INDEX]], [[S4-TRACEABILITY-INDEX]], [[S4'-SPEC]], [[S4-2'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]].
- World/MOC anchors: [[S4]], [[S4']], `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`, `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM]], [[S4-EXTENSION-ARCHITECTURE]], [[S4i-PLEROMA-PORT-MATRIX]], [[2026-03-07-s4-prime-pleroma-real-port-plan]], [[2026-04-03-omx-pleroma-claw-runtime-migration]].

## Current Body Reality

The current S4.2 runtime has two distinct Body strata. `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts` registers Techne and bounded primitive tools, including gateway/session helpers, cmux surface tools, and primitive wrappers. `Body/S/S4/plugins/pleroma/` is the packaged Anima capability membrane with skills, agents, hooks, settings, evals, and `capability-matrix.json`.

The [[Capability Matrix]] declares dispatch tools (`dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `run_chain`, `dispatch_moirai_night_pass`, `anima_self_invoke`), skill VAK profiles, and command surfaces such as `/goal`. `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py` verifies that package declaration. Anima consumes the matrix in `Body/S/S4/ta-onta/S4-4p-anima/modules/skill-registry.ts`, which filters skills by [[CF]], [[CT]], and [[CP]].

## Build Contract

The contract is package-first, not prompt-first. A capability is valid only when its skill/agent/hook file exists, its matrix entry is typed, its owner boundary is clear, and its permission/writable surface is inspectable before execution. `Body/S/S4/plugins/registry.jsonl` is the Body-native plugin registry; older root plugin paths are compatibility evidence only.

`s4'.permission.get` must report the boundary consistently enough for [[S0]] to enforce command execution and for [[Anima]] to refuse dispatch when a tool/capability is not permitted. It must not merely describe permissions after a tool has already run.

## API / Envelope / Implementation Hooks

- `s4'.permission.get` and skill/tool status surfaces populate `s_4_permission_boundary`.
- Package discovery reads `Body/S/S4/plugins/registry.jsonl` and `Body/S/S4/plugins/pleroma/capability-matrix.json`.
- Pleroma tools live in `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts`; package workflows live in `Body/S/S4/plugins/pleroma/skills/**`.
- Lifecycle hooks are declared in `Body/S/S4/plugins/pleroma/hooks/hooks.json` and must remain aligned with VAK/Psyche/DAY-NOW semantics.

## Test Obligations

- Run `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py` for matrix/package integrity.
- Run `Body/S/S4/ta-onta/S4-4p-anima/tests/skill_registry_query.test.ts` for VAK-profile lookup correctness.
- Permission tests must prove unauthorized writes are blocked before [[S0]] execution, not only logged afterward.
- Plugin tests should read real package files, not construct in-memory fake plugins.

## Open Gaps

- Full pre-tool enforcement is still broader than the current inspected implementation; the shard should drive future work that gates every S0 exec, Pleroma primitive, write, subagent spawn, and external API call.
- `plugins/pleroma` as package surface and `S4-2p-pleroma` as ta-onta carrier are easy to conflate; docs must preserve the split.

## Boundaries

[[S4.2]] owns skill/plugin/tool/package operation. [[S4.2']] [[Pleroma]] owns the internal permission/capability carrier. [[S4.4']] [[Anima]] decides dispatch. [[S0]] executes commands, and [[S5']] governs review/promotion consequences.
