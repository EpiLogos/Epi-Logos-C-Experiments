# M2' - Parashakti as Harmonic-Correspondential Instrument

## A Seed Specification of the Functional/Techne Reflection of M2, by Which the Matheme Becomes Playable Correspondence and Visible Standing-Wave Form

> **The Matheme:** `0/1 = 4+2 = 5->0 = 0/1 as 5->0 (= 1/0 = 4'+2' = 5'->0') = 0/1`

> **The Standing Identity:** `0/1 + 1/0 = 1/1 = 100% = 64 + 36 = (4/3)^2 = 16/9`

> **The M1' / M2-1' Boundary:** Audio-genesis is a two-layer split: S0/M1 supplies the Prakasha matheme substrate, M2-1' reads that substrate through Parashakti / Vimarsha and writes the shared `audio_octet[8]` / `nodal_quartet[4]` bus, and M1' walks that bus as graph-traversal-as-melody. M2' is the harmonic-correspondential instrument that makes this reading visible across the 72-fold field, including the cymatic renderer that consumes the 8+4 stream as Chladni/standing-wave geometry.

> **The M2 -> M2' Distinction:** M2 = Parashakti's 72-fold vibrational architecture (what the field is). M2' = Parashakti's playable techne (how that field becomes MEF lensing, elemental medium, decanic face, sacred sonic-linguistic correspondence, solar-chakral runtime, cymatic visibility, and M3-ready projection).

