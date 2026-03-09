use std::path::PathBuf;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("epi-cli crate should live under repo root")
        .to_path_buf()
}

#[test]
fn pleroma_port_matrix_lists_all_capability_families() {
    let matrix = repo_root().join("docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md");
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
        assert!(text.contains(needle), "missing {needle} in {}", matrix.display());
    }
}
