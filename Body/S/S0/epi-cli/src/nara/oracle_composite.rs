//! Coordinate: M4 oracle composite exposed through the S0 membrane
//! Residency: Body/S/S0/epi-cli/src/nara
//! Position (#n): #4 - typed cast/history/aliveness projection.
//! Actualises: one governed oracle cast as a structured receipt, plus the
//!   protected-local append-only state needed to read each spread over time.
//! Public surface: cast_iching_typed, cast_tarot_typed, read_history_typed,
//!   update_position_state.
//! Does NOT own: random draw law (oracle_cast), correspondence LUTs
//!   (oracle_identity/portal-core), day-artifact writes (M' Tauri host), or
//!   Spacetime publication (S3 gateway adapter).
//! Contract: [[M4-SPEC]]; design-recon 25.T25.8-25.T25.9.

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::io::Write;
use std::path::{Path, PathBuf};

use portal_core::m3_transcription_bridge::{
    major_arcana, minor_arcana, minor_arcana_id_from_codon,
};

use super::medicine_frame::{body_zones_for_chakra, chakra_for_planet, chakra_name, planet_name};
use super::oracle_cast::{cast_tarot_with_payload, IChingResult};
use super::oracle_identity::{
    ace_element_lookup, codon_sequence, court_sign_lookup, hexagram_body_lookup, pip_decan_lookup,
};
use super::oracle_route::{
    consent_gate, current_epoch, history_path, hygiene_check, load_history, HistoryEntry,
    HygieneResult,
};

const POSITION_STATE_FILE: &str = "position-states.jsonl";
const MAX_HISTORY_LIMIT: usize = 100;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum OracleLiveState {
    Generating,
    Muting,
    Mute,
}

impl OracleLiveState {
    fn next_is_valid(self, next: Self) -> bool {
        matches!(
            (self, next),
            (Self::Generating, Self::Muting)
                | (Self::Muting, Self::Mute)
                | (Self::Muting, Self::Generating)
                | (Self::Mute, Self::Generating)
        )
    }