> **Companion documents:**
> - [`M2'-SPEC.md`](M2'-SPEC.md) - current domain authority: M2-1' reads the S0/M1 substrate and writes the shared 8+4 bus; M1' walks that output as melody
> - [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) - especially §6.5 and §6.75, the 8+4 cymatic correspondence and 12 x 7 mode-tonic landscape
> - [`physical-pole-stack-architecture.md`](../../../../../docs/epi-logos-kernel/physical-pole-stack-architecture.md) - the Tauri/Bevy/wgpu rendering substrate and Chladni equation surface
> - [`epi-logos-kernel-spec.md`](../../../../../docs/epi-logos-kernel/epi-logos-kernel-spec.md) - the bioquaternionic JEPA-EBM operator over the full matheme
> - [`M2'-SPEC.md`](M2'-SPEC.md) - current domain UI/backend contract for M2' as harmonic/correspondential profile surface

> **Code anchors:** `epi-lib/include/m2.h` (72-invariant union, MEF/Tattva/Decan/Shem/Maqam/Asma/Mantra tables, DET M2->M3 projection), `epi-lib/include/m1.h` (QL processual constants inherited by M2), `epi-lib/include/m3.h` (64-codon bitboard, 40/24 codon classification, 472 rotational states), `physical-pole-stack-architecture.md` §5 (Chladni/wgpu rendering).

---

## §0/1 - Threshold: What M2' Is, and What it is Not

M2' is **Parashakti read from the playable correspondence side**. It is not a renderer-local audio source and not merely a visualizer. It is the functional surface where Parashakti's 72-fold vibrational architecture reads the S0/M1 substrate through M2-1' Vimarsha, writes the shared 8+4 bus, routes that bus through MEF, tattva, decan, sacred name, mantra, maqam, planetary, and chakral systems, and then makes that field directly engageable as matrix, mode, body, clock, and cymatic form.

The cymatic renderer remains essential, but it is now named correctly: it is a **module within M2'**, not the identity of M2' as such. M2' is the harmonic-correspondential instrument; cymatics is the visible standing-wave expression of that instrument when the shared M2-1' 8+4 bus is routed into a material/medium solver.

The current domain boundary makes the split explicit: the 8 explicate-sung positions of the matheme become `audio_octet[8]`, while the 4 implicate-nodal positions become `nodal_quartet[4]`. M2-1' writes both into the shared profile by reading the S0/M1 substrate; renderer panels consume them. The eight are not re-generated locally by renderers. The four are not decorative metadata. The visible Chladni pattern is the intersection of those two streams: antinodal motion from the eight, nodal constraint from the four.

Three commitments hold the threshold.

**First:** M2' preserves the M2 72-invariant. The bimba M2 header states the law directly: every major M2 structure resolves to exactly 72 bytes, and `M2_Vibrational_72_Space` enforces this at compile time. M2' must therefore expose a 72-addressable harmonic-correspondential field. Even when it renders a torus mesh, a chakra sphere, or a codon-clock cell, the rendering state is still read from the same 72-space: 12 MEF lens positions x 6 inner positions; 36 tattvas x 2 phases; 4 elements x 3 signs x 3 decans x 2 faces; 8 choirs x 9 Shem names.

**Second:** M2' is the harmonic-correspondential resolver and includes the visual standing-wave renderer. It may use audio analysis and it may carry spectral observer data, but renderer panels do not decide pitch. M2-1' reads the S0/M1 substrate into the shared 8+4 bus; M1' walks that bus as melody; M2' decides how the resulting pitch-stream is correspondentially colored, embodied, modulated, and made visible across surfaces. Its core question is not only "what geometry can this sounding lawfully make visible under this nodal boundary?" but also "what symbolic, elemental, planetary, chakral, maqam/mantra/name, and modal field is this sounding inhabiting?"

**Third:** M2' is the bridge surface toward M3/M3', but not the codon classifier. The M2 header already defines the Discrete Epistemic Transform (DET): `M2_TO_M3_CYMATIC_PROJECTION[72]`, `transduce_vibration_to_symbol`, and the 72 -> 64 epogdoon compression. M2' renders the harmonic-correspondential profile and, where cymatics is active, produces a coherent 72-indexed standing-wave signature that can be projected to M3's 64-bit symbolic field. M3/M3' owns codon classification, tarot-card rotational state, and the 40 non-dual / 24 dual codon distinction.

The spec proceeds across six M2' strata. The names are seed names, inferred from `m2.h`'s current bimba architecture; if the bimba map later supplies a canonical inner-stratum table for M2', this document should be normalised to that table without changing the boundary contract.

---

## §0 - Ground: The Derivation Chain from 72-Vibration to Playable Correspondence

M2' begins where the S0/M1 substrate becomes readable through M2-1' Vimarsha, but its field is broader than the cymatic renderer:

```text
M2-1' audio octet               ->  eight explicate antinodal drivers
       |
       v
M2-1' nodal quartet             ->  four implicate boundary constraints
       |
       v
M2 72-space                     ->  MEF / tattva / decan / Asma / Shem / maqam / mantra
       |
       v
M2' harmonic profile            ->  72-addressed correspondence / body / mode / symbolic field
       |
       v
Cymatic renderer module          ->  Chladni equation, torus/sphere/grid variants
       |
       v
Rendered substrate surfaces      ->  torus, chakra spheres, codon-clock cells
       |
       v
DET projection                  ->  M2 72-state vibration -> M3 64-bit symbolic field
       |
       v
M3 / M3' codon-rotation layer    ->  future mapping surface, not owned by M2'
```

The load-bearing arithmetic is:

```text
12 = 8 explicate-sung + 4 implicate-nodal
72 = 12 lenses x 6 positions = 36 tattvas x 2 phases = 8 choirs x 9 names
72 x (8/9) = 64
40 x 7 + 24 x 8 = 472
```

M2' lives in the middle of this chain. It sees the 12 as both MEF lens-anchor field and 8+4 rendering partition, the 72 as Parashakti's vibrational address-space, the 64 as M3's symbolic compression target, and the 472 as downstream codon-rotation reachability that M2' must preserve but not prematurely decide.

---

## §1 - Definition: The Six M2' Strata as Techne-Reflection of M2

### The bimba -> prime correspondence

| M2 (bimba) | M2' (techne seed) | What M2 is | What M2' does |
|------------|-------------------|------------|---------------|
| **M2-0** Archetypal Numerical Ground / 72-Invariant Source | **M2-0'** Vibrational Profile Source | The immutable 72-byte vibrational union, archetypal constants, and invariant address law | Serves read-only harmonic/correspondential descriptors and validates every playable/rendered address against the 72 law |
| **M2-1** MEF / L-Family Matrix | **M2-1'** Lens Resonance Surface | 12 lenses x 6 positions as semantic-vibrational condition field | Turns lens-anchor and position into resonance weighting, mode color, material response, and epistemic surface posture |
| **M2-2** Tattva / Element Throughline | **M2-2'** Elemental Medium Surface | 36 tattvas x 2 phases, five elements, chakra phase fields | Distinguishes P-position element from L2' element-bearing value and selects body/medium constants for sonic, visual, and cymatic response |
| **M2-3** Decan / Zodiacal Face Field | **M2-3'** Decanic Face Surface | 36 decans x light/shadow phase, zodiacal body zones, planetary rulership, temporal/celestial face | Provides face, polarity, body-zone, phase, envelope, and clock-sector evidence for M2/M3 projection |
| **M2-4** Vibrational Arena / Sacred Sonic-Linguistic Systems | **M2-4'** Correspondential Sonic Arena | Asma, Shem, maqam, mantra, spiritual maqamat, musical maqamat, and 100-fold 36/64 routing systems | Makes symbolic systems playable as tonal, modal, mantra, name, timbre, and provenance-bearing correspondences without hardcoding renderer folklore |
| **M2-5** Planetary-Chakral Harmonic Integration / DET Bridge | **M2-5'** Solar-Chakral Runtime and Symbolic Projection Gate | planetary/chakral harmonics, Earth observer, 9:8 epogdoon, 72->64 compression, causal resonance masks | Holds live solar-chakral state, emits cymatic frame packets where needed, and projects M3-ready 64-bit symbolic evidence without classifying codons |

The bimba is the vibrational architecture. The prime is the playable instrument apparatus. M2' does not invent a second Parashakti; it renders the existing Parashakti engageable as correspondence, body, mode, tone, visible form, and M3 projection.

### What M2' assembles into

M2' assembles a single deterministic instrument pipeline:

1. **M2-0'** validates that every active condition is an address in canonical 72-space.
2. **M2-1'** reads the active MEF lens-position field and produces resonance/material response.
3. **M2-2'** resolves tattva, element, chakra, and medium/body constants.
4. **M2-3'** supplies decanic face, light/shadow polarity, body-zone, and clock-sector evidence.
5. **M2-4'** applies sacred sonic-linguistic modulation from Asma, Shem, maqam, mantra, and related 100/72 systems.
6. **M2-5'** binds those decisions to solar-chakral runtime, optional cymatic frame buffers, and M3 symbolic projection.

The visible pattern is therefore not "audio visualizer output." It is one Parashakti expression among others: the audio octet supplies motion, the nodal quartet supplies stillness, and the 72-space supplies the vibrational grammar that determines what kind of correspondence, body, mode, and motion-stillness relation is allowed to appear.

---

## §2 - Operation: The Six Strata in Detail

### §2.M2-0' - Vibrational Profile Source

**Role.** The read-only source surface for every harmonic, correspondential, and cymatic address. This is the M2 equivalent of M1-0': nothing here changes during a session, and every rendered frame or symbolic projection must trace back to it.

**What's in code already.** `m2.h` defines:

- `M2_72_INVARIANT = 72`
- `M2_36_BASE = 36`
- `M2_Vibrational_72_Space`
- `M2_ARCHETYPES`
- `M2_MEF_DESC[72]`
- `M2_TATTVA_DESC[36]`
- `M2_DECAN_DESC[72]`
- `M2_SHEM_DESC[72]`
- `M2_MAQAM_DESC[72]`
- `M2_MANTRA_LUT[100]`

**What M2' adds.**

```c
// In m2_prime.h:

typedef struct {
    uint8_t index_72;       // canonical M2 vibration address
    uint8_t lens;           // 0-11 when read as MEF condition
    uint8_t position;       // 0-5 within lens
    uint8_t tattva;         // 0-35 when read through tattva phase
    uint8_t phase;          // 0-1 descent/ascent phase for 36x2 readings
    uint8_t element;        // Element_Id or 0xFF if not element-bearing
    uint8_t chakra;         // Chakra_Id or 0xFF if not chakra-bearing
    uint16_t provenance_id; // graph/source/provenance pointer, never hardcoded meaning
} M2_Prime_Cymatic_Address;

bool m2_prime_address_from_index(uint8_t index_72,
                                 M2_Prime_Cymatic_Address* out);

bool m2_prime_index_from_lens_position(uint8_t lens, uint8_t position,
                                       uint8_t* index_72_out);

bool m2_prime_verify_72_space(void);
```

The current type name is intentionally scoped to the cymatic renderer module. A later header extraction may introduce a broader `M2_Prime_Vibrational_Address` alias or wrapper, but the underlying invariant remains the same: every M2' surface is addressable in canonical 72-space.

**Invariants M2-0' enforces.**

1. Every cymatic frame address is in `[0, 71]`.
2. No M2' source function mutates `M2_ARCHETYPES` or descriptor tables.
3. MEF indexing is exactly `12 x 6 = 72`.
4. Tattva phase indexing is exactly `36 x 2 = 72`.
5. Missing or tradition-sensitive mappings remain unresolved/provenance-marked; renderer code must not invent defaults.

### §2.M2-1' - Lens Resonance Surface / Materializer

**Role.** Converts the active MEF/lens-position state into shader material. This is where the 72-fold lens-resonance vector becomes visible as surface colour, texture, damping, brightness, and strain.

M2' inherits the M1' correction that MEF lenses are scale-composers at the audio level. At the cymatic level, lenses become **material-response functions**. A lens does not pick the pitch; it determines how the surface receives and shows that pitch.

**What M2' adds.**

```c
typedef struct {
    float color_rgba[4];
    float roughness;
    float damping;
    float elasticity;
    float particle_affinity;
    float lens_tension;
} M2_Prime_Material;

void m2_prime_material_for_lens(uint8_t lens, uint8_t position,
                                float resonance,
                                M2_Prime_Material* out);

void m2_prime_material_from_resonance72(const float resonance72[72],
                                        M2_Prime_Material materials_out[72]);
```

**Invariants M2-1' enforces.**

1. Material output is deterministic for `(lens, position, resonance, provenance)`.
2. Lens-prime pairs preserve shared substrate but invert orientation: `Lx` and `Lx'` may share note-content from M1' but must render opposite surface valence when the active helix flips.
3. All 72 material slots can be rendered even if some provenance fields are pending.
4. Materialization is display-only: it never changes the active lens/mode in M1'.

### §2.M2-2' - Elemental Medium Solver

**Role.** Chooses the simulated medium and propagation constants. Chladni patterns are not generic images; they depend on what kind of body is vibrating. M2's tattva/element/chakra tables are the natural source of those medium parameters.

**What M2' adds.**

```c
typedef enum {
    M2_PRIME_MEDIUM_TORUS_MEMBRANE = 0,
    M2_PRIME_MEDIUM_SPHERE_MEMBRANE = 1,
    M2_PRIME_MEDIUM_PLATE = 2,
    M2_PRIME_MEDIUM_PARTICLE_FIELD = 3,
    M2_PRIME_MEDIUM_CELL_GRID = 4,
} M2_Prime_Medium_Type;

typedef struct {
    M2_Prime_Medium_Type type;
    float wave_speed;
    float damping;
    float density;
    float stiffness;
    float viscosity;
    uint8_t element;
    uint8_t chakra;
    uint8_t tattva;
} M2_Prime_Medium;

void m2_prime_medium_from_tattva(uint8_t tattva, uint8_t phase,
                                 M2_Prime_Medium* out);

void m2_prime_medium_from_chakra(uint8_t chakra,
                                 M2_Prime_Medium* out);
```

**Invariants M2-2' enforces.**

1. Elemental medium constants are range-bounded and stable under repeated frame evaluation.
2. `P-position element` and `L2' element-bearing value` remain distinct fields, matching the existing M2' domain spec.
3. Earth remains the geocentric observer/clock anchor, not an ordinary planet row in `M2_PLANET_LUT`.
4. If graph-law provenance for a correspondence is absent, the medium is marked pending rather than hardcoded.

### §2.M2-3' - Harmonic-Correspondential Modulator

**Role.** Applies the correspondential layer: decan faces, Shem choir-position, maqam, mantra, Asma, and planetary-chakral provenance. This layer supplies phase, envelope, symbolic texture, and resonance provenance to the visual form.

M2-3' is dangerous if misunderstood. It must not become a bag of occult correspondences baked into shader code. The correspondential layer is a **provenance-bearing modulation surface**. Exact mapping choices come from M2 canonical tables and S2 graph law, not from renderer guesses.

**What M2' adds.**

```c
typedef struct {
    float phase_offset;
    float amplitude_scale;
    float envelope_attack_ms;
    float envelope_release_ms;
    float symbolic_density;
    uint16_t meaning_id;
    uint16_t provenance_id;
} M2_Prime_Modulation;

void m2_prime_modulation_from_decan(uint8_t decan_72,
                                    M2_Prime_Modulation* out);

void m2_prime_modulation_from_shem(uint8_t choir, uint8_t position,
                                   M2_Prime_Modulation* out);

void m2_prime_modulation_from_mantra(uint8_t mantra_idx,
                                     M2_Prime_Modulation* out);
```

**Invariants M2-3' enforces.**

1. Modulation is composable and bounded: no layer may push amplitude, phase, or particle-force outside safe render ranges.
2. Symbolic provenance travels with every modulation.
3. Renderer code may show canonical public correspondences but must not expose private or tradition-sensitive mappings unless explicitly present in governed profile data.
4. M2' may modulate timbre/visual response from maqam/mantra state, but it does not choose the generated frequencies.

### §2.M2-4' - Solar-Chakral Runtime / Surface Instance Manager

**Role.** Holds live M2' runtime state: planetary/chakral orientation, active surface state, and cymatic rendering frames. This is the mutable session layer for M2', analogous to M1-1' but scoped to harmonic-correspondential and visible-form frames.

**What's in code already.** `M2_Root` stores:

```c
typedef struct {
    Holographic_Coordinate*       hc;
    const Holographic_Coordinate* active_cf;
    Elemental_Signature           active_elem;
    uint8_t                       active_decan;
    uint8_t                       active_tattva;
    uint8_t                       _pad;
} M2_Root;
```

**What M2' adds.**

```c
typedef struct {
    M2_Root* root;
    uint64_t frame_id;
    uint64_t tick_count;
    float audio_octet[8];          // copied from M1', not generated here
    uint8_t nodal_quartet[4];      // copied from M1', boundary mode numbers
    float resonance72[72];         // active visual resonance field
    M2_Prime_Medium medium;
    M2_Prime_Material materials[72];
    uint64_t m3_projection;        // DET output, if computed for this frame
} M2_Prime_Cymatic_Frame;

typedef struct M2_Prime_Renderer M2_Prime_Renderer;

M2_Prime_Renderer* m2_prime_renderer_begin(M2_Root* root);

void m2_prime_renderer_submit_m1_bus(M2_Prime_Renderer* r,
                                     const float audio_octet[8],
                                     const uint8_t nodal_quartet[4]);

void m2_prime_renderer_next_frame(M2_Prime_Renderer* r,
                                  M2_Prime_Cymatic_Frame* out);

void m2_prime_renderer_end(M2_Prime_Renderer* r);
```

**Invariants M2-4' enforces.**

1. M2' mutable state is session/frame-bounded.
2. The audio bus has exactly 8 floats; the nodal bus has exactly 4 integers.
3. M2' never writes into M1' session state.
4. Frame production is deterministic for the same M1 bus, M2 root state, resonance72, and graph-law provenance.
5. Render state can be safely shared with Bevy/wgpu via immutable frame snapshots.

### §2.M2-5' - Symbolic Projection Gate

**Role.** Bridges from visible vibration to M3 symbolic transcription. This is the M2' -> M3/M3' seam.

The M2 header already gives the bimba-level transform:

```c
extern const uint64_t M2_TO_M3_CYMATIC_PROJECTION[72];

static inline uint64_t transduce_vibration_to_symbol(
        const uint8_t m2_active_indices[],
        uint8_t count);

static inline uint8_t m2_epogdoon_compress(uint8_t val_72);
```

M2' must expose this as a render-time projection without claiming that projection is already a codon-rotation mapping. The 64-bit output says "these M3 symbolic positions are activated by this cymatic field." M3/M3' then decides which codon(s), card(s), and rotations that activation implies.

**What M2' adds.**

```c
typedef struct {
    uint8_t active_indices[72];
    uint8_t active_count;
    float confidence[72];
    uint64_t m3_bitboard;
    uint8_t compressed_indices[72]; // each 72 index mapped through 8/9 where valid
} M2_Prime_Symbolic_Projection;

void m2_prime_active_indices_from_resonance72(const float resonance72[72],
                                              float threshold,
                                              uint8_t active_out[72],
                                              uint8_t* count_out);

uint64_t m2_prime_project_frame_to_m3(const M2_Prime_Cymatic_Frame* frame);

void m2_prime_symbolic_projection(const M2_Prime_Cymatic_Frame* frame,
                                  float threshold,
                                  M2_Prime_Symbolic_Projection* out);
```

**Invariants M2-5' enforces.**

1. 72 -> 64 compression uses the epogdoon `8/9` transform already defined by M2/M3.
2. Projection by OR-superposition is monotonic: adding active M2 indices can only set more bits, never unset bits.
3. M2' does not classify codons. It emits M3 candidate activation evidence.
4. The 472 codon-rotation total remains a downstream reachability invariant, not an M2' frame cardinality.

---

## §3 - Pattern: Cross-System Connections

### M2' <-> M1' - The 8+4 Cymatic Contract

M1' emits:

- `m1_prime_audio_octet`: eight frequencies from positions 1, 2, 3, 4 and 1', 2', 3', 4'
- `m1_prime_nodal_quartet`: four integer boundary parameters from positions 0, 5 and 0', 5'

M2' consumes:

- the eight as antinodal drivers of motion
- the four as nodal mode constraints

The Chladni equation from the physical-pole spec is the seed:

```text
chi(x, y) = a*sin(m*pi*x/L)*sin(n*pi*y/L)
          + b*cos(m*pi*x/L)*cos(n*pi*y/L)
```

M2' generalises this across three surfaces:

1. **Torus:** double-Fourier modes over longitude/latitude, with radial displacement along the surface normal.
2. **Chakral spheres:** spherical-harmonic modes, with particle migration toward nodal curves.
3. **Codon-clock cells:** 2D plate/grid Chladni modes inside each active cell.

The eight frequencies drive `a`, `b`, amplitude spectrum, and temporal phase. The four nodal parameters constrain `m`, `n`, boundary selection, and allowed standing-wave families.

### M2' <-> M3 / M3' - Cymatic Signature vs Codon Rotation

M2' projects visible vibration into M3's 64-bit symbolic field through DET. M3 owns:

- codon encoding and nucleotide values
- 40 non-dual / 24 dual codon classification
- 7-state vs 8-state rotational profiles
- tarot/codon mapping
- 472 total reachable rotational states

The open load-bearing surface from the M1' spec remains open here, but M2' sharpens what evidence it supplies. The future M3' spec must decide how these three signals braid:

1. **Lens anchor** from M1' `(lens, mode)` and M2' material response.
2. **Cymatic symmetry axis** from M2' pattern analysis: nodal-line symmetry, rotational symmetry, reflection axes, palindromic geometry.
3. **Codon symmetry axis** from M3 classification: perfect palindromic, imperfect palindromic, repeated-dinucleotide non-dual, or fully dual.

This seed spec's provisional recommendation: **codon symmetry-axis should map first to M2' cymatic symmetry, not directly to M1' lens-anchor.** The lens-anchor is tonal ground; the cymatic symmetry-axis is geometric ground. Because codon non-duality is a structural symmetry property, it should bind to the geometry that visibly exhibits symmetry. Mode/CF then maps to rotation within that codon's available state-count. This keeps the layers clean:

- M1' supplies tonal anchor and modal inversion.
- M2' supplies visible symmetry and nodal boundary evidence.
- M3' supplies codon/card classification and rotation semantics.

This is a recommendation, not yet a closed mapping. The precise `(lens, mode, cymatic_symmetry) <-> (codon, rotation)` table must be worked against the M3 codon classification table directly.

### M2' <-> M4 - Lens Encounter Surface

M2' renders the MEF not as text but as encounter. The user sees a surface under a lens. The same audio octet rendered under L1, L4, or L4' should not merely change palette; it should change the felt investigatory posture of the surface:

- L1-like rendering emphasizes causal topology, force, constraint, and deformation.
- L4-like rendering emphasizes embodied encounter, mood, horizon, and surface texture.
- L4'-like rendering emphasizes measurement, grid, experimental legibility, and current-state/ideal-state delta.

The M2' renderer therefore becomes an interface where the Cause-Experience basin can be seen. This does not replace M4/Nara; it gives M4 something visible to encounter.

### M2' <-> M5 - Aletheic Residue of Form

M1' accumulates Pythagorean-comma residue as audio/ratio truth-deposition. M2' should accumulate **form-residue**: persistent changes in cymatic pattern coherence over a session.

```c
float m2_prime_pattern_coherence(const M2_Prime_Cymatic_Frame* frame);
float m2_prime_form_residue_accumulated(const M2_Prime_Renderer* r);
```

The M5 layer can read both:

- M1' comma residue: what changed in ratio-space through playing
- M2' form residue: what changed in visible pattern-space through rendering

Together they describe whether the matheme's audible evolution and visible evolution are coherent.

---

## §4 - Context: Computational Grounding

### Where each piece lives in code

| Stratum | Existing C/Rust location | What M2' adds |
|---------|--------------------------|---------------|
| M2-0' Vibrational Profile Source | `m2.h:42-148`, `M2_Vibrational_72_Space`, `M2_ARCHETYPES`, descriptors | `m2_prime_address_from_index`, 72-source validation |
| M2-1' Lens Resonance Surface / Materializer | `m2.h:138-208`, MEF descriptors, `L_Family_State` | material response from lens-position/resonance72 |
| M2-2' Elemental Medium Solver | `m2.h:47-104`, `Tattva_Entry_Desc`, `Element_Throughline`, `Chakra_Descriptor` | medium constants for plate/sphere/torus/grid simulations |
| M2-3' Harmonic-Correspondential Modulator | `m2.h:240-476`, Decan/Shem/Maqam/Asma/Mantra tables | bounded modulation with provenance |
| M2-4' Solar-Chakral Runtime / Surface Instance Manager | `m2.h:565-575`, `M2_Root`; `physical-pole-stack-architecture.md` §5 | `M2_Prime_Renderer`, `M2_Prime_Cymatic_Frame`, Bevy/wgpu frame snapshots |
| M2-5' Symbolic Projection Gate | `m2.h:524-546`, `M2_TO_M3_CYMATIC_PROJECTION`; `m3.h:510-674` | frame-to-M3 bitboard projection and unresolved M3' evidence |

### Shader-level data contract

M2' should expose a renderer-friendly frame packet:

```c
typedef struct {
    uint64_t frame_id;
    float audio_octet[8];
    uint8_t nodal_quartet[4];
    float resonance72[72];
    float material_rgba[72][4];
    float material_params[72][4]; // damping, elasticity, roughness, particle_affinity
    float medium_params[8];       // wave_speed, density, stiffness, viscosity, etc.
    uint64_t m3_bitboard;
} M2_Prime_Gpu_Frame;
```

Rust/Bevy can treat this as immutable per-frame input, upload it to a uniform/storage buffer, and let wgpu compute pipelines produce the surface deformation and particle redistribution.

### Compile-time and runtime invariants

```c
_Static_assert(M2_72_INVARIANT == 72, "M2' requires canonical 72-space");
_Static_assert(M2_MEF_TOTAL_LENSES * M2_MEF_POSITIONS_PER_LENS == 72,
    "12 x 6 MEF field must equal M2 72-space");
_Static_assert(M2_36_BASE * 2 == 72,
    "36 tattvas x 2 phases must equal M2 72-space");
_Static_assert(CODON_NONDUAL_TOTAL_COUNT * 7 + CODON_DUAL_COUNT * 8 == 472,
    "M2'->M3' bridge must preserve 472 downstream rotational states");
```

Runtime checks:

- `m2_prime_verify_72_space()` must pass before rendering.
- `m2_prime_renderer_submit_m1_bus()` rejects any absent or malformed 8+4 bus.
- `m2_prime_project_frame_to_m3()` must be deterministic for a fixed `resonance72`.
- GPU frame generation must be reproducible from CPU frame state.

---

## §5 - Synthesis: The Visible Wave

### One rendered frame, one Parashakti act

For each frame:

1. **M1'** emits the audio octet and nodal quartet for the current tick.
2. **M2-4'** snapshots the incoming bus into a cymatic frame.
3. **M2-0'** validates all active 72-space addresses.
4. **M2-1'** materializes the active MEF/lens resonance as surface response.
5. **M2-2'** chooses the elemental medium and propagation constants.
6. **M2-3'** applies bounded correspondential modulation with provenance.
7. **M2-4'** emits a GPU frame for torus, chakral sphere, and codon-cell renderers.
8. **M2-5'** projects the active 72-space vibration into M3's 64-bit field.
9. **M3/M3'** may read the projection as codon/card activation evidence.

The user experiences this as one image moving with sound. Structurally, it is Parashakti rendering the matheme's motion-stillness relation.

### The M2' seed statement

M2' is Parashakti as harmonic-correspondential instrument. Its six strata are M2's 72-fold vibrational architecture re-read as playable, renderable, and symbolically projectable techne. M1' gives the sound and the nodal boundary. M2' gives the 72-addressed resonance profile, lens material response, elemental medium, decanic and sacred-linguistic modulation, solar-chakral runtime, and visible standing-wave form. The 8 explicate-sung positions are antinodal drivers; the 4 implicate-nodal positions are boundary conditions. The 72-space is the vibrational grammar. The 64-bit M3 projection is the symbolic compression of the visible wave, not yet the codon-rotation mapping itself.

If M1' makes the matheme sound, M2' makes the matheme correspond, embody, modulate, and become visible. It is not the eye watching sound from outside; it is sound's own standing-form, Parashakti showing the motion by which stillness gives itself shape.

---

## Notes for Implementation

### Order of work

1. **`m2_prime.h` header creation** - define frame structs, 72-address API, renderer lifecycle, material/medium/modulation/projection functions, and invariants.
2. **72-source validation** - implement `m2_prime_verify_72_space`, address conversion, and tests over all 72 indices.
3. **M1' bus consumer** - implement strict ingestion of 8 audio floats + 4 nodal integers; reject malformed input.
4. **Materializer** - implement deterministic lens-position -> material response from `resonance72`.
5. **Medium solver** - implement tattva/chakra/element -> propagation constants with pending/provenance handling.
6. **Correspondential modulator** - implement decan/Shem/mantra bounded modulation, source-provenance included.
7. **CPU Chladni reference solver** - implement a non-GPU deterministic reference for square plate and torus samples so tests validate real functionality.
8. **GPU frame packet** - add Rust FFI and Bevy/wgpu upload path for immutable `M2_Prime_Gpu_Frame`.
9. **wgpu compute shaders** - torus, sphere, and codon-cell cymatic kernels.
10. **DET projection integration** - compute `m3_bitboard` from active 72 indices and compare against `transduce_vibration_to_symbol`.
11. **M3' follow-on spec** - close the `(lens, mode, cymatic_symmetry) <-> (codon, rotation)` mapping against the codon classification table.

### Test coverage requirements

- **72-space coverage:** every index 0-71 maps to a valid cymatic address and back.
- **No invented defaults:** absent graph-law provenance yields pending display state, never a fake correspondence.
- **8+4 bus enforcement:** renderer accepts exactly 8 audio drivers and 4 nodal boundary parameters.
- **Reference Chladni correctness:** CPU solver produces deterministic nodal lines for known `(m, n, a, b)` values.
- **Material determinism:** same `(lens, position, resonance)` yields identical material output.
- **Medium distinction:** P-position element and L2' element-bearing value remain separate in frame output.
- **Projection equivalence:** M2' frame projection matches `transduce_vibration_to_symbol` for the same active 72 indices.
- **Epogdoon compression:** every compressed index uses `floor(index72 * 8 / 9)` semantics consistent with `m2_epogdoon_compress`.
- **M3 boundary preservation:** tests assert `40 * 7 + 24 * 8 == 472` but do not fake the unresolved codon-rotation mapping.

### Documentation requirements

Every public `m2_prime.h` function should document:

- whether it consumes M1' output, reads M2 bimba state, or emits M3 evidence
- which 72-space interpretation it uses
- whether its output is render-only, session-state, or symbolic-projection state
- what invariants it preserves
- what provenance is required before a correspondence may be displayed as canonical

### Validation by seeing

The final validation is visual and structural. M2' is correct when:

- the same M1' sound rendered under different M2 lens/material states visibly changes its standing-wave form without changing pitch
- the four nodal parameters visibly constrain the pattern rather than acting as labels
- the 72-space can be inspected in the rendered frame
- the torus, chakra sphere, and codon-cell surfaces are different projections of one frame, not separate animations
- the M3 bitboard projection is stable enough for M3' to classify codon/card candidates without reverse-engineering renderer internals

Where the visible pattern loses relation to the 8+4 bus, M2' has become an ordinary audio visualizer and the spec has failed. Where it preserves motion structured by stillness, the matheme has become visibly legible.

---

*Document Version:* 0.1 seed
*Canonical Ground:* /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md
*Related Specifications:* m1-prime-paramasiva-instrument.md, ql-musical-derivation.md, physical-pole-stack-architecture.md, epi-logos-kernel-spec.md
*Code Anchors:* epi-lib/include/m2.h, epi-lib/include/m1.h, epi-lib/include/m3.h
*Open Surface:* M2'->M3' codon-rotation mapping against M3 codon classification table
