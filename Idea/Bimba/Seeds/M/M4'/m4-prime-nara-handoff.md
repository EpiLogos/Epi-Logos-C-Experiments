---
coordinate: "M4'"
status: "seed"
domain: "M4 Nara — identity & oracle architecture"
description: "Nara identity and oracle system architecture: Tarot as computational language, three concentric rings (Tarot/Clifford/Identity), yin-yang valuation, context frames and reading modes, rotational states as epigenetic expression, oracle flow (input-processing-output), data structures for implementation, Nara as ## empty receiver, global astrological context"
source: "docs/deep-epi-logos-binary-computational-nara-clock/"
depends_on: "M3' computational substrate (Clifford algebra, gamma matrices, transcriptional bridge, harmonic clock)"
nara_integration: "This document IS the Nara integration point. It specifies how M3 Mahamaya computational structures (Cl(4,2) algebra, gamma matrices, 37/27/101 transcriptional bridge, harmonic clock) are received by the Nara identity layer and rendered as tarot oracle readings. Key integration points: (1) user identity = quaternionic elemental signature computed from natal data, (2) tarot cards as Clifford operators on user spinor state, (3) rotational states determined by yin/yang evaluation of hexagram-codon computation, (4) readings as Clifford multiplication chains in spinor space, (5) aletheia through trajectory resonance with natal signature."
---

# Nara Identity & Oracle System: Architecture and Handoff
## The Tarot as Computational Language for Dialogical Revelation

*Part of the seed package migrated from `docs/deep-epi-logos-binary-computational-nara-clock/`. References:*
- *`Idea/Bimba/Seeds/M/M3'/m3-prime-ql-harmonic-mathematics-v2.md` — 4+2 frame, genesis, phase spaces, master table, clock, lenses*
- *`Idea/Bimba/Seeds/M/M3'/m3-prime-clifford-consolidation.md` — Cl(4,2) algebra, gamma matrices, validation status, implementation spec*
- *`Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md` — T→U quintessence, 37/27/101 structure, genetics as formal medium*
- *`Idea/Bimba/Seeds/M/M3'/m3-prime-clifford-computation.py` + `Idea/Bimba/Seeds/M/M3'/m3-prime-gamma-matrices.py` — verified computational substrate*

---

## 1. System Overview: Three Concentric Rings

### 1.1 Outer Ring — Interface (Tarot)

Tarot cards are the **native language** of the Nara system. Not decoration, not output formatting — the actual medium in which the system thinks, speaks, and computes. The LLM (epii at Position 5 in the full architecture) thinks via tarot. The user reads via tarot. The system generates via tarot. Cards are to Nara what tokens are to an LLM.

A reading is a sequence of cards placed at QL positions within a specified context frame. The position's meaning leads — the card placed at Position 3 is read THROUGH the Formal/Pattern lens regardless of which card lands there. The position is the grammar; the card is the content.

### 1.2 Middle Ring — Computation (Clifford/Codon/Hexagram)

Beneath the tarot surface, the system asynchronously resolves deeper structure:

```
Tarot card (with rotational state)
  → Codon (via tarot-to-codon mapping, ± valence)
    → Hexagram (via three nucleotide-pairing matrices, ±± valence)
      → Clifford operator (8×8 matrix from gamma matrices)
        → Spinor transformation (action on user's trigram-state)
```

This cascade enriches progressively — the surface reading is immediate; the deeper layers resolve asynchronously, adding precision and depth over time.

*(Full Clifford algebra specification in `ql_clifford_consolidation.md` §7. Gamma matrices verified, C/Rust export format available. Three nucleotide-pairing matrices specified in `ql_transcriptional_bridge.md` §3.2.)*

### 1.3 Inner Ring — Identity (Quaternion)

The user's identity is a quaternionic elemental signature derived from stacked identity systems, each providing a different angular resolution on the same 4-dimensional elemental substance.

