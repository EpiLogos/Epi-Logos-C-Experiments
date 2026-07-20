//! Coordinate: S0/S3'/M3' lens-codon-binary live edge (37.T37.8 / 24.T24.20).
//! Residency: Body/S/S0/epi-cli/tests.
//! Position (#n): real gateway verification boundary.
//! Actualises: the governed complete transcription packet over functional
//! lenses 0..16 through a real spawned WebSocket gateway.
//! Public surface: `cargo test --test gate_m3_lens_codon_binary`.
//! Does NOT own: C clock/codon law or renderer choreography.
//! Contract: [[S0-SPEC]] / [[S3-SPEC]] / [[M3'-SPEC]].

mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

const METHOD: &str = "kernelBridge.m3.lensCodonBinary(lensId)";

#[tokio::test]
async fn live_gateway_projects_the_hourly_lens_through_the_primary_fibonacci_ground() {
    let env = TestEnv::with_fake_pi();
    let mut client = TestGatewayClient::connect(env, 18950).await;
    client.request("connect", json!({})).await.unwrap();

    let projection = client
        .request(METHOD, json!({ "lensId": 7 }))
        .await
        .expect("Hourly clock lens should be live on the real gateway");
    assert_eq!(projection["contract"], METHOD);
    assert_eq!(projection["lensId"], 7);
    assert_eq!(projection["source"], "CLOCK_DEGREE_LUT[360]");
    assert_eq!(projection["segment"].as_array().map(Vec::len), Some(24));
    assert_eq!(projection["perDegree"].as_array().map(Vec::len), Some(24));
    assert_eq!(projection["segment"][1], 15);
    assert_eq!(projection["perDegree"][1]["degree360"], 15);
    assert!(projection["perDegree"][0].get("elementM3Decan").is_none());
    assert!(
        projection["perDegree"][0]["elementCanonical"]
            .as_u64()
            .unwrap()
            <= 5
    );
    assert_eq!(projection["perDegree"][0]["charges"]["pp"], 18);
    assert_eq!(projection["perDegree"][0]["charges"]["nn"], -6);
    assert_eq!(projection["perDegree"][0]["charges"]["np"], 6);
    assert_eq!(projection["perDegree"][0]["charges"]["pn"], 6);
    assert_eq!(projection["perDegree"][0]["codonPairs"], json!([0, 0, 0]));
    assert_eq!(
        projection["perDegree"][0]["codonPairBits"],
        json!(["00", "00", "00"])
    );
    assert_eq!(projection["perDegree"][0]["codon6Bit"], 0);
    assert_eq!(
        projection["perDegree"][0]["codonClassLabel"],
        "perfect-palindromic"
    );
    assert_eq!(
        projection["perDegree"][0]["chargeIdentity"][0]["xPermutation"],
        "X2"
    );
    assert_eq!(projection["perDegree"][0]["fourX"], 24);
    assert_eq!(projection["perDegree"][0]["xLogicInvariant"], true);
    assert_eq!(
        projection["perDegree"][0]["lineChangeHops"]
            .as_array()
            .map(Vec::len),
        Some(6)
    );
    assert_eq!(
        projection["perDegree"][0]["lineChangeHops"][5]["toHexagramId"],
        32
    );
    assert_eq!(projection["perDegree"][0]["rnaCapable"], false);
    assert_eq!(projection["lensRole"], "derived-aperture");
    assert_eq!(projection["groundingLensId"], 16);
    assert_eq!(projection["perDegree"][1]["fibonacciPosition"], 2);

    let ground = client
        .request(METHOD, json!({ "lensId": 16 }))
        .await
        .expect("Fibonacci Ground must be callable as the primary +1 lens");
    assert_eq!(ground["lensRole"], "primary-ground");
    assert_eq!(ground["groundingLensId"], 16);
    assert_eq!(ground["segment"].as_array().map(Vec::len), Some(60));
    assert_eq!(ground["perDegree"][1]["degree360"], 6);
    assert_eq!(ground["perDegree"][1]["fibonacciPosition"], 1);

    let error = client
        .request(METHOD, json!({ "lensId": 17 }))
        .await
        .expect_err("there are sixteen derived apertures plus one primary ground lens");
    assert!(
        error.message.contains("functional M3 lenses 0..16"),
        "{error:?}"
    );
}
