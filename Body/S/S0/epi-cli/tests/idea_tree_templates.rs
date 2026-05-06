use std::fs;
use std::path::PathBuf;

#[test]
fn canonical_idea_tree_and_template_authority_exist() {
    let root = repo_root();

    for path in [
        "Idea/Bimba",
        "Idea/Bimba/Map",
        "Idea/Bimba/Seeds",
        "Idea/Bimba/Seeds/C",
        "Idea/Bimba/Seeds/C/C0",
        "Idea/Bimba/Seeds/C/C1",
        "Idea/Bimba/Seeds/C/C2",
        "Idea/Bimba/Seeds/C/C3",
        "Idea/Bimba/Seeds/C/C4",
        "Idea/Bimba/Seeds/C/C5",
        "Idea/Bimba/Seeds/L",
        "Idea/Bimba/Seeds/L/L0/L0'",
        "Idea/Bimba/Seeds/L/L1/L1'",
        "Idea/Bimba/Seeds/L/L2/L2'",
        "Idea/Bimba/Seeds/L/L3/L3'",
        "Idea/Bimba/Seeds/L/L4/L4'",
        "Idea/Bimba/Seeds/L/L5/L5'",
        "Idea/Bimba/Seeds/P",
        "Idea/Bimba/Seeds/P/P0/P0'",
        "Idea/Bimba/Seeds/P/P1/P1'",
        "Idea/Bimba/Seeds/P/P2/P2'",
        "Idea/Bimba/Seeds/P/P3/P3'",
        "Idea/Bimba/Seeds/P/P4/P4'",
        "Idea/Bimba/Seeds/P/P5/P5'",
        "Idea/Bimba/Seeds/S",
        "Idea/Bimba/Seeds/S/S'",
        "Idea/Bimba/Seeds/S/S0/S0'",
        "Idea/Bimba/Seeds/S/S1/S1'",
        "Idea/Bimba/Seeds/S/S2/S2'",
        "Idea/Bimba/Seeds/S/S3/S3'",
        "Idea/Bimba/Seeds/S/S4/S4'",
        "Idea/Bimba/Seeds/S/S5/S5'",
        "Idea/Bimba/Seeds/T",
        "Idea/Bimba/Seeds/T/T0/T0'",
        "Idea/Bimba/Seeds/T/T1/T1'",
        "Idea/Bimba/Seeds/T/T2/T2'",
        "Idea/Bimba/Seeds/T/T3/T3'",
        "Idea/Bimba/Seeds/T/T4/T4'",
        "Idea/Bimba/Seeds/T/T5/T5'",
        "Idea/Bimba/World",
        "Idea/Bimba/World/Types",
        "Idea/Bimba/World/Types/Psychoids",
        "Idea/Bimba/World/Types/Coordinates",
        "Idea/Bimba/World/Types/Coordinates/C",
        "Idea/Bimba/World/Types/Coordinates/L",
        "Idea/Bimba/World/Types/Coordinates/M",
        "Idea/Bimba/World/Types/Coordinates/P",
        "Idea/Bimba/World/Types/Coordinates/S",
        "Idea/Bimba/World/Types/Coordinates/T",
        "Idea/Bimba/World/Types/Coordinates/C/C0/C0'/CPF",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT0/Seed",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT1/Prompt",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT2/Task-Spec",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT3/Pattern-Note",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4a/Integration-Preview",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4b/Daily-Note",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4b/NOW",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT5/Thought",
        "Idea/Bimba/World/Types/Coordinates/C/C2/C2'/CFP",
        "Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF",
        "Idea/Bimba/World/Types/Coordinates/C/C4/C4'/CP",
        "Idea/Bimba/World/Types/Coordinates/C/C5/C5'/CS",
        "Idea/Empty",
        "Idea/Empty/Present",
        "Idea/Pratibimba",
        "Idea/Pratibimba/Self",
        "Idea/Pratibimba/Self/Action",
        "Idea/Pratibimba/Self/Action/History",
        "Idea/Pratibimba/Self/Action/History/2026",
        "Idea/Pratibimba/Self/Action/Work",
        "Idea/Pratibimba/Self/Action/Work/Bimba Map",
        "Idea/Pratibimba/Self/Action/Work/Projects",
        "Idea/Pratibimba/Self/Thought",
        "Idea/Pratibimba/Self/Thought/T",
        "Idea/Pratibimba/Self/Thought/T/T0",
        "Idea/Pratibimba/Self/Thought/T/T5",
        "Idea/Pratibimba/System",
        "Body/S/S3/epi-app",
        "Body/S/S2/external/bimba-mcp",
        "Idea/Pratibimba/System/Subsystems",
        "Idea/Pratibimba/System/Subsystems/Anuttara",
        "Idea/Pratibimba/System/Subsystems/Mahamaya",
        "Idea/Pratibimba/System/Subsystems/Nara",
        "Idea/Pratibimba/System/Subsystems/Paramasiva",
        "Idea/Pratibimba/System/Subsystems/Parashakti",
        "Idea/Pratibimba/System/Subsystems/epii",
    ] {
        assert!(root.join(path).is_dir(), "missing directory {}", path);
    }

    assert!(root.join("repo-ontology.md").is_file());

    let templates_json = fs::read_to_string(root.join(".obsidian/templates.json")).unwrap();
    assert!(templates_json.contains("Idea/Bimba/World"));

    assert!(root.join("Idea/Bimba/World/Types/README.md").is_file());
    let repo_ontology = fs::read_to_string(root.join("repo-ontology.md")).unwrap();
    assert!(repo_ontology.contains("Idea/Bimba/Seeds"));
    assert!(repo_ontology.contains("Idea/Bimba/World"));
    assert!(repo_ontology.contains("Idea/Pratibimba/Self"));

    for psychoid in 0..=5 {
        assert!(
            root.join(format!("Idea/Bimba/World/Types/Psychoids/#/#{psychoid}"))
                .is_dir(),
            "missing psychoid directory #{psychoid}"
        );
    }

    for family in ["C", "P", "L", "S", "T", "M"] {
        assert!(
            root.join(format!("Idea/Bimba/World/Types/Coordinates/{family}"))
                .is_dir(),
            "missing family directory {family}"
        );
        assert!(
            root.join(format!(
                "Idea/Bimba/World/Types/Coordinates/{family}/{family}'"
            ))
            .is_dir(),
            "missing inversion directory {family}'"
        );

        for pos in 0..=5 {
            assert!(
                root.join(format!(
                    "Idea/Bimba/World/Types/Coordinates/{family}/{family}{pos}"
                ))
                .is_dir(),
                "missing coordinate directory {family}{pos}"
            );
            assert!(
                root.join(format!(
                    "Idea/Bimba/World/Types/Coordinates/{family}/{family}{pos}/{family}{pos}'"
                ))
                .is_dir(),
                "missing inverted coordinate directory {family}{pos}'"
            );
        }
    }

    assert!(root
        .join("Idea/Bimba/World/Types/Coordinates/C/C0/C0'/CPF")
        .is_dir());
    assert!(root
        .join("Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT")
        .is_dir());
    assert!(root
        .join("Idea/Bimba/World/Types/Coordinates/C/C2/C2'/CFP")
        .is_dir());
    assert!(root
        .join("Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF")
        .is_dir());
    assert!(root
        .join("Idea/Bimba/World/Types/Coordinates/C/C4/C4'/CP")
        .is_dir());
    assert!(root
        .join("Idea/Bimba/World/Types/Coordinates/C/C5/C5'/CS")
        .is_dir());

    for frame in [
        "CF_VOID",
        "CF_BINARY",
        "CF_TRIKA",
        "CF_QUATERNAL",
        "CF_FRACTAL",
        "CF_SYNTHESIS",
        "CF_MOBIUS",
    ] {
        assert!(
            root.join(format!(
                "Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF/{frame}"
            ))
            .is_dir(),
            "missing context frame directory {frame}"
        );
    }

    for path in [
        "Idea/Bimba/World/CT0.md",
        "Idea/Bimba/World/CT1.md",
        "Idea/Bimba/World/CT2.md",
        "Idea/Bimba/World/CT3.md",
        "Idea/Bimba/World/CT4a.md",
        "Idea/Bimba/World/CT4b.md",
        "Idea/Bimba/World/CT5.md",
        "Idea/Bimba/World/Seed.md",
        "Idea/Bimba/World/Prompt.md",
        "Idea/Bimba/World/Task-Spec.md",
        "Idea/Bimba/World/Pattern-Note.md",
        "Idea/Bimba/World/Daily-Note.md",
        "Idea/Bimba/World/NOW.md",
        "Idea/Bimba/World/Thought.md",
        "Idea/Bimba/World/Integration-Preview.md",
    ] {
        assert!(root.join(path).is_file(), "missing template {}", path);
    }

    let ct4a = fs::read_to_string(root.join("Idea/Bimba/World/CT4a.md")).unwrap();
    assert!(ct4a.contains("CF(4.5/0)"));
    let ct4b = fs::read_to_string(root.join("Idea/Bimba/World/CT4b.md")).unwrap();
    assert!(ct4b.contains("CF(4.0-4.4/5)"));
}

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .to_path_buf()
}
