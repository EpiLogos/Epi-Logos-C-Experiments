use std::path::PathBuf;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("epi-cli crate should live under repo root")
        .to_path_buf()
}

/// Task 4: The OMX port matrix must exist and map all four capability families.
#[test]
fn omx_pleroma_port_matrix_exists() {
    let matrix = repo_root().join("Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-port-matrix.md");
    let text = std::fs::read_to_string(&matrix)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", matrix.display()));

    for needle in [
        "retain from OMX",
        "port from current Pleroma",
        "derive from ta-onta",
        "move to claw",
    ] {
        assert!(
            text.contains(needle),
            "missing {needle:?} in {}",
            matrix.display()
        );
    }
}

/// Task 1: The authority matrix must exist and name all four authority layers.
#[test]
fn omx_pleroma_claw_authority_matrix_exists() {
    let matrix =
        repo_root().join("Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md");
    let text = std::fs::read_to_string(&matrix)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", matrix.display()));

    for needle in ["OMX", "ta-onta", "PI", "claw-rust"] {
        assert!(
            text.contains(needle),
            "missing {needle:?} in {}",
            matrix.display()
        );
    }
}

#[test]
fn pleroma_port_matrix_lists_all_capability_families() {
    let matrix = repo_root().join("Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md");
    let text = std::fs::read_to_string(&matrix)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", matrix.display()));

    for needle in [
        "tmux",
        "cmux",
        "worktrunk",
        "ralph-tui",
        "ouroboros",
        "klein-mode",
        "repl",
        "notebooklm",
    ] {
        assert!(
            text.contains(needle),
            "missing {needle} in {}",
            matrix.display()
        );
    }
}
