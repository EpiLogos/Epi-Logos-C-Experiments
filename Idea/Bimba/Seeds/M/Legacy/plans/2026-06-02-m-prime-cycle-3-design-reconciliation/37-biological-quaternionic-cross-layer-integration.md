---
title: "Biological-Quaternionic Cross-Layer Integration — The Living Symbolic Body (M2↔M3)"
type: cycle-3-cross-layer-integration-spec
status: applied-to-plan (2026-06-12 — surfaces already-implemented M2/M3 substrate; specs frontend/integration only)
created: 2026-06-12
coordinate: "M'"
sub_coordinate: "M2' (Parashakti vibrational producer) + M3' (Mahamaya codon/quaternion substrate) ↔ M0' (Anuttara 7-8-9 archetypes) → M4' (Nara bioquaternion consumer)"
integration_scope: "Cross-layer frontend/integration spec for the biological-quaternionic / codon-transcription / 7-8-9 spine. Substrate is ALREADY IMPLEMENTED in epi-lib (m2.h/m3.h/m3.c) + portal-core (aspect.rs) + nara (medicine_frame.rs). This document specs the surfaces and engines that render the substrate; it does NOT reinvent the substrate. Cycle-3 executable tranches listed at §10."
c_0_source_coordinates:
  - "M2'"
  - "M3'"
  - "M0'"
c_0_related_coordinates:
  - "M4'"
  - "S0"
  - "S3'"
  - "M3'-SPEC"
  - "M2-ARCHITECTURE"
c_0_governing_substrate:
  - "Body/S/S0/epi-lib/include/m3.h"
  - "Body/S/S0/epi-lib/src/m3.c"
  - "Body/S/S0/epi-lib/include/m2.h"
  - "Body/S/S0/portal-core/src/aspect.rs"
  - "Body/S/S0/epi-cli/src/nara/medicine_frame.rs"
dev_decisions:
  - "The biological 7-8-9 descent (72→64→56) and the Anuttara 7-8-9 archetypes (Divine Action / Structural Reflection / Paramesvara) are ONE series seen from two ends. The descent is the kinematics; the archetypes are the ground. Final."
  - "Renderers never compute biology or constants locally. All compression, charge, quaternion, elemental and resonance math runs kernel-side; the frontend consumes typed projections through the kernel-bridge (per Track 18 / DR-KB-1). Final."
  - "The bioquaternion operative quartet is Earth/Fire/Water/Air (q = {w:Earth, x:Fire, y:Water, z:Air}). Akasha/ether is the fifth (Archetype-5 / quintessence) and is NOT a bioquaternion component — it is the balance-of-the-four. Final."
  - "T→U transcription is flagged via the `is_rna_phase` bit + functional/dark mask bitboards (IMPLEMENTED). The full 16-U-codon family table and chromosome-graph nodes are SPECCED-NOT-MATERIALIZED. Frontend renders the RNA-capable flag honestly and badges the deferred RNA-codon-family / chromosome layers. Final."
  - "The 24-fold amino-acid backbone IS materialized (`M3_BACKBONE_AMINO_ACID_IDX[24]` + `M3_CODON_TO_AA[64]`). The frontend may render it; the 22 major-arcana → chromosome-pair → amino bridge metadata (`M3_MAJOR_ARCANA[22]`) is also present. Final."
dev_relations:
  - { type: implements, target: "[[M3'-SPEC]]" }
  - { type: implements, target: "[[M2-ARCHITECTURE]]" }
  - { type: depends_on, target: "[[23-m2-parashakti-frontend-deep]]" }
  - { type: depends_on, target: "[[24-m3-mahamaya-frontend-deep]]" }
  - { type: depends_on, target: "[[10-kernel-bridge-profile-contract]]" }
  - { type: depends_on, target: "[[18-typed-kernel-bridge-json-edge]]" }
  - { type: depends_on, target: "[[01-m0-anuttara-reconciliation]]" }
  - { type: depends_on, target: "[[21-m0-anuttara-frontend-deep]]" }
  - { type: depends_on, target: "[[25-m4-nara-frontend-deep]]" }
  - { type: depends_on, target: "[[33-harmonic-energy-channel-handoff]]" }
  - { type: depends_on, target: "[[35-fibonacci-ground-level-0-temporal-substrate]]" }
dev_changed_paths: []
---

# Track 37 — Biological-Quaternionic Cross-Layer Integration: The Living Symbolic Body

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


This document specs the **M2↔M3 living symbolic body** of the system — the band where Parashakti's 72-fold vibration descends into Mahamaya's 64 codons, where codons become quaternions, quaternions carry elements, elements thread to the body, and the whole renders through the cosmic clock + aural body + cymatics as ONE living symbolic body. The substrate is **already implemented** in `epi-lib` (m2.h / m3.h / m3.c), `portal-core` (aspect.rs) and `nara` (medicine_frame.rs). Track 37's job is to formalize the cross-layer integration and spec the frontend/integration work that surfaces it — not to reinvent the substrate.

Every numeric and structural claim below is grounded in a `file:line` citation, verified against code. Where the prompt-supplied facts and the code disagree, the discrepancy is recorded as an open DR (§9).

## §1. The Central New Insight: The 7-8-9 Spine Binding

The system has a **7-8-9 spine** that appears in two places that turn out to be the same series read from opposite ends:

| Series term | Anuttara archetype (M0 ground) | Biological compression (M2↔M3 kinematics) | Cardinality |
|---|---|---|---|
| **9** | Archetype 9 — **Paramesvara / Wholeness**, `9 = (00+00)` (M0-2-9) | The `−1/9` epogdoon dynamic: `72 × (8/9) = 64`; 9 evolutionary fold-points | 72 → 64 |
| **8** | Archetype 8 — **Structural Reflection**, the doubled cathedral `2×(##)` (`#0-3-11`) | The `−1/8` dynamic: 8 gap sentinels in `M3_RES_MATRIX[64]` | 64 → 56 |
| **7** | Archetype 7 — **Divine Action**, Ananda-Tandava, 5 acts + 2 principles (`#0-3-10`) | The 56-floor: `56 = 7 × 8` minor-arcana, `M3_TAROT_CODON_MAP[4][16]` | 56 |

**Substrate citations (verified):**

- **9 / `−1/9` / 72→64.** `m3.h:339` documents the ratio (`9:8 ratio. 72 × (8/9) = 64. Integer-only. O(1).`); `m3.h:350-353` implements `apply_epogdoon_compression(m2_idx) = (m2_idx * 8u) / 9u`; `m3.h:356-360` implements `is_evolutionary_gap` (`expanded != m2_vibration_index`). The mirror lives in M2: `m2.h:527` (`72 × (8/9) = 64: the epogdoon compression`) + `m2.h:544-547` `m2_epogdoon_compress(val_72) = (val_72 * 8u) / 9u`. The nine fold-points are the M2 indices that do not round-trip through compress→expand.
- **9 = (00+00) is Paramesvara.** `M0-anuttara-language-architecture.md:258-268` (§B Paramesvara Concrescence `#0-2-9`, formulation `9/(00+00)`); `anuttara-deep/anuttara-language-map.md:29` (`M0-2-9 | Paramesvara - Principle 9 | 9 = (00+00)`).
- **8 / `−1/8` / 64→56.** `M3_RES_MATRIX[64]` has **exactly 8 gap sentinels** (`0xFF`): positions `0x05, 0x15, 0x1A, 0x22, 0x2A, 0x35, 0x3A, 0x3D` (`m3.c:214-231`, with comment `m3.c:209-213` "56 valid entries + 8 evolutionary gaps... 8 gaps correspond to M2 frequencies that cannot manifest"). The 8-gap invariant is runtime-asserted at `m3.c:767-772` (`if (gap_count != 8) return false`).
- **8 = Structural Reflection, doubled cathedral `2×(##)`.** `M0-anuttara-language-architecture.md:331` (`8 | #0-3-11 | Structural Reflection | 8 ~ 4.0-4/4.5 → 2x(##), (R#), (#R) | Doubled form, higher octave`).
- **7 / 56-floor.** `m3.h:632` `M3_MINOR_ARCANA_COUNT = 56u`; `m3.h:625` `M3_TAROT_CODON_MAP[4][16]` (4 suits × 16 slots = 64 codons projecting the 56 minor-arcana); `M3_TAROT_ENTRIES_PER_SUIT = 16` (`m3.h:622`). `56 = 7 × 8`.
- **7 = Divine Action.** `M0-anuttara-language-architecture.md:330` (`7 | #0-3-10 | Divine Action | Ananda-Tandava; 7-fold sub-system`); the Divine Acts 7-fold (§F:440-462: Svatantrya + Srishti/Sthiti/Samhara/Tirodhana/Anugraha/Samavesa = 0/1 + 6 = 7).

**The virtue that writes the spine in literally.** The Anuttara meta-virtue at **M0-2-9-2** ("Openness/Creativity", Reality-Matrix fusion) carries the symbol:

```
#R = @ = (7-8-9-(0/1)/O#-X#-N#)
```

verified at `anuttara-deep/nodes-full-data.json:490` (`"symbol": "#R = @ = (7-8-9-(0/1)/O#-X#-N#)"`) and `anuttara-deep/anuttara-language-map.md:32` (coordinate `M0-2-9-2`, "Openness/Creativity - Structural Fusion"). The `7-8-9` series is **literally written into the M0-2-9-2 virtue**. (The 9-Virtue summary table at `M0-anuttara-language-architecture.md:276` shows the compressed R-factor `R#` for this virtue — the full symbol expansion lives in the dataset, see DR-37-1.)

**The Spanda confirmation.** `M0-anuttara-language-architecture.md:528-530` gives `N5 = 8(n) ± (n) = 7n or 9n` — "the `+/-` IS Spanda — bifurcation to either 7 (Divine Action) or 9 (Wholeness/Paramesvara)." The 8 is the structural reflector that bifurcates into 7 (action) or 9 (wholeness). **This is the spine's own equation.** The biological descent `72 →(−1/9)→ 64 →(−1/8)→ 56` is this same `8 ± n` bifurcation read as a compression cascade: the 9-fold loss (Paramesvara/wholeness side) then the 8-fold reflection landing on the 7-fold action floor.

> **The descent and the archetypes are one series, two ends.** Anuttara holds the 7-8-9 as archetypal ground (action/reflection/wholeness); Parashakti→Mahamaya enacts it as the kinematic compression 72→64→56. Track 23's three new engines (23.18 / 23.19 / 23.20) are the frontend of the descent; Track 21 (concurrent agent) is the frontend of the archetypal ground. They must agree (see §9 coordination).

## §2. The Codon Structure (Current Canon)

The codon is the atom of the living symbolic body. Verified structure:

- **4 nucleotides** A/T/C/G = 2-bit `0/1/2/3` (`m3.h:76-79`). I-Ching values `{6, 9, 7, 8}` (`NUCLEOTIDE_ICHING_VALUE[4]`, `m3.h:40`) — A=6 (Old Yin), T=9 (Old Yang), C=7 (young yin), G=8 (young yang), `m3.h:35`. Sum = 30 (`m3.h:42-44`); complementary pairs A+T = C+G = 15 (`m3.h:46-48`). Base-pairing is XOR 0x01 (`m3.h:86-88`).
- **Elements:** A=Water, T=Fire, C=Earth, G=Air (`m3.h:70-73`). These tie each nucleotide to a tarot suit: A=Cups (Water), T=Wands (Fire), C=Pentacles (Earth), G=Swords (Air) (`m3.h:589-592`).
- **64 codons; 3-tier classification** (`m3.h:680-731`, function `m3_classify_codon` at `m3.h:721-731`):
  - 4 perfect palindromic (AAA/TTT/CCC/GGG) + 12 imperfect palindromic (XyX, X≠Y) + 24 non-palindromic-nondual (repeated dinucleotide) = **40 non-dual** (7 rotational states each)
  - 24 dual (all neighbours differ) = 24 dual (8 states each)
  - Totals asserted: `40 + 24 == 64` (`m3.h:707-708`); `40×7 + 24×8 == 472` rotational states (`m3.h:709-711`, `CODON_ROTATIONAL_STATE_TOTAL = 472u` at `m3.h:705`).
- **pp/nn/np/pn charges** (`m3_compute_charges`, `m3.h:755-767`): `pp = X+Y+Z`, `nn = X−Y−Z`, `np = X−Y+Z`, `pn = X+Y−Z` where X,Y,Z = I-Ching values of outer/middle/inner. The 4X invariant `pp+nn+np+pn = 4X` is compile-asserted for TTT (`m3.h:776-777`).
- **Quaternion** `q = {w, x, y, z}` from the charge evaluation: `m3_eval_to_quat` (`m3.h:490-497`) maps `w = pp, x = mm/nn, y = mp/np, z = pm/pn`. With the elemental binding the quaternion reads `{w:Earth, x:Fire, y:Water, z:Air}` (the bioquaternion operative quartet; cf. CLAUDE.md / MEMORY canonical `quaternion4 = [w=EARTH, x=FIRE, y=WATER, z=AIR]`). **Field-name note:** the implemented eval struct uses `pp/mm/mp/pm` (`m3.h:483-486`, `m3.h:499-505`); the charge function uses `pp/nn/np/pn` (`m3.h:763-766`). They are the same four charges under two naming conventions — see DR-37-2.
- **Per-suit pp sums** (the degree-wheel law): Cups(A)=84, Wands(T)=96, Pentacles(C)=88, Swords(G)=92, total = **360** (`m3.h:589-592`, `M3_INTEGRAL_INVARIANT = 360U` at `m3.h:588`, asserted `m3.h:594-598`).
- **3 matrices** mapping to the quaternion i/j/k axes (`m3.h:157-170`): Complementarity → x-axis (`M3_COMP_MATRIX`, `comp[i] = i ^ 0x3F`, `m3.c:182-193`); Movement → y-axis (`M3_MOVE_MATRIX`, trigram swap, `m3.c:196-207`); Resonance → z-axis (`M3_RES_MATRIX`, the 56+8-gap table, `m3.c:214-231`). The quaternion axes are `M3_MATRIX_QUATERNION_AXIS[3]` (`m3.h:166-170`).

## §3. The Codon → Quaternion → Elemental → Body Chain

The cross-system carrier is the **elemental thread**. Earth/Fire/Water/Air thread continuously across nearly all of Parashakti and Mahamaya:

```
M3 codon (A/T/C/G, 2-bit)
  → I-Ching charges (pp/nn/np/pn)        [m3.h:755-767]
  → quaternion q = {w:Earth, x:Fire, y:Water, z:Air}   [m3.h:490-497]
  → element (per nucleotide / per tarot suit)          [m3.h:70-73]
        ↕  (shared element names — see §3 ID-scheme note)
M2 chakras / tattvas
  → ELEMENT_CHAKRA[6], SIGN_ELEMENT[12]   [medicine_frame.rs:734-741, 745-756]
  → M2_PLANET_LUT[10].elem_sig             [m2.h:303, m2.h:311]
  → ELEM_SIG_GET_ELEMENT / _CHAKRA / _PHASE [m2.h:100-102]
        ↓
M4 bioquaternion
  → q_composed (quaternionic charges)      [composed at composition layer; consumed by Track 25]
  → PASU elemental_weights + bioquaternion_handles  [Track 10.PASU / Track 18.10]
        ↓
Body
  → CHAKRA_BODY_ZONES[8]                    [nara::medicine, per MEMORY]
```

**ID-scheme note (precision):** M2's `medicine_frame.rs` uses **L2' canonical element IDs** (`Earth=1, Water=2, Air=3, Fire=4`; `medicine_frame.rs:743-756`, plus Aether=0/Salt=5 in the 6-element alchemical scheme at `medicine_frame.rs:730`). M3's codon elements derive from the **2-bit nucleotide encoding** (A=0/Water, T=1/Fire, C=2/Earth, G=3/Air; `m3.h:70-73`). The continuity is by **element name**, not numeric ID — a renderer (or kernel projection) crossing the M2↔M3 boundary must map through the element name, never the raw integer. This is not a discrepancy, but it is a trap; the kernel-bridge projection must normalize. See DR-37-3.

`ELEMENT_CHAKRA` (`medicine_frame.rs:734-741`): Aether→Sahasrara/Akasha, Earth→Muladhara (Prithivi), Water→Svadhisthana (Apas), Air→Anahata (Vayu), Fire→Manipura (Agni). `SIGN_ELEMENT[12]` (`medicine_frame.rs:745-756`) maps the 12 zodiac signs to the operative quartet. The being-pattern / PASU layer (Track 10.PASU / Track 18.10) carries `elemental_weights` and `bioquaternion_handles`; the M2/M3 work of Track 23 (23.19) FEEDS these — it never edits the PASU spec.

