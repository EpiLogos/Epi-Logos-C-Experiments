use super::oracle_cast::TarotCard;
use super::oracle_frame::OraclePayload;
use super::oracle_identity::{element, ACE_ELEMENT_MAP, COURT_SIGN_MAP, PIP_DECAN_MAP};

// ─── Quaternion Elemental Derivation ─────────────────────────────────────────
//
// The mapping [w=EARTH, x=FIRE, y=WATER, z=AIR] is NOT arbitrary convention.
// It is derivable from the Clifford algebra Cl(4,2) and the Hopf fibration:
//
//   1. In the unit quaternion q = w + xi + yj + zk, the real part w = cos(θ/2)
//      is the rotation AXIS — the fixed center around which rotation occurs.
//
//   2. In the Hopf fibration S³→S², the w-component projects to the base space.
//      The base space IS the 6-fold QL circle. w is the cosine pole = P5 = Integration.
//
//   3. P5 (cosθ) has Cl(4,2) signature −1 (implicate generating pole).
//      EARTH is the geocentric center (#4.4.4.4), the fixed observer, the ground.
//      The observer IS the implicate pole around which the explicate rotates.
//
//   4. Therefore: w = EARTH = cos-pole = P5 = fixed observer = implicate ground.
//      The three imaginary axes (x,y,z) = (FIRE,WATER,AIR) are the three
//      explicate dimensions of rotation AROUND the earthed center.
//
//   5. The fourth explicate position (P4/cscθ) is not a quaternion axis —
//      it is the Lemniscate, the FOLD POINT where the torus crosses itself.
//      4 explicate positions, 3 rotation axes + 1 fold = the Cl(4,2) +1 subspace.
//
// Cross-ref: CL42_BASIS[6] in m1.h, QL_TRIG_TABLE[6], spec 00-canonical-invariants §5
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tarot Elemental Quaternion Bridge ───────────────────────────────────────
//
// Maps TarotCard → elemental weights [EARTH, FIRE, WATER, AIR] → OraclePayload
// pp/nn/pn/np charges, mirroring the I-Ching eval4 charge algebra.
//
// Card-id encoding (78 cards):
//   0–21  = Major Arcana
//   22–35 = Cups    (pip_idx 0=Ace, 1-9=pip 2-10, 10-13=Princess/Prince/Queen/King)
//   36–49 = Wands
//   50–63 = Pentacles
//   64–77 = Swords
//
// Quaternion format: [w=EARTH, x=FIRE, y=WATER, z=AIR]
// Charge mapping:  FIRE→pp  WATER→nn(neg)  AIR→pn  EARTH→np
// Spec: validation-matrix row 14; 07-unified-architecture §7

/// Zodiac sign (0–11) → quaternion element index [0=EARTH, 1=FIRE, 2=WATER, 3=AIR].
fn sign_to_elem_idx(sign: u8) -> usize {
    match sign % 12 {
        0 | 4 | 8 => 1,  // Aries, Leo, Sagittarius → Fire
        1 | 5 | 9 => 0,  // Taurus, Virgo, Capricorn → Earth
        2 | 6 | 10 => 3, // Gemini, Libra, Aquarius → Air
        _ => 2,          // Cancer, Scorpio, Pisces → Water
    }
}

/// Major Arcana card_id 0–21 → element index [0=EARTH, 1=FIRE, 2=WATER, 3=AIR].
/// Assignments follow Golden Dawn / Thoth Tarot elemental attributions.
fn major_arcana_elem_idx(card_id: u8) -> usize {
    match card_id {
        0 => 3,  // Fool         — Air
        1 => 1,  // Magician     — Fire (Mercury as will-force)
        2 => 2,  // High Priestess — Water (Moon)
        3 => 0,  // Empress      — Earth (Venus/Taurus)
        4 => 1,  // Emperor      — Fire (Aries)
        5 => 0,  // Hierophant   — Earth (Taurus)
        6 => 3,  // Lovers       — Air (Gemini)
        7 => 2,  // Chariot      — Water (Cancer)
        8 => 1,  // Strength     — Fire (Leo)
        9 => 0,  // Hermit       — Earth (Virgo)
        10 => 1, // Wheel        — Fire (Jupiter/expansion)
        11 => 3, // Justice      — Air (Libra)
        12 => 2, // Hanged Man   — Water (Neptune)
        13 => 2, // Death        — Water (Scorpio)
        14 => 1, // Temperance   — Fire (Sagittarius)
        15 => 0, // Devil        — Earth (Capricorn)
        16 => 1, // Tower        — Fire (Mars)
        17 => 3, // Star         — Air (Aquarius)
        18 => 2, // Moon         — Water (Pisces)
        19 => 1, // Sun          — Fire
        20 => 1, // Judgement    — Fire (transformative)
        21 => 0, // World        — Earth (Saturn)
        _ => 1,
    }
}

