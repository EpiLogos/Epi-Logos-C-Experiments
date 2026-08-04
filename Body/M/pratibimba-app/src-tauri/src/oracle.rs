//! Coordinate: M' M4' (oracle deposition seam, plan T4.1/T4.2; rewired 25.T25.24)
//! Actualises: the DAY DEPOSITION of an oracle cast — composing the cast into
//!   a first-class day artifact in the Present scope (M4' oracle-artifact law)
//!   and writing it through the S1 vault seam. `compose_oracle_artifact` is
//!   the single composition authority; the e2e vault sidecar mirrors it.
//!
//!   25.T25.24 SPLIT THE TWO ACTS THIS FILE USED TO FUSE. Casting now
//!   dispatches to the gateway (`nara.oracle.cast_iching` or
//!   `nara.oracle.cast_tarot`) — the Track-24 law is that
//!   a cast is a gateway act, never a local spawn, and the Track-00
//!   hardening-T17 finding was that the carrier's `OraclePane` reached past
//!   the gateway straight into the CLI through this file. Deposition stays
//!   here, unchanged, because it is S1 law and always was.
//!
//!   `oracle_cast` therefore survives as the OFFLINE FALLBACK ONLY (spawn +
//!   deposit, the pre-rewire behaviour) and is NOT wired to any surface; its
//!   retirement is the Architect's call at review per the 25.24 brief. The
//!   surface path is: typed gateway cast → `oracle_deposit`.
//! Public surface: oracle_deposit (tauri command), oracle_cast (tauri command,
//!   offline fallback), compose_oracle_artifact.
//! Does NOT own: divination logic, hygiene law, the cast ledger (epi-cli),
//!   the cast dispatch (S3 typed oracle routes), session-NOW creation
//!   (Khora).

use std::process::Command;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;

