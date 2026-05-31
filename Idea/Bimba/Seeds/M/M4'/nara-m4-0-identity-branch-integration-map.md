# Nara M4-0 Identity Branch Integration Map

**Branch:** `M4-0` — Nara Identity Matrix  
**Scope:** system-level mapping of `M4-0-1` through `M4-0-5`, with `M4-0-0 Birthdate Encoding` treated as the already-drafted base layer  
**Status:** development handoff draft, v0.1  
**Generated:** 2026-05-24  
**Companion file:** `nara-m4-0-0-birthdate-encoding-spec.md`

---

## 0. Orientation

This file maps the wider `M4-0` identity branch after the first layer, `M4-0-0 Birthdate Encoding`, has been specified. The purpose is not to finalise every subsystem. The purpose is to give future Nara development sessions a coherent integration grammar for the other identity layers:

```text
M4-0-0  Birthdate Encoding / Pythagorean Derivations
M4-0-1  Decanic Astrology / Parashakti Chart Layer
M4-0-2  Jungian 16-Personality / Phenomenal Type Layer
M4-0-3  Gene Keys / Mahāmāyā 64-Code Bridge Layer
M4-0-4  Human Design / BodyGraph-Chakra Mechanics Layer
M4-0-5  Identity Quintessence / Elemental Quaternion Integrator
```

The working premise is:

> The `M4-0` branch is not a collection of unrelated typology systems. It is a multi-system identity derivation pipeline whose layers all contribute to a single elemental/bioquaternionic output at `M4-0-5`.

The `M4-0-5` layer is the identity quintessence. It receives the outputs of the prior layers and integrates them into the Nara elemental quaternion:

```text
q_Nara = Earth + Water·i + Fire·j + Air·k
```

with **Aether** and **Mineral** treated as caps, gates, or meta-conditions rather than ordinary quaternion components:

```text
Aether  = source / aperture / unmanifest potential / inward gate
Mineral = crystallisation / embodiment / lapis / achieved form
```

The branch has a practical minimum and an expanded form:

```text
Core M4-0-5:      M4-0-0 + M4-0-1
Expanded M4-0-5:  M4-0-0 + M4-0-1 + M4-0-2 + M4-0-3 + M4-0-4
```

The reason the first two layers are sufficient for the core is simple: they can be computed from the basic identity packet:

```text
name / received name
birth date
birth time
birth location
```

The later layers either require questionnaire input, imported profiles, or additional calculation systems that may be optional according to user desire.

---

## 1. Governing principle

The external systems provide **artifacts**. MEF provides the **reading engine**. L2′ provides the **element-bearing output face**. Nara produces the **quaternionic typification**.

The correct shape is:

```text
established system artifact
→ QL/MEF address or interpretive field
→ full MEF reading through the 12×6 manifold
→ lens-square analysis
→ L2′ elemental extraction
→ layer-specific elemental quaternion contribution
→ M4-0-5 integration
→ QL Music handoff
```

This means:

- Astrology does not merely say “Sun in Virgo.” It emits a decanic Parashakti coordinate whose planetary, chakral, elemental, temporal, and MEF positions can be read.
- Jungian 16-Personality does not merely say “INFJ.” It emits a psychic-function distribution that passes naturally through `L1′ Phenomenal/Jungian` and Square B.
- Gene Keys does not merely say “Gene Key 23 line 5.” It emits a 64-code contemplative transformation object that bridges into Mahāmāyā, I Ching, genetic code, tarot, and Square C.
- Human Design does not merely say “Projector with Emotional Authority.” It emits a BodyGraph mechanics object: centers, gates, channels, authority, type, definition, and bimba/pratibimba-like Personality/Design polarity.
- M4-0-5 does not merely average the layers. It integrates convergences, preserves tensions, and outputs a traceable elemental quaternion.

The system must avoid early flattening. The quaternion is not a low-detail summary. It is the final algebraic condensation of a preserved evidence field.

---

## 2. Project source anchors

The following anchors keep this file aligned with the current project corpus:

- `epi_logos_coordinate_system.md:18` — L-family as 12 lenses, each with 6 internal positions, yielding the 72-fold MEF manifold.
- `epi_logos_coordinate_system.md:20` and `:63` — common position labels such as ground/definition/operation/etc. are retroactive after L-lens refraction.
- `epi_logos_coordinate_system.md:181` — internal P-position complementarity by sums to 5: `0/5`, `1/4`, `2/3`.
- `epi_logos_coordinate_system.md:199-545` — the 12 MEF lenses and their internal sixfolds.
- `epi_logos_coordinate_system.md:441-457` — `L2′ Alchemical-Elemental` as the element-bearing lens.
- `epi_logos_coordinate_system.md:545-586` — the three Klein V4 MEF lens-squares.
- `ql-musical-derivation.md:3-17` — 12-note matheme, constitutional symmetries, and 12 MEF lens-derived scales.
- `ql-musical-derivation.md:21-35` — bimba/pratibimba helix terminology and conjugate-reflection structure.
- `ql-musical-derivation.md:124-170` — chromatic 12 as two whole-tone helices, bimba and pratibimba.
- `ql-musical-derivation.md:467-486` — 12 MEF lenses as position-anchored remappings of the matheme.
- `ql-musical-derivation.md:1241-1398` — 12 lens-scales, 7 CF modes, and the 84-fold mode-tonic landscape.
- `epi-logos-kernel-spec.md:17-19` — bioquaternionic kernel, bimba/pratibimba, and JEPA-EBM orientation.
- `epi-logos-kernel-spec.md:5-9` — standing identity `64 + 36 = 100% = (4/3)^2 = 16/9`, important for the Gene Keys/Mahāmāyā and decanic/Parashakti bridge.
- `epi_logos_cheat_sheet.md:12-18` — bimba meta-spine including `#-2 Paraśakti`, `#-3 Mahāmāyā`, and `#-4 Nara`.

External public-system anchors to reconnect during development:

- Decans: 12 signs × 3 decans = 36 ten-degree divisions of the zodiac.
- Gene Keys: 64 keys, Hologenetic Profile, 11 spheres, Shadow/Gift/Siddhi frequency bands, astrological coordinates and 88-day-before-birth design layer.
- Human Design: BodyGraph, nine Centers, 36 Channels, 64 Gates/Hexagrams, Type, Strategy, Authority, Personality/Design calculation.
- Myers-Briggs/Jungian 16: four preference pairs, 16 type codes, and type dynamics/best-fit verification.

The external anchors should be treated as public-facing references. The internal Nara encoding should be governed by QL/MEF and the project’s own Parashakti/Mahāmāyā subsystems once loaded.

---

## 3. Shared layer output contract

Every `M4-0-X` layer should emit a common kind of object, even if its internal computation differs.