    pub fn as_s3_value(self) -> u8 {
        match self {
            Self::Generating => 0,
            Self::Muting => 1,
            Self::Mute => 2,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct PositionStateEvent {
    spread_id: String,
    position_index: u8,
    live_state: OracleLiveState,
    changed_at: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OraclePositionProjection {
    pub position_index: u8,
    pub card_id: u16,
    pub card_kind: String,
    pub live_state: OracleLiveState,
    pub target_aspect: Option<Value>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleCastReceipt {
    pub cast_id: u32,
    pub spread_id: String,
    pub system: String,
    pub cast_at: u64,
    pub hygiene: String,
    pub output: String,
    pub draw: Value,
    pub positions: Vec<OraclePositionProjection>,
    pub envelope: Value,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleHistoryEntryProjection {
    pub cast_id: u32,
    pub spread_id: String,
    pub system: String,
    pub question_prefix: String,
    pub cast_at: u64,
    pub hygiene: String,
    pub draw: Value,
    pub positions: Vec<OraclePositionProjection>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleHistoryProjection {
    pub total_count: usize,
    pub generated_at: u64,
    pub entries: Vec<OracleHistoryEntryProjection>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OraclePositionStateReceipt {
    pub spread_id: String,
    pub position_index: u8,
    pub previous_state: OracleLiveState,
    pub live_state: OracleLiveState,
    pub changed_at: u64,
}

fn state_path() -> PathBuf {
    history_path()
        .parent()
        .expect("oracle history path has a parent")
        .join(POSITION_STATE_FILE)
}

fn hygiene_label(result: &HygieneResult) -> &'static str {
    match result {
        HygieneResult::Clear => "clear",
        HygieneResult::Warning { .. } => "warning",
        HygieneResult::Block { .. } => "blocked",
    }
}

fn authorise(question: &str, yes: bool) -> Result<String, String> {
    super::kairos::require_temporal_authority()?;
    let hygiene = hygiene_check(question, &history_path());
    match &hygiene {
        HygieneResult::Block { reason } => return Err(format!("oracle: {reason}")),
        HygieneResult::Warning { notes, .. } => {
            for note in notes {
                eprintln!("Warning: {note}");
            }
        }
        HygieneResult::Clear => {}
    }
    consent_gate(yes)?;
    Ok(hygiene_label(&hygiene).to_owned())
}

fn parse_cast_id(output: &str) -> Result<u32, String> {
    output
        .lines()
        .next()
        .and_then(|line| line.split('#').nth(1))
        .and_then(|tail| tail.split(|ch: char| !ch.is_ascii_digit()).next())
        .and_then(|digits| digits.parse::<u32>().ok())
        .ok_or_else(|| format!("oracle cast returned no parseable cast id: {output}"))
}

fn nucleotide_for_line(value: u8) -> Result<char, String> {
    match value {
        6 => Ok('A'),
        9 => Ok('T'),
        7 => Ok('C'),
        8 => Ok('G'),
        other => Err(format!("I-Ching line value must be 6-9, got {other}")),
    }
}

fn codon_text(codon: u8) -> String {
    String::from_utf8_lossy(&codon_sequence(codon)).into_owned()
}

fn primary_codon_for_card(card_id: u8) -> Option<u8> {
    if card_id < 22 {
        return (0u8..64)
            .find(|codon| major_arcana(*codon).is_some_and(|card| card.card_id == card_id));
    }
    let minor_id = card_id - 22;
    (0u8..64).find(|codon| minor_arcana_id_from_codon(*codon) == Some(minor_id))
}

fn element_for_suit(suit: &str) -> Option<&'static str> {
    match suit {
        "Cups" => Some("Water"),
        "Wands" => Some("Fire"),
        "Pentacles" => Some("Earth"),
        "Swords" => Some("Air"),
        _ => None,
    }
}

fn project_iching_draw(draw: &Value) -> Result<Value, String> {
    let result: IChingResult = serde_json::from_value(draw.clone())
        .map_err(|error| format!("invalid persisted I-Ching draw: {error}"))?;
    let nucleotides = result
        .lines
        .iter()
        .map(|value| nucleotide_for_line(*value))
        .collect::<Result<Vec<_>, _>>()?;
    let lower_codon = nucleotides[..3].iter().collect::<String>();
    let upper_codon = nucleotides[3..].iter().collect::<String>();
    let body = hexagram_body_lookup(result.primary_hexagram).map(|entry| {
        json!({
            "hexagramId": entry.hexagram_number,
            "primaryChakra": entry.primary_chakra,
            "secondaryChakra": entry.secondary_chakra,
            "bodyZones": entry.body_zones,
            "dynamics": entry.dynamics,
            "source": "HEXAGRAM_BODY_DYNAMICS"
        })
    });
    let lines = result
        .lines
        .iter()
        .enumerate()
        .map(|(index, value)| {
            let nucleotide = nucleotides[index];
            let codon = if index < 3 {
                &lower_codon
            } else {
                &upper_codon
            };
            let line_type = match value {
                6 => "old-yin",
                7 => "young-yang",
                8 => "young-yin",
                9 => "old-yang",
                _ => unreachable!("validated I-Ching line"),
            };
            json!({
                "lineIndex": index + 1,
                "value": value,
                "lineType": line_type,
                "moving": *value == 6 || *value == 9,
                "nucleotide": nucleotide.to_string(),
                "codonRef": format!("m3-codon://{codon}#line-{}", index + 1)
            })
        })
        .collect::<Vec<_>>();
    Ok(json!({
        "lines": lines,
        "primaryHexagramId": result.primary_hexagram + 1,
        "relatingHexagramId": result.relating_hexagram.map(|value| value + 1),
        "nuclearHexagramId": result.nuclear_hexagram + 1,
        "changingMask": result.changing_mask,
        "torusPosition": result.torus_pos,
        "body": body
    }))
}

fn project_tarot_draw(draw: &Value) -> Result<Value, String> {
    let cards = draw
        .as_array()
        .ok_or_else(|| "invalid persisted Tarot draw: expected cards array".to_owned())?;
    let projected = cards
        .iter()
        .enumerate()
        .map(|(position, card)| {
            let card_id = card
                .get("card_id")
                .and_then(Value::as_u64)
                .and_then(|id| u8::try_from(id).ok())
                .filter(|id| *id < 78)
                .ok_or_else(|| format!("invalid Tarot card id at position {position}"))?;
            let reversed = card
                .get("reversed")
                .and_then(Value::as_bool)
                .ok_or_else(|| format!("invalid Tarot reversal at position {position}"))?;
            if card_id < 22 {
                let codon = primary_codon_for_card(card_id);
                let major = codon.and_then(major_arcana);
                return Ok(json!({
                    "positionIndex": position,
                    "cardId": card_id,
                    "reversed": reversed,
                    "cardKind": "tarot-major",
                    "label": major
                        .map(|card| card.name)
                        .unwrap_or_else(|| format!("Major Arcana {card_id}")),
                    "codonRef": codon.map(|value| format!("m3-codon://{}", codon_text(value))),
                    "codonBinding": if codon.is_some() { "primary" } else { "unbound" },
                    "suit": Value::Null,
                    "rank": Value::Null,
                    "decan": Value::Null,
                    "planet": Value::Null,
                    "element": Value::Null,
                    "chakra": Value::Null,
                    "bodyZones": [],
                    "chainSource": "kernel-oracle-luts"
                }));
            }

            let minor_id = card_id - 22;
            let codon = primary_codon_for_card(card_id)
                .ok_or_else(|| format!("no canonical M3 codon for Tarot card {card_id}"))?;
            let codon_ref = format!("m3-codon://{}", codon_text(codon));
            let minor = minor_arcana(minor_id)
                .ok_or_else(|| format!("card {card_id} did not resolve as Minor Arcana"))?;
            let suit = minor_id / 14;
            let rank = minor_id % 14;
            let element = element_for_suit(&minor.suit);
            let (decan, planet_id) = if (1..=9).contains(&rank) {
                let entry = pip_decan_lookup(suit, rank + 1)
                    .ok_or_else(|| format!("missing PIP_DECAN_MAP entry for card {card_id}"))?;
                (
                    Some(json!({"zodiacSign": entry.zodiac_sign, "index": entry.decan})),
                    Some(entry.ruling_planet),
                )
            } else if rank >= 10 {
                let entry = court_sign_lookup(suit, rank)
                    .ok_or_else(|| format!("missing COURT_SIGN_MAP entry for card {card_id}"))?;
                (
                    Some(json!({"zodiacSign": entry.sign_a, "secondarySign": entry.sign_b})),
                    None,
                )
            } else {
                let ace = ace_element_lookup(suit)
                    .ok_or_else(|| format!("missing ACE_ELEMENT_MAP entry for card {card_id}"))?;
                (Some(json!({"aceElementId": ace.element_id})), None)
            };
            let chakra_id = planet_id.and_then(chakra_for_planet);
            let zones = chakra_id.map(body_zones_for_chakra).unwrap_or_default();
            Ok(json!({
                "positionIndex": position,
                "cardId": card_id,
                "reversed": reversed,
                "cardKind": if rank >= 10 { "tarot-court" } else { "tarot-pip" },
                "label": format!("{} of {}", minor.rank, minor.suit),
                "codonRef": codon_ref,
                "codonBinding": "primary",
                "suit": minor.suit,
                "rank": minor.rank,
                "decan": decan,
                "planet": planet_id.map(|id| json!({"id": id, "name": planet_name(id)})),
                "element": element,
                "chakra": chakra_id.map(|id| json!({"id": id, "name": chakra_name(id)})),
                "bodyZones": zones,
                "chainSource": "kernel-oracle-luts"
            }))
        })
        .collect::<Result<Vec<_>, String>>()?;
    Ok(json!({"spreadSize": projected.len(), "cards": projected}))
}

fn positions_for(
    entry: &HistoryEntry,
    states: &StateMap,
) -> Result<Vec<OraclePositionProjection>, String> {
    let spread_id = spread_id(entry.cast_id);
    let card_facts = if entry.system == "iching" {
        let primary = entry
            .draw
            .get("primary_hexagram")
            .and_then(Value::as_u64)
            .ok_or_else(|| format!("cast {} has no primary hexagram", entry.cast_id))?
            as u16;
        (0..6)
            .map(|_| (primary, "hexagram".to_owned()))
            .collect::<Vec<_>>()
    } else {
        entry
            .draw
            .as_array()
            .ok_or_else(|| format!("cast {} has no Tarot card array", entry.cast_id))?
            .iter()
            .map(|card| {
                let id = card
                    .get("card_id")
                    .and_then(Value::as_u64)
                    .ok_or_else(|| format!("cast {} has invalid Tarot card", entry.cast_id))?;
                let kind = if id < 22 {
                    "tarot-major"
                } else if (id - 22) % 14 >= 10 {
                    "tarot-court"
                } else {
                    "tarot-pip"
                };
                Ok((id as u16, kind.to_owned()))
            })
            .collect::<Result<Vec<_>, String>>()?
    };
    Ok(card_facts
        .into_iter()
        .enumerate()
        .map(|(index, (card_id, card_kind))| OraclePositionProjection {
            position_index: index as u8,
            card_id,
            card_kind,
            live_state: states
                .get(&(spread_id.clone(), index as u8))
                .copied()
                .unwrap_or(OracleLiveState::Generating),
            target_aspect: None,
        })
        .collect())
}

type StateMap = HashMap<(String, u8), OracleLiveState>;

fn load_states(path: &Path) -> Result<StateMap, String> {
    if !path.exists() {
        return Ok(HashMap::new());
    }
    let data = std::fs::read_to_string(path).map_err(|error| error.to_string())?;
    let mut states = HashMap::new();
    for (line_number, line) in data.lines().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        let event: PositionStateEvent = serde_json::from_str(line).map_err(|error| {
            format!(
                "invalid oracle position-state journal at line {}: {error}",
                line_number + 1
            )
        })?;
        states.insert((event.spread_id, event.position_index), event.live_state);
    }
    Ok(states)
}

fn append_state(event: &PositionStateEvent) -> Result<(), String> {
    let path = state_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|error| error.to_string())?;
    let json = serde_json::to_string(event).map_err(|error| error.to_string())?;
    writeln!(file, "{json}").map_err(|error| error.to_string())
}

fn spread_id(cast_id: u32) -> String {
    format!("oracle-spread-{cast_id}")
}

fn scalar_refs(draw: &Value) -> Vec<Value> {
    let mut refs = Vec::new();
    let mut visit = |value: &Value| {
        if let Some(reference) = value.get("codonRef").and_then(Value::as_str) {
            refs.push(json!({
                "ref_kind": "m3-codon",
                "scalar_ref": reference,
                "source_handle": "portal-core::m3_transcription_bridge"
            }));
        }
    };
    if let Some(lines) = draw.get("lines").and_then(Value::as_array) {
        for line in lines {
            visit(line);
        }
    }
    if let Some(cards) = draw.get("cards").and_then(Value::as_array) {
        for card in cards {
            visit(card);
        }
    }
    refs
}

fn envelope_for(
    entry: &HistoryEntry,
    draw: &Value,
    positions: &[OraclePositionProjection],
) -> Value {
    let spread_id = spread_id(entry.cast_id);
    let cp_position_refs = positions
        .iter()
        .map(|position| format!("CP4.3.{}", position.position_index + 1))
        .collect::<Vec<_>>();
    json!({
        "system": entry.system,
        "oracle_frame_ref": format!("oracle-frame://cast/{}", entry.cast_id),
        "vak_address": {"cp": cp_position_refs, "cs": {"code": "CS0", "direction": "Day"}},
        "cp_position_refs": cp_position_refs,
        "spread_label": if entry.system == "iching" { "six-line" } else { "tarot-spread" },
        "sequence_mode": "single-cast",
        "packet_refs": [],
        "graph_provenance_handles": [],
        "review_state": "live-only",
        "scalar_refs": scalar_refs(draw),
        "interpretation": {"handle": format!("protected-local://oracle/{spread_id}/interpretation")}
    })
}

fn receipt_for(entry: &HistoryEntry, output: String) -> Result<OracleCastReceipt, String> {
    let states = load_states(&state_path())?;
    let positions = positions_for(entry, &states)?;
    let draw = if entry.system == "iching" {
        project_iching_draw(&entry.draw)?
    } else {
        project_tarot_draw(&entry.draw)?
    };
    let envelope = envelope_for(entry, &draw, &positions);
    Ok(OracleCastReceipt {
        cast_id: entry.cast_id,
        spread_id: spread_id(entry.cast_id),
        system: entry.system.clone(),
        cast_at: entry.cast_at,
        hygiene: entry.hygiene.clone(),
        output,
        draw,
        positions,
        envelope,
    })
}

pub fn cast_iching_typed(question: &str, yes: bool) -> Result<OracleCastReceipt, String> {
    let output = super::oracle_route::cast("iching", question, yes, None)?;
    let cast_id = parse_cast_id(&output)?;
    let history = load_history(&history_path())?;
    let entry = history
        .iter()
        .find(|entry| entry.cast_id == cast_id)
        .ok_or_else(|| format!("oracle cast {cast_id} was not persisted"))?;
    receipt_for(entry, output)
}

pub fn cast_tarot_typed(
    system: &str,
    question: &str,
    spread_size: u8,
    yes: bool,
) -> Result<OracleCastReceipt, String> {
    if !matches!(spread_size, 3 | 4 | 5) {
        return Err("spreadSize must be 3, 4, or 5".to_owned());
    }
    let hygiene = authorise(question, yes)?;
    let (output, _) = cast_tarot_with_payload(system, spread_size, question, &hygiene, 0.0, 0)?;
    let cast_id = parse_cast_id(&output)?;
    let history = load_history(&history_path())?;
    let entry = history
        .iter()
        .find(|entry| entry.cast_id == cast_id)
        .ok_or_else(|| format!("oracle cast {cast_id} was not persisted"))?;
    receipt_for(entry, output)
}

pub fn read_history_typed(
    limit: usize,
    from_epoch: Option<u64>,
    to_epoch: Option<u64>,
) -> Result<OracleHistoryProjection, String> {
    let history = load_history(&history_path())?;
    let states = load_states(&state_path())?;
    let bounded = limit.clamp(1, MAX_HISTORY_LIMIT);
    let filtered = history
        .iter()
        .filter(|entry| from_epoch.is_none_or(|from| entry.cast_at >= from))
        .filter(|entry| to_epoch.is_none_or(|to| entry.cast_at <= to))
        .collect::<Vec<_>>();
    let total_count = filtered.len();
    let entries = filtered
        .into_iter()
        .rev()
        .take(bounded)
        .map(|entry| {
            let draw = if entry.system == "iching" {
                project_iching_draw(&entry.draw)?
            } else {
                project_tarot_draw(&entry.draw)?
            };
            Ok(OracleHistoryEntryProjection {
                cast_id: entry.cast_id,
                spread_id: spread_id(entry.cast_id),
                system: entry.system.clone(),
                question_prefix: entry.question.chars().take(80).collect(),
                cast_at: entry.cast_at,
                hygiene: entry.hygiene.clone(),
                draw,
                positions: positions_for(entry, &states)?,
            })
        })
        .collect::<Result<Vec<_>, String>>()?;
    Ok(OracleHistoryProjection {
        total_count,
        generated_at: current_epoch(),
        entries,
    })
}

pub fn update_position_state(
    spread_id_value: &str,
    position_index: u8,
    live_state: OracleLiveState,
) -> Result<OraclePositionStateReceipt, String> {
    let cast_id = spread_id_value
        .strip_prefix("oracle-spread-")
        .and_then(|value| value.parse::<u32>().ok())
        .ok_or_else(|| format!("unknown oracle spread: {spread_id_value}"))?;
    let history = load_history(&history_path())?;
    let entry = history
        .iter()
        .find(|entry| entry.cast_id == cast_id)
        .ok_or_else(|| format!("unknown oracle spread: {spread_id_value}"))?;
    let states = load_states(&state_path())?;
    let positions = positions_for(entry, &states)?;
    let position = positions.get(position_index as usize).ok_or_else(|| {
        format!("positionIndex {position_index} is outside spread {spread_id_value}")
    })?;
    let previous_state = position.live_state;
    if !previous_state.next_is_valid(live_state) {
        let expected = match previous_state {
            OracleLiveState::Generating => "generating -> muting",
            OracleLiveState::Muting => "muting -> mute or generating",
            OracleLiveState::Mute => "mute -> generating",
        };
        return Err(format!(
            "invalid oracle position transition; expected {expected}"
        ));
    }
    let changed_at = current_epoch();
    append_state(&PositionStateEvent {
        spread_id: spread_id_value.to_owned(),
        position_index,
        live_state,
        changed_at,
    })?;
    Ok(OraclePositionStateReceipt {
        spread_id: spread_id_value.to_owned(),
        position_index,
        previous_state,
        live_state,
        changed_at,
    })
}

#[cfg(test)]
mod tests {
    use super::project_tarot_draw;
    use serde_json::json;

    #[test]
    fn tarot_major_without_a_primary_codon_remains_a_valid_card() {
        let projected = project_tarot_draw(&json!([{
            "card_id": 2,
            "reversed": false
        }]))
        .expect("a valid Major Arcana card must not invalidate the cast");

        let card = &projected["cards"][0];
        assert_eq!(card["cardId"], 2);
        assert_eq!(card["cardKind"], "tarot-major");
        assert_eq!(card["codonRef"], serde_json::Value::Null);
        assert_eq!(card["codonBinding"], "unbound");
    }
}
