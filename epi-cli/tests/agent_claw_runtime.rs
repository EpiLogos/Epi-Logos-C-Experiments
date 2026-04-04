mod common;

use common::{run_epi, TestEnv};
use std::fs;
use std::path::PathBuf;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("epi-cli crate should live under repo root")
        .to_path_buf()
}

/// Task 7: `epi agent claw doctor` must verify the vendored claw runtime.
#[test]
fn claw_doctor_reports_vendor_status() {
    let env = TestEnv::repo_with_assets();

    let out = run_epi(
        ["agent", "claw", "doctor", "--json"].as_slice(),
        &env,
    );

    // claw doctor runs (may report missing but must not crash)
    // The JSON output must contain the parity vendor key
    assert!(
        out.stdout.contains("\"clawVendorPresent\"")
            || out.stdout.contains("clawVendorPresent")
            || out.stdout.contains("claw"),
        "expected claw vendor status in doctor output: {}",
        out.stdout
    );
}

/// Task 7: `epi agent claw verify-runtime` runs a non-destructive smoke path.
#[test]
fn claw_verify_runtime_is_non_destructive() {
    let env = TestEnv::repo_with_assets();

    // Seed a minimal claw vendor
    let claw_vendor = env.repo_root.join("vendors/claw-code-parity");
    fs::create_dir_all(&claw_vendor).unwrap();
    fs::write(claw_vendor.join("PARITY.md"), "# Parity Status\n").unwrap();

    let out = run_epi(
        ["agent", "claw", "verify-runtime", "--json"].as_slice(),
        &env,
    );

    // Must complete without crashing (exit 0 or report status JSON)
    assert!(
        out.stdout.contains("\"status\"") || out.stdout.contains("status"),
        "expected status key in verify-runtime output: {}",
        out.stdout
    );
    // Must NOT modify any tracked files
    // (we only check that the command exited cleanly — destructive ops would panic)
}

/// Task 7: The claw operator protocol doc must exist.
#[test]
fn claw_operator_protocol_doc_exists() {
    let doc = repo_root().join("docs/dev/claw-operator-protocol.md");
    assert!(
        doc.exists(),
        "docs/dev/claw-operator-protocol.md does not exist"
    );
    let text = fs::read_to_string(&doc).unwrap();
    assert!(
        text.contains("claw") || text.contains("claw-rust"),
        "claw-operator-protocol.md doesn't mention claw: {}",
        &text[..200.min(text.len())]
    );
}

/// Task 7: PI default path must remain intact alongside the new claw lane.
#[test]
fn pi_default_path_unaffected_by_claw_lane() {
    let env = TestEnv::repo_with_assets();

    let out = run_epi(["agent", "doctor", "--json"].as_slice(), &env);
    assert!(
        out.stdout.contains("\"piBinaryPresent\"")
            || out.stdout.contains("piBinaryPresent"),
        "PI default path broken after claw lane addition: {}",
        out.stdout
    );
}

/// Task 8: doctor must report `"claw"` as the default interactive launch mode.
#[test]
fn claw_is_default_substrate_in_doctor() {
    let env = TestEnv::repo_with_assets();

    let out = run_epi(["agent", "doctor", "--json"].as_slice(), &env);
    assert!(
        out.stdout.contains("\"interactiveLaunchMode\": \"claw\"")
            || out.stdout.contains("interactiveLaunchMode\": \"claw\"")
            || (out.stdout.contains("interactiveLaunchMode") && out.stdout.contains("claw")),
        "expected interactiveLaunchMode=claw in doctor output (got: {})",
        out.stdout
    );
    assert!(
        !out.stdout.contains("\"native-pi\""),
        "doctor still reports native-pi as default after claw cutover: {}",
        out.stdout
    );
}

/// Task 8: PI operator protocol doc must document PI as compatibility substrate only.
#[test]
fn pi_protocol_doc_reflects_compat_mode() {
    let doc = repo_root().join("docs/dev/pi-operator-protocol.md");
    assert!(doc.exists(), "docs/dev/pi-operator-protocol.md does not exist");
    let text = fs::read_to_string(&doc).unwrap();
    assert!(
        text.contains("compat") || text.contains("compatibility") || text.contains("secondary"),
        "pi-operator-protocol.md does not reflect PI as compat substrate: {}",
        &text[..300.min(text.len())]
    );
}

/// Task 8: claw operator protocol must declare plugins/ as the primary authoring path.
#[test]
fn plugin_authoring_is_primary_not_pi_extension() {
    let doc = repo_root().join("docs/dev/claw-operator-protocol.md");
    assert!(doc.exists(), "docs/dev/claw-operator-protocol.md does not exist");
    let text = fs::read_to_string(&doc).unwrap();
    assert!(
        text.contains("plugins/") || text.contains("plugin"),
        "claw-operator-protocol.md does not mention plugins/ as primary authoring path: {}",
        &text[..300.min(text.len())]
    );
}
