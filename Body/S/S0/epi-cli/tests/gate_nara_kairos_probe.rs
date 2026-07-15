//! Coordinate: S0/M4' (Kairos dependency-probe gateway proof - 32.T32.10)
//! Residency: Body/S/S0/epi-cli/tests
//! Position (#n): S0 gateway adapter verification boundary
//! Actualises: real WebSocket proof that Kairos onboarding can inspect the
//!   local Python/Kerykeion dependency without reading PASU or natal data.
//! Public surface: `cargo test --test gate_nara_kairos_probe`.
//! Does NOT own: Kerykeion, Kairos refresh, preferences, or onboarding UI.
//! Contract: [[S0-SPEC]] / [[M4'-SPEC]] / Track [[32.T32.10]].

mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn kairos_probe_reports_the_real_local_dependency_without_identity_data() {
    let mut client = TestGatewayClient::connected_with_temp_store(18948).await;

    let probe = client
        .request("nara.kairos.probe_kerykeion", json!({}))
        .await
        .expect("Kairos dependency probe should be a live gateway method");

    assert!(probe["available"].is_boolean());
    assert!(probe["pythonAvailable"].is_boolean());
    assert!(probe["version"].is_null() || probe["version"].is_string());
    assert!(probe["reason"].is_null() || probe["reason"].is_string());
    assert_eq!(probe["dependency"], "kerykeion");

    let serialized = serde_json::to_string(&probe).expect("probe response should serialize");
    for forbidden in ["birth_date", "birth_time", "birth_lat", "birth_lon", "PASU"] {
        assert!(
            !serialized.contains(forbidden),
            "dependency probe leaked identity field {forbidden}"
        );
    }
}
