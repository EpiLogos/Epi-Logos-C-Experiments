//! 03.T6.5 integration test — `s1'.vault.rename_file` reconciles wikilinks
//! across all referring documents atomically. Builds a temp fixture vault
//! with 5 inbound `[[A]]` references in 5 different notes, invokes the
//! dispatch fn directly, asserts the returned receipt + reads the rewritten
//! markdown back and asserts every `[[A]]` became `[[B]]`. Also exercises
//! the protected-path privacy classifier and the semantic suggest_links
//! happy-path (with NoIndex staleness when the vault has no smart_env).

mod support;

use std::fs;
use std::path::PathBuf;

// T53.04: the s1'.* handlers live at their coordinate now.
use epi_s1_hen_compiler_core::s1_handlers as s1_hen;
use epi_s3_gateway_contract::{S1VaultRenameReceipt, S1VaultRenameRefusalReason};
use futures_util::StreamExt;
use serde_json::json;
use support::TestGatewayClient;
use tokio_tungstenite::connect_async;

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
    fs::write(vault.join("Notes/Ref1.md"), "A plain reference to [[A]].\n").unwrap();
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
    fs::write(
        vault.join("Notes/Ref6.md"),
        "Path refs: [[folder/A]] and [[folder/A.md#Section|aliased]].\n",
    )
    .unwrap();
    fs::write(
        vault.join("Notes/Fenced.md"),
        "```md\nAn example that must stay literal: [[A]].\n```\n",
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
    // Ref5 has two bare occurrences and Ref6 has two path-qualified forms:
    // total link count = 8 across 6 documents. The fenced example is excluded.
    assert_eq!(receipt.reconciled_documents.len(), 6);
    assert_eq!(receipt.reconciled_link_count, 8);
    assert!(receipt.refusals.is_empty());

    // Verify the actual file contents — every `[[A]]` is now `[[B]]`,
    // and the unrelated note was not touched.
    let ref1 = fs::read_to_string(vault.join("Notes/Ref1.md")).unwrap();
    assert!(
        ref1.contains("[[B]]"),
        "Ref1 plain ref must become [[B]]: {ref1:?}"
    );
    assert!(
        !ref1.contains("[[A]]"),
        "Ref1 must no longer contain [[A]]: {ref1:?}"
    );

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
    assert!(
        ref5.contains("[[B]]"),
        "Ref5 plain ref must become [[B]]: {ref5:?}"
    );
    assert!(
        ref5.contains("[[B|second]]"),
        "Ref5 second aliased ref must be preserved: {ref5:?}"
    );
    assert!(
        !ref5.contains("[[A]]") && !ref5.contains("[[A|"),
        "Ref5 must no longer reference [[A]]: {ref5:?}"
    );

    let ref6 = fs::read_to_string(vault.join("Notes/Ref6.md")).unwrap();
    assert!(
        ref6.contains("[[folder/B]]"),
        "path stem must rewrite: {ref6:?}"
    );
    assert!(
        ref6.contains("[[folder/B.md#Section|aliased]]"),
        "path extension, heading, and alias must survive: {ref6:?}"
    );

    let fenced = fs::read_to_string(vault.join("Notes/Fenced.md")).unwrap();
    assert!(
        fenced.contains("[[A]]"),
        "fenced examples are not link-graph edges and must remain literal: {fenced:?}"
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

#[tokio::test]
async fn rename_reconciliation_round_trips_through_the_real_gateway() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);
    fs::write(vault.join("A.md"), "# A\n").unwrap();
    fs::write(
        vault.join("Inbound.md"),
        "Live [[folder/A.md#Section|alias]].\n```md\nLiteral [[A]].\n```\n",
    )
    .unwrap();

    let mut client = TestGatewayClient::connected_with_temp_store(28918).await;
    let result = client
        .request(
            "s1'.vault.rename_file",
            json!({
                "vaultRoot": vault.to_string_lossy(),
                "fromPath": "A.md",
                "toPath": "B.md",
            }),
        )
        .await
        .expect("real gateway dispatches the governed S1 rename");
    let receipt: S1VaultRenameReceipt =
        serde_json::from_value(result).expect("gateway returns the typed rename receipt");

    assert_eq!(receipt.reconciled_link_count, 1);
    assert!(receipt.refusals.is_empty());
    let inbound = fs::read_to_string(vault.join("Inbound.md")).unwrap();
    assert!(inbound.contains("[[folder/B.md#Section|alias]]"));
    assert!(inbound.contains("Literal [[A]]."));
    assert!(!vault.join("A.md").exists());
    assert!(vault.join("B.md").exists());
}

