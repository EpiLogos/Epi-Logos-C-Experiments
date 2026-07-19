//! Coordinate: S0/S3'/M2' six sonic-card live edge (23.T23.3).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: the additive M2 correspondence receipt over compiled C tables.
//! Public surface: `cargo test --test gate_m2_sonic_cards`.
//! Does NOT own: M2 lookup tables, Neo4j facts, or renderer presentation.
//! Contract: s2.parashaktiCorrespondences.

mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn live_gateway_projects_all_six_kernel_authored_sonic_cards() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18952).await;
    client.request("connect", json!({})).await.unwrap();

    let receipt = client
        .request("s2.parashaktiCorrespondences", json!({ "address72": 17 }))
        .await
        .expect("the real gateway must dispatch the M2 correspondence receipt");
    let cards = &receipt["sixSonicCards"];

    assert_eq!(cards["decanFace"]["address72"], 17);
    assert_eq!(cards["shemPair"]["light"]["index"], 16);
    assert_eq!(cards["shemPair"]["shadow"]["index"], 17);
    assert_eq!(
        cards["maqam"]["intervals"].as_array().map(Vec::len),
        Some(7)
    );
    assert_eq!(cards["mantra"]["phase"], "Matrika");
    assert!(cards["asma"]["maskRouting"]["internal"].is_boolean());
    assert!(cards["planetaryChakral"]["coustoHz"].is_number());
    assert!(receipt["graphUnavailable"].is_boolean());

    let tree = &receipt["correspondenceTree"];
    assert_eq!(tree["mantraOverlay"].as_array().map(Vec::len), Some(100));
    assert_eq!(tree["mantraOverlay"][0]["phase"], "Matrika");
    assert_eq!(tree["mantraOverlay"][99]["phase"], "Malini");
    assert_eq!(tree["asmaOverlay"].as_array().map(Vec::len), Some(100));
    assert!(tree["asmaOverlay"][0]["maskRouting"]["internal"].is_boolean());
    assert_eq!(tree["planetaryKeying"].as_array().map(Vec::len), Some(10));
    assert_eq!(tree["planetaryKeying"][7]["isOuter"], true);
    assert_eq!(tree["psychoidPlanetary"].as_array().map(Vec::len), Some(7));
    assert_eq!(tree["psychoidPlanetary"][0]["archetypalRole"], "Unity-Monad");
    assert_eq!(tree["psychoidPlanetary"][6]["archetypalRole"], "7th-Boundary");

    let bridge = &receipt["bridge72"];
    assert_eq!(bridge["address72"], 17);
    assert_eq!(bridge["halfDecan"], 8);
    assert!(bridge["hexagramId"].as_u64().is_some_and(|id| id < 64));
    assert!(bridge["planet"]["name"].is_string());
    assert!(bridge["chakra"]["name"].is_string());
    assert!(bridge["bodyZone"]["zones"]
        .as_array()
        .is_some_and(|zones| !zones.is_empty()));
}
