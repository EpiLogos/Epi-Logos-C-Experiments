mod support;

use serde_json::json;
use support::TestGatewayClient;

use epi_s2_graph_services::{
    parse_yaml_frontmatter, read_graph_meta, Neo4jClient, Neo4jConfig, SyncCoordinator,
};

fn write_q_review_config() {
    let home = std::env::var("HOME").expect("test gateway supplies HOME");
    let path = std::path::Path::new(&home).join(".epi-logos/config.toml");
    std::fs::create_dir_all(path.parent().expect("config parent")).expect("create config parent");
    std::fs::write(
        path,
        r#"
[autoresearch]
articulation_gap_peer_ratio = 0.75
contradiction_vector_disagreement_threshold = 0.35
resonance_promotion_confidence_threshold = 0.85
stale_revision_threshold = 12
priority_order = ["articulation_gap", "promotion_candidate", "contradiction_candidate", "stale_by_non_revisit"]
"#,
    )
    .expect("write autoresearch config");
}

/// 13.T7 store-location guard: the S0 autoresearch gate adapter must persist
/// the S5 `ImprovementStore` under `<state_root>/s5/epii-autoresearch` and
/// read the linked review store at `<state_root>/s5/epii-review`. Pins the
/// boundary layout so refactors that try to move S5 governance state under
/// another gate-root subtree fail loudly.
#[test]
fn gate_improve_store_subpath_is_stable_at_s0_s5_boundary() {
    // T53.07: both families live at their coordinate now.
    use epi_s5_epii_autoresearch_core::s5_handlers::improve;
    use epi_s5_epii_review_core::s5_handlers as review;
    use std::path::PathBuf;

    assert_eq!(improve::STORE_SUBPATH, ["s5", "epii-autoresearch"]);
    let improvement_path = improve::improvement_store_path(PathBuf::from("/tmp/state-root"));
    assert_eq!(
        improvement_path,
        PathBuf::from("/tmp/state-root/s5/epii-autoresearch"),
        "S5 autoresearch store must live under <state_root>/s5/epii-autoresearch"
    );

    // The promote gate cross-reads the review store; confirm both share the
    // same canonical S5 root so governance pre-checks read what the S5 core
    // wrote.
    let review_path = review::review_store_path(PathBuf::from("/tmp/state-root"));
    assert_eq!(review_path.parent(), improvement_path.parent());
}

