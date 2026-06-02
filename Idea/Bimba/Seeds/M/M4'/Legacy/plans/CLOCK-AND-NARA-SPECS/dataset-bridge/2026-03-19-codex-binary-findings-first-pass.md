# 2026-03-19 Codex Binary Findings First Pass

**Status:** First-pass synthesis for canonical spec consolidation
**Scope:** Deep binary computation package + dataset bridge + live C/Rust surfaces
**Companion docs:** `00-master-coordination.md`, `04-cross-layer-addressibility.md`, `00-canonical-invariants.md`, `00-spec-harmonization-plan.md`

---

## Purpose

This document is the first full Codex-side parity pass over:

1. `docs/deep-epi-logos-binary-computational-nara-clock/`
2. `docs/plans/CLOCK-AND-NARA-SPECS/dataset-bridge/`
3. current C surfaces in `epi-lib/`
4. current Rust surfaces in `epi-cli/`

The goal is not just to restate theory. The goal is to make explicit:

- what the deep computational package actually adds
- which dataset coordinates already ground those mathematical claims
- which C and Rust structs/LUTs already reflect that grounding
- which runtime surfaces are still legacy, partial, or stubbed
- what the proposed canonical data structures should be before implementation hardens

The governing principle remains the same as in `00-master-coordination.md`:

> the dataset coordinate is the canonical address; C structs, Rust structs, LUTs, gateway payloads, and visual render state are all reflections of that address.

This file is therefore not meant to spawn a new branch of planning documents. It is meant to act as the **jumping-off point for collapsing current material into one trustworthy development plan**.

---

## Executive Read

### 1. The deep binary corpus is usable as the real computational basement

The strongest documents in `docs/deep-epi-logos-binary-computational-nara-clock/` are:

- `ql_harmonic_mathematics_v2.md`
- `ql_clifford_consolidation.md`
- `ql_nara_handoff.md`
- `ql_transcriptional_bridge.md`
- `clifford_computation.py`
- `gamma_matrices.py`

Taken together, they provide a serious computational substrate:

- `4 + 2` frame logic
- `2^6 = 64` stable address space
- mixed modular lifts (`144`, `256`, `729`, `1296`)
- Cl(4,2) algebraic interpretation
- quaternionic / spinor bridge
- codon / hexagram / tarot computational cascade
- an M4-facing shell for identity, oracle, and contextual reading

This package should be promoted into canon, but not all at the same authority level:

- `ql_harmonic_mathematics_v2.md` should be treated as the main arithmetic substrate
- `ql_clifford_consolidation.md` should be treated as the algebraic consolidation layer
- `ql_nara_handoff.md` should be treated as an architecture shell, not final authority
- `ql_transcriptional_bridge.md` should be split into:
  - arithmetic and structural claims that can be canonized now
  - stronger symbolic/tarotic claims that should stay behind explicit evidence gates

### 2. The binary frame is not "just binary"

The stable address space is still `2^6 = 64`, but the outer and inner positions can run under different modular regimes.

That means the canonical model must distinguish:

- `binary_address6`: the stable six-position address in 0..63
- `frame_modulation_regime`: how outer and inner positions are being lifted
- `tick12`: the canonical M1 spanda phase-lock over that address

The important clarification from this pass is:

- the inner four positions are the core binary engine
- the rightmost outer position modulates parity / odd-even distinction
- the leftmost outer position modulates the major boundary, including the `before/after 32` split
- therefore the 12-fold clock is downstream harmonization, not a replacement for the mixed-modular substrate

### 3. M4 is already richly specified in the datasets

Nara is not a vague future layer. The raw dataset already expresses a coherent sixfold M4 architecture:

- `#4.0` identity
- `#4.1` medicine
- `#4.2` oracle/divination
- `#4.3` transformation
- `#4.4` context/lenses
- `#4.5` integration/logos

The biggest planning gap on the dataset-bridge side is therefore simple:

- there is still no dedicated `05-nara-findings.md`
- `04-cross-layer-addressibility.md` is useful, but it is not yet the full M4 implementation contract

### 4. Current runtime surfaces are closer to parity than they first appeared, but still fragmented

The strongest current parity areas are:

- `m3.c` LUT surfaces
- `medicine.rs` decan/body/herb bridge
- `oracle.rs` coin arithmetic and tarot/decan tables
- `clock_state.rs` shared portal state model

The weakest areas are:

- legacy-vs-current hash and temporal surfaces
- extraction/tabulation of the already-rich M4 bridge details
- gateway payload transport
- current/live clock integration
- runtime conformance to the now-set planet canon
- representation-layer translation between nucleotide family, charge tuple, and quaternion component

---

## Canonical Clarifications From This Pass

### A. Canonical identity and quaternion rule

The clean rule is:

- `quintessence_hash[32]` is the canonical identity address
- `quintessence_quaternion[4]` is the mathematically derived elemental form of that identity
- the quaternion for a person, entity, or concept in the `#4.4.4.4` family feeds the quaternionic encoder as the position-0 seed via the canonical BLAKE3 address
- natal data is the required identity root
- other layers enrich and can recompute live quintessence, but they are additive, not existentially prior

This should be expressed explicitly in specs as:

- `position 0` = the seed address / archetypal subject anchor
- `quintessence_hash` = opaque canonical identity address
- `quintessence_quaternion` = subject's elemental-rotational body
- `contextual modulation` = environmental, phenomenological, journal, and situational weighting layered over the base identity

### B. Environmental and phenomenological augmentation rule

Phenomenology, journaling, and contextual life factors should not mutate the canonical identity hash itself.

They should instead produce a contextual modulation envelope:

- contextual weights
- lens emphasis
- environment quaternion
- resonance bias
- live rotational-state preference

In other words:

- identity hash = who/what the subject is at canonical address level
- contextual weighting = how that subject is being modulated in this moment

### C. Mixed-modular clock rule

The canonical clock chain should be:

1. dataset coordinate / binary frame address
2. raw six-position address
3. modular regime
4. exact degree / exact orientation
5. phase
6. `tick12`
7. `cf_substage6`
8. rendered face / oracle / medicine consequences

This avoids the current risk of letting `tick12`, `torus_pos`, `degree`, and `quaternion angle` become parallel truths.

### D. Raw vs derived vs rendered rule

Every spec should distinguish:

- `raw`
  - dataset properties
  - stored charge tuples
  - exact planetary degrees
  - exact coin outcomes
  - exact codon/hexagram IDs
- `derived`
  - hash
  - quaternion
  - exact degree
  - tick12
  - payload
- `rendered`
  - lens highlight
  - torus coordinates
  - body zone glow
  - UI summaries

This is the easiest way to keep future implementation mathematically honest.

---

