# Implementation Prompt — Nara Runtime: `epi nara` CLI + Gateway

**Target:** Full `epi nara` CLI + Nara gateway RPC + C FFI for the M4 runtime
**Spec:** `docs/plans/2026-03-10-nara-runtime-full-plan.md` (v2.1)
**Working directory:** `epi-cli/` + `epi-lib/`
**Scope:** Phases 1–6 complete. All CLI commands. All gateway methods. Full C FFI.

---

## INVOCATION

```
Implement the full `epi nara` CLI command and Nara gateway RPC for the
Epi-Logos system at /Users/admin/Documents/Epi-Logos\ C\ Experiments/
following the Nara Runtime Plan v2.1. All phases. No stubs.
```

---

## CONTEXT TO LOAD FIRST

Read every one of these before writing code:

```
1.  docs/plans/2026-03-10-nara-runtime-full-plan.md     — canonical plan, all sections
2.  docs/specs/M/M4-nara-personal-interface.md           — M4 philosophy + C struct ground
3.  docs/specs/M/M4-nara-subtle-body-map.md              — identity data flowing to frontend
4.  epi-cli/src/main.rs                                  — Commands enum, dispatch pattern
5.  epi-cli/src/gate/mod.rs                              — GateCmd pattern
6.  epi-cli/src/gate/spacetimedb_bridge.rs               — SpacetimeDB bridge pattern
7.  epi-cli/src/ffi/mod.rs                               — existing FFI: HolographicCoordinate
8.  epi-cli/Cargo.toml                                   — existing dependencies
9.  epi-lib/include/m4.h                                 — M4_Identity_Matrix, M4_Jung_Complex
10. epi-lib/include/m1.h                                 — Spanda_Engine, QL_Tick, M1_Root
11. epi-lib/include/m2.h                                 — M2_Vibrational_72_Space, Planet_Operator
12. epi-lib/src/m4.c                                     — m4_identity_compute, oracle ops
```

Also read these for implementation patterns:
```
13. epi-cli/src/vault/mod.rs    — vault subcommand pattern
14. epi-cli/src/graph/client.rs — async gateway client pattern
```

---

## ARCHITECTURAL INVARIANTS

### 1. Follow the existing module pattern exactly

Every module: `epi-cli/src/<name>/mod.rs` exports a `<Name>Cmd` enum, dispatched from
`main.rs`. Pattern = `epi-cli/src/gate/mod.rs`. Do not invent a new pattern.

### 2. All C FFI structs are `#[repr(C)]`, field-for-field mirrors

Every C struct exposed to Rust in `epi-cli/src/ffi/nara.rs` MUST exactly mirror the
layout in `epi-lib/include/m4.h` — same field order, same padding.
Add `static_assertions::assert_eq_size!()` for each struct where the C size is known.

### 3. PCO Privacy Law — raw data is zeroed immediately after compute

Any Rust struct holding natal data (birth date, lat/lon, nucleotide weights before hashing)
MUST implement `zeroize::Zeroize`. Call `.zeroize()` immediately after the FFI compute
call returns. The quintessence hash is the only artefact that persists.

### 4. #4.1-4 is the temporal authority — no operation skips it

Oracle cast, medicine prescription, alchemical transformation commit: ALL must read
kairos state before proceeding. If `kairos/current.json` is absent or older than 24h,
the operation returns:
`Err("temporal authority unavailable: run 'epi nara kairos sync' first")`
This is a hard error, not a warning. There is no `--force` override.

### 5. Consent gate on oracle is hard — no bypass

`epi nara oracle cast` without `--yes` / `-y` MUST prompt interactively:
`"Cast oracle? This is a sacred portal. [y/N]: "`
`nara.oracle.cast` gateway method requires `"consent": true` in the payload.
Missing consent → `Err("oracle: explicit consent required (consent: true)")`.
No silent default. No `--no-consent-needed` flag.

### 6. Encryption is ChaCha20-Poly1305 with Argon2id — no substitutes

Identity layer files use `chacha20poly1305` crate. Key derived via `argon2` crate.
Key NEVER stored on disk. Derived on demand from passphrase prompt (`rpassword` crate).
Nonce per file: random, stored as the first 12 bytes of the `.enc` file.

### 7. Gateway methods NEVER return raw personal data

`nara.identity.get` returns: `{ layer_presence, quintessence_hash, nucleotide_balance,
dominant_element, hash_preview, layer_count }`.
It does NOT return: birth date, birth location, natal chart raw degrees, MBTI string.
Those are in the encrypted layer files, never in RPC responses.

---

## FILE STRUCTURE — COMPLETE

