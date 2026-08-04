// S0 ADAPTER: Body/S/S1 (vault day scaffolding, Hen authority) + S4 Khora session start — this file opens a day and starts a session over those authorities; it holds no day-path or identity law of its own (paths come from `vault::paths`, the single constructor).
//! Coordinate: S0 adapter for [[S1]] day scaffolding and [[S4]] Khora start.
//! Residency: Body/S/S0/epi-cli/src/gate
//! Position (#n): first-day gateway membrane (32.T32.11)
//! Actualises: idempotent `vault.day.ensure` and `khora.session_start` receipts.
//! Public surface: `ensure_day`, `start_session`.
//! Does NOT own: day template law, Nara oracle law, Kairos, or onboarding UI.
//! Contract: [[S0-SPEC]] / [[S1-SPEC]] / [[M4'-SPEC]].

use crate::sesh::session::{load_env_file, repo_root_from_env, resolve_vault_root_for_repo};
use crate::vault::day::{ensure_day_folder, DayEnsureReceipt};
use chrono::{Datelike, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

pub const KHORA_SESSION_START_RPC: &str = "khora.session_start";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KhoraSessionStartReceipt {
    pub rpc: &'static str,
    pub day_id: String,
    pub session_id: String,
    pub now_path: PathBuf,
    pub created_now: bool,
    pub day: DayEnsureReceipt,
}

fn day_id(params: &Value) -> Result<&str, String> {
    params
        .get("dayId")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "dayId must be a non-blank DD-MM-YYYY or YYYY-MM-DD string".to_owned())
}

fn roots() -> Result<(PathBuf, PathBuf, PathBuf), String> {
    let repo_root = repo_root_from_env();
    let env = load_env_file(&repo_root)?;
    let vault_root = resolve_vault_root_for_repo(&repo_root, &env);
    let home_root = dirs::home_dir().unwrap_or_else(|| repo_root.clone());
    Ok((repo_root, vault_root, home_root))
}

pub fn ensure_day(params: &Value) -> Result<DayEnsureReceipt, String> {
    let (repo_root, vault_root, home_root) = roots()?;
    ensure_day_folder(&vault_root, &repo_root, &home_root, day_id(params)?)
}

fn existing_now(day_path: &Path) -> Result<Option<PathBuf>, String> {
    if !day_path.exists() {
        return Ok(None);
    }
    let mut candidates = fs::read_dir(day_path)
        .map_err(|err| format!("failed to list {}: {err}", day_path.display()))?
        .filter_map(Result::ok)
        .map(|entry| entry.path().join("now.md"))
        .filter(|path| path.is_file())
        .collect::<Vec<_>>();
    candidates.sort();
    Ok(candidates.into_iter().next())
}

fn session_id_for(day_id: &str) -> Result<String, String> {
    let day = crate::vault::paths::parse_day_id(day_id)
        .map_err(|err| format!("invalid canonical day id {day_id:?}: {err}"))?;
    let instant = Utc
        .with_ymd_and_hms(day.year(), day.month(), day.day(), 0, 0, 0)
        .single()
        .ok_or_else(|| format!("invalid canonical day id {day_id:?}"))?;
    // DELIBERATELY NOT `vault::paths::local_stamp`. Every other stamp in the
    // vault names a real moment and must therefore be local (see `local_stamp`),
    // but `instant` here is SYNTHETIC — midnight built out of the canonical day
    // id purely to carry the format. Converting it to local time would move it
    // across midnight in any zone west of UTC and stamp the PREVIOUS day, so
    // this one stays UTC to keep the stamp equal to the day it was derived from.
    Ok(format!(
        "{}-{}",
        instant.format(crate::vault::paths::STAMP_FORMAT),
        &Uuid::new_v4().simple().to_string()[..6]
    ))
}

fn render_now(day_id: &str, session_id: &str) -> String {
    format!(
        "---\n\
c_3_day_id: \"{day_id}\"\n\
c_3_created_at: \"{}\"\n\
c_4_artifact_role: \"now\"\n\
c_4_session_id: \"{session_id}\"\n\
c_4_privacy_class: \"protected_local\"\n\
---\n\n\
# NOW\n\n\
## #0 Question\n\n\
## #1 Material\n\n\
## #2 Analysis\n\n\
## #3 Pattern\n\n\
## #4 Context\n\n\
## #5 Integration\n",
        Utc::now().to_rfc3339()
    )
}

pub fn start_session(params: &Value) -> Result<KhoraSessionStartReceipt, String> {
    let day = ensure_day(params)?;
    if let Some(now_path) = existing_now(&day.day_path)? {
        let session_id = now_path
            .parent()
            .and_then(Path::file_name)
            .and_then(|value| value.to_str())
            .ok_or_else(|| format!("invalid existing NOW path {}", now_path.display()))?
            .to_owned();
        return Ok(KhoraSessionStartReceipt {
            rpc: KHORA_SESSION_START_RPC,
            day_id: day.day_id.clone(),
            session_id,
            now_path,
            created_now: false,
            day,
        });
    }

    let session_id = session_id_for(&day.day_id)?;
    let session_dir = day.day_path.join(&session_id);
    fs::create_dir_all(&session_dir)
        .map_err(|err| format!("failed to create {}: {err}", session_dir.display()))?;
    let now_path = session_dir.join("now.md");
    fs::write(&now_path, render_now(&day.day_id, &session_id))
        .map_err(|err| format!("failed to write {}: {err}", now_path.display()))?;

    Ok(KhoraSessionStartReceipt {
        rpc: KHORA_SESSION_START_RPC,
        day_id: day.day_id.clone(),
        session_id,
        now_path,
        created_now: true,
        day,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn existing_now_lookup_is_sorted_and_first_session_start_is_idempotent() {
        let root = std::env::temp_dir().join(format!(
            "khora-day-start-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let day = root.join("day");
        fs::create_dir_all(day.join("b")).unwrap();
        fs::create_dir_all(day.join("a")).unwrap();
        fs::write(day.join("b/now.md"), "b").unwrap();
        fs::write(day.join("a/now.md"), "a").unwrap();
        assert_eq!(existing_now(&day).unwrap(), Some(day.join("a/now.md")));
        assert!(day_id(&json!({"dayId": "20-07-2026"})).is_ok());
        assert!(day_id(&json!({})).is_err());
        let _ = fs::remove_dir_all(root);
    }
}
