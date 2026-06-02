//! Track 13 T8 — S1 Vault/Hen boundary audit. This test proves that the
//! governed path `s1'.vault.rename_file` (Track 03 T6.5 — LANDED,
//! implemented in [`epi_logos::gate::s1_hen::rename_or_move_file`])
//! atomically reconciles every inbound `[[X]]` wikilink across a fixture
//! vault when a referenced note is renamed.
//!
//! Per ADR-05-010 §2 and IOD-19, this is THE proof that the S0 vault
//! helpers' deprecated `obsidian-cli move` route can be safely retired
//! once Theia / agents fully wire onto the governed gateway path: the
//! gateway path produces zero orphan wikilinks where `obsidian-cli move`
//! has no integrity guarantee.
//!
//! Complementary to
//! [`gate_s1_vault_surface.rs::rename_file_reconciles_all_inbound_wikilinks_atomically`]
//! (Track 03 T6.5 contract test, validates the receipt shape). This test
//! lives in the S0 audit lane and verifies the boundary holds end-to-end
//! across a structured fixture: nested folder hierarchy, frontmatter-bearing
//! notes, multiple anchor forms in a single file, and a control note that
//! must remain untouched.

use std::fs;
use std::path::PathBuf;

use epi_logos::gate::s1_hen;
use serde_json::json;

fn fixture_vault() -> PathBuf {
    let unique = format!(
        "epi-t8-boundary-audit-{}-{}",
        std::process::id(),
        uuid::Uuid::new_v4().simple()
    );
    let root = std::env::temp_dir().join(unique);
    fs::create_dir_all(&root).expect("create fixture vault root");
    root
}

