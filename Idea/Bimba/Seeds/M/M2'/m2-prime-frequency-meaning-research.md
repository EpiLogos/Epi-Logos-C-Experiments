# M2' Frequency-to-Meaning Research Pass

Status: research synthesis
Date: 2026-05-22

## Local Sources Consulted

- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md`
- `docs/datasets/parashakti-deep/nodes-full-detail.json`
- `docs/datasets/parashakti-deep/relations.json`
- `docs/datasets/parashakti-deep/parashakti-planets.json`
- `../M1'/physical-pole-stack-architecture.md`
- `../M5'/ql-musical-derivation.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-kernel-mprime-harmonic-clock-integration-plan.md`
- `Idea/Bimba/Seeds/M/M2'/Legacy/plans/CLOCK-AND-NARA-SPECS/15-m2-vibrational-matrix-portal-plugin.md`
- `Idea/Bimba/Seeds/M/M3'/Legacy/plans/CLOCK-AND-NARA-SPECS/14-m3-knowing-dossier-portal-plugin.md`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- `Body/S/S0/epi-lib/include/m2.h`
- `Body/S/S0/epi-lib/src/m2.c`
- `Body/S/S0/epi-lib/test/m2/test_m2.c`
- `Body/S/S0/portal-core/src/kernel.rs`
- `Body/M/epi-tauri/src/services/types.ts`
- `Body/M/epi-tauri/src/services/kernelProjection.ts`
- `Body/M/epi-tauri/src/services/__tests__/kernelProjection.test.ts`

## M2' Operational Surface Summary

M2' should be treated as the operational frequency-to-meaning translation
surface for Parashakti's 72-fold vibrational field. It is not a pitch
generator, not a private synthesizer, and not merely a cymatics module. The
current sources converge on this rule: S0/S2/S3 and M1' provide the harmonic
clock, pitch/tick stream, profile contract, and instrument-facing gesture;
M2' receives that stream and resolves it into meaning-bearing correspondences.

The stable invariant is:

```text
72-space = 12 lenses x 6 positions
         = 36 tattvas x 2 phases
         = 4 elements x 3 signs x 3 decans x 2 faces
         = 8 choirs x 9 names
```

The C substrate already encodes this as `M2_72_INVARIANT`, with a union view
over MEF lenses, tattvas, decans, Shem names, and raw vibration addresses.
The portal and M' specs add the runtime interpretation: M2' renders the
shared harmonic profile as an indexed symbolic field whose active address can
be read through MEF, elemental, planetary/chakral, modal, sacred-name,
maqam, mantra, decanic, and cymatic registers.

The operational surface should therefore expose:

- A 72-address profile with explicit `(lens, position, helix/ascent)` and
  cross-view projections into tattva phase, decan face, and choir/name slots.
- A semantic resonance vector assembled from MEF lens/position law, dataset
  relations, causal resonance masks, mirror-complement relations, and S2 graph
  provenance.
- An elemental and material medium layer, while preserving the distinction
  between P-position element and L2' element-bearing value.
- A planetary/chakral/modal layer that uses canonical profile fields and C
  lookup data rather than renderer-local correspondential folklore.
- A sacred sonic arena over Asma, Shaivite mantra, spiritual maqam, musical
  maqam, and Shem data.
- A cymatic evidence layer driven by the 8+4 profile bus: eight explicate
  antinodal drivers plus four implicate nodal/boundary constraints.
- A downstream symbolic projection into M3 through the M2 DET and 72-to-64
  epogdoon compression, without classifying codons inside M2.

The meaning of a frequency in M2' is not "frequency equals one symbol." It is
the total situated reading of the current harmonic state through the 72-fold
field, the active relational mode, the material medium, the semantic and
ritual correspondences, and the visible standing-wave evidence.

## Symbolic Systems Inventory and Roles

### MEF / Meta-Logikon

The MEF layer provides the primary semantic coordinate frame. In the dataset,
`#2-1` is the 36-condition Meta-Logikon double-covered into 72 states. In
the C substrate, the MEF lattice appears as `mef_lenses[12][6]` and canonical
12 lens names. In the kernel profile, the active M2 resonance is already
computed as `legacy_resonance_index` and `lens_anchor_index`.

M2' should use MEF as the first meaning interpreter:

