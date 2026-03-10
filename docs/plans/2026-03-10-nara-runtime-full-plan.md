# Nara Runtime — Full Implementation Plan
# `epi nara` CLI + Gateway + Identity Matrix + SpacetimeDB + M4' UX

**Date:** 2026-03-10
**Coordinate:** #4 — M4 Nara Personal Dialogical Interface
**Status:** Planning — canonical reference for all Nara runtime work
**Supersedes:** 2026-03-06-m4-nara-design.md (partial), 2026-03-06-m4-nara-implementation.md (partial)
**Dataset:** docs/datasets/nara-deep/ — 99 nodes, 169 unique relation types, 6 sub-branches

---

## I. Design Principles

1. **Open identity architecture** — 6 identity sub-systems (#4.0-0 through #4.0-5) are independent
   slots. Each can be absent, partial, or complete. The quintessence hash (#4.0-5) is computed
   from whatever layers ARE present. Adding a new layer recomputes the hash — this IS the
   epigenetic augmentation mechanism.

2. **Privacy-first by architecture** — raw personal data never leaves the compute call. BLAKE3
   hash is the only thing shared with SpacetimeDB. Encrypted per-layer storage on disk.

3. **Deterministic first, stochastic second** — all M1/M2/M4 computations are deterministic
   given natal data + current date. Oracle casting is the only non-deterministic operation,
   and it is consent-gated.

4. **C is authoritative** — the M1_Root, M2_Root, M4_Identity_Matrix live in C. Rust is a thin
   FFI wrapper. The clock ticks in C. The hash is computed in C. Rust exposes it.

5. **Clock is a year clock** — torus_pos maps to solar year via sun_degree_anchor / 60° = tick 0-11.
   cf_substage maps to planetary hour within the tick. The SU(2) double cover means tick 0-5
   = ascending/explicate (spring→autumn), tick 6-11 = descending/implicate (autumn→spring).

6. **#4.1-4 is the temporal authority for ALL operations** — before any oracle cast, medicine
   suggestion, alchemical operation, or container selection, the planetary hour / lunar phase /
   decan state is consulted. No Nara operation is temporally naive.

7. **Separation of doing and interpreting** — #4.3 ENACTS transformation; #4.4 INTERPRETS it.
   Wisdom traditions (Jung, Trika, phenomenology) are lenses, never operators. This is an
   architectural boundary that must be preserved in code.

8. **Two-stroke metabolization** — every transformation follows outer→inner (codon→anticodon).
   Writing is outer stroke; reflection/integration is inner stroke. The system supports both
   and tracks completion of each cycle.

9. **Dialogical containers are first-class** — Bohmian Dialogue, Native Talking Circle,
   Diamond Approach Inquiry (#4.3-2) are distinct structured practices with different rules,
   not just chat modes. Each has an opening ritual, active protocols, and a closing gesture.

10. **Logos Cycle is the day's synthesis engine** — #4.5 runs the 0→5 progression over
    completed work. The daily note's activity feed is the input; wisdom extraction is the output.
    This is the mechanism by which days accumulate into the #4.4.4.4 subgraph.

---

## I-B. Full Sub-Branch Architecture (from dataset)

99 nodes, 169 unique relation types. Each sub-branch has a distinct operational role:

| Sub-Branch | Nodes | Role | Key Structures |
|------------|-------|------|----------------|
| **#4.0** | 7 | Grounds identity ("who") | 6-layer identity matrix, BLAKE3 hash |
| **#4.1** | 7 | Determines remedy ("what") | Elemental balance, chakras, materia, timing, safety |
| **#4.2** | 7 | Reveals guidance ("how") | Tarot engines, I-Ching, casting layer, interpretation, pedagogy |
| **#4.3** | 10 | Enacts transformation ("do") | Cycle engine, 7 alchemical ops, 3 dialogical containers, decan recipes, telemetry |
| **#4.4** | 55 | Interprets meaning ("why") | 6 wisdom lenses (Gebser/Ontology/Epistemology/Jung[43]/Phenom[7]/Trika) |
| **#4.5** | 13 | Extracts wisdom ("learn") | Logos Cycle 0→5, curriculum, voice, transparency, pedagogy, atlas |

### #4.3 Dialogical Containers (#4.3-2)
Three first-class containers — each a distinct practice:
- **#4.3-2.0 Bohmian Dialogue** — assumption suspension, collective intelligence
- **#4.3-2.1 Native Talking Circle** — community healing, all voices equal
- **#4.3-2.2 Diamond Approach Inquiry** — phenomenological precision, spiritual direct inquiry

### #4.4.4.4 — Personal Pratibimba (transformation site)
Three-layer privacy architecture:
1. **Bimba** (shared, canonical) — universal patterns from admin Bimba
2. **Pratibimba** (personal, local) — this user's lived experience, tenant-fenced
3. **Archetype Atlas** (collective, anonymized) — opt-in pattern contribution

Etymological archaeology as method: user excavates their own experience to find where
meanings sedimented. The agent traces etymological roots showing "you were living this
meaning all along." #4.4.4.5 (Pratyabhijna) = the moment of self-recognition.

### Cross-M Edges (architecturally significant)
- **#4 → #2-2-2-4-4** (RESONATES_WITH_TANMATRA) — Nara as "intimate taste", direct knowing
- **#4.4.4.0-5 → M2 tattvas** (14 direct edges) — phenomenological layers entangled with tattva descent
- **#4.4.3 → #1-4, #1-5-2** — Jungian transcendent function activates M1 quaternary logic
- **#4.4.4.4 → #0** (REFLECTS_FOUNDATION) — Personal Pratibimba reflects universal Ground
- **#4.4.4.5 → #0** (USER_RECOGNIZES_SELF_AS) — Pratyabhijna: user recognizes self as Ground

---

## II. The Expanded Identity Matrix

### C Struct — M4_Identity_Matrix (expanded from current spec)

The current `M4_Identity_Matrix` conflates all identity data into `M4_Symbol_DNA_Profile`.
The expansion adds independent slots per sub-system, each with a presence flag.

```c
// ==============================================================================
// FR 2.4.0 EXPANDED: 6-slot open identity architecture
// Each slot is independently optional. Hash computed from present slots only.
// ==============================================================================

// #4.0-0 — Birthdate Numerological Encoding
typedef struct {
    uint32_t numerological_key;     // Original 4-fold encoding from date arithmetic
    uint8_t  sixfold_difference;    // 6-fold difference (Bimba/Pratibimba tension)
    uint8_t  sixfold_sum;           // 6-fold sum (synthesis)
    uint8_t  life_path;             // Single-digit life path number (1-9, 11, 22, 33)
    uint8_t  _pad;
} M4_Numerological_Layer;           // #4.0-0 — 8 bytes

// #4.0-1 — Astrological Natal Chart
typedef struct {
    uint16_t sun_degree_anchor;     // 0-719 on SU(2) ring (explicate 0-359, implicate 360-719)
    uint16_t moon_degree_anchor;    // 0-719
    uint16_t asc_degree_anchor;     // Ascendant/Rising sign (0-719)
    uint16_t mc_degree_anchor;      // Midheaven (0-719)
    uint16_t planet_degrees[10];    // All 10 planets (Planet_Id order from m2.h)
    uint8_t  dominant_sign;         // 0-11 zodiac sign index
    uint8_t  dominant_element;      // Element_Id from m2.h
    uint8_t  dominant_modality;     // 0=Cardinal, 1=Fixed, 2=Mutable
    uint8_t  _pad;
} M4_Astrological_Layer;            // #4.0-1 — 28 bytes

// #4.0-2 — Jungian / MBTI Typological Assessment
typedef struct {
    struct {
        uint8_t adenine_water;      // Cups / Feeling (Fi/Fe) — 0-255 intensity
        uint8_t thymine_fire;       // Wands / Intuition (Ni/Ne)
        uint8_t cytosine_earth;     // Pentacles / Sensation (Si/Se)
        uint8_t guanine_air;        // Swords / Thinking (Ti/Te)
    } nucleotide_balance;           // The elemental throughline encoding
    uint8_t  mbti_raw;              // 4-bit MBTI: bit0=E/I, bit1=S/N, bit2=T/F, bit3=J/P
    uint8_t  dominant_function;     // Cognitive function index (0=Ti, 1=Te, 2=Fi, 3=Fe,
                                    //   4=Ni, 5=Ne, 6=Si, 7=Se)
    uint8_t  auxiliary_function;    // Secondary cognitive function index (same encoding)
    uint8_t  enneagram_type;        // 1-9 (0 = not set)
    uint8_t  enneagram_wing;        // 1-9 (0 = not set)
    uint8_t  _pad[3];
} M4_Jungian_Layer;                 // #4.0-2 — 12 bytes

// #4.0-3 — Gene Keys / I-Ching Activation Profile
typedef struct {
    uint64_t gene_keys_activation;  // M3_Matrix_Word mask: bit N = hexagram N active
    uint64_t shadow_mask;           // Low-frequency shadow hexagrams active in profile
    uint64_t gift_mask;             // Mid-frequency gift hexagrams
    uint64_t siddhi_mask;           // High-frequency siddhi hexagrams
    uint8_t  life_work_hex;         // Primary Gene Key (Sun hexagram) — 1-64
    uint8_t  evolution_hex;         // Earth hexagram (opposite of life_work)
    uint8_t  radiance_hex;          // Moon hexagram
    uint8_t  purpose_hex;           // Nodal axis hexagram
    uint8_t  attraction_hex;        // Venus hexagram
    uint8_t  iq_hex;                // Mercury hexagram
    uint8_t  eq_hex;                // Moon south node hexagram
    uint8_t  sq_hex;                // Ascendant hexagram ("spiritual quotient")
} M4_GeneKeys_Layer;                // #4.0-3 — 40 bytes

// #4.0-4 — Human Design Profile (stub — extensible)
typedef struct {
    uint8_t  hd_type;               // 0=Manifestor, 1=Generator, 2=ManGen, 3=Projector, 4=Reflector
    uint8_t  hd_authority;          // 0=Emotional, 1=Sacral, 2=Splenic, 3=Ego, 4=Self,
                                    //   5=Mental, 6=Lunar, 7=None
    uint8_t  hd_profile[2];         // Profile lines (e.g. {1,3} = "Investigator/Martyr")
    uint8_t  hd_definition;         // 0=None, 1=Single, 2=Split, 3=Triple, 4=Quadruple
    uint8_t  incarnation_cross;     // 0-63 (index into cross LUT — TBD)
    uint16_t defined_channels;      // Bitmask of defined channels (0-35, fits uint64 but 16 for now)
    uint32_t defined_gates[2];      // Two uint32 bitmasks covering all 64 gates
    // NOTE: Full Human Design gate/channel chart requires additional struct.
    // This is the minimal viable HD fingerprint for the hash.
    uint8_t  _pad[4];
} M4_HumanDesign_Layer;             // #4.0-4 — 20 bytes

// #4.0-5 — Archetypal Quintessence Hash (computed from present layers)
// NOT stored separately — it IS the M4_Identity_Matrix.quintessence_hash field.
// See m4_identity_hash_compute() below.

// Presence bitmask — which layers are populated
#define M4_LAYER_0_PRESENT  (1u << 0u)  // Numerological
#define M4_LAYER_1_PRESENT  (1u << 1u)  // Astrological
#define M4_LAYER_2_PRESENT  (1u << 2u)  // Jungian
#define M4_LAYER_3_PRESENT  (1u << 3u)  // Gene Keys
#define M4_LAYER_4_PRESENT  (1u << 4u)  // Human Design
// Bit 5 = quintessence computed (derived, not stored)

// The expanded Identity Matrix — 6 independent slots
typedef struct {
    // Presence guard — which layers are populated
    uint8_t  layer_presence;        // Bitmask: M4_LAYER_N_PRESENT

    // The six sub-system layers (each independently optional)
    M4_Numerological_Layer  layer_0;  // #4.0-0
    M4_Astrological_Layer   layer_1;  // #4.0-1
    M4_Jungian_Layer        layer_2;  // #4.0-2
    M4_GeneKeys_Layer       layer_3;  // #4.0-3
    M4_HumanDesign_Layer    layer_4;  // #4.0-4 (stub)

    // The Symbol DNA Profile — synthesized view (derived from layers 1+2+3)
    // Kept for M4 subsystem compatibility (m4_identity_compute legacy path)
    M4_Symbol_DNA_Profile   dna_profile;

    // #4.0-5 — Quintessence Hash
    // BLAKE3(layer_presence || present_layer_data...) truncated to 64 bits
    // Input format: presence_mask (1 byte) || each present layer's bytes in order
    // Absent layers contribute 0 bytes (not zero-filled, literally absent from input)
    // This means adding a new layer CHANGES the hash — intentional epigenetic growth
    uint64_t quintessence_hash;

    // Compute-once guard
    bool     computed;
} M4_Identity_Matrix;


// ==============================================================================
// Hash computation (expanded from FR 2.4.1 PCO Privacy Hash)
// ==============================================================================

// Compute quintessence hash from present layers only
// Destroys input_scratch buffer immediately after use (PCO Privacy Law)
void m4_identity_hash_compute(M4_Identity_Matrix* id);

// Full identity compute: derives dna_profile + calls hash_compute
// input: transient M4_Input_Data — zeroed immediately after
void m4_identity_compute(M4_Identity_Matrix* id, M4_Input_Data* mutable_input);

// Augment: add a new layer to existing matrix, recompute hash
// Does NOT require re-entering raw data for previously computed layers
// new_layer_data: pointer to the specific layer struct being added
// layer_index: 0-4
void m4_identity_augment(M4_Identity_Matrix* id,
                         uint8_t layer_index,
                         const void* new_layer_data,
                         size_t new_layer_size);
```

### Hash Computation Contract

```c
// BLAKE3 input format for quintessence hash:
//   [0]       = layer_presence bitmask (1 byte)
//   [1..N]    = each PRESENT layer's raw bytes, in order 0→4
//               Absent layers contribute NOTHING to the input
//               Adding layer 3 to a {0,1,2} hash = {0,1,2,3} hash → different value
//
// This is the epigenetic growth law:
//   New layer added → hash changes → SpacetimeDB presence updates → you appear
//   differently in the shared space → the firmament reflects your growth

// Minimum viable hash: at least 1 layer present (layer_0 = birth date = always available)
// Full hash: all 5 layers present → maximum identity resolution
```

---

## III. Rust FFI + NaraRuntime

### File: `epi-cli/src/ffi/nara.rs`

```rust
// Mirror C structs — repr(C), field-for-field

#[repr(C)]
pub struct M4NumerologicalLayer {
    pub numerological_key: u32,
    pub sixfold_difference: u8,
    pub sixfold_sum: u8,
    pub life_path: u8,
    pub _pad: u8,
}

#[repr(C)]
pub struct M4AstrologicalLayer {
    pub sun_degree_anchor: u16,
    pub moon_degree_anchor: u16,
    pub asc_degree_anchor: u16,
    pub mc_degree_anchor: u16,
    pub planet_degrees: [u16; 10],
    pub dominant_sign: u8,
    pub dominant_element: u8,
    pub dominant_modality: u8,
    pub _pad: u8,
}

#[repr(C)]
pub struct NucleotideBalance {
    pub adenine_water: u8,
    pub thymine_fire: u8,
    pub cytosine_earth: u8,
    pub guanine_air: u8,
}

#[repr(C)]
pub struct M4JungianLayer {
    pub nucleotide_balance: NucleotideBalance,
    pub mbti_raw: u8,
    pub dominant_function: u8,
    pub auxiliary_function: u8,
    pub enneagram_type: u8,
    pub enneagram_wing: u8,
    pub _pad: [u8; 3],
}

#[repr(C)]
pub struct M4GeneKeysLayer {
    pub gene_keys_activation: u64,
    pub shadow_mask: u64,
    pub gift_mask: u64,
    pub siddhi_mask: u64,
    pub life_work_hex: u8,
    pub evolution_hex: u8,
    pub radiance_hex: u8,
    pub purpose_hex: u8,
    pub attraction_hex: u8,
    pub iq_hex: u8,
    pub eq_hex: u8,
    pub sq_hex: u8,
}

#[repr(C)]
pub struct M4HumanDesignLayer {
    pub hd_type: u8,
    pub hd_authority: u8,
    pub hd_profile: [u8; 2],
    pub hd_definition: u8,
    pub incarnation_cross: u8,
    pub defined_channels: u16,
    pub defined_gates: [u32; 2],
    pub _pad: [u8; 4],
}

// Safe Rust wrapper — no raw pointers exposed above this layer
pub struct NaraIdentityMatrix {
    pub layer_presence: u8,
    pub layer_0: Option<M4NumerologicalLayer>,
    pub layer_1: Option<M4AstrologicalLayer>,
    pub layer_2: Option<M4JungianLayer>,
    pub layer_3: Option<M4GeneKeysLayer>,
    pub layer_4: Option<M4HumanDesignLayer>,
    pub quintessence_hash: u64,
    pub computed: bool,
}

impl NaraIdentityMatrix {
    pub fn layers_present(&self) -> u8 {
        self.layer_presence.count_ones() as u8
    }
    pub fn hash_hex(&self) -> String {
        format!("{:016x}", self.quintessence_hash)
    }
    pub fn is_minimum_viable(&self) -> bool {
        // At minimum layer_0 (birthdate) must be present
        self.layer_presence & 0x01 != 0
    }
}
```

### File: `epi-cli/src/nara/mod.rs`

```rust
pub mod clock;      // M1 torus state
pub mod kairos;     // M2 planetary + decan state
pub mod identity;   // M4_Identity_Matrix management
pub mod oracle;     // Consent-gated oracle casting
pub mod wind;       // Master initialization

#[derive(Subcommand)]
pub enum NaraCmd {
    /// Orient the clock: compute identity + sync kairos + set torus position
    Wind {
        #[arg(long)] birth_date: Option<String>,   // YYYY-MM-DD
        #[arg(long)] birth_time: Option<String>,   // HH:MM (local time)
        #[arg(long)] birth_lat: Option<f32>,
        #[arg(long)] birth_lon: Option<f32>,
        #[arg(long)] profile: bool,                // Load from ~/.epi-logos/nara/profile.enc
        #[arg(long)] force: bool,                  // Re-wind even if already wound
    },
    /// Current M1 torus state (tick, stage, poles, Spanda track)
    Clock {
        #[arg(long)] json: bool,
    },
    /// Current M2 kairos state (planets, active decan, element, DET projection)
    Kairos {
        #[arg(long)] json: bool,
        #[arg(long)] planets: bool,    // Show all 10 planetary positions
    },
    /// Identity matrix management
    Identity {
        #[command(subcommand)]
        cmd: IdentityCmd,
    },
    /// Today's decan card (deterministic — current kairos position)
    Decan {
        #[arg(long)] json: bool,
    },
    /// M2 causal resonance for current active state
    Resonance {
        #[arg(long)] json: bool,
    },
    /// DET: transduce current M2 vibration → M3 bitboard
    Project {
        #[arg(long)] json: bool,
    },
    /// Cast oracle (consent-gated, identity-weighted)
    Oracle {
        #[command(subcommand)]
        cmd: OracleCmd,
    },
    /// Full Nara runtime status (all of above)
    Status {
        #[arg(long)] json: bool,
    },
}

#[derive(Subcommand)]
pub enum IdentityCmd {
    /// Show all layers: presence, completeness, source
    Show,
    /// Set a specific layer
    Set {
        layer: u8,              // 0-4
        #[arg(long)] from_file: Option<String>,
    },
    /// Sync layer 1 (astrological) via Kerykeion
    SyncAstro {
        #[arg(long)] date: Option<String>,   // Default: birth date from profile
        #[arg(long)] now: bool,              // Sync current sky positions instead of natal
    },
    /// Sync layer 3 (Gene Keys) computed from layer 1
    SyncGeneKeys,
    /// Set layer 2 (Jungian/MBTI)
    SetMbti {
        #[arg(long)] mbti: String,    // e.g. "INFP"
        #[arg(long)] enneagram: Option<u8>,
    },
    /// Recompute quintessence hash from current present layers
    Compute,
    /// Export hash only (public, safe to share)
    ExportHash,
    /// Show Neo4j #4.4.4.4 subgraph stats
    SubgraphStats,
}

#[derive(Subcommand)]
pub enum OracleCmd {
    /// Cast a reading (Tarot or I-Ching)
    Cast {
        #[arg(long)] system: String,    // "tarot" or "iching"
        #[arg(long)] question: String,
        #[arg(long, short = 'y')] yes: bool,  // Skip consent prompt (for agent calls)
    },
    /// Today's decan oracle (deterministic, no cast needed)
    Decan,
    /// Show oracle history for today
    History,
}
```

---

## IV. Storage Architecture

### File layout: `~/.epi-logos/nara/`

```
~/.epi-logos/nara/
  profile.json          — non-sensitive metadata (readable)
  identity/
    layer_0.enc         — numerological data (ChaCha20-Poly1305)
    layer_1.enc         — astrological natal chart
    layer_2.enc         — Jungian/MBTI profile
    layer_3.enc         — Gene Keys activation
    layer_4.enc         — Human Design (stub)
    quintessence.bin    — BLAKE3 hash (8 bytes, public — not sensitive)
  kairos/
    current.json        — latest Kerykeion output (ephemeral, refreshed daily)
    natal.json          — natal chart cache (stable once computed)
  oracle/
    history.jsonl       — oracle cast log (date, system, question, result — no raw data)
```

### `profile.json` format

```json
{
  "version": 1,
  "layers": {
    "0": { "present": true, "source": "manual", "completeness": 5, "set_at": 1741651200 },
    "1": { "present": true, "source": "kerykeion", "completeness": 4, "set_at": 1741651200 },
    "2": { "present": true, "source": "manual", "completeness": 3, "set_at": 1741651200 },
    "3": { "present": false, "source": "absent", "completeness": 0, "set_at": null },
    "4": { "present": false, "source": "absent", "completeness": 0, "set_at": null },
    "5": { "present": true, "source": "computed", "completeness": 1, "set_at": 1741651200 }
  },
  "layer_presence_mask": 7,
  "hash_preview": "8a3f2c1d",
  "last_wound": 1741651200,
  "kerykeion_version": "4.x"
}
```

### Encryption

- Algorithm: ChaCha20-Poly1305 (Rust `chacha20poly1305` crate)
- Key derivation: Argon2id from passphrase → 32-byte key
- Each layer file: independently encrypted with same key, unique nonce
- Key never stored — derived on demand from passphrase prompt

---

## V. The Wind Sequence (Full)

```
epi nara wind [--profile | --birth-date ... --birth-time ... --birth-lat ... --birth-lon ...]

1. LOAD existing profile (if --profile or profile exists)
   → Read profile.json → determine which layers present
   → Decrypt present layers (passphrase prompt if needed)

2. ACQUIRE missing inputs
   → If layer_0 absent: prompt birth date, compute numerological_key
   → If layer_1 absent: prompt birth date+time+location, run Kerykeion
   → If layer_2 absent: prompt MBTI type, compute nucleotide_balance
   → If layer_3 absent: compute from layer_1 (I-Ching hexagram from sun position)
   → If layer_4 absent: skip (stub) — print "Human Design integration pending"

3. COMPUTE identity matrix
   FFI: m4_identity_compute(&matrix, &input_data)
   → dna_profile synthesized from layers 1+2+3
   → input_data zeroed immediately (PCO Privacy Law)
   → m4_identity_hash_compute(&matrix)
   → quintessence_hash populated

4. SYNC current kairos
   → Run Kerykeion with today's date: current planetary positions
   → Write to kairos/current.json
   → Compute: active_decan, active_tattva, active_elem_sig from planet positions

5. ORIENT torus
   → torus_pos = current_sun_degree / 60 (clamped to 0-11)
   → cf_substage = planetary_hour(current_time)   // from M2 planetary hour calc
   → Spanda stage derived: torus_pos maps to Spanda_Stage

6. COMPUTE DET projection
   → active_m2_indices[] from current planetary positions → decan indices
   → transduce_vibration_to_symbol(active_m2_indices, count) → m3_projection

7. WRITE to SpacetimeDB (if gateway running)
   → M1TorusState: torus_pos, spanda_stage, active_poles
   → M2VibrationalState: active_decan, active_elem, active_tattva, m3_projection
   → M2PlanetaryState: all 10 planets
   → CoordinatePresence: session_id, quintessence_hash, coordinate="#4.0", degree_anchor

8. SAVE profile
   → Encrypt layers to ~/.epi-logos/nara/identity/
   → Write quintessence.bin
   → Update profile.json

9. RETURN wound state
   {
     "wound": true,
     "layers_present": 3,
     "layers_total": 5,
     "quintessence_hash": "8a3f2c1d5e7b9a2f",
     "torus_pos": 3,
     "spanda_stage": "TRIKA",
     "active_decan": 17,
     "decan_name": "Gemini III",
     "element": "Air",
     "m3_projection": "0x4d2a1c...",
     "message": "Clock wound: 3/5 identity layers active. Hash: 8a3f..."
   }
```

---

## VI. Gateway RPC Methods

All `nara.*` methods live in `epi-cli/src/gate/nara.rs` and are dispatched from `gate/server.rs`.

### Complete method list

```
// Initialization
nara.wind          — runs full wind sequence (requires natal data in payload or profile)
nara.status        — full runtime status JSON

// Clock (M1)
nara.clock.status  — { torus_pos, spanda_stage, ascending, active_poles, element_count }
nara.clock.tick    — advance torus_pos by N steps (N default 1)

// Kairos (M2)
nara.kairos.current    — { active_decan, active_elem, active_tattva, planetary_positions }
nara.kairos.sync       — re-run Kerykeion for today, update tables
nara.kairos.decan      — { decan_name, element, face, ruling_planet, cousto_freq, medicine }
nara.kairos.resonance  — M2 causal resonance cross-lit conditions for active state
nara.kairos.project    — DET: transduce current M2 → M3 bitboard

// Identity (M4 #4.0)
nara.identity.get      — { layer_presence, hash, nucleotide_balance, degree_anchors }
                         // NEVER raw personal data — hash + derived public fields only
nara.identity.layers   — { layers: [{index, present, source, completeness}] }
nara.identity.compute  — recompute hash from present layers (after augment)
nara.identity.layer.set — set a specific layer (encrypted in payload) — write-gated

// Oracle (consent-gated)
nara.oracle.cast   — { system, question, consent: true } → { draw, synthesis, resonance }
nara.oracle.decan  — deterministic decan oracle for today (no consent needed)
nara.oracle.history — today's oracle cast log

// Personal Cosmos (coordinate navigation with personal overlay)
nara.cosmos.navigate   — { coordinate } → { dossier, personal_overlay }
                         // personal_overlay: gene_keys match, touch_count, element_alignment
nara.cosmos.subgraph   — { depth } → user's #4.4.4.4 Neo4j subgraph summary
```

---

## VII. SpacetimeDB Schema (Complete)

```rust
// === CANONICAL STRUCTURE (from admin Bimba — seeded once) ===

#[spacetimedb::table(public)]
pub struct M0ArchetypeTable {
    #[primary_key] pub index: u8,
    pub name: String,
    pub polarity: u8,
    pub sub_table_kind: u8,
    pub complement: u8,
}

#[spacetimedb::table(public)]
pub struct M1TorusState {
    #[primary_key] pub id: u32,       // Single row, id=0
    pub torus_pos: u8,                // QL_Tick 0-11
    pub spanda_stage: u8,             // Spanda_Stage enum value
    pub active_poles: u8,             // state_bits (0x01/0x02/0x03)
    pub spanda_track: u8,             // 0=Mahamaya, 1=Parashakti
    pub ascending: bool,
    pub element_count: u8,            // TOPOLOGICAL_ELEMENT_COUNT_LUT[torus_pos]
    pub updated_at: u64,
}

#[spacetimedb::table(public)]
pub struct M2PlanetaryState {
    #[primary_key] pub planet_id: u8, // Planet_Id (0-9) from m2.h
    pub degree_anchor: u16,           // 0-719 current position on SU(2) ring
    pub current_decan: u8,            // 0-71 flat decan index
    pub decan_face: u8,               // 0=light, 1=shadow
    pub elem_sig: u8,                 // Elemental_Signature packed byte
    pub keplerian_vel: u16,           // From LUT — animation rate
    pub cousto_freq: u16,             // From LUT — audio frequency
    pub updated_at: u64,
}

#[spacetimedb::table(public)]
pub struct M2VibrationalState {
    #[primary_key] pub id: u32,       // Single row, id=0
    pub active_decan: u8,             // 0-71 flat index
    pub active_elem_sig: u8,          // Elemental_Signature packed
    pub active_tattva: u8,            // 0-35
    pub tattva_division: u8,          // 0=Shuddha, 1=ShuddhasHuddha, 2=Ashuddha
    pub m3_projection: u64,           // DET-projected M3 bitboard
    pub updated_at: u64,
}

#[spacetimedb::table(public)]
pub struct M3BitboardState {
    #[primary_key] pub id: u32,       // Single row, id=0
    pub current_matrix: u64,          // M3_Matrix_Word — active hexagram mask
    pub torus_position: u8,           // Redundant with M1 — kept for query locality
    pub degrees_elapsed: u16,         // 0-719 current clock position
    pub updated_at: u64,
}

// === USER PRESENCE (written by each user's gateway) ===

#[spacetimedb::table(public)]
pub struct CoordinatePresence {
    #[primary_key] pub session_id: String,
    pub quintessence_hash: u64,       // BLAKE3 — no personal data
    pub hash_preview: String,         // First 8 hex chars for display
    pub coordinate: String,           // Current coordinate e.g. "M4.2"
    pub degree_anchor: u16,           // Current position on the 360° wheel
    pub nucleotide_sig: u8,           // High nibble=dominant element, low=secondary
                                      // Derived from hash, not original weights
    pub layer_count: u8,              // How many identity layers active (0-5)
                                      // Not which layers — just how many
    pub torus_pos: u8,                // Current torus position (public)
    pub last_seen: u64,
}

#[spacetimedb::table(public)]
pub struct CoordinateHeat {
    #[primary_key] pub coordinate: String,
    pub presence_count: u32,          // Current occupants
    pub dwell_total_s: u64,           // Aggregate dwell time in seconds
    pub last_active: u64,
}
```

### SpacetimeDB Reducers (Rust WASM module)

```rust
// Called by each user's Rust gateway on session events
#[spacetimedb::reducer]
pub fn update_presence(ctx: &ReducerContext,
                       session_id: String,
                       hash: u64,
                       coordinate: String,
                       degree_anchor: u16,
                       nucleotide_sig: u8,
                       layer_count: u8) { ... }

#[spacetimedb::reducer]
pub fn update_torus(ctx: &ReducerContext, pos: u8, stage: u8, poles: u8) { ... }

#[spacetimedb::reducer]
pub fn update_planetary(ctx: &ReducerContext, planet_id: u8, degree: u16,
                        decan: u8, elem_sig: u8) { ... }

#[spacetimedb::reducer]
pub fn update_vibrational(ctx: &ReducerContext, active_decan: u8,
                           elem_sig: u8, tattva: u8, m3_proj: u64) { ... }

// Admin-only: seed canonical ontology tables from Bimba Neo4j sync
#[spacetimedb::reducer]
pub fn seed_archetype(ctx: &ReducerContext, index: u8, name: String,
                      polarity: u8, complement: u8) { ... }
```

---

## VIII. Frontend Identity Panel (M4' Right Panel)

Three blocks, expanding downward. All data from `nara.identity.get` + `nara.kairos.current`.

### Block 1 — Quintessence Signature (#4.0-5)

```
┌─────────────────────────────────────┐
│ ◈  8a3f2c1d5e7b9a2f                 │  ← hash displayed as personal sigil
│                                     │
│  A ████████░░ 🜄  T ██████░░░░ 🜂    │  ← nucleotide bars with elemental glyphs
│  C █████░░░░░ 🜃  G ███░░░░░░░ 🜁    │
│                                     │
│  ● 3/5 identity layers active       │  ← layer count (not which layers)
│  ○ Human Design: pending            │  ← absent layers shown as pending
│  ○ Gene Keys: pending               │
└─────────────────────────────────────┘
```

### Block 2 — Kairos Position (#4.0-1 × current sky)

```
┌─────────────────────────────────────┐
│ TODAY'S KAIROS                      │
│                                     │
│  Decan 17 · Gemini III · Air ☁      │  ← from nara.kairos.decan
│  Ruling: ♄ Saturn  148Hz            │  ← planet + Cousto frequency
│  Face: shadow                       │  ← light/shadow face
│  Tattva: Prakriti (#13 Ashuddha)    │  ← active tattva
│                                     │
│  Natal ○ Water → Current ● Air      │  ← personal resonance tension
│  ░░░░░░░░[●]░░░░░░░░░               │  ← mini degree arc showing position
│  🜄 home  ↗  🜁 displaced            │
└─────────────────────────────────────┘
```

### Block 3 — Active Resonance + M3 Projection

```
┌─────────────────────────────────────┐
│ RESONANCE                           │
│                                     │
│  Cross-lit: Tattva 8, 21, 34        │  ← M2 causal resonance cross-lit
│  DET → ⚌ Hex 29  ⚋ Hex 6  ⚍ Hex 47 │  ← M3 Gene Keys lit by current sky
│                                     │
│  ♃ Jupiter crossing your ☉ sector  │  ← significant planetary transit
│  Torus: tick 3 · TRIKA · ascending  │  ← M1 state
│                                     │
│  #4.4.4.4: 47 nodes · +3 today     │  ← personal subgraph growth
└─────────────────────────────────────┘
```

---

## IX. Kerykeion Integration

### Python subprocess wrapper in Rust

```rust
// epi-cli/src/nara/kairos.rs

pub struct KerykeionResult {
    pub planets: Vec<PlanetPosition>,
    pub dominant_sign: u8,
    pub dominant_element: u8,
}

pub struct PlanetPosition {
    pub planet_id: u8,     // Planet_Id from m2.h ordering
    pub degree: f32,       // 0.0-360.0 ecliptic longitude
    pub degree_anchor: u16, // 0-719 SU(2) mapped
    pub retrograde: bool,
}

pub fn run_kerykeion_natal(
    birth_date: &str,   // "1990-06-15"
    birth_time: &str,   // "14:30"
    lat: f32,
    lon: f32,
) -> Result<KerykeionResult, String> {
    // Inline Python via subprocess:
    // python3 -c "
    //   from kerykeion import KrInstance
    //   k = KrInstance('User', 1990, 6, 15, 14, 30, lat, lon)
    //   import json; print(json.dumps({...}))
    // "
    // Parse JSON output → KerykeionResult
    // Map ecliptic longitude (0-360) → degree_anchor (0-719):
    //   day phase: degree_anchor = round(longitude * 1.0)     // 0-359
    //   apply SU(2) implicate shift if descending node: +360   // 360-719
}

pub fn run_kerykeion_current(date: &str) -> Result<KerykeionResult, String> {
    // Same but for current date/time — gives live planetary positions
}
```

---

## X. M4' Frontend Modes (Full Map)

```
NaraMode enum (expanded):
  'journal'       → flow.md  — TipTap, autosave, agent watches
  'daily_note'    → CT4b Daily Note — activity feed + tasks + morning seed
  'oracle'        → rebuilt M4-2View — decan card + cast zone
  'dream'         → dream journal — symbolic pre-analysis via M2/M3
  'cosmos'        → coordinate navigator with personal overlay
  'dialogue'      → raw conversation in full archetypal context
```

### Agent context on session open (assembled by gateway before first message)

```json
{
  "archetypal_profile": {
    "dominant_element": "Water",
    "nucleotide": { "A": 210, "T": 145, "C": 160, "G": 98 },
    "dominant_function": "Fe (Extraverted Feeling)",
    "natal_sign": "Scorpio",
    "natal_decan": 29
  },
  "kairos_today": {
    "active_decan": 17,
    "decan_name": "Gemini III",
    "element": "Air",
    "ruling_planet": "Saturn",
    "resonance_tension": "Water-native in Air-displaced: introspection pressure"
  },
  "daily_note": {
    "path": "Idea/Empty/Present/2026/03/W10/10/daily-note.md",
    "sessions_today": 2,
    "tasks_complete": 3,
    "tasks_pending": 1,
    "morning_seed": "What wants to be seen today?"
  },
  "identity_context": {
    "hash": "8a3f2c1d5e7b9a2f",
    "active_hexagrams": [29, 6, 47],
    "subgraph_nodes": 47
  }
}
```

---

## X-B. Complete Sub-Branch Operations Map (#4.1–#4.5)

### #4.1 Medicine — Elemental Triage & Remedy Prescription

Seven nodes: #4.1-0 Triage, #4.1-1 Elemental Balance, #4.1-2 Chakra Map, #4.1-3 Materia,
#4.1-4 Temporal Intelligence (THE timing authority), #4.1-5 Safety Gate, #4.1-6 Practice Prescriptions.

The medicine system answers: "what does this person need right now?" grounded in elemental
balance (layer_2 nucleotide weights), kairos decan state (M2), and the planetary hour authority
(#4.1-4). It never bypasses the safety gate (#4.1-5).

**Architecture invariant:** #4.1-4 Temporal Authority must be consulted FIRST. The planetary
hour, lunar phase, and active decan determine which medicines are seasonally appropriate before
any elemental or chakra analysis runs.

#### CLI Commands (`epi nara medicine`)

```rust
#[derive(Subcommand)]
pub enum MedicineCmd {
    /// Current elemental balance (nucleotide weights + kairos overlay)
    Balance {
        #[arg(long)] json: bool,
    },
    /// Active chakra state derived from current elemental + temporal position
    Chakra {
        #[arg(long)] json: bool,
    },
    /// Today's materia — elements, herbs, tones, colors by kairos
    Materia {
        #[arg(long)] json: bool,
    },
    /// Prescription: practice recommendations timed to planetary hour
    Prescribe {
        #[arg(long, default_value = "general")] context: String,
        // "morning" | "evening" | "integration" | "crisis" | "general"
        #[arg(long)] json: bool,
    },
    /// Safety check: contraindications for current state
    Safety {
        #[arg(long)] json: bool,
    },
}
```

#### Gateway RPC Methods

```
nara.medicine.balance       — elemental triage from nucleotide + kairos overlay
                              { fire_surplus, water_deficit, prescriptive_direction }
nara.medicine.chakra        — active chakra map from current elemental state
                              { primary_chakra, activation_level, imbalance_vector }
nara.medicine.materia       — today's materia from kairos.decan
                              { elements[], herbs[], tones[], colors[], cousto_freq }
nara.medicine.prescribe     — practice prescriptions timed to #4.1-4 temporal authority
                              requires: kairos.current first, then nucleotide balance
                              { practices[], duration_min, planetary_hour, timing_note }
nara.medicine.safety        — contraindication check for current state + proposed practice
                              { safe: bool, warnings[], substitutions[] }
```

#### M4_Medicine_Triage C struct (in m4.h)

```c
// #4.1 — Elemental Triage / Medicine prescription
// All fields deterministic from identity + kairos state
typedef struct {
    // Current elemental balance (weighted by nucleotide + kairos overlay)
    uint8_t  fire_level;          // 0-255, weighted Fire (Thymine + current decan)
    uint8_t  water_level;         // Adenine + current lunar phase
    uint8_t  earth_level;         // Cytosine + current earth sign transit
    uint8_t  air_level;           // Guanine + current air sign transit

    // Derived tension signal
    uint8_t  dominant_elem;       // 0=Fire, 1=Water, 2=Earth, 3=Air
    uint8_t  deficient_elem;      // Opposite of dominant
    int8_t   triage_vector;       // -127 to +127: excess→remedy direction

    // Temporal gate (must be set by #4.1-4 before prescription runs)
    uint8_t  planetary_hour;      // 0-23 current planetary hour (Saturn=0..Moon=6 cycling)
    uint8_t  lunar_phase;         // 0-7 (0=New, 4=Full)
    uint8_t  active_decan_face;   // 0=light, 1=shadow

    // Safety flags
    uint8_t  safety_mask;         // Bit 0=crisis_state, 1=high_fire, 2=void_of_course, ...

    // Active chakra (derived from element levels + trike mapping)
    uint8_t  primary_chakra;      // 0=Root, 1=Sacral, 2=Solar, 3=Heart, 4=Throat, 5=Third, 6=Crown
    uint8_t  chakra_activation;   // 0-255

    uint8_t  _pad[2];
} M4_Medicine_Triage;             // #4.1 — 16 bytes
```

---

### #4.2 Oracle — Divinatory Frameworks (Six-Fold Oracular System)

Seven nodes: #4.2-0 Common Substrate, #4.2-1 Tarot Engines, #4.2-2 I-Ching Integration,
#4.2-3 Casting & Randomness Layer, #4.2-4 Interpretation Layer, #4.2-5 Divinatory Hygiene
& Pedagogy. Parent coordinate: #4.2.

**The key architectural fact missed by the existing plan:** #4.2-0 (Common Substrate) is NOT
merely an oracle abstraction layer. It is a **canonical tag emitter** — after any divination,
it emits a structured payload:

```
{ elements: [], organs: [], bodyZones: [], operations: [], timing: [], lens: [] }
```

These tags are machine-readable. `#4.2-0 EMITS_CANONICAL_TAGS_TO #4.1` and
`#4.2-0 EMITS_CANONICAL_TAGS_TO #4.3`. This means:
- The oracle result directly informs medicine prescriptions (elements → elemental balance)
- The oracle result directly specifies alchemical operations (operations → which of the 7)
- The oracle result carries timing data for #4.1-4 temporal gate

The oracle is not decorative. It drives the system.

**Temporal authority chain:** `#4.1-4 PROVIDES_TIMING_FOR #4.2` — the planetary hour must be
consulted before casting. `#4.2 PROVIDES_ORACULAR_SIGNAL #4.3` — the cast result feeds the
transformation engine. `#4.2 OFFERS_LENS_HINTS #4.3` — the oracle's symbolic grammar suggests
which alchemical operation and interpretive lens to invoke. `#4.2 FEEDS_INTERPRETATION_TO #4.5`
— oracle draws are included in the Logos Cycle synthesis.

#### Sub-Node Architecture

| Node | Role | Key Data |
|------|------|----------|
| #4.2-0 | Common Substrate / Canonical Tag Emitter | Payload schema, cross-system equivalence table |
| #4.2-1 | Tarot Engines | 4 grammars: Marseille, RWS, Thoth, QL-Quaternary |
| #4.2-2 | I-Ching Integration | Casting methods, moving lines, nuclear hexagrams, concrescence mapping |
| #4.2-3 | Casting & Randomness Layer | RNG: temporal / quantum / user-seeded; consent gate |
| #4.2-4 | Interpretation Layer | Modes: RuleBased / Generative / Hybrid |
| #4.2-5 | Divinatory Hygiene & Pedagogy | Bias check, re-asking protocol, agency emphasis, learning tracking |

#### CLI Commands (`epi nara oracle` — expanded from Section III)

```rust
#[derive(Subcommand)]
pub enum OracleCmd {
    // Existing commands (Section III):
    Cast {
        #[arg(long)] system: String,     // "tarot-rws" | "tarot-thoth" | "tarot-marseille" | "tarot-ql" | "iching"
        #[arg(long)] question: String,
        #[arg(long)] spread: Option<String>,  // "single" | "three-card" | "celtic" | "hexagram"
        #[arg(long)] rng: Option<String>,     // "temporal" (default) | "quantum" | "seed:<n>"
        #[arg(long, short = 'y')] yes: bool,
    },
    Decan,
    History,

    // New sub-node commands:

    /// Show the canonical tag payload from the last oracle cast (#4.2-0)
    Payload {
        #[arg(long)] cast_id: Option<String>,  // Default: latest
        #[arg(long)] json: bool,
    },
    /// I-Ching: cast with specific method; show moving lines + nuclear hexagram
    Iching {
        #[arg(long)] method: Option<String>,   // "yarrow" | "coins" | "digital" (default)
        #[arg(long)] question: String,
        #[arg(long, short = 'y')] yes: bool,
    },
    /// Show I-Ching concrescence phase for a hexagram (maps to M4 torus position)
    Concrescence {
        #[arg(long)] hexagram: u8,   // 1-64
        #[arg(long)] json: bool,
    },
    /// Interpretation of a previous cast using a specific mode
    Interpret {
        #[arg(long)] cast_id: String,
        #[arg(long)] mode: Option<String>,    // "rule" | "generative" | "hybrid" (default)
        #[arg(long)] context: Option<String>, // Additional context for generative mode
    },
    /// Hygiene check: bias detection, re-ask guard, agency emphasis
    Hygiene {
        #[arg(long)] cast_id: Option<String>,  // Default: latest
    },
}
```

#### Gateway RPC Methods (expanded from Section VI)

```
// Existing (Section VI, now clarified):
nara.oracle.cast        — consent-gated cast
                          Input: { system, question, spread?, rng?, consent: true }
                          Response: { cast_id, draw[], canonical_payload, interpretation, resonance }
                          → auto-triggers nara.oracle.payload.emit after successful cast

nara.oracle.decan       — deterministic decan oracle (no consent, no cast)
nara.oracle.history     — today's cast log

// New — exposing sub-node capabilities:
nara.oracle.payload     — retrieve #4.2-0 canonical tag payload from a cast
                          { cast_id, elements[], organs[], bodyZones[], operations[], timing[], lens[] }
                          NOTE: agents call this to route oracle → #4.1 or #4.3

nara.oracle.payload.apply — route canonical payload to target subsystem
                          Input: { cast_id, target: "medicine"|"transform" }
                          If "medicine": calls nara.medicine.balance with element overlay
                          If "transform": calls nara.transform.commit with operations[] + timing[]
                          This is the machine-readable oracle pipeline (automatic after cast)

nara.oracle.iching      — I-Ching cast with method selection
                          { method, question, consent }
                          Response: { cast_id, hexagram_primary, hexagram_relating,
                                      moving_lines[], nuclear_hexagram, concrescence_phase,
                                      canonical_payload }

nara.oracle.concrescence — map I-Ching hexagram to torus concrescence phase
                          { hexagram, torus_pos, spanda_stage, cf_substage }

nara.oracle.interpret   — apply interpretation mode to a cast
                          Input: { cast_id, mode: "rule"|"generative"|"hybrid", context? }
                          Response: { interpretation_text, key_symbols[], lens_hints[] }

nara.oracle.hygiene     — bias check and pedagogical guidance on a cast
                          { cast_id, bias_flags[], agency_notes[], re_ask_guard: bool,
                            learning_integration_prompt }
```

#### C Struct — M4_Oracle_Draw (#4.2 output, feeds #4.2-0 payload)

```c
// Canonical payload emitted by #4.2-0 after every cast
// This is the machine-readable bridge between oracle and operational subsystems
typedef struct {
    // Payload schema from #4.2-0
    uint8_t  elements[6];        // Up to 6 element tags (Fire=0, Water=1, Earth=2, Air=3, Void=4)
    uint8_t  element_count;
    uint8_t  organs[4];          // Up to 4 organ/body system references (index into LUT)
    uint8_t  organ_count;
    uint8_t  body_zones[4];      // Up to 4 body zone references
    uint8_t  body_zone_count;
    uint8_t  operations[3];      // Alchemical operations suggested (0-7, from M4_Transform_State ops)
    uint8_t  operation_count;

    // Timing payload — directly feeds #4.1-4 temporal gate
    uint8_t  timing_planetary_hour; // Optimal planetary hour for action (0-6)
    uint8_t  timing_lunar_phase;    // Optimal lunar phase (0-7)
    uint8_t  timing_urgency;        // 0=no rush, 1=today, 2=this hour

    // Lens hints — feeds #4.4
    uint8_t  lens_hint[3];          // Suggested #4.4 lens indices (0-5)
    uint8_t  lens_hint_count;

    // Meta
    uint32_t cast_id;               // Unique identifier for this cast
    uint8_t  system;                // 0=Tarot-RWS, 1=Tarot-Thoth, 2=Tarot-Marseille,
                                    //   3=Tarot-QL, 4=I-Ching
    uint8_t  spread;                // 0=single, 1=three-card, 2=celtic, 3=hexagram
    uint8_t  interpretation_mode;   // 0=rule, 1=generative, 2=hybrid
    uint8_t  hygiene_passed;        // Bit 0=bias_ok, 1=reask_ok, 2=agency_noted

    // For Tarot draws: card indices (0-77 for 78-card decks, 0-63 for QL deck)
    uint8_t  card_ids[10];
    uint8_t  card_count;
    uint8_t  reversals;             // Bitmask: bit N = card N is reversed

    // For I-Ching: hexagram data
    uint8_t  hexagram_primary;      // 1-64
    uint8_t  hexagram_relating;     // 1-64 (0 if no moving lines)
    uint8_t  hexagram_nuclear;      // 1-64 (inner nuclear hexagram)
    uint8_t  moving_lines;          // Bitmask: bit 0-5 = lines 1-6

} M4_Oracle_Draw;                   // #4.2 output — 40 bytes
```

#### I-Ching Concrescence Phase Mapping (#4.2-2)

The concrescence phase map connects I-Ching hexagrams to the M1 torus position — so divination
is not temporally isolated but located in the current phase of the cosmic cycle.

```rust
// epi-cli/src/nara/oracle.rs
// Hexagrams 1-64 → torus_pos (0-11) based on traditional sequence groupings
// Derived from King Wen sequence mapped to 12-tick SU(2) ring:
//   Ticks 0-1 (spring): hexagrams 1-11 (creative/receptive + early growth)
//   Ticks 2-3: hexagrams 12-22 (manifestation + challenge)
//   Ticks 4-5: hexagrams 23-33 (turning point + return)
//   Ticks 6-7 (autumn): hexagrams 34-44 (abundance → dispersal)
//   Ticks 8-9: hexagrams 45-55 (gathering → completion)
//   Ticks 10-11: hexagrams 56-64 (wandering → before/after completion)

pub fn hexagram_to_torus_pos(hexagram: u8) -> u8 {
    // Maps King Wen sequence to 12-tick clock
    // Returns 0-11 (wraps at 12)
    ((hexagram.saturating_sub(1)) * 12 / 64) as u8
}
```

#### Tarot QL-Quaternary Grammar (#4.2-1 bespoke deck)

The QL-Quaternary deck is the system-native Tarot grammar — designed around the #0-#5
archetypes and the 6 coordinate families. This is not implemented yet but is the long-term
design direction:

```
QL-Quaternary Deck structure (planned):
  Major Arcana: 22 cards → remapped to #0-#5 × coordinate families + inversions
    0: # (The Inversion) — The Fool remapped
    1-6: #0-#5 (the six raw archetypes)
    7-12: P0-P5 (Position family)
    13-18: S0-S5 (Stack family)
    19-21: C0, C4, C5 (Bimba-Lemniscate-Pratibimba triad)
  Minor Arcana: 56 cards → 4 suits × 14 cards
    Suits: Fire (Wands), Water (Cups), Earth (Pentacles), Air (Swords)
    Court: Page/Knight/Queen/King → cpf/ct/cf/cs (contextual coordinates)
```

#### Hygiene Protocols (#4.2-5) as Static Guards

```rust
// These run automatically before every oracle.cast dispatch
// Hard blocks: prevent cast
// Soft blocks: add warning to interpretation, suggest pause

pub enum HygieneResult {
    Clear,
    Warning { flags: Vec<HygieneFlag>, notes: Vec<&'static str> },
    Block { reason: &'static str },
}

pub enum HygieneFlag {
    // Soft
    RecentCast { minutes_ago: u32 },   // Cast within 10 minutes: "allow the question to breathe"
    SameQuestion,                       // Identical question asked in last 24h: re-asking guard
    HighEmotionalState,                 // Detected from journal sentiment (future)
    // Hard
    ExcessiveFrequency { casts_today: u32 }, // >6 casts today → hard block
}

// Re-asking protocol: if SameQuestion detected, surface the previous answer first.
// "You asked this on [date]. The answer was [draw]. Let's look at that again before casting."
```

---

### #4.3 Transformation — Alchemical Cycle Engine + Dialogical Containers

Ten nodes: #4.3-0 Cycle Engine, #4.3-1 Seven Operations (Nigredo→Rubedo+Albedo+Citrinitas+
Solutio+Coagulatio+Sublimatio+Calcinatio), #4.3-2 Dialogical Containers (3 types),
#4.3-3 Decan Recipe Cards (36 recipes × 3 alchemical ops), #4.3-4 Telemetry,
#4.3-5 Commitment Engine, #4.3-6 Threshold Keeper, plus sub-branches.

**Architecture invariant:** #4.3 ENACTS transformation. It does not interpret. All
interpretive work flows to #4.4. The cycle engine tracks outer stroke (journal write)
and inner stroke (reflection/integration) — both must complete for a cycle to close.

#### CLI Commands (`epi nara transform`)

```rust
#[derive(Subcommand)]
pub enum TransformCmd {
    /// Show current alchemical cycle state (which operation, which stroke)
    Status {
        #[arg(long)] json: bool,
    },
    /// Open a dialogical container
    Container {
        #[command(subcommand)]
        cmd: ContainerCmd,
    },
    /// Record outer stroke (journal entry initiates transformation cycle)
    Write {
        #[arg(long)] note: Option<String>,  // If absent: opens TipTap in M4' journal mode
    },
    /// Record inner stroke (reflection/integration — closes the cycle)
    Reflect {
        #[arg(long)] cycle_id: String,      // The cycle to close
        #[arg(long)] note: Option<String>,
    },
    /// Today's decan recipe card (which alchemical ops are supported today)
    Recipe {
        #[arg(long)] json: bool,
    },
    /// Commitment: set an alchemical intention for today
    Commit {
        #[arg(long)] operation: String,  // "nigredo" | "solutio" | "calcinatio" etc.
        #[arg(long)] note: Option<String>,
    },
    /// Cycle history: all open and closed transformation cycles
    History {
        #[arg(long)] open: bool,   // Show only open (incomplete) cycles
        #[arg(long)] json: bool,
    },
}

#[derive(Subcommand)]
pub enum ContainerCmd {
    /// Open Bohmian Dialogue container (#4.3-2.0)
    Bohm {
        #[arg(long)] topic: Option<String>,
        #[arg(long)] participant: Option<String>,  // "solo" by default
    },
    /// Open Native Talking Circle (#4.3-2.1)
    Circle {
        #[arg(long)] theme: Option<String>,
    },
    /// Open Diamond Approach Inquiry (#4.3-2.2)
    Diamond {
        #[arg(long)] inquiry: Option<String>,
    },
    /// Show active container state
    Status,
    /// Close the active container with a closing gesture
    Close {
        #[arg(long)] gesture: Option<String>,  // Words for the closing
    },
}
```

#### Gateway RPC Methods

```
nara.transform.status       — current cycle engine state
                              { open_cycles: N, current_op, stroke_state: "outer"|"inner"|"closed" }
nara.transform.cycle.open   — begin a new transformation cycle (outer stroke ready)
                              { cycle_id, initiated_at, op, recipe_card }
nara.transform.cycle.close  — record inner stroke, close cycle
                              { cycle_id, closed_at, duration_h, completeness }
nara.transform.recipe       — today's decan recipe card (#4.3-3)
                              { decan, op_primary, op_secondary, timing_guidance }
nara.transform.commit       — set alchemical intention for today
                              { operation, note, committed_at }
nara.transform.history      — open + closed cycles for today/week

// Dialogical Containers (#4.3-2) — distinct first-class practices
nara.container.open         — { type: "bohm"|"circle"|"diamond", params }
                              Response: { container_id, opening_ritual_text, protocols[] }
nara.container.status       — active container: type, opened_at, protocol_state
nara.container.turn         — record a speaking turn (Talking Circle turns / inquiry exchange)
                              { container_id, content, speaker? }
nara.container.close        — close container with closing gesture, journal the container record
                              { container_id, gesture, container_record_path }
```

#### Container Protocol Definitions (static data in gate/nara.rs)

```rust
// Each container has:
// - An opening ritual (words + action)
// - Active protocols (what is and isn't permitted)
// - A closing gesture
// These are static, never user-configurable — they reflect actual traditions

pub struct DialogicalContainer {
    pub kind: ContainerKind,             // Bohm | TalkingCircle | Diamond
    pub opening_ritual: &'static str,   // Read aloud to enter
    pub protocols: &'static [&'static str],
    pub closing_gesture: &'static str,
}

// Bohmian Dialogue protocols:
//   - "Suspend all assumptions — hold them visible, not acted on"
//   - "Speak when moved; silence is equal participation"
//   - "Listen without preparing your response"
//   - "If you notice defensiveness, name it as an object in the field"

// Native Talking Circle protocols:
//   - "The talking piece grants the right to speak; holding it grants the right to silence"
//   - "All voices are equal; no rank exists in the circle"
//   - "Speak from your own experience — no advice, no debate"
//   - "What is shared in the circle stays in the circle"

// Diamond Approach protocols:
//   - "Stay with direct experience — not concepts about experience"
//   - "Inquire into what is actually present, not what should be present"
//   - "Follow the thread of aliveness, not the story"
//   - "The inquiry is complete when something lands — not when you understand it"
```

#### M4_Transform_State C struct

```c
// #4.3 — Transformation cycle tracking
typedef struct {
    uint8_t  current_op;        // 0=Nigredo, 1=Albedo, 2=Citrinitas, 3=Rubedo,
                                //   4=Solutio, 5=Coagulatio, 6=Sublimatio, 7=Calcinatio
    uint8_t  stroke_state;      // 0=idle, 1=outer_open, 2=inner_open, 3=closed
    uint8_t  open_cycles;       // How many cycles currently open
    uint8_t  closed_today;      // Cycles completed today

    uint32_t active_cycle_id;   // Current cycle being tracked (or 0 if none)
    uint32_t committed_op_mask; // Which ops have commitments today (bitmask)

    // Container state
    uint8_t  container_open;    // 0=none, 1=bohm, 2=circle, 3=diamond
    uint8_t  container_turns;   // Speaking turns in current container
    uint16_t container_age_min; // Minutes since container opened
} M4_Transform_State;           // #4.3 — 16 bytes
```

---

### #4.4 Lenses — Wisdom Interpretation (Six Lenses)

Fifty-five nodes. The interpretive layer. Six distinct lenses:
- **#4.4-0** Gebser Consciousness Structures (Archaic/Magic/Mythic/Mental/Integral)
- **#4.4-1** Ontological (Being/Non-Being/Becoming/Ground)
- **#4.4-2** Epistemological (Knowing modes)
- **#4.4-3** Jungian (43 nodes: archetypes, shadow, transcendent function, individuation)
- **#4.4-4** Phenomenological (7 nodes: Heidegger/Merleau-Ponty/Husserl/Levinas layers
  + **#4.4.4.4 Personal Pratibimba** + **#4.4.4.5 Pratyabhijna**)
- **#4.4-5** Shaiva Trika (tattvas, Kashmir Shaivism recognition)

**Architecture invariant:** Lenses INTERPRET completed transformation cycles. They do not
drive action. The agent selects the germane lens(es) for the current inquiry and applies
them to journal content, oracle draws, or dream material.

#### CLI Commands (`epi nara lens`)

```rust
#[derive(Subcommand)]
pub enum LensCmd {
    /// List available lenses with current activation state
    List {
        #[arg(long)] json: bool,
    },
    /// Apply a specific lens to the latest journal entry / daily note
    Apply {
        #[arg(long)] lens: String,      // "gebser" | "jungian" | "phenomenal" | "trika" | "ontological" | "epistemological"
        #[arg(long)] target: Option<String>,  // "journal" | "oracle" | "dream" | path
        #[arg(long)] json: bool,
    },
    /// Jungian lens detail: active archetypes, shadow, individuation progress
    Jungian {
        #[arg(long)] json: bool,
    },
    /// Trika lens: active tattva, recognition moment (pratyabhijna) check
    Trika {
        #[arg(long)] json: bool,
    },
    /// Phenomenological lens: current bodily/temporal/spatial orientation
    Phenomenal {
        #[arg(long)] json: bool,
    },
    /// Cross-lens synthesis: apply multiple lenses and find convergences
    Synthesize {
        #[arg(long)] lenses: Vec<String>,
        #[arg(long)] target: Option<String>,
    },
}
```

#### Gateway RPC Methods

```
nara.lens.list              — all 6 lenses: name, activation_state, germane_to_current_kairos
nara.lens.apply             — apply named lens to target content
                              { lens, target_path, interpretation_text, key_symbols[] }
nara.lens.jungian           — Jungian state: active archetypes, shadow activity, anima/animus,
                              individuation_stage, transcendent_function_ready
nara.lens.trika             — Shaiva Trika: active_tattva_group, recognition_readiness,
                              pratyabhijna_check (are conditions present for self-recognition?)
nara.lens.phenomenal        — Phenomenological: bodily attunement, temporal orientation,
                              intersubjective openness, mood-as-disclosure
nara.lens.synthesize        — apply 2+ lenses, return convergence map
                              { convergences[], tensions[], synthesis_prompt }
nara.lens.subgraph          — query #4.4 Neo4j subgraph for active lens nodes given current state
```

#### Cross-M wiring (#4.4.4.0-5 → M2 tattvas, 14 direct edges)

The 14 phenomenological-to-tattva edges (#4.4.4.0-5 → M2) are the structural basis for the
phenomenological lens. When a phenomenological layer is active (#4.4.4.x), the corresponding
M2 tattva group is "lit" — the vibrational ground of that layer of experience becomes available
for C code direct query:

```c
// The 14 edges as a static lookup table (in gate/nara.rs or ffi/nara.rs)
// phenom_layer (0-5) → tattva_indices[] (from M2_Vibrational_72_Space)
const PHENOM_TATTVA_MAP: [[u8; 3]; 6] = [
    [0,  1,  2],   // #4.4.4.0 → Shiva/Shakti/Sadashiva tattvas (pure)
    [3,  4,  5],   // #4.4.4.1 → Ishvara/Sadvidya/Maya (mixed)
    [6,  7,  8],   // #4.4.4.2 → Purusha/Prakriti/Akasha (manifest)
    [9,  10, 11],  // #4.4.4.3 → Vayu/Agni/Apas
    [12, 13, 14],  // #4.4.4.4 → Prithivi/Gandha/Rasa (densest — personal record layer)
    [15, 16, 17],  // #4.4.4.5 → Rupa/Sparsha/Shabda (Pratyabhijna layer — recognition)
];
```

---

### #4.4.4.4 Personal Pratibimba — Three-Layer Privacy Architecture

This is the personal transformation record — the node where all completed cycles accumulate
into a growing personal subgraph in Neo4j (user's tenant space).

#### CLI Commands (`epi nara pratibimba`)

```rust
#[derive(Subcommand)]
pub enum PratibimbaCmd {
    /// Show personal subgraph stats (node count, recent additions, growth)
    Stats {
        #[arg(long)] json: bool,
    },
    /// View recent personal record entries
    Recent {
        #[arg(long, default_value = "7")] days: u32,
        #[arg(long)] json: bool,
    },
    /// Add a completed transformation cycle to the personal record
    /// Called automatically by `epi nara transform reflect` when cycle closes
    Record {
        #[arg(long)] cycle_id: String,
        #[arg(long)] lens: Option<String>,    // Which lens was applied before recording
    },
    /// Etymological archaeology: trace the root of a word/phrase in personal record
    Excavate {
        #[arg(long)] term: String,
        #[arg(long)] json: bool,
    },
    /// Sync personal record to Atlas (opt-in anonymized contribution)
    AtlasSync {
        #[arg(long, short = 'y')] yes: bool,  // Consent gate
    },
    /// Atlas: show anonymized collective pattern for current kairos position
    AtlasQuery {
        #[arg(long)] coordinate: Option<String>,
        #[arg(long)] json: bool,
    },
}
```

#### Gateway RPC Methods

```
nara.pratibimba.stats       — { node_count, edge_count, days_active, growth_rate, last_added }
nara.pratibimba.recent      — { entries: [{ date, cycle_id, op, lens_applied, tattvas_lit }] }
nara.pratibimba.record      — write a completed cycle to personal Neo4j subgraph
                              Input: { cycle_id, lens_interpretations[], tattvas_active[] }
                              Creates: :PersonalRecord node + edges to coordinate, cycle, lens nodes
nara.pratibimba.excavate    — etymological root tracing for a term
                              { term, etymology_chain[], recognition_moment? }
nara.pratibimba.atlas_sync  — anonymize + contribute cycle archetype event to Atlas
                              Strips all personal identifying data, retains only:
                              { archetype_pattern, op, lens_convergence, torus_pos, decan }
nara.pratibimba.atlas_query — query collective atlas for current coordinate/kairos
                              { archetype_pattern_frequency, common_ops[], resonant_lenses[] }
```

#### Neo4j Schema — Personal Pratibimba (user's tenant space)

```cypher
// Personal record node — created per completed cycle
(:Pratibimba:PersonalRecord {
  cycle_id: "...",
  op: "solutio",
  completed_at: timestamp,
  torus_pos: 3,
  decan: 17,
  lens_applied: "jungian",
  tattvas_active: [12, 13, 14],
  quintessence_hash: "8a3f..."   // Hash only — no personal content
})

// Relations to canonical Bimba:
-[:REFLECTS_FOUNDATION]->(:Bimba {coordinate: "#0"})   // #4.4.4.4 → #0 from dataset
-[:INSTANTIATES]->(:Coordinate {coordinate: "#4.4.4.4"})
-[:AT_DECAN]->(:Bimba {coordinate: "M2-<decan>"})
-[:USED_LENS]->(:Coordinate {coordinate: "#4.4-3"})    // if Jungian
-[:CONTRIBUTED_TO]->(:Archetype_Atlas)                  // if atlas_sync

// Anonymized Atlas node (shared space):
(:Archetype_Atlas {
  archetype_pattern: "solutio+jungian+Air",
  occurrence_count: 47,
  last_contributed: timestamp
})
```

---

### #4.5 Logos Cycle — Day Synthesis Engine

Thirteen nodes: #4.5-0 A-Logos (pre-articulate), #4.5-1 Pro-Logos (preparatory articulation),
#4.5-2 Dia-Logos (through/between the word), #4.5-3 Logos (the word itself — integration),
#4.5-4 Epi-Logos (the second-order word — meta-integration), #4.5-5 An-a-Logos (return to
unmanifest), plus curriculum (#4.5-6), voice/style (#4.5-7), transparency (#4.5-8),
pedagogy (#4.5-9), atlas output (#4.5-10).

The Logos Cycle runs over the day's completed work. Input: daily note activity feed + closed
transformation cycles. Output: structured wisdom extraction at each of the 6 stages.
This is how individual days accumulate into the #4.4.4.4 subgraph.

**Architecture invariant:** The Logos Cycle does NOT run during the day. It runs AFTER work is
done — at close of session or explicitly triggered. It is a retrospective synthesis, not a
live commentary.

#### CLI Commands (`epi nara logos`)

```rust
#[derive(Subcommand)]
pub enum LogosCmd {
    /// Run today's Logos Cycle synthesis (retrospective — triggered after session)
    Run {
        #[arg(long)] date: Option<String>,   // Default: today
        #[arg(long)] stage: Option<u8>,      // Run only a specific stage (0-5)
        #[arg(long)] json: bool,
    },
    /// Show today's Logos Cycle progress (which stages completed)
    Status {
        #[arg(long)] json: bool,
    },
    /// View a specific stage synthesis
    Stage {
        #[arg(long)] stage: u8,              // 0-5
        #[arg(long)] date: Option<String>,
        #[arg(long)] json: bool,
    },
    /// Curriculum: what is this day teaching in the larger learning arc?
    Curriculum {
        #[arg(long)] json: bool,
    },
    /// Export the day's wisdom extract to #4.4.4.4 (triggers pratibimba.record)
    Export {
        #[arg(long)] date: Option<String>,
        #[arg(long, short = 'y')] yes: bool,
    },
    /// Weekly synthesis: Logos Cycle over the past 7 days
    Weekly {
        #[arg(long)] json: bool,
    },
}
```

#### Gateway RPC Methods

```
nara.logos.run              — run full or partial Logos Cycle over session/day
                              Input: { date?, stage?: 0-5 }
                              Calls agent chain: A-Logos → Pro-Logos → ... → An-a-Logos
                              Each stage: reads daily_note + closed_cycles, writes synthesis
                              Returns: { stages_completed: [], synthesis_paths: [] }

nara.logos.status           — { stages_completed: [0,1,3], stages_pending: [2,4,5], date }

nara.logos.stage            — retrieve specific stage synthesis
                              { stage: 2, name: "Dia-Logos", synthesis: "...", date }

nara.logos.curriculum       — what learning arc is active?
                              Looks at: recent Logos outputs + Gene Keys sequence + torus position
                              { curriculum_thread, active_hexagrams[], learning_arc }

nara.logos.export           — trigger export of Logos output to #4.4.4.4 subgraph
                              Calls nara.pratibimba.record for each stage synthesis
                              { exported_nodes: N, subgraph_growth: N }
```

#### Logos Cycle Stage Definitions (static agent prompts)

```
Stage 0 — A-Logos (pre-articulate)
  Input: raw daily note (unedited), all oracle draws
  Task: identify what is not yet spoken — the felt sense before words
  Output: 1-3 pre-linguistic images/sensations ("cloud", "knot in chest", "blue light")

Stage 1 — Pro-Logos (preparatory)
  Input: Stage 0 + journal excerpts from outer stroke cycles
  Task: find the theme that wants to emerge — not yet stated directly
  Output: one orienting question ("what is asking to be seen about control?")

Stage 2 — Dia-Logos (through/between)
  Input: Stage 1 + active lens interpretations
  Task: run the orienting question through the germane lens(es) — let traditions speak
  Output: convergences found across Jungian + Trika + Phenomenological interpretations

Stage 3 — Logos (the word)
  Input: Stage 2 convergences
  Task: state the integration — what has been metabolized and owned
  Output: 1-3 clear statements ("I was defending against intimacy by staying in concept")

Stage 4 — Epi-Logos (meta-word)
  Input: Stage 3 + yesterday's Epi-Logos (if exists)
  Task: see this integration in the larger arc — what pattern is evolving across days/weeks
  Output: pattern statement + trajectory ("3rd time this month the Water-Air tension appears")

Stage 5 — An-a-Logos (return)
  Input: Stage 4
  Task: release the integration back to groundlessness — the day completes, not concluded
  Output: closing statement + kairos coordinate for record ("returns to #4.5-5, decan 17")
  Action: triggers nara.pratibimba.record (auto-export to personal subgraph)
```

---

### Full NaraCmd Extension

The complete `NaraCmd` enum adding all sub-branch commands:

```rust
// Additions to NaraCmd in epi-cli/src/nara/mod.rs

pub enum NaraCmd {
    // ... (existing commands as in Section III) ...

    /// #4.1 Elemental triage + practice prescription
    Medicine {
        #[command(subcommand)]
        cmd: MedicineCmd,
    },
    /// #4.3 Alchemical transformation + dialogical containers
    Transform {
        #[command(subcommand)]
        cmd: TransformCmd,
    },
    /// #4.4 Wisdom lens interpretation
    Lens {
        #[command(subcommand)]
        cmd: LensCmd,
    },
    /// #4.4.4.4 Personal Pratibimba record management
    Pratibimba {
        #[command(subcommand)]
        cmd: PratibimbaCmd,
    },
    /// #4.5 Logos Cycle — day synthesis
    Logos {
        #[command(subcommand)]
        cmd: LogosCmd,
    },
}
```

---

### Expanded M4' Frontend Modes (full set)

```
NaraMode enum (full expansion):
  // Current (Section X)
  'journal'          → flow.md — TipTap, autosave
  'daily_note'       → CT4b Daily Note — activity feed + tasks
  'oracle'           → decan card + cast zone (#4.2)
  'dream'            → dream journal — M2/M3 symbolic pre-analysis
  'cosmos'           → coordinate navigator with personal overlay
  'dialogue'         → archetypal context conversation

  // New (from #4.1–#4.5)
  'medicine'         → elemental balance dashboard (#4.1)
                       Left: nucleotide bars + elemental triage
                       Right: today's materia + practice prescriptions
                       Bottom: safety flags, planetary hour indicator

  'transform'        → transformation cycle tracker (#4.3)
                       Active cycles (outer/inner stroke state per cycle)
                       Decan recipe card
                       Container selector: Bohm / Circle / Diamond (opens modal)
                       Commitment panel

  'lens'             → interpretation workspace (#4.4)
                       Lens selector (6 lenses, each with activation indicator)
                       Selected lens renders interpretation of today's journal/oracle
                       Synthesis panel: cross-lens convergence map

  'pratibimba'       → personal record growth view (#4.4.4.4)
                       Subgraph node count + growth chart
                       Timeline of recent entries
                       Etymological archaeology search
                       Atlas contribution toggle (opt-in)

  'logos'            → Logos Cycle synthesis view (#4.5)
                       Stage progress bar (0→5)
                       Each stage expandable: input summary + synthesis output
                       Curriculum thread
                       Export to subgraph button (stage 5 completion)
```

### Theme Additions Required (themeStore.ts)

```typescript
// New themes for M5' and M0' sections (extend existing ThemeMode type)
type ThemeMode =
  // Existing Nara themes (keep all)
  | 'nara-dark' | 'nara-light' | 'nara-glass' | 'nara-forest' | 'nara-mist' | 'nara-grove'
  // M5' Epii — indigo palette
  | 'epii-dark'   // Deep indigo + violet on near-black
  | 'epii-light'  // Indigo on off-white, parchment texture
  // M0' Anuttara — void + iridescence
  | 'anuttara'    // Near-black background, rainbow iridescent accents
                  // "Firmament" aesthetic: stars, cosmic depth, prismatic edges
```

### WebMCP Contract Expansion (Phase 7 additions from #4.1–#4.5)

```typescript
// New tool contracts for #4.1–#4.5 operations
// All follow the IPC shim pattern from Phase 7

const naraMedicineTools = {
  nara_medicine_balance: {
    description: "Get current elemental balance triage (nucleotide weights + kairos overlay)",
    schema: { type: "object", properties: {} },  // No params — derives from session state
    gateway: "nara.medicine.balance"
  },
  nara_medicine_prescribe: {
    description: "Get practice prescriptions timed to current planetary hour",
    schema: {
      type: "object",
      properties: {
        context: { type: "string", enum: ["morning","evening","integration","crisis","general"] }
      }
    },
    gateway: "nara.medicine.prescribe"
  }
};

const naraTransformTools = {
  nara_transform_cycle_open: {
    description: "Begin a new transformation cycle (marks outer stroke as open)",
    schema: { type: "object", properties: { note: { type: "string" } } },
    gateway: "nara.transform.cycle.open"
  },
  nara_transform_cycle_close: {
    description: "Record inner stroke — close an open transformation cycle",
    schema: {
      type: "object",
      required: ["cycle_id"],
      properties: {
        cycle_id: { type: "string" },
        note: { type: "string" }
      }
    },
    gateway: "nara.transform.cycle.close"
  },
  nara_container_open: {
    description: "Open a dialogical container practice (Bohmian, Circle, or Diamond Inquiry)",
    schema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["bohm", "circle", "diamond"] },
        topic: { type: "string" }
      }
    },
    gateway: "nara.container.open"
  }
};

const naraLogosTools = {
  nara_logos_run: {
    description: "Run Logos Cycle synthesis over today's completed work (end of session)",
    schema: {
      type: "object",
      properties: {
        stage: { type: "integer", minimum: 0, maximum: 5, description: "Run single stage only" }
      }
    },
    gateway: "nara.logos.run"
  },
  nara_logos_status: {
    description: "Get current Logos Cycle stage completion status for today",
    schema: { type: "object", properties: {} },
    gateway: "nara.logos.status"
  }
};
```

---

## XI. Implementation Phases

### Phase 0 — C struct expansion (prerequisite)
1. Update `epi-lib/include/m4.h` — add 6 independent layer structs to `M4_Identity_Matrix`
2. Update `epi-lib/src/m4.c` — implement `m4_identity_hash_compute()` and `m4_identity_augment()`
3. Run `make test` — ensure existing M4 tests pass
4. Add tests for sparse population (1 layer, 3 layers, all 5 layers → different hashes)

### Phase 1 — Rust FFI + `epi nara` scaffold
5. `epi-cli/src/ffi/nara.rs` — C struct mirrors
6. `epi-cli/src/nara/mod.rs` — NaraCmd enum, module structure
7. `epi-cli/src/nara/identity.rs` — NaraIdentityMatrix wrapper, storage I/O
8. `epi-cli/src/main.rs` — add `Nara` variant to `Commands` enum
9. `epi nara identity show` — reads profile.json, displays layer presence (no C yet)

### Phase 2 — Kerykeion + wind
10. `epi-cli/src/nara/kairos.rs` — Kerykeion subprocess wrapper
11. `epi nara identity layer 1 sync` — runs Kerykeion natal, stores layer_1.enc
12. `epi nara identity set-mbti --mbti INFP` — populates layer_2
13. `epi nara identity compute` — calls FFI hash compute from present layers
14. `epi nara wind` — full sequence: load → compute → sync kairos → orient torus → write SpacetimeDB

### Phase 3 — Deterministic CLI commands
15. `epi nara clock` — reads M1_Root via FFI, formats output
16. `epi nara kairos` — reads M2 state + current.json, formats output
17. `epi nara decan` — reads M2_DECAN_DESC[active_decan], formats card
18. `epi nara resonance` — reads M2_CAUSAL_RESONANCE_MASKS, cross-lit conditions
19. `epi nara project` — calls transduce_vibration_to_symbol(), returns hex bitboard
20. `epi nara status` — composite of all above

### Phase 4 — Oracle (#4.2 full implementation)
21. `epi nara oracle decan` — deterministic decan card (no consent)
22. `epi nara oracle cast --system tarot-rws` — consent gate + RWS Tarot + hygiene check
23. `epi nara oracle cast --system iching` — I-Ching with coins/yarrow/digital methods
24. `epi nara oracle payload` — retrieve #4.2-0 canonical tags from last cast
25. `epi nara oracle payload apply --target medicine` — route oracle → #4.1 elemental triage
26. `epi nara oracle payload apply --target transform` — route oracle → #4.3 cycle commit
27. `epi nara oracle interpret --mode hybrid` — apply interpretation mode to cast
28. `epi nara oracle hygiene` — run bias/frequency/re-asking guard check
29. Oracle history log to ~/.epi-logos/nara/oracle/history.jsonl
30. Gate methods: `nara.oracle.payload`, `nara.oracle.payload.apply`, `nara.oracle.iching`,
    `nara.oracle.interpret`, `nara.oracle.hygiene`

### Phase 5 — Gateway integration
24. `epi-cli/src/gate/nara.rs` — all `nara.*` RPC methods
25. `NaraRuntime` struct in gateway server — holds M1/M2/M4 state for session
26. SpacetimeDB WASM module with full table schema from Section VII
27. Reducer calls from Rust gateway on state changes

### Phase 6 — Frontend identity panel + Subtle Body Map
28. **Spec:** `docs/specs/M/M4-nara-subtle-body-map.md` — full Archetypal-Citta spec with 10 USs
29. Phase A–E: `subtleBodyTypes.ts`, constants, `BodySilhouette.tsx`, `ChakraColumn.tsx`,
    `ElementField.tsx`, `PlanetRing.tsx` (minimum viable Archetypal-Citta — natal + chakras)
30. `useSubtleBodyData.ts` — assembles SubtleBodyState from gateway + SpacetimeDB subscription
31. Existing three-block identity panel (Signature/Kairos/Resonance) from Section VIII sits
    ABOVE the SubtleBodyPanel in the right pane — informational blocks + visual map together
32. Replace `NaraTracePanel` stub with real identity panel + SubtleBodyPanel in `NaraDashboard`

### Phase 7 — WebMCP contracts (5 Nara tools)
31. `nara_identity_inspect` → `nara.identity.get`
32. `nara_daily_open` → vault.daily_get (already partially wired)
33. `nara_oracle_cast` → `nara.oracle.cast`
34. `nara_decan_current` → `nara.kairos.decan`
35. `nara_journal_append` → vault.now_append

### Phase 8 — Remaining M4' modes (oracle, dream, cosmos)
36. Oracle page rebuild (M4-2View) — decan card + cast UX + M2 resonance display
37. Dream journal mode — separate TipTap instance, M2 symbolic pre-analysis
38. Cosmos mode — coordinate navigator with personal overlay from nara.cosmos.navigate
39. Agent session context assembly on open

### Phase 9 — Medicine + Transform CLI (#4.1, #4.3)
40. `epi-cli/src/nara/medicine.rs` — M4_Medicine_Triage FFI + CLI commands
41. `epi nara medicine balance` — elemental triage from nucleotide + kairos
42. `epi nara medicine prescribe` — practice prescriptions via #4.1-4 temporal gate
43. `epi-cli/src/nara/transform.rs` — M4_Transform_State FFI + cycle engine
44. `epi nara transform status` + `write` + `reflect` — outer/inner stroke tracking
45. `epi nara transform container bohm/circle/diamond` — static protocol containers
46. Gate methods: `nara.medicine.*`, `nara.transform.*`, `nara.container.*`

### Phase 10 — Lens interpretation + Pratibimba record (#4.4, #4.4.4.4)
47. `epi-cli/src/nara/lens.rs` — lens dispatch + PHENOM_TATTVA_MAP cross-M wiring
48. `epi nara lens apply --lens jungian` — interpret latest journal via Jungian lens
49. `epi nara lens synthesize` — multi-lens convergence map
50. `epi-cli/src/nara/pratibimba.rs` — personal subgraph management
51. `epi nara pratibimba stats` + `record` + `excavate` — personal record ops
52. Neo4j: :Pratibimba:PersonalRecord schema + REFLECTS_FOUNDATION edge
53. Atlas sync: anonymize + contribute cycle events (opt-in)

### Phase 11 — Logos Cycle (#4.5)
54. `epi-cli/src/nara/logos.rs` — stage definitions + synthesis runner
55. `epi nara logos run` — agent chain over daily note (runs at session close)
56. `epi nara logos stage N` — retrieve specific stage synthesis
57. `epi nara logos export` — auto-trigger pratibimba.record for stage 5 completion
58. Gate method: `nara.logos.run` — agent pipeline dispatcher
59. Daily note integration: Logos Cycle summary written back to daily-note.md footer

### Phase 12 — M4' Frontend: medicine, transform, lens, pratibimba, logos views
60. `MedicineView.tsx` — elemental balance + prescriptions panel
61. `TransformView.tsx` — cycle tracker + container selector modal (3 container types)
62. `LensView.tsx` — 6-lens selector + interpretation workspace
63. `PratibimbaView.tsx` — subgraph growth chart + timeline + atlas toggle
64. `LogosView.tsx` — stage progress bar + expandable synthesis per stage
65. Add all new modes to NaraDashboard tab system
66. Add `epii-dark`, `epii-light`, `anuttara` to themeStore.ts
67. WebMCP contract extensions: medicine/transform/logos tool contracts (Section X-B)

---

## XII. Identity Layer Expansion Guide (Future Systems)

When a new identity system is to be integrated (e.g. Human Design full chart, Enneagram,
Gene Keys full profile beyond the hexagram mask):

1. Define a new C struct `M4_<SystemName>_Layer` in `m4.h`
2. Add it as `layer_N` slot to `M4_Identity_Matrix` (if slot available) or as an extension struct
3. Add `M4_LAYER_N_PRESENT` bit to the presence mask
4. Update `m4_identity_hash_compute()` — new layer data automatically included in hash
5. Add Rust mirror in `ffi/nara.rs`
6. Add `Option<M4_<SystemName>_Layer>` to `NaraIdentityMatrix`
7. Add `epi nara identity layer N sync/set` subcommand
8. Add `nara.identity.layer.N.set` gateway method
9. Add UI display in identity panel Block 1

The architecture is designed for this growth. The BLAKE3 hash input format ensures
that adding a new layer produces a legitimately different hash — the user's presence
in the shared space deepens as their identity resolution increases. This is the
architectural expression of the epigenetic augmentation principle.

---

*Plan version: 2.1 — 2026-03-10*
*Changes in v2.0: Added Section X-B (complete sub-branch ops for #4.1–#4.5),*
*expanded NaraCmd with Medicine/Transform/Lens/Pratibimba/Logos,*
*added Phases 9–12, full gateway RPC methods for all 6 sub-branches,*
*WebMCP contract extensions, M4' frontend mode expansion, theme additions.*
*Changes in v2.1: Added #4.2 Oracle full treatment to Section X-B: Common Substrate*
*canonical tag payload architecture, M4_Oracle_Draw C struct, I-Ching concrescence*
*phase mapping, QL-Quaternary grammar plan, hygiene protocol guards, oracle→medicine*
*and oracle→transform pipeline (nara.oracle.payload.apply), expanded Phase 4.*
*Next review: after Phase 5 completion (gateway integration)*
