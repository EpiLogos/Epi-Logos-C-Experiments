use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use super::oracle_cast::{cast_iching_coins, cast_tarot_with_payload};

// ─── Hygiene ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub enum HygieneResult {
    Clear,
    Warning {
        flags: Vec<HygieneFlag>,
        notes: Vec<String>,
    },
    Block {
        reason: String,
    },
}

#[derive(Debug, Serialize)]
pub enum HygieneFlag {
    RecentCast { minutes_ago: u32 },
    SameQuestion { previous_answer: String },
    ExcessiveFrequency { casts_today: u32 },
}

pub fn hygiene_check(question: &str, history_path: &Path) -> HygieneResult {
    let entries = load_history(history_path).unwrap_or_default();
    let now = current_epoch();
    let today_start = now - (now % 86400);

    let casts_today: u32 = entries.iter().filter(|e| e.cast_at >= today_start).count() as u32;

    // Block: >6 casts today
    if casts_today >= 6 {
        return HygieneResult::Block {
            reason: format!("Excessive frequency: {} casts today (max 6)", casts_today),
        };
    }

    let mut flags = Vec::new();
    let mut notes = Vec::new();

    // Warning: same question in last 24h
    if let Some(prev) = entries
        .iter()
        .rev()
        .find(|e| e.question == question && (now - e.cast_at) < 86400)
    {
        flags.push(HygieneFlag::SameQuestion {
            previous_answer: format!("cast_id: {}", prev.cast_id),
        });
        notes.push("Same question asked in last 24h — consider the previous answer.".to_string());
    }

    // Warning: any cast in last 10 minutes
    if let Some(recent) = entries.iter().rev().find(|e| (now - e.cast_at) < 600) {
        let minutes_ago = ((now - recent.cast_at) / 60) as u32;
        flags.push(HygieneFlag::RecentCast { minutes_ago });
        notes.push(format!(
            "Recent cast {} minutes ago — allow time for integration.",
            minutes_ago
        ));
    }

    if flags.is_empty() {
        HygieneResult::Clear
    } else {
        HygieneResult::Warning { flags, notes }
    }
}

// ─── Consent Gate ────────────────────────────────────────────────────────

pub fn consent_gate(yes_flag: bool) -> Result<(), String> {
    if yes_flag {
        return Ok(());
    }
    print!("Cast oracle? This is a sacred portal. [y/N]: ");
    std::io::stdout().flush().ok();
    let mut input = String::new();
    std::io::stdin()
        .read_line(&mut input)
        .map_err(|e| format!("oracle: input error: {e}"))?;
    if input.trim().to_lowercase() == "y" {
        Ok(())
    } else {
        Err("oracle: cast cancelled".to_string())
    }
}

// ─── History ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub cast_id: u32,
    pub system: String,
    pub question: String,
    pub draw: serde_json::Value,
    pub cast_at: u64,
    pub hygiene: String,
}

fn history_path() -> PathBuf {
    super::identity::nara_home()
        .join("oracle")
        .join("history.jsonl")
}

fn load_history(path: &Path) -> Result<Vec<HistoryEntry>, String> {
    if !path.exists() {
        return Ok(vec![]);
    }
    let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mut entries = Vec::new();
    for line in data.lines() {
        if line.trim().is_empty() {
            continue;
        }
        if let Ok(entry) = serde_json::from_str::<HistoryEntry>(line) {
            entries.push(entry);
        }
    }
    Ok(entries)
}

pub(crate) fn append_history(entry: &HistoryEntry) -> Result<(), String> {
    let path = history_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    let json = serde_json::to_string(entry).map_err(|e| e.to_string())?;
    writeln!(file, "{json}").map_err(|e| e.to_string())
}

pub(crate) fn next_cast_id() -> u32 {
    load_history(&history_path())
        .unwrap_or_default()
        .last()
        .map(|e| e.cast_id + 1)
        .unwrap_or(1)
}

/// epi nara oracle cast --system <sys> --question "..." [-y]
pub fn cast(
    system: &str,
    question: &str,
    yes: bool,
    method: Option<&str>,
) -> Result<String, String> {
    // Temporal authority check
    super::kairos::require_temporal_authority()?;

    // Hygiene check
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

    // Consent gate
    consent_gate(yes)?;

    let hygiene_str = match &hygiene {
        HygieneResult::Clear => "clear",
        HygieneResult::Warning { .. } => "warning",
        HygieneResult::Block { .. } => "blocked",
    };

    // Dispatch by system
    if system.starts_with("iching") || system == "iching" {
        let method_str = method.unwrap_or("coins");
        if method_str == "yarrow" {
            return Err("yarrow: not yet implemented".to_string());
        }

        let result = cast_iching_coins();
        let cast_id = next_cast_id();

        append_history(&HistoryEntry {
            cast_id,
            system: "iching".to_string(),
            question: question.to_string(),
            draw: serde_json::to_value(&result).unwrap_or_default(),
            cast_at: current_epoch(),
            hygiene: hygiene_str.to_string(),
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

        Ok(out)
    } else {
        // Tarot — use cast_tarot_with_payload for atomic draw + history + clock payload
        let spread_size = 3u8;
        let (display, _payload) = cast_tarot_with_payload(
            system,
            spread_size,
            question,
            hygiene_str,
            0.0, // kairos_degree unavailable at CLI level; portal uses SharedClockState
            0,
        )?;
        Ok(display)
    }
}

/// epi nara oracle history
pub fn show_history() -> Result<String, String> {
    let entries = load_history(&history_path())?;
    if entries.is_empty() {
        return Ok("No oracle history.".to_string());
    }
    let mut out = format!("Oracle History ({} casts)\n", entries.len());
    for e in entries.iter().rev().take(10) {
        out.push_str(&format!(
            "  #{} [{}] {} — {}\n",
            e.cast_id,
            e.system,
            &e.question.chars().take(40).collect::<String>(),
            e.hygiene
        ));
    }
    Ok(out)
}

/// epi nara oracle hygiene
pub fn show_hygiene(cast_id: Option<u32>) -> Result<String, String> {
    let entries = load_history(&history_path())?;
    let now = current_epoch();
    let today_start = now - (now % 86400);
    let casts_today = entries.iter().filter(|e| e.cast_at >= today_start).count();

    let mut out = format!("Oracle Hygiene\n  Casts today: {}/6\n", casts_today);

    if let Some(recent) = entries.last() {
        let minutes_ago = (now - recent.cast_at) / 60;
        out.push_str(&format!("  Last cast: {} minutes ago\n", minutes_ago));
    }

    if let Some(id) = cast_id {
        if let Some(entry) = entries.iter().find(|e| e.cast_id == id) {
            out.push_str(&format!("  Cast #{}: hygiene={}\n", id, entry.hygiene));
        }
    }

    Ok(out)
}

// ─── Utility ─────────────────────────────────────────────────────────────

pub(crate) fn current_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