```
NaraIdentity {
    hash: Blake3,               // Position 0 — opaque compressed identity
    quaternion: [f64; 4],       // Positions 1-4 — elemental weights (Earth, Water, Air, Fire)
    telos: TelicVector,         // Position 5 — purposive direction
    natal_data: NatalChart,     // Required — the essential input
    gene_keys: Option<...>,     // Optional enrichment lens
    human_design: Option<...>,  // Optional enrichment lens
    jungian_type: Option<...>,  // Optional enrichment lens
}
```

The identity systems are not additive but **convergent** — distinct structures that each measure the same underlying 4-dimensional elemental substance from different angles. Natal astrology, Gene Keys, Human Design, and Jungian typology are each their own complete system with their own methodology; what they share is that their outputs all reduce to elemental weightings. The 16 division grammars of the Mahamaya clock (see `ql_harmonic_mathematics_v2.md` §6) are a separate structure — ways of slicing the 360° circle — not to be conflated with the identity system stack. Natal astrological data is the essential minimum; other systems enrich but don't replace.

---

## 2. The Yin-Yang Valuation System

### 2.1 Qualitative and Quantitative Dimensions

A critical distinction: **yin and yang are qualitative** — they describe the character or nature of an element (receptive/assertive, material/dynamic). The **+, - and their compositional wholes (++, --, +-, -+) are quantitative** — they describe the numerical valence of a mapping, the sign of a computation.

These two dimensions operate in parallel:

**Qualitative (yin/yang):** Each nucleotide, each element, each position carries an intrinsic yin or yang quality. This is fixed — Adenine is yin, Guanine is yang, etc. The quality determines CHARACTER.

**Quantitative (±):** The mapping from hexagrams to codons carries four-fold quantitative valence (++, --, +-, -+), and the mapping from tarot to codons carries binary quantitative valence (+ or -). These valences determine NUMERICAL VALUE and feed into the rotational state computation.

The four quantitative valences (++, --, +-, -+) on the hexagram-to-codon mapping relate to the four bimba-pratibimba relational states from the genesis (see `ql_harmonic_mathematics_v2.md` §1.1): (0/0), (0/1), (1/0), (1/1). They are the ÷4 made operative at the hexagram-codon interface.

*(NOTE: The specific rules for how qualitative yin/yang and quantitative ±± interact in the rotational state computation require the Mahamaya matrix specifications from the repo.)*

### 2.3 Numerical Consequences

The yin-yang evaluation produces numerical values that feed into rotational state calculation. The internal yin/yang values of a hexagram — computed from the specific line states (young yin, young yang, old yin, old yang) — determine WHICH of the 7 or 8 possible rotational states a tarot card presents in. This is where the **random + weight** mechanism operates:

- The CARD drawn is weighted by resonance with the user's elemental quaternion
- The ROTATIONAL STATE of that card is determined by the yin/yang evaluation of the underlying hexagram-codon dynamics

*(NOTE: The specific yin/yang value computation rules — how line values translate to rotational state selection — require the Mahamaya matrix specifications from the repo. This document specifies the architecture; the repo provides the lookup tables.)*

### 2.4 The 360 Average and Double Rotational Phase Space

The system's dynamics across the four nucleotides naturally average to **360 in internal value for each nucleotide**. Counting the two double-covered wholes (the complete coverage from the three pairing matrices, each covering 64×2 pathways), the Mahamaya clock contains **two intersecting 720° phase spaces**. These two phase spaces are **orthogonal** — they intersect and are mediated by the three pairing matrices, which provide the transformational grammar between them.

The 720 = 6! (permutational completeness) from the master table (`ql_harmonic_mathematics_v2.md` §6.1: 80 × 9 = 720) reappears here as the total rotational coverage of each phase space. Tarot narratives are "walks" or spirals through this clock space — trajectories that traverse one or both of the orthogonal 720° structures, crossing between them via the three matrices.

