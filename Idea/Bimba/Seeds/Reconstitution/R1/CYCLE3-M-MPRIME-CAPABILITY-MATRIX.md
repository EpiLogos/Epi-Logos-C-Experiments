---
coordinate: "M/M'"
c_4_artifact_role: "capability-freeze"
c_1_ct_type: "CT1"
c_3_created_at: "2026-08-17"
c_0_source_coordinates:
  - "[[AUTHORITATIVE-SOURCE-MANIFEST]]"
  - "[[M'-SYSTEM-SPEC]]"
---

# RECON-R1 Cycle-3 M / M' Capability Matrix

Pinned source head: `8608648f33e697dd5a8c5f499492619a02259af5`.

This is the domain-side freeze consumed by RECON-R2. It treats **M as the canonical Bimba/subsystem image and M' as its lived/operative Pratibimba reflection**. S/S' is referenced only as technical embodiment and mediation. A current implementation body is evidence for a capability, not the semantic owner of that capability.

## 1. Six-system field

| M / M' | Canonical subsystem identity | M — domain / Bimba side | M' — operative / reflected side | Primary current implementation anchors | Principal S/S' mediation |
|---|---|---|---|---|---|
| `M0 / M0'` | Anuttara | Prior `0/1` ground; pre-math language, canonical coordinate/Bimba topology, core relation law and ontology witness. | Playable Bimba graph field: readable map, coordinate/source trace, relation inspection, graph routes, profile-aware selection, routes into M1'–M5'. | `Body/S/S0/epi-lib/include/m0.h`, `src/m0.c`, `include/ontology.h`, `Body/S/S0/portal-core/src/kernel.rs`, `Body/S/S2/graph-schema`. | S0/S0' compiled/kernel facts and command embodiment; S2/S2' graph/schema/relation/retrieval authority; S3/S3' live tick/deposition overlay; S1/S1' source/MOC residency. |
| `M1 / M1'` | Paramasiva | Mathematical engine: 12-state ring, Ananda matrices, Spanda, QL flowering, SU(2)/720°/Hopf/toroidal recognition. | Playable relational instrument: coordinate walking, relation-as-interval, profile-driven melody, 84-state lens/mode landscape, played torus/topology inspection. | `Body/S/S0/epi-lib/include/m1.h`, `src/m1.c`, `Body/S/S0/portal-core/src/{harmonic_profile,hopf,quaternion,state,events}.rs`. | S0/S0' is kernel/profile authority; S2/S2' pointer-web relation law; S3/S3' tick/session/deposition; S4/S4' may request governed agent stepping; M2-1' supplies the audio bus consumed here. |
| `M2 / M2'` | Parashakti | 72-fold vibrational/correspondential architecture: MEF, tattva/element, decan, sacred-sonic, planetary/chakral, 72→64 DET bridge. | Harmonic-correspondential instrument: Vimarsha reads Prakasa cloud, produces the shared `audio_octet[8]` + `nodal_quartet[4]`, renders MEF/cymatic/elemental/decanic/sacred-sonic/solar-chakral meaning. | `Body/S/S0/epi-lib/include/m2.h`, `src/m2.c`, `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`, `spanda.rs`, `aspect.rs`. | S0/S0' kernel/profile + current Vimarsha bus implementation; S2/S2' configurable correspondence/provenance law; S3/S3' DAY/NOW deposition; M1' supplies traversal state; M3 receives DET output; S5' may consume safe traces as derived evidence. |
| `M3 / M3'` | Mahamaya | Binary symbolic transcription and measurement-world grammar: 64 codons/I-Ching, line change, Tarot compression, rotational algebra, 72→64 reception and world-clock synthesis. | Clock/cosmos and codon-rotation surface: harmonic clock, codon/I-Ching/Tarot wheel, 84→472 `(lens,mode)→(codon,rotation)` projection, transduction provenance, measurement/coupling inspector, M3-5 double-torus rendering. | `Body/S/S0/epi-lib/include/m3.h`, `src/m3.c`, `src/m3_clock_lut.c`, `Body/S/S0/portal-core/src/{mahamaya,codon,codon_rotation_projection,rotational,oracle_lut,transcription}.rs`. | S0/S0' clock/codec authority; S2/S2' graph/correspondence metadata; S3/S3' DAY/NOW/world-clock/session authority; M2 supplies DET/audio; S5' may consume trace evidence without training/mutating M3 canon. |
| `M4 / M4'` | Nara | Protected personal/lived field: identity/quaternion composition, activity, day-as-episode, oracle/dream/journal evidence, trajectory and personal integration. | Lived Nara surface: journal/flow, DAY/NOW, dream/oracle/highlight, identity/resonance, protected Graphiti retrieval, typed sendoff, review-gated identity augmentation. | `Body/S/S0/epi-lib/include/m4.h`, `src/m4.c`, `Body/S/S0/portal-core/src/{nara_journal,personal_identity,transcription}.rs`, `Body/S/S3/graphiti-runtime/src/lib.rs`. | S1/S1' protected vault material/residency; S3/S3' DAY/NOW/session/Graphiti temporal truth; S0 safe harmonic/personal runtime; S2 public pointer anchors only; S4 governed execution/sendoff; S5' review/promotion/consent. |
| `M5 / M5'` | Epii | Integration/return and system self-reference: canon, pedagogy, knowledge return, Logos-cycle reflection, system archaeology and improvement pressure. | Epii agentic developer/pedagogical workbench spanning Bimba/Gnosis library, canon, backend, reflected application surface, governed agents/review, Logos Atelier and autoresearch. | `Body/S/S0/epi-lib/include/m5.h`, `src/m5.c`, `Body/S/S5/epi-gnostic`, `epi-kbase(-core)`, `epii-{review,autoresearch,agent}-core`, S4 Pleroma capability matrix. | Consumes all S strata. S1' governs canon/vault writes; S2' graph/retrieval; S3' session/time; S4' bounded execution/Anima; S5' review, knowledge-return and improvement; S0 makes accepted operations executable. |