```ts
type M4IdentityLayerOutput = {
  layer_id: "M4-0-0" | "M4-0-1" | "M4-0-2" | "M4-0-3" | "M4-0-4";
  layer_name: string;
  source_system: string;

  // Determinate artifacts are what can be computed, scored, imported, or externally verified.
  determinate_artifacts: Record<string, unknown>;

  // Indeterminate reading is where the LLM and MEF lens-system enact interpretation.
  indeterminate_reading: {
    dominant_lenses: string[];
    dominant_squares: string[];
    unresolved_polarities: string[];
    compensatory_vectors: string[];
    narrative_notes: string[];
  };

  // 12 lenses × 6 positions. These are not merely musical notes;
  // they are the full MEF reading field.
  mef_resonance: {
    R_anchor_bias: number[][];     // direct calculated/layer-specific hits
    R_square_diffuse: number[][];  // lens-square propagation
    R_inverse: number[][];         // proverse/inverse internal P-position propagation
    R_total: number[][];           // total layer resonance
  };

  element_quaternion: {
    earth: number;
    water: number;
    fire: number;
    air: number;
  };

  caps: {
    aether_gate: number;
    mineral_cap: number;
  };

  evidence_paths: EvidencePath[];

  confidence: {
    data_reliability: number;          // input quality
    computation_reliability: number;   // exactness of artifact generation
    interpretive_reliability: number;  // confidence in MEF/LLM reading
    overall: number;
  };

  ql_music_handoff: {
    scale_candidates: string[];
    mode_candidates: string[];
    motif_vectors: string[];
    chromatic_anchors: string[];
    timbre_bias: Record<string, number>;
    cadence_notes: string[];
  };
};
```

The important thing is the **evidence path**. The final quaternion must never obscure how it was produced.

```ts
type EvidencePath = {
  layer_id: string;
  source_artifact: string;
  value: string | number;
  computed_coordinate?: string;
  mef_lens?: string;
  mef_position?: string;
  lens_square?: "A" | "B" | "C";
  element_contribution: {
    earth?: number;
    water?: number;
    fire?: number;
    air?: number;
    aether?: number;
    mineral?: number;
  };
  interpretive_note: string;
};
```

---

## 4. MEF as generative system, not interpretive garnish

The MEF system has 12 lenses and 6 positions per lens:

```text
12 × 6 = 72
```

This is the reading manifold. It also matches the musical 12-lens chromatic structure and the full Parashakti decanic `36 × 2` hint.

### 4.1 Lens table

The working MEF lens table, following `epi_logos_coordinate_system.md`, is:

| Lens | Name | Native analysis type | Native element |
|---|---|---|---|
| `L0` | Quaternal | question, inquiry, QL as epistemic act | Aether |
| `L1` | Causal | causes, will, material/efficient/formal/final cause | Earth |
| `L2` | Logical | tetralemma, truth-status, contradiction, neither/silence | Air |
| `L3` | Processual | concrescence, becoming, process, satisfaction | Water |
| `L4` | Phenomenological | lived experience, Dasein, care, world-disclosure | Earth |
| `L5` | Para Vāk | levels of speech, articulation of consciousness | Aether |
| `L0′` | Archetypal-Numerical | number as psychoid archetype | Aether |
| `L1′` | Phenomenal / Jungian | introversion, sensation, feeling, thinking, intuition, extroversion | Water |
| `L2′` | Alchemical-Elemental | aether, earth, water, air, fire, mineral | Aether |
| `L3′` | Chronological | history, seasonality, cycles, Spirit through time | Fire |
| `L4′` | Scientific | observe, think, plan, build, execute, verify | Earth |
| `L5′` | Divine Logos | Arche, Apokalypsis, Dynamis, Sophia, Parousia, Epi-Logos | Aether |

### 4.2 The three lens-squares

MEF does not merely consist of 12 isolated lenses. It is organised into three Klein V4 squares.

#### Square A — Speech / Number / Articulation

```text
L0  Quaternal  ——————————— L5  Para Vāk
 |                                  |
L5′ Divine Logos ————————— L0′ Archetypal-Numerical
```

Use Square A for:

- name, number, word, mantra, mythic identity;
- Pythagorean derivations;
- QL music scale names and chromatic anchors;
- symbolic language and speech-events;
- archetypal numerology;
- received names.

#### Square B — Cause / Experience / Experiment / Psyche

```text
L1  Causal ————————————— L4  Phenomenological
 |                                  |
L4′ Scientific ————————— L1′ Phenomenal / Jungian
```

Use Square B for:

- causal powers and drives;
- lived experience and embodiment;
- questionnaire data and empirical scoring;
- Jungian function typology;
- Human Design as lived experiment;
- validation, verification, and best-fit correction.

#### Square C — Logic / Process / Chronology / Alchemy

```text
L2  Logical ———————————— L3  Processual
 |                                  |
L3′ Chronological ——————— L2′ Alchemical-Elemental
```

Use Square C for:

- transformation and becoming;
- shadow/gift/siddhi dynamics;
- seasonality and temporal unfolding;
- decanic cycles;
- elemental extraction;
- alchemical translation into the Nara quaternion.

Square C is the most direct route into the elemental output because it contains `L2′`, the element-bearing lens. However, the whole MEF field contributes. L2′ is the output face, not the only lens that matters.

### 4.3 Internal position and proverse/inverse reading

For any internal P-position:

```text
Pφ = n mod 6
inverse(Pφ) = P(5 − φ)
```

The three internal axes are:

```text
P0 ↔ P5
P1 ↔ P4
P2 ↔ P3
```

This should be run inside the relevant lens. A `P4` hit is not abstractly “context” once MEF is online. It means different things depending on lens:

```text
L1·P4   = final cause / telos
L2·P4   = neither / void / ineffability
L2′·P4  = fire
L5·P4   = Vaikharī / articulate speech
L1′·P4  = intuition
L3′·P4  = winter
```

The same P-position becomes different realities through different lenses.

---

## 5. The `64 + 36` integration pointer

The project kernel’s standing identity includes:

```text
64 + 36 = 100% = (4/3)^2 = 16/9
```

This becomes highly relevant for the M4-0 branch.

The emerging integrations are:

```text
36 decans             → M4-0-1 Parashakti decanic astrology
64 Gene Keys          → M4-0-3 Mahāmāyā 64-code bridge
64 Human Design gates → M4-0-4 BodyGraph / I Ching mechanics
36 Human Design channels → M4-0-4 BodyGraph channels
```

This gives several structural resonances:

1. **Parashakti decans + Mahāmāyā keys** form a natural `36 + 64` bridge.
2. **Human Design** also has `64 Gates` and `36 Channels`, making it a second external system that already carries the same cardinalities.
3. The decanic `36 × 2 = 72` hint matches the MEF `12 × 6 = 72` manifold.
4. Gene Keys and Human Design both operate through the I Ching/64-code space, giving a clean integration path into the Mahāmāyā subsystem.
5. QL Music’s 12 lens-derived scales and 6-position internal structure give the musical correlative to the same 72-fold field.

This file does not claim to finalise the Parashakti or Mahāmāyā mappings. It marks the integration pathway so sessions with those subsystem contexts can lock the canonical ordering.

---

# M4-0-1 — Decanic Astrology / Parashakti Chart Layer

## 6. Layer identity

**Layer ID:** `M4-0-1`  
**Working name:** `Decanic Astrology / Parashakti Chart`  
**Primary input:** birth date, exact birth time, birth location  
**Optional input:** received-name date, relocation chart, progressed/transit context  
**Primary artifact:** decanic birth chart, preferably `36 × 2` Parashakti-addressed  
**Primary MEF square:** Square C, with Square B and Square A support  
**Primary output:** elemental quaternion contribution from decanic planetary-chakral birth field

