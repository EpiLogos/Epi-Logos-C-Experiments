//! Coordinate: S0/S3'/M2' to M3' epogdoon live edge (23.T23.18 / 37.T37.1).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: the registered C-backed 72-to-64 projection route.
//! Public surface: `cargo test --test gate_m2_epogdoon_projection`.
//! Does NOT own: epogdoon arithmetic or M2/M3 renderer state.
//! Contract: kernelBridge.m2.epogdoonProjection(address72).

mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

const METHOD: &str = "kernelBridge.m2.epogdoonProjection(address72)";

#[tokio::test]
async fn live_gateway_exposes_the_c_backed_epogdoon_projection() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18951).await;
    client.request("connect", json!({})).await.unwrap();

    let projection = client
        .request(METHOD, json!({ "address72": 8 }))
        .await
        .expect("the declared epogdoon capability must be executable over the real gateway");

    let object = projection
        .as_object()
        .expect("epogdoon projection must be a JSON object");
    assert_eq!(object.len(), 3, "the bridge must not leak renderer fields");
    assert!(projection["compressedCodon"].as_u64().is_some());
    assert!(projection["compressedCodon"].as_u64().unwrap() < 64);
    assert!(projection["isEvolutionaryGap"].is_boolean());
    assert!(projection["expandedBack"].as_u64().is_some());
    assert!(projection["expandedBack"].as_u64().unwrap() < 72);
}
