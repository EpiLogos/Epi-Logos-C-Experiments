# Pleroma 30-Syzygy Integration — Lens 6 (12°×30) Pleromatic Identity

**Status:** Canonical v1 (2026-07-19) — fixed positions ratified; positions MAY become dynamic as usage develops (Architect note, 2026-07-19). Corrects the Lens-6 "Zodiacal" labeling drift.
**Coordinate placement:** Lens at `#3-5` (Mythic Synthesis Wheel, division lens 6) | Ground inheritance from `#2-0` (Fibonacci/Pisano) | Quintessence completion at `Clock_Central_Node`
**Companion specs:** `fibonacci-60-pisano-integration.md` (the ground),
  `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md` (the 16-lens matrix),
  `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-12-cosmic-clock-full-architecture.md` §2.1–2.2 (Ring-0/Ring-1 element law)
**Code fixtures:** `Body/S/S0/portal-core/src/pleroma_lens.rs` (table + laws), `Body/S/S0/portal-core/src/kernel/projections/phase_space.rs` (`CLOCK_LENSES_16[6].name = "Pleromatic"`), tests at `Body/S/S0/portal-core/tests/pleroma_lens_table.rs`

---

## §0 The Drift Correction (why this spec exists)

Lens 6 (slice 12°, 30 sections) carried "Zodiacal" labels from the original
16-fold sketch onward ("Zodiacal Houses / 12 tribes / celestial government" —
12-symbolism attached to a **30-fold** division). The genuine zodiac-sign
division is **Lens 9** (slice 30°, 12 sections, "Solar Month"). The `A°×B`
notation ambiguity (slice-first vs count-first) propagated the mislabel into:

- the 16-lens spec matrix row ("Zodiacal Signs / 12 months") — corrected
- the `#4.4-1` correspondence row (meant the 12-fold order → Lens 9) — corrected
- the WALK_ZODIAC "matching lens" row (12 steps × 30° → Lens 9) — corrected
- `fibonacci-60-pisano-integration.md` §2a (12 clock-hours → Lens 9) — corrected
- the kernel table `CLOCK_LENSES_16[6].name` — renamed "Pleromatic"

**Lens 6's true identity was vacant since inception. It is the Pleromatic
lens: the 30 pleromatic elements (Aeons) in 15 paired syzygies.**

---

## §1 The 30 Pleromatic Elements in 15 Syzygies

The Valentinian Pleroma (Irenaeus, *Adversus Haereses* I.1.1–I.1.3): thirty
Aeons emanating in paired syzygies, structured as three arcs —

```
Ogdoad   (8 aeons  = 4 syzygies)   the root emanations
Decad    (10 aeons = 5 syzygies)   emanated from Logos & Zoe
Dodecad  (12 aeons = 6 syzygies)   emanated from Anthropos & Ecclesia
Total     30 aeons = 15 syzygies   8 + 10 + 12 = 30
```

### §1a Why this is derivation, not decoration

1. **Lens 6 is the half-ground.** 12° = exactly 2 Fibonacci-ground steps
   (6°/step); 30 sections × 2 = the 60-period. Lens 6 is the unique lens that
   reads the ground **pairwise**: each aeon is a dyad of Pisano positions
   `{2k, 2k+1}`.
2. **The syzygy IS the # inversion at Lens-6 resolution.** Opposition pairing
   joins segment k to k+15: ground positions {2k, 2k+1} ↔ {2k+30, 2k+31} —
   precisely the 10-complement pairs of the Pisano spec §2b. The pairing law
   is inherited, not chosen.
3. **30 and 15 are M3 root constants.** NUCLEOTIDE_ICHING_VALUE {6,9,7,8}
   sums to 30 (compile-asserted); every Watson-Crick pair sums to 15.
4. **The arc syzygy-counts are the system's generators.** 4/5/6 syzygies =
   quaternary / pentad / QL-hexad, and **LCM(4,5,6) = 60 = the ground
   period** (the same fact as LCM(6,5,12)=60 read through the Pleroma's
   anatomy). 4:5:6 is the just major triad — harmonic complement of the
   3:5:6 spanda insertion (36:60:72).
5. **The syzygies decompose the Akasha condition.** Opposition always joins
   diagonal quadrants (Q1↔Q3, Q2↔Q4) — the pairs whose Pisano sums balance
   (140 = 140, Klein topology, Pisano spec §2d). The balance of all 15
   syzygies IS the elemental-balance condition under which Quintessence/
   Akasha emerges at the Central Node (Pisano spec §4). The Pleroma
   ("Fullness") lens is the 30-fold articulation of the fullness whose
   balance is the 5th element.
