// S0 ADAPTER: Body/S/S0/portal-core (M3 codon law) — gateway membrane for design-language consumers; the codon algebra lives in portal-core.
//! Coordinate: S0 adapter over the M3 codon law.
//! Residency: Body/S/S0/epi-cli/src/gate
//! Position (#n): gateway membrane for design-language consumers
//! Actualises: `s2.codon.aa_lookup` from the C-backed portal-core LUT, and
//!   `s2.codon.scalar_ref.read` — the scalar-ref resolver the M3' surfaces
//!   read through. A scalar ref is scalar BY CONSTRUCTION (portal-core's
//!   `NaraScalarRef` carries no body field), so this method resolves an
//!   identity to its public scalar facts and can never smuggle a private
//!   interpretation body across the wire.
//! Public surface: aa_lookup, scalar_ref_read.
//! Does NOT own: codon encoding, amino-acid identity, the hexagram body
//!   dataset (`nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS`), the decan
//!   dataset (`nara::medicine_frame::ZODIAC_DECAN_TABLE`), or presentation.
//! Contract: [[S0-SPEC]] / [[M3'-SPEC]].

use portal_core::codon_to_amino_acid;
use portal_core::transcription::{is_start_codon, is_stop_codon, AMINO_ACID_NAMES};
use serde_json::{json, Value};

fn encode_codon(raw: &str) -> Result<u8, String> {
    let normalized = raw.trim().to_ascii_uppercase().replace('U', "T");
    if normalized.len() != 3 {
        return Err("codon must contain exactly three A/U/T/C/G bases".to_owned());
    }
    normalized.bytes().try_fold(0u8, |encoded, base| {
        let bits = match base {
            b'A' => 0,
            b'T' => 1,
            b'C' => 2,
            b'G' => 3,
            _ => return Err("codon must contain only A/U/T/C/G bases".to_owned()),
        };
        Ok((encoded << 2) | bits)
    })
}

pub fn aa_lookup(params: &Value) -> Result<Value, String> {
    let requested = params
        .get("codon")
        .and_then(Value::as_str)
        .ok_or_else(|| "codon is required".to_owned())?;
    let encoded = encode_codon(requested)?;
    let amino_acid_index = codon_to_amino_acid(encoded);
    let amino_acid = AMINO_ACID_NAMES
        .get(amino_acid_index as usize)
        .copied()
        .ok_or_else(|| "kernel codon LUT returned an unknown amino-acid index".to_owned())?;
    let rna_codon = requested.trim().to_ascii_uppercase().replace('T', "U");
    Ok(json!({
        "codon": rna_codon,
        "encoded": encoded,
        "aminoAcidIndex": amino_acid_index,
        "aminoAcid": amino_acid,
        "isStart": is_start_codon(encoded),
        "isStop": is_stop_codon(encoded),
        "authority": "portal-core::transcription"
    }))
}

// ---------------------------------------------------------------------------
// s2.codon.scalar_ref.read — 24.T24.7 / 24.T24.8 scalar-ref resolution
// ---------------------------------------------------------------------------

use crate::nara::{
    ace_element_lookup, ananda_harmonic_for_decan, body_zones_for_chakra, body_zones_for_decan,
    canonical_from_m2_tattva, chakra_for_planet, court_sign_lookup, herb_for_decan,
    hexagram_body_lookup, mode_for_decan, pip_decan_lookup, zodiac_decan,
};
use portal_core::m3_transcription_bridge::{major_arcana, minor_arcana_id_from_codon};

/// Scalar-ref kinds portal-core declares (`NaraScalarRefKind`, kebab-case over
/// the wire). Named here so an unknown kind is refused rather than silently
/// treated as unresolvable — a typo and an unlanded producer are different
/// answers and the caller needs to tell them apart.
const SCALAR_REF_KINDS: &[&str] = &[
    "m3-codon",
    "tarot",
    "i-ching",
    "decan",
    "line-change",
    "chronos",
    "kairos",
];

