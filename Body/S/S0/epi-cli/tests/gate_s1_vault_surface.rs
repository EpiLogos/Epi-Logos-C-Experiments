//! 03.T6.5 integration test — `s1'.vault.rename_file` reconciles wikilinks
//! across all referring documents atomically. Builds a temp fixture vault
//! with 5 inbound `[[A]]` references in 5 different notes, invokes the
//! dispatch fn directly, asserts the returned receipt + reads the rewritten
//! markdown back and asserts every `[[A]]` became `[[B]]`. Also exercises
//! the protected-path privacy classifier and the semantic suggest_links
//! happy-path (with NoIndex staleness when the vault has no smart_env).

use std::fs;
use std::path::PathBuf;

use epi_logos::gate::s1_hen;
use epi_s3_gateway_contract::S1VaultRenameReceipt;
use serde_json::json;

fn fixture_vault() -> PathBuf {
    let unique = format!(
        "epi-vault-fixture-{}-{}",
        std::process::id(),
        uuid::Uuid::new_v4().simple()
    );
    let root = std::env::temp_dir().join(unique);
    fs::create_dir_all(&root).expect("create fixture vault root");
    root
}

#[test]
fn rename_file_reconciles_all_inbound_wikilinks_atomically() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);

    // Create the source note `A.md` and 5 referring documents containing
    // `[[A]]` references in different forms — alias, heading anchor, block
    // anchor, plain title, and a path-qualified form.
    fs::write(vault.join("A.md"), "# A\n\nSource note.\n").unwrap();
    fs::create_dir_all(vault.join("Notes")).unwrap();
    fs::write(
        vault.join("Notes/Ref1.md"),
        "A plain reference to [[A]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Notes/Ref2.md"),
        "An aliased reference: [[A|the-source]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Notes/Ref3.md"),
        "A heading anchor: [[A#Section]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Notes/Ref4.md"),
        "A block anchor: [[A^block-1]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Notes/Ref5.md"),
        "Two refs in one doc: [[A]] and again [[A|second]].\n",
    )
    .unwrap();
    // Add a non-referring doc so the test confirms we didn't touch it.
    fs::write(
        vault.join("Notes/Unrelated.md"),
        "Mentions [[OtherNote]] not A.\n",
    )
    .unwrap();

    // Invoke rename_or_move_file directly.
    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "fromPath": "A.md",
        "toPath": "B.md",
    });
    let receipt_json = s1_hen::rename_or_move_file(&params).expect("rename should succeed");
    let receipt: S1VaultRenameReceipt =
        serde_json::from_value(receipt_json).expect("receipt should deserialise");

    assert_eq!(receipt.from_path, "A.md");
    assert_eq!(receipt.to_path, "B.md");
    // Ref5 has two `[[A]]` occurrences; total link count = 6 across 5 docs.
    assert_eq!(receipt.reconciled_documents.len(), 5);
    assert_eq!(receipt.reconciled_link_count, 6);
    assert!(receipt.refusals.is_empty());

    // Verify the actual file contents — every `[[A]]` is now `[[B]]`,
    // and the unrelated note was not touched.
    let ref1 = fs::read_to_string(vault.join("Notes/Ref1.md")).unwrap();
    assert!(ref1.contains("[[B]]"), "Ref1 plain ref must become [[B]]: {ref1:?}");
    assert!(!ref1.contains("[[A]]"), "Ref1 must no longer contain [[A]]: {ref1:?}");

    let ref2 = fs::read_to_string(vault.join("Notes/Ref2.md")).unwrap();
    assert!(
        ref2.contains("[[B|the-source]]"),
        "Ref2 alias must be preserved: {ref2:?}"
    );

    let ref3 = fs::read_to_string(vault.join("Notes/Ref3.md")).unwrap();
    assert!(
        ref3.contains("[[B#Section]]"),
        "Ref3 heading anchor must be preserved: {ref3:?}"
    );

    let ref4 = fs::read_to_string(vault.join("Notes/Ref4.md")).unwrap();
    assert!(
        ref4.contains("[[B^block-1]]"),
        "Ref4 block anchor must be preserved: {ref4:?}"
    );

    let ref5 = fs::read_to_string(vault.join("Notes/Ref5.md")).unwrap();
    assert!(ref5.contains("[[B]]"), "Ref5 plain ref must become [[B]]: {ref5:?}");
    assert!(
        ref5.contains("[[B|second]]"),
        "Ref5 second aliased ref must be preserved: {ref5:?}"
    );
    assert!(
        !ref5.contains("[[A]]") && !ref5.contains("[[A|"),
        "Ref5 must no longer reference [[A]]: {ref5:?}"
    );

    let unrelated = fs::read_to_string(vault.join("Notes/Unrelated.md")).unwrap();
    assert!(
        unrelated.contains("[[OtherNote]]"),
        "Unrelated note must be untouched: {unrelated:?}"
    );

    // Source file moved.
    assert!(!vault.join("A.md").exists());
    assert!(vault.join("B.md").exists());
}

