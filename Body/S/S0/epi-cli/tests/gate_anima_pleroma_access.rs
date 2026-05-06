mod support;

use serde_json::json;
use std::path::PathBuf;
use support::{TestEnv, TestGatewayClient};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli crate should live under Body/S/S0")
        .to_path_buf()
}

async fn connected_client(port: u16) -> TestGatewayClient {
    let env = TestEnv::with_fake_pi().with_env("EPI_REPO_ROOT", repo_root().display().to_string());
    let mut client = TestGatewayClient::connect(env, port).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");
    client
}

#[tokio::test]
async fn s4_prime_gateway_exposes_anima_pleroma_vak_and_orchestration_access() {
    let mut client = connected_client(18855).await;

    let vak_result = client
        .request(
            "s4'.vak.evaluate",
            json!({
                "task": "Implement the bounded Pleroma skill invocation proof",
            }),
        )
        .await
        .expect("VAK evaluation should be gateway-callable");

    assert_eq!(vak_result["owner"], "S4'");
    assert_eq!(vak_result["agent"], "anima");
    assert_eq!(vak_result["capability"]["plugin"], "pleroma");
    assert_eq!(vak_result["capability"]["skill"], "vak-evaluate");
    assert_eq!(vak_result["coordinates"]["cf"], "(4.0/1-4.4/5)");
    assert!(vak_result["capability"]["skillPath"]
        .as_str()
        .expect("skill path")
        .ends_with("Body/S/S4/plugins/pleroma/skills/vak-evaluate/SKILL.md"));
    assert_eq!(
        vak_result["authority"]["forbidden"][0],
        "resolve_epii_review_gate"
    );

    let orchestrate_result = client
        .request(
            "s4'.orchestrate",
            json!({
                "cf": "(0/1/2)",
                "task": "Write tests for the compiler gate",
            }),
        )
        .await
        .expect("orchestration should be gateway-callable");

    assert_eq!(orchestrate_result["owner"], "S4'");
    assert_eq!(orchestrate_result["agent"], "eros");
    assert_eq!(orchestrate_result["capability"]["plugin"], "pleroma");
    assert_eq!(
        orchestrate_result["capability"]["skill"],
        "anima-orchestration"
    );
    assert_eq!(orchestrate_result["authority"]["mayDepositToEpii"], true);
    assert_eq!(
        orchestrate_result["authority"]["mayResolveEpiiReview"],
        false
    );
}
