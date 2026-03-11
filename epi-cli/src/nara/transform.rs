use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

// ─── Containers ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ContainerKind {
    Bohm,
    TalkingCircle,
    Diamond,
}

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

// ─── Cycle Records ───────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct CycleRecord {
    pub cycle_id: u32,
    pub operation: String,
    pub stroke: String, // "outer" or "inner"
    pub note: String,
    pub opened_at: u64,
    pub closed_at: Option<u64>,
    pub decan: u8,
}

fn cycles_path() -> PathBuf {
    super::identity::nara_home()
        .join("transform")
        .join("cycles.jsonl")
}

fn load_cycles() -> Result<Vec<CycleRecord>, String> {
    let path = cycles_path();
    if !path.exists() {
        return Ok(vec![]);
    }
    let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut cycles = Vec::new();
    for line in data.lines() {
        if line.trim().is_empty() {
            continue;
        }
        if let Ok(c) = serde_json::from_str::<CycleRecord>(line) {
            cycles.push(c);
        }
    }
    Ok(cycles)
}

fn append_cycle(record: &CycleRecord) -> Result<(), String> {
    let path = cycles_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    let json = serde_json::to_string(record).map_err(|e| e.to_string())?;
    writeln!(file, "{json}").map_err(|e| e.to_string())
}

fn next_cycle_id() -> u32 {
    load_cycles()
        .unwrap_or_default()
        .last()
        .map(|c| c.cycle_id + 1)
        .unwrap_or(1)
}

fn current_epoch() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

// ─── CLI Commands ────────────────────────────────────────────────────────

/// epi nara transform status
pub fn status(json: bool) -> Result<String, String> {
    let cycles = load_cycles()?;
    let open_cycles: Vec<_> = cycles.iter().filter(|c| c.closed_at.is_none()).collect();

    if json {
        Ok(serde_json::json!({
            "total_cycles": cycles.len(),
            "open_cycles": open_cycles.len(),
            "last_cycle_id": cycles.last().map(|c| c.cycle_id),
        })
        .to_string())
    } else {
        let mut out = format!(
            "Transform Status\n  Total cycles: {}\n  Open: {}\n",
            cycles.len(),
            open_cycles.len()
        );
        for c in &open_cycles {
            out.push_str(&format!(
                "  Open #{}: {} ({})\n",
                c.cycle_id, c.operation, c.stroke
            ));
        }
        Ok(out)
    }
}

/// epi nara transform write [--note "..."]
pub fn write_cycle(note: Option<&str>) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let id = next_cycle_id();

    let record = CycleRecord {
        cycle_id: id,
        operation: String::new(),
        stroke: "outer".to_string(),
        note: note.unwrap_or("").to_string(),
        opened_at: current_epoch(),
        closed_at: None,
        decan: kairos.active_decan,
    };
    append_cycle(&record)?;

    Ok(format!("Opened transform cycle #{} (outer stroke)", id))
}

/// epi nara transform reflect --cycle-id <id>
pub fn reflect(cycle_id: u32, note: Option<&str>) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;

    let record = CycleRecord {
        cycle_id,
        operation: String::new(),
        stroke: "inner".to_string(),
        note: note.unwrap_or("").to_string(),
        opened_at: current_epoch(),
        closed_at: Some(current_epoch()),
        decan: kairos.active_decan,
    };
    append_cycle(&record)?;

    Ok(format!(
        "Reflected on cycle #{} (inner stroke, closed)",
        cycle_id
    ))
}

/// epi nara transform recipe
pub fn recipe(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let decan = kairos.active_decan;
    let ops = [
        "calcination",
        "dissolution",
        "separation",
        "conjunction",
        "fermentation",
        "distillation",
        "coagulation",
    ];
    let active_op = ops[(decan as usize) % 7];

    if json {
        Ok(serde_json::json!({
            "decan": decan,
            "active_operation": active_op,
            "element": kairos.dominant_element,
        })
        .to_string())
    } else {
        Ok(format!(
            "Decan Recipe — #{}\n  Operation: {}\n  Element: {}",
            decan, active_op, kairos.dominant_element
        ))
    }
}

/// epi nara transform commit --operation <op>
pub fn commit(operation: &str, note: Option<&str>) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let id = next_cycle_id();

    let record = CycleRecord {
        cycle_id: id,
        operation: operation.to_string(),
        stroke: "commit".to_string(),
        note: note.unwrap_or("").to_string(),
        opened_at: current_epoch(),
        closed_at: Some(current_epoch()),
        decan: kairos.active_decan,
    };
    append_cycle(&record)?;

    Ok(format!(
        "Committed operation '{}' as cycle #{}",
        operation, id
    ))
}

/// epi nara transform history
pub fn history(open_only: bool, json: bool) -> Result<String, String> {
    let cycles = load_cycles()?;
    let filtered: Vec<&CycleRecord> = if open_only {
        cycles.iter().filter(|c| c.closed_at.is_none()).collect()
    } else {
        cycles.iter().collect()
    };

    if json {
        serde_json::to_string_pretty(&filtered).map_err(|e| e.to_string())
    } else {
        let mut out = format!("Transform History ({} cycles)\n", filtered.len());
        for c in filtered.iter().rev().take(20) {
            let status = if c.closed_at.is_some() {
                "closed"
            } else {
                "open"
            };
            out.push_str(&format!(
                "  #{} [{}] {} — {} (decan {})\n",
                c.cycle_id, status, c.stroke, c.operation, c.decan
            ));
        }
        Ok(out)
    }
}