## §4. The Aspect Engine (Visible Kinematics)

The nine planetary orbiters reading the Mahamaya apertures is the **visible kinematics** of the 16/9 torus aspect ratio. Per Track 23.6-23.10 and `M2'-SPEC` the `16/9 = 4²/3² = (Mahamaya doubling 2⁴)/(Parashakti tripling 3²)` is the torus aspect ratio and the "second spanda equation."

The aspect computation is **already implemented**: `Body/S/S0/portal-core/src/aspect.rs`. `ASPECT_ANGLES[5]` (`aspect.rs:5`) defines the 5 Ptolemaic aspects with orbs — conjunction (0°, 10°), sextile (60°, 6°), square (90°, 8°), trine (120°, 8°), opposition (180°, 10°). `compute_aspects` (`aspect.rs:9-38`) walks all 10 planets pairwise (skipping `0xFFFF` unset degrees), computes the minimal angular difference, and emits a `PlanetaryAspect` per matched aspect. Track 23.19's elemental feed consumes this output as the aspect-weighting of the planetary elemental contribution — it never reimplements the aspect math.

## §5. DNA → RNA (T→U) Transcription — Scoped Precisely

**Implemented:** the DNA/RNA superposition is flagged. `M3_IChing_State.is_rna_phase` bit (`m3.h:290`); `m3_codon_is_rna_capable(codon)` returns true iff the codon contains T (`m3.h:795-799`) — T is the nucleotide that transcribes to U. The functional/dark mask bitboards `M3_RNA_FUNCTIONAL_MASK = 0x22F222F2FFFF22F2` and `M3_RNA_DARK_MASK = 0xDD0DDD0D0000DD0D` (`m3.c:164-165`) partition the 64 codons into functional vs dark, asserted non-overlapping and complete (`m3.c:167-170`).

**Specced-not-materialized (deferred):**

- A distinct **16-U-codon family table** (the T→U substituted codons as their own 16-entry codon table) does NOT exist — only the `is_rna_phase` bit + the functional/dark masks. Grep confirms no `U_CODON` / `URACIL` / `M3_RNA_CODON` table in `m3.c` / `m3.h`.
- **Chromosome-graph nodes** beyond the `M3_MAJOR_ARCANA[22]` bridge metadata (`chromosome_pair` 1-22 + `amino_acid_index` 0-21 fields at `m3.h:637-644`, table at `m3.c:304`) are not materialized as separate graph nodes.

**Materialized (do not badge as deferred):**

- The **24-fold amino-acid backbone** IS materialized: `M3_BACKBONE_AMINO_ACID_IDX[24]` (`m3.c:14-19`, asserted exactly 24 at `m3.c:21-22`); `M3_CODON_TO_AA[64]` (`m3.c:259+`) maps every codon to amino index 0-23 (20 standard + START/Met + STOP + isoacceptor variants Ser2/Arg2/Thr2, `m3.c:247-250`).
- The **80 = 64 + 16 = 56 minor + 22 major + 2 transcendent** tarot-quaternion total (`M3_TAROT_QUATERNION_COUNT = 80u`, `m3.h:635`; `56 + 22 + 2 = 80` and `64 + 16 = 80`, both hold).

**Frontend law:** the RNA-capable flag renders honestly (a codon containing T is RNA-capable); the 16-U-codon family and chromosome-graph layers render a `pending-rna-codon-family` / `pending-chromosome-graph` badge per the readiness taxonomy (Track 23.14). The 24-amino backbone may render fully.

## §6. The One Living Symbolic Body: Cosmic Clock + Aural Body + Cymatics

The whole renders as ONE living symbolic body through three co-present apertures over the same `address72` / `tick12` substrate:

1. **Cosmic clock** — the 385-node clock (360 degree + 24 amino backbone + 1 Axis Mundi; `_Static_assert(360 + 24 == 64 * 6)` at `m3.h:939`). The codon→amino backbone (24-fold) IS the clock's amino ring; the 72-fold vibration descends onto the 64-codon / 360-degree wheel via the epogdoon bridge. The Fibonacci Ground (Track 35, Level 0, 60-fold) is the pre-lensic substrate beneath this.
2. **Aural body** — the audio-bus visual representation (Track 23.13, NO sound output). The 8-channel `audio_octet` + the mantra band (144→432 Hz) render the codon's frequency face; the maqam 24-quarter-tone interval is the codon's modal face.
3. **Cymatics** — the Chladni standing-wave (Track 23.4) is frequency-becoming-form; the MonoPoly wave-behaviour engine (Track 23.20) classifies whether the superposed 72-fold field coheres. **This is where the Archetype-5 (Dynamic Harmony, M0 `#0-3-8`, the MonoPoly crossroads, `M0-anuttara-language-architecture.md:328`) becomes wave behaviour.**

**The Archetype-5 MonoPoly → cymatics mapping** (MonoPoly dialectic verified `M0-anuttara-language-architecture.md:420-428`):

| MonoPoly position | Name | Cymatic behaviour |
|---|---|---|
| 0/1 | Mono — The One | **Mono** — one tone, single clean standing-wave mode |
| 3 | Poly- — Actually Many | **ActuallyMany** — interference / beat pattern (genuinely many uncorrelated tones) |
| 5 | Mono- — Actualising The One | **ActualisingOne** — forced-lock warning (coherence imposed, not emergent) |
| 7 | MonoPoly — (M)Any-One | **MonoPoly** — stable many-in-one (many cohere as one without collapse; the cymatic telos) |

