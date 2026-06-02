---
coordinate: "S5'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
---

# S5' Specification: Epii, Review, Autoresearch, And Canon Return

## Canonical Status

This file is the single authoritative S5' seed. S5 is the world-boundary and return surface; S5' is Epii's reflective governance: review inbox, autoresearch loop, gnosis context, kbase/vimarsa, MEF/QL/teaching surfaces, seed generation, Graphiti usage governance, and canon-promotion law. Epii is distinct from Anima: Anima dispatches; Epii reviews, orients, returns, and requests bounded dispatch when needed.

VAK gate: `CPF=(4.0/1-4.4/5)`, `CT=CT5`, `CP=4.5`, `CF=(5/0) Sophia/Epii`, `CFP=S5'`, `CS=CS5-return`.

## Submodules And Subcoordinates

| Coordinate | Canonical surface | Current substrate |
|---|---|---|
| `S5.0'` | Epii identity, Bimba/library ground | `Body/S/S5/epii-agent-core`, `Body/S/S5/plugins/epi-logos` |
| `S5.1'` | review inbox and synthesis receive | `Body/S/S5/epii-review-core` |
| `S5.2'` | Gnosis/RAG/kbase/context retrieve | `Body/S/S5/epi-gnostic`, `Body/S/S5/epi-kbase-core` |
| `S5.3'` | Graphiti episodic usage governance | `Body/S/S3/graphiti-runtime` with S5 invocation |
| `S5.4'` | autoresearch/improvement evaluation | `Body/S/S5/epii-autoresearch-core` |
| `S5.5'` | canon promotion, seed generation, teaching return | Hen dry-run promotion, epi-logos plugin skills/resources |

## Public APIs And Gateway Methods

| Method family | Status | Owner rule |
|---|---|---|
| `s5'.review.inbox`, `submit`, `resolve`, `history` | native | durable review state and human-required guard |
| `s5'.improve.status`, `propose`, `evaluate`, `promote`, `history` | native | autoresearch/improvement loop; promotion review-gated |
| `s5'.epii.status`, `deposit`, `runtime.context` | native | Epii agent access and orientation |
| `s5'.gnosis.context.retrieve` | native | Gnosis context retrieval |
| `s5.episodic.*` | native but S3 runtime/S5 invocation split | Graphiti runtime belongs S3'; use/arc governance belongs S5' |
| `s5'.mef.*`, `s5'.ql.*`, `s5'.explain`, `s5'.teach`, `s5'.seed.generate` | missing/designed | target epi-logos plugin/Epii pedagogy and seed-return surfaces |

## Lifecycle, Data Shapes, Privacy

| Shape/event | Privacy | Lifecycle |
|---|---|---|
| review item/resolution | mixed; `requires_human` may block agents | deposit -> triage -> approve/reject/revise/defer -> history |
| improvement run | local operational with source references | propose -> baseline/challenger -> evaluate -> keep/discard -> dry-run promotion |
| Epii orientation context | safe projection plus protected handles | read S3/S1/S2/S5 state -> expose status/handles |
| Graphiti search/deposit | protected-local by default | governed request -> runtime adapter -> handle/result -> review if promotable |
| seed promotion plan | review-gated | source evidence -> Hen dry-run -> approved mutation path |

## Integration Seams

Calls in from Anima/Aletheia deposits, M5 Agentic Control Room, Nara personal surface, Gnosis/kbase/book/notebook sources, S3 Graphiti runtime, S1 Hen promotion, and S2 graph evidence. Calls out to S4 for bounded dispatch, S1 for vault/seed mutation, S2 for graph context, S3 for temporal/session/Graphiti runtime, and M' for user-facing Epii surfaces. S5' may promote canon only with source anchors, privacy class, and review state.

## Cross-Cutting Participation

S5' participates in user-final validation, consent gates, Graphiti governance, Day/NOW review deposition, capability matrix, Epii/Anima reciprocity, kbase/gnosis, canonical seed evolution, and the Möbius return to S0.

## Open Decisions And Resolution Status

| Decision | Status | Current resolution |
|---|---|---|
| MEF/QL evaluator gateway surfaces | open/missing | epi-logos plugin is substrate; method families not yet complete |
| non-dry-run canon promotion | open | review and dry-run Hen plan exist; mutation law remains guarded |
| Graphiti canonicality | resolved | episodes are evidence/handles until S5' review promotes |
| Epii -> Anima invocation | open | bounded reciprocal contract exists, provider-backed route incomplete |
| plan back-reference edits | blocked by scope | This seed supersedes newer plan fragments; docs/plans were not edited |

## Source Coverage

| Source | mtime | Role |
|---|---:|---|
| `docs/specs/S/S5-S5i-SYNC.md` | 2026-05-31 16:35:19 | newest formal S5 sync/world-return spec |
| `docs/specs/M/M5-epii-holographic-integration.md` | 2026-03-05 14:45:32 | older Epii integration source |
| `docs/plans/2026-03-07-m5-epii-design.md` | 2026-03-07 02:52:52 | historical Epii design |
| `docs/plans/2026-03-07-m5-epii-implementation.md` | 2026-03-07 03:01:47 | historical implementation source |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md` | 2026-05-31 20:56:45 | nominal review/autoresearch track |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` | 2026-06-02 00:16:51 | operational capacities affecting Epii |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` | 2026-06-02 00:14:24 | current decision register |

## Substrate And Sibling Seeds

Body paths: `Body/S/S5/epii-review-core`, `Body/S/S5/epii-autoresearch-core`, `Body/S/S5/epii-agent-core`, `Body/S/S5/epii-agent`, `Body/S/S5/epi-gnostic`, `Body/S/S5/epi-kbase-core`, `Body/S/S5/plugins/epi-logos`, `Body/S/S3/graphiti-runtime`, `Body/S/S0/epi-cli/src/gate/epii.rs`, `Body/S/S0/epi-cli/src/gate/improve.rs`, `Body/S/S0/epi-cli/src/gate/review.rs`.

Sibling seeds: `S5-SPEC.md`, `S5-0-SPEC.md` through `S5-5-SPEC.md`, `S5-0'-SPEC.md` through `S5-5'-SPEC.md`, `S5-SHARD-INDEX.md`, `S5'-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.md` mtime 2026-04-24 20:31:08 is now cited as load-bearing S5' ontology: Epii as separate PI instance, knowledge agent, M' function host, Graphiti/Gnostic/Autoresearch spine, and user-position law. `Idea/Bimba/World/Types/Coordinates/S/S5/S5.md` mtime 2026-04-10 18:00:25 is the paired world-boundary ground. `Idea/Bimba/World/P5.md`, `P5'.md`, `L5.md`, `L5'.md`, `Thought.md`, and `Seed.md` are the related World return/promotion surfaces.
