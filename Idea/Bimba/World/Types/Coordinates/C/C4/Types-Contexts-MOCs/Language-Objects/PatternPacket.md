---
coordinate: "C/C4/Types-Contexts-MOCs/Language-Objects/PatternPacket"
c_4_artifact_role: "schema-incubation"
c_1_ct_type: "CT5"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
m_3_subsystem: "M4"
m_4_nara_domain: "pattern-packet"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
  - "[[M4'-SPEC]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
---

# PatternPacket

[[PatternPacket]] is **[[M4]]-3's interpretation surface** — the typed object where [[M4]] integrates packet-chains into Q_activity-trajectory evidence, strange-attractor / phase-portrait surfaces, and (p,q) torus-knot classification.

## Fields (per [[M4'-SPEC]] §6.8 + §7.11)

| Field | Type | Notes |
| --- | --- | --- |
| `pattern_packet_ref` | UUID | identity of this packet |
| `frame_id` | UUID | parent [[OracleFrame]] |
| `symbolic_protein_ref` | UUID | the [[SymbolicProtein]] being interpreted |
| `q_activity_delta` | float | change in Q-activity inferred from the chain |
| `trajectory_ref` | TrajectoryRef? | strange-attractor / phase-portrait handle |
| `pq_torus_knot` | `(p, q)` int pair? | (p,q)-classification when classifiable |
| `review_state` | `none` / `proposed` / `reviewed` / `accepted` / `rejected` / `applied` | the review lifecycle |
| `span_anchors[]` | DayNowRef[] | temporal spans the packet bridges |
| `archetype_tags[]` | string[] | archetypal labels |
| `elemental_signature` | per-element float vector | derived via [[L2']] |

## Review lifecycle (non-negotiable)

```
none → proposed → reviewed → (accepted | rejected) → applied
```

A recurring chain becomes identity-relevant ONLY through the [[M4]].5 / [[M5']] review pathway. A packet is never auto-applied to [[M4]]-0 identity sources. This protects the lived [[Nara]] surface from premature pattern-imposition.

## Privacy boundary

Protected-local-body. Safe scalar handles (`pattern_packet_ref`, `frame_id`, `review_state`) may surface to the [[S2]] graph after `applied` state is reached and [[Epii]] approves; the body and elemental_signature stay protected.

## Wikilinks

- Interprets: [[SymbolicProtein]]
- Parent: [[OracleFrame]]
- Author: [[M4]]-3
- Review gate: [[M5']] / [[Epii]]
- Substrate: [[Tarot]], [[I-Ching]], [[Codon]]
- Q-activity framework: [[Nara]]
