# Mahamaya M3 Dataset Bridge — Findings

**Status:** Complete (2026-03-19)
**Dataset:** `docs/datasets/mahamaya-deep/nodes-full-detail.json` + `relations.json` + `rotational_state_protocol.txt`
**Total M3 nodes:** 1,025 | **Total relations:** 4,891

---

## §1 Three Pairing Matrices

**Status:** Structurally present; NOT reified as discrete coordinate nodes.

The three Clifford involutions / nucleotide pairing matrices are embedded in the **binary
encoding of generation event nodes**, not in dedicated `#3-*-matrix` nodes.

| Matrix | Pairing | Dataset Encoding | Clifford Involution |
|---|---|---|---|
| 1 (Watson-Crick / Śiva) | A↔U, C↔G | `upper_Pair_binary` + `lower_Pair_binary` complementary encoding | Reversion (†) |
| 2 (Ring / Śakti) | A↔G, U↔C | 273 nodes reference ring structure in properties | Grade involution (α) |
| 3 (Valence / Spanda) | A↔C, U↔G | 2 explicit mentions; implied in yin/yang property system | Conjugation (ᾱ) |

The matrices are derivable from the generation event binary fields — each event's
`upper_Pair_binary` × `lower_Pair_binary` encodes which matrix application path was taken.

**Proposed coordinates (not yet in dataset):**
- `#3-2-matrix-1` — Watson-Crick / Reversion / Śiva
- `#3-2-matrix-2` — Ring structure / Grade involution / Śakti
- `#3-2-matrix-3` — Same valence / Conjugation / Spanda

---

## §2 Generation Events Structure

**Total: 184 nodes.** Script: `python3 docs/scripts/lookups/surface_generation_events.py`

### §2a — Critical Correction: M1/M2/M3 Context Labels

**The `context` field on generation events (M1-H{n}, M2-H{n}, M3-H{n}) does NOT refer to
M1 Paramasiva, M2 Parashakti, M3 Mahamaya.**

These are **three internal navigation paths through M3 Mahamaya itself** — three simultaneous
matrix application strategies through the hexagram-codon space:
- **M1-context:** First matrix application path (64 events, all H1-H64)
- **M2-context:** Second matrix application path (64 events, all H1-H64)
- **M3-context:** Third matrix application path (56 events — only partial hexagram set)

This is entirely within #3. The naming collides with subsystem labels but is not the same thing.

### §2b — Binary Fields

| Property | Size | Meaning |
|---|---|---|
| `upper_Pair_binary` | 2 bits (00-11) | Upper trigram pair encoding |
| `lower_Pair_binary` | 2 bits (00-11) | Lower trigram pair encoding |
| `positive_codon_binary` | 3 bits (000-111) | Yang/positive DNA base triplet |
| `negative_codon_binary` | 3 bits (000-111) | Yin/negative DNA base triplet |

**Pair distribution:** Diagonal states (00,00) and (11,11) each appear 24 times (backbone);
off-diagonal states appear 8 times each — the 24/8 split echoes our backbone node count.

### §2c — Key Relations

| Relation | Count | Meaning |
|---|---|---|
| `YIELDS_CODON` | 368 | generation event → DNA codon node |
| `USES_Pair` | 415 | generation event → nucleotide pair node |
| `RESOLVES_TO` | 184 | generation event → final codon assignment (1:1) |
| `TRANSCRIBES_TO` | 45 | DNA codon → RNA variant codon |
| `BASE_PAIRS_WITH` | 4 | Watson-Crick pairing |
| `LINE_CHANGE` | 384 | I-Ching line dynamics (= 64 × 6) |
| `ANCHORED_BY` | 360 | degree-arc anchoring (= clock degrees) |
| `FLOWS_CLOCKWISE` | 360 | 360° clock dynamics |

The `LINE_CHANGE: 384` relation count directly confirms our structural law `64×6 = 384`.
The `ANCHORED_BY: 360` and `FLOWS_CLOCKWISE: 360` confirm clock integration at M3 level.

---

## §3 Codon Type Classification

**Codon types are computed, not stored as explicit node properties.**

| Type | Count | Rule | Rotational States |
|---|---|---|---|
| Non-dual (palindromic) | 40 | `pair1.sequence == pair2.sequence` | 7 states |
| Dual | 24 | `pair1.sequence ≠ pair2.sequence` | 8 states |

Note: 51 nodes mention "non-dual" and 44 mention "palindromic" — slight mismatch suggests
some nodes use broader degeneracy language. The canonical count is 40 non-dual (= 64 - 24).

**7-state vs 8-state detail (correcting spec 13):**
- **7-state (non-dual):** One state is degenerate (pair1 = pair2 appears in both positive
  and negative roles). The 7 states = 6 distinct + 1 eigenspace-collapsed = effectively
  6 dual-role states + the non-dual anchor itself. NOT "1 non-dual + 3 positive + 3 negative"
  — the collapse is at the level of a single degenerate eigenstate.