- Lens anchors define the current register of interpretation.
- Positions define the internal phase of the lens.
- The helix/ascent bit distinguishes the doubled L/L' or descent/ascent face.
- Causal resonance masks group same-position resonance across base lenses.
- M1' tritone/Klein flips change valence and material reading without
  changing pitch identity.

The M2' renderer should not collapse MEF into a flat label. It should preserve
both address law and resonance law: a user should be able to see the current
cell, its tritone/mirror relation, its same-position causal resonance family,
and the current L/L' polarity.

### Tattvas, Elements, and Chakras

The tattva layer grounds the 72-space in a descent/ascent ontology:
36 tattvas doubled across light/shadow or manifestation/withdrawal. The C
tables encode 36 tattva descriptors, including the Mahabhuta elements in the
lower tattvas. The planetary dataset supplies the chakra stack from Earth
through Sahasrara with elements, locations, and reception roles.

M2' should use this layer as the material and body mapping surface:

- Tattvas describe the ontological density of the active vibration.
- Elements provide medium parameters for cymatic rendering and UI color/texture.
- Chakras provide embodied reception roles.
- Planetary/chakral projection provides the bridge from harmonic degree into
  body, element, modal color, and practice context.

The key implementation caution is that `MathemeElementalProjection` already
separates `pPositionElement` from `l2PrimeElement`. M2' must preserve that
distinction. P-position element is a positional/rendering role in the profile;
L2' element is an element-bearing correspondential value. Mixing them would
make the system look coherent while losing the actual ontology.

### Decans, Zodiacal Faces, and Rulerships

The decanic layer supplies the time-face of the 72-space:
36 decans doubled into 72 light/shadow faces. In the dataset, `#2-3` contains
decanic archetypes with zodiacal, elemental, planetary-musical, and
therapeutic correspondences. In the C substrate, decans are encoded as
`decans[4][3][3][2]`, with element, sign, decan, face, and ruling planet.

M2' should use decans to provide:

- Temporal/archetypal face data for the current 72-address.
- Planetary rulership and harmonic translation for the active face.
- Light/shadow polarity that aligns with the doubled 72-state structure.
- A bridge to embodied/ritual correspondences such as body zones, herbs, and
  time qualities where provenance exists.

Older TUI specs describe the M2 surface as a 12 x 6 half-decan matrix. That
is still a useful display idiom, but the newer profile law should be treated
as authoritative: decan displays should be derived from the shared profile and
canonical 72-address mapping, not from stale or approximate UI comments.

### Asma ul-Husna

The Asma layer is a semantic-divine-name resonance field rather than a
decorative name list. The dataset includes 99 names plus a hidden name,
Jamal/Jalal/Kamal groupings, abjad values, digital roots, mirror-complement
relations, therapeutic roles, and chakra correspondences. The C substrate
includes an `M2_ASMA_LUT[100]` with abjad, digital root, and mirror indexes.

M2' should use Asma correspondences as semantic resonance evidence:

- Semantic clusters can tune the meaning vector for an active state.
- Abjad/digital-root data can be part of numerical resonance display.
- Mirror-complement relations can participate in L/L' inversion and
  light/shadow interpretation.
- Therapeutic/chakral correspondences should remain provenance-bearing, not
  flattened into generic wellness labels.

The Asma layer is especially important because it shows that Parashakti's
frequency-to-meaning system is semantic and relational, not only physical or
geometric.

### Shaivite Mantras

The mantra layer provides phonetic-vibrational grammar. The dataset encodes a
100-fold field with Maatrika/Malini dual structure, vowels/consonants,
elemental associations, chakra fields, cymatic pattern names, resonance
qualities, and states of consciousness. The C substrate includes
`M2_MANTRA_LUT[100]` with a frequency range.

M2' should treat mantra data as a bridge between frequency, phoneme, body, and
state:

- Phonetic classes can annotate the current vibration.
- Vowel/consonant structure can inform sonic glyph or waveform display.
- Existing frequency fields can be used as correspondence metadata, not as a
  replacement for the shared audio profile.
- Existing cymatic pattern fields can seed M2' material/cymatic expectations,
  but they should be verified against actual 8+4 standing-wave output.

Mantra data is the clearest place where "frequency-to-meaning" becomes
language-to-body-to-state translation.

### Spiritual Maqamat

