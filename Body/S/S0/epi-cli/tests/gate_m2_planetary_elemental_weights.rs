//! Coordinate: S0/S3'/M2' live planetary-elemental edge (23.T23.19 / 37.T37.2).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: live Kairos ingress through the registered M2 elemental projection route.
//! Public surface: `cargo test --test gate_m2_planetary_elemental_weights`.
//! Does NOT own: planetary weight law, Kerykeion computation, or renderer state.
//! Contract: kernelBridge.m2.planetaryElementalWeights().

mod support;

use std::fs;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

const METHOD: &str = "kernelBridge.m2.planetaryElementalWeights()";

#[tokio::test]
async fn live_gateway_projects_fresh_kairos_into_normalized_elemental_weights() {
    let env = TestEnv::with_fake_pi();
    let kairos_dir = env.home.join(".epi-logos").join("nara").join("kairos");
    fs::create_dir_all(&kairos_dir).unwrap();
    fs::write(
        kairos_dir.join("current.json"),
        r#"{
  "planets": [
    {"planet_id": 0, "degree": 11.0, "degree_anchor": 22, "retrograde": false},
    {"planet_id": 1, "degree": 42.0, "degree_anchor": 84, "retrograde": false},
    {"planet_id": 2, "degree": 76.0, "degree_anchor": 152, "retrograde": true},
    {"planet_id": 3, "degree": 103.0, "degree_anchor": 206, "retrograde": false},
    {"planet_id": 4, "degree": 139.0, "degree_anchor": 278, "retrograde": false},
    {"planet_id": 5, "degree": 181.0, "degree_anchor": 362, "retrograde": true},
    {"planet_id": 6, "degree": 217.0, "degree_anchor": 434, "retrograde": false},
    {"planet_id": 7, "degree": 251.0, "degree_anchor": 502, "retrograde": false},
    {"planet_id": 8, "degree": 294.0, "degree_anchor": 588, "retrograde": true},
    {"planet_id": 9, "degree": 333.0, "degree_anchor": 666, "retrograde": false}
  ],
  "dominant_sign": 1,
  "dominant_element": 4,
  "active_decan": 17,
  "active_tattva": 2
}"#,
    )
    .unwrap();

    let mut client = TestGatewayClient::connect(env, 18952).await;
    client.request("connect", json!({})).await.unwrap();

    let projection = client
        .request(METHOD, json!({}))
        .await
        .expect("the live gateway must execute the planetary-elemental adapter");

    assert_eq!(projection["contract"], METHOD);
    assert_eq!(projection["runtimeOwner"], "S0/S0' kernel-bridge runtime");
    assert_eq!(projection["perPlanet"].as_array().unwrap().len(), 9);
    let weights = projection["weights"].as_object().unwrap();
    let total = ["fire", "water", "air", "earth"]
        .iter()
        .map(|key| weights[*key].as_f64().unwrap())
        .sum::<f64>();
    assert!(
        (total - 1.0).abs() < 1e-5,
        "elemental weights must normalize, got {total}"
    );
    assert!(
        projection["aspectGain"].as_array().unwrap().len() > 0,
        "the live sky must produce aspect handles rather than a zero-state placeholder"
    );
}