#[test]
fn read_file_refuses_protected_path_without_governed_capability() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);

    // Build a canonical protected path.
    let protected_dir = vault.join("Idea/Pratibimba/Nara/07-05-2026/protected");
    fs::create_dir_all(&protected_dir).unwrap();
    fs::write(
        protected_dir.join("journal.md"),
        "# Protected journal — should not be readable without capability.\n",
    )
    .unwrap();

    let params_no_cap = json!({
        "vaultRoot": vault.to_string_lossy(),
        "path": "Idea/Pratibimba/Nara/07-05-2026/protected/journal.md",
    });
    let result = s1_hen::read_file(&params_no_cap);
    assert!(
        result.is_err(),
        "protected path without capability must be refused"
    );
    let err = result.unwrap_err();
    assert!(
        err.contains("Protected"),
        "error must mention the privacy class: {err}"
    );
    assert!(
        err.contains("protectedCapability"),
        "error must name the capability handle: {err}"
    );

    // With the governed capability provided, the read succeeds.
    let params_with_cap = json!({
        "vaultRoot": vault.to_string_lossy(),
        "path": "Idea/Pratibimba/Nara/07-05-2026/protected/journal.md",
        "protectedCapability": "governed-test-capability-handle",
    });
    let result = s1_hen::read_file(&params_with_cap).expect("read with cap must succeed");
    assert_eq!(result["privacyClass"], "public");
    assert!(result["contents"].as_str().unwrap().contains("Protected journal"));
}

#[test]
fn write_file_records_wikilink_count_and_privacy_class() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);

    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "path": "Notes/Public.md",
        "contents": "# Public note\n\nLinks to [[A]] and [[B]] and [[C]].\n",
    });
    let result = s1_hen::write_file(&params).expect("write should succeed");
    assert_eq!(result["wikilinkCount"], 3);
    assert_eq!(result["privacyClass"], "public");

    let written = fs::read_to_string(vault.join("Notes/Public.md")).unwrap();
    assert!(written.contains("[[A]]") && written.contains("[[B]]") && written.contains("[[C]]"));
}

#[test]
fn suggest_links_reports_no_index_when_smart_env_missing() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);

    // Create a tiny vault without any .smart-env directory.
    fs::write(
        vault.join("Note.md"),
        "# Note\n\nWith a [[Reference]] outlink.\n",
    )
    .unwrap();

    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "notePath": "Note.md",
        "sourceWikilinks": ["Reference"],
        "limit": 5,
    });
    let result = s1_hen::suggest_links(&params).expect("suggest_links should succeed");
    assert_eq!(
        result["staleness"], "no-index",
        "vault without .smart-env must report no-index staleness"
    );
    assert!(result["smartEnvIndexPath"].is_null());
}

#[test]
fn rename_file_refuses_when_moving_into_protected_destination_without_capability() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);
    fs::write(vault.join("PublicNote.md"), "# Public note\n").unwrap();
    fs::create_dir_all(vault.join("Idea/Pratibimba/Nara/07-05-2026/protected")).unwrap();

    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "fromPath": "PublicNote.md",
        "toPath": "Idea/Pratibimba/Nara/07-05-2026/protected/PublicNote.md",
    });
    let result = s1_hen::rename_or_move_file(&params);
    assert!(
        result.is_err(),
        "moving into protected without capability must be refused"
    );
    let err = result.unwrap_err();
    assert!(
        err.contains("Protected"),
        "error must name the privacy class: {err}"
    );
    // Source remains in place since the rename was refused before fs::rename.
    assert!(vault.join("PublicNote.md").exists());
}

// Simple drop-guard to clean up the temp vault even on test failure.
struct RemoveOnDrop(PathBuf);
impl Drop for RemoveOnDrop {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}
fn scopeguard_remove(path: &PathBuf) -> RemoveOnDrop {
    RemoveOnDrop(path.clone())
}
