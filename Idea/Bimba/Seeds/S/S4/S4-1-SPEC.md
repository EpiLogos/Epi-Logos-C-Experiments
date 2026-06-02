---
coordinate: "S4.1"
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

# S4.1 Shard: Agent Identity

## Canonical Role

[[S4.1]] is the [[P1]] / [[CT1]] definition layer of [[S4]]: agent identity, provider/model/auth profile form, runtime persona boundary, roster declaration, and harness identity stability. It names who is running before [[S4.4]] and [[S4.4']] decide what the agent should do.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4-SPEC]], [[S4-SHARD-INDEX]], [[S4-TRACEABILITY-INDEX]], [[S4'-SPEC]], [[S4-1'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]].
- World/MOC anchors: [[S4]], `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`, paired [[S4']] `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-S4i-PI-AGENT]], [[S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM]], [[2026-03-06-s4-pi-agent-foundation]], [[2026-04-02-native-pi-epi-agent-convergence]].

## Current Body Reality

The Body-native identity surface includes `Body/S/S4/pi-agent/agents/agent-chain.yaml`, `Body/S/S4/pi-agent/agents/teams.yaml`, `Body/S/S4/pi-agent/agents/anima.md`, and the `Body/S/S4/pi-agent/agents/pi-pi/*.md` expert roster. The Anima constitutional roster exists at `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/*.md`, while package-distributed constitutional definitions also exist at `Body/S/S4/plugins/pleroma/agents/*/ANIMA.md`.

The current implementation also binds identity to the [[Capability Matrix]] through `Body/S/S4/plugins/pleroma/capability-matrix.json`, which names the owner agent as `anima`, lists constitutional agents, and associates skills with [[CF]], [[CT]], and [[CP]] coverage. Runtime identity tests currently include `Body/S/S4/pi-agent/tests/test_anima_registration.py` and Anima-side dispatch validation tests under `Body/S/S4/ta-onta/S4-4p-anima/tests/`.

## Build Contract

Agent identity must remain stable across bootstrap, status, dispatch, and review. The contract must distinguish:

- [[Anima]] as [[S4.4']] dispatch function, not a generic assistant.
- [[Epii]] as [[S5']] return/review spine, not an Anima subagent.
- Constitutional agents [[Nous]], [[Logos]], [[Eros]], [[Mythos]], [[Psyche]], and [[Sophia]] as CF-bound functions.
- Specialist Aletheia agents such as [[Anansi]], [[Moirai]], [[Janus]], [[Mercurius]], [[Agora]], and [[Zeithoven]] as review/crystallisation specialists, not first-class constitutional CF replacements.

Provider/model/auth fields must be typed, redacted, and routed through the S4 runtime registry; no shard may encode secrets, raw API keys, or user-local credential material.

## API / Envelope / Implementation Hooks

- `s4.agent.status` and `agent.capabilities` expose identity and capability presence without leaking secrets.
- `s_3_agent_id` can carry the connected identity through [[S3]] transport, but the identity law remains [[S4.1]].
- Capability discovery consumes `Body/S/S4/plugins/registry.jsonl` and `Body/S/S4/plugins/pleroma/capability-matrix.json`.
- Constitutional agent CF binding is enforced in `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-validate.ts`.

## Test Obligations

- `Body/S/S4/pi-agent/tests/test_anima_registration.py` must prove Anima registration against real Body assets.
- Dispatch tests must preserve the seven-agent [[CF]] map and reject mismatched mechanistic dispatches.
- Capability matrix tests must prove identity/capability declarations from package files, not hard-coded mocks.
- Secret/profile tests must assert redaction and absence of raw credential output.

## Open Gaps

- Provider/model/auth registry implementation is named in the S4 umbrella but not fully visible in the S4 Body lane inspected here; S0 `epi agent` remains the runtime adapter for parts of that surface.
- The system has both ta-onta constitutional prompts and packaged Pleroma ANIMA definitions; this is valid as source/package split, but future sync tests should detect drift.

## Boundaries

[[S4.1]] identifies agents and runtime profiles. [[S4.1']] [[Hen]] owns agent artifact form/templates, [[S4.4']] owns dispatch routing, [[S5']] owns [[Epii]] review identity, and [[S0]] executes process launch.