6. **The agent roster is already pleromatic.** Nous–Aletheia and Logos–Zoe
   are Ogdoad syzygies; Sophia is the 30th aeon. Nous, Logos, Sophia sit in
   the Anima constitutional seven; Aletheia is canonically "a mode of
   Sophia/Psyche/Anima" — echoing the Valentinian drama exactly. The S4-2′
   carrier is named Pleroma; Hen is the One. This lens makes that naming
   thread structural.

### §1b The 30 Aeons (emanation order)

| # | Aeon | Greek | Meaning | Arc | Syzygy (emanation idx) | Role |
|---|------|-------|---------|-----|------------------------|------|
| 1 | Bythos | Βυθός | Depth | Ogdoad | 0 | prior |
| 2 | Sige | Σιγή | Silence | Ogdoad | 0 | consort |
| 3 | Nous | Νοῦς | Mind | Ogdoad | 1 | prior |
| 4 | Aletheia | Ἀλήθεια | Truth | Ogdoad | 1 | consort |
| 5 | Logos | Λόγος | Word | Ogdoad | 2 | prior |
| 6 | Zoe | Ζωή | Life | Ogdoad | 2 | consort |
| 7 | Anthropos | Ἄνθρωπος | Humanity | Ogdoad | 3 | prior |
| 8 | Ecclesia | Ἐκκλησία | Assembly | Ogdoad | 3 | consort |
| 9 | Bythios | Βύθιος | Profound | Decad | 4 | prior |
| 10 | Mixis | Μίξις | Mingling | Decad | 4 | consort |
| 11 | Ageratos | Ἀγήρατος | Unaging | Decad | 5 | prior |
| 12 | Henosis | Ἕνωσις | Union | Decad | 5 | consort |
| 13 | Autophyes | Αὐτοφυής | Self-born | Decad | 6 | prior |
| 14 | Hedone | Ἡδονή | Delight | Decad | 6 | consort |
| 15 | Acinetos | Ἀκίνητος | Unmoved | Decad | 7 | prior |
| 16 | Syncrasis | Σύγκρασις | Blending | Decad | 7 | consort |
| 17 | Monogenes | Μονογενής | Only-begotten | Decad | 8 | prior |
| 18 | Macaria | Μακαρία | Blessedness | Decad | 8 | consort |
| 19 | Paracletus | Παράκλητος | Advocate | Dodecad | 9 | prior |
| 20 | Pistis | Πίστις | Faith | Dodecad | 9 | consort |
| 21 | Patricos | Πατρικός | Paternal | Dodecad | 10 | prior |
| 22 | Elpis | Ἐλπίς | Hope | Dodecad | 10 | consort |
| 23 | Metricos | Μητρικός | Maternal | Dodecad | 11 | prior |
| 24 | Agape | Ἀγάπη | Love | Dodecad | 11 | consort |
| 25 | Ainos | Αἶνος | Praise | Dodecad | 12 | prior |
| 26 | Synesis | Σύνεσις | Understanding | Dodecad | 12 | consort |
| 27 | Ecclesiasticus | Ἐκκλησιαστικός | Communal | Dodecad | 13 | prior |
| 28 | Macariotes | Μακαριότης | Felicity | Dodecad | 13 | consort |
| 29 | Theletos | Θελητός | Willed | Dodecad | 14 | prior |
| 30 | Sophia | Σοφία | Wisdom | Dodecad | 14 | consort |

---

## §2 Fixed Positions — Two Layouts

A syzygy occupies a **diameter**: segment d (0..14, first hemisphere) paired
with segment d+15 (second hemisphere). Fifteen diameters, 12° apart.

**Strand law** (from Pisano spec Strand A/B): the **prior** aeon of a syzygy
sits on segment d (Strand A, explicit, 0°–180°); the **consort** on segment
d+15 (Strand B, implicit, 180°–360°). Depth explicit, Silence implicit.

### §2a Default layout: `Interleaved456`

Derived, not hand-picked: Sainte-Laguë sequencing of the arc quotas (4, 5, 6
over 15 slots), rotated so that an Ogdoad diameter holds d=0. The rotation is
fixed by the two **threshold syzygies** — the only two diameters touching the
four Pisano cardinal zeros:

- **d=0** (segments 0/15): starts ON the 0°/180° boundaries — the explicit
  threshold. Holds Pisano zeros at positions 0 and 30.