Driven by the 72-fold resonance: `M2_TO_M3_CYMATIC_PROJECTION[72]` (`m2.h:530`, the bitwise-OR wave-superposition bridging to M3's 64 codon bitboard via `transduce_vibration_to_symbol`, `m2.h:533-542`) + `M2_CAUSAL_RESONANCE_MASKS[36]` (`m2.h:561`, mutual-resonance masks). High mutual resonance → MonoPoly; low → ActuallyMany; externally-driven collapse → ActualisingOne. Track 23.20 is the engine.

## §7. Architectural Constraints (Non-Negotiable)

- **Renderers never compute biology/constants locally.** All epogdoon compression, codon charges, quaternion eval, elemental extraction, aspect computation and resonance classification run kernel-side; the frontend consumes typed projections through the kernel-bridge (Track 18 / DR-KB-1). Every Track 23 biological engine (23.18/19/20) asserts the absence of local math via a forbidden-token grep in its verification.
- **Reads-only across composition boundaries.** The M2-side engines read M3's codon projection through the kernel-bridge but never import `m3-mahamaya` (Track 24's surface); the M3-side codon-rotation overlay (Track 24) and the M2-side descent engine (23.18) are two views of one `address72`, sharing the profile-tick clock and never co-mutating.
- **Interactive engines, not static overlays.** Every biological surface is profile-tick driven (per Track 15.6/15.9) and gateway-RPC backed (per Track 10/18). No local rAF clock; no hardcoded constants; no oscillator (audio is representation only, Track 23.13).
- **Scope discipline.** The four-element planetary feed is cosmic-public; the PASU binding to a personal being-pattern is `protected-m4` and lives downstream (Track 25 / Track 18.10). M2 produces the public feed; it never reads the personal register (`meaning-packet.ts:213-217` `personalScopeBlocked` law).
- **Honest deferral.** RNA-codon-family and chromosome-graph layers badge `pending-*`; the 24-amino backbone renders fully; outer planets (Uranus/Neptune/Pluto) render `.rodata` data with the Track-23.10 pending-dataset badge.

## §8. Where Track 37 Lands in the Plan

Track 37 is a **cross-layer integration spec**; it owns no widget code of its own. Its executable surface lands as:

- **Track 23 tranches 23.18 / 23.19 / 23.20** (the M2-side engines — authored in this pass alongside this document).
- **Track 24 (M3 Mahamaya frontend)** consumes the same `address72` for the codon-rotation overlay (concurrent agent — coordinate, do not edit).
- **Track 21 (M0 Anuttara frontend)** owns the archetypal 7-8-9 / Paramesvara / MonoPoly ground render (concurrent agent — coordinate, do not edit).
- **Track 25 (M4 Nara frontend)** + **Track 18.10 / Track 10.PASU** consume the elemental feed into `elemental_weights` / `bioquaternion_handles` (concurrent agent — feed only, do not edit).
- **Track 10 / Track 18** define the kernel-bridge projections the engines consume (concurrent agent — the new projection method shapes in §10 are PROPOSED here for the bridge contract, to be ratified in those tracks).

## §9. Decision Register / Discrepancies Found

