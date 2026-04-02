//! Nara Lens — 12-fold Epistemic Framework (L-coordinate system)
//!
//! The L-coordinate system is the epistemological substrate of the Epi-Logos system.
//! It defines 12 lenses (6 Day/Torus + 6 Night/Klein) that form the M2 MEF
//! (Modular Epistemic Framework): 12 lenses × 6 sub-positions = 72 conditions,
//! occupying the same 72-byte M2_Vibrational_72_Space union as tattvas/decans/shem-names.
//!
//! # Canonical Names (from m2.c M2_MEF_LENS_NAMES)
//!   Day (Torus, 0-5):    Quaternal, Causal, Logical, Processual, Phenomenological, Para Vak
//!   Night (Klein, 6-11): Archetypal-Numerical, Phenomenal, Alchemical-Elemental,
//!                        Chronological, Scientific, Divine Logos
//!
//! # Klein V4 Relational Laws
//!   Day complement:   X + Y = 5   (L0↔L5, L1↔L4, L2↔L3)
//!   Night complement: X' + Y' = 5 (L0'↔L5', L1'↔L4', L2'↔L3')
//!   Day-Night pair:   X + X' = 2x (same position, both modes — doubled)
//!   Cross:            Y + Y' = 2y (complement in both modes)
//!
//! # The Three Klein Squares
//!   Square A: L0, L5, L0', L5'  — Potential ↔ Speech ↔ Numbers ↔ Divine Logos
//!   Square B: L1, L4, L1', L4'  — Causal ↔ Phenomenological ↔ Phenomenal ↔ Scientific
//!   Square C: L2, L3, L2', L3'  — Logical ↔ Processual ↔ Alchemical-Elemental ↔ Chronological
//!
//! Square C is the elemental square: L2' (Alchemical-Elemental) carries
//! {Aether, Earth, Water, Air, Fire, Mineral} at sub-positions 0'-5'.

use serde::Serialize;

// ── Canonical 12-Lens Table ──────────────────────────────────────────────────

/// Canonical lens names indexed 0-11.
/// 0-5 = Day (Torus topology), 6-11 = Night (Klein topology).
/// Source: m2.c M2_MEF_LENS_NAMES
pub const LENS_NAMES: [&str; 12] = [
    "Quaternal",            // L0  — QL as psychoid ground; curiosity, creative potential
    "Causal",               // L1  — Aristotle + Iccha Shakti; will as causation
    "Logical",              // L2  — Nagarjuna Catuskoti; tetralemmic 4-corner logic
    "Processual",           // L3  — Whitehead concrescence; creative advance, novelty
    "Phenomenological",     // L4  — Heidegger Being-in-World; existential analysis
    "Para Vak",             // L5  — Kashmir Shaivism speech ontology; Vak as creative power
    "Archetypal-Numerical", // L0' — Jung-Pauli psychoid numbers; synchronicity
    "Phenomenal",           // L1' — Jungian psychic functions; qualia, immediate experience
    "Alchemical-Elemental", // L2' — Jung transcendent function; solve et coagula, elements
    "Chronological",        // L3' — Hegelian dialectic, Aion; history as becoming
    "Scientific",           // L4' — Kuhn paradigm shifts; knowledge work, methodology
    "Divine Logos",         // L5' — Epi-Logos, resurrection; divine speech, creative inception
];

