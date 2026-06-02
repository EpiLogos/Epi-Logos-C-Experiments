mod support;

use serde_json::json;
use support::TestGatewayClient;

/// 13.T7 store-location guard: the S0 review gate adapter must persist the
/// S5 `ReviewStore` under `<state_root>/s5/epii-review`. Pins the boundary
/// layout so refactors that try to move S5 governance state under another
/// gate-root subtree fail loudly.
#[test]
fn gate_review_store_subpath_is_stable_at_s0_s5_boundary() {
    use epi_logos::gate::review;
    use std::path::PathBuf;

    assert_eq!(review::STORE_SUBPATH, ["s5", "epii-review"]);
    let path = review::review_store_path(PathBuf::from("/tmp/state-root"));
    assert_eq!(
        path,
        PathBuf::from("/tmp/state-root/s5/epii-review"),
        "S5 review store must live under <state_root>/s5/epii-review at the S0/S5 boundary"
    );
}

#[tokio::test]
async fn s5_review_gateway_persists_inbox_and_resolutions() {
    let mut client = TestGatewayClient::connected_with_temp_store(18901).await;

    let submitted = client
        .request(
            "s5'.review.submit",
            json!({
                "source": "anima",
                "title": "Review compiler plan",
                "body": "Anima requests Epii validation before promotion.",
                "priority": "high",
                "coordinate_context": {
                    "coordinate": "S1/S1'",
                    "agent_id": "anima"
                },
                "requires_human": false
            }),
        )
        .await
        .expect("review submit should succeed");

    let item_id = submitted["item"]["item_id"]
        .as_str()
        .expect("submitted item id")
        .to_owned();
    assert_eq!(submitted["item"]["status"], "open");

    let inbox = client
        .request(
            "s5'.review.inbox",
            json!({"status": "open", "source": "anima"}),
        )
        .await
        .expect("review inbox should load");

    assert_eq!(inbox["items"].as_array().unwrap().len(), 1);
    assert_eq!(inbox["items"][0]["item_id"], item_id);

    let resolved = client
        .request(
            "s5'.review.resolve",
            json!({
                "item_id": item_id,
                "decision": "approve",
                "rationale": "Compiler dry run is acceptable.",
                "resolved_by": "epii"
            }),
        )
        .await
        .expect("non-human-gated review should resolve by Epii");

    assert_eq!(resolved["resolution"]["decision"], "approve");
    assert_eq!(resolved["resolution"]["resolved_by"], "epii");

    let history = client
        .request("s5'.review.history", json!({}))
        .await
        .expect("review history should load");

    assert_eq!(history["items"].as_array().unwrap().len(), 1);
    assert_eq!(history["items"][0]["status"], "resolved");
    assert_eq!(history["resolutions"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn s5_review_gateway_preserves_human_gate() {
    let mut client = TestGatewayClient::connected_with_temp_store(18902).await;
    let submitted = client
        .request(
            "s5'.review.submit",
            json!({
                "source": "human_gate",
                "title": "Approve live graph mutation",
                "body": "A destructive graph operation needs human validation.",
                "priority": "blocking",
                "coordinate_context": {"coordinate": "S2/S2'"},
                "requires_human": true
            }),
        )
        .await
        .expect("human review submit should succeed");

    let item_id = submitted["item"]["item_id"].as_str().unwrap().to_owned();
    let rejected = client
        .request(
            "s5'.review.resolve",
            json!({
                "item_id": item_id,
                "decision": "approve",
                "rationale": "Agent cannot supply this validation.",
                "resolved_by": "epii"
            }),
        )
        .await
        .expect_err("agent approval must not satisfy human gate");

    assert!(rejected.message.contains("requires human resolution"));
}

#[tokio::test]
async fn s5_review_gateway_surfaces_kernel_visibility_for_epii() {
    let mut client = TestGatewayClient::connected_with_temp_store(18917).await;

    let submitted = client
        .request(
            "s5'.review.submit",
            json!({
                "source": "autoresearch",
                "title": "Review kernel-informed readiness",
                "body": "Autoresearch observed a kernel pulse delta; Epii must interpret it.",
                "priority": "high",
                "coordinate_context": {
                    "coordinate": "S5/S5'",
                    "session_key": "agent:epii:main"
                },
                "requires_human": false,
                "kernel_visibility": {
                    "projection": {
                        "coordinateOwner": "S0/QL-meta",
                        "projectionOwner": "S3'",
                        "privacy": "safe-public-current-kernel-tick",
                        "computationSource": "portal-core::KernelProjection",
                        "generation": 44,
                        "tick": {
                            "cycle": 2,
                            "subTick": 7,
                            "phase": "Ascent",
                            "element": "InverseMobius",
                            "position6": 1,
                            "harmonicRatio": "0.750000"
                        },
                        "harmonicPulse": {
                            "cycle": 2,
                            "subTick": 7,
                            "phase": "Ascent",
                            "element": "InverseMobius",
                            "ratioNum": 3,
                            "ratioDen": 4,
                            "tempoMultiplier": "0.750000",
                            "periodMultiplier": "1.333333"
                        },
                        "energy": { "totalEnergy": "0.270000" }
                    },
                    "energy_delta": "0.150000",
                    "resonance_delta": "tritone-square:2:+0.080000",
                    "musical_readiness": "data_ready_audio_deferred",
                    "visual_readiness": "ready_for_projection",
                    "advisory_only": true
                }
            }),
        )
        .await
        .expect("kernel visibility review item should submit");

    assert_eq!(
        submitted["item"]["kernel_visibility"]["projection"]["privacy"],
        "safe-public-current-kernel-tick"
    );
    assert_eq!(
        submitted["item"]["kernel_visibility"]["musical_readiness"],
        "data_ready_audio_deferred"
    );
    assert_eq!(
        submitted["item"]["kernel_visibility"]["advisory_only"],
        true
    );
}
