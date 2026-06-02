mod support;

use serde_json::json;
use support::TestGatewayClient;

/// 13.T7 store-location guard: the S0 autoresearch gate adapter must persist
/// the S5 `ImprovementStore` under `<state_root>/s5/epii-autoresearch` and
/// read the linked review store at `<state_root>/s5/epii-review`. Pins the
/// boundary layout so refactors that try to move S5 governance state under
/// another gate-root subtree fail loudly.
#[test]
fn gate_improve_store_subpath_is_stable_at_s0_s5_boundary() {
    use epi_logos::gate::{improve, review};
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