/// Sub-position names for each of the 12 lenses (6 positions each).
/// From L*-n.md files in Idea/Bimba/World/.
pub const LENS_SUBPOSITIONS: [[&str; 6]; 12] = [
    // L0 Quaternal
    [
        "Why (Insofar as)",
        "What",
        "How",
        "Where/When",
        "Why-for",
        "Why-so/Why-not",
    ],
    // L1 Causal
    [
        "Svatantrya",
        "Material Cause",
        "Efficient Cause",
        "Formal Cause",
        "Final Cause",
        "Iccha Shakti",
    ],
    // L2 Logical
    [
        "Tetralemmic Ground",
        "IS",
        "IS-NOT",
        "BOTH",
        "NEITHER",
        "SILENCE",
    ],
    // L3 Processual
    [
        "Concrescent Desire",
        "Actual Occasion",
        "Ingression",
        "Eternal Objects",
        "Community",
        "Satisfaction",
    ],
    // L4 Phenomenological (Lemniscate anchor — decimal sub-notation in docs)
    [
        "Sein (Being)",
        "Geworfenheit",
        "Dasein",
        "Zeit (Time)",
        "Besorge",
        "Gelassenheit",
    ],
    // L5 Para Vak
    [
        "Anuttara/Asambhava",
        "Para Vak",
        "Pasyanti",
        "Madhyama",
        "Vaikhari",
        "Matrika",
    ],
    // L0' Archetypal-Numerical
    ["One", "Two", "Three", "Four", "Five", "Six"],
    // L1' Phenomenal
    [
        "Introversion",
        "Sensation",
        "Feeling",
        "Thinking",
        "Intuition",
        "Extroversion",
    ],
    // L2' Alchemical-Elemental  ← THE ELEMENT-BEARING LENS
    ["Aether", "Earth", "Water", "Air", "Fire", "Mineral"],
    // L3' Chronological
    ["Spirit", "Spring", "Summer", "Autumn", "Winter", "Life"],
    // L4' Scientific
    [
        "Questions",
        "Traces",
        "Challenges",
        "Patterns",
        "Discovery",
        "Insight",
    ],
    // L5' Divine Logos (unified aspects of one creative reality)
    [
        "Inception",
        "Divine Speech",
        "Resurrection",
        "Epi-Logos",
        "Alpha",
        "Omega",
    ],
];

/// Philosophical root for each lens.
pub const LENS_PHILOSOPHER: [&str; 12] = [
    "Pre-philosophical wonder",
    "Aristotle, Schopenhauer, Iccha Shakti",
    "Nagarjuna, Buddhist Madhyamaka, Dialetheism",
    "Whitehead, Bergson, Lacan",
    "Heidegger, Merleau-Ponty",
    "Vedic Vak, Kashmir Shaivism Spanda",
    "Pythagoras, Jung-Pauli Synchronicity, Kabbalah",
    "Jung, Husserl, Phenomenological Qualia",
    "Hermetic Philosophy, Jung Transcendent Function",
    "Hegel, Gnostic Aion, Astrological Ages",
    "Thomas Kuhn, Scientific Method",
    "John's Gospel Logos, Vedic Vak, Tao",
];

// ── M0 Archetype Resonance ───────────────────────────────────────────────────

/// M0 ARCHETYPE_LUT index resonant with each L-coordinate lens (0-11).
/// Source: M0 ARCHETYPE_LUT[12] — 12-fold number language from anuttara-deep dataset.
///
/// Ordering: interlaced Day/Night pairs — L0↔#0, L0'↔#1, L1↔#2, L1'↔#3, ...
/// Day lenses (0-5) map to even archetypes; Night lenses (6-11) map to odd archetypes.
/// This reflects the Torus/Klein duality: Day=explicate, Night=implicate.
pub const LENS_ARCHETYPE_NUMBER: [u8; 12] = [
    0,  // L0  Quaternal             ↔ Archetype 0:  Mirror (−), pre-numerical void
    2,  // L1  Causal                ↔ Archetype 2:  Number 0 (Sat/Being), pure IS
    4,  // L2  Logical               ↔ Archetype 4:  Number 2 (Lemniscate anchor, context)
    6,  // L3  Processual            ↔ Archetype 6:  Number 4, Jung-Pauli psychoid root
    8,  // L4  Phenomenological      ↔ Archetype 8:  Number 6 (Synthetic Emptiness, ADAM)
    10, // L5  Para Vak              ↔ Archetype 10: Number 8
    1,  // L0' Archetypal-Numerical  ↔ Archetype 1:  0/1 Singularity, first differentiation
    3,  // L1' Phenomenal            ↔ Archetype 3:  Number 1 (Magician/Vak), creative advance
    5,  // L2' Alchemical-Elemental  ↔ Archetype 5:  Number 3 (Vak, Zodiacal grammar)
    7,  // L3' Chronological         ↔ Archetype 7:  Number 5 (Dynamic Harmony, MonoPoly)
    9,  // L4' Scientific            ↔ Archetype 9:  Number 7 (Divine Action, Siva-table)
    11, // L5' Divine Logos          ↔ Archetype 11: Number 9 (Paramesvara, Virtue LUT)
];