```
epi-cli/src/
  main.rs                       ← add Nara variant to Commands + dispatch
  nara/
    mod.rs                      ← NaraCmd enum (full), dispatch fn
    identity.rs                 ← NaraIdentityMatrix, profile.json I/O, encryption
    wind.rs                     ← full 9-step wind sequence
    clock.rs                    ← M1 torus state via FFI
    kairos.rs                   ← M2 planetary state, Kerykeion subprocess wrapper
    oracle.rs                   ← M4_Oracle_Draw, hygiene guards, cast + I-Ching
    medicine.rs                 ← M4_Medicine_Triage, elemental balance, prescriptions
    transform.rs                ← M4_Transform_State, cycle engine, container protocols
    lens.rs                     ← 6-lens dispatch, PHENOM_TATTVA_MAP, synthesizer
    pratibimba.rs               ← personal Neo4j subgraph ops, atlas sync
    logos.rs                    ← Logos Cycle stage engine (0→5)
  ffi/
    mod.rs                      ← existing + re-exports
    nara.rs                     ← all M4 C struct mirrors (repr(C))
    m1.rs                       ← M1 C struct mirrors
    m2.rs                       ← M2 C struct mirrors
  gate/
    nara.rs                     ← all nara.* RPC methods

epi-lib/include/
  m4.h                          ← expand: add 6-layer M4_Identity_Matrix,
                                   M4_Medicine_Triage, M4_Transform_State, M4_Oracle_Draw
```

---

## IMPLEMENTATION — ALL PHASES

### Phase 0 — C struct expansion in epi-lib (prerequisite for all Rust work)

Before any Rust, update `epi-lib/include/m4.h`:

1. **Add `M4_Numerological_Layer`** (8 bytes) — from plan Section II
2. **Add `M4_Astrological_Layer`** (28 bytes) — from plan Section II
3. **Add `M4_Jungian_Layer`** (12 bytes) — from plan Section II
4. **Add `M4_GeneKeys_Layer`** (40 bytes) — from plan Section II
5. **Add `M4_HumanDesign_Layer`** (20 bytes) — from plan Section II
6. **Expand `M4_Identity_Matrix`** — 6 independent layer slots + `layer_presence` bitmask
   + `quintessence_hash` (uint64_t) + `computed` (bool). Keep `M4_Symbol_DNA_Profile`
   as legacy field for existing compatibility.
7. **Add `m4_identity_hash_compute(M4_Identity_Matrix* id)`** declaration
8. **Add `m4_identity_augment(id, layer_index, data, size)`** declaration
9. **Add `M4_Medicine_Triage`** (16 bytes) — from plan Section X-B/#4.1
10. **Add `M4_Transform_State`** (16 bytes) — from plan Section X-B/#4.3
11. **Add `M4_Oracle_Draw`** (40 bytes) — from plan Section X-B/#4.2

Then in `epi-lib/src/m4.c`, implement:
- `m4_identity_hash_compute()` — BLAKE3 input: `layer_presence (1 byte) || each PRESENT layer's raw bytes in order`. Use existing BLAKE3 vendored code.
- `m4_identity_augment()` — copy new layer into the appropriate slot, set presence bit, call `m4_identity_hash_compute()`

Run `make test` — all existing M4 tests must still pass before proceeding.

### Phase 1 — `epi nara` scaffold (no C FFI yet)

Goal: `epi nara identity show` works end-to-end.

12. **`epi-cli/src/nara/mod.rs`** — full `NaraCmd` enum:
    ```rust
    pub enum NaraCmd {
        Wind { birth_date: Option<String>, birth_time: Option<String>,
               birth_lat: Option<f32>, birth_lon: Option<f32>,
               profile: bool, force: bool },
        Clock { json: bool },
        Kairos { json: bool, planets: bool },
        Identity { #[command(subcommand)] cmd: IdentityCmd },
        Decan { json: bool },
        Resonance { json: bool },
        Project { json: bool },
        Oracle { #[command(subcommand)] cmd: OracleCmd },
        Medicine { #[command(subcommand)] cmd: MedicineCmd },
        Transform { #[command(subcommand)] cmd: TransformCmd },
        Lens { #[command(subcommand)] cmd: LensCmd },
        Pratibimba { #[command(subcommand)] cmd: PratibimbaCmd },
        Logos { #[command(subcommand)] cmd: LogosCmd },
        Status { json: bool },
    }
    ```
    All sub-enums (`IdentityCmd`, `OracleCmd`, `MedicineCmd`, `TransformCmd`, `LensCmd`,
    `PratibimbaCmd`, `LogosCmd`) per plan Sections III and X-B. Define all of them here.

13. **`epi-cli/src/nara/identity.rs`** — `NaraIdentityMatrix` (Rust wrapper), `profile.json`
    read/write, `~/.epi-logos/nara/` directory creation, `layer_presence` display table

