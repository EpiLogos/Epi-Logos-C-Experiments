# Epi Personal 4/5/0 Parent — Prompt C implementation cut

**Product:** `epi.personal.450`  
**Programme:** Epi #18 / O:I #112  
**Product-scale authority:** `EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md` + `EPI-EIGHTFOLD-APPLICATION-ARCHITECTURE.md`  
**Deep-domain authorities:** `M4'/M4'-SPEC.md`, `M5'/M5'-SPEC.md`, `M0'/M0'-SPEC.md`

## Product meaning

Prompt C is the everyday Personal parent across the M4/M5/M0 triad. It is deliberately smaller than the deep instruments. Its unity is **one governed Personal subject and its current relation**, not one permanent renderer and not a dashboard made from every M subcoordinate.

At parent scale:

```text
M4 Nara       lived writing / DAY-NOW / bounded selections
M5 Epii       dialogue/review/return through canonical Agent identity
M0 Anuttara   Bimba/source/canon orientation through native refs
Central       durable NOW/DAY return authority at the host boundary
```

The producer therefore publishes an application reading, not desktop layout machinery:

```text
epi.personal-450-application/v1
```

O:I is expected to compose that reading with its shared Canvas, Navigator/Knowledge, Inspector, AgentSession and Action surfaces.

## Current native activity field

| Activity | Producer status | Parent law |
|---|---|---|
| journal / writing / notes | ready | protected M4/Nara body remains local; exact saved ranges can become governed selection children |
| DAY / NOW | ready | safe current handles orient the same episode without publishing its body |
| flow / activity organisation | deferred native surface | do not infer a fake kanban/task model from journal text |
| Epii dialogue | host binding required | canonical `epi:agent:epii` through Actuation + AIKit AgentSession; no Epi-local chat runtime |
| oracle / reading | deferred native oracle provider | M4 canon supports the activity; complete deep M4 is not a C dependency |
| Explain / Review / provenance | ready bounded reading | Epi one-shot review is an Epi-native Reading/Action over the exact selection; it is not the dialogue runtime |
| Bimba / source / canon | ready native ref | Anuttara supplies semantic refs and source orientation; shared Knowledge owns generic navigation/presentation |
| proposal / return | ready proposal | proposal remains derived/unreviewed; Central owns durable human-source return and requires human acceptance |

## One-subject law

`PersonalCurrentSubject.subjectRef` is the current protected `episodeRef`. The application reading also carries the exact current `episodeRevision`, DAY/NOW handles, M4 coordinate, QL address, profile and privacy/source classes. It deliberately excludes the protected episode body.

A governed child selection preserves:

```text
episodeRef
+ episodeRevision
+ startByte
+ endByte
+ selectionRef
```

Every bounded Epii, Anuttara and proposal operation re-resolves that exact current range before returning. A stale revision is rejected rather than silently reinterpreted.

`selection != Agent Context disclosure`: the application declares this false relation explicitly. A host may use the semantic selection as focus without treating the selected text as already authorised AgentSession context.

`proposal != adopted human source`: the producer returns `sourceClass=proposal`, `adoptionState=unreviewed`, `sourceMutationPerformed=false`, plus Central return hints requiring explicit human acceptance for durable promotion.

## M4 / M5 / M0 `.0/.5` parent expression

The parent preserves the operative boundary relation without flattening `.1-.4` into fields.

### M4 / Nara

- `.0` — `M4-0'`: protected identity/quintessence ground. At C scale the current protected episode is the bounded lived subject; deep identity internals remain unopened.
- `.5` — `M4-5'`: Epii/Sophia review and recognition gate. C can form a return proposal, never silently rewrite identity or human source.
- `.1-.4`: summon only when the current lived activity crosses somatic/oracle/transformation/semantic depth. The complete psychoid/quaternion/chakra/sushumna/Hopf/cymatic instrument belongs to `epi.deep.m4`.

### M5 / Epii

- `.0` — `M5-0'`: Bimba/Gnosis/library ground from which Epii can teach, review and traverse source.
- `.5` — `M5-5'`: Logos/return seam. At C scale this is governed proposal/recognition, not the complete Logos Atelier.
- `.1-.4`: summonable capacities/contexts only. The complete M5 IDE sixfold belongs to `epi.deep.m5`.

### M0 / Anuttara-Bimba

- `.0` — `M0-0'`: source-provenanced Anuttara/Bimba language and canonical world-ground.
- `.5` — `M0-5'`: pedagogy route back through Epii without transferring graph/canon authority to a renderer/provider.
- `.1-.4`: shared source/Knowledge relations when crossed. The complete playable Bimba graph belongs to `epi.deep.m0`.

## Deep-open and D binding

The application publishes stable descriptors for:

```text
epi.deep.m0 → M0'
epi.deep.m4 → M4'
epi.deep.m5 → M5'
```

Each descriptor carries the same Personal `subjectRef`, states that subject identity must be preserved, and leaves `surfaceRef` absent while no deep body is current. C does not fabricate a deep renderer to make the link appear ready.

The D seam is similarly explicit:

```text
subjectRef = current Personal subject
eventRef = absent
bindableToEventRef = true
parallelPersonalEventState = false
```

D may attach its canonical `eventRef` to this exact subject; C does not mint a competing `PersonalEvent`.

## Prompt-C implementation disposition

Relative to the prior Prompt-C implementation (`pratibimba-bridge/src/main.rs`, `personal.rs`, `tests/personal_return.rs`):

| Item | Disposition | Reason |
|---|---|---|
| exact Nara episode/revision/range re-resolution | **KEEP** | correct privacy and identity floor |
| `personal.rs` Epii/Anuttara/proposal semantic packets | **REFACTOR** | retain bounded semantic operations, but place them beneath a parent application contract rather than making them UI modes |
| one-shot bridge process | **KEEP** | remains a provider, not a daemon/chat/SessionSpace runtime |
| `main.rs` operation routing | **REFACTOR** | adds `personal-application` while retaining the old bounded operations |
| `personal_return.rs` authority/privacy tests | **EVIDENCE** | continue to prove same-selection and proposal/source invariants |
| any interpretation of Explain/Review/Bimba/etc. as one permanent Epi renderer | **RETIRE** | those are activities/readings composed by the host, not the product identity |
| complete deep M4′/M5′/M0′ UI work | **RETIRE FROM C** | belongs to the three `epi.deep.*` products |

## Returned state

The new parent reading is source-authoritative Epi data. It does **not** prove that a physical O:I host currently has Central, shared Knowledge, or a canonical Epii AgentSession provider connected. Those remain host/runtime observations. The producer makes absence explicit instead of filling it with a local substitute.