fn scalar_ref_index(raw: &Value) -> Result<u8, String> {
    let value = match raw {
        Value::Number(number) => number
            .as_u64()
            .ok_or_else(|| "scalarRef must be a non-negative integer".to_owned())?,
        Value::String(text) => text
            .trim()
            .parse::<u64>()
            .map_err(|_| "scalarRef must parse as a non-negative integer".to_owned())?,
        _ => return Err("scalarRef must be a number or a numeric string".to_owned()),
    };
    u8::try_from(value).map_err(|_| "scalarRef is out of range for this ref kind".to_owned())
}

/// Resolve a scalar M3 reference to its public facts.
///
/// Three kinds resolve today, each straight off a landed dataset. The rest are
/// declared kinds with no scalar producer yet; they answer `resolved: false`
/// with the reason and the owning tranche, because a surface that is told
/// "not yet, and here is who owns it" can render honestly, while one handed an
/// error cannot tell a missing producer from a broken call.
pub fn scalar_ref_read(params: &Value) -> Result<Value, String> {
    let ref_kind = params
        .get("refKind")
        .and_then(Value::as_str)
        .ok_or_else(|| "refKind is required".to_owned())?
        .trim();
    let scalar_ref = params
        .get("scalarRef")
        .ok_or_else(|| "scalarRef is required".to_owned())?;

    if !SCALAR_REF_KINDS.contains(&ref_kind) {
        return Err(format!(
            "unknown refKind '{ref_kind}' — portal-core declares {SCALAR_REF_KINDS:?}"
        ));
    }

    let scalar_ref_text = match scalar_ref {
        Value::String(text) => text.trim().to_owned(),
        other => other.to_string(),
    };

    let pending = |reason: &str, owner: &str| {
        Ok(json!({
            "refKind": ref_kind,
            "scalarRef": scalar_ref_text,
            "resolved": false,
            "reason": reason,
            "ownerTranche": owner
        }))
    };

    match ref_kind {
        "i-ching" => {
            let hexagram = scalar_ref_index(scalar_ref)?;
            let Some(entry) = hexagram_body_lookup(hexagram) else {
                return Err("i-ching scalarRef must be a King Wen number 1..=64".to_owned());
            };
            Ok(json!({
                "refKind": ref_kind,
                "scalarRef": scalar_ref_text,
                "resolved": true,
                "entry": {
                    "hexagramId": entry.hexagram_number,
                    "primaryChakraId": entry.primary_chakra,
                    // The dataset carries ONE secondary chakra per hexagram; it
                    // is emitted as a single-element list because the consuming
                    // contract reads a list, and a hexagram whose secondary
                    // equals its primary is what the dataset says, not a bug to
                    // deduplicate away.
                    "secondaryChakraIds": [entry.secondary_chakra],
                    "bodyZones": entry.body_zones,
                    "dynamic": entry.dynamics
                },
                "authority": "epi-cli::nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS"
            }))
        }
        "decan" => {
            let decan = scalar_ref_index(scalar_ref)?;
            let Some(entry) = zodiac_decan(decan) else {
                return Err("decan scalarRef must be an index 0..=35".to_owned());
            };
            Ok(json!({
                "refKind": ref_kind,
                "scalarRef": scalar_ref_text,
                "resolved": true,
                "entry": {
                    "decanIndex": decan,
                    "sign": entry.sign,
                    "decanInSign": entry.decan_in_sign,
                    "rulingPlanet": entry.ruling_planet,
                    "element": entry.element,
                    "mode": entry.mode,
                    "modeName": mode_for_decan(decan),
                    "anandaHarmonic": ananda_harmonic_for_decan(decan),
                    "bodyZones": body_zones_for_decan(decan),
                    "herb": herb_for_decan(decan)
                },
                "authority": "epi-cli::nara::medicine_frame::ZODIAC_DECAN_TABLE"
            }))
        }
        "m3-codon" => {
            // The codon kind resolves through the SAME LUT read `aa_lookup`
            // serves, rather than a second decode path beside it.
            let codon = scalar_ref
                .as_str()
                .ok_or_else(|| "m3-codon scalarRef must be a three-base string".to_owned())?;
            let entry = aa_lookup(&json!({ "codon": codon }))?;
            Ok(json!({
                "refKind": ref_kind,
                "scalarRef": scalar_ref_text,
                "resolved": true,
                "entry": entry,
                "authority": "portal-core::transcription"
            }))
        }
        "tarot" => {
            let key = scalar_ref.as_str().ok_or_else(|| {
                "tarot scalarRef must be a card key string like 'wands:02', 'cups:queen' or 'major:5'"
                    .to_owned()
            })?;
            resolve_tarot_card(&scalar_ref_text, key)
        }
        "line-change" => pending(
            "line-change scalars are carried on the oracle envelope, not resolvable standalone",
            "24.T24.9",
        ),
        "chronos" | "kairos" => pending(
            "temporal scalars resolve through the kairos producer, not this M3 read",
            "32.T32.10",
        ),
        other => Err(format!("unhandled refKind '{other}'")),
    }
}

