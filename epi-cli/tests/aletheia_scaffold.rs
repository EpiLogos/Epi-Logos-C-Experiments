use std::fs;
use std::path::PathBuf;

#[test]
fn docling_service_and_aletheia_scaffold_exist() {
    let root = repo_root();
    let compose = fs::read_to_string(root.join("docker-compose.epi-s2.yml")).unwrap();
    assert!(compose.contains("docling-serve"));

    for path in [
        ".pi/extensions/ta-onta/aletheia/extension.ts",
        ".pi/extensions/ta-onta/aletheia/CONTRACT.md",
        ".pi/extensions/ta-onta/aletheia/S5/tools.json",
        ".pi/extensions/ta-onta/aletheia/S5'/agents/README.md",
        ".pi/extensions/ta-onta/aletheia/M/README.md",
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