struct RemoveOnDrop(PathBuf);
impl Drop for RemoveOnDrop {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

#[test]
fn t8_governed_rename_leaves_no_orphan_wikilinks() {
    let vault = fixture_vault();
    let _guard = RemoveOnDrop(vault.clone());

    // Build a realistic vault sub-structure:
    //   Bimba/Seeds/M/M2/Source.md            <- target of inbound links
    //   Bimba/Seeds/M/M2/Inbound1.md          <- plain [[Source]]
    //   Bimba/Seeds/M/M2/Inbound2.md          <- aliased + heading anchor
    //   Pratibimba/Self/Thought/T0/Thought.md <- two refs in one note
    //   Idea/Pratibimba/System/extensions/Untouched.md <- control note,
    //                                             must NOT change
    for sub in [
        "Bimba/Seeds/M/M2",
        "Pratibimba/Self/Thought/T0",
        "Idea/Pratibimba/System/extensions",
    ] {
        fs::create_dir_all(vault.join(sub)).unwrap();
    }
    fs::write(
        vault.join("Bimba/Seeds/M/M2/Source.md"),
        "---\ncoordinate: \"M2\"\nfamily: \"M\"\n---\n\n# Source\n\nThe canonical target.\n",
    )
    .unwrap();
    fs::write(
        vault.join("Bimba/Seeds/M/M2/Inbound1.md"),
        "---\ncoordinate: \"M2\"\nfamily: \"M\"\n---\n\nPlain reference: [[Source]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Bimba/Seeds/M/M2/Inbound2.md"),
        "Aliased: [[Source|the source]] and heading: [[Source#Section]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Pratibimba/Self/Thought/T0/Thought.md"),
        "Twice: [[Source]] then again [[Source|other-alias]].\n",
    )
    .unwrap();
    let untouched = "References [[Bimba/Seeds/M/M3]] which is a sibling, NOT Source.\n";
    fs::write(
        vault.join("Idea/Pratibimba/System/extensions/Untouched.md"),
        untouched,
    )
    .unwrap();

    // Route the rename through the governed gateway path. Per the boundary
    // discipline this is the ONLY sanctioned mutation surface for renames.
    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "fromPath": "Bimba/Seeds/M/M2/Source.md",
        "toPath": "Bimba/Seeds/M/M2/Origin.md",
    });
    let receipt = s1_hen::rename_or_move_file(&params).expect("governed rename must succeed");

    // Receipt assertions — verifies the rename was atomically committed
    // and the inbound link count is non-zero (this is the boundary
    // invariant: the governed path SAW the inbound references).
    let reconciled_link_count = receipt["reconciledLinkCount"]
        .as_u64()
        .expect("reconciledLinkCount field present");
    let reconciled_docs = receipt["reconciledDocuments"]
        .as_array()
        .expect("reconciledDocuments field present");
    assert!(
        reconciled_link_count >= 5,
        "expected at least 5 reconciled wikilinks (Inbound1×1, Inbound2×2, Thought×2), got {reconciled_link_count}; receipt: {receipt}"
    );
    assert_eq!(
        reconciled_docs.len(),
        3,
        "expected 3 reconciled documents (Inbound1, Inbound2, Thought), got {}: {receipt}",
        reconciled_docs.len()
    );
    assert!(
        receipt["refusals"].as_array().map(|a| a.is_empty()).unwrap_or(false),
        "refusals must be empty for an all-public rename; got: {receipt}"
    );

    // File-system assertions — the boundary invariant: NO orphan `[[Source]]`
    // anywhere in the vault. Every inbound `[[X]]` must be rewritten to
    // `[[Origin]]`, preserving anchor forms.
    let mut all_md_contents = String::new();
    fn walk(dir: &std::path::Path, buf: &mut String) {
        for entry in fs::read_dir(dir).unwrap().flatten() {
            let p = entry.path();
            if p.is_dir() {
                walk(&p, buf);
            } else if p.extension().and_then(|e| e.to_str()) == Some("md") {
                buf.push_str(&fs::read_to_string(&p).unwrap());
                buf.push('\n');
            }
        }
    }
    walk(&vault, &mut all_md_contents);

    // The orphan-check: zero occurrences of the OLD title as a wikilink
    // target anywhere in the vault. This is the proof that the governed
    // path preserves wikilink integrity end-to-end.
    assert!(
        !all_md_contents.contains("[[Source]]"),
        "ORPHAN: plain [[Source]] wikilink remains after governed rename — boundary breached.\nVault contents:\n{all_md_contents}"
    );
    assert!(
        !all_md_contents.contains("[[Source|"),
        "ORPHAN: aliased [[Source|...]] wikilink remains after governed rename — boundary breached.\nVault contents:\n{all_md_contents}"
    );
    assert!(
        !all_md_contents.contains("[[Source#"),
        "ORPHAN: heading-anchored [[Source#...]] wikilink remains after governed rename — boundary breached.\nVault contents:\n{all_md_contents}"
    );

    // Positive assertions — the NEW title appears with every anchor form
    // preserved (plain, alias, heading-anchor).
    let inbound1 =
        fs::read_to_string(vault.join("Bimba/Seeds/M/M2/Inbound1.md")).unwrap();
    assert!(
        inbound1.contains("[[Origin]]"),
        "Inbound1 must contain [[Origin]] after rename: {inbound1:?}"
    );
    let inbound2 =
        fs::read_to_string(vault.join("Bimba/Seeds/M/M2/Inbound2.md")).unwrap();
    assert!(
        inbound2.contains("[[Origin|the source]]"),
        "Inbound2 alias must rewrite to [[Origin|the source]]: {inbound2:?}"
    );
    assert!(
        inbound2.contains("[[Origin#Section]]"),
        "Inbound2 heading anchor must rewrite to [[Origin#Section]]: {inbound2:?}"
    );
    let thought =
        fs::read_to_string(vault.join("Pratibimba/Self/Thought/T0/Thought.md")).unwrap();
    assert!(
        thought.contains("[[Origin]]") && thought.contains("[[Origin|other-alias]]"),
        "Thought must contain both rewritten forms of Source: {thought:?}"
    );

    // Control note — was not referencing Source; must remain byte-identical.
    let untouched_after = fs::read_to_string(
        vault.join("Idea/Pratibimba/System/extensions/Untouched.md"),
    )
    .unwrap();
    assert_eq!(
        untouched_after, untouched,
        "Untouched.md must remain byte-identical; sibling-coordinate links must not be touched"
    );

    // Source file moved on disk.
    assert!(!vault.join("Bimba/Seeds/M/M2/Source.md").exists());
    assert!(vault.join("Bimba/Seeds/M/M2/Origin.md").exists());
}

#[test]
fn t8_governed_path_dispatch_method_names_match_dispatch_classifier() {
    // Documents the binding between this audit (S0) and the gateway
    // classifier (S3 dispatch.rs lines 174-185). If either drifts, this
    // test fails the build so the boundary stays explicit.
    //
    // Method names this audit considers part of the canonical S1' vault
    // gateway surface (per Track 03 T6.5):
    let canonical_methods = [
        "s1'.vault.read_file",
        "s1'.vault.write_file",
        "s1'.vault.rename_file",
        "s1'.vault.move_file",
        "s1'.semantic.suggest_links",
    ];

    // Each method name must round-trip through the dispatcher to a
    // non-None classification. classify_method lives in S3 gateway; the
    // test asserts the audit's understanding of the surface matches.
    use epi_s3_gateway::dispatch::classify_method;
    for method in canonical_methods {
        let route = classify_method(method);
        assert!(
            route.is_some(),
            "method `{method}` is part of the audit's canonical surface but the dispatcher does not classify it. Either Track 03 T6.5 regressed or this audit drifted."
        );
    }
}
