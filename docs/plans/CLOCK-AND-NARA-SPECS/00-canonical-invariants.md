# Canonical Invariants — Nara / Cosmic Clock System

**Status:** Canonical Reference (updated 2026-03-19)
**Note:** This sheet supersedes any conflicting statement in other documents. When in doubt, trust this.

---

## §1 Identity Model

- **Quintessence identity = BLAKE3 archetypal address.** This is THE identity. It is NOT a competing object with the quaternion — the hash IS the canonical form; the quaternion is the derived mathematical form.
- **Quintessence quaternion** = derived mathematical form: weighted average of all valid #4.0 elemental profiles → remap [FIRE, WATER, EARTH, AIR] → [w, x, y, z] → normalize to unit quaternion. Updates only on identity augment (not on every oracle cast).
- **live_quaternion** = updated on every oracle cast from `(pp, nn, np, pn)` charges. Distinct from quintessence_quaternion. The oracle charges modulate the live orientation; the identity hash is fixed.
- **Identity minimum for portal entry** = natal data only. Gene Keys, Human Design, Jungian typology, and QL birth encoding are enrichment layers, never blockers. The portal opens on natal data alone.
- **5 sub-systems of #4.0:** natal chart, gene keys, human design, jungian typology, QL birth encoding. All additive. Quintessence weight (and hash complexity) increases as enrichment layers are filled.
- **natal_hash** = `BLAKE3(full natal config)` — fixed forever at first identity set, never recomputed.
- **live_hash** = `BLAKE3(h_natal || h_genekeys || h_humandesign || h_jungian || h_ql_birth)` — updates as each enrichment layer is filled in. When a layer is absent, its slot contributes a zero-filled 32-byte block.

---

## §2 Planet Model

```
Mod-10 Planet System + EarthBody (canonical 2026-03-16):

Sun(0)   = stable parent, solar root, leading light
           NOT subject to chakral mapping
           encapsulates all others; the fixed attractor

Moon(1), Mercury(2), Venus(3), Mars(4), Jupiter(5),
Saturn(6), Uranus(7), Neptune(8), Pluto(9)
           = 9 orbiting planets in the tracked celestial operator field

EarthBody = center / observer / bridge / solar child of Sun
            NOT in PlanetState[10]
            has no clock-face degree
            occupies CHAKRA_EARTH=0 in the 8-site bodily projection
            renders as the root-anchor beneath the 7 canonical chakras

9:8 Epogdoon
  = 9 non-Sun planets (Moon–Pluto) : 8 bodily sites (EarthBody + 7 canonical chakras)
  = the Pythagorean whole tone ratio
  = EarthBody is in the bodily count but NOT in the planetary array
  = this asymmetry IS the interval — do not resolve it

Transpersonal: Uranus(7), Neptune(8), Pluto(9)
  is_transpersonal: bool in PlanetState

Internal planetary array: [PlanetState; 10]
  indexed 0=Sun, 1=Moon, 2=Mercury, 3=Venus, 4=Mars,
          5=Jupiter, 6=Saturn, 7=Uranus, 8=Neptune, 9=Pluto
Companion embodied anchor: EarthBodyState
```

**Migration note:** The current `m2.h` `Planet_Id` enum is in non-canonical order (`Sun=0, Earth=1, Venus=2, Mercury=3, Moon=4, ...`). Reordering requires full Parashakti dataset reconciliation — this is a **FUTURE TASK**. These specs describe canonical intent; code currently has legacy ordering. Do not propagate the legacy ordering into new code.

---

## §3 Canonical Primitive Vocabulary

| Primitive | Type | Meaning |
|-----------|------|---------|
| `exact_degree_720` | `f32` | High-precision continuous clock address 0.0–719.999…; first 360° = explicate (Strand A), second 360° = implicate (Strand B) |
| `degree_node_360` | `u16` | Integer 0–359 for LUT lookup only. Never used in arithmetic. Cast is explicit and named. |
| `phase` | `u8` | `0` = explicate (Strand A), `1` = implicate (Strand B) |
| `tick12` | `u8` | Canonical M1 ring position 0–11. The ONE discrete clock state. `tick12` IS `torus_stage` IS `spanda_stage` — one field, three names for the same thing. |
| `cf_substage6` | `u8` | 6-fold view derived as `tick12 % 6`. Strand A view. Not a separate counter; always derivable on demand. |
| `earth_body` | `EarthBodyState` | Special planet/chakra bridge node: geocentric center, solar child of Sun, `CHAKRA_EARTH=0`, rendered as the bodily root-anchor beneath the 7 canonical chakras. |
| `quaternion4` | `[f32; 4]` | Normalized `[w=EARTH, x=FIRE, y=WATER, z=AIR]`. Always unit quaternion. EARTH anchors the w-component. |
| `quintessence_hash` | `[u8; 32]` | BLAKE3 archetypal address. THE identity. Stable between enrichment updates. |
| `oracle_eval4` | `(f32, f32, f32, f32)` | `(pp, nn, np, pn)` charge algebra from coin/card throw. Raw output of oracle cast before quaternion update. |
| `oracle_payload` | struct | Machine-readable + human-readable simultaneously. See `09-cosmic-clock-plugin-tui-spec.md §oracle-payload` for full schema. |