#[tokio::test]
async fn base_ensure_derives_ct4b_from_canonical_forms_over_the_real_gateway() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);
    let world = vault.join("Idea/Bimba/World");
    fs::create_dir_all(&world).unwrap();
    fs::write(
        world.join("Daily-Note.md"),
        r#"---
coordinate: ""
c_4_artifact_role: "daily-note"
c_1_ct_type: "CT4b"
c_3_day_id: "{{day_id}}"
c_3_created_at: "{{created_at}}"
c_0_source_coordinates: []
c_5_reflection_complete: false
p0_grounds:
p1_tasks_defined:
p2_sessions: []
p3_patterns:
p4_files_touched: []
p5_synthesis:
---
# Daily
"#,
    )
    .unwrap();
    fs::write(
        world.join("NOW.md"),
        r#"---
coordinate: "M4-{{session_id}}"
c_4_artifact_role: "now"
c_1_ct_type: "CT4b"
c_2_session_id: "{{session_id}}"
c_3_day_id: "{{day_id}}"
c_3_created_at: "{{created_at}}"
c_3_fibonacci_position: 0
c_0_source_coordinates: []
c_5_reflection_complete: false
p0_adjacencies:
p1_intentions:
p2_operations:
p3_decisions:
p4_concepts_engaged:
p5_learnings:
---
# NOW
"#,
    )
    .unwrap();

    let port = 28919;
    let mut client = TestGatewayClient::connected_with_temp_store(port).await;
    let (mut hello_socket, _) = connect_async(format!("ws://127.0.0.1:{port}"))
        .await
        .expect("second websocket should connect for hello inspection");
    let hello = hello_socket
        .next()
        .await
        .expect("gateway sends hello")
        .expect("hello frame decodes");
    let hello: serde_json::Value =
        serde_json::from_str(hello.to_text().expect("hello is text")).expect("hello is JSON");
    assert!(hello["features"]["methods"]
        .as_array()
        .expect("hello methods")
        .iter()
        .any(|method| method == "s1'.base.ensure"));

    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "coordinate": "CT4b",
        "ctType": "CT4b",
        "scope": "ctx",
        "residency": "Idea/Empty/Present/16-07-2026",
    });
    let first = client
        .request("s1'.base.ensure", params.clone())
        .await
        .expect("real gateway should emit a contract-derived base view");
    let path = vault.join(first["path"].as_str().expect("receipt path"));
    let first_bytes = fs::read(&path).expect("base view was written");
    let columns = first["derivedColumns"].as_array().expect("derived columns");
    for required in [
        "c_3_fibonacci_position",
        "p0_grounds",
        "p1_tasks_defined",
        "p2_operations",
        "p3_decisions",
        "p4_concepts_engaged",
        "p5_synthesis",
    ] {
        assert!(
            columns.iter().any(|column| column == required),
            "missing {required}"
        );
    }
    assert!(!columns.iter().any(|column| column == "session_id"));
    assert!(!columns.iter().any(|column| column == "day_id"));

    let second = client
        .request("s1'.base.ensure", params)
        .await
        .expect("second ensure should succeed");
    assert_eq!(second["existed"], true);
    assert_eq!(second["changed"], false);
    assert_eq!(fs::read(&path).unwrap(), first_bytes);

    let absolute_outside =
        std::env::temp_dir().join(format!("epi-base-ensure-outside-{}", std::process::id()));
    let refused_residencies = [
        (
            "Idea/Bimba/World".to_owned(),
            vault.join("Idea/Bimba/World/CT4b.base-view.md"),
        ),
        (
            "../outside".to_owned(),
            vault.join("../outside/CT4b.base-view.md"),
        ),
        (
            absolute_outside.to_string_lossy().to_string(),
            absolute_outside.join("CT4b.base-view.md"),
        ),
    ];
    for (residency, refused_path) in refused_residencies {
        let refused = client
            .request(
                "s1'.base.ensure",
                json!({
                    "vaultRoot": vault.to_string_lossy(),
                    "coordinate": "CT4b",
                    "ctType": "CT4b",
                    "scope": "ctx",
                    "residency": residency,
                }),
            )
            .await;
        assert!(refused.is_err(), "residency {residency} must be refused");
        assert!(
            !refused_path.exists(),
            "refused residency {residency} must not write a base view"
        );
    }

    fs::write(
        world.join("NOW.md"),
        r#"---
coordinate: "M4-{{session_id}}"
c_1_ct_type: "CT4b"
invented_contract_key: true
---
"#,
    )
    .unwrap();
    let invalid = client
        .request(
            "s1'.base.ensure",
            json!({
                "vaultRoot": vault.to_string_lossy(),
                "coordinate": "CT4b",
                "ctType": "CT4b",
                "scope": "ctx",
                "residency": "Idea/Empty/Present/16-07-2026-invalid",
            }),
        )
        .await;
    assert!(invalid.is_err(), "unknown template keys must fail closed");
    assert!(!vault
        .join("Idea/Empty/Present/16-07-2026-invalid/CT4b.base-view.md")
        .exists());
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
    assert!(result["contents"]
        .as_str()
        .unwrap()
        .contains("Protected journal"));
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

#[test]
fn move_file_refuses_coordinate_residency_mismatch_before_rename() {
    let vault = fixture_vault();
    let _guard = scopeguard_remove(&vault);
    let source = vault.join("Idea/Bimba/Seeds/S/S1/S1-0-SPEC.md");
    fs::create_dir_all(source.parent().unwrap()).unwrap();
    fs::write(
        &source,
        r#"---
coordinate: S1.0
title: S1 shard
---

# S1 shard
"#,
    )
    .unwrap();

    let params = json!({
        "vaultRoot": vault.to_string_lossy(),
        "fromPath": "Idea/Bimba/Seeds/S/S1/S1-0-SPEC.md",
        "toPath": "Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md",
    });
    let receipt_json =
        s1_hen::rename_or_move_file(&params).expect("mismatch should return typed receipt");
    let receipt: S1VaultRenameReceipt =
        serde_json::from_value(receipt_json).expect("receipt should deserialise");

    assert_eq!(receipt.reconciled_link_count, 0);
    assert_eq!(receipt.refusals.len(), 1);
    assert_eq!(
        receipt.refusals[0].reason,
        S1VaultRenameRefusalReason::CoordinateResidencyMismatch
    );
    assert!(receipt.refusals[0].detail.contains("S1.0"));
    assert!(receipt.refusals[0].detail.contains("S2.0"));
    assert!(
        vault.join("Idea/Bimba/Seeds/S/S1/S1-0-SPEC.md").exists(),
        "source must remain in place when residency mismatch refuses"
    );
    assert!(
        !vault.join("Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md").exists(),
        "destination must not be created when residency mismatch refuses"
    );
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