The spiritual maqam layer encodes a path structure: seven stations plus
La Maqam, each with three levels. In relations, these stations connect to
expression, transformation, and practice roles.

M2' should use this layer as a diagnostic and prescriptive path overlay:

- Current harmonic state may be read as a station, transition, or practice
  emphasis.
- The station can modulate semantic tone without redefining pitch.
- The three-level structure can support progressive disclosure in UI.

This layer should stay distinct from musical maqamat. Spiritual maqam is a
path/station grammar; musical maqam is a modal/interval grammar.

### Musical Maqamat, Modes, and Microtonality

The musical maqam layer is a full 72-mode field grouped into families such as
Rast, Bayati, Nahawand, Hijaz, Kurd, Ajam, Saba, Sikah, Nawa Athar, and
Independent. Dataset fields include interval structures, ajnas, emotional
signatures, time associations, tonic/dominant notes, and therapeutic or
planetary resonance relations.

M2' should use musical maqam as the music-theoretic translation layer:

- Maqam family and ajnas can interpret the current harmonic address as a
  modal field.
- Emotional signatures can feed semantic resonance, but should be tagged as
  source-derived, not universal affect.
- Tonic and dominant planetary relations can mediate between frequency,
  planet, chakra, and semantic resonance.
- Microtonal interval structures require tuning-aware playback and analysis;
  12-TET MIDI pitch classes are insufficient.

The broader kernel derivation also distinguishes 12 MEF lenses from 7 CF
modes. Lenses are chromatic-substrate anchors; modes are context-frame
anchorings. M2' should preserve both. The 12 x 7 = 84 landscape belongs to the
shared M'/M1' harmonic field, while M2' reads it as semantic/modal context.

### Shem HaMephorash

The Shem layer provides the native 72-name linguistic structure:
8 choirs x 9 names. The dataset relates each name to angelic function,
attribute, zodiacal influence, and additional correspondences. The C substrate
includes 72 Shem descriptors with choir, position, element, decan link, and
planet link.

M2' should use Shem as the direct 72-name register:

- Every active M2 address can show a choir/name coordinate.
- Choir structure can become a higher-level grouping over the 72 field.
- Element/decan/planet links provide cross-system validation.
- Shem data is a strong candidate for the "name" side of frequency-to-meaning.

Because Shem is already 72-fold, it should be treated as a primary address
view, not as a loose symbolic appendix.

### Planetary Harmonics and Solar-Chakral Stack

The planetary layer integrates the harmonic clock with the physical-pole
solar-chakral stack. The deep planetary dataset maps Sun, Venus, Mercury,
Moon, Saturn, Jupiter, and Mars to modes, ratios, quantum/hermetic roles, and
chakra reception. The C substrate adds a ten-planet Cousto frequency table
with Earth represented separately as observer/body state. The kernel profile
already exposes `planetaryChakral`.

M2' should use this layer to translate harmonic state into body/cosmos terms:

- Planetary body and interval ratio provide an audible/correspondential role.
- Chakra role describes embodied reception.
- Modal color links planetary force to music-theoretic context.
- Earth remains the observer/body ground, not just another planet in the
  mod-10 table.
- The 9:8 Venus/epogdoon relation is central because it is the explicit
  bridge from 72 to 64.

Current sources differ in exact planet sets and mappings. Implementation
should keep provenance explicit and avoid claiming a final canonical table
until S2 graph law fixes the mapping.

### M3 DET and Epogdoon Projection

The M2 C header defines the downstream projection:
`M2_TO_M3_CYMATIC_PROJECTION[72]`, `transduce_vibration_to_symbol`, and
`m2_epogdoon_compress(val_72) = val_72 * 8 / 9`. Tests confirm that the first
64 M2 states map to unique bits and the remaining 8 fold back at 8-step
intervals, giving full 64-bit coverage.

M2' should expose this as symbolic evidence, not as final codon
classification. The DET is the handoff surface to M3.

## Frequency-to-Meaning Pipeline Proposal

1. Ingest the shared harmonic profile. The authoritative input is the kernel
   `MathemeHarmonicProfile`, extended as needed with `audio_octet[8]`,
   `nodal_quartet[4]`, `lensMode`, and `kleinFlipState`. M2' should not
   synthesize its own clock, pitch, or private profile.