/// Map a `TarotCard` to elemental quaternion weights `[EARTH, FIRE, WATER, AIR]`.
///
/// Returns 1.0 in the dominant element slot (or 0.25 in all for Akasha/balanced).
/// Reversed cards return -1.0 (inversion of elemental expression).
/// Multiply by 32.0 to match the I-Ching charge scale (32.0 per line × 6 lines).
pub fn tarot_card_to_element_weights(card: &TarotCard) -> [f32; 4] {
    let mut weights = [0.0f32; 4]; // [EARTH, FIRE, WATER, AIR]
    let polarity = if card.reversed { -1.0f32 } else { 1.0f32 };

    if card.card_id <= 21 {
        let idx = major_arcana_elem_idx(card.card_id);
        weights[idx] = polarity;
    } else {
        let minor = card.card_id - 22;
        let suit = (minor / 14) as usize; // 0=Cups,1=Wands,2=Pentacles,3=Swords
        let pip_idx = (minor % 14) as u8; // 0=Ace, 1-9=pip 2-10, 10-13=courts

        let elem_idx = if pip_idx == 0 {
            // Ace: direct element from ACE_ELEMENT_MAP
            match ACE_ELEMENT_MAP[suit.min(3)].element_id {
                element::AGNI => 1,
                element::APAS => 2,
                element::PRITHVI => 0,
                element::VAYU => 3,
                _ => {
                    // Akasha: balanced across all four
                    for w in &mut weights {
                        *w = polarity * 0.25;
                    }
                    return weights;
                }
            }
        } else if pip_idx <= 9 {
            // Pip 2-10: derive element from PIP_DECAN_MAP zodiac sign
            sign_to_elem_idx(PIP_DECAN_MAP[suit.min(3)][(pip_idx - 1) as usize].zodiac_sign)
        } else {
            // Court card: Princess(10)/Prince(11)/Queen(12)/King(13)
            sign_to_elem_idx(COURT_SIGN_MAP[suit.min(3)][(pip_idx - 10) as usize].sign_a)
        };

        weights[elem_idx] = polarity;
    }

    weights
}

/// Fold a tarot spread into `OraclePayload` pp/nn/pn/np charges.
///
/// Charge mapping (quaternion [EARTH=0,FIRE=1,WATER=2,AIR=3] → pp/nn/pn/np):
///   FIRE  → pp  (active expansion, yang×yang)
///   WATER → nn  (receptive depth, yin×yin; stored negative; upright water → more negative)
///   AIR   → pn  (clarifying tension, yang×yin)
///   EARTH → np  (grounding embodiment, yin×yang)
///
/// Each card contributes ±32.0 to its element charge (I-Ching line weight scale).
/// Primary hex from clock degree position (5.625°/hex = 360°/64).
/// Temporal hex from shadow degree (complement +180°).
pub fn tarot_draw_to_oracle_payload(
    cards: &[TarotCard],
    kairos_degree: f32,
    phase: u8,
) -> OraclePayload {
    let (mut pp, mut nn, mut pn, mut np) = (0.0f32, 0.0f32, 0.0f32, 0.0f32);

    for card in cards {
        let w = tarot_card_to_element_weights(card);
        pp += w[1] * 32.0; // FIRE  → pp
        nn -= w[2] * 32.0; // WATER → nn (upright water makes nn more negative)
        pn += w[3] * 32.0; // AIR   → pn
        np += w[0] * 32.0; // EARTH → np
    }

    let degree = (kairos_degree as u16).min(359);
    let deficient_degree = (degree as u32 + 180) as u16 % 360;
    let implicate_720 = kairos_degree + 360.0;
    let primary_hex = ((kairos_degree / 5.625).floor() as u8).min(63);
    let shadow_deg = (kairos_degree + 180.0) % 360.0;
    let temporal_hex = ((shadow_deg / 5.625).floor() as u8).min(63);

    OraclePayload {
        degree,
        phase,
        primary_hex,
        deficient_degree,
        implicate_720,
        temporal_hex,
        pp,
        nn,
        pn,
        np,
    }
}
