//! Residency lock (light): agent definitions live under the two canonical
//! ta-onta homes and carry their own entitlement frontmatter — they are NOT
//! owned by the Pleroma skill bundle.
//!
//!   - Constitutional agents: Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/*.md
//!   - Aletheia subagents:     Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*.md
//!
//! NOTE: per the deferred-deletion rule, this test does NOT assert that
//! `Body/S/S4/plugins/pleroma/agents` is absent. It only locks the canonical
//! residency of agent defs at the ta-onta homes.

use std::fs;
use std::path::PathBuf;

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli crate should live under Body/S/S0")
        .to_path_buf()
}

fn count_agent_md(dir: &std::path::Path) -> usize {
    fs::read_dir(dir)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", dir.display()))
        .filter_map(|e| e.ok())
        .filter(|e| {
            let p = e.path();
            p.is_file()
                && p.extension().and_then(|x| x.to_str()) == Some("md")
                // README.md is documentation, not an agent definition.
                && p.file_name().and_then(|n| n.to_str()) != Some("README.md")
        })
        .count()
}

#[test]
fn constitutional_agent_defs_reside_under_anima_home() {
    let home = repo_root().join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents");
    assert!(
        home.is_dir(),
        "constitutional agent home missing: {}",
        home.display()
    );
    let n = count_agent_md(&home);
    assert!(
        n > 0,
        "no agent .md definitions found under {}",
        home.display()
    );

    // Anima itself must be present in its canonical home.
    assert!(
        home.join("anima.md").is_file(),
        "expected anima.md under {}",
        home.display()
    );
}

#[test]
fn aletheia_subagent_defs_reside_under_aletheia_home() {
    let home = repo_root().join("Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents");
    assert!(
        home.is_dir(),
        "aletheia agent home missing: {}",
        home.display()
    );
    let n = count_agent_md(&home);
    assert!(
        n > 0,
        "no agent .md definitions found under {}",
        home.display()
    );

    // Aletheia itself must be present in its canonical home.
    assert!(
        home.join("aletheia.md").is_file(),
        "expected aletheia.md under {}",
        home.display()
    );
}

#[test]
fn agent_defs_carry_binding_entitlement_frontmatter() {
    // The architecture truth: agent defs (not Pleroma) own skill/tool
    // entitlement. Verify the canonical anima def carries the binding
    // `tools:` and `skills:` allowlist fields in its frontmatter.
    let anima = repo_root().join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/anima.md");
    let text = fs::read_to_string(&anima)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", anima.display()));
    assert!(
        text.contains("\ntools:") || text.starts_with("tools:") || text.contains("\ntools :"),
        "anima.md must carry a binding `tools:` frontmatter field"
    );
    assert!(
        text.contains("\nskills:") || text.contains("\nskills :"),
        "anima.md must carry a binding `skills:` frontmatter field"
    );
}