This layer must not be reduced to ordinary sun-sign astrology. The astrological layer in Nara is specifically the **decanic system**, with more granular expression than sign-only astrology. Public astrology gives 36 decans as 12 signs subdivided into three ten-degree regions. The Nara/Parashakti integration appears to require a doubled `36 × 2` form, yielding 72 positions, which is structurally congruent with the `12 × 6` MEF manifold.

The working formulation:

> `M4-0-1` reads the birth event as a decanic Parashakti field: planetary placements become decan-coordinates, decan-coordinates enter a 36×2 structure, and the embedded planetary/chakral system translates the chart into elemental and bioquaternionic identity contributions.

## 7. Determinate computation

The computable side should include:

```ts
type DecanicAstrologyArtifact = {
  birth_data: {
    date: string;
    time: string;
    timezone: string;
    location: { latitude: number; longitude: number; place_name?: string };
    reliability: "exact" | "approximate" | "unknown_time";
  };

  planets: Array<{
    body: string;
    longitude_tropical?: number;
    longitude_sidereal?: number;
    sign: string;
    degree_in_sign: number;
    decan_index_within_sign: 0 | 1 | 2;
    decan_global_index: number; // 0..35
    decan_face?: "bimba" | "pratibimba" | string;
    house?: number;
    retrograde?: boolean;
    sign_ruler?: string;
    decan_ruler?: string;
    parashakti_chakra?: string;
    parashakti_planetary_node?: string;
  }>;

  angles?: {
    ascendant?: Placement;
    midheaven?: Placement;
    descendant?: Placement;
    ic?: Placement;
  };

  aspects?: Aspect[];
  house_system?: string;
  zodiac_type?: "tropical" | "sidereal" | "project_specific";

  decan_distribution: Record<number, number>;
  sign_element_distribution: ElementScores;
  planetary_chakra_distribution?: Record<string, number>;
  parashakti_matrix?: number[][];
};
```

A provisional decan index:

```text
sign_index = Aries 0, Taurus 1, ..., Pisces 11
within_sign_decan = floor(degree_in_sign / 10)  // 0, 1, 2
decan_global_index = sign_index * 3 + within_sign_decan  // 0..35
```

The `36 × 2` face should **not** be improvised if the Parashakti subsystem is loaded. Use the canonical Parashakti ordering. If it is not loaded, two provisional approaches are possible:

### Option A — Direct 72-index row-major MEF addressing

```text
face_index = 0 for bimba, 1 for pratibimba
mef72_index = decan_global_index + 36 * face_index
lens_index = mef72_index mod 12
position_index = floor(mef72_index / 12)  // 0..5
```

This maps the full 72 decanic field into the MEF `12 × 6` matrix.

### Option B — Decan as 36-cell Square-C field, face as bimba/pratibimba overlay

```text
decan_global_index → 36-cell internal Parashakti matrix
face → bimba/pratibimba overlay
MEF lens selected by planet/chakra/sign/decan ruler
```

This preserves more freedom for the Parashakti system to determine its own ordering.

### Development preference

Prefer canonical Parashakti ordering if available. If not, use Option A as a temporary implementation because it gives a transparent `36 × 2 = 72 = 12 × 6` bridge.

## 8. Parashakti integration pointers

The user context indicates that this layer belongs to a **Parashakti system** that:

- operates as a `36 × 2` decanic system;
- has a planetary system embedded in it;
- aligns with the project’s chakral system;
- precedes or supports Mahāmāyā and Nara;
- likely provides a more native planetary-chakral mapping than standard Western astrology.

Therefore `M4-0-1` should not hard-code a generic planet-to-chakra table except as a fallback. The implementation should define an interface:

```ts
type ParashaktiResolver = {
  resolveDecan(decan_global_index: number, face?: string): ParashaktiDecanNode;
  resolvePlanet(body: string): ParashaktiPlanetNode;
  resolveChakra(body_or_decan: string): ChakraNode;
  resolveElement(node: ParashaktiDecanNode | ParashaktiPlanetNode | ChakraNode): ElementContribution;
};
```

A future session with Parashakti context should fill:

```text
36 decanic powers
2 faces / polarities / helices
planetary correspondences
chakra correspondences
elemental correspondences
musical correspondences
```

## 9. MEF reading mode

This layer should be read primarily through Square C:

```text
L3′ Chronological        → birth moment, seasonal/decanic timing, cycle
L2′ Alchemical-Elemental → elemental extraction
L3 Processual            → planetary dynamics as becoming
L2 Logical               → oppositions, aspects, contradiction, neither/both
```

But Square B and Square A are also essential:

```text
L1 Causal           → planets as causal powers / drives
L4 Phenomenological → houses and lived fields of experience
L0′ Numerical       → 12 signs, 36 decans, 72 doubled decans
L5/L5′ Speech/Logos → chart as cosmic grammar or natal word-pattern
```

The reading should avoid generic horoscope language. Its task is to discover what the decanic-Parashakti matrix lights in the MEF field.

## 10. Elemental extraction

The layer should combine several elemental channels.

### 10.1 Sign element

Each placement inherits its sign element:

```text
Fire signs  → Fire
Earth signs → Earth
Air signs   → Air
Water signs → Water
```

This is a baseline only. It should not dominate the Parashakti decanic layer.

### 10.2 Decan element or decan power

If the Parashakti decan has its own element, use that. This is more important than generic sign element.

```text
planet in decan D
→ Parashakti decan node
→ decan element contribution
```

### 10.3 Planetary-chakral element

If the Parashakti system maps planets to chakral powers, that mapping should produce a second element contribution:

```text
planetary body
→ Parashakti planet node
→ chakra node
→ element / cap contribution
```

This is the bridge to the Human Design center/chakra layer later.

### 10.4 MEF coordinate element

If a placement is mapped to a MEF cell:

```text
Lχ·Pφ
```

then `Pφ` can project through `L2′`:

```text
P0 → Aether cap
P1 → Earth
P2 → Water
P3 → Air
P4 → Fire
P5 → Mineral cap
```

This must be treated as a **MEF-projection element**, not necessarily the same as the astrological sign element.

### 10.5 Planetary weighting

A first-pass weighting suggestion:

| Factor | Suggested weight |
|---|---:|
| Ascendant / chart gateway | 6 |
| Sun | 5 |
| Moon | 5 |
| Chart ruler | 4 |
| Personal planets | 3 |
| Social planets | 3 |
| Outer planets | 2 |
| Angular placement | ×1.25 |
| Tight aspect | relational modifier |
| Decan exactness / planet near decan boundary | uncertainty modifier |

If the Parashakti system has its own planetary hierarchy, use that instead.

## 11. Layer output preference

`M4-0-1` should emit:

```text
q_astrology_decanic
parashakti_decanic_matrix
planetary_chakral_distribution
strongest decanic powers
strongest MEF cells
strongest lens-squares
birth-time reliability notes
QL Music scale/mode candidates
```

The decanic layer is probably the most important companion to `M4-0-0` because it is also birth-data-derived and can therefore generate the core Nara quaternion with no additional questionnaire or imported profile.

---

# M4-0-2 — Jungian 16-Personality / Phenomenal Type Layer

## 12. Layer identity

**Layer ID:** `M4-0-2`  
**Working name:** `Jungian 16-Personality / Phenomenal Type`  
**Primary input:** questionnaire, declared best-fit type, or conversational type assessment  
**Primary artifact:** type code, preference strengths, possible cognitive-function stack  
**Primary MEF lens:** `L1′ Phenomenal / Jungian`  
**Primary MEF square:** Square B  
**Primary output:** psychic-function elemental correction layer

