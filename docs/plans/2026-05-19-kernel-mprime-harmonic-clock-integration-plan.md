# Kernel M' Harmonic Clock Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans before mutating runtime code from this plan.

**Goal:** Make the kernel, pointer web, M2 vibrational system, M3 DNA/I-Ching/Tarot clock, S3 deposition, and M' Tauri surface consume one shared harmonic-clock profile.

**Architecture:** Treat Paramasiva's tick as the harmonic clock. The tick projects through M1 integer/SU(2) dynamics, M2 72-fold vibration and planetary-chakral correspondences, M3 64-fold symbolic transcription, S2 pointer topology, S3 temporal/Graphiti deposition, and M' rendering. The shared `MathemeHarmonicProfile` is the contract that prevents these layers from inventing private interpretations.

**Tech Stack:** `portal-core` and `epi-kernel-contract` for typed kernel math; S2 `graph-services` for pointer law; S3 `gateway-contract` and `graphiti-runtime` for deposition; Tauri v2 React/Rust clients for M' surfaces; seed/spec docs in `Idea/Bimba/Seeds/M` and `Idea/Bimba/Seeds/S`.

---

## Core Correction

The harmonic clock is not a visual feature and not an audio feature. It is the operational address of the whole stack.

```text
absolute tick n
  -> tick12 / degree720 / SU(2) layer
  -> bimba-pratibimba harmonic state
  -> M2 72-fold vibration / MEF / solar-chakral correspondence
  -> M3 64-fold DNA-I-Ching-Tarot transcription
  -> S2 pointer-web coordinate law
  -> S3 DAY/NOW and Graphiti deposition
  -> M' lived instrument surface
```

So "binary" means the full Mahamaya symbolic transcription system:

- 64-bit matrix word;
- 64 DNA codons and 64 I-Ching hexagrams;
- 384 line-change operators;
- 2-bit nucleotide logic with DNA/RNA phase;
- 16 dinucleotide pair matrix;
- 56+8 resonance matrix, where the 8 gaps are evolutionary/provisional sites;
- 64->56 Tarot compression with retained shadow codons;
- 360/720 degree mythic synthesis wheel;
- M2->M3 epogdoon compression `72 * 8 / 9 = 64`.

## Unified Computational Path

### M1 / Paramasiva: Harmonic Clock Law

Paramasiva supplies the clock mathematics:

| Field | Computation | Meaning |
| --- | --- | --- |
| `cycle` | `floor(n / 12)` | completed 12-tick harmonic cycles |
| `tick12` | `n mod 12` | double-covered whole-tone address |
| `degree720` | `(tick12 * 60) mod 720` for coarse profile; later real degree may be finer | SU(2) double-cover address |
| `degree360` | `degree720 mod 360` | primary clock-wheel layer |
| `su2Layer` | `degree720 >= 360 ? shadow : primary` | daylight/shadow phase without collapse |
| `phase` | `tick12 < 6 ? bimba : pratibimba` | helix face |
| `position6` | `tick12 mod 6` | QL position |

M1 also supplies the 12x12 Ananda matrices and the digital-root rings that justify the 12-cycle and the 720-degree double return. The kernel hot path should remain integer-addressed wherever possible; floating values are explanatory/rendering outputs, not the authority.

### Harmonic / Musical Projection

The 12 chromatic positions are the operational pitch-class substrate:

```text
bimba_pc(position)      = (2 * position) mod 12
pratibimba_pc(position) = (2 * position + 1) mod 12
```

Every tick exposes:

- current note and pitch class;
- X/X' semitone partner;
- X+Y=5 mirror partner;
- square mirror span: Sq3 = 1 whole-tone, Sq2 = 3 whole-tones, Sq1 = 5 whole-tones plus absent +1 closure;
- ratio role: `1/1`, `9/8`, `4/3`, `3/2`, `16/9`, or `2/1`;
- 8+4 rendering role: sounded inner position or nodal boundary condition.

The diatonic layer is a second projection through the same chromatic field, not a replacement for it. For Lens 0:

| Degree | Note | Helix position | CF | Function | Harmonic role |
| --- | --- | --- | --- | --- | --- |
| 1 | C | `0` | `(00/00)` | Nous / Para Vak | tonic ground |
| 2 | D | `1` | `(0/1)` | Logos / nomos | first epogdoon articulation |
| 3 | E | `2` | `(0/1/2)` | Eros / chreia | triadic circulation |
| 4 | F | `2'` | `(0/1/2/3)` | Mythos / Pashyanti | perfect-fourth lower tetrachord closure |
| 5 | G | `3'` | `(4.0/1-4.4/5)` | Anima/Psyche / oikonomia | perfect-fifth executive crossing |
| 6 | A | `4'` | `(4.5/0)` | Psyche bridge | upper-tetrachord stewardship |
| 7 | B | `5'` | `(5/0)` | Sophia / Spanda-Shakti | leading-tone return |
| 8 | C' | `0` next octave | `(00/00)` enriched | Nous / Para Vak | octave return |