## What The Deep Corpus Adds To The Emerging Canon

### 1. Mixed modular arithmetic belongs in the canon

The main mathematical contribution that must now be promoted is:

- `2^6 = 64` remains the stable executable address space
- outer and inner positions can be run under different moduli
- representative lifts include:
  - `3^2 × 2^4 = 144`
  - `4^2 × 2^4 = 256`
  - `3^6 = 729`
  - `4^2 × 3^4 = 1296`

This is not numerological ornament. It gives a rigorous way to describe:

- explicate versus implicate asymmetry
- boundary shifts
- parity modulation
- the difference between the four explicate `2`s and the two implicate `3`s

### 2. The Cl(4,2) framing is strong enough to keep

The Clifford consolidation documents justify a real algebraic reading of the six-position frame:

- six generators
- `(-1,+1,+1,+1,+1,-1)` style signed structure
- split-quaternion / spinor basis language
- 8-spinor / trigram correspondence

This should become the algebraic appendix to the M1-M3 computational specs rather than a parallel theory branch.

### 3. The transcriptional bridge is useful, but should be staged

The transcriptional bridge should contribute:

- executable arithmetic and combinatorics
- `U` / RNA shift logic where explicitly coordinated
- `56 + 24 = 80` expressional decomposition where relevant
- codon/tarot/transcription bridge structures

But its strongest symbolic claims should not become canonical unless they are coordinate-mapped and represented in the runtime contract.

---

## Dataset-Coordinate To Runtime Inventory

This section is the core parity pass. Each row names:

- dataset coordinate family
- mathematical meaning
- current C surface
- current Rust surface
- role in Nara / clock
- proposed canonical surface

### M0 / `#0-*` Anuttara

| Dataset coordinate(s) | Mathematical role | Current C surface | Current Rust surface | Role in Nara / clock | Proposed canonical surface | Read |
|---|---|---|---|---|---|---|
| `#0-0`, `#0-0-0`, `#0-0-1` | operator definition language, Vimarsa ISA, concrescence trace | `VIMARSA_TABLE[7]`, `Compiled_Formulation`, `Concrescence_Trace` | no first-class Rust mirror yet | source operator grammar and reduction logic for the entire stack | explicit `M0OperatorIsa` and `ConcrescenceModel` tabulated against dataset coordinates | strong C grounding, absent Rust mirror |
| `#0-1` | non-dual discrimination, fused 7-bit mask + Spanda bit, R-factor distributive source | `Spanda_Discriminator`, `m0_vak_cpf()`, `M0_Root.spanda_state` | no first-class Rust mirror yet | bare-metal discrimination state feeding higher branches | canonical `SpandaDiscriminator` row in parity tables with coordinate and bit layout | grounded in C, needs explicit tabulation |
| `#0-2`, `#0-2-9`, `#0-2-9-{0..8}` | void arithmetic and wholeness/virtue cascade | `void_ops_t`, `VOID_9`, `VIRTUE_LUT[9]` | no first-class Rust mirror yet | wholeness constant, virtue/R-factor bridge, compile-chain metaphysics grounded in data | `VoidArithmeticModel` and `VirtueLut[9]` with coordinate provenance | strong C grounding |
| `#0-3`, `#0-3-0/1`, `#0-3-2..11` | archetypal number language and subgrammars | `ARCHETYPE_LUT[12]`, `MIRROR_CHILDREN[2]`, `ZODIACAL_LUT[12]`, `MONOPOLY_LUT[7]`, `DIVINE_ACT_LUT[7]` | Rust consumes M0 consequences indirectly in `medicine.rs`, but has no direct M0 table module | grounds zodiac grammar, divine acts, archetypal numbering, mirror/frame principles | `ArchetypalGrammarBundle` explicitly bound to `#0-3*` branches | one of the most important M0 parity regions |
| `#0-4` | 5-frame QL meta-logic stack and Nara bridge | `QL_STACK[5]`, `NARA_MSHARP_LUT[5]` | no direct Rust M0 mirror yet | bare-metal source of O#/X#/N#/M#/# frame transitions and Nara base bridge | `QlFrameStack` + `NaraFrameBridge` as canonical M0-to-M4 tables | currently under-tabulated despite being central |
| `#0-5`, `#0-5-0/1-*`, `#0-5-5/0-*` | Siva/Shakti duality, route weaving, return cycle | `SIVA_TABLE[6]`, `SHAKTI_TABLE[6]`, `R_FACTOR_ROUTE_TABLE[7]`, `M0_CROSS_BRANCH_REGISTRY[7]`, `M0_CORE_RELATIONS[65]` | no direct Rust M0 mirror yet | cross-branch routing, cycle completion, operator/process polarity, bridge into Nara and M5 | `M0RouteRegistry`, `SivaShaktiBridge`, `M0CoreRelations` with coordinate source notes | strong C grounding, needs canonical cross-layer table |
| mixed `#0 -> #1/#2/#3/#4/#5` bridge | compiled shared clock/logos carriers | `Unified_Clock_State`, `m0_read_cosmic_clock()`, `Unified_Logos_State`, `m0_compute_logos_state()` | Rust re-implements downstream consequences in `clock_state.rs` and `medicine.rs`, but not as a shared M0 owner | O(1) clock/logos accessors feeding M1-M4 behavior | `CanonicalClockCarrier` and `CanonicalLogosCarrier` rows in the final implementation plan | critical bridge that must be tabulated, not implied |

### M1 / `#1-*` Paramasiva

| Dataset coordinate(s) | Mathematical role | Current C surface | Current Rust surface | Role in Nara / clock | Proposed canonical surface | Read |
|---|---|---|---|---|---|---|
| `#1-0..5` | six-position frame / signed QL positions | `Unified_Clock_State` via `m0_read_cosmic_clock()`, `read_cosmic_clock()` alias in `m3.h` | `PortalClockState.current_degree`, `torus_stage` | base clock skeleton | `BinaryFrameAddress` carrying `binary_address6`, `outer_regime`, `inner_regime`, `phase`, `tick12`, `cf_substage6` | partially represented, not explicit |
| `#1-3-0..5` and shadow return | 12-fold spanda / aroha-avaroha cycle | no dedicated C struct yet | `clock_state.rs` discrete substage logic | canonical discrete clock beat | rename and formalize `tick12` as first-class, not an incidental field | concept present, naming inconsistent |
| `#1-5` and trigram spinor basis | 8-spinor / trigram bridge | `M3_TRIGRAM_LUT[8]` stands in operationally | no dedicated Rust spinor table | quaternion / trigram / I-Ching bridge | explicit `TrigramSpinorTable[8]` generated from dataset or appended canonical table | not yet explicit as M1 surface |
| N-formula nodes around `#1-3-*` | signed phase law and 7n/9n transitions | no named C structs | none | governs M1 interpretation and walk semantics | `NFormulaNode` metadata in spec and future codegen | spec-level, not code-level |

