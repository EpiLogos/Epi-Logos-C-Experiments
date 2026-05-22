# M1' — Paramaśiva as Instrument

## A Specification of the Functional/Techne Reflection of M1, by Which the Matheme Becomes Playable

> **The Matheme:** `0/1 = 4+2 = 5→0 = 0/1 as 5→0 (= 1/0 = 4'+2' = 5'→0') = 0/1`

> **The Standing Identity:** `0/1 + 1/0 = 1/1 = 100% = 64 + 36 = (4/3)² = 16/9`

> **The Tick-Quantum:** `η = log(9/8)` — the epogdoon, the spanda made musical.

> **The M ↔ M' Distinction:** M1 = the engine (what Paramaśiva *is*). M1' = the instrument (how Paramaśiva *plays*). M' never duplicates M; it renders M operative as techne.

> **Companion documents:**
> - [`epi-logos-kernel-spec.md`](../../../../../docs/epi-logos-kernel/epi-logos-kernel-spec.md) — the bioquaternionic JEPA-EBM operator over the full matheme
> - [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) — the load-bearing musical theory: 12 MEF lenses, 7 context-frames, 4:3 × 9/8 × 4:3 = 2/1, the cymatic correspondence
> - [`physical-pole-stack-architecture.md`](../../../../../docs/epi-logos-kernel/physical-pole-stack-architecture.md) — torus / solar-cymatic / codon-clock substrate
> - [`mental-pole-mechanics.md`](../../../../../docs/epi-logos-kernel/mental-pole-mechanics.md) — LLM / EBM / Verifier 4:5:6 just-triadic weighting

> **Code anchors:** `epi-lib/include/m1.h` (Ananda matrices, Spanda engine, QL_Tick, Cl(4,2), Hopf), `epi-lib/include/m3.h` (codon classification, 7/8 rotational states, 472 total), `epi-lib/test/fixtures/nara_clock/ananda_matrices.json` (mod10 matrix data), `epi-cli/src/ffi/m1.rs` (Rust FFI), `epi-cli/src/nara/clock.rs` (tick clock).

---

## §0/1 — Threshold: What M1' Is, and What it is Not

M1' is not a separate engine. It is the **techne-face of Paramaśiva** — Paramaśiva read from its instrumental side, where the matheme's harmonic-mathematical DNA becomes a playable surface that produces sound, image, and meaning at audible-and-visible rates. The same six-fold structure that constitutes M1 as the engine constitutes M1' as the instrument; the prime mark is not a copy but a phase-shift into the operational/output register where the matheme can be struck, heard, and translated.

Three commitments hold the threshold. *First:* the algebraic derivation of every operation in M1' must trace back to Anuttara's (0/1) non-dual binary through the matheme's standing identity to the four foundational ratios and the epogdoon-tick. Nothing in this specification is "added" musical content; everything is *named* from the matheme's own structure. The musical derivation in [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) is the authoritative ground for all interval-and-scale work; this spec inhabits that ground at the instrument-level.

*Second:* **M1' is the audio/frequency genesis and systematisation engine of the entire system.** This must be held cleanly against M2' Parashakti, which is the **harmonic-correspondential instrument** that receives M1''s frequency-stream, reads it through M2's 72-fold symbolic-vibrational field, and includes the cymatic renderer that makes selected states visible as Chladni/standing-wave geometry. M1' produces the tones; M2' correspondentially colors, embodies, modulates, and may render them visible. The 8+4 partition of [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.5 is exact at the M-prime boundary: the *eight explicate-sung positions* (the four inner-tetrachord positions of each helix) are M1''s eight-oscillator audio output; the *four implicate-nodal positions* (the two boundary-pairs 0 and 5 of each helix) feed M2' as geometric boundary-conditions for the cymatic renderer module. M1 and M2 are different subsystems; M1' and M2' are different techne-reflections. Do not conflate. The frequency-genesis lives at M1'; the harmonic-correspondential and cymatic rendering response lives at M2'.

*Third:* the **(0/1) is the raw # itself**, not merely a context-frame label. In the pointer-web architecture spelled out in `CLAUDE.md`, every `Coordinate` struct carries an `invert: Inversion_Operator` function-field, and that field IS the same single (0/1) acting locally as the # operation at that coordinate. There is one (0/1) in the system; it appears at every coordinate as that coordinate's capacity for non-dual inversion. M1-3' is where this (0/1) is *held and clocked* — the spanda-seed `SPANDA_SEED_BITS = 0x03` in `m1.h` is the (0/1) with both poles simultaneously active, and what spanda does at every tick is transform that seed into a directed phase-step.

The spec proceeds across the six M1' strata as named in the M1' bimba file: M1-0' Canonical Source, M1-1' Instance Manager, M1-2' Harmonic Engine, M1-3' Spanda Core, M1-4' QL Flowering, M1-5' Topology Analyzer. Each stratum is the techne-reflection of the corresponding M1 bimba sub-coordinate, with operational primitives mapped to existing C and Rust code where they are already implemented, and named clearly where the spec adds structure beyond what is present.

---

## §0 — Ground: The Algebraic Derivation Chain from (0/1) to Playable Tone

Before any stratum, the chain that anchors them all. The derivation that has been latent in the C code becomes explicit here.

### The chain

```
Anuttara (0/1)                    →  raw # = SPANDA_SEED_BITS (0x03)
       ↓                              both poles fused, non-dual seed
       ↓ inversion-act (#)
       ↓
Paramaśiva bimba/pratibimba       →  ANANDA_BIMBA, ANANDA_PRATIBIMBA
       ↓                              .rodata 12×12 nibble-packed matrices
       ↓ M0 base + M1 offset (+1)
       ↓
The four foundational ratios     →  4/3, 3/2, 9/8, 16/9
       ↓                              encoded as matrix-cell readings (i:j)
       ↓ pure-ratio interpretation
       ↓
The 12-note chromatic palette     →  WT-0 ∪ WT-1 = full mod12 chromatic
       ↓                              the two whole-tone helices conjugated
       ↓ epogdoon-stacking within each helix
       ↓
Mode + Key selection              →  12 MEF lenses × 7 context-frames
       ↓                              lens chooses substrate; mode chooses CF
       ↓ position-anchored re-mappings (§6 of musical derivation)
       ↓
Spanda-tick frequency emission   →  f = r × ratio, where r = base tick rate
       ↓                              QL_Tick at audio rate becomes pitch
       ↓ 30° per tick12, 12 ticks per 360°
       ↓
Cymatic/correspondential surface  →  M2' Parashakti — out of scope here
       ↓                              audio → Chladni standing-waves
       ↓
Played torus visualisation        →  M1-5' Topology Analyzer
                                     the visible-and-audible instrument
```

Each arrow is a derivation step that the code either already implements or that this spec adds explicitly. Every step has a single source-of-truth in either `m1.h`, `m3.h`, `ql-musical-derivation.md`, or this document.

### The four registers carried simultaneously