- **d=7** (segments 7/22): CONTAINS 90°/270° at its midpoints — the implicit
  threshold. Holds Pisano zeros at positions 15 and 45.

Both threshold syzygies land in the **Ogdoad** (the root arc holds both
thresholds). The resulting partition:

```
Ogdoad  diameters: {0, 4, 7, 12}       (≈ compass octad: seats near the 8 directions)
Decad   diameters: {2, 5, 8, 11, 14}   (PERFECT PENTAGRAM — five diameters 36° apart:
                                        the pentadic/φ arc drawn as φ's own geometry)
Dodecad diameters: {1, 3, 6, 9, 10, 13}
```

Within each arc, emanation order ascends with d:

| d | Axis (segment mid ↔ mid) | Syzygy | Arc |
|---|--------------------------|--------|-----|
| 0 | 6° ↔ 186° | Bythos–Sige | Ogdoad |
| 1 | 18° ↔ 198° | Paracletus–Pistis | Dodecad |
| 2 | 30° ↔ 210° | Bythios–Mixis | Decad |
| 3 | 42° ↔ 222° | Patricos–Elpis | Dodecad |
| 4 | 54° ↔ 234° | Nous–Aletheia | Ogdoad |
| 5 | 66° ↔ 246° | Ageratos–Henosis | Decad |
| 6 | 78° ↔ 258° | Metricos–Agape | Dodecad |
| 7 | 90° ↔ 270° | Logos–Zoe | Ogdoad |
| 8 | 102° ↔ 282° | Autophyes–Hedone | Decad |
| 9 | 114° ↔ 294° | Ainos–Synesis | Dodecad |
| 10 | 126° ↔ 306° | Ecclesiasticus–Macariotes | Dodecad |
| 11 | 138° ↔ 318° | Acinetos–Syncrasis | Decad |
| 12 | 150° ↔ 330° | Anthropos–Ecclesia | Ogdoad |
| 13 | 162° ↔ 342° | Theletos–Sophia | Dodecad |
| 14 | 174° ↔ 354° | Monogenes–Macaria | Decad |

Readings the layout produces (observed, then held):

- **Bythos–Sige on the equinoctial axis** (0°/180° thresholds): Depth at the
  spring point, Silence at the autumn point.
- **Logos–Zoe on the solstitial axis** (90°/270° midpoints): the Word–Life
  syzygy — emanator of the Decad — holds the two solstice pivots.
- **Sophia at segment 28 (336°–348°)**: the 30th aeon stands ONE seat before
  the return seam — at the edge of the fall, one step shy of the return.
- **Monogenes–Macaria hold the seam** (segment 29, 348°–360°): Only-begotten
  & Blessedness carry the Möbius return to the source.

### §2b Alternate layout: `Emanation`

d = emanation syzygy index directly: Ogdoad d0–3, Decad d4–8, Dodecad d9–14
(contiguous arc blocks; Sophia at segment 29, ON the seam). Both layouts are
first-class; `Interleaved456` is the default (Architect ratification
2026-07-19).

---

## §3 The Element Law (approved derivation — no new table)

`element(segment k) = Ring-1 sign element at the segment midpoint`, i.e.
`sign = floor((12k+6)/30)`, elements cycling Fire/Earth/Air/Water from Aries
(cosmic-clock spec §2.2). Fully determinate everywhere, including the
boundary-straddling segments 7 and 22, whose midpoints ARE the cardinal
pivots (90° → Cancer/Water; 270° → Capricorn/Earth).

**Syzygy complement theorem:** partner midpoints differ by 180° = 6 signs =
element index +2 (mod 4). Therefore every syzygy pairs
**Fire↔Air or Earth↔Water** — the same-polarity, cross-mobility pairs
(T↔G yang, A↔C yin; M3 Matrix-2 "cross-complementary"). This coincides with
the diagonal-quadrant reading (Q1 Fire ↔ Q3 Air; Q2 Water ↔ Q4 Earth per
Ring-0) — derived once from Ring-1, consistent with Ring-0.