14. **`epi-cli/src/main.rs`** — add:
    ```rust
    Nara { #[command(subcommand)] cmd: nara::NaraCmd },
    ```
    and dispatch:
    ```rust
    Commands::Nara { cmd } => nara::dispatch(cmd),
    ```

15. `epi nara identity show` with no profile → "No profile. Run 'epi nara wind'."
16. `epi nara identity show` with stub profile.json → layer table

**`profile.json` format** (plan Section IV):
```json
{
  "version": 1,
  "layers": {
    "0": { "present": bool, "source": string, "completeness": 0-5, "set_at": unix_ts|null }
  },
  "layer_presence_mask": u8,
  "hash_preview": "8a3f2c1d",
  "last_wound": unix_ts,
  "kerykeion_version": "4.x"
}
```

### Phase 2 — C FFI mirrors

17. **`epi-cli/src/ffi/nara.rs`** — ALL structs from plan Section III + Section X-B:

    ```rust
    #[repr(C)] pub struct M4NumerologicalLayer { ... }    // 8 bytes
    #[repr(C)] pub struct M4AstrologicalLayer { ... }     // 28 bytes
    #[repr(C)] pub struct NucleotideBalance { ... }       // 4 bytes
    #[repr(C)] pub struct M4JungianLayer { ... }          // 12 bytes
    #[repr(C)] pub struct M4GeneKeysLayer { ... }         // 40 bytes
    #[repr(C)] pub struct M4HumanDesignLayer { ... }      // 20 bytes
    #[repr(C)] pub struct M4MedicineTriage { ... }        // 16 bytes
    #[repr(C)] pub struct M4TransformState { ... }        // 16 bytes
    #[repr(C)] pub struct M4OracleDraw { ... }            // 40 bytes
    ```

    Add size assertions:
    ```rust
    static_assertions::assert_eq_size!(M4NumerologicalLayer, [u8; 8]);
    static_assertions::assert_eq_size!(M4AstrologicalLayer,  [u8; 28]);
    // etc.
    ```

18. **`epi-cli/src/ffi/m1.rs`** — `SpandaEngine`, `QLTick`, `M1Root` mirrors
19. **`epi-cli/src/ffi/m2.rs`** — `M2Vibrational72Space`, `PlanetOperator`, `M2Root`

    Safe Rust wrappers above the `#[repr(C)]` layer:
    ```rust
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
        pub fn hash_hex(&self) -> String { format!("{:016x}", self.quintessence_hash) }
        pub fn hash_preview(&self) -> String { self.hash_hex()[..8].to_string() }
        pub fn is_minimum_viable(&self) -> bool { self.layer_presence & 0x01 != 0 }
        pub fn layer_count(&self) -> u8 { self.layer_presence.count_ones() as u8 }
    }
    ```

### Phase 3 — Kerykeion + Wind

20. **`epi-cli/src/nara/kairos.rs`** — Kerykeion subprocess wrapper:

    ```rust
    pub struct KerykeionResult {
        pub planets: Vec<PlanetPosition>,
        pub dominant_sign: u8,
        pub dominant_element: u8,
        pub active_decan: u8,
        pub active_tattva: u8,
    }
    pub struct PlanetPosition {
        pub planet_id: u8,
        pub degree: f32,           // 0.0-360.0 ecliptic longitude
        pub degree_anchor: u16,    // 0-719 SU(2) mapped
        pub retrograde: bool,
    }

    pub fn run_kerykeion_natal(date: &str, time: &str, lat: f32, lon: f32)
        -> Result<KerykeionResult, String>;

    pub fn run_kerykeion_current(date: &str)
        -> Result<KerykeionResult, String>;
    ```

    Implementation: spawn `python3 -c "..."` subprocess with inline Python.
    The Python script uses `kerykeion.KrInstance` to compute positions.
    Output: JSON to stdout, parsed into `KerykeionResult`.
    Error path: if `python3` not found or `kerykeion` not installed:
    `Err("kairos: python3/kerykeion unavailable. pip3 install kerykeion")`

    **Degree anchor mapping** (plan Section IX):
    ```rust
    // Natal: day phase only (explicate, 0-359)
    pub fn longitude_to_anchor_natal(lon: f32) -> u16 {
        lon.round() as u16
    }
    // Live: check if SU(2) implicate applies (descending node)
    pub fn longitude_to_anchor_live(lon: f32, retrograde: bool) -> u16 {
        let base = lon.round() as u16;
        if retrograde { base + 360 } else { base }
    }
    ```

