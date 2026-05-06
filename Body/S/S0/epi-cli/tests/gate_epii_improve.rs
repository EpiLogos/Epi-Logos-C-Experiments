mod support;

use serde_json::json;
use support::TestGatewayClient;

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

    let status = client
        .request("s5'.improve.status", json!({}))
        .await
        .expect("improvement status should load");

    assert_eq!(status["keep_count"], 1);
    assert_eq!(status["discard_count"], 0);

    let history = client
        .request("s5'.improve.history", json!({"limit": 5}))
        .await
        .expect("improvement history should load");

    assert_eq!(history["runs"].as_array().unwrap().len(), 1);
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
                "requires_human": false
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
                "resolved_by": "epii"
            }),
        )
        .await
        .expect("review item should approve");

    let promotion = client
        .request(
            "s5'.improve.promote",
            json!({
                "run_id": run_id,
                "destination": "seeds",
                "approved_review_resolution_id": review_item_id,
                "vault_root": vault,
                "compiler_root": gate_root.join("fixture-compiler"),
                "artifact_slug": "gateway-autoresearch",
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
                "destination": "seeds",
                "approved_review_resolution_id": "missing-review-item",
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
