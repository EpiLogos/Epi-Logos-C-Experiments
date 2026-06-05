---
title: "M2' Paraśakti Architecture — Total Shape, Substrate Map, Profile-Bus Contract, Visual Rendering, Tick Choreography & Six-Axis Correspondence-Tree"
coordinate: "M2 / M2'"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for M2'. M2'-SPEC §§0-11 cross-references this document. Where they disagree, this document is authoritative for M2-1' → M2-5' substrate mapping, profile-bus contract, visual rendering, and tick choreography; M2'-SPEC retains authority for §7 Klein-flip semantics, §8 correspondence-tree canon, §9 Ficinian-Kerykeion routing protocol, and §9.8 open questions."
depends_on:
  - "[[M2'-SPEC]]"
  - "[[m2-prime-parashakti-cymatic-engine]]"
  - "[[m2-prime-frequency-meaning-research]]"
  - "[[M1'-SPEC]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"
  - "[[M3'-SPEC]]"
  - "[[ql-musical-derivation]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
companion_reconciliation: "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m2-reconciliation-matrix.md"
decisions_raised:
  - "DR-M2-1 (DCC-03): planet-count + Earth-observer semantics"
  - "DR-M2-2: six axes of 72 + sonic overlays canonicalisation"
  - "DR-M2-3 (proposed): F_routing carrier ownership (M2-1' Vimarśa extension vs new f_routing.rs)"
related_tranches:
  - "3.1-M2 — Klein-flip profile field closure (CODE-PENDING)"
  - "3.2-M2 — F_routing carrier landing (ORPHAN-fill)"
  - "3.3-M2 — Six-axes address-view decoder (SPEC-AHEAD)"
  - "3.4-M2 — S2 graph-correspondence Theia adapter (SPEC-AHEAD)"
  - "3.5-M2 — DCC-03 planet-count decision (CONTRADICTION)"
  - "3.6-M2 — six-axes-plus-overlays canonicalisation (CONTRADICTION)"
  - "3.7-M2 — tuning-aware music-tech bridge (CODE-PENDING, deferred)"
  - "3.8-M2 — Nara deposit-handle wiring (DOC-AHEAD, cross-extension)"
cross_references:
  - "[[M0-ARCHITECTURE]]"
  - "[[M1-ARCHITECTURE]]"
  - "[[M3-ARCHITECTURE]]"
  - "[[M4-ARCHITECTURE]]"
  - "[[M5-ARCHITECTURE]]"
  - "[[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]]"
  - "[[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]]"
---

# M2' Paraśakti Architecture

## 0. Frame

**M2 is the 72-invariant — the harmonic-correspondential ground.** **M2' is that 72-space made playable, six axes at once.** Where M1 supplies the +1 parent pulse and M3 supplies the 64-bit matter, M2 sits between them as the *spectral field*: the frequency the cosmos is played in, the field where lens-position, tattva-phase, decan-face, Shem-name, maqam-mode, and DET-projection are all the same point read through six different correspondence systems.

The cymatic standing-wave is **not** the identity of M2' — it is one of M2''s rendering modules, the place where the 8+4 audio-bus organising frequency *visibly takes form* (the moment Venus's 9:8 epogdoon compresses 72 into 64). The identity of M2' is the **harmonic-correspondential resolver**: M2-1' Vimarśa reads the Prakāśa cloud and writes the shared `audio_octet[8]` + `nodal_quartet[4]`; the rest of M2' surfaces that one bus through six addressing axes plus two sonic overlays plus the L↔L' Klein-flip *meaning-translator*.

Three commitments hold the M2' domain (M2'-SPEC §0):