#[tokio::test]
async fn s5_improve_gateway_runs_generalized_autoresearch_loop() {
    let mut client = TestGatewayClient::connected_with_temp_store(18911).await;

    let proposed = client
        .request(
            "s5'.improve.propose",
            json!({
                "target_family": "S",
                "target_coordinate": "S5/S5'",
                "direction": "generalise autoresearch beyond ML",
                "source_review_item_id": "review-1",
                "baseline": {
                    "path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md"
                }
            }),
        )
        .await
        .expect("improvement proposal should persist");

    let run_id = proposed["run"]["run_id"].as_str().unwrap().to_owned();
    assert_eq!(proposed["run"]["loop_state"], "hypothesis");
    assert!(proposed["run"]["challenger"]["path"]
        .as_str()
        .unwrap()
        .starts_with("autoresearch://challenger/"));

    let evaluated = client
        .request(
            "s5'.improve.evaluate",
            json!({
                "run_id": run_id,
                "evidence": [
                    {
                        "dimension": "architectural_fit",
                        "baseline_score": 0.5,
                        "challenger_score": 0.86,
                        "weight": 0.75,
                        "notes": "Challenger preserves the vendor loop shape without ML coupling.",
                        "kernel_evidence": {
                            "baseline": {
                                "generation": 20,
                                "phase": "Descent",
                                "element": "PratibimbaAsBimba",
                                "harmonic_ratio": "0.666667",
                                "pulse_ratio": "2/3",
                                "total_energy": "0.120000"
                            },
                            "challenger": {
                                "generation": 21,
                                "phase": "Ascent",
                                "element": "InverseMobius",
                                "harmonic_ratio": "0.750000",
                                "pulse_ratio": "3/4",
                                "total_energy": "0.270000"
                            },
                            "delta": {
                                "energy_delta": "0.150000",
                                "harmonic_changed": true,
                                "resonance_delta": "tritone-square:2:+0.080000"
                            },
                            "privacy": "safe-public-current-kernel-tick",
                            "computation_source": "portal-core::KernelProjection",
                            "advisory_only": true,
                            "interpretation_boundary": "kernel deltas are advisory evidence only; Epii review decides interpretation",
                            "trajectory": {
                                "session_key": "agent:epii:main",
                                "day_id": "17-05-2026",
                                "now_path": "Idea/Empty/Present/17-05-2026/20260517-120000-epii/now.md",
                                "spacetimedb_session_surface": "session_surface",
                                "spacetimedb_global_surface": "global_temporal_surface",
                                "graphiti_arc_id": "day:17-05-2026:session:epii-main"
                            }
                        },
                        "source_refs": [{
                            "kind": "gnosis_status",
                            "uri": "s5'.epii.status#/world_return/gnosis",
                            "coordinate": "S5.2",
                            "summary": "Gnosis local store was observable through Epii."
                        }]
                    },
                    {
                        "dimension": "simplicity",
                        "baseline_score": 0.6,
                        "challenger_score": 0.8,
                        "weight": 0.25,
                        "notes": "The loop has a smaller public state machine."
                    }
                ]
            }),
        )
        .await
        .expect("improvement evaluation should persist");

    assert_eq!(evaluated["run"]["decision"], "keep");
    assert_eq!(evaluated["run"]["evaluation"]["winner"], "challenger");
    assert_eq!(
        evaluated["run"]["evaluation"]["evidence"][0]["source_refs"][0]["kind"],
        "gnosis_status"
    );
    assert_eq!(
        evaluated["run"]["evaluation"]["evidence"][0]["kernel_evidence"]["delta"]["energy_delta"],
        "0.150000"
    );
    assert_eq!(
        evaluated["run"]["evaluation"]["evidence"][0]["kernel_evidence"]["advisory_only"],
        true
    );
    assert_eq!(
        evaluated["run"]["evaluation"]["evidence"][0]["kernel_evidence"]["trajectory"]
            ["graphiti_arc_id"],
        "day:17-05-2026:session:epii-main"
    );

    let status = client
        .request("s5'.improve.status", json!({}))
        .await
        .expect("improvement status should load");

    assert_eq!(status["keep_count"], 1);
    assert_eq!(status["discard_count"], 0);
    assert_eq!(status["kernel_evidence_count"], 1);

    let history = client
        .request("s5'.improve.history", json!({"limit": 5}))
        .await
        .expect("improvement history should load");

    assert_eq!(history["runs"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn s5_improve_gateway_persists_and_filters_q_review_queue() {
    let mut client = TestGatewayClient::connected_with_temp_store(18912).await;
    write_q_review_config();
    let embedding = vec![0.5_f64; 3072];
    let queue = client
        .request(
            "s5'.improve.q_review.run",
            json!({
                "corpus_snapshot": {
                    "day_id": "2026-07-15",
                    "graph_revision": 7,
                    "nodes": [
                        {
                            "coordinate": "M5-0",
                            "namespace": "bimba",
                            "c_4_family": "M",
                            "c_4_ql_position": "5",
                            "c_4_lens": "L5",
                            "q_values": { "q_5_i0_integration_template": "canonical return" },
                            "review_epochs": { "qm_5_i0_review_epoch": 7 },
                            "embedding_3072": embedding
                        },
                        {
                            "coordinate": "M5-1",
                            "namespace": "bimba",
                            "c_4_family": "M",
                            "c_4_ql_position": "5",
                            "c_4_lens": "L5",
                            "q_values": {},
                            "review_epochs": { "qm_5_i0_review_epoch": 7 },
                            "embedding_3072": vec![0.5_f64; 3072]
                        }
                    ]
                },
                "last_review_epoch": 7
            }),
        )
        .await
        .expect("q-review run should persist a queue");
    assert!(queue["entries"]
        .as_array()
        .is_some_and(|entries| !entries.is_empty()));

    let filtered = client
        .request(
            "s5'.improve.q_review.latest",
            json!({ "day_id": "2026-07-15", "cf": "(4.5/0)" }),
        )
        .await
        .expect("q-review latest should read the persisted queue");
    assert_eq!(filtered["day_id"], "2026-07-15");
    assert!(filtered["entries"].as_array().is_some_and(|entries| {
        entries
            .iter()
            .all(|entry| entry["review_surface"]["vak_cf"] == "(4.5/0)")
    }));
}

#[tokio::test]
#[ignore] // requires the local Neo4j corpus: `epi graph doctor` must report graph.ok=true
async fn s5_improve_gateway_builds_and_persists_q_review_from_live_bimba() {
    let mut client = TestGatewayClient::connected_with_temp_store(18917).await;
    write_q_review_config();

    let queue = client
        .request(
            "s5'.improve.q_review.night_pass",
            json!({
                "day_id": "2026-07-15-live",
                "last_review_epoch": 0
            }),
        )
        .await
        .expect("night pass should read the live Bimba graph without a caller corpus");

    assert!(queue["graph_revision"]
        .as_u64()
        .is_some_and(|revision| revision > 0));
    assert!(queue["entries"]
        .as_array()
        .is_some_and(|entries| !entries.is_empty()));

    let persisted = client
        .request(
            "s5'.improve.q_review.latest",
            json!({ "day_id": "2026-07-15-live" }),
        )
        .await
        .expect("persisted night-pass queue should be readable");
    assert_eq!(persisted["day_id"], "2026-07-15-live");
    assert_eq!(persisted["graph_revision"], queue["graph_revision"]);
    assert_eq!(persisted["entries"], queue["entries"]);
}

#[tokio::test]
#[ignore] // requires local Neo4j; creates then removes one disposable :Bimba fixture
async fn accepted_q_articulation_amendment_writes_hen_then_syncs_through_live_gateway() {
    let mut gateway = TestGatewayClient::connected_with_temp_store(18918).await;
    let vault_root = gateway.gate_root().join("q-articulation-live-vault");
    let relative_path = "Idea/Bimba/World/Q-Articulation-Live-Proof.md";
    let absolute_path = vault_root.join(relative_path);
    std::fs::create_dir_all(absolute_path.parent().expect("fixture parent"))
        .expect("create fixture Bimba directory");
    std::fs::write(
        &absolute_path,
        "---\ncoordinate: M5-5-9876\nq_5_return: old articulation\n---\n\n# Q Articulation Live Proof\n",
    )
    .expect("write disposable Bimba fixture");

    let graph = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect live Neo4j");
    let source = std::fs::read_to_string(&absolute_path).expect("read fixture");
    let frontmatter = parse_yaml_frontmatter(&source).expect("fixture frontmatter");
    SyncCoordinator::new(&graph)
        .sync_from_vault(relative_path, &frontmatter, &source)
        .await
        .expect("seed fixture into live Bimba graph");
    let expected_revision = u64::try_from(
        read_graph_meta(&graph)
            .await
            .expect("read graph metadata")
            .expect("graph metadata exists")
            .graph_revision,
    )
    .expect("non-negative graph revision");

    let review = gateway
        .request(
            "s5'.review.submit",
            json!({
                "source": "human_gate",
                "title": "Accept Q articulation live proof",
                "body": "The user accepts the proposed Q articulation before Hen writes canon.",
                "priority": "blocking",
                "coordinate_context": {"coordinate": "M5-5-9876"},
                "requires_human": true
            }),
        )
        .await
        .expect("Q articulation review should persist");
    let review_id = review["item"]["item_id"]
        .as_str()
        .expect("Q articulation review id")
        .to_owned();
    gateway
        .request(
            "s5'.review.resolve",
            json!({
                "item_id": review_id,
                "decision": "approve",
                "rationale": "Human approval for the live Q articulation proof.",
                "resolved_by": "human",
                "promotion_destination": "bimba"
            }),
        )
        .await
        .expect("human Q articulation review should resolve");

    let receipt = gateway
        .request(
            "s1'.q_articulation.accept",
            json!({
                "vaultRoot": vault_root,
                "coordinate": "M5-5-9876",
                "qKey": "q_5_return",
                "qValueCandidate": "A return remains open to its next question.",
                "expectedGraphRevision": expected_revision,
                "acceptedReviewRef": review_id,
                "opensQuestions": ["What remains unarticulated?"],
                "sourceArtifacts": ["Idea/Empty/Present/15-07-2026/live-proof.md"]
            }),
        )
        .await
        .expect("accepted Q articulation should traverse the real gateway");

    let rewritten = std::fs::read_to_string(&absolute_path).expect("read Hen amendment");
    assert!(rewritten.contains("q_5_return: A return remains open"));
    assert!(rewritten.contains("qm_5_review_epoch_return:"));
    assert_eq!(receipt["q_key"], "q_5_return");
    assert_eq!(receipt["graph_revision"], expected_revision + 1);
    assert_eq!(
        receipt["anuttara_diagnostic"]["source_constraint"],
        "bimba_q_articulation:M5-5-9876:q_5_return"
    );

    let rows = graph
        .run("MATCH (n:Bimba {coordinate: 'M5-5-9876'}) RETURN n.q_5_return AS q_value, n.qm_5_review_epoch_return AS review_epoch")
        .await
        .expect("read synced Bimba fixture");
    assert_eq!(rows.len(), 1);
    assert_eq!(
        rows[0].get::<String>("q_value").expect("synced Q value"),
        "A return remains open to its next question."
    );
    assert_eq!(
        rows[0]
            .get::<String>("review_epoch")
            .expect("synced review epoch"),
        (expected_revision + 1).to_string()
    );

    graph
        .run("MATCH (n:Bimba {coordinate: 'M5-5-9876'}) DETACH DELETE n")
        .await
        .expect("remove disposable Bimba fixture");
    epi_s2_graph_services::meta::bump_graph_revision(&graph)
        .await
        .expect("record disposable fixture cleanup in graph revision");
    let _ = std::fs::remove_file(absolute_path);
}

#[tokio::test]
async fn s5_improve_gateway_promote_returns_dry_run_hen_plan() {
    let mut client = TestGatewayClient::connected_with_temp_store(18912).await;
    let gate_root = client.gate_root();
    let vault = gate_root.join("fixture-vault/Idea");
    let day_note = vault.join("Empty/Present/03-05-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nGateway autoresearch promotion.\n").unwrap();

    let proposed = client
        .request(
            "s5'.improve.propose",
            json!({
                "target_family": "S",
                "target_coordinate": "S5/S5'",
                "direction": "dry-run promote through Hen",
                "baseline": {"path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md"}
            }),
        )
        .await
        .expect("proposal should persist");
    let run_id = proposed["run"]["run_id"].as_str().unwrap().to_owned();

    client
        .request(
            "s5'.improve.evaluate",
            json!({
                "run_id": run_id,
                "evidence": [{
                    "dimension": "return_law",
                    "baseline_score": 0.2,
                    "challenger_score": 0.9,
                    "weight": 1.0,
                    "notes": "Dry-run promotion routes through S1 Hen."
                }]
            }),
        )
        .await
        .expect("evaluation should persist");

    let review = client
        .request(
            "s5'.review.submit",
            json!({
                "source": "autoresearch",
                "title": "Approve dry-run autoresearch promotion",
                "body": "Epii accepts this dry-run promotion path.",
                "priority": "high",
                "coordinate_context": {"coordinate": "S5/S5'"},
                "requires_human": false,
                "governance_profile": {
                    "category": "standard_improvement",
                    "gate_kind": "standard",
                    "governance_level": "advisory",
                    "target_subsystem": "Epii",
                    "promotion_destination": "seeds"
                }
            }),
        )
        .await
        .expect("review item should persist");
    let review_item_id = review["item"]["item_id"].as_str().unwrap().to_owned();
    client
        .request(
            "s5'.review.resolve",
            json!({
                "item_id": review_item_id,
                "decision": "approve",
                "rationale": "Approved for dry-run promotion planning.",
                "resolved_by": "epii",
                "promotion_destination": "seeds"
            }),
        )
        .await
        .expect("review item should approve");

    let promotion = client
        .request(
            "s5'.improve.promote",
            json!({
                "run_id": run_id,
                "destination": {
                    "kind": "seed_deposit",
                    "seed_path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md"
                },
                "legacy_destination": "seeds",
                "approved_review_resolution_id": review_item_id,
                "review_store_root": gate_root.join("s5/epii-review"),
                "vault_root": vault,
                "compiler_root": gate_root.join("fixture-compiler"),
                "artifact_slug": "gateway-autoresearch",
                "requested_at": {
                    "year": 2026,
                    "month": 5,
                    "day": 3,
                    "hour": 8,
                    "minute": 30,
                    "second": 0
                },
                "dry_run": true
            }),
        )
        .await
        .expect("promotion should return dry-run plan");

    assert_eq!(promotion["ok"], true);
    assert_eq!(promotion["dry_run"], true);
    assert_eq!(promotion["promoted_path"], serde_json::Value::Null);
    assert_eq!(
        promotion["compile_plan"]["ledger_entries"][0],
        "improvement.ledger"
    );
    assert_eq!(
        promotion["compile_plan"]["invocation"]["required_skill"],
        "autoresearch"
    );
}

#[tokio::test]
async fn s5_improve_gateway_promote_requires_approved_epii_review() {
    let mut client = TestGatewayClient::connected_with_temp_store(18916).await;
    let gate_root = client.gate_root();
    let vault = gate_root.join("fixture-vault/Idea");
    let day_note = vault.join("Empty/Present/03-05-2026/daily-note.md");
    std::fs::create_dir_all(day_note.parent().unwrap()).unwrap();
    std::fs::write(&day_note, "# Day\n\nGateway autoresearch promotion.\n").unwrap();

    let proposed = client
        .request(
            "s5'.improve.propose",
            json!({
                "target_family": "S",
                "target_coordinate": "S5/S5'",
                "direction": "block dry-run promotion without approved review",
                "baseline": {"path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md"}
            }),
        )
        .await
        .expect("proposal should persist");
    let run_id = proposed["run"]["run_id"].as_str().unwrap().to_owned();

    client
        .request(
            "s5'.improve.evaluate",
            json!({
                "run_id": run_id,
                "evidence": [{
                    "dimension": "return_law",
                    "baseline_score": 0.2,
                    "challenger_score": 0.9,
                    "weight": 1.0,
                    "notes": "Promotion still needs review approval."
                }]
            }),
        )
        .await
        .expect("evaluation should persist");

    let error = client
        .request(
            "s5'.improve.promote",
            json!({
                "run_id": run_id,
                "destination": {
                    "kind": "seed_deposit",
                    "seed_path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md"
                },
                "legacy_destination": "seeds",
                "approved_review_resolution_id": "missing-review-item",
                "review_store_root": gate_root.join("s5/epii-review"),
                "vault_root": vault,
                "compiler_root": gate_root.join("fixture-compiler"),
                "artifact_slug": "blocked-without-review",
                "dry_run": true
            }),
        )
        .await
        .expect_err("promotion should require accepted Epii review");

    assert!(
        error
            .message
            .contains("approved Epii review resolution is required"),
        "{}",
        error.message
    );
}