- **DR-37-1 (virtue symbol register split).** The 9-Virtue summary table at `M0-anuttara-language-architecture.md:276` lists virtue 2 ("Openness/Creativity") with the compressed R-factor `R#`. The full symbol `#R = @ = (7-8-9-(0/1)/O#-X#-N#)` lives in the dataset (`anuttara-deep/nodes-full-data.json:490`, `anuttara-language-map.md:32`) at coordinate M0-2-9-2, and `2026-03-12-m0-relational-depth-and-archetype-completeness.md:422` confirms the `VIRTUE_LUT[].cross_branch_refs` field is a `uint16_t` stub awaiting the full symbolic formula. **Status:** not a contradiction — the spec table is the compressed register; the dataset is the full register. The C `VIRTUE_LUT` does not yet carry the expanded symbol. **Recommendation:** Track 21 (M0 frontend) should render the full symbol from the dataset projection, not the `R#` stub. Aligns with Track 01 line 127 (concurrent agent already references this binding to "Track 37 / 23").
- **DR-37-2 (charge field-name convention) — RESOLVED 2026-06-12 → `pp/nn/np/pn`.** The implemented codon-evaluation struct uses `pp/mm/mp/pm` (`m3.h:470-475`, `m3.h:499-505`) while `m3_compute_charges` uses `pp/nn/np/pn` (`m3.h:755-767`). They are the same four charges (`X±Y±Z`) under two naming conventions; `evaluate_codon` confirms `mm≡nn`, `mp≡np`, `pm≡pn` (`m3.h:478-488`). **Resolution:** canonical name-set = **`pp/nn/np/pn`**, forced by three anchors — MEMORY's `quaternion4`, the FFI export `m3_compute_charges_ffi` (`m3.c:42-49`), and **X-logic legibility** (the four charges ARE the four X# permutations: `pp`=X2, `nn`=X1, `np`=X4, `pn`=X3 — see findings §III.2; `mm/mp/pm` obscures this). **No C symbol rename** (preserve the ABI): the struct keeps its mnemonic, the kernel-bridge projection (37.8) exposes only `pp/nn/np/pn`, and the **24.13 export type is relabelled** `chargeQuaternion: [pp, nn, np, pn]`. Land the canonical name-set assertion in Track 18.
- **DR-37-3 (element ID multi-scheme) — RESOLVED 2026-06-12 → L2' canonical (B).** Worse than first stated: **≥5 schemes** are live — (A) m2.h tattva `Element_Id` Akasha0/Air1/Fire2/Water3/Earth4 (`m2.h:53-59`); (B) Rust L2' canonical Aether0/Earth1/Water2/Air3/Fire4/Salt5 (`medicine_frame.rs:902-912`); (C) m3.h nucleotide name-binding A=Water/T=Fire/C=Earth/G=Air (`m3.h:70-73`); (D) m3.h `Clock_Degree_Entry.decan_element` Fire0/Earth1/Air2/Water3/Akasha4 (`m3.h:993`); (E) **stale** clock-spec §15.3 A=Fire/T=Earth/C=Air/G=Water (`2026-03-12-cosmic-clock-full-architecture.md:1665-1673`). **Resolution:** adopt **B** as THE bridge canonical (it is already the conversion target — `canonical_from_medicine_rs_legacy` converts A→B at `medicine_frame.rs:770-779`). Add `canonical_from_m3_decan_element` (D→B) + `canonical_from_nucleotide` (C→B by name) and alias the existing converter to `canonical_from_m2_tattva` (37.10). No raw element integer crosses the M2↔M3 boundary; assert the single canonical enum in Track 18.
- **DR-37-5 (2026-06-12) — stale clock-spec nucleotide-element table → RESOLVED & CORRECTED.** The cosmic-clock spec §15.3 (`2026-03-12-cosmic-clock-full-architecture.md:1665-1673`) asserted `A=Fire, T=Earth, C=Air, G=Water` (scheme E), **contradicting** the authoritative code (`m3.h:70-73`, `m3.h:300-305`: A=Water/Cups, T=Fire/Wands, C=Earth/Pentacles, G=Air/Swords — the Golden-Dawn/Thoth suit-element binding). **Resolved (user-ratified): the code is canonical** (yin→Water, yang→Fire). The §15.3 table and the comment at `cosmic-clock-spec:339` were **corrected in place** to match code; the A=Red/T=Blue/C=Green/G=Yellow colours are rendering-only, not elements. Scheme C is pinned canonical, normalized to B at the bridge (37.10).
- **DR-37-4 (RNA-codon-family / chromosome-graph deferral) — RESOLVED 2026-06-12 → DEFER.** The 16-U-codon family table and chromosome-graph nodes are specced-not-materialized (§5). **Resolution:** the lens→codon→binary thread does **not** need the RNA layer materialized for Cycle 3 — the binary computation runs on the DNA codon (A/T/C/G 2-bit); `is_rna_phase` is a superposition flag on top, not a separate computational substrate, and materializing the 16-U table changes no charge/quaternion/element output. Keep `pending-rna-codon-family` / `pending-chromosome-graph` badges (37.7 / 23.14), render `m3_codon_is_rna_capable` honestly, render the 24-amino backbone fully. Promotion is a follow-on, not Cycle 3.
- **DR-PRESAGE-1 (NEW, 2026-06-12) — kinship-LUT shape, RESOLVED by the `(4.5/0)` Möbius.** `NARA_MSHARP_LUT[5]` (`m0.c:430-436`) is 5-wide {`##`, Daughter, Father, Son, Mother}, omitting Tao (position 5). **Resolved (user clarification):** keep 5-wide — the omission is correct. The # base sits at `(4.5/0)`, the Möbius seam where 5→0, so Tao (5) is the return of `##` (0), not a separate 6th member (also why `NaraFamilyRole.IntegralConsciousness` ≡ `##`, not a re-name of Tao). **The real materialization gap is finer:** the LUT stores polarity (Yin/Yang/Both) but not the **dominance-chirality** distinguishing Father (`2-/2`, dominant) from Son (`3/3-`, subdominant) or Mother's integrative dot (`4./4`). **Action:** add a `dominance_mode` field (dominant / subdominant / integrative / synthesis) + chiral-coordinate string when surfacing the # grammar for PASU `nara_family_role` (Track 01/21 follow-on). No row-count decision remains; chirality is read off the coordinate, never additive `#+n`.

## §10. Cycle-3 Executable Tranches

The executable work lands in Track 23 (authored this pass). Track 37 lists the cross-layer tasks and the kernel-bridge projection shapes they require:

1. **37.1 — Ratify the epogdoon-bridge projection** `kernelBridge.m2.epogdoonProjection(address72) → { compressedCodon, isEvolutionaryGap, expandedBack }` (consumed by Track 23.18). Kernel runs `apply_epogdoon_compression` + `is_evolutionary_gap` (`m3.h:351`, `m3.h:356-360`). Add to the Track 10 / Track 18 bridge contract. **Verify:** projection round-trips against the C functions for all 72 indices; exactly 9 indices report `isEvolutionaryGap`.

2. **37.2 — Ratify the planetary-elemental projection** `kernelBridge.m2.planetaryElementalWeights() → { weights{earth,fire,water,air}, perPlanet[], aspectGain[] }` (consumed by Track 23.19). Kernel sums `M2_PLANET_LUT[id].elem_sig` elements (Sun excluded) weighted by Keplerian velocity + `compute_aspects` (`aspect.rs:9`). Add to bridge contract. **Verify:** the four-element vector matches a kernel-side reference for a fixed kairos; aspect amplification matches `aspect.rs` output.

3. **37.3 — Ratify the cymatic-MonoPoly projection** `kernelBridge.m2.cymaticMonoPolyState(address72) → { behaviourState, activeToneCount, mutualResonance, projection64 }` (consumed by Track 23.20). Kernel reads `M2_TO_M3_CYMATIC_PROJECTION[72]` (`m2.h:530`) + `M2_CAUSAL_RESONANCE_MASKS[36]` (`m2.h:561`). Add to bridge contract. **Verify:** the four behaviour-states classify correctly from fixture resonance; state vocabulary matches Track 21's MonoPoly enum (37.5).