## 2. M0' — Anuttara / Bimba map reflection

Authority: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` blob `92550a16cc77a71f498905b36b380fe4d9434622`.

M0' is explicitly a **view over** M0/Bimba and its current graph/kernel authorities. It may route to deeper domains but does not own or mutate their canon.

| Capability ref | M0' layer | Purpose | Input → output | Source/write authority | Current body / verification posture |
|---|---|---|---|---|---|
| `M0P-LANGUAGE` | `M0-0' language` | Render Anuttara pre-math language fields and canonical absences. | canonical coordinate → symbol/formulation/provenance/readiness | language facts: S0 M0/ontology + source map; graph projection: S2; no renderer write | `m0.h`, `m0.c`, `ontology.h`, graph schema; source map under `Idea/Bimba/Map/anuttara-deep`. |
| `M0P-QL-STRUCTURE` | `M0-1' ql-structure` | Expose family/mirror/lens/inversion pointer law and position character. | selected coordinate → pointer/QL structural view | S0 pointer/kernel law + S2 projected relation law | M0 spec requires S2-provenanced fields; missing payload = readiness state, not client synthesis. |
| `M0P-RELATIONS` | `M0-2' relations` | Inspect typed relation field without collapsing structural/correspondential/kernel/inferred/sync/compatibility edges. | coordinate + neighborhood → typed relation set | S2 graph relation registry/write authority; S0 core-65 computational relation facts | S2 graph-schema relationship registry tests; S2 graph-services relation/pointer code. |
| `M0P-TIME-COMMUNITY` | `M0-3' time-community` | Overlay GDS/community and active NOW on the structural graph. | graph neighborhood + current session/tick → read-only overlay | S2 GDS/projection + S3 temporal state | no renderer-local clock or inference. |
| `M0P-PERSONAL-ROUTE` | `M0-4' personal` | Route selected canonical coordinate into protected Nara context. | public coordinate handle → M4' deep-link/intent | M4/S1/S3 protected stores; M0' has no personal-write authority | bridge-only; raw personal body must not return into public graph. |
| `M0P-PEDAGOGY-ROUTE` | `M0-5' pedagogy` | Route selected coordinate into Epii teaching/review/Atelier context. | canonical coordinate → M5' route | M5/S5' owns pedagogical/review meaning; S1' owns canon writes | bridge-only; M0' cannot promote canon. |

Critical law: legacy `#` coordinates are compatibility projections of the M family. Search/wikilink boundaries may accept `#`; resolved graph identity lands on M. The C/kernel and S2 graph relation sets may differ because S2 can carry broader relations; the 65 kernel-core relation audit remains a distinct readiness check.

## 3. M1' — Paramasiva as instrument

Authority: `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md` blob `c2d1551e91e29dc3bb31f64564f2ad38c95df7ab`.

| Capability ref | Coordinate | Frozen capability | Authority boundary |
|---|---|---|---|
| `M1P-CANONICAL-SOURCE` | `M1-0'` | Read-only immutable harmonic/matrix/Hopf source for the instrument. | Kernel/M1 source owns facts; surface cannot invent pitch or topology. |
| `M1P-INSTANCE` | `M1-1'` | Session-held current walk, coordinate and `(lens,mode)` state. | Session mutation is bounded runtime state, not M1 canon mutation. |
| `M1P-HARMONIC-ENGINE` | `M1-2'` | Render six Ananda matrix families, raw/DR cells, DR-ring streamlines and K² texture; use profile bus as performance state. | M1 engine computes matheme; M2-1'/Vimarsha produces the shared 8+4 audio bus; M1' consumes it. |
| `M1P-SPANDA` | `M1-3'` | Profile/tick-driven phase/pulsation and local inversion enactment. | Kernel tick is clock authority; animation frames are not. |
| `M1P-QL-FLOWERING` | `M1-4'` | Position walker + lens-as-scale composition over graph traversal. | S2 relation law defines steps; shared profile defines harmonic role. |
| `M1P-TOPOLOGY` | `M1-5'` | Played single-torus / Hopf / 4π topology recognition over the active walk. | M1-5 is single-torus recognition; M3-5 owns downstream double-torus world-clock synthesis. |