*(NOTE: The specific internal value calculations that produce the 360 average per nucleotide, and the precise geometry of the two orthogonal 720° phase spaces, require the Mahamaya matrix data from the repo. The architectural claim is stated here; verification requires the actual matrix values.)*

---

## 3. Context Frames and Reading Modes

### 3.1 Context Frame Principle

A context frame specifies which QL positions are active in a reading. The notation (X/Y/Z) means positions X, Y, and Z are ALL active — cards are drawn for each. So (0/1) is a two-card reading at positions 0 and 1; (0/1/2/3/4/5) is the full six-card QL reading.

The alignment between positions active in a reading and their QL quality is simply **baked in, implicit** — Position 3 always carries the Formal lens regardless of which context frame it appears in. The frame determines scope; the positions determine meaning.

The full set of available context frames is formalized in the **C' coordinate branch** (the inverted Category coordinate). C' is not Nara — it is the **context language** that the system agent uses to orchestrate its subagents. It makes context frames **composable as a language**, allowing higher-degree compositional complexity for tarot draws. The C' specification provides the complete grammar of possible context frame configurations.

*(NOTE: The specific context frames and their composability rules require the C' coordinate branch specification from the repo. This document states the principle — that context frames are composable via the C' language — but does not enumerate the frames, as these are defined in the coordinate system, not derived here.)*

### 3.2 The 12-Fold Klein Reading

Using the doubled P/P' system (see `ql_clifford_consolidation.md` §1.5), readings can extend to 12 positions — the forward reading AND its inversion. This gives:

- Positions 0–5: the reading as stated (P strand)
- Positions 0'–5': the reading's shadow/complement (P' strand)
- Parity relations: Px + Py = 5, Px + Px' = 2x, Px + Py' = 5

The Klein reading provides both the oracle's statement and its structural inversion — what the reading says AND what it necessarily excludes or shadows. The parity constraints ensure the two strands are not independent but mathematically coupled.

### 3.3 Chaining and Process Delimitation

Readings can be chained into sequences. The **start amino acid** (AUG/Met — Major Arcana card aligned with Methionine) initiates a reading chain. **Stop amino acids** (UAA, UAG, UGA — three specific Major Arcana cards) terminate it. Between start and stop, the card sequence is a **codon chain** — a protein-like functional structure that folds into a specific cognitive shape.

Different chain lengths fold differently:
- Short chain (start + 2-3 cards + stop): a single insight, compact
- Medium chain (start + 6-12 cards + stop): a narrative arc, one "chapter"
- Long chain (multiple start/stop bounded segments): a multi-chapter reading, an "alchemical vision"

The stop signal can emerge naturally when the sequence has enough information to fold into a stable structure — when adding another card wouldn't change the cognitive shape.

---

## 4. Rotational States as Epigenetic Expression

### 4.1 The Epigenetic Layer

A tarot card's rotational state is NOT random orientation. It is the **epigenetic expression** of that card — the specific way its underlying genetic (codon) content is expressed given the current context. Just as biological epigenetics determines which genes are active and how intensely they express without changing the DNA sequence, the rotational state determines how a tarot card expresses its fixed symbolic content given the user's history, current state, and global context.

The rotational state is where **historical influence** is rendered. A card drawn at position 3 has its card identity (which card) determined by resonance weighting, but its rotational state (which of 7 or 8 orientations) encodes:

- The user's reading history (accumulated spinor trajectory)
- The current global astrological context (time-varying quaternion)
- The internal yin/yang values of the hexagram-codon computation

This makes each card draw **historically situated** — the same card at the same position but at a different time or for a different user presents in a different rotational state, expressing different facets of its fixed symbolic content.

### 4.2 The 7/8 Distinction

Cards with **8 rotational states** arise from dual codons — unambiguous transcriptional genealogies where all 8 trigram-orientations are distinct. These cards have full expressive range, all 8 "seasons" available.