### M2 / `#2-*` Parashakti

| Dataset coordinate(s) | Mathematical role | Current C surface | Current Rust surface | Role in Nara / clock | Proposed canonical surface | Read |
|---|---|---|---|---|---|---|
| `#2-3-*` | decan body / temporal / light-shadow system | `M2_DECAN_DESC[72]` | `ZODIAC_DECAN_TABLE[36]` in `medicine.rs` | medicine, body zones, degree interpretation | `DecanPrimary[36]` + `DecanFace[72]` or `DecanVariant[108]` | partly represented; Rust still uses 36-primary view |
| `#2-5` | planetary harmonic integration | `Planet_Id`, `Planet_Operator`, `M2_PLANET_LUT[10]` | kairos and medicine planet IDs, still mixed/legacy | live planetary state, decan rulers, hour logic | `PlanetState[10]` + explicit dataset ordering metadata | C partial, Rust partial |
| `#2-5-0/1-0..7` | Earth-body + 7 chakras | `Chakra_Id`, `Chakra_Descriptor` | `CHAKRA_BODY_ZONES[8]`, `PLANET_CHAKRA` | body map, grounding, medicine routing | `EarthBodyState` + `ChakraState[7]` carried together | conceptually strong, struct split still missing |
| `#2-5-8/9/10` target outer planets | expanded planetary canon | missing Uranus in current C enum, Neptune/Pluto present | `KairosState` still `[PlanetState; 9]` | full canonical planetary field | canonical 10-planet operator space plus separate EarthBody center | unresolved migration |

### M3 / `#3-*` Mahamaya

| Dataset coordinate(s) | Mathematical role | Current C surface | Current Rust surface | Role in Nara / clock | Proposed canonical surface | Read |
|---|---|---|---|---|---|---|
| `#3-2-*` nucleotide / codon space | 2-bit nucleotide logic and 6-bit codon address | `NUCLEOTIDE_ICHING_VALUE`, `encode_codon`, `M3_PAIR_MATRIX` | implicit only; Rust does not yet share one exported codon core | codon, hexagram, tarot computation | `M3CoreAddressing` shared between C and Rust | C strong, Rust thin |
| `#3-3-*` generation events | codon type, positive/negative codons, charge tuples, matrix paths | scattered across `M3_CODON_TO_AA`, `m3_compute_charges`, `M3_ROTATIONAL_PROFILE` | `oracle.rs` I-Ching casting and tarot tables do not yet consume a unified generation LUT | oracle arithmetic, amino acid bridge, start/stop governance | `GenerationEventLutEntry[184]` plus `CodonLutEntry[64]` with coordinate, charge tuple, codon type, state count, tarot linkage | biggest missing runtime unifier |
| `#3-1` / `#3-1-0-{0..63}` | hexagram wheel and 64-space | `M3_HEXAGRAM_LUT[64]`, `M3_COMP_MATRIX`, `M3_MOVE_MATRIX`, `M3_RES_MATRIX` | `hexagram_to_torus_pos()`, `HEXAGRAM_BODY_DYNAMICS[64]` | oracle and body bridge | `ClockDegreeLut[360]` and `HexagramClockLut[64]` driven from dataset relations | C strong, Rust partial |
| `#3-4` tarot system | major/minor arcana and pip/court correspondences | `M3_MAJOR_ARCANA`, `M3_TAROT_CODON_MAP[4][16]` | `PIP_DECAN_MAP`, court/decan helpers | tarot-oracle bridge | one canonical tarot bridge table emitted to both languages | split implementation |
| raw rotational protocol | 8 generated states with degeneracy handling | `M3_ROTATIONAL_PROFILE[64]` holds state-count metadata | no explicit rotational state table | state selection, interpretation weighting | `RotationalStateLut[64][8]` plus degeneracy semantics | partially encoded only |
| `#3-5` / anchored degree relations | 360 clock anchor surface | no complete exported `CLOCK_DEGREE_LUT` | no live shared LUT yet | degree-to-codon/hexagram/tarot routing | generated `CLOCK_DEGREE_LUT[360]` as core runtime artifact | still missing |

### M4 / `#4-*` Nara

| Dataset coordinate(s) | Mathematical role | Current C surface | Current Rust surface | Role in Nara / clock | Proposed canonical surface | Read |
|---|---|---|---|---|---|---|
| `#4.0` | identity matrix and quintessence synthesis | `M4_Identity_Matrix`, `M4_Astrological_Layer`, `m4_identity_hash_compute()` | `NaraIdentityMatrix`, layer metadata in `identity.rs` | subject identity, portal entry, base quaternion | `M4_Quintessence_Identity` / `QuintessenceIdentity` with explicit canonical hash level and profile quaternions | prior specs are rich; runtime/tabulation still shallow |
| `#4.1` | sympathetic medicine | only implicit via M2 surfaces | `medicine.rs` is the main live bridge | body/element/herb prescriptions | `MedicinePayload` tied to oracle payload and decan/body coordinate | Rust strong locally, not yet cross-layer |
| `#4.2` | oracle/divination and canonical tag emission | `M4_IChing_Cast`, `M4_Tarot_Draw`, `M4_Canonical_Tag`, `M4_Oracle_Draw` | `IChingResult`, `PIP_DECAN_MAP`, `OracleFaces` in `clock_state.rs` | cast, faces, tags, payload, downstream medicine | `OraclePayload` with machine + human layers and coordinate backrefs | current transport incomplete |
| `#4.3` | mediating transformation | C not inspected here | Rust transform module exists but not part of this parity pass | operation recipes, cycle state | future explicit transform payload bridge | dataset richer than current runtime bridge |
| `#4.4` and especially `#4.4.4.4` | context/lenses and personal/world node shell | none explicit | `PortalClockState.active_branch_lens` only partial | contextual interpretation and modulation | `ContextQuaternionInput` + `ContextualWeightField` keyed by canonical subject hash | architectural detail is already present in prior M4 specs; extraction into a single bridge contract is the missing step |
| `#4.5` | logos / integration | no explicit C bridge | `logos_stage` field only partial | integration, synthesis, write-back | `LogosState` and `LogosPayload` keyed to upstream oracle and transform state | dataset and specs are ahead of runtime transport/wiring |

---

## Current LUT And Data-Structure Parity Table

This section focuses specifically on concrete implementation surfaces.

### C surfaces already present

