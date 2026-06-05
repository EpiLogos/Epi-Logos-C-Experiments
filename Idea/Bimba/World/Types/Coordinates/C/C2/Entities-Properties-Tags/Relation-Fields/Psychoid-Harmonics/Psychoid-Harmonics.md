---
coordinate: "C/C2/Relation-Fields/Psychoid-Harmonics"
c_4_artifact_role: "type-moc-pointer"
c_1_ct_type: "CT1"
c_3_created_at: "2026-06-03T00:00:00+01:00"
c_5_crystallisation_state: "incubating"
c_0_source_coordinates:
  - "[[PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS]]"
  - "[[ql-musical-derivation-v3]]"
  - "[[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]"
  - "[[TYPE-REGISTRY]]"
---

# Psychoid Harmonic Relation Fields

## Scope

This folder holds **graph relation-field schema stubs** for the eight psychoid harmonic relation families lifted from [[ql-musical-derivation-v3]]. They are the [[S2]]-promotion candidate side of the same grammar whose archetypal source lives at `Psychoids/#/Relations/**`.

The split is deliberate per the locked Phase 0 decision in [[PSYCHOID-WEB-CANON-EXTRACT-2026-06-03]]:

- **Archetypal relation grammar** lives at [[Psychoids/#/Relations]] — the source-wells. That is where the prose, the pairing rule, the matheme-position grammar, and the participating psychoid links are authoritative.
- **Graph relation-field schemas** live here — the side that becomes evidence for [[S2]] graph-promotion. Folder ancestry is evidence only; no schema becomes a graph label until [[S2]] review approves it.

## Entries

| Schema | Source-target | Predicate | Status |
| --- | --- | --- | --- |
| [[Family-A-Adjacent-Identity-schema]] | psychoid_well → psychoid_well | `adjacent_identity_of` | candidate |
| [[Family-B-Offset-Transition-schema]] | psychoid_well → psychoid_well | `offset_transition_with` | candidate |
| [[Family-C-Converse-Mirror-schema]] | psychoid_well → psychoid_well | `converse_mirror_of` | candidate |
| [[Family-D1-Same-Position-Cross-schema]] | psychoid_well → psychoid_well_prime | `same_position_cross_helix` | candidate |
| [[Family-D2-Transform-schema]] | psychoid_well → psychoid_well_prime | `forward_cross_transforms_to` | candidate |
| [[Family-D2-Require-schema]] | psychoid_well → psychoid_well_prime | `backward_cross_requires` | candidate |
| [[Family-D2-Complete-schema]] | psychoid_well → psychoid_well_prime | `mirror_cross_completes` | candidate |
| [[Family-D3-Helix-Invariance-schema]] | psychoid_well_prime → psychoid_well_prime | `pratibimba_internal_grammar` | candidate |

## Hen Use

[[Hen]] residency for any file claiming participation in one of these schemas: route via `s1'.semantic.link_psychoid_web` (see [[HEN-INTEGRATION-DESIGN-PSYCHOID-WEB-2026-06-03]]). Until [[S2]] graph-label promotion is granted, these are evidence-only edges discovered through wikilink traversal.

## Promotion Contract

A schema graduates to a [[S2]] graph relation label only when:

1. Its archetypal grammar source at [[Psychoids/#/Relations]] is stable.
2. Its graph predicate name is unique within the [[S2]] relation namespace.
3. [[Epii]] / [[M5']] has reviewed at least one round of evidence-edge usage in the [[Pratibimba]] surface (oracle artifacts, Thought artifacts, or workflow artifacts).
4. The schema is not duplicated by an existing [[S2]] relation type.
