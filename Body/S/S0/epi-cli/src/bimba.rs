//! 40.T40.1 — `epi bimba` canon-update ledger CLI (ONE-substrate parity surface).
//!
//! Per DR-S5-ONE-1 the Track 40 canon-update ledger lands as BOTH gateway
//! routes (`s5'.canon_update.*`) AND CLI commands. Each subcommand has exact
//! parity with one gateway route and drives the SAME
//! [`epi_s3_gateway::canon_update::CanonUpdateRuntime`] handlers, so a row
//! proposed via CLI follows the identical lifecycle as one proposed via
//! gateway. The runtime is persisted as a JSON ledger store between
//! invocations (mirroring the `epi nara arena` admin CLI, Tranche 41.6).
//!
//! **Canon-write boundary.** `epi bimba land` transitions the LEDGER row to
//! `landed` and authors the `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->`
//! marker + the `canon_updates_landed` frontmatter entry. The ledger is the
//! only legal source of canon-update markers (§Cross-reference discipline);
//! the actual write of that marker into the target canon file is Hen's
//! authority at promotion time — this CLI never writes into `Idea/`.

use clap::Subcommand;
use epi_s3_gateway::canon_update::CanonUpdateRuntime;
use epi_s3_gateway_contract::{CanonUpdateCategory, CanonUpdateFilter, CanonUpdateState};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Subcommand)]
pub enum BimbaCmd {
    /// epi bimba propose <category> <claim> — draft a canon-update row at status: surfaced
    Propose {
        /// One of IDENTITY / FORM / ENTITY / REL / VOCAB / XREF / FORM-EXEC-TRACE
        category: String,
        /// The declarative claim statement of the proposed canon update
        claim: String,
        /// Optional target landing hint (`path::anchor`, or a bare path)
        #[arg(long = "target")]
        target: Option<String>,
    },
    /// epi bimba list [--status ...] [--category ...] — list canon-update rows
    List {
        #[arg(long)]
        status: Option<String>,
        #[arg(long = "category")]
        category: Option<String>,
    },
    /// epi bimba show <CU-id> — show the lifecycle status of one row
    Show { id: String },
    /// epi bimba land <CU-id> — transition a row to status: landed; author the marker
    Land { id: String },
    /// epi bimba refuse <CU-id> <reason> — close a row as status: refused
    Refuse { id: String, reason: String },
}

pub fn dispatch(cmd: &BimbaCmd, json: bool) -> Result<String, String> {
    let path = ledger_path()?;
    dispatch_at(cmd, json, &path)
}