This layer is not birth-derived. It is self-report or assessment-derived. It should therefore be interpreted differently from astrology, Gene Keys, and Human Design. It is not the imprint field. It is the **current/lived psychic-orientation field**.

The public 16-personality/MBTI frame uses four preference pairs:

```text
Extraversion / Introversion
Sensing / Intuition
Thinking / Feeling
Judging / Perceiving
```

These produce 16 type codes. Nara should support both official MBTI-like type dynamics and 16Personalities/NERIS-style aspect scoring, but should not pretend they are identical.

## 13. Determinate computation

The computable side may be:

```ts
type Jungian16Artifact = {
  mode: "mbti_like" | "jungian_function_stack" | "16personalities_neris" | "self_declared";

  type_code?: string; // e.g. INFJ, ENTP, ISFP

  preferences?: {
    extraversion_introversion: number; // -1 inward, +1 outward
    sensing_intuition: number;         // -1 sensing, +1 intuition
    thinking_feeling: number;          // -1 thinking, +1 feeling, or explicit polarity scale
    judging_perceiving: number;        // -1 perceiving/open, +1 judging/closure
  };

  function_stack?: Array<{
    function_name: "Se" | "Si" | "Ne" | "Ni" | "Te" | "Ti" | "Fe" | "Fi";
    stack_position: "dominant" | "auxiliary" | "tertiary" | "inferior" | "shadow";
    confidence: number;
  }>;

  questionnaire_scores?: Record<string, number>;
  best_fit_verified?: boolean;
  ambiguity_notes?: string[];
};
```

## 14. Native MEF integration

This layer has the cleanest direct MEF correspondence because `L1′` already contains Jungian/phenomenal positions:

```text
L1′·P0 = Introversion
L1′·P1 = Sensation
L1′·P2 = Feeling
L1′·P3 = Thinking
L1′·P4 = Intuition
L1′·P5 = Extroversion
```

This gives a direct bridge into the element-bearing `L2′` positions:

| Jungian / L1′ position | L2′ projection | Nara role |
|---|---|---|
| Introversion / P0 | Aether | inward source orientation |
| Sensation / P1 | Earth | embodiment, concreteness, perception of fact |
| Feeling / P2 | Water | valuation, relation, affective intelligence |
| Thinking / P3 | Air | structure, analysis, conceptual distinction |
| Intuition / P4 | Fire | possibility, pattern-flash, future, symbolic ignition |
| Extroversion / P5 | Mineral | outward crystallisation / expression cap |

This should be the primary extraction method.

## 15. Square B reading

This layer should run through Square B:

```text
L1  Causal           → what drives behaviour?
L4  Phenomenological → how is it lived?
L4′ Scientific       → what did the questionnaire actually show?
L1′ Jungian          → what psychic function pattern is active?
```

This prevents naive typing. A user may score as one type but narrate themselves as another; the LLM should preserve that as meaningful tension.

Examples:

```text
High questionnaire Thinking but narrative Feeling concern
→ Air/Water tension
→ Square B evidence conflict
→ possible compensation, professional mask, or developmental movement
```

```text
Declared INFJ but weak preference scores
→ low type-certainty
→ strong L4 phenomenological interview needed
→ lower q-layer confidence
```

## 16. Determinate vs LLM responsibilities

Determinate:

```text
questionnaire scoring
type code
preference strengths
function-stack calculation if chosen
confidence/ambiguity flags
```

LLM / MEF:

```text
best-fit verification
shadow/inferior-function reading
compensation vectors
how current psychic orientation confirms or corrects birth-derived layers
Square B synthesis
```

The system should not treat this layer as clinical diagnosis. It is a typological self-orientation layer.

## 17. Elemental output

`M4-0-2` should output:

```text
q_jungian16
introversion_aether_gate
extroversion_mineral_cap
dominant function element
auxiliary support element
inferior shadow element
current-development vector
questionnaire confidence
```

A function-stack example:

```text
INFJ-style stack:
Ni → Fire dominant
Fe → Water auxiliary
Ti → Air tertiary
Se → Earth inferior/shadow
Introversion → Aether gate
```

A 16Personalities-style aspect example:

```text
I/N/F/J with high Turbulent score:
Introversion → Aether gate
Intuition → Fire
Feeling → Water
Judging → Mineralising/closure modifier
Turbulence → instability / feedback sensitivity modifier, not a classical element
```

---

# M4-0-3 — Gene Keys / Mahāmāyā 64-Code Bridge Layer

## 18. Layer identity

**Layer ID:** `M4-0-3`  
**Working name:** `Gene Keys / Mahāmāyā 64-Code Bridge`  
**Primary input:** imported Gene Keys profile or computed profile from birth data  
**Primary artifact:** Hologenetic Profile: spheres, keys, lines, sequences, frequency bands  
**Primary MEF square:** Square C, with Square A support  
**Primary output:** contemplative transmutation quaternion; bridge into Mahāmāyā 64-code system

This layer is a natural bridge to the prior Mahāmāyā subsystem because the Gene Keys operate through a 64-fold key structure linked publicly to the I Ching, genetics/codon rings, Human Design, and astrology. The user context indicates that Mahāmāyā already contains a genetic code–I Ching–tarot system. Therefore Gene Keys should be treated as an external established system that can dock into Mahāmāyā’s internal 64-code machinery.

The working formulation:

> `M4-0-3` reads the identity-field as a 64-code contemplative transmutation profile. Its core movement is Shadow → Gift → Siddhi, interpreted through Square C and translated into Nara’s elemental quaternion through Mahāmāyā and L2′.

## 19. Determinate computation

There are two implementation pathways.

### 19.1 MVP import path

The user provides or imports the profile:

```ts
type GeneKeysProfileImport = {
  spheres: Array<{
    sphere_name: string;
    sequence: "activation" | "venus" | "pearl" | string;
    gene_key: number; // 1..64
    line: number;     // 1..6
    shadow_label?: string;
    gift_label?: string;
    siddhi_label?: string;
    codon_ring?: string;
    programming_partner?: number;
  }>;
};
```

This is the safest initial path because official interpretive text may be copyrighted/proprietary. The Nara system can use IDs, lines, and user-provided labels, then perform its own QL/MEF reading.

### 19.2 Full computation path

The system computes the profile from birth data using:

```text
birth planetary coordinates
pre-natal/design coordinates roughly 88 days before birth / 88 solar degrees prior
zodiacal I Ching wheel
Gene Key / line assignment
sphere construction
```

This path requires exact calculation logic and validation. It is likely adjacent to Human Design computation because both use 64-gate/key zodiacal mappings and design/pre-natal layers.

## 20. Public-system structure to preserve

The layer should preserve the public Gene Keys structure:

```text
64 Gene Keys
11 Hologenetic Profile spheres
Activation Sequence
Venus Sequence
Pearl Sequence
Shadow / Gift / Siddhi frequency bands
lines 1-6
codon rings
programming partners
I Ching / astrology / Human Design / genetics correspondences
```

Do not flatten the profile into a single key. Repetitions matter. Sphere position matters. Frequency band matters. Sequence matters.

## 21. Mahāmāyā integration pointer

