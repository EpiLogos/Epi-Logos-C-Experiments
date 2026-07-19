use serde::{Deserialize, Serialize};

use super::oracle_engine::{tarot_card_to_element_weights, tarot_draw_to_oracle_payload};
use super::oracle_frame::{oracle_eval4, OraclePayload};
use super::oracle_identity::hexagram_body_lookup;
use super::oracle_route::{append_history, current_epoch, next_cast_id, HistoryEntry};

// ─── Tarot Draw ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum TarotSystem {
    Rws,
    Thoth,
    Marseille,
    Ql,
}

impl TarotSystem {
    pub fn deck_size(&self) -> u8 {
        78
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s {
            "tarot-rws" | "rws" => Ok(Self::Rws),
            "tarot-thoth" | "thoth" => Ok(Self::Thoth),
            "tarot-marseille" | "marseille" => Ok(Self::Marseille),
            "tarot-ql" | "ql" => Ok(Self::Ql),
            _ => Err(format!(
                "Unknown tarot system: {s}. Use: rws, thoth, marseille, ql"
            )),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct TarotCard {
    pub card_id: u8,
    pub reversed: bool,
}

pub fn draw_tarot(system: TarotSystem, spread_size: u8) -> Vec<TarotCard> {
    let deck_size = system.deck_size();
    let mut deck: Vec<u8> = (0..deck_size).collect();

    // Fisher-Yates shuffle using OS random
    let mut rand_buf = vec![0u8; deck_size as usize];
    getrandom(&mut rand_buf);

    for i in (1..deck_size as usize).rev() {
        let j = (rand_buf[i] as usize) % (i + 1);
        deck.swap(i, j);
    }

    // Reversal bitmask from additional random bytes
    let mut reversal_buf = vec![0u8; spread_size as usize];
    getrandom(&mut reversal_buf);

    (0..spread_size.min(deck_size) as usize)
        .map(|i| TarotCard {
            card_id: deck[i],
            reversed: reversal_buf[i] & 1 == 1,
        })
        .collect()
}

// ─── I-Ching Cast ────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct IChingResult {
    pub lines: [u8; 6],
    pub primary_hexagram: u8,
    pub relating_hexagram: Option<u8>,
    pub nuclear_hexagram: u8,
    pub changing_mask: u8,
    pub torus_pos: u8,
}

/// The strict three-coin receipt consumed by the M3' cast ribbon.
///
/// This is deliberately derived from the same kernel-authoritative coin throw
/// that is persisted to Nara history; the browser never supplies or derives a
/// line value.
#[derive(Debug, Serialize)]
pub struct IChingRibbonReceipt {
    pub cast_method: &'static str,
    pub lines: [u8; 6],
    pub primary_hexagram_id: u8,
    pub derived_hexagram_id: Option<u8>,
    pub changing_line_indices: Vec<u8>,
    pub cast_id: u32,
    pub provenance: &'static str,
}

pub fn cast_iching_coins() -> IChingResult {
    let mut rand_buf = [0u8; 18]; // 3 bytes per line x 6 lines
    getrandom(&mut rand_buf);

    let mut lines = [0u8; 6];
    let mut hex_bits: u8 = 0;
    let mut changing_mask: u8 = 0;

    for i in 0..6 {
        // 3 coins per line: coin values 2=yin, 3=yang
        let mut sum: u8 = 0;
        for c in 0..3 {
            sum += if rand_buf[i * 3 + c] & 1 == 1 { 3 } else { 2 };
        }
        lines[i] = sum; // 6=old yin, 7=young yang, 8=young yin, 9=old yang

        // Yang line (7 or 9) = bit set
        if sum & 1 == 1 {
            hex_bits |= 1u8 << i;
        }
        // Changing lines: 6 (old yin) or 9 (old yang)
        if sum == 6 || sum == 9 {
            changing_mask |= 1u8 << i;
        }
    }

    let primary = hex_bits & 0x3F;
    let relating = if changing_mask != 0 {
        Some((hex_bits ^ changing_mask) & 0x3F)
    } else {
        None
    };

    // Nuclear hexagram: inner 4 lines (2-5) form new hexagram
    // Lower trigram = lines 2,3,4; upper trigram = lines 3,4,5
    let nuclear_lower = (hex_bits >> 1) & 0x07;
    let nuclear_upper = (hex_bits >> 2) & 0x07;
    let nuclear = (nuclear_lower | (nuclear_upper << 3)) & 0x3F;

    let torus_pos = hexagram_to_torus_pos(primary);

    IChingResult {
        lines,
        primary_hexagram: primary,
        relating_hexagram: relating,
        nuclear_hexagram: nuclear,
        changing_mask,
        torus_pos,
    }
}

/// Cast and persist one governed three-coin I-Ching receipt for the M3 ribbon.
pub fn cast_iching_ribbon() -> Result<IChingRibbonReceipt, String> {
    let result = cast_iching_coins();
    let cast_id = next_cast_id();
    append_history(&HistoryEntry {
        cast_id,
        system: "iching".to_owned(),
        question: "M3 I-Ching cast ribbon".to_owned(),
        draw: serde_json::to_value(&result).unwrap_or_default(),
        cast_at: current_epoch(),
        hygiene: "governed-ribbon".to_owned(),
    })?;

    Ok(IChingRibbonReceipt {
        cast_method: "three-coin",
        lines: result.lines,
        primary_hexagram_id: result.primary_hexagram + 1,
        derived_hexagram_id: result.relating_hexagram.map(|hexagram| hexagram + 1),
        changing_line_indices: (0..6)
            .filter(|index| result.changing_mask & (1 << index) != 0)
            .collect(),
        cast_id,
        provenance: "epi-cli.nara.oracle.iching.three-coin",
    })
}

pub fn hexagram_to_torus_pos(h: u8) -> u8 {
    ((h.saturating_sub(1)) as u16 * 12 / 64) as u8
}

/// Cast coins and compute OraclePayload in one step — for portal clock state updates.
///
/// Does NOT write oracle history or perform hygiene checks.
/// Intended for portal-internal clock synchronization after a cast has already been
/// recorded via `cast()`.
///
/// `kairos_degree`: current sun degree (0.0-360.0) from KerykeionResult.
/// Pass 0.0 if kairos unavailable — the four faces still compute correctly.
pub fn cast_and_eval4(kairos_degree: f32, phase: u8) -> OraclePayload {
    let result = cast_iching_coins();
    oracle_eval4(&result, kairos_degree, phase)
}

/// Cast I-Ching coins once, write history, and return both the display string
/// and the OraclePayload — so the portal clock and the rendered cast come from
/// the SAME coin throw (eliminates the double-cast bug).
///
/// Bypasses temporal authority / hygiene / consent — callers must satisfy those
/// requirements before invoking this (e.g. portal 'y' consent gate).
///
/// `kairos_degree`: live degree from SharedClockState (0.0 if unavailable)
/// `phase`: 0 = explicate, 1 = implicate
pub fn cast_iching_with_payload(
    question: &str,
    kairos_degree: f32,
    phase: u8,
) -> Result<(String, OraclePayload), String> {
    let result = cast_iching_coins();
    let payload = oracle_eval4(&result, kairos_degree, phase);
    let cast_id = next_cast_id();

    append_history(&HistoryEntry {
        cast_id,
        system: "iching".to_string(),
        question: question.to_string(),
        draw: serde_json::to_value(&result).unwrap_or_default(),
        cast_at: current_epoch(),
        hygiene: "clear".to_string(),
    })?;

    let line_names: Vec<String> = result
        .lines
        .iter()
        .enumerate()
        .map(|(i, &v)| {
            let kind = match v {
                6 => "old yin ─ ─ →",
                7 => "young yang ───",
                8 => "young yin ─ ─",
                9 => "old yang ─── →",
                _ => "???",
            };
            format!("  Line {}: {} ({})", i + 1, v, kind)
        })
        .collect();

    let mut out = format!("I-Ching Cast #{cast_id}\n");
    out.push_str(&format!("  Question: {question}\n"));
    out.push_str(&format!(
        "  Primary hexagram: {}\n",
        result.primary_hexagram + 1
    ));
    if let Some(rel) = result.relating_hexagram {
        out.push_str(&format!("  Relating hexagram: {}\n", rel + 1));
    }
    out.push_str(&format!(
        "  Nuclear hexagram: {}\n",
        result.nuclear_hexagram + 1
    ));
    out.push_str(&format!("  Torus position: {}\n", result.torus_pos));
    for line in &line_names {
        out.push_str(&format!("{line}\n"));
    }
    out.push_str(&format!("  Degree: {:.1}°\n", payload.degree));

    // Append hexagram body map data — wires HEXAGRAM_BODY_DYNAMICS into oracle output.
    // Spec: 07-unified-architecture §7 (oracle payload machine+human)
    if let Some(body) = hexagram_body_lookup(result.primary_hexagram) {
        out.push_str(&format!(
            "  Body: {} (chakras {}/{})\n",
            body.dynamics, body.primary_chakra, body.secondary_chakra,
        ));
        if !body.body_zones.is_empty() {
            let zones: Vec<&str> = body.body_zones.iter().take(3).copied().collect();
            out.push_str(&format!("  Zones: {}\n", zones.join(", ")));
        }
    }

    Ok((out, payload))
}

/// Draw tarot, write history, return annotated display string and `OraclePayload`
/// atomically — parallel to `cast_iching_with_payload`.
///
/// Card elemental weights fold into pp/nn/pn/np via `tarot_draw_to_oracle_payload()`.
/// Hexagram body annotation appended from `HEXAGRAM_BODY_DYNAMICS` for the clock position.
pub fn cast_tarot_with_payload(
    system: &str,
    spread_size: u8,
    question: &str,
    hygiene_str: &str,
    kairos_degree: f32,
    phase: u8,
) -> Result<(String, OraclePayload), String> {
    let tarot_system = TarotSystem::from_str(system)?;
    let cards = draw_tarot(tarot_system, spread_size);
    let payload = tarot_draw_to_oracle_payload(&cards, kairos_degree, phase);
    let cast_id = next_cast_id();

    append_history(&HistoryEntry {
        cast_id,
        system: system.to_string(),
        question: question.to_string(),
        draw: serde_json::to_value(&cards).unwrap_or_default(),
        cast_at: current_epoch(),
        hygiene: hygiene_str.to_string(),
    })?;

    let element_labels = ["EARTH", "FIRE", "WATER", "AIR"];
    let mut out = format!("Tarot Draw #{cast_id} ({system})\n");
    out.push_str(&format!("  Question: {question}\n"));
    for (i, card) in cards.iter().enumerate() {
        let rev_str = if card.reversed { " (reversed)" } else { "" };
        let w = tarot_card_to_element_weights(card);
        let (dom_idx, _) = w
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| {
                a.abs()
                    .partial_cmp(&b.abs())
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .unwrap_or((1, &0.0));
        out.push_str(&format!(
            "  Position {}: Card {}{} [{}]\n",
            i + 1,
            card.card_id,
            rev_str,
            element_labels[dom_idx],
        ));
    }
    out.push_str(&format!("  Degree: {:.1}°\n", payload.degree));
    out.push_str(&format!(
        "  Charges — pp:{:.0} nn:{:.0} pn:{:.0} np:{:.0}\n",
        payload.pp, payload.nn, payload.pn, payload.np,
    ));

    if let Some(body) = hexagram_body_lookup(payload.primary_hex) {
        out.push_str(&format!(
            "  Body: {} (chakras {}/{})\n",
            body.dynamics, body.primary_chakra, body.secondary_chakra,
        ));
        if !body.body_zones.is_empty() {
            let zones: Vec<&str> = body.body_zones.iter().take(3).copied().collect();
            out.push_str(&format!("  Zones: {}\n", zones.join(", ")));
        }
    }

    Ok((out, payload))
}

/// Platform random — uses /dev/urandom on unix
fn getrandom(buf: &mut [u8]) {
    use std::io::Read;
    if let Ok(mut f) = std::fs::File::open("/dev/urandom") {
        let _ = f.read_exact(buf);
    }
}