2. Resolve the active 72 address. Compute or receive the current
   `m2_vibration_index`, `legacy_resonance_index`, `lens_anchor_index`,
   lens, position, helix/ascent face, tattva/phase, decan/light-shadow face,
   and choir/name coordinate. All cross-views should round-trip to a bounded
   `[0, 71]` address.

3. Build the MEF semantic frame. Use MEF lens and position, causal resonance
   masks, tritone square emphasis, L/L' polarity, and same-position resonance
   relations. This frame answers: "through what lens is this frequency being
   understood?"

4. Apply elemental, tattvic, and body-medium interpretation. Resolve P-position
   element, L2' element, chakra reception, material density, and rendering
   medium. This frame answers: "in what kind of substance or body-region is
   this vibration taking form?"

5. Enrich through symbolic datasets. Attach decanic face, Asma resonance,
   mantra phoneme/state, spiritual maqam station, musical maqam family/ajnas,
   Shem name, planetary rulership, and relation-derived semantic neighbors.
   This frame answers: "what network of meanings becomes active?"

6. Apply Klein flip and modal context. If M1' reports a lens-to-tritone mirror
   flip, invert the relevant valence/material/shadow displays while preserving
   pitch identity. Use CF/mode as relational perspective rather than as a new
   pitch source.

7. Generate M2' cymatic evidence. Feed the eight explicate antinodal values
   and four implicate nodal constraints into the cymatic material solver.
   Produce a deterministic Chladni/standing-wave frame, material parameters,
   nodal lines, antinodal regions, and symmetry descriptors.

8. Project to M3 evidence. Use the M2 DET and 72-to-64 epogdoon compression
   to produce candidate 64-bit symbolic evidence, compressed indices, and
   cymatic symmetry metadata. Do not compute codon class, codon rotation, or
   Tarot/I-Ching classification here.

9. Render with provenance. UI panels should show which fields are proven,
   pending, graph-derived, table-derived, or profile-derived. Missing symbolic
   data should remain visibly pending rather than replaced by invented
   defaults.

The output of this pipeline should be a single M2' correspondential packet:

```text
M2PrimeMeaningPacket {
  source_profile_id,
  index72,
  address_views,
  mef_semantic_frame,
  elemental_medium_frame,
  planetary_chakral_frame,
  sacred_sonic_frame,
  maqam_mode_frame,
  cymatic_signature,
  m3_projection_evidence,
  provenance,
  pending_fields
}
```

This packet is the correct unit for portal rendering, MIDI/music-tech
annotation, and M3 handoff.

## MIDI / Music-Tech Integration Considerations

MIDI and music-tech integration should follow the same ownership rule as the
rest of M2': M2' annotates and modulates meaning; it does not become the
primary audio engine. Notes, clock, and pitch genesis remain with the shared
profile/audio layer and M1' instrument surface.

Recommended event model:

```text
Harmonic note/event from shared profile or M1'
  -> M2' attaches correspondential packet
  -> audio engine, UI, or external controller consumes the packet
```

The packet attached to a note or gesture should include index72, lens,
position, element, decan, planet/chakra, maqam, sacred-name/mantra fields,
material/cymatic parameters, and M3 projection evidence. This allows a DAW,
controller, or live visualizer to react to meaning without redefining the
meaning.

MIDI 1.0 is not enough for the full musical maqam layer. The 72 musical maqam
dataset includes microtonal and ajnas structures that cannot be represented
faithfully as ordinary 12-TET note numbers. Practical integrations should
support at least one tuning-aware path:

- MPE per-note pitch bend for expressive microtonal playback.
- MIDI 2.0 per-note pitch and higher-resolution controllers where available.
- MIDI Tuning Standard, MTS-ESP, Scala, or equivalent tuning-table export for
  maqam scales.
- OSC or sidecar JSON for semantic metadata that MIDI cannot represent.

For analysis, raw FFT is pre-musical. The ql-musical derivation points toward
an observer chain of STFT -> CQT -> chromagram -> active lens -> coordinate
profile. M2' should compare actual audio against intended profile values, then
report drift or resonance. CQT/chromagram layers are needed because they map
audio into pitch-class and modal evidence more directly than plain FFT bins.

Suggested music-tech surfaces:

- A DAW plugin or bridge that displays the active M2' packet beside incoming
  MIDI/MPE notes.