### M2 / Parashakti: MEF, Elements, Planetary-Chakral Scales

M2 supplies the 72-fold vibrational register:

```text
12 MEF lenses * 6 positions = 72
36 decans * 2 SU(2) phases = 72
4 elements * 3 signs * 3 decans * 2 phases = 72
8 choirs * 9 names = 72
```

The profile must expose both resonance index encodings:

```text
legacy_resonance_index = lens0to5 * 12 + helix_bit * 6 + position
lens_anchor_index      = lens_anchor0to11 * 6 + position
```

The profile must also distinguish two elemental projections:

| Projection | Use |
| --- | --- |
| P-position element | semantic/QL orientation of the position |
| L2' element-bearing value | alchemical/cymatic rendering material |

Planetary-chakral-musical alignment is part of M2/M' rendering, not decorative metadata. Initial canonical alignment:

| Body / Center | Chakra role | Element | Musical role | Default modal/scale color |
| --- | --- | --- | --- | --- |
| Earth | Muladhara / grounding center | Earth | `1/1` tonic | Rast / stable tonic ground |
| Venus | Svadhisthana / generative water | Water | `9/8` epogdoon pulse | Bayati / living difference |
| Mars | Manipura / active fire | Fire | `5/4` or major-third fire articulation | Hijaz / charged action |
| Jupiter | Anahata / expansive heart | Air | `4/3` perfect fourth | Saba / relational opening |
| Saturn | Vishuddha-Ajna discipline bridge | Ether/structure | `3/2` perfect fifth | Kurd / structuring resonance |
| Uranus | Ajna transpersonal extension | Light/Air | `5/3` major sixth | Nahawand / disruptive insight |
| Neptune | Crown/transpersonal ocean | Consciousness/Water | `15/8` leading-toward-octave | Ajam / luminous expansion |
| Pluto | underworld/transmutation | Mineral/depth | shadow octave pressure | Locrian/shadow mode pressure |
| Sun | illumination beyond the seven | Solar/Akasha | `2/1` octave source/return | octave crown / Para Vak return |

This table is a first operational alignment. It must remain configurable through S2 graph law and M' profile metadata, because exact planetary/chakral mappings are tradition-sensitive. The non-negotiable invariants are:

- the same tick drives all planetary, chakral, musical, and MEF projections;
- scale/mode color comes from the active harmonic profile, not renderer-local state;
- epogdoon `9/8` is the living bridge between harmonic clock and embodied generative pulse;
- the M2 72-space is the vibrational source that M3 compresses into 64 symbolic states.

### M3 / Mahamaya: DNA, I-Ching, Tarot, Clock

M3 consumes M1/M2 and transcribes the harmonic state into symbolic/binary address.

Core codec:

```text
m3_hexagram_id = floor((degree360 * 64) / 360)
m3_line_change_operator = hexagram_id * 6 + line_index
m2_to_m3_symbol = floor(m2_vibration_index * 8 / 9)
evolutionary_gap = floor(floor(m2_idx * 8 / 9) * 9 / 8) != m2_idx
```

The implementation profile should expose:

| Field | Meaning |
| --- | --- |
| `mahamayaAddress64` | active 0..63 symbolic address |
| `hexagramId` | same 6-bit I-Ching address, with trigram decomposition |
| `upperTrigram` / `lowerTrigram` | 3-bit sub-addresses |
| `codonId` | same 6-bit DNA codon address |
| `codon` | nucleotide triplet derived from 2-bit encoding |
| `nucleotideBits` | three 2-bit values |
| `dnaRnaPhase` | phase flag, with polarity XOR law |
| `lineChangeOperator` | 0..383 address, hexagram plus line |
| `tarotMinorId` / `tarotShadowCodon` | 64->56 compression surface where available |
| `aminoAcidCode` | biological transcription surface where available |
| `evolutionaryGap` | true when M2 vibration cannot round-trip into M3 |
| `transcriptionState` | `resolved`, `provisional-gap`, or `pending-dataset-lut` |

The first implementation does not need every LUT populated. It must, however, implement the address laws and honest states. `pending-dataset-lut` is acceptable for amino/tarot details; recomputing arbitrary private mappings is not.

### S2 / Pointer Web: Coordinate Law of Record

S2 certifies how the active harmonic profile binds to coordinate topology:

- selected coordinate and QL position;
- family refs and mirror refs;
- lens refs and lens-inversion refs;
- VAK/CF refs;
- qvdata/source/spec/code/test anchors;
- harmonic relation metadata for pointer relations;
- M2/M3 projection handles where the selected coordinate participates in vibration or symbolic transcription.

S2 should answer: "what coordinate is this tick addressing, what relations are live, and what graph law makes that interpretation canonical?"

### S3 / Graphiti / Nara Clock: Runtime Deposition

S3 records the temporal fact of the profile without absorbing private identity into public graph topology.

Required deposition shape:

```text
Kernel profile observation
  -> DAY/NOW/session
  -> coordinate
  -> tick address
  -> harmonic state
  -> M2 resonance index
  -> M3 symbolic address
  -> pointer-web anchor
  -> source files/tests/spec anchors where relevant
```

Graphiti episodes are episodic and protected-local. Neo4j Bimba nodes remain canonical. The two may link by coordinate and episode handle, but they do not collapse into each other.

### M' / Tauri: The Instrument Surface

M' is the lived surface of the same profile:

| Domain | Consumes profile as |
| --- | --- |
| M0' | playable Bimba graph and active coordinate field |
| M1' | torus/path traversal and relation movement |
| M2' | MEF, elements, scales, modes, planetary/chakral matrix |
| M3' | harmonic clock, codon/I-Ching/Tarot wheel, cymatic pulse |
| M4' | Nara journal, DAY/NOW lived context, oracle/cast playback |
| M5' | Epii/Anuttara review, pedagogy, research, improvement gates |

M' should never compute a second clock. It renders the shared kernel/S2/S3 contract.

## Minimum Integrated Contract

`MathemeHarmonicProfile` should evolve toward:

```text
MathemeHarmonicProfile
  tick: TickAddress
  harmonic: ChromaticHarmonicState
  diatonic: DiatonicVakProjection | null
  resonance72: Resonance72Address
  elements: ElementalProjection
  planetaryChakral: PlanetaryChakralProjection
  mahamaya: MahamayaSymbolicProjection
  pointerAnchor: PointerWebAnchor | null
  depositionAnchor: DepositionAnchor | null
```

Public profile is safe-current. Protected state remains out-of-band:

- no raw `q_b` / `q_p` in public profile;
- no protected Nara identity;
- no private journal content;
- no unreconciled Graphiti episode body in canonical S2 projection.

## Tranche Order

### Tranche 1: Kernel Profile Contract

Files:

- Modify: `Body/S/S0/portal-core/src/kernel.rs`
- Modify: `Body/S/S0/portal-core/tests/kernel_clock_projection.rs`
- Modify: `Body/S/epi-kernel-contract/src/lib.rs`
- Modify: `Body/M/epi-tauri/src/services/types.ts`
- Modify: `Body/M/epi-tauri/src/services/kernelProjection.ts`
- Test: `Body/M/epi-tauri/src/services/kernelProjection.test.ts`

Tests:

- 12 ticks produce the full chromatic substrate.
- Every tick has correct bimba/pratibimba helix and X/X' partner.
- X+Y=5 mirror spans are exactly 1/3/5 whole-tones.
- 72 resonance index legacy and 12-anchor encodings agree.
- 8+4 rendering role is correct for sounded/nodal positions.
- M3 address law maps 720/360 degree to stable 0..63 address.
- M2->M3 epogdoon compression and gap detection are pure integer functions.

### Tranche 2: M3 Codec Foothold

Files:

- Add or modify: `Body/S/S0/portal-core/src/mahamaya.rs` or equivalent module.
- Modify: `Body/S/S0/portal-core/src/kernel.rs`
- Test: `Body/S/S0/portal-core/tests/kernel_m3_codec.rs`

Scope:

- implement nucleotide 2-bit encoding;
- implement codon id to triplet;
- implement hexagram upper/lower trigram split;
- implement line-change operator address;
- implement `apply_epogdoon_compression`;
- implement `is_evolutionary_gap`;
- expose honest `pending-dataset-lut` for tarot/amino details until LUTs are materialized.

### Tranche 3: S2 Pointer-Harmonic Anchor

Files:

- Modify: `Body/S/S2/graph-services/src/pointers.rs`
- Modify tests under `Body/S/S2/graph-services/tests` if present, or add focused tests.
- Modify: `Body/S/S3/gateway-contract/src/lib.rs` only for contract references.

Scope:

- pointer web returns harmonic relation anchors, not only string refs;
- S2 can certify profile-to-coordinate relation;
- qvdata/source/spec/code/test anchors remain visible.

### Tranche 4: S3 Deposition Contract

Files:

- Modify: `Body/S/S3/gateway-contract/src/lib.rs`
- Modify: `Body/S/S3/graphiti-runtime/src/lib.rs`
- Test: `Body/S/S3/gateway-contract/tests/*`
- Test: `Body/S/S3/graphiti-runtime/tests/*` if present.

Scope:

- profile observation payload includes tick, resonance72, M3 address, pointer anchor, and DAY/NOW/session.
- privacy boundary stays protected-local for Graphiti.
- canonical S2 graph and episodic Graphiti memory remain distinct.

### Tranche 5: M' Tauri Specs and Client Contract

Files:

- Modify: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- Modify or create M' per-domain specs under `Idea/Bimba/Seeds/M/`
- Modify: `Body/M/epi-tauri/src/services/types.ts`
- Modify M3/M2/M0 domain surfaces only after backend profile is stable.

Scope:

- M0' graph, M1' movement, M2' harmonic matrix, M3' clock/cosmos, M4' Nara, M5' Epii all consume the same profile.
- no renderer-local private recomputation of the clock.

## Handoff Prompt For Parallel M' Tauri Spec Session

Use this prompt in a fresh parallel session:

```text
We are in /Users/admin/Documents/Epi-Logos C Experiments.

Goal: produce the full M' Tauri app specification set in parallel with the kernel harmonic-clock integration work. Do not implement app code yet unless explicitly asked. Read the relevant specs and current Tauri state, then write/update the M' specs so the app can consume the shared kernel profile without inventing private clock or symbolic mappings.

Required context files:
- docs/plans/2026-05-19-kernel-mprime-harmonic-clock-integration-plan.md
- docs/epi-logos-kernel/epi-logos-kernel-spec.md
- docs/epi-logos-kernel/physical-pole-stack-architecture.md
- docs/epi-logos-kernel/mental-pole-mechanics.md
- docs/epi-logos-kernel/ql-musical-derivation.md
- docs/specs/2026-05-18-bimba-pointer-web-and-integration-spec.md
- docs/specs/M/M1-paramasiva-mathematical-dna.md
- docs/specs/M/M2-parashakti-vibrational-architecture.md
- docs/specs/M/M3-mahamaya-symbolic-transcription.md
- Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md
- Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md
- Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md
- Body/M/epi-tauri/src/services/types.ts
- Body/M/epi-tauri/src/services/kernelProjection.ts
- Body/M/epi-tauri/src/domains/M3_Mahamaya/HopfClock.tsx
- Body/M/epi-tauri/src/domains/ClockCosmos.tsx
- Body/M/epi-tauri/src/stores/clockStore.ts

Conceptual commitments:
- M' is the Pratibimba/lived surface of M, not a separate app family.
- Paramasiva's tick is now the harmonic clock.
- The app consumes MathemeHarmonicProfile as the shared contract.
- M2' renders MEF, elements, planetary/chakral scale alignments, modes, and 72-fold resonance.
- M3' renders Mahamaya DNA/I-Ching/Tarot/codon clock from the M3 codec fields.
- M4' consumes DAY/NOW/Nara journal context from S3' without exposing protected identity.
- M5' consumes Epii/Anuttara review evidence and promotion gates.
- No M' surface should recompute private versions of tick12, degree720, M2->M3 compression, or codon/hexagram mapping once backend profile fields exist.

Deliverables:
1. Update or create M' domain specs for M0' through M5' that state:
   - user-facing surface;
   - backend contract consumed;
   - required profile fields;
   - privacy boundary;
   - readiness/test criteria;
   - visual/audio interaction model.
2. Update M'-TAURI-PORT-SPEC with app architecture:
   - shared profile client;
   - Portal 0 structural/instrument side;
   - S0' command/config/readiness membrane;
   - Portal 1 Nara/Epii lived return;
   - M2/M3 harmonic clock panels;
   - Graphiti and S2 graph boundaries.
3. Produce a current-state gap table from existing Body/M/epi-tauri files:
   - already present;
   - needs backend contract;
   - needs design/spec only;
   - blocked by kernel profile tranche.
4. Do not touch unrelated app code. If you must edit, use apply_patch and keep it to specs only.

Tone: rigorous but alive. The output should be build-guiding, not decorative prose. The M' app is the instrument surface of the kernel, so the specs must preserve the mathematical and symbolic contracts rather than flattening them into dashboard widgets.
```

## Exit Condition

This plan is complete when a developer can answer, from one shared contract:

- what tick is active;
- what harmonic/musical state it occupies;
- what planetary/chakral/MEF resonance it implies;
- what DNA/I-Ching/Tarot/codon address it transcribes into;
- what coordinate/pointer law makes that reading canonical;
- what DAY/NOW/Graphiti deposition records it;
- what M' surface renders it.