---

## §4 Precision Rules

- **No arbitrary rounding or truncation** of degree values at any pipeline stage.
- `exact_degree_720` is preserved as `f32` throughout all internal computation.
- `degree_node_360` is used **only** for LUT index lookup. The integer cast must be explicit and named (never implicit coercion). Pattern: `let node = exact_degree_720 as u16 % 360;`
- `tick12` is derived by `quantize_to_spanda_substage(y, x)` from the quaternion y/x components — integer 0–11.
- **Percentile notation** (e.g., "tick12=3, 40th percentile") is an interpolation aid for display between adjacent tick12 positions. It is NOT a replacement for exact storage and must never appear in persistent state.

---

## §5 Earth Center Semantics

- **Earth is NOT "always fully activated" at level 1.0.** This formulation is deprecated.
- **Earth IS the clock's fixed center:** the geocentric observer, the site of the #4.4.4.4 identity anchor.
- All other elements (FIRE, WATER, AIR) are the "active" dynamic components that change with oracle state.
- **Rendering:** EarthBody = central axis marker / anchor point / bodily root, **not** a peer bar alongside Root–Crown.
- Earth occupies `CHAKRA_EARTH = 0` in the 8-site bodily array (`EarthBody + 7 chakras`) as the ground reference.
- The Earth site renders differently from the other 7 — it is the base/center, not a level to be filled.

---

## §6 Clock Lenses vs Walk Modes

**16 Lenses** = static, simultaneous reading apertures. All 16 are active for every degree at once. `lens_segment[16]` in `Clock_Degree_Node` pre-bakes all 16 interpretations at build time.

**9 Walk modes** = sequential traversal paths, executed one at a time. Each walk has its own step semantics and step count.

| Walk | Matching Lens | Step Size | Step Count | Notes |
|------|---------------|-----------|------------|-------|
| `WALK_DEGREE` | Lens 0 (1×360) | 1° | 360 | Full degree traversal |
| `WALK_AMINO` | Lens 7 (15×24) | 15° | 24 | Backbone nodes only |
| `WALK_ZODIAC` | Lens 6 (12×30) | 30° | 12 | Astrological semantics |
| `WALK_SPANDA` | Lens 9 (30×12) | 30° | 12 | M1 spanda — **renamed from WALK_TORUS** |
| `WALK_DECAN` | Lens 5 (10×36) | 10° | 36 | |
| `WALK_HEXAGRAM` | none | — | 64 | Binary 2^6 space; 360/64 is not integer |
| `WALK_ENNEADIC` | Lens 11 (40×9) | 40° | 9 | |
| `WALK_SEASONAL` | Lens 13 (90×4) | 90° | 4 | |
| `WALK_LINE_CHANGE` | none | — | 384 | Full transformation graph: 64 hexagrams × 6 lines |

`WALK_HEXAGRAM` and `WALK_LINE_CHANGE` are **binary evaluation traversals** with no lens equivalent — by design. `360 / 64 = 5.625` is not an integer. These walks operate in 2^6 arithmetic space, not degree space.

---

## §7 Oracle Faces (4 Distinct — Never Confuse)

Four faces are computed from every oracle cast. They are distinct transforms:

| Face | Address | Description |
|------|---------|-------------|
| **Primary** | `CLOCK_DEGREE_LUT[d]` | The codon; what is currently expressed |
| **Deficient** | `CLOCK_DEGREE_LUT[(d + 180) % 360]` | Polar complement; same phase, opposite position on ring |
| **Implicate** | `(degree = d, phase = 1)` equiv. `exact_degree_720 = d + 360` | Same ring position, opposite SU(2) phase; conjugate |
| **Temporal** | `primary_hex XOR changing_lines_mask` | Live cast result; NOT pre-computed, derived from coin throw |

