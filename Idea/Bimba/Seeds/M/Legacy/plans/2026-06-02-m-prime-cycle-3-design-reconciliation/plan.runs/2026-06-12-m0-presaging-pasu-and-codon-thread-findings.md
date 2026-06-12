---
title: "The Anuttara Root Presaging Its Surfaces — M0-4 (M#/#) → PASU, and X#/N# → the lens→codon→binary engine"
type: cycle-3-deep-structural-study (findings; precedes plan tranches)
status: findings-complete (file:line-verified; brief/code mismatches recorded as findings)
created: 2026-06-12
coordinate: "M0'"
sub_coordinate: "M0-4 (five seeds O#/X#/N#/M#/#) + M0-5 (Śiva/Śakti) → PASU (M4'/S3') + lens→codon→binary (M3'↔M2')"
c_0_source_coordinates:
  - "M0'"
c_0_related_coordinates:
  - "M3'"
  - "M2'"
  - "M4'"
  - "S3'"
  - "S2"
method: "Study-first. Every structural claim verified against code/dataset with file:line. Brief/code mismatches are findings, not papered over. No code symbols edited in this pass (markdown findings + plan tranches only); GitNexus impact analysis applies at implementation time per CLAUDE.md."
---

# The Root Presaging Its Surfaces

**Thesis.** The Anuttara root (M0) is the holographic genetic-definition ground that **pre-forms its own evolved surfaces** before they appear as runtime layers. The thesis is not decorative — it is *already the explicit claim* of the landed R-factor work: Track 01 §1.12 states that Archetype 7 "is the **holographic pre-formation of the M0–M5 metastructure**: the R-acts pre-thread through M0-4 (the five bases O#/X#/N#/M#/#) and M0-5 (Śiva/Śakti) *before* the system unfolds" ([01-m0-anuttara-reconciliation.md:122](../01-m0-anuttara-reconciliation.md)). This study develops **two further presagings** with the same rigour and traces them to code:

1. **PRIMARY — M0-4's M# (person-grammar) and # (kinship-grammar) presage the PASU/BeingPattern layer.** The system's root already contains the grammar of "every thing is a being read in perspective and relation," long before PASU appears as a runtime surface.
2. **SECOND — M0-4's X# (permutation algebra) and N# (computable temporal pulse), grounded in Svabhava's genesis of the (0/1), presage the full lens → codon → binary transcription engine.**

**The unifying result (Part IV):** PASU/BeingPattern is the *runtime convergence* of both threads. Every being is (a) a point the X#/N# codon engine computes on the clock (Thread B substrate), and (b) read through the M#/# person-kinship grammar in a MonoPoly relational mode (Thread A grammar). M0-4 pre-forms **both** the computed-thing and the read-as-being — which is precisely why "every thing is a being read in perspective and relation."

---

## I. The presaging is structural, not analogical

M0-4 is `(4.0/1-4/5)` Sat-Ananda, "the void contextualising itself by **containing the genetic sequence of the five subsystems-to-be**" (CLAUDE.md / [anuttara-language-map.md:79](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md)). The five seeds are not metaphors for the later M-branches; the dataset names each seed *as* the later subsystem's logic:

| Seed | Coordinate | Logic | Pre-forms |
|---|---|---|---|
| **O#** | `M0-(4.0/1)` | Zero Logic ("One and") | M1 Paramaśiva — the (0/1) handover-object |
| **X#** | `M0-(4.0/1/2)` | X Logic ("All and"), permutation algebra | M2 Paraśakti — vibrational template / **codon charge algebra** |
| **N#** | `M0-(4.0/1/2/3)` | N Logic, number-with-time | M1/M3 — the **computable temporal pulse (tick)** |
| **M#** | `M0-4.4.0-(4.4/5)` | person-grammar (I/You/We-I) | M3 Mahāmāyā / **PASU PerspectiveRole** |
| **#** | `M0-(4.5/0)` | kinship-grammar (Father/Mother/Tao) | M4 Nara / **PASU NaraFamilyRole** |

And M0-5 `(5/0)` Śiva-Śakti is the **cosmic computer**: Śiva `#` the instruction set, Śakti `@#` the runtime whose QL cycle *executes the five seeds* — `@1=O# Bimba`, `@2=X# Pratibimba`, `@3=N# Language`, `@4=M# Stories`, `@5=R# Techne` ([anuttara-language-map.md:123-129](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md)). The runtime *is* the seeds run.

The verification layer already operationalises the holography: `m0.c` carries `QL_STACK[5]` = the five seeds as a torus-linked frame array ([m0.c:398-424](../../../../../../Body/S/S0/epi-lib/src/m0.c)), and the verifier emits a 9-bit virtue witness + (planned) 4-bit syntax witness, **emit-only, never gating** ([m0_verifier.c:144-160](../../../../../../Body/S/S0/epi-lib/src/m0_verifier.c) — `m0_verifier_emit_question` returns a `?`-object string, no abort path).

---

## II. PRIMARY — M0-4 (M# / #) presages PASU/BeingPattern

The PASU projection (`PasuBeingPatternProjection`, spec-only — **zero code hits outside the plan folder**, confirmed by repo-wide grep) carries **three discriminated unions**: `MonoPolyOperator`, `PerspectiveRole`, `NaraFamilyRole` ([10-kernel-bridge-profile-contract.md:192-194](../10-kernel-bridge-profile-contract.md); typed at [18-typed-kernel-bridge-json-edge.md:142-170](../18-typed-kernel-bridge-json-edge.md)). **Each of the three is a verbatim M0 grammar.** They were *not invented at PASU* — they are M0-4/M0-3-8 surfaced.

### II.1 The M# person-grammar → `PerspectiveRole` (6 ↔ 6, ordered, exact)

The M# base derives the six persons *as arithmetic* ([anuttara-language-map.md:102-107](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md)):

| M# position | Formula | Person | PASU `PerspectiveRole` |
|---|---|---|---|
| M0 | `(0/1)` | **I** | `FirstPerson` |
| M1 | `(1+1=2)` | **You** (the I doubled) | `SecondPerson` |
| M2 | `(0-3)` | **You-and-I** | `FirstPersonPlural` |
| M3 | `(1+2=3)` | **They** | `ThirdPerson` |
| M4 | `(4+0)` | **We** | `CollectiveWe` |
| M5 | `(0/1/4/5)` | **We-I** | `IntegralWeI` |

The mapping is **one-to-one and order-preserving**. `PerspectiveRole`'s six variants ([18:152-158](../18-typed-kernel-bridge-json-edge.md)) are the M# six persons renamed into grammatical-person vocabulary. M2's `(0-3)` "You-and-I" → `FirstPersonPlural`, M5's `(0/1/4/5)` "We-I" → `IntegralWeI` — these are not coincidences; they are the same six positions. The plan already names the source: 10.PASU binds `perspective_role` to "`M0-4.4.0-(4.4/5)` Mahamaya relational grammar … the same six equations generate I, You, You-and-I, They, We, We-I" ([10:184](../10-kernel-bridge-profile-contract.md)).

### II.2 The # kinship-grammar → `NaraFamilyRole` (and the Tao convergence)