| C surface | What it currently carries | Dataset branch it should answer to | Current parity read | Required canonical move |
|---|---|---|---|---|
| `VIMARSA_TABLE[7]` | 3-bit operator ISA and 4-step reductions | `#0-0` | real M0 operator ground | add explicit coordinate provenance and downstream consumer notes |
| `Spanda_Discriminator` | fused 7-bit operator mask + 1 Spanda bit | `#0-1` | real atomic M0 state carrier | bind explicitly to dataset bit semantics and M1/M4 consumers |
| `VIRTUE_LUT[9]` and `void_ops_t` | 8-fold void arithmetic + 9 virtue cascade | `#0-2` | real M0 wholeness arithmetic surface | annotate exact coordinate family and R-factor consequences |
| `ARCHETYPE_LUT[12]` | archetypal number language and compiled formulations | `#0-3` | major M0 grammar surface | tie each sub-table assignment and coordinate family into final parity tables |
| `MIRROR_CHILDREN[2]`, `ZODIACAL_LUT[12]`, `MONOPOLY_LUT[7]`, `DIVINE_ACT_LUT[7]` | mirror, zodiacal, monopoly, divine-act subgrammars | `#0-3-*` | strong but under-tabulated | make them first-class rows in the verification run |
| `QL_STACK[5]`, `NARA_MSHARP_LUT[5]` | QL meta-logic stack and Nara bridge | `#0-4` | critical but currently hidden in plain sight | bind them directly to M1-M4 frame semantics |
| `SIVA_TABLE[6]`, `SHAKTI_TABLE[6]`, `R_FACTOR_ROUTE_TABLE[7]`, `M0_CROSS_BRANCH_REGISTRY[7]`, `M0_CORE_RELATIONS[65]` | route weaving, duality, cross-branch skeleton | `#0-5` and mixed `#0→#N` | strong C ground for cross-system parity | surface as canonical bridge registry, not just implementation detail |
| `Unified_Clock_State`, `m0_read_cosmic_clock()`, `Unified_Logos_State`, `m0_compute_logos_state()` | shared O(1) clock and logos carriers | mixed `#0→#1/#2/#3/#4` | crucial compiled bridge | explicitly make them part of the top-level implementation contract |
| `M2_DECAN_DESC[72]` | 72 decan faces with ruler and meaning ID | `#2-3` | good structural start | add explicit coordinate provenance and align with 108-node light/shadow/full view |
| `M2_PLANET_LUT[10]` | 10-body operator table | `#2-5` | spec-canonical direction is now clear even if the current dataset still lags | separate `EarthBodyState` from 10 tracked planetary operators while preserving semantic link |
| `NUCLEOTIDE_ICHING_VALUE[4]` | root arithmetic `6/9/7/8` | `#3-2` and M3 numeric law | strong | retain as canonical root arithmetic |
| `M3_PAIR_MATRIX[16]` | 16 dinucleotide sum/difference values | `#3-2` / `#3-3` relation space | strong operational LUT | add coordinate provenance and explicit matrix naming |
| `M3_TRIGRAM_LUT[8]` | trigrams with degree anchors | `#1` and `#3` bridge | operationally useful, semantically split | link explicitly to M1 spinor basis |
| `M3_HEXAGRAM_LUT[64]` | 64 hexagrams and complements | `#3-1` | strong base LUT | attach dataset coordinate generation path |
| `M3_COMP_MATRIX`, `M3_MOVE_MATRIX`, `M3_RES_MATRIX` | three hexagram transforms | `#3` | useful but still code-local | attach generation-event / relation provenance |
| `M3_CODON_TO_AA[64]` | codon to amino acid map | `#3-3` | useful | explicitly bind to start/stop and arcana coordinates |
| `M3_TAROT_CODON_MAP[4][16]` | suit/court/codon mapping | `#3-4` and `#3-3` | valuable | generate or validate against dataset and one shared canonical map |
| `M3_ROTATIONAL_PROFILE[64]` | 7/8-state metadata per codon | rotational protocol + `#3` codon family | good partial persistence | extend to full raw 8-state generated representation |
| `M4_Identity_Matrix` | optional layers plus `uint64_t` hash | `#4.0` | matches the older 2026-03-06 M4 patch layer, not the newer canonical invariants layer | state explicitly whether `uint64_t` remains the operational form, the preview form, or is replaced by `[u8;32]` as the stored canonical address |
| `M4_Temporal_Now` | degree + 7 planets | `#4.2` / live clock | legacy | migrate to 10-planet + EarthBody-aware temporal struct |

### Rust surfaces already present

| Rust surface | What it currently carries | Dataset branch it should answer to | Current parity read | Required canonical move |
|---|---|---|---|---|
| direct M0 runtime mirror | no dedicated Rust `m0` table/owner surface yet | `#0-*` | missing as first-class ownership, though downstream semantics appear elsewhere | either expose M0 carriers through shared bindings or tabulate exactly which Rust modules inherit which M0 consequences |
| `identity.rs::NaraIdentityMatrix` | optional layers and `u64` hash | `#4.0` | metadata shell only, mirroring older spec-era hash shape | align it to the final canonical hash policy once that is frozen in one place |
| `clock_state.rs::PortalClockState` | session/live quaternion/oracle/kairos/multiplayer hub | `#4.4.4.4` routing hub | strong shape, incomplete feeding | rename and align fields to canonical clock model |
| `clock_state.rs::KairosState` | 9-planet runtime state | `#2-5` + `#4.1/#4.2` | legacy size/order | migrate to 10-planet + EarthBody center |
| `medicine.rs::ZodiacDecanEntry` | 36-entry M0-M1-M2 bridge struct | `#2-3` | strong live bridge | extend to light/shadow and direct coordinate metadata |
| `medicine.rs::CHAKRA_BODY_ZONES` | 8-site body mapping | `#2-5-0/1-*` | good | keep, but bind to EarthBody semantics explicitly |
| `oracle.rs::PIP_DECAN_MAP` | Golden Dawn pip to decan map | `#3-4` expressed through `#2-3` | useful but local | unify with canonical tarot bridge table |
| `oracle.rs::HEXAGRAM_BODY_DYNAMICS[64]` | body dynamics map | `#3` to `#4.1` bridge | good data, orphaned consumer path | feed into oracle payload and medicine |
| `oracle.rs::IChingResult` | coin cast outcome | `#4.2` | real computation | replace `torus_pos` shortcut with canonical clock coordinate payload |
| `gate/nara.rs` | RPC shell for Nara | `#4.*` transport | structurally ready, payload stubs remain | make payload contract first-class and non-stubbed |

---

## Current/Proposed Canonical Struct Set

These are the concrete future-facing structures this pass suggests freezing into the specs.

They are not code edits yet. They are the target contract that C and Rust should converge toward.

### 1. Canonical binary frame address