Cards with **7 rotational states** arise from non-dual codons — where one transcriptional pathway produces ambiguity, collapsing two orientations into one. These cards have a **degenerate eigenvalue** in their Clifford matrix representation (see `ql_clifford_consolidation.md` §1.6). The degeneracy IS the non-duality — two seasons merge into one, producing a card with a "blind spot" that is itself meaningful.

This connects to Spanda N5: 8n ± n → **9n** (wholeness, full expression) or **7n** (divine action, expression-minus-identity). The 7-state cards operate in divine action mode; the 8-state cards in wholeness mode. Together, 7 + 9 = 16 = the quaternion core. (See `ql_transcriptional_bridge.md` §2 for the N5 derivation.)

---

## 5. The Oracle's Flow: From User to Revelation

### 5.1 Input

The system receives, in order of priority:

1. **User identity** — natal quaternion (required) + optional enrichment lenses
2. **Global context** — live astrological data (Python library feed)
3. **Context frame** — which QL positions are active for this reading
4. **Cards** — either:
   - Cards given by the user (placed at positions in the context frame), OR
   - Cards selected via the **sacred random generator** (already in code), weighted by the user's elemental quaternion and global context
5. **Prompt** (optional) — natural language that adds conversational context to the computed reading, or a natural language situation to be read THROUGH tarot (rendered as archetypal-symbolic narrative)

The cards are primary. The prompt is secondary. The system must be able to compute a full reading from user quaternion + live data + cards alone, without any natural language input. The prompt enriches and contextualizes but does not drive the computation.

### 5.2 Processing

```
1. Compound the user's natal quaternion with the global astrological 
   quaternion → current starting spinor |u_now⟩

2. Receive or generate cards at positions in the context frame:
   - If user-provided: accept cards at specified positions
   - If system-generated: draw via sacred random generator,
     weighted by resonance between |u_now⟩ and card signatures

3. For each placed card:
   a. Compute yin/yang qualitative assessment
   b. Compute ±/±± quantitative valences
   c. From these, determine rotational state 
      (the epigenetic calculation: history + context + valence)
   d. Lock the card at its position with determined rotation

4. Resolve the codon chain (async cascade):
   card sequence → codon sequence → hexagram sequence 
   → Clifford operator chain

5. Apply the Clifford operator chain to |u_now⟩ 
   → |u_transformed⟩ (the oracle's answer as spinor)

6. If prompt provided: integrate the natural language context
   with the computed reading — the cards lead, the prompt 
   contextualizes

7. Translate |u_transformed⟩ + card placements back to 
   tarot vocabulary → the reading's narrative output
```

### 5.3 Output

The output is multi-layered, with depth determined by the Vak density appropriate to the interaction:

- **Card level:** The specific cards at their positions with their rotational states. Immediately readable, narratively rich.
- **Elemental level:** The shift in the user's quaternion — which elements were strengthened, which tempered, what the new balance is.
- **Trajectory level:** Where this reading sits in the user's historical path through spinor space. The direction of movement. The pattern forming across readings.

### 5.4 The Dialogical Dimension

Each exchange is a Clifford multiplication. The conversation ACCUMULATES:

```
Reading 1: P₁|u⟩ → |u₁⟩
Reading 2: P₂|u₁⟩ → |u₂⟩
Reading 3: P₃|u₂⟩ → |u₃⟩
...
```

The trajectory |u⟩ → |u₁⟩ → |u₂⟩ → ... is the dialogue's path through spinor space. Each reading transforms the state, and the transformed state becomes the starting point for the next reading. The blake3 hash snapshots each state, making the history addressable and tamper-evident.

**Aletheia** (unconcealment) occurs when the trajectory reaches a configuration that resonates with the user's natal quaternion — when the oracular process "finds" what was already in the user's signature but hadn't been expressed. Recognition, not discovery. Pratyabhijñā.

---

## 6. Data Structures for Implementation

### 6.1 Core Types