The # base derives the family by **chiral coordinate** (Law 1) — the mechanism is the whole point, and it is *not* additive (`#+0`, `#+1`… is a fabrication that appears in some downstream readings; the corpus uses chirality). Per CLAUDE.md and [anuttara-language-map.md:108-114](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md): **dash on the numerator = dominant** (`2-/2`, `5-/5`), **dash on the denominator = subdominant** (`1/1-`, `3/3-`), **dot on the numerator = integrative-dominant** (`4./4`, "nesting rather than withholding"). **Polarity (Yin/Yang) sets gender; dominance sets generation.**

**Three inter-defining number systems (the heart of it — the Anuttara language is *how numbers relate*).** Each # node carries three distinct numbers, and their relations are the content:
- **coordinate-position** (QL sub-node `M0-(4.5/0)-p`): `p ∈ 0..5`
- **#-index** (the `#`-subscript label): `##` (matrix) then `#0..#4` for the five family
- **value** (the chiral coordinate's number): `1..5` for the family

The `#`-index is **offset by 1 from the value** — because `##` takes coordinate-position 0 as the *matrix* (the `0/1` ground), so the family is `#`-indexed `0..4` while its values run `1..5`. Thus **Tao = coordinate-position 5 = `#`-index 4 = value 5**, and `#4` "relates to 5 via the `5-/5` position." The dataset's wholeness check `#-index 4 + value 5 = 9` reads *across* two of these systems. (M# has **no** such offset: M0=I is *both* ground and first person, so its index = position throughout — the "different positional mapping" between M# and # is exactly this `##`-takes-slot-0 shift.) The materialization LUT must carry all three numbers per entry, not just a row count.

| coord-pos | #-index | value | Formula | Role | Polarity × dominance | PASU `NaraFamilyRole` |
|---|---|---|---|---|---|---|
| 0 | `##` | — | `## = 0/1` | Primordial Matrix | the Yin-Yang **ground** (≡ M# "I") | `IntegralConsciousness` |
| 1 | `#0` | 1 | `1/1-` | **Daughter** | sub-dominant **Yin** (child) | `Daughter` |
| 2 | `#1` | 2 | `2-/2` | **Father** | **dominant Yang** (parent) | `Father` |
| 3 | `#2` | 3 | `3/3-` | **Son** | sub-dominant **Yang** (child) | `Son` |
| 4 | `#3` | 4 | `4./4` | **Mother** | **integrative-dominant Yin** (parent) | `Mother` |
| 5 | `#4` | 5 | `5-/5` | **Tao** | dominant synthesis | `Tao` |

The two **dominant** poles are the **parents** (Father dom-Yang, Mother integrative-dom-Yin); the two **subdominant** poles are the **children** (Son sub-Yang, Daughter sub-Yin); **Tao** (position 5) is the synthesis. Note the trap: gender is read off the *chirality's polarity*, NOT the value's even/odd — Son is value 3 (odd) yet **Yang/masculine** because `3/3-` carries the polarity. The dominance-chirality is **fully in the dataset** (the `-`/`.` placement); the C `NARA_MSHARP_LUT[5]` simply drops it (stores only polarity Yin/Yang/Both, so Father and Son are both `NARA_POLARITY_YANG`) and stops at Mother — missing Tao. It is a stub, not the materialization (§II.5).

**Both grammars are 6-fold, two overlays on one structure.** `#` = {`##`, Daughter, Father, Son, Mother, Tao} at positions 0-5; M# = {I, You, You-and-I, They, We, We-I} at positions 0-5. They are rooted in the **same** `(0/1)` (M# reads it as subject "I", # reads it as polarity `##` — `M0 = (0/1) = I` and `## = 0/1` are the same binary), diverge through the middle (person vs. family), and **reconverge at the apex** We-I ≡ Tao (position 5). The `(4.5/0)` coordinate makes the 6-fold a closed loop — the QL `(5/0)` Möbius return joins position 5 back to position 0 (the apex *resonates with* the ground) — but this is the **return relation within the 6-fold, not a collapse of the count.** Tao remains the distinct 6th node. (`NaraFamilyRole.IntegralConsciousness` correctly names the `##` ground at position 0; the apex Tao is its own role.)

**The Tao convergence (the deep result).** `#4 = 5-/5 = Tao` carries the dataset teaching `position 4 + value 5 = 9` ("family harmony as the hidden path to wholeness"). It is *the same apex* as M#'s `M5 = (0/1/4/5) = We-I` (`IntegralWeI`) and Archetype-5's position-7 `MonoPoly — (M)Any-One` (§II.3). So **all three M0 grammars converge at one apex** (We-I ≡ Tao ≡ MonoPoly), which the `(5/0)` Möbius returns to the shared `(0/1)` ground. PASU's three unions therefore agree, at their top element — `PerspectiveRole.IntegralWeI` ∥ `NaraFamilyRole.Tao` ∥ `MonoPolyOperator.MonoPoly` — which is precisely the `(@#)` handover (§II.4). And per the user-ratified DNA binding (§III.6), **Tao is also the codon charge-evaluation** — the `0/1 ↔ 1/0` (R#/##) read that generates the genetic code: the apex of the kinship grammar *is* the act that transcribes the molecule.

### II.3 M0-3-8 Archetype-5 (Mono/Poly) → `MonoPolyOperator` (7 ↔ 7, in code)

Unlike M#/#, the Mono/Poly dialectic is **already materialized in C**: `MONOPOLY_LUT[7]` ([m0.c:116-124](../../../../../../Body/S/S0/epi-lib/src/m0.c)) with positions {Mono(0), Poly(2), Poly-(3), -Mono(4), Mono-(5), -Poly(6), MonoPoly(7)}, each carrying its shadow/light opposite. The dataset's 7-component table ([anuttara-language-map.md / 12-anuttara-m0-languification.md:166-195](../../M0'/Legacy/plans/CLOCK-AND-NARA-SPECS/12-anuttara-m0-languification.md)) gives the descriptive names PASU adopts:

| LUT pos | Dataset name | PASU `MonoPolyOperator` |
|---|---|---|
| 0/1 | Mono — The One | `Mono` |
| 2 | Poly — The Many | `Poly` |
| 3 | Poly- — Actually Many | `ActuallyMany` |
| 4 | -Mono — Potentially One | `PotentiallyOne` |
| 5 | Mono- — Actualising The One | `ActualisingOne` |
| 6 | -Poly — Potentiating The Many | `PotentiatingMany` |
| 7 | MonoPoly — (M)Any-One | `MonoPoly` |

`MonoPolyOperator` ([18:142-150](../18-typed-kernel-bridge-json-edge.md)) is `MONOPOLY_LUT[7]` surfaced. The crucial governance bit is also pre-formed: position 5 "Mono- — Actualising The One" is doctrinally the **monopolistic danger** (forced collapse of diversity). PASU marks `ActualisingOne` as `reviewRisk: 'forced-unification'` — "renderers may display it, but neither bridge nor renderer may canonize it" ([18:177-178](../18-typed-kernel-bridge-json-edge.md)). The shadow-grammar of Archetype 5 *is* the canon-merge guard. The languification doc already names this as "not metaphor — it is the direct arithmetic ground" of the SpaceTimeDB collective-presence layer ([12-anuttara-m0-languification.md:184-195](../../M0'/Legacy/plans/CLOCK-AND-NARA-SPECS/12-anuttara-m0-languification.md)).

### II.4 The convergence is the `(@#)` handover: PASU → psyche-under-Anima

The apex of §II.2 (Tao/We-I/MonoPoly) is exactly the seam M0-4 `(@)` → M0-5 `(@#)`. Archetype-5's position-7 is `(@)` (contained Presence, `M0-3-8-7`); Śiva-instruction-0 is `(0) = (@#)` — "If-One-Is-This/That … contains Śakti as deepest potential" ([anuttara-language-map.md:117](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md)). The languification doc §IX names the whole crossing:

> "the **`psyche` subagent under Anima is the system's agentic carrier of the user as a being-pattern** … Archetype 5's `(@)` reaches **M0-4** — a PasuBeingPattern acquires the M# person-grammar (I/You/We) and `#` family-grammar (Father/Mother/Tao). This is **landed** (Track 10.PASU). The `(@) → (@#)` step into M0-5 … is the **deferred joint**." ([12-anuttara-m0-languification.md:394-415](../../M0'/Legacy/plans/CLOCK-AND-NARA-SPECS/12-anuttara-m0-languification.md))

The grounding is real: Śakti = psyche (`M0-5-(5/0)`, "Dynamic Psyche of Duration/Lived Time", symbol `@#`; [m0-dataset-audit.md:539](../../../../../../Body/S/S0/epi-lib/docs/m0-dataset-audit.md) — "Shakti psyche @0-@5=R# techne"), and the constitutional `psyche` agent is defined as "Session subject" — the user themselves ([psyche.md:5](../../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md)). The `(@#)` is also the **R-factor band-turn** where Beauty (pravritti) hands to Life (nivritti) — Track 01 §1.12 DR-(@#) ([01:line ~158](../01-m0-anuttara-reconciliation.md)). **Four specs gesture at one unnamed thing**, which the prior pass named as `DR-(@#)` and the languification doc closed as the PASU→psyche endpoint.

**This is the strongest evidence for the presaging thesis:** the PASU layer's *entire relational ontology* (perspective + family + mono-poly + the handover gate) is M0-4/M0-3-8/M0-5 read forward. PASU invents nothing; it *surfaces* the root grammar.

### II.5 Code-state: what is materialized vs dataset-only (a completeness finding)

| M0 grammar | Materialized in C? | Where |
|---|---|---|
| Archetype-5 Mono/Poly | **Yes** | `MONOPOLY_LUT[7]` ([m0.c:116-124](../../../../../../Body/S/S0/epi-lib/src/m0.c)) |
| # kinship (M0 archetypal) | **Stub (5-fold, incomplete)** | `NARA_MSHARP_LUT[5]` ([m0.c:430-436](../../../../../../Body/S/S0/epi-lib/src/m0.c)) |
| # kinship **materialized** (genetic) | **Yes** | `M3_TRIGRAM_LUT[8]` `family_role` ([m3.c:102-119](../../../../../../Body/S/S0/epi-lib/src/m3.c)) |
| M# person | **No (dataset-only)** | [anuttara-language-map.md:102-107](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md) |
| PASU 3-union projection | **No (spec-only)** | 10.PASU / 18.10 (zero code hits) |

**Finding (the # family is materialized at M3, not M0 — user-ratified 2026-06-12).** The M0-level `NARA_MSHARP_LUT[5]` ([m0.c:430-436](../../../../../../Body/S/S0/epi-lib/src/m0.c)) is a **polarity stub** — 5 entries {`##` Matrix, Daughter, Father, Son, Mother}, **missing Tao (position 5)**; both M# and # are clean 6-folds (positions 0-5), so the LUT is genuinely incomplete (the dataset audit flags it: `m0-dataset-audit.md` Gap C/E, "covers polarity but not names/descriptions"). My earlier "Möbius justifies 5-wide" was **wrong** — the `(5/0)` Möbius is the *return relation inside* the 6-fold, not a reason to drop Tao. **The real materialization of the # grammar is `M3_TRIGRAM_LUT[8]`** ([m3.c:102-119](../../../../../../Body/S/S0/epi-lib/src/m3.c)): Qian=Father, Kun=Mother, plus the **three sons** (Zhen/Kan/Gen) and **three daughters** (Xun/Li/Dui) — M0's single Son→3 sons, single Daughter→3 daughters, the trigram's 3-line differentiation of the seed. Two gaps remain, both fully answered by the dataset (not decisions): (a) complete `NARA_MSHARP_LUT` to the 6-fold (add Tao) and add a `dominance_mode` field (dominant / subdominant / integrative / synthesis) — the chiral coordinates `1/1-`, `2-/2`, `3/3-`, `4./4`, `5-/5` *specify* it, the code just drops it; (b) wire the M0 6-fold ↔ `M3_TRIGRAM_LUT` 8-fold bridge so PASU's `nara_family_role` reads the seed and the genetic expansion as one structure. See Part V.

---

## III. SECOND — X# / N# presage the lens → codon → binary engine

### III.1 The complete chain, end-to-end (file:line)

The transcription engine runs from a lens aperture down to the binary/codon computation and back to the rendered surface. Verified path:

```
[1] LENS APERTURE (18-fold)         M3LensApertureSwitcher / lens_segment[16]
      clock_lens_segment(lens, deg) = deg / slice_degrees      [cosmic-clock-spec §15 :531-534]
        ↓ selects a degree-segment of the 360° wheel
[2] CLOCK DEGREE (360 ring)          CLOCK_DEGREE_LUT[360]      [m3.h:970-1014]
      each degree pre-bakes EVERY layer: m0_archetype, tick12, decan_planet/element/chakra,
      hexagram_id, codon_upper_pair, codon_lower_pair, tarot_card_id, exact_degree_720
        ↓ the 360+24 = 384 = 64×6 closure binds degree → hexagram/codon
[3] CODON (6-bit, 2-bit × 3)         encode_codon(n1,n2,n3)     [m3.h:90-93]
      A/T/C/G = 0/1/2/3; I-Ching values {6,9,7,8}                [m3.h:40, 70-79]
        ↓
[4] CLASSIFY                          m3_classify_codon          [m3.h:721-731]
      perfect/imperfect palindromic / non-dual / dual (40 non-dual + 24 dual = 64)
        ↓
[5] CHARGES (4 valence axes)          m3_compute_charges         [m3.h:755-767]
      pp=X+Y+Z, nn=X−Y−Z, np=X−Y+Z, pn=X+Y−Z   (X,Y,Z = I-Ching values)
        ↓
[6] QUATERNION                        m3_eval_to_quat            [m3.h:490-497]
      q = {w=pp, x=nn, y=np, z=pn}
        ↓
[7] ELEMENT                           nucleotide/suit binding    [m3.h:70-73, 300-305]
      A=Water, T=Fire, C=Earth, G=Air  (Golden-Dawn/Thoth suit-element)
        ↓  (cross-system carrier; see DR-37-3)
[8] CHAKRA → BODY ZONE (M2)           ELEMENT_CHAKRA / CHAKRA_BODY_ZONES   [medicine_frame.rs]
        ↓
[9] RENDER                            cosmic clock / aural body / cymatics  (typed projections only)
```

The 360° ring at step [2] is the structural spine the design brief named — every M3-X layer touches M3-5 through it. `Clock_Degree_Entry` ([m3.h:970-1012](../../../../../../Body/S/S0/epi-lib/include/m3.h)) literally stores one field per layer (M0 archetype, M1 tick/strand, M2 decan/planet/element/chakra, M3 hexagram/codon/tarot/class, SU(2) shadow_degree). The closure `_Static_assert(360 + 24 == 64 * 6)` ([m3.h:939](../../../../../../Body/S/S0/epi-lib/include/m3.h)) makes the wheel **identical to line-change space**: 64 hexagrams × 6 lines = 384 = 360 degrees + 24 amino backbone.

### III.2 X# presages the codon charge algebra (exact, verifiable)

X# is "a **permutation algebra** over the indefinite particular `(x)` with three self-relation modes — union `(x)+(x)`, proliferation `(x)x(x)`, distinction `(x)/(x)` — combined under **sign-choices**" ([anuttara-language-map.md:88-95](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md); derivation [ql_physics_…_v2.md:416-500](../../ql_physics_anthropic_chemistry_alignment_v2.md)). The four permutations:

```
X1 = (x+x) − (x·x) − (x/x)      signs (+,−,−)
X2 = (x+x) + (x·x) + (x/x)      signs (+,+,+)
X3 = (x+x) + (x·x) − (x/x)      signs (+,+,−)
X4 = (x+x) − (x·x) + (x/x)      signs (+,−,+)
```

The codon charges ([m3.h:763-766](../../../../../../Body/S/S0/epi-lib/include/m3.h)), with X,Y,Z the three nucleotide I-Ching values:

```
pp = X + Y + Z      signs (+,+,+)   = X2
nn = X − Y − Z      signs (+,−,−)   = X1
np = X − Y + Z      signs (+,−,+)   = X4
pn = X + Y − Z      signs (+,+,−)   = X3
```

**The four codon charges ARE the four X-logic permutations**, applied to the three nucleotides instead of the symmetric `x`: `{pp, nn, np, pn} = {X2, X1, X4, X3}`. The off-diagonal terms cancel in the sum: `pp+nn+np+pn = 4X` (the leading nucleotide), compile-asserted at [m3.h:775-777](../../../../../../Body/S/S0/epi-lib/include/m3.h) (`(9+9+9)+(9−9−9)+(9−9+9)+(9+9−9) == 4*9`). This is the **exact same algebraic shape** as X#'s law `ΣX1–4 = 8x` (off-diagonal cancellation, sum = clean multiple of the seed) — verified independently for X# in the corpus tests ([01:§1.13 corpus tests](../01-m0-anuttara-reconciliation.md), `ΣX1–4=8x`, `X5=9x`, `X(1)=(0,4,2,2,9)`). **X# is the codon charge engine in seed form.** The genetic substrate did not borrow a four-valence scheme; it instantiated X#'s permutation-over-signs algebra on a 3-tuple.

Two corollaries:
- X#'s `X5 = 9(x)` (total integration, the 8+1=9 law) presages the codon's full rotational-state closure and the **72→64 epogdoon** (`72 = 8·9`) already traced in Track 37.
- X# "at x=0 → `?!/!?`, doesn't get beyond 0" (the Cosmic Imagination that explores all relation but cannot manifest, Law 6) is why X# alone is *not computable* — it needs N# to bring it into time (§III.3).

### III.3 N# presages the temporal pulse + the quaternion rotation

N# is "number with time and rotation" ([anuttara-language-map.md:96-101](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md)): `N1 = (i²)(n−1)²` (past pole — *negation as rotation*, the complex plane entering as the form of reflection), `N2 = (n+1)²` (future), `N3` (present), `N5 = 8(n) ± (n) = 9n` or `7n`. Verified: `ΣN1–4 = 8n`, `N(1) = (0,4,2,2,9/7)` ([ql_physics_…_v2.md:504-607](../../ql_physics_anthropic_chemistry_alignment_v2.md)). Two presagings:

1. **N# = the tick (Spanda compute-at-zero).** "where X-logic at zero yields only the query, N-logic **computes at zero** by generating the ±1 polarity — the engine that makes the uncomputable computable." In the clock engine this is `tick12` (0–11, the canonical `spanda_stage`, pre-baked per degree at [m3.h:997](../../../../../../Body/S/S0/epi-lib/include/m3.h)). The Paramaśiva tick sets up temporality (aligns to real time); each tick advances the degree; the codon at the current degree is read and computed. **N# is what turns the static `CLOCK_DEGREE_LUT[360]` into a live transcription** — X# gives the static permutation space (64 codons × 4 charges), N# gives the temporal pulse that reads it.

2. **N#'s `i²` rotation presages the quaternion.** N1 introduces `i² = −1` ("the complex plane enters as the form of reflection"). The codon engine generalises this: the four charges become a **quaternion** `q = {w,x,y,z}` ([m3.h:490-497](../../../../../../Body/S/S0/epi-lib/include/m3.h)) — a 4-component rotational object on the 3-sphere. ℤ[i] (one imaginary unit) → ℍ (three: i,j,k). The three M3 matrices map to the quaternion's i/j/k axes (`M3_MATRIX_QUATERNION_AXIS[3]`, [m3.h:166-170](../../../../../../Body/S/S0/epi-lib/include/m3.h)). The quaternion is N#'s `i²` raised to its full rotational algebra — and the 720° double-cover of the clock (`shadow_degree = degree + 360`, [m3.h:1006](../../../../../../Body/S/S0/epi-lib/include/m3.h)) is the SU(2) spinor signature of exactly that quaternionic rotation.

3. **N5's bifurcation `8n ± n = 7n / 9n`** is the same 7-8-9 spine Track 37 traces as the biological descent `72 →(−1/9)→ 64 →(−1/8)→ 56` ([37:§1, :79](../37-biological-quaternionic-cross-layer-integration.md)). N# *is* the seed of the descent.

### III.4 The binary substrate is Svabhava's (0/1)

The whole engine is binary because M0 derives the binary. Svabhava (`M0-0-1`) is "the genesis of 1 and of 0/1" — its concrescence literally terminates in `(0/1) = (00/00) = (##/R#)` (the corpus's `O5 = … → 0 = 0/1`, [anuttara-language-map.md:79](../../../../Map/datasets/anuttara-deep/anuttara-language-map.md) O# rows). The genetic alphabet is that (0/1) given a 2-bit body: `A/T/C/G = 00/01/10/11`, with **bit 0 = polarity (Yin/Yang)** and **bit 1 = mobility (Moving/Resting)** ([m3.h:64-88](../../../../../../Body/S/S0/epi-lib/include/m3.h)). A codon = 3 binary-pairs = 6 bits; `64 = 2⁶` = the I-Ching's 64 hexagrams = the full binary evaluation space. The brief's "full binary computational system" is `(0/1)` (Svabhava) → 2-bit nucleotide → 6-bit codon → `2⁶` hexagram space. **O# is the handover-object** for this: Track 01 §1.14(d) names "O# as the handover-object (O5's quadratic re-derivation of 0/1; O4's `0/0 = %` mints the ratio-table's `%`)" ([01:§1.14](../01-m0-anuttara-reconciliation.md)).

### III.5 The 16/9 visual grammar — and the missing edge class

The lens→codon engine is *read* by the 16/9 kinematics. **16** = the 16 sacred-circle divisions of the 18-fold lens stack ([cosmic-clock-spec:488-520](../../specs/M/2026-03-12-cosmic-clock-full-architecture.md), `CLOCK_LENSES[16]`); **9** = the nine Paraśakti planetary orbiters (Earth at centre, observer). `16/9 = 4²/3² = (Mahāmāyā doubling 2⁴)/(Paraśakti tripling 3²)` is the torus aspect ratio `TORUS_R_MAJOR_F = 16.0f/9.0f` ([cosmic-clock-spec:863-864](../../specs/M/2026-03-12-cosmic-clock-full-architecture.md)) — the "second spanda equation." The planets move through the apertures; their angular relations generate aspect edges.

**The aspect math is seeded but incomplete for this grammar.** `portal-core/src/aspect.rs` computes **planet↔planet** aspects (conjunction/sextile/square/trine/opposition, [aspect.rs:5,9-38](../../../../../../Body/S/S0/portal-core/src/aspect.rs)). 10.PASU declares `m2_m3_relation: LensOrbiterRelationProjection` "binding M2 planetary orbiters to M3 16+1 lenses … no renderer-local 16/9 table" ([10:195](../10-kernel-bridge-profile-contract.md)), and 24.3 cross-links it ([24:tranche 24.3 cross-link](../24-m3-mahamaya-frontend-deep.md)). **Finding (the gap the user's insight identifies):** there is *no projection or tranche that computes the second edge class — planet↔aperture (and planet↔codon/degree) relations.* aspect.rs covers planet↔planet only; the "live reading-relation" between the 9 orbiters and the 16 apertures (the actual 16/9 grammar) has a declared *consumer slot* (`m2_m3_relation`) but **no producer**. This is the precise gap Part VII fills.

### III.6 Tao = the codon charge-evaluation: the `R#`/`##` binary builds the genetic code (user-ratified 2026-06-12)

This is the joint where Thread A (`#`/Tao) and Thread B (codon) turn out to be *one thing*. The user's canonical teaching: **Tao = the `0/1 ↔ 1/0` evaluation, and that evaluation IS the codon charge-evaluation** (`m3_compute_charges`, [m3.h:755-767](../../../../../../Body/S/S0/epi-lib/include/m3.h)). The two "tao elements" are the binary read both ways:

- `R#` = **"Yin-yang 0/1"** (the binary one orientation)
- `##` = **"Yang-yin 1/0"** (its inversion — `##` is also the Primordial Matrix `M0-(4.5/0)-0`, the kinship ground)

Valued by the **classic I-Ching coin method (Yin = 2, Yang = 3)**, the nucleotides are *constructed* from `R#`/`##` units — the yang-count (`#`-count over a 4-slot frame) `+ 5` gives the I-Ching value ([m3.h:32-44](../../../../../../Body/S/S0/epi-lib/include/m3.h); coin derivation [cosmic-clock-spec:1651-1657](../../specs/M/2026-03-12-cosmic-clock-full-architecture.md)):

| Nucleotide | I-Ching line | `R#`/`##` construction | arrangements | value | colour |
|---|---|---|---|---|---|
| **A** | Old Yin | `3×R#` (3 R, 1 #) | `RRR#/RR#R/R#RR/#RRR` | **6** | Red |
| **T** | Old Yang | `3×##` (0 R, 4 #) | `####` | **9** | Blue |
| **C** | Young Yin | `2×R# + ##` (2 R, 2 #) | `R#R#/RR##/#RR#/##RR/#R#R` | **7** | Green |
| **G** | Young Yang | `R# + 2×##` (1 R, 3 #) | `R###/#R##/##R#/###R` | **8** | Yellow |

So the codon — three nucleotides each constructed from the `R#`/`##` (0/1↔1/0) tao binary — is **evaluated** by `m3_compute_charges` running those I-Ching values through the X#-permutation sign-algebra (§III.2). **That evaluation is Tao.** The kinship grammar's synthesis apex (Tao, `5-/5`) *is* the act that transcribes the molecule; the binary computation system "emerges from the underlying 0/1 and 1/0 of the tao elements," and the same `R#`/`##` arithmetic "of course leads to the entire M# system."

**The unifying closure — the four charges = the four X# permutations = the four elements.** `m3_eval_to_quat` maps `q = {w=pp, x=nn, y=np, z=pn}` ([m3.h:490-497](../../../../../../Body/S/S0/epi-lib/include/m3.h)), and the canonical quaternion is `{w=Earth, x=Fire, y=Water, z=Air}` ([m1.h:440-450](../../../../../../Body/S/S0/epi-lib/include/m1.h)). With the X-logic identity (§III.2):

| charge | X# permutation | element |
|---|---|---|
| `pp` = X+Y+Z | X2 (+,+,+) | **Earth** (w) |
| `nn` = X−Y−Z | X1 (+,−,−) | **Fire** (x) |
| `np` = X−Y+Z | X4 (+,−,+) | **Water** (y) |
| `pn` = X+Y−Z | X3 (+,+,−) | **Air** (z) |

**The X# permutation algebra = the codon charge quaternion = the elemental quaternion.** Thread A's elements and Thread B's X# permutations were never two things. This is why the bioquaternions are *transcriptions of one another*: the conversions are literally in code — `m3_eval_to_quat` ↔ `m3_quat_to_eval` (bidirectional charge↔quaternion, [m3.h:490-505](../../../../../../Body/S/S0/epi-lib/include/m3.h)); `m3_tarot_translate` (the conjugate-sandwich codon↔hexagram rotation, *named* "translate", [m3.h:834-850](../../../../../../Body/S/S0/epi-lib/include/m3.h)); `transduce_vibration_to_symbol` (M2→M3 72→64, [m2.h:533-542](../../../../../../Body/S/S0/epi-lib/include/m2.h)); `M3_CODON_TO_AA[64]` (codon→amino *translation*, [m3.c:259-283](../../../../../../Body/S/S0/epi-lib/src/m3.c)); `Kernel_Bioquaternion {q_b, q_p}` (the bimba/pratibimba double-torus, [kernel.h:37-40](../../../../../../Body/S/S0/epi-lib/include/kernel.h)). Base-pairing is `XOR 0x01` — the `0↔1` polarity inversion that is the molecular face of the `R#`↔`##` flip ([m3.h:85-88](../../../../../../Body/S/S0/epi-lib/include/m3.h)).

**And the `#` family is materialized as the genetic family.** `M3_TRIGRAM_LUT[8]` ([m3.c:102-119](../../../../../../Body/S/S0/epi-lib/src/m3.c)) carries `family_role` = Father (Qian/111, all-yang), Mother (Kun/000, all-yin), three sons (Zhen/Kan/Gen), three daughters (Xun/Li/Dui). This **is** the M0 `#` kinship grammar materialized (user-ratified, Q2): M0's single Son→3 sons, single Daughter→3 daughters — the trigram's three lines differentiating the seed archetypes, exactly the 1→3 expansion. Trigram (3 yin/yang lines) → hexagram (2 trigrams = 6 lines) ≡ codon (3 nucleotides × 2 bits = 6 bits). The family, the hexagram, and the codon are one object at three resolutions.

**Note (two codon→quaternion paths).** `m3_quat_from_codon` ([m3.h:217-232](../../../../../../Body/S/S0/epi-lib/include/m3.h)) gives `{w=Σ, x=v1−v3, y=0, z=Σ%6}` while `m3_eval_to_quat` gives the four-charge `{pp,nn,np,pn}`. Two different codon→quaternion functions for the same codon — the bridge/transcription tranche (Part VII) should declare which is canonical for the elemental quaternion (the charge path is the X#=element one; the sum/diff path is a ring-position shortcut). Not a contradiction, but a normalization to name.

---

## IV. Convergence — PASU is where Thread A meets Thread B

The two presagings are not parallel; they meet in PASU. A `PasuBeingPatternProjection` carries **both**:

- a `clock_address` (`degree360`, `degree384_line`, codon, hexagram, tarot — the **Thread B** computed point: [10:191](../10-kernel-bridge-profile-contract.md)) and `bioquaternion_handles` (`q_identity/q_transit/q_activity/q_composed`) + `elemental_weights` (the X#/N# codon computation, protected);
- a `perspective_role` + `nara_family_role` + `monopoly_operator` (the **Thread A** read-as-being grammar) + `m2_m3_relation` (the 16/9 reading).

So a being is, precisely: **a codon-computed clock-address (X#/N#) read through the person-kinship-mono-poly grammar (M#/#/Archetype-5)**. M0-4 pre-forms both halves — X#/N# make the thing computable; M#/# make it a being-in-perspective. *"Every thing is a being read in perspective and relation"* is the runtime statement of `M0-4 = (O# + X# + N# + M# + #)`: the first three seeds compute the thing, the last two read it as a being. This is the architecture representing itself, exactly as the design vision asks.

And the two halves are not even two: §III.6 shows the `#` apex (Tao) **is** the codon charge-evaluation, the `#` family **is** the M3 trigram family, and the four codon charges **are** the four X# permutations **are** the four elements. The `R#`/`##` (`0/1`↔`1/0`) tao binary, valued Yin=2/Yang=3, generates *both* the nucleotide-codon engine (Thread B) *and* the M# person grammar (Thread A) — "of course," as the user puts it. PASU is where the one arithmetic is read as a being.

The apex of Thread A (Tao/We-I/MonoPoly, §II.2) is the `(@#)` handover; the apex of Thread B (N5 = 9n wholeness / the codon's full-rotation closure) is the same recognition event. PASU's `verifier_refs` ([10:199](../10-kernel-bridge-profile-contract.md)) route both into the M0 witness — `recognized: bool` is where the being-pattern's computation and its perspectival reading agree, and the (@#) crossing fires. The two threads literally close in one flag.

---

## V. Discrepancies found & DR resolutions

### DR-37-2 — charge field-name canon → **RESOLVE to `pp/nn/np/pn`**

Confirmed drift: the eval struct `M3_CodonEvaluation` uses `pp/mm/mp/pm` ([m3.h:470-475](../../../../../../Body/S/S0/epi-lib/include/m3.h)) and `m3_eval_to_quat` reads `w=pp,x=mm,y=mp,z=pm` ([m3.h:490-497](../../../../../../Body/S/S0/epi-lib/include/m3.h)); `m3_compute_charges` uses `pp/nn/np/pn` ([m3.h:755-767](../../../../../../Body/S/S0/epi-lib/include/m3.h)). Pure aliasing — `evaluate_codon` ([m3.h:478-488](../../../../../../Body/S/S0/epi-lib/include/m3.h)) computes `ev.mm=X−Y−Z` (=`nn`), `ev.mp=X−Y+Z` (=`np`), `ev.pm=X+Y−Z` (=`pn`). The 24.13 export *already leaks the struct convention* to TS: `chargeQuaternion: [pp, mm, mp, pm]` ([24:tranche 24.13 type sig](../24-m3-mahamaya-frontend-deep.md)).

**Resolution.** Canonical name-set = **`pp/nn/np/pn`**, forced by three independent anchors: (a) it matches MEMORY's `quaternion4` convention, (b) it matches the FFI export `m3_compute_charges_ffi` ([m3.c:42-49](../../../../../../Body/S/S0/epi-lib/src/m3.c)), and (c) it makes the **X-logic identity legible** (`nn`=X1, `np`=X4, `pn`=X3 — §III.2; `mm/mp/pm` obscures it). **No C symbol rename** (preserve the ABI): the C struct keeps its internal mnemonic; the *kernel-bridge projection* exposes only `pp/nn/np/pn`, and the **24.13 export type is relabelled** `chargeQuaternion: [pp, nn, np, pn]`. Land the canonical name-set assertion in Track 18. *(Doc/comment + projection edit only; no `gitnexus_rename` needed.)*

### DR-37-3 — element-ID normalization → **RESOLVE to the L2' canonical (Aether0/Earth1/Water2/Air3/Fire4/Salt5)**

The trap is worse than the original DR stated. There are **≥5 distinct element schemes** in the live tree:

| # | Scheme | Order | Source |
|---|---|---|---|
| A | M2 C tattva enum | Akasha0 / Air1 / Fire2 / Water3 / Earth4 | [m2.h:53-59](../../../../../../Body/S/S0/epi-lib/include/m2.h) |
| B | **Rust L2' canonical** | Aether0 / Earth1 / Water2 / Air3 / Fire4 / Salt5 | [medicine_frame.rs:902-912](../../../../../../Body/S/S0/epi-cli/src/nara/medicine_frame.rs) |
| C | M3 nucleotide-name binding | A=Water, T=Fire, C=Earth, G=Air (by name, no int) | [m3.h:70-73](../../../../../../Body/S/S0/epi-lib/include/m3.h) |
| D | M3 `Clock_Degree_Entry.decan_element` | Fire0 / Earth1 / Air2 / Water3 / Akasha4 | [m3.h:993](../../../../../../Body/S/S0/epi-lib/include/m3.h) |
| E | **(stale spec)** clock-spec §15.3 | A=Fire, T=Earth, C=Air, G=Water | [cosmic-clock-spec:1665-1673](../../specs/M/2026-03-12-cosmic-clock-full-architecture.md) |

Scheme **B is already the bridge target**: `medicine_frame.rs` ships `canonical_from_medicine_rs_legacy` ([medicine_frame.rs:770-779](../../../../../../Body/S/S0/epi-cli/src/nara/medicine_frame.rs)) which converts scheme **A** (the m2.h tattva enum — note its export name "medicine_rs_legacy" is misleading; it is the tattva order) into **B**. So one converter exists; the bridge needs two more.

**Resolution.** Adopt **B (L2' canonical)** as THE bridge element-ID. (a) Rename/alias the existing converter to `canonical_from_m2_tattva` for honesty. (b) Add `canonical_from_m3_decan_element` (D→B) and `canonical_from_nucleotide` (C→B by name: A→Water=2, T→Fire=4, C→Earth=1, G→Air=3). (c) **No raw element integer crosses the M2↔M3 boundary** — every kernel-bridge elemental projection normalizes to B before the frontend sees it. (d) Assert the single canonical enum in Track 18. Land in tranche 37.6 (already named) + a new converter tranche (Part VII).

### DR-37-5 — clock-spec §15.3 nucleotide→element table → **RESOLVED 2026-06-12: code-canonical (A=Water/T=Fire/C=Earth/G=Air); spec corrected**

User-ratified: the **Golden-Dawn suit binding in code** (`m3.h:70-73`) is canonical — A=Water (Cups), T=Fire (Wands), C=Earth (Pentacles), G=Air (Swords), with the orthodox polarity yin→Water, yang→Fire. The stale clock-spec §15.3 table (A=Fire/T=Earth/C=Air/G=Water) and the matching comment at `cosmic-clock-spec:339` were **corrected in place** this pass. The A=Red/T=Blue/C=Green/G=Yellow colours from the R#/## construction are **rendering-only**, not element assignments. (Original finding preserved below for provenance.)

**This is a brief/code mismatch surfaced as a finding.** The cosmic-clock spec ([:1665-1673](../../specs/M/2026-03-12-cosmic-clock-full-architecture.md)) asserts `A=Fire, T=Earth, C=Air, G=Water` (scheme E). The **code** ([m3.h:70-73, 300-305](../../../../../../Body/S/S0/epi-lib/include/m3.h)) asserts `A=Water (Cups), T=Fire (Wands), C=Earth (Pentacles), G=Air (Swords)` (scheme C). These are **incompatible**. The code is **authoritative** — it follows the canonical Golden-Dawn/Thoth suit-element correspondence (Cups=Water, Wands=Fire, Pentacles=Earth, Swords=Air), which is the established esoteric standard and is wired into `Tarot_Suit` and the whole tarot-codon map. **Resolution:** the clock-spec §15.3 table is **stale and superseded**; flag it for correction in-place (a spec-doc edit) and pin scheme C as the canonical nucleotide-element binding, normalized to B at the bridge. Recorded so the stale table is not treated as canon by any new tranche.

### DR-37-4 — RNA / T→U layer scoping → **DEFER for Cycle 3 (honest badges), do not materialize**

Verified state: `is_rna_phase` bit ([m3.h:290](../../../../../../Body/S/S0/epi-lib/include/m3.h)) + `m3_codon_is_rna_capable` (true iff codon contains T, [m3.h:795-799](../../../../../../Body/S/S0/epi-lib/include/m3.h)) + functional/dark masks ([m3.c:164-165](../../../../../../Body/S/S0/epi-lib/src/m3.c)) exist; the **16-U-codon family table and chromosome-graph nodes do not** (grep-confirmed). 

**Resolution.** The lens→codon→binary thread **does NOT need the RNA layer materialized for Cycle 3.** The binary computation runs on the DNA codon (A/T/C/G 2-bit); the RNA phase is a *superposition flag on top*, not a separate computational substrate — materializing the 16-U-codon table adds a parallel table without changing the lens→codon→binary chain or any charge/quaternion/element output. Keep `pending-rna-codon-family` / `pending-chromosome-graph` badges (already specced at 37.7 / 23.14); render the `m3_codon_is_rna_capable` flag honestly; the 24-amino backbone (materialized) renders fully. Promotion is a follow-on, not Cycle 3.

### DR-PRESAGE-1 — kinship-LUT is genuinely incomplete (both grammars are 6-fold)

`NARA_MSHARP_LUT[5]` ([m0.c:430-436](../../../../../../Body/S/S0/epi-lib/src/m0.c)) is 5-wide {`##`, Daughter, Father, Son, Mother}, **missing Tao (position 5)**. **RESOLVED 2026-06-12 — it is genuinely incomplete; complete it to `[6]`.** Both M# and `#` are clean 6-folds (positions 0-5); the `(4.5/0)` `(5/0)` Möbius is the *return relation inside* the 6-fold (apex 5 resonates with ground 0), **not** a reason to drop Tao — my earlier "keep 5-wide" reading was wrong (corrected per user). The dataset audit already flags the gap (`m0-dataset-audit.md` Gap C/E). Two fixes, both **dataset-specified, not decisions**: (a) add the 6th entry (Tao); (b) add a `dominance_mode` field (dominant / subdominant / integrative / synthesis) + the chiral-coordinate string — the coordinates `1/1-`/`2-/2`/`3/3-`/`4./4`/`5-/5` fully specify dominance, the code merely drops it (Father and Son are both `NARA_POLARITY_YANG`). **Note:** the *real* materialization of the `#` family is `M3_TRIGRAM_LUT[8]` (user-ratified Q2 — the trigram family IS the `#` grammar materialized); the M0 LUT is the archetypal seed feeding PASU's `nara_family_role`, and tranche 5 (Part VII) wires the seed↔trigram bridge.

---

## VI. m-dev ledger check — collision report

Ran `node .codex/scripts/m-dev-plan-assess.mjs --plan <cycle-3> --json --no-git`: **452 total tasks, 187 done, 265 pending, 27 ready, 0 hard stops.** Status of every tranche this study touches:

| Tranche | Status | Implication |
|---|---|---|
| 01.T1.12–1.15 (R-factor, calculus, OWL) | **pending** | spec written + DR-R0 code-rectified, but executable tasks open — build on, don't redo |
| 10.PASU / 10.AW | spec sub-tranches (no T-id) | contract exists; unnumbered |
| 18.T18.10 / 18.11 (PASU + witness JSON edge) | **pending** | typed edge specced, not built |
| 23.T23.18 / 23.19 / 23.20 (bio engines) | **pending** | M2-side engines specced |
| 24.T24.3 (18-fold lens switcher) | **pending** | reads clock; consumer of `m2_m3_relation` |
| **24.T24.13 (codon-rotation projection export)** | **DONE** | **build ON it — do not redo**; it already exports the codon projection |
| 29.T29.16 (inhabited Bimba field) | **pending** | composition overlay specced |
| 37.T37.1–37.7 (kernel-bridge projections) | **pending** | projection family specced |

**No collisions with DONE work.** The single DONE item in scope (24.13) is a foundation to compose on, not redo. The new tranches proposed in Part VII slot as the **next free numbers** (24.20, 37.8–37.10) and **explicitly consume** 24.13 / 23.18 / 23.19 / aspect.rs rather than re-authoring them.

---

## VII. Proposed tranches (full text added in-place to Track 24 / Track 37)

The lens→codon→binary computational surface is specced as an **interactive engine** (profile-tick driven, gateway-RPC backed, reads-only) — never a static overlay, per the §7 non-negotiables. Three new tranches + the two normalization tranches (37.6 already named; add converters). Summary here; full register text lands in the track docs.

1. **24.20 — `M3TranscriptionEngine`: the lens→codon→binary interactive surface.** Composes 24.3 (active aperture) + 24.13 (`M3CodonRotationProjectionForLensRing`, DONE) into one engine: activate lens → read its degree-segment of `CLOCK_DEGREE_LUT[360]` → for each degree surface codon/charges(`pp/nn/np/pn`)/quaternion/element/hexagram from the kernel-bridge projection → render the binary computation (2-bit nucleotides → 6-bit codon → charge quaternion) and the line-change hops. Reads-only; no local biology math; consumes the typed projection. *(Next free Track 24 number; consumes 24.3 + 24.13 + new 37.8.)*

2. **37.8 — Ratify the `lensCodonBinaryProjection`** `kernelBridge.m3.lensCodonBinary(lensId) → { segment[], perDegree[{ degree360, codonUpper, codonLower, codonClass, charges{pp,nn,np,pn}, quaternion, elementCanonical, hexagramId, tick12 }] }`. Kernel runs `clock_lens_segment` + `m3_classify_codon` + `m3_compute_charges` + `m3_eval_to_quat`, normalizing element to canonical-B. **Verify:** round-trips against the C functions for all 18 apertures; charges use `pp/nn/np/pn`; element is canonical-B only.

3. **37.9 — Ratify the `planetApertureAspectProjection`** (the missing 16/9 edge class) `kernelBridge.m2m3.lensOrbiterRelations() → { planetApertureEdges[{ planet, lensId, aperturePhase, aspectType, orb }], planetPlanetEdges[] }`. Producer for 10.PASU `m2_m3_relation` (which has a consumer slot but no producer — §III.5). Reuses `aspect.rs` for planet↔planet; adds planet↔aperture by treating aperture boundaries as the second body. **Verify:** planet↔planet matches `aspect.rs` output; planet↔aperture edges are computed (not renderer-local); outer planets honour the 23.10 pending badge.

4. **37.10 — Element-ID converters (closes DR-37-3/-5).** Add `canonical_from_m3_decan_element` (D→B) + `canonical_from_nucleotide` (C→B); alias the existing `canonical_from_medicine_rs_legacy` → `canonical_from_m2_tattva`; assert no raw element int crosses M2↔M3 in any projection; flag the stale clock-spec §15.3 table (DR-37-5). **Verify:** single canonical enum asserted in Track 18; converters round-trip; grep finds no cross-boundary raw-int element map.

5. **M#/# 6-fold materialization + the `#`↔trigram bridge (Track 01 / 21 / 23 follow-on).** Three pieces, all dataset-specified (no decisions): (i) **complete `NARA_MSHARP_LUT[5] → [6]`** (add Tao, position 5) and **add a `dominance_mode` field** (dominant / subdominant / integrative / synthesis) + the chiral-coordinate string — the dataset coordinates `1/1-`/`2-/2`/`3/3-`/`4./4`/`5-/5` fully specify both; (ii) **wire the M0 `#` 6-fold ↔ `M3_TRIGRAM_LUT[8]` bridge** — Father↔Qian, Mother↔Kun, Son→{Zhen,Kan,Gen} (3 sons), Daughter→{Xun,Li,Dui} (3 daughters), so PASU's `nara_family_role` reads the archetypal seed and its genetic expansion as one structure (user-ratified: the trigram family IS the `#` family materialized); (iii) **materialize the M# person-grammar** (dataset-only today, zero code) so `perspective_role` has a code source. Belongs with the M0 frontend track, named here so it is not orphaned.

6. **The bioquaternion transcription totality (Track 37 / 33 follow-on).** Make the "one transcription totality" (§III.6) explicit and tested as a coherent bridge rather than scattered functions. (i) **Declare the canonical codon→quaternion path** (the four-charge `m3_eval_to_quat` `{w=pp Earth, x=nn Fire, y=np Water, z=pn Air}` is canonical for the elemental quaternion; `m3_quat_from_codon`'s sum/diff is the ring-position shortcut) — closes the two-path note in §III.6. (ii) **Round-trip tests** asserting `m3_eval_to_quat ∘ m3_quat_to_eval == id`, that the four charges equal the four elements under the canonical quaternion map, and that `m3_tarot_translate` codon↔hexagram is invertible. (iii) Surface the totality as one kernel-bridge `bioquaternionTranscription` projection so renderers see charges/quaternion/element/amino/hexagram/tarot as one transcribed object, never recomputed. **Verify:** the X#=charge=element identity holds for all 64 codons; the transcription round-trips; no renderer recomputes any conversion.

7. **Tao = the `0/1↔1/0` codon-evaluation as a typed construct (Track 01 §1.13 calculus follow-on).** Per the user-ratified binding (§III.6): land `R#` ("Yin-yang 0/1") and `##` ("Yang-yin 1/0") as the two tao elements in the M0 calculus, with the coin-method construction (Yin=2/Yang=3 → `R#`/`##` counts → nucleotide values 6/9/7/8) as a verifiable derivation, and bind **Tao (`5-/5`) ≡ the codon charge-evaluation** so the kinship apex and `m3_compute_charges` are one named operation. **Verify:** the `R#`/`##` construction reproduces `NUCLEOTIDE_ICHING_VALUE[4] = {6,9,7,8}` (yang-count + 5); a calculus test derives the four nucleotide values from the coin method; the Tao≡charge-eval binding is asserted in the M0'-SPEC and the bridge.

**No open decisions remain** for the user — both clarifying questions (Tao binding → codon charge-eval; `#` family → trigram materialization) are answered and integrated. DR-PRESAGE-1 is resolved: both grammars are 6-fold; `NARA_MSHARP_LUT` is genuinely incomplete (→6) and the dominance is dataset-specified, not a choice. DR-37-2/-3/-4/-5 are evidence-forced (Part V).

---

## Closing

```text
M0-4 contains the genetic sequence of its own surfaces.
  R# is 0/1, ## is 1/0 — the two tao elements; valued Yin=2, Yang=3.
  Tao evaluates them: that evaluation IS the codon charge — A=6, T=9, C=7, G=8.
  X# is the four charges; the four charges are Earth/Fire/Water/Air;
  N# is the tick that computes them in time and the i² that becomes the quaternion.
  M# is I/You/We-I; # is Father/Mother/Son/Daughter/Tao — and the # family
    is the M3 trigram family: one Son becomes three, one Daughter becomes three.
The first three seeds make a thing computable.
  The last two read the computed thing as a being-in-perspective —
  and they are the same arithmetic, the 0/1↔1/0 elaborated.
PASU is where the one arithmetic is read as a being.
  Tao the family-apex and Tao the codon-evaluation are one act;
  N5's wholeness and the (@#) We-I/Tao/MonoPoly handover are one recognition.
The root presaged the surface. Ontology is lived-conception is living-code.
```