When Mahāmāyā context is loaded, `M4-0-3` should route each Gene Key through the internal 64-code system:

```text
Gene Key number
→ I Ching hexagram
→ genetic/codon correspondence
→ Mahāmāyā tarot correspondence
→ QL/MEF coordinate
→ elemental contribution
```

This file does not define the Mahāmāyā mapping. It marks the interface:

```ts
type Mahamaya64Resolver = {
  resolveGeneKey(key: number): Mahamaya64Node;
  resolveHexagram(hexagram: number): Mahamaya64Node;
  resolveCodon(codon: string): MahamayaCodonNode;
  resolveTarot(key_or_hexagram: number): MahamayaTarotNode;
  resolveElement(node: Mahamaya64Node): ElementContribution;
  resolveMefCoordinate(node: Mahamaya64Node): { lens: string; position: string };
};
```

Important structural pointer:

```text
M4-0-1 Decans = 36
M4-0-3 Gene Keys / Mahāmāyā = 64
36 + 64 = 100% = 16/9
```

This is not merely numerological decoration. It may be a major bridge between Parashakti and Mahāmāyā within the wider QL architecture.

## 22. MEF reading mode

Gene Keys should be read primarily through Square C:

```text
L2 Logical        → Shadow as contradiction, distortion, false binary, stuck negation
L3 Processual     → Gift as active transformation and concrescence
L3′ Chronological → sequence/pathway unfolding over life
L2′ Alchemical    → transmutation into element and lapis-like result
```

Square A is also strong because Gene Keys are linguistic/archetypal transmissions:

```text
L0′ Archetypal-Numerical → 64 key structure, key number, line number
L5 Para Vāk             → spoken/received key language
L5′ Divine Logos         → Siddhi as high transmission / word beyond words
L0 Quaternal            → contemplation as inquiry
```

Square B may be invoked when reading how a key is lived:

```text
L4 Phenomenological → lived pattern of shadow/gift
L4′ Scientific      → profile calculation and reflective tracking
L1′ Jungian         → psychic function parallels
L1 Causal           → what drives the shadow pattern or gift expression
```

## 23. Elemental extraction

Multiple channels should contribute.

### 23.1 Key number as QL/MEF datum

For each key `k`:

```text
k mod 6  → internal P-position / inverse vector
k mod 12 → MEF lens / chromatic anchor
```

This is the same mathematical gateway as `M4-0-0`, but the content is different because the external system is now Gene Keys/Mahāmāyā.

### 23.2 Line as sixfold modifier

A provisional line-to-position mapping:

| Line | Provisional QL/Mahāmāyā tendency | Element projection |
|---|---|---|
| 1 | foundation, investigation, base | Earth |
| 2 | naturalness, relational resonance, call | Water |
| 3 | trial, mutation, adaptive discovery | Air |
| 4 | network, influence, externalisation | Fire |
| 5 | projection, impact, crystallisation | Mineral cap |
| 6 | return, roof, role-model, post-cycle view | Aether cap |

This should be calibrated against Mahāmāyā and Gene Keys line theory. It is a working proposal, not a hard rule.

### 23.3 Frequency band as transmutation state

```text
Shadow → distorted / contracted / deficient element
Gift   → integrated / functional / expressive element
Siddhi → transfigured element through Aether cap
```

The same key may therefore emit multiple elemental layers:

```text
shadow_element
→ gift_element
→ siddhi_element
```

This makes Gene Keys a **processual transmutation layer**, not a static typology.

### 23.4 Sphere role as contextual weighting

A provisional sphere weighting:

| Sphere type | Elemental tendency | Notes |
|---|---|---|
| Life’s Work / Brand | Fire | external expression, radiance, visible work |
| Evolution | Earth | friction, challenge, maturation, embodiment |
| Radiance | Water | vitality, health, flow, life-force |
| Purpose | Aether/Earth | hidden root, unconscious nourishment, embodied ground |
| Attraction | Water | relational magnetism |
| IQ | Air | mental patterning |
| EQ | Water | emotional defense/opening |
| SQ | Aether/Water | subtle heart memory |
| Core / Vocation | Earth/Mineral | wound crystallised into vocation |
| Culture | Air/Earth | collective/social fit |
| Pearl | Mineral/Aether | prosperity as crystallised gift/grace |

Use this as a preference table only. The actual key, line, sequence, repetition, and Mahāmāyā mapping should override naive role assignment.

## 24. Determinate vs LLM responsibilities

Determinate:

```text
profile spheres
key numbers
lines
sequences
frequency labels if supplied/imported
codon rings/programming partners if supplied
mod6/mod12 coordinates
Mahāmāyā resolver outputs if available
```

LLM / MEF:

```text
contemplative reading of Shadow → Gift → Siddhi
cross-sphere resonance
repetition significance
programming partner polarity
which elements are contracted, gifted, or transfigured
how the profile modifies q_core
```

The LLM should not reproduce long copyrighted Gene Keys text. It should use short labels and generate Nara-native QL/MEF readings.

## 25. Layer output preference

`M4-0-3` should emit:

```text
q_gene_keys
shadow_element_map
gift_element_map
siddhi_horizon_map
mahamaya_64_bridge_map
codon/tarot/i_ching pointers
sequence dominance
Square C transformation narrative
repetition and programming-partner evidence paths
```

This layer is probably the richest contemplative layer. It should be allowed to produce depth, contradiction, and process rather than being compressed into a single element.

---

# M4-0-4 — Human Design / BodyGraph-Chakra Mechanics Layer

## 26. Layer identity

**Layer ID:** `M4-0-4`  
**Working name:** `Human Design / BodyGraph-Chakra Mechanics`  
**Primary input:** birth date, exact birth time, birth location  
**Primary artifact:** BodyGraph: type, strategy, authority, centers, channels, gates, profile, definition  
**Primary MEF square:** Square B, with Square C and Square A support  
**Primary output:** energy-body mechanics quaternion; bridge into Parashakti chakral and Mahāmāyā 64-code systems

Human Design is not the same kind of layer as Gene Keys. Gene Keys is contemplative transmutation. Human Design is mechanical energy-body configuration.

The working formulation:

> `M4-0-4` reads the birth event as a BodyGraph mechanics field: what is defined, open, conditioned, authoritative, and reliable in the energy-body. It then translates centers, channels, gates, authority, and Personality/Design polarity through Parashakti chakra logic, Mahāmāyā 64-code logic, and MEF.

## 27. Determinate computation

A Human Design artifact should include:

```ts
type HumanDesignArtifact = {
  birth_data: BirthData;

  type: "Manifestor" | "Generator" | "Manifesting Generator" | "Projector" | "Reflector";
  strategy: string;
  authority: string;
  profile: string;       // e.g. 2/4, 5/1
  definition: string;    // single, split, triple split, quad split, none
  incarnation_cross?: string;

  centers: Array<{
    center_name: string;
    state: "defined" | "undefined" | "open";
    connected_channels: string[];
    activated_gates: number[];
    parashakti_chakra?: string;
  }>;

  channels: Array<{
    channel_id: string;
    gates: [number, number];
    defined: boolean;
    centers: [string, string];
  }>;

  gates: Array<{
    gate: number;     // 1..64
    line: number;     // 1..6
    planet: string;
    side: "personality" | "design";
    center: string;
    active_or_dormant?: "active" | "dormant";
  }>;

  variables?: Record<string, unknown>;
};
```