**Deficient ≠ Implicate.** This distinction must never be collapsed:
- **Deficient:** `(d + 180)` within the same phase = polar complement on the ring.
- **Implicate:** same `d`, phase bit flipped = SU(2) conjugate. Moving from explicate strand to implicate strand at the same angular position.

---

## §8 Session Hash Derivation

- `session_hash` in `PortalClockState` = `BLAKE3(quintessence_hash[32] || session_start_u64[8])`
- **Writer:** Khora (PI extension, session lifecycle owner). Nara does NOT derive this.
- `session_start` = Unix timestamp (u64, seconds) from Khora session open event.
- **Nara does NOT own session state** — it reads `session_hash` from Khora. Nara must never independently derive or persist `session_hash`.

---

## §9 — The # / ## Structural Relationship (Canonical)

- **`#`** lives in `.rodata` — it IS the inversion act, the absolute non-dual ground.
  Structurally foundational; nothing precedes it.
- **`##`** (self-inversion of inversion) **emerges** from `#` applied to itself **at the Nara
  level** within M0-4 (`#0-4.5/0-0` = Primordial Matrix). It does not precede `#` —
  it arises from `#`'s own self-recognition within the Nara holographic matrix.
- **`##` IS the world-matrix** — the non-dual becoming dual. The Sun/Earth esoteric
  relationship (prakasha/vimarsha) IS this `##` event at cosmic scale.
- **12/13/14-fold structure:** Every LUT[12] (ring of 12 positions) depends on a silent 13th
  (`#` = Axis Mundi, always present as center, never a ring slot) and a silent 14th (`##` = the
  generative event that produces the ring from within Nara space). Directionality: `# → ## → 12`.
- **`#4.4.4.4`** (world-individual nexus): The individual here is not an entity confronting
  a world. They ARE the vimarsha act through which a world is constituted. "Personal
  pratibimba" is a provisional label — personhood and worldhood are non-dual here.
  The individual is the default locus because the human is the demonstrably sentient being
  (logos/language capacity = vimarsha made explicit).

---

## §10 — Decan Double-Cover (Canonical — 2026-03-19)

- **The 36 decans each have two poles:** upright (light) and reversed (shadow).
- **72 = 36 × 2** is the canonical decan count (not 36). This is the same 72 as
  M1's 12 spanda × 6 QL, and M2's 36 decans × 2 strands.
- **Data source:** `mahamaya-deep/nodes-full-detail.json`, field `reversedMeaning`
  on pip card nodes (`#3-4-{suit}-{pip}`) — confirmed for all 36 pip decans.
- **Body zone rule:** shadow pole (reversed) = same anatomical region as light pole,
  read as the blocked or excessive expression of that zone.
- **Oracle rule:** `card.orientation == Reversed` → read from `shadow_meaning`; body
  zone annotation = `ObstructedExpression`.
- **Rotational state (provisional):** 8-fold system at 45° steps. Upright = 0°; reversed
  = 180°; 6 intermediate states form the full spectral wheel. The binary upright/reversed
  is the minimal double-cover; full 8-fold expansion deferred to dedicated spec.
- **coreRatio `64:8:40`** (`#3` Mahamaya): 64 codons, 8 rotational states each, 40
  non-dual (palindromic) anchors. 64 × 8 = 512 total states; −40 = 472 dynamic.

---

## §12 Deprecated / Superseded Formulas

The following MUST NOT be copied forward into new code or specs. If you encounter them in existing code, flag for migration.

| Deprecated | Superseded by | Reason |
|------------|---------------|--------|
| `planet_degrees[7]` | `planet_degrees[10]` (Sun–Pluto compact array) | Missing outer planets |
| `planet_degrees[9]` (without Uranus) | `planet_degrees[10]` (includes Uranus at index 7) | Uranus omitted |
| `WALK_TORUS` | `WALK_SPANDA` | Torus is topology not walk semantics; spanda names the M1 process |
| `torus_stage = atan2(w, x) × (6 / 2π)` | `tick12 = quantize_to_spanda_substage(y, x)` | Wrong components; atan2 gives continuous, not quantized |
| `degree_720 = atan2(y, z) × (720 / 2π)` | Oracle cast degree comes from the primary hexagram/codon position | Quaternion components don't encode degree directly |
| "Earth always fully activated" | "Earth = clock center anchor, fixed ground reference" | Confuses observer with signal |
| `natal_quaternion` as standalone field | `quintessence_quaternion` (derived from 5 #4.0 profiles) | Natal is one input layer, not the whole quaternion |