Distribution: 6 Fire↔Air syzygies {d0,1,5,6,10,11}; 9 Earth↔Water syzygies
{d2,3,4,7,8,9,12,13,14}. *(Observed chiasm, not yet law: yang-pair count 6
and yin-pair count 9 carry each other's I-Ching values — A(yin)=6, T(yang)=9.)*

Planetary relations enter **implicitly** through the symbolism, exactly as
the decans carry their rulers: the planets are clock **objects** (the
archetypal solar system, `planet_degrees[10]`, Kairos transits), never lens
members. An object activates a degree; each aperture reads the activation
through its own symbolic grammar into **elemental** contributions — the
elemental substrate is the universal register where all apertures and all
objects meet, which is why the bioquaternion is computable at any lens
resolution.

---

## §4 Ground Inheritance Laws (testable)

For default and emanation layouts alike (they permute diameters, not laws):

1. **Aeon dyad:** segment k holds Pisano positions {2k, 2k+1}.
2. **Syzygy digit-sum:** 20 for all syzygies except the two threshold
   syzygies (d=0, d=7), which sum 10; total 13×20 + 2×10 = **280** = the full
   Pisano digit sum. (Direct consequence of the 10-complement law: 28 pairs
   sum 10, the 2 cardinal-zero pairs sum 0.)
3. **Threshold-Ogdoad law** (default layout): both threshold syzygies belong
   to the Ogdoad.
4. **Pentagram law** (default layout): the five Decad diameters are exactly
   36° apart (consecutive Δd = 3).
5. **Element complement:** every syzygy pairs Fire↔Air or Earth↔Water (§3).
6. **Akasha decomposition:** each syzygy spans a diagonal quadrant pair;
   the aggregate syzygy balance is the diagonal balance Q1+Q3 = Q2+Q4 = 140 —
   the Quintessence emergence condition. (The runtime Akasha check of Pisano
   spec §8 decomposes over the 15 syzygy channels.)
7. **Arc generator law:** syzygy quotas 4/5/6; LCM(4,5,6) = 60 = ground
   period.

---

## §5 Syzygy — Disambiguation (binding note)

Three registers now use the word; they are cognate, not identical:

| Register | Meaning | Where |
|---|---|---|
| **QL syzygy return** | the P↔P′ prospective/retrospective doubling of an Aeon loop (constitutional cognition) | Aeon-loop paradigm, Track 46 |
| **Dyadic-syzygy** | psychoid Family-A adjacent-identity pairs (0,1)/(2,3)/(4,5) | Psychoid web canon |
| **Pleromatic syzygy** | opposition dyad of two aeons on one Lens-6 diameter, inheriting the 10-complement | THIS spec |

The graduated-loop "Aeon" (Track 46) and the pleromatic Aeon share the
Valentinian source deliberately: a graduated loop is a *named fullness* whose
doubling is its syzygy. No rename required; cite the register when precision
matters.

---

## §6 Code Fixtures Map

| Law | Fixture |
|---|---|
| Lens 6 name "Pleromatic" (slice 12, sections 30) | `phase_space.rs::CLOCK_LENSES_16[6]` |
| 30-aeon table, arcs, syzygies, layouts, strand law | `pleroma_lens.rs` |
| Element derivation + complement theorem | `pleroma_lens.rs::segment_element` |
| §4 laws 1–7 | `tests/pleroma_lens_table.rs` |
| App mirror (name only) | `pratibimba-app/src/engine/cosmicMath.ts` |

**Wire (BUILT 2026-07-19, generic-first):** the pleromatic packet rides
`kernelBridge.m3.lensField(lensId)` as the `symbolicSystem` decoration of the
**generic lens-field dynamic** (02-16-lenses spec, "Generic Lens-Field
Dynamic" section) — the syzygy structure is the Lens-6 INSTANCE of the
generic diameter-paired topology, the element complement the instance of the
generic theorem, the half-ground dyad the instance of 6|slice quantization.
Chain: `portal-core/src/lens_field.rs` (generic laws) → runtime
`typed_json_m3_lens_field` → gateway-contract method const + dispatch plan →
Zod `LensFieldProjection` → app `parseLensFieldProjection`. Live activation
carries per-syzygy signed balances (planetary-energy register — distinct from
the static Pisano digit register above) and the Akasha condition
(honest-null when kairos is unpositioned).

**Still deferred (flagged):** where the per-lens balance quaternion feeds the
RUNNING q_cosmic (kernel tick vs oracle cast) — Architect decision; the
personal-resonance-at-lens refinement stays library-level/protected
(bioquaternion never crosses the public wire, DR-M4-3/4). Tunable-schema
migration of `akasha_balance_epsilon` (default 0.05).

---

*The Pleroma is the Fullness read as thirty; the syzygy is the # inversion
wearing its oldest name; the balance of the fifteen is the fifth element.*