1. **M2' preserves the 72-invariant** — every render addresses canonical 72-space, enforced at compile time by `_Static_assert(sizeof(M2_Vibrational_72_Space) == 72)` at [`Body/S/S0/epi-lib/include/m2.h:130-131`](Body/S/S0/epi-lib/include/m2.h) and `_Static_assert(M2_MEF_TOTAL_LENSES * M2_MEF_POSITIONS_PER_LENS == M2_MEF_TOTAL_CONDITIONS)` at [`m2.h:146-147`](Body/S/S0/epi-lib/include/m2.h).
2. **M2' is the L ↔ L' meaning-translator** — when M1' signals a tritone-mirror lens crossing, M2' inverts surface valence across every active panel. This is the Klein-bottle move made operative (M2'-SPEC §7).
3. **M2' is the bridge surface toward M3 but NOT the codon classifier** — M2' renders the 72-correspondential profile and produces the standing-wave signature that M3 projects into 64-bit codon-rotation via `M2_TO_M3_CYMATIC_PROJECTION[72]` at [`m2.h:530`](Body/S/S0/epi-lib/include/m2.h) and `m2_epogdoon_compress(val_72) = val_72 * 8 / 9` at [`m2.h:545-547`](Body/S/S0/epi-lib/include/m2.h). M3'/M3'-SPEC §7 owns codon classification.

This document gives the **total shape** for the M2' product surface: substrate map (six 72-axis LUTs + two sonic overlays + 10-planet keying), dataset map (parashakti-deep + CSV sources), profile-bus contract (what `MathemeHarmonicProfile` exposes, what is missing, the `parashakti_meaning` projection proposed below), visual rendering contract (Chladni standing-wave + 72-cell heatmap + tritone-mirror Klein-flip), tick choreography (single deterministic primitive: bus-driven double-Fourier on the M2 frame), boundary contracts (M1↔M2 Vimarśa-window load-bearing; M2↔M3 9:8 DET; cosmic-1-2-3 composition), and IDE integration (`m2-parashakti` extension surface + OmniPanel relation).

---

## 1. The Six M2-X' Sub-Coordinates (1:1 with M2 bimba)

| M2 (bimba)                                            | M2' (techne)                                                     | What M2 IS (substrate)                                                                                                                          | What M2' DOES (the playable surface)                                                                                                                                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M2-0** Archetypal Numerical Ground / 72-Invariant   | **M2-0'** Vibrational Profile Source                             | The 72-byte vibrational union `M2_Vibrational_72_Space` ([`m2.h:122-128`](Body/S/S0/epi-lib/include/m2.h)); `M2_ARCHETYPES` instance; φ constants `M2_PHI=1.6180339887f` ([`m2.h:36-40`](Body/S/S0/epi-lib/include/m2.h)) | Validates every M2' address against 72-space; serves read-only correspondential descriptors; the round-trip [0,71] address-view contract                                                                                                              |
| **M2-1** MEF / L-Family Matrix                        | **M2-1' Vimarśa Audio-Genesis + Lens Resonance Surface**         | 12 lenses × 6 positions = 72-cell MEF semantic field ([`m2.h:170-176, 182`](Body/S/S0/epi-lib/include/m2.h)); 12 lens names ([`m2.h:185`](Body/S/S0/epi-lib/include/m2.h)); 6 tritone-mirror lens-pairs (ql-musical-derivation §6) | **The audio-genesis writer**: reads Prakāśa at `(tick, lens_mode)` and writes `audio_octet[8]` + `nodal_quartet[4]` into the shared profile ([`vimarsha_reading.rs:17-37`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)); enacts lens resonance + L↔L' Klein-flip surface valence  |
| **M2-2** Tattva / Element Throughline                 | **M2-2' Elemental Medium Surface**                               | 36 tattvas × 2 phases ([`m2.h:228-234, 236`](Body/S/S0/epi-lib/include/m2.h)); 5-element spine `Element_Id` ([`m2.h:53-61`](Body/S/S0/epi-lib/include/m2.h)); 8-chakra spine ([`m2.h:63-74`](Body/S/S0/epi-lib/include/m2.h)); throughline `M2_ELEMENTS[5]` ([`m2.h:513-520`](Body/S/S0/epi-lib/include/m2.h)) | Distinguishes P-position element from L2' element-bearing value; selects body/medium constants (damping/elasticity/wave-speed) for sonic, visual, cymatic response                                                                                     |
| **M2-3** Decan / Zodiacal Face Field                  | **M2-3' Decanic Face Surface**                                   | 36 decans × light/shadow = 72 `Decan_Face_Desc` ([`m2.h:243-256`](Body/S/S0/epi-lib/include/m2.h)); quintessence sentinel ([`m2.h:259`](Body/S/S0/epi-lib/include/m2.h)); 5-aspect angle/orb table ([`m2.h:611-612`](Body/S/S0/epi-lib/include/m2.h))             | Provides face, polarity, body-zone, phase, envelope, clock-sector evidence from Kerykeion `planets[planet].degree / 10°`; renders the active-decan light/shadow polarity (inverts on Klein-flip)                                                       |
| **M2-4** Vibrational Arena / Sacred Sonic-Linguistic  | **M2-4' Correspondential Sonic Arena**                           | Shem 8×9=72 ([`m2.h:369-396`](Body/S/S0/epi-lib/include/m2.h)); Maqam 72-mode 10-family 24-TET ([`m2.h:403-418`](Body/S/S0/epi-lib/include/m2.h)); 24-station spiritual maqamat ([`m2.h:420-426`](Body/S/S0/epi-lib/include/m2.h)); Asma 99+1 + Jalal/Kamal/Jamal split ([`m2.h:433-447`](Body/S/S0/epi-lib/include/m2.h)); Asma 36-internal / 64-projective routing masks ([`m2.h:483-506`](Body/S/S0/epi-lib/include/m2.h)); Mantra 50+50 Matrika/Malini 144→432 Hz ([`m2.h:460-476`](Body/S/S0/epi-lib/include/m2.h)) | Makes Shem angels, maqam modes, Asma'ul-Husna 99+1, and mantra 100 playable as tonal/modal/name/timbre/frequency correspondences; renders six-axis address-view inspector + sacred-sonic provenance panel                                                |
| **M2-5** Planetary-Chakral Harmonic Integration / DET | **M2-5' Solar-Chakral Runtime + Symbolic Projection Gate**       | 10-planet LUT with Cousto frequencies/Keplerian velocities/digital-roots ([`m2.h:299-311`](Body/S/S0/epi-lib/include/m2.h), [`m2.c:264-295`](Body/S/S0/epi-lib/src/m2.c)); `EarthBodyState` separate ([`m2.h:318-322`](Body/S/S0/epi-lib/include/m2.h)); DET `M2_TO_M3_CYMATIC_PROJECTION[72]` 72×u64 masks ([`m2.h:530`](Body/S/S0/epi-lib/include/m2.h), [`m2.c:821`](Body/S/S0/epi-lib/src/m2.c)); 9:8 epogdoon compress/expand ([`m2.h:545-551`](Body/S/S0/epi-lib/include/m2.h)) | Holds live solar-chakral state; emits cymatic frame packets (CPU reference); projects M3-ready 64-bit symbolic evidence via DET WITHOUT classifying codons; Earth-as-observer anchor for the 9:8 bridge (DCC-03 pending)                                |

The six are not parallel modules — they are **six readings of one cell**. `(lens, mode)` at tick t implicates simultaneously: an MEF lens-position, a tattva-phase, a decan-face, a Shem-pair, a maqam-mode, a planetary-chakral correspondence (M2'-SPEC §8.6). The Theia `M2AddressView` enum exists ([`meaning-packet.ts:50-54`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts)) but currently collapses all six onto `resonance72.lensAnchorIndex`; Tranche 3.3-M2 lands the per-axis decoders.

---

## 2. Substrate Map

### 2.1 The 72-invariant union and its six addressing-axes

The single `.rodata` instance at [`Body/S/S0/epi-lib/src/m2.c:21-43`](Body/S/S0/epi-lib/src/m2.c):

```c
const M2_Vibrational_72_Space M2_ARCHETYPES = {
    .raw_vibration = { /* 72 bytes — the canonical address-space */ }
};
```

The union ([`m2.h:122-128`](Body/S/S0/epi-lib/include/m2.h)) exposes six aliases over the same 72 bytes:

| Alias                                  | Shape           | Address law                  | Substrate                                                                          |
| -------------------------------------- | --------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| `mef_lenses[12][6]`                    | 12 × 6 = 72     | `lens*6 + position`          | MEF Condition cells (M2-1')                                                        |
| `tattvas[36][2]`                       | 36 × 2 = 72     | `tattva*2 + phase`           | Tattva phase-doubled (M2-2')                                                       |
| `decans[4][3][3][2]`                   | 4·3·3·2 = 72    | `elem*18 + sign*6 + decan*2 + face` ([`m2.h:253-254`](Body/S/S0/epi-lib/include/m2.h)) | Decan light/shadow (M2-3')                                                         |
| `shem_names[8][9]`                     | 8 × 9 = 72      | `choir*9 + position` ([`m2.h:392-393`](Body/S/S0/epi-lib/include/m2.h))      | Shem 72-name angelic register (M2-4')                                              |
| `raw_vibration[72]`                    | flat 72         | `0..71`                      | Canonical access for round-trips                                                   |

**This is the deepest finding of the M2 substrate**: the six 72-axes are not six tables; they are **one byte-stream re-read through six structural views**. The union enforces at compile time that any read-pattern decoder maps into exactly the same 72-cell ground.

### 2.2 The six descriptor tables (semantic payload for each axis)

These are `.rodata` siblings to the union — the 72-cell semantic payload per axis. M2' renderers consume them; never re-derive.

| Table                                  | Decl                                                                 | Definition                                                            | Shape                              | What it carries                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `M2_MEF_DESC[72]`                      | [`m2.h:182`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:67-111`](Body/S/S0/epi-lib/src/m2.c)                          | 72 × `MEF_Condition_Desc`          | `lens (0-11), position (0-5), is_inverted, l_family_link (0-5), meaning_id` per cell                                                   |
| `M2_TATTVA_DESC[36]`                   | [`m2.h:236`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:113-162`](Body/S/S0/epi-lib/src/m2.c)                         | 36 × `Tattva_Entry_Desc`           | `index, division (pure/mixed/impure), element_id, kanchuka_mask, meaning_id` — the 36 phase-paired to 72 via `tattvas[36][2]`           |
| `M2_DECAN_DESC[72]`                    | [`m2.h:256`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:164-241`](Body/S/S0/epi-lib/src/m2.c)                         | 72 × `Decan_Face_Desc`             | `element, sign, decan, face (0=light/1=shadow), ruling_planet, meaning_id`                                                              |
| `M2_SHEM_DESC[72]`                     | [`m2.h:390`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:321-407`](Body/S/S0/epi-lib/src/m2.c)                         | 72 × `Shem_Name_Desc`              | `shem_idx (0-71), choir (0-7), position (0-8), element_id, decan_link (0-71), planet_link (0-9), meaning_id` — the **2:1 decan→Shem-pair** routing |
| `M2_MAQAM_DESC[72]`                    | [`m2.h:418`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:430-518`](Body/S/S0/epi-lib/src/m2.c)                         | 72 × `Maqam_Musical_Desc`          | `family (0-9), mode_in_family, intervals[7] (24-TET quarter-tones summing to 24), planet_ruler, meaning_id`                              |
| `M2_TO_M3_CYMATIC_PROJECTION[72]`      | [`m2.h:530`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:821`](Body/S/S0/epi-lib/src/m2.c)                             | 72 × `uint64_t`                    | DET masks — wave-superposition into M3 64-bit bitboard; the seventh "axis" is the projection itself                                     |

Total cardinality footprint: 6 × 72 cells, each with named semantic payload. The six are the six-axes ratification of DR-M2-2.

### 2.3 The two sonic overlays (NOT 72-axes — overlays onto 72)

| Overlay                                | Decl                                                                 | Definition                                                            | Shape                                                              | Role                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `M2_MANTRA_LUT[100]`                   | [`m2.h:476`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:662-782`](Body/S/S0/epi-lib/src/m2.c)                         | 50 Matrika (descent/Bimba) + 50 Malini (ascent/Pratibimba) = 100   | Sanskrit phonemes spanning **144 Hz (Muladhara) → 432 Hz (Sahasrara)**; the chakra-activation gradient. Frequency band fixed by `M2_MANTRA_FREQ_MIN=144`, `_MAX=432`, `_BASE=256` ([`m2.h:472-474`](Body/S/S0/epi-lib/include/m2.h)) |
| `M2_ASMA_LUT[100]`                     | [`m2.h:447`](Body/S/S0/epi-lib/include/m2.h)                         | [`m2.c:547-782`](Body/S/S0/epi-lib/src/m2.c)                         | 99 names + `ASMA_HIDDEN_INDEX=99` Al-Ism al-A'zham; Jalal/Kamal/Jamal partition ([`m2.h:435`](Body/S/S0/epi-lib/include/m2.h)) | 36 MEF-internal vs 64 M3-projective split via `ASMA_36_INTERNAL_MASK` and `ASMA_64_PROJECTIVE_MASK` ([`m2.h:491-492`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:784-802`](Body/S/S0/epi-lib/src/m2.c)) |

**These are NOT 72-axes** — they are 100-cardinality and 99+1-cardinality respectively, surfacing onto the 72 via mask-routing. DR-M2-2 ratifies this: six axes of 72 + two sonic overlays + planetary keying.

### 2.4 The 10-planet LUT — keying, NOT a 72-axis

`M2_PLANET_LUT[10]` at [`m2.h:311`](Body/S/S0/epi-lib/include/m2.h) defined at [`m2.c:264-295`](Body/S/S0/epi-lib/src/m2.c). Each `Planet_Operator` carries `id, group_type, prime, elem_sig (packed element+chakra+phase), cousto_freq (Hz), keplerian_vel (arcsec/day × 10), digital_root, ananda_row, meaning_id`. The 10 rows in canonical mod-10 order:

| Idx | Planet  | Cousto Hz | DR | Chakra        | Element  | Phase    | Ananda row |
| --- | ------- | --------- | -- | ------------- | -------- | -------- | ---------- |
| 0   | Sun     | 126       | 9  | EARTH-root    | AGNI     | FUSED    | 0          |
| 1   | Moon    | 210       | 3  | SVADHISTHANA  | APAS     | ASCENT   | 1          |
| 2   | Mercury | 141       | 6  | VISHUDDHA     | VAYU     | DESCENT  | 2          |
| 3   | Venus   | 221       | 5  | ANAHATA       | APAS     | DESCENT  | 3          |
| 4   | Mars    | 145       | 1  | MANIPURA      | AGNI     | DESCENT  | 4          |
| 5   | Jupiter | 184       | 4  | MANIPURA      | AGNI     | ASCENT   | 5          |
| 6   | Saturn  | 148       | 4  | MULADHARA     | PRITHVI  | DESCENT  | 6          |
| 7   | Uranus  | 207       | 9  | AJNA          | AKASHA   | BEYOND   | 7          |
| 8   | Neptune | 211       | 4  | SAHASRARA     | APAS     | BEYOND   | 8          |
| 9   | Pluto   | 140       | 5  | MULADHARA     | PRITHVI  | BEYOND   | 9          |

Plus `EarthBodyState` ([`m2.h:318-322`](Body/S/S0/epi-lib/include/m2.h)) — **not** a planet but the geocentric observer anchor. **Venus carries the 9:8 epogdoon** — visible in the Cousto frequency ratio `Venus/Sun = 221/126 ≈ 1.754` and structurally as the beauty-operator of the M2→M3 compression. The 9:8 explicit bake-in at `m2_epogdoon_compress(val_72) = val_72*8/9` ([`m2.h:545-547`](Body/S/S0/epi-lib/include/m2.h)).

The 10-LUT enters the 72-space via `decan_link → planet_ruler` (`M2_DECAN_DESC[i].ruling_planet`) and `shem_link → planet_link` (`M2_SHEM_DESC[i].planet_link`); the planet itself is not 72-cardinality. **DCC-03** (DR-M2-1): keep `M2_PLANET_LUT[10]` (Sun-as-identity-root included) and add `earth_observer_handle` as separate kernel-bridge field (NOT a planet-LUT row); document the 9 non-Sun planets × 8 chakras as the literal 9:8 ratio.

### 2.5 Audio-genesis: the M2-1' Vimarśa kernel

The load-bearing M2-1' substrate is the Vimarśa reading kernel at [`Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-37`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs):

```rust
pub fn vimarsha_read_profile(tick: KernelTick, lens_mode: MathemeLensMode) -> VimarshaReading {
    let tick12 = tick.sub_tick % 12;
    let substrate_pitch = pitch_class_for_tick(tick12);
    let lens_anchor = pitch_class_for_tick(lens_mode.lens);
    let (ratio_num, ratio_den) = harmonic_ratio_fraction_for_sub_tick(tick12);
    let epogdoon_texture = ratio_num as f32 / ratio_den as f32;
    let surface = codon_rotation_from_lens_mode(lens_mode.lens, lens_mode.mode).expect(...);

    VimarshaReading {
        audio_octet: audio_octet(tick12, substrate_pitch, lens_anchor, lens_mode,
                                 epogdoon_texture, surface.rotation_degrees),
        nodal_quartet: nodal_quartet(tick12, lens_mode, surface.codon_id, surface.rotation),
    }
}
```

Key invariants this carries:
- **C3 = 130.812 79 Hz** ground ([`vimarsha_reading.rs:6`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)) — the substrate pitch baseline; M1' walks this as melody
- **`INNER_FOUR_OFFSETS = [2,4,6,8,3,5,7,9]`** ([`vimarsha_reading.rs:7`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)) — the 8 explicate sung positions (first four bimba, last four pratibimba)
- **`MODE_INTERVALS = [0,2,4,5,7,9,11]`** ([`vimarsha_reading.rs:8`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)) — diatonic interval pattern carrying the 12×7 = 84 mode-anchored landscape
- **`octave_lift = 12.0` at `tick12 ≥ 6`** ([`vimarsha_reading.rs:52`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)) — the bimba→pratibimba helix shift baked into pitch
- **`nodal_quartet` writes 4 `MathemeNodalConstraint { ql_position, helix, m, n }`** at 0/5 positions on both bimba and pratibimba helices ([`vimarsha_reading.rs:73-93`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)) — the four implicate nodal mode-constraints

This is the central M1↔M2 contract: M2-1' WRITES the audio bus; M1' READS it. Without M2-1', M1' has no melody and the cymatic surface has no driving signal.

### 2.6 The Vimarśa-window fields on `MathemeHarmonicProfile`

`MathemeHarmonicProfile` ([`Body/S/S0/portal-core/src/kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs)) exposes the M2-1' writes plus structural M2 projections:

| Field                                 | Decl                                                                  | Source                                                                | Role                                                                            |
| ------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `audio_octet: [f32; 8]`               | [`kernel.rs:367`](Body/S/S0/portal-core/src/kernel.rs)               | M2-1' Vimarśa write ([`kernel.rs:442`](Body/S/S0/portal-core/src/kernel.rs)) | The 8 explicate antinodal frequencies                                            |
| `nodal_quartet: [MathemeNodalConstraint; 4]` | [`kernel.rs:368`](Body/S/S0/portal-core/src/kernel.rs)         | M2-1' Vimarśa write ([`kernel.rs:443`](Body/S/S0/portal-core/src/kernel.rs)) | The 4 implicate nodal `(m,n)` mode constraints                                   |
| `resonance72: MathemeResonance72Projection` | [`kernel.rs:366, 605-628`](Body/S/S0/portal-core/src/kernel.rs)  | `from_tick(tick12, position)`                                         | Two encodings: `legacy_resonance_index` (6-lens/helix), `lens_anchor_index` (12×6=72) plus `base_lens`, `helix_bit`, `lens_anchor`, `position` |
| `lens_mode: MathemeLensMode`          | [`kernel.rs:363`](Body/S/S0/portal-core/src/kernel.rs)               | derived from diatonic                                                 | The 12×7=84 lens/mode landscape M2-1' consumes                                  |
| `elements: MathemeElementalProjection` | [`kernel.rs:369, 630-651`](Body/S/S0/portal-core/src/kernel.rs)     | `from_position(position)`                                             | `p_position_element`, `l2_prime_element`, `rendering_role`                       |
| `planetary_chakral: MathemePlanetaryChakralProjection` | [`kernel.rs:370, 655-...`](Body/S/S0/portal-core/src/kernel.rs) | `from_diatonic(diatonic.as_ref())` ([`kernel.rs:445`](Body/S/S0/portal-core/src/kernel.rs)) | `body, chakra_role, element, musical_role, modal_color, provenance` (string-typed, source for upgrade) |
| `binary: MathemeBinaryProjection`     | [`kernel.rs:371-372`](Body/S/S0/portal-core/src/kernel.rs)           | `from_clock(degree360, position, lens_anchor_index, helix≥6)`         | The DET evidence handle M3 consumes; same data as `mahamaya`                     |
| `tick12, degree720, degree360, position6, helix, lens_mode, su2_layer` | [`kernel.rs:354-362`](Body/S/S0/portal-core/src/kernel.rs) | tick-derived                  | The kernel-tick coordinates that name every M2 cell                              |

### 2.7 Existing relation-web seed (substrate for the S2 graph-correspondence path)

`Idea/Bimba/Map/datasets/parashakti-deep/relations.json` carries **248 typed relations** across the documented families: Decan-Level Divine Correspondence, Chaldean Decan Rulership, Spanda Rhythmic Pulsation, Quantum Field Operation, Modal-Harmonic Resonance, Ananda Vortex Spirit Axis, Traditional Planetary Rulership, Sign-Level Divine Correspondence, Psycho-Ontological Resonance, Mono-Poly Expression, etc. The seed exists; what is missing is the kernel-bridge adapter exposing them to Theia (Tranche 3.4-M2 / O-M2.06).

### 2.8 Klein-flip — substrate is partial

Currently `klein_flip: bool` lives only as a relation-descriptor field at [`Body/S/S0/portal-core/src/events.rs:35, 46, 59, 80, 118`](Body/S/S0/portal-core/src/events.rs). It is NOT on `MathemeHarmonicProfile`. M1' must compute the tritone-pair crossing and emit `klein_flip_state` on the profile — Tranche 3.1-M2 / CP-M2.03 lands this field. Without it, M2' surface-valence inversion (M2'-SPEC §7) is rendered as `pending-M1-kleinFlipState` ([`meaning-packet.ts:325-332`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts)).

### 2.9 Kerykeion CLI substrate (landed)

`Body/S/S0/epi-cli/src/nara/wind.rs` runs `kerykeion_natal(birth, lat, lon)` and `kerykeion_current(today)` ([`wind.rs:55, 110-148`](Body/S/S0/epi-cli/src/nara/wind.rs)); `kairos-python-adapter.ts` exposes them to the runtime; `kerykeion_version: "4.x"` registered as live-astrology provider. M2-3' and M2-5' consume `planets[planet].degree` for active-decan computation. There is no need for M2' to compute astrology locally.

---

## 3. Dataset Map

### 3.1 Canonical numerical sources

| Dataset                                                                                   | Used by                                  | Anchors                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Idea/Bimba/Map/datasets/parashakti-deep/relations.json`                                  | M2-1', M2-3', M2-4', M2-5'               | 248 typed relations: Decan/Shem/Maqam/Planet/Modal/Spanda/Quantum-Field/Ananda — the S2 graph law's M2 layer                                                                                                                                                            |
| `Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json`                          | M2-0', M2-1'                             | The 72-cell node graph (MEF, tattva, decan, Shem nodes); ArchetypalBridge / BimbaNode / HarmonicBridge labels                                                                                                                                                            |
| `Idea/Bimba/Map/datasets/parashakti-deep/parashakti-planets.json`                         | M2-5'                                    | Planet correspondences with Cousto frequencies and Keplerian velocities (mirrors `m2.c:264-295` for graph queries)                                                                                                                                                       |
| `Idea/Bimba/Map/datasets/low-detail/{relations,nodes}_parashakti.json`                    | M2-* (bimba-map browse)                  | Low-detail solar-anchor view; consumed by the Bimba Graph Viewer in `daily-0-1` cosmic-side                                                                                                                                                                              |
| `Idea/Bimba/Map/datasets/low-detail/parashakti-stragglers-{relations,nodes}.json`         | M2-4', M2-5'                             | Edge cases for sacred-sonic and planetary correspondences not yet promoted to parashakti-deep                                                                                                                                                                            |

### 3.2 Narrative dataset — frequency-meaning research and cymatic engine companions

Primary M2' narrative substrate (per `M2'-SPEC.md` companion list):

- `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md` (600 LOC) — per-stratum operational detail, C/Rust anchors, `m2_prime_*` function signatures, Chladni equation derivation, M2_Prime_Gpu_Frame shader contract
- `Idea/Bimba/Seeds/M/M2'/m2-prime-frequency-meaning-research.md` (608 LOC) — the M2PrimeMeaningPacket canonical shape; frequency→meaning translator architecture
- `Idea/Bimba/Seeds/M/Legacy/specs/M/M2-parashakti-vibrational-architecture.md` — Rev 2 substrate-side specification (the source the bimba m2.h compiled from)

### 3.3 Cross-domain anchors

- `Idea/Bimba/Seeds/M/M1'/ql-musical-derivation.md §6` — the 6 tritone-mirror lens-pairs (the substrate of the Klein-flip event)
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md §6.2-§6.3, §7.3` — the φ-rooted recursive proportion under the 72-invariant; verifies the 9:8 epogdoon as the M2-M3 conjugation
- `Idea/Bimba/Map/datasets/low-detail/relations_mahamaya.json` — the M2→M3 DET image space (M3-side); referenced for round-trip tests

### 3.4 Shem boustrophedon source (Exodus 14:19-21)

`M2_SHEM_DESC[72]` derives from boustrophedonic interweaving (M2'-SPEC §8.2). The interweaving rule is encoded in the LUT itself ([`m2.c:321-407`](Body/S/S0/epi-lib/src/m2.c)) — three verses, each 72 letters, reading L-to-R, R-to-L, L-to-R, picking one letter from each verse to assemble each three-letter Name. Canonical decan-link (decans 0-8 → choir 0 Seraphim, 9-17 → choir 1 Cherubim, etc.) lives in `decan_link` field per Shem descriptor.

---

## 4. Profile-Bus Contract

### 4.1 What `MathemeHarmonicProfile` already exposes for M2'

See §2.6. The Vimarśa-written `audio_octet[8]` + `nodal_quartet[4]` are landed; the lens/mode + diatonic + resonance72 + elemental + planetary-chakral string projections are landed; `binary`/`mahamaya` is landed as DET evidence handle.

### 4.2 What the profile-bus is missing — the load-bearing gaps

Three M2' gaps on the profile:

1. **No `klein_flip_state` field** — only `klein_flip: bool` on `events.rs` relation descriptors. M2'-SPEC §4 lists `kleinFlipState` as required. (CP-M2.03; Tranche 3.1-M2.)
2. **No `parashakti_meaning` typed projection** — the six-axis decoded view, the Shem-pair for active decan, the active maqam mode, the active mantra index, the active Asma name, the 9:8 DET projection summary. Currently the Theia widget reconstructs this via local computation in `meaning-packet.ts`. Move it to the profile so M3', M4', M5' read the same `parashakti_meaning` without redoing the routing.
3. **No `earth_observer_handle: Option<EarthObserverHandle>` field** — the geocentric anchor for the 9:8 bridge. Currently emitted as `'pending-DCC-03'` ([`meaning-packet.ts:145`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts)). DCC-03 ratifies and lands this.

### 4.3 The `parashakti_meaning` projection (proposed for Tranche 3.2-M2)

Add `pub parashakti_meaning: ParashaktiMeaningProjection` to `MathemeHarmonicProfile`, populated by an F_routing call inside `from_tick`:

```rust
pub struct ParashaktiMeaningProjection {
    /// Canonical 72-address (round-trips through all six axes).
    /// Derived from lens_mode via `m2_address_from_lens_mode(lens, mode)`.
    pub address72: u8,

    /// The six axis-view decoders (Tranche 3.3-M2).
    /// Each decodes the SAME address72 through a different LUT.
    pub axis_views: ParashaktiAxisViews,

    /// Active Klein-flip state.
    /// Reads M1'-produced `klein_flip_state` (Tranche 3.1-M2).
    pub klein_flip: KleinFlipState,

    /// Active F_routing trace at this tick (Tranche 3.2-M2).
    /// Populated when Kerykeion + intent context are available.
    pub routing_trace: Option<FRoutingTrace>,

    /// 9:8 epogdoon DET projection — the 64-bit codon evidence handle.
    /// `m2_epogdoon_compress(address72)` applied to all active 72-indices.
    pub det_projection: DetProjection64,
}

pub struct ParashaktiAxisViews {
    pub mef:           MefViewCell,        // (lens 0-11, position 0-5, is_inverted, l_family_link)
    pub tattva_phase:  TattvaPhaseView,    // (tattva 0-35, phase 0-1, division, element_id)
    pub decan_face:    DecanFaceView,      // (element, sign, decan, face, ruling_planet, kerykeion_degree)
    pub shem:          ShemPairView,       // 2 names per decan; (light_choir/pos, shadow_choir/pos, planet_link)
    pub maqam:         MaqamModeView,      // (family 0-9, mode_in_family, intervals[7] 24-TET, planet_ruler)
    pub det:           DetProjectionView,  // M2_TO_M3_CYMATIC_PROJECTION[address72] u64 mask preview
}

pub struct KleinFlipState {
    /// True when this tick crosses a tritone-mirror lens boundary
    /// (Lens N ↔ Lens N+3 per ql-musical-derivation §6).
    pub flip_at_this_tick: bool,
    /// 'primary' or 'inverted' surface valence for this tick.
    pub surface_valence: SurfaceValence,
    /// The lens-pair member: 0 for Lens N side, 1 for Lens N+3 side.
    pub pair_side: u8,
}

pub struct FRoutingTrace {
    pub planetary_hour_ruler: Planet,     // Chaldean order from Kerykeion sunrise/sunset
    pub active_decan: u8,                 // 0-71 from planets[ruler].degree / 10°
    pub shem_pair: (u8, u8),              // (light_name_idx, shadow_name_idx)
    pub maqam_family: u8,                 // 0-9
    pub maqam_mode: u8,                   // 0-71 (family + mode_in_family)
    pub mantra_index: u8,                 // 0-99 (Matrika or Malini)
    pub asma_name: u8,                    // 0-99 (Jalal/Kamal/Jamal + hidden)
    pub index72: u8,                      // assembled 72-state
    pub det64: u64,                       // M3-projection bitboard
    pub deposit_handle: Option<NaraDepositHandle>,  // for M4' journal session (Tranche 3.8-M2)
}

pub struct EarthObserverHandle {
    pub geocentric_anchor: GeocentricAnchor,  // EarthBodyState parallel
    pub witness_chakra_activation: f32,       // 0.0-1.0
    pub kerykeion_observer_lat_lon: (f64, f64),
}
```

**Anti-greenfield rationale:** every data point is already computed somewhere in the substrate — the six axis-views read existing `M2_*_DESC[72]` tables; the Klein-flip semantics are M1'-owned (this just surfaces them onto the bus); the F_routing trace strings together LUTs that are all `.rodata`-resident. What is new is the **routing-and-surfacing carrier** (Tranche 3.2-M2 names `Body/S/S0/portal-core/src/parashakti/f_routing.rs` as the implementation site).

---

## 5. Visual Rendering Contract

The M2' rendering is split across **three layered surfaces** of the `m2-parashakti` extension (plus its participation in the cosmic-1-2-3 composition):

- **Layer A — Six-axis correspondence inspector (72-cell MEF matrix)** — the structural register
- **Layer B — Sacred-sonic correspondence panel (Shem + maqam + mantra + Asma)** — the symbolic register
- **Layer C — Cymatic standing-wave surface (Chladni geometry)** — the visible-form register

Plus dual-cymatic registers (cosmic vs personal-Pratibimba at #4.4.4.4, latter protected to M4').

### 5.1 Layer A — the 72-cell MEF matrix (the structural register)

A 12 × 7 grid (12 lens-anchors × 7 modes = the 84-state landscape — the surface frame M2-1' reads) overlaid with the **12 × 6 = 72-cell active MEF address**:

- **Grid cells** = `MEF_Condition_Desc` per `(lens, position)` pair. Each cell paints `meaning_id`'s glyph and a saturation derived from `resonance72`.
- **Active cell** = the cell at `(lens_mode.lens, position6)` — bright halo from `audio_octet[0]` magnitude.
- **Lens-anchor row** = `lens_mode.lens` row glows; **mode column** = `lens_mode.mode` column traces vertically.
- **Inverted helix bit**: cells in rows 6-11 (`lens ≥ 6`, the `is_inverted=1` half — from `M2_MEF_DESC[i].is_inverted` at [`m2.c:67-111`](Body/S/S0/epi-lib/src/m2.c)) render with cool indigo halo; rows 0-5 with warm amber. The Klein-flip event swaps these halos.
- **Tritone-mirror pairing**: the six lens-pairs (0,3) (1,4) (2,5) and their primed equivalents are rendered as **paired-edge connectors** (faint arcs spanning the two cells) — when Klein-flip fires, the arc lights up and the two cells' valences swap.

Per-cell substrate citations (`M2_MEF_DESC[72]` payload):
- `lens (0-11)` and `position (0-5)` → grid coordinates
- `l_family_link (0-5)` → which L-family colour stripe annotates the row
- `is_inverted (0/1)` → halo temperature
- `meaning_id` → glyph payload (S2-resolved via `s2.meaningIdResolve(id)`)

### 5.2 Layer B — the sacred-sonic correspondence panel

A right-rail panel showing the six-axis decoded view at the active address72:

- **Decan-face card** (top): `M2_DECAN_DESC[address72]` → element/sign/decan/face card; Kerykeion degree readout; ruling_planet glyph
- **Shem-pair card**: the two Shem names for the active decan (light = `M2_SHEM_DESC[active_decan * 2]`, shadow = `M2_SHEM_DESC[active_decan * 2 + 1]`); choir-glyph + position-in-choir + element + Hebrew text + meaning resolved via S2
- **Maqam-mode card**: `M2_MAQAM_DESC[address72]` — family name, mode-in-family, interval pattern visualised as 24 quarter-tone ticks (the 7-interval bar across the 24-position octave), planet-ruler glyph
- **Mantra card**: `M2_MANTRA_LUT[mantra_index]` where mantra_index comes from F_routing — Sanskrit phoneme glyph, frequency band readout (in the 144→432 Hz spectrum), Matrika/Malini phase indicator, element badge
- **Asma card**: `M2_ASMA_LUT[asma_index]` — name + group (Jalal/Kamal/Jamal/Hidden) + DR + mirror_idx; 36-internal / 64-projective routing badge from `m2_is_internal(idx)` / `m2_is_projective(idx)` masks
- **Planetary-chakral card** (bottom): `M2_PLANET_LUT[ruling_planet_idx]` — Cousto Hz, DR, chakra glyph, element badge, Keplerian velocity, day-of-week

Each card's **provenance handle** is rendered as a small badge: `profile-live` (green) / `s2-graph` (blue) / `kerykeion` (cyan) / `pending-DCC-XX` (amber). Per Tranche 15.6 inline provenance.

### 5.3 Layer C — the cymatic Chladni standing-wave surface

The visible standing-wave is the M2'-distinctive render — the moment frequency *organises into form*. Three render targets:

#### 5.3.1 The Chladni equation (single primitive)

Following `m2-prime-parashakti-cymatic-engine.md §3`:

```text
χ(x, y) = Σ_{i=0..7} a_i · sin(m_i · π · x / L) · sin(n_i · π · y / L)
                   + b_i · cos(m_i · π · x / L) · cos(n_i · π · y / L)
```

where:
- `a_i, b_i` = amplitude/phase derived from `audio_octet[i]` (Hz / max_hz, with phase from `address72`)
- `m_i, n_i` = mode-number pair derived from `nodal_quartet[i % 4].{m, n}` ([`vimarsha_reading.rs:101-106`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs))
- `L` = the surface scale (1.0 for plate; `2π` for torus; ...)

The CPU reference (deterministic stylised wave) is the [`meaning-packet.ts:251-271`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts) `buildStandingWavePoints` — 72 samples at θ = 2π·s/72; this is what the readiness-pending fallback renders.

#### 5.3.2 Three Chladni surfaces

| Surface          | Geometry                                      | When rendered                                                                   |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| **Plate (2D)**   | Square plate, free boundary, Bessel modes     | Default Layer C view — the classical Chladni figure                              |
| **Torus**        | T² with chromatic-longitude φ × fifths-meridian θ; modes are torus harmonics | Cosmic-1-2-3 composition: M2 layer **draws on the played-torus K² surface**     |
| **Spheres (chakras)**  | 8 concentric spheres, one per chakra, spherical-harmonic modes per layer | Solar-system spatial anchor view (per UX §8.1); chakras render around Earth-Sun pair |

The plate is the M2' inspector view; the torus is the composition view; the spheres are the daily-0-1 cosmic-side anchor view.

#### 5.3.3 Klein-flip on the cymatic surface

When `klein_flip.flip_at_this_tick == true`, the Chladni pattern **visibly folds through itself** for ~200ms: the standing-wave nodal lines redistribute as the boundary parameters re-read under the flipped lens. Same `audio_octet`, same `nodal_quartet`, but `surface_valence='inverted'` swaps the antinodal/nodal colour-binary and reverses the temporal phase direction.

#### 5.3.4 The colour-binary

- **Antinodal motion** (regions where χ ≠ 0 most strongly): rendered in the **lens-anchor-element colour** from `M2_PLANET_LUT[ruling_planet].elem_sig → ELEM_SIG_GET_ELEMENT(sig)`. Akasha = violet, Vayu = cyan, Agni = vermilion, Apas = aquamarine, Prithvi = umber.
- **Nodal stillness** (regions where χ ≈ 0): rendered as bright white (the still-point); on Klein-flip, the binary inverts (nodes become coloured; antinodes become white).
- **Active 72-cell projection** overlay: faint 72-cell grid traced over the Chladni surface, with the active cell highlighted as a bright halo (the M2' "where on the matrix the standing-wave is sourced").

### 5.4 Dual cymatic registers

Per M2'-SPEC §2 and UX §4:

- **Cosmic-public register** (`scope: 'cosmic-public'`): renders the standing-wave from the public-current profile audio bus. Free to render in any M2' surface.
- **Personal-Pratibimba register at #4.4.4.4** (`scope: 'personal-pratibimba'`): renders the same audio bus but with the personal-quaternion `Q_composed` overlay. **Blocked outside M4' surfaces** — enforced at [`meaning-packet.ts:213-217`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts): `personalScopeBlocked: scope === 'personal-pratibimba'` with `blockReason: 'personal-Pratibimba cymatic rendering requires protected-m4'`. The M2' extension never renders this register; the M4' Nara extension calls `renderM2CymaticFrame({ scope: 'protected-m4' })`.

### 5.5 The L↔L' enharmonic flip (the meaning-translator)

This is M2'-SPEC §7 made operative. On every panel:

| Panel                    | What inverts on Klein-flip                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Layer A 72-grid           | Cool/warm halo swap; lens-pair edge-connectors light up; tritone-pair arcs animate                                     |
| Layer B Shem card        | Light/shadow Shem swap (the two names of the decan-pair invert their primacy)                                          |
| Layer B Decan card       | `face` light↔shadow polarity inverts; the same decan reads with opposite valence                                       |
| Layer B Planetary card   | Solar/lunar phase reading inverts if the crossing engages it                                                            |
| Layer B Maqam card       | The mode reads in its tritone-mirror (Bayati↔Hijaz, Rast↔Saba — the major/minor enharmonic flip)                       |
| Layer B Mantra card      | Matrika↔Malini swap on the phase indicator                                                                              |
| Layer C cymatic surface  | Antinodal↔nodal colour-binary swap; standing-wave self-folds through itself                                             |

Each inversion is **driven** by the `klein_flip.surface_valence` field; **never** locally re-derived. The flip reverses cleanly on the return crossing (Lens N+3 → Lens N restores primary valence). This is the *meaning*-translation: same struck frequency, opposite emotional/material register.

---

## 6. Tick Choreography — The Animation Primitive

### 6.1 The carry-the-tick primitive: bus-driven double-Fourier evaluation

**Single load-bearing animation primitive for M2': double-Fourier evaluation of χ(x, y, t) from the profile bus**, evaluated per render frame from the published `audio_octet[8]` + `nodal_quartet[4]`. There is no local oscillator, no local clock, no local pitch synthesis. The renderer's only job per frame is to evaluate the Chladni sum at the current `(audio_octet, nodal_quartet, address72)` snapshot — and to interpolate visually between successive ticks.

```rust
on tick_advance(t, t+1, dt):
    // The bus is already populated by Vimarśa write inside MathemeHarmonicProfile::from_tick
    let χ_now = evaluate_chladni(profile.audio_octet, profile.nodal_quartet, surface_geometry, dt);
    layer_c.surface_displacement = χ_now;
    layer_a.active_cell_halo.intensity = audio_octet[0] / audio_octet_max;
    layer_a.helix_halo_temperature = if profile.helix == "pratibimba" { "cool" } else { "warm" };
```

The bus-driven primitive is the M2' equivalent of M1's `quat_slerp(K² orientation)` — one truth-bearing animation per layer:

| Render layer            | Animation primitive                                                                                       | Source field                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Layer A 72-grid          | Cell halo intensity = `audio_octet[0]` magnitude; row glow = `lens_mode.lens`                              | `audio_octet[0]`, `lens_mode`                                                                 |
| Layer B sacred-sonic    | Card cross-fade keyed off F_routing trace fields                                                            | `parashakti_meaning.routing_trace.*` (Tranche 3.2-M2)                                          |
| Layer C cymatic surface | **Double-Fourier evaluation of χ(x, y, t)** from `audio_octet` × `nodal_quartet`                            | `audio_octet[8]`, `nodal_quartet[4]`                                                          |
| Solar-system anchor     | Planet positions = Kerykeion `planets[i].degree`; Earth fixed at geocentric origin                          | Kerykeion via `s3.kerykeion`                                                                  |
| Klein-flip self-fold    | One-shot 200ms transition at `klein_flip.flip_at_this_tick` boundary                                       | `klein_flip.flip_at_this_tick` (Tranche 3.1-M2)                                               |

### 6.2 What changes simultaneously on tick advance

| Surface element                               | Change                                                                                          | Source field                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Active MEF cell                               | Jumps `(lens, position) → (lens', position')` with 150ms exponential decay trail                | `lens_mode`, `position6`                                      |
| Layer A row halo                              | `lens_mode.lens` row gains halo; previous row dims                                              | `lens_mode.lens`                                              |
| Layer A column trace                          | `lens_mode.mode` column traces vertically                                                       | `lens_mode.mode`                                              |
| Layer A 12×6 grid pulse                       | All 72 cells pulse at `resonance72` magnitude                                                   | `resonance72.legacy_resonance_index`, `resonance72.lens_anchor_index` |
| Layer A helix-temperature                     | All `is_inverted=1` cells swap halo colour cool↔warm at `helix` change                          | `helix` (string) / `helix_bit`                                |
| Layer B Shem pair card                        | New Shem pair animates in for new decan; previous fades                                          | `parashakti_meaning.axis_views.shem`                          |
| Layer B Maqam interval bar                    | The 7-tick interval pattern animates between maqam-mode transitions                              | `parashakti_meaning.axis_views.maqam.intervals[7]`            |
| Layer B Mantra frequency readout              | Frequency Hz updates at mantra-index advance                                                     | `parashakti_meaning.routing_trace.mantra_index` → `M2_MANTRA_LUT[idx].fundamental_frequency` |
| Layer C χ surface                             | Re-evaluated from new `audio_octet` + `nodal_quartet`                                            | `audio_octet`, `nodal_quartet`                                |
| Layer C colour-binary                         | Element colour updates if `ruling_planet` element changes                                        | `parashakti_meaning.axis_views.decan_face.ruling_planet` → `M2_PLANET_LUT[i].elem_sig`     |
| Solar anchor                                  | Planet glyphs advance at Kerykeion-derived rates                                                  | `kerykeion.planets[i].degree`                                 |

### 6.3 What stays still on tick advance

- **The 12 × 7 grid frame itself** (Layer A scaffold) — only cell contents pulse; grid never reflows
- **The card layout in Layer B** — only content cross-fades; layout is constant
- **The Chladni plate boundary** in Layer C — only the displacement field χ animates; boundary geometry is fixed per surface choice
- **The Earth anchor** in solar-system view — Earth is the still observer; planets move around it
- **The provenance badges** — they only change state (ready/pending/blocked), not position

### 6.4 Render cadence per layer

| Layer                                              | Cadence                                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Layer C χ surface, Layer A cell halo               | **Every frame** (interpolated between ticks)                                                  |
| Layer A grid cell pulse, Layer B card cross-fade   | **Tick-quantised** (snap to tick advance)                                                     |
| Klein-flip self-fold, Möbius-return panel bloom    | **Boundary-quantised** (5→6 tritone-pair crossing; 11→0 full Möbius)                          |
| Decan/Shem/Maqam transitions                       | **Routing-anchored** (advances when F_routing trace updates — Kerykeion + planetary-hour driven, NOT every tick) |
| Solar-system planet glyphs                          | **Kerykeion-anchored** (planetary motion is real astronomical time, not kernel tick)          |
| Mantra frequency band                              | **Mantra-index-anchored** (only advances when F_routing.mantra_index changes)                 |
| Lens/L-family colour stripe                        | **Lens-mode-anchored** (only on `lens_mode` change)                                            |

### 6.5 What happens at the tritone-mirror Klein-flip boundary

When `klein_flip.flip_at_this_tick == true` (Lens N → Lens N+3 crossing, signalled by M1' per CP-M2.03):

- Layer A cool/warm halo temperatures swap across all 72 cells (~200ms fade)
- Layer A tritone-pair arc-connector for the active pair lights up brightly
- Layer B every card inverts surface valence (light↔shadow, major↔minor, ascent↔descent)
- Layer C Chladni standing-wave folds through itself: the antinodal/nodal colour-binary swaps; pattern visibly redistributes as `surface_valence` toggles the boundary parameter reading
- Solar-system anchor: optional one-shot bloom on the lens-anchor planet
- Observability event `m2.klein_flip` emitted on the bus ([`index.ts:17`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts) already declares it)

### 6.6 The 9:8 epogdoon as a visible event

The 72→64 compression `m2_epogdoon_compress(val_72) = val_72 * 8 / 9` is visible per tick as the **DET projection bitboard** card in Layer B (`parashakti_meaning.det_projection.det64`). Every 9 contiguous 72-cells compress into 8 M3-cells; the visible event is the **compression-pulse** that fires every 9 ticks (or every active-cell-cycle of 9), rendering as a one-shot Venus-aesthetic warm-amber bloom on the DET card. This is the M2→M3 conjugation seen as the visible moment of frequency-becoming-matter.

---

## 7. Boundary Contracts

### 7.1 M1↔M2 Vimarśa-window contract (load-bearing, central to cycle-3)

The contract is symmetric:

- **M2-1' WRITES** `audio_octet[8]` + `nodal_quartet[4]` into `MathemeHarmonicProfile` at [`kernel.rs:442-443`](Body/S/S0/portal-core/src/kernel.rs), via `vimarsha_read_profile(tick, lens_mode)` at [`vimarsha_reading.rs:17-37`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs).
- **M1' READS** the bus via the profile subscription (in [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md §7.1`](../M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md)). The played-torus consumes `audio_octet` for the 8 particle emitters around the diamond; `nodal_quartet` for the 4 S² satellite glyphs. The played-torus NEVER invokes a synthesiser, NEVER indexes `m2.h` LUTs locally for octave-lift, NEVER computes intervals from M1-side state.
- **M2' renderer surfaces** (this document, §5) also CONSUME the same bus they wrote. The cymatic standing-wave is the bus made visible.

**This is the bimba/pratibimba dial at the engine layer**: M2-1' is the *Vimarśa reading* of the M1 Prakāśa cloud; the audio bus is that reading; M1' hears its own substrate played back through the M2 read. The two sides never desync because they share one struct field.

### 7.2 M2 ↔ M3 — the 9:8 epogdoon DET contract

M2' produces the 64-bit codon-projection evidence (`mahamaya` / `binary` field on the profile at [`kernel.rs:371-372, 413-418`](Body/S/S0/portal-core/src/kernel.rs); plus the proposed `parashakti_meaning.det_projection` from Tranche 3.2-M2). M3' classifies it:

- **M2' produces**: `M2_TO_M3_CYMATIC_PROJECTION[address72]` u64 mask via wave-superposition (`transduce_vibration_to_symbol` at [`m2.h:533-542`](Body/S/S0/epi-lib/include/m2.h)); 9:8 compress via `m2_epogdoon_compress`
- **M3' classifies**: codon class, rotation, tarot/I-Ching identity, 472-state law

This boundary is **clean**: M2' emits evidence; M3' classifies. M2' never sets `finalClassificationAuthority` — `meaning-packet.ts:150` declares it explicitly: `'M3/M3-prime'`. See [[M3-ARCHITECTURE]] §X for the M3-side reception contract.

### 7.3 M2 ↔ M0 — the relation-web

M2' correspondences are graph edges, not hardcoded tables. The S2-graph law (Neo4j `:Bimba` label + `coordinate` property per memory note) carries the 248 typed relations from `parashakti-deep/relations.json`. M2' consumes them via the kernel-bridge method `s2.parashaktiCorrespondences(address72)` (Tranche 3.4-M2 / O-M2.06). The M2'-SPEC §3 backend contract holds: planetary/chakral/musical mappings come from S2 graph-services, never from renderer constants. See [[M0-ARCHITECTURE]] §X for the M0-2' relation-layer contract.

### 7.4 M2 ↔ M4 — Paraśakti serves Nara

UX §8 + M2'-SPEC §9.4 + M4'-SPEC §5, §7, §16.2: M2' feeds M4' via four channels:

| M4 channel                  | M2 source                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| M4-1 Somatic/transit         | M2-2 element + M2-3 decan body-zone + M2-5 planetary-chakral transit; **medicine LUTs `nara::medicine` already share substrate** (DECAN_BODY_PARTS, DECAN_HERBS, PLANET_CHAKRA per UX §8) |
| M4-2 Oracle/dialect          | M2-4 Shem angel-pair (light/shadow) + maqam mode + mantra entry — the active decan's symbolic tongues                              |
| M4-3 Transformation         | M2-1 MEF lens-position + the Klein L↔L' flip — the *dissolving/crystallising* alchemical engine                                  |
| #4.4.4.4 Personal cymatic   | M2-1' audio bus rendered with personal `Q_composed` overlay — **only inside `protected-m4` scope**                                |

The cross-extension Nara deposit handle (`parashakti_meaning.routing_trace.deposit_handle`) is Tranche 3.8-M2. See [[M4-ARCHITECTURE]] §X for the M4-side consumption.

### 7.5 M2 ↔ M5 — routing traces as Epii learning evidence

M2'-SPEC §9.6: every F_routing traversal may emit a provenance-safe routing trace alongside the rendered M2' packet. Trace records typed stratum edges (M2-0 address, M2-1 lens-position, M2-2 tattva/phase, M2-3 decan/face, M2-4 sacred-sonic correspondences, M2-5 planetary-chakral / DET evidence) but EXCLUDES protected personal body text. `m5-prime-epii-on-parashakti-graph-relational-ml` may learn over these traces as graph-relational ML input (RotatE, R-GCN, GDS). Outputs are derived/governed; never auto-mutate M2 canon. See [[M5-ARCHITECTURE]] §X for the M5-side learning contract.

### 7.6 Composition with integrated-1-2-3 cosmic engine

The integrated 1-2-3 plugin (Tranche 07; per UI Foundation 15.4 composition-over-juxtaposition) composes M1 + M2 + M3 into one editor surface:

- **M1 pole** = played-torus K² topology (`m1-paramasiva-played-torus` Bevy/wgpu)
- **M2 pole** = Layer C cymatic standing-wave rendered **on the K² surface** as the texture parameterisation (not in a separate pane)
- **M3 pole** = codon-rotation projecting onto the K² lens-ring cells

The M2 contribution to the composition is the χ(x, y) field rendered as displacement + colour over the K² mesh — the cymatic IS the surface texture of the played torus. The 8+4 bus drives the displacement; the 72-cell heatmap (Layer A) overlays as cell brightness. M2' exposes a `composition-mount-point` API for the integrated plugin to attach the cymatic shader and the 72-cell heatmap. See [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] for the composition geometry.

### 7.7 Composition with integrated-4-5-0 recognition

The integrated 4-5-0 plugin renders the personal-Pratibimba cymatic at #4.4.4.4 — same M2-1' bus, **protected scope**. The composition is centred on the personal-quaternion `Q_composed` (per UX §8.1 — *Jiva-is-Śiva made concrete*). M2' contributes a `protected-m4`-scoped renderer; M4' Nara surface owns the protection gate. See [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] for the composition.

### 7.8 Anti-overlap with adjacent M's

- M2' does **NOT** render the played-torus topology (that's M1-5 / M1' authority per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §7.2)
- M2' does **NOT** classify codons or tarot/I-Ching (M3'-SPEC §7 owns the codon-rotation layer)
- M2' does **NOT** compute astrology (Kerykeion CLI at S0/epi-cli is the authority)
- M2' does **NOT** synthesise audio in any renderer panel (M2-1' Vimarśa kernel is the SOLE writer)
- M2' does **NOT** auto-write to the personal Nara journal (M4'-SPEC owns the deposit handle gate)

---

## 8. IDE Integration (Theia / `m2-parashakti`)

### 8.1 Extension placement

- **Existing extension**: [`Body/M/epi-theia/extensions/m2-parashakti/`](Body/M/epi-theia/extensions/m2-parashakti) (landed cycle-2 T0; `EXTENSION_ID = 'm2-parashakti'` at [`index.ts:9`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts))
- **Three primary views** registered ([`index.ts:11`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts)):
  - `m2.parashakti.meaningPacket` — Layer A 72-grid + Layer B sacred-sonic inspector (M2PrimeMeaningPacket viewer)
  - `m2.parashakti.cymaticEngine` — Layer C Chladni standing-wave (the deterministic-stylised renderer)
  - `m2.parashakti.correspondenceTree` — the 72-tree browser with all six axes expanded
- **Compact views** for Track 08 integrated plugin composition: `M2MeaningPacketCard`, `M2CymaticMiniView` ([`index.ts:19-36`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts))
- **Forbidden direct imports**: `Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `@clockworklabs/spacetimedb-sdk`, `neo4j-driver` ([`index.ts:95`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts))

### 8.2 Surface placement in the IDE

Per Tranche 15 UI Foundations:

- **Cosmic-side of `daily-0-1`** (integrated 1-2-3 composition): M2 cymatic Layer C renders **on the K² played-torus surface** as texture displacement; the 72-cell heatmap (Layer A) overlays as cell brightness. M2 mini-view (`M2CymaticMiniView`) participates in the composition.
- **Personal-side of `daily-0-1`** (integrated 4-5-0): M2 cymatic in `protected-m4` scope renders the personal-Pratibimba field at #4.4.4.4. M4' owns the scope gate.
- **`ide-deep` `m2-parashakti` view**: All three Layers A/B/C visible in editor area as the full inspector — 72-grid + sacred-sonic cards + Chladni surface side-by-side. This is the pedagogical/developer surface (M2'-SPEC §9.7).
- **OmniPanel (right sidebar)**: NO M2 visualisation. The OmniPanel hosts Pi/Anima/subagent surfaces. M2 runtime monitoring (subscription latency, Klein-flip event counts, Vimarśa bus pending markers) renders as dispatch-trace entries.

### 8.3 Profile-tick clock + readiness inline (Tranche 15.6)

The extension subscribes to the kernel-bridge profile-tick event via `SharedBridgeAdapter` at [`m2-parashakti-widget.tsx:30-31, 54-56`](Body/M/epi-theia/extensions/m2-parashakti/src/browser/m2-parashakti-widget.tsx). Every tick re-renders Layer A grid pulse + Layer C χ field. No local clock. No animation-frame-count fallback.

Readiness rendering inline per the kernel-bridge readiness ledger:

| Pending field                                | Visible behaviour                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `profile.audioOctet[8]`                      | Layer C χ surface renders as ghost-outline; `pending-audio-octet` badge in widget chrome                |
| `profile.nodalQuartet[4]`                    | Layer C boundary parameters render as `pending-nodal-quartet` overlay; Chladni nodes greyed             |
| `profile.kleinFlipState` (pre Tranche 3.1)   | Klein-flip self-fold never fires; `pending-klein-flip` badge on Layer B cards                            |
| `s2.decanFace`, `s2.sacredSonic`, `s2.earthObserverHandle` | Layer B cards render with `pending-s2-correspondence` badge; meaning-IDs show numeric, not resolved |
| `s3.kerykeion.worldClockHandle`              | Solar anchor + active-decan + planetary-hour readouts render `pending-kerykeion`; F_routing dormant     |

The `DECLARED_BLOCKERS` at [`index.ts:18`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts) already enumerate: Track 01 (profile fields), Track 02 (S2 correspondence), Track 03 (Kerykeion). These render via `ReadinessBanner` at [`m2-parashakti-widget.tsx:83-89`](Body/M/epi-theia/extensions/m2-parashakti/src/browser/m2-parashakti-widget.tsx).

### 8.4 Provenance inline rendering

Per Tranche 15.6, every datum carries a provenance handle visible inline:

- `M2_MEANING_PACKET_CONTRACT_VERSION = '2026-06-01.07-T5'` ([`meaning-packet.ts:10`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts)) — version-stamped per cycle
- Every Layer B card shows source: `profile-live` / `s2-graph` / `kerykeion` / `pending-DCC-XX`
- `M2ProvenanceHandle` ([`meaning-packet.ts:16-21`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts)) emits source category + handle string + `bodyAllowed: bool` + optional note
- `pendingFields` array ([`meaning-packet.ts:86`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts)) lists every blocked pathway; widget renders as bulleted list when non-empty

### 8.5 Bimba/Pratibimba state persistence across toggle (Tranche 15.7)

State surviving `daily-0-1` ↔ `ide-deep` and 0/1 cosmic/personal:

- `(profileGeneration, lens_mode, tick12, position6, address72, klein_flip.surface_valence)`
- Layer A scroll position + active grid cell
- Layer B card scroll position
- Layer C surface choice (plate / torus / spheres) + zoom level
- Last F_routing trace (if Kerykeion was available)

Per the kernel-bridge DI singleton contract; the `BimbaPratibimbaUiState` typed object in `omnipanel-runtime` + `pratibimba-layouts` (Tranche 15.7).

### 8.6 Accessibility — pause/scrub + audio safety

The cymatic surface accepts a `pause` (freeze χ field at current snapshot) and `scrub_to_tick(t)` affordance (deterministic replay of the bus state at tick t). Because the Chladni evaluation is a deterministic function of `(audio_octet, nodal_quartet, surface_geometry)`, replay is exact.

Audio-safety: the M2' extension itself does NOT make sound. The audio bus is a *representation* of frequency; actual audio rendering (when enabled) is owned by an upstream music-tech surface (Tranche 3.7-M2 / CP-M2.13 — MIDI 2.0 / MPE / MTS-ESP adapter, deferred). The cymatic visual derives from the bus even when playback is disabled (per M2'-SPEC §6 and M4'-SPEC §16.2).

### 8.7 Cross-extension route contracts

The extension declares `m2.det-evidence-to-m3.codon-projection` as its sole `CROSS_EXTENSION_ROUTE_CONTRACTS` participation ([`index.ts:65-69`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts)) — the route that carries the DET-evidence packet from M2' to M3'. Observability events: `m2.meaning_packet`, `m2.routing_trace`, `m2.klein_flip` ([`index.ts:17`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts)).

---

## 9. Anti-Greenfield Audit

### 9.1 Landed in code (consume as-is)

| Asset                                                 | Location                                                                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 72-byte vibrational union + 72-invariant static asserts | [`Body/S/S0/epi-lib/include/m2.h:122-131`](Body/S/S0/epi-lib/include/m2.h)                                              |
| `M2_ARCHETYPES` master union instance                  | [`Body/S/S0/epi-lib/src/m2.c:21-43`](Body/S/S0/epi-lib/src/m2.c)                                                       |
| `M2_MEF_DESC[72]` MEF descriptor table                  | [`m2.h:182`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:67-111`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_TATTVA_DESC[36]` tattva descriptor                  | [`m2.h:236`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:113-162`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_DECAN_DESC[72]` decan light/shadow descriptor        | [`m2.h:256`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:164-241`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_SHEM_DESC[72]` Shem 8×9 descriptor                   | [`m2.h:390`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:321-407`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_MAQAM_DESC[72]` 10-family 24-TET maqam descriptor   | [`m2.h:418`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:430-518`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_MAQAM_SPIRITUAL[8][3]` 24-station spiritual maqamat | [`m2.h:426`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:520-545`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_ASMA_LUT[100]` 99+1 names + 36-internal/64-projective masks | [`m2.h:447, 491-492`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:547-782, 784-802`](Body/S/S0/epi-lib/src/m2.c)             |
| `M2_MANTRA_LUT[100]` Matrika 50 + Malini 50 with 144-432 Hz | [`m2.h:476`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:662-782`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_PLANET_LUT[10]` Cousto + Keplerian planetary operators | [`m2.h:311`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:264-295`](Body/S/S0/epi-lib/src/m2.c)                              |
| `EarthBodyState` geocentric anchor                       | [`m2.h:318-322`](Body/S/S0/epi-lib/include/m2.h)                                                                       |
| `M2_CHAKRA_LUT[8]` chakra descriptors                    | [`m2.h:362`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:302-311`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_ELEMENTS[5]` element throughline                     | [`m2.h:520`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:804-819`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_TO_M3_CYMATIC_PROJECTION[72]` DET masks              | [`m2.h:530`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:821-883`](Body/S/S0/epi-lib/src/m2.c)                              |
| `M2_CAUSAL_RESONANCE_MASKS[36]` cross-weave              | [`m2.h:561`](Body/S/S0/epi-lib/include/m2.h); [`m2.c:884-918`](Body/S/S0/epi-lib/src/m2.c)                              |
| `m2_epogdoon_compress / _expand` 9:8 integer transforms  | [`m2.h:545-551`](Body/S/S0/epi-lib/include/m2.h)                                                                       |
| `m2_aspect_between` aspect computation                  | [`m2.h:622-639`](Body/S/S0/epi-lib/include/m2.h)                                                                       |
| Vimarśa kernel (M2-1' audio-genesis)                    | [`Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-132`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs) |
| `MathemeHarmonicProfile` with `audio_octet`+`nodal_quartet`+`elements`+`planetary_chakral` | [`Body/S/S0/portal-core/src/kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs)                                    |
| Kerykeion CLI runner                                    | [`Body/S/S0/epi-cli/src/nara/wind.rs:55, 110-148`](Body/S/S0/epi-cli/src/nara/wind.rs)                                  |
| Parashakti-deep dataset (248 typed relations)            | `Idea/Bimba/Map/datasets/parashakti-deep/{relations,nodes-full-detail,parashakti-planets}.json`                          |
| `m2-parashakti` Theia extension (packet builder + Chladni reference) | [`Body/M/epi-theia/extensions/m2-parashakti/`](Body/M/epi-theia/extensions/m2-parashakti)                              |
| `MathemeNodalConstraint { ql_position, helix, m, n }`     | structurally in `kernel.rs`; written by `vimarsha_reading.rs:95-107`                                                    |

### 9.2 Pending (cycle-3 deliverables)

- **Tranche 3.1-M2** — `klein_flip_state` field on `MathemeHarmonicProfile` (CP-M2.03 closure); owner: M1'-SPEC §6 producer
- **Tranche 3.2-M2** — `parashakti_meaning: ParashaktiMeaningProjection` field on profile + `Body/S/S0/portal-core/src/parashakti/f_routing.rs` carrier (ORPHAN-fill for O-M2.07)
- **Tranche 3.3-M2** — six-axes per-axis decoder (replace single `lensAnchorIndex` reuse at [`meaning-packet.ts:220-228`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts) with per-axis LUT decoders)
- **Tranche 3.4-M2** — kernel-bridge method `s2.parashaktiCorrespondences(address72)` (ORPHAN-fill for O-M2.06)
- **Tranche 3.5-M2** — DCC-03 decision-register entry on planet-count + Earth-observer semantics
- **Tranche 3.6-M2** — DR-M2-2 ratification: six axes of 72 + sonic overlays + planetary keying canon; UX §3 patch (downgrade 7-row enumeration); Theia `M2AddressView` split `shem-asma` → `shem` + `asma`
- **Tranche 3.7-M2** — music-tech adapter `Body/S/S0/portal-core/src/music_tech.rs` (deferred CP-M2.13; not executed cycle-3)
- **Tranche 3.8-M2** — Nara deposit-handle wiring via F_routing trace (cross-extension; routed to integrated 4-5-0 plugin closure)

### 9.3 Net-new (M' product surface exceptions to anti-greenfield rule)

- **Layer C cymatic surface choice** (plate / torus / spheres) — UX choice not in substrate; renderer-side selection
- **Layer A 12 × 7 grid scaffold** — visualisation choice; the 12 × 6 = 72 is canonical, the 7-mode overlay is the M1'-landscape projection
- **Klein-flip self-fold animation** — substrate gives the `klein_flip_state` flag; the 200ms self-interpenetration choreography is renderer-side
- **9:8 epogdoon compression-pulse bloom** — substrate gives `m2_epogdoon_compress`; the visible 9-tick bloom is renderer aesthetic
- **The colour-binary palette (Akasha=violet / Vayu=cyan / Agni=vermilion / Apas=aquamarine / Prithvi=umber)** — design choice; substrate gives `Element_Id` only

### 9.4 Forbidden (do not invent)

- **Local pitch synthesis** in any renderer panel (M2'-SPEC §3, §6, §10; CONTRACT VIOLATION if any oscillator appears in `m2-parashakti/src/`)
- **Local Kerykeion / astrology computation** (M2'-SPEC §9.1: "no need for M2' to compute astrology locally")
- **Local LUT forks** of `m2.h` `M2_MEF_DESC` / `M2_DECAN_DESC` / `M2_SHEM_DESC` / `M2_MAQAM_DESC` / `M2_PLANET_LUT` / `M2_MANTRA_LUT` / `M2_ASMA_LUT` into TS — all consumption is via kernel-bridge axis-decoder method
- **Local hardcoding** of planetary/chakral/codon correspondences — M2'-SPEC §3, §5: comes from S2 graph law, never from renderer constants
- **Codon classification** in M2' (M2'-SPEC §0.3, §9.8: M3'/M3'-SPEC §7 owns this)
- **Direct M0 / S0 / S1 / S2 / S3 / SpaceTimeDB / Neo4j imports** in M2 widgets ([`index.ts:95`](Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts) — `forbiddenImports`)
- **Personal-Pratibimba rendering outside protected M4'** (M2'-SPEC §5: enforced by `cymaticScope === 'personal-pratibimba'` block at [`meaning-packet.ts:213-217`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts))

---

## 10. Test Criteria

The M2' surface is acceptance-ready when:

1. `test -d Body/M/epi-theia/extensions/m2-parashakti` succeeds AND `test -f Body/M/epi-theia/extensions/m2-parashakti/ARCHITECTURE.md` succeeds.
2. **72-invariant round-trip**: `address72 ∈ [0, 71]` round-trips through all six axes — `mef`, `tattva-phase`, `decan-face`, `shem`, `maqam`, `det-projection`. Verification: `grep -c "sourceField: 'profile.resonance72" Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` returns 1 (only MEF axis), and 5 other axes have distinct `sourceField` (Tranche 3.3-M2).
3. **Two resonance72 encodings agree**: for all 72 positions `kernel_resonance_index(base_lens, helix, position) == lens_anchor_index` round-trip via the 6-lens-helix legacy index. Verification: `cargo test -p portal-core --test resonance72_round_trip`.
4. **Vimarśa-window audit** (M1↔M2 contract): `! grep -rn "synthesise\|local_pitch\|computeHz\|deriveOctet" Body/M/epi-theia/extensions/m2-parashakti/` AND `! grep -rn "synthesise\|local_pitch\|computeHz" Body/M/epi-theia/extensions/m1-paramasiva-played-torus/`.
5. **Klein-flip round-trip**: `klein_flip_state` flips on Lens N → Lens N+3 and reverses on N+3 → N (Tranche 3.1-M2). Verification: `cargo test -p portal-core --test klein_flip_round_trip` AND visual-regression test on Layer A halo swap.
6. **Cymatic deterministic** (M2'-SPEC §10): `renderM2CymaticFrame` produces identical `wavePoints` for identical `(audio_octet, nodal_quartet, address72)`. Verification: `pnpm --filter @pratibimba/m2-parashakti test:cymatic-determinism`.
7. **Personal-Pratibimba scope block** test: `renderM2CymaticFrame({ scope: 'personal-pratibimba' })` returns `personalScopeBlocked: true` with reason `'personal-Pratibimba cymatic rendering requires protected-m4'`. Verification: existing test at `meaning-packet.ts:213-217`.
8. **F_routing carrier present** (Tranche 3.2-M2): `test -f Body/S/S0/portal-core/src/parashakti/f_routing.rs` AND `grep -n "f_routing" Body/S/S0/portal-core/src/parashakti/mod.rs` returns ≥ 1.
9. **F_routing trace round-trip** (deterministic): for fixed `(intent, kerykeion_state, time)`, `F_routing(...)` yields a deterministic `RoutingTrace`; `routing_trace.index72` round-trips through all six axis views.
10. **DET 64-bit projection clean**: M2' emits `det_projection.det64`; verify `finalClassificationAuthority === 'M3/M3-prime'` at [`meaning-packet.ts:150`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts) is present; M3' classifies, M2' does not.
11. **Six-axes canonicalisation** (Tranche 3.6-M2): UX `parashakti-ux-full-m2-branch.md §3` patched to six axes + two sonic overlays + planetary keying; `M2AddressView['name']` enum contains `'shem'` and `'asma'` as separate entries (not collapsed `'shem-asma'`).
12. **DCC-03 ratified** (Tranche 3.5-M2): `earth_observer_handle` field on profile (or kernel-bridge); `planetCountDecision: 'pending-DCC-03'` removed from [`meaning-packet.ts:145`](Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts).
13. **Provenance discipline**: every Layer B card carries a provenance handle; pending fields render `pending-XX` badges (Tranche 15.6); no card renders with renderer-folklore defaults.
14. **S2 graph-correspondence adapter** (Tranche 3.4-M2): `grep -n "parashaktiCorrespondences" Body/M/epi-theia/extensions/kernel-bridge/src/` returns ≥ 1; integration test against `parashakti-deep` dataset.
15. **MIDI/MPE/MTS-ESP tuning** (Tranche 3.7-M2 deferred): named integration carrier reference; not gated on cycle-3.
16. **Composition mount-point**: M2 extension exposes `composition-mount-point` for integrated-1-2-3 plugin (Tranche 07.3 / 15.4). Verification: `grep -n "compositionMountPoint\|cymatic-mount" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/`.
17. **Forbidden-imports audit**: `! grep -rn "Body/S/S0\|Body/S/S2\|Body/S/S3\|@clockworklabs/spacetimedb-sdk\|neo4j-driver" Body/M/epi-theia/extensions/m2-parashakti/src/`.
18. **Privacy test**: no protected M4 private journal payload appears in the M2' cosmic-public packet; verify `payload.bodyAllowed` for non-profile handles is `false` for protected-local data.

---

## 11. Closing — Why M2' Is the Right Place to Put the Spectral Field

The current UX docs put "the frequency" semantically at M2 and the cymatic rendering at M2'. The substrate agrees: the **data** of the 72-invariant is M2 (`M2_Vibrational_72_Space` + the six `.rodata` LUTs); the **reading** of the substrate through Vimarśa is M2-1' (`vimarsha_reading.rs` writes the 8+4 bus); the **playable visible standing-wave** is M2' (the Chladni surface evaluating that bus). The dial is the bimba/pratibimba contract:

> **M2 is the field (72-invariant address law). M2-1' is the reading-act (Vimarśa, writes the bus). M2' is the played frequency made correspondentially audible and visible across six axes + two sonic overlays + a planetary keying — and the Klein-flip is how it plays *meanings*, not tones.**

The **72-invariant is the field**; the **9:8 epogdoon is how that field compresses into matter**; **Venus is the beauty-operator** at the centre of the compression; **the Klein-flip is the surface inversion** by which the same struck frequency reads as aspiration on one side of the mirror and groundedness on the other. The cymatic standing-wave is the **visible moment of frequency-becoming-form** — the place where the M2→M3 conjugation, the 9:8 epogdoon, the 72→64 compression, are all the same act of *Venusian-aesthetic refinement* — the matheme's spectral self-recognition.

**One 72-cell, seven tongues** (M2'-SPEC §2 closing formula): a lens-position is also an angel, a mode, a mantra, a body-zone, a planet — *and it sounds*. The M2' surface makes the seven simultaneous.

---

*Companion reconciliation matrix: [`wave-a-m2-reconciliation-matrix.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m2-reconciliation-matrix.md). Cross-references: [[M2'-SPEC]] §0-11 (canonical domain spec), [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §7.1 (the M1↔M2 Vimarśa-window contract), [[M3-ARCHITECTURE]] (the M2→M3 9:8 DET reception), [[M0-ARCHITECTURE]] (the relation-web S2 graph law), [[M4-ARCHITECTURE]] (the M2→M4 medicine + cymatic-Pratibimba contracts), [[M5-ARCHITECTURE]] (the routing-trace learning), [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] (the composition geometry on the K² surface), [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] (the personal cymatic at #4.4.4.4).*