/// Return the M0 ARCHETYPE_LUT index resonant with this lens (0-11).
/// Both systems are 12-fold; this makes the resonance explicit and named.
pub fn archetype_number(lens_idx: u8) -> u8 {
    LENS_ARCHETYPE_NUMBER
        .get(lens_idx as usize)
        .copied()
        .unwrap_or(lens_idx)
}

// ── Möbius Pairs ─────────────────────────────────────────────────────────────

/// Day complement (X + Y = 5): LENS_DAY_COMPLEMENT[n] = complement of day lens n.
/// Valid for n in 0-5.
pub const LENS_DAY_COMPLEMENT: [u8; 6] = [5, 4, 3, 2, 1, 0];

/// Night complement (X' + Y' = 5): LENS_NIGHT_COMPLEMENT[n] = complement of night lens n.
/// Valid for n in 6-11 (index within night range: 0→11, 1→10, 2→9, 3→8, 4→7, 5→6).
pub const LENS_NIGHT_COMPLEMENT: [u8; 6] = [11, 10, 9, 8, 7, 6];

/// Day-Night partner: lens at same QL position in the other mode.
/// For day lens n (0-5): night partner = n + 6
/// For night lens n (6-11): day partner = n - 6
pub fn night_partner(lens_idx: u8) -> u8 {
    if lens_idx < 6 {
        lens_idx + 6
    } else {
        lens_idx - 6
    }
}

/// Day complement of any lens index (0-11).
pub fn day_complement(lens_idx: u8) -> u8 {
    let base = lens_idx % 6;
    let is_night = lens_idx >= 6;
    let comp = 5 - base;
    if is_night {
        comp + 6
    } else {
        comp
    }
}

// ── Klein V4 Squares ─────────────────────────────────────────────────────────

/// The three Klein V4 integration squares.
/// Each entry: [day_lens, day_complement, night_lens, night_complement]
/// These form a Klein four-group (V4 = Z2 × Z2) with four symmetries per square.
pub const KLEIN_SQUARES: [[u8; 4]; 3] = [
    [0, 5, 6, 11], // Square A: Quaternal ↔ Para Vak ↔ Archetypal-Numerical ↔ Divine Logos
    [1, 4, 7, 10], // Square B: Causal ↔ Phenomenological ↔ Phenomenal ↔ Scientific
    [2, 3, 8, 9],  // Square C: Logical ↔ Processual ↔ Alchemical-Elemental ↔ Chronological
];

/// Return the Klein square containing lens_idx.
pub fn klein_square_for(lens_idx: u8) -> [u8; 4] {
    let sq = match lens_idx % 6 {
        0 | 5 => 0,
        1 | 4 => 1,
        _ => 2, // 2 | 3
    };
    KLEIN_SQUARES[sq]
}

/// Human-readable names for the four corners of each Klein square.
pub const KLEIN_SQUARE_NAMES: [[&str; 4]; 3] = [
    [
        "Quaternal",
        "Para Vak",
        "Archetypal-Numerical",
        "Divine Logos",
    ],
    ["Causal", "Phenomenological", "Phenomenal", "Scientific"],
    [
        "Logical",
        "Processual",
        "Alchemical-Elemental",
        "Chronological",
    ],
];

// ── Element System via L2' ───────────────────────────────────────────────────

/// Primary element per lens, derived through the L2' (Alchemical-Elemental) path.
/// L2' sub-positions: 0=Aether, 1=Earth, 2=Water, 3=Air, 4=Fire, 5=Mineral
///
/// Mapping to m2.h Element_Id: AKASHA=0, VAYU=1, AGNI=2, APAS=3, PRITHVI=4
/// (Aether→AKASHA=0, Air→VAYU=1, Fire→AGNI=2, Water→APAS=3, Earth→PRITHVI=4)
///
/// Derivation path: lens → Klein square → L2' sub-position → element
pub const LENS_PRIMARY_ELEMENT: [u8; 12] = [
    0, // L0  Quaternal          → Akasha/Aether (pre-elemental creative potential)
    4, // L1  Causal             → Prithvi/Earth (material cause is ground)
    1, // L2  Logical            → Vayu/Air (logic operates as pure structural air)
    3, // L3  Processual         → Apas/Water (concrescence flows as water)
    4, // L4  Phenomenological   → Prithvi/Earth (being-in-world is grounded)
    0, // L5  Para Vak           → Akasha/Aether (creative speech is quintessential)
    0, // L0' Archetypal-Numerical → Akasha/Aether (numbers as psychoid quintessence)
    3, // L1' Phenomenal         → Apas/Water (qualia and feeling flow)
    0, // L2' Alchemical-Elemental → Akasha/Aether (contains all elements; root is aether)
    2, // L3' Chronological      → Agni/Fire (dialectical time burns through form)
    4, // L4' Scientific         → Prithvi/Earth (knowledge work as structured ground)
    0, // L5' Divine Logos       → Akasha/Aether (divine word as original quintessence)
];