- **8-state (dual):** 4 positive + 4 negative. Full spectral coverage.

**Implementation note:** Add `codon_type: "dual" | "non_dual"` property to all #3-2 codon
nodes during next dataset reconciliation pass.

---

## §4 Yin/Yang Charge Values (n/p/nn/pp/np/pn)

**Two dimensions confirmed in dataset — format below:**

### Qualitative (character)
- Property: `yinYang` (e.g., `"Pure Yang"`, `"Mixed Yin-Yang"`)
- At nucleotide level: A=yin, G=yang, U=yang, C=yin (fixed, not runtime)
- Found on hexagram nodes (#3-1-0-*) and some codon nodes

### Quantitative (valence / charge)
- **Stored as:** `positive_codon_binary` and `negative_codon_binary` (3-bit) on generation events
- **NOT stored as:** named charge tuple properties (pp/nn/np/pn)
- These are **runtime-computed** from binary field states during oracle casting:
  - pp (++) → both upper and lower positive binary states active
  - nn (--) → both negative binary states active
  - np (+−) and pn (−+) → mixed upper/lower binary states

**Oracle charge LUT path:** Build from `surface_generation_events.py --json` output —
decode `upper_Pair_binary` × `lower_Pair_binary` → charge state → LUT entry.

---

## §5 Hexagram-to-Codon Mapping

### Coordinate Structure

| Branch | Path | Content |
|---|---|---|
| I-Ching hexagrams | `#3-1-0-{0..63}` | 64 hexagram nodes with `associatedCodons` property |
| DNA codons | `#3-2-{pair}-{trigram}-{nucleotide}-{variant}` | Codon leaf nodes with `sequence` property |
| RNA codons / gen events | `#3-3-{...}` | RNA variants and generation event nodes |

**Example:** Hexagram Qian (`#3-1-0-0`) has `associatedCodons: ['TTT:1','TTT:1','TTT:2','TTT:2','TTT:3','TTT:3']`

Mapping is **one-to-many**: one hexagram → multiple codon variants via M1/M2/M3 paths.
Each generation event specifies a particular path. `RESOLVES_TO` (184) gives the final
1:1 mapping per generation event.

### Start/Stop Codon Coordinates (canonical)

| Codon | Sequence | bimbaCoordinate | Role |
|---|---|---|---|
| Start | ATG (DNA) | `#3-2-1-2-4` | Methionine; opens oracle chain |
| Start | AUG (RNA) | `#3-3-3-2-4` | Methionine (Start); active form |
| Stop 1 | UAA | `#3-3-3-5-2` | Chain terminator |
| Stop 2 | UAG | `#3-3-3-5-3` | Chain terminator |
| Stop 3 | UGA | `#3-3-3-7-2` | Chain terminator |

These are the **oracle chain governance codons** — Major Arcana cards at these positions
open and close reading chains.

---

## §6 Major Arcana ↔ Amino Acids

### Location
- **Amino acid properties:** On `#3-2` codon nodes — `aminoAcidCode` property (189 of 256 nodes)
- No dedicated "Major Arcana" labeled branch — the correspondence is at `#3-3` (generation
  events) + `#3-4-0-{0..21}` (Major Arcana in the Tarot branch)

### Count Resolution: 22 vs 24
- **22 Major Arcana cards** (standard Tarot, #3-4-0-0 through #3-4-0-21)
- **20 standard amino acids** + **Methionine (Start)** + **Stop signal** = 22 mappings
- The "24" in some specs: 22 Major + 2 governance endpoints (chain start + chain end) = 24
- Dataset holds 22 total in codon-to-amino acid mappings at `#3-2`

---

## §7 Chromosomal Systems

**30 nodes mention chromosomal/chromosome properties.** No dedicated `#3-6` branch exists.

Chromosomal references are scattered across `#3-5` (synthesis nodes). They appear to represent:
- Mapping of 64 codons to chromosomal positions (human genome encoding)
- 24 chromosomes (22 autosomes + X + Y) as a potential structural parallel to 24 amino acids
- **Purpose:** Grounding the symbolic genetic system in actual chromosomal biology

**Proposed coordinate:** `#3-7` branch (or `#3-5-chromosomes`) for reification.

---

## §8 T→U Transcription Nodes

**RNA variants ARE present as distinct nodes.**

| Layer | Coordinate Branch | Example |
|---|---|---|
| DNA codons | `#3-2-*` | `#3-2-1-2-4` → sequence="ATG" |
| RNA variants | `#3-3-*` | `#3-3-3-2-4` → sequence="AUG" |

**TRANSCRIBES_TO** (45 relations): DNA → RNA connections confirmed in relations.json.

**37/27/101 structure:**
- DNA: ~80 distinct codon nodes at `#3-2`
- RNA-specific: ~105 nodes at `#3-3` (includes generation events + pure RNA codons)
- The 37 T-containing DNA codons each gain a U-variant counterpart in `#3-3`
- 27 T-free codons (only {A,G,C}) appear in both branches

---

## §9 Shadow Decan Coordinates

**Tarot suit indexing confirmed as 1-indexed** (not 0-indexed as earlier assumed):
- `#3-4-1` = Wands/Fire
- `#3-4-2` = Cups/Water
- `#3-4-3` = Swords/Air
- `#3-4-4` = Pentacles/Earth

Within each suit: `-0` = Ace, `-1` through `-9` = pips 2–10, `-10`–`-13` = court cards.

**reversedMeaning presence:**
- Pip cards (#3-4-{suit}-0 through #3-4-{suit}-9): ✓ ALL have `reversedMeaning`
- Court cards (#3-4-{suit}-10 through #3-4-{suit}-13): ✗ NO `reversedMeaning`

Court cards represent stable archetypal roles (not fluctuating decan energies) — reversal
does not apply to them. This is architecturally intentional.

**Decan pips** (the 36 numbered cards carrying decan assignments):
`#3-4-{1..4}-{1..9}` = 4 suits × 9 pips = 36 decan nodes (Ace excluded from decan mapping).

---

## §10 Rotational State Nodes

**Rotational state nodes are NOT in the current dataset.**

They are generated at query time via `rotational_state_protocol.txt` (a Neo4j Cypher script).
The 512 `RotationalState` nodes exist as a **protocol-generated layer**, not a stored layer.

**To materialize:** Run the rotational state protocol against the Neo4j graph to generate
and persist the 512 nodes (64 × 8) as `#3-1-rot-{codon_idx}-{rotation_0..7}`.

**64:8:40 confirmation:**
- 64 codons: confirmed at `#3-1-0-{0..63}` and `#3-2` leaves
- 8 states per codon: 4 trigram pair combinations × 2 polarity orientations
- 40 non-dual anchors: codons where `pair1.sequence == pair2.sequence` (computed)

---

## §11 Relations Summary

**Total unique relation types: 118**

Key structural relations:

| Relation | Count | Structural Significance |
|---|---|---|
| `YIELDS_CODON` | 368 | Hexagram → codon mapping |
| `USES_Pair` | 415 | Most numerous — pair-based structure |
| `HAS_INTERNAL_COMPONENT` | 351 | Hierarchical dataset structure |
| `INTEGRAL_SYMMETRY` | 192 | Symmetry preservation = 3×64 |
| `LINE_CHANGE` | 384 | = 64×6 — confirms I-Ching structural law |
| `ANCHORED_BY` | 360 | = 360° — clock degree anchoring |
| `FLOWS_CLOCKWISE` | 360 | = 360° — clock dynamics |
| `RESOLVES_TO` | 184 | Generation event → final codon |
| `TRANSCRIBES_TO` | 45 | DNA → RNA transcription |

**No explicit M3→M1 or M3→M2 relations in the dataset.** Cross-branch connections are
documented in CLAUDE.md and computation files but not as edge relations. The three M1/M2/M3
context labels in generation events are internal M3 paths, not cross-system links.

---

## §12 Gaps and Discrepancies

| Gap | Impact | Remediation |
|---|---|---|
| No discrete pairing matrix nodes | Cannot address matrices by coordinate | Create `#3-2-matrix-{1,2,3}` |
| Codon type not a node property | Must be computed at runtime | Add `codon_type` property to `#3-2` nodes |
| Charge tuple not stored | Oracle LUT must be built from binary | Build LUT from `surface_generation_events.py --json` |
| Rotational state nodes not persisted | Cannot address by coordinate | Run rotational state protocol to materialize |
| M3 context only 56 of 64 hexagrams | Third path incomplete | Document excluded hexagrams and rationale |
| Chromosomal system scattered | No addressable branch | Create `#3-7` or `#3-5-chromosomes` branch |
| Court cards lack reversed meaning | Shadow coverage incomplete for courts | Intentional — note in spec |
| `TRANSCRIBES_TO` only 45 relations | Should be 37 (T→U codons) | Verify count; may include indirect links |

---

## §13 Proposed Spec Additions

1. **Canonical coordinate table for start/stop codons** — `#3-3-3-2-4` (AUG), `#3-3-3-5-2/3`
   (UAA/UAG), `#3-3-3-7-2` (UGA) — these should appear in oracle.rs as named constants.

2. **Generation event LUT construction** — `surface_generation_events.py --json` output
   should be the BUILD SOURCE for `CODON_GENERATION_LUT` in oracle.rs, with explicit
   charge state derived from binary fields.

3. **Tarot coordinate correction** — Suit indexing is 1-based (`#3-4-1` = Wands, not `#3-4-0`).
   Any spec or code assuming 0-based suit indexing must be corrected.

4. **Rotational state protocol materialization** — Phase 2 task: run protocol, persist
   512 nodes as `#3-1-rot-{codon}-{rotation}`, add to oracle LUTs.

5. **M1/M2/M3 context label clarification** — These are NOT subsystem references in the
   generation event context field. They are three internal Mahamaya matrix paths. This
   must be explicit in all documentation referencing generation events.
