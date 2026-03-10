use std::fs;
use std::path::PathBuf;

#[test]
fn khora_and_hen_extension_scaffolds_exist() {
    let root = repo_root();
    for path in [
        ".pi/extensions/ta-onta/khora/extension.ts",
        ".pi/extensions/ta-onta/khora/CONTRACT.md",
        ".pi/extensions/ta-onta/khora/S0/tools.json",
        ".pi/extensions/ta-onta/khora/S0/pre-session-init.sh",
        ".pi/extensions/ta-onta/khora/S0/post-session-close.sh",
        ".pi/extensions/ta-onta/khora/S0'/ffi.md",
        ".pi/extensions/ta-onta/khora/S0'/session-state.d.ts",
        ".pi/extensions/ta-onta/hen/extension.ts",
        ".pi/extensions/ta-onta/hen/CONTRACT.md",
        ".pi/extensions/ta-onta/hen/S1/tools.json",
        ".pi/extensions/ta-onta/hen/M/README.md",
        "Idea/Bimba/World/NOW.md",
        "Idea/Bimba/World/Daily-Note.md",
        "Idea/Bimba/World/CT4a.md",
        "Idea/Bimba/World/CT4b.md",
        "Idea/Bimba/World/Types/README.md",
        "Idea/Bimba/World/Types/Psychoids/#/#4/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C0/C0'/CPF/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF/CF_MOBIUS/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/M/M4/M4'/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4a/Integration-Preview/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4b/Daily-Note/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4b/NOW/.gitkeep",
    ] {
        assert!(root.join(path).exists(), "missing {}", path);
    }

    assert!(root.join("repo-ontology.md").is_file());

    let khora_tools =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/khora/S0/tools.json")).unwrap();
    assert!(khora_tools.contains("epi core knowing"));
    assert!(khora_tools.contains("epi vault"));

    let hen_tools =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/hen/S1/tools.json")).unwrap();
    assert!(hen_tools.contains("epi vault template-invoke"));
    assert!(hen_tools.contains("epi vault thought-route"));

    let hen_contract =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/hen/CONTRACT.md")).unwrap();
    assert!(hen_contract.contains("Idea/Bimba/World"));
    assert!(hen_contract.contains("Idea/Bimba/World/Types"));
    assert!(hen_contract.contains("C0' -> CPF"));
    assert!(hen_contract.contains("C1' -> CT"));
    assert!(hen_contract.contains("C3' -> CF"));
    assert!(hen_contract.contains("derived from the core C library and schema authorities"));
    assert!(hen_contract.contains("Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT"));
    assert!(hen_contract.contains("Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF"));

    let repo_ontology = fs::read_to_string(root.join("repo-ontology.md")).unwrap();
    assert!(repo_ontology.contains("Idea/Bimba/Seeds"));
    assert!(repo_ontology.contains("Idea/Bimba/World"));
    assert!(repo_ontology.contains("Idea/Bimba/World/Types"));
    assert!(repo_ontology.contains("Idea/Empty/Present"));
    assert!(repo_ontology.contains("Idea/Pratibimba/Self"));
}

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .to_path_buf()
}
