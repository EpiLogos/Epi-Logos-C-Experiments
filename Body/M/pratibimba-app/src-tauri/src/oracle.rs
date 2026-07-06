//! Coordinate: M' M4' (oracle cast seam, plan T4.1/T4.2)
//! Actualises: the typed oracle invocation — runs the real consent-gated
//!   `epi nara oracle cast` (never slash-strings) and deposits the cast as a
//!   first-class day artifact in the Present scope (M4' oracle-artifact law).
//!   The epi CLI owns casting (entropy, hygiene limits, ledger); this seam
//!   owns invocation + day deposition only.
//! Public surface: oracle_cast (tauri command), compose_oracle_artifact.
//! Does NOT own: divination logic, hygiene law, the cast ledger (epi-cli),
//!   session-NOW creation (Khora).

use std::process::Command;

use serde::Serialize;
use tauri::State;

use crate::supervisor::epi_binary;
use crate::vault::{self, VaultState};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleCastResult {
    pub artifact_path: String,
    pub output: String,
    pub system: String,
}

/// Pure composition of the day artifact — tested without spawning anything.
pub fn compose_oracle_artifact(
    day_id: &str,
    system: &str,
    question: &str,
    output: &str,
    created_at: &str,
    stamp: &str,
) -> (String, String) {
    let rel = format!("Empty/Present/{day_id}/oracle-{stamp}-{system}.md");
    let question_escaped = question.replace('"', "\\\"");
    let content = format!(
        "---\ncoordinate: \"\"\nc_4_artifact_role: \"oracle-cast\"\nc_1_ct_type: \"CT3\"\nc_3_day_id: \"{day_id}\"\nc_3_created_at: \"{created_at}\"\nc_2_oracle_system: \"{system}\"\nc_2_oracle_question: \"{question_escaped}\"\nc_4_invocation_kind: \"app\"\nc_0_source_coordinates: []\n---\n\n# Oracle — {system}\n\n> {question}\n\n```text\n{output}\n```\n"
    );
    (rel, content)
}

#[tauri::command]
pub fn oracle_cast(
    state: State<'_, VaultState>,
    system: String,
    question: String,
    day_id: String,
) -> Result<OracleCastResult, String> {
    let bin = epi_binary();
    let cast = Command::new(&bin)
        .args(["nara", "oracle", "cast", "--system", &system, "--question", &question, "--yes"])
        .output()
        .map_err(|err| format!("failed to run `{bin} nara oracle cast`: {err}"))?;
    let stdout = String::from_utf8_lossy(&cast.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&cast.stderr).trim().to_string();
    if !cast.status.success() {
        return Err(if stderr.is_empty() { stdout } else { stderr });
    }
    let output = if stdout.is_empty() { stderr } else { stdout };

    let now = chrono::Local::now();
    let (rel, content) = compose_oracle_artifact(
        &day_id,
        &system,
        &question,
        &output,
        &now.to_utc().to_rfc3339(),
        &now.format("%H%M%S").to_string(),
    );
    vault::vault_write(state, rel.clone(), content)?;
    Ok(OracleCastResult {
        artifact_path: rel,
        output,
        system,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn oracle_artifact_lands_in_the_day_scope_with_typed_frontmatter() {
        let (rel, content) = compose_oracle_artifact(
            "02-07-2026",
            "tarot",
            "what wants to emerge \"now\"?",
            "The Star — reversed",
            "2026-07-02T12:00:00+00:00",
            "120000",
        );
        assert_eq!(rel, "Empty/Present/02-07-2026/oracle-120000-tarot.md");
        assert!(crate::vault::in_write_scope(&rel));
        assert!(content.contains("c_4_artifact_role: \"oracle-cast\""));
        assert!(content.contains("c_2_oracle_system: \"tarot\""));
        assert!(content.contains("c_2_oracle_question: \"what wants to emerge \\\"now\\\"?\""));
        assert!(content.contains("The Star — reversed"));
    }
}
