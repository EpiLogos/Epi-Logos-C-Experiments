//! CCT-14 CLI parity — `epi entity capture|classify|promote_to_type|list`.
//!
//! Per DR-S5-ONE-1 (S5' as ONE substrate layer) the entity-candidate
//! lifecycle lands as BOTH gateway routes AND CLI commands. The CLI calls
//! the SAME `gate::s1_hen` handlers the gateway dispatch uses, so an orphan
//! entity captured via CLI follows the same lifecycle as one captured via
//! gateway, with identical Hen behaviour and identical `:World` graph node
//! creation (DR-WORLD-1).

use clap::Subcommand;
use serde_json::{json, Value};

use crate::gate::s1_hen;

#[derive(Subcommand)]
pub enum EntityCmd {
    /// Capture a dangling wikilink target or loose root note into
    /// Idea/Empty/Present/{day}/entities/ as an entity candidate
    Capture {
        /// Vault-relative note path, or a bare wikilink target name
        source: String,
        /// Day (DD-MM-YYYY); defaults to the active session's day
        #[arg(long)]
        day: Option<String>,
        /// Creator identity seed component for the birth-codon
        #[arg(long)]
        creator: Option<String>,
    },
    /// Assign a provisional C-layer to a captured candidate (recomputes the
    /// provisional birth-codon per CCT-14b)
    Classify {
        /// Vault-relative candidate path
        candidate_id: String,
        /// C-layer C0..C5 (defaults to C2)
        #[arg(long = "c-layer")]
        c_layer: Option<String>,
    },
    /// Promote a reviewed candidate into World/Types/Coordinates/** (the
    /// birth-codon ratifies)
    #[command(name = "promote_to_type")]
    PromoteToType {
        /// Vault-relative candidate path
        candidate_id: String,
    },
    /// Surface the candidate pool for review
    List {
        /// Filter: candidate | promoted | graduated
        #[arg(long)]
        state: Option<String>,
        /// Restrict to one day's candidate pool (DD-MM-YYYY)
        #[arg(long)]
        day: Option<String>,
    },
}

pub fn dispatch(cmd: &EntityCmd, json_output: bool) -> Result<String, String> {
    let value = match cmd {
        EntityCmd::Capture {
            source,
            day,
            creator,
        } => {
            let day_id = resolve_day(day.as_deref())?;
            let mut params = json!({ "source": source, "dayId": day_id });
            if let Some(creator) = creator {
                params["creatorIdentity"] = json!(creator);
            }
            s1_hen::entity_capture(&params)?
        }
        EntityCmd::Classify {
            candidate_id,
            c_layer,
        } => {
            let mut params = json!({ "candidatePath": candidate_id });
            if let Some(layer) = c_layer {
                params["cLayer"] = json!(layer);
            }
            s1_hen::entity_classify(&params)?
        }
        EntityCmd::PromoteToType { candidate_id } => {
            s1_hen::entity_promote_to_type(&json!({ "candidatePath": candidate_id }))?
        }
        EntityCmd::List { state, day } => {
            let mut params = json!({});
            if let Some(state) = state {
                params["state"] = json!(state);
            }
            if let Some(day) = day {
                params["dayId"] = json!(day);
            }
            s1_hen::entity_list(&params)?
        }
    };
    render(value, json_output)
}

/// Resolve the working day: explicit flag, else the active session's
/// `.epi/session.json` day_id.
pub(crate) fn resolve_day(explicit: Option<&str>) -> Result<String, String> {
    if let Some(day) = explicit {
        return Ok(day.to_owned());
    }
    let session_path = std::env::current_dir()
        .map_err(|err| err.to_string())?
        .join(".epi/session.json");
    let raw = std::fs::read_to_string(&session_path).map_err(|_| {
        "no --day given and no active session at .epi/session.json (run `epi agent session init`)"
            .to_owned()
    })?;
    let value: Value = serde_json::from_str(&raw).map_err(|err| err.to_string())?;
    value
        .pointer("/context/day_id")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .ok_or_else(|| "active session carries no day_id; pass --day DD-MM-YYYY".to_owned())
}

pub(crate) fn render(value: Value, json_output: bool) -> Result<String, String> {
    if json_output {
        return serde_json::to_string_pretty(&value).map_err(|err| err.to_string());
    }
    if let Some(entries) = value.get("entries").and_then(Value::as_array) {
        if entries.is_empty() {
            return Ok("no entities found".to_owned());
        }
        let mut out = String::new();
        for entry in entries {
            let codon = entry
                .get("birthCodon")
                .and_then(Value::as_u64)
                .map(|c| format!(" codon={c}"))
                .unwrap_or_default();
            out.push_str(&format!(
                "{:<10} {:<4} {}{}\n",
                entry.get("state").and_then(Value::as_str).unwrap_or("?"),
                entry
                    .get("typeCoordinate")
                    .and_then(Value::as_str)
                    .unwrap_or("-"),
                entry.get("path").and_then(Value::as_str).unwrap_or("?"),
                codon,
            ));
        }
        return Ok(out.trim_end().to_owned());
    }
    serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
}