/// The ACTG charge vector for each element (A=Water, T=Fire, C=Earth, G=Air).
/// Normalized to sum ~1.0. Akasha/Aether = balanced across all four.
pub const ELEMENT_CHARGE: [[f32; 4]; 5] = [
    [0.25, 0.25, 0.25, 0.25], // 0: Akasha/Aether — balanced quintessence
    [0.15, 0.15, 0.15, 0.55], // 1: Vayu/Air      → G-dominant (Swords/Air)
    [0.10, 0.40, 0.25, 0.25], // 2: Agni/Fire      → T-dominant (Wands/Fire)
    [0.50, 0.15, 0.20, 0.15], // 3: Apas/Water     → A-dominant (Cups/Water)
    [0.15, 0.15, 0.55, 0.15], // 4: Prithvi/Earth  → C-dominant (Pentacles/Earth)
];

// ── Elemental Profile (4-way Klein square) ───────────────────────────────────

#[derive(Debug, Clone, Serialize)]
pub struct LensElementalProfile {
    pub primary_element: u8,        // element of this lens
    pub complement_element: u8,     // element of its Day/Night complement
    pub partner_element: u8,        // element of its Day↔Night partner
    pub cross_element: u8,          // element of partner's complement
    pub primary_name: &'static str, // human-readable element name
}

pub fn elemental_profile(lens_idx: u8) -> LensElementalProfile {
    let sq = klein_square_for(lens_idx);
    // Find the other three corners
    let _others: Vec<u8> = sq.iter().copied().filter(|&x| x != lens_idx).collect();
    // complement = same mode, different position; partner = same position, other mode
    let is_night = lens_idx >= 6;
    let base = lens_idx % 6;
    let comp_idx = if is_night { (5 - base) + 6 } else { 5 - base };
    let part_idx = night_partner(lens_idx);
    let cross_idx = night_partner(comp_idx);

    LensElementalProfile {
        primary_element: LENS_PRIMARY_ELEMENT[lens_idx as usize],
        complement_element: LENS_PRIMARY_ELEMENT[comp_idx as usize],
        partner_element: LENS_PRIMARY_ELEMENT[part_idx as usize],
        cross_element: LENS_PRIMARY_ELEMENT[cross_idx as usize],
        primary_name: match LENS_PRIMARY_ELEMENT[lens_idx as usize] {
            0 => "Aether",
            1 => "Air",
            2 => "Fire",
            3 => "Water",
            4 => "Earth",
            _ => "unknown",
        },
    }
}

// ── PHENOM_TATTVA_MAP (corrected against m2.h tattvas[36][2]) ───────────────