## 4. M2' — Parashakti harmonic-correspondential instrument

Authority: `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` blob `50f8df19da5a4d9d85e40e8b10f0dff7591ea0a3`.

| Capability ref | Coordinate | Frozen capability | Authority boundary |
|---|---|---|---|
| `M2P-PROFILE-SOURCE` | `M2-0'` | Validate/serve 72-space addresses and correspondential descriptors. | M2 72-invariant is canonical; no UI-local address invention. |
| `M2P-VIMARSHA-AUDIO` | `M2-1'` | Vimarsha/MEF read of Prakasa cloud; write shared `audio_octet[8]` + `nodal_quartet[4]`; lens resonance and Klein-flip surface. | This is M' audio-genesis. M1'/M3' consume the bus rather than bypass it. Current implementation is kernel-adjacent in `portal-core/parashakti/vimarsha_reading.rs`; domain authority remains M2'. |
| `M2P-ELEMENTAL-MEDIUM` | `M2-2'` | Resolve 36 tattvas × 2 phases, element/chakra/media response. | Tradition-sensitive mapping/provenance is S2 graph law, not renderer constants. |
| `M2P-DECANIC-FACE` | `M2-3'` | Decan/zodiac/planet/body-zone/light-shadow face and phase evidence. | Correspondence evidence must remain source-provenanced. |
| `M2P-SONIC-ARENA` | `M2-4'` | Make Asma/Shem/maqam/mantra/planetary and related sonic systems playable. | Tuning-aware bridge required for canonical maqam rendering; plain 12-TET note numbers are insufficient. |
| `M2P-DET-GATE` | `M2-5'` | Solar/chakral runtime and 72→64 DET projection gate. | Emits M3-ready evidence; M2' does not classify codons. |

Canonical semantic unit: `M2PrimeMeaningPacket` joins source profile, 72-address views, MEF, elemental, planetary/chakral, sacred-sonic, maqam/mode, cymatic signature, M3 projection evidence, provenance and pending fields.

## 5. M3' — Mahamaya clock/cosmos/transcription surface

Authority: `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` blob `7b6f751d8b7efaf11da0ed884ce46fe6a722e296`.

Frozen capabilities:

- `M3P-CLOCK`: render the shared Paramasiva/kernel harmonic clock (`tick12`, `degree720`, phase, position6); no private renderer clock.
- `M3P-TRANSDUCTION`: display M2 72-index → DET → 64-address reception provenance and gap/readiness state.
- `M3P-SYMBOLIC-CODEC`: render canonical 64 codon / I-Ching / Tarot / line-change / amino-acid facts supplied by M3 codec authority.
- `M3P-ROTATION`: project the shared 84 `(lens,mode)` states into the 472 `(codon,rotation)` landscape and render 7/8 rotational state law.
- `M3P-MEASUREMENT-INSPECTOR`: expose register-disciplined symbolic/physics coupling-flow alignment as explanation/provenance, never as a renderer claim engine.
- `M3P-WORLD-CLOCK`: render M3-5 `K² × T²_Mahāmāyā` double-torus world-clock synthesis downstream of M1-5 single-torus recognition.

The structural Mahamaya graph view in M0' and temporal wheel in M3' are two affordances over the same canonical Bimba nodes, not rival maps.

## 6. M4' — Nara protected lived field

Authority: `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` blob `83eaeb176fe1542812a59573cd9ec5741207fdc8`.

| Capability ref | Functional home | Frozen capability | Authority boundary |
|---|---|---|---|
| `M4P-IDENTITY` | M4 identity branch | Protected personal identity, natal/elemental source binding and personal quaternion/resonance state. | Raw identity/birth/natal/profile data remains protected-local. |
| `M4P-DAY-EPISODE` | day-as-episode | Canonical DAY container with NOW-stamped journal/dream/chat/reminder/task/contemplative artifacts. | S1 vault is material store; S3 owns DAY/NOW temporal truth. |
| `M4P-ORACLE` | oracle/transcription | Bounded `OracleFrame`, VAK spread grammar, Mahamaya `TranscriptionalClockPacket` chain and symbolic-protein/oracle sequence. | M3 owns symbolic address/transcription facts; M4 owns protected lived interpretation. |
| `M4P-ACTIVITY` | transformation/activity | `Q_activity` / trajectory / PatternPacket evidence and decayed activity perturbation. | Activity may affect live state; it cannot become identity without review. |
| `M4P-EPISODIC` | protected Graphiti/lens surface | Retrieve and relate protected episodic evidence through privacy classes. | Graphiti temporal architecture is S3'; M4 owns personal meaning/privacy boundary; S5 governs invocation/review. |
| `M4P-PROMOTION-SEAM` | M4.5 / review crossing | Produce identity-augment proposals and governed sendoff to M5/S5 review. | lifecycle is `proposed -> reviewed -> accepted|rejected -> applied`; service connectivity alone grants no authority. |

