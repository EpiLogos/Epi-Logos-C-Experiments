//! 40.T40.1 — `epi bimba` canon-update ledger CLI parity (integration).
//!
//! Drives the PUBLIC `bimba::dispatch` entry point (the same path `epi bimba`
//! invokes) end-to-end against a temp ledger, proving the CLI wraps the
//! gateway `s5'.canon_update.*` runtime with real persistence, and that the
//! parity ledger + contract inventory agree on the five-method family.

use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use epi_logos::bimba::{self, BimbaCmd};
use epi_logos::gate::parity::coordinate_family_for_gateway_method;
use epi_s3_gateway_contract::{s5_canon_update_methods, S5_CANON_UPDATE_METHODS};
use serde_json::Value;

fn temp_ledger() -> PathBuf {
    let mut path = std::env::temp_dir();
    path.push(format!(
        "epi-bimba-it-{}-{}.json",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    path
}

#[test]
fn epi_bimba_cli_drives_the_canon_update_runtime_end_to_end() {
    let ledger = temp_ledger();
    let _ = std::fs::remove_file(&ledger);
    // The public dispatch() resolves the ledger from EPI_BIMBA_LEDGER_PATH.
    std::env::set_var("EPI_BIMBA_LEDGER_PATH", &ledger);

    // propose via the real public entry point
    let out = bimba::dispatch(
        &BimbaCmd::Propose {
            category: "XREF".to_owned(),
            claim: "73 = 36 + 37 = 72 + 1 productive-asymmetry cross-reference".to_owned(),
            target: Some(
                "Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md::§2 table".to_owned(),
            ),
        },
        true,
    )
    .expect("epi bimba propose");
    let receipt: Value = serde_json::from_str(&out).unwrap();
    assert_eq!(receipt["id"], "CU-XREF-1");
    assert_eq!(receipt["status"], "surfaced");

    // land it — a separate dispatch call re-loads the persisted ledger
    let out = bimba::dispatch(
        &BimbaCmd::Land {
            id: "CU-XREF-1".to_owned(),
        },
        true,
    )
    .expect("epi bimba land");
    let landed: Value = serde_json::from_str(&out).unwrap();
    assert_eq!(landed["status"], "landed");
    assert_eq!(
        landed["marker"]["file"],
        "Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md"
    );
    assert_eq!(landed["marker"]["anchor"], "§2 table");

    // list reflects the landed row after re-loading from disk
    let out = bimba::dispatch(
        &BimbaCmd::List {
            status: Some("landed".to_owned()),
            category: None,
        },
        true,
    )
    .expect("epi bimba list");
    let rows: Value = serde_json::from_str(&out).unwrap();
    assert_eq!(rows.as_array().unwrap().len(), 1);
    assert_eq!(rows[0]["id"], "CU-XREF-1");

    std::env::remove_var("EPI_BIMBA_LEDGER_PATH");
    let _ = std::fs::remove_file(&ledger);
}

#[test]
fn canon_update_family_is_parity_visible_and_inventoried() {
    // Contract inventory: the five-method family is registered in the gateway
    // contract, and each maps to the `s5'.canon_update.*` parity family.
    assert_eq!(s5_canon_update_methods().len(), 5);
    for method in S5_CANON_UPDATE_METHODS {
        assert_eq!(
            coordinate_family_for_gateway_method(method),
            Some("s5'.canon_update.*"),
            "{method} must map to the canon-update parity family"
        );
    }
    // A canon-update parity record exists and is Native (S5' authority).
    let record = epi_logos::gate::parity::coordinate_parity_records()
        .iter()
        .find(|record| record.canonical_method == "s5'.canon_update.*")
        .expect("canon-update parity record");
    assert_eq!(record.owner, "S5'");
    assert_eq!(record.cli_mirror, Some("epi bimba"));
    assert_eq!(record.extraction_task, Some("40.T40.1"));
}