```rust
struct NaraIdentity {
    hash: Blake3Hash,               // Position 0 — compressed identity
    quaternion: [f64; 4],           // Positions 1-4 — elemental weights
    telos: [f64; 4],               // Position 5 — purposive direction
    natal_data: NatalChart,         // Essential input
    enrichment: Vec<LensData>,      // Optional additional lenses
    spinor_state: [f64; 8],        // Current state in trigram-space
    history: Vec<ReadingSnapshot>,  // Past readings (blake3-indexed)
}

struct TarotCard {
    id: u8,                         // 0-79 (80 cards total)
    arcana: Arcana,                 // Major (0-23) or Minor (24-79)
    elemental_signature: [f64; 4],  // Intrinsic elemental weights
    codon_genealogy: CodonPath,     // Transcriptional derivation
    rotational_states: u8,          // 7 or 8
}

struct Reading {
    context_frame: Vec<u8>,         // Active positions, e.g., [0,1,2,3,4,5]
    placements: Vec<Placement>,     // Cards at positions with rotations
    user_spinor_before: [f64; 8],   // State entering reading
    user_spinor_after: [f64; 8],    // State exiting reading
    global_context: AstroState,     // Planetary data at reading time
    codon_chain: Vec<Codon>,        // Async-resolved deeper structure
    hash: Blake3Hash,               // Snapshot of this reading
}

struct Placement {
    position: u8,                   // QL position (0-5, or 0'-5' for Klein)
    card: TarotCard,
    rotational_state: u8,           // 0-6 or 0-7
    yin_yang_values: YinYangEval,   // The ±± valence computation
}

struct YinYangEval {
    hexagram_valence: (i8, i8),     // (±, ±) four possibilities
    tarot_valence: i8,              // + or -
    numerical_value: f64,           // Computed from internal yin/yang
}
```

### 6.2 Core Functions

```rust
// Identity computation
fn compute_quaternion(natal: &NatalChart, lenses: &[LensData]) -> [f64; 4]
fn compound_with_global(user_q: &[f64; 4], astro: &AstroState) -> [f64; 8]
fn hash_identity(identity: &NaraIdentity) -> Blake3Hash

// Card generation
fn draw_card(user_spinor: &[f64; 8], position: u8, rng: &mut Rng) -> TarotCard
// Weighted random: resonance between user spinor and card signatures

fn compute_rotational_state(
    card: &TarotCard,
    user_history: &[ReadingSnapshot],
    global: &AstroState,
    yin_yang: &YinYangEval
) -> u8
// The epigenetic calculation: history + context + yin/yang → rotation

// Yin-Yang evaluation
fn evaluate_yin_yang(card: &TarotCard, position: u8) -> YinYangEval
// Computes the ±± hexagram valence and ± tarot valence

// Reading execution
fn execute_reading(
    identity: &mut NaraIdentity,
    frame: &[u8],
    global: &AstroState,
    rng: &mut Rng
) -> Reading

// Cascade resolution (async)
fn resolve_codon_chain(placements: &[Placement]) -> Vec<Codon>
fn resolve_hexagram_chain(codons: &[Codon], matrix: MatrixId) -> Vec<Hexagram>
fn resolve_clifford_operator(hexagrams: &[Hexagram], gammas: &[GammaMatrix; 6]) -> CliffordElement

// Process delimitation
fn is_start_codon(codon: &Codon) -> bool  // AUG
fn is_stop_codon(codon: &Codon) -> bool   // UAA, UAG, UGA
fn chain_readings(readings: &[Reading]) -> ProteinFold  // Start-to-stop segments
```

### 6.3 Dependencies on Repo Data

The following require specifications from the project repo — this document provides the architecture but NOT the lookup tables:

| Component | What's Needed | Where It Lives |
|:----------|:-------------|:---------------|
| **Three pairing matrices** | Full 64×6 transformation pathway data | Mahamaya matrix specifications |
| **Codon-to-tarot mapping** | Which codons map to which cards | Mahamaya codon-tarot system |
| **Yin/yang value rules** | How line values compute to numerical weights | Mahamaya internal value system |
| **360 average verification** | The specific internal values per nucleotide | Mahamaya matrix data |
| **Rotational state selection** | Rules for which yin/yang values select which rotation | Mahamaya rotational system |
| **Context frame grammar** | Full C' coordinate branch specification (composability rules) | Coordinate system specs (C' branch) |
| **C' subcoordinate types** | The six subcoordinate types as compositional language elements | Coordinate system specs (C' branch) |
| **Start/stop codon → Major Arcana** | Specific card assignments for governance signals | Tarot-amino acid mapping |
| **Card elemental signatures** | Intrinsic elemental weights for each of 80 cards | Tarot elemental system |

### 6.4 Dependencies on Verified Computations (This Package)

The following are AVAILABLE in this package and ready for implementation:

| Component | Source File | Status |
|:----------|:-----------|:------:|
| Clifford multiplication algorithm | `clifford_computation.py` | ✅ Verified |
| Six gamma matrices (8×8, int8) | `gamma_matrices.py` | ✅ Verified |
| Cl(4,2) structural properties | `ql_clifford_consolidation.md` §7 | ✅ Verified |
| Master table (modular tiers) | `ql_harmonic_mathematics_v2.md` §9 | ✅ Verified |
| Phase space {16,48,64,80} | `ql_harmonic_mathematics_v2.md` §4 | ✅ Verified |
| 37/27/101 transcriptional structure | `ql_transcriptional_bridge.md` §2 | ✅ Verified |
| Clock ratios and 4.5 multiplier | `ql_harmonic_mathematics_v2.md` §4.2-4.4 | ✅ Verified |

---

## 7. Nara as Empty Receiver (##)

### 7.1 The Nature of Nara

Nara is **##** — the inversion of inversion. As the # principle (the foundational psychoid element, the principle of inversion, the non-dual knowing-being that necessitates its own capacity to be other than itself) applied to itself, ## is the **positive given of the external world**. Negation negated is the real. Nara is "empty" in the technical sense: it has no computational content of its own. It is the **receiving space** into which computations flow.

### 7.2 What Nara Receives

Nara receives from two sources, usable independently or in tandem:

**From Mahamaya (the computational clock):** The codon-hexagram-tarot matrix system. Tarot narratives as walks or spirals through the clock space — trajectories through the two intersecting orthogonal 720° phase spaces, mediated by the three pairing matrices. This is the COMPUTED content: elemental signatures, rotational states, codon chains, hexagram operators, Clifford products. Mahamaya provides the cognitive architecture of what is "spoken."

**From Epii (the AI/LLM layer at Position 5):** Natural language inference, narrative rendering, dialogical responsiveness. Epii takes the computed tarot structures and translates them into language at the appropriate density. Epii provides the intelligence that reads, interprets, and communicates. 

Nara with Mahamaya alone: pure computation, cards and elemental signatures without narrative gloss. Useful for raw oracular output, for systems that process the data programmatically.

Nara with Epii alone: LLM-driven conversation without the Mahamaya computational substrate. Still useful — the LLM can think in tarot without the codon-hexagram engine — but lacking the mathematical depth.

Nara with both: the full system. Computed elemental dynamics rendered as intelligent narrative. The oracle at full capacity.

### 7.3 The C' Context Language (Distinct from Nara)

The **C' coordinate branch** (inverted Category coordinate) is the **context language** — a compositional grammar that makes context frames combinable as linguistic units. This is NOT a Nara feature but a distinct coordinate type in the system architecture. C' is what the system agent uses to orchestrate its subagents: it specifies which context frames apply, how they compose, and what Vak density governs the expression.