Cross-M law is explicit: M1/M2/M3 context enters Nara as handles and priors; M4 does not regenerate pitch, correspondence, codon or rotation law. Raw journal/dream/oracle/private episode bodies do not become public Bimba facts.

## 7. M5' — Epii return / self-research workbench

Authority: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` blob `bc196255cb9f61d5c457057e2867abed5807adce`.

| Capability ref | M5' coordinate | Frozen capability | Current material body / authority split |
|---|---|---|---|
| `M5P-LIBRARY` | `M5-0'` | Bimba pedagogy, Gnosis library/RAG corpus, kbase, graph-context teaching and retrieval across distinct namespaces. | S5 Gnosis/kbase owns world-return service meaning; S2 owns graph/retrieval substrate; Bimba namespace stays distinct from gnosis/etymology/pratibimba. |
| `M5P-CANON` | `M5-1'` | Philosophy/canon authoring and review with semantic neighbours and wikilink-safe mutation. | S1/Hen owns vault mutation and wikilink integrity; editor/shell is replaceable body. |
| `M5P-BACKEND-STUDIO` | `M5-2'` | Inspect and operate the S'/S backend through governed tasks, tests and evidence. | Does not transfer S-layer semantic ownership to M5'; it is a developer-facing reflection of those owners. |
| `M5P-REFLECTED-APP` | `M5-3'` | Reflected application/workspace surface for M' capabilities. | Existing Tauri/Theia material is implementation/migration evidence, not R1 future architecture authority. |
| `M5P-CONTROL-ROOM` | `M5-4'` | Governed agent execution, capability selection, evidence envelopes, review handoff and operational-capacity family. | S4 Pleroma capability matrix governs executable capability; S5 review owns resolution; human-required gates cannot auto-resolve. |
| `M5P-ATELIER` | `M5-5'` | Logos/etymological archaeology, term constellations, source-following, crystallisation and Mobius return. | Composes S5 Gnosis + S2 retrieval + S1 semantic/vault context; promotion remains review-gated. |

Additional frozen M5' capabilities: Epii review inbox; autoresearch baseline/challenger/evaluation/keep-discard/dry-run-promotion loop; pedagogy/disclosure; canon-recognition; safe Nara evidence review; agent-access status/deposit; source-aware graph namespaces. Autoresearch can propose and evaluate but cannot self-promote canon.

## 8. Cross-domain contracts that must survive R2 ownership mapping

1. **One coordinate identity, multiple surfaces.** M' renders M/Bimba; it does not create a parallel coordinate universe.
2. **Shared profile, no renderer-local physics.** M1'/M2'/M3'/M4' consume the common harmonic/temporal profile with explicit writers/consumers.
3. **M2-1' audio-genesis split is load-bearing.** Prakasa substrate is read by Vimarsha/MEF; M1'/M3' consume the resulting bus.
4. **M2→M3 boundary is load-bearing.** M2-5' projects 72→64; M3 classifies/renders codon/rotation.
5. **M4 is protected-local by default.** Public coordinate handles can enter; raw private content cannot escape merely because graph/session/provider connectivity exists.
6. **M4→M5 promotion is governed.** Activity/episode evidence is not identity/canon until review resolves it.
7. **M5 can inspect/operate lower layers without owning them.** The developer/pedagogical workbench must preserve S-layer and M-domain source/write authority.
8. **Bimba/Gnosis/Etymology/Pratibimba are linkable namespaces, not one flattened graph plane.**

## 9. R1 open questions retained for downstream agents

These are refinement slots, not blockers to the field freeze:

- normalized Anuttara graph field names (`c_1_symbol` etc. vs normalized display fields) still require S2 schema convergence;
- core-65 kernel relation audit versus broader S2/Bimba relation corpus needs a deterministic comparison receipt;
- some current M' surface tests refer to moved legacy fixture paths; those are implementation/test-harness repairs, not domain-identity ambiguity;
- provider-backed/live availability of some S4 gateway methods remains capability-gated;
- implementation bodies named Theia/Tauri in Cycle-3 specs are preserved as evidence only for R1 and await R2 ownership/disposition mapping.
