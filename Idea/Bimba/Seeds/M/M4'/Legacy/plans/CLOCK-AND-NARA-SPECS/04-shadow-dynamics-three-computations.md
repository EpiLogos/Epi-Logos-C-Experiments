# Shadow Dynamics — Three Distinct Computations

**Status:** Canonical (2026-03-15)

---

## The Three Shadow Types Are Geometrically Distinct

"Shadow" is not one thing. Every oracle cast returns three different shadow readings, each
computed differently, each meaning something different.

---

## Shadow 1 — Deficient Aspect: `invert_degree(d)`

**What:** Polar complement — same frame, different position.
**Formula:** `(d + 180) % 360` — stay in the same hemisphere (explicate OR implicate), cross to the polar opposite.
**Meaning:** What is structurally absent. The archetype operating in its *declining* rather than ascending phase.
In Gebser: the **deficient mode** of a structure of consciousness.
In genetics: a **missense mutation** — same codon family, but the protein folds slightly wrong.
In I-Ching: the hexagram formed when ALL SIX lines are changed (the full complement).

**This is the anticodon.** The oracle currently returns the codon at `d`. The deficient aspect is
`CLOCK_DEGREE_LUT[(d+180)%360]`. It is NOT negative — it is the **structural complement**. The
backbone nodes (is_palindromic = true) are precisely where `d == (d+180)%360` would hold if the
system were pure Möbius — the integration points where both codon and anticodon are the same
(Quintessence achieved, no residue).

**I-Ching line changes as deficient pathway:**
Specific line changes that "raise up" shadow danger should be computed here.
Not all line changes are deficient — only those moving toward the anticodon's deficient mode.
The 6 yang→yin changes in a hexagram = the 6 steps toward the anticodon = the shadow transformation path.

---

## Shadow 2 — Epistemic Inverse: `conjugate_degree(d)`

**What:** Phase flip — same position, different hemisphere.
**Formula:** `d + 360` — same clock degree, cross explicate↔implicate layer.
**Meaning:** The same archetype in depth — the unconscious compensation, the implicate ground beneath
the explicit surface. In Jungian terms: the same content viewed through the shadow function (inferior
function as lens, not the dominant).

The # operator applied to the LENS, not the content:
- Same oracle draw, same clock position `d`
- The lens is inverted — what was figure becomes ground
- Jungian lens inverted: the draw reveals your inferior function's reading, not your dominant
- The lens inversion IS switching to the reciprocal partner in the 4×4 matrix (Row 0↔Row 3, Row 1↔Row 2)

**Geometrically:** `conjugate_degree(d) = d + 360` puts you at the identical angular position on
the SECOND 360° loop of the 720° double cover. Same place, different phase. This is the quaternionic
conjugate: q* has the same magnitude and real part, but the imaginary components are negated.

---

## Shadow 3 — Temporal Anticodon: live changing-lines draw → resulting hexagram

**What:** Where this configuration is going — the temporal direction of the transformation.
**How it is computed:** The I-Ching LINE_CHANGE edges (384 total, one per hexagram × 6 lines) ARE the
transformation graph. The specific lines that change are determined by the oracle cast itself (the
three-coin throw's "old yin / old yang" outcomes) — NOT pre-computed per degree in the LUT.
The LUT provides the static graph structure; the live cast activates specific edges.

**Formula:** `changing_lines_bitmask` (0-63, 6-bit) is determined by the cast. Apply those line flips
to `primary_hexagram` to produce `temporal_hexagram`. The LINE_CHANGE XOR: for each set bit `n` in
`changing_lines`, flip line `n` of the hexagram bitboard. This is the standard I-Ching rule — moving
lines transform one hexagram to the next.

**Meaning:** The temporal anticodon = not what is absent NOW, but what this configuration is BECOMING.
In the two-stroke model: codon = outward articulation (what is), anticodon = inward integration (what is forming).

The resulting hexagram address `temporal_degree` is then the degree on the clock that `temporal_hexagram`
occupies — the third position in the quaternionic reading.

**Why not a LUT field:** A single "predetermined temporal hexagram per degree" would collapse the
transformation graph to a single path, destroying the I-Ching's branching nature. There are up to
6 possible single-line changes from any hexagram, and the cast determines which lines are moving.
The LUT correctly records `hexagram_line_active` (which line is primary at this degree within the hex)
and the clock's static structure; the live outcome is always the cast.

---

## The Quaternionic Oracle Reading (All Three + Primary)

Every oracle cast at degree `d` returns 4 positions — the **quaternionic oracle reading**:

| Component | Computation | Quaternion map | Semantic |
|---|---|---|---|
| Primary (codon) | `CLOCK_DEGREE_LUT[d]` | w = pp-charge (T/EARTH) | What is expressed, conscious |
| Deficient aspect | `CLOCK_DEGREE_LUT[(d+180)%360]` | x = nn-charge (A/FIRE) | What is structurally absent |
| Epistemic inverse | `CLOCK_DEGREE_LUT[d+360]` (implicate phase) | y = np-charge (G/WATER) | The unconscious ground of the position |
| Temporal anticodon | `m3_changing_lines → resulting hex` | z = pn-charge (C/AIR) | Where this configuration is moving |

These four ARE the quaternion (w, x, y, z). The oracle currently returns 1/4 of its own data.

### Quaternion mapping:
- `w = pp` (yang+yang, old yang) = T nucleotide = EARTH element = the primary affirmation
- `x = nn` (yin+yin, old yin) = A nucleotide = FIRE element = shadow beneath shadow (double negation)
- `y = np` (yang+yin) = G nucleotide = WATER element = the structural interface (figure meets ground)
- `z = pn` (yin+yang) = C nucleotide = AIR element = temporal direction (which way the transformation moves)

---

## OracleResult Struct (Corrected)

```c
typedef struct {
    // Primary draw
    uint16_t primary_degree;         // d — the cast position
    uint8_t  primary_hexagram;       // hexagram at d
    const char* primary_codon;       // amino acid / genetic codon at d

    // Shadow 1 — Deficient aspect
    uint16_t deficient_degree;       // (d + 180) % 360
    uint8_t  deficient_hexagram;     // hexagram at d+180
    const char* deficient_codon;     // amino acid at d+180
    uint8_t  shadow_line_changes[6]; // which line changes move toward deficient mode

    // Shadow 2 — Epistemic inverse
    uint16_t implicate_degree;       // d + 360 (in 720° space)
    uint8_t  implicate_hexagram;     // same hexagram, implicate phase
    uint8_t  inverse_lens_index;     // which clock lens is the epistemic inverse of current

    // Shadow 3 — Temporal anticodon (live cast result, NOT pre-computed from degree)
    uint16_t temporal_degree;        // degree on clock that temporal_hexagram occupies
    uint8_t  temporal_hexagram;      // result: primary_hexagram XOR'd by changing_lines
    uint8_t  changing_lines;         // 6-bit bitmask: which lines moved in this cast (from coin throw)

    // Quaternionic synthesis
    float    quaternion[4];          // (w=pp, x=nn, y=np, z=pn) unit quaternion
    bool     is_palindromic;         // true if d == (d+180)%360 in this topology = Quintessence
} Oracle_Result_Full;
```

---

## Bimba Note

Shadow readings are always EXPLICATE reflections of the IMPLICATE source.
The deficient aspect, epistemic inverse, and temporal anticodon are three different angles on
the same Bimba ground that the primary reading is Pratibimba-reflecting.
None of them ARE the Bimba — they are Pratibimbas of the Bimba's shadow aspects.
The Bimba (implicate source) is always deeper than any of the four oracle positions.