21. **`epi-cli/src/nara/wind.rs`** — full 9-step wind sequence (plan Section V):

    ```
    Step 1: load profile → decrypt present layers
    Step 2: acquire missing inputs (prompt if interactive, error if --profile missing data)
    Step 3: FFI call m4_identity_compute(&matrix, &input) → hash computed → input zeroed
    Step 4: run_kerykeion_current(today) → write kairos/current.json
    Step 5: torus_pos = current_sun_degree / 60 (clamped 0-11)
    Step 6: FFI transduce_vibration_to_symbol(active_m2_indices, count) → m3_projection
    Step 7: if gateway running → SpacetimeBridge::publish_presence() + update tables
    Step 8: encrypt layers to ~/.epi-logos/nara/identity/, write quintessence.bin, profile.json
    Step 9: return WoundState { wound, layers_present, quintessence_hash, torus_pos,
                                spanda_stage, active_decan, element, m3_projection, message }
    ```

    The `--force` flag skips the "already wound today" guard only.
    The temporal authority check (Step 4) is never skipped.

22. `epi nara wind [options]` dispatches to `wind::run()`, prints wound state (or JSON)

### Phase 4 — Deterministic read-only CLI commands

All of these call FFI or read cached state. No consent, no mutation.

23. **`epi-cli/src/nara/clock.rs`** — reads M1_Root via FFI:
    `epi nara clock [--json]` → `{ torus_pos, spanda_stage, ascending, active_poles, element_count, spanda_track, cf_substage }`

24. `epi nara kairos [--json] [--planets]` — reads kairos/current.json + M2 state:
    base: `{ active_decan, decan_name, element, ruling_planet, cousto_freq, tattva, lunar_phase }`
    `--planets`: adds all 10 planetary positions

25. `epi nara decan [--json]` — reads `M2_DECAN_DESC[active_decan]` via FFI, formats card:
    `{ index, name, element, face, ruling_planet, cousto_freq, materia, recipe_ops[] }`

26. `epi nara resonance [--json]` — reads `M2_CAUSAL_RESONANCE_MASKS` cross-lit conditions:
    `{ active_state, cross_lit_tattvas[], active_conditions[] }`

27. `epi nara project [--json]` — calls `transduce_vibration_to_symbol()` via FFI:
    `{ m3_bitboard: "0x4d2a1c...", active_hexagrams: [29, 6, 47], gene_keys_lit: [...] }`

28. `epi nara status [--json]` — composite: clock + kairos + identity layers + decan + resonance

### Phase 5 — Oracle (#4.2 full implementation)

