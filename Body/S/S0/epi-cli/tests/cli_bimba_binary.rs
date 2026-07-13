//! Real-binary e2e for `epi bimba` (Track 40 canon-update ledger CLI).
//!
//! `gate_bimba_canon_update.rs` drives the in-process `bimba::dispatch` entry
//! point directly. This suite spawns the ACTUAL `epi` binary through `run_epi`
//! so the whole surface is exercised: clap arg-parse, the global `--json`
//! flag, real stdout, real process exit codes, and the on-disk JSON ledger
//! the CLI persists between invocations. A row proposed by one process
//! invocation must be visible to the next — proving the binary (not just the
//! library function) wires the ledger correctly, and that the unknown-category
//! path fails closed with a non-zero exit through the real command.

mod support;

use serde_json::Value;
use std::path::PathBuf;
use support::{run_epi, TestEnv};

/// Build an isolated env whose canon-update ledger lives on a temp path the
/// binary resolves via `EPI_BIMBA_LEDGER_PATH`. The env's root is removed on
/// drop, so the ledger never leaks.
fn env_with_ledger() -> (TestEnv, PathBuf) {
    let env = TestEnv::empty();
    let ledger = env.home.join("canon-update-ledger.json");
    let env = env.with_env("EPI_BIMBA_LEDGER_PATH", ledger.display().to_string());
    (env, ledger)
}

#[test]
fn epi_bimba_binary_drives_full_lifecycle_and_persists_to_disk() {
    let (env, ledger) = env_with_ledger();
    assert!(
        !ledger.exists(),
        "ledger must not exist before the first propose"
    );

    // ── propose (process #1) ────────────────────────────────────────────
    let out = run_epi(
        &[
            "--json",
            "bimba",
            "propose",
            "XREF",
            "73 = 36 + 37 = 72 + 1 productive-asymmetry cross-reference",
            "--target",
            "Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md::§2 table",
        ],
        &env,
    );
    assert!(
        out.status.success(),
        "propose must exit 0; stderr={}",
        out.stderr
    );
    let receipt: Value =
        serde_json::from_str(out.stdout.trim()).expect("propose stdout must be JSON");
    assert_eq!(receipt["id"], "CU-XREF-1");
    assert_eq!(receipt["status"], "surfaced");

    // The ledger the CLI wrote is a real file on disk with the surfaced row.
    assert!(
        ledger.exists(),
        "propose must persist the ledger to EPI_BIMBA_LEDGER_PATH"
    );
    let on_disk = std::fs::read_to_string(&ledger).expect("ledger readable");
    assert!(
        on_disk.contains("CU-XREF-1"),
        "on-disk ledger must carry the proposed row: {on_disk}"
    );

    // ── list (process #2 re-loads the persisted ledger) ─────────────────
    let out = run_epi(&["--json", "bimba", "list"], &env);
    assert!(out.status.success(), "list must exit 0; stderr={}", out.stderr);
    let rows: Value = serde_json::from_str(out.stdout.trim()).expect("list stdout must be JSON");
    let rows = rows.as_array().expect("list is a JSON array");
    assert_eq!(rows.len(), 1, "exactly the one surfaced row");
    assert_eq!(rows[0]["id"], "CU-XREF-1");

    // ── show (process #3) — status is still surfaced ────────────────────
    let out = run_epi(&["--json", "bimba", "show", "CU-XREF-1"], &env);
    assert!(out.status.success(), "show must exit 0; stderr={}", out.stderr);
    let shown: Value = serde_json::from_str(out.stdout.trim()).expect("show stdout must be JSON");
    assert_eq!(shown["status"], "surfaced");
    assert_eq!(shown["category"], "xref");

    // ── land (process #4) — authors the canon-update marker ─────────────
    let out = run_epi(&["--json", "bimba", "land", "CU-XREF-1"], &env);
    assert!(out.status.success(), "land must exit 0; stderr={}", out.stderr);
    let landed: Value = serde_json::from_str(out.stdout.trim()).expect("land stdout must be JSON");
    assert_eq!(landed["status"], "landed");
    assert_eq!(
        landed["marker"]["file"],
        "Idea/Bimba/Seeds/M/M3'/m3-prime-ql-transcriptional-bridge.md"
    );
    assert_eq!(landed["marker"]["anchor"], "§2 table");

    // The persisted ledger now reflects the landed transition.
    let on_disk = std::fs::read_to_string(&ledger).expect("ledger readable after land");
    assert!(
        on_disk.contains("landed"),
        "on-disk ledger must record the landed transition: {on_disk}"
    );

    // ── list --status landed (process #5) filters to the landed row ─────
    let out = run_epi(&["--json", "bimba", "list", "--status", "landed"], &env);
    assert!(out.status.success(), "filtered list exit 0; stderr={}", out.stderr);
    let rows: Value =
        serde_json::from_str(out.stdout.trim()).expect("filtered list stdout must be JSON");
    let rows = rows.as_array().expect("list is a JSON array");
    assert_eq!(rows.len(), 1);
    assert_eq!(rows[0]["id"], "CU-XREF-1");

    // ── propose + refuse a second row (processes #6, #7) ────────────────
    let out = run_epi(
        &[
            "--json",
            "bimba",
            "propose",
            "FORM",
            "137 = 64 + 73 sixth canonical form",
        ],
        &env,
    );
    assert!(out.status.success(), "second propose exit 0; stderr={}", out.stderr);
    let receipt: Value =
        serde_json::from_str(out.stdout.trim()).expect("second propose stdout JSON");
    assert_eq!(receipt["id"], "CU-FORM-1");

    let out = run_epi(
        &["--json", "bimba", "refuse", "CU-FORM-1", "parked pending review"],
        &env,
    );
    assert!(out.status.success(), "refuse exit 0; stderr={}", out.stderr);
    let refusal: Value = serde_json::from_str(out.stdout.trim()).expect("refuse stdout JSON");
    assert_eq!(refusal["status"], "refused");

    // A final show confirms the refused row survives across process boundaries.
    let out = run_epi(&["--json", "bimba", "show", "CU-FORM-1"], &env);
    assert!(out.status.success(), "final show exit 0; stderr={}", out.stderr);
    let shown: Value = serde_json::from_str(out.stdout.trim()).expect("final show stdout JSON");
    assert_eq!(shown["status"], "refused");
}

#[test]
fn epi_bimba_binary_rejects_unknown_category_with_nonzero_exit() {
    let (env, ledger) = env_with_ledger();

    let out = run_epi(
        &["--json", "bimba", "propose", "NONSENSE", "a bogus claim"],
        &env,
    );

    // The bogus category is accepted by clap (a free String positional) but
    // rejected at dispatch — the binary must fail closed, not silently pass.
    assert!(
        !out.status.success(),
        "unknown category must exit non-zero; stdout={} stderr={}",
        out.stdout,
        out.stderr
    );
    assert!(
        out.stderr.contains("bimba error")
            && out.stderr.contains("unknown canon-update category"),
        "stderr must name the unknown-category failure: {}",
        out.stderr
    );
    // A refused proposal never touches the ledger.
    assert!(
        !ledger.exists(),
        "a rejected propose must not persist a ledger file"
    );
}
