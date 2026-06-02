---
coordinate: "S5.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5'-SPEC]]"
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-0']]"
---

# S5.0' Shard: Epii Ground And User-Position

## Canonical Role

[[S5.0']] is the [[P0']] / [[CT0]] ground of [[S5']]: [[Epii]] as separate PI instance, [[Bimba]] map holder, user-position, [[Pratibimba]] / [[PASU]] steward, and review inbox ground. It is the place to which [[Anima]] / [[Aletheia]] work becomes intelligible, not another [[S4']] executor.

## Source And Diagram Anchors

Read [[S5'-SPEC]], [[S5-SPEC]], [[S5'-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S5']], `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.canvas`, legacy [[S5-0']], [[S5']], [[S5'Cx]], and [[M5-epii-holographic-integration]].

## Current Body Reality

`Body/S/S5/epii-agent/agent-contract.json` defines Epii as `agent_id=epii`, `peer_pi_agent`, with resource package `Body/S/S5/plugins/epi-logos`, gateway session `agent:epii:main`, accepted deposits, allowed requests to Anima, and forbidden authority. `Body/S/S5/epii-agent-core/src/lib.rs` implements `EpiiAgentAccess`, `EpiiAgentSnapshot`, deposit requests, review/improvement snapshots, and M5 workbench DTOs. Tests include `agent_access.rs`, `full_spine_acceptance.rs`, and `Body/S/S5/tests/test_epii_agent_contract.py`.

## Build Contract

Epii ground must expose safe orientation handles, not raw identity leakage. Review items must link origin artifact/envelope, day_id, now_path, session_key, source agent, and coordinate. Epii may request bounded [[Anima]] dispatch but cannot inherit Anima's permission surface or mutate runtime state without review.

## Test Obligations

Run Epii agent-core tests and the Python agent-contract test. Add tests when Epii orientation, Pratibimba status, Kairos context, or deposit authority changes.

## Open Gaps

Managed Epii PI identity exists, but provider-backed reciprocal invocation is still incomplete. The full M' Epii workbench is represented by DTOs and contract surfaces, not yet by a complete UI/runtime.

## Boundaries

[[Aletheia]] remains [[S4.5']] UX membrane; [[Anima]] remains [[S4']] dispatch; [[S5.1']] receives synthesis; [[S5.4']] evaluates improvement; [[S3']] owns session/Kairos runtime.