use crate::supervisor::epi_binary;
use crate::vault::{self, VaultState};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleCastResult {
    pub artifact_path: String,
    pub output: String,
    pub system: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub envelope: Option<Value>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct OracleDepositMetadata {
    pub cast_id: u32,
    pub spread_id: String,
    pub envelope: Value,
    pub draw: Value,
}

/// Pure composition of the day artifact — tested without spawning anything.
pub fn compose_oracle_artifact(
    day_id: &str,
    system: &str,
    question: &str,
    output: &str,
    created_at: &str,
    stamp: &str,
    metadata: Option<&OracleDepositMetadata>,
) -> (String, String) {
    let rel = format!("Empty/Present/{day_id}/oracle-{stamp}-{system}.md");
    let question_escaped = question.replace('"', "\\\"");
    let metadata_frontmatter = metadata.map_or_else(String::new, |metadata| {
        let frame_ref = metadata
            .envelope
            .get("oracle_frame_ref")
            .cloned()
            .unwrap_or(Value::Null);
        let scalar_refs = metadata
            .envelope
            .get("scalar_refs")
            .cloned()
            .unwrap_or_else(|| Value::Array(Vec::new()));
        format!(
            "c_3_oracle_cast_id: {}\nc_3_oracle_spread_id: {}\nc_3_oracle_frame_ref: {}\nc_3_scalar_refs: {}\n",
            metadata.cast_id,
            serde_json::to_string(&metadata.spread_id).unwrap_or_else(|_| "null".to_owned()),
            serde_json::to_string(&frame_ref).unwrap_or_else(|_| "null".to_owned()),
            serde_json::to_string(&scalar_refs).unwrap_or_else(|_| "[]".to_owned()),
        )
    });
    let metadata_body = metadata.map_or_else(String::new, |metadata| {
        format!(
            "\n## Cast frame\n\n```json\n{}\n```\n",
            serde_json::to_string_pretty(&serde_json::json!({
                "castId": metadata.cast_id,
                "spreadId": metadata.spread_id,
                "draw": metadata.draw,
                "envelope": metadata.envelope,
            }))
            .unwrap_or_else(|_| "{}".to_owned())
        )
    });
    let content = format!(
        "---\ncoordinate: \"\"\nc_4_artifact_role: \"oracle-cast\"\nc_1_ct_type: \"CT3\"\nc_3_day_id: \"{day_id}\"\nc_3_created_at: \"{created_at}\"\nc_2_oracle_system: \"{system}\"\nc_2_oracle_question: \"{question_escaped}\"\nc_4_invocation_kind: \"app\"\n{metadata_frontmatter}c_0_source_coordinates: []\n---\n\n# Oracle — {system}\n\n> {question}\n\n```text\n{output}\n```\n{metadata_body}"
    );
    (rel, content)
}

/// Deposit an ALREADY-CAST oracle result as a day artifact (25.T25.24).
///
/// The `output` comes from a typed gateway oracle cast — this seam does
/// not cast, does not judge the text, and does not touch the S0 cast ledger
/// (the CLI already appended to it, under the gateway). It composes and
/// writes, which is the whole of its S1 authority.
#[tauri::command]
pub fn oracle_deposit(
    state: State<'_, VaultState>,
    system: String,
    question: String,
    day_id: String,
    output: String,
    metadata: Option<OracleDepositMetadata>,
) -> Result<OracleCastResult, String> {
    if output.trim().is_empty() {
        return Err("oracle_deposit: refusing to deposit an empty cast".to_owned());
    }
    let now = chrono::Local::now();
    let (rel, content) = compose_oracle_artifact(
        &day_id,
        &system,
        &question,
        output.trim(),
        &now.to_utc().to_rfc3339(),
        &now.format("%H%M%S").to_string(),
        metadata.as_ref(),
    );
    vault::vault_write(state, rel.clone(), content)?;
    Ok(OracleCastResult {
        artifact_path: rel,
        output,
        system,
        envelope: metadata.map(|metadata| metadata.envelope),
    })
}

/// OFFLINE FALLBACK ONLY — spawn the CLI and deposit, the pre-25.24 path.
///
/// No surface calls this. The live cast dispatches to the gateway
/// and deposits through [`oracle_deposit`]; this remains
/// so a host with no gateway still has a real cast, and its retirement is the
/// Architect's call at review per the 25.24 brief.
#[tauri::command]
pub fn oracle_cast(
    state: State<'_, VaultState>,
    system: String,
    question: String,
    day_id: String,
) -> Result<OracleCastResult, String> {
    let binary = epi_binary()?;
    let cast = Command::new(&binary.path)
        .args([
            "nara",
            "oracle",
            "cast",
            "--system",
            &system,
            "--question",
            &question,
            "--yes",
        ])
        .output()
        .map_err(|err| {
            format!(
                "failed to run `{} nara oracle cast`: {err}",
                binary.path.display()
            )
        })?;
    let stdout = String::from_utf8_lossy(&cast.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&cast.stderr).trim().to_string();
    if !cast.status.success() {
        return Err(if stderr.is_empty() { stdout } else { stderr });
    }
    let output = if stdout.is_empty() { stderr } else { stdout };
    oracle_deposit(state, system, question, day_id, output, None)
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
            None,
        );
        assert_eq!(rel, "Empty/Present/02-07-2026/oracle-120000-tarot.md");
        assert!(crate::vault::in_write_scope(&rel));
        assert!(content.contains("c_4_artifact_role: \"oracle-cast\""));
        assert!(content.contains("c_2_oracle_system: \"tarot\""));
        assert!(content.contains("c_2_oracle_question: \"what wants to emerge \\\"now\\\"?\""));
        assert!(content.contains("The Star — reversed"));
    }

    #[test]
    fn typed_cast_metadata_survives_the_day_artifact_boundary() {
        let metadata = OracleDepositMetadata {
            cast_id: 7,
            spread_id: "oracle-spread-7".to_owned(),
            envelope: serde_json::json!({
                "oracle_frame_ref": "oracle-frame://cast/7",
                "scalar_refs": [{"ref_kind": "m3-codon", "scalar_ref": "m3-codon://ATG"}]
            }),
            draw: serde_json::json!({"spreadSize": 3, "cards": []}),
        };
        let (_, content) = compose_oracle_artifact(
            "02-07-2026",
            "thoth",
            "what now?",
            "Tarot Draw #7",
            "2026-07-02T12:00:00+00:00",
            "120000",
            Some(&metadata),
        );
        assert!(content.contains("c_3_oracle_cast_id: 7"));
        assert!(content.contains("c_3_oracle_spread_id: \"oracle-spread-7\""));
        assert!(content.contains("oracle-frame://cast/7"));
        assert!(content.contains("m3-codon://ATG"));
    }
}
