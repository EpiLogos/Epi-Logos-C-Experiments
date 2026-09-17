---
coordinate: "M"
c_4_artifact_role: "canonical-form"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S2-SPEC]]"
---

# q Register Vocabulary — The Open Facet Law

This Form states the law governing `q_*` (and `qm_*`) content keys used by the [[S2]] graph schema, [[S2']] dataset import, and [[S1]] Hen frontmatter. The `q_*` family characterises a node through the six **Quaternal Logic register positions**. It is an **open, flexible system**: the only fixed part of a key is its position index `n` — the facet name is free, chosen for whatever reading the node admits at that position.

> **Retraction.** A prior version of this Form presented a closed "canonical vocabulary" (fixed slug→position bindings) and declared unknown `q_*` slugs to be validation errors. That was wrong and is retired. The q law never locked facet names; slugs are relative to the `n`-position reading and there is no required set.

## What is fixed vs. what is free

A key has the shape `q_{n}{prime?}_{slot?}_{semantic}`:

- **`n` — the register position (FIXED, structural).** `n ∈ {0,1,2,3,4,5}`, the generic QL position, not tied to any subsystem. This is the only part the system constrains.
- **`prime` — inverted phase (optional).** A `'` after the position (`q_5'_…`) marks the inverted / recognition-direction reading — the `1/0 = 4'+2' = 5'→0'` phase of the matheme.
- **`slot` — interior index (optional).** An optional numeric slot (`q_5_3_…`) when a value belongs to a specific sub-reading; usually omitted.
- **`semantic` — the facet name (FREE).** A concise snake_case slug naming *this node's specific reading at position `n`*. Author-chosen for aptness. It is **not** drawn from any fixed list; coining a new slug is normal, never an error.

The same shape law applies to the `qm_*` family (the M′ quickview register).

## The six register positions

`n` carries the generic QL position reading, coherent with the matheme `0/1 = 4+2 = 5→0 = 0/1` — four explicate positions (1–4) and two implicate dimensions (0, 5):

| n | register | reading | the … |
| --- | --- | --- | --- |
| **0** | implicate ground / potential | the unstated horizon, thrown ground, the pre-given condition the node arises from | the *that* |
| **1** | material-definitional | the node's substance, essential thesis — what it *is* | the *what* |
| **2** | energetic-relational | the dynamics, processes, and relationships it enacts | the *how* |
| **3** | formal-structural | the pattern, logic, and structure that organises it | the *which* |
| **4** | teleological-contextual | its purpose, locality, genealogy, meaning-in-context | the *why / where* |
| **5** | integral synthesis | the completion that closes and re-opens — the `5→0` Möbius return | the *to-where* |

A node may carry **one or many** facets at each position (hybrid cardinality): a single facet where the position is light, several named facets where it is load-bearing. A full characterisation gives at least one facet at every position 0–5.

## Examples (illustrative — NOT a required set)

The following have been used and read well. They illustrate the *kind* of facet each position invites; they are not a vocabulary to select from. Coin whatever name the node's content actually calls for:

- `q_0_implicate_ground`, `q_0_thrown_ground`, `q_0_void_potential`
- `q_1_theoretical_thesis`, `q_1_epistemology`, `q_1_number_language`
- `q_2_instantiation_mode`, `q_2_sophia_logos_dialectic`, `q_2_oscillation_architecture`
- `q_3_dialectical_movement`, `q_3_formal_structure`
- `q_4_historical_diagnosis`, `q_4_locality_signature`, `q_4_teleological_context`
- `q_5_integration_template`, `q_5_conjunctive_threshold`, `q_5_mobius_return`

## Validation law

- Validate the **shape** only: `n ∈ 0–5`, a well-formed optional prime / interior slot, and a snake_case facet slug.
- **Do not** validate the facet slug against any list. Unknown slugs are valid by construction — the family is open.
- A value is deep prose written in the voice of its register position, grounded in canon.

This supersedes the prior closed-vocabulary and "unknown-keys-are-errors" rules. The matheme grounding is stated in [[epi-logos-kernel-spec]].