/// Path-injected dispatch core — the tests drive this directly with a temp
/// ledger so persistence is exercised deterministically (no env-var raciness).
fn dispatch_at(cmd: &BimbaCmd, json: bool, path: &Path) -> Result<String, String> {
    let now_ms = now_ms();
    let mut runtime = load_runtime(path)?;

    match cmd {
        BimbaCmd::Propose {
            category,
            claim,
            target,
        } => {
            let category = CanonUpdateCategory::from_str(category)?;
            let receipt = runtime
                .propose(category, claim.clone(), target.clone(), now_ms)
                .map_err(|err| err.to_string())?;
            save_runtime(&runtime, path)?;
            render(json, &receipt, || {
                format!(
                    "Proposed {} ({}) — status {}, ratifies via {}{}",
                    receipt.id,
                    receipt.category.code(),
                    receipt.status.as_str(),
                    receipt.ratification_path,
                    if receipt.escalates_to_dr {
                        " [escalates to DR]"
                    } else {
                        ""
                    }
                )
            })
        }
        BimbaCmd::List { status, category } => {
            let filter = CanonUpdateFilter {
                status: status
                    .as_deref()
                    .map(CanonUpdateState::from_str)
                    .transpose()?,
                category: category
                    .as_deref()
                    .map(CanonUpdateCategory::from_str)
                    .transpose()?,
            };
            let rows = runtime.list(&filter);
            if json {
                serde_json::to_string_pretty(&rows).map_err(|err| err.to_string())
            } else if rows.is_empty() {
                Ok("No canon-update rows.".to_owned())
            } else {
                Ok(rows
                    .iter()
                    .map(|row| {
                        format!(
                            "{}\t{}\t{}\t{}",
                            row.id,
                            row.status.as_str(),
                            row.category.code(),
                            row.claim
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        BimbaCmd::Show { id } => {
            let status = runtime.status(id).map_err(|err| err.to_string())?;
            render(json, &status, || {
                let marker = status
                    .landed_marker
                    .as_ref()
                    .map(|m| format!(" — landed at {} ({})", m.file, m.anchor))
                    .unwrap_or_default();
                let refusal = status
                    .refusal_reason
                    .as_ref()
                    .map(|r| format!(" — refused: {r}"))
                    .unwrap_or_default();
                format!(
                    "{} [{}] status {}{}{}\n  {}",
                    status.id,
                    status.category.code(),
                    status.status.as_str(),
                    marker,
                    refusal,
                    status.claim
                )
            })
        }
        BimbaCmd::Land { id } => {
            let confirmation = runtime.land(id, now_ms).map_err(|err| err.to_string())?;
            save_runtime(&runtime, path)?;
            render(json, &confirmation, || {
                format!(
                    "Landed {} — marker `<!-- canon-update: {} (landed {}) -->` for {} ({}); frontmatter canon_updates_landed += {}\n  (the ledger authored the marker; Hen writes it into the target canon file at promotion)",
                    confirmation.id,
                    confirmation.id,
                    confirmation.marker.date,
                    confirmation.marker.file,
                    confirmation.marker.anchor,
                    confirmation.frontmatter_index_entry,
                )
            })
        }
        BimbaCmd::Refuse { id, reason } => {
            let refusal = runtime
                .refuse(id, reason.clone(), now_ms)
                .map_err(|err| err.to_string())?;
            save_runtime(&runtime, path)?;
            render(json, &refusal, || {
                format!("Refused {} — {}", refusal.id, refusal.reason)
            })
        }
    }
}

fn render<T: Serialize>(
    json: bool,
    value: &T,
    human: impl FnOnce() -> String,
) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(value).map_err(|err| err.to_string())
    } else {
        Ok(human())
    }
}

fn load_runtime(path: &Path) -> Result<CanonUpdateRuntime, String> {
    if !path.exists() {
        return Ok(CanonUpdateRuntime::default());
    }
    let bytes = fs::read(path).map_err(|err| format!("read {}: {err}", path.display()))?;
    serde_json::from_slice(&bytes).map_err(|err| format!("parse {}: {err}", path.display()))
}

fn save_runtime(runtime: &CanonUpdateRuntime, path: &Path) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("create {}: {err}", parent.display()))?;
    }
    let bytes = serde_json::to_vec_pretty(runtime).map_err(|err| err.to_string())?;
    fs::write(path, bytes).map_err(|err| format!("write {}: {err}", path.display()))
}

fn ledger_path() -> Result<PathBuf, String> {
    if let Ok(path) = std::env::var("EPI_BIMBA_LEDGER_PATH") {
        return Ok(PathBuf::from(path));
    }
    let home =
        dirs::home_dir().ok_or_else(|| "HOME is required for the canon-update ledger".to_owned())?;
    Ok(home
        .join(".epi-logos")
        .join("bimba")
        .join("canon-update-ledger.json"))
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    fn temp_ledger() -> PathBuf {
        let mut path = std::env::temp_dir();
        let unique = format!(
            "bimba-ledger-{}-{}.json",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        );
        path.push(unique);
        path
    }

    #[test]
    fn cli_round_trip_persists_across_invocations() {
        let path = temp_ledger();
        let _ = fs::remove_file(&path);

        // propose (persists a surfaced row)
        let out = dispatch_at(
            &BimbaCmd::Propose {
                category: "identity".to_owned(),
                claim: "36 - 27 = 9 = epogdoon, transcriptionally derived".to_owned(),
                target: Some("Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md::§ trace".to_owned()),
            },
            true,
            &path,
        )
        .expect("propose");
        let receipt: Value = serde_json::from_str(&out).unwrap();
        assert_eq!(receipt["id"], "CU-IDENTITY-1");
        assert_eq!(receipt["status"], "surfaced");

        // a SECOND process-invocation (fresh runtime load from disk) sees the row
        let out = dispatch_at(&BimbaCmd::Show { id: "CU-IDENTITY-1".to_owned() }, true, &path)
            .expect("show");
        let shown: Value = serde_json::from_str(&out).unwrap();
        assert_eq!(shown["status"], "surfaced");
        assert_eq!(shown["category"], "identity");

        // land it — the ledger transitions to landed and authors the marker
        let out = dispatch_at(&BimbaCmd::Land { id: "CU-IDENTITY-1".to_owned() }, true, &path)
            .expect("land");
        let landed: Value = serde_json::from_str(&out).unwrap();
        assert_eq!(landed["status"], "landed");
        assert_eq!(
            landed["marker"]["file"],
            "Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md"
        );
        assert_eq!(landed["marker"]["anchor"], "§ trace");
        assert!(landed["frontmatterIndexEntry"]
            .as_str()
            .unwrap()
            .starts_with("CU-IDENTITY-1@"));

        // a fresh load reflects the landed status (persistence proven)
        let out = dispatch_at(&BimbaCmd::Show { id: "CU-IDENTITY-1".to_owned() }, true, &path)
            .expect("show after land");
        let shown: Value = serde_json::from_str(&out).unwrap();
        assert_eq!(shown["status"], "landed");
        assert!(shown["landedMarker"].is_object());

        // propose + refuse a second row, then list by status
        dispatch_at(
            &BimbaCmd::Propose {
                category: "FORM".to_owned(),
                claim: "137 = 64 + 73 sixth canonical form".to_owned(),
                target: None,
            },
            true,
            &path,
        )
        .expect("propose form");
        let out = dispatch_at(
            &BimbaCmd::Refuse {
                id: "CU-FORM-1".to_owned(),
                reason: "parked pending review".to_owned(),
            },
            true,
            &path,
        )
        .expect("refuse");
        let refusal: Value = serde_json::from_str(&out).unwrap();
        assert_eq!(refusal["status"], "refused");

        // list --status landed returns exactly the landed identity row
        let out = dispatch_at(
            &BimbaCmd::List {
                status: Some("landed".to_owned()),
                category: None,
            },
            true,
            &path,
        )
        .expect("list");
        let rows: Value = serde_json::from_str(&out).unwrap();
        assert_eq!(rows.as_array().unwrap().len(), 1);
        assert_eq!(rows[0]["id"], "CU-IDENTITY-1");

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn propose_refuses_unknown_category() {
        let path = temp_ledger();
        let err = dispatch_at(
            &BimbaCmd::Propose {
                category: "NONSENSE".to_owned(),
                claim: "x".to_owned(),
                target: None,
            },
            true,
            &path,
        )
        .expect_err("unknown category must refuse");
        assert!(err.contains("unknown canon-update category"));
    }
}