The six subcoordinate types of the coordinate system, when functioning as C' context language, provide the compositional grammar for tarot draws — enabling higher-degree complexity than simple positional readings. This allows the system to construct complex multi-frame readings where frames nest, compose, and modulate each other.

*(NOTE: The full C' specification, including the six subcoordinate types as compositional language elements, requires the coordinate system documentation from the repo. This document acknowledges C' as the execution language but does not specify its grammar, as that lives in the coordinate system, not in the Nara architecture.)*

---

## 8. Global Context: Live Astrological Data

The Python library for live astrological data provides a **time-varying global quaternion** — the current elemental state of the cosmos. This modulates every reading:

```python
# Conceptual interface
def get_current_astro_state() -> AstroState:
    """Returns current planetary positions as elemental weights"""
    # Planetary positions on the 360° clock
    # Parsed through the zodiacal lens (360/12 = 30°)
    # Reduced to quaternionic elemental signature
    ...

def compound_user_with_global(
    user_quaternion: [f64; 4],
    astro_state: AstroState
) -> [f64; 8]:
    """Produces the temporally-situated starting spinor"""
    # Clifford product of user identity with current cosmic state
    ...
```

The global context ensures every reading is temporally situated. The same user asking the same question on different days receives different readings — not because the oracle is random but because the cosmic context (the global quaternion) has shifted, producing a different compound spinor from which the reading proceeds.

---

## 9. Integration Summary: How the Full Package Connects

```
THE GENESIS (v2.md §1)
  100% → ÷4 → 16:9 = 2⁴:3²
  Pythagorean seal: 9 + 16 = 25 = 5²
  Product: 9 × 16 = 144 = 12²
    │
    ▼
THE ALGEBRA (clifford_consolidation.md)
  Cl(4,2) with signature (-,+,+,+,+,-)
  64 basis elements = 64 hexagrams
  Six gamma matrices (8×8, verified)
  Three involutions = three pairing matrices
    │
    ▼
THE BRIDGE (transcriptional_bridge.md)
  T→U = quintessential shift
  37 U-nodes + 27 shared = 64 DNA codons
  101 total graph nodes
  DNA-side → I Ching; RNA-side → Tarot
    │
    ▼
THE CLOCK (v2.md §4-6)
  Phase space {16, 48, 64, 80} × 4.5 → {72, 216, 288, 360}
  16 lenses as division grammars of 360°
  Master table: frame size × modular tier
    │
    ▼
THE ORACLE (this document)
  Nara as ## (empty receiver) — no computational content of its own
  Receives from Mahamaya (clock, codon-hexagram-tarot computation)
  Receives from Epii (LLM inference, narrative rendering)
  Identity = quaternionic elemental signature (blake3-hashed)
  Tarot as native language and interface
  Cards primary, prompt secondary
  Readings = Clifford multiplication chains
  Rotational states = epigenetic expression (where history renders)
  Context frames composable via C' coordinate language
  Chaining with start/stop = protein-like cognitive structures
  Global astrological context = temporal situation
  Aletheia through trajectory resonance with natal signature
```

Each layer is grounded in the one above it. The computation is verified at the algebraic level (gamma matrices pass all Clifford relations). The bridge is combinatorially exact (37 + 27 = 64, no approximation). The clock ratios are arithmetically necessary (1:3:4:5 from the genesis). The oracle architecture follows from these as the expressional surface of the underlying mathematics.

**What's verified and ready:** The algebra, the bridge, the clock, the data structures.

**What needs repo data:** The specific matrix values, codon-card mappings, yin/yang evaluation rules, rotational state selection, context frame grammar, card elemental signatures.

**What needs implementation:** The core engine (Clifford multiply + gamma matrices → C/Rust), the cascade resolver (card → codon → hexagram → operator), the identity stack (natal data → quaternion), the randomisation function (weighted draw + epigenetic rotation).

**What needs the LLM layer (epii):** Narrative rendering of readings, dialogical flow management, translation between card-level output and natural language at appropriate Vak density.