/// L4 Phenomenological sub-positions (0-5) mapped to M2 tattva index ranges.
/// m2.h tattvas[36][2]: 36 principles × 2 phases (gross=0, subtle=1).
/// Each L4 sub-position covers 6 consecutive tattva indices.
///
/// Strata:
///   L4.0 Sein (Being)      → tattvas[0-5]:   Shiva, Shakti, Sadashiva, Ishvara, Sadvidya, Maya
///   L4.1 Geworfenheit      → tattvas[6-11]:  Purusha, Prakriti, Akasha-tanmatra, Vayu-t, Agni-t, Apas-t
///   L4.2 Dasein            → tattvas[12-17]: Prithvi-tanmatra, Shabda, Sparsha, Rupa, Rasa, Gandha
///   L4.3 Zeit (Time)       → tattvas[18-23]: Shrotra, Tvak, Chakshu, Jihva, Ghrana (jnanendriyas) + Vak
///   L4.4 Besorge (Concern) → tattvas[24-29]: Pani, Pada, Upastha, Payu (karmendriyas) + Manas, Akasha
///   L4.5 Gelassenheit      → tattvas[30-35]: Vayu, Agni, Apas, Prithvi (mahabhutas) + Ahamkara, Buddhi
pub const PHENOM_TATTVA_MAP: [[u8; 6]; 6] = [
    [0, 1, 2, 3, 4, 5],       // L4.0 Sein       → Shiva tattvas (pure consciousness)
    [6, 7, 8, 9, 10, 11],     // L4.1 Geworfen   → Purusha/Prakriti + subtle element seeds
    [12, 13, 14, 15, 16, 17], // L4.2 Dasein     → Tanmatras (subtle sense objects)
    [18, 19, 20, 21, 22, 23], // L4.3 Zeit       → Jnanendriyas (cognitive sense faculties)
    [24, 25, 26, 27, 28, 29], // L4.4 Besorge    → Karmendriyas (motor faculties) + antahkarana
    [30, 31, 32, 33, 34, 35], // L4.5 Gelassen   → Mahabhutas (gross elements) + ego/intellect
];

// ── Germane Lens Logic ───────────────────────────────────────────────────────

/// Determine which lenses are germane at the current moment.
///
/// Germane logic (replaces arbitrary decan % 6 arithmetic):
///   1. Torus-derived: current M1 torus position maps directly to lens index
///      (torus 0-5 = Day lenses L0-L5; torus 6-11 = Night lenses L0'-L5')
///   2. Element-derived: dominant element matches LENS_PRIMARY_ELEMENT
///
/// Returns lens indices 0-11.
pub fn germane_lenses(torus_pos: u8, dominant_element: u8) -> Vec<u8> {
    let mut germane = Vec::new();
    // 1. Torus-derived (primary)
    let torus_lens = torus_pos % 12;
    germane.push(torus_lens);
    // 2. Element-derived (secondary — may overlap with torus lens)
    for (i, &elem) in LENS_PRIMARY_ELEMENT.iter().enumerate() {
        if elem == dominant_element && i as u8 != torus_lens {
            germane.push(i as u8);
        }
    }
    germane
}

// ── CLI Output Structs ───────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct LensInfo {
    pub index: u8,
    pub name: &'static str,
    pub mode: &'static str, // "day" | "night"
    pub philosopher: &'static str,
    pub primary_element: &'static str,
    pub klein_square: [u8; 4],
    pub germane: bool,
    pub subpositions: [&'static str; 6],
}

