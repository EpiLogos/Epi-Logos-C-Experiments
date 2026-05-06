use std::path::PathBuf;

#[test]
fn aletheia_scaffold_exists() {
    let root = repo_root();

    for path in [
        "Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5/tools.json",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/README.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/M/README.md",
    ] {
        assert!(root.join(path).exists(), "missing {}", path);
    }
}

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .to_path_buf()
}
