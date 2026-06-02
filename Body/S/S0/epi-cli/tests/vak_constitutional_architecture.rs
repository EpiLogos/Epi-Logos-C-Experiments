use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

fn repo_root() -> PathBuf {
    // Track-13.T6: the epi-cli crate lives at `Body/S/S0/epi-cli/`, so the
    // repository root is four ancestors up (epi-cli → S0 → S → Body → repo).
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli crate should live under Body/S/S0")
        .to_path_buf()
}

fn read(path: impl AsRef<Path>) -> String {
    fs::read_to_string(path.as_ref())
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", path.as_ref().display()))
}

fn assert_has_six_sections(path: &Path) {
    let text = read(path);
    for heading in [
        "## 1. Rupa",
        "## 2. Ontology",
        "## 3. Frame Contract",
        "## 4. Temporal",
        "## 5. Capability",
        "## 6. Sattva",
    ] {
        assert!(
            text.contains(heading),
            "missing heading {heading} in {}",
            path.display()
        );
    }
}

fn validate_skill(path: &Path) {
    let output = Command::new(env!("CARGO_BIN_EXE_epi"))
        .current_dir(repo_root())
        .arg("agent")
        .arg("skill")
        .arg("validate")
        .arg(path)
        .arg("--json")
        .output()
        .unwrap();
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        output.status.success(),
        "skill validate failed for {}:\nstdout:\n{}\nstderr:\n{}",
        path.display(),
        stdout,
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        stdout.contains("\"valid\": true"),
        "skill validate did not report valid=true for {}:\n{}",
        path.display(),
        stdout
    );
}

#[test]
fn vak_constitutional_agents_and_roots_are_complete() {
    let root = repo_root();
    let anima_root = root.join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/anima.md");
    let aletheia_root = root.join("Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/aletheia.md");
    assert!(anima_root.exists(), "missing {}", anima_root.display());
    assert!(
        aletheia_root.exists(),
        "missing {}",
        aletheia_root.display()
    );

    for rel in [
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/anima.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/nous.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/logos.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/eros.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/mythos.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/sophia.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/aletheia.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/anansi.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/mercurius.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/agora.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/zeithoven.md",
    ] {
        assert_has_six_sections(&root.join(rel));
    }

    let nous = read(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/nous.md"));
    assert!(nous.contains("Para Vāk"));
    let psyche = read(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md"));
    assert!(psyche.contains("(4.0/1-4.4/5)"));
    let sophia = read(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/sophia.md"));
    assert!(sophia.contains("Spanda-Shakti"));
    let moirai = read(root.join("Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md"));
    assert!(moirai.contains("CS-based activation"));
    assert!(moirai.contains("Klotho mode"));
    assert!(moirai.contains("Lachesis mode"));
    assert!(moirai.contains("Atropos mode"));
}

#[test]
fn vak_skill_surface_exists_and_validates() {
    let root = repo_root();
    let required_skills = [
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/using-superpowers/SKILL.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/brainstorming/SKILL.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/writing-plans/SKILL.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/test-driven-development/SKILL.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/subagent-driven-development/SKILL.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/dispatching-parallel-agents/SKILL.md",
        "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/verification-before-completion/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-ql-gate/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-m-gate/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-s-gate/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-m-prime-gate/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-rupa-gate/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-collab-gate/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-stack-traverse/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-module-audit/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-improvement-propose/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-self-extend/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/anansi/SKILL.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills/aletheia-plugin-integrate/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-spawn/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-relay/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-list/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-close/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/pleroma-skill-proxy/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-webmcp-bridge/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-webmcp-call/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-webmcp-context/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/techne-webmcp-watch/SKILL.md",
        "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/context7/SKILL.md",
    ];

    for rel in required_skills {
        let path = root.join(rel);
        assert!(path.exists(), "missing {}", path.display());
        validate_skill(&path);
    }
}

#[test]
fn vak_runtime_surface_and_modules_are_wired() {
    let root = repo_root();
    let anima_extension = read(root.join("Body/S/S4/ta-onta/S4-4p-anima/extension.ts"));
    for needle in [
        "dispatch_parallel_agents",
        "dispatch_fusion_agents",
        "type CSState",
        "setCSState",
        "sophiaReview",
        "night_prime",
    ] {
        assert!(
            anima_extension.contains(needle),
            "missing {needle} in anima extension"
        );
    }

    let aletheia_extension = read(root.join("Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts"));
    for needle in [
        "./modules/hen-integration.ts",
        "./modules/chronos-integration.ts",
        "./modules/coordinate-loop.ts",
        "buildTemporalContextEnvelope",
        "validateHenSync",
        "maybeUpdateCoordinateMap",
    ] {
        assert!(
            aletheia_extension.contains(needle),
            "missing {needle} in aletheia extension"
        );
    }

    for rel in [
        "Body/S/S4/ta-onta/S4-5p-aletheia/modules/hen-integration.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/modules/chronos-integration.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/modules/coordinate-loop.ts",
    ] {
        let path = root.join(rel);
        assert!(path.exists(), "missing {}", path.display());
    }
}

#[test]
fn vak_docs_clusters_and_primitives_exist() {
    let root = repo_root();
    for rel in [
        "docs/plans/CLOCK-AND-NARA-SPECS/07-c-prime-vak-grammar-layer.md",
        "Idea/Empty/COORDINATE-MAP.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/clusters/anansi/RUPA.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/clusters/janus/RUPA.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/clusters/moirai/RUPA.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/clusters/mercurius/RUPA.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/clusters/agora/RUPA.md",
        "Body/S/S4/ta-onta/S4-5p-aletheia/clusters/zeithoven/RUPA.md",
    ] {
        assert!(
            root.join(rel).exists(),
            "missing {}",
            root.join(rel).display()
        );
    }

    let primitives = read(root.join("Body/S/S4/ta-onta/S4-2p-pleroma/S2/pleroma-primitives.ts"));
    assert!(primitives.contains("context7"));
    let gitignore = read(root.join(".gitignore"));
    assert!(gitignore.contains(".onecontext/"));
}