#[derive(Debug, Serialize)]
pub struct LensApplyResult {
    pub lens: String,
    pub lens_index: u8,
    pub mode: &'static str,
    pub element: &'static str,
    pub klein_square_names: [&'static str; 4],
    pub elemental_profile: LensElementalProfile,
    pub target: String,
    pub analysis: String,
}

// ── CLI Functions ────────────────────────────────────────────────────────────

/// Legacy alias: epi nara lens jungian → show Phenomenal lens (index 7, Jungian Psychic Functions)
pub fn jungian(json: bool) -> Result<String, String> {
    show(7, json)
}

/// Legacy alias: epi nara lens trika → show Para Vak lens (index 5, Kashmir Shaivism)
pub fn trika(json: bool) -> Result<String, String> {
    show(5, json)
}

/// epi nara lens list — show all 12 lenses (Day and Night) with germane markers
pub fn list(json: bool) -> Result<String, String> {
    let kairos = super::kairos::load_current()?.unwrap_or(super::kairos::KerykeionResult {
        planets: vec![],
        dominant_sign: 0,
        dominant_element: 0,
        active_decan: 0,
        active_tattva: 0,
    });
    let germane = germane_lenses(kairos.active_decan % 12, kairos.dominant_element);

    let lenses: Vec<LensInfo> = (0..12u8)
        .map(|i| {
            let elem_id = LENS_PRIMARY_ELEMENT[i as usize];
            let sq_idx = match i % 6 {
                0 | 5 => 0,
                1 | 4 => 1,
                _ => 2,
            };
            LensInfo {
                index: i,
                name: LENS_NAMES[i as usize],
                mode: if i < 6 { "day" } else { "night" },
                philosopher: LENS_PHILOSOPHER[i as usize],
                primary_element: match elem_id {
                    0 => "Aether",
                    1 => "Air",
                    2 => "Fire",
                    3 => "Water",
                    4 => "Earth",
                    _ => "?",
                },
                klein_square: KLEIN_SQUARES[sq_idx],
                germane: germane.contains(&i),
                subpositions: LENS_SUBPOSITIONS[i as usize],
            }
        })
        .collect();

    if json {
        serde_json::to_string_pretty(&lenses).map_err(|e| e.to_string())
    } else {
        let mut out = "Epistemic Lenses (L-coordinate system)\n".to_string();
        out.push_str("  Day (Torus) ──────────────────────────────────\n");
        for l in lenses.iter().filter(|l| l.mode == "day") {
            let g = if l.germane { "◆" } else { "◇" };
            out.push_str(&format!(
                "  {} L{} {:22} [{:5}] {}\n",
                g, l.index, l.name, l.primary_element, l.philosopher
            ));
        }
        out.push_str("  Night (Klein) ────────────────────────────────\n");
        for l in lenses.iter().filter(|l| l.mode == "night") {
            let g = if l.germane { "◆" } else { "◇" };
            let night_label = l.index - 6;
            out.push_str(&format!(
                "  {} L{}' {:21} [{:5}] {}\n",
                g, night_label, l.name, l.primary_element, l.philosopher
            ));
        }
        out.push_str("  ◆ = germane to current torus/element state\n");
        Ok(out)
    }
}

/// epi nara lens show <n> — full detail for one lens
pub fn show(lens_index: u8, json: bool) -> Result<String, String> {
    if lens_index > 11 {
        return Err(format!("Lens index must be 0-11, got {}", lens_index));
    }
    let profile = elemental_profile(lens_index);
    let sq_idx = match lens_index % 6 {
        0 | 5 => 0,
        1 | 4 => 1,
        _ => 2,
    };
    let sq_names = KLEIN_SQUARE_NAMES[sq_idx];
    let mode = if lens_index < 6 { "day" } else { "night" };
    let label = if lens_index < 6 {
        format!("L{}", lens_index)
    } else {
        format!("L{}'", lens_index - 6)
    };

    if json {
        Ok(serde_json::json!({
            "index": lens_index,
            "label": label,
            "name": LENS_NAMES[lens_index as usize],
            "mode": mode,
            "philosopher": LENS_PHILOSOPHER[lens_index as usize],
            "primary_element": profile.primary_name,
            "subpositions": LENS_SUBPOSITIONS[lens_index as usize],
            "klein_square": sq_names,
            "elemental_profile": profile,
        })
        .to_string())
    } else {
        let mut out = format!(
            "{} — {} ({})\n  Philosopher: {}\n  Element: {}\n",
            label,
            LENS_NAMES[lens_index as usize],
            mode,
            LENS_PHILOSOPHER[lens_index as usize],
            profile.primary_name,
        );
        out.push_str(&format!(
            "  Klein square: {} ↔ {} ↔ {} ↔ {}\n",
            sq_names[0], sq_names[1], sq_names[2], sq_names[3]
        ));
        out.push_str("  Sub-positions:\n");
        for (i, sp) in LENS_SUBPOSITIONS[lens_index as usize].iter().enumerate() {
            out.push_str(&format!("    {i}: {sp}\n"));
        }
        Ok(out)
    }
}

/// epi nara lens phenomenal — L4 phenomenological view with tattva grounding
pub fn phenomenal(json: bool) -> Result<String, String> {
    let kairos =
        super::kairos::load_current()?.ok_or("No kairos state — run 'epi nara kairos sync'")?;
    let phenom_layer = (kairos.active_tattva as usize).min(5);
    let tattvas = &PHENOM_TATTVA_MAP[phenom_layer];
    let sub_name = LENS_SUBPOSITIONS[4][phenom_layer]; // L4 = index 4

    if json {
        Ok(serde_json::json!({
            "lens": "Phenomenological",
            "lens_index": 4,
            "active_sublayer": phenom_layer,
            "sublayer_name": sub_name,
            "tattva_indices": tattvas,
            "klein_square": ["Phenomenological", "Causal", "Phenomenal", "Scientific"],
        })
        .to_string())
    } else {
        Ok(format!(
            "L4 Phenomenological\n  Active sublayer: {phenom_layer} — {sub_name}\n  Tattva range: {:?} (m2.h tattvas[n][0/1])\n  Klein square: Phenomenological ↔ Causal ↔ Phenomenal ↔ Scientific",
            tattvas
        ))
    }
}

/// epi nara lens apply <lens_name_or_index> [--target <text>]
pub fn apply(lens: &str, target: Option<&str>) -> Result<String, String> {
    // Parse lens name or index
    let lens_idx = parse_lens_arg(lens)?;
    let target_desc = target.unwrap_or("(no target — use --target to specify content)");
    let profile = elemental_profile(lens_idx);
    let sq_idx = match lens_idx % 6 {
        0 | 5 => 0,
        1 | 4 => 1,
        _ => 2,
    };

    Ok(LensApplyResult {
        lens: LENS_NAMES[lens_idx as usize].to_string(),
        lens_index: lens_idx,
        mode: if lens_idx < 6 { "day" } else { "night" },
        element: profile.primary_name,
        klein_square_names: KLEIN_SQUARE_NAMES[sq_idx],
        elemental_profile: profile,
        target: target_desc.to_string(),
        analysis: format!(
            "Applying {} lens to: {}. \
             Element: {}. Klein square context: {:?}. \
             (Agent pipeline dispatch: send to Aletheia with lens_index={} for full analysis.)",
            LENS_NAMES[lens_idx as usize],
            target_desc,
            LENS_NAMES[lens_idx as usize],
            KLEIN_SQUARE_NAMES[sq_idx],
            lens_idx
        ),
    }
    .to_display())
}

impl LensApplyResult {
    fn to_display(&self) -> String {
        format!(
            "Lens: {} ({})\n  Mode: {}\n  Element: {}\n  Klein square: {} ↔ {} ↔ {} ↔ {}\n  Target: {}\n  → {}",
            self.lens, self.lens_index, self.mode, self.element,
            self.klein_square_names[0], self.klein_square_names[1],
            self.klein_square_names[2], self.klein_square_names[3],
            self.target, self.analysis
        )
    }
}

/// epi nara lens synthesize <lens,lens,...> [--target <text>]
pub fn synthesize(lenses_arg: &str, target: Option<&str>) -> Result<String, String> {
    let indices: Vec<u8> = lenses_arg
        .split(',')
        .map(|s| parse_lens_arg(s.trim()))
        .collect::<Result<Vec<_>, _>>()?;

    let target_desc = target.unwrap_or("(no target)");
    let mut out = format!("Lens Synthesis — {} lenses\n", indices.len());
    for idx in &indices {
        let profile = elemental_profile(*idx);
        out.push_str(&format!(
            "  L{}{}: {} [{}] — {}\n",
            idx % 6,
            if *idx >= 6 { "'" } else { "" },
            LENS_NAMES[*idx as usize],
            profile.primary_name,
            LENS_SUBPOSITIONS[*idx as usize].join(", ")
        ));
    }
    // Check if the indices form a complete Klein square
    if indices.len() == 4 {
        let sq: Vec<u8> = klein_square_for(indices[0]).to_vec();
        let mut sorted_input = indices.clone();
        sorted_input.sort();
        let mut sorted_sq = sq.clone();
        sorted_sq.sort();
        if sorted_input == sorted_sq {
            out.push_str(
                "\n  ◆ These lenses form a complete Klein V4 square — full integration scope.\n",
            );
        }
    }
    out.push_str(&format!(
        "  Target: {target_desc}\n  → Agent pipeline dispatch (Aletheia) pending\n"
    ));
    Ok(out)
}

/// epi nara lens klein <n> — show the full Klein square for a lens
pub fn klein(lens: &str, json: bool) -> Result<String, String> {
    let lens_idx = parse_lens_arg(lens)?;
    let sq = klein_square_for(lens_idx);
    let sq_idx = match lens_idx % 6 {
        0 | 5 => 0,
        1 | 4 => 1,
        _ => 2,
    };
    let names = KLEIN_SQUARE_NAMES[sq_idx];

    if json {
        Ok(serde_json::json!({
            "lens": LENS_NAMES[lens_idx as usize],
            "square_indices": sq,
            "square_names": names,
            "relational_laws": {
                "day_complement": format!("{} + {} = 5", sq[0] % 6, sq[1] % 6),
                "night_complement": format!("{} + {} = 5 (night)", sq[2] % 6, sq[3] % 6),
                "day_night_a": format!("L{} + L{}' = doubled-{}", sq[0], sq[0], sq[0]),
                "day_night_b": format!("L{} + L{}' = doubled-{}", sq[1], sq[1], sq[1]),
            },
            "elements": {
                names[0]: match LENS_PRIMARY_ELEMENT[sq[0] as usize] {
                    0=>"Aether",1=>"Air",2=>"Fire",3=>"Water",4=>"Earth",_=>"?"
                },
                names[1]: match LENS_PRIMARY_ELEMENT[sq[1] as usize] {
                    0=>"Aether",1=>"Air",2=>"Fire",3=>"Water",4=>"Earth",_=>"?"
                },
                names[2]: match LENS_PRIMARY_ELEMENT[sq[2] as usize] {
                    0=>"Aether",1=>"Air",2=>"Fire",3=>"Water",4=>"Earth",_=>"?"
                },
                names[3]: match LENS_PRIMARY_ELEMENT[sq[3] as usize] {
                    0=>"Aether",1=>"Air",2=>"Fire",3=>"Water",4=>"Earth",_=>"?"
                },
            }
        })
        .to_string())
    } else {
        Ok(format!(
            "Klein Square (integration unit)\n  {:22} [{}] element={}\n  {:22} [{}] element={}\n  {:22} [{}'] element={}\n  {:22} [{}'] element={}\n\n  Laws:\n    Day complement:   {} + {} = 5\n    Night complement: {}' + {}' = 5\n    Day↔Night:        L{} ↔ L{}' (doubled-{})\n    Cross:            L{} ↔ L{}' (doubled-{})",
            names[0], sq[0], elem_name(LENS_PRIMARY_ELEMENT[sq[0] as usize]),
            names[1], sq[1], elem_name(LENS_PRIMARY_ELEMENT[sq[1] as usize]),
            names[2], sq[2] % 6, elem_name(LENS_PRIMARY_ELEMENT[sq[2] as usize]),
            names[3], sq[3] % 6, elem_name(LENS_PRIMARY_ELEMENT[sq[3] as usize]),
            sq[0] % 6, sq[1] % 6,
            sq[2] % 6, sq[3] % 6,
            sq[0], sq[0] % 6, sq[0],
            sq[1], sq[1] % 6, sq[1],
        ))
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

fn parse_lens_arg(s: &str) -> Result<u8, String> {
    // Accept: "0"-"11", "L0"-"L5", "L0'"-"L5'", lens names (case-insensitive prefix)
    let s = s.trim();
    if let Ok(n) = s.parse::<u8>() {
        if n <= 11 {
            return Ok(n);
        }
        return Err(format!("Lens index {n} out of range (0-11)"));
    }
    let stripped = s.trim_start_matches('L').trim_start_matches('l');
    let (num_str, is_night) = if stripped.ends_with('\'') {
        (stripped.trim_end_matches('\''), true)
    } else {
        (stripped, false)
    };
    if let Ok(n) = num_str.parse::<u8>() {
        if n <= 5 {
            return Ok(if is_night { n + 6 } else { n });
        }
    }
    // Try name prefix match
    let lower = s.to_lowercase();
    for (i, name) in LENS_NAMES.iter().enumerate() {
        if name.to_lowercase().starts_with(&lower)
            || lower.starts_with(&name.to_lowercase()[..4.min(lower.len())])
        {
            return Ok(i as u8);
        }
    }
    Err(format!(
        "Unknown lens '{}'. Use 0-11, L0-L5, L0'-L5', or a lens name.",
        s
    ))
}

fn elem_name(id: u8) -> &'static str {
    match id {
        0 => "Aether",
        1 => "Air",
        2 => "Fire",
        3 => "Water",
        4 => "Earth",
        _ => "?",
    }
}