```c
typedef struct {
    uint8_t  binary_address6;      // stable 0..63 address
    uint8_t  outer_regime;         // 2, 3, or 4
    uint8_t  inner_regime;         // 2, 3, or 4
    uint8_t  left_frame_value;     // outer-left position
    uint8_t  right_frame_value;    // outer-right position
    uint16_t exact_degree_720;     // exact continuous position
    uint8_t  phase;                // explicate / implicate
    uint8_t  tick12;               // canonical M1 beat
    uint8_t  cf_substage6;         // derived sixfold contextual stage
} M_Binary_Frame_Address;
```

```rust
pub struct BinaryFrameAddress {
    pub binary_address6: u8,
    pub outer_regime: u8,
    pub inner_regime: u8,
    pub left_frame_value: u8,
    pub right_frame_value: u8,
    pub exact_degree_720: u16,
    pub phase: u8,
    pub tick12: u8,
    pub cf_substage6: u8,
}
```

This structure is the best way to prevent future confusion between raw binary address, mixed modular regime, exact orientation, and tick state.

### 2. Canonical generation-event LUT entry

```c
typedef struct {
    uint16_t coord_id;             // or generated coordinate index
    uint8_t  hexagram_id;          // 0..63
    uint8_t  positive_codon;       // 6-bit address
    uint8_t  negative_codon;       // 6-bit address
    int8_t   charge_nn;
    int8_t   charge_pp;
    int8_t   charge_np;
    int8_t   charge_pn;
    uint8_t  codon_type;           // dual / nondual / palindromic / etc
    uint8_t  state_count;          // 7 or 8
    uint8_t  start_stop_flag;      // none / start / stop
} M3_Generation_Lut_Entry;
```

```rust
pub struct GenerationLutEntry {
    pub coordinate: String,
    pub hexagram_id: u8,
    pub positive_codon: u8,
    pub negative_codon: u8,
    pub charge_nn: i8,
    pub charge_pp: i8,
    pub charge_np: i8,
    pub charge_pn: i8,
    pub codon_type: u8,
    pub state_count: u8,
    pub start_stop_flag: u8,
}
```

This is the missing unifier between generation events, amino acids, tarot bridge, charge evaluation, and oracle payload.

### 3. Canonical quintessence identity

```c
typedef struct {
    uint8_t  layer_presence;
    uint8_t  quintessence_hash[32];
    uint8_t  natal_hash[32];
    uint16_t planet_degrees[10];
    float    profile_quaternions[5][4];   // natal, gene keys, HD, jungian, QL birth
    float    quintessence_quaternion[4];
} M4_Quintessence_Identity;
```

```rust
pub struct QuintessenceIdentity {
    pub layer_presence: u8,
    pub quintessence_hash: [u8; 32],
    pub natal_hash: [u8; 32],
    pub planet_degrees: [u16; 10],
    pub profile_quaternions: [[f32; 4]; 5],
    pub quintessence_quaternion: [f32; 4],
}
```

This is the correct bridge object for:

- subject identity
- position-0 quaternionic encoding
- clock orientation grounding
- later contextual augmentation

### 4. Canonical contextual quaternion envelope

```c
typedef struct {
    uint8_t subject_hash[32];
    float   base_quaternion[4];
    float   environment_quaternion[4];
    float   weighted_quaternion[4];
    uint8_t active_lens;
    uint8_t tick12;
    uint8_t rotational_state;
} M4_Contextual_Quaternion_Envelope;
```

```rust
pub struct ContextualQuaternionEnvelope {
    pub subject_hash: [u8; 32],
    pub base_quaternion: [f32; 4],
    pub environment_quaternion: [f32; 4],
    pub weighted_quaternion: [f32; 4],
    pub active_lens: u8,
    pub tick12: u8,
    pub rotational_state: u8,
}
```

This is how phenomenology, journal state, and environmental conditions should augment readings without replacing identity.

### 5. Canonical Earth-body aware kairos state

```c
typedef struct {
    uint8_t chakra_id;             // CHAKRA_EARTH = 0
    float   grounding_level;
    float   center_vector[3];
} EarthBodyState;

typedef struct {
    PlanetState   planets[10];     // Sun through Pluto
    EarthBodyState earth_body;     // center-anchor, solar child, chakra base
    uint8_t       current_hour;
    uint8_t       hour_planet;
    uint64_t      timestamp;
} M4_Kairos_State_Canonical;
```

```rust
pub struct EarthBodyState {
    pub chakra_id: u8,
    pub grounding_level: f32,
    pub center_vector: [f32; 3],
}

pub struct KairosStateCanonical {
    pub planets: [PlanetState; 10],
    pub earth_body: EarthBodyState,
    pub current_hour: u8,
    pub hour_planet: u8,
    pub timestamp: u64,
}
```

### 6. Canonical oracle payload

```c
typedef struct {
    uint8_t  subject_hash[32];
    M_Binary_Frame_Address clock_coord;
    uint8_t  primary_hex;
    uint8_t  temporal_hex;
    uint8_t  changing_lines_mask;
    float    live_quaternion[4];
    uint8_t  medicine_decan;
    uint8_t  chakra_id;
    uint16_t tag_id;
} M4_Oracle_Payload;
```

```rust
pub struct OraclePayload {
    pub subject_hash: [u8; 32],
    pub clock_coord: BinaryFrameAddress,
    pub primary_hex: u8,
    pub temporal_hex: u8,
    pub changing_lines_mask: u8,
    pub live_quaternion: [f32; 4],
    pub medicine_decan: u8,
    pub chakra_id: u8,
    pub tag_id: u16,
    pub human_summary: String,
}
```

This is the key missing transport object between oracle, clock, medicine, transformation, and gateway.

---

## Concrete Findings That Need To Propagate Into Specs

### 1. The charge tuples are already dataset-backed

This is no longer speculative.

The raw Mahamaya dataset already stores:

- `integral_pp`
- `integral_nn`
- `integral_np`
- `integral_pn`
- `inner_charge_pp`
- `inner_charge_nn`
- `inner_charge_np`
- `inner_charge_pn`

That means the canonical rule should be:

- runtime may recompute these for validation
- runtime should not pretend they are conceptually born only from live arithmetic
- canonical LUTs should be generated from or validated against stored dataset values

### 2. Rotational states need more precise wording

The current bridge wording should be refined to:

- 8 raw generated rotational states per codon are part of the protocol
- some codons exhibit degeneracy / non-dual collapse, producing 7 phenomenologically distinct states
- therefore the right canon is "8-state raw generation; 7-or-8 distinct post-degeneracy"

### 3. `surface_generation_events.py` is a tooling nuisance, not a conceptual blocker

The bridge plan instructs use of `docs/scripts/lookups/surface_generation_events.py`, but the current script resolves paths incorrectly and fails from repo root by looking for:

- `docs/docs/datasets/mahamaya-deep/nodes-full-detail.json`

This means:

- the script is not presently usable as a convenience extractor from repo root
- but the underlying Mahamaya dataset remains fully accessible and was inspected directly
- fixing the script is useful housekeeping, not a blocker on canonicalization

### 4. The element/nucleotide/quaternion story needs one explicit translation note, not a new ontology

What is currently present is a representation ladder:

- `m3.h` / `m4.h` elemental throughline says:
  - `A = Water`
  - `T = Fire`
  - `C = Earth`
  - `G = Air`
- `clock_state.rs` comments on live quaternion mapping say:
  - `pp = T = Earth = w`
  - `nn = A = Fire = x`
  - `np = G = Water = y`
  - `pn = C = Air = z`
- `04-cross-layer-addressibility.md` reflects the second pattern, not the first

This should not be described as a contradiction until the translation is written down.

The cleaner formulation is:

1. nucleotide family mapping:
   - `A ↔ Water`
   - `T ↔ Fire`
   - `C ↔ Earth`
   - `G ↔ Air`
2. oracle charge / quaternion mapping:
   - `(pp, nn, np, pn)` are evaluation outputs
   - quaternion components then remap the elemental weights into `[w, x, y, z]`
3. if dual-quaternion or 0/5 + 1-4 framing is the intended higher-order explanatory model, that should be named as the umbrella representation rule rather than left implicit in comments

So the actual gap is explanatory/tabular clarity, not evidence of two incompatible ontologies.

### 5. The hash question is a legacy-vs-current-spec layering issue, not a mystery

Current state:

- `M4_Identity_Matrix.quintessence_hash` is `uint64_t`
- `NaraIdentityMatrix.quintessence_hash` is `u64`
- the older `M4-nara-personal-interface.md` patch explicitly specifies `blake3_hasher_finalize(8 bytes) -> uint64_t quintessence_hash`
- the newer `00-canonical-invariants.md` specifies `quintessence_hash: [u8; 32]` as the archetypal address
- Rust minimum-viable identity still says layer 0 numerology is enough
- live profile storage is metadata-oriented, not canonical identity-oriented

So the real task is to freeze one clear stratification:

- which hash width is the canonical stored identity address
- which hash form is merely preview / routing / legacy-operational convenience
- natal minimum viability versus additive enrichment
- quaternion as derived from the profile stack

### 6. Planet handling is mainly a dataset-repopulation lag plus a few runtime legacy surfaces

Current state:

- `m2.h` has 10 bodies but no Uranus
- Rust `KairosState` still uses `[PlanetState; 9]`
- `M4_Temporal_Now` still carries 7 planets
- current dataset bridge docs rightly note outer planets as target additions
- the canonical spec direction is already much clearer than the old dataset snapshot

So this should be read as:

- not a present blocker on the emerging spec canon
- but still a runtime conformance task for C/Rust surfaces that retain 7- or 9-body legacy assumptions

### 7. The gateway contract still hides M4 richness even though the prior specs already define most of it

`gate/nara.rs` is structured well enough, but key M4 methods are still stubs:

- `nara.identity.compute`
- `nara.identity.layer.set`
- `nara.oracle.payload`
- `nara.oracle.payload.apply`

Given the richness of the raw `#4.*` dataset and the prior M4/clock specs, this is now one of the clearest next spec-to-runtime gaps.

### 8. `04-cross-layer-addressibility.md` is useful but incomplete

It already contributes a serious coordinate table, but it still needs:

- an explicit M4/Nara findings companion
- a current/proposed C/Rust struct table
- clear treatment of mixed modular arithmetic
- explicit separation between dataset-grounded truths and still-proposed node reifications
- explicit extraction of the existing M4 bridge details already present in prior Nara/clock specs

---

## Proposed Validation Criteria For The Canonical Spec Set

Before implementation begins in earnest, every spec-owned runtime artifact should be checkable against the following contract.

### Required row fields for every LUT or struct

Every canonical runtime object should have a row with:

- `name`
- `dataset coordinate family`
- `raw dataset property path`
- `mathematical relation`
- `current C owner`
- `current Rust owner`
- `generation script or source doc`
- `downstream consumers`
- `status`
- `tests required`

### Required metadata for every generated LUT

Every generated LUT should record:

- source dataset path
- coordinate family
- generation script
- checksum or version stamp
- consumer modules

This is the only sane way to make future drift visible.

### Required metadata for every live payload

Every live payload crossing modules should carry:

- subject identity reference
- clock coordinate
- source coordinate or coordinate family
- machine-readable fields
- human-readable companion fields

### Required cross-layer tests before implementation is called coherent

At minimum:

1. `identity -> quaternion`
2. `quaternion -> clock coordinate`
3. `clock coordinate -> oracle faces`
4. `oracle payload -> medicine routing`
5. `dataset row -> generated LUT row -> runtime struct`

### Depwire-facing spec discipline

To make Depwire useful later, specs should name:

- the code module expected to own a symbol
- the function expected to derive it
- the payload expected to consume it

The closer the specs get to explicit symbol ownership, the more likely Depwire will later be able to validate the real chain automatically.

---

## Immediate Document-Level Follow-Ups

This pass suggests the following doc work before code work:

1. Add `05-nara-findings.md` under `dataset-bridge/`
2. Update `03-mahamaya-findings.md` to correct the claim that charge tuples are not stored
3. Update `00-master-coordination.md` wording on rotational states to distinguish raw 8-state generation from 7/8 distinctness
4. Extend `04-cross-layer-addressibility.md` with:
   - current/proposed C/Rust parity columns
   - explicit M4 bridge rows
   - mixed modular frame rows
5. Write one explicit representation note linking:
   - nucleotide family mapping
   - oracle charge tuple mapping
   - quaternion component remapping
   - dual / 0-5 + 1-4 framing if that is the intended umbrella explanation
6. Extract the already-existing M4 bridge detail from the prior Nara/clock specs into one dataset-bridge companion
7. Write the canonical `10-binary-evaluation-thread.md` promised by the harmonization plan, or renumber the validation matrix so the binary thread has its own dedicated spec
8. Optionally fix `surface_generation_events.py` as tooling cleanup, but do not treat it as a blocker

---

## Bottom Line

The strong read from this pass is:

- the system now has enough mathematical, dataset, and runtime material to become genuinely computationally coherent
- the dataset already grounds much more than the current runtime expresses
- the biggest remaining risk is not lack of theory, but drift between:
  - dataset truth
  - spec truth
  - current C/Rust truth

The right next step is not more free-floating theory.

The right next step is:

- freeze the mixed-modular arithmetic clearly
- freeze the canonical M4 bridge objects clearly
- make the coordinate-to-LUT-to-struct contract explicit
- then implement against that contract with generated or validated tables

That is the path to a real holographic executable rather than another beautiful but partially disconnected layer of prose.

---

## Canonical Precedence Rule

When specs disagree, the task is not to ask abstractly whether "this" or "that" wins. The task is to determine **what is correct for a full working implementation with complete mathematical, dataset, and runtime coverage**.

For this consolidation pass, use the following precedence order:

1. **Dataset-grounded coordinates and stored properties**
   - If a node/property/relation already exists in the dataset, that is the ground truth of addressibility.
2. **Newer integrated canonical planning docs**
   - especially:
     - `00-canonical-invariants.md`
     - `00-spec-harmonization-plan.md`
     - `09-cosmic-clock-plugin-tui-spec.md`
     - `2026-03-10-nara-runtime-full-plan.md`
     - `2026-03-12-cosmic-clock-full-architecture.md`
   - these should be preferred when they already resolve older contradictions into a more integrated runtime-facing model
3. **Older subsystem patches and historical spec fragments**
   - useful when they contain details not yet propagated forward
   - not authoritative when they conflict with newer integrated canon
4. **Current C/Rust implementation**
   - implementation proves what exists
   - implementation does not override the more complete canonical model when it is still carrying legacy constraints

This means:

- older specs are not to be treated as equal peers if newer integrated docs already supersede them
- current implementation is evidence of present state, not necessarily of final truth
- the correct answer is the one that yields full implementation coverage of the actual system requirements

---

## What This File Is For Now

This file should now be used as the **working launch pad** for the verification and tabulation process.

Its function is:

- to state the canonical precedence rule
- to summarize the computational findings already established
- to name the runtime/data-structure surfaces that must be verified
- to define the tabulation schema
- to direct the consolidation back into the existing core planning docs rather than proliferating new ones

It should not be treated as a side file to be forgotten. It should be treated as the first-pass coordination artifact for producing:

- one trustworthy spec/planning surface for development
- one trustworthy implementation contract for C/Rust/LUT generation

---

## Single-Plan Consolidation Rule

Do **not** continue by endlessly spinning out new planning files unless absolutely necessary.

The target is:

- **one trustworthy development plan**
- backed by
  - the canonical invariants
  - the harmonization plan
  - the dataset-bridge master coordination
  - the cross-layer addressibility table

So the next phase should mainly:

1. update existing core docs
2. absorb validated findings into those docs
3. converge on one development-ready plan
4. only create a new file if a genuinely distinct canonical artifact is required

The current likely consolidation targets are:

- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-canonical-invariants.md`
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/00-spec-harmonization-plan.md`
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/dataset-bridge/00-master-coordination.md`
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/dataset-bridge/04-cross-layer-addressibility.md`

This file should drive updates into those, not replace them.

---

## Verification And Tabulation Process

The next execution pass should be run as a strict verification-and-tabulation task, not as loose analysis.

### Step 0. Census the datasets before touching runtime conclusions

For each branch `#0` through `#4`, record:

- node families that actually exist
- notable dot/hyphen coordinate patterns
- stored property classes
- relation types
- branch-local special files or auxiliary tables
- whether a datum is:
  - directly represented in runtime
  - only indirectly derivable
  - intentionally omitted from runtime
  - not yet incorporated

This step exists to prevent the runtime/spec surface from silently shrinking the datasets before parity work even begins.

### Step 1. Tabulate every current runtime surface that matters

For each relevant C struct, Rust struct, LUT, and gateway payload surface, record:

- name
- file path
- fields
- current semantics
- coordinate family it claims to represent
- whether the coordinate is explicit or only implied
- whether the mathematical relation is explicit or only implied

### Step 2. Tabulate every required canonical surface

For each required system object, record:

- canonical name
- owning branch
- coordinate family
- exact mathematical role
- exact runtime role
- whether it already exists in C
- whether it already exists in Rust
- whether it should be generated from dataset, hand-maintained, or derived at runtime

### Step 3. Tabulate dataset richness that is not yet carried forward

For each branch `#0` through `#4`, explicitly capture:

- node families present in dataset but absent from current specs
- node families present in specs but not yet grounded in dataset
- property clusters present in dataset but not expressed in current C/Rust surfaces
- relation types present in dataset but not expressed in current C/Rust surfaces
- relation types intentionally excluded from runtime because they are semantic or editorial rather than computational

No omission should remain unclassified.

### Step 4. Bind current to canonical

For every current runtime surface, answer:

- what canonical object does it correspond to?
- is it complete?
- is it legacy?
- is it merely a preview/compat form?
- what exact data or derivation is missing?

### Step 5. Audit relation types and property classes explicitly

For each dataset branch `#0` through `#4`, answer:

- which relation types are computationally operative?
- which relation types are semantic-interpretive and should remain dataset/spec level?
- which relation types should generate or validate LUTs?
- which relation types should feed runtime payloads?
- which relation types are currently unrepresented but must be incorporated for full implementation?

The same pass should be applied to property classes:

- scalar runtime fields
- dense LUT columns
- graph-only semantic descriptors
- generated validation-only metadata

### Step 6. Write the binding into the core planning docs

The goal is not to leave the answers in this file forever. The goal is to push the verified answers back into:

- canonical invariants
- harmonization plan
- dataset bridge master coordination
- cross-layer addressibility

### Step 7. End with one implementation-ready plan

That plan should tell implementation exactly:

- which structs to keep
- which structs to replace
- which LUTs to generate
- which tables to validate against datasets
- which runtime bridges to wire first
- which dataset structures stay graph-only by design
- which dataset structures are delayed only because the current runtime has not yet caught up

---

## Required Tabulation Schema

The verification run should produce or populate tables with the following columns.

### A. Runtime surface table

| Column | Meaning |
|---|---|
| `surface_name` | C struct, Rust struct, LUT, or payload name |
| `language` | C / Rust / shared / generated |
| `file` | owning file |
| `fields_or_shape` | core fields or table dimensions |
| `claimed_coordinate_family` | `#0`, `#1`, `#2`, `#3`, `#4`, or mixed |
| `actual_coordinate_binding` | exact dataset coordinate family or note that it is still implicit |
| `math_relation` | how the object is derived or what law it embodies |
| `nara_clock_role` | what part of the Nara/clock system it serves |
| `status` | canonical / current-good / legacy / partial / stub |
| `canonical_target` | what it should map to in the final plan |

### B. Canonical object table