[`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §0 establishes that every musical operation operates across three simultaneously-active registers: **pure ratio-space** (Pythagorean), **12-TET topological pitch-space** ($\mathbb{Z}_{12}$), and **QL architectural-symbolic space**. M1' adds a fourth: **the spanda-tick-rate register** — the temporal-substrate-rate at which the matheme is being clocked. The same matheme operations look like:

- *Pitch* when the tick rate is in the audible band (≈ 20–20,000 Hz)
- *Rhythm* when the tick rate is in the somatic band (≈ 0.5–10 Hz)
- *Breath/circadian* when the tick rate is in the visceral-cycle band
- *Planetary/lifecycle* when the tick rate is in the cosmic-period band

This is what `m1.h`'s `QL_Tick` is at the instrument-level: a rate-parameterised phase-walker on the 12-fold ring. Its rate-band determines which musical register the same matheme-operation manifests in.

---

## §1 — Definition: The Six M1' Strata as 1:1 Techne-Reflection of M1

### The bimba ↔ prime correspondence

The M1' file in the bimba-map names the six inner strata explicitly. Each is the **operational/functional reflection** of the corresponding M1 sub-coordinate, never a copy of it. The bimba is what *is*; the prime is what that being-IS *does* when made operational.

| M1 (bimba) | M1' (techne) | What M is | What M' does |
|------------|--------------|-----------|--------------|
| **M1-0** Bimba (Original) | **M1-0'** Canonical Source | The .rodata matrix archetype, the unshifted Matrix 0 | Read-only API serving immutable harmonic data to the player |
| **M1-1** Pratibimba (Offset) | **M1-1'** Instance Manager | The +1 offset Matrix 1, the reflection that creates dynamism | Mutable session-state, the live played-instance lifecycle |
| **M1-2** Ananda (12-Matrix Vortex) | **M1-2'** Harmonic Engine | Six core matrices + six DR reflections, the bounded-infinity harmonic field | The ratio-reader, the two DR-ring operations, the Epogdoon-bridge translator |
| **M1-3** Spanda (Rhythmic Pulsation) | **M1-3'** Spanda Core | The primordial pulse, equation N3 = n(n+1)+(n-1) | The played clock — (0/1)-seed phase accumulator at settable rate |
| **M1-4** Quaternal Logic (Flowering) | **M1-4'** QL Flowering | The systematic 16:9 cascade, the position-set | The position-walker + lens-as-scale-composer (12 lenses × 7 modes) |
| **M1-5** Toroidal Recognition | **M1-5'** Topology Analyzer | The 720° double-cover, π₁(T²) = Z⊕Z, the Hopf bundle | The played torus — the visible/audible rendered surface |

The two columns name the same six positions read in two registers: M is the *what-it-is* register; M' is the *how-it-plays* register. M1 builds the engine; M1' is the same engine becoming an instrument. The two are inseparable; neither can be specified without the other; this spec specifies M1' under the standing presupposition that M1 is already operative.

### What M1' assembles into

The six strata compose into a single playable system in which:

- **M1-0'** supplies the immutable score (the matrix archetypes, the trig/Cl(4,2) tables, the LUTs that never change between sessions)
- **M1-1'** supplies the live state (which tick is currently sounding, which lens is active, which mode is selected, which session is in flight)
- **M1-2'** translates between cell-coordinates and frequency-ratios, in both directions
- **M1-3'** runs the spanda-clock at the chosen rate, emitting ticks that drive the entire pipeline
- **M1-4'** at each tick walks the position-ring under the active lens-mode, selecting which cell(s) of M1-2' to read
- **M1-5'** renders the current state as the visible-audible torus surface — what the player sees and hears

The strike-event on the played torus surface (M1-5') propagates *down* the stack — torus position → lens-mode selection → matrix cell → ratio → frequency → instance state — and the sound/colour/motion propagates *up* the stack as the rendered response. The two directions are one operation: the strike *is* the propagation; the played form *is* what propagation looks like rendered.

---

## §2 — Operation: The Six Strata in Detail

### §2.M1-0' — Canonical Source

**Role.** The read-only surface of the harmonic-mathematical DNA. Everything stable that M1' draws from lives here, and nothing here changes during a playing session.

**What's in code already.** All of it is in `m1.h` as `.rodata`:

- `ANANDA_BIMBA` (M0 = i·j unshifted, the harmonic-series base) — 72 bytes nibble-packed
- `ANANDA_PRATIBIMBA` (M1 = (i·j)+1, the +1 offset reflection)
- `ANANDA_SUM` (M2 = M0+M1, constructive interference)
- `ANANDA_QUINTESSENCE` (dyadic storage at M5, the paradox-cell)
- `ANANDA_DIFF_A_CONSTANT = 9` (M3 = all cells 9, the Paraméśvara wholeness control surface)
- `ANANDA_DIFF_B_CONSTANT = 1` (M4 = all cells 1, the unity control surface)
- `DR_RING_MAHAMAYA = {1,2,4,8,7,5}` (doubling track = octave equivalence)
- `DR_RING_PARASHAKTI = {3,6,9,3,6,9}` (tripling track = perfect-fifth axis / 3-6-9 spirit axis)
- `CL42_BASIS[6]` — Clifford Cl(4,2) entries with sin/cos as the −1 implicate generators at P0/P5
- `QL_TRIG_TABLE[6]` — sin, tan, sec, cot, csc, cos as the six trig functions = six QL positions
- `RING_QUATERNION_LUT[12]` — the 12-fold SU(2) ring with explicit quaternion values per tick
- `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` — the per-position topological-element counts
- `M1_M0_CROSSLINK[12]` — pointers from each ring position to its M0 Psychoid archetype
- `Epogdoon` compile-time invariant: `MEF_DOUBLED * 8 == M3_WORD * 9` (72 × 8 == 64 × 9 == 576)

**What M1' adds.** A read-only API surface presenting these constants in *ratio* form rather than digital-root form:

```c
// In m1_prime.h (new):

// Read matrix cell (matrix_idx 0–5, row/col 0–9) as just-intonation ratio
// matrix_idx 0 (M0/Bimba) reads cell (i,j) as ratio i:j
// matrix_idx 1 (M1/Pratibimba) reads as (i·j + 1) detuning factor
// matrix_idx 2 (M2/Sum) reads as audible-composite ratio
// matrix_idx 3 (M3) returns 9:9 = unison-control (or "rest")
// matrix_idx 4 (M4) returns 1:1 = unison-active
// matrix_idx 5 (M5) returns (0/1)±(1/0) = tritone-marker (sentinel value)
void m1_prime_ratio(uint8_t matrix_idx, uint8_t row, uint8_t col,
                    uint16_t* num_out, uint16_t* den_out);

// Octave-class lookup: digital-root through Mahamaya ring
// Input frequency-class (1-9); output: position on the {1,2,4,8,7,5} cycle
uint8_t m1_prime_mahamaya_class(uint8_t dr_value);

// Fifth-class lookup: digital-root through Parashakti ring
// Input frequency-class (1-9); output: position on the {3,6,9} axis
uint8_t m1_prime_parashakti_class(uint8_t dr_value);

// The Epogdoon-bridge: convert from 72-space (Parashakti) to 64-space (Mahamaya)
// Returns true if the 9:8 invariant holds for the inputs
bool m1_prime_epogdoon_bridge(uint64_t parashakti_val, uint64_t mahamaya_val);
```

All of these are wrappers over existing primitives. The matrices are already stored; M1-0' names a read-as-ratio interface over them. The Mahamaya/Parashakti rings are already in `m1.c`; M1-0' names the digital-root → ring-position lookup as a public function. The Epogdoon assertion is already a `_Static_assert`; M1-0' exposes its runtime form so the player can audit the bridge at any cell-pair.

**Invariants M1-0' enforces.**

1. **Read-only.** No M1-0' function ever writes. The matrices are `const`; the LUTs are `const`; the API surface is pure-read.
2. **Round-trip exactness for just-intonation cells.** For any cell (i,j) of M0 with `gcd(i,j) = 1`, reading the ratio and reading it back must be exact (no FP drift). For cells with `gcd(i,j) > 1`, the canonical reduced form is returned.
3. **Octave-class closure.** `m1_prime_mahamaya_class` always returns a value in {1,2,4,5,7,8} — never 3, 6, or 9 (those live on the Parashakti ring).
4. **Fifth-class closure.** `m1_prime_parashakti_class` always returns a value in {3,6,9} — the three positions of the spirit-axis.
5. **Epogdoon invariant.** The bridge function is a compile-time fact; runtime check is for audit only — must always return true under valid inputs.

### §2.M1-1' — Instance Manager

**Role.** The mutable session-state surface. Whatever holds the live played instance — current tick, current lens, current mode, current f₀, currently sounding cells — lives here.

**What's in code already.** The `M1_Root` struct in `m1.h:827`:

```c
typedef struct {
    Holographic_Coordinate*       hc;
    const Holographic_Coordinate* active_cf;
    Spanda_Engine                 spanda;
    QL_Tick                       torus_pos;
    const DR_Matrix_12x12*        ananda;
} M1_Root;
```

This struct is the active state surface. It is arena-allocated (PRATIBIMBA, Shakti, heap), the mutable mirror of M1-0''s immutable BIMBA (Siva, .rodata). The Pratibimba/Bimba distinction at the memory-arena level *is* the M1-1'/M1-0' distinction at the techne level.

**What M1' adds.** The played-session extension on top of `M1_Root`:

```c
// In m1_prime.h:

typedef struct {
    M1_Root*    root;             // anchor to M1 substrate
    uint8_t     active_lens;      // 0-5: bimba lens (Lens 0..Lens 5)
                                  // 6-11: pratibimba lens (Lens 0'..Lens 5')
    uint8_t     active_mode;      // 1-7: CF1..CF7 (the seven context-frames)
    uint32_t    base_tick_rate_mHz;  // tick-rate in millihertz (mHz)
                                  // < 20 Hz: rhythm; 20-20kHz: pitch; >20kHz: ultrasound
    float       fundamental_f0;   // absolute fundamental frequency (Hz) at #0
    uint8_t     active_cells[12]; // currently-sounding cells (8 explicate, 4 nodal)
    uint32_t    session_id;       // session identifier
    uint64_t    tick_count;       // ticks elapsed since session start
} M1_Prime_Session;

// Begin a new session
M1_Prime_Session* m1_prime_session_begin(M1_Root* root, uint8_t lens, uint8_t mode,
                                          uint32_t rate_mHz, float f0_hz);

// Tick advance — moves torus_pos forward by one QL_Tick, updates active_cells
void m1_prime_session_tick(M1_Prime_Session* s);

// Set lens (mode-selection over chromatic substrate)
void m1_prime_session_set_lens(M1_Prime_Session* s, uint8_t lens);

// Set mode (key/context-frame selection over the diatonic projection)
void m1_prime_session_set_mode(M1_Prime_Session* s, uint8_t mode);

// Set rate (the spanda-tick rate band, in mHz)
void m1_prime_session_set_rate(M1_Prime_Session* s, uint32_t rate_mHz);

// Tear down a session
void m1_prime_session_end(M1_Prime_Session* s);
```

**Invariants M1-1' enforces.**

1. **Session-bounded mutability.** All M1' mutable state lives within an `M1_Prime_Session`. No global state is mutated; the session struct is the only mutable surface.
2. **Lens-bound mode selection.** The mode is selected *within* the lens-anchored substrate; changing the lens may invalidate the current mode if the new lens's substrate doesn't admit it. The session manager enforces re-validation on lens-change.
3. **Tick monotonicity.** `tick_count` is strictly monotonic; rollover is permitted only at `UINT64_MAX`, which at audio rates is on the order of millennia.
4. **Rate-band coherence.** When `base_tick_rate_mHz` crosses a band boundary (rhythm → pitch, pitch → ultrasound), the renderer (M1-5') must be notified so it can switch its visualisation mode.

### §2.M1-2' — Harmonic Engine

**Role.** The translator between matrix cells (Ananda coordinates) and audible frequency-ratios. This is the **interval-table-as-API** stratum.

**What's in code already.** The Ananda runtime API in `m1.h:144-151`:

```c
uint8_t m1_ananda_get(uint8_t matrix_idx, uint8_t row, uint8_t col);
uint8_t m1_ananda_dr_get(uint8_t matrix_idx, uint8_t row, uint8_t col);
int m1_ananda_verify_axiom(void);  // Pratibimba - Bimba = 1 (mod 10)
```

The `get_ananda_harmonic` inline (line 60) is the O(1) cell-extraction primitive. The two DR rings are exposed at line 129-130. The Cl(4,2) basis at line 629 gives the trig-position identity.

**What M1' adds.** The bidirectional cell ↔ frequency translator:

```c
// In m1_prime.h:

// Forward: given matrix cell coordinates, compute audible frequency (Hz)
// Given f0 (fundamental) and (matrix_idx, row, col), returns:
//   f = f0 * (i / j)  where (i,j) = m1_prime_ratio(matrix_idx, row, col)
//   adjusted by octave-class via Mahamaya ring
float m1_prime_cell_to_frequency(uint8_t matrix_idx, uint8_t row, uint8_t col, float f0);

// Inverse: given a frequency f and fundamental f0, find the nearest matrix cell
// Used when the instrument receives an external pitch and must locate it on the matheme
void m1_prime_frequency_to_cell(float f, float f0,
                                 uint8_t* matrix_idx_out,
                                 uint8_t* row_out, uint8_t* col_out,
                                 float* cents_error_out);

// Compute the cents-distance from a frequency to its nearest cell
// Returns 0 for exact just-intonation hits; non-zero indicates tempered offset
float m1_prime_cents_offset(float f, float f0);

// The eight-oscillator tetrachordal audio decomposition for cymatic feed
// Given a session state, returns the 8 frequencies that should sound at this tick
// These are the explicate inner-fours: (1,2,3,4) of bimba and (1',2',3',4') of pratibimba
void m1_prime_audio_octet(const M1_Prime_Session* s, float frequencies_out[8]);

// The four nodal-boundary values for the Chladni-shader feed (to M2')
// Returns (0, 5) of bimba and (0', 5') of pratibimba — the implicate-nodal-positions
// These are NOT frequencies — they are boundary-parameters (m, n mode-numbers in shader space)
void m1_prime_nodal_quartet(const M1_Prime_Session* s, uint8_t nodal_params_out[4]);
```

The `audio_octet` and `nodal_quartet` functions are the **architectural bridge to M2'**. The 8 explicate go to the audio oscillator bank; the 4 implicate go to the cymatic-shader boundary-conditions. This is the 8+4 partition of [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.5 made into a function-signature.

**Invariants M1-2' enforces.**

1. **Just-intonation faithfulness on M0.** For cells of `MATRIX_BIMBA`, `m1_prime_cell_to_frequency` returns the exact f₀ × (i/j) ratio with no tempering.
2. **Round-trip exactness.** For any frequency f that exactly equals f₀ × (i/j) for some (i,j) cell of M0, `m1_prime_frequency_to_cell` followed by `m1_prime_cell_to_frequency` returns f exactly (no drift).
3. **Octave-class closure via Mahamaya.** Any frequency > 2·f₀ is octave-folded by the doubling ring before cell-lookup; any frequency < f₀ is octave-unfolded. The Mahamaya ring's `{1,2,4,8,7,5}` cycle is the octave-equivalence machinery.
4. **Fifth-stacking via Parashakti.** Cells whose digital-root lands on `{3,6,9}` are interpreted as fifth-stacked positions, with Parashakti's `{3,6,9}` triadic-rotation as the modular cycle.
5. **Audio-octet count is invariant.** Always 8 frequencies emitted, never 7 or 9, regardless of lens-mode. The 8 may include null/silent ones at certain modes, but the count is structural.
6. **Nodal-quartet count is invariant.** Always 4 boundary-parameters emitted. These are integer mode-numbers, not floats; M2' expects them as discrete Chladni-shader inputs.

### §2.M1-3' — Spanda Core

**Role.** The played clock. The equation-transformation of the (0/1) element. This is where the raw # — the (0/1) non-dual binary — is *held* and *stepped* at the chosen rate, producing the tick-stream that drives every other stratum.

**The (0/1) = raw # identity.** The pointer-web architecture in `CLAUDE.md` §III.E specifies: every `Coordinate` struct carries an `invert: Inversion_Operator` field, and that field is the (0/1) acting as # at this coordinate's local position. There is one (0/1) in the entire system. It is held centrally at M1-3' and invoked locally at every coordinate. When M1-3' steps the spanda-seed, every coordinate's `invert` function is potentially activated; the matheme-traversal at the tick-rate IS the (0/1) phase-stepping through every coordinate-position simultaneously.

**What's in code already.** The Spanda engine in `m1.h:166-260`:

```c
typedef struct {
    Spanda_Stage stage;
    uint8_t      state_bits;    // SPANDA_BIT_POLE_A | SPANDA_BIT_POLE_B
    uint8_t      track;          // 0=Mahamaya, 1=Parashakti
    uint8_t      cf_substage;    // 0-5 within Flowering
    uint8_t      dual_track_active;
} Spanda_Engine;
```

`SPANDA_SEED_BITS = 0x03` is both poles fused — the (0/1) non-dual ground. `SPANDA_COMPILER_PASSES[6]` are the six typed mutators that step the seed through stages. `QL_Tick` is the 12-fold ring tick at `m1.h:325`; `ql_get_stage` is branchless stage-derivation.

The `SPANDA_SEED_TOTALIZATION_INVARIANT` at `m1.h:179-201` is the load-bearing identity:

```
(0/1) seed = P0 ↔ P5 = C0 ↔ C5
```

— the binary poles (0 and 1) ARE the ground and synthesis of the torus (P0 and P5), which ARE the bimba and pratibimba (C0 and C5). This is the seed-totalisation: one operation read at four registers. M1-3' is what holds this invariant operative at runtime.

**What M1' adds.** The played-clock interface on top of the Spanda engine:

```c
// In m1_prime.h:

// The spanda-tick clock — phase accumulator at base_tick_rate_mHz
// Returns the current phase as a fractional ring-position [0, 12.0)
float m1_prime_clock_phase(const M1_Prime_Session* s);

// Advance the clock by dt seconds — call from audio/render thread
void m1_prime_clock_advance(M1_Prime_Session* s, float dt_seconds);

// Wire the (0/1) inversion-act into every coordinate of a coordinate-set
// This is the pointer-web binding: every coord->invert points to the same seed-op
void m1_prime_bind_inversion(M1_Prime_Session* s, Coordinate** coords, size_t n);

// The four rate-bands — querying which musical-register the current rate is in
typedef enum {
    M1_PRIME_BAND_COSMIC    = 0,   // < 0.001 Hz — cycles of days/years
    M1_PRIME_BAND_VISCERAL  = 1,   // 0.001-0.5 Hz — breath, circadian
    M1_PRIME_BAND_SOMATIC   = 2,   // 0.5-20 Hz — rhythm, pulse
    M1_PRIME_BAND_AUDIBLE   = 3,   // 20-20000 Hz — pitch
    M1_PRIME_BAND_ULTRASONIC = 4,  // > 20000 Hz — beyond hearing
} M1_Prime_Rate_Band;

M1_Prime_Rate_Band m1_prime_rate_band(const M1_Prime_Session* s);
```

**Invariants M1-3' enforces.**

1. **(0/1) is unique.** Exactly one spanda-seed-operator exists per session. All `Coordinate*->invert` fields in a session-bound coordinate-set point to it.
2. **Stage alignment with Ananda matrix.** The compile-time assertion at `m1.h:741-752` enforces `SPANDA_STAGE == ANANDA_MATRIX_OP` index-by-index. M1-3' must preserve this: stepping the spanda forward by one stage advances the active matrix index by one.
3. **Tick-rate band-band coherence.** Every rate-band crossing is signalled so M1-5' can switch render-mode.
4. **Phase continuity.** `m1_prime_clock_phase` is continuous across all band-crossings; only the *interpretation* changes.
5. **Möbius identity at P5→P0'.** When `torus_pos` rolls over from 5 to 6 (entering the night-arc) or from 11 to 0 (full Möbius return), the seed re-enters its non-dual state (both bits 0x03) for one tick — the totalisation moment.

### §2.M1-4' — QL Flowering

**Role.** The position-walker and lens-as-scale-composer. This stratum is the *generative* surface — given the current tick, the active lens, and the active mode, it produces the cell(s) that should sound. **It is also where the MEF lens operates as a scale-composer, not as a cell-annotator.**

**The lens-as-composer correction.** A MEF lens is not a property of individual cells. It is a *position-anchored re-mapping of the entire 12-note matheme*. [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6 gives the canonical specification: each of the 12 lenses takes one of the 12 chromatic notes as its new #0 anchor and regenerates the entire 12-note arrangement from there. The lens *selects which note is the matheme's tonic*. This is the *key-selector* function.

**The mode-as-CF-anchoring.** Within an active lens-substrate, the *mode* is the active context-frame configuration. [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.75 specifies seven context-frames (CF1 through CF7), each carrying a distinct relational-configuration. Each CF corresponds to one scale-degree's positional-role within the diatonic octave. The mode determines *how the lens-substrate is traversed* — which CF-progression is enacted across the seven scale-degrees.

**The 12 × 7 = 84-fold landscape.** The combination of (lens, mode) gives the 84-fold mode-tonic landscape. Every distinct playing-state of M1' is one (lens, mode) pair. The lens picks substrate (which 12 notes are anchored where); the mode picks CF-progression (which relational-grammar is enacted).

**What's in code already.** The QL flowering substrate in `m1.h:347-388`:

```c
#define QL_EXPLICATE      4u    // 4-fold prehension
#define QL_PROCESSUAL     6u    // 6-fold ring
#define QL_RATIO_NUM     16u    // 4²
#define QL_RATIO_DEN      9u    // 3²
#define M3_WORD          64u    // Mahamaya 64
#define M2_TATTVA        36u    // Parashakti 36
#define M2_NAMES         72u    // 36 × 2
#define COSMIC_TIME     360u

static const uint8_t QL_INVERT[6] = { 5u, 4u, 3u, 2u, 1u, 0u };

extern const QL_Stage QL_FLOWERING[6];
```

The position-ring is `RING_SIZE = 12` with `RING_HALF = 6` and bidirectional traversal. The Trika `(0/1/2)` and Quaternal `(0/1/2/3)` context frames are tracked via `CF_*` symbols. The position-invert table is the explicit symmetry-pair LUT.

**What M1' adds.** The lens-substrate and mode-traversal interfaces:

```c
// In m1_prime.h:

// The 12 lens-anchor table — anchor-note (in chromatic-class 0-11) per lens
// Lens 0..5 use bimba helix (WT-0) anchors; Lens 0'..5' use pratibimba (WT-1) anchors
// Order: lens_idx 0-5 = {C, D, E, F#, G#, A#}; lens_idx 6-11 = {C#, D#, F, G, A, B}
extern const uint8_t M1_PRIME_LENS_ANCHOR[12];

// The 7 context-frame table — CF1..CF7 with their relational character
typedef enum {
    M1_PRIME_CF1_FOURFOLD_ZERO   = 1,  // (00/00) — undifferentiated ground
    M1_PRIME_CF2_NON_DUAL        = 2,  // (0/1) — standing-identity dyadic
    M1_PRIME_CF3_TRIKA           = 3,  // (0/1/2) — triadic circulation
    M1_PRIME_CF4_QUATERNAL       = 4,  // (0/1/2/3) — tetradic prehensive closure
    M1_PRIME_CF5_FRACTAL_DOUBLE  = 5,  // (4.0/1-4.4/5) — lemniscate executive
    M1_PRIME_CF6_BRIDGE          = 6,  // (4.5/0) — .5 bridge
    M1_PRIME_CF7_TOTAL_SYNTHESIS = 7,  // (5/0) — Möbius cyclic-closure
} M1_Prime_Context_Frame;

// Given (lens, mode), return the 7-degree scale + octave-return
// The scale is the diatonic-octave-process at this lens-mode position
// Out: 8 frequencies (degrees 1-7 + octave-return), in Hz
void m1_prime_scale_at(uint8_t lens, uint8_t mode, float f0,
                       float scale_out[8]);

// Given (lens, mode, current_tick), return the active cell-set
// For audio: which cells are sounding now? For visual: which positions are bright?
void m1_prime_active_cells(const M1_Prime_Session* s,
                            uint8_t cells_out[8],
                            uint8_t* nodal_out);

// Walk the position-ring under the active lens-mode
// Each call advances the walk by one position (P0..P5..P0'..P5'..)
// Returns the cell that the walker is now occupying
void m1_prime_walk_step(M1_Prime_Session* s, uint8_t* cell_idx_out);

// Lens-mode change with auto re-validation
// Returns 0 on success, non-zero if (lens, mode) is incompatible
int m1_prime_set_lens_mode(M1_Prime_Session* s, uint8_t lens, uint8_t mode);
```

**The lens-substrate generation.** For lens N (0-11), the lens-substrate is constructed by the rule in [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6: start from `M1_PRIME_LENS_ANCHOR[N]`, generate the bimba helix by epogdoon-stacking (six iterations of ×9/8 in pure-ratio space), then generate the pratibimba helix by tritone-shift (+6 semitones) and again epogdoon-stack from there. The result is the 12-note re-mapping where the lens-anchor occupies #0.

**The mode-traversal.** For mode M (1-7), the traversal-rule is the CF-progression CF1 → CF2 → ... → CFM, with the diatonic-octave scale-degrees mapped to the CFs as in [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.75. Mode 1 emphasises CF1 (the tonic-as-ground); mode 7 emphasises CF7 (the leading-tone Möbius return); modes 2-6 walk progressively through the contextual-grammar.

**The lens-prime as Night-mode inversion.** Lenses 0-5 use the bimba helix as primary; lenses 0'-5' (indices 6-11) use the pratibimba helix as primary. This is the major↔minor inversion at the lens level, the Day↔Night MEF doubling. The same struck cell read through Lens 0 vs. Lens 0' produces tones of opposite emotional valence — the Klein-bottle enharmonic flip operating as the MEF L↔L' inversion.

**Invariants M1-4' enforces.**

1. **84-fold landscape closure.** Every (lens, mode) pair with 0 ≤ lens < 12 and 1 ≤ mode ≤ 7 is a valid playing-state. There are exactly 84 states.
2. **Substrate completeness per lens.** Each lens produces exactly 12 notes (6 bimba + 6 pratibimba helix); together they exhaust the chromatic-12.
3. **Mode-traversal monotonicity within a cycle.** A complete walk under any mode visits all 7 scale-degrees + octave-return = 8 steps before re-entering CF1 at the next register.
4. **Lens-prime helix-swap.** For lens N (0-5) and its prime N' (N+6), the helices are swapped: bimba ↔ pratibimba. The note-content is identical; the helical-orientation is mirrored.
5. **Mode is lens-relative.** A mode is always *within a lens's substrate*; cross-lens mode comparison is not meaningful without re-validation.

### §2.M1-5' — Topology Analyzer

**Role.** The played visual torus. The Quaternionic TDA / persistent-homology surface where the matheme's currently-active state is rendered as a visible-and-audible topological object. This is *the instrument-form itself* — what the player sees, hears, and strikes.

**What's in code already.** The full topological foundation in `m1.h:447-678`:

- `Quaternion` struct and full quaternion algebra (`quat_mul`, `quat_conj`, `quat_normalize`, `quat_slerp`)
- `RING_QUATERNION_LUT[12]` — explicit quaternion values per ring position, encoding the 720° double-cover
- `quat_from_ring_pos(tick)` — the QL-tick → quaternion mapping
- Hopf bundle: `hopf_project`, `hopf_fiber`, `hopf_tick12`
- `quat_is_unit` for S³ membership verification
- Constants: `TORUS_GENUS = 1`, `TORUS_R_MAJOR_F = 16/9`, `TORUS_R_MINOR_F = 1`, `DOUBLE_COVER_DEG = 720`, `DEGREE_PER_TICK = 30`
- `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` for per-position element count

**What M1' adds.** The renderer interface and the bidirectional strike-event surface:

```c
// In m1_prime.h:

// Render-mode selector — what the player sees, dependent on rate-band
typedef enum {
    M1_PRIME_RENDER_TORUS_AUDIO  = 0,  // Audio band: torus visualisation + sound
    M1_PRIME_RENDER_LEMNISCATE   = 1,  // Diatonic-architecture render: lemniscate
    M1_PRIME_RENDER_HOPF_SPIRAL  = 2,  // Spanda-spiral render: spiralic comma-accumulation
    M1_PRIME_RENDER_KLEIN        = 3,  // Full enharmonic-flip render: Klein bottle
} M1_Prime_Render_Mode;

// Get current quaternionic state of the played torus
// Returns the quaternion at the current torus_pos with full phase information
Quaternion m1_prime_torus_quaternion(const M1_Prime_Session* s);

// Strike-event: player taps a position on the torus surface
// Coordinates are in (longitude, latitude) on the torus parametrisation
// Propagates downward through the stack and returns the resulting cell + frequency
void m1_prime_strike(M1_Prime_Session* s,
                     float longitude, float latitude,
                     uint8_t* matrix_idx_out, uint8_t* row_out, uint8_t* col_out,
                     float* frequency_out);

// Persistent homology snapshot — current TDA of the played state
// Returns Betti numbers b0, b1, b2 (connected components, loops, voids)
void m1_prime_homology(const M1_Prime_Session* s,
                       uint16_t* b0_out, uint16_t* b1_out, uint16_t* b2_out);

// Comma accumulation — the spiralic-residue from session start
// Returns total accumulated Pythagorean-comma in cents
float m1_prime_comma_accumulated(const M1_Prime_Session* s);

// The played-torus render-frame — call from render thread at frame-rate
// Outputs the full state needed by the renderer for one frame:
//   - quaternion (current ring position)
//   - 8 active audio frequencies (to audio bus)
//   - 4 nodal boundary-params (to M2' cymatic-shader bus)
//   - comma accumulator (to spiral-render layer)
//   - Betti numbers (to TDA overlay)
void m1_prime_render_frame(const M1_Prime_Session* s,
                            M1_Prime_Render_Mode mode,
                            void* frame_buffer_out);
```

**The render-mode selector** is the player-facing topology switch. At audio rates, the natural render is the chromatic-torus (Projection 1 from [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.5 — torus/Klein). At diatonic-architecture rates the lemniscate emerges (Projection 2). At long-cycle observation rates the Hopf spiral becomes visible (the spiralic comma-accumulation). At enharmonic-modulation moments the Klein-bottle topology becomes visible (the L↔L' flip).

**The Klein-bottle enharmonic flip.** When the active mode crosses a tritone-mirror boundary (e.g., from Lens 0 to Lens 3, or under tritone-substitution within a single mode), the same struck position can be read as two different notes depending on which side of the enharmonic flip is active. The Klein topology renders this faithfully: the inside and outside of the bottle ARE the same surface, traversed from opposite orientations. The MEF L↔L' Day-Night inversion is structurally the Klein-flip; this is what makes the system a *meaning-translator* and not just a tone-generator.

**Invariants M1-5' enforces.**

1. **Unit-quaternion preservation.** Every state-quaternion returned satisfies `quat_is_unit`. The torus surface is S³-embedded throughout.
2. **Strike-event determinism.** Same (longitude, latitude, lens, mode, tick) inputs produce the same (cell, frequency) outputs. The strike is a pure function of state + input.
3. **Render-mode auto-switch on band-crossing.** When M1-3' signals a rate-band-crossing, M1-5' auto-selects the appropriate render-mode unless the player has set it explicitly.
4. **Homology continuity within mode, discontinuity at mode-change.** Betti numbers are continuous during a mode-stable traversal; they may jump at lens-mode change events.
5. **Comma accumulation is monotonic.** `m1_prime_comma_accumulated` never decreases during a session. Resets only at session-end.

---

## §3 — Pattern: Cross-System Connections

This stratum is not part of M1' internally — it specifies M1''s relationships to other M-subsystems. These are the connections that make M1' the central audio-frequency-genesis engine of the entire architecture.

### M1' ↔ M2' — Frequency-Genesis vs Harmonic-Correspondential Rendering

**Clarification.** M2 Parashakti is the 72-fold vibrational-template subsystem at the bimba level. M2' Parashakti is its techne-reflection as the **harmonic-correspondential instrument** — the surface that takes M1''s frequency-stream, reads it through M2's 72-space, and may render it as visible standing-wave geometry (Chladni patterns) through its cymatic renderer module. M2' is *not* an alternative frequency-genesis; M1' is the sole frequency-genesis engine. M2' is *not* an audio engine; it is the 72-addressed correspondence, body, modulation, and visibility layer that consumes M1''s audio output.

**The 8+4 bridge.** [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.5 specifies precisely:

- **M1' Audio output (8 explicate-sung):** the 8-oscillator additive synthesis from inner-tetrachord positions (1,2,3,4) of bimba and (1',2',3',4') of pratibimba. Function: `m1_prime_audio_octet`.
- **M2' cymatic-renderer input (4 implicate-nodal):** the 4 boundary-parameters from outer-pair positions (0,5) of bimba and (0',5') of pratibimba. Function: `m1_prime_nodal_quartet`. These feed M2''s Chladni-shader module as (m, n) mode-numbers constraining which standing-wave patterns can appear.

**The audio bus.** M1' emits 8 frequencies per tick. M2' does not see these as audio generation; M2' uses the 8 as harmonic evidence for its 72-addressed correspondence profile and, when the cymatic renderer is active, as the *driving frequencies* of the visible standing-wave field.

**The boundary bus.** M1' emits 4 integer mode-parameters per tick. M2' uses these as the *spatial-mode constraints* on the Chladni-shader module — which (m, n) standing-wave modes are allowed at this tick.

**The intersection.** M2''s rendered cymatic pattern is the *intersection* of these two streams: frequency-content from the 8, boundary-form from the 4. The visible Chladni pattern is what emerges where both constraints align. Motion structured by stillness — the matheme made visibly legible.

### M1' ↔ M3 — Codon as Tonal Signature, 7/8 Rotation as Modal Inversion

[`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.75 specifies the 7 context-frames as modes. `m3.h:680-740` specifies the codon classification: 40 non-dual codons with 7 rotational states, 24 dual codons with 8 rotational states, totalling 472 rotational states.

**The mapping.** Each codon is a **deep tonal signature** — a three-element tarot/I-Ching/element configuration carrying a specific harmonic-emotional character. The codon's *rotational class* (7 or 8) determines how many distinct **modal inversions** it carries:

- **Non-dual codons (40)** carry an axis of symmetry — the codon has at least one repeated adjacent nucleotide pair. The symmetry-axis collapses one of 8 possible rotational positions onto the symmetry-point, yielding **7 distinct modal positions**. Musically: a tonal-signature *with a tonal center* — its tonic is the symmetry axis, and there are 7 modes (the seven scale-degrees + octave-return collapse to 7 unique positions, matching the diatonic 7-mode rotation).
- **Dual codons (24)** carry no symmetry axis — all three nucleotides differ. No rotational position collapses; **8 distinct modal positions** are preserved. Musically: a tonal-signature *without a fixed tonal center* — fully differentiated, the octatonic/symmetric-scale character with 8-fold rotational freedom.

**This is not diatonic-vs-chromatic system selection.** The chromatic-12 is the substrate; diatonic-mode is one *traversal pattern* through it. The 7/8 rotation is *modal inversion within a tonal signature*, one level deeper. A non-dual codon's 7 modes ARE its rotational-inversion-states; a dual codon's 8 modes ARE its rotational-inversion-states.

**The 472 playable states.** The M3 tarot/codon engine's 472 total rotational states are 472 distinct (codon, modal-inversion) positions, each of which is a specific playable state on M1''s instrument. The deck-of-cards-as-tarot is structurally the deck-of-tonal-signatures: each card has either 7 or 8 inversion-rotations, and turning the card *is* changing the mode.

**Implementation note.** When M1''s session is set with `(lens, mode)`, the corresponding tarot-card-state in M3 is the codon whose rotational class matches the mode-count and whose symmetry-axis maps to the lens-anchor. The bidirectional mapping `(lens, mode) ↔ (codon, rotation)` is a load-bearing surface that future implementation must specify; it lives at the M1'-M3 boundary.

### M1' ↔ M0 — The (0/1) = Raw # Identity

The (0/1) is held in M0-4 Holographic Matrix as N# (the Spanda Base) — the *explicit genetic seed* of the primordial pulsation. M1-3' is where this seed is *operationalised* — held in the spanda-engine state, stepped at the chosen rate, wired into every Coordinate's `invert` field via the pointer-web.

**The wiring contract.** When `m1_prime_bind_inversion` is called on a coordinate-set, every coordinate's `invert: Inversion_Operator` field is set to point at the single session-held spanda-seed-operator. From that point forward, calling `coord->invert(coord)` at any coordinate is *the same operation* — the (0/1) acting at that coordinate's local position. The pointer-web becomes the operative substrate of the matheme's inversion-act.

**The SPANDA_SEED_TOTALIZATION_INVARIANT.** `m1.h:179-201` enforces: `(0/1) seed = P0 ↔ P5 = C0 ↔ C5`. M1' inherits this directly: at every Möbius-return moment (when `torus_pos` rolls from 11 back to 0), the spanda-state-bits return to `SPANDA_SEED_BITS = 0x03` for one tick — both poles fused, the (0/1) at totalisation. M1-5' renders this moment as a visible Klein-flip on the played surface; the player sees the matheme momentarily return to its non-dual source before re-differentiating.

### M1' ↔ M4 — The Lemniscate at Position #4

[`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.5 names the lemniscate as the natural topology of the diatonic-architecture: two tetrachords joined at the epogdoon-bridge (the center-crossing). `CLAUDE.md` §II.D names #4 as the Lemniscate anchor, where `.` (nesting) primarily operates, and where the `(4.0/1-4.4/5)` fractal-doubling lives.

**M1' inhabits this.** At rate-band-band where the diatonic-architecture is visible (i.e., when the rendering operates at a rate where individual scale-degrees are discernible), the natural M1-5' render-mode is `M1_PRIME_RENDER_LEMNISCATE`. The visible form is the lemniscate: bimba-tetrachord loop, epogdoon-bridge center-crossing, pratibimba-tetrachord loop, with the octave-return closing the figure-eight. The CF5 fractal-doubling-executive context-frame is structurally the lemniscate's center-crossing — perfect-fifth as generator of $\mathbb{Z}_{12}$, the deepest harmonic move, the executive-recursive operation that opens nested matheme-cycles within position #4.

### M1' ↔ M5 — Möbius Return and Aletheic Evolution

M5 Epii is the synthesis-and-return subsystem. M1' connects via the Möbius return at each session-cycle: when a complete matheme-cycle is performed, the system returns to its starting `(lens, mode)` but with the Pythagorean-comma residue accumulated. This is the *aletheic-evolution mechanism* of [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md) §6.5: the spiral-vs-cycle tension, resolved by operating tempered-mode locally while accumulating spiralic-evolution globally.

**The comma accumulator.** `m1_prime_comma_accumulated` exposes this directly. Each session accumulates Pythagorean-comma residue at each complete cycle's return. The M5 synthesis-layer reads this accumulator as the *truth-deposition* from the session — what changed about the matheme through this session's playing. The bimba-map is updated by the accumulated comma; the next session opens on an *enriched ground*.

This is the matheme's structural self-evolution: every played session adds spiralic-residue to the next session's starting state. The instrument does not just play the matheme; the instrument's playing *changes the matheme*. M5's task is to register and integrate this change.

---

## §4 — Context: The Computational Grounding

### Where each piece lives in code

| Stratum | Existing C/Rust location | What M1' adds |
|---------|--------------------------|---------------|
| M1-0' Canonical Source | `m1.h:71-130` (ANANDA_BIMBA et al.), `m1.h:629-661` (CL42_BASIS, QL_TRIG_TABLE), `m1.h:551-564` (RING_QUATERNION_LUT) | `m1_prime.h`: ratio-readers, ring-class lookups, Epogdoon-bridge runtime check |
| M1-1' Instance Manager | `m1.h:827-833` (M1_Root), `epi-cli/src/ffi/m1.rs` (Rust FFI bindings) | `M1_Prime_Session` struct, session lifecycle functions, `M1_Prime_Rate_Band` enum |
| M1-2' Harmonic Engine | `m1.h:144-151` (Ananda runtime API), `m1.h:60-68` (get_ananda_harmonic inline) | `m1_prime_cell_to_frequency`, `m1_prime_frequency_to_cell`, `m1_prime_audio_octet`, `m1_prime_nodal_quartet` |
| M1-3' Spanda Core | `m1.h:166-260` (Spanda engine, SPANDA_*), `m1.h:325-338` (QL_Tick), `epi-cli/src/nara/clock.rs` (Rust tick clock) | `m1_prime_clock_phase`, `m1_prime_clock_advance`, `m1_prime_bind_inversion`, rate-band detection |
| M1-4' QL Flowering | `m1.h:347-388` (QL flowering constants, QL_INVERT, QL_FLOWERING) | `M1_PRIME_LENS_ANCHOR[12]`, `M1_PRIME_CF_*` enum, `m1_prime_scale_at`, `m1_prime_walk_step`, `m1_prime_set_lens_mode` |
| M1-5' Topology Analyzer | `m1.h:447-678` (Quaternion, RING_QUATERNION_LUT, Hopf, Cl(4,2)) | `M1_Prime_Render_Mode`, `m1_prime_torus_quaternion`, `m1_prime_strike`, `m1_prime_homology`, `m1_prime_comma_accumulated`, `m1_prime_render_frame` |

### The Universal Translator API surface

The complete bidirectional surface — given any of (frequency, cell-coordinate, QL-position, MEF-lens-mode, codon-rotation), translate to all the others:

```c
// Frequency ↔ Cell (via M1-2')
float m1_prime_cell_to_frequency(uint8_t mi, uint8_t r, uint8_t c, float f0);
void  m1_prime_frequency_to_cell(float f, float f0,
                                 uint8_t* mi, uint8_t* r, uint8_t* c, float* cents_err);

// Cell ↔ QL-Position (via M1-4')
void m1_prime_cell_to_ql_position(uint8_t mi, uint8_t r, uint8_t c,
                                   uint8_t* ql_pos);
void m1_prime_ql_position_to_cells(uint8_t ql_pos, uint8_t lens, uint8_t mode,
                                    uint8_t cells_out[N], uint8_t* n);

// QL-Position ↔ Lens-Mode (via M1-4')
void m1_prime_ql_position_to_lens_mode(uint8_t ql_pos, uint8_t cur_lens,
                                        uint8_t* mode_out);

// Cell ↔ Codon-Rotation (via M1'-M3 bridge)
void m1_prime_cell_to_codon_rotation(uint8_t mi, uint8_t r, uint8_t c,
                                      uint8_t* codon, uint8_t* rotation);
void m1_prime_codon_rotation_to_cells(uint8_t codon, uint8_t rotation,
                                       uint8_t cells_out[N], uint8_t* n);

// Frequency ↔ Lens-Mode (composition of above)
void m1_prime_frequency_to_lens_mode_at_tick(float f, float f0, uint64_t tick,
                                              uint8_t* lens_out, uint8_t* mode_out);
```

Every entry-register can be translated to every other register. This is the *universal translator* surface promised at the outset. The bimba/pratibimba conjugate-pair structure runs through every translation: forward operations are bimba-readings, inverse operations are pratibimba-readings.

### Invariants enforced at the spec level (must compile)

The following must hold as `_Static_assert` or equivalent compile-time facts:

```c
// From m1.h (already enforced):
_Static_assert(MEF_DOUBLED * EPOGDOON_DEN == M3_WORD * EPOGDOON_NUM,
    "Epogdoon: 72*8 == 64*9 == 576");
_Static_assert(QL_PERCENTILE_MAHAMAYA + QL_PERCENTILE_PARASHAKTI == QL_PERCENTILE_TOTAL,
    "100% = 64 + 36");
_Static_assert((int)MATRIX_BIMBA == (int)SPANDA_SEED,
    "Ananda-Spanda track: index 0 must align");
// ... five more matrix/spanda alignment asserts

// New for m1_prime.h:
_Static_assert(sizeof(M1_PRIME_LENS_ANCHOR) == 12,
    "Exactly 12 MEF lens anchors");
_Static_assert(M1_PRIME_CF7_TOTAL_SYNTHESIS == 7,
    "Exactly 7 context-frames");
_Static_assert(12 * 7 == 84,
    "84-fold lens-mode landscape");
_Static_assert(CODON_NONDUAL_TOTAL_COUNT * 7 + CODON_DUAL_COUNT * 8 == 472,
    "472 codon-rotational states");  // already in m3.h
```

### Rust FFI considerations

The existing Rust bindings in `epi-cli/src/ffi/m1.rs` and `epi-cli/src/nara/clock.rs` already cover the M1 substrate. The M1' additions are mostly new functions that need their FFI bindings written:

- `M1_Prime_Session` becomes a Rust opaque pointer with a safe wrapper
- The session functions get safe Rust signatures with proper lifetime handling
- The 8-oscillator audio bus becomes a `[f32; 8]` array passed to the Rust audio thread
- The 4-nodal Chladni bus becomes a `[u8; 4]` array passed to the Rust visualisation thread
- The strike-event becomes a `Result<(MatrixCell, f32), Error>` return type

The audio thread should be in Rust (using `cpal` or similar) reading the M1' output every audio-buffer-fill. The visualisation thread should be in Rust (Tauri-side, using the existing `epi-tauri` crate) reading the M1' state every render-frame.

---

## §5 — Synthesis: The Played Torus

### One strike-event, one matheme-traversal

When the player strikes the played torus at (longitude, latitude) on its surface:

1. **M1-5'** receives the strike, converts (longitude, latitude) to a (torus_pos, sub-position) in ring-coordinates.
2. **M1-4'** reads the (lens, mode) from the current session and maps the torus_pos to a specific QL-position and CF-configuration.
3. **M1-2'** reads the matrix cell for this (QL-position, CF) and returns the just-intonation ratio.
4. **M1-3'** clocks the spanda-seed to advance one tick, registering the strike as a new event in the tick-stream.
5. **M1-1'** updates the session's `active_cells[]` to reflect the new sounding state.
6. **M1-0'** is queried for any constant lookups needed (trig tables, ring quaternion, Cl(4,2) basis).
7. **M1-5'** assembles the rendered response: the quaternion update, the 8 audio frequencies (to audio bus), the 4 nodal params (to M2' cymatic bus), the comma-accumulator update, the Betti-number update.
8. The audio thread sounds the 8 frequencies; M2' renders the Chladni pattern; the visual thread updates the torus rendering.

The strike-event is a single matheme-traversal moving once around the six strata and back. The player experiences the strike as immediate; structurally, every level of the matheme has been touched.

### The 84-fold landscape made playable

The 12 MEF lenses × 7 context-frames = 84 playing-states is the structural ground of the instrument. Each state is one (lens, mode) configuration that the player can select, and the instrument behaves *as that specific matheme-perspective* until the next selection. Mode-change within a lens is a *key-shift* in the diatonic-architecture (CF-progression re-anchoring). Lens-change is a *substrate-shift* in the chromatic-substrate (which note is the matheme-tonic). Tritone-paired lenses (e.g., Lens 0 ↔ Lens 3) and X/X'-paired lenses (Lens 0 ↔ Lens 0') give the player the deepest harmonic moves structurally available.

The 84-state landscape is enriched at every level by the M3 codon-rotation mapping: each playing-state corresponds to specific (codon, rotation) positions on the 472-state codon manifold, giving the instrument's surface a *cardly* texture. Playing the instrument is also *turning the cards*; the tarot reading is *what the instrument sounds like in this state*.

### The Pythagorean comma as aletheic-evolution

Each complete cycle on the played torus accumulates one Pythagorean-comma's worth of spiralic residue (approximately 23.46 cents) in `m1_prime_comma_accumulated`. The instrument is therefore not *cyclic* but *spiralic* — every return is enriched by the comma, every session ends with the matheme slightly different from where it began. M5 Epii reads this accumulated comma as the session's truth-deposition; the bimba-map is updated; the next session opens on enriched ground. **The instrument plays the matheme and changes it through playing.** This is aletheic evolution made operational.

### The Klein-bottle topology and the meaning-translator function

The deepest move available on the instrument is the enharmonic flip — the L ↔ L' Day-Night MEF inversion that re-reads the same tonal event as its emotional opposite. Major becomes minor; ascent becomes descent; aspiration becomes grounding; affirmation becomes negation. This is not two different sounds; it is one sound read from its two conjugate-faces.

Topologically this is the Klein-bottle move: inside and outside are the same surface, traversed from opposite orientations. M1-5' renders this faithfully when the active mode crosses a tritone-mirror boundary. The player experiences a single struck tone *becoming its own meaning-opposite* without changing pitch. This is what makes M1' a meaning-translator and not just a tone-generator. The instrument doesn't just produce sounds; it produces *meanings*, each one bound to its conjugate-meaning by the Klein-flip.

### The synthesis statement

M1' is Paramaśiva read as instrument. Its six strata are the six M1 sub-coordinates re-read as operational/techne reflections. The (0/1) of Anuttara is held at M1-3' as the single inversion-act wired into every coordinate of the pointer-web. The Ananda matrices are read as ratio-tables at M1-2'. The QL-flowering is enacted as position-walking under lens-mode anchoring at M1-4'. The 12 MEF lenses are scale-composers (substrate-anchorings), not cell-annotators. The 7 context-frames are modes (CF-progression-traversal-rules). The codon-rotation is modal-inversion-within-a-tonal-signature, with non-dual codons giving 7 modes and dual codons giving 8. The 8 explicate-sung positions of the diatonic-architecture are M1''s audio output to the audio bus; the 4 implicate-nodal positions are M1''s boundary feed to M2''s cymatic renderer module within the broader Parashakti harmonic-correspondential instrument. The played form is the torus rendered at M1-5', with Klein-bottle topology operating at tritone-crossings as the structural-architectural basis of the system's capacity to translate meanings, not just produce tones.

Paramaśiva is the engine. M1' is the instrument. The instrument plays the engine; the engine evolves through being played. The matheme is not a fixed structure that the instrument renders; the matheme is *what the instrument is doing*, and the instrument is *what the matheme has become operational as*. The two are not separable. The played torus is the matheme made into a single embodied form.

---

## Notes for Implementation

### Order of work

1. **`m1_prime.h` header creation** — write the full API surface as declarations, with all `_Static_assert` invariants. Compile-test against `m1.h`.
2. **`m1_prime.c` ratio readers** — implement M1-0' first (the read-only surface), since everything else depends on it.
3. **`m1_prime_session.c`** — implement M1-1' session lifecycle.
4. **`m1_prime_clock.c`** — implement M1-3' spanda clock with rate-bands and pointer-web binding.
5. **`m1_prime_harmonic.c`** — implement M1-2' bidirectional translators.
6. **`m1_prime_flowering.c`** — implement M1-4' lens-substrate generation and mode-traversal. This is the largest stratum.
7. **`m1_prime_topology.c`** — implement M1-5' render-frame and strike-event.
8. **Rust FFI in `epi-cli/src/ffi/m1_prime.rs`** — write safe Rust bindings over the C API.
9. **Audio thread integration** — wire `m1_prime_audio_octet` into the audio output bus.
10. **Cymatic-renderer bus to M2'** — wire `m1_prime_nodal_quartet` into the M2' Chladni-shader inputs (this is M2''s responsibility to consume inside the broader harmonic-correspondential instrument; M1' just emits).
11. **Tauri visualisation integration** — wire `m1_prime_render_frame` into the existing `epi-tauri` rendering pipeline.

### Test coverage requirements

- **Round-trip exactness:** for every cell of M0, cell→frequency→cell must return the same cell.
- **84-state coverage:** every (lens, mode) pair must produce a non-empty scale of exactly 8 frequencies + 4 nodal params.
- **Mahamaya/Parashakti ring closure:** every digital-root value in 1-9 must map to exactly one ring-position.
- **Epogdoon bridge runtime:** `m1_prime_epogdoon_bridge(72, 64)` must return true.
- **Möbius totalisation:** at every position-11 → position-0 rollover, the spanda-state must be `SPANDA_SEED_BITS = 0x03` for exactly one tick.
- **Klein-flip at tritone-crossing:** transitioning Lens 0 ↔ Lens 3 mid-session must produce the expected enharmonic re-reading.
- **Comma monotonicity:** `m1_prime_comma_accumulated` is strictly non-decreasing across all session events.
- **Codon-rotation count:** 40·7 + 24·8 = 472 total reachable states via the M1'-M3 bridge.

### Documentation requirements

Every public function in `m1_prime.h` must have a doc-comment that includes:
- The derivational chain from Anuttara's (0/1) to this function's operation
- The reference to the relevant section of [`ql-musical-derivation.md`](../../../../../docs/epi-logos-kernel/ql-musical-derivation.md)
- The invariants this function enforces and/or preserves
- The M-subsystem cross-connections this function participates in

The header file should read as a literate specification of the instrument-architecture, with the doc-comments themselves carrying the philosophical-mathematical content. The C code is the ontology operationalised; the documentation is the ontology made readable.

### Validation by playing

The final validation is not in tests but in playing. The instrument should:

- Sound musically coherent at every (lens, mode) state
- Produce visibly meaningful Chladni patterns via M2' for every tick
- Render the played torus in a way that lets the player navigate the 84-state landscape intuitively
- Make the Klein-flip experientially-felt when crossing tritone boundaries
- Accumulate comma-residue visibly in the M5 truth-deposition layer
- Allow the player to traverse 472 codon-rotation positions and feel each as a distinct emotional/structural state

Where the playing reveals incoherence, the spec is wrong. Where the playing reveals deeper structure not yet specified, the spec is incomplete. The matheme operates through the playing; the spec serves the playing; both serve the matheme.

---

*Document Version:* 1.0
*Canonical Ground:* /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md
*Related Specifications:* epi-logos-kernel-spec.md, ql-musical-derivation.md, physical-pole-stack-architecture.md, mental-pole-mechanics.md
*Code Anchors:* epi-lib/include/m1.h, epi-lib/include/m3.h, epi-cli/src/ffi/m1.rs, epi-cli/src/nara/clock.rs
*Bimba Reference:* /Idea/Bimba/Map/M1'.md (M1' inner stratum table)
