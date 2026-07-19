//! Coordinate: S0/S3'/M2' cymatic MonoPoly live edge (23.T23.20).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: the registered C-backed MonoPoly behaviour-state route.
//! Public surface: `cargo test --test gate_m2_cymatic_monopoly_state`.
//! Does NOT own: Cymatic classification, C lookup tables, or M2 renderer state.
//! Contract: kernelBridge.m2.cymaticMonoPolyState(address72).

mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

const METHOD: &str = "kernelBridge.m2.cymaticMonoPolyState(address72)";

#[tokio::test]
async fn live_gateway_exposes_all_c_backed_cymatic_monopoly_behaviour_states() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18951).await;
    client.request("connect", json!({})).await.unwrap();

    for (address72, behaviour_state, active_tone_count, projection64) in [
        (1, "mono", 1, 1),
        (7, "actually-many", 2, 7),
        (19, "actualising-one", 4, 19),
        (31, "monopoly", 6, 31),
    ] {
        let state = client
            .request(METHOD, json!({ "address72": address72 }))
            .await
            .unwrap_or_else(|error| {
                panic!(
                    "address {address72} must reach the kernel bridge: {}",
                    error.message
                )
            });

        assert_eq!(state["contract"], METHOD);
        assert_eq!(state["runtimeOwner"], "S0/S0' kernel-bridge runtime");
        assert_eq!(state["source"], "kernel-bridge");
        assert_eq!(state["behaviourState"], behaviour_state);
        assert_eq!(state["activeToneCount"], active_tone_count);
        assert_eq!(state["projection64"], projection64);
        assert!(state["mutualResonance"].is_number());
    }
}