29. **`epi-cli/src/nara/oracle.rs`** — the full oracle engine:

    **Hygiene guard** (runs before every cast):
    ```rust
    pub enum HygieneResult {
        Clear,
        Warning { flags: Vec<HygieneFlag>, notes: Vec<&'static str> },
        Block { reason: &'static str },
    }
    pub enum HygieneFlag {
        RecentCast { minutes_ago: u32 },
        SameQuestion,
        ExcessiveFrequency { casts_today: u32 },
    }

    pub fn hygiene_check(question: &str, history_path: &Path) -> HygieneResult {
        // Read history.jsonl, check:
        // - ExcessiveFrequency: > 6 casts today → Block
        // - SameQuestion: identical question in last 24h → Warning (show previous answer)
        // - RecentCast: any cast in last 10 minutes → Warning
    }
    ```

    **Consent gate:**
    ```rust
    pub fn consent_gate(yes_flag: bool) -> Result<(), String> {
        if yes_flag { return Ok(()) }
        print!("Cast oracle? This is a sacred portal. [y/N]: ");
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).ok();
        if input.trim().to_lowercase() == "y" { Ok(()) }
        else { Err("oracle: cast cancelled".into()) }
    }
    ```

    **Tarot draw** — Fisher-Yates shuffle with `arc4random_buf()` seed:
    ```rust
    pub fn draw_tarot(system: TarotSystem, spread: Spread) -> Vec<TarotCard> {
        let mut deck: Vec<u8> = (0..system.deck_size()).collect();
        // Fisher-Yates via arc4random_buf seeded indices
        // Returns card_ids + reversal bitmask per spread size
    }
    ```
    Supported systems: `TarotRws` (78 cards), `TarotThoth` (78), `TarotMarseille` (78),
    `TarotQL` (78, QL-mapped — use RWS as base until QL deck is fully defined)

    **I-Ching cast** — 3-coin method:
    ```rust
    pub fn cast_iching_coins() -> IChingResult {
        // 6 lines: each line = 3 coins via arc4random_buf
        // coin values: 2=yin, 3=yang
        // line value = sum of 3 coins: 6=old yin (moving), 7=young yang, 8=young yin, 9=old yang (moving)
        // Hexagram from lines 1-6 (bottom to top)
        // Moving lines → relating hexagram
        // Nuclear hexagram = inner 4 lines (lines 2-5) formed into new hexagram
        // Concrescence phase: hexagram_to_torus_pos(primary_hexagram)
    }
    pub fn hexagram_to_torus_pos(h: u8) -> u8 {
        ((h.saturating_sub(1)) * 12 / 64) as u8
    }
    ```
    Supported methods: `Coins` (3-coin, default), `Yarrow` (stub returning
    `Err("yarrow: not yet implemented")`), `Digital` (alias for Coins)

    **`M4_Oracle_Draw` population** — populate all fields from draw result.

    **Canonical tag payload emission** (#4.2-0):
    The canonical payload `{ elements, organs, bodyZones, operations, timing, lens }` is
    derived from the oracle draw via a **correspondence table** embedded in oracle.rs:
    ```rust
    // Tarot card → canonical tags (static lookup)
    // Each of 78 cards maps to: elements[], organs[], body_zones[], operations[], timing
    // This is the #4.2-0 Common Substrate — the machine-readable oracle
    const TAROT_RWS_CANONICAL_TAGS: [OracleCanonicalTags; 78] = [ ... ];
    // I-Ching hexagram → canonical tags
    const ICHING_CANONICAL_TAGS: [OracleCanonicalTags; 64] = [ ... ];
    ```
    For Phase 5, populate at least: element tags (from card suit/element affiliation),
    operation tags (from card's alchemical mapping — Majors have direct op associations),
    timing tags (from card's planetary/decan association feeding #4.1-4).
    Organ/body zone tags for the full 78 cards are a follow-on task — stub with `[]` for now.

    **History log** — append to `~/.epi-logos/nara/oracle/history.jsonl`:
    ```json
    { "cast_id": 42, "system": "tarot-rws", "question": "...", "draw": [...], "canonical_payload": {...}, "cast_at": 1741651200, "hygiene": "clear" }
    ```

30. CLI commands wired:
    - `epi nara oracle cast --system tarot-rws --question "..." [-y]`
    - `epi nara oracle cast --system iching --method coins --question "..." [-y]`
    - `epi nara oracle decan` (no consent — deterministic)
    - `epi nara oracle payload [--cast-id N] [--json]`
    - `epi nara oracle payload apply --target medicine|transform`
    - `epi nara oracle interpret --cast-id N --mode rule|generative|hybrid`
    - `epi nara oracle hygiene [--cast-id N]`
    - `epi nara oracle history`

### Phase 5b — Medicine + Transform + Lens + Pratibimba + Logos

All CLI and implementation modules from plan Section X-B.

**`epi-cli/src/nara/medicine.rs`**:
- `epi nara medicine balance` — M4_Medicine_Triage via FFI + kairos overlay.
  Temporal authority check FIRST: must read current planetary_hour from kairos.
  Returns: `{ fire, water, earth, air levels; dominant, deficient; triage_vector; chakra_state }`
- `epi nara medicine chakra` — derived from M4_Medicine_Triage.primary_chakra + activation
- `epi nara medicine materia` — M2_DECAN_DESC for active_decan: elements, tones, colors, herbs
- `epi nara medicine prescribe [--context morning|evening|integration|crisis|general]`
  Temporal authority check FIRST. Returns `{ practices[], planetary_hour, duration_min, timing_note }`
- `epi nara medicine safety [--practice <name>]` — contraindication check via safety_mask

**`epi-cli/src/nara/transform.rs`**:
- `epi nara transform status` — M4_Transform_State: open cycles, current op, stroke state
- `epi nara transform write [--note "..."]` — open a new cycle (outer stroke)
  Creates cycle record in `~/.epi-logos/nara/transform/cycles.jsonl`
- `epi nara transform reflect --cycle-id <id> [--note "..."]` — inner stroke, closes cycle
  Auto-triggers `nara logos export` if cycle count today reaches threshold
- `epi nara transform recipe` — today's decan recipe card (which alchemical ops supported)
- `epi nara transform commit --operation solutio|nigredo|... [--note "..."]`
- `epi nara transform history [--open] [--json]`

**Dialogical containers** — static protocol text embedded in transform.rs as `&'static str`:

```rust
pub struct Container {
    pub kind: ContainerKind,
    pub opening_ritual: &'static str,
    pub protocols: &'static [&'static str],
    pub closing_gesture: &'static str,
}

pub static BOHM: Container = Container {
    kind: ContainerKind::Bohm,
    opening_ritual: "We enter a space of shared inquiry. No role, no rank. \
                     Suspend all assumptions — hold them visible, not acted on.",
    protocols: &[
        "Suspend all assumptions — hold them visible, not acted on",
        "Speak when moved; silence is equal participation",
        "Listen without preparing your response",
        "If you notice defensiveness, name it as an object in the field",
    ],
    closing_gesture: "What has moved in the field between us?",
};

pub static TALKING_CIRCLE: Container = Container {
    kind: ContainerKind::TalkingCircle,
    opening_ritual: "The circle is open. The talking piece grants the right to speak; \
                     holding it grants the right to silence.",
    protocols: &[
        "The talking piece grants the right to speak; holding it grants the right to silence",
        "All voices are equal; no rank exists in the circle",
        "Speak from your own experience — no advice, no debate",
        "What is shared in the circle stays in the circle",
    ],
    closing_gesture: "We close the circle. What was spoken lives here.",
};

pub static DIAMOND: Container = Container {
    kind: ContainerKind::Diamond,
    opening_ritual: "We inquire together. Stay with direct experience — \
                     not concepts about experience.",
    protocols: &[
        "Stay with direct experience — not concepts about experience",
        "Inquire into what is actually present, not what should be present",
        "Follow the thread of aliveness, not the story",
        "The inquiry is complete when something lands — not when you understand it",
    ],
    closing_gesture: "The inquiry rests here. What landed?",
};
```

Container state in `~/.epi-logos/nara/transform/container.json`:
`{ kind, opened_at, turns: [], status: "open"|"closed" }`

**`epi-cli/src/nara/lens.rs`**:
- `epi nara lens list` — 6 lenses: name, index, activation_indicator (germane to current kairos?)
- `epi nara lens apply --lens jungian|trika|phenomenal|gebser|ontological|epistemological [--target journal|oracle|dream|<path>]`
  Reads the target file, sends to agent pipeline with lens-specific system prompt.
  For Phase 5b, implement as: read target + print structured interpretation prompt
  (agent dispatch is Phase 6).
- `epi nara lens jungian [--json]` — active archetypes, shadow indicator, individuation stage
  Derived from: identity layer 2 (jungian) + oracle history (archetype frequency) + kairos
- `epi nara lens trika [--json]` — active tattva, recognition readiness (pratyabhijna check)
  Derived from: M2 active_tattva + kairos.lunar_phase + identity layer 3 (gene keys)
- `epi nara lens phenomenal [--json]` — bodily/temporal orientation
  Uses PHENOM_TATTVA_MAP (plan Section X-B) to cross-wire active phenomenological layer
  with M2 tattva state
- `epi nara lens synthesize --lenses jungian,trika [--target journal]`
  Apply 2+ lenses and return convergence map

**PHENOM_TATTVA_MAP** (static in lens.rs):
```rust
// phenom layer (0-5) → tattva indices in M2_Vibrational_72_Space
pub const PHENOM_TATTVA_MAP: [[u8; 3]; 6] = [
    [0,  1,  2],   // #4.4.4.0 → Shiva/Shakti/Sadashiva (pure)
    [3,  4,  5],   // #4.4.4.1 → Ishvara/Sadvidya/Maya
    [6,  7,  8],   // #4.4.4.2 → Purusha/Prakriti/Akasha
    [9,  10, 11],  // #4.4.4.3 → Vayu/Agni/Apas
    [12, 13, 14],  // #4.4.4.4 → Prithivi/Gandha/Rasa (personal record layer)
    [15, 16, 17],  // #4.4.4.5 → Rupa/Sparsha/Shabda (pratyabhijna layer)
];
```

**`epi-cli/src/nara/pratibimba.rs`**:
- `epi nara pratibimba stats` — query Neo4j for user's personal subgraph:
  `:Pratibimba:PersonalRecord` node count, edge count, days active, last added
  Uses existing `graph::client` Neo4j connection
- `epi nara pratibimba recent [--days 7] [--json]`
- `epi nara pratibimba record --cycle-id <id> [--lens jungian]`
  Creates `:Pratibimba:PersonalRecord` node in Neo4j with edges:
  `REFLECTS_FOUNDATION → #0`, `INSTANTIATES → #4.4.4.4`, `AT_DECAN → M2-<decan>`,
  `USED_LENS → #4.4-<n>` if lens specified.
  Payload: `{ cycle_id, op, torus_pos, decan, lens_applied, tattvas_active, quintessence_hash }`.
  NO personal content, dates, or identifiable data in the Neo4j node.
- `epi nara pratibimba excavate --term <word> [--json]`
  Etymological root tracing: query Neo4j for word-root paths, return etymology chain.
  If no Neo4j data exists: return a structured prompt for the agent to perform etymology
  research and write back via `pratibimba record`.
- `epi nara pratibimba atlas-sync [-y]` — consent gate + anonymize cycle events + write
  `:Archetype_Atlas` node in Neo4j (shared canonical space, not user tenant space):
  Strips all personal data, retains: `{ archetype_pattern, op, torus_pos, decan, lens_convergence }`
- `epi nara pratibimba atlas-query [--coordinate M4.3] [--json]` — query Archetype_Atlas

**`epi-cli/src/nara/logos.rs`**:

Six-stage synthesis engine. Stages defined as static data:

```rust
pub struct LogosStage {
    pub index: u8,
    pub name: &'static str,        // "A-Logos", "Pro-Logos", etc.
    pub input_sources: &'static str,
    pub task: &'static str,
    pub output_contract: &'static str,
}

pub static LOGOS_STAGES: [LogosStage; 6] = [
    LogosStage { index: 0, name: "A-Logos",
        input_sources: "raw daily note (unedited), all oracle draws for today",
        task: "Identify what is not yet spoken — the felt sense before words. \
               Do NOT interpret. Find pre-linguistic images or sensations.",
        output_contract: "1-3 pre-linguistic images/sensations (e.g. 'cloud', 'knot in chest')" },
    LogosStage { index: 1, name: "Pro-Logos",
        input_sources: "Stage 0 output, outer-stroke journal excerpts from today",
        task: "Find the theme wanting to emerge — not yet stated directly. \
               Produce one orienting question.",
        output_contract: "One orienting question (e.g. 'what is asking to be seen about control?')" },
    LogosStage { index: 2, name: "Dia-Logos",
        input_sources: "Stage 1 orienting question, active lens interpretations",
        task: "Run the question through the germane lens(es). Let the traditions speak. \
               Do not conclude — find where multiple lenses converge.",
        output_contract: "Convergences across 2+ lenses, tensions noted" },
    LogosStage { index: 3, name: "Logos",
        input_sources: "Stage 2 convergences",
        task: "State what has been metabolized and owned. \
               Use first-person statements about the person's actual experience.",
        output_contract: "1-3 clear integration statements" },
    LogosStage { index: 4, name: "Epi-Logos",
        input_sources: "Stage 3 + yesterday's Epi-Logos output (if exists)",
        task: "See this integration in the larger arc. What pattern recurs across days/weeks?",
        output_contract: "Pattern statement + trajectory (e.g. '3rd time this month...')" },
    LogosStage { index: 5, name: "An-a-Logos",
        input_sources: "Stage 4 output",
        task: "Release the integration back to groundlessness. The day completes, not concludes.",
        output_contract: "Closing statement + kairos coordinate. \
                          Triggers: pratibimba.record for this cycle." },
];
```

CLI commands:
- `epi nara logos run [--date YYYY-MM-DD] [--stage 0-5] [--json]`
  Assembles daily note + closed cycles → passes each stage to agent pipeline
  via `gateway.call('agent.run', { prompt: stage_prompt, context: stage_input })`
  Writes each stage output to `~/.epi-logos/nara/logos/{date}-stage-{n}.md`
  Stage 5 auto-triggers `pratibimba::record()`
- `epi nara logos status [--json]` — which stages completed today
- `epi nara logos stage --stage N [--date YYYY-MM-DD] [--json]` — read a stage output
- `epi nara logos curriculum [--json]` — derive from recent logos outputs + gene keys + torus
- `epi nara logos export [--date YYYY-MM-DD] [-y]` — re-trigger pratibimba.record
- `epi nara logos weekly [--json]` — Logos Cycle synthesis over past 7 days

### Phase 6 — Gateway integration

**`epi-cli/src/gate/nara.rs`** — implement every RPC method from plan Sections VI + X-B.

Each method is a Rust async fn following the existing gateway dispatch pattern in `gate/server.rs`.

Complete method list — implement ALL of these:

```
// Init
nara.wind             nara.status

// Clock
nara.clock.status     nara.clock.tick

// Kairos
nara.kairos.current   nara.kairos.sync      nara.kairos.decan
nara.kairos.resonance nara.kairos.project

// Identity
nara.identity.get     nara.identity.layers  nara.identity.compute
nara.identity.layer.set

// Oracle
nara.oracle.cast      nara.oracle.decan     nara.oracle.history
nara.oracle.payload   nara.oracle.payload.apply
nara.oracle.iching    nara.oracle.interpret nara.oracle.hygiene

// Medicine
nara.medicine.balance nara.medicine.chakra  nara.medicine.materia
nara.medicine.prescribe nara.medicine.safety

// Transform
nara.transform.status nara.transform.cycle.open nara.transform.cycle.close
nara.transform.recipe nara.transform.commit nara.transform.history

// Containers
nara.container.open   nara.container.status nara.container.turn
nara.container.close

// Lenses
nara.lens.list        nara.lens.apply       nara.lens.jungian
nara.lens.trika       nara.lens.phenomenal  nara.lens.synthesize
nara.lens.subgraph

// Pratibimba
nara.pratibimba.stats   nara.pratibimba.recent  nara.pratibimba.record
nara.pratibimba.excavate nara.pratibimba.atlas_sync nara.pratibimba.atlas_query

// Logos
nara.logos.run        nara.logos.status     nara.logos.stage
nara.logos.curriculum nara.logos.export

// Cosmos
nara.cosmos.navigate  nara.cosmos.subgraph
```

**`NaraRuntime` struct** — holds in-process session state for the gateway:
```rust
pub struct NaraRuntime {
    pub identity: Option<NaraIdentityMatrix>,
    pub m1_state: Option<M1TorusState>,
    pub m2_state: Option<M2VibrationalState>,
    pub transform_state: M4TransformState,
    pub container: Option<ActiveContainer>,
    pub wound: bool,
    pub kairos_updated_at: Option<u64>,
}
```

Register all `nara.*` methods in `gate/server.rs` dispatch table.

**SpacetimeDB writes** on state change, using existing `SpacetimeBridge` from
`gate/spacetimedb_bridge.rs`. Add these publish methods:
```rust
bridge.publish_torus_state(&m1_state)?;
bridge.publish_planetary_state(&planets)?;
bridge.publish_vibrational_state(&m2_state)?;
bridge.update_presence(&session_id, hash, coordinate, degree_anchor, nucleotide_sig, layer_count)?;
```

---

## STORAGE LAYOUT

```
~/.epi-logos/nara/
  profile.json                  — non-sensitive metadata
  identity/
    layer_0.enc                 — ChaCha20-Poly1305, nonce as first 12 bytes
    layer_1.enc
    layer_2.enc
    layer_3.enc
    layer_4.enc
    quintessence.bin            — 8 raw bytes of BLAKE3 hash (not sensitive)
  kairos/
    current.json                — latest Kerykeion output
    natal.json                  — natal chart cache
  oracle/
    history.jsonl               — append-only, one JSON per line
  transform/
    cycles.jsonl                — append-only transformation cycle log
    container.json              — current active container state (overwritten)
  logos/
    {YYYY-MM-DD}-stage-{n}.md   — one file per stage per day
```

All paths via `dirs::home_dir()?.join(".epi-logos/nara")`. Use `dirs` crate.

---

## CRATES TO ADD

```toml
chacha20poly1305 = "0.10"
argon2 = "0.5"
rpassword = "7"
dirs = "5"
zeroize = { version = "1", features = ["zeroize_derive"] }
static_assertions = "1"
```

---

## TESTS

```
tests/nara_wind.rs
  - wind with valid birth date → profile.json written, quintessence.bin non-zero
  - wind without kerykeion → graceful error, no partial state written

tests/nara_oracle.rs
  - cast without consent flag → error, no draw
  - cast with -y + hygiene clear → draw + canonical payload
  - hygiene: >6 casts today → Block
  - hygiene: same question in last 24h → Warning with previous answer
  - hexagram_to_torus_pos: hex 1 → 0, hex 32 → 5, hex 64 → 11

tests/nara_identity.rs
  - NaraIdentityMatrix::hash_hex → 16 hex chars
  - NaraIdentityMatrix::is_minimum_viable → true only when bit 0 set
  - FFI size assertions all pass

tests/nara_kairos.rs
  - longitude_to_anchor_natal: 0.0 → 0, 360.0 → 360 (wraps gracefully)
  - longitude_to_anchor_live: 180.0 retrograde → 540

tests/nara_logos.rs
  - LOGOS_STAGES has exactly 6 entries
  - Stage indices are 0-5 with no gaps
  - Stage 5 output_contract mentions pratibimba.record

tests/nara_gateway.rs
  - nara.identity.get does NOT return birth_date, birth_location, or mbti_raw
  - nara.oracle.cast without consent → error response
  - nara.medicine.prescribe without kairos state → temporal authority error
```

---

## DO NOT

- Do NOT store raw personal data outside the encrypted `.enc` files
- Do NOT skip the temporal authority check (#4.1-4) for oracle, medicine, or transform
- Do NOT implement a bypass for the oracle consent gate
- Do NOT return raw personal data from any gateway method
- Do NOT implement the SpacetimeDB WASM module here — that is a separate task; use
  `SpacetimeBridge` to write events to the local test-events.json file and the gateway
  will handle WASM sync separately
- Do NOT use blocking I/O in gateway async methods — use `tokio::fs` and `tokio::process`

---

*Prompt version: 2.0 — 2026-03-10 (complete, no stubs)*
*Start with Phase 0 (C struct expansion). Run `make test` before proceeding to Rust.*
*Complete each phase's tests before moving to the next.*