- A tuning export for each active maqam or lens-mode field.
- CC/OSC bindings for semantic dimensions such as element, chakra, decan face,
  Asma cluster, mantra phoneme, and cymatic material.
- A "semantic resonance meter" that compares intended profile, observed audio,
  and currently active correspondential field.
- A provenance overlay so users can distinguish canonical kernel data,
  dataset-derived correspondences, and pending research mappings.

Testing should use real generated event streams and real tuning conversion,
not mocked symbolic events.

## Cymatic Boundary with M3': What M2 Owns vs What M3 Owns

### M2 / M2' Owns

M2 owns the 72-fold vibrational and correspondential field. M2' owns its
operational rendering as frequency-to-meaning translation.

Concretely, M2' should own:

- 72-address resolution and cross-view projections.
- MEF, tattva, element, decan, Shem, Asma, mantra, maqam, planetary, and
  chakra meaning surfaces.
- Material and medium parameters for cymatic rendering.
- The 8+4 bus interpretation: eight antinodal drivers and four nodal/boundary
  constraints.
- Deterministic standing-wave or Chladni frame generation.
- Cymatic feature extraction, including nodal topology, symmetry axes,
  rotational/reflection hints, antinode counts, and material response.
- DET projection from 72 M2 states into 64-bit M3 candidate evidence.
- Epogdoon compression evidence: `floor(index72 * 8 / 9)` or the C-equivalent
  projection, with explicit handling of the eight folded states.

M2' may say:

```text
This 72-address produced these correspondential meanings, this material
cymatic signature, and this 64-bit symbolic projection evidence.
```

M2' should not say:

```text
This is the final codon class, codon rotation, Tarot card, I-Ching state, or
472-state modal inversion.
```

### M3 / M3' Owns

M3 owns binary symbolic transcription. M3' owns its operational rendering as
codon-clock, I-Ching/Tarot/DNA symbolic surface, and temporal transcription
interface.

Concretely, M3' should own:

- 64 codon/hexagram classification.
- 384 line-change surface.
- 472 rotational codon states: 40 non-dual codons x 7 states plus
  24 dual codons x 8 states.
- Codon class and rotational-state selection.
- Final `(lens, mode) -> (codon, rotation)` lookup law.
- Tarot and I-Ching projection surfaces.
- Codon wheel, clock, and temporal transcription rendering.
- Any final classification of M2 DET evidence into binary symbolic states.

M3' may use M2' cymatic evidence as geometric input, but the classification
decision is M3's responsibility.

### Boundary Recommendation

The clean boundary is:

```text
M2' = 72-space correspondential and cymatic evidence producer
M3' = 64/384/472-state symbolic classifier and renderer
```

The handoff should be an explicit structure, not an implicit shared guess:

```text
M2SymbolicProjection {
  active_indices72,
  resonance_weights72,
  det_bitboard64,
  compressed_indices64,
  folded_state_notes,
  cymatic_signature,
  symmetry_features,
  provenance
}
```

`cymatic_signature` should include the numeric standing-wave frame or compact
features derived from it, not just a named pattern. `symmetry_features` should
include rotational order, reflection axes, nodal-axis orientation, and
confidence. M3 can then classify this evidence into codon class and rotation.

The strongest recommendation from the combined M2' and M3' specs is that
codon non-duality should bind first to M2' cymatic symmetry, not directly to
M1' lens anchor. Lens anchor is tonal/contextual ground. Cymatic symmetry is
geometric ground. Since non-dual codon behavior is a structural symmetry
property, its first correspondence should be the visible symmetry of the M2'
cymatic field. Mode/CF can then select rotation, and M3 can materialize the
final 472-state law.

This avoids two failure modes:

- M2 overreach: M2' quietly classifies codons and duplicates M3 logic.
- M3 overreach: M3' ignores material cymatic evidence and treats binary
  symbols as detached from the 72-fold vibrational field.

## Implementation / Test Implications

### Contract Gaps

The current kernel and Tauri profile already expose tick, degree, SU(2) layer,
ratio role, chromatic state, diatonic state, resonance72, elements,
planetaryChakral, binary projection, bedrock, pointerAnchor, and context
frames. They do not yet expose every field required by the M2' spec.

M2' implementation will need profile-level additions or equivalent upstream
sources for:

- `audio_octet[8]`
- `nodal_quartet[4]`
- `lensMode`
- `kleinFlipState`
- Explicit M2' material/cymatic signature fields
- Explicit provenance and pending-state metadata for symbolic correspondences

M3' implementation separately needs:

- `codonClass`
- `rotationalStateCount`
- `rotationalIndex`
- `codonRotationProjection`

Those M3 fields should not be introduced as M2-owned classifications.

### Data and Loader Implications

The Parashakti deep JSON files are locally readable, but at least
`nodes-full-detail.json` and `relations.json` require tolerant loading because
of BOM/control-character issues. Production code should not depend on ad hoc
read-time hacks. The import path should normalize source data into strict,
validated artifacts or fail with actionable diagnostics.

Required data behavior:

- Load the full symbolic suite, not only cymatics-related fields.
- Preserve source provenance per correspondence.
- Preserve pending/missing fields without inventing defaults.
- Keep tradition-specific systems distinct while allowing cross-system
  resonance queries.
- Validate all address bounds and 72-space bijections.

### Test Requirements

The existing `test_m2.c` suite correctly checks table invariants, union sizes,
planet order/frequencies, routing masks, DET coverage, Shem bounds, MEF
accessors, epogdoon math, and lifecycle. M2' tests should build on that with
real functionality:

- 72-address coverage tests across MEF, tattva/phase, decan/face, and
  choir/name views.
- Dataset-driven inventory tests for Asma, mantra, spiritual maqam, musical
  maqam, Shem, planetary/chakral, and relation families.
- Strict provenance tests proving renderer output does not invent missing
  symbolic data.
- P-position element vs L2' element tests.
- 8+4 bus tests proving M2' consumes profile values and does not re-synthesize
  pitch or clock data locally.
- Klein flip tests proving the same pitch can invert valence/material reading
  only at valid tritone mirror transitions.
- Deterministic material/medium tests for cymatic parameter generation.
- CPU reference Chladni tests over real numeric grids, with expected nodal
  lines or symmetry values.
- DET equality tests against `transduce_vibration_to_symbol` and
  `m2_epogdoon_compress`.
- M2/M3 boundary tests asserting that M2' emits projection evidence but not
  codon class, rotational index, Tarot, or final I-Ching classification.
- MIDI/music-tech tests using real event streams, real tuning conversion, and
  microtonal round trips rather than mocked symbolic payloads.

The project instruction against mock/demo patterns is especially relevant
here. A test that only checks that a fake "cymaticPattern" string appears in a
mock response would not test M2'. Good tests must exercise actual profile
addresses, lookup tables, dataset relations, tuning math, standing-wave
calculation, and M2-to-M3 projection.

## Open Research Questions

- What is the canonical `M2PrimeMeaningPacket` or equivalent schema, and does
  it live in `portal-core`, `epi-lib`, Tauri types, or a shared generated IDL?
- Which exact symmetry features should be extracted from M2' cymatic frames
  for M3 classification: rotational order, reflection count, nodal-axis
  orientation, line crossings, antinode topology, or all of these?
- How should the final `(lens, mode) -> (codon, rotation)` law combine M1'
  tonal anchor, M2' cymatic symmetry, M2 DET projection, and M3 codon class?
- Which planetary/chakral mapping is canonical for first production release:
  the seven-body planetary dataset, the C ten-planet Cousto table, the older
  M' plan table, or an S2 graph-law reconciliation of all three?
- Should Asma, mantra, Shem, and maqam correspondences be displayed together
  by default, or should the UI require explicit register selection to avoid
  flattening distinct traditions into a single generic symbol soup?
- What is the canonical mapping from all 72 musical maqamat to tuning tables
  usable by MPE, MIDI 2.0, MTS-ESP, or Scala export?
- Should mantra frequency values in the C table be treated as historical
  correspondence metadata, optional tuning suggestions, or active synthesis
  targets?
- How should tolerant dataset loading be handled for current BOM/control-char
  JSON files: normalize checked-in artifacts, add a strict build step, or
  migrate to generated typed data?
- What parts of older portal TUI specs remain authoritative after the newer
  M2'/M3' specs and `MathemeHarmonicProfile` contract?
- How should user-facing displays distinguish proven correspondences,
  inferred correspondences, pending graph-law mappings, and exploratory
  research hypotheses?
