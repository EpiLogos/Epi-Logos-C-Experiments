# M4' - Nara as Protected Activity-Graph Instrument

## A Seed Specification of the Functional/Techne Reflection of M4, by Which the Matheme Becomes Personal Activity, Elemental Inference, and Protected Episodic Memory

> **The M4 -> M4' Distinction:** M4 = Nara's bimba architecture: the personal/dialogical interface where universal structures become someone's structures. M4' = Nara's playable techne: protected activity intake, identity/quintessence anchoring, oracle service, journal/dream/session symbolic parsing, Graphiti episodic memory, and Epii/Sophia review.

> **The Boundary:** M4' is not the oracle alone, not a renderer, and not an identity mutator. Oracle is a privileged Nara service at #4.2. Activity is the broader live stream rooted at #4.4.4.4. Identity is stable #4.0 ground and changes only through governed Epii/Sophia review.

> **The Standing Runtime Formula:** `Q_composed = normalize(Q_identity * Q_transit * Q_activity)`. `Q_identity` is the BLAKE3/quintessence-derived archetypal address, `Q_transit` is the kerykeion/kairos sky, and `Q_activity` is the consented live Nara perturbation stream. Oracle is one high-signal source of `Q_activity`, not the whole of activity.

> **Companion documents:**
> - [`M4'-SPEC.md`](M4'-SPEC.md) - current M4' UI/backend domain contract
> - [`M4-nara-personal-interface.md`](../../../../../Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-personal-interface.md) - canonical M4 bimba/implementation spec, FR 2.4.0 through FR 2.4.13
> - [`2026-04-04-graphiti-unified-temporal-context-service.md`](../../../../../Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md) - Graphiti Personal Episodic Context at #4.4.4.4
> - [`00-canonical-invariants.md`](../../../../../Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md) - identity, clock, quaternion, oracle, planet, and privacy invariants
> - [`HOPF-INTEGRATION-READ.md`](../../../../../Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/HOPF-INTEGRATION-READ.md) - Hopf/quaternion and Nara-clock integration
> - [`2026-03-11-epi-flow-design.md`](../../../../../Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-11-epi-flow-design.md) - daily FLOW journal substrate and typed entry flags

> **Dataset anchors:** [`docs/datasets/nara-deep/nodes-full-detail.json`](../../../../../docs/datasets/nara-deep/nodes-full-detail.json) has 100 Nara nodes; [`docs/datasets/nara-deep/relations.json`](../../../../../docs/datasets/nara-deep/relations.json) has 284 Nara relations. The root dataset names #4.0 through #4.5 as Mahamaya Identity Matrix, Sympathetic Medicine, Divinatory Frameworks, Mediating Transformation, Context & Lenses, and Epii Integration.

> **Code anchors:** `epi-lib/include/m4.h` (M4 identity, temporal now, elemental throughline, PCO), `epi-cli/src/nara/identity.rs` (BLAKE3 identity hash, elemental profiles, current journal-weight stub), `portal-core/src/state.rs` (quaternion composition), `epi-cli/src/nara/oracle.rs` (oracle payload and tarot/decan bridges), `epi-cli/src/nara/weights.rs` (nucleotide/oracle/body weighting), `graphiti-runtime/src/lib.rs` (protected Graphiti deposit payloads and identity-mutation rejection).

---

## §0/1 - Threshold: What M4' Is, and What it is Not

M4' is **Nara read from the activity-graph side**. It is the instrument surface where the user's stable archetypal address, current astrological condition, journal stream, dreams, oracle casts, session events, highlights, Sophia loops, and Epii reviews become structured, privacy-preserving, symbolically interpretable runtime state.

The phrase "activity" is load-bearing. In the M4 seed, Nara already includes journal, DAY/NOW lived context, dream, oracle, highlight, and personal Pratibimba continuity. The oracle service is therefore not the same thing as Nara activity. Oracle is a specific cast/interpretation service at #4.2, with consent-gated sacred randomness, hygiene, canonical tag emission, and kairotic timing. Activity is broader: any lived event that can legitimately alter the live orientation of the personal system without rewriting identity.

Three commitments hold the threshold.

**First:** M4' must preserve the M4 bimba branch structure. The dataset is not vague here. Nara's six branches are #4.0 Identity, #4.1 Medicine, #4.2 Divination, #4.3 Transformation, #4.4 Context & Lenses, and #4.5 Epii Integration. The M4 implementation spec makes two details non-negotiable: all cross-M edges originate through #4.4, and #4.4.4.4 is the Personal Pratibimba convergence hub. Any M4' activity spec that bypasses #4.4.4.4 or lets journal/oracle data leak into public graph space is structurally wrong.

**Second:** M4' must keep identity, transit, and activity separate. `Q_identity` comes from the #4.0 quintessence hash and its derived quaternion. It is stable during ordinary activity. `Q_transit` comes from kerykeion/kairos and the live solar/planetary condition. `Q_activity` is the live event perturbation layer. Current Rust code composes `quintessence_quaternion * transit_quaternion * live_quaternion`; M4' names the generalization: the existing `live_quaternion` slot is the compatibility surface for `Q_activity`, while oracle remains the first implemented activity source. If implementation wants to preserve the canonical wording that `live_quaternion` is oracle-derived, add an explicit `activity_quaternion` and compose that instead. Do not silently make journal text mutate identity.

**Third:** M4' must lock the Elemental Throughline. The law is:

| Nucleotide | Value | Element | Tarot suit | Jungian function |
|------------|-------|---------|------------|------------------|
| A | 6 | Water | Cups | Feeling |
| T/U | 9 | Fire | Wands | Intuition |
| C | 7 | Earth | Pentacles | Sensation |
| G | 8 | Air | Swords | Thinking |

The quaternion remap is likewise fixed: activity and identity element vectors are stored as `[FIRE, WATER, EARTH, AIR]` when appropriate, then remapped to `[w=EARTH, x=FIRE, y=WATER, z=AIR]` before normalization. This keeps Earth as the observer/ground component, Fire as active advance, Water as inversion/depth, and Air as discriminative/spanda movement. A journal parser, MBTI parser, oracle payload, or Graphiti reducer that maps Thinking to Fire or Intuition to Air is violating the branch law.

---

## §0 - Ground: The Nara Activity Chain

M4' begins when universal clock/profile state becomes someone's lived event:

```text
M1' tick / tone                 -> tick12, harmonic, diatonic, QL position
M2' harmonic-correspondential   -> resonance72, element, decan, chakra, body-zone hints
M3' symbolic transcription      -> hexagram, codon, tarot, rotation, line-change evidence
M4 #4.0 identity                -> quintessence_hash, Q_identity, stable profile layers
M4 #4.1 kairos/body             -> Q_transit, somatic/medicinal timing context
M4 activity source              -> journal, daily note, dream, oracle, highlight, session, loop
Graphiti protected episode      -> typed event body under #4.4.4.4 privacy rules
Symbolic inference              -> elemental vector, QL/MEF candidates, archetypal motifs
Q_activity update               -> live perturbation with confidence/provenance/decay
M4 #4.5 review                  -> insight, playbook, curriculum, optional identity proposal
Governed promotion              -> Epii/Sophia approval before #4.0 identity augment
```

This chain is what lets the Tauri clock be both directly engageable and integrated. In the clock view, M1-M2-M3-M4 appear as one live structure: tick, resonance, symbol, and lived activity are all present in one frame. In the 4+2 per-layer app surfaces, M4' must also stand alone: journal can be used without the cymatic panel, oracle can be cast without the journal panel, identity can be inspected without starting a transform protocol, and Graphiti can accept session memory without forcing a UI render.

The rule is: **directly engageable, lawfully layerable**. M4' must be a self-contained Nara module and a composable layer in the full harmonic clock.

---

## §1 - Definition: The Six M4' Strata as Techne-Reflection of M4

### The bimba -> prime correspondence

| M4 (bimba) | M4' (techne seed) | What M4 is | What M4' does |
|------------|-------------------|------------|---------------|
| **M4-0** Mahamaya Identity Matrix | **M4-0'** Identity Anchor and Quintessence Gate | Six-layer Symbol DNA: birthdate, natal chart, Jungian, Gene Keys, Human Design, quintessence | Computes and exposes stable identity hash/profile handles; derives `Q_identity`; accepts identity proposals only through review |
| **M4-1** Sympathetic Medicine | **M4-1'** Somatic-Medicinal Readout | Elemental ground, energy body, materia, alchemical operations, temporal astrological intelligence, safety | Reads activity through body, element, chakra, decan, and safety gates; contributes somatic/medicinal constraints to `Q_activity` |
| **M4-2** Divinatory Frameworks | **M4-2'** Oracle Service and Symbolic Cast Surface | Common substrate, Tarot, I-Ching, sacred randomness, interpretation, hygiene | Performs consented casts, emits canonical tags and oracle payloads, updates the activity layer as a privileged event type |
| **M4-3** Mediating Transformation | **M4-3'** Alchemical Activity Processor | Two-stroke cycle engine, operational grammar, containers, safety, protocols, telemetry | Turns activity into transformable process records; distinguishes outer manifestation from inner integration |
| **M4-4** Context & Lenses | **M4-4'** Episodic Lens/NLP and Graphiti Surface | Six-lens vtable, Jungian depth, phenomenology, Personal Pratibimba, all cross-M conduits | Parses journal/dream/session text into symbolic candidates; anchors episodes at #4.4.4.4; gates public/private projection |
| **M4-5** Epii Integration | **M4-5'** Review, Wisdom, and Promotion Gate | Logos Cycle, curriculum, voice, transparency, integration, pedagogy, Mobius return | Runs synthesis loops, writes insight/playbook records, and promotes only reviewed changes back toward #4.0 |

The bimba is the personal-dialogical architecture. The prime is the instrument apparatus by which that architecture becomes eventful, queryable, replayable, sonifiable, graphable, and safely evolvable.

### What M4' assembles into

M4' assembles a single protected runtime:

1. **M4-0'** gives every event a stable identity anchor without exposing protected identity.
2. **M4-1'** supplies current body/element/chakra/kairos constraints.
3. **M4-2'** handles explicit oracle events and their hygiene.
4. **M4-3'** metabolizes events into two-stroke transformation process.
5. **M4-4'** records, interprets, and retrieves activity under #4.4.4.4.
6. **M4-5'** integrates patterns and decides whether anything deserves promotion.

This is why journal NLP belongs primarily at M4-4', not at M4-2'. A journal entry can contain oracular material, but its first operation is contextual/lens-based interpretation and protected episodic deposition. It may then route derived canonical tags to #4.1, #4.2, #4.3, or #4.5.

---

## §2 - The Six Strata in Detail

### §2.M4-0' - Identity Anchor and Quintessence Gate

**Role.** Holds the stable personal ground: #4.0-0 birthdate encoding, #4.0-1 natal/astrological chart, #4.0-2 Jungian assessment, #4.0-3 Gene Keys, #4.0-4 Human Design, and #4.0-5 archetypal quintessence.

**Runtime contract.**

- Identity is addressed by the full 32-byte BLAKE3 `quintessence_hash`; previews are display-only.
- `Q_identity` is derived from valid #4.0 elemental profiles by the canonical `[F,W,E,A] -> [w=E,x=F,y=W,z=A]` remap.
- Raw identity inputs are protected-local and zeroized or held only in governed profile storage.
- Activity events may cite identity handles, layer presence, hash preview, and readiness; they may not include raw birth data, natal chart internals, MBTI strings, Gene Keys profiles, or Human Design payloads in public graph surfaces.
- Journal/session activity must never recompute identity directly. It can produce an `IdentityAugmentProposal` for M4-5' review.

**Implementation seam.** The current `journal_elemental_weight()` stub returning `[1.0, 0.0, 0.0, 0.0]` must not become production behavior. Until a real parser exists, journal-derived elemental signal is `pending`, not "all Fire". Also audit MBTI-derived elemental code against the locked law: Thinking is Air/G, Feeling is Water/A, Sensation is Earth/C, Intuition is Fire/T.

### §2.M4-1' - Somatic-Medicinal Readout

**Role.** Reads personal activity as body-state, elemental balance, timing, and safety. This is where journal and oracle outputs become medicinally meaningful without pretending to prescribe automatically.

**Dataset branch.** #4.1 contains:

- #4.1-0 Elemental Ground
- #4.1-1 Energy-Body Architecture
- #4.1-2 Materia & Reagents
- #4.1-3 Operations & Techne
- #4.1-4 Temporal Astrological Intelligence
- #4.1-5 Integration, Safety & Feedback

**Runtime contract.**

- Every activity event receives the current kairos stamp before medicinal interpretation.
- Somatic inference may mark body-zone, chakra, element, decan, and safety signals.
- Medicine may request a transformation intervention from #4.3, but it does not mutate identity.
- Safety gates override symbolic enthusiasm: arousal, contraindication, crisis language, and user consent must be first-class.
- The output is a bounded `SomaticActivityReadout`, not a medical claim.

### §2.M4-2' - Oracle Service and Symbolic Cast Surface

**Role.** Performs explicit divinatory operations. This branch is precise enough that "oracle" should stay a service/notion, not become the umbrella term for every Nara event.

**Dataset branch.** #4.2 contains:

- #4.2-0 Common Substrate
- #4.2-1 Tarot Engines
- #4.2-2 I-Ching Integration
- #4.2-3 Casting & Randomness Layer
- #4.2-4 Interpretation Layer
- #4.2-5 Divinatory Hygiene & Pedagogy

**Runtime contract.**

- A cast is consent-gated and uses real randomness where randomness is required.
- A cast captures kairotic moment data through the same temporal substrate as medicine and journal activity.
- Every oracle result emits canonical tags with nucleotide/element/suit/function law intact.
- Oracle updates `Q_activity` with high provenance and explicit event kind `oracle`.
- Oracle history is a Graphiti/Nara protected activity stream, not public S2 graph fact.
- Interpretation must expose hygiene state, bias checks, and uncertainty.

### §2.M4-3' - Alchemical Activity Processor

**Role.** Converts activity into transformation process. This is the two-stroke engine: outer manifestation followed by inner integration.

**Dataset branch.** #4.3 contains:

- #4.3-0 Cycle Engine
- #4.3-1 Operational Grammar (Alchemy)
- #4.3-2 Dialogical & Inquiry Containers
- #4.3-3 Control/Chaos & Safety
- #4.3-4 Protocol Library (Storey Packets)
- #4.3-5 Telemetry & Phase History

**Runtime contract.**

- Each accepted activity event can become a `TransformationEpisode` with storey/stroke position, active operation, safety state, and telemetry.
- Dialogical containers are process mediators, not oracles. A Bohmian dialogue, talking circle, or Diamond Approach inquiry structures transformation; it does not produce sacred randomness.
- Journal/dream/session events can be routed to transformation only after symbolic parsing and safety screening.
- Telemetry records to #4.4.4.4 and feeds #4.5.
- The system must preserve the distinction between "I noticed this pattern" and "the system should act on this pattern."

### §2.M4-4' - Episodic Lens/NLP and Graphiti Surface

**Role.** This is the load-bearing M4' surface. #4.4 is the lens shelf, the context ledger, the sole cross-M conduit, and the parent of #4.4.4.4 Personal Pratibimba. Journal NLP, daily note parsing, dream interpretation, highlight sendoff, session memory deposition, and activity search all belong here first.

**Dataset branch.** #4.4 contains:

- #4.4.0 Gebser Lens
- #4.4.1 Ontological Lens
- #4.4.2 Epistemological Lens
- #4.4.3 Jungian Depth Psychology Lens
- #4.4.4 Phenomenological Lens, including #4.4.4.4 Personal Pratibimba
- #4.4.5 Trika / Kashmir Saivism Lens

**Runtime contract.**

- Graphiti episodes are rooted under the protected #4.4.4.4 namespace.
- Raw body text from journals, dreams, and sessions remains protected-local.
- Public/current profile projections receive handles, coordinates, and derived safe metrics only.
- M1/M2/M3 profile fields are attached as context handles, not recomputed in the renderer or journal parser.
- NLP output is candidate-bearing and provenance-bearing. It must report confidence, source span, parser version, and unresolved fields.
- If no real classifier/parser exists, output `symbolic_state = pending-parser`. Do not invent element weights.

### §2.M4-5' - Review, Wisdom, and Promotion Gate

**Role.** Runs Epii/Sophia integration: pattern synthesis, playbook formation, curriculum updates, and governed Mobius return to identity.

**Dataset branch.** #4.5 contains:

- #4.5-0 Curriculum Map
- #4.5-1 Core Epi-Logos Voice
- #4.5-2 Method Transparency Lab
- #4.5-3 Integration Lab
- #4.5-4 Pedagogy Lab
- #4.5-5 Logos Cycle Engine

**Runtime contract.**

- #4.5 consumes activity episodes and emits insight, capability, pedagogy, and identity-proposal records.
- Identity-affecting changes are not direct writes. They are reviewed promotions with evidence.
- Sophia/Epii loops can revisit old Graphiti episodes over time and produce new summaries, but they must preserve source provenance.
- Promotion from `Q_activity` pattern to #4.0 identity augment requires explicit review state: `proposed -> reviewed -> accepted|rejected -> applied`.
- Rejected or stale proposals remain as historical episode data, not hidden state.

---

## §3 - Activity Model and Event Schema

### Activity kinds

M4' recognizes activity as a typed stream:

```rust
pub enum NaraActivityKind {
    Journal,
    DailyNote,
    Dream,
    Highlight,
    Oracle,
    SessionOpen,
    SessionClose,
    AgentExchange,
    SophiaLoop,
    EpiiReview,
    KernelProfileObservation,
}
```

The key design move is that `Oracle` is a member of this stream, not the name of the stream. It has special requirements and high symbolic authority, but it coexists with writing, dreaming, sessions, and review cycles.

### Event envelope

```rust
pub struct NaraActivityEvent {
    pub event_id: String,
    pub kind: NaraActivityKind,
    pub coordinate: String,          // Usually "#4.4.4.4" or a branch-specific child.
    pub day_id: String,
    pub now_path: Option<String>,
    pub session_key: Option<String>,
    pub source_ref: SourceRef,       // File path, span, oracle id, session id, etc.
    pub privacy: PrivacyClass,       // protected-local by default.

    pub identity_ref: IdentityRef,   // hash handle / layer presence only.
    pub matheme: MathemeHarmonicProfileRef,
    pub kairos: KairosSnapshot,

    pub raw_body_handle: Option<String>, // Protected pointer, never public payload text.
    pub derived: NaraSymbolicObservation,

    pub state_effect: ActivityStateEffect,
    pub provenance: ProvenanceRecord,
}
```

### Symbolic observation

```rust
pub struct NaraSymbolicObservation {
    pub elemental_fwea: Option<[f32; 4]>,       // [FIRE, WATER, EARTH, AIR]
    pub nucleotide_atcg: Option<[f32; 4]>,      // [A, T/U, C, G]
    pub quaternion_delta: Option<[f32; 4]>,     // [w=E, x=F, y=W, z=A]

    pub ql_position: Option<u8>,
    pub mef_lens: Option<String>,
    pub cf_mode: Option<String>,
    pub m2_resonance72: Option<u8>,
    pub m3_address64: Option<u8>,

    pub archetypal_tags: Vec<String>,
    pub body_zone_tags: Vec<String>,
    pub oracle_tags: Vec<String>,
    pub transformation_tags: Vec<String>,

    pub parser_state: ParserState,              // ready | pending | failed
    pub confidence: f32,
}
```

### State effect

```rust
pub enum ActivityStateEffect {
    NoStateChange,
    EphemeralContextOnly,
    UpdateActivityQuaternion { decay: f32, weight: f32 },
    OpenTransformationEpisode,
    CreateIdentityAugmentProposal,
}
```

The default for free-text journal and daily note parsing should be `EphemeralContextOnly` or `UpdateActivityQuaternion` with explicit decay and confidence. The default must not be `CreateIdentityAugmentProposal`. Identity proposals are rare and review-bound.

---

## §4 - Journal, Daily Note, and Flow Parsing

The journal parser is not a sentiment widget. It is the local symbolic reader for a protected life-stream.

### Inputs

- FLOW entries from `epi flow`, including typed flags such as `personal`, `dream`, `oracle`, `reflection`, `dev`, `research`, and `task`.
- Daily Note files from the DAY/NOW substrate.
- Dream journal entries.
- Highlight sendoffs from the Nara UI.
- Session summaries and agent exchanges deposited by S3/Graphiti.

### Required parser stages

1. **Segment.** Split markdown into entries, timestamps, flags, tags, source spans, and private body handles.
2. **Stamp.** Attach DAY/NOW, session, tick12, MathemeHarmonicProfile handles, and kerykeion/kairos snapshot.
3. **Classify locally.** Produce elemental, Jungian-function, body-zone, archetypal, QL/MEF, and transformation candidates.
4. **Normalize.** Convert `[A,T,C,G]` and `[F,W,E,A]` signals into the canonical quaternion remap.
5. **Gate.** Apply privacy, confidence, safety, and consent gates.
6. **Deposit.** Write protected Graphiti episodes with source provenance and derived safe metrics.
7. **Reduce.** Update `Q_activity` only when parser output is real, confidence-bounded, and event policy permits it.
8. **Review.** Route long-term patterns to M4-5' before any identity-affecting change.

### Parser quality rules

- A parser that cannot classify a span returns `pending` or `unknown`, not a default element.
- A parser that uses an LLM must run under protected-local policy and store prompts/responses only as protected episodes unless the user explicitly exports them.
- A parser must preserve source spans so Epii/Sophia review can inspect why a symbolic read was produced.
- Fine-grained detail belongs in the observation record: multiple spans can carry different element vectors inside one journal entry.
- Time decay is required. A frustrated note from one morning should not dominate the user's live state indefinitely.

---

## §5 - Graphiti Update Semantics

Graphiti is the protected episodic memory substrate, not the identity source of truth. Its job is to remember, relate, search, summarize, and support review.

### Trigger points

- `flow.appended`
- `daily_note.saved`
- `dream.logged`
- `oracle.cast.completed`
- `highlight.sent`
- `session.opened`
- `session.closed`
- `kernel_profile_observation.created`
- `chronos.decan_boundary`
- `sophia.loop.completed`
- `epii.review.completed`

### Deposit order

```text
1. provenance skeleton       -> S3/Khora/Gateway
2. protected episode body    -> Graphiti #4.4.4.4 namespace
3. derived observation       -> NaraSymbolicObservation
4. state reducer             -> Q_activity / transformation episode / proposal
5. review loop               -> M4-5' promotion, rejection, or curriculum update
```

### Privacy classes

| Class | Allowed content | Public projection |
|-------|-----------------|-------------------|
| `protected-local-body` | raw journal, dream, session, oracle interpretations | none |
| `protected-local-derived` | symbolic observations, parser outputs, private summaries | handles and aggregate metrics only |
| `public-current-context` | tick, coordinate, safe profile handles, resonance/address fields | yes |
| `reviewed-canonical` | Epii/Sophia accepted facts or playbooks | governed graph projection |

The current Graphiti runtime already rejects `identity_mutation=true` for session-memory deposits. M4' extends that principle: every identity-affecting activity record becomes a proposal, never a direct mutation.

---

## §6 - Kerykeion / Kairos Context

Kerykeion is not decorative metadata in M4'. It is the temporal intelligence substrate for #4.1 and the timing context for #4.2, #4.3, and #4.4.

Every activity event should be stamped, when available, with:

- exact timestamp and timezone
- current sun, moon, and planet degrees
- current sign and decan
- planetary hour or timing authority field
- degree720 / degree360 / phase / tick12 from the harmonic clock
- body-zone/chakra/decan projection where graph law supplies it
- kairotic mode: `natal`, `real-time`, or `oracle-consultation`

The same kairos fields must be available for retrieval. The useful query is not only "find journal entries tagged fire"; it is "find protected episodes where Fire was high during a Mars decan while the clock was at tick12=3 and the user later reported integration." That is where Nara becomes intelligent rather than merely archival.

---

## §7 - Integration Seams with M1', M2', and M3'

### M1' -> M4'

M1' supplies tick, tone, harmonic role, and QL position. M4' consumes this as lived temporal condition: "what position was the user writing/casting/acting from?" It does not regenerate pitch. It can sonify an activity arc by replaying safe profile handles, but private text is never encoded into audio without governed local consent.

### M2' -> M4'

M2' supplies resonance72, element, decan, chakra, body-zone, and harmonic-correspondential context. M4' uses these as inference priors and context stamps. M4' does not hardcode planetary/chakral correspondences in UI or parser code; it consumes them from profile/graph law.

### M3' -> M4'

M3' supplies symbolic transcription: hexagram, codon, tarot, line-change, rotation, and modal inversion. M4' uses these in oracle history, journal synchronicity recognition, and transformation patterning. M4' does not decide the 64 address law or 7/8 codon rotation law.

### M4' -> M1'/M2'/M3'

M4' feeds back safe live state:

- `Q_activity` for the integrated live clock
- activity-derived lens/mode suggestions, never hard overrides
- Graphiti retrieval results for context-aware UI panels
- reviewed insight/playbook/curriculum records
- identity augment proposals only after review

This is the seam that keeps the Tauri clock alive as one structure while preserving per-layer direct engagement.

---

## §8 - Implementation Order

1. **Define activity types.** Add `NaraActivityEvent`, `NaraSymbolicObservation`, `ActivityStateEffect`, and privacy enums in the Rust Nara/portal boundary.
2. **Separate activity from oracle naming.** Keep `oracle` service APIs, but introduce `activity` as the broader runtime namespace.
3. **Add Graphiti activity deposit payload.** Mirror current session/kernel deposit guards and reject identity mutation at payload construction.
4. **Replace journal elemental stub.** Remove the all-Fire stub behavior. Return `pending-parser` until a real local parser is implemented.
5. **Implement real parser tranche.** Start with deterministic markdown segmentation, typed flags, tags, source spans, and safe null symbolic output; then add real symbolic classifier modules.
6. **Lock element tests.** Test A/Water/Feeling, T/Fire/Intuition, C/Earth/Sensation, G/Air/Thinking across M3, M4 identity, oracle, and parser outputs.
7. **Add kerykeion stamping.** Activity events must carry kairos context when available and explicit unavailable state when not.
8. **Add activity reducer.** Compute `Q_activity` from accepted event deltas with confidence, decay, and provenance.
9. **Compose clock state.** Either generalize `live_quaternion` as the activity slot with compatibility notes or add explicit `activity_quaternion`.
10. **Wire FLOW/Daily Note/Dream/Highlight triggers.** Ensure each trigger deposits protected episodes and derived observations.
11. **Wire M4-5' review.** Implement proposal lifecycle for identity-affecting patterns.
12. **Expose UI surfaces.** Journal/oracle/activity panels should show confidence, provenance, privacy class, and current safe clock context without dumping private inference internals.

---

## §9 - Readiness and Test Criteria

M4' is not production-ready until these are true:

- Tests prove journal, dream, oracle, highlight, and session bodies do not appear in S2 public graph projections or public-current profile payloads.
- Tests prove Graphiti activity deposits reject direct identity mutation and route identity-affecting data to proposal records.
- Tests prove `Q_identity`, `Q_transit`, and `Q_activity` are independently inspectable and compose in the declared order.
- Tests prove oracle remains a typed activity/service and does not swallow all Nara activity naming.
- Tests prove the Elemental Throughline across nucleotide, element, tarot suit, Jungian function, and quaternion remap.
- Tests prove a missing journal parser returns `pending`, not a fabricated element vector.
- Tests prove kerykeion/kairos unavailable state is explicit and does not silently write degree zero as if it were real.
- Tests prove M1/M2/M3 profile fields are consumed as handles and not recomputed inside M4 renderers or journal parser code.
- Tests prove Epii/Sophia review can accept, reject, and preserve identity augment proposals with source provenance.

The operating principle is simple: **Nara can learn from activity immediately, but it may only become identity through reviewed recognition.**