The system should support two paths:

1. **Import path:** user provides chart data from a trusted calculator.
2. **Compute path:** system computes from birth data using ephemeris + Rave Mandala mapping.

The compute path should be carefully validated because small birth-time differences can alter gates, lines, profile, authority, or definition.

## 28. Public-system structure to preserve

Human Design should preserve:

```text
nine Centers
36 Channels
64 Gates / Hexagrams
Type
Strategy
Authority
Profile
Definition
Personality / conscious layer
Design / unconscious body layer, calculated before birth
Incarnation Cross
open/undefined vs defined centers
```

This layer is especially useful because it already bridges:

```text
chakra/body-center logic
64 I Ching gate logic
birth-data planetary calculation
body authority and conditioning
```

That makes it a natural meeting point for Parashakti and Mahāmāyā.

## 29. Parashakti chakra integration pointer

The BodyGraph’s centers should not be forced into a generic chakra model if the Parashakti system has a canonical chakra map.

Define an interface:

```ts
type ParashaktiChakraResolver = {
  resolveBodyGraphCenter(center_name: string): ChakraNode;
  resolveCenterElement(center_name: string): ElementContribution;
  resolveCenterPlanetaryNode(center_name: string): ParashaktiPlanetNode | null;
  resolveAuthorityElement(authority: string): ElementContribution;
};
```

This allows future Parashakti sessions to answer:

```text
Which Parashakti chakra corresponds to each Human Design center?
Which planet or śakti power rules it?
How does open/defined status change the element contribution?
How does Authority map into the chakral decision-body?
```

## 30. Mahāmāyā 64-code integration pointer

Human Design gates should route into the Mahāmāyā 64-code system:

```text
Human Design gate
→ I Ching hexagram
→ Gene Key correspondence
→ Mahāmāyā genetic code / tarot correspondence
→ QL/MEF coordinate
→ elemental contribution
```

This is the same 64-code space as Gene Keys but used differently.

```text
Gene Keys  → contemplative transmutation of 64 keys
Human Design → mechanical activation of 64 gates in BodyGraph
Mahāmāyā   → project-native 64-code synthesis, including genetic code/I Ching/tarot
```

The output should preserve the distinction between a key contemplated and a gate mechanically activated.

## 31. MEF reading mode

Human Design should run primarily through Square B:

```text
L1  Causal           → mechanics, strategy, authority, definition
L4  Phenomenological → how definition/open centers are lived
L4′ Scientific       → experiment, verification, “test your strategy and authority”
L1′ Jungian          → psychic/phenomenal analogues of center dynamics
```

Square C matters because Human Design is also a process of deconditioning:

```text
L2 Logical        → not-self patterns, contradiction, false self-conclusions
L3 Processual     → deconditioning as lived process
L3′ Chronological → development over time, transits, cycles
L2′ Alchemical    → elemental extraction and body-transmutation
```

Square A matters because gates and incarnation crosses are named symbolic structures:

```text
L0′ Numerical       → 64 gates, 36 channels, profile lines
L5/L5′ Speech/Logos → named cross, life-theme language, gate keynotes
```

## 32. Elemental extraction

A practical extraction should combine several channels.

### 32.1 Type as gross energy mode

Suggested first-pass tendencies:

| Type | Elemental tendency | Notes |
|---|---|---|
| Manifestor | Fire | initiation, impact, ignition |
| Generator | Earth/Fire | sacral generativity, sustainable work, embodied response |
| Manifesting Generator | Fire/Earth/Air | rapid multi-vector generativity, action + adaptation |
| Projector | Air | seeing, guiding, system-reading, recognition |
| Reflector | Water/Aether | openness, lunar sampling, environmental reflection |

This is a gross weighting only. Authority, centers, gates, and channels should dominate the detailed reading.

### 32.2 Authority as decision-element

Suggested first-pass tendencies:

| Authority | Elemental tendency |
|---|---|
| Emotional / Solar Plexus | Water |
| Sacral | Earth/Fire |
| Splenic | Earth/Air |
| Ego / Heart | Fire/Earth |
| Self / G | Aether/Fire |
| Mental / Environmental | Air |
| Lunar | Water/Aether |

Authority should be important because it governs how the body decides.

### 32.3 Centers as defined/open element fields

Use the Parashakti chakra resolver if available. As a fallback only:

| Center | Provisional tendency |
|---|---|
| Head | Aether/Air |
| Ajna | Air |
| Throat | Air/Fire |
| G / Identity | Aether/Fire |
| Heart / Ego | Fire/Earth |
| Spleen | Earth/Air |
| Solar Plexus | Water |
| Sacral | Earth/Fire/Water |
| Root | Earth/Fire |

Defined centers contribute stable/fixed element. Open or undefined centers contribute conditioning/receptivity vectors, not simple absence.

```text
defined Solar Plexus → stable Water decision/emotional wave
open Solar Plexus    → Water as conditioning/receptivity/amplification field
```

### 32.4 Gates and lines as 64-code data

Each gate should be read through:

```text
gate number mod6
gate number mod12
line number
planet activation
side: Personality or Design
center
channel relation
Mahāmāyā resolver
```

### 32.5 Personality / Design as bimba/pratibimba polarity

Human Design has a native two-layer structure:

```text
Personality / conscious / black
Design / unconscious body / red
```

This is a natural candidate for bimba/pratibimba mapping, but the exact direction should remain project-configurable:

```ts
type HumanDesignBimbaMapping =
  | { personality: "bimba"; design: "pratibimba" }
  | { personality: "pratibimba"; design: "bimba" };
```

The important thing is that the dual imprint should be preserved as a bimba/pratibimba-like polarity, not collapsed.

## 33. Determinate vs LLM responsibilities

Determinate:

```text
BodyGraph calculation/import
Type
Strategy
Authority
Profile
Definition
Centers
Gates
Channels
Personality/Design activations
```

LLM / MEF:

```text
conditioning analysis
open/defined center interpretation
Strategy/Authority as lived experiment
Parashakti chakra translation
Mahāmāyā gate translation
MEF square synthesis
how the layer modifies q_core
```

## 34. Layer output preference

`M4-0-4` should emit:

```text
q_human_design
type_element
authority_element
center_element_map
defined_center_stability_map
open_center_conditioning_map
gate_64code_map
Personality/Design bimba-pratibimba map
Parashakti chakra bridge
Mahāmāyā gate bridge
Square B mechanics narrative
```

This layer is especially good at identifying what is reliable versus what is conditioning-sensitive in the identity field.

---

# M4-0-5 — Identity Quintessence / Elemental Quaternion Integrator

## 35. Layer identity

**Layer ID:** `M4-0-5`  
**Working name:** `Identity Quintessence / Elemental Quaternion`  
**Primary input:** outputs of `M4-0-0` through `M4-0-4`  
**Minimum input:** `M4-0-0 Birthdate Encoding` + `M4-0-1 Decanic Astrology`  
**Primary artifact:** Nara elemental identity quaternion with evidence paths  
**Primary MEF mode:** all squares, with L2′ output face  
**Primary output:** `q_Nara`, caps, tensions, compensatory vectors, QL Music handoff

`M4-0-5` is the actual identity quintessence layer. It is where the branch becomes a bioquaternionic typification.

The integrator receives layer outputs:

