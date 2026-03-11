use std::fs;
use std::path::PathBuf;

#[test]
fn khora_and_hen_extension_scaffolds_exist() {
    let root = repo_root();
    for path in [
        ".pi/extensions/ta-onta/khora/extension.ts",
        ".pi/extensions/ta-onta/khora/CONTRACT.md",
        ".pi/extensions/ta-onta/khora/S0/tools.json",
        ".pi/extensions/ta-onta/khora/S0/cli/preferred-tools.json",
        ".pi/extensions/ta-onta/khora/S0/cli/README.md",
        ".pi/extensions/ta-onta/khora/S0/cli/resolve.sh",
        ".pi/extensions/ta-onta/khora/S0/cli/read.sh",
        ".pi/extensions/ta-onta/khora/S0/cli/search.sh",
        ".pi/extensions/ta-onta/khora/S0/cli/list.sh",
        ".pi/extensions/ta-onta/khora/S0/cli/nav.sh",
        ".pi/extensions/ta-onta/khora/S0/cli/json.sh",
        ".pi/extensions/ta-onta/khora/S0/pre-session-init.sh",
        ".pi/extensions/ta-onta/khora/S0/post-session-close.sh",
        ".pi/extensions/ta-onta/khora/S0'/ffi.md",
        ".pi/extensions/ta-onta/khora/S0'/cli-primitives.md",
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

    let khora_cli_manifest =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/khora/S0/cli/preferred-tools.json"))
            .unwrap();
    assert!(khora_cli_manifest.contains("\"search\""));
    assert!(khora_cli_manifest.contains("\"rg\""));
    assert!(khora_cli_manifest.contains("\"grep\""));
    assert!(khora_cli_manifest.contains("\"read\""));
    assert!(khora_cli_manifest.contains("\"bat\""));
    assert!(khora_cli_manifest.contains("\"cat\""));
    assert!(khora_cli_manifest.contains("\"navigation\""));
    assert!(khora_cli_manifest.contains("\"zoxide\""));
    assert!(khora_cli_manifest.contains("\"listing\""));
    assert!(khora_cli_manifest.contains("\"eza\""));
    assert!(khora_cli_manifest.contains("\"ls\""));
    assert!(khora_cli_manifest.contains("\"json\""));
    assert!(khora_cli_manifest.contains("\"jq\""));
    assert!(khora_cli_manifest.contains("\"select_interactive\""));
    assert!(khora_cli_manifest.contains("\"fzf\""));
    assert!(khora_cli_manifest.contains("\"git_host\""));
    assert!(khora_cli_manifest.contains("\"gh\""));
    assert!(khora_cli_manifest.contains("\"task_runner\""));
    assert!(khora_cli_manifest.contains("\"just\""));

    let khora_cli_readme =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/khora/S0/cli/README.md")).unwrap();
    assert!(khora_cli_readme.contains("agent-facing"));
    assert!(khora_cli_readme.contains("preferred-tools.json"));
    assert!(khora_cli_readme.contains("resolve.sh"));
    assert!(khora_cli_readme.contains("bat"));
    assert!(khora_cli_readme.contains("zoxide"));
    assert!(khora_cli_readme.contains("fzf"));
    assert!(khora_cli_readme.contains("gh"));
    assert!(khora_cli_readme.contains("just"));

    let hen_tools =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/hen/S1/tools.json")).unwrap();
    assert!(hen_tools.contains("epi vault template-invoke"));
    assert!(hen_tools.contains("epi vault thought-route"));

    let khora_contract =
        fs::read_to_string(root.join(".pi/extensions/ta-onta/khora/CONTRACT.md")).unwrap();
    assert!(khora_contract.contains("S0/cli"));
    assert!(khora_contract.contains("agent-facing command preferences"));
    assert!(khora_contract.contains("PI-visible tool"));
    assert!(khora_contract.contains("bat"));
    assert!(khora_contract.contains("zoxide"));
    assert!(khora_contract.contains("fzf"));
    assert!(khora_contract.contains("gh"));
    assert!(khora_contract.contains("just"));

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
