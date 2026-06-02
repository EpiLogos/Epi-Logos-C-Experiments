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

## Internal QL 0-5 Provenance

| Internal coordinate | QL / build function | Canonical source anchor | Derivation status |
|---|---|---|---|
| [[S5.0']] | knowledge/disclosure ground, [[Bimba]] map, Epii source condition | `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.md` internal 0-5 table; [[P0]], [[CT0]], [[L0]] / [[L5']] | direct World ontology |
| [[S5.1']] | crystallised form, pedagogy, transmissible return shape | `S5'.md` internal 0-5 table; [[P1]], [[CT1]], [[L1]] / [[L4']] | direct World ontology |
| [[S5.2']] | retrieval/governance, [[Gnosis]], RAG, disclosure density | `S5'.md` internal 0-5 table; [[P2]], [[CT2]], [[L2]] / [[L3']] | direct World ontology plus seed crystallisation |
| [[S5.3']] | episodic/memory-weave pattern, [[Graphiti]], temporal axes | `S5'.md` internal 0-5 table; [[P3]], [[CT3]], [[L3]] / [[L2']] | direct World ontology |
| [[S5.4']] | improvement context, [[autoresearch]], [[Sophia]]/[[Darshana]]/[[Zeithoven]] vectors | `S5'.md` internal 0-5 table plus [[S5-SPEC]] improvement sections | direct World ontology plus seed crystallisation |
| [[S5.5']] | return-to-ground, keep/discard, seed/world promotion, [[QL]] schema evolution | `S5'.md` internal 0-5 table; [[P5]], [[CT5]], [[L5]] / [[L0']] | direct World ontology |

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

## M' Consumed Surface Closure - Cycle 2 Track 12 T2

Cycle 1 substrate inheritance: consumes cycle 1 review/autoresearch/gnosis/agent cores already landed in `Body/S/S5`. This section closes only the S5/S5' surfaces presently consumed by the M5 extension, integrated plugins, and shell alert path.

| Consumer path | Consumed S5' contract | Required live evidence | Closure |
|---|---|---|---|
| M5 Epii review queue | `S5ReviewItem`, `S5ReviewSnapshot`, `buildM5EpiiSurface` | `Idea/Pratibimba/System/extensions/test/m5-epii-review-surface.test.mjs` persists real review items and renders the M5 workbench | closed as consume-as-is |
| M5 spine-state inspector | `S5ImprovementRun`, `DryRunPromotionPlan`, spine state | same test persists real improvement runs and dry-run promotion plans, then renders active candidates/effect schedules | closed as consume-as-is with non-dry-run promotion blocked |
| Integrated plugin evidence serializers | `VakEvidenceDeposit` and namespaced `ArtifactUri` refs | same test deposits VAK evidence with session/DAY/NOW, source refs, changed artifact refs, and test handles | closed as consume-as-is |
| Shell alert badge | human-required review alert safe-handle model | `body-lite-surface` validates allowed privacy classes, 60-character title clamp, and forbids approve/reject/revise for human-required alerts | closed as consume-as-is |
| Epi-Logos pedagogy and teaching return | `s5'.mef.*`, `s5'.ql.*`, `s5'.explain`, `s5'.teach`, `s5'.seed.generate` | plugin skills/resources exist under `Body/S/S5/plugins/epi-logos` | open extension gap: gateway method families are designed but not complete |

Explicit blockers: provider-backed Epii-to-Anima invocation, gateway routing beyond `s5'.review.*` / `s5'.improve.*` / `s5'.epii.*`, production Gnosis convergence, and non-dry-run canon promotion. These are not greenfield S5 rebuild items.

## Cross-Cutting Participation

S5' participates in user-final validation, consent gates, Graphiti governance, Day/NOW review deposition, capability matrix, Epii/Anima reciprocity, kbase/gnosis, canonical seed evolution, and the Möbius return to S0.

### Cycle 2 UFV Governance Gates

The Cycle 2 `UFV-*` matrix in `11-open-architectural-decisions.md` is binding for S5' review surfaces: S5' may report, defer, summarize, and route human-required items, but it must not expose agent approval, rejection, revision, promotion, or protected-data publication as final behavior before the relevant user-final validation is accepted.

| UFV item | S5' ownership | Required review gate |
|---|---|---|
| `UFV-01` | privacy/consent review visibility | protected-local, shared-archetype, audio, protected-open, and review-visibility actions stay blocked or local-only until consent copy is user-final; tests cover S5 DTO privacy and integrated privacy audit paths |
| `UFV-02` | recursive/corpus-affecting authority | recursive self-modification, corpus-affecting changes, deployment gates, non-dry-run canon promotion, and protected-personal changes require `requires_human`; review tests must prove agents can defer/summarize but cannot approve/reject/revise/promote |
| `UFV-03` | lifecycle evidence routing | close/quit/sleep/wake/crash-recovery claims stay prototype-only until desktop lifecycle semantics are user-final; S5' consumes only session/continuity evidence handles |
| `UFV-04` | alert routing and default actor neutrality | shell review alerts may interrupt only for human-required/security/privacy/deployment gates; routine evidence remains passive and default agent presentation remains neutral until accepted |

### Cycle 2 Intent And Review Routing Gates

Track 13 T4 binds S5' to the M' intent envelope for review, privacy, and promotion decisions. S5' does not own shell layout switching and does not convert operator commands into lived artifacts; it owns whether a routed item may become review evidence, a human-required alert, an improvement run, or a canon/promotion candidate.

| Routed intent class | S5' gate | Allowed S5' behavior |
|---|---|---|
| shell `1` flow-originated review candidate | `privacyClass` safe for review plus source handle present | Create or open a review item; defer/summarize for agents; preserve DAY/NOW/session/source range. |
| shell `1` human-required alert | `requires_human` or security/privacy/deployment/canon-promotion class | Interrupt as priority alert; block agent approve/reject/revise/promote actions. |
| shell `1` routine evidence | non-interrupting evidence class | Surface passive count/handle only unless the user opens review or promotes the evidence. |
| `/` operator-originated control/debug action | `origin_surface='/'` and no explicit promotion state | Keep as operator-control/readiness/debug; do not create Nara/DAY artifacts or review items by default. |
| `/` explicit promotion into review/task/day-note | promotion/acknowledgement state plus privacy class | Accept as review/task/day-note candidate only with original operator handle retained as provenance. |
| deep `4+2` Epii/canon/ACR route | privacy-safe handle plus review/canon authority | Open the appropriate Epii/review/canon workbench surface; mutation and publication remain review-gated. |

The hard rule is unchanged: S5' may report, defer, summarize, and route, but agents may not approve, reject, revise, publish, or promote human-required items. Cross-surface intent routing expands how review evidence reaches S5'; it does not weaken review law.

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
| `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md` | 2026-05-31 16:35:19 | newest formal S5 sync/world-return spec |
| `Idea/Bimba/Seeds/M/M5'/Legacy/specs/M/M5-epii-holographic-integration.md` | 2026-03-05 14:45:32 | older Epii integration source |
| `Idea/Bimba/Seeds/M/M5'/Legacy/plans/2026-03-07-m5-epii-design.md` | 2026-03-07 02:52:52 | historical Epii design |
| `Idea/Bimba/Seeds/M/M5'/Legacy/plans/2026-03-07-m5-epii-implementation.md` | 2026-03-07 03:01:47 | historical implementation source |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md` | 2026-05-31 20:56:45 | nominal review/autoresearch track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` | 2026-06-02 00:16:51 | operational capacities affecting Epii |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` | 2026-06-02 00:14:24 | current decision register |

## Substrate And Sibling Seeds

Body paths: `Body/S/S5/epii-review-core`, `Body/S/S5/epii-autoresearch-core`, `Body/S/S5/epii-agent-core`, `Body/S/S5/epii-agent`, `Body/S/S5/epi-gnostic`, `Body/S/S5/epi-kbase-core`, `Body/S/S5/plugins/epi-logos`, `Body/S/S3/graphiti-runtime`, `Body/S/S0/epi-cli/src/gate/epii.rs`, `Body/S/S0/epi-cli/src/gate/improve.rs`, `Body/S/S0/epi-cli/src/gate/review.rs`.

Sibling seeds: `S5-SPEC.md`, `S5-0-SPEC.md` through `S5-5-SPEC.md`, `S5-0'-SPEC.md` through `S5-5'-SPEC.md`, `S5-SHARD-INDEX.md`, `S5'-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.md` mtime 2026-04-24 20:31:08 is now cited as load-bearing S5' ontology: Epii as separate PI instance, knowledge agent, M' function host, Graphiti/Gnostic/Autoresearch spine, and user-position law. `Idea/Bimba/World/Types/Coordinates/S/S5/S5.md` mtime 2026-04-10 18:00:25 is the paired world-boundary ground. `Idea/Bimba/World/P5.md`, `P5'.md`, `L5.md`, `L5'.md`, `Thought.md`, and `Seed.md` are the related World return/promotion surfaces.