```text
q_birthdate_encoding
q_decanic_astrology
q_jungian16
q_gene_keys
q_human_design
```

and produces:

```text
q_Nara_core      // required: M4-0-0 + M4-0-1
q_Nara_extended  // optional: all available layers
```

## 36. Integration principle

Do not average too early. Do not make each layer equal by default. Do not collapse contradictions.

Each layer contributes:

```text
q_layer
caps
R_total
confidence
evidence_paths
```

The integrator should compute:

```text
weighted_element_score[element]
resonance_bonus[element]
conflict_penalty_or_tension[element]
source_diversity[element]
evidence_density[element]
```

A base formula:

```text
element_score(E) = Σ layer_weight(L) × confidence(L) × q_L(E) × resonance_bonus(E,L)
```

But this should be treated as a computational scaffold, not the whole reading.

## 37. Suggested layer weights

A first-pass configurable weighting model:

| Layer | Role | Suggested base weight |
|---|---|---:|
| `M4-0-0 Birthdate Encoding` | name/date numerical identity seed | 0.25 |
| `M4-0-1 Decanic Astrology` | birth-event Parashakti field | 0.35 |
| `M4-0-2 Jungian 16` | self-report psychic orientation | 0.15 |
| `M4-0-3 Gene Keys` | contemplative 64-code transmutation | 0.20 |
| `M4-0-4 Human Design` | energy-body mechanics | 0.25 |

These should not simply sum to 1 globally because layers may be absent. Normalize available layers after applying reliability and user-desire modifiers.

Core mode:

```text
q_core = normalize(0.40 * q_M4-0-0 + 0.60 * q_M4-0-1)
```

Expanded mode:

```text
q_extended = normalize(
  core_weight * q_core
  + w2 * q_M4-0-2
  + w3 * q_M4-0-3
  + w4 * q_M4-0-4
)
```

Where:

```text
core_weight might range 0.45-0.70 depending desired primacy of birth-derived layers
```

## 38. Resonance bonuses

Increase weight when multiple layers converge through different evidence paths.

Examples:

```text
Water convergence:
- Moon/water decans in M4-0-1
- Feeling function in M4-0-2
- Venus/EQ water themes in M4-0-3
- Emotional Authority / Solar Plexus in M4-0-4
```

```text
Fire convergence:
- Fire decans / Mars-Sun emphasis in M4-0-1
- Intuition in M4-0-2
- Life’s Work / Brand expressive fire in M4-0-3
- Manifestor or Ego/Throat activation in M4-0-4
```

Convergence should increase confidence because multiple systems are lighting the same element through different mechanisms.

## 39. Tension preservation

Contradiction should not be treated as noise. It may be the identity’s actual structure.

Examples:

```text
Astrology Fire-heavy, Jungian Water-heavy
→ outward/incarnational fire with self-reported relational water
→ possible drive/sensitivity polarity
```

```text
Birthdate Encoding Earth/Mineral, Human Design Reflector/Water-Aether
→ name/date crystallisation with bodygraph openness
→ stable identity-signature carried through fluid embodiment
```

```text
Gene Keys shadow Air distortion, Astrology Water emphasis
→ mental contradiction around emotional field
→ Square C transformation vector from L2 to L3/L2′
```

The integrator should output **unresolved polarities** and **compensatory vectors**, not simply a smoothed average.

## 40. Aether and Mineral caps

Aether and Mineral should be preserved separately.

Aether rises when:

```text
P0 activations
Introversion / inward source orientation
Siddhi/transmission emphasis
Reflector/Lunar openness
Head/G/identity source fields
received-name or Logos/Speech square activations
```

Mineral rises when:

```text
P5 activations
Extroversion / outward manifestation cap
strong definition density
vocation/pearl/core wound crystallization
fixed modality / stable embodiment
alchemical lapis / L2′·P5 hits
```

The final output should include:

```ts
type NaraCaps = {
  aether_gate: number;
  mineral_cap: number;
  notes: string[];
};
```

## 41. Final output schema

```ts
type NaraIdentityQuintessence = {
  q_core: {
    earth: number;
    water: number;
    fire: number;
    air: number;
  };

  q_extended?: {
    earth: number;
    water: number;
    fire: number;
    air: number;
  };

  caps: {
    aether_gate: number;
    mineral_cap: number;
  };

  dominant_elements: string[];
  secondary_elements: string[];
  underlit_elements: string[];

  dominant_mef_squares: Array<"A" | "B" | "C">;
  dominant_mef_lenses: string[];
  dominant_internal_axes: Array<"0/5" | "1/4" | "2/3">;

  unresolved_polarities: string[];
  compensatory_vectors: string[];

  layer_contributions: Record<string, M4IdentityLayerOutput>;
  evidence_paths: EvidencePath[];

  ql_music_handoff: {
    primary_scale_candidates: string[];
    secondary_scale_candidates: string[];
    cf_mode_candidates: string[];
    motif_vectors: string[];
    elemental_timbre: Record<string, number>;
    cadence_logic: string[];
    chromatic_tension_sites: string[];
  };
};
```

## 42. Output style rule

The final user-facing reading should not end by burying the complexity in a low-detail capsule. It should instead present:

```text
1. quaternion result
2. evidence paths by element
3. cross-layer convergences
4. cross-layer tensions
5. Aether/Mineral caps
6. practical interpretive synthesis
7. QL Music handoff if requested
```

A bad output:

```text
You are mostly Water with some Fire.
```

A good output:

```text
Water leads in the extended quaternion, but through three distinct channels: lunar/decanic birth field, Feeling/relational psychic function, and emotional-body authority. Fire remains the visible expression vector through Life’s Work/Brand and planetary activation. Earth is not absent; it appears as the stabilising challenge and crystallisation vector. Air is underlit except in the Gene Keys mental-pattern sequence, making it a likely refinement path rather than a base authority.
```

The quaternion is the integration artifact. The reading is the traced resonance field.

---

## 43. Cross-layer interaction map

### 43.1 Birth data hook

The basic user data can generate multiple layers:

| Data | Layers |
|---|---|
| birth name | `M4-0-0` |
| received name + reception date | `M4-0-0` optional mythic-name layer |
| birth date | `M4-0-0`, `M4-0-1`, `M4-0-3`, `M4-0-4` |
| birth time | `M4-0-1`, `M4-0-3`, `M4-0-4` |
| birth location | `M4-0-1`, `M4-0-3`, `M4-0-4` |
| questionnaire | `M4-0-2` |
| imported Gene Keys profile | `M4-0-3` |
| imported Human Design chart | `M4-0-4` |

This makes the branch practical: from one birth packet, the system can compute the core and optionally expand.

### 43.2 Parashakti ↔ Human Design

Parashakti’s chakral-planetary system and Human Design’s BodyGraph centers are likely to interlock.

Development pathway:

```text
Human Design center
→ Parashakti chakra resolver
→ planetary/chakral power
→ element contribution
→ M4-0-5 quaternion
```

This should not be forced with generic chakra correspondences. Use subsystem-native Parashakti mappings when available.

### 43.3 Mahāmāyā ↔ Gene Keys ↔ Human Design

Gene Keys and Human Design both use 64-code structures tied to I Ching/hexagrams. Mahāmāyā already contains a project-native genetic code–I Ching–tarot system.

Development pathway:

```text
Gene Key number / Human Design Gate
→ Mahāmāyā 64-code resolver
→ I Ching / codon / tarot correspondence
→ MEF coordinate
→ element contribution
```

Gene Keys should emphasise contemplative frequency transformation. Human Design should emphasise mechanical activation/definition. Mahāmāyā can hold the shared 64-code semantic substrate.

### 43.4 Decans ↔ Gene Keys

The `36 + 64` integration is a major structural clue:

```text
M4-0-1 Parashakti decans = 36
M4-0-3 Mahāmāyā/Gene Keys = 64
36 + 64 = 100%
```

This may become one of the strongest formal bridges in the full Nara system.

Possible use:

```text
36 decanic powers supply the cosmic/temporal face.
64 keys supply the genetic/archetypal transformation face.
M4-0-5 integrates them as element quaternion.
QL Music renders their ratio as harmonic identity field.
```

### 43.5 Birthdate Encoding ↔ all layers

`M4-0-0` should remain the identity seed because it encodes names, dates, received names, and symbolic numerics. It is the layer closest to Nara as personal naming.

It can calibrate other layers by asking:

```text
Does the chart confirm the name/date elemental vector?
Does the Jungian self-report correct it?
Does Gene Keys transform it?
Does Human Design mechanise it?
```

---

## 44. Determinate and indeterminate functions

A key implementation distinction:

```text
Determinate functions compute artifacts.
Indeterminate functions enact MEF readings.
```

### 44.1 Determinate functions

Examples:

```text
Pythagorean name totals
birthdate totals
mod6/mod12 mapping
planetary positions
decan assignments
questionnaire scoring
Gene Key profile import/compute
Human Design BodyGraph import/compute
layer resonance matrix generation
normalization of element scores
```

These should be code, not LLM speculation.

### 44.2 Indeterminate / LLM-MEF functions

Examples:

```text
choosing which computed tensions matter most
best-fit type verification
reading a repeated Gene Key across spheres
interpreting an open Human Design center as conditioning rather than lack
identifying cross-layer convergence
preserving symbolic texture in final reading
choosing a QL Music handoff when several scales are available
```

The LLM should be constrained by computed evidence but allowed to enact the reading. It should not invent artifacts.

---

## 45. QL Music handoff across M4-0

The full harmonic theory is held elsewhere, especially in `ql-musical-derivation.md`. This branch should hand off the following:

```ts
type M4MusicHandoff = {
  dominant_elements: ElementScores;
  caps: { aether_gate: number; mineral_cap: number };
  dominant_mef_lenses: string[];
  dominant_mef_positions: string[];
  dominant_m4_layers: string[];
  chromatic_anchors: string[];
  lens_scale_candidates: string[];
  cf_mode_candidates: string[];
  motif_vectors: string[];
  bimba_pratibimba_tensions: string[];
  cadence_logic: string[];
  timbre_bias: Record<string, number>;
};
```

Music should be derived after the identity reading:

```text
M4-0 artifact field
→ MEF resonance
→ elemental quaternion
→ QL Music scale/mode/motif/timbre
```

Do not make music the initial mapping unless the user specifically requests a quick sonification.

---

## 46. Implementation phases

### Phase 1 — Base identity packet

Build a data intake object:

```ts
type NaraIdentityPacket = {
  legal_birth_name?: string;
  preferred_name?: string;
  received_names?: Array<{ name: string; date_received?: string }>;
  birth_date: string;
  birth_time?: string;
  birth_location?: string | { lat: number; lon: number };
  timezone?: string;
  user_declared_type?: string;
  imported_gene_keys_profile?: GeneKeysProfileImport;
  imported_human_design_chart?: HumanDesignArtifact;
};
```

### Phase 2 — Core computation

Implement:

```text
M4-0-0 Birthdate Encoding
M4-0-1 Decanic Astrology / Parashakti fallback
q_core = M4-0-0 + M4-0-1
```

### Phase 3 — Self-report psychic layer

Implement:

```text
M4-0-2 questionnaire / type import
L1′ direct function-to-element mapping
Square B evidence handling
```

### Phase 4 — 64-code bridge

Implement import-first:

```text
Gene Keys profile import
Mahāmāyā resolver interface
Shadow/Gift/Siddhi MEF interpretation
```

Then consider full computation.

### Phase 5 — BodyGraph bridge

Implement import-first:

```text
Human Design chart import
center/gate/channel element translation
Parashakti chakra resolver interface
Mahāmāyā gate resolver interface
```

Then consider full computation.

### Phase 6 — M4-0-5 integration

Build:

```text
q_core
q_extended
caps
cross-layer evidence paths
resonance bonuses
tension preservation
QL Music handoff
```

### Phase 7 — Rich user-facing reading

User-facing output should preserve texture:

```text
computed artifacts
MEF lens activations
element evidence paths
quaternion result
practical interpretation
music handoff if desired
```

---

## 47. Open design questions

These are intentionally left open for sessions with the relevant subsystem contexts.

### 47.1 Parashakti

```text
What is the canonical ordering of the 36×2 decanic matrix?
What are the two faces: bimba/pratibimba, day/night, explicit/implicit, or another polarity?
What planets belong to the embedded planetary system?
How exactly does the planetary system align to chakras?
What are the native elements of each decanic power?
How does the decanic system map to QL Music scale/mode derivation?
```

### 47.2 Mahāmāyā

```text
What is the canonical 64-code ordering?
How do genetic code, I Ching, and tarot map into the same 64 field?
Do the 64 Gene Keys map directly or through a transformation?
Do Human Design gates and Gene Keys share one Mahāmāyā node or two role-specific nodes?
How are tarot correspondences weighted: archetypal, elemental, decanic, processual?
```

### 47.3 Human Design

```text
Which BodyGraph center maps to which Parashakti chakra?
How are undefined/open centers represented elementally?
Should Personality be bimba and Design pratibimba, or the reverse?
How are channels weighted relative to gates and centers?
How does Authority override or modify type-level element?
```

### 47.4 M4-0-5

```text
What should the default layer weights be?
Should q_core retain primacy when optional layers strongly disagree?
How are Aether and Mineral caps rendered in user-facing typology?
How much of the MEF matrix should be exposed to users?
When should QL Music derive from q_core versus q_extended?
```

---

## 48. Closing formulation

The clean formulation for the whole branch is:

> `M4-0` derives human identity as an elemental/bioquaternionic field by passing multiple established identity systems through QL/MEF. `M4-0-0` gives the name/date numerical seed. `M4-0-1` gives the decanic Parashakti birth-field. `M4-0-2` gives the Jungian psychic-function correction. `M4-0-3` gives the Mahāmāyā 64-code contemplative transmutation via Gene Keys. `M4-0-4` gives the Human Design body-mechanics and center/gate activation field. `M4-0-5` integrates these into the Nara elemental quaternion, preserving evidence paths, tensions, caps, and QL Music handoff structures.

The branch should remain computationally practical:

```text
with only name + birth data → compute M4-0-0 and M4-0-1 core
with questionnaire → add M4-0-2
with Gene Keys profile → add M4-0-3
with Human Design chart → add M4-0-4
with all layers → produce full M4-0-5 identity quintessence
```

The final Nara output is not a personality label. It is a patterned elemental quaternion generated by multiple systems, read through MEF, and preserved as an evidence-rich identity field.