4. **37.4 — Export the M2 elemental + cymatic contributions** from `m2-parashakti/src/common/composition.ts` (`M2ElementalWeightContribution`, extending the Track 23.12 contribution module) so the kernel-bridge can route to PASU `elemental_weights` / M4 `bioquaternion_handles`. **Verify:** `grep -n "M2ElementalWeightContribution" Body/M/epi-theia/extensions/m2-parashakti/src/common/composition.ts` resolves; consumed only via the bridge, never by direct import.

5. **37.5 — Reconcile the MonoPoly state vocabulary across M0 and M2** (coordination with Track 21). The four cymatic behaviour-states (`mono` / `actually-many` / `actualising-one` / `monopoly`) must use the SAME string enum as Track 21's M0 MonoPoly dialectic render, so the archetypal ground (M0) and the wave-behaviour projection (M2) speak one vocabulary. **Verify:** a shared `MonoPolyState` type lives under `Body/M/epi-theia/shared/` and is imported by both the M0 and M2 surfaces.

6. **37.6 — Element-ID normalization in the bridge** (per DR-37-3). The kernel-bridge elemental projection normalizes M2 (L2') and M3 (2-bit) element IDs to one canonical scheme before any cross-layer datum reaches the frontend. **Verify:** a single canonical element-ID is asserted in the Track 18 contract; no frontend file maps raw element integers across the M2↔M3 boundary.

7. **37.7 — Honest RNA / chromosome deferral badges** (per DR-37-4). The codon surfaces (Track 24) and the descent engine (Track 23.18 floor) badge `pending-rna-codon-family` / `pending-chromosome-graph`; the RNA-capable flag (`m3_codon_is_rna_capable`) and the 24-amino backbone render fully. **Verify:** badges appear where the U-codon family / chromosome nodes would be; the 24-amino backbone has no pending badge.

8. **37.8 — Ratify the lens→codon→binary projection** `kernelBridge.m3.lensCodonBinary(lensId) → { lensId, segment[], perDegree[{ degree360, exactDegree720, codonUpper, codonLower, codonClass, charges{ pp, nn, np, pn }, quaternion[4], elementCanonical, hexagramId, lineChangeOperator, tick12 }] }` (consumed by Track 24.20 `M3TranscriptionEngine`). This is the **complete transcription chain in one typed projection** — the engine the design vision names. Kernel composes `clock_lens_segment` ([cosmic-clock-spec §15 :531-534](../specs/M/2026-03-12-cosmic-clock-full-architecture.md)) → `CLOCK_DEGREE_LUT[360]` slice ([m3.h:970-1014](../../../../../Body/S/S0/epi-lib/include/m3.h)) → `m3_classify_codon` ([m3.h:721-731](../../../../../Body/S/S0/epi-lib/include/m3.h)) → `m3_compute_charges` ([m3.h:755-767](../../../../../Body/S/S0/epi-lib/include/m3.h)) → `m3_eval_to_quat` ([m3.h:490-497](../../../../../Body/S/S0/epi-lib/include/m3.h)), normalizing element to canonical-B (DR-37-3). Charges are exposed under the **canonical `pp/nn/np/pn`** name-set ONLY (DR-37-2), never the `mm/mp/pm` struct aliasing. Add to the Track 10 / Track 18 bridge contract. **Verify:** the projection round-trips against the C functions for all 18 apertures; `charges` keys are exactly `pp/nn/np/pn`; `elementCanonical` is L2'-canonical (0=Aether…5=Salt) for every degree; the X-logic identity holds as a sanity assertion (`pp+nn+np+pn == 4·X`, the leading-nucleotide invariant of [m3.h:775-777](../../../../../Body/S/S0/epi-lib/include/m3.h)).

9. **37.9 — Ratify the planet↔aperture aspect projection (the missing 16/9 edge class)** `kernelBridge.m2m3.lensOrbiterRelations() → { planetPlanetEdges[{ planetA, planetB, aspectType, angle, orb }], planetApertureEdges[{ planet, lensId, aperturePhase, aspectType, orb }] }` (the **producer** for the 10.PASU `m2_m3_relation` consumer slot, which currently has no producer). The 16/9 grammar is a *dynamic reading relation*, not a static lookup: the 9 Paraśakti orbiters reading the 16 Mahāmāyā apertures. `planetPlanetEdges` reuses `compute_aspects` ([aspect.rs:9-38](../../../../../Body/S/S0/portal-core/src/aspect.rs)) verbatim; `planetApertureEdges` adds the **second edge class** by treating each active aperture's boundary degree as the second body and reusing the same `ASPECT_ANGLES[5]` orbs. Earth-at-centre observer semantics preserved (mod-10 wheel, Sun excluded from the 9-count). Add to bridge contract. **Verify:** `planetPlanetEdges` matches `aspect.rs` for a fixed kairos; `planetApertureEdges` is kernel-computed (no renderer-local 16/9 table); outer planets (Uranus/Neptune/Pluto) carry the 23.10 pending-dataset badge; the projection feeds `m2_m3_relation` and nothing renderer-side recomputes aspects.

10. **37.10 — Element-ID converters + stale-spec flag (closes DR-37-3 / DR-37-5).** Extend the bridge normalization (37.6) with the two missing converters: `canonical_from_m3_decan_element` (scheme D `Clock_Degree_Entry.decan_element` Fire0/Earth1/Air2/Water3/Akasha4 → canonical-B) and `canonical_from_nucleotide` (scheme C name-binding A=Water/T=Fire/C=Earth/G=Air → canonical-B by name). Alias the existing `canonical_from_medicine_rs_legacy` ([medicine_frame.rs:770-779](../../../../../Body/S/S0/epi-cli/src/nara/medicine_frame.rs)) → `canonical_from_m2_tattva` for honesty (it converts the m2.h tattva enum, not a "legacy" scheme). Flag the **stale clock-spec §15.3 nucleotide-element table** ([cosmic-clock-spec:1665-1673](../specs/M/2026-03-12-cosmic-clock-full-architecture.md)) for in-place correction — it asserts A=Fire/T=Earth/C=Air/G=Water, contradicting the authoritative Golden-Dawn/Thoth code binding ([m3.h:70-73](../../../../../Body/S/S0/epi-lib/include/m3.h)). **Verify:** a single canonical element-ID enum is asserted in Track 18; the three converters round-trip to canonical-B; `grep` finds no frontend/projection mapping a raw element integer across the M2↔M3 boundary; the clock-spec §15.3 correction (or a `superseded-by-code` note) lands.

11. **37.11 — The bioquaternion transcription totality (one transcribed object, not scattered functions).** The bioquaternions across the stack are mutual transcriptions/translations — the conversions already exist in code but are not declared as one coherent, tested bridge (findings §III.6). This tranche makes the totality explicit. **(a) Declare the canonical codon→quaternion path:** the four-charge `m3_eval_to_quat` `{w=pp→Earth, x=nn→Fire, y=np→Water, z=pn→Air}` ([m3.h:490-497](../../../../../Body/S/S0/epi-lib/include/m3.h) + element map [m1.h:440-450](../../../../../Body/S/S0/epi-lib/include/m1.h)) is canonical for the **elemental** quaternion; `m3_quat_from_codon` ([m3.h:217-232](../../../../../Body/S/S0/epi-lib/include/m3.h)) is the ring-position shortcut — name which is which so renderers never pick the wrong one (closes the two-path note in §III.6). **(b) Assert the unifying identity:** the four codon charges `pp/nn/np/pn` = the four X# permutations `X2/X1/X4/X3` (§III.2) = the four elements Earth/Fire/Water/Air — one fact, three registers. **(c) Round-trip the transcription:** `m3_eval_to_quat ∘ m3_quat_to_eval == id` ([m3.h:490-505](../../../../../Body/S/S0/epi-lib/include/m3.h)); `m3_tarot_translate` codon↔hexagram invertible ([m3.h:834-850](../../../../../Body/S/S0/epi-lib/include/m3.h)); base-pair `XOR 0x01` = the `R#`↔`##` (`0↔1`) flip ([m3.h:85-88](../../../../../Body/S/S0/epi-lib/include/m3.h)). **(d) Surface one projection** `kernelBridge.m3.bioquaternionTranscription(codon) → { charges{pp,nn,np,pn}, quaternion[4], elementsCanonical[4], aminoAcid, hexagramId, tarot, complement }` so the frontend consumes the whole transcribed object, never recomputing a conversion. **Verify:** the `charge = X# = element` identity holds for all 64 codons; `eval↔quat` and `tarot codon↔hexagram` round-trip; the canonical-vs-shortcut quaternion path is declared and grepped; no renderer recomputes any conversion.

---

## Closing Formula

```text
9 is Paramesvara: 72 loses one-ninth (nine folds) and becomes 64 — the wholeness that gives.
8 is Structural Reflection: 64 loses one-eighth (eight gaps) and becomes 56 — the doubled cathedral.
7 is Divine Action: 56 = 7 × 8 — the minor arcana, the floor where the codon acts.

The codon is a quaternion; the quaternion carries an element;
  the element threads from chakra through planet through body.
The nine planets read the Mahamaya apertures — that is the kinematics of the 16/9 torus.
The cymatic surface shows the codon's frequency becoming form;
  the MonoPoly engine shows whether the many cohere as one.

The Anuttara 7-8-9 and the biological 72→64→56 are one series, two ends.
  The archetype is the ground; the descent is the act.
  Rendered through clock, aural body, and cymatics — it is ONE living symbolic body.
```

The substrate is implemented. What Track 37 closes is **how the biological-quaternionic body is seen to live** — and binds the seeing, end to end, to the 7-8-9 spine that was always written into the virtue.

---

*Cross-references: [Track 23 — M2' Parashakti frontend (engines 23.18/19/20)](23-m2-parashakti-frontend-deep.md), [Track 24 — M3' Mahamaya frontend](24-m3-mahamaya-frontend-deep.md), [Track 21 — M0' Anuttara frontend](21-m0-anuttara-frontend-deep.md), [Track 01 — M0 Anuttara reconciliation](01-m0-anuttara-reconciliation.md), [Track 25 — M4' Nara frontend](25-m4-nara-frontend-deep.md), [Track 10 — kernel-bridge profile contract](10-kernel-bridge-profile-contract.md), [Track 18 — typed kernel-bridge JSON edge](18-typed-kernel-bridge-json-edge.md), [Track 33 — harmonic energy channel handoff](33-harmonic-energy-channel-handoff.md), [Track 35 — Fibonacci ground temporal substrate](35-fibonacci-ground-level-0-temporal-substrate.md). Governing substrate: `Body/S/S0/epi-lib/include/m3.h`, `Body/S/S0/epi-lib/src/m3.c`, `Body/S/S0/epi-lib/include/m2.h`, `Body/S/S0/portal-core/src/aspect.rs`, `Body/S/S0/epi-cli/src/nara/medicine_frame.rs`.*