// ---------------------------------------------------------------------------
// refKind "tarot" — 24.T24.6 card-key resolution
// ---------------------------------------------------------------------------

/// Suit token → suit index (m3.h `Tarot_Suit`: Cups=0, Wands=1, Pentacles=2,
/// Swords=3 — the A/T/C/G family order `M3_TAROT_CODON_MAP` is written in).
fn tarot_suit_index(token: &str) -> Option<u8> {
    match token {
        "cups" => Some(0),
        "wands" => Some(1),
        "pentacles" => Some(2),
        "swords" => Some(3),
        _ => None,
    }
}

/// Card id (0..=55, `suit*14 + rank-1`) → its PRIMARY codon, through the
/// public kernel inverse rather than a second copy of the cover table.
fn primary_codon_for_card(card_id: u8) -> Option<u8> {
    (0u8..64).find(|codon| minor_arcana_id_from_codon(*codon) == Some(card_id))
}

/// Resolve a tarot card key (`major:N` | `{suit}:{rank}`) to its public facts.
///
/// Pips resolve the FULL decan chain the 24.7 consumer parses (suit → codon →
/// decan → sign → planet → element → chakra → body zones), every fact off the
/// one `ZODIAC_DECAN_TABLE` authority the `decan` kind already serves — the
/// pip map contributes only the card → (sign, decan) address. Courts carry
/// their cusp signs, aces their root element, majors their kernel codon set;
/// none of those three HAS a decan in the dataset, so none pretends to.
fn resolve_tarot_card(scalar_ref_text: &str, key: &str) -> Result<Value, String> {
    let normalized = key.trim().to_ascii_lowercase();
    let (head, tail) = normalized
        .split_once(':')
        .ok_or_else(|| "tarot scalarRef must be '<suit|major>:<rank|id>'".to_owned())?;

    let reply = |kind: &str, detail: Value, authority: &str| {
        json!({
            "refKind": "tarot",
            "scalarRef": scalar_ref_text,
            "resolved": true,
            "kind": kind,
            "detail": detail,
            "authority": authority
        })
    };

    if head == "major" {
        let card_id: u8 = tail
            .parse()
            .map_err(|_| "major arcana id must be an integer 0..=21".to_owned())?;
        if card_id > 21 {
            return Err("major arcana id must be an integer 0..=21".to_owned());
        }
        // The kernel law binds arcana to codons via the amino-acid index
        // (19.5 `m3_major_arcana_from_codon`); the card's codon set and name
        // are read back through that one authority. Atu 10 is the STOP hole —
        // no codon produces it, and an empty set is the honest answer.
        let mut codons: Vec<u8> = Vec::new();
        let mut name: Option<String> = None;
        for codon in 0u8..64 {
            if let Some(card) = major_arcana(codon) {
                if card.card_id == card_id {
                    codons.push(codon);
                    name.get_or_insert(card.name);
                }
            }
        }
        return Ok(reply(
            "major",
            json!({
                "cardId": card_id,
                "name": name,
                "codons": codons,
                "note": if codons.is_empty() {
                    Some("no codon binds this card — the amino-acid STOP hole, an answer not an absence")
                } else {
                    None
                }
            }),
            "portal-core::m3_transcription_bridge::major_arcana",
        ));
    }

    let suit = tarot_suit_index(head)
        .ok_or_else(|| format!("unknown tarot suit '{head}' — cups|wands|pentacles|swords"))?;

    // Rank tokens mirror the carrier's `RANK_TOKENS` ('ace', '02'..'10',
    // 'page'/'knight'/'queen'/'king'); the Thoth court names are accepted as
    // aliases because the dataset itself is Thoth-ordered.
    let (rank_in_deck, court_rank): (u8, Option<u8>) = match tail {
        "ace" | "01" | "1" => (1, None),
        "page" | "princess" => (11, Some(10)),
        "knight" | "prince" => (12, Some(11)),
        "queen" => (13, Some(12)),
        "king" => (14, Some(13)),
        pip => {
            let value: u8 = pip
                .parse()
                .map_err(|_| format!("unknown tarot rank token '{pip}'"))?;
            if !(2..=10).contains(&value) {
                return Err("pip value must be 2..=10".to_owned());
            }
            (value, None)
        }
    };

    let card_id = suit * 14 + (rank_in_deck - 1);

    if rank_in_deck == 1 {
        let entry = ace_element_lookup(suit).ok_or_else(|| "ace lookup out of range".to_owned())?;
        return Ok(reply(
            "ace",
            json!({
                "suit": head,
                "cardId": card_id,
                "codonId": primary_codon_for_card(card_id),
                // Serialised in the L2' alchemical register (DR-37-3 wire law);
                // the dataset stores the m2.h tattva id, converted here.
                "elementId": canonical_from_m2_tattva(entry.element_id),
                "elementName": entry.element_name
            }),
            "epi-cli::nara::oracle_identity::ACE_ELEMENT_MAP",
        ));
    }

    if let Some(rank) = court_rank {
        let entry =
            court_sign_lookup(suit, rank).ok_or_else(|| "court lookup out of range".to_owned())?;
        return Ok(reply(
            "court",
            json!({
                "suit": head,
                "rank": tail,
                "cardId": card_id,
                "codonId": primary_codon_for_card(card_id),
                "signA": entry.sign_a,
                "signB": if entry.sign_b == 0xFF { Value::Null } else { json!(entry.sign_b) }
            }),
            "epi-cli::nara::oracle_identity::COURT_SIGN_MAP",
        ));
    }

    // Pip 2..=10 — the full decan chain.
    let pip =
        pip_decan_lookup(suit, rank_in_deck).ok_or_else(|| "pip lookup out of range".to_owned())?;
    let decan_index = pip.zodiac_sign * 3 + pip.decan;
    let decan = zodiac_decan(decan_index)
        .ok_or_else(|| "pip decan address is outside the 36-decan table".to_owned())?;
    let chakra = chakra_for_planet(decan.ruling_planet)
        .ok_or_else(|| "decan ruling planet is outside the resonance dataset".to_owned())?;
    Ok(reply(
        "pip",
        json!({
            "suit": head,
            "cardId": card_id,
            "codonId": primary_codon_for_card(card_id),
            "decanIndex": decan_index,
            "zodiacSign": decan.sign,
            "rulingPlanet": decan.ruling_planet,
            "elementId": decan.element,
            "chakraId": chakra,
            "bodyZones": body_zones_for_chakra(chakra),
            "decanBodyPart": decan.body_part,
            "decanHerbs": [decan.herb]
        }),
        "epi-cli::nara::{oracle_identity::PIP_DECAN_MAP, medicine_frame::ZODIAC_DECAN_TABLE}",
    ))
}