| Column | Meaning |
|---|---|
| `canonical_object` | target object name |
| `branch` | M0 / M1 / M2 / M3 / M4 |
| `coordinate_family` | exact dataset family |
| `raw_inputs` | upstream data |
| `derivation` | mathematical operation |
| `outputs` | fields or payload |
| `consumers` | downstream systems |
| `current_c_surface` | matching or nearest C owner |
| `current_rust_surface` | matching or nearest Rust owner |
| `gap` | what prevents full parity today |

### C. Dataset-to-LUT table

| Column | Meaning |
|---|---|
| `dataset_coordinate_or_family` | source node family |
| `source_property_or_relation` | exact data used |
| `target_lut_or_struct` | emitted runtime artifact |
| `generation_mode` | generated / validated / hand-authored |
| `owner_module` | where it belongs |
| `verification_rule` | how to prove parity |

### D. Dataset representation audit table

| Column | Meaning |
|---|---|
| `branch` | `#0` / `#1` / `#2` / `#3` / `#4` |
| `dataset_family` | exact coordinate or family |
| `node_or_relation_kind` | node family / property class / relation type / auxiliary file |
| `computational_role` | what mathematical or runtime work it can do |
| `spec_representation` | where it is currently represented in specs |
| `c_representation` | C owner or `none` |
| `rust_representation` | Rust owner or `none` |
| `omission_mode` | represented / derived-only / intentional-graph-only / missing / stale-legacy |
| `why` | reason for the current state |
| `required_action` | keep / incorporate / validate / deprecate / explicitly mark graph-only |

### E. Relation-type audit table

| Column | Meaning |
|---|---|
| `branch` | dataset branch |
| `relation_type` | exact dataset relation label |
| `source_family` | source coordinate family |
| `target_family` | target coordinate family |
| `runtime_use` | LUT / struct field / payload / validation-only / graph-only |
| `mathematical_meaning` | law or mapping it expresses |
| `current_status` | represented / implicit / absent / intentionally excluded |
| `audit_note` | why it matters and what to do with it |

---

## Minimum Verification Coverage

A valid verification run must at least cover the following groups in full.

### Group 0. M0 foundational runtime substrate

- Vimarsa operator ISA
- concrescence trace model
- Spanda discriminator
- void arithmetic / wholeness constant
- virtue cascade
- archetypal number language
- zodiacal / monopoly / divine-act subgrammars
- QL stack
- Nara M-sharp bridge
- Siva/Shakti tables
- route registries and cross-branch relation carriers
- `Unified_Clock_State`
- `Unified_Logos_State`

### Group 1. M1 binary / clock substrate

- six-position frame surfaces
- mixed modular regime
- exact degree
- phase / implicate-explicate handling
- `tick12`
- `cf_substage6`

### Group 2. M2 planetary / chakra / decan substrate

- planetary operators
- EarthBody
- chakra sites
- decan primary/light/shadow structures
- decan-to-body / herb / chakra relations

### Group 3. M3 codon / hexagram / tarot substrate

- nucleotide values
- pair matrices
- codon address rules
- generation events
- charge tuples
- rotational states
- amino acid bridge
- tarot mappings
- degree anchors

### Group 4. M4 Nara bridge substrate

- identity and quintessence
- contextual and phenomenological modulation
- oracle payload and canonical tags
- medicine payload
- transform stage carrier
- logos stage carrier
- `#4.4.4.4` routing and integration surfaces

### Group 5. Gateway / transport / shared state

- `PortalClockState`
- gateway payload surfaces
- Kairos transport
- session / Khora ownership boundaries

### Group 6. M0-to-M4 inheritance chain

- which M0 tables are directly owned in C
- which M0 consequences are mirrored or re-expressed in Rust
- where the coordinate provenance is explicit
- where the mathematical inheritance is only implicit and must be tabulated

### Group 7. Dataset under-representation and omission audit

- node families present in datasets but missing from runtime surfaces
- property classes present in datasets but missing from runtime surfaces
- relation types present in datasets but missing from runtime surfaces
- structures intentionally kept graph-only
- structures accidentally omitted
- structures represented only in prose but not yet in code-facing data architecture

---

## Canonical Resolution Heuristics

When confronted with a mismatch, resolve it using these heuristics:

1. Prefer the model that preserves **full dataset addressibility**.
2. Prefer the model that preserves **full mathematical derivability**.
3. Prefer the model that preserves **runtime implementability without lossy shortcuts**.
4. Prefer the model already adopted by the **newer integrated planning docs**.
5. Keep older forms only when they can be explicitly demoted to:
   - legacy compat
   - preview form
   - transport compression
   - display shorthand

This means examples like:

- an older `uint64_t` hash may survive as preview/compat, but should not silently outrank a newer `[u8;32]` canonical address if the latter is the integrated runtime-facing model
- an older 7-planet or 9-planet implementation surface may survive temporarily, but should not define the final canonical development target when the newer integrated docs already set the fuller field

---

## Omission Classification Rules

When a dataset aspect is not represented in runtime, it must be classified into exactly one of the following buckets:

1. `represented`
   - directly present in C, Rust, or generated LUT surfaces
2. `derived-only`
   - not stored directly, but derivable from already represented data with a named law
3. `intentional-graph-only`
   - retained in datasets/specs for semantic, editorial, or ontological richness, not needed as direct runtime carrier
4. `missing`
   - required for full implementation but not yet represented
5. `stale-legacy`
   - represented in runtime/specs in an older form that should be replaced or demoted

This is essential because the audit must surface what is absent without treating every absence as a bug.

---

## Audit Outputs Required From The Full Verification Run

The full verification run should leave behind answers concrete enough to drive implementation without another speculative pass.

Minimum outputs:

1. A completed runtime surface table for all material `#0` through `#4` carriers.
2. A completed canonical object table for all required Nara/clock objects.
3. A completed dataset-to-LUT table for all generated or validated runtime tables.
4. A completed dataset representation audit table recording all unrepresented or indirectly represented dataset richness.
5. A completed relation-type audit table explaining which relation types become runtime carriers, validation rules, payload enrichments, or remain graph-only.
6. A prioritized list of current C/Rust structures to keep, replace, extend, or generate.
7. A list of dataset aspects requiring explicit human audit because they may be intentionally non-runtime or semantically over-rich for first implementation.

The important point is that the process must surface both:

- what the runtime/specs already express correctly
- what the datasets contain that has not yet been deliberately accounted for

---

## Immediate Next Use Of This File

When the machine comes back up and the real task is run, this file should be used in exactly this way:

1. open this file first
2. use the precedence rule here
3. census dataset richness for `#0` through `#4`, including relation types and auxiliary files
4. verify and tabulate current C/Rust/LUT surfaces against datasets and newer integrated specs
5. classify every omission as represented / derived-only / intentional-graph-only / missing / stale-legacy
6. update the existing core planning docs
7. converge on one trustworthy development-ready plan

That is the actual purpose of this artifact now.
